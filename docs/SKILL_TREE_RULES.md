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

### 2.3 The skill map: the category file, competition parts only (decided 2026-10-24)

The Skill Tree follows the team's category file (`math_Category_Schema.xlsx`, `category_1 › category_2 ›
category_3`) and **keeps only the parts that appear in competition problems** (Kangaroo, MATHCOUNTS, AMC, AIME,
olympiads). The 13 olympiad topics added on 2026-10-09 stay in their place under the file's groups. A problem's place
on the map is its `category_level3`, so nothing is re-tagged. The list is `COMPETITION_TOPIC_IDS` in
`src/lib/skillMap.ts`. (This replaces the 16 "core topics" of 2026-10-17.)

**5 fields › 10 areas › 39 topics**

| Field (category_1) | Area (category_2) | Topics (category_3) |
|---|---|---|
| Algebra | Elementary Algebra | Polynomials · Equations and Inequalities · Factorization · Exponents and Logarithms · *Sequences and Recurrences* · *Functional Equations* · *Floor and Fractional Parts* |
| Geometry | Euclidean Geometry | Plane Figures · Solid Figures · Trigonometry · Congruence and Similarity · *Triangle Centres and Circles* |
| | Analytic Geometry | Coordinate Systems · Equations of Lines and Planes · Conic Sections |
| Number Theory | Elementary Number Theory | Primes and Prime Factorization · Congruences · Diophantine Equations · *Divisors and Divisibility* · *Digits and Number Bases* |
| Combinatorics & Discrete Mathematics | Enumeration | Permutations and Combinations · Generating Functions · Inclusion-Exclusion Principle · *Double Counting* |
| | Graph Theory | Basic Properties of Graphs · Trees · Paths and Cycles · Graph Coloring |
| | Logic and Set Theory | Propositional Logic · Set Operations |
| | *Combinatorial Reasoning* | *Invariants and Processes · Extremal Combinatorics · Pigeonhole Principle · Games and Strategies · Combinatorial Geometry* |
| Probability & Statistics | Probability | Basic Laws of Probability · Conditional Probability and Independence · Expected Value and Variance |
| | Statistics | Descriptive Statistics |

*Italic* = the 13 olympiad topics we added (not in the file).

**Left out (not in competition problems):** Analysis (all), Linear Algebra, Abstract Algebra, Differential Geometry,
Topology, Analytic Number Theory, Predicate Logic, Random Variables and Distributions, Estimation and Hypothesis
Testing, Regression Analysis, Optimization Theory, Numerical Analysis, Cryptography, Game Theory (combinatorial
games are under *Games and Strategies*). They stay in the database; they are just not shown.

- With today's 28 ladders, 15 of the 39 topics have problems; the others show as "coming soon".
- To show or hide a topic, edit `COMPETITION_TOPIC_IDS` and this table.

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
| **`<Area>` Navigator** | area (category_2) | Explorer in 2 topics of the same area, e.g. "Elementary Number Theory Navigator". Fills the missing middle level |
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

Decided with the team: a **picture on computers and a list on phones**, showing the map of 2.3. Both use the same
data.

1. **You are here** (top card): the ladder and step the student is on (the same choice as the Home page's Continue
   card), its path `Field › Area › Topic`, a small step bar, the next badge of that topic with what is missing
   ("5 more problems solved · 2 more ladders"), and **Continue**. A new student sees how to start instead.
2. **Your map, computer (768 px and wider):** tabs for the 5 fields (the field holding "you are here" has a pin and
   opens first). The open field is drawn as a tree: the field on top, its areas as columns joined by lines, and each
   area's topics stacked under it as small nodes. A node's circle shows the state: grey outline = not started, dark
   outline = in progress, filled with a badge icon = badge earned, dashed = coming soon; a pin marks "you are here".
   A legend sits under the picture. Clicking a topic shows it under the picture: what its next badge needs and its
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
| Navigator: Explorer topics in one area | 2 |
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
| 7 | Skill map (2.3: file categories, competition parts only, since 2026-10-24), new layout (you are here, picture on computers, list on phones, closest next badges) and 7 new badges (4.6) | built on `develop` (2026-10-17), not committed |

The screen only reads data; it does not change XP, RP or any stats table.

---

## 9. Open questions

1. Should a domain badge need subdomain badges at all, or only hard problems and points?
2. Should Challenges count double toward subdomain badges?
3. Should badges be visible to other students (profile, leaderboard), or only to the student?
4. Do we want a seasonal badge (for example "most Challenges this month") or keep all badges permanent?
5. Korean names for badges: English only for now (decided 2026-10-09); revisit when the site gets a Korean version.
