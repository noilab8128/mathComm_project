# Solution-path ladders v2 — batch 6 (P27–P31)

- Date: 2026-10-24
- Status: **checked, ready to import.** Built with [LADDER_RULES_v2.md](../LADDER_RULES_v2.md); levels set with
  [LEVEL_GUIDE.md](../LEVEL_GUIDE.md). Challenge answers are AIME-format integers from 0 to 999.
- Answer check: `python3 ladders/v2/verify_v2_batch6.py`.
- Chosen to fill Skill Tree topics that had no ladders: Descriptive Statistics, Exponents and Logarithms, Expected
  Value, Pigeonhole Principle, Congruence and Similarity.
- Internal only: the `Idea card` lines name the sources. They are never shown on the site.

---

### Ladder P27 — Fair Rounding

**Idea card:** SL2023-A1 (only the fractional parts matter: give everyone the integer part, then the leftover units to
the largest fractional parts; the error is twice the sum of the smallest fractional parts, which is at most twice
their average share; equal fractional parts are the worst case).

**Setup:** Some kittens each have a bowl, and the bowl sizes (positive real numbers of kilograms) add up to a whole
number of kilograms. The keeper hands out exactly that many kilograms of food, in whole kilograms (0, 1, 2, … kg per
kitten). A kitten with a bowl of
c kg that gets N kg has error |N − c|, and the total error is the sum over all kittens. The keeper always hands out the
food so that the total error is as small as possible.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | Three bowls hold 1.5, 1.5 and 3 kg, and the keeper hands out 6 kg. What is the smallest possible total error? | **1** |
| 2 | AMC 8 | Three bowls hold 2.3, 4.6 and 1.1 kg, and the keeper hands out 8 kg. What is the smallest possible total error? Give your answer as a fraction. | **4/5** |
| 3 | AMC 10 | Seven bowls each hold 3/7 kg, and the keeper hands out 3 kg. What is the smallest possible total error? Give your answer as a fraction. | **24/7** |
| 4 | AMC 12 | There are 8 kittens whose bowls add up to 8 kg. Over all possible bowl sizes, what is the largest total error the keeper can be forced into? | **4** |
| **Challenge** | AIME | There are 25 kittens whose bowls add up to 25 kg. Over all possible bowl sizes, the largest total error the keeper can be forced into is a fraction m/k in lowest terms. Find m + k. | **337** |

**Problem analysis** *(members only)*
- The whole parts of the bowl sizes can always be matched exactly, so only the fractional parts f₁, …, fₙ matter.
- After giving everyone the whole part, R kilograms are left, where R = f₁ + … + fₙ is a whole number. The best plan
  gives 1 extra kg to the R kittens with the largest fractional parts.
- The total error is then 2 × (sum of the n − R smallest fractional parts). The smallest n − R values are at most
  their share of the average, so the error is at most 2R(n − R)/n.
- Equal fractional parts make this an equality, so the worst case is the largest value of 2R(n − R)/n over whole
  numbers R.
- For n = 25 the best R is 12 or 13: 2 · 12 · 13/25 = 312/25, so m + k = 337.

**Logic flow** *(members only)*
1. **Feel the rounding (Step 1).** Round one 1.5 up and one down: total error 1.
2. **Only fractional parts matter (Step 2).** Give the whole parts, then the leftover kilos to the largest fractional
   parts. *Why:* it gives the best plan for any bowls.
3. **Equal fractional parts (Step 3).** With all parts equal to R/n the error is 2R(n − R)/n. *Why:* this is the worst
   shape.
4. **The bound (Step 4).** The n − R smallest parts add up to at most (n − R) · R/n, so the error is at most
   2R(n − R)/n; for n = 8 the worst case is 4.
5. **Apply (Challenge).** For n = 25: R = 12 or 13 gives 312/25; m + k = 337.

**Our full solution**
Let there be n = 25 kittens. Write each bowl size as cᵢ = wᵢ + fᵢ with wᵢ a whole number and 0 ≤ fᵢ < 1. Then
R = f₁ + … + fₙ = 25 − Σwᵢ is a whole number between 0 and n − 1. In a best plan every kitten gets wᵢ or wᵢ + 1 kg (if one kitten got more than wᵢ + 1, some
other got less than wᵢ, and moving 1 kg between them does not increase the error). So exactly R kittens get wᵢ + 1,
and the error is Σ over the others of fᵢ plus Σ over the R chosen of (1 − fᵢ) = 2 × (sum of fᵢ over the n − R kittens not
chosen); this is smallest when the chosen ones have the largest fᵢ, leaving the n − R smallest. The n − R smallest
fractional parts add up to at most (n − R)/n of the total R, so the error is at most 2R(n − R)/n. For n = 25 this is
largest at R = 12 or 13: 2 · 12 · 13/25 = 312/25. Equality: 12 bowls of 1 + 13/25 kg and 13 bowls of 13/25 kg (total
12 + 13 = 25 kg) have all fractional parts equal to 13/25, and the error is 2 · 12 · 13/25. So the answer is
312 + 25 = **337**. Computer check: the best plan computed for the bowls of Steps 1–4 and the Challenge example, and
the bound 2R(n − R)/n tested against random bowl sizes for n ≤ 8.

**Short solutions**
- Step 1: give 1, 2 and 3 kg (or 2, 1, 3): errors 0.5, 0.5, 0, total 1.
- Step 2: whole parts give 7 kg; the last kilo goes to the bowl with fractional part 0.6: 0.3 + 0.4 + 0.1 = 0.8.
- Step 3: R = 3: three kittens get 1 kg (error 4/7 each), four get 0 (error 3/7 each): 12/7 + 12/7 = 24/7.
- Step 4: 2R(8 − R)/8 is largest at R = 4: 4, reached by four bowls of 1.5 kg and four of 0.5 kg.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2023 A1 *(Strong)*: the same question for 100 animals, where the worst case is an integer. Our
  Challenge uses an odd number, where the best R is not n/2.

**Similar problems on our site**
- Ladder P20 "Sheets That Double": another worst case found by an averaging bound with an example that meets it.

**Explore** — *Status: not searched in the literature yet.*
What if the keeper may hand out any whole number of kilograms in total (not exactly n)? What is the worst case for
n = 25 then?

**Proof problem** *(not graded)*
Prove that the n − R smallest of n numbers with sum R add up to at most (n − R)R/n.
- Hint 1: the average of the smallest numbers is at most the average of all of them.
- Solution: the smallest n − R numbers have average at most R/n (the overall average), so their sum is at most
  (n − R)R/n.

**Hints**
- Step 1: Two bowls are halfway between whole numbers; one must be rounded up and one down.
- Step 2: First give each kitten the whole part of its bowl size. How many kilograms are left, and who should get them?
- Step 3: All seven fractional parts are equal, so it does not matter who gets the 3 extra kilograms.
- Step 4: The total error is twice the sum of the smallest fractional parts. Compare that sum with their share of the average.
- Challenge: The error is at most 2R(n − R)/n, where R is the number of leftover kilograms. Which whole number R makes this largest for n = 25?
- Challenge: Make all fractional parts equal to reach the bound; keep the total at 25 kg.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: one rounding decision (MATHCOUNTS Sprint band).
- Step 2 — AMC 8: a short plan with fractional parts (compare AMC 8 2025 #14, mean and median reasoning).
- Step 3 — AMC 10: the general error formula on an even case (AMC 10 #11–15).
- Step 4 — AMC 12: a worst case needs an averaging bound plus an example (AMC 12 #16–20).
- Challenge — AIME: the bound with an integer optimisation and an exact example; like AIME #5–8.

**Research field:** discrepancy and apportionment (rounding with a fixed total).

---

### Ladder P28 — Powers That Match

**Idea card:** SL2011-A2 (the numbers a with Sₙ = aⁿ⁺¹ + 1 are bounded, so one value of a repeats infinitely often;
comparing the fastest-growing terms on both sides then forces the largest base, its coefficient, and the leftover 1).

**Setup:** Positive whole numbers x₁, x₂, …, x₁₀ have this property: for every positive whole number n, the number
Sₙ = x₁ⁿ + 2x₂ⁿ + 3x₃ⁿ + … + 10x₁₀ⁿ is one more than a perfect (n + 1)-th power, Sₙ = aₙⁿ⁺¹ + 1 for some whole number aₙ.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is 1 + 2 · 5² + 3 · 5²? (It is one more than a perfect cube.) | **126** |
| 2 | AMC 10 | Suppose x₁ = 1 and x₂ = x₃ = k satisfy 1 + 2kⁿ + 3kⁿ = aⁿ⁺¹ + 1 with the same a for every n. What is k? | **5** |
| 3 | AMC 12 | If every xᵢ is at most 6, then S₁₀ is less than 55 · 6¹⁰. What is the largest whole number a with a¹¹ < 55 · 6¹⁰? | **7** |
| 4 | AMC 12 | For four numbers with x₁ⁿ + 2x₂ⁿ + 3x₃ⁿ + 4x₄ⁿ = aₙⁿ⁺¹ + 1 for every n, what is x₁ + x₂ + x₃ + x₄? | **28** |
| **Challenge** | AIME | For the ten numbers of the setup, what is x₁ + x₂ + … + x₁₀? | **487** |

**Problem analysis** *(members only)*
- Sₙ grows like (largest base)ⁿ, while aₙⁿ⁺¹ grows like aₙ · aₙⁿ. Taking (n + 1)-th roots shows aₙ stays bounded.
- A bounded sequence of whole numbers takes some value a infinitely often. For those n, Sₙ = a · aⁿ + 1.
- Compare the fastest-growing terms: the largest base M must equal a, and the coefficients of the terms with base M
  must add up to a.
- What is left, the terms with smaller bases, must add up to exactly 1 for infinitely many n. Only the term x₁ⁿ with
  coefficient 1 and x₁ = 1 can do that; so every other xᵢ equals M.
- Then M = 2 + 3 + … + 10 = 54, and the sum is 1 + 9 · 54 = 487.

**Logic flow** *(members only)*
1. **See an example (Step 1).** 1 + 2 · 25 + 3 · 25 = 126 = 5³ + 1. *Why:* it shows the shape of the answer.
2. **Match the leading terms (Step 2).** (2 + 3)kⁿ = a · aⁿ for all n forces k = a = 2 + 3 = 5.
3. **aₙ is bounded (Step 3).** Sₙ < 55 · Mⁿ keeps aₙ small: for M = 6 and n = 10, aₙ is at most 7.
   *Why:* a bounded sequence of whole numbers repeats a value infinitely often.
4. **Four numbers (Step 4).** x₁ = 1 and the other three equal 2 + 3 + 4 = 9: sum 28.
5. **Apply (Challenge).** x₁ = 1 and x₂ = … = x₁₀ = 54: sum 487.

**Our full solution**
Let M be the largest of the xᵢ. M = 1 is impossible (then Sₙ − 1 = 54 for every n, which is not an (n + 1)-th power
for all n), so M ≥ 2. Sₙ ≤ 55Mⁿ, so aₙⁿ⁺¹ < 55Mⁿ and aₙ < (55Mⁿ)^(1/(n+1)) ≤ 55M: the whole numbers aₙ are
bounded, so some value a occurs for infinitely many n. For those n, Sₙ − 1 = a · aⁿ. Let c be the sum of the
coefficients i of the terms with xᵢ = M. Dividing by Mⁿ: c + (terms (xᵢ/M)ⁿ that tend to 0) − 1/Mⁿ = a(a/M)ⁿ. If a ≠ M the
right side tends to 0 or to infinity while the left side tends to c ≥ 1, impossible; so a = M and then c = M (letting
n grow). Removing these terms, the terms with xᵢ < M add up to exactly 1 for infinitely many n. Each such term is at
least i ≥ 1, so there is exactly one of them and it must have coefficient 1 and xᵢⁿ = 1: it is x₁ = 1. Hence
x₂ = … = x₁₀ = M and M = c = 2 + 3 + … + 10 = 54 (if x₁ = M too, the leftover terms would be empty, and 0 ≠ 1). Check:
1 + 54 · 54ⁿ = 54ⁿ⁺¹ + 1 for every n. So x₁ + … + x₁₀ = 1 + 9 · 54 = **487**. Computer check: all choices with 2, 3 and 4
numbers up to 30, 25 and 14 satisfy the property for n = 1, …, 6 only for (1, 2), (1, 5, 5) and (1, 9, 9, 9).

**Short solutions**
- Step 1: 1 + 50 + 75 = 126 = 5³ + 1.
- Step 2: 5kⁿ = aⁿ⁺¹ for every n: n = 1 and n = 2 give 5k = a² and 5k² = a³, so a = k = 5.
- Step 3: 55 · 6¹⁰ = 3 325 639 680; 7¹¹ = 1 977 326 743 is smaller and 8¹¹ = 8 589 934 592 is larger: 7.
- Step 4: x₁ = 1 and x₂ = x₃ = x₄ = 2 + 3 + 4 = 9: 1 + 27 = 28.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2011 A2 *(Strong)*: the same property with 2011 numbers. Our Challenge uses 10 numbers and asks for
  their sum.

**Similar problems on our site**
- Ladder P16 "Powers on Both Sides": another equation solved by comparing powers.

**Explore** — *Status: not searched in the literature yet.*
What if Sₙ must be one more than a perfect n-th power (instead of an (n + 1)-th power)?

**Proof problem** *(not graded)*
Prove that a sequence of whole numbers that is bounded takes some value infinitely often.
- Hint 1: if it is bounded by B, it has at most B + 1 possible values.
- Solution: infinitely many terms are shared among at most B + 1 values, so by the pigeonhole principle one value is
  taken infinitely often.

**Hints**
- Step 1: Work out 2 · 25 and 3 · 25, then compare the total with 5³.
- Step 2: Divide both sides by kⁿ and compare what happens as n grows.
- Step 3: Compute 55 · 6¹⁰, then compare it with a¹¹ for a few small values of a.
- Step 4: Use the same pattern as Step 2: x₁ = 1 and the other three numbers are equal.
- Challenge: The numbers aₙ are bounded, so one value a appears for infinitely many n. Compare the fastest-growing terms on both sides.
- Challenge: The terms with smaller bases must add up to exactly 1, so only x₁ can be smaller, and x₁ = 1.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: arithmetic with powers.
- Step 2 — AMC 10: compare two equations with powers (AMC 10 #11–15).
- Step 3 — AMC 12: estimating large powers (logarithm-type estimates are AMC 12 material).
- Step 4 — AMC 12: the matching argument on a small case (AMC 12 #16–20).
- Challenge — AIME: growth comparison and the leftover 1 together; like AIME #6–9 (compare AIME 2026 I #6, an
  equation with powers and logarithms).

**Research field:** exponential Diophantine equations (growth rates).

---

### Ladder P29 — Sorting Letters

**Idea card:** SL2017-C2 (count the pairs of letters that are "in order"; each swap of two different neighbouring
letters changes this count by exactly 1, so the fewest swaps between a word and a sorted word is that count).

**Setup:** A **word** is an arrangement of letters. A **swap** exchanges two neighbouring letters. The **disorder** of a
word is the number of pairs of positions where the earlier letter comes later in the alphabet (for example, ba has
disorder 1).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is the fewest number of swaps that turns abc into cba? | **3** |
| 2 | AMC 8 | What is the disorder of the word cabbac? | **6** |
| 3 | AMC 10 | What is the fewest number of swaps that turns bcacab into aabbcc? | **7** |
| 4 | AMC 12 | The letters a, a, b, b, c, c are arranged in a random order (all 90 different words equally likely). What is the expected disorder? | **6** |
| **Challenge** | AIME | The letters a, a, b, b, c, c are arranged in a random order. Let X be the fewest number of swaps needed to turn the word into aabbcc or into ccbbaa, whichever is closer. The expected value of X is a fraction m/n in lowest terms. Find m + n. | **224** |

**Problem analysis** *(members only)*
- A swap of two equal letters changes nothing, and a swap of two different neighbouring letters changes the disorder
  by exactly 1.
- So reaching aabbcc (disorder 0) needs at least as many swaps as the disorder, and bubble sort shows that many
  swaps are enough: the distance to aabbcc is the disorder I.
- Reversing the alphabet, the distance to ccbbaa is the number of pairs in the other order: 12 − I (each word has
  2 · 2 · 3 = 12 pairs of different letters).
- So X = min(I, 12 − I), and the question becomes: how many of the 90 words have each disorder?
- Counting words by disorder (adding one letter at a time) gives E[X] = 179/45.

**Logic flow** *(members only)*
1. **Swaps and order (Step 1).** abc → cba needs 3 swaps: every pair must change order once.
2. **Measure the disorder (Step 2).** Count the pairs out of order: cabbac has 6.
3. **Distance = disorder (Step 3).** Each swap changes the disorder by 1, so sorting bcacab needs exactly 7 swaps.
   *Why:* the distance to a sorted word is now a number we can count.
4. **Expected disorder (Step 4).** Each of the 12 pairs of different letters is out of order with probability 1/2:
   expected disorder 6.
5. **Closer of two targets (Challenge).** X = min(I, 12 − I); count the 90 words by I and average.

**Our full solution**
A swap of two different neighbouring letters changes the order of exactly one pair, so it changes the disorder by
exactly 1; a swap of equal letters changes nothing. Hence a word with disorder I needs at least I swaps to reach
aabbcc (disorder 0), and swapping any neighbouring pair that is out of order (bubble sort) reaches it in exactly I
swaps. Pairs of different letters number 2·2 + 2·2 + 2·2 = 12, so the same argument with the alphabet reversed gives
distance 12 − I to ccbbaa, and X = min(I, 12 − I). Building the word from the left, a first letter b adds 2 (or the
number of a's left) to the disorder and a first letter c adds the number of a's and b's left; this gives the number of
words with each disorder I = 0, 1, …, 12: 1, 2, 5, 7, 11, 12, 14, 12, 11, 7, 5, 2, 1 (total 90). Then
E[X] = (0·1 + 1·2 + 2·5 + 3·7 + 4·11 + 5·12 + 6·14 + 5·12 + 4·11 + 3·7 + 2·5 + 1·2 + 0·1)/90 = 358/90 = 179/45.
So m + n = **224**. Computer check: all 90 words, with the fewest swaps found by searching the word graph.

**Short solutions**
- Step 1: each of the 3 pairs must change order, and each swap changes one pair: 3 (abc → bac → bca → cba).
- Step 2: pairs out of order: c before a (×2), c before b (×2), b before a (×2): 6.
- Step 3: the disorder of bcacab is 7, and each swap lowers it by at most 1; bubble sort uses exactly 7.
- Step 4: each of the 12 pairs of different letters is out of order with probability 1/2: 12 · 1/2 = 6.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2017 C2 *(Related)*: uses the same count to show some word is far from a given word. Our Challenge
  uses it to compute an expected distance.

**Similar problems on our site**
- Ladder P21 "Weights of Three": another count of arrangements built one element at a time.

**Explore** — *Status: not searched in the literature yet.*
For a, a, a, b, b, b, c, c, c, what is the expected value of X? (The answer is a fraction with denominator 280.)

**Proof problem** *(not graded)*
Prove that every swap of two different neighbouring letters changes the disorder by exactly 1.
- Hint 1: which pairs of positions change their order?
- Solution: only the pair formed by the two swapped letters changes its order; every other pair keeps its order
  because each letter outside the two keeps its position relative to both.

**Hints**
- Step 1: Every pair of letters must change its order, and one swap changes the order of one pair.
- Step 2: For each letter, count the letters after it that come earlier in the alphabet.
- Step 3: Each swap changes the disorder by exactly 1. Find the disorder of bcacab.
- Step 4: There are 12 pairs of different letters; by symmetry each is out of order half the time.
- Challenge: The distance to aabbcc is the disorder I and the distance to ccbbaa is 12 − I, so X = min(I, 12 − I).
- Challenge: Count the 90 words by their disorder, adding one letter at a time from the left.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: a small hands-on count.
- Step 2 — AMC 8: counting pairs systematically.
- Step 3 — AMC 10: an invariant-style argument (each swap changes the count by 1) plus a count (AMC 10 #16–20).
- Step 4 — AMC 12: linearity of expectation (AMC 12 #11–15).
- Challenge — AIME: the distance idea plus a distribution count; like AIME #7–10 (compare AIME 2026 I #7 and #9,
  counting with structure).

**Research field:** combinatorics of permutations (inversions and sorting).

---

### Ladder P30 — Climbing Windows

**Idea card:** SL2007-C1 (the n + 1 disjoint windows of length n have strictly increasing sums between 0 and n, so
their sums are exactly 0, 1, …, n; comparing overlapping windows then forces a unique staircase: block u is n − u
zeros followed by u ones).

**Setup:** For a whole number n ≥ 2, a **climbing sequence** has n² + n digits, each 0 or 1, with this property: for
every i from 0 to n² − n, the n digits in places i + 1, …, i + n add up to less than the n digits in places
i + n + 1, …, i + 2n.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | For n = 2 (six digits), how many climbing sequences are there? | **1** |
| 2 | AMC 8 | For n = 3 (twelve digits), the four separate blocks of places 1–3, 4–6, 7–9 and 10–12 have increasing sums. What do these four sums add up to? | **6** |
| 3 | AMC 10 | For n = 3, in which place is the first digit 1? | **6** |
| 4 | AMC 10 | For n = 5, how many digits 1 does a climbing sequence have? | **15** |
| **Challenge** | AIME | For n = 30, how many of the first 500 digits of a climbing sequence are 1? | **126** |

**Problem analysis** *(members only)*
- Cut the sequence into n + 1 blocks of n places. Their sums strictly increase and lie between 0 and n, and there are
  only n + 1 possible values: so the block sums are exactly 0, 1, 2, …, n (a pigeonhole squeeze).
- Overlapping windows must also increase. Shifting a window by one place adds one digit and drops another, so inside
  each block the ones must sit at the end: block u is n − u zeros followed by u ones.
- So there is exactly one climbing sequence for each n: the staircase.
- For n = 30, the first 500 places are 16 full blocks (u = 0, …, 15) and 20 places of block 16 (14 zeros, then 6 ones):
  0 + 1 + … + 15 + 6 = 126.

**Logic flow** *(members only)*
1. **Try the smallest case (Step 1).** For n = 2 only 000111 works. *Why:* it shows the shape.
2. **Pigeonhole on the blocks (Step 2).** n + 1 increasing sums from {0, …, n} must be 0, 1, …, n: for n = 3 they add
   up to 6. *Why:* the block sums are forced.
3. **Ones at the end of each block (Step 3).** Overlapping windows force each block to be zeros then ones; for n = 3
   the first 1 is in place 6. *Why:* the whole sequence is forced.
4. **Count the ones (Step 4).** 0 + 1 + … + n = 15 for n = 5.
5. **Apply (Challenge).** For n = 30 count the ones in 16 full blocks and part of the next: 126.

**Our full solution**
Number the places 1, …, n² + n and let T(u, j) be the sum of the window that starts right after place un + j (places
un + j + 1, …, un + j + n), for 0 ≤ u ≤ n − 1 and 0 ≤ j ≤ n. *Block sums.* Taking j = 0, the n + 1 disjoint blocks have
strictly increasing sums between 0 and n, so block u has sum exactly u (it is the only way to fit n + 1 different
whole numbers into 0, …, n). So T(u, 0) = u and T(u, n) = u + 1. *Cut points.* For a fixed j, the property gives
T(0, j) < T(1, j) < … < T(n − 1, j): n different whole numbers between 0 and n. So there is a cut cⱼ with T(u, j) = u for
u < cⱼ and T(u, j) = u + 1 for u ≥ cⱼ; c₀ = n and cₙ = 0. *Digits.* Let d(u, v) be the v-th digit of block u. Moving a
window one place adds one digit and drops one: T(u, j + 1) − T(u, j) = d(u + 1, j + 1) − d(u, j + 1). Block 0 has sum 0,
so its digits are 0, and adding these differences for u = 0, …, w − 1 gives
d(w, j + 1) = max(0, w − cⱼ₊₁) − max(0, w − cⱼ). For w = n this is cⱼ − cⱼ₊₁, which must be 0 or 1; since the n drops
from c₀ = n to cₙ = 0 add up to n, every drop is 1 and cⱼ = n − j. Then d(w, v) = 1 exactly when w ≥ n − v + 1: block u is
n − u zeros followed by u ones. This staircase does have the property, so it is the only climbing sequence. For n = 30,
places 1–480 are blocks u = 0, …, 15 with 0 + 1 + … + 15 = 120 ones; places 481–500 are the first 20 places of block
u = 16, which has 14 zeros and then 16 ones, so 6 more ones. The answer is **126**. Computer check: every sequence of
6 and 12 digits (n = 2, 3) and a search over all 2²⁰ sequences for n = 4, each finding only the staircase, and the
property for the staircase with n = 30.

**Short solutions**
- Step 1: the three blocks must have sums 0, 1, 2, so the sequence is 00 ?? 11 with one 1 in the middle block; only
  000111 also satisfies the shifted window (places 2–3 against 4–5).
- Step 2: four increasing sums from 0 to 3 must be 0, 1, 2, 3: total 6.
- Step 3: the sequence is 000 001 011 111: the first 1 is in place 6.
- Step 4: blocks have 0, 1, 2, 3, 4, 5 ones: 15.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2007 C1 *(Strong)*: asks for all such sequences. Our Challenge asks for one count in the forced
  sequence.

**Similar problems on our site**
- Ladder P3 "The Safe Start": another problem driven by sums over windows of a sequence.

**Explore** — *Status: not searched in the literature yet.*
If the strict inequality is replaced by "at most", how many sequences of 12 digits (n = 3) are there?

**Proof problem** *(not graded)*
Prove that n + 1 strictly increasing whole numbers between 0 and n must be exactly 0, 1, …, n.
- Hint 1: how many whole numbers are there from 0 to n?
- Solution: there are exactly n + 1 whole numbers from 0 to n, and n + 1 different ones are chosen, so all are used;
  increasing order then fixes them as 0, 1, …, n.

**Hints**
- Step 1: The three blocks of two digits must have sums 0, 1, 2. Where can the single 1 of the middle block go?
- Step 2: Four strictly increasing whole numbers between 0 and 3: which ones can they be?
- Step 3: Inside each block, the ones must come after the zeros.
- Step 4: Block u contains u ones, for u = 0, 1, …, n.
- Challenge: The sequence is forced: block u (u = 0, 1, …, 30) is 30 − u zeros followed by u ones.
- Challenge: 500 places = 16 full blocks of 30 plus 20 places of the next block.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: a small case checked by reasoning about 3 blocks.
- Step 2 — AMC 8: a pigeonhole squeeze with 4 values (compare Kangaroo Kadett 2025 #29, consecutive numbers).
- Step 3 — AMC 10: the forced structure in a medium case (AMC 10 #16–20).
- Step 4 — AMC 10: counting once the structure is known (AMC 10 #6–10).
- Challenge — AIME: the forced staircase plus a careful partial count; like AIME #3–6.

**Research field:** combinatorics on words (forced patterns).

---

### Ladder P31 — Parallel Cuts

**Idea card:** SL2014-G2 (lines parallel to the sides create triangles similar to ABC; their scale factors add up to 1,
and inradii scale linearly, so the inradii of the small triangles add up to the inradius of ABC).

**Setup:** Triangle ABC has AB = 13, BC = 14 and CA = 15. Through a point P inside it, draw the three lines parallel to
the sides. They cut ABC into three parallelograms and three small triangles that have P as a corner; each small
triangle is similar to ABC.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is the inradius of triangle ABC (the radius of the circle inside it touching all three sides)? | **4** |
| 2 | AMC 8 | A triangle similar to ABC has sides 1/3 as long. What is its inradius? Give your answer as a fraction. | **4/3** |
| 3 | AMC 10 | Two of the three small triangles have inradii 1 and 3/2. What is the inradius of the third one? Give your answer as a fraction. | **3/2** |
| 4 | AMC 10 | What is the smallest possible total area of the three small triangles (over all positions of P)? | **28** |
| **Challenge** | AIME | The inradii of the three small triangles are in the ratio 1 : 2 : 3. Their total area is a fraction m/n in lowest terms. Find m + n. | **101** |

**Problem analysis** *(members only)*
- Each small triangle is similar to ABC, with a scale factor t equal to P's distance to one side divided by the
  height to that side. The three factors add up to 1 (the three small bases along each side, together with the
  parallelogram edges, fill the side exactly).
- Lengths scale by t, so the inradii are 4t₁, 4t₂, 4t₃ and add up to the inradius 4 of ABC.
- Areas scale by t², so the total area is 84(t₁² + t₂² + t₃²).
- With t₁ + t₂ + t₃ = 1, the total area is smallest when the three factors are equal (P is the centroid): 84/3 = 28.
- Inradii in the ratio 1 : 2 : 3 mean t = 1/6, 2/6, 3/6, so the total area is 84 · 14/36 = 98/3.

**Logic flow** *(members only)*
1. **Measure ABC (Step 1).** Heron: area 84, half-perimeter 21, inradius 84/21 = 4.
2. **Scaling (Step 2).** Inradii scale like lengths: 4/3. *Why:* the small triangles are scaled copies of ABC.
3. **The factors add up to 1 (Step 3).** So the three inradii add up to 4: the third is 3/2.
4. **Areas (Step 4).** Areas scale by t²; t₁² + t₂² + t₃² ≥ 1/3 when the t's add up to 1, so at least 28.
5. **Apply (Challenge).** t = 1/6, 1/3, 1/2: area 84 · (1 + 4 + 9)/36 = 98/3; m + n = 101.

**Our full solution**
Heron's formula gives area 84 (half-perimeter 21, 21 · 8 · 7 · 6 = 84²), so the inradius is 84/21 = 4. The line through
P parallel to BC and the two other lines cut off the small triangle with corner P and base on BC; it is similar to ABC
with factor t₁ = (distance from P to BC)/(height from A), and similarly t₂, t₃ for the other two. These are the
barycentric coordinates of P, so t₁ + t₂ + t₃ = 1 (the three areas PBC, PCA, PAB add up to ABC). The inradii are 4t₁,
4t₂, 4t₃. In the ratio 1 : 2 : 3 with sum 4 they are 2/3, 4/3, 2, so t = 1/6, 1/3, 1/2, and the total area is
84(1/36 + 4/36 + 9/36) = 84 · 14/36 = 98/3. Hence m + n = **101**. Computer check: the three small triangles built
from coordinates for this point P and for random points, with their areas and inradii.

**Short solutions**
- Step 1: s = 21, area √(21 · 8 · 7 · 6) = 84, inradius 84/21 = 4.
- Step 2: 4 · 1/3 = 4/3.
- Step 3: the inradii add up to 4: 4 − 1 − 3/2 = 3/2.
- Step 4: 84(t₁² + t₂² + t₃²) ≥ 84 · (t₁ + t₂ + t₃)²/3 = 28, reached at the centroid (all t = 1/3).
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2014 G2 *(Related)*: uses small triangles similar to ABC and the linear scaling of inradii to compare
  inradii. Our Challenge computes areas from the inradii.

**Similar problems on our site**
- Ladder P14 "Six Points on a Circle": another problem on the 13-14-15 triangle.

**Explore** — *Status: not searched in the literature yet.*
Where must P be for the three parallelograms to have equal areas, and what is that area?

**Proof problem** *(not graded)*
Prove that the scale factors t₁, t₂, t₃ of the three small triangles add up to 1.
- Hint 1: the factor of the small triangle with base on BC equals (distance from P to BC)/(height from A).
- Solution: (distance from P to BC)/(height from A) = area(PBC)/area(ABC), and similarly for the other two; the three
  areas PBC, PCA, PAB add up to area(ABC).

**Hints**
- Step 1: Use Heron's formula for the area, then area = inradius × half-perimeter.
- Step 2: Every length in a scaled triangle, including the inradius, is multiplied by the same factor.
- Step 3: The scale factors of the three small triangles add up to 1.
- Step 4: Areas scale by the square of the factor. When is t₁² + t₂² + t₃² smallest if t₁ + t₂ + t₃ = 1?
- Challenge: The inradii add up to 4, which fixes them, and each factor is (inradius)/4.
- Challenge: Total area = 84(t₁² + t₂² + t₃²).

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: Heron and A = rs (compare MATHCOUNTS 2026 State Target #2, inradius and area).
- Step 2 — AMC 8: scaling of a length.
- Step 3 — AMC 10: the key fact t₁ + t₂ + t₃ = 1 (AMC 10 #16–20).
- Step 4 — AMC 10: a minimum by QM–AM (AMC 10 #16–20).
- Challenge — AIME: combine scaling of lengths and areas; like AIME #3–6.

**Research field:** Euclidean geometry (similarity and barycentric coordinates).
