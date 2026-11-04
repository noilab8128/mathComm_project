# 문제 검증 (1단계: 현황 보고서)

Supabase DB에 등록된 **모든 문제**를 읽기만 해서 형식 검사(L0)와 원본 대조(L1)를 하고 보고서를 만듭니다.
전체 계획: `Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md`

## 실행

저장소 최상위 폴더에서:

```bash
python3 scripts/verify/report.py            # 보고서 -> ~/mathquest-verify-reports/<날짜-시각>/
python3 scripts/verify/report.py --no-l1    # DB 검사만 (markdown 대조와 검증 스크립트 실행 생략)
```

- **읽기 전용**입니다. GET 요청만 보내고 DB를 바꾸지 않습니다.
- 키는 백업 프로그램과 같습니다: `.env.local` 또는 `olympiad/.env` (`docs/Database Backup.md` 참고).
- 추가 설치가 없습니다 (Python 3.9 이상).
- 보고서에는 문제와 정답이 들어 있으므로 **저장소 밖**에만 저장합니다. 메신저로 보내지 않습니다.

## 2단계: 결과를 DB에 저장 (`--save`)

1. 백업: `python3 scripts/backup_supabase.py`
2. Supabase SQL Editor에서 `supabase/sql/problem_verification.sql` 실행 (테이블 3개, 한 번만)
3. `python3 scripts/verify/report.py --save`

- `--save`는 `problem_verification_status`(문제별 현재 상태)와 `problem_verifications`(검사 기록) **두 테이블에만** 씁니다.
  `problems`, `solutions`, `problem_reviews`는 건드리지 않고, `is_reviewed`(공개 여부)도 그대로입니다.
- 문제 내용(제목·본문·난이도·라벨·풀이)이 바뀌면 그 문제의 승인 수는 0으로 돌아가고, 승인됐던 문제는 `needs_recheck`가 됩니다.
- 검사 기록은 내용이나 결과가 바뀐 경우에만 추가되므로, 여러 번 실행해도 쌓이지 않습니다.
- 필요 승인 수: Challenge 2, 그 밖 1 (계획서 8장 결정 4의 추천값. 결정이 바뀌면 `save.py`의 `required_approvals`만 고침)

## 결과 파일

| 파일 | 내용 |
|---|---|
| `report.md` | 요약, 규칙별 건수, 검증 스크립트 결과, 실패·경고 문제 목록 |
| `issues.csv` | 문제별 지적 사항 (스프레드시트용) |
| `problems.json` | 문제별 상태, 정답, 내용 지문(hash), 지적 사항 (2단계에서 DB에 저장할 형태) |

## 검사 규칙 (`checks.py`)

| 규칙 | 심각도 | 내용 |
|---|---|---|
| `EMPTY_TEXT`, `DIFFICULTY_RANGE`, `NO_SOLUTION` | 실패 | 제목·본문, 난이도 1–10, 풀이 존재 |
| `ANSWER_UNPARSEABLE` | 실패 | `Answer:` 줄을 사이트의 Check 버튼과 같은 방식으로 읽을 수 없음 (`src/lib/answers.ts`와 동일한 해석) |
| `NO_NUMBER_ANSWER` | 사다리는 실패, 그 밖은 경고 | 풀이 첫 줄에 `Answer: 숫자`가 없음 |
| `AIME_RANGE` | 10-24 이후 문제는 실패, 이전 문제는 경고 | AIME 라벨인데 정답이 0–999 정수가 아님 (LEVEL_GUIDE) |
| `CONTEST_LABEL_MISSING`, `LABEL_DIFFICULTY` | 경고 | 대회 라벨 태그가 없거나 라벨과 난이도가 맞지 않음 |
| `KNOWN_THAT` | 경고 | "It is known that" (규칙 5.9) |
| `STEP_REFERENCE` | 경고 | 다른 단계의 답을 가리킴 (규칙 5.4) |
| `ANSWER_SENTENCE` | 경고 | 정답 안내 문장이 두 번 나옴 (10-25 §8.2) |
| `CATEGORY_MISSING` | 경고 | 세부 카테고리 없음 (운영 정책 2.3) |
| `HINT_LEAK` | 경고 | 힌트에 정답이 그대로 있음 (힌트 테이블이 생긴 뒤) |
| `BROKEN_LINK` | 실패 | 사다리 연결이 없는 문제를 가리킴 |
| `STEP_ORDER_DUPLICATE` | 경고 | 같은 사다리 안 순서 번호 중복 |
| `CHALLENGE_ANSWER_REPEATED` | 경고 | Challenge 정답이 단계 정답과 같아 추측으로 맞힐 수 있음 (규칙 4.3) |
| `STEP_ANSWER_REPEATED` | 참고 | 단계끼리 정답이 같음 (작은 수는 흔함, 리뷰 때 참고) |
| `MD_ANSWER_DIFF` | 경고 | DB 정답과 markdown 원본 정답이 다름 (v2 사다리) |
| `VERIFY_SCRIPT_FAIL` | 경고 | 검증 스크립트의 FAIL 줄 |
| `NOT_IN_MD` | 참고 | v2 사다리인데 markdown 원본에서 찾지 못함 |

L1은 `olympiad/ladders/`의 markdown 파서와 검증 스크립트를 **읽기·실행만** 합니다. 그 파일들은 고치지 않습니다.
예전 사다리(v0.1)는 markdown 형식이 달라 L1 대상에서 빠지고, L0 검사만 받습니다.
