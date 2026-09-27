-- 소통 게시판(Community Forum) 스키마 셋업
-- 이 스크립트를 Supabase 대시보드의 SQL Editor에 붙여넣고 "RUN" 버튼을 클릭하세요.

----------------------------------------------------------------------
-- 1. community_posts (게시글)
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'discussions', -- 'discussions', 'theory', 'peer' 등
    -- 작성자 연결 (next_auth.users 참조)
    author_id UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_posts_category ON public.community_posts(category);
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);

----------------------------------------------------------------------
-- 2. community_comments (댓글 및 대댓글)
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.community_comments(id) ON DELETE CASCADE, -- 대댓글용
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent_id ON public.community_comments(parent_id);

----------------------------------------------------------------------
-- 3. community_likes (좋아요)
----------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.community_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    -- 유저당 한 게시글에 1번만 좋아요 가능
    UNIQUE(post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_community_likes_post_id ON public.community_likes(post_id);

----------------------------------------------------------------------
-- 4. RLS (Row Level Security) 설정
-- 프론트엔드 API (service_role 사용)를 통해 우회하거나
-- 직접 접근 시의 정책입니다. 본 프로젝트는 Next.js API Routes (service_role)
-- 를 주로 사용하므로, public 접근은 막고 service_role은 전체 허용합니다.
----------------------------------------------------------------------
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;

-- 읽기는 누구나 가능 (옵션)
CREATE POLICY "Enable read access for all users" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON public.community_likes FOR SELECT USING (true);

-- 모든 권한은 서비스 롤에 부여 (API Route를 통한 관리)
CREATE POLICY "Enable all access for service_role" ON public.community_posts USING (current_user = 'service_role');
CREATE POLICY "Enable all access for service_role" ON public.community_comments USING (current_user = 'service_role');
CREATE POLICY "Enable all access for service_role" ON public.community_likes USING (current_user = 'service_role');

-- 기존에 존재하는 경우 무시되므로 안전합니다.
