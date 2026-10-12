# Problem Ladders v0.3 — draft (20 ladders built from idea cards)

- Date: 2026-10-09
- Status: **draft for review, not imported.** Ladders I–Z and AA–AB (20 ladders, 20 Challenges, 112 problems).
- Answer check: `python3 ladders/verify_ladders_v0_3.py` (all checks pass; `--quick` skips two slow searches).
  Every answer is checked by brute force, a full search, or an explicit example plus a counting bound.
- Same rules as v0.1 and v0.2: short answer only, no ambiguity, computer check, copyright. Each ladder takes only
  the **idea** of its card; problems, numbers, stories and solutions are our own.
- Internal only: the `Idea card` line names the source. It is never shown on the site.
- Levels: Kangaroo ≈ 2, MATHCOUNTS ≈ 4, AMC 8 ≈ 5, AMC 10 ≈ 6, AIME ≈ 8 (the `difficulty` value on import).
- **Not done yet** (same as v0.2): an independent solver reading every problem cold, human review, a web search
  for each Challenge's twist, a famous open problem and the "after the ladder" extras for each ladder.

| Ladder | Name | Area | Subdomain | Idea card | Challenge answer |
|---|---|---|---|---|---|
| I | Three Divisors Make a Total | Number theory | Divisors and Divisibility | SL2022-N1 | 1348 |
| J | Root or Add Three | Number theory | Congruences | SL2017-N1 | 334 |
| K | Divisor Counts That Double | Number theory | Primes and Prime Factorization | SL2011-N1 | 7 |
| L | The Shrinking Product | Number theory | Diophantine Equations | SL2010-N1 | 28 |
| M | The Average Divisor Count | Number theory | Divisors and Divisibility | SL2006-N3 | 43 |
| N | Values That Share a Factor | Number theory | Congruences | SL2016-N3 | 195 |
| O | Pick With Small Gaps | Combinatorics | Extremal Combinatorics | SL2022-C1 | 507 |
| P | Rainbow Necklaces | Combinatorics | Extremal Combinatorics | SL2021-C2 | 10 |
| Q | Flip the k-th Coin | Combinatorics | Invariants and Processes | SL2019-C3 | 39 |
| R | Rooks and Empty Squares | Combinatorics | Extremal Combinatorics | SL2014-C3 | 5 |
| S | Pairs With Different Sums | Combinatorics | Extremal Combinatorics | SL2012-C2 | 809 |
| T | Triples Without Repeats | Combinatorics | Extremal Combinatorics | SL2009-C2 | 1351 |
| U | Doubling Prefix Sums | Combinatorics | Permutations and Combinations | SL2008-C2 | 648 |
| V | Same-Colour Triples | Combinatorics | Double Counting | SL2007-C3 | 216 |
| W | Lattice Friends | Combinatorics / number theory | Combinatorial Geometry | SL2008-C3 | 1260 |
| X | Floors of Quotients | Algebra | Floor and Fractional Parts | SL2021-A3 | 11 |
| Y | Sums That Divide the Total | Algebra / number theory | Divisors and Divisibility | SL2011-A1 | 12 |
| Z | Average of the Last Few | Algebra | Sequences and Recurrences | SL2018-A4 | 71 |
| AA | The Inner Arc | Geometry | Triangle Centres and Circles | SL2006-G1 | 85 |
| AB | Powers Plus Fourth Powers | Number theory | Diophantine Equations | SL2023-N2 | 18 |

---

### Ladder I — Three Divisors Make a Total

**Idea card:** SL2022-N1 (write the three divisors as N/a, N/b, N/c; the target is N × (1/a + 1/b + 1/c), and a
small N forces a large bracket, which leaves only a few cases).

**Setup:** A divisor of N is a positive whole number that divides N exactly (1 and N count). The three divisors
in each problem must be different.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | The divisors of 12 are 1, 2, 3, 4, 6, 12. In how many ways can you choose three different divisors of 12 that add up to 19? | **2** |
| 2 | Kangaroo / MATHCOUNTS | What is the smallest whole number N such that three different divisors of N add up to N itself? | **6** |
| 3 | MATHCOUNTS | Three different divisors of N are N/a, N/b and N/c, with a < b < c, and they add up to N. What is a + b + c? | **11** |
| 4 | AMC 8 | What is the smallest whole number N that has three different divisors adding up to 100? | **60** |
| **Challenge** | AIME | What is the smallest whole number N that has three different divisors adding up to 2026? | **1348** |

**Short solutions**
- Step 1: With 12: the other two must add to 7, which gives {1, 6} or {3, 4}. Without 12: at most 6 + 4 + 3 = 13.
  So {1, 6, 12} and {3, 4, 12}.
- Step 2: 1 + 2 + 3 = 6. The numbers 1 to 5 have too few divisors, and 4 gives 1 + 2 + 4 = 7.
- Step 3 (the key idea): dividing by N gives 1/a + 1/b + 1/c = 1. Here a = 1 is impossible (the other two
  fractions would add to 0), so a ≥ 2. Then a = 2 forces 1/b + 1/c = 1/2, so b = 3, c = 6 (b = 4 needs c = 4).
  And a = 3 is too small: 1/3 + 1/4 + 1/5 < 1. So a + b + c = 2 + 3 + 6 = 11.
- Step 4: 100 = N(1/a + 1/b + 1/c). If N < 60 the bracket is more than 5/3. That forces a = 1 and b = 2, because
  a ≥ 2 gives at most 1/2 + 1/3 + 1/4 = 13/12. Then 1/c > 1/6, so c is 3, 4 or 5. None of these makes N a whole
  number (11N/6, 7N/4 and 17N/10 would have to equal 100). N = 60 works: 60 + 30 + 10 = 100.
- Challenge: If N < 1348, the bracket is more than 2026/1348 > 1.5, so a = 1 as in Step 4.
  - If b = 3, then c is 4 or 5, and N = 2026 × 12/19 or 2026 × 15/23, neither a whole number.
  - If b = 2, then (3c + 2)N = 4052c. Since 3c + 2 and c share at most a factor 2, 3c + 2 divides 8104 = 8 × 1013.
    With c > 2, this leaves c = 337 (N = 1348) or c = 1350 (N = 1350).
  - So the smallest is N = 1348: 1348 + 674 + 4 = 2026.
  - Computer check: every N up to 1348.

**Explore** — *Status: not searched in the literature yet.*
Make a table of the smallest N for T = 10, 11, ..., 60. How often is it 3T/5, as for T = 100 (60 + 30 + 10, the
divisors N, N/2, N/6)? What happens when T is a prime?

**Research field:** elementary number theory; Egyptian fractions (sums of unit fractions).

---

### Ladder J — Root or Add Three

**Idea card:** SL2017-N1 (look at remainders when dividing by 3: numbers that leave remainder 2 are never perfect
squares, so once there the sequence grows forever; multiples of 3 keep coming down and end in a cycle).

**Setup:** Start with a whole number. At each step: if the number is a perfect square, replace it by its square
root; otherwise add 3. Write down every number you get.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | Start at 7. The first number written is 7. What is the 6th number written? | **2** |
| 2 | Kangaroo / MATHCOUNTS | Start at 5. How many of the first 100 numbers written are perfect squares? | **0** |
| 3 | MATHCOUNTS | When a perfect square is divided by 3, how many different remainders are possible? | **2** |
| 4 | AMC 8 | Start at 2026. What is the smallest number that is ever written? | **2** |
| 5 | AMC 10 | Start at 30. After a while, the same few numbers repeat forever. What is the sum of those repeating numbers? | **18** |
| **Challenge** | AIME | For how many starting numbers from 1 to 1000 is some number written twice? | **334** |

**Short solutions**
- Step 1: 7, 10, 13, 16, 4, 2.
- Step 2: 5, 8, 11, ... all leave remainder 2 when divided by 3, and (Step 3) no square does. None.
- Step 3: squares of 3k, 3k + 1, 3k + 2 leave remainders 0, 1, 1. Two remainders: 0 and 1.
- Step 4: 2026, 2029, ..., 2116 = 46², then 46, 49, 7, 10, 13, 16, 4, 2, 5, 8, ... After 2 every number leaves
  remainder 2, so the numbers only grow. The smallest is 2.
- Step 5: 30, 33, 36, 6, 9, 3, 6, 9, 3, ... The cycle is 3, 6, 9: sum 18.
- Challenge (the key idea: sort the starting numbers by remainder):
  - Remainder 2: never a square, so the numbers grow forever and nothing repeats.
  - Remainder 0: every number stays a multiple of 3 (a square that is a multiple of 3 has a root that is a
    multiple of 3). Above 9, adding 3 soon reaches a square (3t)² whose root 3t is much smaller, so the numbers
    come down until they are at most 9, and then 3, 6, 9 repeats. All 333 multiples of 3 repeat.
  - Remainder 1: adding 3 keeps remainder 1 until a square is reached; its root is smaller and is not a multiple
    of 3. If the root leaves remainder 2, the sequence grows forever. If it leaves remainder 1, the same thing
    happens again with a smaller number. So the numbers keep coming down until a root with remainder 2 appears
    (for small numbers: 4 → 2, 25 → 5, 64 → 8). The only exception is the start 1, because √1 = 1 repeats at once.
  - Total: 333 + 1 = 334. Computer check: all 1000 starts, followed until a repeat or until a number with
    remainder 2 appears (from then on nothing can repeat).

**Explore** — *Status: not searched in the literature yet.*
Replace "add 3" by "add 5" or "add 7". Which starting numbers now lead to a repeat? (Look at the remainders a
square can leave when divided by 5 or 7.)

**Research field:** discrete dynamical systems; modular arithmetic.

---

### Ladder K — Divisor Counts That Double

**Idea card:** SL2011-N1 (a number has a power-of-2 count of divisors exactly when it is a product of different
"blocks" p, p², p⁴, p⁸, ...; each block doubles the count, so the smallest such number uses the smallest blocks).

**Setup:** For a whole number n, d(n) is the number of its divisors. A **block** is a number of the form p, p², p⁴,
p⁸, ... where p is a prime (the exponent is a power of 2).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | How many divisors does 24 have? | **8** |
| 2 | Kangaroo / MATHCOUNTS | What is the smallest number with exactly 4 divisors? | **6** |
| 3 | MATHCOUNTS | What is the smallest number with exactly 8 divisors? | **24** |
| 4 | AMC 8 | How many blocks are smaller than 30? | **14** |
| 5 | AMC 10 | What is the smallest number with exactly 64 divisors? | **7560** |
| **Challenge** | AIME | Let N be the smallest number with exactly 1024 divisors. How many different primes divide N? | **7** |

**Short solutions**
- Step 1: 24 = 2³ × 3 has (3 + 1)(1 + 1) = 8 divisors.
- Step 2: 1, 2, 3, 4, 5 have 1, 2, 2, 3, 2 divisors; 6 has 1, 2, 3, 6.
- Step 3: 24 = 2 × 3 × 4, and no smaller number has 8 divisors.
- Step 4: the primes 2, 3, 5, 7, 11, 13, 17, 19, 23, 29 (10), the squares 4, 9, 25 (3) and 16 = 2⁴ (1): 14.
- Step 5 (the key idea): d(n) is a product of (exponent + 1). It is a power of 2 exactly when every exponent + 1 is
  a power of 2, that is, every exponent is 1, 3, 7, 15, ... Such a prime power splits into different blocks
  (2⁷ = 2 × 2² × 2⁴), and each block doubles d(n). So a number with 2ᵏ divisors is a product of k different
  blocks, and the smallest one takes the k smallest blocks. For 64 = 2⁶: 2 × 3 × 4 × 5 × 7 × 9 = 7560.
- Challenge: 1024 = 2¹⁰, so N is the product of the 10 smallest blocks: 2, 3, 4, 5, 7, 9, 11, 13, 16, 17.
  N = 2⁷ × 3³ × 5 × 7 × 11 × 13 × 17 uses 7 different primes. Computer check: a separate search over all exponent
  patterns gives the same N = 294 053 760.

**Explore** — *Status: known (smallest numbers with a given number of divisors are listed in the OEIS).*
What is the smallest number with exactly 12 divisors? With 2¹⁰ × 3 divisors? Is the "blocks" idea still enough
when the count is not a power of 2?

**Research field:** multiplicative number theory (the divisor function).

---

### Ladder L — The Shrinking Product

**Idea card:** SL2010-N1 (sort the numbers: the i-th smallest is at least i + 1, so the product is at least
(1/2)(2/3)...(n/(n + 1)) = 1/(n + 1); then build an example with one carefully chosen gap).

**Setup:** Choose different whole numbers s, each at least 2, and multiply the fractions (1 − 1/s) together.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | What is (1 − 1/2)(1 − 1/3)(1 − 1/4)(1 − 1/5)? | **1/5** |
| 2 | Kangaroo / MATHCOUNTS | What is the product of (1 − 1/s) for s = 2, 3, 4, ..., 100? | **1/100** |
| 3 | MATHCOUNTS | What is the smallest number of different whole numbers (each at least 2) whose product of (1 − 1/s) is exactly 1/10? | **9** |
| 4 | AMC 8 | Ana uses the numbers 2, 3, ..., 34 except 26, and one more number m bigger than 34. Her product is exactly 3/100. What is m? | **52** |
| 5 | AMC 10 | Using exactly 20 different whole numbers (each at least 2), what is the smallest possible value of the product? | **1/21** |
| **Challenge** | AIME | What is the smallest number of different whole numbers (each at least 2) whose product of (1 − 1/s) is exactly 7/200? | **28** |

**Short solutions**
- Steps 1–2: (1/2)(2/3)(3/4)(4/5) = 1/5: everything cancels except the first top and last bottom. Up to 100: 1/100.
- Step 3 (the key idea): sort the numbers s₁ < s₂ < ... < sₙ. Then sᵢ ≥ i + 1, so each factor is at least
  1 − 1/(i + 1), and the product is at least 1/(n + 1). For 1/10 we need n + 1 ≥ 10. The numbers 2, ..., 10 give
  exactly 1/10, so the answer is 9.
- Step 4: 2, ..., 34 give 1/34. Dropping 26 multiplies by 26/25, and adding m multiplies by (m − 1)/m. So
  (1/34)(26/25)(m − 1)/m = 3/100, which gives (m − 1)/m = 51/52 and m = 52.
- Step 5: by Step 3 the product is at least 1/21, and 2, ..., 21 give exactly 1/21.
- Challenge: with n numbers the product is at least 1/(n + 1). With 27 numbers it is at least 1/28, which is more
  than 7/200 (because 200 > 7 × 28 = 196), so we need at least 28. Example with 28 numbers: 2, ..., 29 without 21,
  plus 30. Product (1/29)(21/20)(29/30) = 7/200.

**Explore** — *Status: not searched in the literature yet.*
For the target 9/250 the bound from Step 3 says "at least 27". Can 27 numbers do it, or are 28 needed?

**Research field:** elementary number theory; telescoping products.

---

### Ladder M — The Average Divisor Count

**Idea card:** SL2006-N3 (⌊n/k⌋ − ⌊(n − 1)/k⌋ is 1 exactly when k divides n, so ⌊n/1⌋ + ... + ⌊n/n⌋ is
d(1) + ... + d(n); the function is really an average of divisor counts).

**Setup:** ⌊x⌋ means x rounded down to a whole number. d(n) is the number of divisors of n. Let
f(n) = (⌊n/1⌋ + ⌊n/2⌋ + ... + ⌊n/n⌋) / n.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | What is d(12), the number of divisors of 12? | **6** |
| 2 | Kangaroo / MATHCOUNTS | What is ⌊6/1⌋ + ⌊6/2⌋ + ⌊6/3⌋ + ⌊6/4⌋ + ⌊6/5⌋ + ⌊6/6⌋? | **14** |
| 3 | MATHCOUNTS | What is d(1) + d(2) + ... + d(10)? | **27** |
| 4 | AMC 8 | What is f(10)? | **27/10** |
| 5 | AMC 10 | What is the smallest n with f(n) > 3? | **16** |
| **Challenge** | AIME | For how many n from 1 to 100 is f(n + 1) < f(n)? | **43** |

**Short solutions**
- Step 1: 1, 2, 3, 4, 6, 12.
- Step 2: 6 + 3 + 2 + 1 + 1 + 1 = 14. (Also d(1) + ... + d(6) = 1 + 2 + 2 + 3 + 2 + 4 = 14.)
- Step 3: 1 + 2 + 2 + 3 + 2 + 4 + 2 + 4 + 3 + 4 = 27.
- Step 4 (the key idea): ⌊n/k⌋ counts the multiples of k up to n. Adding over k counts every pair (k, m) with
  k dividing m ≤ n, which is d(1) + ... + d(n). So f(n) is the **average** of d(1), ..., d(n), and f(10) = 27/10.
- Step 5: d(11), ..., d(16) are 2, 6, 2, 4, 4, 5, so the sums are 45 at n = 15 (f = 3 exactly) and 50 at n = 16
  (f = 3.125).
- Challenge: adding a new value to an average lowers it exactly when the new value is below the average, so
  f(n + 1) < f(n) exactly when d(n + 1) < f(n). The average is at most about 4.8 for n ≤ 100. So the
  drops come from n + 1 a prime from 7 to 101 (d = 2; at 2, 3 and 5 the average is still too small: 23 cases), a
  prime squared once the average is above 3 (d = 3: 25 and 49), and d = 4 (numbers p³ or p × q once the average is
  above 4: 18 cases). Total 23 + 2 + 18 = 43.
  Computer check: f computed exactly for every n ≤ 100.

**Explore** — *Status: the growth of the average is known (Dirichlet's divisor problem, see below).*
Up to 1000 the computer finds 518 drops and only one n with f(n + 1) = f(n). Which n is it? Do drops and rises
come out about even forever?

**Research field:** analytic number theory: the average of d(n) is about ln n + 0.15, and how precise that estimate
can be is Dirichlet's divisor problem, still open.

---

### Ladder N — Values That Share a Factor

**Idea card:** SL2016-N3 (for P(n) = n² + n + 1, neighbouring values never share a factor, values two apart can only
share 7, values three apart can only share 3; a block where every value has a partner needs several congruences
at once, solved by the Chinese remainder theorem).

**Setup:** P(n) = n² + n + 1, so P(1) = 3, P(2) = 7, P(3) = 13, P(4) = 21, ... A block P(a + 1), P(a + 2), ...,
P(a + 6) of six consecutive values is **friendly** if every value in it shares a common factor bigger than 1
with at least one other value in the block.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | Among P(1), ..., P(6) = 3, 7, 13, 21, 31, 43, how many pairs share a common factor bigger than 1? | **2** |
| 2 | Kangaroo / MATHCOUNTS | What is the greatest common divisor of P(10) and P(11)? | **1** |
| 3 | MATHCOUNTS | What is the smallest n ≥ 1 for which P(n) and P(n + 2) share a factor bigger than 1? | **2** |
| 4 | AMC 8 | P(n) and P(n + 2) share a factor bigger than 1 only when n leaves the same remainder r on division by 7. What is r? | **2** |
| 5 | AMC 10 | For how many n from 1 to 30 do P(n) and P(n + 3) share a factor bigger than 1? | **10** |
| **Challenge** | AIME | What is the smallest a ≥ 0 for which the block P(a + 1), ..., P(a + 6) is friendly? | **195** |

**Short solutions**
- Step 1: 21 = 3 × 7 shares 3 with 3 and 7 with 7. Two pairs.
- Step 2: P(10) = 111 = 3 × 37 and P(11) = 133 = 7 × 19: gcd 1. In general a common factor of P(n) and P(n + 1)
  divides their difference 2(n + 1); it is odd, so it divides n + 1 and then P(n) − n(n + 1) = 1.
- Step 3: P(2) = 7 and P(4) = 21.
- Step 4: a common factor d of P(n) and P(n + 2) divides the difference 4n + 6, so 2n ≡ −3 (mod d), and
  4P(n) = (2n + 1)² + 3 ≡ 4 + 3 = 7. So d = 7, which needs n ≡ 2 (mod 7).
- Step 5: the same trick for P(n + 3) − P(n) = 6(n + 2) gives d = 3, which divides P(n) exactly when n ≡ 1 (mod 3):
  10 values.
- Challenge: values 1 apart never share; 2 apart share only 7; 3 apart only 3; 4 apart only 19 (same trick); 5
  apart only 7. Each of the six values needs a partner, and these rules allow very few patterns. The smallest
  block is a = 195: P(196) and P(199) share 3, P(198) and P(200) share 7, P(197) and P(201) share 19.
  Computer check: every a < 195 fails. No block of 2 to 5 values is friendly for any a below 100 000.

**Explore** — *Status: not searched in the literature yet.*
Try Q(n) = n² + 1 instead. Which pairs of values can share a factor? Is there a friendly block of six?

**Research field:** elementary number theory (the Chinese remainder theorem; prime factors of quadratic
polynomials).

---
### Ladder O — Pick With Small Gaps

**Idea card:** SL2022-C1 (take the more common sign; walk along taking every number of that sign and, in each run of
the other sign, skipping every other number; at most half of the other sign is ever taken).

**Setup:** Ana writes a row of numbers, each +1 or −1. Ben then picks some of them, keeping their order. Between two
numbers Ben picks, he may skip **at most one** number. He may start and stop anywhere. Ben's **score** is the
size of the sum of his picks, ignoring the sign (a sum of −3 scores 3).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | The row is +1, −1, −1, +1, +1, −1. What is Ben's best score? | **2** |
| 2 | Kangaroo / MATHCOUNTS | The row is +1, −1, −1, +1, +1, −1, −1, +1, +1, −1. What is Ben's best score? | **3** |
| 3 | MATHCOUNTS | Ana writes 6 numbers and wants Ben's best score to be as small as possible. What is the largest score Ben can be sure to reach, whatever Ana writes? | **2** |
| 4 | AMC 8 | The same with 10 numbers. | **3** |
| 5 | AMC 10 | The same with 14 numbers. | **4** |
| **Challenge** | AIME | The same with 2026 numbers. | **507** |

**Short solutions**
- Step 1: the +1s are in places 1, 4, 5. Using all three means also picking place 2 or 3 (−1): total 2. The −1s
  (places 2, 3, 6) need place 4 or 5 in between: total −2. Picking 4 and 5 alone also gives 2. Best: 2.
- Step 2: pick places 2, 3, 4, 6, 7: −1 − 1 + 1 − 1 − 1 = −3. Computer check: nothing scores 4.
- Steps 3–5: computer check of every row (64, 1024 and 16 384 rows).
- Challenge (the key idea): say +1 appears P ≥ 1013 times. Ben picks every +1. Between two +1s there is a run of
  −1s; skipping every other one, he picks about half of each run (none at the two ends of the row). So he picks
  at most half of the 2026 − P minus ones, and his sum is at least P − (2026 − P)/2 = (3P − 2026)/2 ≥ 506.5, so
  at least 507. Ana's row +1, −1, −1, +1, +1, −1, −1, +1, +1, ... allows only 507 (computer check). The general
  answer is ⌊(n + 1)/4⌋ + 1, checked for every row of up to 18 numbers.

**Explore** — *Status: not searched in the literature yet.*
Allow Ben to skip at most **two** numbers in a row. What can he always reach with 12 numbers? With 2026?

**Research field:** combinatorics on words; discrepancy theory.

---

### Ladder P — Rainbow Necklaces

**Idea card:** SL2021-C2 (each colour must appear in every window of n + 1 marbles; counting how often each
colour appears gives the impossible lengths, and two kinds of blocks build all the others).

**Setup:** m marbles sit in a circle, each painted one of n colours. The circle is a **rainbow necklace** if any
n + 1 marbles in a row (going around the circle) include all n colours.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | With 3 colours, for how many of the numbers m = 3, 4, 5, ..., 10 is there a rainbow necklace of m marbles? | **7** |
| 2 | Kangaroo / MATHCOUNTS | With 3 colours, which number of marbles m ≥ 3 is impossible? | **5** |
| 3 | MATHCOUNTS | With 4 colours, what is the largest number of marbles that is impossible? | **11** |
| 4 | AMC 8 | With 4 colours, every colour must appear among any 5 marbles in a row. In a necklace of 11 marbles, at least how many times must each colour appear? | **3** |
| **Challenge** | AIME | With 6 colours, for how many numbers m ≥ 6 is a rainbow necklace of m marbles impossible? | **10** |

**Short solutions**
- Steps 1–2: computer search. Only 5 fails; for example 6 marbles: 1 2 3 1 2 3.
- Step 3: computer search: 6, 7 and 11 fail; 11 is the largest.
- Step 4 (the key idea): going around the circle, the gaps between two marbles of the same colour hold at most 4
  other marbles, so each colour appears at least ⌈11/5⌉ = 3 times. That needs 4 × 3 = 12 marbles, more than 11.
  So 11 is impossible.
- Challenge: the same count shows m is impossible whenever 6 × ⌈m/7⌉ > m. In every other case m can be written as
  6a + 7b, and gluing a blocks "1 2 3 4 5 6" and b blocks "1 1 2 3 4 5 6" gives a rainbow necklace. The numbers
  m ≥ 6 that are not 6a + 7b are 8, 9, 10, 11, 15, 16, 17, 22, 23, 29: ten numbers (29 = 6 × 7 − 6 − 7 is the
  largest, as in the coin problem). Computer check: for 3, 4, 5 colours the counting rule matches a full search,
  and every glued necklace up to 200 marbles is checked.

**Explore** — *Status: not searched in the literature yet.*
Change the rule to "any n + 2 marbles in a row include all n colours". Which numbers of marbles become impossible?

**Research field:** combinatorics on words (necklaces); the Frobenius coin problem.

---

### Ladder Q — Flip the k-th Coin

**Idea card:** SL2019-C3 (a row ending in T behaves like the shorter row; a row ending in H is a flipped, reversed
shorter row plus n extra steps; this recursion gives the average).

**Setup:** A row of coins shows heads (H) or tails (T). While at least one coin shows H: if k coins show H, flip the
k-th coin from the left. Count the steps until every coin shows T.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | How many steps does the row H T H take? | **4** |
| 2 | Kangaroo / MATHCOUNTS | How many steps does the row H H H take? | **3** |
| 3 | MATHCOUNTS | Add up the steps for all four rows of 2 coins (HH, HT, TH, TT). | **6** |
| 4 | AMC 8 | Add up the steps for all eight rows of 3 coins. | **24** |
| 5 | AMC 10 | What is the average number of steps over all 16 rows of 4 coins? | **5** |
| **Challenge** | AIME | What is the average number of steps over all 4096 rows of 12 coins? | **39** |

**Short solutions**
- Step 1: H T H (2 heads, flip coin 2) → H H H → H H T → H T T → T T T: 4 steps.
- Step 2: H H H → H H T → H T T → T T T: 3 steps.
- Steps 3–4: HH 2, HT 1, TH 3, TT 0: total 6. For 3 coins the eight rows take 0, 1, 2, 3, 3, 4, 5, 6 steps: total 24.
- Step 5 (the key idea): if the last coin is T it is never flipped (k is at most the number of other coins), so the
  row takes as long as the shorter row. If the last coin is H, the row takes n steps more than the shorter row
  with every coin flipped and read backwards. So the total for n coins is 2 × (total for n − 1) + n × 2ⁿ⁻¹, and
  the average grows by n/2 each time: 1/2, 3/2, 3, 5, ... For 4 coins: 5.
- Challenge: the average is 1/2 + 2/2 + ... + n/2 = n(n + 1)/4. For 12 coins: 39. Computer check: all 4096 rows,
  and both rules above for every row of up to 10 coins.

**Explore** — *Status: not searched in the literature yet.*
Which row of n coins takes the most steps? How many steps does it take?

**Research field:** combinatorics of processes; recursive structures (the process is closely related to Gray
codes).

---

### Ladder R — Rooks and Empty Squares

**Idea card:** SL2014-C3 (if n > ℓ², look at ℓ rows next to each other that include the rook in the first column:
cutting the board into ℓ squares of side ℓ leaves one without a rook; for n ≤ ℓ² a spread-out board avoids empty
ℓ × ℓ squares).

**Setup:** An n × n board has n rooks, exactly one in each row and each column. An **empty square** is a k × k
block of neighbouring cells with no rook in it.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | On a 4 × 4 board the rooks in rows 1, 2, 3, 4 stand in columns 2, 4, 1, 3. What is the side of the largest empty square? | **2** |
| 2 | Kangaroo / MATHCOUNTS | What is the largest k such that every 4 × 4 board has an empty k × k square? | **1** |
| 3 | MATHCOUNTS | The same for a 5 × 5 board. | **2** |
| 4 | AMC 8 | The same for a 10 × 10 board. | **3** |
| 5 | AMC 10 | What is the smallest n such that every n × n board has an empty 3 × 3 square? | **10** |
| **Challenge** | AIME | What is the largest k such that every 26 × 26 board has an empty k × k square? | **5** |

**Short solutions**
- Step 1: rows 2–3 hold rooks in columns 4 and 1, so the block rows 2–3, columns 2–3 is empty. A 3 × 3 block
  covers 3 rows, whose 3 rooks sit in only 4 columns, and the computer confirms none of the four 3 × 3 blocks is
  empty. So 2.
- Step 2: the board with rooks in columns 1, 3, 2, 4 has no empty 2 × 2 square.
- Steps 3–5: computer search over every board (with pruning). The answers follow ⌊√(n − 1)⌋.
- Challenge (the key idea): take ℓ = 5, so n = 26 > 25. Take 5 neighbouring rows that include the row whose rook
  is in column 1. They hold 5 rooks. Drop the first column (and its rook): the remaining 25 columns of these rows
  form 5 squares of side 5 holding at most 4 rooks, so one is empty. For k = 6, the board with rooks in columns
  1, 7, 12, 17, 22, 2, 8, 13, 18, 23, 3, 9, 14, 19, 24, 4, 10, 15, 20, 25, 5, 11, 16, 21, 26, 6 has no empty 6 × 6
  square. So the answer is 5. Computer check: a full search shows every 26 × 26 board has an empty 5 × 5, and the
  board above is checked.

**Explore** — *Status: not searched in the literature yet.*
How many 5 × 5 boards have no empty 2 × 2 square? How many 10 × 10 boards have no empty 4 × 4 square?

**Research field:** extremal combinatorics (permutation patterns; "empty boxes" in point sets).

---

### Ladder S — Pairs With Different Sums

**Idea card:** SL2012-C2 (the 2x chosen numbers add up to at least 1 + 2 + ... + 2x, while x different sums of at
most n add up to at most n + (n − 1) + ... ; comparing gives x ≤ (2n − 1)/5, and a two-part pattern reaches it).

**Setup:** From the numbers 1, 2, ..., n, choose some pairs. No number may be in two pairs, all pair sums must be
different, and every pair sum must be at most n.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | With n = 8, what is the largest number of pairs? | **3** |
| 2 | Kangaroo / MATHCOUNTS | With n = 13, what is the largest number of pairs? | **5** |
| 3 | MATHCOUNTS | What is the smallest possible total of 10 different positive whole numbers? | **55** |
| 4 | AMC 8 | What is the largest possible total of 5 different whole numbers, each at most 20? | **90** |
| 5 | AMC 10 | Steps 3 and 4 give an inequality for x pairs. For n = 100, what is the largest x it allows? | **39** |
| **Challenge** | AIME | With n = 2025, what is the largest number of pairs? | **809** |

**Short solutions**
- Step 1: (1, 5), (2, 6), (3, 4) with sums 6, 8, 7. Computer check: 4 pairs are impossible.
- Step 2: (1, 8), (2, 9), (3, 10), (4, 6), (5, 7) with sums 9, 11, 13, 10, 12.
- Steps 3–4: 1 + ... + 10 = 55 and 20 + 19 + 18 + 17 + 16 = 90.
- Step 5 (the key idea): x pairs use 2x different numbers, total at least x(2x + 1). Their x different sums are at
  most n, total at most n + (n − 1) + ... + (n − x + 1) = x(2n − x + 1)/2. So 2(2x + 1) ≤ 2n − x + 1, i.e.
  x ≤ (2n − 1)/5. For n = 100: x ≤ 39.8, so 39.
- Challenge: the bound gives x ≤ 4049/5, so at most 809. With k = 404 (809 = 2k + 1), the pairs (k − i, 2k + 3 + 2i)
  for i = 0..k − 1 and (2k + 1 − i, 2k + 2 + 2i) for i = 0..k use the numbers 1 to 1618 and have the sums 1215 to
  2023, all different and at most 2025. Computer check: the 809 pairs, and a full search for every n up to 15.

**Explore** — *Status: not searched in the literature yet.*
Ask for triples instead of pairs: different triple sums, each at most n. Find the best number for n = 20 by hand
or by computer, and guess a rule.

**Research field:** additive combinatorics (Skolem sequences and Langford pairings).

---

### Ladder T — Triples Without Repeats

**Idea card:** SL2009-C2 (with N triples, the first entries are N different numbers, so they add up to at least
0 + 1 + ... + (N − 1); the same for the other two positions; adding gives 3N(N − 1)/2 ≤ Nn).

**Setup:** A triple (a, b, c) of whole numbers 0, 1, 2, ... with a + b + c = n. A set of such triples is **clean**
if no two triples have the same first number, no two have the same second number, and no two have the same third
number.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | With n = 2, what is the largest clean set? | **2** |
| 2 | Kangaroo / MATHCOUNTS | With n = 3, what is the largest clean set? | **3** |
| 3 | MATHCOUNTS | What is the smallest possible total of 7 different whole numbers (0 allowed)? | **21** |
| 4 | AMC 8 | With n = 9, what is the largest clean set? | **7** |
| 5 | AMC 10 | Step 3 gives an inequality for a clean set of N triples. For n = 30, what is the largest N it allows? | **21** |
| **Challenge** | AIME | With n = 2026, what is the largest clean set? | **1351** |

**Short solutions**
- Step 1: (0, 0, 2) and (1, 1, 0). Computer check: no three triples work.
- Step 2: (0, 1, 2), (1, 2, 0), (2, 0, 1).
- Step 3: 0 + 1 + ... + 6 = 21.
- Step 4: computer search: 7, for example (0, 3, 6), (1, 4, 4), (2, 5, 2), (3, 6, 0), (4, 0, 5), (5, 1, 3), (6, 2, 1).
- Step 5 (the key idea): add up all 3N numbers of a clean set of N triples. It is Nn, because each triple adds to
  n. It is also at least 3 × (0 + 1 + ... + (N − 1)) = 3N(N − 1)/2. So N ≤ 2n/3 + 1. For n = 30: N ≤ 21.
- Challenge: N ≤ 2 × 2026/3 + 1 = 1351.67, so at most 1351. Example (2026 = 3 × 675 + 1, m = 675): the triples
  (i, m − 1 + i, ...) for i = 0..m + 1 and (m + 2 + j, j, ...) for j = 0..m − 2, the third entry making the sum
  2026: 1351 triples, all first, second and third entries different. Computer check: the 1351 triples, and a full
  search for n up to 12.

**Explore** — *Status: not searched in the literature yet.*
Use quadruples (a, b, c, d) with a + b + c + d = n. What bound does the same trick give? Is it reached for n = 10?

**Research field:** combinatorial designs (Latin squares and transversals).

---

### Ladder U — Doubling Prefix Sums

**Idea card:** SL2008-C2 (the rule for k = n − 1 forces the last number to be 1, (n + 1)/2 or n, and k = n − 2 rules out
the middle one; each choice leaves a smaller good order, so the count doubles).

**Setup:** Write the numbers 1, 2, ..., n in some order. The order is **good** if for every k = 1, 2, ..., n, the
number k divides 2 × (the sum of the first k numbers).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | How many orders of 1, 2, 3 are good? | **6** |
| 2 | Kangaroo / MATHCOUNTS | How many orders of 1, 2, 3, 4 are good? | **12** |
| 3 | MATHCOUNTS | For n = 5, which numbers can be last in a good order? Give their sum. | **6** |
| 4 | AMC 8 | How many orders of 1, 2, ..., 6 are good? | **48** |
| **Challenge** | AIME | Let G be the number of good orders of 1, 2, ..., 2026. What are the last three digits of G? | **648** |

**Short solutions**
- Step 1: k = 1, 2 always work (2 × sum is even); k = 3: 2 × 6 = 12. All 6.
- Step 2: computer list: 12 orders; every one ends in 1 or 4.
- Step 3 (the key idea): for k = n − 1, 2 × (sum of all but the last) = n(n + 1) − 2 × last must be divisible by
  n − 1. Since n(n + 1) = (n − 1)(n + 2) + 2, this means n − 1 divides 2 × last − 2, so the last number is 1,
  (n + 1)/2 or n. For n = 5, the middle choice 3 fails the k = 3 test, leaving 1 and 5: sum 6.
- Step 4: last = n leaves a good order of 1..n − 1; last = 1 leaves a good order of 2..n, which is a good order of
  1..n − 1 shifted up by one. So the count doubles each time from n = 3 on: 6, 12, 24, 48.
- Challenge: G = 6 × 2²⁰²³ = 3 × 2²⁰²⁴. Its last three digits are 648. Computer check: the count 3 × 2ⁿ⁻² for every
  n from 3 to 13, and 3 × 2²⁰²⁴ mod 1000.

**Explore** — *Status: not searched in the literature yet.*
Change "2 × sum" to "sum". The computer finds good orders only for n = 1 and n = 3. Why? What about "3 × sum"?

**Research field:** enumerative combinatorics (permutations with divisibility conditions).

---
### Ladder V — Same-Colour Triples

**Idea card:** SL2007-C3 (count the mixed triples through their red-then-blue pairs: each mixed triple has exactly
one, and each pair lies in exactly 3 triples; so the same-colour count depends only on how many numbers are red).

**Setup:** Colour each of the numbers 1, 2, ..., n red or blue. Count the ordered triples (x, y, z) of these numbers
(repeats allowed) such that x, y, z all have the same colour and x + y + z is divisible by n.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | n = 3 and all three numbers are red. How many triples are counted? | **9** |
| 2 | Kangaroo / MATHCOUNTS | n = 4, with 1 and 2 red and 3 and 4 blue. How many triples are counted? | **4** |
| 3 | MATHCOUNTS | Forget the colours: for n = 10, how many ordered triples (x, y, z) from 1 to 10 have x + y + z divisible by 10? | **100** |
| 4 | AMC 8 | n = 7, with 1, 2, 3 red and 4, 5, 6, 7 blue. How many triples are counted? | **13** |
| 5 | AMC 10 | n = 10. What is the smallest possible number of counted triples, over all colourings? | **25** |
| **Challenge** | AIME | Exactly 2028 triples are counted. Find the sum of all n for which this is possible. | **216** |

**Short solutions**
- Step 1: choose x and y freely (9 ways); then z is forced.
- Step 2: red triples from {1, 2} have sums 3 to 6, so the sum must be 4: (1, 1, 2) in 3 orders. Blue triples from
  {3, 4} have sums 9 to 12, so the sum must be 12: (4, 4, 4). Total 4.
- Step 3: z is forced by x and y: 10 × 10 = 100.
- Step 4 (the key idea): of the n² divisible triples, a mixed one (two of one colour, one of the other) contains
  exactly one "red then blue" pair among (x, y), (y, z), (z, x). Each red-then-blue pair (x, y) lies in exactly 3
  divisible triples: (x, y, ·), (·, x, y), (y, ·, x). So there are 3rb mixed triples and n² − 3rb = r² − rb + b²
  same-colour ones (r red, b blue). For r = 3, b = 4: 9 − 12 + 16 = 13.
- Step 5: r² − r(10 − r) + (10 − r)² is smallest at r = 5: 25.
- Challenge: solve r² − rb + b² = 2028, i.e. (2r − b)² + 3b² = 8112. The solutions are {2, 46}, {26, 52}, {44, 46},
  so n = 48, 78 or 90. Sum 216. Computer check: the formula against every colouring for n ≤ 7, and every n < 3000.

**Explore** — *Status: not searched in the literature yet.*
Use three colours. Does the number of same-colour triples still depend only on how many numbers have each colour?

**Research field:** additive combinatorics (Schur-type counting problems).

---

### Ladder W — Lattice Friends

**Idea card:** SL2008-C3 (a point (u, v) is a k-friend of the origin exactly when gcd(u, v) divides 2k; if some m does
not divide 2k, two points with the same remainders mod m are not friends, so a team has at most m² points).

**Setup:** A lattice point has whole-number coordinates. Two lattice points A and B are **k-friends** if some lattice
point C makes triangle ABC have area exactly k (k is a positive whole number). A **k-team** is a set of lattice points in which every two are
k-friends.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | What is the area of the triangle with corners (0, 0), (4, 0), (0, 3)? | **6** |
| 2 | Kangaroo / MATHCOUNTS | What is the smallest whole number k ≥ 1 for which (0, 0) and (6, 9) are k-friends? | **3** |
| 3 | MATHCOUNTS | How many points (u, v) with 1 ≤ u ≤ 12 and 1 ≤ v ≤ 12 are 6-friends of (0, 0)? | **136** |
| 4 | AMC 8 | What is the smallest k for which the 16 points (x, y) with 0 ≤ x ≤ 3 and 0 ≤ y ≤ 3 form a k-team? | **3** |
| **Challenge** | AIME | What is the smallest k for which some k-team has more than 100 points? | **1260** |

**Short solutions**
- Step 1: 4 × 3 / 2 = 6.
- Step 2 (the key idea): the triangle (0, 0), (u, v), (x, y) has area |uy − vx|/2, and uy − vx can be exactly the
  multiples of gcd(u, v). So (0, 0) and (u, v) are k-friends exactly when gcd(u, v) divides 2k. Here gcd(6, 9) = 3
  must divide 2k: k = 3.
- Step 3: count the (u, v) with gcd(u, v) dividing 12: 136 (computer count; only the pairs with gcd 5, 7, 8, 9, 10,
  11 fail).
- Step 4: the differences between the points are at most 3, so their gcd is 1, 2 or 3; 2k must be divisible by 2
  and 3, so k = 3.
- Challenge: if some m ≤ 10 does not divide 2k, two points of a team cannot have the same remainders mod m in both
  coordinates (their difference would have gcd divisible by m), so a team has at most m² ≤ 100 points. So 2k must
  be divisible by 1, 2, ..., 10, that is by 2520: k ≥ 1260. For k = 1260 the 121 points (x, y) with
  0 ≤ x, y ≤ 10 form a team (every gcd is at most 10). Computer check: the gcd rule against a direct search, the
  121-point team, and every k below 1260.

**Explore** — *Status: not searched in the literature yet.*
What is the largest 1-team? (Hint: think about remainders mod 3 and mod 4.)

**Research field:** geometry of numbers (lattice points, Pick's theorem).

---

### Ladder X — Floors of Quotients

**Idea card:** SL2021-A3 (cut 1..n into blocks from 2ʲ to 2ʲ⁺¹ − 1; inside each block put the largest number first,
which costs exactly 1 per block, and an induction shows no order does better).

**Setup:** Write 1, 2, ..., n in some order a₁, a₂, ..., aₙ. The **score** is ⌊a₁/1⌋ + ⌊a₂/2⌋ + ... + ⌊aₙ/n⌋, where
⌊x⌋ means x rounded down.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | What is the score of the order 1, 2, 3? | **3** |
| 2 | Kangaroo / MATHCOUNTS | For n = 3, what is the smallest possible score? | **2** |
| 3 | MATHCOUNTS | For n = 4, what is the smallest possible score? | **3** |
| 4 | AMC 8 | For n = 8, what is the smallest possible score? | **4** |
| 5 | AMC 10 | For n = 7, what is the score of the order 1, 3, 2, 7, 4, 5, 6? | **3** |
| **Challenge** | AIME | For n = 2026, what is the smallest possible score? | **11** |

**Short solutions**
- Step 1: 1 + 1 + 1 = 3.
- Step 2: 1, 3, 2 scores 1 + 1 + 0 = 2. Every order scores at least 2: if 3 is in place 1 it alone scores 3;
  otherwise the number in place 1 scores at least 1 and 3 (in place 2 or 3) scores 1 more.
- Steps 3–4: computer search over all orders.
- Step 5 (the key idea): blocks {1}, {2, 3}, {4, 5, 6, 7}. In each block the largest number goes first and scores 1
  (it is less than twice its place); every other number i − 1 sits in place i and scores 0. One point per block: 3.
- Challenge: the blocks 1, 2–3, 4–7, ..., 1024–2026 are 11 blocks, so the score 11 is possible. The idea card's
  induction shows that 2ᵏ different positive numbers in any order score at least k + 1. The first 1024 = 2¹⁰ places
  already hold 1024 different numbers, so every order scores at least 11.
  Computer check: every order for n ≤ 9 (the answers are ⌊log₂ n⌋ + 1), and the score of the 2026 example.

**Explore** — *Status: not searched in the literature yet.*
Use ⌈aᵢ/i⌉ (round up) instead. What is the smallest score for n = 2026?

**Research field:** combinatorial optimisation on permutations.

---

### Ladder Y — Sums That Divide the Total

**Idea card:** SL2011-A1 (a pair sum divides the total exactly when it divides the other pair's sum; the two pairs
with the largest number are too big, so at most 4 pairs work, and equality forces two families).

**Setup:** Take a set of four different positive whole numbers. Count the pairs from the set whose sum divides the
total of all four numbers.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | For the set {1, 2, 3, 4}, how many pairs are counted? | **2** |
| 2 | Kangaroo / MATHCOUNTS | What is the largest count any set can have? | **4** |
| 3 | MATHCOUNTS | For the set {1, 5, 7, 11}, how many pairs are counted? | **4** |
| 4 | AMC 8 | What is the smallest possible total of a set with count 4? | **24** |
| **Challenge** | AIME | How many sets with all four numbers at most 100 have count 4? | **12** |

**Short solutions**
- Step 1: total 10: 1 + 4 = 5 and 2 + 3 = 5 divide 10; 3, 4, 6, 7 do not.
- Step 2 (the key idea): with a < b < c < d, a pair sum divides the total exactly when it divides the other two
  numbers' sum. The pairs b + d and c + d are bigger than their partners a + c and a + b, so they cannot divide
  them. At most 4 pairs.
- Step 3: total 24: 6, 8, 12, 12, 16, 18; the sums 6, 8, 12, 12 divide 24.
- Step 4: count 4 forces a + d = b + c and the remaining divisibilities, which leave only the families
  {k, 5k, 7k, 11k} and {k, 11k, 19k, 29k}. The smallest total is 1 + 5 + 7 + 11 = 24.
- Challenge: 11k ≤ 100 gives k = 1..9, and 29k ≤ 100 gives k = 1..3: 9 + 3 = 12 sets. Computer check: all
  3 921 225 sets of four numbers up to 100.

**Explore** — *Status: not searched in the literature yet.*
Use sets of five numbers. What is the largest count now, and which sets reach it?

**Research field:** elementary number theory (divisibility).

---

### Ladder Z — Average of the Last Few

**Idea card:** SL2018-A4 (the new reading and the one before it both lie between the smallest and largest possible
averages; that spread shrinks by the factor (n − 1)/n each day, which bounds the jump).

**Setup:** A robot records readings r₀ = 0 and r₁ = 1. On each later day n = 2, 3, ..., it chooses a number k with
1 ≤ k ≤ n and records rₙ = the average of the last k readings rₙ₋₁, rₙ₋₂, ..., rₙ₋ₖ.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | On day 2 the robot chooses k = 2. What is r₂? | **1/2** |
| 2 | Kangaroo / MATHCOUNTS | What is the sum of all possible values of r₂? | **3/2** |
| 3 | MATHCOUNTS | What is the largest possible value of r₃ − r₂? | **1/4** |
| 4 | AMC 8 | What is the largest possible value of r₅ − r₄? | **3/16** |
| **Challenge** | AIME | The largest possible value of r₉ − r₈ is p/q in lowest terms. What is p + q? | **71** |

**Short solutions**
- Steps 1–2: k = 2 gives (1 + 0)/2 = 1/2; k = 1 gives 1. Sum 3/2.
- Step 3: k = 2 on day 2 (r₂ = 1/2) and k = 2 on day 3 (r₃ = 3/4): 1/4. Computer check: all choices.
- Step 4: keep k = 1 on days 2 and 3 (r₂ = r₃ = 1), then k = 4 twice: r₄ = 3/4 and r₅ = (3/4 + 3)/4 = 15/16.
  The jump is 3/16.
- Challenge (the key idea): the readings stay between the smallest and largest averages the robot could take, and
  that spread shrinks by (n − 1)/n each day. This gives r_N − r_(N−1) ≤ (N − 2)/(N − 1)², and the pattern of Step 4
  reaches it: k = 1 until day N − 2, then k = N − 1 twice. For N = 9: r₈ = 7/8, r₉ = 63/64, jump 7/64, and
  7 + 64 = 71. Computer check: every possible choice of k (2 × 3 × ... × 9 = 362 880 sequences).

**Explore** — *Status: not searched in the literature yet.*
What is the largest possible value of r₉ − r₇? The smallest possible value of r₉ − r₈?

**Research field:** analysis of averaging processes (Cesàro means).

---

### Ladder AA — The Inner Arc

**Idea card:** SL2006-G1 (the angle condition means ∠BPC = 90° + A/2 = ∠BIC, so P lies on the circle through B, I, C;
its centre is on line AI, and the triangle inequality gives AP ≥ AI).

**Setup:** In triangle ABC, I is the incentre (the centre of the circle touching all three sides).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | A triangle has sides AB = 13, BC = 14, CA = 15. What is its area? | **84** |
| 2 | Kangaroo / MATHCOUNTS | What is the radius of the circle inside the triangle of Step 1 that touches all three sides? | **4** |
| 3 | MATHCOUNTS | In a triangle with ∠A = 60°, what is ∠BIC in degrees? | **120** |
| 4 | AMC 8 | In the triangle of Step 1, what is AI²? | **65** |
| **Challenge** | AIME | Triangle ABC has AB = 10, BC = 21, CA = 17. A point P inside it satisfies ∠PBA + ∠PCA = ∠PBC + ∠PCB. What is the smallest possible value of 4 × AP²? | **85** |

**Short solutions**
- Step 1: Heron: s = 21, area = √(21 × 8 × 7 × 6) = 84.
- Step 2: area = r × s, so r = 84/21 = 4.
- Step 3: ∠BIC = 180° − (B + C)/2 = 90° + A/2 = 120°.
- Step 4: the incircle touches AB at distance s − BC = 7 from A, and I is r = 4 away from that point at a right
  angle: AI² = 7² + 4² = 65.
- Challenge (the key idea): the four angles add up to B + C, so the condition says ∠PBC + ∠PCB = (B + C)/2, that is
  ∠BPC = 90° + A/2 = ∠BIC. So P lies on the circle through B, I, C. Its centre M is where line AI meets the circle
  around ABC again, and AP + PM ≥ AM = AI + IM with PM = IM, so AP ≥ AI, with equality at P = I. Here s = 24,
  area 84, r = 7/2, s − BC = 3, so AI² = 9 + 49/4 = 85/4 and 4 × AP² ≥ 85. Computer check: P moved along that
  arc, 200 000 positions.

**Explore** — *Status: known (a classic lemma).*
Show that M, the centre of the circle through B, I, C, is also the centre of a circle through the excentre opposite
A. How far is that excentre from A in the triangle of Step 1?

**Research field:** Euclidean geometry (the incentre–excentre lemma).

---

### Ladder AB — Powers Plus Fourth Powers

**Idea card:** SL2023-N2 (pᵃ = y² − a⁴ = (y − a²)(y + a²), so both factors are powers of p; their difference 2a² is
small compared with the larger one, which leaves only a few cases).

**Setup:** p is a prime and a is a positive whole number. We ask when pᵃ + a⁴ is a perfect square.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | What is 3² + 2⁴? | **25** |
| 2 | Kangaroo / MATHCOUNTS | For how many a from 1 to 50 is 2ᵃ + a⁴ a perfect square? | **0** |
| 3 | MATHCOUNTS | 3⁶ + 6⁴ is a perfect square. What is its square root? | **45** |
| 4 | AMC 8 | 3⁹ + 9⁴ = y². What is y? | **162** |
| **Challenge** | AIME | Find the sum of all a for which some prime p makes pᵃ + a⁴ a perfect square. | **18** |

**Short solutions**
- Step 1: 9 + 16 = 25 = 5².
- Step 2: computer check: none. (The Challenge argument below explains why p = 2 never works.)
- Step 3: 729 + 1296 = 2025 = 45².
- Step 4 (the key idea): y² − 9⁴ = 3⁹, so (y − 81)(y + 81) = 3⁹, and both factors are powers of 3 that differ by
  162: 81 × 243. So y = 162.
- Challenge: in general y − a² = pⁱ and y + a² = pʲ with i < j and i + j = a, so pʲ − pⁱ = 2a². Since j > a/2,
  this gives p^(a/2) < 4a², which allows only p < 16 and small a. Checking those cases leaves
  (p, a) = (3, 1), (3, 2), (3, 6), (3, 9): 3 + 1 = 2², 9 + 16 = 5², 729 + 1296 = 45², 19683 + 6561 = 162².
  Sum of a: 1 + 2 + 6 + 9 = 18.
  Computer check: every prime p < 100 and a < 300, which covers all cases allowed by the bound.

**Explore** — *Status: not searched in the literature yet.*
Replace a⁴ by a² or a⁶. For which (p, a) is pᵃ + a² a perfect square?

**Research field:** exponential Diophantine equations.

---

## Assessment of v0.3 (for the reviewer)

- **Size:** 20 ladders, 92 steps + 20 Challenges = 112 problems. 7 number theory, 9 combinatorics, 3 algebra,
  1 geometry. Geometry is thin because most geometry ideas only give proofs, not numbers.
- **Checks:** every answer is recomputed by `verify_ladders_v0_3.py`. Where a Challenge is too big for brute force
  (O, R, S, T, U, W, X), the script checks an explicit example plus the counting bound, and compares the general
  formula with a full search on small cases.
- **Solutions that lean on the idea card:** the lower bounds in X (no order scores below 11) and the two families in
  Y are stated, not fully proved here; the computer checks cover them (X: all orders up to n = 9; Y: all sets up to
  100).
- **Closest to the original problem** (same question, our numbers and story): S, T, U, V, Z. They need the same key
  idea as the original, so a reviewer should judge whether the change is large enough (rule 2.4).
- **Hardest by hand:** N (needs four congruences at once) and M (a careful count up to 100). Both may be above AIME
  level; consider them for the "Explore" slot instead if they test badly.
- **Not done yet:** independent solver pass, human review, web search for each Challenge's twist, famous open
  problems, and the "after the ladder" extras (similar olympiad problems, research, proof problems).
