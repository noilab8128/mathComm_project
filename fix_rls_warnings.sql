-- ==========================================
-- Supabase RLS (Row Level Security) 경고 해결 스크립트
-- 모든 퍼블릭 테이블에 RLS를 활성화하고, 안전한 기본 조회 정책을 설정합니다.
-- 이 스크립트를 Supabase 대시보드의 SQL Editor에서 "RUN" 하세요.
-- ==========================================

-- 1. 기존 주요 테이블들 (supabase_rls_policies.sql 기반)
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view problems" ON public.problems;
CREATE POLICY "Anyone can view problems" ON public.problems FOR SELECT USING (true);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
CREATE POLICY "Users can view their own data" ON public.users FOR SELECT USING (auth.uid() = id);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own submissions" ON public.submissions;
CREATE POLICY "Users can view their own submissions" ON public.submissions FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own progress" ON public.user_progress;
CREATE POLICY "Users can view their own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE public.skill_tree ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view skill tree" ON public.skill_tree;
CREATE POLICY "Anyone can view skill tree" ON public.skill_tree FOR SELECT USING (true);

ALTER TABLE public.rankings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view rankings" ON public.rankings;
CREATE POLICY "Anyone can view rankings" ON public.rankings FOR SELECT USING (true);

ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view discussions" ON public.discussions;
CREATE POLICY "Anyone can view discussions" ON public.discussions FOR SELECT USING (true);

ALTER TABLE public.problem_relationships ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view problem relationships" ON public.problem_relationships;
CREATE POLICY "Anyone can view problem relationships" ON public.problem_relationships FOR SELECT USING (true);

ALTER TABLE public.ai_generated_problems_temp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read for generated problems" ON public.ai_generated_problems_temp;
CREATE POLICY "Enable read for generated problems" ON public.ai_generated_problems_temp FOR SELECT USING (true);

-- 2. 새롭게 추가된 테이블들
ALTER TABLE IF EXISTS public.categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view categories" ON public.categories;
CREATE POLICY "Anyone can view categories" ON public.categories FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.solutions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view solutions" ON public.solutions;
CREATE POLICY "Anyone can view solutions" ON public.solutions FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.problem_hierarchies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view problem_hierarchies" ON public.problem_hierarchies;
CREATE POLICY "Anyone can view problem_hierarchies" ON public.problem_hierarchies FOR SELECT USING (true);

ALTER TABLE IF EXISTS public.user_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;
CREATE POLICY "Users can view their own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE IF EXISTS public.user_category_stats ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own category stats" ON public.user_category_stats;
CREATE POLICY "Users can view their own category stats" ON public.user_category_stats FOR SELECT USING (auth.uid() = user_id);

ALTER TABLE IF EXISTS public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own logs" ON public.activity_logs;
CREATE POLICY "Users can view their own logs" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);

-- 3. 서비스 롤(Service Role)은 언제나 모든 권한 통과
-- Next.js 백엔드 API (supabaseAdmin) 에서 권한 제약 없이 DB에 접근하기 위한 글로벌 정책입니다.
-- (위의 개별 정책들과 중첩 적용되어, 클라이언트에서 찌르면 막히고 서버에서 찌르면 뚫리게 됩니다)
DO $$
DECLARE
    row record;
BEGIN
    FOR row IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        -- 서비스 롤 전용 무적 권한 부여 (이미 존재하면 무시)
        BEGIN
            EXECUTE 'CREATE POLICY "Service Role Bypass All" ON public.' || quote_ident(row.tablename) || 
                    ' USING (current_user = ''service_role'');';
        EXCEPTION WHEN duplicate_object THEN
            -- 무시
        END;
    END LOOP;
END;
$$;
