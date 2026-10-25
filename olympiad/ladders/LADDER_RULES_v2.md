# Ladder Rules v2 — solution-path ladders

- Date: 2026-10-10
- Status: **in force for new ladders.** Replaces the "Ladder template" (section 4) of
  [LADDERS_v0.1.md](LADDERS_v0.1.md). The rest of that file's rules still apply (see section 8 below).
- Pilot: [pilot_v2/PILOT_A2.md](pilot_v2/PILOT_A2.md).

## 1. The idea in one paragraph

A ladder is no longer a staircase of contest levels (Kangaroo → MATHCOUNTS → AMC 8 → …). It is **the solution
of one hard problem, cut into its moves**. We take key ideas from the idea cards, build a new hard problem (the
**Challenge**), solve it ourselves, and write down how we solved it: a **Problem analysis** (what to notice) and a
**Logic flow** (the moves, in order). Each move becomes one short-answer **step**. A student who climbs the steps
has done every move of the Challenge's solution once.

## 2. Decisions (2026-10-10)

| Decision | Rule |
|---|---|
| Answer format | The Challenge and every step have **one short numeric answer**. No proof grading for now: we have no agreed scoring dimensions for proofs, and AI grading costs money. |
| Visibility | The **Problem analysis** and **Logic flow** are shown **only to signed-up members**. Visitors who are not signed in never see them. |
| Language | **English only** for now. Korean comes later, together with Korean competition data, so text must be easy to translate (section 7). |
| Ideas | A Challenge **may combine several key ideas** (from one or more idea cards). |

## 3. Pipeline (per ladder)

1. **Pick idea card(s)** from `olympiad/data/idea_cards/` (internal). One card or several.
2. **Build the Challenge**: a new hard problem with a short numeric answer (section 4).
3. **Solve it ourselves** completely, in our own words. Never start from the official solution's text.
4. **Problem analysis**: the observations that make the problem solvable (section 6).
5. **Logic flow**: the solution as numbered moves; for each move say *what* is done and *why* (section 6).
6. **One step per move** (section 5).
7. **Check everything by computer**: every answer and every numeric claim in the analysis and flow, in a
   `verify_*.py` script. Use two independent methods for the Challenge when possible (for example a direct search
   and the formula from our solution).
8. **Links** shown after the ladder:
   - *Similar olympiad problems*: citations only (competition, year, number, one sentence in our words).
   - *Research problems*: an Explore question with an honest status, and a famous open problem when one fits.
   - *Similar problems on our site*: other ladders with the same subdomain or the same idea card.
   - *Proof problems* (optional): proof versions of one or two moves, with hints and a full solution, not graded.
9. **Review PDF** (`build_review_pdf.py`) for the human reviewer: problems first, then the answer key, then the
   analysis, flow and solutions.

## 4. Rules for the Challenge

1. **Short numeric answer.** If the natural question has a formula as its answer, ask for one specific case (for
   example n = 2026).
2. **Never the original statement.** Change the setting, the numbers and the question (copyright rule 2.4 of
   LADDERS_v0.1.md). The original problem is listed under *Similar olympiad problems*.
3. **Needs the key idea.** The answer must not be reachable by small-case trial or by guessing from the step
   answers. A good test: the straightforward method (brute force, or the obvious recursion) is far too long by hand.
4. **Several ideas are welcome**, as long as one clear solution path uses all of them.
5. **Different from existing ladders.** If another ladder uses the same card, the Challenge must ask something
   that ladder's steps do not already answer.

## 5. Rules for the steps

1. **One step per move of the logic flow**, in the order of the flow. The number of steps follows the solution
   (usually 4–7), not a fixed template.
2. **Level floor: AMC 8 / Kangaroo / MATHCOUNTS or higher.** No warm-up below that. Each step is labelled with
   its level (MATHCOUNTS, AMC 8, AMC 10, AIME) so students see which steps are hard.
3. **Difficulty does not have to rise.** Solution order comes first; a later step may be easier than an earlier one.
4. **Standalone.** Each step is its own problem on the site, so its statement includes every fact it needs. Never
   write "use your answer from step 2"; state the fact instead.
5. **The number must test the move.** Ask for a number that can only be found by doing that move (for example
   "how much does one more loaf add" for a marginal-cost move), not a number that can be guessed.
6. **"Best possible" questions** (largest, smallest, always, every) are allowed only when the move itself is the
   reason the answer is best, or when the case is small enough to check completely by hand.
7. **Only earlier moves.** A step may use the facts of earlier moves (stated in its text), never later ones.
8. Proof versions of a move do not go in the ladder; they go to the *Proof problems* button.
9. **Give the reason with every fact** (added 2026-10-25). When a step states a general fact (a formula, a
   recursion, "every grid that … can be solved"), its text also says in a sentence why it is true, or an earlier
   step builds it. Never "It is known that …" or "It turns out that …". A step may work out one case (e.g. n = 12)
   and a later step the general version, but the later step must show how the general one comes from the same idea.

## 6. Rules for the Problem analysis and the Logic flow

1. **Our own words**, written from our solution, never copied from an official solution.
2. **Analysis** = 3–6 observations a strong solver makes before solving: what is fixed, what grows fast, what has
   structure, what a small case suggests. It may mention an alternative method and why the main path is better.
3. **Flow** = numbered moves. Each move has: a title, *what* is done, *why* it works or why it is needed, and the
   step it belongs to.
4. **Every numeric claim is checked** by the verify script, the same as the answers. Vague claims ("the optimum
   behaves like 1, 2, …, n") are made precise or removed.
5. **One main path.** If the problem has two solutions, the steps follow the one that teaches best; the other is
   described in one or two sentences in the analysis.
6. **Members only** (section 2). The site already requires sign-in for every app page (`src/middleware.ts`), but
   `ladder_extras` can be read with the public anon key. So the analysis and flow must be served through a
   signed-in API route (pattern: `src/app/api/user/progress/route.ts`), never read from the browser with the anon
   key, and never shown on public pages (landing, info pages, previews).

## 7. Language (English now, Korean later)

- Plain English, short sentences, no wordplay or idioms; names and objects stated explicitly ("Ana", "oven 2").
- Numbers and units written out the same way everywhere (for example "3ⁱ × k² coins").
- Keep problem text, analysis, flow and solutions in separate fields, so each can be translated on its own.

## 8. Rules that still apply from LADDERS_v0.1.md

Section 2 of [LADDERS_v0.1.md](LADDERS_v0.1.md) stays in force: short answer only (2.1), no ambiguity (2.2),
verification by computer and an independent solver (2.3), copyright (2.4), honesty labels for Challenge / Explore
/ Famous open problem (2.5). The idea-card rules stay too: use only the idea, compute every example answer by
script, and skip a card whose solution we do not understand.

## 9. Checklist before review

- [ ] Challenge: short numeric answer, not the original statement, needs the key idea(s), differs from other ladders
- [ ] Our full solution written; analysis (3–6 observations) and flow (numbered moves with what / why / step)
- [ ] One step per move, in flow order, each standalone, each labelled AMC 8 / Kangaroo / MATHCOUNTS or higher
- [ ] Every step's number tests its move; no step needs a later move
- [ ] Every general fact in a step comes with its reason (rule 5.9); no step shows another step's answer
- [ ] Verify script: every answer and every numeric claim of the analysis and flow pass; Challenge checked two ways
- [ ] Links: similar olympiad problems (citations), research (Explore with status), similar site problems
- [ ] Subdomain set in `subdomains.py`; idea card(s) named (internal only); a Theory card exists for the subdomain
      in `src/lib/theory.ts` (add one if not)
- [ ] Hints written (added 2026-10-11): one per step, two for the Challenge, each pointing to the next move without
      the answer, in a `**Hints**` section (`- Step 1: …`); `import_guides_hints.py` passes (no hint contains its
      answer)
- [ ] Review PDF built and read once from start to end
