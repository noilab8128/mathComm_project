"""
Import the "after the ladder" content into public.ladder_extras (see supabase/sql/ladder_extras.sql):

  similar   <- "Related Olympiad problems" tables in LADDERS_v0.1.md (citation + our one-sentence description)
  research  <- "Explore", "Famous open problem" and "Research field" in LADDERS_v0.1.md
  proof     <- PROOF_PROBLEMS_v0.1.md

Rows hang off each ladder's Challenge problem (found by title among the rows import_ladders.py inserted).
Running --apply again replaces the extras of those ladders, so edits to the markdown files are picked up.

Usage (from olympiad/):
  python3 ladders/import_extras.py            # preview only: prints a summary, writes extras_preview.json
  python3 ladders/import_extras.py --apply    # replace the rows in Supabase

Credentials: olympiad/.env (SUPABASE_URL, SUPABASE_SECRET_KEY).
"""

import argparse
import json
import re
import sys
from pathlib import Path

from import_ladders import (LADDERS_MD, SOURCE, Supabase, paragraphs_to_plain, plain, sections,
                            split_ladders, table_rows)

HERE = Path(__file__).resolve().parent
PROOFS_MD = HERE / "PROOF_PROBLEMS_v0.1.md"
PREVIEW_JSON = HERE / "extras_preview.json"

OFFICIAL_PROBLEMS_URL = "https://www.imo-official.org/problems.aspx"


def ladder_name(name):
    return re.sub(r"^The ", "", name)


# ---------------------------------------------------------------------------
# LADDERS_v0.1.md -> similar + research rows
# ---------------------------------------------------------------------------

def similar_rows(sec):
    rows = []
    for problem, match, description in (r[:3] for r in table_rows(sec.get("related", []))[1:]):
        # Internal notes about how the ladder was built are not shown on the site.
        description = re.sub(r"\s*The DNA source of this ladder\.", "", description).strip()
        rows.append({"kind": "similar", "title": problem, "meta": match, "body": description,
                     "link": OFFICIAL_PROBLEMS_URL})
    return rows


def unwrap(text):
    """Join the hard-wrapped lines of the markdown source into one line per paragraph.
    Table rows ('a  |  b') keep their line breaks; the site renders them as a table."""
    paras = []
    for para in re.split(r"\n\s*\n", text.strip()):
        lines = [ln.strip() for ln in para.splitlines() if ln.strip()]
        paras.append("\n".join(lines) if any("  |  " in ln for ln in lines) else " ".join(lines))
    return "\n\n".join(paras)


def research_rows(sec):
    rows = []
    if "explore" in sec:
        head = plain(sec["explore"][0])                      # "Explore — Status: ..."
        _, _, status = head.partition(" — ")
        rows.append({"kind": "research", "title": "Explore", "meta": status.strip() or None,
                     "body": unwrap(paragraphs_to_plain(sec["explore"][1:]))})
    if "open" in sec:
        first = sec["open"][0]
        m = re.match(r"^\*\*([^*]+)\*\*\s*(?:\(([^)]*)\))?\s*(.*)$", first)
        title, meta, rest = m.group(1), m.group(2), m.group(3)
        rows.append({"kind": "research", "title": plain(title), "meta": meta,
                     "body": unwrap(paragraphs_to_plain(([rest] if rest else []) + sec["open"][1:]))})
    if "field" in sec:
        field = plain(" ".join(sec["field"]).replace("**Research field:**", ""))
        rows.append({"kind": "research", "title": "Research field", "meta": None, "body": field})
    return rows


# ---------------------------------------------------------------------------
# PROOF_PROBLEMS_v0.1.md -> proof rows
# ---------------------------------------------------------------------------

def proof_rows_by_ladder(md):
    out = {}
    for block in re.split(r"^## Ladder ", md, flags=re.M)[1:]:
        head, rest = block.split("\n", 1)
        key = head.split("—", 1)[0].strip()
        rows = []
        for prob in re.split(r"^### ", rest, flags=re.M)[1:]:
            title, body = prob.split("\n", 1)
            body = body.split("\n---", 1)[0]
            level = re.search(r"^Level:\s*(.+)$", body, flags=re.M).group(1).strip()
            body = re.sub(r"^Level:.*\n", "", body, flags=re.M)
            statement, _, after = body.partition("\nHint:")
            after = "Hint:" + after
            hints_part, _, solution = after.partition("\nSolution:")
            hints = [h.strip() for h in re.split(r"^Hint:", hints_part, flags=re.M) if h.strip()]
            rows.append({"kind": "proof", "title": title.strip(), "meta": level,
                         "body": statement.strip(), "hints": hints, "solution": solution.strip()})
        out[key] = rows
    return out


def build():
    proofs = proof_rows_by_ladder(PROOFS_MD.read_text())
    ladders = []
    for key, name, block in split_ladders(LADDERS_MD.read_text()):
        sec = sections(block)
        rows = similar_rows(sec) + research_rows(sec) + proofs.get(key, [])
        for kind in ("similar", "research", "proof"):
            for i, row in enumerate(r for r in rows if r["kind"] == kind):
                row["sort_order"] = i
        ladders.append({"key": key, "challenge_title": f"{ladder_name(name)} — Challenge", "rows": rows})
    return ladders


def check(ladders):
    for lad in ladders:
        for row in lad["rows"]:
            assert row["title"] and row["body"], (lad["key"], row)
            assert "**" not in row["body"], (lad["key"], row["title"])
            if row["kind"] == "proof":
                assert row["hints"] and row["solution"], (lad["key"], row["title"])
            text = row["body"] + row.get("solution", "")
            assert text.count("$") % 2 == 0, f"unbalanced $ in {lad['key']} / {row['title']}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="replace the rows in Supabase")
    args = ap.parse_args()

    ladders = build()
    check(ladders)
    PREVIEW_JSON.write_text(json.dumps(ladders, indent=2, ensure_ascii=False) + "\n")
    for lad in ladders:
        counts = {k: sum(r["kind"] == k for r in lad["rows"]) for k in ("similar", "research", "proof")}
        print(f"Ladder {lad['key']:<2} {lad['challenge_title']:<34} "
              f"similar {counts['similar']}  research {counts['research']}  proof {counts['proof']}")
    print(f"Preview written to {PREVIEW_JSON.name}")
    if not args.apply:
        print("Preview only. Run with --apply to write to Supabase.")
        return

    db = Supabase()
    r = db.http.get(f"{db.url}/ladder_extras", params={"select": "id", "limit": 1}, timeout=15)
    if r.status_code == 404:
        sys.exit("Table public.ladder_extras does not exist. Run supabase/sql/ladder_extras.sql "
                 "in the Supabase SQL Editor first.")
    roots = db.titles_with_source()
    total = 0
    for lad in ladders:
        root_id = roots.get(lad["challenge_title"])
        if not root_id:
            print(f"  skip Ladder {lad['key']}: '{lad['challenge_title']}' is not in the database")
            continue
        db._check(db.http.delete(f"{db.url}/ladder_extras", params={"root_problem_id": f"eq.{root_id}"},
                                 timeout=30), "delete old extras")
        # A bulk insert needs the same keys in every row.
        blank = {"meta": None, "hints": [], "solution": None, "link": None}
        rows = [{**blank, **row, "root_problem_id": root_id} for row in lad["rows"]]
        db._check(db.http.post(f"{db.url}/ladder_extras", data=json.dumps(rows),
                               headers={"Prefer": "return=minimal"}, timeout=30), "insert extras")
        total += len(rows)
    print(f"Done: {total} rows in ladder_extras.")


if __name__ == "__main__":
    main()
