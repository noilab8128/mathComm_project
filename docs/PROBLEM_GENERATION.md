# 문제 생성 방법

- 작성: 2026-10-21
- 수정: 2026-11-20. 단계 문장 점검(3.3, 4장), 예시 힌트(3.4), 이미 올라간 문제 고치기·지우기(6.2–6.4)를 더함
- 대상: Math Quest 사다리 문제 (지금 사이트의 48개 사다리, 238문제와 앞으로 만들 문제)
- 자세한 규칙: [LADDER_RULES_v2.md](../olympiad/ladders/LADDER_RULES_v2.md) (영어, 규칙 원문)
- 관련: [OPERATING_POLICY.md](OPERATING_POLICY.md) 6.5–6.6, [SKILL_TREE_RULES.md](SKILL_TREE_RULES.md) 2.3,
  문제 검증 계획(`Archive/docs/PROBLEM_VERIFICATION_PLAN.md`)

이 문서는 문제가 **어디서 시작해서, 어떤 순서로 만들어지고, 어떻게 확인되어, 어떻게 사이트에 올라가는지**를
정리합니다. 규칙의 근거와 세부 조건은 LADDER_RULES_v2.md에 있고, 여기서는 전체 흐름과 실제로 쓰는 파일·명령을
설명합니다.

---

## 1. 한눈에 보기

```
IMO Shortlist 문제·공식 풀이
        │  ① 핵심 아이디어만 뽑기 (문장은 가져오지 않음)
        ▼
아이디어 카드 (내부용, 524장)
        │  ② 카드 1장 이상 → 새 Challenge 설계, 직접 풀기
        ▼
Challenge + 우리 풀이 → 문제 분석 → 풀이 흐름 → 단계 문제 (흐름의 한 단계 = 단답형 문제 1개)
        │  ③ 모든 답과 숫자를 컴퓨터로 확인 (verify 스크립트)
        ▼
힌트 · 링크 · 증명 문제 · 세부 분야 · 이론 카드
        │  ④ 검토용 PDF → 사람 검토
        ▼
Supabase에 올리기 (import 스크립트) → 사이트
```

| 단계 | 결과물 | 파일·도구 |
|---|---|---|
| ① 아이디어 카드 | 문제 하나의 핵심 아이디어를 우리 말로 정리한 카드 | `olympiad/data/idea_cards/` (git 제외), Supabase `idea_cards` |
| ② 사다리 설계 | Challenge, 풀이, 분석, 흐름, 단계, 힌트, 링크 | `olympiad/ladders/v2/LADDERS_v2_batchN.md` |
| ③ 검증 | 모든 답과 숫자 재계산, 문장 점검, 예시 힌트 숫자 확인 | `verify_v2_batchN.py`, `lint_ladders.py`, `verify_hint_examples.py` |
| ④ 사람 검토 | 문제 → 정답표 → 풀이 순서의 PDF | `olympiad/ladders/build_review_pdf.py` |
| ⑤ 올리기 | 문제, 정답, 단계 연결, 분석·흐름, 링크, 힌트 | `import_ladders_v2.py`(새 사다리만), `import_guides_hints.py --hints-only` |
| 고치기 | 이미 올라간 문제의 문장 | `patch_live_text.py` (6.2장) |

---

## 2. ① 아이디어 카드

**출처:** IMO Shortlist 2006–2024의 문제와 공식 풀이(`problem.txt`, `solutions.txt`). 공식 풀이가 있는 자료만
씁니다.

**카드에 들어가는 것**

| 항목 | 내용 | 근거 |
|---|---|---|
| `key_idea` | 풀이의 핵심 한 수, 우리 말로 | 공식 풀이를 읽고 다시 씀 |
| `surprise` | 왜 놀라운지 | 우리 판단 |
| `reformulation` | 문제를 다르게 보는 방법 | 우리 판단 |
| `techniques`, `prerequisites` | 쓰는 기법, 미리 알아야 할 것 | 공식 풀이 + 우리 판단 |
| `difficulty` | 1–10 | 우리 판단 |
| `ladder_seeds` | 쉬운 문제 아이디어 3–5개 | 우리가 새로 만듦 |
| 사다리 적합도 | good / fair / poor | 우리 판단 (증명만 있는 문제는 poor) |

**규칙**
- **아이디어만 가져오고 문장은 가져오지 않습니다.** 저작권은 표현을 보호하고 수학적 아이디어는 보호하지 않습니다.
- 카드 안의 예시 숫자는 모두 스크립트로 계산합니다.
- **이해하지 못한 풀이는 건너뜁니다.** 건너뛴 문제와 이유는 `SKIPPED.md`에 남깁니다.
- 카드 파일은 출처 문제 번호가 들어 있어서 **공개 저장소에 올리지 않습니다**(git 제외). Supabase `idea_cards`는
  읽기 정책이 없어 사이트에서 읽을 수 없습니다.

**현재:** 524장 작성, 47문제 건너뜀(2006–2024 전체 571문제). 사다리 적합도 good 121, fair 155, poor 221,
미평가 27(2024년 카드). 요약표는 `SUMMARY.md`, `SUMMARY.csv`.

카드 올리기 (`olympiad/`에서): `python3 scripts/upload_idea_cards.py --apply`

---

## 3. ② 사다리 설계

사다리는 **어려운 문제(Challenge) 하나의 풀이를 단계로 자른 것**입니다. 대회 수준 계단(Kangaroo → MATHCOUNTS →
AMC 8 …)이 아닙니다(2026-10-10 결정).

### 3.1 Challenge 만들기
1. 아이디어 카드 1장 이상을 고릅니다. 여러 카드의 아이디어를 함께 써도 됩니다.
2. **원래 문제를 그대로 쓰지 않습니다.** 상황, 숫자, 질문을 바꿉니다. 원래 문제는 "비슷한 올림피아드 문제"
   링크로만 이름을 밝힙니다.
3. **답은 숫자 하나**입니다. 원래 답이 식이면 특정한 경우를 묻습니다(예: n = 2026).
4. **핵심 아이디어 없이는 풀 수 없어야** 합니다. 작은 경우를 손으로 해 보거나 단계 답에서 추측해서 나오면
   안 됩니다. 확인 방법: 단순한 방법(전부 세기, 뻔한 점화식)이 손으로는 너무 길어야 합니다.
5. 이미 있는 사다리와 같은 카드를 쓰면, 그 사다리의 단계가 답하지 않는 것을 묻습니다.

### 3.2 직접 풀고 정리하기
1. **우리 풀이**: 공식 풀이 문장에서 시작하지 않고 처음부터 직접 풉니다.
2. **문제 분석** (3–6개): 풀기 전에 알아차려야 할 것. 무엇이 고정되고, 무엇이 빨리 커지고, 작은 경우가 무엇을
   보여 주는지. *회원 전용으로 보입니다.*
3. **풀이 흐름**: 번호 붙은 풀이 단계. 각 단계마다 무엇을 하는지, 왜 하는지, 어느 단계 문제와 연결되는지.
   *회원 전용으로 보입니다.*

### 3.3 단계 문제
1. **흐름의 한 단계 = 단답형 문제 1개**, 흐름 순서대로. 보통 4–7개.
2. **수준 하한: AMC 8 / Kangaroo / MATHCOUNTS 이상.** 단계마다 수준을 표시합니다(MATHCOUNTS, AMC 8, AMC 10,
   AIME).
3. 난이도가 꼭 올라갈 필요는 없습니다. 풀이 순서가 먼저입니다.
4. **각 문제가 혼자 읽혀야** 합니다. "2단계의 답을 써서"라고 쓰지 않고 필요한 사실을 문장에 적습니다.
5. 숫자는 **그 단계를 해야만 나오는 값**을 묻습니다. 앞 단계의 사실만 쓰고, 뒤 단계의 사실은 쓰지 않습니다.
6. **사실을 주면 이유도 함께** 적습니다. "It is known that", "It turns out that"으로 공식이나 점화식을 그냥 주지
   않습니다(규칙 5.9, 2026-10-25). 한 단계가 구체적인 경우(n = 12)를 하고 뒤 단계가 일반 공식을 쓰면, 뒤 단계에
   "같은 생각을 모든 n에 하면 이 공식이 나온다"는 연결을 적습니다.
7. **사이트에서는 단계마다 Setup과 그 단계 문장만 보입니다** (2026-11-20). 그래서
   - "of Step 2", "in Step 2", "the same list"처럼 다른 단계를 가리키면 안 됩니다. 필요한 조건(색칠 규칙, 삼각형의
     세 변 등)을 그 단계에 다시 씁니다. ("Cutting Colours Step 3"을 AI가 "정해지지 않음"이라고 한 원인)
   - "the same triangle"은 그 삼각형이 Setup에 정의되어 있을 때만 씁니다.
8. **Setup의 예시가 단계의 답이면 안 됩니다.** Square Triples의 예시 6, 19, 30이 Step 1의 답이었고, Reverse and
   Add의 예시 57이 Step 1의 질문이었습니다.
9. **애매함 점검** (사람이 읽고 확인. 스크립트로는 못 잡음):
   - 한 낱말은 한 뜻으로만. Safe Start에서 "total"(전체 합)과 "running total"(누적 합)이 섞여 학생이 이해하지 못함 →
     "sum"과 "partial sum"으로 나누고, 누적 합을 "지금까지 지나온 수를 모두 더한 값"으로 풀어 씀
   - 0을 포함하는지, 같은 수를 여러 번 써도 되는지 명시 ("whole number"만으로는 애매함)
   - 도형 조건 (사각형의 변이 서로 교차하지 않는지 등)
   - 수식은 유니코드로 (xₖ₊₁, xᵃ). `x_{k+1}`, `x^a`처럼 쓰면 사이트에 그대로 보임

### 3.4 함께 쓰는 것
| 항목 | 내용 |
|---|---|
| 짧은 풀이 | 단계마다 몇 줄. 정답 확인 후 저장됩니다 |
| 힌트 | **힌트 1 = 예시**: 사다리마다 Setup을 다른 숫자로 직접 해 보는 예시 하나(`- Example:` 한 줄). 그 사다리의 모든 문제에 첫 힌트로 보임. 단계 문제와 같은 숫자를 쓰면 답이 되므로 다른 숫자로. **힌트 2부터 = 방향**: 단계 1개, Challenge 2개. 다음 할 일을 가리키되 답을 말하지 않음. 무료, 회원 전용 (2026-11-20) |
| 비슷한 올림피아드 문제 | 대회·연도·번호와 우리 말로 한 문장(인용만) |
| 연구 문제 | Explore 질문(상태를 정직하게 표시), 어울리면 유명한 미해결 문제 |
| 사이트 안의 비슷한 문제 | 같은 세부 분야나 같은 카드를 쓴 다른 사다리 |
| 증명 문제 (선택) | 한두 단계의 증명 버전, 힌트와 전체 풀이. 채점하지 않음 |
| 세부 분야 | `olympiad/ladders/subdomains.py`의 `LADDER_SUBDOMAIN`에 사다리마다 3단계 카테고리 지정 |
| 스킬 맵·이론 카드 | 그 카테고리가 스킬 맵의 핵심 주제(`src/lib/skillMap.ts`)에 들어 있고 이론 카드(`src/lib/theory.ts`)가 있는지 확인. 없으면 추가 |

### 3.5 언어
지금은 영어만 씁니다. 나중에 한국어로 옮기기 쉽게 짧은 문장, 말장난 없이, 사람과 물건 이름을 분명히 씁니다.

---

## 4. ③ 검증

- 사다리 묶음(보통 5개)마다 `verify_v2_batchN.py`를 만들고, **모든 정답과 분석·흐름·풀이에 나오는 모든 숫자**를
  다시 계산합니다. 하나라도 틀리면 고치기 전에는 다음 단계로 가지 않습니다.
- Challenge는 가능하면 **두 가지 방법**으로 확인합니다(예: 전부 세기 + 우리 풀이의 공식).
- 일반 규칙("항상", "모든 n")은 넓은 범위에서 직접 확인합니다(예: n ≤ 3000의 모든 수).
- 힌트는 `import_guides_hints.py`가 **힌트 안에 그 문제의 답이 들어 있지 않은지** 확인합니다. 예시 힌트에서 작은
  숫자(1, 2, 3 …)가 겹치는 것은 `CHECK`로 보여 주기만 하므로 하나씩 읽고 우연인지 판단합니다.
- **예시 힌트의 숫자**는 `ladders/v2/verify_hint_examples.py`에 확인 코드를 더해 다시 계산합니다.
- **문장 점검**: `python3 ladders/lint_ladders.py <사다리 파일들> [HINTS_v2.md]` → `0 error(s)`가 되어야 올립니다.
  다른 단계 가리키기, `x_{k+1}` 같은 LaTeX, "It is known that", 예시 힌트 없음은 error, "the same triangle"과
  Setup에 단계 답이 나오는 경우는 warning(읽고 판단). 3.3장 9번의 애매함은 사람이 읽어서 확인합니다.
- 실행 (`olympiad/`에서): `python3 ladders/v2/verify_v2_batch4.py` → 마지막 줄이 `45/45 checks pass` 같은 모양.

**검증이 실제로 잡은 것 (예)**
- 예시로 든 "가장 작은 세 수"가 틀렸던 것 (P5)
- 탐색 범위가 좁아서 놓친 경우가 있었던 것 (P8)
- 답은 맞지만 풀이 설명이 틀렸던 것 (J)
- 단계 답으로 Challenge 답을 추측할 수 있었던 것 (P)
- 답을 거의 알려 주는 힌트 2개
- (2026-10-25) 공식을 이유 없이 준 단계 8개 (Floor Table Step 5 등)
- (2026-11-20) 다른 단계를 봐야 풀리는 단계 10개, 애매한 문장 7곳, Setup이 Step 1의 답을 알려 준 2곳

검증 결과: P1 28/28, 묶음 1–4 45/45 · 40/40 · 37/37 · 45/45, 예전 사다리 7개 25/25.

---

## 5. ④ 사람 검토

```
python3 ladders/build_review_pdf.py ladders/v2/LADDERS_v2_batch4.md ladders/v2/review_v2_batch4.pdf
```

- PDF 순서: **문제만 → 정답표 → 분석·흐름·풀이 → 링크**. 먼저 풀어 보고 답을 확인할 수 있게 했습니다.
- 사람이 보는 것: 문장이 분명한지, 수준 표시가 맞는지, Challenge에 진짜 아이디어가 있는지, 원래 문제와 충분히
  다른지.
- 검토용 PDF와 HTML은 정답과 카드 출처가 들어 있어서 **공개 저장소에 올리지 않습니다**.

---

## 6. ⑤ 사이트에 올리기

`olympiad/`에서 실행합니다. 옵션 없이 실행하면 미리보기만 하고, `--apply`를 붙여야 Supabase에 씁니다.

| 명령 | 하는 일 |
|---|---|
| `python3 ladders/import_ladders_v2.py ladders/v2/LADDERS_v2_batchN.md --only P42,P43` | 미리보기 (`import_v2_preview.json`) |
| `… --apply` | **새 사다리만** 올림: 문제·정답·단계 연결(`problem_hierarchies`), 분석·흐름(`ladder_guides`), 링크(`ladder_extras`). 반드시 `--only`로 새 사다리만 고름. 이미 있는 사다리에 쓰면 분석·흐름·링크를 파일 내용으로 다시 써서 사이트에서 고친 것이 사라질 수 있음 (Osang 요청, 2026-11-20) |
| `… --remove` | 이 스크립트가 넣은 문제를 모두 삭제 (출처 `MathQuest Ladders v2`). 쓰기 전에 백업 |
| `python3 ladders/import_guides_hints.py ladders/v2/HINTS_v2.md ladders/v2/LADDERS_v2_batch5.md … ladders/v2/LADDERS_v2_older.md --hints-only --apply` | 힌트(`problem_hints`)만 저장. **항상 `--hints-only`** (없으면 분석·흐름과 Challenge 풀이도 덮어씀). 힌트가 있는 파일을 모두 한 번에 줌. 먼저 답 노출 검사 |

- 정답은 풀이의 첫 줄 `Answer: …`로 저장되고, 단답형 확인 버튼이 이것과 비교합니다(분수, 쉼표 허용).
- 카테고리는 `subdomains.py`에서 자동으로 붙습니다.
- 서비스 키(`olympiad/.env`)를 씁니다. 공개 키로는 쓸 수 없습니다.
- **주의:** 지금은 올리는 즉시 학생에게 보입니다(`is_reviewed = false`로 표시만 됨). 문제 검증 계획의
  "승인된 문제만 공개"가 만들어지면 숨김 상태로 올리고 승인 후 공개하도록 바꿉니다(8장).

### 6.1 새 사다리를 올리는 순서 (요약)

1. 사다리 파일 작성 (3장): 단계 문장 규칙 3.3장 1–9번, 사다리마다 `- Example:` 힌트
2. `verify_v2_batchN.py` 통과, `verify_hint_examples.py`에 예시 숫자 추가 후 통과
3. `lint_ladders.py` → 0 error, warning은 읽고 판단. 3.3장 9번 애매함을 직접 읽어 확인
4. `subdomains.py`에 세부 분야 등록, 검토 PDF 만들기
5. `import_ladders_v2.py <파일> --only <새 사다리들> --apply`
6. `import_guides_hints.py <힌트가 있는 모든 파일> --hints-only --apply`
7. 다음 날 `/admin/reviews`에서 밤 검사(L0 형식, L1 원본 대조, L2·L4 AI 풀기) 경고를 확인하고 고침 (6.2장)

### 6.2 이미 올라간 문제의 문장 고치기

정답이 그대로인 문장 수정은 `patch_live_text.py`로 합니다. 사이트의 글이 **고치기 전 마크다운과 똑같을 때만**
바꾸고, 누가 사이트에서 고친 글은 건너뛰고 알려 줍니다.

```
cp ladders/v2/LADDERS_v2_batchN.md <scratchpad>/old.md          # 1. 고치기 전 파일을 복사
(마크다운 수정 → verify 스크립트 → lint_ladders.py)                # 2. 고치고 확인
python3 ladders/patch_live_text.py <scratchpad>/old.md ladders/v2/LADDERS_v2_batchN.md --only P40          # 3. 미리보기
python3 ladders/patch_live_text.py <scratchpad>/old.md ladders/v2/LADDERS_v2_batchN.md --only P40 --apply  # 4. 쓰기
```

- 문제 본문, 풀이(답 줄은 그대로여야 함), 분석·흐름을 바꿉니다. 정답이 바뀌는 수정은 거부하므로 별도 SQL로 합니다.
- 바뀐 문제는 그날 밤 AI 검사를 다시 받습니다.
- 예전 v0.1 사다리(Candy Game 등)는 마크다운 형식이 달라서, 사이트의 글에 옛 문장이 정확히 한 번 있을 때만
  바꾸는 짧은 스크립트로 고쳤습니다(2026-11-20, Reverse and Add).

### 6.3 문제 지우기

1. 그 문제를 가리키는 것을 먼저 셉니다: `solutions`, `user_submissions`, `user_starts`, `activity_logs`,
   `problem_reviews`, `problem_hints`, `problem_hierarchies`.
2. 학생 기록이 있으면 누구의 기록인지 확인하고, 실제 학생이면 먼저 상의합니다.
3. 지울 행을 모두 `olympiad/data/backups/`(git 제외)에 JSON으로 저장한 뒤 `problems`에서 지웁니다(나머지는 함께
   지워짐). 예: 출처 없는 시험용 문제 5개, 2026-11-20 (`deleted_test_problems_2026-11-20.json`).

### 6.4 힌트만 다시 올리기

힌트 파일을 고친 뒤 6.1장 6번 명령을 다시 실행합니다. 문제마다 힌트 목록 전체를 바꿔 씁니다.

---

## 7. 사다리 파일 형식

사다리 하나는 마크다운 블록 하나이고, 블록 사이는 `---`로 나눕니다. 검토 PDF와 import 스크립트가 같은 파일을
읽습니다.

```
### Ladder P17 — Heads Up

**Idea card:** SL2023-C1 (…)            ← 내부용, 사이트에 보이지 않음
**Setup:** (모든 단계에 공통인 규칙)

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | … | **2** |
| **Challenge** | AIME | … | **192** |

**Problem analysis** *(members only)*   ← 글머리 목록
**Logic flow** *(members only)*         ← 1. **제목 (Step 1).** 내용 *Why:* …
**Our full solution**
**Short solutions**                     ← - Step 1: …
**Similar olympiad problems**           ← - IMO Shortlist 2023 C1 *(Strong)*: …
**Similar problems on our site**
**Explore** — *Status: …*
**Proof problem** *(not graded)*        ← 문제, - Hint 1: …, - Solution: …
**Research field:** …
```

힌트는 `HINTS_v2.md`(또는 같은 블록의 `**Hints**`)에 씁니다.

```
**Hints**
- Example: (Setup을 다른 숫자로 직접 해 본 예시. 모든 문제의 힌트 1로 "Example: …"이라고 보임)
- Step 1: …
- Challenge: …        ← Challenge는 2개
- Challenge: …
```

---

## 8. 시간과 자동화

| 작업 | 걸린 시간 |
|---|---|
| 아이디어 카드 | 장당 약 3–5분 (추정). 2006–2024 전체는 10-06 밤부터 10-08까지 |
| 사다리 1개 (설계, 풀이, 검증, 글) | 15–30분 (추정). 시범 사다리 P1은 6분이었지만 이미 잘 아는 카드였음. 좋은 Challenge를 찾는 데 가장 오래 걸림 |
| 사다리 20개 (P2–P21) | 약 1시간 30분, 묶음 4개 (10-11, 파일 기록 기준) |

**아직 사람이 해야 하는 것**
- 수준 표시와 문장이 학생에게 맞는지 판단
- Challenge가 원래 문제와 충분히 다른지, 진짜 아이디어가 있는지 판단
- 증명 문제(아직 사람이 읽어 보지 않음)

**문제 검증 계획과 연결할 것** (`Archive/docs/PROBLEM_VERIFICATION_PLAN.md`)
- 지금의 verify 스크립트와 힌트 검사는 그 계획의 "Python 검사"에 그대로 쓸 수 있습니다.
- 바꿀 것: 올리기를 "숨김 상태로 올리기 → admin에서 승인 → 공개"로 바꾸고, 검증 결과를 Supabase에 남기기.
- 함께 정할 것: 사람 검토를 PDF로 계속 할지, admin 화면의 검토 대기열로 옮길지.

---

## 9. 지켜야 할 원칙

1. **아이디어만, 문장은 우리 것.** 원래 문제와 풀이 문장을 복사하거나 비슷하게 바꿔 쓰지 않습니다.
2. **모든 숫자는 컴퓨터로 확인.** 머릿속으로 계산한 답을 그대로 쓰지 않습니다.
3. **이해하지 못하면 건너뜀.** 카드든 사다리든 마찬가지입니다.
4. **정직한 표시.** Explore와 미해결 문제의 상태(알려짐 / 찾아보지 않음 / 미해결)를 사실대로 씁니다.
5. **공개 저장소 주의.** 아이디어 카드, 검토 PDF, 정답 목록은 올리지 않습니다.
6. **사이트에 IMO를 내세우지 않음.** 출처는 "비슷한 올림피아드 문제" 인용에서만 밝힙니다.
7. **사이트에서 고친 것을 덮어쓰지 않음.** 이미 올라간 문제는 `patch_live_text.py`로만 고치고, import 스크립트는
   새 사다리(`--only`)와 힌트(`--hints-only`)에만 씁니다.
8. **지우기 전에 백업.** 지울 행을 먼저 파일로 저장합니다.
9. **학생 입장에서 한 번 읽기.** 단계 하나만 보고 풀 수 있는지, 낱말이 한 뜻인지, 예시가 답을 알려 주지 않는지.
