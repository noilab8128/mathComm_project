# 로그인·보안·개인정보 체크리스트

- 작성: 2026-10-17
- 범위: 회원가입, 로그인(이메일·Google·Facebook), 세션, 관리자 권한, 사용자 정보 저장과 처리
- 근거 코드: `src/lib/auth.ts`, `src/middleware.ts`, `src/app/api/auth/*`, `src/app/api/user/*`, `src/app/api/admin/*`,
  `src/app/login`, `src/app/(info)/privacy`, `supabase/sql/*`, `next.config.ts`

> **공개 저장소 주의.** 이 문서의 ❌ / ❓ 항목에는 아직 막히지 않은 취약점이 적혀 있습니다.
> 해당 항목을 고치기 전에는 공개 저장소에 커밋하지 말거나, 저장소를 비공개로 바꾼 뒤에 커밋합니다.

### 상태 표시

| 표시 | 뜻 |
|---|---|
| ✅ | 충족 |
| 🔧 | 이번 점검에서 고침 (2026-10-17, 배포 전) |
| ⚠️ | 부족함. 후속 작업 필요 |
| ❌ | 없음 또는 위험. 오픈 전에 반드시 처리 |
| ❓ | 코드만으로 판단 불가. Supabase에서 확인 필요 (`supabase/sql/auth_hardening.sql` 1부) |
| 📋 | 정책 결정 필요 |

---

## 1. 지금 로그인과 세션이 동작하는 방식

| 항목 | 현재 |
|---|---|
| 인증 라이브러리 | NextAuth v4.24 (`next-auth`), Supabase 어댑터 (`next_auth` 스키마) |
| 로그인 방법 | Google, Facebook (OAuth), 이메일+비밀번호 (Credentials) |
| 비밀번호 저장 | `next_auth.users.password_hash`, bcrypt (새 해시는 cost 12, 예전 해시는 cost 10) |
| 봇 차단 | Cloudflare Turnstile (이메일 가입·로그인) |
| 세션 방식 | **JWT** (암호화된 쿠키), 유효기간 7일. DB 세션 테이블은 쓰지 않음 |
| 세션에 담긴 값 | id, 이름, 이메일, 사진, role, nickname, gender, country, language, is_onboarded |
| 페이지 보호 | `src/middleware.ts`: 로그인 필요, `/admin`은 role = admin, 온보딩 전이면 `/onboarding`으로 |
| API 보호 | middleware가 `/api`를 **제외**함. 각 API가 `getServerSession`으로 직접 확인해야 함 |
| 관리자 판정 | `public.user_roles`의 role. 🔧 관리자 API는 이제 매번 DB를 확인 (`requireAdmin()`) |

로그인 흐름 (이메일):
1. 로그인 페이지에서 Turnstile 통과
2. `signIn("credentials")` 호출
3. `authorize()`에서 다음 순서로 처리
   1. 이메일 정규화
   2. IP별·이메일별 횟수 제한
   3. Turnstile 서버 검증
   4. 서비스 키로 사용자 조회
   5. bcrypt 비교
4. `jwt()` 콜백이 DB에서 role과 프로필을 읽어 토큰에 넣음
5. 쿠키 발급

---

## 2. 계정과 비밀번호

| # | 항목 | 상태 | 내용 |
|---|---|---|---|
| 2.1 | 비밀번호는 느린 해시(bcrypt/argon2)로만 저장 | ✅ | bcrypt |
| 2.2 | 해시 강도 | 🔧 | cost 10 → 12 (`BCRYPT_ROUNDS`, `src/lib/credentials.ts`). 예전 해시도 그대로 로그인됨 |
| 2.3 | 비밀번호 정책을 서버에서 검사 | ✅ | 8자 이상, 대·소문자, 숫자 |
| 2.4 | 길이 상한 (bcrypt는 72바이트까지만 사용) | 🔧 | 72바이트를 넘으면 거절. 예전에는 조용히 잘렸음 |
| 2.5 | 가입·변경·화면이 같은 정책을 씀 | 🔧 | `isValidPassword()` 하나로 통일 (가입 API, 비밀번호 변경 API, 로그인 화면) |
| 2.6 | 이메일을 소문자·공백 제거로 정규화 | 🔧 | 가입·로그인 모두. 대소문자만 다른 중복 계정을 막음. 기존 데이터는 `auth_hardening.sql` 1d로 확인 |
| 2.7 | 이메일 중복 가입 동시 요청 처리 | 🔧 | DB unique 제약 위반(23505)을 409로 처리 |
| 2.8 | 가입 시 이메일 소유 확인 | ❌ | 없음. 남의 이메일로 가입할 수 있고, 그 사람이 나중에 Google로 로그인하면 계정 연결 오류가 남 (선점) |
| 2.9 | 비밀번호 재설정 | ❌ | 없음. 로그인 화면의 "Forgot password?"는 `href="#"`인데 FAQ와 Contact 페이지는 기능이 있다고 안내함 |
| 2.10 | 비밀번호 변경 시 현재 비밀번호 확인 | ✅ | `PUT /api/user/profile` |
| 2.11 | 비밀번호 변경 시 다른 기기 세션 종료 | ⚠️ | JWT라서 기존 세션이 7일간 유지됨. `password_changed_at` 열을 두고 토큰 발급 시각과 비교해야 함 |
| 2.12 | 유출된 비밀번호 차단 | ⚠️ | 없음 (예: Have I Been Pwned 범위 조회). 오픈 후 검토 |
| 2.13 | 관리자 계정 2단계 인증 | ⚠️ | 없음. 관리자는 Google 로그인만 쓰고 Google 계정에 2단계 인증을 켜는 것으로 대신 |

## 3. 로그인 보호

| # | 항목 | 상태 | 내용 |
|---|---|---|---|
| 3.1 | 비밀번호 대입 횟수 제한 | 🔧 | 이메일별 15분 10회 + IP별 15분 30회. 예전에는 이메일 기준만 있었음 |
| 3.2 | limiter 기록이 서로 섞이지 않음 | 🔧 | 예전에는 모든 limiter(가입, 로그인, 정답 확인)가 Map 하나를 같이 썼음 |
| 3.3 | 서버 여러 대에서도 횟수 제한이 유지됨 | ⚠️ | 메모리 기반이라 Netlify 함수 인스턴스마다 따로 셈. 오픈 전에 Upstash Redis 등으로 교체 권장 |
| 3.4 | 클라이언트 IP를 믿을 수 있는 헤더로 판단 | 🔧 | `x-nf-client-connection-ip`(Netlify) 우선 |
| 3.5 | 봇 차단을 서버에서 검증 | ✅ | Turnstile. 운영에서 비밀키가 없으면 거절(fail closed) |
| 3.6 | 로그인 실패 메시지로 가입 여부를 알 수 없음 | 🔧 | "No user found" / "Incorrect password" / 소셜 계정 안내 → 모두 "Invalid email or password" |
| 3.7 | 응답 시간으로 가입 여부를 알 수 없음 | 🔧 | 없는 이메일도 같은 비용의 bcrypt 비교를 거침 |
| 3.8 | 가입 API로 가입 여부를 알 수 없음 | ⚠️ | "Email is already registered"(409)가 남아 있음. 2.8 이메일 인증을 도입할 때 함께 없앰 |
| 3.9 | OAuth 계정 자동 연결 금지 | ✅ | `allowDangerousEmailAccountLinking`을 쓰지 않음 |
| 3.10 | 로그인 뒤 이동 주소가 같은 사이트로 제한 | ✅ | NextAuth 기본 redirect 콜백 |

## 4. 세션

| # | 항목 | 상태 | 내용 |
|---|---|---|---|
| 4.1 | 세션 쿠키는 HttpOnly·Secure·SameSite | ✅ | NextAuth 기본값. 운영 `NEXTAUTH_URL`이 https여야 `__Secure-` 쿠키가 됨 |
| 4.2 | 세션 서명·암호화 키 | ❓ | `NEXTAUTH_SECRET`이 운영 환경에 충분히 긴 무작위 값으로 설정되어 있는지 Netlify에서 확인 |
| 4.3 | **브라우저가 세션 값을 바꿀 수 없음** | 🔧 | **심각.** 예전 `jwt()` 콜백은 `useSession().update(data)`로 받은 `role`을 그대로 토큰에 넣었음. 로그인한 사용자 누구나 브라우저 콘솔에서 `role: "admin"`을 보내 관리자가 될 수 있었고, 관리자 API는 그 값을 믿었음. 이제 `update()`는 새로고침 요청으로만 쓰이고 모든 값을 DB에서 다시 읽음 |
| 4.4 | 권한 변경·해제가 빨리 반영됨 | 🔧 | 토큰의 role·프로필을 5분마다 DB에서 다시 읽음. 관리자 API는 매번 DB 확인 |
| 4.5 | 세션 유효기간 | ✅ | 7일. 학습 서비스로 무난함. 📋 관리자만 더 짧게 할지 결정 |
| 4.6 | 로그아웃 | ✅ | NextAuth `signOut` (쿠키 삭제) |
| 4.7 | 특정 세션 강제 종료 | ⚠️ | JWT라서 불가. 필요하면 2.11과 같은 방식(사용자별 기준 시각)으로 해결 |
| 4.8 | 세션 정보 최소화 | ⚠️ | gender, country, language가 모든 페이지의 세션 응답(`/api/auth/session`)에 실림. 화면에 필요한 nickname 정도만 남기는 것을 권장 |

## 5. 권한과 API 보호

| # | 항목 | 상태 | 내용 |
|---|---|---|---|
| 5.1 | 관리자 API가 서버에서 DB 권한을 확인 | 🔧 | `requireAdmin()` (`src/lib/auth.ts`): metrics, users, users/[id], users/[id]/points |
| 5.2 | 비용이 드는 AI API 보호 | 🔧 | **로그인 없이 누구나 호출할 수 있었음** (OpenAI 비용 남용). `analyze-problem`, `generate-solution`, `generate-related-problems`는 이제 관리자만 |
| 5.3 | 역할 변경 API의 입력 검증 | 🔧 | `newRole`은 "admin" / "user"만 |
| 5.4 | 모든 사용자 API가 세션을 확인 | ✅ | `src/app/api/user/*`, community, check-answer, hints, guide. 공개 API는 categories, leaderboard, preview뿐 |
| 5.5 | 관리자 문제 편집이 서버를 거침 | ❌ ❓ | `admin/problems`는 브라우저에서 **공개(anon) 키로** `problems`·`solutions`를 직접 쓰고 지움 (`problemsAPI`, `src/lib/supabase.ts`). 이것이 동작한다면 RLS가 anon 쓰기를 허용하는 것이고, 그러면 **누구나 공개 키로 문제와 정답을 수정·삭제할 수 있음.** 1b 쿼리로 확인 후, 쓰기를 `requireAdmin()` API로 옮기고 anon 쓰기 정책 제거 |
| 5.6 | 관리자 작업 기록 | ⚠️ | 역할 변경, XP 조정에 누가 언제 했는지 남지 않음 (`admin_audit_log` 권장) |
| 5.7 | 관리자 로그인 페이지 | ✅ | `/top-secret`은 Google 로그인 버튼뿐이고 권한은 `user_roles`로 판단 |

## 6. 데이터베이스와 키

| # | 항목 | 상태 | 내용 |
|---|---|---|---|
| 6.1 | 서비스 키는 서버에서만 사용 | ✅ | `NEXT_PUBLIC_` 접두어 없음 |
| 6.2 | 서비스 키가 없을 때 공개 키로 대신하지 않음 | 🔧 | NextAuth 어댑터의 anon 키 대체 제거 |
| 6.3 | `next_auth` 스키마(비밀번호 해시)를 공개 키로 읽을 수 없음 | ❓ | `nextauth_permissions_fix.sql`이 `authenticator`에 ALL 권한을 줌. 1a로 확인, 2b로 회수 |
| 6.4 | 관리자 목록을 공개 키로 읽을 수 없음 | 🔧 ❓ | `user_roles`에 "모두 읽기" 정책이 있음. 코드는 이제 서비스 키로 읽으므로 2a로 정책 삭제 가능 |
| 6.5 | 정답을 공개 키로 읽을 수 없음 | ❌ | `solutions`는 공개 키로 읽힘 (WORKLOG 10-04~10-11 §10) |
| 6.6 | 개인정보가 있는 모든 테이블에 RLS | ❓ | 1c로 RLS가 꺼진 테이블 확인 |
| 6.7 | `.env.local`·키가 저장소에 없음 | ✅ | `.gitignore`. 📋 키가 커밋된 적이 있는지 git 기록 점검 권장 |

## 7. 전송과 브라우저 보안

| # | 항목 | 상태 | 내용 |
|---|---|---|---|
| 7.1 | HTTPS 강제 (HSTS) | ✅ | `next.config.ts` |
| 7.2 | 클릭재킹 방지 | ✅ | `X-Frame-Options: DENY` |
| 7.3 | MIME sniffing 방지, Referrer 제한, Permissions-Policy | ✅ | |
| 7.4 | Content-Security-Policy | ⚠️ | 없음. Turnstile, Google 로그인, Google Fonts, Supabase를 허용하는 CSP를 report-only로 먼저 적용 권장 |
| 7.5 | `X-XSS-Protection` | ⚠️ | 최신 브라우저는 무시하고 오래된 브라우저에서는 부작용이 있어 `0` 권장 (낮은 우선순위) |
| 7.6 | 개발용 debug 로그 | ✅ | `NODE_ENV === "development"`에서만 |

## 8. 개인정보 보호

| # | 항목 | 상태 | 내용 |
|---|---|---|---|
| 8.1 | 수집 항목 최소화 | 📋 | 온보딩에서 gender, country, language, role_type, goals를 받음. 학습 추천에 꼭 필요한지 결정. 특히 gender |
| 8.2 | 처리방침이 실제 수집 항목과 일치 | ❌ | 처리방침에 gender, country, 학습 목표, 수준 자기평가가 없음 |
| 8.3 | 처리방침이 실제 위탁·제3자와 일치 | ❌ | Vercel이라고 적었지만 실제는 Netlify. **OpenAI**(학생 풀이를 채점에 보냄), Cloudflare Turnstile, Google·Facebook 로그인이 빠져 있음 |
| 8.4 | 운영 주체 표시 | ❌ | 처리방침의 회사명이 `[INSERT COMPANY NAME HERE]` 자리표시자로 비어 있음 |
| 8.5 | 아동 이용자 | ❌ 📋 | 처리방침은 "13세 미만은 보호자 동의"라고 약속하지만 나이 확인이 없음. 대상(Kangaroo, MATHCOUNTS 수준)에 초등·중학생이 많음. 미국 COPPA(13세 미만), 한국 개인정보보호법(14세 미만 법정대리인 동의) 기준. 나이 확인과 보호자 동의 절차, 또는 이용 연령 제한을 결정 |
| 8.6 | 동의 기록 | ⚠️ | "By continuing, you agree…" 문구만 있고 동의 시각·버전을 저장하지 않음 |
| 8.7 | 열람·정정·삭제 요청 처리 | ⚠️ | 처리방침은 권리를 안내하지만 계정 삭제 기능이 없고 문의로만 처리. 계정 삭제 시 지울 테이블 목록과 절차 필요 (`next_auth.*`, `user_stats`, `user_submissions`, `user_category_*`, 커뮤니티 글 처리 방침) |
| 8.8 | 보관 기간 | ⚠️ | 정해지지 않음. 탈퇴 후 보관 기간과 비활성 계정 처리 결정 |
| 8.9 | 로그에 개인정보를 남기지 않음 | 🔧 ⚠️ | 온보딩 초기화 로그의 이메일을 사용자 id로 바꿈. 가입 오류 로그는 오류 코드만 남김. 다른 API 로그도 점검 필요 |
| 8.10 | 사용자 입력 길이·형식 검증 | 🔧 | 닉네임 30자, 성별 30자, 국가 60자, 언어 30자. `is_onboarded`는 true/false만 |
| 8.11 | 사고 대응 | ⚠️ | 유출 시 연락처, 통지 기준(한국 72시간, GDPR 72시간), 키 교체 절차를 문서로 |

## 9. 운영

| # | 항목 | 상태 | 내용 |
|---|---|---|---|
| 9.1 | 비밀값 교체 절차 | ⚠️ | `NEXTAUTH_SECRET`(바꾸면 전원 로그아웃), Supabase 서비스 키, OAuth 비밀, Turnstile 비밀, OpenAI 키 |
| 9.2 | 의존성 보안 업데이트 | ⚠️ | `npm audit`과 Dependabot 알림 켜기 |
| 9.3 | 로그인 실패·차단 모니터링 | ⚠️ | 429 응답, Turnstile 실패 횟수를 볼 곳이 없음 |
| 9.4 | 저장소 공개 여부 | 📋 | 공개 저장소에 내부 문서·SQL이 있음 (문제 검증 문서의 결정 1과 같음) |

---

## 10. 이번에 바꾼 것 (2026-10-17, 아직 배포 전)

| 파일 | 변경 |
|---|---|
| `src/lib/auth.ts` | `update()`로 들어온 값 무시, role·프로필을 DB에서 다시 읽음(로그인 시, `update()` 시, 5분마다), 로그인 오류 메시지 통일, 타이밍 맞춤, IP+이메일 횟수 제한, 이메일 정규화, 어댑터의 anon 키 대체 제거, `requireAdmin()` 추가 |
| `src/lib/credentials.ts` (새 파일) | 비밀번호 정책(72바이트 상한 포함), 이메일 정규화, LIKE 이스케이프, 클라이언트 IP, bcrypt cost |
| `src/lib/rate-limit.ts` | limiter별 저장소 분리, 로그인용 IP·이메일 limiter |
| `src/app/api/auth/register/route.ts` | 이메일 정규화·대소문자 무시 중복 확인, 공통 비밀번호 정책, cost 12, 동시 가입 409, 내부 오류 문구 숨김 |
| `src/app/api/user/profile/route.ts` | 프로필 입력 검증, 공통 비밀번호 정책, cost 12 |
| `src/app/api/user/reset-onboarding/route.ts` | 로그에서 이메일 제거 |
| `src/app/api/admin/*` (4개) | `requireAdmin()`으로 DB 권한 확인, 역할 값 검증 |
| `src/app/api/analyze-problem`, `generate-solution`, `generate-related-problems` | 관리자만 호출 가능 |
| `src/app/login`, `settings`, `onboarding` 페이지 | 공통 비밀번호 정책 사용, `update()`를 새로고침 요청으로만 사용 |
| `supabase/sql/auth_hardening.sql` (새 파일, **실행하지 않음**) | 1부 점검 쿼리, 2부 `user_roles` 공개 읽기 삭제, `next_auth` 권한 회수, 이메일 소문자화(주석 처리) |

배포 후 기존 로그인 사용자는 다시 로그인할 필요가 없습니다. 기존 토큰에는 마지막 확인 시각이 없어서 첫 요청 때 DB에서 role과 프로필을 다시 읽습니다. 그래서 혹시 바꿔 놓은 role이 있었다면 이때 원래대로 돌아갑니다.

## 11. 남은 작업 (우선순위)

1. **❓ → ❌ 확인:** `auth_hardening.sql` 1부 실행. 특히 5.5(anon 키로 문제 쓰기)와 6.3(`next_auth` 노출)
2. **5.5** 관리자 문제 편집을 서버 API로 옮기고 anon 쓰기 정책 제거
3. **6.5** `solutions` 공개 읽기 차단 (정답 확인 API는 이미 서비스 키 사용)
4. **8.2–8.5** 처리방침을 실제와 맞춤, 📋 아동 이용자 정책 결정
5. **2.9** 비밀번호 재설정 (또는 그때까지 링크와 FAQ 문구 수정), **2.8** 이메일 인증
6. **3.3** 횟수 제한을 공유 저장소(Redis)로
7. **2.11 / 4.7** 비밀번호 변경 시 다른 세션 종료
8. **8.7** 계정 삭제 기능, **5.6** 관리자 작업 기록, **7.4** CSP

## 12. 배포 전 확인 시나리오

| # | 시나리오 | 기대 결과 |
|---|---|---|
| 1 | 일반 사용자로 로그인 → 브라우저 콘솔에서 세션 update에 `{ role: "admin" }` 전송 → `/admin` 접속 | `/dashboard`로 이동, `/api/admin/users`는 403 |
| 2 | 관리자 role 해제 → 5분 안에 `/admin` 접속 | 접근 불가 (API는 즉시 403) |
| 3 | 로그아웃 상태로 `POST /api/generate-solution` | 403 |
| 4 | 없는 이메일 / 틀린 비밀번호 / 소셜 전용 계정으로 로그인 | 셋 다 "Invalid email or password", 응답 시간 비슷 |
| 5 | 같은 이메일로 11번 로그인 시도 | 11번째부터 "Too many login attempts" |
| 6 | `Ana@Example.com`으로 가입 후 `ana@example.com`으로 가입 | 409. 로그인은 두 표기 모두 가능 |
| 7 | 73바이트 비밀번호로 가입 | 400, 정책 안내 |
| 8 | 설정에서 닉네임 변경, 온보딩 완료·초기화 | 헤더와 이동이 예전처럼 동작 (DB에서 다시 읽은 값) |
| 9 | 관리자 페이지: 사용자 목록, 역할 변경, 포인트 조정, AI 문제 분석 | 예전처럼 동작 |
