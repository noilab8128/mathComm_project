# Bug Fixes

---

## Bug 1 — Syntax Error in `src/lib/supabase.ts`

### The Problem
App crashed on startup with:
```
Parsing ecmascript source code failed
Expected '=>', got '('
```

**Why:** The `create` method had an **empty body** with no closing `}`. The parser got confused and crashed on the next method (`update`).

```ts
// ❌ BROKEN — create has no body
async create(problem: ...) {

async update(id: string, ...) {   // ← parser fails here
```

### The Fix
Added the missing body to `create`, and fixed all the mismatched closing braces.

```ts
// ✅ FIXED
async create(problem: ...) {
  const { data, error } = await supabase
    .from('problems')
    .insert([problem])
    .select()
    .single();
  if (error) throw error;
  return data;
},
```

**File changed:** `src/lib/supabase.ts`

---

## Bug 2 — Login Fails / "Failed to fetch learning path: {}"

### The Problem
After logging in, the app shows:
```
Failed to fetch learning path: {}
```
And the login itself silently fails or doesn't persist.

**Why:** `.env.local` had **two `SUPABASE_SERVICE_ROLE_KEY` entries** pointing to **different Supabase projects**:

```bash
# First key — correct project (hlofelgwoarolsgesqyl)
SUPABASE_SERVICE_ROLE_KEY=eyJ...hlofelg...

# Second key — WRONG different project (oaintk...) — this one wins!
SUPABASE_SERVICE_ROLE_KEY="eyJ...oaintk..."
```

The second key overrides the first. NextAuth's `SupabaseAdapter` used the wrong key, so it couldn't read/write sessions — breaking both login and all data fetches that depend on a valid session.

### The Fix
Removed the duplicate second `SUPABASE_SERVICE_ROLE_KEY` from `.env.local`.

**File changed:** `.env.local`

### After the Fix
Restart the dev server for the env change to take effect:
```bash
npm run dev
```
Then log in at `http://localhost:3000/login`.
