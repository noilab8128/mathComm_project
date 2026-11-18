# 문제 검증·리뷰 기능 적용 안내 (2026-11-18, Osang → Mookwon)

문제 검증과 리뷰 기능이 develop에 올라갔고, 운영 DB에도 일부 적용했습니다. Mookwon 님 작업에 영향이 있는 내용만 모았습니다.

---

## 1. 먼저 해 주실 일

1. **`develop`을 pull해 주세요.** pull하기 전에는 `import_ladders_v2.py`를 실행하지 말아 주세요.
   - 예전 파일로 `--update-text`를 실행하면, 이번에 바꾼 답 안내 문장이 예전 문장으로 돌아갈 수 있습니다.
2. **`LEVEL_GUIDE.md`의 AIME 0–999 규칙 삭제** (19행, 36–37행). 이 규칙은 검사에서 빼기로 했습니다.
3. 아래 2장에서 Mookwon 님 파일 6개를 바꾼 내용을 한번 확인해 주세요.

## 2. Mookwon 님 파일에서 바뀐 것 (커밋 `e56775d`)

| 파일 | 변경 |
|---|---|
| `olympiad/ladders/v2/LADDERS_v2_batch1.md` | Square Triples Step 2: 합을 64, 100, 144로 → 정답 **16 → 10** |
| `olympiad/ladders/v2/LADDERS_v2_batch3.md` | Every Power of Two Step 3: 13으로 나눈 나머지 → 정답 **8 → 12**. Step 4: 1/23(주기 22) → 정답 **8 → 10** |
| `olympiad/ladders/v2/HINTS_v2.md` | 위 단계의 힌트 수정 |
| `olympiad/ladders/v2/verify_v2_batch1.py`, `verify_v2_batch3.py` | 바뀐 정답 검증 (46/46, 39/39 통과) |
| `olympiad/ladders/import_ladders_v2.py` | 답 안내 문장: `Answer with a single number, such as 42 or 3/8.` |

**정답을 바꾼 이유**: Challenge 문제의 정답이 단계 문제 정답에 그대로 나와 있어서, 단계만 풀면 Challenge 답을 맞힐 수 있었습니다. Challenge 문제 자체는 바꾸지 않았습니다.

세 단계의 새 정답은 **운영 DB에 이미 반영했습니다** (`supabase/sql/ladder_step_fixes_2026_11.sql`). 세 문제 모두 학생 제출 기록이 없었습니다. 답 안내 문장 변경도 `import_ladders_v2.py --apply --update-text`로 v2 사다리 41개(문제 201개)에 반영했습니다. 그 뒤 `report.py --save`로 검사 결과도 다시 저장했습니다(fail 0).

## 3. 앞으로 문제를 넣을 때 달라지는 점

- **새로 import한 문제는 승인 전까지 학생에게 보이지 않습니다.** 순서는 이렇습니다.
  1. import
  2. 저장소 최상위에서 `python3 scripts/verify/report.py --save` (자동 검사 결과 저장)
  3. `/admin/reviews`에서 문제를 열어 **Approve**
- 이미 공개된 사다리 238개는 일괄 리뷰가 끝날 때까지 그대로 보입니다.
- 출처가 없는 문제 5개는 숨겼습니다.
- **승인 뒤 내용을 고치면** "다시 검토 필요"가 됩니다. 자동 검사를 통과하면 계속 보이고, 실패하면 숨겨집니다.
- **정답이 바뀌는 수정**은 `--update-text`가 거부합니다(원래 동작). 이번처럼 별도 SQL로 처리합니다.
- 운영 DB를 바꾸기 전에는 백업해 주세요: `python3 scripts/backup_supabase.py` (안내: `docs/Database Backup.md`)

## 4. 리뷰 화면 사용법

- Mookwon 님 계정은 **관리자(admin)**로 지정했습니다. 관리자는 리뷰도 할 수 있습니다.
- 리뷰 화면은 운영 사이트에도 배포되었습니다(2026-11-19): `/admin/reviews`
- 판정 종류는 4가지입니다. 코멘트는 승인 외에는 필수입니다.

| 판정 | 의미 |
|---|---|
| Approve | 승인 (필요 승인 수: 지금은 모든 문제 1명) |
| Request changes | 수정 요청 |
| Reject | 반려 (학생에게 숨김) |
| Comment | 의견만 남김 |

- 실수한 판정은 **Withdraw my decision**으로 철회할 수 있습니다. 철회 기록도 남습니다.
- 자동 검사에 실패한 문제는 확인 체크와 코멘트를 남겨야 승인할 수 있습니다.
- 수정 요청이 있는 문제를 열면, 문제 종류별 **수정 방법**이 화면 위쪽에 나옵니다.
  - v2 사다리: markdown 수정 → 검증 스크립트 → `--update-text` (정답이 바뀌면 별도 SQL)
  - v0.1 사다리: 관리자 편집 화면 + markdown 원본도 같이 수정
  - 출처 없는 문제: 관리자 편집 화면
  - 고친 뒤에는 `report.py --save`로 재검사
- 리뷰 기록은 지우거나 고칠 수 없고 영구 보관됩니다.

**일괄 승인 (2026-11-19 추가)**
- 리뷰 목록에서 체크박스로 여러 문제를 고르고 **Approve selected** → "이 문제들과 풀이를 읽었음" 확인 → 승인
- 고를 수 있는 문제: 자동 검사 **통과(passed)**, 리뷰 대기 중, 내가 아직 승인하지 않은 문제. 경고·실패·수정 요청·반려가 있는 문제는 각 문제 화면에서 리뷰합니다
- 문제마다 리뷰 기록이 따로 남습니다("Bulk approval from the review list")
- 권장: 검색창에 사다리 이름을 넣어 Challenge와 Step을 함께 읽은 뒤, 사다리 단위로 승인

## 5. 관리자 문제 편집 화면 (`/admin/problems`)

- 운영 사이트에 배포되었습니다(2026-11-19). 저장, 수정, 삭제는 관리자 전용 서버 API로 처리됩니다.
- 예전 **Approve** 버튼은 **Review**로 바뀌었습니다. 누르면 그 문제의 리뷰 화면으로 갑니다. 리뷰 절차 없이 바로 공개하는 경로는 없앴습니다.
- 사다리 연결: 목록에서 **부모가 될 문제 행을 끌어 자식 문제 행 위에 놓습니다.** 서로가 서로의 부모가 되는 연결은 거부됩니다.
- 학생에게 숨겨진 문제(승인 전 새 문제, 출처 없는 문제 등)도 목록에 나오고 회색 **Hidden** 표시와 **Review** 버튼이 붙습니다. 새로 만든 문제도 저장 직후 바로 수정·삭제할 수 있습니다.

## 6. 아직 안 된 것

- 검사 자동 실행(GitHub Actions)과 리뷰 화면의 "다시 검사" 버튼. 지금은 `report.py --save`를 직접 실행해야 합니다
- AI 검사, 수정 요청 이메일 알림
- 문제 작성자 기록 (Challenge를 2명 승인으로 올리기 전에 필요)

자세한 내용: `Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md` §8, §11, `scripts/verify/README.md`
