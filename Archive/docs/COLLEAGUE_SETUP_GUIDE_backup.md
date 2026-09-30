# MathQuest 개발 환경 공지 (NextAuth & Admin 연동)

안녕하세요! 최근에 구글 로그인(NextAuth) 기능과 관리자(Admin) 대시보드가 추가되었습니다.
두 사람이 **동일한 Supabase 데이터베이스**를 공유해서 사용하고 있기 때문에, DB 스키마는 이미 제가 업데이트를 마쳤습니다! 🎉

따라서 코드를 `pull` 받으신 후 **아래의 간단한 1~3번 과정만** 진행해 주시면 바로 개발에 참여하실 수 있습니다.

---

## 1. 패키지 설치 (`npm install`)
새로운 패키지들(`next-auth`, `@auth/supabase-adapter` 등)이 추가되었으므로 모듈 설치를 한 번 진행해 주세요.
```bash
npm install
```

## 2. 환경 변수 (`.env.local`) 세팅 확인
NextAuth와 서비스 전용 API 우회를 위해 추가된 환경 변수가 있습니다.
본인의 로컬 `.env.local` 파일에 아래 변수들이 모두 들어가 있는지 확인해 주세요! (제가 사용하는 값과 동일하게 복사해 넣으시면 됩니다.)

```env
# Next.js & NextAuth 기본 설정
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_jwt_secret_key_here

# Google OAuth 클라이언트 정보
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# Supabase 공통 키 (기존 보유)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# [추가됨] Supabase Admin (서버 사이드 API 검증용 Role Key)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## 3. 어드민(Admin) 권한 부여 받기
DB를 직접 열어서 수정하실 필요가 **전혀 없습니다!** 웹페이지(UI)에 관리자 권한을 부여하는 기능까지 모두 만들어 두었습니다.

1. 로컬 환경(`localhost:3000`)을 실행시킨 뒤, **구글로 최초 1회 로그인을 진행해 주세요.** (이때 자동으로 일반 'User' 계정이 생성됩니다.)
2. 저에게 슬랙/카톡 등으로 메신저를 보내주세요. ("로그인 완료했습니다!")
3. 제가 제 계정으로 어드민 페이지(`localhost:3000/admin/users`)에 접속해서 **버튼 클릭 한 번으로 Admin 권한을 부여해 드리겠습니다.**
4. 권한 부여가 끝난 뒤, 기존 브라우저를 **새로고침** 하시면 좌측 메뉴 등에 `Admin Dashboard` 버튼이 활성화되는 것을 보실 수 있습니다!

---

### 주요 변경 파일 구조 요약 (충돌 방지 참고용)
- **`src/app/api/auth/[...nextauth]/route.ts`** : 구글 로그인 처리
- **`src/middleware.ts`** : 권한에 따른 라우팅 접근 제어 (`/admin` 접근 차단)
- **`src/app/admin/users/page.tsx`** : 관리자가 직접 다른 유저의 권한을 제어할 수 있는 페이지
- **기존 `_seo` 네이밍 정리** : `header_seo.tsx` ➡️ `header.tsx`, `footer_seo.tsx` ➡️ `footer.tsx` 로 깔끔하게 파일명을 변경했습니다.
