# Level guide — how a step gets its level label

- Date: 2026-10-24
- Based on recent real papers in `Math_Materials/Math/` (read for calibration, never copied): Math Kangaroo 2025
  Kadett (grades 7–8), MATHCOUNTS 2026 State (Target round), AMC 8 2025, AMC 10A 2025, AMC 12 2024–2025,
  AIME 2026 I. Problems are cited only by contest and number.
- Used by: [LADDER_RULES_v2.md](LADDER_RULES_v2.md) section 5 (every step has a level label). Each new ladder has a
  **Level check** section (internal) that says, for every step, which band it matches and why.

## 1. The six labels, easiest first

| Label | Difficulty (site) | What a problem at this level asks for | Calibration from real papers |
|---|---|---|---|
| **Kangaroo** | 2 | One observation; small numbers; a picture, a short list or a logic puzzle; no algebra beyond one unknown | Kangaroo Kadett 2025 #11 (count paths in a small grid), #16 (truth-tellers and liars), #19 (legs, tails and eyes) |
| **MATHCOUNTS** | 4 | One or two standard middle-school tools (Pythagoras, areas and volumes, simple probability, a sum of floors); longer arithmetic is fine (calculator in Target) | MATHCOUNTS 2026 State Target #1 (Pythagoras), #2 (rhombus with an inscribed circle), #5 (sum of floor square roots) |
| **AMC 8** | 5 | Like MATHCOUNTS Sprint; #20–25 need two steps, careful casework or a clever count, still no heavy algebra | AMC 8 2025 #7 (counting with "at least"), #14 (mean and median), #17 (flows between cities) |
| **AMC 10** | 6 | High-school algebra (remainder theorem, Vieta, quadratics), counting with cases, geometry with similar triangles and circles; #11–20 combine two facts; #21–25 need a key idea | AMC 10A 2025 #7 (remainder theorem for a cubic), #12 (counting with conditions), #21 (largest sum-free subset), #23 (angle bisector meets altitude) |
| **AMC 12** | 7 | AMC 10 plus trigonometry, logarithms, complex numbers, sequences and series, harder counting and expected value | AMC 12 2024–2025 #15–25 bands |
| **AIME** | 8 | **Integer answer 0–999.** #1–5: one idea done carefully; #6–10: two ideas combined; #11–15: a deep idea plus long, careful work | AIME 2026 I #4 (a + b + ab, one factoring trick), #8 (divisors of a power by residue), #13 (binomial sums modulo a prime) |

## 2. How to choose the label of a step

1. **Count the moves.** One known fact used once → Kangaroo / MATHCOUNTS / AMC 8 (#1–15). Two facts combined →
   AMC 8 (#16–25) / AMC 10 (#11–20). A key idea that is not a standard fact → AMC 10 (#21–25) / AMC 12 / AIME.
2. **Check the tools.** Trigonometry, logarithms, complex numbers or series → at least AMC 12. Vieta, the
   remainder theorem or Newton sums → at least AMC 10.
3. **Check the size of the work.** Long but routine computation (with a calculator) fits MATHCOUNTS Target; long
   careful casework without a key idea fits AMC 10 (#16–20); a short computation after a deep idea fits AIME #6–10.
4. **"Best possible" questions** (largest, smallest, always) are one band harder than the matching example
   question, unless the case is small enough to check completely by hand.
5. **Compare with a cited real problem** of that band; write it in the Level check.

## 3. Rules for the Challenge

- The Challenge is labelled **AIME** (or AMC 12 when no deep idea is needed).
- **New Challenges labelled AIME have an integer answer from 0 to 999**, like the real AIME (from 2026-10-24).
  When the natural answer is a fraction m/n, ask for m + n; when it is a large number, ask for a remainder or a
  smaller case.
- Older ladders (P1–P21) were made before this rule; several have Challenge answers above 999. They stay as they
  are unless they are reworked.

## 4. Floor

No step below the middle-school competition level: Kangaroo (upper half, #11–30), MATHCOUNTS or AMC 8
(LADDER_RULES_v2.md, rule 5.2). A Kangaroo #1–10 type question is too easy to be a step; put it in a hint instead.
