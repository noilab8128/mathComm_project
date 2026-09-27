# Setup

How to run MathQuest locally and deploy it. Merged from the former `COLLEAGUE_SETUP_GUIDE.md`,
`SETUP_GUIDE.md`, `SUPABASE_QUICK_START.md` and `SUPABASE_SETUP.md` (originals in `Archive/docs/`).

## 1. Install

Requires Node.js 18+.

```bash
npm install
```

## 2. Environment variables

Copy `.env.example` to `.env.local` and fill in real values. Ask a teammate for the shared keys — never
commit `.env.local` (it is git-ignored).

| Variable | Used for | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser/server client (RLS applies) | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin client and NextAuth adapter (bypasses RLS — server only) | Supabase → Settings → API |
| `NEXTAUTH_URL` | `http://localhost:3000` locally; the real domain in production | — |
| `NEXTAUTH_SECRET` | JWT signing | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google login | Google Cloud Console |
| `FACEBOOK_CLIENT_ID` / `FACEBOOK_CLIENT_SECRET` | Facebook login | Facebook Developers |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` / `TURNSTILE_SECRET_KEY` | Bot check on email sign-up/login | Cloudflare Turnstile |
| `OPENAI_API_KEY` | Problem analysis, solution generation, related problems, grading | platform.openai.com |

Restart `npm run dev` after changing `.env.local`.

> Make sure each variable appears **once**. A duplicate `SUPABASE_SERVICE_ROLE_KEY` pointing at a different
> project once broke login entirely (see [TROUBLESHOOTING.md](TROUBLESHOOTING.md)).

## 3. OAuth, Turnstile and Supabase URL settings

Register **both** localhost and the production domain, so one set of keys works everywhere.

**Google** (Cloud Console → APIs & Services → Credentials → your OAuth client → Authorized redirect URIs)
- `http://localhost:3000/api/auth/callback/google`
- `https://<production-domain>/api/auth/callback/google`

**Facebook** (Facebook Developers → your app → Facebook Login → Settings → Valid OAuth Redirect URIs)
- `http://localhost:3000/api/auth/callback/facebook`
- `https://<production-domain>/api/auth/callback/facebook`

**Cloudflare Turnstile** (dashboard → your widget → Settings → Domains)
- `localhost` (and `127.0.0.1`)
- `<production-domain>`

Without a registered domain the widget does not load, and email sign-up/login is blocked.

**Supabase** (Authentication → URL Configuration)
- Site URL: `https://<production-domain>`
- Redirect URLs: `http://localhost:3000/*` plus the production patterns

## 4. Database

The team shares one remote Supabase project, which already has every table. If you use it, nothing needs
to be run. To build a fresh database, see the run order in [DATABASE.md](DATABASE.md#setting-up-a-fresh-database).

## 5. Check it works

```bash
npm run dev
```

1. Open `http://localhost:3000` and use **Log In / Sign Up**.
2. Google, Facebook and email login all succeed.
3. A new user is sent to `/onboarding`; an onboarded user lands on `/dashboard`.
4. Logged out, `/dashboard` and `/admin` redirect away; a non-admin visiting `/admin` goes to `/dashboard`.
5. As an admin, `/admin/problems` loads problems from the database.

## 6. Deploy (Netlify)

`netlify.toml` builds with `next build` and the `@netlify/plugin-nextjs` plugin.

1. Netlify → your site → **Site configuration → Environment variables**.
2. Add every variable from section 2 with the same values as `.env.local`, **except**
   `NEXTAUTH_URL`, which must be the deployed domain (not `localhost`).
3. **Deploys → Trigger deploy → Clear cache and deploy site.**
4. Before launch, replace any Turnstile test keys with production keys.

## Notes

- `.env.local` also contains `EMAIL_SERVER_*` and `EMAIL_FROM`. No code reads them at the moment
  (`nodemailer` is installed but unused).
- OpenAI calls take 5–15 s for image analysis. Set a usage limit in the OpenAI dashboard.
