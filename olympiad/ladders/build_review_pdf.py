"""
Build a review PDF from a ladder draft (e.g. LADDERS_v0.3_draft.md): problems first, then an answer key, then
solutions and notes, so answers can be checked without seeing them first.

Usage (from olympiad/):
  python3 ladders/build_review_pdf.py ladders/LADDERS_v0.3_draft.md ladders/review_v0.3.pdf

Needs Google Chrome (used headless to print the HTML page). The HTML is written next to the PDF.
"""

import html
import re
import subprocess
import sys
from pathlib import Path

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

CSS = """
@page { size: A4; margin: 18mm 16mm 18mm 16mm; }
body { font-family: Charter, 'Times New Roman', serif; font-size: 10.5pt; line-height: 1.45; color: #111; font-variant-numeric: lining-nums; }
h1, h2, h3, .meta, table, .tag { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; }
h1 { font-size: 20pt; margin: 0 0 4mm; }
h2 { font-size: 14pt; margin: 0 0 3mm; border-bottom: 1px solid #999; padding-bottom: 1.5mm; }
h3 { font-size: 11.5pt; margin: 5mm 0 2mm; }
.part { page-break-before: always; }
.ladder { page-break-inside: avoid; margin-bottom: 6mm; }
.sol { margin-bottom: 6mm; }
.meta { color: #555; font-size: 9pt; }
.setup { margin: 1mm 0 2mm; }
ol.problems { margin: 0; padding-left: 0; list-style: none; }
ol.problems li { margin: 1.2mm 0; display: grid; grid-template-columns: 24mm 1fr; gap: 2mm; }
.tag { font-size: 8pt; color: #444; border: 1px solid #bbb; border-radius: 2px; padding: 0.3mm 1.2mm; height: fit-content; text-align: center; }
.tag.ch { border-color: #111; color: #111; font-weight: 600; }
table { border-collapse: collapse; font-size: 9pt; width: 100%; }
th, td { border: 1px solid #ccc; padding: 1mm 1.5mm; text-align: left; vertical-align: top; }
th { background: #f2f2f2; }
ul { margin: 1mm 0; padding-left: 5mm; }
li { margin: 0.6mm 0; }
h4 { font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif; font-size: 10pt; margin: 4mm 0 1.5mm; }
ol.flow { padding-left: 5mm; } ol.flow li { margin: 1.2mm 0; }
.internal { background: #f6f6f6; border-left: 2px solid #999; padding: 1mm 2mm; font-size: 9pt; }
"""


def inline(text):
    text = html.escape(text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<i>\1</i>", text)
    text = re.sub(r"`(.+?)`", r"<code>\1</code>", text)
    return text


def paragraph_after(block, label):
    """The paragraph that starts with **label** (joined over its wrapped lines), without the label."""
    m = re.search(r"^\*\*" + re.escape(label) + r"\*\*(.*?)(?=\n\s*\n|\Z)", block, flags=re.M | re.S)
    return " ".join(line.strip() for line in m.group(1).splitlines()).strip(" :") if m else ""


def section(body, label):
    """Text after the bold header **label** (rest of that line included) up to the next bold header paragraph."""
    m = re.search(r"^\*\*" + re.escape(label) + r"\*\*(.*?)(?=\n\s*\n\*\*|\Z)", body, flags=re.M | re.S)
    text = m.group(1).strip() if m else ""
    return re.sub(r"^\*\([^)]*\)\*\s*", "", text)  # the header's own "(members only)" note is shown as a tag


def blocks(text):
    """Bullets ("- "), numbered items ("1. ") and plain paragraphs -> HTML."""
    if re.search(r"^\s*- ", text, flags=re.M):
        first, _, rest = text.partition("\n- ")
        head = "" if text.lstrip().startswith("- ") else first
        body = text if text.lstrip().startswith("- ") else "- " + rest
        return (f"<p>{inline(head)}</p>" if head.strip() else "") + bullets(body)
    if re.search(r"^\d+\. ", text, flags=re.M):
        items = re.split(r"^\d+\. ", text, flags=re.M)
        lead = items[0].strip()
        lis = "".join(f"<li>{inline(' '.join(x.split()))}</li>" for x in items[1:])
        return (f"<p>{inline(lead)}</p>" if lead else "") + f"<ol class='flow'>{lis}</ol>"
    return "".join(f"<p>{inline(' '.join(par.split()))}</p>" for par in re.split(r"\n\s*\n", text) if par.strip())


def bullets(text):
    """Markdown bullets with one level of nesting -> HTML."""
    out, depth = [], 0
    for line in text.splitlines():
        m = re.match(r"^(\s*)- (.*)$", line)
        if m:
            level = 1 if len(m.group(1)) >= 2 else 0
            while depth < level + 1:
                out.append("<ul>")
                depth += 1
            while depth > level + 1:
                out.append("</ul>")
                depth -= 1
            out.append(f"<li>{inline(m.group(2))}")
        elif line.strip() and out:
            out[-1] += " " + inline(line.strip())
    out += ["</ul>"] * depth
    return "\n".join(out)


def parse(md):
    ladders = []
    for block in re.split(r"^### Ladder ", md, flags=re.M)[1:]:
        head, body = block.split("\n", 1)
        key, name = [x.strip() for x in head.split("—", 1)]
        body = body.split("\n---")[0]
        rows = []
        for m in re.finditer(r"^\| (.+?) \| (.+?) \| (.+) \| \*\*(.+?)\*\* \|$", body, flags=re.M):
            step, level, problem, answer = m.groups()
            if step in ("Step", "---"):
                continue
            rows.append({"step": step.replace("**", ""), "level": level, "problem": problem, "answer": answer})
        ladders.append({
            "key": key, "name": name,
            "card": paragraph_after(body, "Idea card:"),
            "setup": paragraph_after(body, "Setup:"),
            "rows": rows,
            "solutions": section(body, "Short solutions"),
            "explore": " ".join(section(body, "Explore").split()),
            "field": paragraph_after(body, "Research field:"),
            # solution-path ladders (LADDER_RULES_v2.md); empty for older drafts
            "analysis": section(body, "Problem analysis"),
            "flow": section(body, "Logic flow"),
            "full_solution": section(body, "Our full solution"),
            "similar_olympiad": section(body, "Similar olympiad problems"),
            "similar_site": section(body, "Similar problems on our site"),
            "proof": section(body, "Proof problem"),
            "level_check": section(body, "Level check"),  # internal: why each step has its level (LEVEL_GUIDE.md)
        })
    return ladders


def build_html(md, title):
    ladders = parse(md)
    n_problems = sum(len(l["rows"]) for l in ladders)
    date = re.search(r"^- Date: (.+)$", md, flags=re.M)
    assessment = re.search(r"^## Assessment.*?\n(.*)$", md, flags=re.M | re.S)
    out = [f"<!doctype html><html><head><meta charset='utf-8'><title>{html.escape(title)}</title>",
           f"<style>{CSS}</style></head><body>"]

    # Cover
    out.append(f"<h1>{html.escape(title)}</h1>")
    out.append(f"<p class='meta'>{html.escape(date.group(1) if date else '')} · {len(ladders)} ladders · "
               f"{n_problems} problems · internal review copy, not for students</p>")
    out.append("<p>Part 1 has the problems only. Try them before looking at Part 2 (answer key) and Part 3 "
               "(solutions, idea cards and how each answer was checked by computer).</p>")
    out.append("<table><tr><th>Ladder</th><th>Name</th><th>Steps</th><th>Idea card (internal)</th></tr>")
    for l in ladders:
        card = " + ".join(re.findall(r"SL\d{4}-[ACGN]\d+", l["card"])) or l["card"].split(" (")[0]
        out.append(f"<tr><td>{l['key']}</td><td>{inline(l['name'])}</td><td>{len(l['rows']) - 1} + Challenge</td>"
                   f"<td>{inline(card)}</td></tr>")
    out.append("</table>")

    # Part 1: problems
    out.append("<div class='part'><h2>Part 1 — Problems</h2>")
    for l in ladders:
        out.append(f"<div class='ladder'><h3>Ladder {l['key']} — {inline(l['name'])}</h3>")
        if l["setup"]:
            out.append(f"<p class='setup'>{inline(l['setup'])}</p>")
        out.append("<ol class='problems'>")
        for r in l["rows"]:
            ch = r["step"] == "Challenge"
            label = "Challenge" if ch else f"Step {r['step']}"
            out.append(f"<li><span class='tag{' ch' if ch else ''}'>{label}<br>{inline(r['level'])}</span>"
                       f"<span>{inline(r['problem'])}</span></li>")
        out.append("</ol></div>")
    out.append("</div>")

    # Part 2: answer key
    most = max((len(l["rows"]) - 1 for l in ladders), default=5)
    out.append("<div class='part'><h2>Part 2 — Answer key</h2><table><tr><th>Ladder</th>"
               + "".join(f"<th>{i}</th>" for i in range(1, most + 1)) + "<th>Challenge</th></tr>")
    for l in ladders:
        steps = {r["step"]: r["answer"] for r in l["rows"]}
        cells = [inline(steps.get(str(i), "")) for i in range(1, most + 1)] + [f"<b>{inline(steps.get('Challenge', ''))}</b>"]
        out.append(f"<tr><td>{l['key']}</td>" + "".join(f"<td>{c}</td>" for c in cells) + "</tr>")
    out.append("</table><p class='meta'>Every answer is recomputed by the verification script that goes with the "
               "draft (see the draft's header).</p></div>")

    # Part 3: solutions
    out.append("<div class='part'><h2>Part 3 — Solutions and notes</h2>")
    for l in ladders:
        out.append(f"<div class='sol'><h3>Ladder {l['key']} — {inline(l['name'])}</h3>")
        out.append(f"<p class='internal'><b>Idea card (internal):</b> {inline(l['card'])}</p>")
        # Solution-path ladders: analysis and flow (members only on the site), then our full solution
        if l["analysis"]:
            out.append("<h4>Problem analysis <span class='tag'>members only</span></h4>" + blocks(l["analysis"]))
        if l["flow"]:
            out.append("<h4>Logic flow <span class='tag'>members only</span></h4>" + blocks(l["flow"]))
        if l["full_solution"]:
            out.append("<h4>Our full solution</h4>" + blocks(l["full_solution"]))
        if l.get("level_check"):
            out.append("<h4>Level check <span class='tag'>internal</span></h4>" + blocks(l["level_check"]))
        if l["analysis"] or l["flow"]:
            out.append("<h4>Short solutions of the steps</h4>")
        out.append(bullets(l["solutions"]))
        for key, label in (("similar_olympiad", "Similar olympiad problems"), ("similar_site", "Similar problems on our site")):
            if l[key]:
                out.append(f"<h4>{label}</h4>" + blocks(l[key]))
        if l["explore"]:
            out.append(f"<p><b>Explore</b> {inline(l['explore'])}</p>")
        if l["proof"]:
            out.append("<h4>Proof problem (not graded)</h4>" + blocks(l["proof"]))
        if l["field"]:
            out.append(f"<p class='meta'>Research field: {inline(l['field'])}</p>")
        out.append("</div>")
    out.append("</div>")

    if assessment:
        out.append("<div class='part'><h2>Assessment</h2>" + bullets(assessment.group(1)) + "</div>")
    out.append("</body></html>")
    return "\n".join(out)


def main():
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    src, pdf = Path(sys.argv[1]), Path(sys.argv[2]).resolve()
    md = src.read_text()
    title = re.search(r"^# (.+)$", md, flags=re.M).group(1).split(" — ")[0]
    page = pdf.with_suffix(".html")
    page.write_text(build_html(md, title))
    subprocess.run([CHROME, "--headless", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={pdf}", page.as_uri()], check=True, capture_output=True)
    print(f"Wrote {pdf} ({pdf.stat().st_size // 1024} KB) and {page.name}")


if __name__ == "__main__":
    main()
