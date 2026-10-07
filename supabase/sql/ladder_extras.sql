-- Ladder extras: what students see after the Challenge (top problem) of a ladder, behind three buttons:
--   similar   - related olympiad problems (citation + one sentence in our own words + link, never the text)
--   research  - Explore question, famous open problem, research field
--   proof     - olympiad proof problems (no points): statement, hints, full written proof
-- Read-only for everyone; rows are written by olympiad/ladders/import_extras.py with the service-role key.
-- Run once in Supabase: Dashboard -> SQL Editor -> paste -> Run.

create table if not exists public.ladder_extras (
  id              uuid primary key default gen_random_uuid(),
  root_problem_id uuid not null references public.problems(id) on delete cascade,  -- the ladder's Challenge
  kind            text not null check (kind in ('similar', 'research', 'proof')),
  sort_order      int  not null default 0,
  title           text not null,
  meta            text,                          -- match strength / status / level, shown as a small label
  body            text not null,                 -- plain text, math between $...$
  hints           text[] not null default '{}',  -- proof problems: revealed one at a time
  solution        text,                          -- proof problems: full written proof
  link            text,                          -- similar problems: official source
  created_at      timestamptz not null default now()
);

create index if not exists ladder_extras_root_idx on public.ladder_extras (root_problem_id, kind, sort_order);

alter table public.ladder_extras enable row level security;

drop policy if exists "ladder_extras are readable by everyone" on public.ladder_extras;
create policy "ladder_extras are readable by everyone"
  on public.ladder_extras for select
  to anon, authenticated
  using (true);
-- No insert/update/delete policies: only the service role (import script) can write.

comment on table public.ladder_extras is 'Content shown after a ladder''s Challenge: similar problems, research, proof problems.';
