# Solution-path ladders v2 — batch 3 (P12–P16)

- Date: 2026-10-11
- Status: **draft for review, not imported.** Built with [LADDER_RULES_v2.md](../LADDER_RULES_v2.md).
- Answer check: `python3 ladders/v2/verify_v2_batch3.py` (every answer and every number in the analysis, flow and
  solutions).
- Internal only: the `Idea card` lines name the sources. They are never shown on the site.

---

### Ladder P12 — The Closest Climb

**Idea card:** SL2007-A1 (take the worst drop d = aₚ − aᵣ with p < r: any non-decreasing sequence misses aₚ or aᵣ by
at least d/2; the greedy sequence x₁ = a₁ − d/2, xₖ = max(xₖ₋₁, aₖ − d/2) never misses by more than d/2).

**Setup:** A list of numbers a₁, a₂, …, aₙ is given. We look for a **non-decreasing** list x₁ ≤ x₂ ≤ … ≤ xₙ (real
numbers allowed) that stays as close as possible to it. The **error** of a choice is the largest of the distances
|x₁ − a₁|, …, |xₙ − aₙ|.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | For the list 5, 1, 4, 2, 3, what is the largest value of aᵢ − aⱼ with i < j (an earlier number minus a later one)? | **4** |
| 2 | AMC 8 | For the list 5, 1, 4, 2, 3, what is the smallest possible error of a non-decreasing list? | **2** |
| 3 | AMC 8 | For the list 5, 1, 4, 2, 3, build x₁ = a₁ − 2 and xₖ = the larger of xₖ₋₁ and aₖ − 2. What is x₅? | **3** |
| 4 | AMC 10 | For the list aᵢ = (remainder of i² divided by 11) for i = 1, 2, …, 10, what is the smallest possible error? | **4** |
| **Challenge** | AIME | For the list aᵢ = (remainder of 37i divided by 101) for i = 1, 2, …, 100, what is the smallest possible error? Give your answer as a fraction. | **99/2** |

**Problem analysis** *(members only)*
- A non-decreasing list cannot follow a drop: if an earlier number aₚ is bigger than a later number aᵣ, then xₚ ≤ xᵣ
  forces one of the two distances to be at least half the drop.
- So the error is at least d/2, where d is the largest drop from an earlier number to a later one.
- Conversely, the greedy list that starts d/2 below a₁ and then never goes down, but rises when it must stay within
  d/2 of the next number, achieves error d/2 exactly.
- So the whole problem is: find the largest drop d. For a long list, look for a large early value and a small late
  value.
- For 37i modulo 101: the value 100 appears at i = 30 and the value 1 at i = 71 (37 × 71 = 2627 = 26 × 101 + 1), so
  d = 99, the most a list of remainders 1..100 allows.

**Logic flow** *(members only)*
1. **Find the drops (Step 1).** Compare earlier and later numbers. *Why:* drops are what a non-decreasing list cannot
   follow.
2. **Lower bound d/2 (Step 2).** For p < r, (aₚ − xₚ) + (xᵣ − aᵣ) ≥ aₚ − aᵣ = d, so one term is at least d/2.
3. **Matching construction (Step 3).** The greedy list xₖ = max(xₖ₋₁, aₖ − d/2) stays within d/2 of every aₖ.
   *Why:* it shows the bound is exact.
4. **Use it on a residue list (Step 4).** For i² modulo 11 the largest drop is 9 − 1 = 8, so the error is 4.
5. **Find the extreme positions (Challenge).** Solve 37i ≡ 100 and 37i ≡ 1 modulo 101: i = 30 and i = 71, so d = 99.

**Our full solution**
For any non-decreasing x and p < r: (aₚ − xₚ) + (xᵣ − aᵣ) = (aₚ − aᵣ) + (xᵣ − xₚ) ≥ aₚ − aᵣ, so the error is at least
half of the largest drop d. The greedy list x₁ = a₁ − d/2, xₖ = max(xₖ₋₁, aₖ − d/2) is non-decreasing, never more
than d/2 below aₖ, and never more than d/2 above aₖ (if xₖ = aₗ − d/2 for some earlier l, then aₗ − aₖ ≤ d). So the
smallest error is exactly d/2. For aᵢ = 37i mod 101 the values are 1, …, 100 in some order; 100 comes at i = 30 and
1 at i = 71, so d = 99 and the answer is **99/2**. Computer check: d and the greedy list's error computed directly.

**Short solutions**
- Step 1: the largest drop is 5 − 1 = 4.
- Step 2: half of the largest drop: 2.
- Step 3: a − 2 = 3, −1, 2, 0, 1, so x = 3, 3, 3, 3, 3 and x₅ = 3 (errors 2, 2, 1, 1, 0).
- Step 4: the list is 1, 4, 9, 5, 3, 3, 5, 9, 4, 1; the largest drop is 9 − 1 = 8, error 4.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2007 A1 *(Strong)*: proves that the smallest error is exactly half the largest drop. Our Challenge
  applies it to a list given by remainders.

**Similar problems on our site**
- Ladder O "Pick With Small Gaps" (draft v0.3): another "best guaranteed value" with a matching construction.

**Explore** — *Status: known (isotonic regression).*
Replace the largest distance by the sum of the distances |xᵢ − aᵢ|. What is the smallest sum for 5, 1, 4, 2, 3?

**Proof problem** *(not graded)*
Prove that the greedy list never ends up more than d/2 above the given list.
- Hint: if xₖ > aₖ − d/2, then xₖ = aₗ − d/2 for some earlier l.
- Solution: xₖ is the largest of a₁ − d/2, …, aₖ − d/2, say aₗ − d/2 with l ≤ k. Then xₖ − aₖ = (aₗ − aₖ) − d/2 ≤
  d − d/2 = d/2, because aₗ − aₖ is a drop and so at most d.

**Research field:** approximation by monotone sequences (isotonic regression).

---

### Ladder P13 — Every Power of Two

**Idea card:** SL2006-N2 (the digits of a fraction repeat with some period d; the positions 2, 4, 8, 16, … repeat
modulo d with period equal to the order of 2 modulo the odd part of d) + the order of 10 modulo a prime (Fermat).

**Setup:** For a fraction x between 0 and 1, build a new decimal y: the n-th digit of y after the decimal point is the
(2ⁿ)-th digit of x. (So y uses the 2nd, 4th, 8th, 16th, … digits of x.) A decimal **eventually repeats with period
p** if, after some point, every digit equals the digit p places later; the period is the smallest such p.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | x = 1/7 = 0.142857142857…. What are the first four digits of y? Give them as one four-digit number. | **4848** |
| 2 | AMC 8 | The digits of 1/41 = 0.0243902439… repeat with period 5. What is the remainder when 2¹⁰ is divided by 5? | **4** |
| 3 | AMC 10 | What is the smallest k ≥ 1 with 2ᵏ leaving remainder 1 when divided by 17? | **8** |
| 4 | AMC 10 | The digits of 1/103 repeat with period 34. What is the period of the remainders of 2, 4, 8, 16, … when divided by 34 (from the start)? | **8** |
| **Challenge** | AIME | For x = 1/103, the decimal y eventually repeats. What is its period? | **8** |

**Problem analysis** *(members only)*
- A fraction's digits repeat: for 1/103 the period is the order of 10 modulo 103, which is 34 (a divisor of 102).
- The (2ⁿ)-th digit only depends on the position 2ⁿ modulo 34. So y repeats exactly when the remainders of 2ⁿ
  modulo 34 repeat.
- 34 = 2 × 17. The factor 2 is absorbed after one step (all 2ⁿ are even), and modulo 17 the powers of 2 repeat with
  the order of 2 modulo 17, which is 8.
- So the positions repeat with period 8 from the first step on, and y repeats with period dividing 8; the computer
  check confirms that no smaller period works.

**Logic flow** *(members only)*
1. **Build y by hand (Step 1).** For 1/7 the digits at places 2, 4, 8, 16 are 4, 8, 4, 8. *Why:* it shows the
   positions jump and only their remainders matter.
2. **Positions modulo the period (Step 2).** The (2ⁿ)-th digit depends only on 2ⁿ modulo the period of x.
3. **Order of 2 (Step 3).** Modulo an odd number, the powers of 2 repeat with the order of 2. *Why:* this gives the
   period of the positions.
4. **Split the period (Step 4).** With period d = 2ᵘ × v (v odd), after u steps the positions repeat with the order of
   2 modulo v. For d = 34 that is the order of 2 modulo 17.
5. **Conclude (Challenge).** The period of y divides 8, and a direct check shows it is exactly 8.

**Our full solution**
The digits of 1/103 repeat from the start with period 34, because 10³⁴ ≡ 1 (mod 103) and no smaller power works.
The (2ⁿ)-th digit depends only on 2ⁿ modulo 34. Since 2ⁿ is even and 2ⁿ⁺⁸ ≡ 2ⁿ (mod 17) (the order of 2 modulo 17 is
8), we get 2ⁿ⁺⁸ ≡ 2ⁿ (mod 34) for every n ≥ 1, so y repeats with a period dividing 8. Writing out y gives
0, 7, 3, 6, 2, 9, 2, 9, 0, 7, 3, 6, … whose period is exactly **8**. Computer check: the digits of 1/103 and of y.

**Short solutions**
- Step 1: the 2nd, 4th, 8th and 16th digits of 0.142857142857… are 4, 8, 4, 8.
- Step 2: 2¹⁰ = 1024 = 204 × 5 + 4.
- Step 3: 2, 4, 8, 16, 15, 13, 9, 1 modulo 17: k = 8.
- Step 4: 2, 4, 8, 16, 32, 30, 26, 18, 2, … modulo 34: period 8.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2006 N2 *(Strong)*: proves that y is rational whenever x is. Our Challenge asks for the exact
  period in one case.

**Similar problems on our site**
- Ladder P6 "The Half That Never Ends": another problem driven by powers of 2.

**Explore** — *Status: not searched in the literature yet.*
Use the (3ⁿ)-th digits instead. For x = 1/103, what is the period of the new decimal?

**Proof problem** *(not graded)*
Prove that if the digits of x repeat with period d = 2ᵘ × v (v odd), then y repeats with period dividing the order of
2 modulo v.
- Hint: compare 2ⁿ⁺ʷ and 2ⁿ modulo 2ᵘ and modulo v separately, where w is the order of 2 modulo v.
- Solution: for n ≥ u both are divisible by 2ᵘ, and 2ⁿ⁺ʷ ≡ 2ⁿ (mod v); so 2ⁿ⁺ʷ ≡ 2ⁿ (mod d), and the digits at these
  positions are equal (for positions after the non-repeating start of x).

**Research field:** elementary number theory (orders modulo n; decimal expansions).

---

### Ladder P14 — Six Points on a Circle

**Idea card:** SL2008-G1 (circles around the side midpoints through the orthocentre H cut the sides in six points;
their centre must be the circumcentre O, and the radius² is OA₀² + A₀H², which turns out to be the same for all
three sides).

**Setup:** ABC is an acute triangle with circumcentre O (centre of the circle through A, B, C), circumradius R,
orthocentre H (where the altitudes meet), and side midpoints A₀ (of BC), B₀ (of CA), C₀ (of AB). The circle with
centre A₀ through H meets line BC in two points; the same is done for B₀ and C₀. These six points lie on one circle
with centre O; call its radius r. Sides: a = BC, b = CA, c = AB.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | Triangle ABC has sides 13, 14, 15 (BC = 14). Its circumradius is R = abc/(4 × area). What is 8R? | **65** |
| 2 | AMC 8 | In the same triangle, OA₀ is perpendicular to BC, so OA₀² = R² − (a/2)². What is 64 × OA₀²? | **1089** |
| 3 | AMC 10 | In the same triangle, A₀H² = 4R² − a²/4 − (b² + c²)/2. What is 64 × A₀H²? | **1156** |
| 4 | AMC 10 | Each of the six points is at distance r from O, with r² = OA₀² + A₀H². What is 64r² for the 13-14-15 triangle? | **2245** |
| **Challenge** | AIME | Triangle ABC has sides 7, 8, 9. What is 4r²? | **53** |

**Problem analysis** *(members only)*
- The two points on BC are symmetric about A₀, so the perpendicular bisector of the chord is the perpendicular to BC
  at A₀, which passes through O. Doing this for all three sides, the only possible centre is O.
- By Pythagoras, a point on BC at distance A₀H from A₀ is at distance √(OA₀² + A₀H²) from O.
- So everything reduces to showing OA₀² + A₀H² is the same for all three sides. With O at the origin, the vectors
  satisfy H = A + B + C and A₀ = (B + C)/2, which makes the computation clean.
- The result is r² = 5R² − (a² + b² + c²)/2, symmetric in the sides.
- For 7, 8, 9: area 12√5, R² = 441/20, so r² = 2205/20 − 97 = 53/4.

**Logic flow** *(members only)*
1. **Circumradius (Step 1).** R = abc/(4 × area); for 13-14-15 the area is 84 and R = 65/8.
2. **Distance to the midpoint (Step 2).** OA₀² = R² − a²/4. *Why:* half of the needed sum.
3. **Distance from midpoint to H (Step 3).** With O as origin, A₀H = A + (B + C)/2, and dot products give
   A₀H² = 4R² − a²/4 − (b² + c²)/2. *Why:* the other half.
4. **Add (Step 4).** r² = OA₀² + A₀H² = 5R² − (a² + b² + c²)/2, the same for every side: the six points are on one
   circle.
5. **Apply (Challenge).** For 7-8-9: 5 × 441/20 − 194/2 = 53/4.

**Our full solution**
Put O at the origin, so |A| = |B| = |C| = R, H = A + B + C and A₀ = (B + C)/2. Then OA₀² = |B + C|²/4 = R² − a²/4
(because a² = |B − C|² = 2R² − 2B·C), and A₀H = A + (B + C)/2, so A₀H² = R² + (R² − a²/4) + A·B + A·C
= 4R² − a²/4 − (b² + c²)/2. Each point on BC at distance A₀H from A₀ is at distance r from O with
r² = OA₀² + A₀H² = 5R² − (a² + b² + c²)/2, symmetric in a, b, c, so the same circle works for all six points. For
the 7-8-9 triangle the area is √(12 × 5 × 4 × 3) = 12√5, R² = (7 × 8 × 9)²/(16 × 720) = 441/20, and
r² = 2205/20 − 97 = 53/4: **4r² = 53**. Computer check: the six points built with coordinates for both triangles.

**Short solutions**
- Step 1: area 84 (Heron), R = 13 × 14 × 15/(4 × 84) = 65/8.
- Step 2: OA₀² = 4225/64 − 49 = 1089/64 (OA₀ = 33/8).
- Step 3: 4 × 4225/64 − 49 − (225 + 169)/2 = 1156/64 (A₀H = 17/4).
- Step 4: (1089 + 1156)/64 = 2245/64.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2008 G1 (IMO 2008 Problem 1) *(Strong)*: proves that the six points lie on one circle. Our Challenge
  asks for its radius in a specific triangle.

**Similar problems on our site**
- Ladder P11 "The Halfway Point": another problem where a hidden equal length decides everything.

**Explore** — *Status: known (related to the nine-point circle).*
Compare r² with the distance OH². Show that r² = R² + (something simple involving OH²) and find it.

**Proof problem** *(not graded)*
Prove that the centre of the circle through the six points must be O.
- Hint: the two points on BC are symmetric about A₀.
- Solution: a circle through both points on BC has its centre on their perpendicular bisector, which is the line
  through A₀ perpendicular to BC, that is, the perpendicular bisector of BC. The same holds for the other sides, and
  the three perpendicular bisectors meet only at O.

**Research field:** triangle geometry (orthocentre, circumcentre, nine-point circle).

---

### Ladder P15 — Equal Divisor Counts

**Idea card:** SL2018-N1 (if n divides k, then sn is a proper divisor of sk, so sk has more divisors; otherwise a
multiplier s can be built prime by prime to balance the divisor counts).

**Setup:** d(m) is the number of positive divisors of m. Two different positive whole numbers n < k form a
**balanced pair** if some positive whole number s makes d(sn) = d(sk).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is d(12) + d(18)? | **12** |
| 2 | AMC 8 | Explain to yourself why a pair with n dividing k is never balanced. Then: how many pairs n < k ≤ 6 are balanced? | **7** |
| 3 | AMC 10 | What is the smallest s with d(8s) = d(12s)? | **9** |
| 4 | AMC 10 | How many pairs n < k ≤ 30 have n dividing k? | **81** |
| **Challenge** | AIME | How many pairs n < k ≤ 30 are balanced? | **354** |

**Problem analysis** *(members only)*
- If n divides k, then sn divides sk and is smaller, and every divisor of sn is a divisor of sk, plus sk itself:
  d(sk) > d(sn). So such pairs are never balanced.
- The surprise is the converse: when neither divides the other, there is always a multiplier. For each prime, s can
  add to the exponents of n and k so that the products of (exponent + 1) come out equal.
- So the Challenge is a counting problem: all pairs minus the pairs where the smaller divides the larger.
- Counting divisible pairs: for each n, the multiples 2n, 3n, … up to 30, that is ⌊30/n⌋ − 1 of them.

**Logic flow** *(members only)*
1. **Compute divisor counts (Step 1).** d(12) = d(18) = 6, so 4 and 6 are balanced with s = 3 (12 = 3 × 4, 18 = 3 × 6).
2. **Divisible pairs fail (Step 2).** sn is a proper divisor of sk, so d(sk) > d(sn). *Why:* this removes them.
3. **Build a multiplier (Step 3).** For 8 = 2³ and 12 = 2² × 3, s = 9 gives 72 = 2³ × 3² and 108 = 2² × 3³, both with
   12 divisors. *Why:* it shows how exponents can be balanced.
4. **Count the divisible pairs (Step 4).** Σ (⌊30/n⌋ − 1) over n = 1..30 = 81.
5. **Subtract (Challenge).** 435 pairs in total minus 81 divisible pairs = 354.

**Our full solution**
If n divides k, every divisor of sn divides sk, and sk itself does not divide sn, so d(sk) > d(sn): not balanced. If
neither divides the other, a multiplier s exists (the idea card's construction balances the exponents of each prime
in turn); the computer finds one for every such pair up to 30. There are C(30, 2) = 435 pairs, and the pairs with
n dividing k number Σ (⌊30/n⌋ − 1) = 111 − 30 = 81, so **354** pairs are balanced. Computer check: a multiplier s
found for each of the 354 pairs, and no pair with n dividing k balanced for s up to a large bound.

**Short solutions**
- Step 1: d(12) = 6 and d(18) = 6: 12.
- Step 2: the pairs n < k ≤ 6 where neither divides the other are (2, 3), (2, 5), (3, 4), (3, 5), (4, 5), (4, 6),
  (5, 6): 7, and each has a multiplier.
- Step 3: s = 9 works (d(72) = d(108) = 12) and no smaller s does.
- Step 4: ⌊30/n⌋ − 1 summed over n = 1..30 gives 81.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2018 N1 *(Strong)*: asks for all pairs (n, k) with such a multiplier; the answer is the pairs where
  neither divides the other. Our Challenge counts them up to 30.

**Similar problems on our site**
- Ladder P8 "Divisors That Leave 1": another problem built on the divisor-count formula.

**Explore** — *Status: not searched in the literature yet.*
For the pair (2, 3), list all s up to 100 with d(2s) = d(3s). What do they have in common?

**Proof problem** *(not graded)*
Prove that if n divides k and n ≠ k, then d(sn) < d(sk) for every s.
- Hint: every divisor of sn is a divisor of sk.
- Solution: since sn divides sk, every divisor of sn divides sk, and sk is a divisor of sk that is not a divisor of
  sn (it is larger than sn). So sk has more divisors.

**Research field:** multiplicative number theory (the divisor function).

---

### Ladder P16 — Powers on Both Sides

**Idea card:** SL2010-N2 (for fixed n the equation is a quadratic in m whose two roots multiply to 2 × 3ⁿ, so both are
3ᵖ and 2 × 3^q with p + q = n; comparing the exact power of 3 in 2ⁿ⁺¹ − 1 with the sizes of p and q leaves only n ≤ 5).

**Setup:** We look for pairs of whole numbers (m, n), m ≥ 1 and n ≥ 0, with m² + 2 × 3ⁿ = m × (2ⁿ⁺¹ − 1).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | For n = 3 the equation is m² + 54 = 15m. What is the sum of its two solutions m? | **15** |
| 2 | AMC 8 | For n = 5 the two solutions m multiply to 2 × 3⁵ = 486 and add up to 63. What is the larger one? | **54** |
| 3 | AMC 10 | What is the exponent of the largest power of 3 that divides 2¹⁸ − 1? | **3** |
| 4 | AMC 10 | How many pairs (m, n) with n ≤ 5 satisfy the equation? | **4** |
| **Challenge** | AIME | Find the sum of m + n over all pairs (m, n) that satisfy the equation. | **94** |

**Problem analysis** *(members only)*
- For each n the equation is a quadratic in m: m² − (2ⁿ⁺¹ − 1)m + 2 × 3ⁿ = 0. Its roots multiply to 2 × 3ⁿ and add
  up to 2ⁿ⁺¹ − 1.
- Whole-number roots must divide 2 × 3ⁿ, so the two roots are 3ᵖ and 2 × 3^q with p + q = n, and
  3ᵖ + 2 × 3^q = 2ⁿ⁺¹ − 1.
- Both 3ᵖ and 3^q are below 2ⁿ⁺¹, so p and q are each less than about 0.63(n + 1); then each is more than about
  0.37(n + 1) − 1. For large n both are at least 2, so 9 divides 2ⁿ⁺¹ − 1, which forces 6 to divide n + 1.
- The exact power of 3 in 2⁶ʳ − 1 is 3^(2 + v₃(r)), small compared with the lower bound on min(p, q). This only
  works for r = 1, so n ≤ 5, and checking n = 0, …, 5 gives four pairs.

**Logic flow** *(members only)*
1. **Treat it as a quadratic (Step 1).** For n = 3: m² − 15m + 54 = 0, roots 6 and 9 (sum 15).
2. **Use the product of the roots (Step 2).** Both roots divide 2 × 3ⁿ: they are 3ᵖ and 2 × 3^q. For n = 5: 9 and 54.
3. **Count factors of 3 (Step 3).** The power of 3 dividing 2⁶ʳ − 1 is exactly 3^(2 + v₃(r)) (for r = 3: 3³).
   *Why:* min(p, q) must equal this exponent, but it also grows like n/3, which is impossible for r ≥ 2.
4. **Small cases (Step 4).** n = 0, 1, 2, 4 give no whole-number roots; n = 3 and n = 5 give two each.
5. **Add up (Challenge).** (6 + 3) + (9 + 3) + (9 + 5) + (54 + 5) = 94.

**Our full solution**
For fixed n, the roots m₁, m₂ satisfy m₁m₂ = 2 × 3ⁿ and m₁ + m₂ = 2ⁿ⁺¹ − 1, so {m₁, m₂} = {3ᵖ, 2 × 3^q} with
p + q = n. Since 3ᵖ and 3^q are below 2ⁿ⁺¹, p, q < (n + 1) × log₃2 < 2(n + 1)/3, so min(p, q) > n − 2(n + 1)/3 =
(n − 2)/3. If n ≥ 6, min(p, q) ≥ 2, so 9 divides 2ⁿ⁺¹ − 1, which means 6 divides n + 1; write n + 1 = 6r. The left
side 3ᵖ + 2 × 3^q is divisible by 3^min(p, q), and 2⁶ʳ − 1 = 64ʳ − 1 is divisible by exactly 3^(2 + v₃(r)) (lifting
the exponent: v₃(64ʳ − 1) = v₃(63) + v₃(r)). So min(p, q) ≤ 2 + v₃(r) ≤ 2 + log₃ r, while min(p, q) > (n − 2)/3 =
2r − 1. This forces r = 1, so n ≤ 5. Checking
n = 0, …, 5 gives (6, 3), (9, 3), (9, 5), (54, 5), and the sum of m + n is **94**. Computer check: every n up to 300.

**Short solutions**
- Step 1: by Vieta the roots add up to 15 (they are 6 and 9).
- Step 2: 486 = 9 × 54 and 9 + 54 = 63.
- Step 3: 2¹⁸ − 1 = 262 143 = 27 × 9709, and 9709 is not divisible by 3: exponent 3.
- Step 4: n = 3 gives m = 6, 9 and n = 5 gives m = 9, 54; the other n give no whole roots: 4 pairs.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2010 N2 *(Strong)*: asks for all pairs (m, n) satisfying this equation. Our Challenge asks for one
  number built from all of them.

**Similar problems on our site**
- Ladder AB "Powers Plus Fourth Powers" (draft v0.3): another equation with powers on both sides.

**Explore** — *Status: not searched in the literature yet.*
Replace 3ⁿ by 5ⁿ: m² + 2 × 5ⁿ = m × (2ⁿ⁺¹ − 1). Which pairs (m, n) work now?

**Proof problem** *(not graded)*
Prove that if n + 1 = 6r, the largest power of 3 dividing 2ⁿ⁺¹ − 1 is 3^(2 + v₃(r)).
- Hint: write 2⁶ʳ − 1 = 64ʳ − 1 and use the lifting-the-exponent lemma for the prime 3.
- Solution: 3 divides 64 − 1 = 63 = 3² × 7 and does not divide 64, so the lifting-the-exponent lemma gives
  v₃(64ʳ − 1) = v₃(64 − 1) + v₃(r) = 2 + v₃(r).

**Research field:** exponential Diophantine equations (lifting the exponent).
