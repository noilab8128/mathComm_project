"""
Import the problem ladders in ladders/LADDERS_v0.1.md into the app's existing tables
(problems, solutions, problem_hierarchies), in the same shape the admin page creates.
No app code or table definition is changed.

Each ladder becomes:
  - the Challenge            -> one `problems` row (root, is_generated = false)
  - every Step / Bridge      -> one `problems` row (is_generated = true), linked under the
                                Challenge in `problem_hierarchies` (sequence_order = step order,
                                depth = 2, parent_solution_id = the Challenge's solution)
  - answer + short solution  -> one `solutions` row per problem (students never see solutions)
  - related IMO problems, Explore, famous open problem, research field
                             -> end of the Challenge's solution (default), or of its problem text
                                with --endings content (visible to students; can give away the
                                Challenge answer for ladders B and D)

All rows get source = SOURCE, so they can be found and removed again.

Run (from olympiad/):
  python3 ladders/import_ladders.py                 # preview only: prints a summary, writes import_preview.json
  python3 ladders/import_ladders.py --apply         # insert into Supabase (skips ladders already imported)
  python3 ladders/import_ladders.py --remove        # delete every row this script inserted
  options: --only 0,A   --endings solution|content

Credentials: olympiad/.env (SUPABASE_URL, SUPABASE_SECRET_KEY).
"""

import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent
LADDERS_MD = HERE / "LADDERS_v0.1.md"
PREVIEW_JSON = HERE / "import_preview.json"

SOURCE = "MathQuest Ladders v0.1"
LICENSE = "Original (NOI.LAB)"

# Contest level in the ladder tables -> difficulty 1-10 (same scale as the admin page).
DIFFICULTY_BY_LEVEL = {
    "kangaroo": 2,
    "kangaroo / mathcounts": 3,
    "mathcounts": 4,
    "amc 8 / mathcounts": 4,
    "amc 8": 5,
    "amc 8–10": 6,
    "amc 10": 6,
    "aime": 8,
    "aime / junior olympiad": 8,
}

# Ladder key -> categories (ids and names from src/lib/categories.ts).
CATEGORIES = {
    "0": [(5, "Combinatorics & Discrete Mathematics"), (24, "Enumeration")],
    "A": [(4, "Number Theory"), (22, "Elementary Number Theory")],
    "B": [(4, "Number Theory"), (22, "Elementary Number Theory"), (83, "Diophantine Equations")],
    "C": [(4, "Number Theory"), (22, "Elementary Number Theory")],
    "D": [(2, "Geometry"), (15, "Analytic Geometry"), (61, "Coordinate Systems")],
    "E": [(4, "Number Theory"), (22, "Elementary Number Theory"), (83, "Diophantine Equations")],
    "F": [(4, "Number Theory"), (22, "Elementary Number Theory")],
}


# Steps written as follow-ups in the ladder table ("On a 4 × 4 grid?") must stand alone once each
# step is its own problem on the site.
FULL_QUESTION = {
    ("D", "2"): "On a 4 × 4 grid of points, what is the largest number of dots?",
    ("D", "3"): "On a 5 × 5 grid of points, what is the largest number of dots?",
    ("D", "Challenge"): "On a 10 × 10 grid of points, what is the largest number of dots?",
    ("C", "2"): "How many steps does 87 take to become a palindrome?",
}


def difficulty_label(difficulty):
    """Same rule as getDifficultyLabel in src/lib/supabase.ts."""
    if difficulty <= 3:
        return "Easy"
    if difficulty <= 6:
        return "Medium"
    if difficulty <= 9:
        return "Hard"
    return "Olympiad"


# ---------------------------------------------------------------------------
# Markdown -> plain text. The site shows problem text as plain text (line breaks kept)
# and renders only $...$ with MathJax, so markdown syntax must be removed.
# ---------------------------------------------------------------------------

def plain(text):
    text = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", text)      # links
    text = text.replace("**", "")
    text = re.sub(r"(?<![\w*])\*([^*\n]+)\*(?![\w*])", r"\1", text)  # *italic*
    text = text.replace("`", "")
    text = re.sub(r"(\d+)\^(\d+)", r"$\1^{\2}$", text)      # 2^71 -> MathJax
    return text.strip()


def table_rows(lines):
    rows = []
    for line in lines:
        line = line.strip()
        if not line.startswith("|") or re.match(r"^\|[\s|:-]+\|$", line):
            continue
        rows.append([plain(c) for c in line.strip("|").split("|")])
    return rows


def paragraphs_to_plain(lines):
    """Plain text for a block that may mix paragraphs, bullets and tables."""
    out, table = [], []
    for line in lines + [""]:
        if line.strip().startswith("|"):
            table.append(line)
            continue
        if table:
            out.extend("  |  ".join(r) for r in table_rows(table))
            table = []
        if line.strip().startswith("```"):
            continue
        out.append(re.sub(r"^(\s*)- ", r"\1• ", line.rstrip()))
    return plain("\n".join(out)).replace("\n\n\n", "\n\n")


# ---------------------------------------------------------------------------
# Parse LADDERS_v0.1.md
# ---------------------------------------------------------------------------

SECTION_MARKERS = [
    ("dna", r"^\*\*DNA source"),
    ("setup", r"^\*\*(Rule|Setup)"),
    ("steps", r"^\| Step \|"),
    ("solutions", r"^\*\*Short solutions"),
    ("related", r"^\*\*Related Olympiad problems"),
    ("explore", r"^\*\*Explore"),
    ("open", r"^\*\*Famous open problem"),
    ("field", r"^\*\*Research field"),
]


def split_ladders(md):
    body = md.split("## 5. Ladders", 1)[1].split("## 6.", 1)[0]
    blocks = re.split(r"^### Ladder ", body, flags=re.M)[1:]
    for block in blocks:
        head, rest = block.split("\n", 1)
        key, name = [s.strip() for s in head.split("—", 1)]
        yield key, name, rest.strip().rstrip("-").strip()


def sections(block):
    current, out = None, {}
    for line in block.splitlines():
        for name, pattern in SECTION_MARKERS:
            if re.match(pattern, line):
                current = name
                break
        if current:
            out.setdefault(current, []).append(line)
    return out


def step_keys(label, all_keys):
    """'Step 2' / 'Steps 1–3' / 'Steps 4 and Challenge' / 'Challenge' -> keys; else None."""
    keys = []
    for a, b in re.findall(r"(\d+)\s*[–-]\s*(\d+)", label):
        keys += [str(n) for n in range(int(a), int(b) + 1)]
    label_wo_ranges = re.sub(r"\d+\s*[–-]\s*\d+", "", label)
    if re.match(r"^Steps?\b", label):
        keys += re.findall(r"\b(\d+)\b", label_wo_ranges)
    if "Challenge" in label:
        keys.append("Challenge")
    if "Bridge" in label:
        keys.append("Bridge")
    keys = [k for k in keys if k in all_keys]
    return keys or None


def parse_solutions(lines, all_keys):
    """Top-level '- Label: text' bullets (with their continuation lines) -> {step key: text}."""
    bullets, current, in_code = [], None, False
    for line in lines[1:]:
        if line.startswith("```"):
            in_code = not in_code
        if line.startswith("- ") and not in_code:
            current = [line[2:]]
            bullets.append(current)
        elif current is not None and (in_code or line.startswith("  ") or line.startswith("```")
                                      or not line.strip()):
            current.append(line)
    by_step = {}
    for bullet in bullets:
        label, _, text = bullet[0].partition(":")
        targets = step_keys(label, all_keys) or ["Challenge"]
        rest = [ln[2:] if ln.startswith("  ") else ln for ln in bullet[1:]]
        body = paragraphs_to_plain([text.strip()] + rest)
        body = body[:1].upper() + body[1:]
        if not step_keys(label, all_keys):
            body = f"{plain(label)}: {body}"
        for key in targets:
            by_step.setdefault(key, []).append(body)
    return {k: "\n\n".join(v) for k, v in by_step.items()}


def parse_ladder(key, name, block):
    sec = sections(block)
    setup_lines = sec.get("setup", [])
    setup_label = re.match(r"^\*\*([^*]+?):?\*\*", setup_lines[0]).group(1) if setup_lines else None
    setup_text = None
    if setup_lines:
        first = re.sub(r"^\*\*[^*]+\*\*\s*", "", setup_lines[0])
        setup_text = paragraphs_to_plain([first] + setup_lines[1:])

    steps = []
    for row in table_rows(sec["steps"])[1:]:
        label, level, problem, answer = row[:4]
        steps.append({"label": label, "level": level, "problem": problem, "answer": answer})
    all_keys = [s["label"] for s in steps]

    related = sec.get("related", [])
    related_rows = table_rows(related)[1:]
    related_after = [ln for ln in related[1:] if ln.strip() and not ln.strip().startswith("|")]
    related_text = "\n".join([f"• {r[0]} ({r[1]}): {r[2]}" for r in related_rows]
                             + [paragraphs_to_plain(related_after)] if related_after else
                             [f"• {r[0]} ({r[1]}): {r[2]}" for r in related_rows])
    return {
        "key": key,
        "name": re.sub(r"^The ", "", name),
        "dna_source": plain(" ".join(sec.get("dna", [])).replace("**DNA source:**", "")),
        "setup_label": setup_label,
        "setup": setup_text,
        "steps": steps,
        "solutions": parse_solutions(sec.get("solutions", []), all_keys),
        "related_intro": plain(related[0].replace("**Related Olympiad problems**", "").strip(" —"))
        if related else "",
        "related": related_text,
        "explore_title": plain(sec["explore"][0]) if "explore" in sec else "",
        "explore": paragraphs_to_plain(sec["explore"][1:]) if "explore" in sec else "",
        "open_problem": paragraphs_to_plain(sec.get("open", [])),
        "research_field": plain(" ".join(sec.get("field", [])).replace("**Research field:**", "")),
    }


# ---------------------------------------------------------------------------
# Ladder -> rows
# ---------------------------------------------------------------------------

def endings_text(ladder):
    parts = ["Going further"]
    if ladder["related"]:
        intro = f" ({ladder['related_intro']})" if ladder["related_intro"] else ""
        parts.append(f"Related Olympiad problems{intro}:\n{ladder['related']}")
    if ladder["explore"]:
        parts.append(f"{ladder['explore_title']}\n{ladder['explore']}")
    if ladder["open_problem"]:
        parts.append(ladder["open_problem"])
    if ladder["research_field"]:
        parts.append(f"Research field: {ladder['research_field']}")
    return "\n\n".join(parts)


def build_rows(ladder, endings):
    cats = CATEGORIES[ladder["key"]]
    ids = [c[0] for c in cats] + [None] * (3 - len(cats))
    path = " > ".join(c[1] for c in cats)
    concepts = [re.sub(r"\s*\(.*?\)", "", c).strip() for c in ladder["research_field"].split(";")]

    problems = []
    for step in ladder["steps"]:
        is_challenge = step["label"] == "Challenge"
        difficulty = DIFFICULTY_BY_LEVEL[step["level"].lower()]
        title_part = "Challenge" if is_challenge else (
            "Bridge" if step["label"] == "Bridge" else f"Step {step['label']}")

        content = FULL_QUESTION.get((ladder["key"], step["label"]), step["problem"])
        if ladder["setup"]:
            content = f"{ladder['setup_label']}: {ladder['setup']}\n\n{content}"
        content += "\n\nAnswer with a single number."

        solution = f"Answer: {step['answer']}"
        if ladder["solutions"].get(step["label"]):
            solution += "\n\n" + ladder["solutions"][step["label"]]

        if is_challenge:
            if endings == "content":
                content += "\n\n" + endings_text(ladder)
            else:
                solution += "\n\n" + endings_text(ladder)

        problems.append({
            "step": step["label"],
            "problem": {
                "title": f"{ladder['name']} — {title_part}",
                "content": content,
                "difficulty": difficulty,
                "category_level1": ids[0],
                "category_level2": ids[1],
                "category_level3": ids[2],
                "category_path": path,
                "level": difficulty_label(difficulty),
                "tags": [c[1] for c in cats] + ["Ladder", ladder["name"], step["level"]],
                "concepts": concepts,
                "source": SOURCE,
                "license": LICENSE,
                "is_generated": not is_challenge,
                "is_reviewed": False,
            },
            "solution": {"content": solution, "sequence_order": 1},
        })

    challenge = next(p for p in problems if p["step"] == "Challenge")
    children = [p for p in problems if p["step"] != "Challenge"]
    hierarchy = [{
        "child_title": p["problem"]["title"],
        "stage_name": p["problem"]["title"].split(" — ", 1)[1],
        "sequence_order": i + 1,
        "depth": 2,
    } for i, p in enumerate(children)]
    return {"key": ladder["key"], "name": ladder["name"], "challenge": challenge,
            "children": children, "hierarchy": hierarchy}


def check(rows):
    problems = [rows["challenge"]] + rows["children"]
    for p in problems:
        assert p["problem"]["content"].strip(), p["problem"]["title"]
        assert re.match(r"^Answer: \S", p["solution"]["content"]), p["problem"]["title"]
        assert "**" not in p["problem"]["content"] + p["solution"]["content"], p["problem"]["title"]
    titles = [p["problem"]["title"] for p in problems]
    assert len(set(titles)) == len(titles), titles


# ---------------------------------------------------------------------------
# Supabase (REST, same credentials as scripts/load_dna_seed_v1.py)
# ---------------------------------------------------------------------------

class Supabase:
    def __init__(self):
        import requests

        env = {}
        for line in (ROOT / ".env").read_text().splitlines():
            if "=" in line and not line.strip().startswith("#"):
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip().strip('"')
        self.url = env["SUPABASE_URL"].rstrip("/") + "/rest/v1"
        key = env["SUPABASE_SECRET_KEY"]
        self.http = requests.Session()
        self.http.headers.update({"apikey": key, "Authorization": f"Bearer {key}",
                                  "Content-Type": "application/json"})
        try:
            self.http.get(f"{self.url}/problems?select=id&limit=1", timeout=15).raise_for_status()
        except requests.exceptions.ConnectionError:
            sys.exit(f"Cannot reach {env['SUPABASE_URL']}. Is the Supabase project paused? "
                     "Restore it in the Supabase dashboard and try again.")

    def _check(self, r, what):
        if r.status_code >= 300:
            raise RuntimeError(f"{what}: HTTP {r.status_code} {r.text}")
        return r

    def insert(self, table, row):
        r = self.http.post(f"{self.url}/{table}", data=json.dumps(row),
                           headers={"Prefer": "return=representation"}, timeout=30)
        return self._check(r, f"insert into {table}").json()[0]

    def titles_with_source(self):
        r = self.http.get(f"{self.url}/problems", params={"select": "id,title", "source": f"eq.{SOURCE}"},
                          timeout=30)
        return {row["title"]: row["id"] for row in self._check(r, "read problems").json()}

    def delete_problems(self, ids):
        # solutions and problem_hierarchies rows go too (ON DELETE CASCADE).
        if ids:
            r = self.http.delete(f"{self.url}/problems", params={"id": f"in.({','.join(ids)})"}, timeout=30)
            self._check(r, "delete problems")


def apply(db, ladders_rows):
    existing = db.titles_with_source()
    for rows in ladders_rows:
        if rows["challenge"]["problem"]["title"] in existing:
            print(f"  skip   Ladder {rows['key']} ({rows['name']}): already imported")
            continue
        created = []
        try:
            ch = db.insert("problems", rows["challenge"]["problem"])
            created.append(ch["id"])
            ch_sol = db.insert("solutions", {**rows["challenge"]["solution"], "problem_id": ch["id"]})
            ids = {}
            for child in rows["children"]:
                p = db.insert("problems", child["problem"])
                created.append(p["id"])
                ids[child["problem"]["title"]] = p["id"]
                db.insert("solutions", {**child["solution"], "problem_id": p["id"]})
            for h in rows["hierarchy"]:
                db.insert("problem_hierarchies", {
                    "parent_problem_id": ch["id"],
                    "parent_solution_id": ch_sol["id"],
                    "child_problem_id": ids[h["child_title"]],
                    "stage_name": h["stage_name"],
                    "sequence_order": h["sequence_order"],
                    "depth": h["depth"],
                })
            print(f"  added  Ladder {rows['key']} ({rows['name']}): {len(created)} problems")
        except Exception as exc:
            db.delete_problems(created)
            sys.exit(f"  FAILED Ladder {rows['key']}; rolled back its {len(created)} problem(s).\n  {exc}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    mode = ap.add_mutually_exclusive_group()
    mode.add_argument("--apply", action="store_true", help="insert into Supabase")
    mode.add_argument("--remove", action="store_true", help="delete every row this script inserted")
    ap.add_argument("--only", help="comma-separated ladder keys, e.g. 0,A")
    ap.add_argument("--endings", choices=["solution", "content"], default="solution",
                    help="where related problems / Explore / open problem go (default: solution)")
    args = ap.parse_args()

    if args.remove:
        db = Supabase()
        existing = db.titles_with_source()
        db.delete_problems(list(existing.values()))
        print(f"Removed {len(existing)} problems with source '{SOURCE}' (and their solutions and links).")
        return

    ladders = [parse_ladder(*b) for b in split_ladders(LADDERS_MD.read_text(encoding="utf-8"))]
    if args.only:
        wanted = {k.strip() for k in args.only.split(",")}
        ladders = [lad for lad in ladders if lad["key"] in wanted]
    all_rows = [build_rows(lad, args.endings) for lad in ladders]
    for rows in all_rows:
        check(rows)

    for rows in all_rows:
        print(f"Ladder {rows['key']} — {rows['name']}  "
              f"({len(rows['children'])} steps + Challenge, {rows['challenge']['problem']['category_path']})")
        for p in rows["children"] + [rows["challenge"]]:
            pr = p["problem"]
            print(f"    {pr['title']:<42} difficulty {pr['difficulty']:>2} ({pr['level']:<6})  "
                  f"{p['solution']['content'].splitlines()[0]}")

    if args.apply:
        print("\nWriting to Supabase...")
        apply(Supabase(), all_rows)
    else:
        PREVIEW_JSON.write_text(json.dumps(all_rows, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"\nPreview only — nothing written to Supabase. Full rows: {PREVIEW_JSON.relative_to(ROOT)}")
        print("Run with --apply to insert.")


if __name__ == "__main__":
    main()
