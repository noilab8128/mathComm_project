"""
Upload idea cards (data/idea_cards/*.json) into the Supabase table public.idea_cards.

The table is created by supabase/sql/idea_cards.sql (run it once in the Supabase SQL Editor).
Rows are matched on source_ref, so running this again updates existing cards instead of
duplicating them. The status column is never sent, so a card marked 'reviewed' or 'used'
keeps that status.

Usage (from olympiad/):
  python3 scripts/upload_idea_cards.py            # preview: validate the files, print a summary
  python3 scripts/upload_idea_cards.py --apply    # upsert into Supabase, then read back the count

Credentials: olympiad/.env (SUPABASE_URL, SUPABASE_SECRET_KEY).
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CARDS_DIR = ROOT / "data" / "idea_cards"

AREAS = {"algebra", "combinatorics", "geometry", "number_theory"}
FIELDS = ["source_ref", "area", "title", "key_idea", "surprise", "reformulation",
          "techniques", "prerequisites", "ladder_seeds", "difficulty", "notes"]


def load_cards():
    cards = []
    for path in sorted(CARDS_DIR.glob("*.json")):
        for card in json.loads(path.read_text()):
            cards.append({k: card.get(k) for k in FIELDS})
    return cards


def validate(cards):
    refs = [c["source_ref"] for c in cards]
    assert len(set(refs)) == len(refs), "duplicate source_ref"
    for c in cards:
        for k in ("source_ref", "area", "title", "key_idea"):
            assert c[k], f"{c['source_ref']}: missing {k}"
        assert c["area"] in AREAS, f"{c['source_ref']}: bad area {c['area']}"
        assert c["difficulty"] is None or 1 <= c["difficulty"] <= 10, f"{c['source_ref']}: bad difficulty"
        for seed in c["ladder_seeds"] or []:
            assert seed.get("level") and seed.get("idea"), f"{c['source_ref']}: bad ladder seed"


def supabase_session():
    import requests

    env = {}
    for line in (ROOT / ".env").read_text().splitlines():
        if "=" in line and not line.strip().startswith("#"):
            k, v = line.split("=", 1)
            env[k.strip()] = v.strip().strip('"')
    url = env["SUPABASE_URL"].rstrip("/") + "/rest/v1/idea_cards"
    key = env["SUPABASE_SECRET_KEY"]
    http = requests.Session()
    http.headers.update({"apikey": key, "Authorization": f"Bearer {key}",
                         "Content-Type": "application/json"})
    try:
        r = http.get(url, params={"select": "id", "limit": 1}, timeout=15)
    except requests.exceptions.ConnectionError:
        sys.exit(f"Cannot reach {env['SUPABASE_URL']}. Is the Supabase project paused?")
    if r.status_code == 404:
        sys.exit("Table public.idea_cards does not exist. Run supabase/sql/idea_cards.sql "
                 "in the Supabase SQL Editor first.")
    r.raise_for_status()
    return http, url


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--apply", action="store_true", help="upsert into Supabase")
    args = ap.parse_args()

    cards = load_cards()
    validate(cards)
    by_area = {}
    for c in cards:
        by_area[c["area"]] = by_area.get(c["area"], 0) + 1
    print(f"{len(cards)} cards: " + ", ".join(f"{a} {n}" for a, n in sorted(by_area.items())))
    if not args.apply:
        print("Preview only. Run with --apply to upload.")
        return

    http, url = supabase_session()
    now = datetime.now(timezone.utc).isoformat()
    rows = [{**c, "updated_at": now} for c in cards]
    for i in range(0, len(rows), 100):  # batches keep each request small
        r = http.post(url, params={"on_conflict": "source_ref"}, data=json.dumps(rows[i:i + 100]),
                      headers={"Prefer": "resolution=merge-duplicates,return=minimal"}, timeout=120)
        if r.status_code >= 300:
            sys.exit(f"Upload failed: HTTP {r.status_code} {r.text}")

    r = http.get(url, params={"select": "area,status"}, timeout=30)
    r.raise_for_status()
    rows = r.json()
    print(f"Uploaded. idea_cards now has {len(rows)} rows "
          f"({sum(1 for x in rows if x['status'] == 'draft')} draft).")


if __name__ == "__main__":
    main()
