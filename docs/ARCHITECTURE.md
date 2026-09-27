# Architecture

How the MathQuest app is put together. Read this before changing code. Merged from the former
`AI_HANDOVER_GUIDE.md`, `WORKLOG_2026_03_18.md`, `PAGE_STRUCTURE.md` and `SETUP_GUIDE.md`, then checked
against the code (originals in `Archive/docs/`).

## 1. Pages

| Route | File | Notes |
|---|---|---|
| `/` | `src/app/page.tsx` | Public landing page |
| `/login` | `src/app/login/page.tsx` | Google, Facebook, email + password (Turnstile-protected) |
| `/onboarding` | `src/app/onboarding/page.tsx` | Required once after the first login |
| `/dashboard` | `src/app/dashboard/page.tsx` | Student app. One page that switches views: Home (`User_home_page`), Skill Tree, Problems, Community |
| `/dashboard/stats` | `src/app/dashboard/stats/page.tsx` | Student statistics |
| `/dashboard/community/[id]` | `src/app/dashboard/community/[id]/page.tsx` | Community post with comments |
| `/settings` | `src/app/settings/page.tsx` | Profile settings |
| `/admin` | `src/app/admin/page.tsx` | Admin overview (metrics) |
| `/admin/users` | `src/app/admin/users/page.tsx` | User list, roles, point adjustments |
| `/admin/problems` | `src/app/admin/problems/` | Problem editor, PDF/image import, AI generation, hierarchy view |
| `/admin/notices` | `src/app/admin/notices/page.tsx` | Notices |
| `/about`, `/team`, `/vision`, `/roadmap`, `/careers`, `/partners`, `/social-impact`, `/contact`, `/faq`, `/community-guidelines`, `/terms`, `/privacy`, `/cookie-policy` | `src/app/<route>/page.tsx` | Static marketing and legal pages |

Shared layout pieces: `components/header.tsx` / `Header`, `components/footer.tsx` / `Footer`,
`components/LandingHeader.tsx`, `components/SideNav.tsx`. (The old `header_seo` / `footer_seo` names are gone.)

## 2. Authentication

**NextAuth 4** with the **Supabase adapter** (`@auth/supabase-adapter`).

- Options live in `src/lib/auth.ts`; the handler is `src/app/api/auth/[...nextauth]/route.ts`.
- Providers: Google, Facebook, Credentials (email + bcrypt password; sign-up via `/api/auth/register`,
  checked with Cloudflare Turnstile in `src/lib/turnstile.ts`).
- NextAuth stores users, accounts and sessions in the **`next_auth`** schema, not Supabase Auth.
  App-specific user data lives in `public` tables keyed by `user_id`.
- On sign-in, the JWT gets `role` (from `public.user_roles`, default `user`) and `is_onboarded`. They are
  copied to `session.user.role` and `session.user.is_onboarded`.

### Route protection — `src/middleware.ts`

1. Logged-in user on `/login` → `/dashboard`.
2. `/admin/*` with `role !== 'admin'` → `/dashboard`.
3. Logged-in but not onboarded → forced to `/onboarding` (except `/api/*`).
4. Onboarded user on `/onboarding` → `/dashboard`.

API routes check again on the server: `getServerSession(authOptions)` and, for admin routes,
`session.user.role === 'admin'` (see `src/app/api/admin/metrics/route.ts`).

## 3. Supabase clients — use the right one

| Client | File | Key | RLS | Use in |
|---|---|---|---|---|
| `supabase` | `src/lib/supabase.ts` | anon | applies | Client and server components |
| `supabaseAdmin` | `src/lib/supabase-admin.ts` | service role | **bypassed** | Protected server API routes only |

The service-role client is needed to read `next_auth.users` joined with `public` tables, and to change
other users' roles or points. Never import it into a client component.

`src/lib/supabase.ts` also exports `problemsAPI` and `problemHierarchiesAPI`, which the admin problem pages use.

## 4. API routes

| Route | Methods | Purpose |
|---|---|---|
| `auth/[...nextauth]` | — | NextAuth |
| `auth/register` | POST | Email sign-up |
| `user/profile` | GET, PUT | Profile, onboarding data, tier/points |
| `user/reset-onboarding` | POST | Re-run onboarding |
| `user/stats` | GET | Stats page data |
| `user/queue` | GET, POST, DELETE | "My Queue" — max 5 problems |
| `user/like` | GET, POST | Toggle like |
| `user/start` | GET, POST | Mark a problem started ("Resume" button) |
| `leaderboard` | GET | Rankings by ranking points |
| `categories` | GET | Category tree |
| `community/posts` | GET, POST | List or create posts |
| `community/posts/[id]` | GET, DELETE | Read or delete a post |
| `community/posts/[id]/comments` | GET, POST | Comments (threaded via `parent_id`) |
| `community/posts/[id]/like` | POST | Like a post |
| `grade-solution` | POST | AI-grade a written solution, save it, award XP/RP |
| `analyze-problem` | POST | Admin: extract a problem from an image/PDF |
| `generate-solution` | POST | Admin: draft a step-by-step solution |
| `generate-related-problems` | POST | Admin: generate staged sub-problems |
| `preview` | POST | Render preview |
| `admin/metrics` | GET | Admin dashboard numbers |
| `admin/users` | GET, POST | User list, role changes |
| `admin/users/[id]` | GET | User detail |
| `admin/users/[id]/points` | POST | Adjust a user's points |

## 5. AI features (OpenAI `gpt-4o`)

| Feature | Route | Notes |
|---|---|---|
| Problem import | `analyze-problem` | Text, KaTeX and diagrams from an image or PDF (`pdfjs-dist`) |
| Solution draft | `generate-solution` | Admin reviews before saving |
| Sub-problems | `generate-related-problems` | Reads `ai_problem_generation_guide.md` from the project root **at runtime**. Keep the file there |
| Grading | `grade-solution` | Scores five criteria 0–10 ([GRADING_CRITERIA.md](GRADING_CRITERIA.md)) and stores the result in `user_submissions` |

## 6. Progression and rewards — `src/lib/progression.ts`

- **Ranking points (RP)** decide the **tier**: Bronze III (0) → … → Diamond I (12,000) → Master (15,000).
- **XP** decides the **level**: `level = floor(sqrt(XP / 100)) + 1`.
- Correct answer: XP = 10 + 5 × difficulty, RP = 10 × difficulty (+50% RP for the first solvers).
  A wrong but meaningful attempt earns 2 XP and no RP.
- `grade-solution` writes `activity_logs`, `user_stats` and `user_category_stats`.

> The `problems.xp` column was dropped (`supabase/migrations/remove_xp_column.sql`). XP is now computed from
> difficulty; do not read a per-problem `xp` field.

## 7. Student interactions — `src/hooks/useUserInteractions.ts`

`useMyQueue`, `useLikes` and `useStarts` keep the UI in sync with `user_queue`, `user_likes` and
`user_starts`. They are **optimistic**: the UI updates at once and rolls back if the request fails.
Triggers keep `problems.likes_count` and `problems.starts_count` up to date.

On the home page, started problems show a blue **Resume** button, liked problems a filled pink heart, and
queued problems are left out of recommendations.

## 8. Admin UI

`src/app/admin/layout.tsx` has its own sidebar (Overview, Users, Problems, Notices) with a collapse button on
desktop. All admin data comes from `/api/admin/*`; there is no mock data.

## 9. Open follow-ups

- Swap Turnstile test keys for production keys and register the domain before launch.
- If `problems.likes_count` / `starts_count` drift, recount them with an `UPDATE` in Supabase.
- Recommendations skip queued problems; they could also skip completed ones.
- Unused source files (not imported anywhere): `components/LandingSidebar.tsx`, `components/Leaderboard.tsx`,
  `components/MainPage.tsx`, `components/ProblemHierarchyModal.tsx`, `components/Streak.tsx`,
  `lib/magicSquareProblems.ts`.
