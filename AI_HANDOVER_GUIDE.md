# AI Assistant Handover Guide & Context (MathQuest)

이 문서는 이전 AI 어시스턴트가 최근까지 작업한 핵심 아키텍처 및 구조적 변경 사항을 정리한 것입니다.
새로운 기능 탑재나 버그 수정을 도울 **다음 AI 어시스턴트**는 이 문서를 최우선으로 참고하여 기존 구조와 충돌하지 않는 방향으로 코드를 작성해야 합니다.

---

## 1. Authentication (NextAuth & Supabase)
기존의 하드코딩되거나 커스텀된 인증 방식에서 **NextAuth.js (`@auth/supabase-adapter`) + GoogleProvider** 조합으로 완전 마이그레이션 되었습니다.

- **인증 토큰 및 세션:**
  `src/app/api/auth/[...nextauth]/route.ts` 와 `src/lib/auth.ts` 에서 NextAuth 옵션이 정의됩니다.
  사용자가 로그인할 때, `public.user_roles` 테이블을 조회하여 해당 사용자의 커스텀 권한(`role`: 'admin' 또는 'user')을 가져와 JWT 토큰 및 클라이언트 세션(`session.user.role`) 객체에 주입합니다.
- **스키마 구조:**
  NextAuth는 기본적으로 `next_auth` 스키마(예: `next_auth.users`)에 회원 가입 및 계정 정보를 저장합니다. 회원 권한 등 커스텀 메타데이터는 `public` 스키마 안의 `user_roles` 등 별도 테이블에서 외래키(`user_id`)로 연결하여 관리하고 있습니다.

## 2. 권한 검증 및 Middleware
어드민 페이지(`/admin/*`)는 인가되지 않은 일반 유저가 접근할 수 없어야 합니다.

- **MiddleWare (`src/middleware.ts`):** 
  Request에 포함된 NextAuth Token을 검사하여, 토큰 내의 `role !== 'admin'` 인 상태로 `/admin` 하위 경로에 접근을 시도하면 즉시 `/dashboard` 로 Redirect 시키고 있습니다.
- **API 라우트 권한 검증:**
  API 엔드포인트 내부에서도 `const session = await getServerSession(authOptions)` 를 호출하여, `session.user.role === 'admin'` 이 맞는지를 반드시 한 번 더 검증하고 있습니다. (예: `src/app/api/admin/metrics/route.ts` 참조)

## 3. 컴포넌트 내부 Supabase Client 사용 규칙 (중요)
데이터베이스에 접근하는 방법에 대해 두 가지 클라이언트가 존재하며, 용도에 맞게 엄격히 구분하여 사용해야 합니다.

1. **일반 클라이언트 (`src/lib/supabase.ts`)**
   - 일반적인 클라이언트/서버 컴포넌트에서 데이터를 읽고 쓸 때 사용합니다.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 사용하므로, 데이터베이스의 **RLS(Row Level Security) 정책의 적용을 받습니다.**
2. **관리자(Admin) 전용 클라이언트 (`src/lib/supabase-admin.ts`)**
   - **오로지 안전하게 보호된 서버 사이드 API 라우트 내부(`src/app/api/admin/*`)에서만 사용해야 합니다.** 
   - `SUPABASE_SERVICE_ROLE_KEY`를 사용하므로 보안 검사(RLS)를 우회할 수 있습니다.
   - 주로 `next_auth` 스키마의 유저 목록과 `public` 스키마의 권한 맵핑 테이블을 크로스 조인하여 읽어오거나(예: 로그인한 전체 유저 리스트 가져오기), 다른 사용자의 권한을 변경할 때 사용됩니다.

## 4. Admin UI 
어드민 UI(`src/app/admin`)는 최근에 `page.tsx` 내부의 데스크톱 사이드바 영역에 기능을 추가하는 등 개편되었습니다.

- **UI 구조:**
  어드민 영역에서는 메인 페이지와 별도로 `src/app/admin/layout.tsx` 가 고유의 사이드바/헤더 레이아웃을 제공합니다.
  데스크톱 환경에서는 사이드바 맨 위 영역(로고 우측)에 '축소/확장(Collapse)' 버튼을 두어 공간 활용성을 높였습니다. 
- **DB 연동 상태:**
  하드코딩된 모의(Mock) 데이터가 전부 제거되었습니다. Dashboard의 지표 카드들과 Users Management의 사용자 목록 리스트는 모두 `fetch('/api/admin/*')` 를 통해 실제 DB의 최신값을 동적으로 랜더링하도록 구축되었습니다.

## 5. 기존 컴포넌트 네이밍 규칙 변경사항
- 기존에 어미에 `_seo`가 존재했던 헤더/푸터 컴포넌트들의 파일명과 내보내기(Export) 이름이 모두 일반적인 명칭으로 변경되었습니다.
- (변경 전) `header_seo.tsx` / `HeaderSeo` ➡️ **(변경 후) `header.tsx` / `Header`**
- (변경 전) `footer_seo.tsx` / `FooterSeo` ➡️ **(변경 후) `footer.tsx` / `Footer`**
- 새로운 페이지를 구성하거나 기존 컴포넌트를 import 할 때 이 변경사항을 꼭 확인해 주세요.
