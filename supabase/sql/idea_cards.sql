-- Idea cards: the key idea of a source problem, written in our own words, used to generate new ladders.
-- Internal only: RLS is on and there are no policies, so the website (anon key) can neither read nor
-- write this table. Scripts use the service-role key.
-- Run once in Supabase: Dashboard -> SQL Editor -> paste -> Run.

create table if not exists public.idea_cards (
  id            uuid primary key default gen_random_uuid(),
  source_ref    text not null unique,          -- internal reference to the source problem
  area          text not null check (area in ('algebra', 'combinatorics', 'geometry', 'number_theory')),
  title         text not null,                 -- short name of the idea
  key_idea      text not null,                 -- one or two sentences, own words
  surprise      text,                          -- what makes it non-obvious
  reformulation text,                          -- a useful way to restate the problem
  techniques    text[] not null default '{}',
  prerequisites text[] not null default '{}',
  ladder_seeds  jsonb  not null default '[]',  -- [{ "level": "AMC 8", "idea": "..." }, ...]
  difficulty    smallint check (difficulty between 1 and 10),
  status        text not null default 'draft' check (status in ('draft', 'reviewed', 'used')),
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists idea_cards_area_idx on public.idea_cards (area);
create index if not exists idea_cards_status_idx on public.idea_cards (status);

alter table public.idea_cards enable row level security;
-- No policies on purpose: only the service role (server scripts) can access this table.

comment on table public.idea_cards is 'Internal: key ideas of source problems in our own words. Not shown on the site.';
