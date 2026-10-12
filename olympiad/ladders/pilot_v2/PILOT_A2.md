# Pilot Ladder (solution-path structure) — The Cheapest Bakery

- Date: 2026-10-10
- Status: **pilot for review, not imported.** First ladder built with [LADDER_RULES_v2.md](../LADDER_RULES_v2.md).
- Answer check: `python3 ladders/pilot_v2/verify_pilot_a2.py` (27 checks: every answer and every number in the
  analysis, flow and solution; the Challenge three ways).
- Subdomain: Algebra > Elementary Algebra > Equations and Inequalities.
- Internal only: the `Idea card` line names the sources. It is never shown on the site.

---

### Ladder P1 — The Cheapest Bakery

**Idea card:** SL2024-A2 (weights that grow by a fixed factor make the problem copy itself) + SL2023-N3 (count
prime powers layer by layer, as in Legendre's formula). New in this ladder: price one loaf at a time, so the
cheapest plan is "take the cheapest extra costs".

**Setup:** A bakery has ovens numbered 0, 1, 2, 3, … (as many as needed). Baking k loaves in oven number i costs
3ⁱ × k² coins: oven 0 costs k², oven 1 costs 3k², oven 2 costs 9k², and so on. An empty oven costs nothing. The
**extra cost** of a loaf is how much the total cost goes up when that loaf is put into its oven.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | Oven 2 already holds 4 loaves. By how many coins does the total cost go up when a 5th loaf is put into oven 2? | **81** |
| 2 | AMC 8 | Only ovens 0, 1 and 2 may be used, and the baker needs 6 loaves. Inside one oven every new loaf has a larger extra cost than the one before, so the cheapest plan is to add the loaves one at a time, each into the oven where its extra cost is smallest. What is the smallest possible total cost? | **28** |
| 3 | AMC 8 | The k-th loaf in oven i has extra cost 3ⁱ × (2k − 1). Make a list of these extra costs for every oven i = 0, 1, 2, … and every k = 1, 2, 3, …, keeping repeats. How many times does the number 45 appear in the list? | **3** |
| 4 | AMC 10 | In the same list (every 3ⁱ × (2k − 1) with i ≥ 0 and k ≥ 1, repeats kept), how many entries are at most 100? | **76** |
| 5 | AMC 10 | In the same list, what is the sum of all entries that are at most 30? | **363** |
| 6 | AMC 10 | The cheapest way to bake n loaves costs the sum of the n smallest entries of the same list (repeats counted). The 76 entries that are at most 100 add up to 3880. What is the smallest total cost for 80 loaves? | **4294** |
| **Challenge** | AIME | The baker needs exactly 2026 loaves. What is the smallest possible total cost? | **2737260** |

**Problem analysis** *(members only)*
- Two forces pull against each other. Later ovens charge more per loaf (the factor 3ⁱ), but the square k² punishes
  crowding one oven. Putting all 2026 loaves in oven 0 costs 2026² = 4 104 676 coins, so spreading out pays.
- The problem copies itself: ovens 1, 2, 3, … are exactly ovens 0, 1, 2, … with every price tripled. So the best
  cost satisfies best(n) = smallest value of x² + 3 × best(n − x). This is correct but slow: for n = 2026 it means
  comparing about two million splits (1 + 2 + … + 2026 = 2 053 351). We need a better view.
- Think one loaf at a time. The k-th loaf in oven i adds 3ⁱ × k² − 3ⁱ × (k − 1)² = 3ⁱ × (2k − 1). Inside each oven
  these extra costs only grow, which is exactly what makes "always take the cheapest next loaf" safe.
- The extra costs have a clean shape: a power of 3 times an odd number. With 2ⁱ instead of 3ⁱ, the numbers
  2ⁱ × odd are every whole number exactly once (every number is a power of 2 times an odd number), so that version
  costs 1 + 2 + … + n. With 3ⁱ, an odd number m appears once for every power of 3 that divides it.
- Counting and adding such a list goes layer by layer (layer j = 3ʲ × odd numbers), just like Legendre's formula
  counts the powers of a prime in n!.
- Sanity check: treating loaves as continuous gives about (2/3) × n² = 2 736 451 for n = 2026, very close to the
  exact answer 2 737 260.
- Alternative path: the recursion in the second point (the method of Ladder G, which uses 2ⁱ and small n) works for
  small n only.

**Logic flow** *(members only)*
1. **Price one loaf (Step 1).** The k-th loaf in oven i adds 3ⁱ × (2k − 1) coins. *Why:* a hard choice about whole
   plans becomes many small choices about single loaves.
2. **Take the cheapest loaves (Step 2).** Build the plan loaf by loaf, each time where the extra cost is smallest.
   *Why it works:* inside every oven the extra costs grow (3ⁱ × 1, 3ⁱ × 3, 3ⁱ × 5, …), so the loaves of any plan in
   one oven use the first few entries of that oven's list. Any plan costs at least the sum of the n smallest
   entries, and the greedy plan costs exactly that.
3. **Describe the whole list (Step 3).** The entries are 3ⁱ × (odd number). An odd number m appears once for each
   i with 3ⁱ dividing m, so 45 = 3² × 5 appears 3 times (45 × 1, 15 × 3, 5 × 9). *Why:* now the list can be counted
   without writing it out.
4. **Count layer by layer (Step 4).** The entries up to M are the odd numbers up to M, plus 3 × (odd numbers up to
   M/3), plus 9 × (odd numbers up to M/9), and so on. Up to 100: 50 + 17 + 6 + 2 + 1 = 76. *Why:* this tells us
   where the n cheapest entries stop.
5. **Add layer by layer (Step 5).** The first t odd numbers add up to t², so layer j adds 3ʲ × t². Up to 30:
   15² + 3 × 5² + 9 × 2² + 27 × 1² = 225 + 75 + 36 + 27 = 363. *Why:* the total cost is this sum.
6. **Find the cutoff and finish (Step 6).** Take every entry up to the largest odd M whose count is at most n, then
   the next entries just above M (watching for repeats). *Why:* the n cheapest entries are exactly these.

**Our full solution**
By moves 1 and 2 of the flow, the smallest total cost for n loaves is the sum of the n smallest numbers in the list of
3ⁱ × (2k − 1), repeats counted. For n = 2026 take M = 2697. The layers up to M hold 1349, 450, 150, 50, 17, 6, 2
and 1 entries (odd numbers up to 2697, 899, 299, 99, 33, 11, 3 and 1), together 2025 entries with sum
1349² + 3 × 450² + 9 × 150² + 27 × 50² + 81 × 17² + 243 × 6² + 729 × 2² + 2187 × 1² = 2 734 561. The next entry is
2699, which is not a multiple of 3, so it appears once and is the 2026th entry. The answer is
2 734 561 + 2699 = **2 737 260**. A cheapest plan puts 1350, 450, 150, 50, 17, 6, 2 and 1 loaves into ovens 0 to 7
(each oven holds about a third of the one before). Computer check: a direct search over all splits, the greedy
plan, and this formula all give 2 737 260; the formula and the direct search agree for every n ≤ 400.

**Short solutions**
- Step 1: 9 × 5² − 9 × 4² = 225 − 144 = 81 (that is 9 × (2 × 5 − 1)).
- Step 2: the extra costs are 1, 3, 5, 7, 9, … (oven 0), 3, 9, 15, … (oven 1) and 9, 27, … (oven 2). The six
  smallest are 1, 3, 3, 5, 7, 9: total 28, for example 4 loaves in oven 0 and 2 in oven 1 (16 + 3 × 4 = 28).
  A full check of all splits also gives 28.
- Step 3: 45 = 3ⁱ × odd for i = 0 (45), i = 1 (3 × 15) and i = 2 (9 × 5): 3 times.
- Step 4: odd numbers up to 100, 33, 11, 3, 1: 50 + 17 + 6 + 2 + 1 = 76.
- Step 5: 15² + 3 × 5² + 9 × 2² + 27 × 1² = 363.
- Step 6: the 4 entries after 100 are 101, 103, 105, 105 (105 = 3 × 35 appears twice): 3880 + 414 = 4294.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2024 A2 *(Strong)*: minimise the sum of 2ⁱ × xᵢ² when the whole numbers xᵢ add up to n, for every
  n. Our Challenge with doubling instead of tripling; there every whole number appears exactly once in the list.
- IMO Shortlist 2023 N3 *(Related)*: compares how many times 10 and 9 divide n! using Legendre's formula, which
  counts prime powers layer by layer, the same counting move as Steps 4 and 5.

**Similar problems on our site**
- Ladder G "Stickers That Double" (draft v0.2): the same cost rule with doubling, solved with the recursion.

**Explore** — *Status: not searched in the literature yet.*
Use 4ⁱ instead of 3ⁱ. Which numbers appear in the list of extra costs now, and how often? What is the cheapest
cost for 2026 loaves? For which factors w does every whole number appear in the list exactly once?

**Proof problem** *(not graded)*
Prove that adding the loaves one at a time, each where its extra cost is smallest, gives the cheapest plan.
- Hint 1: in one oven, the extra costs of the 1st, 2nd, 3rd, … loaf are 3ⁱ × 1, 3ⁱ × 3, 3ⁱ × 5, …
- Hint 2: the cost of any plan is the sum of the extra costs of its loaves, oven by oven.
- Solution: a plan with kᵢ loaves in oven i costs 3ⁱ × kᵢ² = 3ⁱ × (1 + 3 + … + (2kᵢ − 1)) in that oven, which is
  the sum of the first kᵢ entries of oven i's list. So every plan's cost is a sum of n entries of the full list,
  and it is at least the sum of the n smallest entries. The greedy plan takes exactly the n smallest entries
  (inside each oven it takes them in order, because they grow), so it reaches this lower bound.

**Research field:** discrete convex optimisation (greedy allocation with increasing extra costs); p-adic counting.
