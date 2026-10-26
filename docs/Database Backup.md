# 데이터베이스 백업

Supabase 무료 플랜에는 대시보드에서 바로 복원할 수 있는 자동 백업이 없습니다. 그래서 DB 작업 전에, 그리고 주기적으로
아래 스크립트로 직접 백업합니다.

## 프로그램 위치

| 항목 | 위치 |
|---|---|
| 백업 프로그램 | `scripts/backup_supabase.py` (저장소 최상위의 `scripts/` 폴더) |
| 이 안내 | `docs/Database Backup.md` |
| 백업 파일이 저장되는 곳 | `~/mathquest-backups/<날짜-시각>/` (저장소 **밖**, 홈 폴더) |

- **읽기 전용**: GET 요청만 보냅니다. DB를 바꾸지 않습니다.
- **DB 비밀번호가 필요 없습니다.** 이미 쓰고 있는 서비스 키로 REST API를 읽습니다.
- **추가 설치가 없습니다.** Python 3.9 이상의 기본 기능만 씁니다. (`certifi`가 설치되어 있으면 HTTPS 인증서 확인에 사용합니다.)

---

## 1. 실행 방법

**반드시 저장소 최상위 폴더(`mathComm_project`)에서 실행합니다.** 다른 폴더에서 실행하면
`can't open file '.../scripts/backup_supabase.py'` 오류가 납니다.

```bash
cd <저장소 폴더>                                  # 예: cd ~/mathComm_project

python3 scripts/backup_supabase.py --list        # 1) 연결 확인: 테이블 목록과 행 수만 출력 (저장하지 않음)
python3 scripts/backup_supabase.py               # 2) 백업
```

마지막 줄에 `Saved N tables, M rows to ~/mathquest-backups/<날짜-시각>`이 나오고, 모든 줄이 `ok`이면 완료입니다.

키는 아래 순서로 찾습니다. 두 사람 모두 지금 쓰는 파일을 그대로 쓰면 됩니다.

| 사용하는 사람 | 파일 | 변수 |
|---|---|---|
| 웹앱 작업 | `.env.local` | `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` |
| 문제 작업 (`olympiad/`) | `olympiad/.env` | `SUPABASE_URL`, `SUPABASE_SECRET_KEY` |

환경변수(`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)가 있으면 그것이 먼저입니다. 다른 파일을 쓰려면 `--env 경로`를 붙입니다.

### 옵션

| 명령 | 하는 일 |
|---|---|
| `python3 scripts/backup_supabase.py` | `public` 스키마의 모든 테이블과 뷰를 백업 |
| `... --list` | 백업하지 않고 테이블 목록과 행 수만 출력 |
| `... --tables problems,solutions,problem_hierarchies` | 지정한 테이블만 백업 |
| `... --out ~/my-backups` | 저장 위치 변경 (기본 `~/mathquest-backups/`) |
| `... --include-auth` | `next_auth`(이메일, 비밀번호 해시)도 백업. **꼭 필요할 때만** |

새 테이블이 생겨도 스크립트를 고칠 필요가 없습니다. 실행할 때마다 테이블 목록을 DB에서 받아 옵니다.

---

## 2. 결과

`~/mathquest-backups/<날짜-시각>/` 폴더가 생깁니다.

| 파일 | 내용 |
|---|---|
| `public.<테이블>.json` | 원본 그대로의 데이터 (복원 기준) |
| `public.<테이블>.csv` | 대시보드 Table Editor에서 가져오기(Import)용. 목록·JSON 열은 JSON 글자로 저장 |
| `manifest.json` | 백업 시각, 테이블별 행 수, 실패한 테이블 |

실행 화면의 `ok`는 DB가 알려 준 행 수와 받은 행 수가 같다는 뜻입니다. `DIFF`가 나오면 백업하는 동안 데이터가 바뀐
것이므로 한 번 더 실행합니다. 실패한 테이블이 있으면 종료 코드가 1입니다.

---

## 3. 보관 규칙

- 백업 파일에는 **사용자 데이터**(사용자 id, 풀이 기록 등)가 들어 있습니다.
- **저장소 안에는 저장할 수 없습니다.** 스크립트가 거부합니다. `/backups/`는 `.gitignore`에도 들어 있습니다.
  다른 위치를 원하면 저장소 밖을 지정합니다: `--out ~/DB_backup`. 저장소 안에 백업용 폴더를 만들지 않습니다.
- 폴더와 파일은 본인만 읽을 수 있게 만들어집니다(권한 700/600).
- `--include-auth`로 받은 `next_auth.*` 파일에는 이메일과 비밀번호 해시가 있습니다. 필요한 작업이 끝나면 지웁니다.
- 메신저, 이메일, 공유 드라이브로 백업 파일을 주고받지 않습니다.

---

## 4. 언제 실행하나

- DB 정책·권한을 바꾸기 전 (예: `DROP POLICY`, `REVOKE`)
- 많은 행을 지우거나 고치는 스크립트를 돌리기 전 (예: `import_ladders_v2.py --remove`, 데이터 정리)
- 평소에는 주 1회

---

## 5. 복원

전체 자동 복원 기능은 없습니다. 필요한 테이블이나 행만 되돌립니다.

| 상황 | 방법 |
|---|---|
| 문제·사다리 내용이 지워지거나 망가짐 | 먼저 원본으로 다시 넣습니다: `olympiad/ladders/`의 markdown과 import 스크립트. 원본에 없는 내용(관리자 화면에서 고친 것, 사다리가 아닌 문제)은 백업의 JSON에서 찾습니다 |
| 테이블 하나를 통째로 되돌림 | 대시보드 → Table Editor → 해당 테이블 → Import data from CSV로 백업의 CSV를 가져옵니다. 이미 있는 행과 id가 겹치면 실패하므로, 지워진 행만 골라 낸 CSV를 씁니다 |
| 몇 행만 되돌림 | JSON에서 해당 행을 찾아 SQL Editor에서 `INSERT`합니다 |

복원 작업도 DB를 바꾸는 작업이므로, 시작하기 전에 한 번 더 백업합니다.

---

## 6. 문제 해결

| 메시지 | 원인과 조치 |
|---|---|
| `can't open file '.../scripts/backup_supabase.py'` | 저장소 최상위가 아닌 폴더에서 실행함. `cd <저장소 폴더>` 후 다시 실행 |
| `Python cannot check Supabase's HTTPS certificate` 또는 `CERTIFICATE_VERIFY_FAILED` | macOS의 python.org 설치판에 인증서가 설정되지 않음. `open "/Applications/Python 3.12/Install Certificates.command"`(버전 숫자는 설치된 것에 맞춤)를 한 번 실행하거나 `python3 -m pip install certifi` |
| `No Supabase URL and service key found` | `.env.local` 또는 `olympiad/.env`에 URL과 서비스 키가 있는지 확인 |
| `HTTP 401` | 서비스 키가 틀렸거나 바뀜. 공개(anon) 키가 아닌 서비스 키여야 함 |
| `Cannot reach Supabase … Is the project paused?` | 무료 플랜 프로젝트가 일시 중지됨. 대시보드에서 다시 시작 |
| `The API did not list any tables` | 프로젝트에서 API 설명(OpenAPI)이 꺼져 있음. `--tables`로 테이블 이름을 직접 지정 |
| `next_auth`에서 `HTTP 406`/`404` | Settings → API → Exposed schemas에 `next_auth`가 없음. `--include-auth` 없이 실행 |
