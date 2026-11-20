"""
Wording checks for ladder files, run before uploading (lessons of 2026-11-20, docs/PROBLEM_GENERATION.md section 4).
Each step is shown on the site on its own, with only the Setup above it, so it must make sense alone.

Errors (fix before uploading):
  - a step points to another step ("of Step 2", "the previous step")
  - raw LaTeX outside $...$ (x_{k+1}, x^a, \\frac): the site shows it as typed; use Unicode (xₖ₊₁, xᵃ, 3/8)
  - a fact handed over without its reason ("It is known that", "It turns out that"), rule 5.9
  - no "- Example:" hint in the ladder (hint 1 of every problem, decision 2026-11-20)
Warnings (read and decide):
  - "the same triangle / list / table / ..." in a step: fine only if the Setup defines it
  - a number in the Setup equals a step's answer (the Setup may give the answer away, as in Square Triples)

Run (from olympiad/):  python3 ladders/lint_ladders.py ladders/v2/LADDERS_v2_batch9.md [more files]
Hints may live in another file (ladders/v2/HINTS_v2.md for P1-P21); give it too and they are matched by ladder key.
Exit code 1 when there are errors.
"""

import re
import sys
from pathlib import Path

STEP_ROW = re.compile(r"^\| (\d+|\*\*Challenge\*\*) \| ([^|]+) \| (.+?) \| \*\*(.+?)\*\* \|", re.M)
OTHER_STEP = re.compile(r"\b(of|in|from|as in) Step \d|\bprevious step\b|\bearlier step\b|\bStep \d+'s\b", re.I)
RAW_LATEX = re.compile(r"\w_\{|\^\{|\\[a-zA-Z]+|\b[a-zA-Z]\^[a-zA-Z0-9]")
HANDED_OVER = re.compile(r"\b(it is known|it turns out|it can be shown|one can show)\b", re.I)
SAME_THING = re.compile(r"\b(the same|that) (triangle|list|table|grid|board|circle|points|setup|sequence|square|word)\b", re.I)
NUMBER = re.compile(r"(?<![\d/.])\d+(?:/\d+)?(?![\d/])")


def ladders(text):
    for block in re.split(r"^### Ladder ", text, flags=re.M)[1:]:
        head, body = block.split("\n", 1)
        yield head.split(" ", 1)[0], head, body.split("\n---")[0]


def without_math(s):
    return re.sub(r"\$[^$]*\$", "", s)


def main(files):
    texts = {f: Path(f).read_text(encoding="utf-8") for f in files}
    has_example = {key for t in texts.values() for key, _, body in ladders(t) if re.search(r"^- Example:", body, re.M)}
    errors = warnings = 0
    for f, text in texts.items():
        for key, head, body in ladders(text):
            rows = STEP_ROW.findall(body)
            if not rows:
                continue  # a hints-only block
            setup = re.search(r"\*\*Setup:\*\*(.+?)\n\n", body, re.S)
            setup = " ".join(setup.group(1).split()) if setup else ""
            found = []
            for where, txt in [("Setup", setup)] + [(f"{r[0].strip('*')}", r[2]) for r in rows]:
                plain = without_math(txt)
                if where != "Setup" and OTHER_STEP.search(plain):
                    found.append(("ERROR", where, f"points to another step: '{OTHER_STEP.search(plain).group(0)}'"))
                if RAW_LATEX.search(plain):
                    found.append(("ERROR", where, f"raw LaTeX outside $...$: '{RAW_LATEX.search(plain).group(0)}'"))
                if HANDED_OVER.search(plain):
                    found.append(("ERROR", where, f"fact without its reason: '{HANDED_OVER.search(plain).group(0)}'"))
                if where != "Setup" and SAME_THING.search(plain):
                    found.append(("warn ", where, f"'{SAME_THING.search(plain).group(0)}': is it defined in the Setup?"))
            setup_numbers = set(NUMBER.findall(setup))
            for r in rows:
                answer = r[3].replace(" ", "").lstrip("-")
                # one-digit answers are too common to mean anything
                if (len(answer) > 1 or "/" in answer) and answer in setup_numbers:
                    found.append(("warn ", r[0].strip("*"), f"its answer {r[3]} appears in the Setup"))
            if key not in has_example:
                found.append(("ERROR", "Hints", "no '- Example:' line"))
            for level, where, msg in found:
                print(f"{level} {head[:34]:34} {where:9} {msg}")
                errors += level == "ERROR"
                warnings += level == "warn "
    print(f"{errors} error(s), {warnings} warning(s)")
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
