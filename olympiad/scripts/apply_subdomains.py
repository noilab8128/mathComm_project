"""
Add the skill-tree subdomains to `categories` and give every problem of the live ladders its subdomain.

The lists live in ladders/subdomains.py. Ladder steps get the subdomain of their Challenge. Before writing, the
old category values of every changed problem are saved to data/backups/ (git-ignored), so they can be restored.

Usage (from olympiad/):
  python3 scripts/apply_subdomains.py            # preview: what would change
  python3 scripts/apply_subdomains.py --apply    # write to Supabase

Credentials: olympiad/.env (SUPABASE_URL, SUPABASE_SECRET_KEY).
"""

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "ladders"))
from subdomains import NEW_CATEGORIES, ladder_categories  # noqa: E402

# Live ladders (LADDERS_v0.1.md): name in the Challenge title -> ladder key
LIVE_LADDERS = {
    "Candy Game": "0", "Fibonacci Stairs": "A", "Coins You Can't Make": "B", "Reverse and Add": "C",
    "No Three in a Line": "D", "Dots on a Circle": "E", "Carries Cost Nine": "F",
}


def session():
    env = {}
    for line in (ROOT / ".env").read_text().splitlines():
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"')
    http = requests.Session()
    key = env["SUPABASE_SECRET_KEY"]
    http.headers.update({"apikey": key, "Authorization": f"Bearer {key}", "Content-Type": "application/json"})
    return http, env["SUPABASE_URL"].rstrip("/") + "/rest/v1"


def check(r, what):
    if r.status_code >= 300:
        sys.exit(f"{what} failed: HTTP {r.status_code} {r.text}")
    return r


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true")
    args = ap.parse_args()
    http, url = session()

    have = {c["category_id"] for c in check(http.get(f"{url}/categories", params={"select": "category_id"}), "read categories").json()}
    missing = [c for c in NEW_CATEGORIES if c[0] not in have]
    print(f"Categories to add: {len(missing)} of {len(NEW_CATEGORIES)}")
    for cid, name, level, parent in missing:
        print(f"  {cid:3}  level {level}  parent {parent:3}  {name}")

    problems = check(http.get(f"{url}/problems", params={
        "select": "id,title,category_level1,category_level2,category_level3,category_path"}), "read problems").json()
    by_id = {p["id"]: p for p in problems}
    links = check(http.get(f"{url}/problem_hierarchies", params={"select": "parent_problem_id,child_problem_id"}),
                  "read hierarchies").json()
    children = {}
    for link in links:
        children.setdefault(link["parent_problem_id"], []).append(link["child_problem_id"])

    changes = []
    for p in problems:
        name = p["title"].replace(" — Challenge", "")
        if not p["title"].endswith(" — Challenge") or name not in LIVE_LADDERS:
            continue
        cats = ladder_categories(LIVE_LADDERS[name])
        new = {"category_level1": cats[0][0], "category_level2": cats[1][0], "category_level3": cats[2][0],
               "category_path": " > ".join(n for _, n in cats)}
        todo, seen = [p["id"]], set()
        while todo:
            pid = todo.pop()
            if pid in seen:
                continue
            seen.add(pid)
            todo += children.get(pid, [])
            old = {k: by_id[pid][k] for k in new}
            if old != new:
                changes.append((pid, old, new))

    print(f"\nProblems to retag: {len(changes)}")
    for pid, old, new in changes:
        print(f"  {by_id[pid]['title'][:44]:44}  {old['category_path'] or '-'}  ->  {new['category_path']}")

    if not args.apply:
        print("\nPreview only. Run with --apply to write.")
        return

    backup = ROOT / "data" / "backups" / f"subdomains_{datetime.now():%Y%m%d_%H%M%S}.json"
    backup.parent.mkdir(parents=True, exist_ok=True)
    backup.write_text(json.dumps([{"id": pid, **old} for pid, old, _ in changes], indent=2, ensure_ascii=False))
    print(f"\nOld values saved to {backup.relative_to(ROOT)}")

    if missing:
        rows = [{"category_id": c, "name": n, "level": lv, "parent_id": par} for c, n, lv, par in missing]
        check(http.post(f"{url}/categories", data=json.dumps(rows),
                        headers={"Prefer": "return=minimal"}), "insert categories")
    for pid, _, new in changes:
        check(http.patch(f"{url}/problems", params={"id": f"eq.{pid}"}, data=json.dumps(new),
                         headers={"Prefer": "return=minimal"}), f"update problem {pid}")
    print(f"Done: {len(missing)} categories added, {len(changes)} problems retagged.")


if __name__ == "__main__":
    main()
