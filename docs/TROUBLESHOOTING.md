# Troubleshooting

Known problems and fixes. Merged from the former `TROUBLESHOOTING.md`, `SUPABASE_ERROR_GUIDE.md` and
`BUG_FIX.md` (originals in `Archive/docs/`).

**First, always:** check `.env.local`, restart `npm run dev` after any env change, and read both the
terminal log (server) and the browser console (F12, client).

## Login and session

### Login fails, or "Failed to fetch learning path: {}"
**Cause:** `.env.local` had two `SUPABASE_SERVICE_ROLE_KEY` lines for different Supabase projects. The later
one wins, so the NextAuth adapter talked to the wrong project.
**Fix:** keep exactly one line per variable, all pointing at the same project as `NEXT_PUBLIC_SUPABASE_URL`.
Restart the dev server.

### Email sign-up/login blocked, Turnstile widget missing
**Cause:** the current domain is not registered for the Turnstile widget.
**Fix:** add `localhost` and the production domain in the Cloudflare Turnstile dashboard
([SETUP.md](SETUP.md#3-oauth-turnstile-and-supabase-url-settings)).

### Google/Facebook login: redirect URI mismatch
**Fix:** register `<origin>/api/auth/callback/google` (or `/facebook`) for both localhost and production.

## Supabase

| Message | Cause | Fix |
|---|---|---|
| "Supabase not configured" / "Database not connected" | `NEXT_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` missing | Set them; restart |
| `relation "…" does not exist` | Table missing | See [DATABASE.md](DATABASE.md) for which SQL creates it |
| `new row violates row-level security policy` / `permission denied` | RLS blocks the anon client | Do the write in a server API route with `supabaseAdmin`, or add a policy. Never turn RLS off on the shared database |
| `Could not find the '…' column` | Code sends a column that was dropped or renamed | Compare the payload with `src/lib/database.types.ts` |
| `column "category_level1" is of type integer but expression is of type text` | Category ids are integers (1–103) | Use the ids from `src/lib/categories.ts` |

Supabase Dashboard → Logs → API shows why a request failed.

## Build

### `Parsing ecmascript source code failed — Expected '=>', got '('`
**Cause:** a method with an empty body and a missing `}` (this happened in `src/lib/supabase.ts`).
**Fix:** look at the method just *before* the reported line and close its braces.

### Warning: "Next.js inferred your workspace root" / multiple lockfiles
Another `package-lock.json` exists in a parent folder. Remove it, or set `turbopack.root` in `next.config.ts`.

## OpenAI features

| Symptom | Fix |
|---|---|
| "OpenAI API key is not configured" | `OPENAI_API_KEY` in `.env.local` (starts with `sk-`), file in the project root, restart |
| "Invalid API key" / "Rate limit exceeded" | New key or more credit in the OpenAI dashboard |
| "Failed to parse AI response as JSON" | Look for `Raw AI Response:` in the terminal; the model returned text instead of JSON. Retry, or tighten the prompt |
| Analysis is slow | 5–15 s is normal for image analysis |
| Image not recognised | Keep images ≤ 2048 × 2048; printed text works better than handwriting |
| KaTeX in AI output is wrong | AI output is a draft; the admin reviews it before saving |
