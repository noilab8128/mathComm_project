#!/usr/bin/env python3
"""
Problem verification, stage 1: a read-only status report of every problem in Supabase.

- L0: format checks on the problems as students see them (scripts/verify/checks.py).
- L1 (reference): for v2 ladders, compare the database answer with the markdown source in olympiad/ladders/ and
  run the ladder verify scripts, without changing them.

Read only by default: GET requests with the service key (same credentials as scripts/backup_supabase.py). Nothing is written to
the database. The report contains problems and answers, so it is saved outside the repository.

Run from the repository root:
  python3 scripts/verify/report.py              # report -> ~/mathquest-verify-reports/<date-time>/
  python3 scripts/verify/report.py --no-l1      # database checks only (skip markdown and verify scripts)
  python3 scripts/verify/report.py --save       # also store the results (stage 2 tables, see below)

--save writes ONLY problem_verification_status and problem_verifications (supabase/sql/problem_verification.sql
must have been run). It never changes problems, solutions or reviews.

Plan: Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md
"""

import argparse
import csv
import json
import os
import re
import subprocess
import sys
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent.parent
LADDERS = REPO_ROOT / "olympiad" / "ladders"
sys.path.insert(0, str(HERE))
sys.path.insert(0, str(HERE.parent))

from backup_supabase import Rest, load_credentials  # noqa: E402  (shared read-only REST client)
from save import Writer, save  # noqa: E402
from checks import (Issue, check_ladders, check_problem, content_hash, contest_label, ladder_part,  # noqa: E402
                    overall, parse_number, show, stored_answer)

DEFAULT_OUT = Path.home() / "mathquest-verify-reports"
# markdown source -> its verify script (both are Mookwon's files; only read and run here)
SOURCES = [("pilot_v2/PILOT_A2.md", "pilot_v2/verify_pilot_a2.py")] + [
    (f"v2/LADDERS_v2_batch{n}.md", f"v2/verify_v2_batch{n}.py") for n in range(1, 9)]
RULE_TITLES = {
    "EMPTY_TEXT": "제목·본문 비어 있음", "DIFFICULTY_RANGE": "난이도 범위", "NO_SOLUTION": "풀이 없음",
    "ANSWER_UNPARSEABLE": "정답을 숫자로 읽을 수 없음", "NO_NUMBER_ANSWER": "숫자 정답 없음",
    "CONTEST_LABEL_MISSING": "대회 라벨 없음", "LABEL_DIFFICULTY": "라벨과 난이도 불일치",
    "AIME_RANGE": "AIME 정답 범위(0–999)", "KNOWN_THAT": "'It is known that' (규칙 5.9)",
    "STEP_REFERENCE": "다른 단계 답 참조 (규칙 5.4)", "ANSWER_SENTENCE": "정답 안내 문장 중복",
    "CATEGORY_MISSING": "세부 카테고리 없음", "HINT_LEAK": "힌트에 정답", "BROKEN_LINK": "끊어진 사다리 연결",
    "STEP_ORDER_DUPLICATE": "사다리 순서 번호 중복",
    "CHALLENGE_ANSWER_REPEATED": "Challenge 정답 = 단계 정답 (규칙 4.3)", "STEP_ANSWER_REPEATED": "단계끼리 정답 중복",
    "MD_ANSWER_DIFF": "DB 정답 ≠ markdown 정답", "MD_NOT_IN_DB": "markdown에만 있는 문제",
    "NOT_IN_MD": "markdown 원본을 찾지 못함", "VERIFY_SCRIPT_FAIL": "검증 스크립트 실패",
}


# ---- database ------------------------------------------------------------------------------------------------------
def load_db(rest):
    def table(name, pk=("id",)):
        return rest.rows("public", name, {"columns": [], "pk": list(pk)})

    problems = table("problems")
    solutions = table("solutions")
    links = table("problem_hierarchies")
    try:
        hints = table("problem_hints")
    except RuntimeError:
        hints = None  # table not created yet (supabase/sql/problem_hints.sql)
    return problems, solutions, links, hints


# ---- L1: markdown sources and verify scripts --------------------------------------------------------------------
def load_sources():
    """{(ladder name, part): {"answer", "file", "key", "step"}} from the v2 markdown, with Mookwon's own parser."""
    sys.path.insert(0, str(LADDERS))
    from build_review_pdf import parse  # noqa: E402
    from import_ladders import plain  # noqa: E402

    rows = {}
    for md, _ in SOURCES:
        path = LADDERS / md
        if not path.is_file():
            continue
        for ladder in parse(path.read_text(encoding="utf-8")):
            name = plain(ladder["name"])
            for r in ladder["rows"]:
                part = "Challenge" if r["step"] == "Challenge" else f"Step {r['step']}"
                rows[(name, part)] = {"answer": r["answer"].replace(" ", ""), "file": md,
                                      "key": ladder["key"], "step": r["step"]}
    return rows


def run_verify_scripts():
    """{script: {"ok", "summary", "fails": [(ladder key, part or None, line)]}}. The scripts exit 0 even on failure,
    so the result is read from their output (FAIL lines and the final 'x/y checks' line)."""
    results = {}
    for md, script in SOURCES:
        path = LADDERS / script
        if not path.is_file():
            continue
        try:
            proc = subprocess.run([sys.executable, str(path.relative_to(LADDERS.parent))], cwd=LADDERS.parent,
                                  capture_output=True, text=True, timeout=600)
            out = proc.stdout + proc.stderr
            code = proc.returncode
        except subprocess.TimeoutExpired:
            out, code = "TIMEOUT after 600 s", -1
        fails = []
        for line in out.splitlines():
            if line.startswith("FAIL"):
                m = re.match(r"FAIL\s+(P\d+)\s+(Step \d+|Challenge)?", line)
                fails.append((m.group(1) if m else None, m.group(2) if m else None, line.strip()))
        summary = next((l.strip() for l in reversed(out.splitlines()) if re.search(r"\d+/\d+ checks", l)), "")
        m = re.search(r"(\d+)/(\d+) checks", summary)
        ok = code == 0 and not fails and bool(m) and m.group(1) == m.group(2)
        last = out.strip().splitlines()[-1] if out.strip() else ""
        results[script] = {"md": md, "ok": ok, "summary": summary or last, "fails": fails}
    return results


# ---- report ------------------------------------------------------------------------------------------------------
def main():
    parser = argparse.ArgumentParser(description="Read-only verification report of all problems in Supabase.")
    parser.add_argument("--out", default=str(DEFAULT_OUT), help=f"folder for reports (default {DEFAULT_OUT})")
    parser.add_argument("--env", help="read credentials from this file instead of .env.local / olympiad/.env")
    parser.add_argument("--no-l1", action="store_true", help="skip the markdown comparison and the verify scripts")
    parser.add_argument("--save", action="store_true",
                        help="store the results in problem_verification_status / problem_verifications")
    args = parser.parse_args()

    out_root = Path(args.out).expanduser().resolve()
    if out_root == REPO_ROOT or REPO_ROOT in out_root.parents:
        sys.exit("Choose a folder outside the repository (the report contains answers and the repository is public).")

    url, key, where = load_credentials(args.env)
    print(f"Reading problems (read only, credentials from {where}) ...")
    problems, solutions, links, hints = load_db(Rest(url, key))
    print(f"  problems {len(problems)}, solutions {len(solutions)}, ladder links {len(links)}, "
          f"hints {'table not created' if hints is None else len(hints)}")

    sols_by = {}
    for s in solutions:
        sols_by.setdefault(s.get("problem_id"), []).append(s)
    hints_by = {}
    for h in hints or []:
        hints_by.setdefault(h.get("problem_id"), []).append(h)
    by_id = {p["id"]: p for p in problems}

    results = {}
    answers = {}
    for p in problems:
        sols = sols_by.get(p["id"], [])
        raw, value, _ = stored_answer(sols)
        answers[p["id"]] = value
        name, part = ladder_part(p.get("title"))
        results[p["id"]] = {
            "id": p["id"], "title": p.get("title"), "source": p.get("source"), "ladder": name, "part": part,
            "contest_label": contest_label(p), "difficulty": p.get("difficulty"), "answer": show(value),
            "is_reviewed": p.get("is_reviewed"), "content_hash": content_hash(p, sols),
            "issues": check_problem(p, sols, hints_by.get(p["id"])),
        }
    for pid, extra in check_ladders(by_id, answers, links).items():
        if pid in results:
            results[pid]["issues"].extend(extra)

    scripts = {}
    if not args.no_l1:
        print("Comparing with the markdown sources and running the verify scripts (read only) ...")
        sources = load_sources()
        db_keys = {}
        for r in results.values():
            if r["ladder"]:
                db_keys[(r["ladder"], r["part"])] = r["id"]
        key_to_name = {}
        for (name, part), src in sources.items():
            key_to_name[src["key"]] = name
            pid = db_keys.get((name, part))
            if pid is None:
                continue
            src_value = parse_number(src["answer"])
            if src_value is None or src_value != answers.get(pid):
                results[pid]["issues"].append(Issue(
                    "MD_ANSWER_DIFF", "warn",
                    f"DB 정답 {results[pid]['answer']} ≠ {src['file']}의 정답 {src['answer']}"))
        for r in results.values():
            if (r.get("source") or "").endswith("Ladders v2") and (r["ladder"], r["part"]) not in sources:
                r["issues"].append(Issue("NOT_IN_MD", "info", "v2 사다리인데 markdown 원본에서 찾지 못함 (이름이 바뀌었나?)"))
        scripts = run_verify_scripts()
        for script, res in scripts.items():
            for ladder_key, part, line in res["fails"]:
                pid = db_keys.get((key_to_name.get(ladder_key), part)) if ladder_key and part else None
                if pid:
                    results[pid]["issues"].append(Issue("VERIFY_SCRIPT_FAIL", "warn", f"{script}: {line}"))
        md_only = [k for k in sources if k not in db_keys]
    else:
        md_only = []

    for r in results.values():
        r["status"] = overall(r["issues"])
        r["issues"] = [i.to_dict() for i in r["issues"]]

    # The report folder is made before anything is saved, so a problem here stops the run before any write.
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H%M%SZ")
    folder, n = out_root / stamp, 1
    while folder.exists():
        n += 1
        folder = out_root / f"{stamp}-{n}"
    folder.mkdir(parents=True)
    os.chmod(folder, 0o700)

    saved = None
    if args.save:
        print("Saving results to problem_verification_status / problem_verifications ...")
        try:
            saved = save(Rest(url, key), Writer(url, key), list(results.values()), f"report {stamp}", not args.no_l1)
        except (SystemExit, RuntimeError):
            folder.rmdir()  # nothing was written to it yet
            raise

    # ---- write -------------------------------------------------------------------------------------------------
    ordered = sorted(results.values(), key=lambda r: ({"fail": 0, "warn": 1, "pass": 2}[r["status"]],
                                                      r["ladder"] or "~", r["title"] or ""))
    (folder / "problems.json").write_text(json.dumps(ordered, ensure_ascii=False, indent=1), encoding="utf-8")
    with (folder / "issues.csv").open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["problem_id", "title", "status", "rule", "severity", "message"])
        for r in ordered:
            for i in r["issues"]:
                w.writerow([r["id"], r["title"], r["status"], i["rule"], i["severity"], i["message"]])
    write_markdown(folder / "report.md", ordered, scripts, md_only, len(links), hints is not None, stamp)
    for path in folder.iterdir():
        os.chmod(path, 0o600)

    # ---- console: counts only (no answers) ---------------------------------------------------------------------
    status = Counter(r["status"] for r in ordered)
    rules = Counter((i["rule"], i["severity"]) for r in ordered for i in r["issues"])
    print(f"\nProblems: {len(ordered)}  pass {status['pass']}  warn {status['warn']}  fail {status['fail']}")
    for (rule, sev), n in sorted(rules.items(), key=lambda x: ({"fail": 0, "warn": 1, "info": 2}[x[0][1]], -x[1])):
        print(f"  {sev:4s} {rule:22s} {n:4d}  {RULE_TITLES.get(rule, '')}")
    if scripts:
        bad = [s for s, r in scripts.items() if not r["ok"]]
        print(f"Verify scripts: {len(scripts) - len(bad)}/{len(scripts)} passed" + (f"  (failed: {', '.join(bad)})" if bad else ""))
    if saved:
        print(f"Saved: {saved['new']} new, {saved['changed']} changed (reviews reset), {saved['unchanged']} unchanged; "
              f"{saved['history']} history rows")
    print(f"\nReport: {folder / 'report.md'}")


def write_markdown(path, rows, scripts, md_only, n_links, has_hints, stamp):
    status = Counter(r["status"] for r in rows)
    rules = Counter((i["rule"], i["severity"]) for r in rows for i in r["issues"])
    by_source = Counter(r["source"] or "(없음)" for r in rows)
    lines = [
        f"# 문제 검증 현황 보고서 (1단계, 읽기 전용)",
        "",
        f"- 생성: {stamp} (UTC)",
        f"- 문제 {len(rows)}개 · 사다리 연결 {n_links}개 · 힌트 테이블 {'있음' if has_hints else '없음 (힌트 검사 생략)'}",
        f"- 결과: **통과 {status['pass']} · 경고 {status['warn']} · 실패 {status['fail']}**",
        "",
        "## 출처별 문제 수",
        "",
        "| 출처 (`problems.source`) | 문제 수 |",
        "|---|---|",
        *[f"| {s} | {n} |" for s, n in by_source.most_common()],
        "",
        "## 규칙별 건수",
        "",
        "| 심각도 | 규칙 | 설명 | 문제 수 |",
        "|---|---|---|---|",
        *[f"| {sev} | `{rule}` | {RULE_TITLES.get(rule, '')} | {n} |"
          for (rule, sev), n in sorted(rules.items(), key=lambda x: ({"fail": 0, "warn": 1, "info": 2}[x[0][1]], -x[1]))],
        "",
    ]
    if scripts:
        lines += ["## 검증 스크립트 (L1, 읽기 전용 실행)", "", "| 스크립트 | 원본 | 결과 | 요약 |", "|---|---|---|---|"]
        lines += [f"| `{s}` | `{r['md']}` | {'통과' if r['ok'] else '**실패**'} | {r['summary']} |"
                  for s, r in scripts.items()]
        lines.append("")
    if md_only:
        grouped = {}
        for name, part in md_only:
            grouped.setdefault(name, []).append(part)
        lines += [f"## markdown에만 있는 문제 (DB에 없음: 사다리 {len(grouped)}개, 문제 {len(md_only)}개)", "",
                  "아직 import하지 않았거나, DB에서 제목이 바뀐 사다리입니다.", "",
                  "| 사다리 | 단계 |", "|---|---|"]
        lines += [f"| {name} | {', '.join(sorted(parts, key=lambda p: (p == 'Challenge', p)))} |"
                  for name, parts in sorted(grouped.items())]
        lines.append("")

    for sev, heading in (("fail", "실패"), ("warn", "경고")):
        hit = [r for r in rows if any(i["severity"] == sev for i in r["issues"])]
        if not hit:
            continue
        lines += [f"## {heading} ({len(hit)}문제)", "", "| 문제 | 라벨 | 정답 | 내용 |", "|---|---|---|---|"]
        for r in hit:
            msgs = "<br>".join(f"`{i['rule']}` {i['message']}" for i in r["issues"] if i["severity"] == sev)
            lines.append(f"| {r['title']} | {r['contest_label'] or '-'} | {r['answer']} | {msgs} |")
        lines.append("")
    path.write_text("\n".join(lines), encoding="utf-8")


if __name__ == "__main__":
    main()
