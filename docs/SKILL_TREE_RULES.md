# Skill Tree and Badge Rules (draft v0.1)

- Date: 2026-10-09
- Status: **first version built, not committed yet.** All numbers are starting values and are meant to change;
  they are collected in [section 7](#7-tunable-numbers) and in `RULES` in `src/lib/skillTree.ts` (keep both in sync).
- Code: rules and calculation `src/lib/skillTree.ts`; screen `src/components/SkillTree.tsx`; Trailblazer data
  `src/app/api/user/first-solves/route.ts`; subdomain list `olympiad/ladders/subdomains.py`.
- Related: [OPERATING_POLICY.md](OPERATING_POLICY.md) (6.3 badges, 6.4 skill tree), [CATEGORIES.md](CATEGORIES.md).

---

## 1. Goal

The skill tree shows a student **what they have mastered and what to try next**, topic by topic. Badges reward two
different things:

1. **Depth in one subdomain**: solving many problems in the same small topic (e.g. Congruences).
2. **Strength in a whole domain**: solving hard problems across a big area (e.g. Number Theory).

A student should be able to earn the first badge in a week, and the top badges should take months.

---

## 2. Structure: domains and subdomains

The tree has two levels that students see:

| Level | What it is | Source | Example |
|---|---|---|---|
| **Domain** | a big area | `categories` level 1 | Number Theory |
| **Subdomain** | a small topic inside it | `categories` level 3 | Congruences |

Level 2 (e.g. "Elementary Number Theory") is used only to group subdomains on the screen.

> **Decided 2026-10-09:** subdomains are the categories of `math_Category_Schema.xlsx` (the 102 categories already in
> the database; Korean names in `CATEGORIES.md`) **plus** the 13 olympiad subdomains below, which that list does not
> have. Names on the site stay in English for now. Changing the list means editing `olympiad/ladders/subdomains.py`
> and re-running `olympiad/scripts/apply_subdomains.py`.

**Olympiad subdomains added (ids 103–115):**

| ID | Subdomain | Under |
|---|---|---|
| 103 | Sequences and Recurrences | 11 |
| 104 | Functional Equations | 11 |
| 105 | Floor and Fractional Parts | 11 |
| 106 | Divisors and Divisibility | 22 |
| 107 | Digits and Number Bases | 22 |
| 108 | Combinatorial Reasoning (level-2 group) | 5 |
| 109 | Invariants and Processes | 108 |
| 110 | Extremal Combinatorics | 108 |
| 111 | Pigeonhole Principle | 108 |
| 112 | Games and Strategies | 108 |
| 113 | Combinatorial Geometry | 108 |
| 114 | Double Counting | 24 |
| 115 | Triangle Centres and Circles | 14 |

### 2.1 Every problem needs a subdomain

- Every problem gets exactly one subdomain (`category_level3`).
- Ladder steps take the subdomain of their Challenge unless they are tagged otherwise.
- **Done 2026-10-09:** all 37 problems of the 7 live ladders have a subdomain (27 retagged, old values backed up
  in `olympiad/data/backups/`). The v0.2 and v0.3 draft ladders get theirs from `subdomains.py` when imported.

### 2.2 Which domains are shown

Only domains that have problems are shown. Today that is Number Theory, Combinatorics, Geometry and Algebra. The
other six domains (Analysis, Probability & Statistics, Optimization, Numerical Analysis, Cryptography, Game Theory)
stay hidden until they have at least one complete ladder.

---

## 3. What counts as a solved problem

- A problem counts as **solved** the first time the student's answer is graded correct.
- Each problem counts **once**. Solving it again later does not count again.
- **Hard** means difficulty 7 or more (Hard or Olympiad on the site).
- A **Challenge** is the top problem of a ladder.
- Proof problems after a ladder are not graded, so they do not count (yet).

---

## 4. Badges

### 4.1 Subdomain badges (three tiers)

For each subdomain, for example **Congruences**:

| Tier | Badge | Rule |
|---|---|---|
| Bronze | **Congruences Explorer** | 5 solved problems in the subdomain, from at least 2 different ladders |
| Silver | **Congruences Specialist** | 15 solved, at least 4 of them difficulty 6 or more |
| Gold | **Congruences Virtuoso** | 30 solved, at least 5 of them hard, and at least 2 Challenges |

Why "from at least 2 different ladders": one ladder has 4–7 problems in the same subdomain, so without this rule a
single ladder would give the badge almost by accident.

### 4.2 Domain badges (three tiers)

For each domain, for example **Number Theory**:

| Tier | Badge | Rule |
|---|---|---|
| 1 | **Number Theory Expert** | 10 hard problems in the domain, at least 1 000 domain points, and Explorer in at least 2 of its subdomains |
| 2 | **Number Theory Champion** | 25 hard problems, at least 3 000 domain points, Specialist in at least 2 subdomains, and 5 Challenges |
| 3 | **Number Theory Legend** | 50 hard problems, at least 7 000 domain points, Virtuoso in at least 1 subdomain and Specialist (or higher) in 3 |

**Domain points** = 10 × difficulty for every problem solved in the domain, each problem once. This equals the RP
the site gives for a correct answer, but without bonuses and without counting a re-solve twice, so it is
calculated from the solve record instead of read from `user_category_stats`. 1 000 points is about 13 problems
of difficulty 7 to 8. This is how the "high XP and 10 high-level problems" idea is measured.

### 4.3 Breadth badges

| Badge | Rule |
|---|---|
| **Polymath** | Explorer in subdomains of at least 3 different domains |
| **Universal Mind** | Expert in at least 3 domains |

### 4.4 Ladder badges

| Badge | Rule |
|---|---|
| **First Summit** | finish your first ladder (Challenge solved) |
| **Climber** / **Mountaineer** / **Summiteer** | finish 5 / 20 / 50 ladders |
| **Trailblazer** | among the first 3 students to solve a Challenge (the site already gives these students +50% RP) |

### 4.5 Naming rules

- Subdomain badges: `<Subdomain> Explorer / Specialist / Virtuoso`.
- Domain badges: `<Domain> Expert / Champion / Legend`.
- "Master" is not used for badges, because it is already the top RP tier (15 000 RP), to avoid confusion.
- Names are in English like the rest of the site; a Korean name can be added later as a second label.

---

## 5. General rules

1. **Badges are permanent.** A badge is never taken away, even if rules or problems change later.
2. **Rules change only forward.** If a rule gets harder, students who already earned the badge keep it. If a rule
   gets easier, badges are re-checked and new ones are given.
3. **Only the highest tier is shown** on a node (Bronze is replaced by Silver), but the profile lists the date of
   each tier.
4. **A tier is hidden until it is reachable.** A tier appears only when its subdomain has at least
   1.5 × the problems it needs (for example 23 problems for Specialist). This avoids badges nobody can earn yet.
5. **Earned from the record, not from clicks.** Badges are calculated from graded submissions, so the same rule
   always gives the same result.

---

## 6. The skill tree screen

- **Domain view:** one card per domain with its badge tier, domain points and a progress bar to the next domain badge.
- **Subdomain nodes:** inside a domain, subdomains are grouped by their level-2 category. Each node shows:
  - solved / total problems in that subdomain,
  - the current badge tier (none, Bronze, Silver, Gold),
  - a progress bar to the next tier ("3 more problems, 1 more Challenge").
- **States:** *not started* (grey), *in progress* (outlined), *Explorer or higher* (filled, badge colour).
- **Next step:** each node links to the ladders of that subdomain, starting with the one closest to the student's
  level (same rule as the dashboard recommendations).
- **Connections (later):** optional "try this next" arrows between subdomains (for example Primes → Congruences →
  Diophantine Equations). These are suggestions, not locks; nothing is ever locked.

---

## 7. Tunable numbers

| Rule | Starting value |
|---|---|
| Explorer: problems / different ladders | 5 / 2 |
| Specialist: problems / with difficulty ≥ 6 | 15 / 4 |
| Virtuoso: problems / hard / Challenges | 30 / 5 / 2 |
| "Hard" means difficulty | ≥ 7 |
| Expert: hard problems / domain points / Explorer subdomains | 10 / 1 000 / 2 |
| Champion: hard / points / Specialist subdomains / Challenges | 25 / 3 000 / 2 / 5 |
| Legend: hard / points / Virtuoso + Specialist subdomains | 50 / 7 000 / 1 + 3 |
| Polymath: domains with an Explorer badge | 3 |
| Universal Mind: domains with an Expert badge | 3 |
| Climber / Mountaineer / Summiteer: ladders finished | 5 / 20 / 50 |
| Trailblazer: first solvers of a Challenge | 3 |
| A tier is shown once the subdomain has | 1.5 × the problems it needs |

---

## 8. Status of the work

| # | Work | Status |
|---|---|---|
| 1 | Subdomain list: the categories file plus 13 olympiad subdomains (decided 2026-10-09) | done |
| 2 | Tag every problem with a subdomain: the 7 live ladders done; v0.2/v0.3 drafts tagged on import | done |
| 3 | Enough content: about 3 ladders per subdomain for Specialist, 6 for Virtuoso (today at most 3 per subdomain) | ongoing |
| 4 | Fix the reward bugs: re-solving a problem adds RP and "solved" again; Streak never updates (OPERATING_POLICY.md 4). The skill tree does not depend on them: it counts each problem once from the solve record | app side |
| 5 | Badge calculation, computed on the fly from the solve record (no table); a `user_badges` table (badge, tier, earned date) only when badges must be stored, e.g. to show the date earned | done (v1) |
| 6 | Skill tree screen: badges, domain tabs, subdomain cards with progress to the next tier and their ladders | done (v1) |

The screen only reads data; it does not change XP, RP or any stats table.

---

## 9. Open questions

1. Should a domain badge need subdomain badges at all, or only hard problems and points?
2. Should Challenges count double toward subdomain badges?
3. Should badges be visible to other students (profile, leaderboard), or only to the student?
4. Do we want a seasonal badge (for example "most Challenges this month") or keep all badges permanent?
5. Korean names for badges: English only for now (decided 2026-10-09); revisit when the site gets a Korean version.
