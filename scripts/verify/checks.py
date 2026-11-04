"""
L0 format checks for problems as stored in Supabase (problems, solutions, problem_hierarchies, problem_hints).

Pure functions, no database or network access, so they can be tested on their own.
Every check returns Issue(rule, severity, message). Severity: "fail" (must be fixed before approval),
"warn" (a reviewer should look), "info" (for the report only).

Rules come from: OPERATING_POLICY 2.3 (categories), LADDER_RULES_v2 5.4 (standalone steps) and 5.9 (every fact
with its reason), olympiad/ladders/LEVEL_GUIDE.md (contest labels; AIME answers are whole numbers 0-999), and
Mookwon's work log 2026-10-25 §8.2 (two answer sentences).
"""

import hashlib
import json
import re
from dataclasses import dataclass, asdict
from fractions import Fraction

# Contest labels a step can carry (stored as a tag by the ladder importers) and their site difficulty.
# Same table as DIFFICULTY_BY_LEVEL in olympiad/ladders/import_ladders.py.
CONTEST_DIFFICULTY = {
    "kangaroo": 2,
    "kangaroo / mathcounts": 3,
    "mathcounts": 4,
    "amc 8 / mathcounts": 4,
    "amc 8": 5,
    "amc 8–10": 6,
    "amc 10": 6,
    "amc 12": 7,
    "aime": 8,
    "aime / junior olympiad": 8,
}

# The AIME rule (LEVEL_GUIDE) was introduced on 2026-10-24; problems created before are only warned.
AIME_RULE_SINCE = "2026-10-24"


@dataclass
class Issue:
    rule: str
    severity: str  # fail | warn | info
    message: str

    def to_dict(self):
        return asdict(self)


# ---- answers: the same parsing as src/lib/answers.ts (the site's Check button) ------------------------------------
_SPACES = re.compile(r"[\s   ,]")
_FRAC_LATEX = re.compile(r"^(-?)\\[dt]?frac\{(-?)(\d+)\}\{(\d+)\}$")
_ANSWER_LINE = re.compile(r"^\s*\**\s*Answer\s*:\s*\**\s*(.+?)\s*\**\s*\.?\s*$", re.I)


def parse_number(raw):
    """Fraction for a whole number, fraction (27/10, \\frac{27}{10}) or decimal; None otherwise. Mirrors parseNumber."""
    s = _SPACES.sub("", raw)
    s = re.sub(r"[−–]", "-", s)
    s = re.sub(r"^\$|\$$", "", s)
    s = _FRAC_LATEX.sub(lambda m: f"{'' if m.group(1) == m.group(2) else '-'}{m.group(3)}/{m.group(4)}", s)
    m = re.match(r"^(-?)(\d+)/(\d+)$", s)
    if m:
        if int(m.group(3)) == 0:
            return None
        return Fraction((-1 if m.group(1) else 1) * int(m.group(2)), int(m.group(3)))
    m = re.match(r"^(-?)(\d+)(?:\.(\d+))?$", s)
    if m:
        frac = m.group(3) or ""
        return Fraction((-1 if m.group(1) else 1) * int(m.group(2) + frac), 10 ** len(frac))
    return None


def stored_answer(solutions):
    """(raw text after 'Answer:', parsed value or None, whether any 'Answer:' line exists). Mirrors storedAnswer."""
    raw_seen = None
    for sol in sorted(solutions, key=lambda s: s.get("sequence_order") or 0):
        first = (sol.get("content") or "").split("\n")[0]
        m = _ANSWER_LINE.match(first)
        if m:
            raw_seen = raw_seen or m.group(1)
            value = parse_number(m.group(1))
            if value is not None:
                return m.group(1), value, True
    return raw_seen, None, raw_seen is not None


def show(value):
    if value is None:
        return "-"
    return str(value.numerator) if value.denominator == 1 else f"{value.numerator}/{value.denominator}"


# ---- small helpers -------------------------------------------------------------------------------------------------
def contest_label(problem):
    """The contest label from the tags (e.g. 'AMC 8'), or None."""
    for tag in reversed(problem.get("tags") or []):
        if isinstance(tag, str) and tag.strip().lower() in CONTEST_DIFFICULTY:
            return tag.strip()
    return None


def ladder_part(title):
    """('Name', 'Step 3' | 'Challenge' | 'Bridge') for ladder titles 'Name — Step 3', else (None, None)."""
    if " — " not in (title or ""):
        return None, None
    name, part = title.rsplit(" — ", 1)
    if part == "Challenge" or part == "Bridge" or re.match(r"^Step \d+$", part):
        return name.strip(), part
    return None, None


def content_hash(problem, solutions):
    """Fingerprint of what students see and what is checked: changes when text, level or answer changes."""
    payload = {
        "title": problem.get("title"),
        "content": problem.get("content"),
        "difficulty": problem.get("difficulty"),
        "level": problem.get("level"),
        "tags": problem.get("tags"),
        "solutions": [(s.get("sequence_order"), s.get("content")) for s in
                      sorted(solutions, key=lambda s: (s.get("sequence_order") or 0, s.get("content") or ""))],
    }
    return hashlib.sha256(json.dumps(payload, ensure_ascii=False, sort_keys=True).encode()).hexdigest()


# ---- problem checks ------------------------------------------------------------------------------------------------
KNOWN_THAT = re.compile(r"\bit is (?:well[- ])?known that\b", re.I)
STEP_REFERENCE = re.compile(
    r"\b(?:your|the) answer (?:from|to|in|of) (?:step|the previous step|part)\b|\bfrom step \d+\b|\bin step \d+ you\b",
    re.I)
SINGLE_NUMBER = re.compile(r"answer with a single number", re.I)
AS_FRACTION = re.compile(r"(?:give|write|express) (?:your|the) answer as a fraction", re.I)


def check_problem(problem, solutions, hints=None):
    issues = []
    title = (problem.get("title") or "").strip()
    content = (problem.get("content") or "").strip()
    _, part = ladder_part(title)
    is_ladder = part is not None or "ladder" in [str(t).lower() for t in (problem.get("tags") or [])]

    if not title or not content:
        issues.append(Issue("EMPTY_TEXT", "fail", "제목 또는 본문이 비어 있음"))

    difficulty = problem.get("difficulty")
    if not isinstance(difficulty, int) or not 1 <= difficulty <= 10:
        issues.append(Issue("DIFFICULTY_RANGE", "fail", f"난이도가 1–10 정수가 아님: {difficulty!r}"))

    raw, value, has_line = stored_answer(solutions)
    if not solutions:
        issues.append(Issue("NO_SOLUTION", "fail", "풀이(solutions)가 없음"))
    elif has_line and value is None:
        issues.append(Issue("ANSWER_UNPARSEABLE", "fail",
                            f"'Answer:' 줄을 숫자로 읽을 수 없음: {raw!r} (Check 버튼이 동작하지 않음)"))
    elif not has_line:
        issues.append(Issue("NO_NUMBER_ANSWER", "fail" if is_ladder else "warn",
                            "풀이 첫 줄에 'Answer: 숫자'가 없음" + (" (사다리 문제는 숫자 정답 필수)" if is_ladder else
                                                            " (서술형·증명 문제면 정상)")))

    label = contest_label(problem)
    if is_ladder and label is None:
        issues.append(Issue("CONTEST_LABEL_MISSING", "warn", "대회 라벨(Kangaroo … AIME) 태그가 없음"))
    if label is not None and isinstance(difficulty, int):
        expected = CONTEST_DIFFICULTY[label.lower()]
        if difficulty != expected:
            issues.append(Issue("LABEL_DIFFICULTY", "warn",
                                f"라벨 {label}의 난이도는 {expected}인데 저장된 난이도는 {difficulty}"))
    if label is not None and label.lower().startswith("aime") and value is not None:
        if value.denominator != 1 or not 0 <= value.numerator <= 999:
            new = (problem.get("created_at") or "") >= AIME_RULE_SINCE
            issues.append(Issue("AIME_RANGE", "fail" if new else "warn",
                                f"AIME 라벨인데 정답이 0–999 정수가 아님: {show(value)}"
                                + ("" if new else " (규칙 도입 전 문제)")))

    if KNOWN_THAT.search(content):
        issues.append(Issue("KNOWN_THAT", "warn", "'It is known that' 표현: 이유를 함께 제시해야 함 (규칙 5.9)"))
    if STEP_REFERENCE.search(content):
        issues.append(Issue("STEP_REFERENCE", "warn", "다른 단계의 답을 가리키는 표현: 단계는 독립적이어야 함 (규칙 5.4)"))
    singles = len(SINGLE_NUMBER.findall(content))
    if singles > 1 or (singles and AS_FRACTION.search(content)):
        issues.append(Issue("ANSWER_SENTENCE", "warn",
                            "정답 안내 문장이 두 번 나옴 (예: 'as a fraction' + 'single number', 10-25 §8.2)"))

    if problem.get("category_level3") is None:
        issues.append(Issue("CATEGORY_MISSING", "warn", "세부 카테고리(category_level3)가 없음 (운영 정책 2.3)"))

    if value is not None and hints:
        answer_text = show(value)
        for hint in hints:
            text = hint.get("content") or hint.get("hint") or hint.get("text") or ""
            if len(answer_text) >= 2 and re.search(rf"(?<![\d/]){re.escape(answer_text)}(?![\d/])", text):
                issues.append(Issue("HINT_LEAK", "warn", f"힌트에 정답({answer_text})이 그대로 있음"))
                break
    return issues


# ---- ladder checks (problem_hierarchies) --------------------------------------------------------------------------
def check_ladders(problems_by_id, answers_by_id, links):
    """{problem_id: [Issue]} for ladder-level problems: broken links, duplicate step order, duplicate answers."""
    out = {}
    children = {}
    for link in links:
        parent, child = link.get("parent_problem_id"), link.get("child_problem_id")
        for pid, role in ((parent, "상위"), (child, "하위")):
            if pid not in problems_by_id:
                out.setdefault(parent if pid == child else child, []).append(
                    Issue("BROKEN_LINK", "fail", f"사다리 연결의 {role} 문제가 DB에 없음: {pid}"))
        children.setdefault(parent, []).append(link)

    child_ids = {link.get("child_problem_id") for link in links}
    for root in [p for p in children if p not in child_ids and p in problems_by_id]:
        members, stack, seen = [root], [root], {root}
        while stack:
            for link in children.get(stack.pop(), []):
                cid = link.get("child_problem_id")
                if cid in problems_by_id and cid not in seen:
                    seen.add(cid)
                    members.append(cid)
                    stack.append(cid)

        orders = {}
        for link in children.get(root, []):
            orders.setdefault(link.get("sequence_order"), []).append(link.get("child_problem_id"))
        for order, ids in orders.items():
            if len(ids) > 1:
                for cid in ids:
                    out.setdefault(cid, []).append(
                        Issue("STEP_ORDER_DUPLICATE", "warn", f"같은 사다리에서 순서 번호 {order}가 겹침"))

        # The root of a ladder is its Challenge. A Challenge answer that equals a step answer can be guessed from the
        # steps (LADDER_RULES_v2 4.3): warn. Two steps sharing an answer (often small numbers) is only noted.
        by_value = {}
        for pid in members:
            value = answers_by_id.get(pid)
            if value is not None:
                by_value.setdefault(value, []).append(pid)
        for value, ids in by_value.items():
            if len(ids) > 1:
                names = ", ".join(sorted((problems_by_id[i].get("title") or "?").rsplit(" — ", 1)[-1] for i in ids))
                if root in ids:
                    issue = Issue("CHALLENGE_ANSWER_REPEATED", "warn",
                                  f"Challenge 정답 {show(value)}이 단계 정답과 같아 추측으로 맞힐 수 있음 ({names}, 규칙 4.3)")
                else:
                    issue = Issue("STEP_ANSWER_REPEATED", "info", f"단계끼리 정답 {show(value)}이 겹침 ({names})")
                for pid in ids:
                    out.setdefault(pid, []).append(issue)
    return out


def overall(issues):
    severities = {i.severity for i in issues}
    return "fail" if "fail" in severities else "warn" if "warn" in severities else "pass"
