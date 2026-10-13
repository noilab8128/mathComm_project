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

> **Open item:** the subdomain list should follow the file the user mentioned (not received yet). Until then the
> tree uses the level-3 categories of `CATEGORIES.md` plus 13 olympiad subdomains added on 2026-10-09 (table
> below), because the original list misses the topics olympiad problems use most. Sections 3–7 do not depend on
> which list is used; changing the list means editing `subdomains.py` and re-running `apply_subdomains.py`.

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
| 1 | Subdomain list: 13 olympiad subdomains added to `categories` (to be replaced by the user's file if it differs) | done |
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
5. Korean names for badges, or English only?
![](data:image/jpeg;base64,IyBDYXRlZ29yaWVzIOunpO2VkSDqsIDsnbTrk5wKCiMjIPCfk4og7Iuk7KCcIFN1cGFiYXNlIGNhdGVnb3JpZXMg7YWM7J2067iUIOq1rOyhsAoKIyMjIO2FjOydtOu4lCDqtazsobAKYGBgc3FsCkNSRUFURSBUQUJMRSBjYXRlZ29yaWVzICgKICBjYXRlZ29yeV9pZCBJTlRFR0VSIFBSSU1BUlkgS0VZLAogIG5hbWUgVEVYVCBOT1QgTlVMTCwKICBsZXZlbCBJTlRFR0VSIE5PVCBOVUxMIENIRUNLIChsZXZlbCA+PSAxIEFORCBsZXZlbCA8PSAzKSwKICBwYXJlbnRfaWQgSU5URUdFUiBSRUZFUkVOQ0VTIGNhdGVnb3JpZXMoY2F0ZWdvcnlfaWQpCik7CmBgYAoKIyMjIOuNsOydtO2EsCDthrXqs4QKLSAqKkxldmVsIDEqKjogMTDqsJwg7Lm07YWM6rOg66asIChJRDogMS0xMCkKLSAqKkxldmVsIDIqKjogMzXqsJwg7Lm07YWM6rOg66asIChJRDogMTEtNDQsIDEwOCkKLSAqKkxldmVsIDMqKjogNzDqsJwg7Lm07YWM6rOg66asIChJRDogNDUtMTAyLCAxMDMtMTA3LCAxMDktMTE1KQotICoq7LSd7ZWpKio6IDExNeqwnCDsubTthYzqs6DrpqwgKDIwMjYtMTAtMDnsl5Ag7Jis66a87ZS87JWE65OcIOyEuOu2gCDrtoTslbwgMTPqsJwg7LaU6rCALCDslYTrnpgg7ZGcIOywuOqzoCkKCi0tLQoKIyMg8J+TiyBMZXZlbCAxIOy5tO2FjOqzoOumrCAoMTDqsJwpCgp8IElEIHwgTmFtZSB8IOyEpOuqhSB8CnwtLS0tfC0tLS0tLXwtLS0tLS18CnwgMSB8IEFsZ2VicmEgfCDrjIDsiJjtlZkgfAp8IDIgfCBHZW9tZXRyeSB8IOq4sO2VmO2VmSB8CnwgMyB8IEFuYWx5c2lzIHwg7ZW07ISd7ZWZIHwKfCA0IHwgTnVtYmVyIFRoZW9yeSB8IOygleyImOuhoCB8CnwgNSB8IENvbWJpbmF0b3JpY3MgJiBEaXNjcmV0ZSBNYXRoZW1hdGljcyB8IOyhsO2VqeuhoCDrsI8g7J207IKw7IiY7ZWZIHwKfCA2IHwgUHJvYmFiaWxpdHkgJiBTdGF0aXN0aWNzIHwg7ZmV66Wg6rO8IO2GteqzhCB8CnwgNyB8IE9wdGltaXphdGlvbiBUaGVvcnkgfCDstZzsoIHtmZQg7J2066GgIHwKfCA4IHwgTnVtZXJpY2FsIEFuYWx5c2lzIHwg7IiY7LmY7ZW07ISdIHwKfCA5IHwgQ3J5cHRvZ3JhcGh5IHwg7JWU7Zi47ZWZIHwKfCAxMCB8IEdhbWUgVGhlb3J5IHwg6rKM7J6E7J2066GgIHwKCi0tLQoKIyMg8J+TiyBMZXZlbCAyIOy5tO2FjOqzoOumrCAoMzTqsJwpCgojIyMgQWxnZWJyYSAoMSkgLSAz6rCcCnwgSUQgfCBOYW1lIHwgUGFyZW50IHwKfC0tLS18LS0tLS0tfC0tLS0tLS0tfAp8IDExIHwgRWxlbWVudGFyeSBBbGdlYnJhIHwgMSB8CnwgMTIgfCBMaW5lYXIgQWxnZWJyYSB8IDEgfAp8IDEzIHwgQWJzdHJhY3QgQWxnZWJyYSB8IDEgfAoKIyMjIEdlb21ldHJ5ICgyKSAtIDTqsJwKfCBJRCB8IE5hbWUgfCBQYXJlbnQgfAp8LS0tLXwtLS0tLS18LS0tLS0tLS18CnwgMTQgfCBFdWNsaWRlYW4gR2VvbWV0cnkgfCAyIHwKfCAxNSB8IEFuYWx5dGljIEdlb21ldHJ5IHwgMiB8CnwgMTYgfCBEaWZmZXJlbnRpYWwgR2VvbWV0cnkgfCAyIHwKfCAxNyB8IFRvcG9sb2d5IHwgMiB8CgojIyMgQW5hbHlzaXMgKDMpIC0gNOqwnAp8IElEIHwgTmFtZSB8IFBhcmVudCB8CnwtLS0tfC0tLS0tLXwtLS0tLS0tLXwKfCAxOCB8IENhbGN1bHVzIHwgMyB8CnwgMTkgfCBDb21wbGV4IEFuYWx5c2lzIHwgMyB8CnwgMjAgfCBSZWFsIEFuYWx5c2lzIHwgMyB8CnwgMjEgfCBEaWZmZXJlbnRpYWwgRXF1YXRpb25zIHwgMyB8CgojIyMgTnVtYmVyIFRoZW9yeSAoNCkgLSAy6rCcCnwgSUQgfCBOYW1lIHwgUGFyZW50IHwKfC0tLS18LS0tLS0tfC0tLS0tLS0tfAp8IDIyIHwgRWxlbWVudGFyeSBOdW1iZXIgVGhlb3J5IHwgNCB8CnwgMjMgfCBBbmFseXRpYyBOdW1iZXIgVGhlb3J5IHwgNCB8CgojIyMgQ29tYmluYXRvcmljcyAmIERpc2NyZXRlIE1hdGhlbWF0aWNzICg1KSAtIDPqsJwKfCBJRCB8IE5hbWUgfCBQYXJlbnQgfAp8LS0tLXwtLS0tLS18LS0tLS0tLS18CnwgMjQgfCBFbnVtZXJhdGlvbiB8IDUgfAp8IDI1IHwgR3JhcGggVGhlb3J5IHwgNSB8CnwgMjYgfCBMb2dpYyBhbmQgU2V0IFRoZW9yeSB8IDUgfAoKIyMjIFByb2JhYmlsaXR5ICYgU3RhdGlzdGljcyAoNikgLSAy6rCcCnwgSUQgfCBOYW1lIHwgUGFyZW50IHwKfC0tLS18LS0tLS0tfC0tLS0tLS0tfAp8IDI3IHwgUHJvYmFiaWxpdHkgfCA2IHwKfCAyOCB8IFN0YXRpc3RpY3MgfCA2IHwKCiMjIyBPcHRpbWl6YXRpb24gVGhlb3J5ICg3KSAtIDTqsJwKfCBJRCB8IE5hbWUgfCBQYXJlbnQgfAp8LS0tLXwtLS0tLS18LS0tLS0tLS18CnwgMjkgfCBMaW5lYXIgUHJvZ3JhbW1pbmcgfCA3IHwKfCAzMCB8IEludGVnZXIgUHJvZ3JhbW1pbmcgfCA3IHwKfCAzMSB8IE5ldHdvcmsgT3B0aW1pemF0aW9uIHwgNyB8CnwgMzIgfCBEeW5hbWljIFByb2dyYW1taW5nIHwgNyB8CgojIyMgTnVtZXJpY2FsIEFuYWx5c2lzICg4KSAtIDTqsJwKfCBJRCB8IE5hbWUgfCBQYXJlbnQgfAp8LS0tLXwtLS0tLS18LS0tLS0tLS18CnwgMzMgfCBSb290LWZpbmRpbmcgQWxnb3JpdGhtcyB8IDggfAp8IDM0IHwgTnVtZXJpY2FsIEludGVncmF0aW9uIGFuZCBEaWZmZXJlbnRpYXRpb24gfCA4IHwKfCAzNSB8IEludGVycG9sYXRpb24gfCA4IHwKfCAzNiB8IE51bWVyaWNhbCBMaW5lYXIgQWxnZWJyYSB8IDggfAoKIyMjIENyeXB0b2dyYXBoeSAoOSkgLSA06rCcCnwgSUQgfCBOYW1lIHwgUGFyZW50IHwKfC0tLS18LS0tLS0tfC0tLS0tLS0tfAp8IDM3IHwgQ2xhc3NpY2FsIENpcGhlcnMgfCA5IHwKfCAzOCB8IFB1YmxpYy1rZXkgQ3J5cHRvZ3JhcGh5IHwgOSB8CnwgMzkgfCBIYXNoIEZ1bmN0aW9ucyB8IDkgfAp8IDQwIHwgQ3J5cHRvZ3JhcGhpYyBQcm90b2NvbHMgfCA5IHwKCiMjIyBHYW1lIFRoZW9yeSAoMTApIC0gNOqwnAp8IElEIHwgTmFtZSB8IFBhcmVudCB8CnwtLS0tfC0tLS0tLXwtLS0tLS0tLXwKfCA0MSB8IFplcm8tc3VtIEdhbWVzIHwgMTAgfAp8IDQyIHwgTmFzaCBFcXVpbGlicml1bSB8IDEwIHwKfCA0MyB8IENvb3BlcmF0aXZlIGFuZCBOb24tY29vcGVyYXRpdmUgR2FtZXMgfCAxMCB8CnwgNDQgfCBBdWN0aW9uIFRoZW9yeSB8IDEwIHwKCi0tLQoKIyMg8J+TiyBMZXZlbCAzIOy5tO2FjOqzoOumrCAoNTnqsJwpCgojIyMgRWxlbWVudGFyeSBBbGdlYnJhICgxMSkgLSA06rCcCnwgSUQgfCBOYW1lIHwKfC0tLS18LS0tLS0tfAp8IDQ1IHwgUG9seW5vbWlhbHMgfAp8IDQ2IHwgRXF1YXRpb25zIGFuZCBJbmVxdWFsaXRpZXMgfAp8IDQ3IHwgRmFjdG9yaXphdGlvbiB8CnwgNDggfCBFeHBvbmVudHMgYW5kIExvZ2FyaXRobXMgfAoKIyMjIExpbmVhciBBbGdlYnJhICgxMikgLSA06rCcCnwgSUQgfCBOYW1lIHwKfC0tLS18LS0tLS0tfAp8IDQ5IHwgTWF0cmljZXMgYW5kIERldGVybWluYW50cyB8CnwgNTAgfCBWZWN0b3IgU3BhY2VzIHwKfCA1MSB8IExpbmVhciBUcmFuc2Zvcm1hdGlvbnMgfAp8IDUyIHwgRWlnZW52YWx1ZXMgYW5kIEVpZ2VudmVjdG9ycyB8CgojIyMgQWJzdHJhY3QgQWxnZWJyYSAoMTMpIC0gNOqwnAp8IElEIHwgTmFtZSB8CnwtLS0tfC0tLS0tLXwKfCA1MyB8IEdyb3VwIFRoZW9yeSB8CnwgNTQgfCBSaW5nIFRoZW9yeSB8CnwgNTUgfCBGaWVsZCBUaGVvcnkgfAp8IDU2IHwgR2Fsb2lzIFRoZW9yeSB8CgojIyMgRXVjbGlkZWFuIEdlb21ldHJ5ICgxNCkgLSA06rCcCnwgSUQgfCBOYW1lIHwKfC0tLS18LS0tLS0tfAp8IDU3IHwgUGxhbmUgRmlndXJlcyB8CnwgNTggfCBTb2xpZCBGaWd1cmVzIHwKfCA1OSB8IFRyaWdvbm9tZXRyeSB8CnwgNjAgfCBDb25ncnVlbmNlIGFuZCBTaW1pbGFyaXR5IHwKCiMjIyBBbmFseXRpYyBHZW9tZXRyeSAoMTUpIC0gM+qwnAp8IElEIHwgTmFtZSB8CnwtLS0tfC0tLS0tLXwKfCA2MSB8IENvb3JkaW5hdGUgU3lzdGVtcyB8CnwgNjIgfCBFcXVhdGlvbnMgb2YgTGluZXMgYW5kIFBsYW5lcyB8CnwgNjMgfCBDb25pYyBTZWN0aW9ucyB8CgojIyMgRGlmZmVyZW50aWFsIEdlb21ldHJ5ICgxNikgLSAy6rCcCnwgSUQgfCBOYW1lIHwKfC0tLS18LS0tLS0tfAp8IDY0IHwgVGhlb3J5IG9mIEN1cnZlcyB8CnwgNjUgfCBUaGVvcnkgb2YgU3VyZmFjZXMgfAoKIyMjIFRvcG9sb2d5ICgxNykgLSAy6rCcCnwgSUQgfCBOYW1lIHwKfC0tLS18LS0tLS0tfAp8IDY2IHwgQmFzaWMgVG9wb2xvZ2ljYWwgQ29uY2VwdHMgfAp8IDY3IHwgQ29udGludWl0eSBhbmQgQ29ubmVjdGVkbmVzcyB8CgojIyMgQ2FsY3VsdXMgKDE4KSAtIDTqsJwKfCBJRCB8IE5hbWUgfAp8LS0tLXwtLS0tLS18CnwgNjggfCBMaW1pdHMgYW5kIENvbnRpbnVpdHkgfAp8IDY5IHwgRGlmZmVyZW50aWF0aW9uIHwKfCA3MCB8IEludGVncmF0aW9uIHwKfCA3MSB8IFNlcmllcyB8CgojIyMgQ29tcGxleCBBbmFseXNpcyAoMTkpIC0gNOqwnAp8IElEIHwgTmFtZSB8CnwtLS0tfC0tLS0tLXwKfCA3MiB8IENvbXBsZXggTnVtYmVycyBhbmQgUGxhbmUgfAp8IDczIHwgQW5hbHl0aWMgRnVuY3Rpb25zIHwKfCA3NCB8IENhdWNoeSdzIEludGVncmFsIFRoZW9yZW0gfAp8IDc1IHwgUmVzaWR1ZSBUaGVvcmVtIHwKCiMjIyBSZWFsIEFuYWx5c2lzICgyMCkgLSAz6rCcCnwgSUQgfCBOYW1lIHwKfC0tLS18LS0tLS0tfAp8IDc2IHwgTWVhc3VyZSBUaGVvcnkgfAp8IDc3IHwgTGViZXNndWUgSW50ZWdyYXRpb24gfAp8IDc4IHwgRnVuY3Rpb24gU3BhY2VzIHwKCiMjIyBEaWZmZXJlbnRpYWwgRXF1YXRpb25zICgyMSkgLSAy6rCcCnwgSUQgfCBOYW1lIHwKfC0tLS18LS0tLS0tfAp8IDc5IHwgT3JkaW5hcnkgRGlmZmVyZW50aWFsIEVxdWF0aW9ucyB8CnwgODAgfCBQYXJ0aWFsIERpZmZlcmVudGlhbCBFcXVhdGlvbnMgfAoKIyMjIEVsZW1lbnRhcnkgTnVtYmVyIFRoZW9yeSAoMjIpIC0gM+qwnAp8IElEIHwgTmFtZSB8CnwtLS0tfC0tLS0tLXwKfCA4MSB8IFByaW1lcyBhbmQgUHJpbWUgRmFjdG9yaXphdGlvbiB8CnwgODIgfCBDb25ncnVlbmNlcyB8CnwgODMgfCBEaW9waGFudGluZSBFcXVhdGlvbnMgfAoKIyMjIEFuYWx5dGljIE51bWJlciBUaGVvcnkgKDIzKSAtIDLqsJwKfCBJRCB8IE5hbWUgfAp8LS0tLXwtLS0tLS18CnwgODQgfCBQcmltZSBOdW1iZXIgVGhlb3JlbSB8CnwgODUgfCBSaWVtYW5uIFpldGEgRnVuY3Rpb24gfAoKIyMjIEVudW1lcmF0aW9uICgyNCkgLSAz6rCcCnwgSUQgfCBOYW1lIHwKfC0tLS18LS0tLS0tfAp8IDg2IHwgUGVybXV0YXRpb25zIGFuZCBDb21iaW5hdGlvbnMgfAp8IDg3IHwgR2VuZXJhdGluZyBGdW5jdGlvbnMgfAp8IDg4IHwgSW5jbHVzaW9uLUV4Y2x1c2lvbiBQcmluY2lwbGUgfAoKIyMjIEdyYXBoIFRoZW9yeSAoMjUpIC0gNOqwnAp8IElEIHwgTmFtZSB8CnwtLS0tfC0tLS0tLXwKfCA4OSB8IEJhc2ljIFByb3BlcnRpZXMgb2YgR3JhcGhzIHwKfCA5MCB8IFRyZWVzIHwKfCA5MSB8IFBhdGhzIGFuZCBDeWNsZXMgfAp8IDkyIHwgR3JhcGggQ29sb3JpbmcgfAoKIyMjIExvZ2ljIGFuZCBTZXQgVGhlb3J5ICgyNikgLSAz6rCcCnwgSUQgfCBOYW1lIHwKfC0tLS18LS0tLS0tfAp8IDkzIHwgUHJvcG9zaXRpb25hbCBMb2dpYyB8CnwgOTQgfCBQcmVkaWNhdGUgTG9naWMgfAp8IDk1IHwgU2V0IE9wZXJhdGlvbnMgfAoKIyMjIFByb2JhYmlsaXR5ICgyNykgLSA06rCcCnwgSUQgfCBOYW1lIHwKfC0tLS18LS0tLS0tfAp8IDk2IHwgQmFzaWMgTGF3cyBvZiBQcm9iYWJpbGl0eSB8CnwgOTcgfCBDb25kaXRpb25hbCBQcm9iYWJpbGl0eSBhbmQgSW5kZXBlbmRlbmNlIHwKfCA5OCB8IFJhbmRvbSBWYXJpYWJsZXMgYW5kIERpc3RyaWJ1dGlvbnMgfAp8IDk5IHwgRXhwZWN0ZWQgVmFsdWUgYW5kIFZhcmlhbmNlIHwKCiMjIyBTdGF0aXN0aWNzICgyOCkgLSAz6rCcCnwgSUQgfCBOYW1lIHwKfC0tLS18LS0tLS0tfAp8IDEwMCB8IERlc2NyaXB0aXZlIFN0YXRpc3RpY3MgfAp8IDEwMSB8IEVzdGltYXRpb24gYW5kIEh5cG90aGVzaXMgVGVzdGluZyB8CnwgMTAyIHwgUmVncmVzc2lvbiBBbmFseXNpcyB8CgojIyMg7Jis66a87ZS87JWE65OcIOyEuOu2gCDrtoTslbwgKOyKpO2CrCDtirjrpqzsmqksIElEIDEwMy0xMTUpCgrquLDsobQg66qp66Gd7JeQIOyXhuuNmCDsmKzrprztlLzslYTrk5wg7KO87KCc66W8IOy2lOqwgO2WiOyKteuLiOuLpC4g7JuQ67O4IOuqqeuhneydgCBgb2x5bXBpYWQvbGFkZGVycy9zdWJkb21haW5zLnB5YOydtOqzoCwg7KCB7Jqp7J2ACmBvbHltcGlhZC9zY3JpcHRzL2FwcGx5X3N1YmRvbWFpbnMucHlg66GcIO2VqeuLiOuLpC4g6rec7LmZ7J2AIFtTS0lMTF9UUkVFX1JVTEVTLm1kXShTS0lMTF9UUkVFX1JVTEVTLm1kKSDssLjqs6AuCgp8IElEIHwgTmFtZSB8IExldmVsIHwgUGFyZW50IHwKfC0tLS18LS0tLS0tfC0tLS0tLS18LS0tLS0tLS18CnwgMTAzIHwgU2VxdWVuY2VzIGFuZCBSZWN1cnJlbmNlcyB8IDMgfCAxMSB8CnwgMTA0IHwgRnVuY3Rpb25hbCBFcXVhdGlvbnMgfCAzIHwgMTEgfAp8IDEwNSB8IEZsb29yIGFuZCBGcmFjdGlvbmFsIFBhcnRzIHwgMyB8IDExIHwKfCAxMDYgfCBEaXZpc29ycyBhbmQgRGl2aXNpYmlsaXR5IHwgMyB8IDIyIHwKfCAxMDcgfCBEaWdpdHMgYW5kIE51bWJlciBCYXNlcyB8IDMgfCAyMiB8CnwgMTA4IHwgQ29tYmluYXRvcmlhbCBSZWFzb25pbmcgfCAyIHwgNSB8CnwgMTA5IHwgSW52YXJpYW50cyBhbmQgUHJvY2Vzc2VzIHwgMyB8IDEwOCB8CnwgMTEwIHwgRXh0cmVtYWwgQ29tYmluYXRvcmljcyB8IDMgfCAxMDggfAp8IDExMSB8IFBpZ2VvbmhvbGUgUHJpbmNpcGxlIHwgMyB8IDEwOCB8CnwgMTEyIHwgR2FtZXMgYW5kIFN0cmF0ZWdpZXMgfCAzIHwgMTA4IHwKfCAxMTMgfCBDb21iaW5hdG9yaWFsIEdlb21ldHJ5IHwgMyB8IDEwOCB8CnwgMTE0IHwgRG91YmxlIENvdW50aW5nIHwgMyB8IDI0IHwKfCAxMTUgfCBUcmlhbmdsZSBDZW50cmVzIGFuZCBDaXJjbGVzIHwgMyB8IDE0IHwKCi0tLQoKIyMg8J+UjSDsubTthYzqs6Drpqwg7KGw7ZqMIOy/vOumrAoKIyMjIDEuIOyghOyytCDqs4TsuLUg6rWs7KGwIOyhsO2ajApgYGBzcWwKU0VMRUNUIAogIGMxLmNhdGVnb3J5X2lkIGFzIGxldmVsMV9pZCwKICBjMS5uYW1lIGFzIGxldmVsMV9uYW1lLAogIGMyLmNhdGVnb3J5X2lkIGFzIGxldmVsMl9pZCwKICBjMi5uYW1lIGFzIGxldmVsMl9uYW1lLAogIGMzLmNhdGVnb3J5X2lkIGFzIGxldmVsM19pZCwKICBjMy5uYW1lIGFzIGxldmVsM19uYW1lCkZST00gY2F0ZWdvcmllcyBjMQpMRUZUIEpPSU4gY2F0ZWdvcmllcyBjMiBPTiBjMi5wYXJlbnRfaWQgPSBjMS5jYXRlZ29yeV9pZApMRUZUIEpPSU4gY2F0ZWdvcmllcyBjMyBPTiBjMy5wYXJlbnRfaWQgPSBjMi5jYXRlZ29yeV9pZApXSEVSRSBjMS5sZXZlbCA9IDEKT1JERVIgQlkgYzEuY2F0ZWdvcnlfaWQsIGMyLmNhdGVnb3J5X2lkLCBjMy5jYXRlZ29yeV9pZDsKYGBgCgojIyMgMi4g7Yq57KCVIOy5tO2FjOqzoOumrOydmCDsoITssrQg6rK966GcIOyhsO2ajApgYGBzcWwKV0lUSCBSRUNVUlNJVkUgY2F0ZWdvcnlfcGF0aCBBUyAoCiAgU0VMRUNUIAogICAgY2F0ZWdvcnlfaWQsIAogICAgbmFtZSwgCiAgICBsZXZlbCwgCiAgICBwYXJlbnRfaWQsCiAgICBuYW1lOjpURVhUIGFzIHBhdGgKICBGUk9NIGNhdGVnb3JpZXMKICBXSEVSRSBjYXRlZ29yeV9pZCA9IDQ1ICAtLSBQb2x5bm9taWFscwogIAogIFVOSU9OIEFMTAogIAogIFNFTEVDVCAKICAgIGMuY2F0ZWdvcnlfaWQsIAogICAgYy5uYW1lLCAKICAgIGMubGV2ZWwsIAogICAgYy5wYXJlbnRfaWQsCiAgICBjLm5hbWUgfHwgJyA+ICcgfHwgY3AucGF0aAogIEZST00gY2F0ZWdvcmllcyBjCiAgSk9JTiBjYXRlZ29yeV9wYXRoIGNwIE9OIGMuY2F0ZWdvcnlfaWQgPSBjcC5wYXJlbnRfaWQKKQpTRUxFQ1QgcGF0aCBGUk9NIGNhdGVnb3J5X3BhdGggV0hFUkUgbGV2ZWwgPSAxOwotLSBSZXN1bHQ6ICJBbGdlYnJhID4gRWxlbWVudGFyeSBBbGdlYnJhID4gUG9seW5vbWlhbHMiCmBgYAoKIyMjIDMuIO2KueyglSBMZXZlbCAx7J2YIO2VmOychCDsubTthYzqs6Drpqwg6rCc7IiYCmBgYHNxbApTRUxFQ1QgCiAgYzEuY2F0ZWdvcnlfaWQsCiAgYzEubmFtZSwKICBDT1VOVChESVNUSU5DVCBjMi5jYXRlZ29yeV9pZCkgYXMgbGV2ZWwyX2NvdW50LAogIENPVU5UKERJU1RJTkNUIGMzLmNhdGVnb3J5X2lkKSBhcyBsZXZlbDNfY291bnQKRlJPTSBjYXRlZ29yaWVzIGMxCkxFRlQgSk9JTiBjYXRlZ29yaWVzIGMyIE9OIGMyLnBhcmVudF9pZCA9IGMxLmNhdGVnb3J5X2lkCkxFRlQgSk9JTiBjYXRlZ29yaWVzIGMzIE9OIGMzLnBhcmVudF9pZCA9IGMyLmNhdGVnb3J5X2lkCldIRVJFIGMxLmxldmVsID0gMQpHUk9VUCBCWSBjMS5jYXRlZ29yeV9pZCwgYzEubmFtZQpPUkRFUiBCWSBjMS5jYXRlZ29yeV9pZDsKYGBgCgotLS0KCiMjIPCfkqEgQWRtaW4g7Y6Y7J207KeAIO2ZnOyaqQoKIyMjIEFkbWluIFVJ7JeQ7IScIOy5tO2FjOqzoOumrCDshKDtg50g7IucCgpgYGB0eXBlc2NyaXB0Ci8vIDEuIExldmVsIDEg7Lm07YWM6rOg66asIOuhnOuTnApjb25zdCBsZXZlbDFDYXRlZ29yaWVzID0gYXdhaXQgc3VwYWJhc2UKICAuZnJvbSgnY2F0ZWdvcmllcycpCiAgLnNlbGVjdCgnY2F0ZWdvcnlfaWQsIG5hbWUnKQogIC5lcSgnbGV2ZWwnLCAxKQogIC5vcmRlcignY2F0ZWdvcnlfaWQnKTsKCi8vIDIuIExldmVsIDIg7Lm07YWM6rOg66asIOuhnOuTnCAoTGV2ZWwgMSDshKDtg50g7ZuEKQpjb25zdCBsZXZlbDJDYXRlZ29yaWVzID0gYXdhaXQgc3VwYWJhc2UKICAuZnJvbSgnY2F0ZWdvcmllcycpCiAgLnNlbGVjdCgnY2F0ZWdvcnlfaWQsIG5hbWUnKQogIC5lcSgnbGV2ZWwnLCAyKQogIC5lcSgncGFyZW50X2lkJywgc2VsZWN0ZWRMZXZlbDEpCiAgLm9yZGVyKCdjYXRlZ29yeV9pZCcpOwoKLy8gMy4gTGV2ZWwgMyDsubTthYzqs6Drpqwg66Gc65OcIChMZXZlbCAyIOyEoO2DnSDtm4QpCmNvbnN0IGxldmVsM0NhdGVnb3JpZXMgPSBhd2FpdCBzdXBhYmFzZQogIC5mcm9tKCdjYXRlZ29yaWVzJykKICAuc2VsZWN0KCdjYXRlZ29yeV9pZCwgbmFtZScpCiAgLmVxKCdsZXZlbCcsIDMpCiAgLmVxKCdwYXJlbnRfaWQnLCBzZWxlY3RlZExldmVsMikKICAub3JkZXIoJ2NhdGVnb3J5X2lkJyk7CgovLyA0LiDsoITssrQg6rK966GcIOyDneyEsQpjb25zdCBjYXRlZ29yeVBhdGggPSBgJHtsZXZlbDFOYW1lfSA+ICR7bGV2ZWwyTmFtZX0gPiAke2xldmVsM05hbWV9YDsKCi8vIDUuIHByb2JsZW1zIO2FjOydtOu4lOyXkCDsoIDsnqUKYXdhaXQgc3VwYWJhc2UKICAuZnJvbSgncHJvYmxlbXMnKQogIC5pbnNlcnQoewogICAgdGl0bGU6IHByb2JsZW1UaXRsZSwKICAgIGNhdGVnb3J5X2xldmVsMTogc2VsZWN0ZWRMZXZlbDEsICAvLyBJTlRFR0VSOiAxLTEwCiAgICBjYXRlZ29yeV9sZXZlbDI6IHNlbGVjdGVkTGV2ZWwyLCAgLy8gSU5URUdFUjogMTEtNDQKICAgIGNhdGVnb3J5X2xldmVsMzogc2VsZWN0ZWRMZXZlbDMsICAvLyBJTlRFR0VSOiA0NS0xMDMKICAgIGNhdGVnb3J5X3BhdGg6IGNhdGVnb3J5UGF0aCwgICAgICAvLyBURVhUOiAiQWxnZWJyYSA+IEVsZW1lbnRhcnkgQWxnZWJyYSA+IFBvbHlub21pYWxzIgogICAgLy8gLi4uIOq4sO2DgCDtlYTrk5wKICB9KTsKYGBgCgotLS0KCiMjIPCfk5og7LC46rOgCgotICoqY2F0ZWdvcmllc19yb3dzLmNzdioqIC0g7KCE7LK0IOy5tO2FjOqzoOumrCDrjbDsnbTthLAKLSAqKkRBVEFCQVNFX1NDSEVNQS5tZCoqIC0g7KCE7LK0IERCIOyKpO2CpOuniAotICoqQWRtaW4g7Y6Y7J207KeAKiogLSBgL2FkbWluL3Byb2JsZW1zYOyXkOyEnCDsubTthYzqs6Drpqwg7ISg7YOdIFVJIOq1rO2YhCDtlYTsmpQKCg==)ㅋ