"""
Write hints (and, where given, the Problem analysis, Logic flow and full Challenge solution) for ladders that are
already on the site. Problems are matched by title: "<ladder name> — <label>", label = "Step 1", "Bridge", "Challenge".
Nothing else about the problems changes (statements, answers, steps, extras and student progress stay).

Each "### Ladder <key> — <name>" block may contain:
  **Hints**              - <label>: <hint>        (several lines per label = hints revealed one at a time)
  **Problem analysis**   - bullets                -> ladder_guides.analysis   (members only)
  **Logic flow**         1. **Title (Step 2).** … -> ladder_guides.flow       (members only; "(Bridge)" also links)
  **Our full solution**  paragraph                -> the Challenge's solution text after its "Answer: …" line

Checks before writing: every label is a live problem, every problem of the ladder has a hint (two for the Challenge),
and no hint contains its own problem's answer (except the few listed in ALLOWED, where the number is part of the
statement or setup, not the answer).

Run (from olympiad/):
  python3 ladders/import_guides_hints.py ladders/v2/HINTS_v2.md ladders/v2/LADDERS_v2_older.md            # check only
  python3 ladders/import_guides_hints.py ladders/v2/HINTS_v2.md ladders/v2/LADDERS_v2_older.md --apply    # write
Needs the tables from supabase/sql/problem_hints.sql and supabase/sql/ladder_guides.sql.
"""

import argparse
import json
import re
import sys

from build_review_pdf import section
from import_ladders import Supabase, plain
from import_ladders_v2 import bullet_items, numbered_items

# (ladder name, label): the answer's digits also occur in the hint as a number from the problem itself.
ALLOWED = {
    ("The Cheapest Bakery", "Step 3"),         # "3ⁱ": the base of the costs; the answer is a count
    ("The Safe Start", "Step 4"),              # "10 and 7": numbers from the statement
    ("Functions That Grow Slowly", "Step 1"),  # "f(4)": an argument; f(5) = 4 is given in the statement
    ("Every Power of Two", "Step 3"),          # "2, 4, 8, 16": the powers to compute; the answer is an exponent
    ("Equal Divisor Counts", "Step 1"),        # "12 = 2² × 3": the number from the statement
    ("Fibonacci Stairs", "Step 3"),            # "1 + 2 + 3 + 5 + 8": list numbers; the answer is a count
    ("Climbing Windows", "Step 1"),            # "sums 0, 1, 2" and "the single 1": digits; the answer is a count (1)
}


def ladder_blocks(md):
    for b in re.split(r"^### Ladder ", md, flags=re.M)[1:]:
        head, body = b.split("\n", 1)
        name = head.split("—", 1)[1].strip()
        yield name, body.split("\n---")[0]


def hint_items(text):
    out = {}
    for item in bullet_items(text):
        m = re.match(r"^(Step \d+|Bridge|Challenge):\s*(.+)$", item)
        if not m:
            sys.exit(f"Bad hint line: {item!r}")
        out.setdefault(m.group(1), []).append(plain(m.group(2)))
    return out


def flow_items(text):
    moves = []
    for item in numbered_items(text):
        m = re.match(r"^\*\*(.+?)\*\*\s*(.*)$", item)
        head, rest = (m.group(1), m.group(2)) if m else (item, "")
        label = re.search(r"\((Step \d+|Bridge|Challenge)\)", head)
        title = re.sub(r"\s*\((Step \d+|Bridge|Challenge)\)", "", head).strip().rstrip(".")
        moves.append({"title": plain(title), "label": label.group(1) if label else None, "text": plain(rest)})
    return moves


def leaks(hint, answer):
    """True if the answer appears as a whole number in the hint (also with thousands separators removed)."""
    pattern = r"(?<![\d.,/])" + re.escape(answer) + r"(?![\d/]|[.,]\d)"
    return bool(re.search(pattern, hint))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="+")
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()

    ladders = [lb for f in args.files for lb in ladder_blocks(open(f, encoding="utf-8").read())]
    db = Supabase()
    names = sorted({n for n, _ in ladders})
    rows = db.http.get(f"{db.url}/problems", params={"select": "id,title,solutions(id,content)"}, timeout=60).json()
    by_title = {r["title"]: r for r in rows}
    hier = db.http.get(f"{db.url}/problem_hierarchies", params={"select": "parent_problem_id,child_problem_id,stage_name"},
                       timeout=60).json()

    problems_ok, hint_rows, guides, solutions, problems_seen = True, [], [], [], 0
    for name, body in ladders:
        root = by_title.get(f"{name} — Challenge")
        if not root:
            sys.exit(f"{name}: no live Challenge titled '{name} — Challenge'")
        labels = ["Challenge"] + [h["stage_name"] for h in hier if h["parent_problem_id"] == root["id"]]
        hints = hint_items(section(body, "Hints"))
        for label in labels:
            p = by_title.get(f"{name} — {label}")
            problems_seen += 1
            got = hints.get(label, [])
            need = 2 if label == "Challenge" else 1
            if len(got) < need:
                print(f"  MISSING  {name} — {label}: {len(got)} hint(s), need {need}")
                problems_ok = False
            answer = (p["solutions"] or [{"content": ""}])[0]["content"].split("\n")[0].replace("Answer:", "").strip()
            for h in got:
                if answer and leaks(h, answer.replace(",", "")) and (name, label) not in ALLOWED:
                    print(f"  LEAK?    {name} — {label} (answer {answer}): {h}")
                    problems_ok = False
            if got:
                hint_rows.append({"problem_id": p["id"], "hints": got})
        for label in hints:
            if label not in labels:
                print(f"  UNKNOWN  {name} — {label}: no such live problem")
                problems_ok = False

        analysis = [plain(a) for a in bullet_items(section(body, "Problem analysis"))]
        flow = flow_items(section(body, "Logic flow"))
        if analysis and flow:
            def step_id(label):
                return by_title[f"{name} — {label}"]["id"] if label and label != "Challenge" else None
            guides.append({"root_problem_id": root["id"], "analysis": analysis,
                           "flow": [{"title": m["title"], "text": m["text"], "step_problem_id": step_id(m["label"])}
                                    for m in flow]})
        full = " ".join(section(body, "Our full solution").split())
        if full:
            sol = root["solutions"][0]
            first = sol["content"].split("\n")[0]
            solutions.append((sol["id"], f"{first}\n\n{plain(full)}", name))

    print(f"{len(ladders)} ladders, {problems_seen} problems, {sum(len(r['hints']) for r in hint_rows)} hints, "
          f"{len(guides)} guides, {len(solutions)} full solutions")
    if not problems_ok:
        sys.exit("Fix the problems above first.")
    if not args.apply:
        print("Check only. Run with --apply to write to Supabase.")
        return

    r = db.http.post(f"{db.url}/problem_hints", params={"on_conflict": "problem_id"}, data=json.dumps(hint_rows),
                     headers={"Prefer": "resolution=merge-duplicates,return=minimal"}, timeout=60)
    if r.status_code == 404:
        sys.exit("Table problem_hints does not exist yet: run supabase/sql/problem_hints.sql in the SQL Editor first.")
    db._check(r, "upsert hints")
    print(f"  hints: {len(hint_rows)} problems")
    if guides:
        db._check(db.http.post(f"{db.url}/ladder_guides", params={"on_conflict": "root_problem_id"},
                               data=json.dumps(guides),
                               headers={"Prefer": "resolution=merge-duplicates,return=minimal"}, timeout=60),
                  "upsert guides")
        print(f"  guides: {len(guides)} ladders")
    for sol_id, content, name in solutions:
        db._check(db.http.patch(f"{db.url}/solutions", params={"id": f"eq.{sol_id}"}, data=json.dumps({"content": content}),
                                headers={"Prefer": "return=minimal"}, timeout=30), "update solution")
        print(f"  full solution: {name}")


if __name__ == "__main__":
    main()
