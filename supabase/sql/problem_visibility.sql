-- Which problems students can see (problem verification plan v2, decisions 2 and 3; 2026-11-18).
--
-- Run in the Supabase SQL Editor ONLY AFTER auth_hardening.sql Part 3. Until Part 3 drops the
-- "Admin write problems" / "Admin write hierarchy" policies (FOR ALL USING true), they also allow reading every row,
-- so nothing here would be hidden. Make a backup first (python3 scripts/backup_supabase.py).
--
-- Rules, checked in the database so no page code has to change:
--   rejected by a reviewer                                   -> hidden
--   approved earlier, content changed and automatic check failed -> hidden (decision 3)
--   approved (problems.is_reviewed)                          -> visible
--   ladder problem published before this script ran          -> visible until reviews are finished (transition)
--   anything else (new problems, problems without a source)  -> hidden until approved
-- The service key (admin APIs, review pages, import scripts) is not affected.
-- Note: the old admin problem editor reads with the public key, so it no longer lists hidden problems. Use the
-- Reviews page (/admin/reviews) to see every problem.

-- ---------------------------------------------------------------------------------------------------------------
-- 1. Visibility rule. The transition date is fixed to the moment this script runs.
-- ---------------------------------------------------------------------------------------------------------------
DO $do$
BEGIN
    EXECUTE format($fn$
        CREATE OR REPLACE FUNCTION public.problem_is_visible(pid uuid) RETURNS boolean
        LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $body$
            SELECT CASE
                WHEN s.review_status = 'rejected' THEN false
                WHEN s.review_status = 'needs_recheck' AND s.auto_status = 'failed' THEN false
                WHEN p.is_reviewed THEN true
                WHEN p.source IS NOT NULL AND p.created_at < %L::timestamptz THEN true  -- transition
                ELSE false
            END
            FROM public.problems p
            LEFT JOIN public.problem_verification_status s ON s.problem_id = p.id
            WHERE p.id = pid
        $body$
    $fn$, now());
END $do$;

REVOKE ALL ON FUNCTION public.problem_is_visible(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.problem_is_visible(uuid) TO anon, authenticated, service_role;

-- ---------------------------------------------------------------------------------------------------------------
-- 2. Public read policies use the rule (old "read everything" policies are replaced)
-- ---------------------------------------------------------------------------------------------------------------
-- Both old "read everything" policies must go (the live DB has two); one left behind would keep every row readable.
DROP POLICY IF EXISTS "Public read problems" ON public.problems;
DROP POLICY IF EXISTS "Anyone can view problems" ON public.problems;
DROP POLICY IF EXISTS "Visible problems are readable" ON public.problems;
CREATE POLICY "Visible problems are readable" ON public.problems
    FOR SELECT USING (public.problem_is_visible(id));

DROP POLICY IF EXISTS "Anyone can view problem_hierarchies" ON public.problem_hierarchies;
DROP POLICY IF EXISTS "Public read hierarchy" ON public.problem_hierarchies;
DROP POLICY IF EXISTS "Links between visible problems are readable" ON public.problem_hierarchies;
CREATE POLICY "Links between visible problems are readable" ON public.problem_hierarchies
    FOR SELECT USING (public.problem_is_visible(parent_problem_id) AND public.problem_is_visible(child_problem_id));

-- ---------------------------------------------------------------------------------------------------------------
-- 3. Check: counts as the public key sees them (expected now: 238 visible, 5 hidden). In the policy list, the only
--    SELECT policies on the two tables must be the two created above (plus "Service Role Bypass All", which is ALL).
-- ---------------------------------------------------------------------------------------------------------------
SELECT public.problem_is_visible(id) AS visible, count(*) FROM public.problems GROUP BY 1 ORDER BY 1;
SELECT tablename, policyname, cmd, qual FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('problems', 'problem_hierarchies') ORDER BY tablename, cmd;

-- ---------------------------------------------------------------------------------------------------------------
-- 4. Later, when the existing problems have been reviewed: end the transition (only approved problems are shown).
-- ---------------------------------------------------------------------------------------------------------------
-- CREATE OR REPLACE FUNCTION public.problem_is_visible(pid uuid) RETURNS boolean
-- LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $body$
--     SELECT CASE
--         WHEN s.review_status = 'rejected' THEN false
--         WHEN s.review_status = 'needs_recheck' AND s.auto_status = 'failed' THEN false
--         ELSE p.is_reviewed
--     END
--     FROM public.problems p
--     LEFT JOIN public.problem_verification_status s ON s.problem_id = p.id
--     WHERE p.id = pid
-- $body$;

-- ---------------------------------------------------------------------------------------------------------------
-- Undo (only if something breaks): read everything again. Copies of the old policies:
-- ~/mathquest-backups/<stamp>/policies_before_part3.csv
-- ---------------------------------------------------------------------------------------------------------------
-- DROP POLICY IF EXISTS "Visible problems are readable" ON public.problems;
-- CREATE POLICY "Public read problems" ON public.problems FOR SELECT USING (true);
-- DROP POLICY IF EXISTS "Links between visible problems are readable" ON public.problem_hierarchies;
-- CREATE POLICY "Public read hierarchy" ON public.problem_hierarchies FOR SELECT USING (true);
