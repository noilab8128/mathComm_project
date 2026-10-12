-- Ladder guides: the Problem analysis and Logic flow of a solution-path ladder (olympiad/ladders/LADDER_RULES_v2.md).
-- Members only: row level security is on and there is NO read policy, so the public anon key cannot read this
-- table. The site serves it through the signed-in route /api/ladders/guide (service-role key).
-- Rows are written by olympiad/ladders/import_ladders_v2.py.
-- Run once: Supabase Dashboard -> SQL Editor -> paste -> Run (or psql with SUPABASE_DB_URL).

create table if not exists public.ladder_guides (
  root_problem_id uuid primary key references public.problems(id) on delete cascade,  -- the ladder's Challenge
  analysis        jsonb not null default '[]'::jsonb,  -- ["observation", ...], plain text, math between $...$
  flow            jsonb not null default '[]'::jsonb,  -- [{"title", "text", "step_problem_id"}, ...] in solution order
  updated_at      timestamptz not null default now()
);

alter table public.ladder_guides enable row level security;
-- No policies on purpose: only the service role (API route, import script) can read or write.

comment on table public.ladder_guides is 'Members-only Problem analysis and Logic flow of solution-path ladders.';
