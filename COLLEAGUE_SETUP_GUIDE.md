# MathQuest - 로컬 개발 환경 셋업 가이드 (NextAuth 연동 이후)

이 문서는 최근 진행된 **NextAuth.js 인증 마이그레이션** 및 **라우팅 구조 변경** 이후, 동료 개발자가 프로젝트를 로컬에서 정상적으로 실행하고 이어서 개발하기 위해 필요한 사전 설정 단계들을 안내합니다.

## 1. 패키지 설치
새로운 인증 라이브러리와 관련 패키지들이 추가되었습니다. 코드를 pull 받은 후 먼저 패키지를 업데이트해 주세요.

```bash
npm install
```
*(추가된 주요 패키지: `next-auth`, `@auth/supabase-adapter`, `bcryptjs`, `react-turnstile` 등)*

## 2. 환경 변수 (.env.local) 설정
NextAuth 및 소셜 로그인 연동을 위해 `.env.local` 파일에 아래 환경 변수들이 추가되어야 합니다. (보안상 실제 키 값은 별도로 공유받아 입력해 주세요.)

```env
# -----------------------------------------------------------------------------
# NextAuth 기본 설정
# -----------------------------------------------------------------------------
# (http://localhost:3000 으로 설정. 배포 시에는 실제 도메인 입력)
NEXTAUTH_URL="http://localhost:3000"

# (필수: JWT 암호화를 위한 비밀키. `openssl rand -base64 32` 명령어로 생성 가능)
NEXTAUTH_SECRET="[공유받은 시크릿 키 입력]"

# -----------------------------------------------------------------------------
# 소셜 로그인 (OAuth) API 키
# -----------------------------------------------------------------------------
# Google OAuth
GOOGLE_CLIENT_ID="[공유받은 구글 클라이언트 ID 입력]"
GOOGLE_CLIENT_SECRET="[공유받은 구글 클라이언트 시크릿 입력]"

# Facebook OAuth
FACEBOOK_CLIENT_ID="[공유받은 페이스북 클라이언트 ID 입력]"
FACEBOOK_CLIENT_SECRET="[공유받은 페이스북 클라이언트 시크릿 입력]"

# -----------------------------------------------------------------------------
# Turnstile (로봇 방지 캡챠) 설정
# -----------------------------------------------------------------------------
NEXT_PUBLIC_TURNSTILE_SITE_KEY="[공유받은 Cloudflare Turnstile Site Key 입력]"
TURNSTILE_SECRET_KEY="[공유받은 Cloudflare Turnstile Secret Key 입력]"
```

## 3. 플랫폼별 콜백 URL 설정 가이드 (실서버 및 로컬 동시 사용)

팀원들이 로컬에서 개발하면서 동시에 배포된 실서버(Netlify/Vercel 등) 환경에서도 인증이 정상 작동하도록 설정하는 방법입니다. 각 개발자 콘솔에서 **로컬 호스트(`http://localhost:3000`)와 실서버 도메인을 모두 등록**해 놓으면 한 개의 앱(클라이언트 ID)으로 두 환경을 모두 커버할 수 있습니다.

### Google OAuth (Google Cloud Console)
1. **API 및 서비스 > 사용자 인증 정보** 이동
2. 생성된 OAuth 2.0 클라이언트 ID 클릭
3. **승인된 리디렉션 URI** 항목에 다음 두 가지를 모두 추가:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://[실제배포도메인.com]/api/auth/callback/google`

### Facebook OAuth (Facebook Developers)
1. 내 앱 > 설정 > 기본 설정 확인
2. 좌측 메뉴 **설정 > 고급 설정** 또는 **제품 > Facebook 로그인 > 설정** 이동
3. **유효한 OAuth 리디렉션 URI** 항목에 다음 두 가지를 모두 추가:
   - `http://localhost:3000/api/auth/callback/facebook`
   - `https://[실제배포도메인.com]/api/auth/callback/facebook`

### Cloudflare Turnstile (캡챠)
로컬 서버와 배포된 실서버에서 모두 Turnstile이 작동하려면 도메인 추가가 필요합니다.
1. [Cloudflare Turnstile 대시보드](https://dash.cloudflare.com/?to=/:account/turnstile) 접속
2. 생성한 위젯의 **Settings (설정)** 클릭
3. **Domains (도메인)** 목록에 다음 두 가지를 모두 추가:
   - `localhost` (127.0.0.1 도 포함)
   - `[실제배포도메인.com]` (예: mathquest.netlify.app)
> *주의:* 도메인을 등록하지 않은 환경에서는 Turnstile 위젯이 작동하지 않아 이메일 회원가입/로그인이 차단됩니다.

### Supabase URL Configuration
Supabase가 소셜 로그인 승인 후 인증 데이터를 NextAuth로 올바르게 넘겨주기 위한 설정입니다.
1. Supabase 대시보드 > **Authentication > URL Configuration** 이동
2. **Site URL:** 실서버 도메인 (예: `https://[실제배포도메인.com]`)
3. **Redirect URLs:** `http://localhost:3000/*` 및 추가 배포 도메인 패턴들을 리스트에 추가

---

> **참고:** 기존에 사용하던 Supabase 관련 변수 (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)는 그대로 유지되어야 합니다. NextAuth 어댑터가 내부적으로 이 값들을 사용하여 데이터베이스(`next_auth` 스키마)와 통신합니다.

## 3. 데이터베이스 상태 (참고)
* 인증 관련 데이터 처리가 기존 기본 Supabase Auth 영역에서 **`next_auth` 스키마 내의 테이블(users, accounts, sessions, verification_tokens)** 로 모두 마이그레이션 되었습니다.
* 따라서 새로운 소셜 로그인이나 로컬 이메일 가입 유저의 정보는 해당 테이블들에 저장됩니다. (단, DB 스키마 업데이트는 이미 원격 Supabase에 반영되어 있으므로, 동일한 개발 DB를 사용 중이라면 별도의 로컬 마이그레이션 작업은 필요하지 않습니다.)

## 4. 로컬 서버 실행 확인
모든 설정이 완료되었다면, 서버를 실행하고 접속 및 로그인 플로우가 정상 작동하는지 확인합니다.

```bash
npm run dev
```

### 💡 주요 테스트 포인트
1. `http://localhost:3000` (랜딩 페이지) 우상단의 **Log In / Sign Up** 버튼 통해 이동
2. 구글, 페이스북, 일반 이메일(Credentials) 로그인 정상 작동 여부 
3. 로그인 성공 시 정상적으로 `http://localhost:3000/dashboard` 로 리다이렉션 되는지 확인
4. 권한 없는(비로그인) 상태로 `/dashboard` 나 `/admin` 접근 시 `/` 또는 `/login` 으로 튕겨내는지 확인 (Middleware 작동)

셋업 과정에서 문제가 생기면 언제든 문의 바랍니다!

---

## 🚀 추가 안내: Netlify 실서버 배포 시 환경 변수 설정 방법

로컬에서 사용한 `.env.local` 파일의 환경 변수들을 Netlify 배포 환경에도 똑같이 설정해 주어야 실서버에서 로그인 기능이 동작합니다. 아래 순서대로 Netlify 대시보드에서 설정해 주세요.

1. **Netlify 대시보드 로그인:** [https://app.netlify.com/](https://app.netlify.com/) 에 로그인합니다.
2. **사이트 선택:** 배포된 프로젝트(Site)를 클릭하여 상세 페이지로 들어갑니다.
3. **Site 설정 이동:** 좌측 메뉴에서 **`Site configuration`** (또는 화면 상단의 `Site settings`) 메뉴를 클릭합니다.
4. **환경 변수 메뉴 진입:** 좌측 서브 메뉴에서 **`Environment variables`** 항목을 찾아 클릭합니다.
5. **Add a variable(변수 추가):** 화면에 보이는 `Add a variable` 버튼을 클릭한 뒤, `Add a single variable`(또는 Import)을 선택하여 변수를 하나씩 추가합니다.

#### 📌 Netlify에 반드시 추가해야 할 환경 변수 목록
> Key와 Value 칸에 각각 아래 내용을 복사해서 붙여넣기 해줍니다.

| Key (변수명) | Value (값) | 설명 |
| :--- | :--- | :--- |
| `NEXTAUTH_URL` | `https://[본인의-Netlify-배포주소.netlify.app]` | **중요:** `localhost:3000`이 아닌 배포된 최종 도메인 주소 입력 |
| `NEXTAUTH_SECRET` | `[로컬과 동일한 시크릿 키]` | 로컬 `.env.local`과 동일한 JWT 암호화 키 |
| `GOOGLE_CLIENT_ID` | `[구글 클라이언트 ID]` | 로컬 `.env.local`과 동일 |
| `GOOGLE_CLIENT_SECRET`| `[구글 클라이언트 시크릿]` | 로컬 `.env.local`과 동일 |
| `FACEBOOK_CLIENT_ID` | `[페이스북 클라이언트 ID]` | 로컬 `.env.local`과 동일 |
| `FACEBOOK_CLIENT_SECRET`| `[페이스북 클라이언트 시크릿]`| 로컬 `.env.local`과 동일 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | `[Cloudflare 사이트 키]` | 로컬 `.env.local`과 동일 |
| `TURNSTILE_SECRET_KEY` | `[Cloudflare 시크릿 키]` | 로컬 `.env.local`과 동일 |
| `NEXT_PUBLIC_SUPABASE_URL` | `[Supabase URL]` | 로컬 `.env.local`과 동일 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `[Supabase Anon 키]` | 로컬 `.env.local`과 동일 |
| `SUPABASE_SERVICE_ROLE_KEY` | `[Supabase Service Role 키]`| 로컬 `.env.local`과 동일 |

6. 모든 환경 변수를 입력했다면, 입력창 아래의 **`Save` (저장)** 버튼을 누릅니다.
7. **(선택 사항이자 필수) 재배포(Re-deploy):** 환경 변수 변경 사항을 적용하기 위해 새로운 빌드가 필요합니다.
   - 프로젝트 상단 탭에서 **`Deploys`** 로 이동합니다.
   - 가장 최근 배포(Published) 내역 우측의 **`Trigger deploy`** 드롭다운 버튼을 클릭합니다.
   - **`Clear cache and deploy site`** 를 선택하여 기존 캐시를 지우고 깨끗하게 새로 배포를 진행합니다.

이 과정이 완료되면 Netlify 실서버 URL에서도 소셜 로그인 팝업과 이메일 인증이 정상적으로 작동하게 됩니다.

---

## 🔒 보안 업데이트 안내 (2026-07-13 적용)

아래 보안 강화 사항이 코드에 반영되었습니다. 동료 분들도 로컬 환경 설정 시 참고해 주세요.

### 1. `NEXTAUTH_SECRET` 교체 필요
JWT 토큰 서명에 사용되는 시크릿 키가 강력한 랜덤 값으로 교체되었습니다.
- **새 시크릿 값은 안전한 채널(DM 등)로 별도 공유받아 `.env.local`에 입력해 주세요.**
- Netlify 등 배포 환경에서도 동일한 값으로 업데이트가 필요합니다.

### 2. 비밀번호 정책 강화
기존 6자 이상 → **8자 이상 + 대문자 + 소문자 + 숫자 포함 필수**로 변경되었습니다.
- 기존 사용자의 비밀번호는 유지되며, **신규 가입 및 비밀번호 변경** 시에만 새 정책이 적용됩니다.
- 서버사이드(API)에서 강제 검증하므로 API 직접 호출로도 우회 불가능합니다.

### 3. API Rate Limiting 적용
Brute Force 공격 방지를 위해 민감한 API에 요청 횟수 제한이 추가되었습니다.
- **로그인/회원가입**: 이메일/IP당 15분에 10회까지 허용
- **게시글 작성**: IP당 1분에 5회까지 허용
- 초과 시 `429 Too Many Requests` 응답을 받게 됩니다.
- 개발 중 테스트로 Rate Limit에 걸리면, **서버를 재시작**(`npm run dev`)하면 인메모리 카운터가 초기화됩니다.

### 4. 보안 헤더 (Security Headers) 추가
`next.config.ts`에 아래 HTTP 보안 헤더들이 자동 적용됩니다.

| 헤더 | 역할 |
|------|------|
| `X-Frame-Options: DENY` | 클릭재킹(iframe 삽입) 방지 |
| `X-Content-Type-Options: nosniff` | MIME 타입 스니핑 방지 |
| `Referrer-Policy` | 외부 이동 시 URL 정보 노출 제한 |
| `Strict-Transport-Security` | HTTPS 강제 접속 |
| `X-XSS-Protection` | 레거시 브라우저 XSS 필터 활성화 |
| `Permissions-Policy` | 카메라/마이크/위치정보 등 불필요 API 차단 |

### 5. NextAuth 디버그 모드 변경
- `debug: true` → `debug: process.env.NODE_ENV === "development"` 로 변경
- **프로덕션 환경에서는 디버그 로그가 자동으로 비활성화**됩니다.
- 개발 환경(`npm run dev`)에서는 기존과 동일하게 디버그 정보가 출력됩니다.
