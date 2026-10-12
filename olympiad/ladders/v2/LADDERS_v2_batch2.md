# Solution-path ladders v2 — batch 2 (P7–P11)

- Date: 2026-10-11
- Status: **draft for review, not imported.** Built with [LADDER_RULES_v2.md](../LADDER_RULES_v2.md).
- Answer check: `python3 ladders/v2/verify_v2_batch2.py` (every answer and every number in the analysis, flow and
  solutions).
- Internal only: the `Idea card` lines name the sources. They are never shown on the site.

---

### Ladder P7 — Lanterns on a Pyramid

**Idea card:** SL2023-C3 (label every position with the most lit lanterns on a path ending there; going down one row
the sum of the labels grows by at least the row's largest label plus one, which makes the largest label reach j + 1
by row 2ʲ; a "dyadic" choice of lit lanterns shows this is best).

**Setup:** Lanterns hang in a pyramid of n rows: row 1 has 1 lantern, row 2 has 2, …, row n has n. In every row
exactly one lantern is lit. A **path** starts at the top lantern and goes down one row at a time, each time to one of
the two lanterns directly below. We want a path that passes as many lit lanterns as possible.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | In a pyramid of 4 rows, the lit lanterns are: row 1 the only one, row 2 the right one, row 3 the left one, row 4 the third from the left. What is the largest number of lit lanterns one path can pass? | **3** |
| 2 | AMC 8 | Give each lantern a label: the most lit lanterns on a path from the top ending at that lantern. A label equals the larger label of the two lanterns above it (or the one above, at the edges), plus 1 if the lantern itself is lit. In a pyramid of 5 rows with lit lanterns at positions 1, 1, 3, 2, 5 (counted from the left in rows 1 to 5), what is the largest label in row 5? | **3** |
| 3 | AMC 10 | Whatever lanterns are lit in a pyramid of 8 rows, some path passes at least how many lit lanterns? (Give the largest number that is always reachable.) | **4** |
| 4 | AMC 10 | In a pyramid of 7 rows, light in row i the lantern at position 2(i − 2ʲ) + 1 from the left, where 2ʲ is the largest power of 2 not above i (so positions 1; 1, 3; 1, 3, 5, 7 in rows 1; 2–3; 4–7). What is the largest number of lit lanterns one path can pass? | **3** |
| **Challenge** | AIME | What is the smallest number of rows n such that, whichever lanterns are lit (one per row), some path always passes at least 8 lit lanterns? | **128** |

**Problem analysis** *(members only)*
- Trying all ways to light the lanterns is hopeless (there are n! of them), so we need a quantity that is forced to
  grow.
- Labels (the best count of lit lanterns on a path ending at each lantern) are computed row by row and contain all
  the information.
- Going down one row, every label is at least the label above it, and the lit lantern adds one more. Counting the
  sum of a row's labels shows that the largest label must go up by one at least every time the row number doubles.
- So with n rows some path always passes 1 + ⌊log₂ n⌋ lit lanterns, and lighting lanterns in a "dyadic" pattern
  (rows 2ʲ to 2ʲ⁺¹ − 1 spread their lit lanterns two apart) shows that no more can be guaranteed.
- The Challenge reverses the question: 1 + ⌊log₂ n⌋ ≥ 8 first happens at n = 2⁷ = 128.

**Logic flow** *(members only)*
1. **Play with a small pyramid (Step 1).** Find the best path by hand. *Why:* it shows that the best path can
   change direction several times.
2. **Label every lantern (Step 2).** Labels are computed from the row above: the larger neighbour above, plus 1 if
   lit. *Why:* this turns a search over paths into a simple row-by-row computation.
3. **The guarantee (Step 3).** Row label sums grow by at least the row's largest label plus 1, so the largest label
   reaches j + 1 by row 2ʲ: some path always passes 1 + ⌊log₂ n⌋ lit lanterns.
4. **The matching example (Step 4).** The dyadic pattern keeps every path down to 1 + ⌊log₂ n⌋ lit lanterns. *Why:*
   it shows the guarantee cannot be improved.
5. **Reverse the question (Challenge).** 1 + ⌊log₂ n⌋ ≥ 8 means n ≥ 128; for n = 127 the dyadic pattern allows
   only 7.

**Our full solution**
Let sᵢ be the sum and mᵢ the largest of the labels in row i. Lantern p of row i + 1 sits below lanterns p − 1 and p
of row i; matching the lanterns of row i + 1 to those of row i so that only the lantern with the largest label is
used twice gives sᵢ₊₁ ≥ sᵢ + mᵢ + 1 (the lit lantern adds 1). By induction s at row 2ʲ is at least j × 2ʲ + 1: it is
1 for j = 0, and if it holds for 2ʲ, then the largest label in row 2ʲ is more than j, so at least j + 1, and so is
every later maximum, which adds at least 2ʲ × (j + 2) over the next 2ʲ rows. Since a row of 2ʲ labels with sum above
j × 2ʲ has a label above j, row 2ʲ has a label of at least j + 1: with n rows some path passes at least
1 + ⌊log₂ n⌋ lit lanterns. The dyadic pattern of Step 4 reaches exactly 1 + ⌊log₂ n⌋. For the
Challenge we need 1 + ⌊log₂ n⌋ ≥ 8, that is n ≥ 2⁷ = **128**; with 127 rows the dyadic pattern keeps every path at
7. Computer check: every lighting of pyramids with up to 8 rows, and the dyadic pattern for 7, 8, 15 and 127 rows.

**Short solutions**
- Step 1: the path through positions 1, 2, 2, 3 (rows 1 to 4) passes the lit lanterns in rows 1, 2 and 4; no path
  can pass all four, because the lit lanterns in rows 2 and 3 are not connected. Answer 3.
- Step 2: labels row by row: row 1: 1; row 2: 2, 1; row 3: 2, 2, 2; row 4: 2, 3, 2, 2; row 5: 2, 3, 3, 2, 3 → 3.
- Step 3: 1 + ⌊log₂ 8⌋ = 4, and some lighting achieves exactly 4 (computer check of all 8! lightings).
- Step 4: the dyadic pattern for 7 rows keeps every path at 3 = 1 + ⌊log₂ 7⌋.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2023 C3 (IMO 2023 Problem 5) *(Strong)*: the same triangle of circles; it asks, for a given n, for the
  number of red circles a path can always reach. Our Challenge asks for the number of rows needed.

**Similar problems on our site**
- Ladder R "Rooks and Empty Squares" (draft v0.3): another "what can always be guaranteed" question with a matching
  example.

**Explore** — *Status: not searched in the literature yet.*
Light two lanterns in every row (from row 2 on). How many lit lanterns can a path now always reach?

**Proof problem** *(not graded)*
Prove that in row 2ʲ the largest label is at least j + 1.
- Hint: compare the sum of the labels in one row with the sum in the next row.
- Solution: see "Our full solution": the row sums satisfy sᵢ₊₁ ≥ sᵢ + mᵢ + 1, which gives a row sum of at least
  j × 2ʲ + 1 in row 2ʲ, so one of its 2ʲ labels is at least j + 1.

**Research field:** extremal combinatorics (paths in triangular grids; dyadic constructions).

---

### Ladder P8 — Divisors That Leave 1

**Idea card:** SL2016-N2 (a divisor leaves remainder 1 when divided by 3 exactly when it has no factor 3, any
factors that leave 1, and an even number of factors that leave 2; this gives τ₁ as a product, and the ratio
τ(10n)/τ₁(10n) can only be 2 or a composite number).

**Setup:** τ(m) is the number of positive divisors of m, and τ₁(m) is the number of those divisors that leave
remainder 1 when divided by 3. We look at the fraction τ(10n)/τ₁(10n) for positive whole numbers n.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is τ₁(40)? | **4** |
| 2 | AMC 8 | How many divisors of 200 = 2³ × 5² leave remainder 1 when divided by 3? | **6** |
| 3 | AMC 10 | What is τ(810)/τ₁(810)? (810 = 10 × 81.) | **10** |
| 4 | AMC 10 | What is the smallest odd whole number that τ(10n)/τ₁(10n) can equal? | **9** |
| **Challenge** | AIME | How many whole numbers from 1 to 100 are equal to τ(10n)/τ₁(10n) for some positive whole number n? | **75** |

**Problem analysis** *(members only)*
- Every prime other than 3 leaves remainder 1 or 2 when divided by 3; multiplying remainders shows that a divisor
  leaves 1 exactly when it has no factor 3 and an even number of prime factors (with repeats) that leave 2.
- So if m = 3ᶜ × (primes leaving 1) × (primes leaving 2), with A the product of (exponent + 1) over the primes
  leaving 1 and B the same over the primes leaving 2, then τ(m) = (c + 1) × A × B and τ₁(m) = A × ⌈B/2⌉.
- The ratio is (c + 1) × B/⌈B/2⌉. For 10n, both 2 and 5 leave 2, so B is a product of at least two factors that are
  at least 2.
- If B is even the ratio is 2(c + 1): every even number. If B is odd the ratio is a whole number only when
  (B + 1)/2 divides c + 1, and then it is a multiple of B, an odd composite. So the possible values are 2 and the
  composite numbers.
- Up to 100: 50 even numbers and 25 odd composites, 75 in all.

**Logic flow** *(members only)*
1. **Count a small case (Step 1).** The divisors of 40 are 1, 2, 4, 5, 8, 10, 20, 40, and 1, 4, 10, 40 leave 1.
2. **Which divisors leave 1 (Step 2).** No factor 3, and an even number of factors leaving 2. *Why:* this makes τ₁ a
   product formula.
3. **The ratio formula (Step 3).** τ(m)/τ₁(m) = (c + 1) × B/⌈B/2⌉, where c is the exponent of 3 and B the product of
   (exponent + 1) over primes leaving 2. For 810 = 2 × 3⁴ × 5: (4 + 1) × 4/2 = 10.
4. **Odd values (Step 4).** An odd value needs B odd, so every prime leaving 2 (including 2 and 5) has an even
   exponent; then the value is a multiple of B, an odd composite. The smallest is 9 (B = 3 × 3, c = 4).
5. **Count (Challenge).** Values are 2 and the composites: 50 + 25 = 75 up to 100.

**Our full solution**
Write 10n = 3ᶜ × Π pᵢ^aᵢ × Π qⱼ^bⱼ with pᵢ leaving remainder 1 and qⱼ leaving 2 (2 and 5 are among the qⱼ, with
exponents at least 1). A divisor leaves 1 exactly when it uses no 3 and an even total number of q-factors, so
τ₁ = A × ⌈B/2⌉ with A = Π(aᵢ + 1), B = Π(bⱼ + 1) ≥ 4, and τ = (c + 1)AB. If B is even the ratio is 2(c + 1), which
gives every even number (n = 3ᶜ). If B is odd, every bⱼ is even, B is a product of at least two odd factors at least
3, so an odd composite, and the ratio 2B(c + 1)/(B + 1) is a whole number exactly when (B + 1)/2 divides c + 1,
giving t × B for any t ≥ 1: every odd composite, and nothing else odd. So the values are 2 and all composite
numbers; up to 100 that is 50 even numbers and 25 odd composites, **75**. Computer check: the ratio formula against
direct divisor counts, and an explicit n for every value up to 100.

**Short solutions**
- Step 1: 1, 4, 10, 40 leave remainder 1: τ₁(40) = 4.
- Step 2: divisors 2ᵃ5ᵇ with a + b even: (0,0), (0,2), (1,1), (2,0), (2,2), (3,1): 6.
- Step 3: τ(810) = 2 × 5 × 2 = 20 and τ₁(810) = 2, ratio 10 (= (4 + 1) × 4/2).
- Step 4: an odd value is a multiple of an odd composite B ≥ 9; 9 is reached with 10n = 2² × 5² × 3⁴.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2016 N2 *(Strong)*: asks for all whole-number values of the same fraction; the answer is 2 and the
  composite numbers. Our Challenge counts them up to 100.

**Similar problems on our site**
- Ladder K "Divisor Counts That Double" (draft v0.3): another problem built on the divisor-count formula.

**Explore** — *Status: not searched in the literature yet.*
Use remainders when dividing by 4 instead of 3: which values can τ(10n)/τ₁(10n) take now, where τ₁ counts divisors
leaving remainder 1 when divided by 4?

**Proof problem** *(not graded)*
Prove that τ(10n)/τ₁(10n) is never an odd prime.
- Hint: when the ratio is odd, every prime leaving remainder 2 has an even exponent.
- Solution: see "Our full solution": an odd value is a multiple of B, which is a product of at least two odd factors
  at least 3, so it is composite.

**Research field:** multiplicative number theory (divisors in residue classes).

---

### Ladder P9 — Switching Lamps

**Idea card:** SL2008-C4 (map every switching sequence to one that never touches lamps n + 1 to 2n; each restricted
sequence has exactly 2ᵏ⁻ⁿ preimages) + counting sequences in which every lamp is switched an odd number of times
with the ±1 trick (generating functions).

**Setup:** There are 2n lamps, all off. A **sequence** is a list of k switches; each switch changes one lamp (off to
on, or on to off). Let N(n, k) be the number of sequences that end with lamps 1 to n on and lamps n + 1 to 2n off.
Let M(n, k) be the number of those sequences that never touch lamps n + 1 to 2n.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | With 2 lamps (n = 1) and k = 3 switches, how many sequences end with lamp 1 on and lamp 2 off? | **4** |
| 2 | AMC 8 | With n = 2 (lamps 1 to 4) and k = 4, how many sequences end with lamps 1 and 2 on and never touch lamps 3 and 4? | **8** |
| 3 | AMC 10 | Each of the sequences in Step 2 can be changed into a sequence of the full problem by moving some switches of lamp 1 to lamp 3 and of lamp 2 to lamp 4 (an even number for each), and every full sequence arises exactly once this way: M(2, 4) × 2⁴⁻² of them. What is N(2, 4)? | **32** |
| 4 | AMC 10 | How many sequences of 5 switches on 3 lamps switch every lamp an odd number of times? | **60** |
| **Challenge** | AIME | What is N(3, 9)? | **314880** |

**Problem analysis** *(members only)*
- A lamp ends on exactly when it was switched an odd number of times. So lamps 1 to n are switched an odd number of
  times and lamps n + 1 to 2n an even number of times.
- Counting all sequences directly is messy, but there is a neat comparison: "fold" lamp n + i onto lamp i. Each
  sequence that never touches the second half comes from exactly 2ᵏ⁻ⁿ full sequences.
- So N = 2ᵏ⁻ⁿ × M, and only M is left: sequences of k switches on n lamps with every lamp switched an odd number of
  times.
- M can be counted with the ±1 trick: (x₁ + … + xₙ)ᵏ with each xᵢ = ±1, averaged with signs, keeps exactly the
  terms with all exponents odd: M = (1/2ⁿ) × Σ (−1)ʲ C(n, j) (n − 2j)ᵏ.
- For n = 3, k = 9: M = (3⁹ − 3 × 1 + 3 × (−1) − (−3)⁹)/8 = 4920, and N = 2⁶ × 4920 = 314 880.

**Logic flow** *(members only)*
1. **Count a tiny case (Step 1).** Lamp 1 switched 1 or 3 times, lamp 2 switched 0 or 2 times: 4 sequences.
2. **Parity (Step 2).** In a restricted sequence each of lamps 1, …, n is switched an odd number of times. *Why:* it
   reduces M to counting with odd counts.
3. **Fold the second half (Step 3).** Every full sequence becomes restricted by renaming lamp n + i as lamp i, and
   each restricted sequence comes from exactly 2ᵏ⁻ⁿ full ones. *Why:* N = 2ᵏ⁻ⁿ M.
4. **Count odd switchings (Step 4).** Use the ±1 trick (or list the patterns of odd counts and multinomials).
5. **Combine (Challenge).** N(3, 9) = 2⁶ × M(3, 9) = 64 × 4920.

**Our full solution**
In any sequence ending in the target, lamp i (i ≤ n) is switched an odd number of times and lamp n + i an even number
of times. Replacing every switch of lamp n + i by a switch of lamp i gives a restricted sequence; conversely, from a
restricted sequence in which lamp i is switched kᵢ times (odd), any even-size subset of those kᵢ switches can be
moved to lamp n + i, which is 2^(kᵢ − 1) choices; in total 2^(k₁ + … + kₙ − n) = 2ᵏ⁻ⁿ. So N = 2ᵏ⁻ⁿ M. For M(3, 9),
the ±1 trick gives (3⁹ − 3 − 3 + 3⁹)/8 = 39 360/8 = 4920, so N(3, 9) = 64 × 4920 = **314 880**. Computer check: both
numbers counted directly for all small cases, including n = 3, k = 9.

**Short solutions**
- Step 1: lamp 1 switched 3 times (1 way) or once with lamp 2 twice (3 positions for lamp 1): 4.
- Step 2: counts (1, 3) or (3, 1): 4 + 4 = 8 sequences.
- Step 3: 8 × 2² = 32.
- Step 4: patterns (1, 1, 3) in some order: 3 × 5!/(1! 1! 3!) = 3 × 20 = 60 (the ±1 trick gives (243 − 3 − 3 + 243)/8).
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2008 C4 (IMO 2008 Problem 5) *(Strong)*: asks for the ratio N/M in general; the answer is 2ᵏ⁻ⁿ. Our
  Challenge asks for N itself in one case, which also needs M.

**Similar problems on our site**
- Ladder P1 "The Cheapest Bakery": another problem where comparing two counts or costs one step at a time is the key.

**Explore** — *Status: known (exponential generating functions).*
How many sequences of k switches on n lamps leave every lamp on? Find a formula with the ±1 trick and test it on
small cases.

**Proof problem** *(not graded)*
Prove that every restricted sequence comes from exactly 2ᵏ⁻ⁿ full sequences.
- Hint: for one lamp switched kᵢ times, how many ways are there to choose an even number of its switches?
- Solution: a set of kᵢ ≥ 1 switches has 2^(kᵢ − 1) subsets of even size; choosing one for every lamp independently
  gives Π 2^(kᵢ − 1) = 2^(k − n) full sequences, and different choices give different full sequences.

**Research field:** enumerative combinatorics (bijections, generating functions).

---

### Ladder P10 — Functions That Grow Slowly

**Idea card:** SL2007-A2 (the rule f(m + n) ≥ f(m) + f(f(n)) − 1 forces f to be non-decreasing and f(n) ≤ n + 1;
explicit functions reach every value from 1 to n + 1).

**Setup:** f is a function from the positive whole numbers to the positive whole numbers such that
f(m + n) ≥ f(m) + f(f(n)) − 1 for all positive whole numbers m and n. Call such an f **slow**.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | f is slow and f(5) = 4. Using m = 5 and n = 4, what is the smallest value f(9) could possibly have? | **4** |
| 2 | AMC 8 | Suppose some slow f had f(3) = 5. Slow functions never decrease, so f(5) ≥ f(3). Using m = n = 3, what is the smallest value f(6) could then have? | **9** |
| 3 | AMC 8 | How many of these four functions are slow: f(n) = max(1, n − 3), f(n) = n, f(n) = n + 1, f(n) = 2n? | **2** |
| 4 | AMC 10 | Slow functions satisfy f(n) ≤ n + 1. The function with f(n) = n + 1 when n is a multiple of 10 and f(n) = n otherwise is slow. What is the largest possible value of f(10) for a slow f? | **11** |
| **Challenge** | AIME | How many different values can f(2026) take, over all slow functions f? | **2027** |

**Problem analysis** *(members only)*
- With m > n the rule gives f(m) ≥ f(n) + f(f(m − n)) − 1 ≥ f(n), so a slow function never decreases.
- If f(n) were much bigger than n, the rule would make f grow faster and faster; measuring the largest excess
  c = f(k) − k and using m = n = k gives 2k + c ≥ f(2k) ≥ 2f(k) − 1 = 2k + 2c − 1, so c ≤ 1: f(n) ≤ n + 1.
- So f(2026) is between 1 and 2027. The question is whether all these values really occur.
- Shifted functions f(n) = max(1, n + j − 2026) are slow and give f(2026) = j for j = 1, …, 2026, and the function
  with f(n) = n + 1 exactly at multiples of 2026 gives 2027.

**Logic flow** *(members only)*
1. **The rule pushes values up (Step 1).** f(9) ≥ f(5) + f(f(4)) − 1 ≥ 4 + 1 − 1. *Why:* it shows the rule as a
   lower bound and hints that f never decreases.
2. **Too big is impossible (Step 2).** A value above n + 1 would feed into larger and larger lower bounds. *Why:* it
   leads to f(n) ≤ n + 1.
3. **Test candidates (Step 3).** Constant-then-linear shapes work; growing too fast fails. *Why:* it suggests the
   examples for every value.
4. **The top value (Step 4).** f(n) = n + 1 at multiples of 10 (and n elsewhere) reaches the bound.
5. **Count (Challenge).** Every value from 1 to 2027 occurs: 2027 values.

**Our full solution**
Monotonic: for m > n, f(m) = f(n + (m − n)) ≥ f(n) + f(f(m − n)) − 1 ≥ f(n). Bound: if f is constantly 1 there is
nothing to show. Otherwise let a be the smallest number with f(a) > 1. If f(n) > n, then
f(f(n)) = f((f(n) − n) + n) ≥ f(f(n) − n) + f(f(n)) − 1, so f(f(n) − n) ≤ 1 and f(n) − n < a. So the excess
f(n) − n is bounded; take k with the largest excess c. If c ≥ 1, then f(k) ≥ k and
2k + c ≥ f(2k) ≥ f(k) + f(f(k)) − 1 ≥ 2f(k) − 1 = 2k + 2c − 1, so c ≤ 1. Hence
1 ≤ f(2026) ≤ 2027. Examples: f(n) = max(1, n + j − 2026) is slow and gives f(2026) = j for j = 1, …, 2026; the
function equal to n + 1 at multiples of 2026 and n elsewhere is slow and gives 2027. So there are **2027** values.
Computer check: the example functions against the rule for all m, n up to 2500, and the four candidates of Step 3.

**Short solutions**
- Step 1: f(9) ≥ f(5) + f(f(4)) − 1 ≥ 4 + 1 − 1 = 4. The value 4 is possible: f(n) = 1 for n ≤ 4 and f(n) = 4 for
  n ≥ 5 is slow (here f(f(n)) = 1 always, and f never decreases).
- Step 2: f(6) ≥ f(3) + f(f(3)) − 1 = 5 + f(5) − 1 ≥ 5 + 5 − 1 = 9.
- Step 3: max(1, n − 3) and n are slow; n + 1 fails at m = n = 1 (3 ≥ 2 + 3 − 1 is false); 2n fails at m = n = 1.
- Step 4: f(10) ≤ 11, and the given function reaches 11.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2007 A2 *(Strong)*: the same rule; it asks for all possible values of f(2007). Our Challenge counts
  them for 2026.

**Similar problems on our site**
- Ladder P6 "The Half That Never Ends": another rule repeated on itself.

**Explore** — *Status: not searched in the literature yet.*
Change the rule to f(m + n) ≥ f(m) + f(f(n)) − 2. How large can f(2026) be now?

**Proof problem** *(not graded)*
Prove that a slow function satisfies f(n) ≤ n + 1 for every n.
- Hint: take k where f(k) − k is largest and use m = n = k.
- Solution: see "Our full solution".

**Research field:** functional inequalities.

---

### Ladder P11 — The Halfway Point

**Idea card:** SL2006-G4 (draw through J the line parallel to KL; it meets AC at a point M with AM = 2AL, because the
isosceles triangles give JD = JM and the incircle of BCD gives DM = BD + CD − BC; then AM = AB + AC − BC).

**Setup:** In triangle ABC (angle C < angle A < 90°), the circle inside ABC touching all three sides touches AB at
K and AC at L. The point D on side AC has BD = BA, and J is the centre of the circle inside triangle BCD. The line
through J parallel to KL meets line AC at M.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | Triangle ABC has AB = 13, BC = 14, CA = 15. What is AL (the length from A to the touching point on AC)? | **7** |
| 2 | AMC 8 | In the same triangle, D on AC has BD = BA = 13. What is AD? Give your answer as a fraction. | **66/5** |
| 3 | AMC 10 | In the same triangle, the circle inside BCD touches CD at T. What is DT? Give your answer as a fraction. | **2/5** |
| 4 | AMC 10 | In the same triangle, triangle DMJ is isosceles with JD = JM, and T is the foot of the perpendicular from J, so DM = 2 × DT. What is AM? | **14** |
| **Challenge** | AIME | Triangle ABC has AB = 37, BC = 40, CA = 45. What is AM? | **42** |

**Problem analysis** *(members only)*
- Lengths from a vertex to a touching point are easy: AL = (AB + AC − BC)/2. Lengths from A to M are not, unless M
  can be tied to touching points.
- BA = BD makes triangle ABD isosceles, so the angle at D equals angle A; the line KL makes the same kind of angle
  with AC (triangle AKL is isosceles too).
- JD bisects the angle at D in triangle BCD, and JM is parallel to KL, so triangle DMJ has two equal angles: JD = JM.
- Then the foot T of the perpendicular from J is the middle of DM, and DT is a touching-point length in triangle
  BCD: DT = (BD + CD − BC)/2.
- Adding up, AM = AD + DM = AD + BD + CD − BC = AB + AC − BC = 2AL. So the line KL meets AJ at its midpoint, and
  for the Challenge AM = 37 + 45 − 40 = 42.

**Logic flow** *(members only)*
1. **Touching-point lengths (Step 1).** AL = (AB + AC − BC)/2 = 7 in the 13-14-15 triangle.
2. **Locate D (Step 2).** BD = BA makes ABD isosceles; AD = 2 × AB × cos A = 66/5.
3. **The second incircle (Step 3).** DT = (BD + CD − BC)/2 in triangle BCD. *Why:* the incircle of BCD gives the
   only easy length near M.
4. **The isosceles triangle DMJ (Step 4).** Equal angles give JD = JM, so DM = 2DT and AM = AD + DM. *Why:* this is
   the key move; it turns M into touching-point lengths.
5. **Simplify (Challenge).** AM = AD + BD + CD − BC = AB + AC − BC, with no need to find D.

**Our full solution**
Let angle A = 2α. Triangle AKL is isosceles, so angle ALK = 90° − α; triangle ABD is isosceles with BA = BD, so
angle ADB = 2α and the bisector DJ of angle BDC makes angle CDJ = 90° − α. As JM ∥ KL, angle DMJ = angle ALK = 90° − α,
so triangle DMJ is isosceles with JD = JM, and the foot T of the perpendicular from J (the touching point of the
incircle of BCD on CD) is the midpoint of DM. Hence DM = 2DT = BD + CD − BC and AM = AD + DM = AD + CD + BD − BC =
AC + AB − BC. For AB = 37, BC = 40, CA = 45: AM = 37 + 45 − 40 = **42**. Computer check: the whole figure built with
coordinates for both triangles (AM = 14 and AM = 42, and the line KL passes through the midpoint of AJ).

**Short solutions**
- Step 1: s = 21, AL = s − BC = 7.
- Step 2: cos A = (13² + 15² − 14²)/(2 × 13 × 15) = 198/390, so AD = 2 × 13 × cos A = 198/15 = 66/5.
- Step 3: CD = 15 − 66/5 = 9/5, so DT = (13 + 9/5 − 14)/2 = 2/5.
- Step 4: AM = 66/5 + 4/5 = 14 (= 2 × AL).
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2006 G4 *(Strong)*: proves that the line KL meets AJ at its midpoint, which is the statement
  AM = 2AL behind our Challenge.

**Similar problems on our site**
- Ladder AA "The Inner Arc" (draft v0.3): another problem about the incircle and its touching points.

**Explore** — *Status: not searched in the literature yet.*
What happens if D is chosen on AC with CD = CB instead? Is there a similar point M and a simple formula for AM?

**Proof problem** *(not graded)*
Prove that the line KL passes through the midpoint of AJ.
- Hint: show AM = 2AL, then use the parallel lines KL and JM.
- Solution: by "Our full solution" AM = AB + AC − BC = 2AL, so L is the midpoint of AM; the line through L parallel
  to MJ (that is, KL) cuts AJ at its midpoint.

**Research field:** Euclidean geometry (incircles and tangent lengths).
