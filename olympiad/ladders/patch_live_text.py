"""
Update the wording of a ladder that is already live, without re-running the importer (decision 2026-11-20: the
importer refreshes guides and extras too, and can undo other people's edits).

Give the markdown file before and after the edit. For every problem, solution and guide (analysis + flow) of the chosen
ladders whose text changed between the two files, the live row must still equal the OLD text; only then is it replaced
by the new text. Anything that differs from the old text is left alone and reported. Answer lines may not change.

Run (from olympiad/):
  python3 ladders/patch_live_text.py OLD.md NEW.md --only P3            # preview
  python3 ladders/patch_live_text.py OLD.md NEW.md --only P3 --apply    # write

Credentials: olympiad/.env (SUPABASE_URL, SUPABASE_SECRET_KEY).
"""

import argparse
import json
import sys
from pathlib import Path

from import_ladders import Supabase
from import_ladders_v2 import SOURCE, build


def by_title(ladders):
    return {p["problem"]["title"]: p for lad in ladders for p in lad["problems"]}


def guide_of(lad, ids):
    return {"analysis": lad["guide"]["analysis"],
            "flow": [{"title": m["title"], "text": m["text"], "step_problem_id": ids.get(m["step"]) if m["step"] else None}
                     for m in lad["guide"]["flow"]]}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("old")
    ap.add_argument("new")
    ap.add_argument("--only", required=True, help="comma-separated ladder keys, e.g. P3")
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()
    keys = set(args.only.split(","))
    old = [lad for lad in build(Path(args.old).read_text()) if lad["key"] in keys]
    new = [lad for lad in build(Path(args.new).read_text()) if lad["key"] in keys]
    assert {l["key"] for l in new} == keys, f"ladders not found: {keys - {l['key'] for l in new}}"
    old_p, new_p = by_title(old), by_title(new)
    assert old_p.keys() == new_p.keys(), "the steps of a ladder changed; this tool only changes wording"

    db = Supabase()
    r = db.http.get(f"{db.url}/problems", params={"select": "id,title,content", "source": f"eq.{SOURCE}"}, timeout=30)
    live = {row["title"]: row for row in db._check(r, "read problems").json()}
    plan, skipped, done = [], [], []

    for title, p in new_p.items():
        o, row = old_p[title], live[title]
        if p["problem"]["content"] != o["problem"]["content"]:
            if row["content"] == o["problem"]["content"]:
                plan.append(("problems", {"id": f"eq.{row['id']}"}, {"content": p["problem"]["content"]}, f"{title}: problem"))
            elif row["content"] == p["problem"]["content"]:
                done.append(f"{title}: problem")
            else:
                skipped.append(f"{title}: problem (live text was changed by someone else)")
        if p["solution"]["content"] != o["solution"]["content"]:
            assert p["solution"]["content"].split("\n")[0] == o["solution"]["content"].split("\n")[0], f"{title}: answer changed"
            sols = db._check(db.http.get(f"{db.url}/solutions", params={"select": "id,content", "problem_id": f"eq.{row['id']}"},
                                         timeout=30), "read solutions").json()
            if len(sols) == 1 and sols[0]["content"] == o["solution"]["content"]:
                plan.append(("solutions", {"id": f"eq.{sols[0]['id']}"}, {"content": p["solution"]["content"]}, f"{title}: solution"))
            elif len(sols) == 1 and sols[0]["content"] == p["solution"]["content"]:
                done.append(f"{title}: solution")
            else:
                skipped.append(f"{title}: solution (live text was changed by someone else)")

    for lad_new in new:
        lad_old = next(l for l in old if l["key"] == lad_new["key"])
        ids = {p["step"]: live[p["problem"]["title"]]["id"] for p in lad_new["problems"]}
        g_old, g_new = guide_of(lad_old, ids), guide_of(lad_new, ids)
        if g_new == g_old:
            continue
        rows = db._check(db.http.get(f"{db.url}/ladder_guides", params={"select": "analysis,flow",
                                                                         "root_problem_id": f"eq.{ids['Challenge']}"}, timeout=30),
                         "read guide").json()
        if rows and rows[0] == g_old:
            plan.append(("ladder_guides", {"root_problem_id": f"eq.{ids['Challenge']}"}, g_new, f"{lad_new['name']}: analysis and flow"))
        elif rows and rows[0] == g_new:
            done.append(f"{lad_new['name']}: analysis and flow")
        else:
            skipped.append(f"{lad_new['name']}: analysis and flow (live text was changed by someone else)")

    for _, _, _, label in plan:
        print(f"  {'update' if args.apply else 'would update'} {label}")
    for label in done:
        print(f"  ok     {label} (already up to date)")
    for label in skipped:
        print(f"  SKIP   {label}")
    if not args.apply:
        print("Preview only. Run with --apply to write.")
        return
    for table, params, data, label in plan:
        db._check(db.http.patch(f"{db.url}/{table}", params=params, data=json.dumps(data),
                                headers={"Prefer": "return=minimal"}, timeout=30), f"update {label}")
    print(f"Done: {len(plan)} updated, {len(skipped)} skipped.")
    sys.exit(1 if skipped else 0)


if __name__ == "__main__":
    main()
