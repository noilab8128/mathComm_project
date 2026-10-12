"""
Import solution-path ladders (LADDER_RULES_v2.md format) into Supabase.

Each ladder in the given markdown file(s) becomes:
  - the Challenge and every Step       -> `problems` rows (+ one `solutions` row each: "Answer: ...", then the short
                                          solution; the Challenge gets our full solution), steps linked under the
                                          Challenge in `problem_hierarchies` in step order
  - Problem analysis + Logic flow       -> one `ladder_guides` row (members only; each flow move linked to its step)
  - similar olympiad problems, Explore, research field, proof problem
                                        -> `ladder_extras` rows (the three buttons after the Challenge)

Categories come from subdomains.py (LADDER_SUBDOMAIN). All problems get source = SOURCE so they can be removed.
Running --apply again skips ladders already imported, but refreshes their guide and extras.

Run (from olympiad/):
  python3 ladders/import_ladders_v2.py ladders/pilot_v2/PILOT_A2.md            # preview, writes import_v2_preview.json
  python3 ladders/import_ladders_v2.py ladders/pilot_v2/PILOT_A2.md --apply    # write to Supabase
  python3 ladders/import_ladders_v2.py --remove                                 # delete everything this script added
  option: --only P1,P2

Credentials: olympiad/.env (SUPABASE_URL, SUPABASE_SECRET_KEY).
"""

import argparse
import json
import re
import sys
from pathlib import Path

from build_review_pdf import parse, section
from import_extras import OFFICIAL_PROBLEMS_URL
from import_ladders import DIFFICULTY_BY_LEVEL, LICENSE, Supabase, difficulty_label, plain
from subdomains import ladder_categories

HERE = Path(__file__).resolve().parent
PREVIEW_JSON = HERE / "import_v2_preview.json"
SOURCE = "MathQuest Ladders v2"


def cap(text):
    return text[:1].upper() + text[1:] if text else text


def bullet_items(text):
    """'- a\\n  continued\\n- b' -> ['a continued', 'b'] (one level; nested lines are joined)."""
    items = []
    for line in text.splitlines():
        if re.match(r"^- ", line):
            items.append(line[2:].strip())
        elif line.strip() and items:
            items[-1] += " " + line.strip()
    return items


def numbered_items(text):
    return [" ".join(x.split()) for x in re.split(r"^\d+\. ", text, flags=re.M)[1:]]


def step_solutions(text):
    """'- Step 2: ...' / '- Challenge: ...' -> {'2': '...', 'Challenge': '...'}."""
    out = {}
    for item in bullet_items(text):
        m = re.match(r"^(Step (\d+)|Challenge)\s*(?:\([^)]*\))?:\s*(.*)$", item)
        if m:
            out[m.group(2) or "Challenge"] = cap(plain(m.group(3)))
    return out


def flow_moves(text):
    """'**Title (Step 2).** text *Why:* ...' -> {'title', 'step', 'text'}."""
    moves = []
    for item in numbered_items(text):
        m = re.match(r"^\*\*(.+?)\*\*\s*(.*)$", item)
        head, rest = (m.group(1), m.group(2)) if m else (item, "")
        step = re.search(r"\(Step (\d+)\)", head)
        title = re.sub(r"\s*\(Step \d+\)", "", head).strip().rstrip(".")
        moves.append({"title": plain(title), "step": step.group(1) if step else None, "text": plain(rest)})
    return moves


def extras_rows(ladder, body):
    rows = []
    for item in bullet_items(section(body, "Similar olympiad problems")):
        m = re.match(r"^(.+?)\s*\*\(([^)]+)\)\*\s*:\s*(.*)$", item)
        title, meta, text = (m.group(1), m.group(2), m.group(3)) if m else (item.split(":")[0], None, item)
        rows.append({"kind": "similar", "title": plain(title), "meta": meta, "body": cap(plain(text)),
                     "link": OFFICIAL_PROBLEMS_URL})
    explore = section(body, "Explore")
    if explore:
        status = re.match(r"^—?\s*\*?Status:\s*([^*]+)\*?\s*", explore)
        text = explore[status.end():] if status else explore
        rows.append({"kind": "research", "title": "Explore", "meta": cap(status.group(1).strip().rstrip(".")) if status else None,
                     "body": cap(plain(" ".join(text.split())))})
    if ladder["field"]:
        rows.append({"kind": "research", "title": "Research field", "meta": None, "body": cap(plain(ladder["field"]))})
    proof = section(body, "Proof problem")
    if proof:
        statement = proof.split("\n- ")[0]
        hints = [plain(re.sub(r"^Hint \d+:\s*", "", h)) for h in bullet_items(proof) if h.startswith("Hint")]
        sol = next((plain(re.sub(r"^Solution:\s*", "", h)) for h in bullet_items(proof) if h.startswith("Solution")), "")
        rows.append({"kind": "proof", "title": f"{ladder['name']}: prove the key move", "meta": "Proof",
                     "body": plain(" ".join(statement.split())), "hints": hints, "solution": sol})
    for kind in ("similar", "research", "proof"):
        for i, r in enumerate(r for r in rows if r["kind"] == kind):
            r["sort_order"] = i
    return rows


def build(md):
    blocks = {b.split("\n", 1)[0].split("—", 1)[0].strip(): b for b in re.split(r"^### Ladder ", md, flags=re.M)[1:]}
    out = []
    for ladder in parse(md):
        body = blocks[ladder["key"]].split("\n", 1)[1].split("\n---")[0]
        cats = ladder_categories(ladder["key"])
        sols = step_solutions(ladder["solutions"])
        full = " ".join(section(body, "Our full solution").split())
        problems = []
        for r in ladder["rows"]:
            is_ch = r["step"] == "Challenge"
            difficulty = DIFFICULTY_BY_LEVEL[r["level"].lower()]
            content = (f"Setup: {plain(ladder['setup'])}\n\n" if ladder["setup"] else "") + plain(r["problem"])
            content += "\n\nAnswer with a single number."
            answer = r["answer"].replace(" ", "")
            explanation = plain(full) if is_ch and full else sols.get(r["step"], "")
            problems.append({
                "step": r["step"],
                "problem": {
                    "title": f"{plain(ladder['name'])} — {'Challenge' if is_ch else 'Step ' + r['step']}",
                    "content": content,
                    "difficulty": difficulty,
                    "category_level1": cats[0][0], "category_level2": cats[1][0], "category_level3": cats[2][0],
                    "category_path": " > ".join(n for _, n in cats),
                    "level": difficulty_label(difficulty),
                    "tags": [n for _, n in cats] + ["Ladder", plain(ladder["name"]), r["level"]],
                    "concepts": [c.strip() for c in plain(ladder["field"]).split(";") if c.strip()],
                    "source": SOURCE, "license": LICENSE,
                    "is_generated": not is_ch, "is_reviewed": False,
                },
                "solution": {"content": f"Answer: {answer}" + (f"\n\n{explanation}" if explanation else ""),
                             "sequence_order": 1},
            })
        out.append({
            "key": ladder["key"], "name": plain(ladder["name"]), "problems": problems,
            "guide": {"analysis": [plain(a) for a in bullet_items(ladder["analysis"])], "flow": flow_moves(ladder["flow"])},
            "extras": extras_rows(ladder, body),
        })
    return out


def check(ladders):
    for lad in ladders:
        steps = [p["step"] for p in lad["problems"]]
        assert "Challenge" in steps, lad["key"]
        for p in lad["problems"]:
            assert re.match(r"^Answer: -?[\d/.]+(\n|$)", p["solution"]["content"]), (lad["key"], p["step"])
            assert "**" not in p["problem"]["content"] + p["solution"]["content"], (lad["key"], p["step"])
        for m in lad["guide"]["flow"]:
            assert m["step"] is None or m["step"] in steps, (lad["key"], m)
        assert lad["guide"]["analysis"] and lad["guide"]["flow"], f"{lad['key']}: missing analysis or flow"


def apply(db, ladders):
    r = db.http.get(f"{db.url}/problems", params={"select": "id,title", "source": f"eq.{SOURCE}"}, timeout=30)
    existing = {row["title"]: row["id"] for row in db._check(r, "read problems").json()}
    for lad in ladders:
        ch = next(p for p in lad["problems"] if p["step"] == "Challenge")
        ids = {}
        if ch["problem"]["title"] in existing:
            print(f"  skip   Ladder {lad['key']} ({lad['name']}): problems already imported; refreshing guide and extras")
            for p in lad["problems"]:
                ids[p["step"]] = existing.get(p["problem"]["title"])
        else:
            created = []
            try:
                root = db.insert("problems", ch["problem"])
                created.append(root["id"])
                root_sol = db.insert("solutions", {**ch["solution"], "problem_id": root["id"]})
                ids["Challenge"] = root["id"]
                children = [p for p in lad["problems"] if p["step"] != "Challenge"]
                for order, p in enumerate(children, start=1):
                    row = db.insert("problems", p["problem"])
                    created.append(row["id"])
                    ids[p["step"]] = row["id"]
                    db.insert("solutions", {**p["solution"], "problem_id": row["id"]})
                    db.insert("problem_hierarchies", {
                        "parent_problem_id": root["id"], "parent_solution_id": root_sol["id"],
                        "child_problem_id": row["id"], "stage_name": f"Step {p['step']}",
                        "sequence_order": order, "depth": 2,
                    })
                print(f"  added  Ladder {lad['key']} ({lad['name']}): {len(created)} problems")
            except Exception as exc:
                db.delete_problems(created)
                sys.exit(f"  FAILED Ladder {lad['key']}; rolled back its {len(created)} problem(s).\n  {exc}")

        root_id = ids["Challenge"]
        # Extras: replace this ladder's rows (a bulk insert needs the same keys in every row)
        db._check(db.http.delete(f"{db.url}/ladder_extras", params={"root_problem_id": f"eq.{root_id}"}, timeout=30),
                  "delete old extras")
        blank = {"meta": None, "hints": [], "solution": None, "link": None}
        rows = [{**blank, **row, "root_problem_id": root_id} for row in lad["extras"]]
        if rows:
            db._check(db.http.post(f"{db.url}/ladder_extras", data=json.dumps(rows),
                                   headers={"Prefer": "return=minimal"}, timeout=30), "insert extras")
        # Guide (members only). The table may not exist yet: supabase/sql/ladder_guides.sql
        guide = {
            "root_problem_id": root_id,
            "analysis": lad["guide"]["analysis"],
            "flow": [{"title": m["title"], "text": m["text"],
                      "step_problem_id": ids.get(m["step"]) if m["step"] else None} for m in lad["guide"]["flow"]],
        }
        r = db.http.post(f"{db.url}/ladder_guides", params={"on_conflict": "root_problem_id"}, data=json.dumps(guide),
                         headers={"Prefer": "resolution=merge-duplicates,return=minimal"}, timeout=30)
        if r.status_code == 404:
            print("  NOTE   table ladder_guides does not exist yet: run supabase/sql/ladder_guides.sql, then --apply again")
        else:
            db._check(r, "upsert guide")
            print(f"         guide: {len(guide['analysis'])} observations, {len(guide['flow'])} flow moves; "
                  f"extras: {len(rows)} rows")


def remove(db):
    r = db.http.get(f"{db.url}/problems", params={"select": "id", "source": f"eq.{SOURCE}"}, timeout=30)
    ids = [row["id"] for row in db._check(r, "read problems").json()]
    db.delete_problems(ids)  # solutions, hierarchies, extras and guides go too (ON DELETE CASCADE)
    print(f"Removed {len(ids)} problems with source '{SOURCE}'.")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("files", nargs="*", help="ladder markdown files in LADDER_RULES_v2 format")
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--apply", action="store_true", help="write to Supabase")
    mode.add_argument("--remove", action="store_true", help="delete every problem this script added")
    ap.add_argument("--only", help="comma-separated ladder keys, e.g. P1,P2")
    args = ap.parse_args()

    if args.remove:
        remove(Supabase())
        return
    if not args.files:
        sys.exit("Give at least one ladder file.")
    ladders = [lad for f in args.files for lad in build(Path(f).read_text())]
    if args.only:
        keep = set(args.only.split(","))
        ladders = [lad for lad in ladders if lad["key"] in keep]
    check(ladders)
    PREVIEW_JSON.write_text(json.dumps(ladders, indent=2, ensure_ascii=False) + "\n")
    for lad in ladders:
        print(f"Ladder {lad['key']:3} {lad['name']:32} {len(lad['problems'])} problems, "
              f"{len(lad['guide']['analysis'])} observations, {len(lad['guide']['flow'])} flow moves, "
              f"{len(lad['extras'])} extras")
    print(f"Preview written to {PREVIEW_JSON.name}")
    if args.apply:
        apply(Supabase(), ladders)
    else:
        print("Preview only. Run with --apply to write to Supabase.")


if __name__ == "__main__":
    main()
