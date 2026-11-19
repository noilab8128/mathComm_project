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
- 필요 승인 수: 지금은 모든 문제 1명 (2026-11-18 결정). 나중에 Challenge를 2명으로 바꿀 때는 `save.py`의 `CHALLENGE_APPROVALS = 2`와 `supabase/sql/problem_verification.sql` 7번 SQL로 기존 행을 고침

## 6단계: 자동 실행 (GitHub Actions)

`.github/workflows/verify-problems.yml`이 `report.py --save`를 GitHub에서 실행합니다.

| 언제 | 방법 |
|---|---|
| 매일 밤 | 03:00 KST (18:00 UTC) 자동 |
| 리뷰 화면에서 | `/admin/reviews` 오른쪽 위 **Run automatic check** (약 2분 뒤 목록이 새로 고쳐짐) |
| GitHub에서 | Actions → **Verify problems** → **Run workflow** |

- 저장소가 공개라서 실행 로그도 공개입니다. 로그와 요약에는 **개수만** 나오고, 정답이 들어 있는 보고서 파일은 실행 서버에만 남고 올리지 않습니다.
- `pull_request`로는 실행되지 않습니다(fork에서 비밀 값을 쓸 수 없게).

**처음 한 번 설정**
1. GitHub 저장소 → Settings → Secrets and variables → Actions → **New repository secret**
   - `SUPABASE_URL`: `.env.local`의 `NEXT_PUBLIC_SUPABASE_URL` 값
   - `SUPABASE_SERVICE_ROLE_KEY`: `.env.local`의 같은 이름 값
2. Settings → Actions → General → Workflow permissions: **Read repository contents and packages permissions**
3. (리뷰 화면 버튼용) 저장소 주인 계정으로 fine-grained token 만들기: 이 저장소만, **Actions: Read and write**.
   Netlify 환경 변수 `GITHUB_DISPATCH_TOKEN`에 넣고 다시 배포 (로컬 테스트는 `.env.local`에도). 토큰이 없으면 버튼 대신 "Runs every night"만 보입니다.

## 7단계: AI 검사 (OpenAI, `ai_check.py`)

| 검사 | 내용 | 결과 |
|---|---|---|
| L2 독립 재계산 | 모델이 **문제 본문만** 받아(정답은 주지 않음) Code Interpreter로 코드를 짜서 풀고, 우리가 그 답을 DB 정답과 비교 | 다르면 **경고** (`AI_ANSWER_DIFF`) |
| L4 애매함 | 같은 요청에서 다르게 읽을 수 있는 경우와 그때의 답 | 답이 달라지는 "likely" 해석이 있으면 **경고** |

- **경고만 합니다.** 문제를 숨기지 않습니다. 리뷰 화면에 AI 답, 방법, 다른 해석이 보이고, 경고가 있는 문제는 일괄 승인 대상에서 빠집니다.
- 내용이 바뀌면 AI 결과는 사라지고(`report.py --save`가 지움), 다음 밤에 다시 검사합니다.
- 실행: `.github/workflows/verify-problems-ai.yml` (매일 03:40 KST, 새로 들어오거나 바뀐 문제만, 1회 최대 30개·$3)
  - 시험: Actions → **Verify problems (AI)** → Run workflow → `sample` 10. 같은 문제로 다른 모델을 비교하려면 `recheck` 체크
- 키: GitHub Secret `OPENAI_API_KEY_VERIFY` (학생 채점 키와 분리한 OpenAI Project, 월 예산 설정). 기본 모델은 `gpt-6.2-sol`, 저장소 변수 `AI_CHECK_MODEL`로 바꿀 수 있음
- 로그에는 개수만 나오고, 답이 들어 있는 결과 파일은 실행 서버에만 남습니다.

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
| `CONTEST_LABEL_MISSING`, `LABEL_DIFFICULTY` | 경고 | 대회 라벨 태그가 없거나 라벨과 난이도가 맞지 않음 |
| `KNOWN_THAT` | 경고 | "It is known that" (규칙 5.9) |
| `STEP_REFERENCE` | 경고 | 다른 단계의 답을 가리킴 (규칙 5.4) |
| `ANSWER_SENTENCE` | 경고 | 예전 안내 문장("Answer with a single number.")이 분수 요청과 함께 나오거나 두 번 나옴 (10-25 §8.2). 새 문장 "…, such as 42 or 3/8."은 해당 없음 |
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
