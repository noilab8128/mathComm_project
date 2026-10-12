# Solution-path ladders v2 — batch 1 (P2–P6)

- Date: 2026-10-11
- Status: **draft for review, not imported.** Built with [LADDER_RULES_v2.md](../LADDER_RULES_v2.md).
- Answer check: `python3 ladders/v2/verify_v2_batch1.py` (every answer and every number in the analysis, flow and
  solutions).
- Internal only: the `Idea card` lines name the sources. They are never shown on the site.

---

### Ladder P2 — The Floor Table

**Idea card:** SL2021-A2 (pair the entry for row i with the entry for row n + 1 − i: the two fractions add up to a
whole number, so their floors add up to one less, unless both are whole numbers). Combined with counting pairs
(i, j) for which a number divides ij, by the greatest common divisor.

**Setup:** For a whole number n, fill an n × n table: the entry in row i and column j (1 ≤ i, j ≤ n) is ⌊ij/(n + 1)⌋,
the fraction ij/(n + 1) rounded down. Let S(n) be the sum of all n² entries.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is S(4), the sum of the 16 entries of the table for n = 4? | **12** |
| 2 | AMC 8 | In the table for n = 6, what is the sum of the 6 entries in column 3? | **6** |
| 3 | AMC 10 | In the table for n, the entries ij/(n + 1) and (n + 1 − i)j/(n + 1) add up to the whole number j, so their floors add up to j − 1, or to j when both fractions are whole numbers. For n = 12 (where n + 1 = 13 is prime, so no fraction ij/13 is a whole number), what is S(12)? | **396** |
| 4 | AMC 10 | For n = 11, in how many of the 121 cells (i, j) is ij divisible by 12? | **17** |
| 5 | AMC 10 | It is known that 4 × S(n) = n²(n − 1) + 2D, where D is the number of cells (i, j) with ij divisible by n + 1. What is S(11)? | **311** |
| **Challenge** | AIME | What is S(2025)? | **2074917262** |

**Problem analysis** *(members only)*
- Without rounding, the entries add up to (1 + 2 + … + n)²/(n + 1) = n²(n + 1)/4, and rounding takes away less than 1
  from each of the n² entries. So S(n) is a little below n²(n + 1)/4, but "a little" is up to n², far too vague.
- The table has a symmetry: rows i and n + 1 − i in the same column add up to exactly j before rounding.
- When two numbers add up to a whole number, their floors add up to that number minus 1, unless both are whole
  numbers. So the exact answer depends only on how many entries are whole numbers.
- An entry ij/(n + 1) is a whole number exactly when n + 1 divides ij. When n + 1 is prime this never happens, which
  is the cleanest case.
- For n = 2025 we have n + 1 = 2026 = 2 × 1013, so a whole-number entry needs the factor 1013 from i or j and a
  factor 2 from the other. Counting these cells finishes the problem.

**Logic flow** *(members only)*
1. **Get a feel for the table (Step 1).** Compute a small table directly. *Why:* it shows that the floors behave
   irregularly, so a formula needs an idea.
2. **Pair rows i and n + 1 − i (Step 2).** In one column, the two fractions add up to j, so the floors add up to
   j − 1, or j when both are whole numbers. *Why:* this turns rounding errors into something exact.
3. **Add up all the pairs (Step 3).** Over the whole table this gives 2S(n) = n(1 + 2 + … + n − n) + D, that is
   4S(n) = n²(n − 1) + 2D, where D counts the whole-number entries. If n + 1 is prime, D = 0.
4. **Count the whole-number entries (Step 4).** For each row i, the entry is whole exactly when j is a multiple of
   (n + 1)/gcd(i, n + 1). *Why:* D is the only unknown left.
5. **Finish with the formula (Step 5).** Put D into 4S(n) = n²(n − 1) + 2D.

**Our full solution**
Pair the cells (i, j) and (n + 1 − i, j). Their fractions add up to j, so their floors add up to j − 1, or to j if
n + 1 divides ij (then it also divides (n + 1 − i)j). Adding over all cells counts every cell twice:
2S(n) = n × (0 + 1 + … + (n − 1)) + D = n²(n − 1)/2 + D, where D is the number of cells with n + 1 dividing ij.
For n = 2025, n + 1 = 2026 = 2 × 1013. A cell needs 1013 to divide i or j; the only such number up to 2025 is 1013
itself. If i = 1013 (odd), j must be even: 1012 cells; if j = 1013, i must be even: 1012 cells; i = j = 1013 does
not work (1013² is odd). So D = 2024 and S(2025) = 2025² × 2024/4 + 2024/2 = 2 074 916 250 + 1012 = **2 074 917 262**.
Computer check: the formula against a direct sum for every n ≤ 60, and D(2025) counted directly.

**Short solutions**
- Step 1: the 16 entries ⌊ij/5⌋ for i, j = 1..4 add up to 12.
- Step 2: column 3 has ⌊3i/7⌋ for i = 1..6: 0, 0, 1, 1, 2, 2, total 6 (pairs i, 7 − i add up to 2 each).
- Step 3: each column j has 6 pairs adding up to j − 1, so S(12) = 6 × (0 + 1 + … + 11) = 6 × 66 = 396.
- Step 4: for each i the entry is whole when j is a multiple of 12/gcd(i, 12); counting over i = 1..11 gives 17.
- Step 5: 4 × S(11) = 121 × 10 + 34 = 1244, so S(11) = 311.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2021 A2 *(Strong)*: shows that this double sum equals n²(n − 1)/4 exactly when n + 1 is prime. Our
  Challenge asks for the value in a case where n + 1 is not prime.

**Similar problems on our site**
- Ladder X "Floors of Quotients" (draft v0.3): another problem about sums of floors.

**Explore** — *Status: known (related to sums of ⌊ij/m⌋ and Dedekind sums).*
For which n is S(n) an odd number? Make a table for n ≤ 30 and look for the pattern in D.

**Proof problem** *(not graded)*
Prove that 4S(n) = n²(n − 1) holds exactly when n + 1 is prime.
- Hint 1: by the pairing, 4S(n) = n²(n − 1) + 2D.
- Hint 2: if n + 1 = ab with 1 < a, b, look at the cell (a, b).
- Solution: by the pairing argument, 4S(n) − n²(n − 1) = 2D, so the equation holds exactly when D = 0. If n + 1 is
  prime, it divides no product ij with 1 ≤ i, j ≤ n, so D = 0. If n + 1 = ab with 1 < a, b ≤ n, the cell (a, b) has
  ab = n + 1 dividing ij, so D > 0.

**Research field:** elementary number theory (floor sums, lattice points under a line).

---

### Ladder P3 — The Safe Start

**Idea card:** SL2017-N3 (for a composite n = ab, n − 1 copies of a and one 0 leave no safe start; for a prime n,
chaining "bad" blocks around the circle n times gives k × total divisible by n with 0 < k < n, which is impossible).

**Setup:** n beads sit in a circle, each with a whole number on it, and the total of all n numbers is **not**
divisible by n. Start at some bead and walk once around the circle clockwise, writing down the n running totals (the
first number, the first two added, and so on). The start is **safe** if none of these n running totals is
divisible by n. A number n ≥ 2 is **good** if every such necklace of n beads has at least one safe start.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | Four beads carry 1, 1, 1, 2 in this order around the circle (total 5). How many of the 4 starts are safe? | **1** |
| 2 | AMC 8 | Six beads carry 2, 2, 2, 2, 2, 0 (total 10, not divisible by 6). How many of the 6 starts are safe? | **0** |
| 3 | AMC 10 | Twelve beads carry 11 copies of a number a and one 0, where 2 ≤ a ≤ 11. For how many of these values of a is there no safe start? | **7** |
| 4 | AMC 8 | Seven beads have total 10. Ana walks around the circle in jumps; each jump covers a block of beads whose sum is divisible by 7. After 7 jumps she has gone around the circle k whole times, so her jumps add up to 10k. What is the smallest positive k for which 10k is divisible by 7? | **7** |
| **Challenge** | AIME | What is the sum of all good numbers n from 2 to 100? | **1060** |

**Problem analysis** *(members only)*
- A start fails as soon as one running total is divisible by n, so a "bad" necklace is one where every start fails.
- To break a composite n = ab, make every start reach a multiple of n quickly: with n − 1 copies of a, any b
  consecutive copies of a add up to ab = n.
- For a prime n, suppose every start fails. Then from every bead there is a block (starting there) whose sum is a
  multiple of n. Following these blocks one after another must eventually repeat a bead, so some chain of blocks goes
  around the circle a whole number of times.
- If such a chain covers the circle k times, its sum is k × total. It is a multiple of n, and n is prime and does not
  divide the total, so n must divide k. But a chain with at most n blocks covers the circle fewer than n times.
- So the good numbers are exactly the primes, and the Challenge is the sum of the primes up to 100.

**Logic flow** *(members only)*
1. **Test a small necklace (Step 1).** Write out the running totals from each start. *Why:* it makes "safe" concrete.
2. **Break composite n (Step 2).** Use n − 1 copies of a and one 0 with n = ab: every start reaches a block of b
   copies of a, which adds up to n. *Why:* it shows composite numbers are not good.
3. **Which a work (Step 3).** The construction fails only when a has a common factor with n; for n = 12 that is
   a = 2, 3, 4, 6, 8, 9, 10. *Why:* it shows the role of the factorisation, not just "n is composite".
4. **Primes are good (Step 4).** If every start failed, chain the bad blocks: some chain wraps the circle k times
   with 0 < k < n and has sum k × total, divisible by the prime n, which forces n to divide the total. Contradiction.
5. **Add the primes up to 100 (Challenge).** 2 + 3 + 5 + … + 97 = 1060.

**Our full solution**
Composite n = ab (1 < a, b < n): put a on n − 1 beads and 0 on one bead; the total (n − 1)a leaves remainder n − a
when divided by n, so it is not divisible by n. From any start, the walk passes b copies of a in a row (with the 0
possibly among them), so some running total equals ab = n: no start is safe.
Prime n: suppose no start is safe. From each bead i, let ℓᵢ be the number of beads up to the first running total
divisible by n; ℓᵢ ≤ n − 1, because the full total is not divisible by n. Jump from bead i to the bead ℓᵢ places
later. Within n jumps some bead repeats, giving a cycle of m ≤ n jumps that goes around the circle a whole number k of
times: k × n = (sum of the ℓ's) ≤ m(n − 1) < n², so 1 ≤ k ≤ n − 1. The beads covered add up to
k × total, and each jump's block adds up to a multiple of n, so n divides k × total. As n is prime and divides
neither k nor the total, this is impossible. So the good numbers are exactly the primes, and the sum of the primes up
to 100 is **1060**.
Computer check: every necklace with numbers 0..n − 1 for n ≤ 7 (good exactly for 2, 3, 5, 7), and the sum of the
primes up to 100.

**Short solutions**
- Step 1: starting at the first 1 the totals are 1, 2, 3, 5: none divisible by 4, so this start is safe. The other
  starts reach 4 (1, 2, 4 / 1, 3, 4 / 2, 3, 4). One safe start.
- Step 2: from any start, three consecutive 2s appear before the walk ends, and 2 + 2 + 2 = 6.
- Step 3: the necklace has no safe start exactly when a shares a factor with 12: a = 2, 3, 4, 6, 8, 9, 10 (7 values).
- Step 4: 7 divides 10k only when 7 divides k, so k = 7. But k must be less than 7, which is the contradiction that
  makes primes good.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2017 N3 *(Strong)*: asks which n have this property for every choice of numbers; the answer is the
  primes. Our Challenge turns the classification into a sum.

**Similar problems on our site**
- Ladder J "Root or Add Three" (draft v0.3): another problem decided by remainders.

**Explore** — *Status: not searched in the literature yet.*
Call a start "very safe" if no running total is divisible by n, including the last one. For a prime n, what is the
smallest possible number of safe starts?

**Proof problem** *(not graded)*
Prove that every prime n is good.
- Hint 1: assume no start is safe and, from each bead, jump to just after the first block whose sum is divisible by n.
- Hint 2: the jumps must eventually cycle; how many times does a cycle go around the circle?
- Solution: see "Our full solution": a cycle of jumps wraps the circle k times with 0 < k < n, its sum k × total is
  divisible by n, so the prime n divides the total, a contradiction.

**Research field:** combinatorial number theory (zero-sum problems).

---

### Ladder P4 — Primes That Add Up

**Idea card:** SL2022-N2 (the largest prime r up to n must divide a sum p + q of two smaller primes, and p + q < 2r
forces p + q = r = 2 + (r − 2); repeating with the next prime forces three primes r − 4, r − 2, r, one of which is a
multiple of 3).

**Setup:** For n ≥ 3, let P(n) be the product of p + q over all pairs of primes p < q ≤ n, and let R(n) be the product
of all primes up to n. For example, the primes up to 5 are 2, 3, 5, so P(5) = (2 + 3)(2 + 5)(3 + 5) and
R(5) = 2 × 3 × 5.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is P(7)? | **302400** |
| 2 | AMC 8 | How many pairs of primes p < q ≤ 13 have p + q divisible by 13? | **1** |
| 3 | AMC 8 | How many primes r below 1000 have the property that r − 4, r − 2 and r are all prime? | **1** |
| 4 | AMC 8 | For how many n from 3 to 6 does R(n) divide P(n)? | **0** |
| **Challenge** | AIME | Find the sum of all n ≥ 3 for which R(n) divides P(n). | **34** |

**Problem analysis** *(members only)*
- R(n) divides P(n) exactly when every prime r ≤ n divides at least one sum p + q.
- The largest prime r ≤ n is the hardest to reach: every sum p + q of primes up to n is less than 2r, so r must be
  equal to some sum p + q. An odd prime that is a sum of two primes must be 2 + (r − 2).
- The same reasoning for the next prime down, s = r − 2, forces s − 2 or s + 2 = r to work with 2, which gives three
  primes r − 4, r − 2, r.
- Among three numbers that differ by 2, one is a multiple of 3, so the only such triple of primes is 3, 5, 7.
- So the largest prime up to n is 7, which means 7 ≤ n ≤ 10, and each of these n can be checked directly.

**Logic flow** *(members only)*
1. **Compute a small case (Step 1).** P(7) = 5 × 7 × 9 × 8 × 10 × 12 = 302 400, which is divisible by R(7) = 210.
2. **The largest prime needs an exact sum (Step 2).** Every p + q is less than 2r, so r must equal p + q, which means
   p = 2 and q = r − 2. *Why:* this pins the largest primes down.
3. **Three primes in a row (Step 3).** Repeating for the second largest prime forces r − 4, r − 2, r all prime, and
   one of them is a multiple of 3, so r = 7. *Why:* this bounds n.
4. **Small cases (Step 4).** For n = 3, 4, 5, 6 some prime does not divide P(n). *Why:* the answer set must be
   checked at both ends.
5. **Check n = 7 to 10 (Challenge).** All four work, and 7 + 8 + 9 + 10 = 34.

**Our full solution**
For n = 3, 4 the only sum is 2 + 3 = 5, which 3 does not divide; for n = 5, 6 the sums are 5, 7, 8 and 3 divides
none of them. So assume n ≥ 7 and let r ≥ 7 be the largest prime with r ≤ n (every prime up to n is at most r).
If R(n) divides P(n), r divides some p + q with p < q ≤ r; since p + q < 2r, p + q = r, and as r is odd, p = 2 and
r − 2 is prime. So the next smaller prime is s = r − 2. Now s divides some p' + q' with p' < q' ≤ r, and
p' + q' ≤ (r − 2) + r = 2s + 2 < 3s, so p' + q' is s or 2s. If p' + q' = s, then p' = 2 and s − 2 = r − 4 is prime.
If p' + q' = 2s = 2r − 4, then q' = r (q' = s would need p' = s, and q' < s is too small), so p' = r − 4 is prime.
Either way r − 4, r − 2, r are all prime; one of them is divisible by 3, so they are 3, 5, 7 and r = 7. Hence
7 ≤ n ≤ 10 (11 is prime), and all four values work. The sum is 7 + 8 + 9 + 10 = **34**. Computer check: every n up
to 500.

**Short solutions**
- Step 1: the pairs from 2, 3, 5, 7 give 5, 7, 9, 8, 10, 12; their product is 302 400.
- Step 2: sums of two primes up to 13 are below 26, so the sum must be 13 = 2 + 11: one pair.
- Step 3: of r − 4, r − 2, r one is a multiple of 3, so one of them is 3: only r = 7 (3, 5, 7).
- Step 4: for n = 3, 4 the only sum is 5, and for n = 5, 6 the sums are 5, 7, 8; the prime 3 divides none of them.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2022 N2 *(Strong)*: asks for which n the number n! divides the same product of sums; the answer is
  n = 7. Our Challenge uses the product of the primes up to n instead of n!.

**Similar problems on our site**
- Ladder H "Divisors Plus Three" (draft v0.2): another classification decided by small primes.

**Explore** — *Status: not searched in the literature yet.*
Use products p × q + 1 instead of sums p + q. For which n does R(n) divide the product of all p × q + 1?

**Proof problem** *(not graded)*
Prove that the only primes r with r − 4, r − 2 and r all prime is r = 7.
- Hint: look at the three numbers modulo 3.
- Solution: r − 4, r − 2, r leave three different remainders modulo 3 (they differ by 2 and 4, which are 2 and 1
  modulo 3), so one of them is divisible by 3 and, being prime, equals 3. Then r − 4 = 3, and r = 7 works.

**Research field:** elementary number theory (primes in short gaps; Goldbach-type sums).

---

### Ladder P5 — Square Triples

**Idea card:** SL2021-N2 (three numbers whose pairwise sums are squares come from three squares: if the sums are
A, B, C then the numbers are (A + B − C)/2, (A + C − B)/2, (B + C − A)/2; consecutive squares give the family
2k² − 4k, 2k² + 1, 2k² + 4k).

**Setup:** A **square triple** is three different positive whole numbers x < y < z such that x + y, x + z and y + z are
all perfect squares. For example 6, 19, 30 is a square triple: 25, 36 and 49 are squares.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | Find the whole number z with 19 < z < 50 such that 6 + z and 19 + z are both perfect squares. | **30** |
| 2 | AMC 8 | Three numbers x < y < z satisfy x + y = 49, x + z = 64 and y + z = 81. What is x? | **16** |
| 3 | AMC 8 | For each k ≥ 3 the numbers 2k² − 4k, 2k² + 1 and 2k² + 4k form a square triple (their sums are (2k − 1)², (2k)², (2k + 1)²). For k = 5, what is x + y + z? | **151** |
| 4 | AMC 10 | How many square triples have all three pairwise sums at most 100? | **7** |
| **Challenge** | AIME | How many square triples have z ≤ 100? | **16** |

**Problem analysis** *(members only)*
- Searching for x, y, z directly is slow. The three sums are the natural unknowns: call them a² < b² < c².
- From the sums the numbers come back: x = (a² + b² − c²)/2, y = (a² + c² − b²)/2, z = (b² + c² − a²)/2.
- These are whole numbers exactly when a² + b² + c² is even, and x is positive exactly when a² + b² > c². Different
  squares a < b < c give x < y < z automatically.
- So square triples correspond one-to-one to triples of squares a < b < c with a² + b² + c² even and a² + b² > c².
- Counting triples with z ≤ 100 means counting such (a, b, c) with b² + c² − a² ≤ 200.

**Logic flow** *(members only)*
1. **Try a small case (Step 1).** Fix two of the numbers and search for the third. *Why:* it shows how rare the
   triples are.
2. **Work with the sums (Step 2).** From x + y, x + z, y + z, half of (sum of two) minus (the third) gives each
   number. *Why:* now we choose three squares instead of three numbers.
3. **A family (Step 3).** Consecutive squares (2k − 1)², (2k)², (2k + 1)² always work. *Why:* it shows there are
   infinitely many triples and gives a feel for their size.
4. **The exact conditions (Step 4).** Squares a < b < c give a square triple exactly when a² + b² + c² is even and
   a² + b² > c². *Why:* this makes the counting finite and mechanical.
5. **Count with z ≤ 100 (Challenge).** z = (b² + c² − a²)/2 ≤ 100; list the (a, b, c) that pass all conditions.

**Our full solution**
A square triple x < y < z with sums x + y = a², x + z = b², y + z = c² (so a < b < c) gives
x = (a² + b² − c²)/2, y = (a² + c² − b²)/2, z = (b² + c² − a²)/2; conversely any a < b < c with a² + b² + c² even and
a² + b² > c² gives a square triple. Listing all (a, b, c) with (b² + c² − a²)/2 ≤ 100 gives **16** triples, for
example (2, 23, 98), (2, 34, 47) and (6, 19, 30). Computer check: the same 16 triples found by trying
every x < y < z ≤ 100.

**Short solutions**
- Step 1: 6 + z and 19 + z are squares that differ by 13 = 49 − 36, so 6 + z = 36 and z = 30.
- Step 2: x = (49 + 64 − 81)/2 = 16 (then y = 33 and z = 48).
- Step 3: for k = 5 the numbers are 30, 51, 70, with sum 151 (in general 6k² + 1).
- Step 4: list squares a < b < c ≤ 100 (c ≤ 10) with a² + b² + c² even and a² + b² > c²: 7 triples.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2021 N2 (IMO 2021 Problem 1) *(Strong)*: cards numbered n, …, 2n are split into two piles; it shows
  one pile has two cards whose sum is a square, using a square triple inside [n, 2n].

**Similar problems on our site**
- Ladder E "Dots on a Circle" (live): another problem about sums of squares.

**Explore** — *Status: not searched in the literature yet.*
Find four different numbers whose six pairwise sums are all squares. (They exist, but the smallest one is large.)

**Proof problem** *(not graded)*
Prove that for every k ≥ 3 the numbers 2k² − 4k, 2k² + 1, 2k² + 4k form a square triple.
- Hint: add them in pairs.
- Solution: (2k² − 4k) + (2k² + 1) = 4k² − 4k + 1 = (2k − 1)², (2k² − 4k) + (2k² + 4k) = 4k² = (2k)², and
  (2k² + 1) + (2k² + 4k) = (2k + 1)². For k ≥ 3 the three numbers are positive and different.

**Research field:** Diophantine equations (perfect squares and their sums).

---

### Ladder P6 — The Half That Never Ends

**Idea card:** SL2015-N1 (with bₖ = 2aₖ odd, the rule becomes bₖ₊₁ = bₖ(bₖ − 1)/2 and bₖ₊₁ − 3 = (bₖ − 3)(bₖ + 2)/2,
so the power of 2 in bₖ − 3 drops by one each step) + SL2023-N3 (adding up powers of 2 over 1..m, as in
Legendre's formula).

**Setup:** For a whole number M ≥ 2, start with a₀ = (2M + 1)/2 and repeat the rule aₖ₊₁ = aₖ × ⌊aₖ⌋, where ⌊a⌋ is a
rounded down. Let T(M) be the number of steps until the first whole number appears (for example, if a₁ is the
first whole number, T(M) = 1).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is T(5)? (Start with a₀ = 11/2.) | **3** |
| 2 | AMC 8 | Write bₖ = 2aₖ. While aₖ is not a whole number, bₖ is odd and bₖ₊₁ = bₖ(bₖ − 1)/2. Starting with b₀ = 11, what is b₁ − 3? | **52** |
| 3 | AMC 10 | The identity bₖ₊₁ − 3 = (bₖ − 3)(bₖ + 2)/2 shows that the power of 2 dividing bₖ − 3 drops by exactly one each step. What is T(97)? | **6** |
| 4 | AMC 10 | What is the largest power of 2 that divides 1024! ? Give the exponent. | **1023** |
| **Challenge** | AIME | What is T(2) + T(3) + T(4) + … + T(1025)? | **2047** |

**Problem analysis** *(members only)*
- Fractions with denominator 2 are awkward, so double everything: bₖ = 2aₖ is odd as long as no whole number has
  appeared, and the rule becomes bₖ₊₁ = bₖ(bₖ − 1)/2.
- A whole number appears exactly when some bₖ is even.
- The value 3 is special: b = 3 gives 3 × 2/2 = 3 again. Measuring the distance to 3 gives the clean identity
  bₖ₊₁ − 3 = (bₖ − 3)(bₖ + 2)/2, and bₖ + 2 is odd.
- So each step removes exactly one factor 2 from bₖ − 3. Starting from b₀ − 3 = 2(M − 1), the number of steps is
  the number of factors 2 in M − 1, plus one: T(M) = v₂(M − 1) + 1.
- Adding T(M) over M = 2..1025 adds v₂(m) + 1 over m = 1..1024, which is the exponent of 2 in 1024! plus 1024.

**Logic flow** *(members only)*
1. **Run the rule (Step 1).** For M = 5: 11/2 → 55/2 → 1485/2 → a whole number: three steps.
2. **Double the numbers (Step 2).** bₖ = 2aₖ is odd until a whole number appears, and bₖ₊₁ = bₖ(bₖ − 1)/2. *Why:* odd
   whole numbers are easier than halves.
3. **Measure the distance to 3 (Step 3).** bₖ₊₁ − 3 = (bₖ − 3)(bₖ + 2)/2 with bₖ + 2 odd, so the power of 2 in bₖ − 3
   drops by one each step, giving T(M) = v₂(M − 1) + 1. For M = 97: v₂(96) = 5, so T = 6.
4. **Add powers of 2 (Step 4).** v₂(1) + v₂(2) + … + v₂(1024) = 512 + 256 + … + 1 = 1023 (Legendre's formula).
5. **Finish (Challenge).** The sum of T(M) for M = 2..1025 is 1024 + 1023 = 2047.

**Our full solution**
Let bₖ = 2aₖ. While aₖ is not a whole number, bₖ is odd and bₖ₊₁ = 2aₖ₊₁ = bₖ⌊bₖ/2⌋ = bₖ(bₖ − 1)/2. Then
bₖ₊₁ − 3 = (bₖ² − bₖ − 6)/2 = (bₖ − 3)(bₖ + 2)/2, and bₖ + 2 is odd, so v₂(bₖ₊₁ − 3) = v₂(bₖ − 3) − 1. Since
b₀ − 3 = 2(M − 1) has v₂ = v₂(M − 1) + 1, the numbers b₁ − 3, b₂ − 3, … lose one factor 2 each time; when
v₂(bₖ − 3) reaches 0 at k = v₂(M − 1) + 1, bₖ − 3 is odd, so bₖ is even and aₖ is a whole number for the first time.
So T(M) = v₂(M − 1) + 1, and T(2) + … + T(1025) = 1024 + (v₂(1) + … + v₂(1024)) = 1024 + 1023 = **2047**.
Computer check: the rule run exactly with fractions for every M from 2 to 1025.

**Short solutions**
- Step 1: 11/2 → (11/2) × 5 = 55/2 → (55/2) × 27 = 1485/2 → (1485/2) × 742 = 550 935, a whole number: 3 steps.
- Step 2: b₁ = 11 × 10/2 = 55, so b₁ − 3 = 52 (= 8 × 13/2).
- Step 3: b₀ − 3 = 192 = 2⁶ × 3, so after 6 steps the power of 2 is used up: T(97) = 6.
- Step 4: 512 + 256 + 128 + 64 + 32 + 16 + 8 + 4 + 2 + 1 = 1023.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2015 N1 *(Strong)*: proves that for every M ≥ 2 this sequence eventually contains a whole number.
  Our Challenge counts exactly how long it takes.
- IMO Shortlist 2023 N3 *(Related)*: uses Legendre's formula, the same way of adding powers of a prime.

**Similar problems on our site**
- Ladder P1 "The Cheapest Bakery": also counts powers of a prime layer by layer.

**Explore** — *Status: not searched in the literature yet.*
Replace ⌊aₖ⌋ by ⌈aₖ⌉ (round up). How long does it take now for a₀ = (2M + 1)/2?

**Proof problem** *(not graded)*
Prove that T(M) = v₂(M − 1) + 1 for every M ≥ 2.
- Hint: show bₖ₊₁ − 3 = (bₖ − 3)(bₖ + 2)/2.
- Solution: see "Our full solution".

**Research field:** p-adic analysis of recursions (2-adic valuations).
