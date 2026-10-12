-- Problem hints: written in advance, revealed one at a time by the Hint button (free; no XP cost).
-- Members only, like ladder_guides: row level security is on and there is NO read policy, so the public anon key
-- cannot read this table. The site serves it through the signed-in route /api/problems/hints (service-role key).
-- Rows are written by olympiad/ladders/import_ladders_v2.py (the "Hints" section of each ladder).
-- Run once: Supabase Dashboard -> SQL Editor -> paste -> Run.

create table if not exists public.problem_hints (
  problem_id uuid primary key references public.problems(id) on delete cascade,
  hints      jsonb not null default '[]'::jsonb,  -- ["first hint", "second hint"], plain text, math between $...$
  updated_at timestamptz not null default now()
);

alter table public.problem_hints enable row level security;
-- No policies on purpose: only the service role (API route, import script) can read or write.

comment on table public.problem_hints is 'Members-only hints for each problem, shown one at a time by the Hint button.';
