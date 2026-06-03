-- ========================================
-- MathQuest Activity & Progression Schema
-- Execute this in the Supabase SQL Editor
-- ========================================

-- 1. Create user_stats table (1:1 with next_auth.users)
-- Tracks global XP, RP, Tier, and streaks.
CREATE TABLE IF NOT EXISTS public.user_stats (
    user_id UUID PRIMARY KEY REFERENCES next_auth.users(id) ON DELETE CASCADE,
    current_level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    ranking_points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'Bronze III',
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date DATE,
    problems_solved INTEGER DEFAULT 0,
    problems_attempted INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Index for leaderboards
CREATE INDEX IF NOT EXISTS idx_user_stats_rp ON public.user_stats(ranking_points DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_tier ON public.user_stats(tier);

-- 2. Create user_category_stats table (1:N with next_auth.users)
-- Tracks RP and Tier per top-level mathematical category.
CREATE TABLE IF NOT EXISTS public.user_category_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
    category_level1_id INTEGER NOT NULL REFERENCES public.categories(category_id) ON DELETE CASCADE,
    ranking_points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'Bronze III',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, category_level1_id)
);

-- Index for category-specific leaderboards
CREATE INDEX IF NOT EXISTS idx_user_category_stats_rp ON public.user_category_stats(category_level1_id, ranking_points DESC);

-- 3. Create activity_logs table
-- Tracks every action that yields XP or RP.
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES next_auth.users(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- e.g., 'SOLVE_CORRECT', 'SOLVE_INCORRECT', 'DAILY_LOGIN'
    problem_id UUID REFERENCES public.problems(id) ON DELETE SET NULL,
    xp_change INTEGER DEFAULT 0,
    rp_change INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON public.activity_logs(created_at DESC);

-- 4. Enable RLS
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_category_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies
-- Users can view their own stats
DROP POLICY IF EXISTS "Users can view their own stats" ON public.user_stats;
CREATE POLICY "Users can view their own stats" 
    ON public.user_stats FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own category stats" ON public.user_category_stats;
CREATE POLICY "Users can view their own category stats" 
    ON public.user_category_stats FOR SELECT 
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view their own activity logs" 
    ON public.activity_logs FOR SELECT 
    USING (auth.uid() = user_id);

-- Anyone can view leaderboards (assuming public leaderboards, or restricted to authenticated)
-- If we want public leaderboards, we can add a SELECT policy for everyone.
DROP POLICY IF EXISTS "Public leaderboard stats viewing" ON public.user_stats;
CREATE POLICY "Public leaderboard stats viewing" 
    ON public.user_stats FOR SELECT 
    TO public
    USING (true);

DROP POLICY IF EXISTS "Public leaderboard category stats viewing" ON public.user_category_stats;
CREATE POLICY "Public leaderboard category stats viewing" 
    ON public.user_category_stats FOR SELECT 
    TO public
    USING (true);

-- API uses service_role for inserts/updates, bypassing RLS.
