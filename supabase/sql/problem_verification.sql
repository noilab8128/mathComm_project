-- Problem verification and review tables (stage 2). Plan: Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md §3–§4.
--
-- Run in the Supabase SQL Editor, in order, after a backup (python3 scripts/backup_supabase.py).
-- Nothing here changes `problems`: is_reviewed stays as it is until stage 5 (visibility).
--
-- Access: row level security on and NO policy, like ladder_guides / idea_cards. Only the service key
-- (scripts/verify/report.py --save, and the admin review API of stage 3) can read or write these tables.

-- ---------------------------------------------------------------------------------------------------------------
-- 0. Check first: both ids must be uuid (expected: two rows, data_type = uuid)
-- ---------------------------------------------------------------------------------------------------------------
SELECT table_schema, table_name, data_type
FROM information_schema.columns
WHERE column_name = 'id'
  AND ((table_schema = 'public' AND table_name = 'problems') OR (table_schema = 'next_auth' AND table_name = 'users'));

-- ---------------------------------------------------------------------------------------------------------------
-- 1. Current state per problem (one row per problem)
-- ---------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.problem_verification_status (
    problem_id         uuid PRIMARY KEY REFERENCES public.problems(id) ON DELETE CASCADE,
    content_hash       text        NOT NULL,                         -- fingerprint of title, text, level, solutions
    auto_status        text        NOT NULL DEFAULT 'unverified'
                       CHECK (auto_status IN ('unverified', 'passed', 'warning', 'failed')),
    auto_summary       jsonb       NOT NULL DEFAULT '{}'::jsonb,     -- {"L0": "pass", "L1": "warn", ...}
    review_status      text        NOT NULL DEFAULT 'pending'
                       CHECK (review_status IN ('pending', 'approved', 'changes_requested', 'rejected', 'needs_recheck')),
    required_approvals int         NOT NULL DEFAULT 1 CHECK (required_approvals >= 1),
    approvals          int         NOT NULL DEFAULT 0 CHECK (approvals >= 0),
    last_checked_at    timestamptz,
    last_reviewed_at   timestamptz,
    updated_at         timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------------------------------------------
-- 2. Automatic check history (one row per problem, layer and run)
-- ---------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.problem_verifications (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id   uuid        NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    content_hash text        NOT NULL,
    layer        text        NOT NULL CHECK (layer ~ '^L[0-8]$'),
    status       text        NOT NULL CHECK (status IN ('pass', 'warn', 'fail')),
    details      jsonb       NOT NULL DEFAULT '{}'::jsonb,           -- issues: rule, severity, message
    model        text,                                              -- AI layers only
    run_id       text,                                              -- report time stamp or GitHub Actions run
    created_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS problem_verifications_problem_idx
    ON public.problem_verifications (problem_id, created_at DESC);

-- ---------------------------------------------------------------------------------------------------------------
-- 3. Reviews: several reviewers, several reviews each, with comments. Never edited or deleted.
-- ---------------------------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.problem_reviews (
    id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id   uuid        NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    reviewer_id  uuid        REFERENCES next_auth.users(id) ON DELETE SET NULL,  -- kept if the account is removed
    decision     text        NOT NULL CHECK (decision IN ('approve', 'request_changes', 'reject', 'comment')),
    comment      text,
    content_hash text        NOT NULL,   -- the version of the problem this review is about
    auto_status  text,                   -- automatic result shown to the reviewer at that time
    created_at   timestamptz NOT NULL DEFAULT now(),
    -- request_changes, reject and comment need a comment; approve does not (the API also requires one
    -- when approving a problem whose automatic check failed)
    CONSTRAINT problem_reviews_comment_required
        CHECK (decision = 'approve' OR (comment IS NOT NULL AND length(btrim(comment)) > 0))
);
CREATE INDEX IF NOT EXISTS problem_reviews_problem_idx ON public.problem_reviews (problem_id, created_at);
CREATE INDEX IF NOT EXISTS problem_reviews_reviewer_idx ON public.problem_reviews (reviewer_id, created_at);

-- Review history is permanent: no edits, and no deletes except when the problem itself is deleted (cascade)
-- or the reviewer account is removed (reviewer_id set to null).
CREATE OR REPLACE FUNCTION public.problem_reviews_keep_history() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF NEW.reviewer_id IS NULL AND OLD.reviewer_id IS NOT NULL
           AND NEW.id = OLD.id AND NEW.problem_id = OLD.problem_id AND NEW.decision = OLD.decision
           AND NEW.comment IS NOT DISTINCT FROM OLD.comment AND NEW.content_hash = OLD.content_hash
           AND NEW.created_at = OLD.created_at THEN
            RETURN NEW;  -- ON DELETE SET NULL of a removed reviewer account
        END IF;
        RAISE EXCEPTION 'problem_reviews are permanent: add a new review instead of editing one';
    END IF;
    IF EXISTS (SELECT 1 FROM public.problems WHERE id = OLD.problem_id) THEN
        RAISE EXCEPTION 'problem_reviews are permanent: they are removed only with their problem';
    END IF;
    RETURN OLD;
END $$;

DROP TRIGGER IF EXISTS problem_reviews_keep_history ON public.problem_reviews;
CREATE TRIGGER problem_reviews_keep_history
    BEFORE UPDATE OR DELETE ON public.problem_reviews
    FOR EACH ROW EXECUTE FUNCTION public.problem_reviews_keep_history();

-- ---------------------------------------------------------------------------------------------------------------
-- 4. Access: service key only
-- ---------------------------------------------------------------------------------------------------------------
ALTER TABLE public.problem_verification_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_verifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_reviews             ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.problem_verification_status, public.problem_verifications, public.problem_reviews
    FROM anon, authenticated;

-- ---------------------------------------------------------------------------------------------------------------
-- 5. Check after running: three tables, rls_on = true, no policies
-- ---------------------------------------------------------------------------------------------------------------
SELECT c.relname AS table_name, c.relrowsecurity AS rls_on,
       (SELECT count(*) FROM pg_policies p WHERE p.schemaname = 'public' AND p.tablename = c.relname) AS policies
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relname IN ('problem_verification_status', 'problem_verifications', 'problem_reviews');
