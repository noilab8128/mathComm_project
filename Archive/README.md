# Archive

Files that are no longer needed day to day, kept for reference. Nothing here is used by the app or the build.
Archived on 2026-09-26. Git history follows the moves (`git log --follow <file>`).

## docs/

| File | Why archived | Replaced by |
|---|---|---|
| `README.md` | Default create-next-app text | `/README.md` |
| `AI_HANDOVER_GUIDE.md`, `AI_HANDOVER_GUIDE_backup.md` (identical) | Merged | `docs/ARCHITECTURE.md` |
| `PAGE_STRUCTURE.md` | Described the Dec 2025 single-page router (`Dashboard.tsx`, `MainPage`) that no longer exists | `docs/ARCHITECTURE.md` |
| `WORKLOG_2026_03_18.md` | Work log (queue/likes/starts, Turnstile); content merged | `docs/ARCHITECTURE.md`, `docs/DATABASE.md` |
| `COLLEAGUE_SETUP_GUIDE.md`, `COLLEAGUE_SETUP_GUIDE_backup.md` | Merged | `docs/SETUP.md` |
| `SETUP_GUIDE.md`, `SUPABASE_SETUP.md`, `SUPABASE_QUICK_START.md` | Oct 2025 setup, before NextAuth; merged | `docs/SETUP.md` |
| `TROUBLESHOOTING.md`, `SUPABASE_ERROR_GUIDE.md`, `BUG_FIX.md` | Merged | `docs/TROUBLESHOOTING.md` |
| `DATABASE_SCHEMA.md`, `FULL_DB_SCHEMA.md` | Two partly outdated schema docs; merged and checked against code | `docs/DATABASE.md` |
| `LEARNING_PATH_DESIGN.md`, `PROBLEM_RELATIONSHIPS_GUIDE.md` | Built on `problem_relationships`, which the code no longer uses; merged | `docs/LEARNING_PATHS.md` |
| `HIERARCHICAL_SAVE_FIX.md` | Fix for a Nov 2025 save bug | `docs/LEARNING_PATHS.md` §2 |
| `IMPLEMENTATION_SUMMARY.md`, `CATEGORIES_UPDATE_SUMMARY.md` | Oct 2025 change summaries | — |
| `CATEGORY_MATCHING_GUIDE.md` | Oct 2025 AI category-matching notes | `docs/CATEGORIES.md` |
| `2025-11-21_seo.md` | Work log for the Nov 2025 SEO pages | — |
| `seo_test.md` | Early draft of `ai_problem_generation_guide.md` | `/ai_problem_generation_guide.md` |
| `GitSyntax.md` | Personal git cheat sheet | — |

## sql/

| File | Why archived |
|---|---|
| `supabase_hierarchical_migration.sql` | ⚠ **Drops** the problem tables, then recreates `problems`, `solutions`, `problem_hierarchies`. Only reference for their definitions. **Never run it on the shared database.** |
| `supabase_tables_create.sql` | First schema (Oct 2025): `users`, `submissions`, `skill_tree`, `rankings`, `discussions`, `problem_relationships`… no longer used |
| `supabase_rls_policies.sql` | Policies for those old tables |
| `disable_rls.sql` | Turned RLS off on `problems` and `problem_relationships` (development shortcut) |
| `categories_data.sql` | Sample data for an older `categories` layout (text ids); does not match the real table |

## scripts/

One-off debug and migration scripts. They read `.env.local`; run them from the project root if ever needed.

| File | Did |
|---|---|
| `check_db.js` | Printed 3 rows of `next_auth.users` |
| `count_problems.mjs` | Counted `problems` |
| `check_problems.js` | Listed the 20 newest problems |
| `debug_links.js` | Debugged hierarchy links (hard-coded path to `.env.local`) |
| `test_hierarchy.ts` | Printed `problem_hierarchies` rows (its `./src/lib/supabase` import only works from the root) |
| `migrate_hierarchies.js` | Filled `parent_solution_id` on old hierarchy rows (already run, Apr 2026) |

## misc/

| File | Why archived |
|---|---|
| `.next_log.txt`, `.next_pid.txt` | Dev-server output from a teammate's machine |
| `OurVersion.txt` | Two old timestamps |
| `database_tables_structure.csv`, `database_tables_summary.csv` | Nov 2025 table export, outdated |
| `postcss.config.mjs` | Unused: Next.js loads `postcss.config.js` first, and the `@tailwindcss/postcss` plugin it names is not installed |

## olympiad/

From the OlympiadAI folder (`/olympiad`), which was copied in without its git history.

| File | Why archived | Replaced by |
|---|---|---|
| `HANDOFF.md`, `README_old.md`, `RUN.md` | Merged | `olympiad/README.md` |
| `docs/00_…` – `docs/11_…`, `docs/99_CURSOR_INSTRUCTIONS.md` | One-to-three-line stubs; content merged | `olympiad/README.md` |
| `tasks/` | Finished task briefs (Day 1 Thinking Graph, Reasoning Intent upgrade) | — |
