-- Auth hardening (2026-10-17). Run in the Supabase SQL editor after the matching code change is deployed:
-- the session code now reads user_roles with the service key, so the public read policy is no longer needed.
-- Run part 1 first and look at the results before running part 2.

-- ---------------------------------------------------------------------------------------------------------------
-- Part 1. Checks (read only)
-- ---------------------------------------------------------------------------------------------------------------

-- 1a. Can the public roles (anon, authenticated) touch the next_auth tables? Expected: no rows.
SELECT grantee, table_name, privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'next_auth' AND grantee IN ('anon', 'authenticated', 'PUBLIC')
ORDER BY grantee, table_name;

-- 1b. Policies on tables with personal data, answers and roles. Look for USING (true) on SELECT,
--     and for any INSERT/UPDATE/DELETE policy that anon or authenticated can use.
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('user_roles', 'problems', 'solutions', 'problem_hierarchies', 'user_stats',
                    'user_submissions', 'user_category_stats', 'user_category_levels', 'user_category_level_history')
ORDER BY tablename, cmd;

-- 1c. Tables in public without row level security. Expected: none that hold user data or answers.
SELECT c.relname AS table_name
FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity
ORDER BY 1;

-- 1d. Emails that differ only by letter case (sign-up now stores lower case; older rows may not).
SELECT lower(email) AS email_lower, count(*)
FROM next_auth.users
WHERE email IS NOT NULL
GROUP BY lower(email)
HAVING count(*) > 1;

-- ---------------------------------------------------------------------------------------------------------------
-- Part 2. Changes
-- ---------------------------------------------------------------------------------------------------------------

-- 2a. Admin user ids are no longer readable with the public key.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.user_roles;

-- 2b. nextauth_permissions_fix.sql granted ALL on next_auth to `authenticator`. The app reaches next_auth only
--     with the service key, so this grant is not needed.
REVOKE ALL ON ALL TABLES IN SCHEMA next_auth FROM authenticator;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA next_auth FROM authenticator;
REVOKE ALL ON ALL TABLES IN SCHEMA next_auth FROM anon, authenticated;

-- 2d. 1c (2026-10-17) found user_likes, user_queue and user_starts without row level security, so anyone with the
--     public key could read every user's likes, queue and starts, and insert or delete rows. The app reaches these
--     tables only through API routes with the service key (which ignores RLS). Run after the code change that moved
--     /api/user/stats to the service key is deployed; with no policy, the public key then sees nothing.
ALTER TABLE public.user_likes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_queue  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_starts ENABLE ROW LEVEL SECURITY;

-- 2c. Store existing emails in lower case, only when 1d returned no rows (otherwise merge those accounts first).
-- UPDATE next_auth.users SET email = lower(trim(email)) WHERE email <> lower(trim(email));

-- ---------------------------------------------------------------------------------------------------------------
-- Part 3. Problem write policies (B1). Run only AFTER the code that moved the admin editor's writes to
-- /api/admin/problems and /api/admin/problem-hierarchies is deployed, and the editor was tested on the live site.
-- ---------------------------------------------------------------------------------------------------------------

-- 3a. Check first: every policy on the three tables. Note any write policy (ALL/INSERT/UPDATE/DELETE) whose
--     qual or with_check is `true`; on solutions its name may differ from the two below.
SELECT tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename IN ('problems', 'solutions', 'problem_hierarchies')
ORDER BY tablename, cmd;

-- 3b. Drop the "write for everyone" policies. Reads (Public read …) and Service Role Bypass All stay.
DROP POLICY IF EXISTS "Admin write problems"  ON public.problems;
DROP POLICY IF EXISTS "Admin write hierarchy" ON public.problem_hierarchies;
-- DROP POLICY IF EXISTS "<name from 3a>" ON public.solutions;

-- 3c. Run 3a again: no write policy with `true` should be left on these tables.
