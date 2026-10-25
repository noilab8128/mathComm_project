# Solution-path ladders v2 — batch 8 (P37–P41)

- Date: 2026-10-25
- Status: **checked, ready to import.** Built with [LADDER_RULES_v2.md](../LADDER_RULES_v2.md); levels set with
  [LEVEL_GUIDE.md](../LEVEL_GUIDE.md). Challenge answers are AIME-format integers from 0 to 999.
- Answer check: `python3 ladders/v2/verify_v2_batch8.py`.
- Chosen to fill Skill Tree topics that had no ladders: Conditional Probability, Graph Coloring, Combinatorial
  Geometry (second ladder), Sequences and Recurrences (more ladders).
- Internal only: the `Idea card` lines name the sources. They are never shown on the site.

---

### Ladder P37 — No Neighbours

**Idea card:** SL2013-A1 (expanding a recurrence of the form uₖ₊₁ = uₖ + aₖuₖ₋₁ gives a sum over index sets with no two
consecutive indices; such "sparse" sets are counted by Fibonacci numbers, and reading them from the other end is
the same count).

**Setup:** A set of numbers is **sparse** if it contains no two consecutive whole numbers (the empty set is sparse).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | How many subsets of {1, 2, 3, 4} are sparse? | **8** |
| 2 | AMC 8 | How many subsets of {1, 2, …, 10} are sparse? | **144** |
| 3 | AMC 10 | A subset of {1, 2, …, 6} is chosen at random (all 64 subsets equally likely). What is the probability that it is sparse? Give your answer as a fraction. | **21/64** |
| 4 | AMC 10 | A sparse subset of {1, 2, …, 6} is chosen at random (all sparse subsets equally likely). Given that it contains 6, what is the probability that it also contains 1? Give your answer as a fraction. | **3/8** |
| **Challenge** | AIME | A sparse subset of {1, 2, …, 12} is chosen at random (all sparse subsets equally likely). Given that it contains 12, the probability that it also contains 1 is a fraction m/n in lowest terms. Find m + n. | **199** |

**Problem analysis** *(members only)*
- Let cₙ be the number of sparse subsets of {1, …, n}. A sparse set either avoids n (cₙ₋₁ choices) or contains n and
  then avoids n − 1 (cₙ₋₂ choices): cₙ = cₙ₋₁ + cₙ₋₂ with c₀ = 1, c₁ = 2. These are the Fibonacci numbers
  2, 3, 5, 8, 13, …, 144 (n = 10).
- "Contains 12" forces 11 out and leaves any sparse subset of {1, …, 10}: 144 sets.
- "Contains 12 and 1" forces 11 and 2 out and leaves any sparse subset of {3, …, 10}, eight numbers: 55 sets.
- So the conditional probability is 55/144, and m + n = 199.

**Logic flow** *(members only)*
1. **Count by hand (Step 1).** The empty set, 4 single numbers and 3 pairs: 8. *Why:* it starts the pattern.
2. **The recursion (Step 2).** cₙ = cₙ₋₁ + cₙ₋₂ (does the set contain n or not?): c₁₀ = 144. *Why:* every count
   below is a Fibonacci number.
3. **A probability (Step 3).** 21 sparse subsets of 64. *Why:* probability = favourable / total.
4. **A conditional probability (Step 4).** Given 6, the sets are the sparse subsets of {1, …, 4}: 8; those with 1 are
   the sparse subsets of {3, 4}: 3. So 3/8.
5. **Apply (Challenge).** 55/144: m + n = 199.

**Our full solution**
Let cₙ be the number of sparse subsets of {1, …, n}, with c₀ = 1 and c₁ = 2. A sparse subset of {1, …, n} either
does not contain n (cₙ₋₁ sets) or contains n, and then not n − 1 (cₙ₋₂ sets), so cₙ = cₙ₋₁ + cₙ₋₂: the values are
1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144 for n = 0, …, 10. All sparse subsets are equally likely, so the conditional
probability is (number containing 12 and 1)/(number containing 12). Containing 12 means 11 is out, and the rest is any
sparse subset of {1, …, 10}: c₁₀ = 144. Containing 12 and 1 means 11 and 2 are out, and the rest is any sparse subset of
{3, …, 10}, which has the same count as {1, …, 8}: c₈ = 55. The probability is 55/144 (55 = 5 · 11 and 144 = 2⁴ · 3² share
no factor), so m + n = **199**. Computer check: all 4096 subsets of {1, …, 12}.

**Short solutions**
- Step 1: ∅, {1}, {2}, {3}, {4}, {1, 3}, {1, 4}, {2, 4}: 8.
- Step 2: 2, 3, 5, 8, 13, 21, 34, 55, 89, 144.
- Step 3: c₆ = 21 of the 64 subsets: 21/64.
- Step 4: c₄ = 8 sets contain 6; c₂ = 3 of them also contain 1: 3/8.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2013 A1 *(Related)*: expands a recurrence as a sum over the same sparse index sets. Our Challenge
  counts those sets to compute a conditional probability.

**Similar problems on our site**
- Ladder A "Fibonacci Stairs" (live): another count that leads to Fibonacci numbers.

**Explore** — *Status: not searched in the literature yet.*
For a random sparse subset of {1, …, 12}, what is the expected number of elements?

**Proof problem** *(not graded)*
Prove that cₙ = cₙ₋₁ + cₙ₋₂ for n ≥ 2.
- Hint 1: split the sparse sets by whether they contain n.
- Solution: sets without n are the sparse subsets of {1, …, n − 1}; sets with n cannot contain n − 1, so after removing n
  they are the sparse subsets of {1, …, n − 2}. The two kinds do not overlap.

**Hints**
- Step 1: List them: the empty set, the single numbers, then the pairs that are not neighbours.
- Step 2: A sparse set either avoids the largest number or contains it and avoids the one below it.
- Step 3: Count the sparse subsets of {1, …, 6} with the same rule, then divide by 64.
- Step 4: Containing 6 forces 5 out; containing 1 forces 2 out. Count what is left in each case.
- Challenge: Given 12, the number 11 is out and the rest is any sparse subset of {1, …, 10}.
- Challenge: Given 12 and 1, both 11 and 2 are out; the rest is a sparse subset of {3, …, 10}.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: a short list.
- Step 2 — AMC 8: a recursion by cases.
- Step 3 — AMC 10: a probability from two counts.
- Step 4 — AMC 10: a conditional probability by restricting the sample space (AMC 10 #11–15).
- Challenge — AIME: the same at a larger size; like AIME #1–4.

**Research field:** enumerative combinatorics (Fibonacci numbers and independent sets).

---

### Ladder P38 — Two-Coloured Sides

**Idea card:** SL2016-C3 (in a regular n-gon with n odd and not divisible by 3, every pair of vertices lies in exactly 3
isosceles triangles; counting (isosceles triangle, two-coloured side) pairs in two ways gives 3(bc + cd + db), which is
odd when b, c, d are odd, while a triangle with at most two colours has 0 or 2 such sides).

**Setup:** The 13 vertices of a regular 13-gon are coloured: 3 red, 5 blue and 5 green. A triangle is **isosceles** if
two of its sides have equal length. A side is **two-coloured** if its two ends have different colours.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | In a regular 7-gon, how many isosceles triangles with vertices among the corners have a given corner as the top (where the two equal sides meet)? | **3** |
| 2 | AMC 8 | How many isosceles triangles have their three vertices among the corners of a regular 13-gon? | **78** |
| 3 | AMC 10 | In a regular 13-gon, how many isosceles triangles contain a given pair of vertices? | **3** |
| 4 | AMC 8 | A triangle has vertex colours red, red, blue. How many of its sides are two-coloured? | **2** |
| **Challenge** | AIME | Add up the number of two-coloured sides over all isosceles triangles of the coloured 13-gon. What is the total? | **165** |

**Problem analysis** *(members only)*
- In a regular 13-gon every isosceles triangle has exactly one top (13 is not divisible by 3, so no triangle is
  equilateral), and each top has 6 symmetric pairs: 13 · 6 = 78 triangles.
- Every pair of vertices lies in exactly 3 of them: once as the base (the top is on the perpendicular bisector) and
  twice as a leg (the third vertex is the reflection of one end over the line through the other end and the centre).
- Count pairs (isosceles triangle, two-coloured side) by the side first: each two-coloured pair of vertices is counted
  3 times, and there are 3·5 + 5·5 + 5·3 = 55 such pairs, so the total is 165 for every colouring.
- 165 is odd, but a triangle with one or two colours has 0 or 2 two-coloured sides. So some isosceles triangle has all
  three colours.

**Logic flow** *(members only)*
1. **Isosceles by top (Step 1).** In a 7-gon a top has 3 symmetric pairs. *Why:* triangles are counted by their top.
2. **Total (Step 2).** 13 tops · 6 pairs = 78 (no equilateral triangles because 3 does not divide 13).
3. **Pairs in triangles (Step 3).** Each pair lies in exactly 3 isosceles triangles. *Why:* this makes the double count
   easy.
4. **Sides of a triangle (Step 4).** One or two colours give 0 or 2 two-coloured sides; three colours give 3.
5. **Double count (Challenge).** 3 · (3·5 + 5·5 + 5·3) = 165, the same for every colouring.

**Our full solution**
Number the vertices by residues mod 13. A triangle with top v and base {v + k, v − k} (k = 1, …, 6) is isosceles, and
since 3 does not divide 13 no triangle has all sides equal, so every isosceles triangle has exactly one top: 13 · 6 = 78
triangles. Given a pair {a, b} with b − a = d, it lies in the isosceles triangle with base {a, b} (top at the midpoint
residue, which exists because 13 is odd), in the one with top a and legs ab and ac (c = a − d), and in the one with top
b (c = b + d); these are 3 different triangles, and no other isosceles triangle contains both a and b. Now count pairs
(isosceles triangle, two-coloured side): by sides, each of the 3·5 + 5·5 + 5·3 = 55 two-coloured pairs of vertices is in
3 triangles, giving 165. So the total is **165**, for every way of placing the colours. (Since a triangle with at most
two colours has 0 or 2 two-coloured sides, an odd total shows that some isosceles triangle has three colours.)
Computer check: all 78 isosceles triangles listed, each pair in exactly 3, and the total for 2000 random colourings.

**Short solutions**
- Step 1: the top pairs symmetric corners: 3 pairs in a 7-gon.
- Step 2: 13 tops, 6 symmetric pairs each: 78.
- Step 3: once as the base and once with each end as the top: 3.
- Step 4: the two red–blue sides: 2.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2016 C3 *(Strong)*: proves that some isosceles triangle has three colours whenever the three colour
  counts are odd. Our Challenge computes the double count behind that proof.

**Similar problems on our site**
- Ladder P26 "Red Corners": another problem solved by counting the same objects in two ways.

**Explore** — *Status: not searched in the literature yet.*
With 3 red, 5 blue and 5 green vertices, what is the smallest possible number of three-coloured isosceles triangles?
(Random colourings give 13 or more.)

**Proof problem** *(not graded)*
Prove that a triangle whose vertices use at most two colours has an even number of two-coloured sides.
- Hint 1: walk around the triangle and count the colour changes.
- Solution: going around the closed path A → B → C → A you return to the starting colour, and with only two colours
  every change switches between them, so the number of changes is even.

**Hints**
- Step 1: The other two corners must be at the same distance from the top on both sides.
- Step 2: Count by the top: each corner has 6 symmetric pairs, and no triangle is equilateral.
- Step 3: The pair can be the base, or one of its ends can be the top.
- Step 4: Count the sides whose ends have different colours.
- Challenge: Count (isosceles triangle, two-coloured side) pairs starting from the sides: each two-coloured pair of vertices lies in 3 isosceles triangles.
- Challenge: Two-coloured pairs: red–blue, blue–green and green–red.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: a symmetric count on a small polygon.
- Step 2 — AMC 8: counting by a chosen vertex.
- Step 3 — AMC 10: a careful case argument (AMC 10 #11–15).
- Step 4 — AMC 8: a direct count.
- Challenge — AIME: double counting; like AIME #3–6.

**Research field:** combinatorics (double counting and colourings).

---

### Ladder P39 — Zero Sums

**Idea card:** SL2010-A4 (the rules x₂ₖ = −xₖ and x₂ₖ₋₁ = (−1)^(k+1) xₖ make every block of four terms add up to twice an earlier
term, so S₄ₖ = 2Sₖ and S₄ₖ₊₂ = S₄ₖ; together with the parity of Sₙ this controls all partial sums).

**Setup:** A sequence of signs is defined by x₁ = 1 and, for k ≥ 1, x₂ₖ = −xₖ and x₂ₖ₊₁ = (−1)ᵏ x_{k+1}. (So
x₁, …, x₈ = 1, −1, 1, 1, 1, −1, −1, −1.) Let Sₙ = x₁ + x₂ + … + xₙ.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is S₆? | **2** |
| 2 | AMC 10 | Every block x₄ₖ₋₃ + x₄ₖ₋₂ + x₄ₖ₋₁ + x₄ₖ equals 2xₖ, so S₄ₖ = 2Sₖ. What is S₁₆? | **4** |
| 3 | AMC 10 | Sₙ always has the same parity as n. How many of S₁, S₂, …, S₉ are 0? | **2** |
| 4 | AMC 10 | What is S₄₀? | **0** |
| **Challenge** | AIME | For how many n from 1 to 1000 is Sₙ = 0? | **31** |

**Problem analysis** *(members only)*
- From the rules: x₄ₖ₋₃ = x₂ₖ₋₁, x₄ₖ₋₂ = −x₂ₖ₋₁, x₄ₖ₋₁ = x₄ₖ = xₖ. So each block of four adds up to 2xₖ: S₄ₖ = 2Sₖ.
- The next two terms cancel (x₄ₖ₊₁ = x₂ₖ₊₁, x₄ₖ₊₂ = −x₂ₖ₊₁), so S₄ₖ₊₂ = S₄ₖ = 2Sₖ.
- Every xᵢ is ±1, so Sₙ has the parity of n: odd n never give 0.
- So Sₙ = 0 exactly for n = 4k or 4k + 2 with Sₖ = 0 (and S₂ = 0 from k = 0): in base 4, n uses only the digits 0
  and 2.
- Up to 1000 = 33220 (base 4), those numbers have 1 to 5 base-4 digits from {0, 2}, starting with 2: 2⁵ − 1 = 31.

**Logic flow** *(members only)*
1. **Compute (Step 1).** 1 − 1 + 1 + 1 + 1 − 1 = 2.
2. **Blocks of four (Step 2).** S₄ₖ = 2Sₖ, so S₁₆ = 2S₄ = 4. *Why:* the sequence copies itself at a quarter of the
   speed.
3. **Parity (Step 3).** Odd n never give 0; among n ≤ 9 only S₂ and S₈ are 0. *Why:* only even n need checking.
4. **Zeros come from zeros (Step 4).** S₄ₖ = S₄ₖ₊₂ = 2Sₖ: S₄₀ = 2S₁₀ = 0 since S₁₀ = 2S₂ = 0. *Why:* zeros are the
   numbers with base-4 digits 0 and 2.
5. **Count (Challenge).** Numbers up to 1000 with base-4 digits in {0, 2}: 31.

**Our full solution**
From the definition, for k ≥ 1: x₄ₖ = −x₂ₖ = xₖ; x₄ₖ₋₁ is x₂ₘ₊₁ with m = 2k − 1, so it equals (−1)^(2k−1) x₂ₖ = −x₂ₖ = xₖ;
x₄ₖ₋₂ = −x₂ₖ₋₁; and x₄ₖ₋₃ is x₂ₘ₊₁ with m = 2k − 2, so it equals x₂ₖ₋₁. So x₄ₖ₋₃ + x₄ₖ₋₂ + x₄ₖ₋₁ + x₄ₖ = 2xₖ, and adding blocks gives S₄ₖ = 2Sₖ;
also x₄ₖ₊₁ + x₄ₖ₊₂ = 0 gives S₄ₖ₊₂ = S₄ₖ (for k = 0: S₂ = 0). Each xᵢ = ±1, so Sₙ ≡ n (mod 2) and odd n are never zeros.
For even n, n = 4k or 4k + 2 and Sₙ = 2Sₖ (with S₀ = 0), so Sₙ = 0 exactly when Sₖ = 0 (or k = 0). By induction, the
n ≥ 1 with Sₙ = 0 are exactly those whose base-4 digits are all 0 or 2. Since 1000 = 33220 in base 4, every such number
with at most 5 digits is below 1000 (the largest is 22222 = 682) and the next one, 200000 = 2048, is above. With 1 to 5
digits, a leading 2 and the other digits 0 or 2, there are 1 + 2 + 4 + 8 + 16 = 31. The answer is **31**. Computer
check: the sequence and its partial sums up to n = 4100.

**Short solutions**
- Step 1: 1 − 1 + 1 + 1 + 1 − 1 = 2.
- Step 2: S₄ = 2, so S₁₆ = 2 · 2 = 4.
- Step 3: only even n can give 0: S₂ = 0, S₄ = 2, S₆ = 2, S₈ = 0: 2.
- Step 4: S₄₀ = 2S₁₀ and S₁₀ = S₈ = 2S₂ = 0: 0.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2010 A4 *(Strong)*: proves that every Sₙ is at least 0 for this sequence. Our Challenge counts when it
  is exactly 0.

**Similar problems on our site**
- Ladder P6 "The Half That Never Ends": another sequence understood through its binary-type digits.

**Explore** — *Status: not searched in the literature yet.*
What is the largest value of Sₙ for n ≤ 1000, and where is it reached?

**Proof problem** *(not graded)*
Prove that S₄ₖ = 2Sₖ for every k ≥ 1.
- Hint 1: show that the four terms x₄ⱼ₋₃, x₄ⱼ₋₂, x₄ⱼ₋₁, x₄ⱼ add up to 2xⱼ.
- Solution: x₄ⱼ₋₃ = x₂ⱼ₋₁ and x₄ⱼ₋₂ = −x₂ⱼ₋₁ cancel, and x₄ⱼ₋₁ = x₄ⱼ = xⱼ. Adding the blocks j = 1, …, k gives
  S₄ₖ = 2(x₁ + … + xₖ) = 2Sₖ.

**Hints**
- Step 1: Add the first six signs from the setup.
- Step 2: Use S₄ = 2 and S₁₆ = 2S₄.
- Step 3: Odd n can never give 0. Check the even ones.
- Step 4: 40 = 4 · 10 and 10 = 4 · 2 + 2.
- Challenge: Sₙ = 0 exactly when n is even and Sₙ = 2Sₖ with n = 4k or 4k + 2 and Sₖ = 0.
- Challenge: Write the numbers with this property in base 4: which digits can appear?

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: add six signs.
- Step 2 — AMC 10: use a given self-similarity.
- Step 3 — AMC 10: a parity argument plus a check.
- Step 4 — AMC 10: apply the recursion twice.
- Challenge — AIME: find the exact description of the zeros and count in base 4; like AIME #5–8.

**Research field:** automatic sequences (sequences defined by digits).

---

### Ladder P40 — Cutting Colours

**Idea card:** SL2013-C2, lower-bound part (put the points on a circle; every arc between two different colours must be
crossed by a line, and a line crosses the circle at most twice; one line cut just inside each run of one colour gives
a matching construction).

**Setup:** Points are equally spaced on a circle, and each is red or blue. Straight lines that pass through none of
the points cut the plane into regions. The lines **separate** the colours if no region contains points of both colours.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | Four points around a circle are coloured red, blue, red, blue in order. What is the smallest number of lines that separate the colours? | **2** |
| 2 | MATHCOUNTS | 60 points are numbered 1 to 60 around a circle; point k is blue when k has no common factor with 60 (other than 1), and red otherwise. How many points are blue? | **16** |
| 3 | AMC 10 | For the 60 points of Step 2, what is the smallest number of lines that separate the colours? | **16** |
| **Challenge** | AIME | 105 points are numbered 1 to 105 around a circle; point k is blue when k has no common factor with 105 (other than 1), and red otherwise. What is the smallest number of lines that separate the colours? | **33** |

**Problem analysis** *(members only)*
- Around the circle, colours change between some neighbouring points. The segment joining two neighbours of
  different colours must be crossed by a line, otherwise they are in one region.
- These segments are sides of a convex polygon, and a line crosses the boundary of a convex polygon at most twice.
  So with c colour changes, at least c/2 lines are needed.
- c/2 lines are enough: the blue points form c/2 runs of neighbours, and a line just inside each run cuts it off.
- For 60 points no two neighbours are both coprime to 60 (they would both be odd), so the 16 blue points are 16 runs.
- For 105 points, neighbours can both be coprime to 105; counting the changes gives 66, so 33 lines.

**Logic flow** *(members only)*
1. **A small case (Step 1).** RBRB needs 2 lines: 4 changes, 2 per line. *Why:* it shows the counting.
2. **The colouring (Step 2).** 16 numbers from 1 to 60 are coprime to 60. *Why:* these are the blue points.
3. **Runs (Step 3).** Two neighbours cannot both be odd, so every blue point is its own run: 32 changes, 16 lines.
4. **Apply (Challenge).** For 105 the blue runs are counted around the circle: 66 changes, 33 lines.

**Our full solution**
Let c be the number of neighbouring pairs on the circle with different colours. *Lower bound:* the segment joining such
a pair must meet some line (otherwise both points lie in one region). These segments are sides of the convex polygon
formed by all the points, and a line meets the boundary of a convex polygon in at most two points, so at least c/2
lines are needed. *Upper bound:* the blue points form c/2 runs of consecutive points; for each run, a line crossing the
circle just outside the run's two ends cuts off exactly the arc containing that run (for a single point, a line close
to the tangent there).
These c/2 lines separate the colours. So the answer is c/2. For n = 105 the blue points are the 48 numbers coprime to
105; counting around the circle (including the pair 105, 1), the colour changes 66 times, so the answer is **33**.
Computer check: the colours of all 105 points and the count of changes.

**Short solutions**
- Step 1: four changes and at most two per line: at least 2; two lines (each cutting off one blue point) work.
- Step 2: φ(60) = 60 · (1/2)(2/3)(4/5) = 16.
- Step 3: two neighbours cannot both be odd, so no two blue points are neighbours: 32 changes, 16 lines.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2013 C2 (IMO 2013 Problem 2) *(Related)*: the general problem for points in general position; its
  lower-bound example puts the points on a circle. Our Challenge works only with circles, where both bounds are exact.

**Similar problems on our site**
- Ladder D "No Three in a Line" (live): another problem about points and lines.

**Explore** — *Status: not searched in the literature yet.*
If the points may be anywhere in the plane (no three on a line), with 3 red and 4 blue points, how many lines are
always enough?

**Proof problem** *(not graded)*
Prove that a straight line meets the boundary of a convex polygon in at most two points (if it does not contain a side).
- Hint 1: the part of the line inside the polygon is one segment.
- Solution: the intersection of a line with a convex region is convex, so it is a single segment; its two ends are the
  only points of the line on the boundary.

**Hints**
- Step 1: Count how many times the colour changes as you go around the circle.
- Step 2: Count the numbers from 1 to 60 with no factor 2, 3 or 5.
- Step 3: Can two neighbouring numbers both be odd? So how many runs of blue points are there?
- Challenge: Each line can cross at most two of the gaps where the colour changes, and one line per blue run is enough.
- Challenge: Count the colour changes around the circle of 105 points, including between 105 and 1.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: a small picture count.
- Step 2 — MATHCOUNTS: counting numbers coprime to 60 (MATHCOUNTS Sprint band).
- Step 3 — AMC 10: a lower bound plus a construction (AMC 10 #16–20).
- Challenge — AIME: the same argument with a careful run count; like AIME #3–5.

**Research field:** combinatorial geometry (separating point sets with lines).

---

### Ladder P41 — The Average Crossing

**Idea card:** SL2014-A1 (put dₙ = (z₀ + … + zₙ) − n zₙ; the first inequality is dₙ > 0 and the second is dₙ₊₁ ≤ 0, and since
dₙ₊₁ − dₙ = n(zₙ − zₙ₊₁) < 0 the whole numbers dₙ decrease from d₁ = z₀ > 0, so there is exactly one last positive one).

**Setup:** Let z₀ = 2026 and zₖ = k² for k ≥ 1. For n ≥ 1 let Aₙ = (z₀ + z₁ + … + zₙ)/n and dₙ = (z₀ + z₁ + … + zₙ) − n zₙ.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is 1² + 2² + … + 14²? | **1015** |
| 2 | AMC 8 | What is d₃? | **2013** |
| 3 | AMC 10 | dₙ₊₁ − dₙ = n(zₙ − zₙ₊₁). What is d₁₁ − d₁₀? | **-210** |
| 4 | AMC 10 | What is d₁₅? | **-109** |
| **Challenge** | AIME | There is exactly one n ≥ 1 with zₙ < Aₙ ≤ zₙ₊₁. What is it? | **14** |

**Problem analysis** *(members only)*
- zₙ < Aₙ is the same as n zₙ < z₀ + … + zₙ, that is dₙ > 0.
- Aₙ ≤ zₙ₊₁ is the same as z₀ + … + zₙ ≤ n zₙ₊₁, that is dₙ₊₁ ≤ 0 (since dₙ₊₁ = z₀ + … + zₙ − n zₙ₊₁).
- dₙ₊₁ − dₙ = n(zₙ − zₙ₊₁) < 0 because the zₖ increase from k = 1 on, and d₁ = z₀ > 0. So the dₙ go down, and the
  wanted n is the last one with dₙ > 0: it exists and is unique.
- dₙ = 2026 + n(n + 1)(2n + 1)/6 − n³: d₁₄ = 297 > 0 and d₁₅ = −109, so n = 14.

**Logic flow** *(members only)*
1. **A sum of squares (Step 1).** 1² + … + 14² = 14 · 15 · 29/6 = 1015. *Why:* it appears in d₁₄.
2. **The helper numbers (Step 2).** d₃ = 2026 + 14 − 27 = 2013. *Why:* both inequalities become signs of dₙ.
3. **They go down (Step 3).** dₙ₊₁ − dₙ = n(zₙ − zₙ₊₁) = −n(2n + 1): d₁₁ − d₁₀ = −210. *Why:* a decreasing sequence
   changes sign only once.
4. **Find the sign change (Step 4).** d₁₅ = −109 < 0. *Why:* the crossing is just before it.
5. **Apply (Challenge).** d₁₄ = 297 > 0 and d₁₅ ≤ 0: n = 14.

**Our full solution**
Multiply by n: zₙ < Aₙ ⇔ dₙ > 0, and Aₙ ≤ zₙ₊₁ ⇔ z₀ + … + zₙ ≤ n zₙ₊₁ ⇔ dₙ₊₁ ≤ 0. Also
dₙ₊₁ − dₙ = (zₙ₊₁ − (n + 1)zₙ₊₁) + n zₙ = n(zₙ − zₙ₊₁) < 0 for n ≥ 1, so d₁ > d₂ > d₃ > …; d₁ = z₀ = 2026 > 0 and dₙ → −∞.
So exactly one n has dₙ > 0 ≥ dₙ₊₁: the last positive term. Here dₙ = 2026 + n(n + 1)(2n + 1)/6 − n³. d₁₄ = 2026 + 1015
− 2744 = 297 > 0 and d₁₅ = 2026 + 1240 − 3375 = −109 ≤ 0, so the answer is **14**. Computer check: the averages Aₙ
compared with zₙ and zₙ₊₁ for n = 1, …, 200.

**Short solutions**
- Step 1: 14 · 15 · 29/6 = 1015.
- Step 2: 2026 + 1 + 4 + 9 − 3 · 9 = 2013.
- Step 3: 10 · (100 − 121) = −210.
- Step 4: 2026 + 1240 − 15 · 225 = −109.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2014 A1 (IMO 2014 Problem 1) *(Strong)*: proves that exactly one such n exists for every increasing
  sequence of positive whole numbers. Our Challenge finds it for one sequence.

**Similar problems on our site**
- Ladder P12 "The Closest Climb": another problem about a sequence and its averages.

**Explore** — *Status: not searched in the literature yet.*
For z₀ = N and zₖ = k² (k ≥ 1), how does the special n grow with N? Try N = 10⁴ and N = 10⁶.

**Proof problem** *(not graded)*
Prove that there is exactly one n ≥ 1 with zₙ < Aₙ ≤ zₙ₊₁, for any z₀ > 0 and increasing whole numbers z₁ < z₂ < ….
- Hint 1: rewrite both inequalities with dₙ.
- Solution: the conditions are dₙ > 0 ≥ dₙ₊₁; the whole numbers dₙ strictly decrease from d₁ = z₀ > 0, so exactly one n is
  the last with dₙ > 0.

**Hints**
- Step 1: Use 1² + 2² + … + n² = n(n + 1)(2n + 1)/6.
- Step 2: Add z₀ + z₁ + z₂ + z₃ and subtract 3 · z₃.
- Step 3: Put n = 10 into n(zₙ − zₙ₊₁).
- Step 4: Use the formula from Step 1 with n = 15, then subtract 15 · z₁₅.
- Challenge: zₙ < Aₙ means dₙ > 0, and Aₙ ≤ zₙ₊₁ means dₙ₊₁ ≤ 0.
- Challenge: The dₙ decrease, so find the last n with dₙ > 0.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: a known sum formula.
- Step 2 — AMC 8: direct computation.
- Step 3 — AMC 10: a telescoping difference (AMC 10 #6–10).
- Step 4 — AMC 10: evaluate a formula.
- Challenge — AIME: rewriting two inequalities and locating a sign change; like AIME #1–3.

**Research field:** sequences and averages.
