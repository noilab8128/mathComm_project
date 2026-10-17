# Skill Tree and Badge Rules (v0.2)

- Date: 2026-10-09; updated 2026-10-17 (new layout, more badges: sections 1, 4.6, 6)
- Status: **v1 live; v0.2 layout and badges built on `develop`.** All numbers are starting values and are meant to change;
  they are collected in [section 7](#7-tunable-numbers) and in `RULES` in `src/lib/skillTree.ts` (keep both in sync).
- Code: rules and calculation `src/lib/skillTree.ts`; screen `src/components/SkillTree.tsx`; Trailblazer data
  `src/app/api/user/first-solves/route.ts`; subdomain list `olympiad/ladders/subdomains.py`.
- Related: [OPERATING_POLICY.md](OPERATING_POLICY.md) (6.3 badges, 6.4 skill tree), [CATEGORIES.md](CATEGORIES.md).

---

## 1. Goal

The skill tree shows a student **where they are**: the ladder and step they are on, and its place in the
three-level category map (field › group › topic). It also shows **what they have mastered and what to try next**,
topic by topic. Badges reward, above all, two different things:

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

### 2.3 The skill map: 16 core topics (decided 2026-10-17)

The 70 level-3 categories are too many to show, especially on phones. The Skill Tree therefore shows its own short
**3-level map**: **field (4) › area (2 per field) › core topic (2 per area) = 16 core topics**. Each core topic
gathers one or more level-3 categories, so the categories and problem tags in the database stay unchanged. Badges
are earned per core topic (Explorer / Specialist / Virtuoso), per area (Navigator) and per field (Expert / Champion /
Legend). The map is defined in `src/lib/skillMap.ts`.

| Field | Area | Core topic | Categories gathered (level 3) |
|---|---|---|---|
| Algebra | Equations and Inequalities | Inequalities and Optimization | 46 |
| | | Polynomials and Factoring | 45, 47, 48 |
| | Functions and Sequences | Sequences, Sums and Floors | 103, 105 |
| | | Functional Equations | 104 |
| Number Theory | Divisibility | Primes and Divisors | 81, 106, 84, 85 |
| | | Congruences | 82 |
| | Equations and Digits | Diophantine Equations | 83 |
| | | Digits and Bases | 107 |
| Combinatorics | Counting | Counting and Probability | 86, 87, 88, 114, 96–99 |
| | | Graphs | 89–92 |
| | Combinatorial Reasoning | Invariants and Games | 109, 112 |
| | | Extremal and Pigeonhole | 110, 111, 113 |
| Geometry | Triangles and Circles | Triangle Centres and Circles | 115 |
| | | Congruence and Similarity | 60, 57 |
| | Measurement | Lengths, Areas and Trigonometry | 59, 58 |
| | | Coordinates and Vectors | 61, 62, 63 |

- With today's 28 ladders, 11 core topics have ladders; Polynomials, Graphs, Congruence and Similarity, Lengths and
  Areas, and Coordinates and Vectors show as "coming soon".
- A category not in this table is not shown on the map. To add a topic, add it to `skillMap.ts` and this table.

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

### 4.5 Naming rules (see 4.6 for the badges added later)

- Subdomain badges: `<Subdomain> Explorer / Specialist / Virtuoso`.
- Domain badges: `<Domain> Expert / Champion / Legend`.
- "Master" is not used for badges, because it is already the top RP tier (15 000 RP), to avoid confusion.
- Names are in English like the rest of the site; a Korean name can be added later as a second label.

### 4.6 Badges added 2026-10-17 (more kinds of badges, as the team asked)

| Badge | Kind | Rule |
|---|---|---|
| **`<Area>` Navigator** | area (middle level of the map, 2.3) | Explorer in 2 core topics of the same area, e.g. "Divisibility Navigator". Fills the missing middle level |
| **Cartographer** | breadth | problems solved in 5 different areas |
| **Thorough** | ladder | 3 ladders finished with every step solved, not only the Challenge |
| **First Try** / **Sharpshooter** | style | 1 / 5 Challenges correct on the first attempt |
| **Persistent** / **Unstoppable** | style | 1 / 5 problems solved after 3 or more wrong attempts |

- First Try and Persistent come from the attempt record (`user_submissions`: every attempt is saved), read by
  `/api/user/first-solves` for the signed-in user only.
- Not built yet, because the data is not recorded: **Independent Solver** (finish a ladder without opening a hint;
  hint use is not logged) and **streak badges** (the streak never updates, OPERATING_POLICY.md 4).

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

## 6. The skill tree screen (layout of 2026-10-17)

Decided with the team: a **picture on computers and a list on phones**, showing the 16 core topics of 2.3 (not the
70 categories). Both use the same data.

1. **You are here** (top card): the ladder and step the student is on (the same choice as the Home page's Continue
   card), its path `Field › Area › Core topic`, a small step bar, the next badge of that topic with what is missing
   ("5 more problems solved · 2 more ladders"), and **Continue**. A new student sees how to start instead.
2. **Your map, computer (768 px and wider):** tabs for the 4 fields (the field holding "you are here" has a pin and
   opens first). The open field is drawn as a small tree: the field on top, its 2 areas, and its 4 core topics as
   circles. A circle shows solved / total, and its style shows the state: grey outline = not started, dark outline =
   in progress, filled with a badge icon = badge earned, dashed "soon" = no ladders yet. "You are here" sits over
   the current topic. Clicking a circle shows that topic under the picture: what its next badge needs and its
   ladders with Start / Continue / Review.
3. **Your map, phone:** the same fields as a list. A field opens to its areas and topics, one line each (state
   dot, name, badge, solved / total); a topic opens to its ladders. "Coming soon" topics are greyed.
4. **My badges**: earned badges, then the **closest next badges** (the 3 reachable badges with the most progress),
   each with its requirement bars.
5. **How badges work**: the rules, folded.

Every state is read from the solve record; nothing is ever locked.

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
| Navigator: Explorer core topics in one area | 2 |
| Cartographer: areas with a solved problem | 5 |
| Thorough: ladders with every step solved | 3 |
| First Try / Sharpshooter: Challenges right on the first attempt | 1 / 5 |
| Persistent / Unstoppable: problems solved after 3+ wrong attempts | 1 / 5 |
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
| 7 | Skill map of 16 core topics (2.3), new layout (you are here, picture on computers, list on phones, closest next badges) and 7 new badges (4.6) | built on `develop` (2026-10-17), not committed |

The screen only reads data; it does not change XP, RP or any stats table.

---

## 9. Open questions

1. Should a domain badge need subdomain badges at all, or only hard problems and points?
2. Should Challenges count double toward subdomain badges?
3. Should badges be visible to other students (profile, leaderboard), or only to the student?
4. Do we want a seasonal badge (for example "most Challenges this month") or keep all badges permanent?
5. Korean names for badges: English only for now (decided 2026-10-09); revisit when the site gets a Korean version.
