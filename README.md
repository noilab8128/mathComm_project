# MathQuest

A learning platform for high-school and university students who enjoy hard mathematics. Students solve
challenge and Olympiad-style problems, get AI feedback on their written solutions, earn ranking points,
climb tiers, and discuss problems with each other.

Built by NOI.LAB. Repository: `noilab8128/mathComm_project` (work on `develop`, release from `main`).

## Quick start

```bash
npm install
cp .env.example .env.local   # then fill in the real keys (ask a teammate)
npm run dev                  # http://localhost:3000
```

Full setup (OAuth callback URLs, Turnstile, Netlify variables): [docs/SETUP.md](docs/SETUP.md).

## Stack

Next.js 16 (App Router, Turbopack) · React 19 · TypeScript · Tailwind CSS 3 + shadcn/Radix UI ·
Supabase (Postgres) · NextAuth 4 (Google, Facebook, email + password) · OpenAI `gpt-4o` ·
Cloudflare Turnstile · Recharts · ReactFlow · Netlify.

## Repository map

| Path | What it is |
|---|---|
| `src/app/` | Pages and API routes (landing, `/dashboard`, `/admin`, `/api/*`) |
| `src/components/` | UI components; `ui/` holds the shadcn primitives |
| `src/lib/` | Supabase clients, auth options, progression (tiers/levels), helpers |
| `src/hooks/` | Client hooks (`useUserInteractions`: queue, likes, starts) |
| `supabase/sql/` | SQL scripts for the current database, run by hand in the Supabase SQL editor |
| `supabase/migrations/` | Later one-off schema changes |
| `ai_problem_generation_guide.md` | Prompt guide **read at runtime** by `/api/generate-related-problems` — do not move |
| `docs/` | Project documentation (below) |
| `olympiad/` | OlympiadAI research project: Olympiad "DNA" analysis and problem ladders (Python) |
| `Archive/` | Old or superseded files, kept for reference — see [Archive/README.md](Archive/README.md) |

## Documentation

| Doc | Read it when |
|---|---|
| [docs/SETUP.md](docs/SETUP.md) | Setting up a machine or deploying |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Changing code: auth, routing, Supabase clients, API routes, AI features |
| [docs/DATABASE.md](docs/DATABASE.md) | Touching tables or SQL |
| [docs/LEARNING_PATHS.md](docs/LEARNING_PATHS.md) | Working on problem hierarchies, learning paths or ladders |
| [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Something is broken |
| [docs/PRD.md](docs/PRD.md) | Product goals and requirements |
| [docs/GRADING_CRITERIA.md](docs/GRADING_CRITERIA.md) | Changing AI grading |
| [docs/STYLE_GUIDE.md](docs/STYLE_GUIDE.md) | Building UI |
| [docs/CATEGORIES.md](docs/CATEGORIES.md) | Looking up the 103 math categories |
| [olympiad/README.md](olympiad/README.md) | Working on OlympiadAI |
| [docs/WORKLOG_2026_09_26.md](docs/WORKLOG_2026_09_26.md) | Catching up on the 2026-09-26 changes (ladders, clean-up, open issues) |

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
