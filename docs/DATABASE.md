# Database

MathQuest uses one Supabase (Postgres) project. **The live database is the source of truth.** This doc
lists what the code uses and which SQL file (if any) creates it. Merged from the former
`FULL_DB_SCHEMA.md`, `DATABASE_SCHEMA.md` and `WORKLOG_2026_03_18.md` (originals in `Archive/docs/`), then
checked against `src/` and `src/lib/database.types.ts`.

## Schemas

| Schema | Holds |
|---|---|
| `next_auth` | NextAuth users, accounts, sessions, verification tokens |
| `public` | Everything else: problems, student data, community, admin, and the OlympiadAI DNA tables |

## Tables used by the app

### Users and auth

| Table | Purpose | Created by |
|---|---|---|
| `next_auth.users` | Account + profile: `name`, `email`, `image`, `password_hash`, `is_onboarded`, onboarding answers (`role_type`, `goals`, `interested_categories`, `category_levels`) | `supabase/sql/nextauth_supabase_schema.sql` (+ onboarding columns added later) |
| `next_auth.accounts` / `sessions` / `verification_tokens` | Standard NextAuth tables | same |
| `user_roles` | `user_id` → `role` (`admin` / `user` / `moderator`) | `supabase/sql/admin_schema_setup.sql` |

`supabase/sql/nextauth_permissions_fix.sql` turns RLS off on the `next_auth` tables so the adapter can
use them.

### Problems

| Table | Purpose | Created by |
|---|---|---|
| `categories` | 103 categories in 3 levels (`category_id`, `name`, `level`, `parent_id`) — list in [CATEGORIES.md](CATEGORIES.md) | pre-existing, no SQL file in repo; the full list is also in `src/lib/categories.ts` |
| `problems` | `title`, `content` (Markdown + KaTeX), `difficulty` 1–10, `category_level1/2/3`, `category_path`, `level`, `age_range`, `tags`, `concepts`, `diagram_image_url`, `is_generated`, `ai_confidence`, `source`, `license`, `is_reviewed`, `likes_count`, `starts_count`, `completes_count`, `search_vector` | `Archive/sql/supabase_hierarchical_migration.sql` ⚠ |
| `solutions` | Several solutions per problem (`problem_id`, `content`, `sequence_order`) | same ⚠ |
| `problem_hierarchies` | Parent → child problem links: `parent_problem_id`, `parent_solution_id`, `child_problem_id`, `stage_name`, `sequence_order`, `depth`. Each child has one parent. See [LEARNING_PATHS.md](LEARNING_PATHS.md) | same ⚠ |

⚠ That script **drops and recreates** the problem tables. It is in `Archive/sql/` so it is not run by
accident. Read it for the column definitions, but never run it against the shared database.

`problems.xp` was removed by `supabase/migrations/remove_xp_column.sql` (XP now comes from difficulty).

### Student activity

| Table | Purpose | Created by |
|---|---|---|
| `user_queue` | "My Queue" (`user_id`, `problem_id`), max 5 per user, enforced in the API | no SQL file in repo |
| `user_likes` | Liked problems; a trigger updates `problems.likes_count` | no SQL file in repo |
| `user_starts` | Started problems; a trigger updates `problems.starts_count` | no SQL file in repo |
| `user_submissions` | Graded answers: `submitted_answer`, `grading_result` (JSONB), `total_score`, `is_correct` | `supabase/sql/user_submissions_table.sql` |
| `user_stats` | One row per user: `current_level`, `total_xp`, `ranking_points`, `tier`, streaks, solved/attempted counts | `supabase/sql/activity_system_schema.sql` |
| `user_category_stats` | Ranking points and tier per top-level category | same |
| `activity_logs` | XP/RP change log (`action_type`, `problem_id`, `xp_change`, `rp_change`) | same |
| `user_category_levels` | Skill score per leaf category (`level_score`, `is_inferred`) | no SQL file in repo |
| `user_category_level_history` | Skill score changes over time | no SQL file in repo |
| `vw_user_category_levels` (view) | Rolls leaf scores up to parent categories with a recursive CTE | no SQL file in repo |

The trigger function `sync_problem_counts` keeps the like/start counters in sync. If they drift, recount
them with an `UPDATE`.

### Community and admin

| Table | Purpose | Created by |
|---|---|---|
| `community_posts` | `title`, `content`, `category` (`discussions` / `theory` / `peer`), `author_id`, `views` | `supabase/sql/community_schema_setup.sql` |
| `community_comments` | Threaded comments (`parent_id`) | same |
| `community_likes` | One like per user per post | same |
| `notices` | Admin notices (`is_published`) | `supabase/sql/admin_schema_setup.sql` |

## OlympiadAI tables (same project)

`olympiad/scripts/load_dna_seed_v1.py` writes to the same Supabase project, and to the **`public`** schema:
`topic`, `principle_type`, `reasoning_action_type`, `proof_feature_type`, `problem`, `problem_topic`,
`solution`, `solution_proof_feature`, `strategy`, `thinking_graph_node`, `thinking_graph_edge`,
`principle_instance`, `principle_instance_node`, `principle_dependency_edge`.

Schema: `olympiad/schemas/dna_schema_v1.sql`. They hold 10 IMO Shortlist problems and 16 solutions.

> Watch out: `problem` / `solution` (OlympiadAI) sit next to `problems` / `solutions` (app). Moving the
> DNA tables to their own `olympiad` schema would remove the confusion.

## Tables that no longer exist

`users` (public), `submissions`, `user_progress`, `skill_tree`, `rankings`, `discussions`,
`problem_relationships` and `ai_generated_problems_temp` came from the first schema
(`Archive/sql/supabase_tables_create.sql`). No code uses them now. `problem_hierarchies` replaced
`problem_relationships`, `user_stats` replaced `rankings`, and the `community_*` tables replaced
`discussions`.

## Setting up a fresh database

The repo **cannot fully rebuild** the database yet: there is no SQL for `categories`, `user_queue`, `user_likes`,
`user_starts`, `user_category_levels`, `user_category_level_history`, `vw_user_category_levels` or
`sync_problem_counts`, and the problem tables exist only in the destructive archived script.

The reliable way is to dump the live schema:

```bash
npx supabase db dump --db-url "$SUPABASE_DB_URL" --schema public,next_auth > supabase/schema.sql
```

If you must build by hand, the order is:

1. `supabase/sql/nextauth_supabase_schema.sql`, then `nextauth_permissions_fix.sql`
2. `categories` table (`category_id`, `name`, `level`, `parent_id`) filled from `src/lib/categories.ts`
3. Problem tables: copy the `CREATE TABLE` parts (not the `DROP`s) from `Archive/sql/supabase_hierarchical_migration.sql`
4. `supabase/sql/admin_schema_setup.sql`
5. `supabase/sql/user_submissions_table.sql`
6. `supabase/sql/activity_system_schema.sql`
7. `supabase/sql/community_schema_setup.sql`
8. `supabase/migrations/remove_xp_column.sql`
