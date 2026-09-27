-- 통합 어드민 기능(Phase 3)을 위한 데이터베이스 테이블 설계 스크립트
-- Supabase 대시보드의 SQL Editor에 붙여넣고 "RUN" 버튼을 클릭하세요.

----------------------------------------------------------------------
-- 1. 사용자 권한 (user_roles) 테이블 생성
-- 설명: NextAuth 사용자 테이블(next_auth.users)의 id와 연결되어
-- 해당 사용자에게 'admin' 등의 특별한 권한을 부여하는 중간 매핑 테이블입니다.
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    -- NextAuth의 users 테이블 id 컬럼과 FK 연결
    -- (주의: next_auth 스키마의 테이블을 참조합니다)
    user_id UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- 'admin', 'user', 'moderator' 등
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- 한 명의 사용자는 하나의 주 권한을 갖는다고 가정합니다.
    UNIQUE(user_id)
);

-- 인덱스 생성 (접근 속도 최적화)
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);

----------------------------------------------------------------------
-- 2. 공지사항 (notices) 테이블 생성
-- 설명: 서비스 운영 공지사항 게시판의 데이터를 담는 테이블입니다.
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    -- (옵션) 공개 여부: true(게시됨), false(초안/숨김)
    is_published BOOLEAN DEFAULT true,
    -- (옵션) 공지 작성자 (작성을 누른 관리자 ID)
    author_id UUID REFERENCES next_auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 검색이나 정렬을 위한 기본 인덱스
CREATE INDEX IF NOT EXISTS idx_notices_created_at ON public.notices(created_at DESC);

----------------------------------------------------------------------
-- 3. Row Level Security (RLS) 정책 설정
-- 설정 설명: 누구나 테이블 내용을 조회할 수는 있지만(물론 실제 조회는 is_published 만), 
-- 생성/수정/삭제 권한은 service_role (서버사이드) API에 맡깁니다.
----------------------------------------------------------------------
-- user_roles 관련
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- API 키 (Anon 등) 기반 프론트엔드 직접 접근 차단
-- 관리자 검증은 Next.js의 서버(미들웨어, API Route)에서 service_role 키를 사용해 수행합니다.
-- 따라서 public.user_roles의 조회는 공개하되(현재 로직에 맞춰) 쓰기는 보안 스키마를 따릅니다.
CREATE POLICY "Enable read access for all users" ON public.user_roles FOR SELECT USING (true);
CREATE POLICY "Enable all access for service_role" ON public.user_roles USING (current_user = 'service_role');

-- notices 관련
ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for published notices" ON public.notices FOR SELECT USING (is_published = true);
CREATE POLICY "Enable all access for service_role" ON public.notices USING (current_user = 'service_role');

----------------------------------------------------------------------
-- [TIP] 자동 어드민 설정 방법 (선택 사항)
-- 본인 계정을 어드민으로 등록하고 싶으신 경우:
-- 1) Supabase의 `next_auth`.`users` 테이블에서 본인의 email로 된 레코드를 찾습니다.
-- 2) 그 레코드의 `id` 값을 복사한 후 아래의 예시 쿼리를 실행하세요.
--
-- INSERT INTO public.user_roles (user_id, role) 
-- VALUES ('복사해온-본인-유저-id-입력', 'admin');
----------------------------------------------------------------------
