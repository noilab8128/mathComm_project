-- Answers private (security item B2, 2026-11-20).
--
-- Until now `solutions` (answers and model solutions) had two "read everything" policies, so anyone with the
-- public key could read every answer. The site no longer needs that:
--   - answers are checked on the server with the service key (/api/check-answer, /api/grade-solution)
--   - pages that load problems in the browser no longer ask for solutions (src/lib/supabase.ts, 2026-11-20)
--   - the admin editor and review pages read through admin APIs (service key)
--   - import / check scripts use the service (secret) key
-- The service key is not affected ("Service Role Bypass All" stays).
--
-- Run in the Supabase SQL Editor AFTER the code from 2026-11-20 is on main and deployed. Back up first
-- (python3 scripts/backup_supabase.py). Save the result of step 1 (Export -> CSV) as the backup of these policies.

-- 1. Check first: the policies on solutions (expected: Service Role Bypass All + two SELECT policies with `true`)
SELECT policyname, cmd, roles, qual FROM pg_policies WHERE schemaname = 'public' AND tablename = 'solutions';

-- 2. Drop the "read everything" policies
DROP POLICY IF EXISTS "Anyone can view solutions" ON public.solutions;
DROP POLICY IF EXISTS "Public read solutions" ON public.solutions;

-- 3. Check again: only "Service Role Bypass All" should be left
SELECT policyname, cmd, roles, qual FROM pg_policies WHERE schemaname = 'public' AND tablename = 'solutions';

-- 4. On the site: open a problem as a student, submit a number answer and a written solution; open the admin
--    editor and a review page. All should work as before.

-- ---------------------------------------------------------------------------------------------------------------
-- Undo (only if something breaks): read everything again
-- ---------------------------------------------------------------------------------------------------------------
-- CREATE POLICY "Public read solutions" ON public.solutions FOR SELECT USING (true);
