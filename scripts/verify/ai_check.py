#!/usr/bin/env python3
"""
Problem verification, stage 7: AI checks with the OpenAI API (plan: Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md).

- L2 independent recomputation: the model gets ONLY the problem text (never our answer), writes and runs Python in
  OpenAI's Code Interpreter sandbox, and gives its answer. We compare it with the stored answer ourselves.
- L4 ambiguity: in the same request it lists other plausible readings of the problem and the answer under each.

Results are warnings only (they never hide a problem): a different answer marks the problem "warning" on
/admin/reviews, where the details (the AI answer, its method, the readings) are shown. AI can be wrong.

Which problems: by default those whose current content has no L2 result yet (new or changed), newest first, up to
--limit. --sample N picks N problems with a number answer spread over all ladders (for the pilot); --ids picks
exact problems; --recheck checks them again even if they already have a result (e.g. to compare models).

Public logs: the console prints counts only. The full results (with answers) go to --out, outside the repository.

Credentials: SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or .env.local), and OPENAI_API_KEY_VERIFY (or OPENAI_API_KEY),
a key of a separate OpenAI project with its own monthly budget, so this never uses up the key that grades students.

  python3 scripts/verify/ai_check.py --dry-run                 # which problems would be checked (no AI, no writes)
  python3 scripts/verify/ai_check.py --sample 10 --save        # pilot
  python3 scripts/verify/ai_check.py --limit 30 --save         # nightly: new or changed problems
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.parse
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent))

from backup_supabase import Rest, load_credentials  # noqa: E402
from checks import content_hash, parse_number, stored_answer  # noqa: E402
from save import AUTO_STATUS, RANK, Writer  # noqa: E402

DEFAULT_OUT = Path.home() / "mathquest-verify-reports"
# USD per 1M tokens (input, output), OpenAI pricing page, 2026-11-19. Used only to estimate and cap a run's cost.
PRICES = {"gpt-6.2-sol": (2.00, 10.00), "gpt-6.2-astra": (8.00, 40.00), "gpt-6.1-terra": (1.00, 5.00)}
CONTAINER_USD = 0.03  # 1 GB Code Interpreter container, per session (at most one per problem)
PAGE = 1000

INSTRUCTIONS = """You check math competition problems for a learning website.
Solve the problem below yourself, from scratch. Use the python tool to compute, enumerate small cases or check the
result (for example with sympy or brute force) whenever that is possible; do not rely on memory of known answers.
Then think about whether the problem can reasonably be read in another way (an unclear word, an included or
excluded boundary, ordered vs unordered, etc.). For each such reading, give the answer under that reading.
Reply with JSON only, with these keys:
  "answer": the final answer only - a number such as 42, -3, 7/64 or 2.5, or a short phrase if it is not a number
  "confidence": "high", "medium" or "low"
  "method": one or two sentences on how you computed and checked it
  "alternative_readings": a list of {"reading", "answer", "plausibility"} with plausibility "likely", "possible"
  or "unlikely"; an empty list if the problem is clear"""

SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": ["answer", "confidence", "method", "alternative_readings"],
    "properties": {
        "answer": {"type": "string"},
        "confidence": {"type": "string", "enum": ["high", "medium", "low"]},
        "method": {"type": "string"},
        "alternative_readings": {
            "type": "array",
            "items": {
                "type": "object",
                "additionalProperties": False,
                "required": ["reading", "answer", "plausibility"],
                "properties": {
                    "reading": {"type": "string"},
                    "answer": {"type": "string"},
                    "plausibility": {"type": "string", "enum": ["likely", "possible", "unlikely"]},
                },
            },
        },
    },
}


# ---- database ------------------------------------------------------------------------------------------------------
def filtered(rest, table, query):
    """Rows of `table` matching a PostgREST query, a page at a time."""
    out, start = [], 0
    while True:
        page, _ = rest.get(f"/{table}?{query}", extra_headers={"Range-Unit": "items",
                                                              "Range": f"{start}-{start + PAGE - 1}"})
        out.extend(page)
        if len(page) < PAGE:
            return out
        start += PAGE


def load(rest):
    problems = filtered(rest, "problems", "select=id,title,content,difficulty,level,tags,source,created_at&order=id.asc")
    solutions = filtered(rest, "solutions", "select=problem_id,content,sequence_order&order=id.asc")
    statuses = filtered(rest, "problem_verification_status", "select=problem_id,content_hash,auto_summary&order=problem_id.asc")
    done = filtered(rest, "problem_verifications", "select=problem_id,content_hash&layer=eq.L2&order=id.asc")
    sols = {}
    for s in solutions:
        sols.setdefault(s["problem_id"], []).append(s)
    return problems, sols, {s["problem_id"]: s for s in statuses}, {(d["problem_id"], d["content_hash"]) for d in done}


def pick(problems, sols, done, args):
    rows = []
    for p in problems:
        ps = sols.get(p["id"], [])
        _, value, _ = stored_answer(ps)
        rows.append({"problem": p, "hash": content_hash(p, ps), "db_value": value})
    if args.ids:
        wanted = set(args.ids.split(","))
        chosen = [r for r in rows if r["problem"]["id"] in wanted]
    elif args.sample:
        # Spread over all ladders: problems with a number answer, sorted by title, evenly spaced.
        numeric = sorted((r for r in rows if r["db_value"] is not None), key=lambda r: r["problem"].get("title") or "")
        step = max(1, len(numeric) // args.sample)
        chosen = numeric[::step][:args.sample]
    else:
        chosen = sorted(rows, key=lambda r: r["problem"].get("created_at") or "", reverse=True)
    if not args.recheck:
        chosen = [r for r in chosen if (r["problem"]["id"], r["hash"]) not in done]
    return chosen[:args.limit] if not args.ids else chosen


# ---- AI ------------------------------------------------------------------------------------------------------------
def parse_json(text):
    """The JSON object in a reply (plain, or inside a ```json block)."""
    m = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, re.S)
    raw = m.group(1) if m else text[text.find("{"): text.rfind("}") + 1]
    return json.loads(raw)


class Checker:
    def __init__(self, model, effort, max_output):
        from openai import OpenAI  # imported here so --dry-run works without the package

        key = os.environ.get("OPENAI_API_KEY_VERIFY") or os.environ.get("OPENAI_API_KEY")
        if not key:
            sys.exit("Set OPENAI_API_KEY_VERIFY (the key of the separate verification project).")
        self.client = OpenAI(api_key=key)
        self.model, self.effort, self.max_output = model, effort, max_output
        self.structured = True  # Structured outputs together with Code Interpreter; turned off if the API refuses
        self.tokens_in = self.tokens_out = 0

    def ask(self, problem_text):
        import openai

        kwargs = dict(
            model=self.model,
            instructions=INSTRUCTIONS,
            input=problem_text,
            tools=[{"type": "code_interpreter", "container": {"type": "auto"}}],
            reasoning={"effort": self.effort},
            max_output_tokens=self.max_output,
        )
        if self.structured:
            kwargs["text"] = {"format": {"type": "json_schema", "name": "problem_check", "schema": SCHEMA, "strict": True}}
        try:
            resp = self.client.responses.create(**kwargs)
        except openai.BadRequestError:
            if not self.structured:
                raise
            # The JSON-schema format may not combine with Code Interpreter: ask for JSON in the text instead.
            self.structured = False
            kwargs.pop("text")
            resp = self.client.responses.create(**kwargs)
        usage = getattr(resp, "usage", None)
        if usage:
            self.tokens_in += usage.input_tokens or 0
            self.tokens_out += usage.output_tokens or 0
        if resp.status == "incomplete":
            raise RuntimeError(f"incomplete reply ({getattr(resp.incomplete_details, 'reason', '?')})")
        return parse_json(resp.output_text or "")

    def cost(self, problems_done):
        price_in, price_out = PRICES.get(self.model, (8.00, 40.00))  # unknown model: assume the dearest
        return (self.tokens_in * price_in + self.tokens_out * price_out) / 1e6 + problems_done * CONTAINER_USD


# ---- judging -------------------------------------------------------------------------------------------------------
def judge(ai, db_value, model):
    """(L2 issues, L4 issues). Severities: warn (shown as a warning) or info."""
    ai_value = parse_number(str(ai.get("answer", "")))
    conf = ai.get("confidence", "?")
    l2, l4 = [], []
    if db_value is None:
        l2.append({"rule": "AI_NO_DB_NUMBER", "severity": "info",
                   "message": f"No number answer stored; {model} answered {ai.get('answer')!r} ({conf})"})
    elif ai_value is None:
        l2.append({"rule": "AI_ANSWER_NOT_NUMBER", "severity": "info",
                   "message": f"{model} did not give a number: {ai.get('answer')!r} ({conf})"})
    elif ai_value != db_value:
        l2.append({"rule": "AI_ANSWER_DIFF", "severity": "warn",
                   "message": f"{model} got {ai.get('answer')} ({conf} confidence), stored answer is {db_value}. "
                              f"Method: {ai.get('method', '')}"})
    for r in ai.get("alternative_readings") or []:
        if r.get("plausibility") not in ("likely", "possible"):
            continue
        value = parse_number(str(r.get("answer", "")))
        if db_value is not None and value is not None and value == db_value:
            continue  # same answer under that reading: harmless
        l4.append({"rule": "AMBIGUOUS_READING", "severity": "warn" if r["plausibility"] == "likely" else "info",
                   "message": f"{r.get('reading')} -> {r.get('answer')} ({r['plausibility']})"})
    return l2, l4


def layer(issues):
    return "warn" if any(i["severity"] == "warn" for i in issues) else "pass"


# ---- main ----------------------------------------------------------------------------------------------------------
def main():
    ap = argparse.ArgumentParser(description="AI checks (L2 recomputation, L4 ambiguity) with the OpenAI API.")
    ap.add_argument("--model", default=os.environ.get("AI_CHECK_MODEL") or "gpt-6.2-sol")
    ap.add_argument("--effort", default="high", help="reasoning effort (low, medium, high, xhigh)")
    ap.add_argument("--max-output", type=int, default=32000, help="max output tokens per problem (reasoning included)")
    ap.add_argument("--limit", type=int, default=30, help="at most this many problems per run")
    ap.add_argument("--max-cost", type=float, default=3.0, help="stop when the estimated cost of this run passes this (USD)")
    ap.add_argument("--sample", type=int, help="pilot: N problems with a number answer, spread over all ladders")
    ap.add_argument("--ids", help="comma-separated problem ids")
    ap.add_argument("--recheck", action="store_true", help="also check problems that already have an AI result")
    ap.add_argument("--save", action="store_true", help="store results in problem_verifications / _status")
    ap.add_argument("--dry-run", action="store_true", help="only list how many problems would be checked")
    ap.add_argument("--env", help="read Supabase credentials from this file")
    ap.add_argument("--out", default=str(DEFAULT_OUT), help=f"folder for the full results (default {DEFAULT_OUT})")
    args = ap.parse_args()

    out_root = Path(args.out).expanduser().resolve()
    if out_root == REPO_ROOT or REPO_ROOT in out_root.parents:
        sys.exit("Choose a folder outside the repository (the results contain answers and the repository is public).")

    url, key, where = load_credentials(args.env)
    rest = Rest(url, key)
    problems, sols, statuses, done = load(rest)
    targets = pick(problems, sols, done, args)
    print(f"Problems {len(problems)}; to check now: {len(targets)} (model {args.model}, effort {args.effort})")
    if args.dry_run or not targets:
        return

    checker = Checker(args.model, args.effort, args.max_output)
    writer = Writer(url, key) if args.save else None
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%SZ")
    run_id = f"ai {stamp}" + (f" gh-{os.environ['GITHUB_RUN_ID']}" if os.environ.get("GITHUB_RUN_ID") else "")
    counts = {"agree": 0, "differ": 0, "no_db_number": 0, "not_number": 0, "ambiguous": 0, "error": 0}
    results, started = [], time.time()

    for n, t in enumerate(targets, 1):
        if checker.cost(n - 1) > args.max_cost:
            print(f"Stopped: estimated cost passed ${args.max_cost:.2f} after {n - 1} problems.")
            break
        p = t["problem"]
        try:
            ai = checker.ask(p.get("content") or "")
        except Exception as e:  # one bad problem must not stop the run
            counts["error"] += 1
            results.append({"id": p["id"], "title": p.get("title"), "error": f"{type(e).__name__}: {e}"[:300]})
            continue
        l2, l4 = judge(ai, t["db_value"], args.model)
        rules = {i["rule"] for i in l2}
        counts["differ" if "AI_ANSWER_DIFF" in rules else "no_db_number" if "AI_NO_DB_NUMBER" in rules
               else "not_number" if "AI_ANSWER_NOT_NUMBER" in rules else "agree"] += 1
        counts["ambiguous"] += any(i["severity"] == "warn" for i in l4)
        results.append({"id": p["id"], "title": p.get("title"), "db_answer": str(t["db_value"]), "ai": ai,
                        "L2": l2, "L4": l4})

        if writer:
            ai_details = {k: ai.get(k) for k in ("answer", "confidence", "method", "alternative_readings")}
            writer.insert("problem_verifications", [
                {"problem_id": p["id"], "content_hash": t["hash"], "layer": "L2", "status": layer(l2),
                 "details": {"issues": l2, "ai": ai_details}, "model": args.model, "run_id": run_id},
                {"problem_id": p["id"], "content_hash": t["hash"], "layer": "L4", "status": layer(l4),
                 "details": {"issues": l4}, "model": args.model, "run_id": run_id},
            ])
            st = statuses.get(p["id"])
            if st and st["content_hash"] == t["hash"]:  # the status describes this version of the problem
                summary = {**(st.get("auto_summary") or {}), "L2": layer(l2), "L4": layer(l4)}
                worst = max(summary.values(), key=lambda v: RANK.get(v, 0))
                now = datetime.now(timezone.utc).isoformat()
                writer.patch("problem_verification_status",
                             f"problem_id=eq.{p['id']}&content_hash=eq.{urllib.parse.quote(t['hash'])}",
                             {"auto_summary": summary, "auto_status": AUTO_STATUS.get(worst, "warning"), "updated_at": now})

    # Full results (answers) stay outside the repository; the console shows counts only.
    folder = out_root / f"ai-{stamp}"
    folder.mkdir(parents=True, exist_ok=True)
    os.chmod(folder, 0o700)
    (folder / "ai_check.json").write_text(json.dumps(results, ensure_ascii=False, indent=1, default=str), encoding="utf-8")
    os.chmod(folder / "ai_check.json", 0o600)

    checked = len(results) - counts["error"]
    print(f"\nChecked {checked}: agree {counts['agree']}, differ {counts['differ']}, "
          f"no stored number {counts['no_db_number']}, AI gave no number {counts['not_number']}; "
          f"ambiguous (likely) {counts['ambiguous']}; errors {counts['error']}")
    print(f"Structured output: {'yes' if checker.structured else 'no (JSON from text)'}")
    print(f"Tokens: in {checker.tokens_in}, out {checker.tokens_out}; estimated cost ${checker.cost(len(results)):.2f}; "
          f"{(time.time() - started) / max(1, len(results)):.0f} s per problem")
    print("Saved to the database." if writer else "Not saved (run with --save to store the results).")


if __name__ == "__main__":
    main()
