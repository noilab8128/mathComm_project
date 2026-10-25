# Solution-path ladders v2 — batch 5 (P22–P26)

- Date: 2026-10-24
- Status: **checked, ready to import.** Built with [LADDER_RULES_v2.md](../LADDER_RULES_v2.md); levels set with
  [LEVEL_GUIDE.md](../LEVEL_GUIDE.md) (each ladder has an internal **Level check**). Challenge answers are AIME-format
  integers from 0 to 999.
- Answer check: `python3 ladders/v2/verify_v2_batch5.py`.
- Chosen to fill Skill Tree topics that had no ladders: Plane Figures, Polynomials, Factorization, Double Counting.
- Internal only: the `Idea card` lines name the sources. They are never shown on the site.

---

### Ladder P22 — Fence Posts

**Idea card:** SL2021-G3 (any polygon has area at most half the sum of the squared distances of its corners to a
fixed point O; adding over all polygons gives a bound that does not depend on the polygons, and squares centred at O
reach it).

**Setup:** A farm has fence posts at the points of a square grid, 1 metre apart: 2n rows of 2n posts. The farmer
builds n² four-sided pens: each pen is a quadrilateral whose four corners are posts, and every post is a corner of
exactly one pen. Pens may overlap. The total area is the sum of the areas of the n² pens. O is the centre of the grid.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | Triangle OAB has OA = 4 and OB = 6. What is the largest area it can have? | **12** |
| 2 | AMC 8 | A pen has corners at (3, 1), (−1, 3), (−3, −1) and (1, −3), with O = (0, 0). What is its area? | **20** |
| 3 | AMC 10 | Put O at (0, 0) so that a 6 × 6 grid of posts has coordinates ±1/2, ±3/2, ±5/2. What is the sum of the squared distances from O to all 36 posts? | **210** |
| 4 | AMC 10 | For a 4 × 4 grid of posts (16 posts, 4 pens), what is the largest possible total area? | **20** |
| **Challenge** | AIME | For a 10 × 10 grid of posts (100 posts, 25 pens), what is the largest possible total area? | **825** |

**Problem analysis** *(members only)*
- The pens can be placed in many ways, so measure every pen from one fixed point: the centre O of the grid.
- Cut a pen into the four triangles O A₁A₂, O A₂A₃, O A₃A₄, O A₄A₁. Triangle OAB has area at most ½ · OA · OB, which
  is at most ¼(OA² + OB²). Adding the four triangles: a pen's area is at most half the sum of the squared distances
  of its corners to O.
- Adding over all pens, the total area is at most half the sum of the squared distances of **all** posts to O. This
  number does not depend on how the pens are chosen.
- Equality needs every pen to be a square centred at O. Turning the grid a quarter turn about O moves each post to
  another post, and the four posts in each such group form exactly such a square.
- For 10 × 10 posts the squared distances add up to 1650, so the answer is 825.

**Logic flow** *(members only)*
1. **Measure from the centre (Step 1).** Area(OAB) = ½ · OA · OB · sin(angle) ≤ ½ · OA · OB ≤ ¼(OA² + OB²).
   *Why:* every pen becomes a sum of triangles with one corner at O.
2. **A square centred at O is best (Step 2).** Its area equals half the sum of the squared distances of its corners.
   *Why:* this is when every inequality is an equality.
3. **The bound does not depend on the pens (Step 3).** Add the squared distances of all posts to O.
   *Why:* the bound becomes one number for the whole grid.
4. **Bound and construction together (Step 4).** For the 4 × 4 grid the bound is 20, and quarter-turn squares reach it.
5. **Apply (Challenge).** For 10 × 10 posts: half of 1650 is 825.

**Our full solution**
Put O = (0, 0) at the centre, so the posts have coordinates x, y in {±1/2, ±3/2, …, ±9/2}. For any pen A₁A₂A₃A₄, its
area is at most the sum of the areas of the triangles OA₁A₂, OA₂A₃, OA₃A₄, OA₄A₁ (the shoelace formula from O, with
absolute values). Each triangle OAB has area ½ · OA · OB · sin(∠AOB) ≤ ½ · OA · OB ≤ ¼(OA² + OB²), because
(OA − OB)² ≥ 0. Each corner appears in two triangles, so area(pen) ≤ ½(OA₁² + OA₂² + OA₃² + OA₄²). Adding over all pens,
total area ≤ ½ Σ (x² + y²) over all 100 posts. Since x² takes the values 1/4, 9/4, 25/4, 49/4, 81/4 twice each,
Σ x² over one row is 165/2, and Σ (x² + y²) over all posts is 2 · 10 · 165/2 = 1650. So the total area is at most 825.
Equality: the quarter turn (x, y) → (−y, x) maps posts to posts and fixes no post, so the 100 posts split into 25
groups of four; each group is a square centred at O, for which every inequality above is an equality. So the
largest total area is **825**. Computer check: the bound for every grid up to 10 × 10, and a full search over all ways
to split the 4 × 4 grid into 4 pens.

**Short solutions**
- Step 1: the area is ½ · 4 · 6 · sin(angle), largest at a right angle: 12.
- Step 2: the side squared is 4² + 2² = 20, and the four sides and both diagonals show it is a square: area 20.
  (Half the sum of the squared distances is also ½ · 4 · 10 = 20.)
- Step 3: one row gives Σ x² = 2(1/4 + 9/4 + 25/4) = 35/2; all posts give 2 · 6 · 35/2 = 210.
- Step 4: the bound is half of Σ (x² + y²) = ½ · 2 · 4 · (2 · (1/4 + 9/4)) = 20, and the four quarter-turn squares
  reach it.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2021 G3 *(Strong)*: the same question for every grid size 2n × 2n. Our Challenge asks for one size
  in a new setting.

**Similar problems on our site**
- Ladder P20 "Sheets That Double": another best value found by a bound that does not depend on the choices, plus a
  matching construction.

**Explore** — *Status: not searched in the literature yet.*
For a rectangular grid of 4 × 6 posts (24 posts, 6 pens), what is the largest total area? The quarter turn no longer
maps the grid to itself.

**Proof problem** *(not graded)*
Prove that every triangle OAB has area at most ¼(OA² + OB²).
- Hint 1: write the area as ½ · OA · OB · sin(∠AOB).
- Solution: the area is at most ½ · OA · OB, and OA² + OB² − 2 · OA · OB = (OA − OB)² ≥ 0 gives
  ½ · OA · OB ≤ ¼(OA² + OB²).

**Hints**
- Step 1: The area is ½ · OA · OB · sin(angle AOB). When is the sine largest?
- Step 2: All four sides have the same length. Find the square of one side.
- Step 3: Add the x² parts and the y² parts separately; by symmetry they are equal.
- Step 4: Each pen has area at most half the sum of its corners' squared distances to the centre. Can every pen reach that?
- Challenge: Bound every pen by half the sum of the squared distances of its corners to the centre, then add over all pens.
- Challenge: A quarter turn about the centre groups the posts into squares centred there; each square reaches the bound.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: one area formula used once (like MATHCOUNTS 2026 State Target #2, an area with a circle).
- Step 2 — AMC 8: a tilted square by the Pythagorean theorem (AMC 8 #10–15 band).
- Step 3 — AMC 10: a symmetric sum of squares; routine but needs organisation (AMC 10 #11–15 band).
- Step 4 — AMC 10: a bound plus a construction on a small case (AMC 10 #16–20 band).
- Challenge — AIME: the key idea (one bound for all pens) plus a careful sum; like AIME #6–10.

**Research field:** discrete geometry (extremal problems for point sets).

---

### Ladder P23 — Three in a Row

**Idea card:** SL2010-A3 (pair the products x₂ᵢ₋₁x₂ᵢ₊₁ and x₂ᵢx₂ᵢ₊₂; the conditions give
x₂ᵢ₋₁, x₂ᵢ₊₂ ≤ 1 − x₂ᵢ − x₂ᵢ₊₁, so each pair is at most u(1 − u) ≤ 1/4).

**Setup:** Nonnegative numbers x₁, x₂, …, x₂₀₂₆ are written around a circle, so after x₂₀₂₆ come x₁, x₂ again. Any
three neighbours add up to at most 1. Let S be the sum of every number times the number two places after it:
S = x₁x₃ + x₂x₄ + … + x₂₀₂₅x₁ + x₂₀₂₆x₂.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | Eight numbers around a circle are 1/2, 0, 1/2, 0, 1/2, 0, 1/2, 0 (three neighbours never add up to more than 1). What is the sum of every number times the number two places after it? | **1** |
| 2 | AMC 10 | Numbers a, b, c, d ≥ 0 satisfy a + b + c ≤ 1, b + c + d ≤ 1 and b + c = 2/5. What is the largest possible value of ac + bd? Give your answer as a fraction. | **6/25** |
| 3 | AMC 10 | Numbers a, b, c, d ≥ 0 satisfy a + b + c ≤ 1 and b + c + d ≤ 1. What is the largest possible value of ac + bd? Give your answer as a fraction. | **1/4** |
| 4 | AMC 10 | Six nonnegative numbers are around a circle, any three neighbours adding up to at most 1. What is the largest possible sum of every number times the number two places after it? Give your answer as a fraction. | **3/4** |
| **Challenge** | AIME | The largest possible value of S (for the 2026 numbers of the setup) is a fraction m/n in lowest terms. Find m + n. | **1017** |

**Problem analysis** *(members only)*
- An example comes first: alternating 1/2 and 0 makes half of the products 1/4 and the other half 0, so S = 2026/8.
- To prove nothing is better, group the 2026 products into 1013 pairs: x₂ᵢ₋₁x₂ᵢ₊₁ together with x₂ᵢx₂ᵢ₊₂.
- In one pair, the two "outer" numbers x₂ᵢ₋₁ and x₂ᵢ₊₂ are each at most 1 − u, where u = x₂ᵢ + x₂ᵢ₊₁ (three
  neighbours add up to at most 1). So the pair is at most (1 − u)u ≤ 1/4.
- Adding the 1013 pairs gives S ≤ 1013/4, which the example reaches.
- An odd number of numbers would break the pairing; that case is the Explore question.

**Logic flow** *(members only)*
1. **An example (Step 1).** Alternating 1/2, 0 gives S = (number of terms)/8. *Why:* it shows the target.
2. **One pair, fixed middle (Step 2).** With u = b + c fixed, ac + bd ≤ (1 − u)(b + c) = u(1 − u).
   *Why:* the outer numbers are limited by the middle ones.
3. **One pair, any middle (Step 3).** u(1 − u) ≤ 1/4. *Why:* this is the bound for a pair.
4. **A small circle (Step 4).** Six numbers give three pairs: at most 3/4, reached by the example.
5. **Apply (Challenge).** 1013 pairs: S ≤ 1013/4, reached; m + n = 1013 + 4 = 1017.

**Our full solution**
Example: x₁ = x₃ = … = x₂₀₂₅ = 1/2 and the other numbers 0. Any three neighbours contain at most two numbers equal to
1/2, so they add up to at most 1, and S = 1013 · (1/2)(1/2) = 1013/4. Bound: for i = 1, …, 1013 put
u = x₂ᵢ + x₂ᵢ₊₁ (indices around the circle). The conditions on (x₂ᵢ₋₁, x₂ᵢ, x₂ᵢ₊₁) and (x₂ᵢ, x₂ᵢ₊₁, x₂ᵢ₊₂) give
x₂ᵢ₋₁ ≤ 1 − u and x₂ᵢ₊₂ ≤ 1 − u. Hence x₂ᵢ₋₁x₂ᵢ₊₁ + x₂ᵢx₂ᵢ₊₂ ≤ (1 − u)x₂ᵢ₊₁ + x₂ᵢ(1 − u) = u(1 − u) ≤ 1/4. The 1013 pairs
use each of the 2026 products exactly once, so S ≤ 1013/4. The largest value is 1013/4, already in lowest terms, so
m + n = **1017**. Computer check: a random search on circles of 6, 8 and 10 numbers never exceeds (number)/8 and comes
within 1% of it.

**Short solutions**
- Step 1: the four products (1/2)(1/2) give 1; the others are 0.
- Step 2: a ≤ 3/5 and d ≤ 3/5, so ac + bd ≤ (3/5)(c + b) = 6/25, reached with a = d = 3/5.
- Step 3: with u = b + c, ac + bd ≤ u(1 − u) ≤ 1/4, reached with u = 1/2 and a = d = 1/2.
- Step 4: three pairs of at most 1/4 each: 3/4, reached by 1/2, 0, 1/2, 0, 1/2, 0.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2010 A3 *(Strong)*: the same condition for 100 numbers. Our Challenge uses 2026 numbers and asks for
  m + n.

**Similar problems on our site**
- Ladder P20 "Sheets That Double": another upper bound shown by grouping terms, with an example that reaches it.

**Explore** — *Status: not searched in the literature yet.*
What is the largest possible S for 5 numbers around a circle? For 7? The pairing no longer works.

**Proof problem** *(not graded)*
Prove that u(1 − u) ≤ 1/4 for every real number u.
- Hint 1: complete the square.
- Solution: 1/4 − u(1 − u) = u² − u + 1/4 = (u − 1/2)² ≥ 0.

**Hints**
- Step 1: Only every second product is nonzero.
- Step 2: The conditions give a ≤ 1 − (b + c) and d ≤ 1 − (b + c).
- Step 3: Put u = b + c and find the largest value of u(1 − u).
- Step 4: Split the six products into three pairs, each like the expression in Step 3.
- Challenge: Pair x₂ᵢ₋₁x₂ᵢ₊₁ with x₂ᵢx₂ᵢ₊₂; each pair is at most 1/4.
- Challenge: The alternating pattern 1/2, 0, 1/2, 0, … reaches the bound.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: direct computation from a given pattern.
- Step 2 — AMC 10: two inequalities combined with a fixed sum (AMC 10 #11–15 band).
- Step 3 — AMC 10: the maximum of a quadratic, after Step 2's reduction (AMC 10 #11–15).
- Step 4 — AMC 10: the pairing idea on a small case (AMC 10 #16–20).
- Challenge — AIME: the pairing argument on a large circle plus the matching example; like AIME #6–10.

**Research field:** inequalities and quadratic optimisation.

---

### Ladder P24 — Power Sums

**Idea card:** SL2020-A2 (with p = x + y + z, q = xy + yz + zx, r = xyz, every number satisfies
t³ = pt² − qt + r, so higher powers reduce to lower ones; this is how symmetric expressions are rewritten).

**Setup:** Three numbers x, y, z (they may be complex) satisfy x + y + z = 3, x² + y² + z² = 5 and x³ + y³ + z³ = 12.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is xy + yz + zx? | **2** |
| 2 | AMC 10 | What is xyz? | **1** |
| 3 | AMC 10 | What is x⁴ + y⁴ + z⁴? | **29** |
| **Challenge** | AIME | What is x⁸ + y⁸ + z⁸? | **853** |

**Problem analysis** *(members only)*
- The numbers themselves are awkward (the cubic below has one real root near 2.32 and two complex roots), but every
  symmetric expression in them is a whole number.
- The three given sums determine p = x + y + z, q = xy + yz + zx and r = xyz.
- Then x, y, z are the roots of t³ − 3t² + 2t − 1 = 0, so each of them satisfies t³ = 3t² − 2t + 1.
- Multiplying by tⁿ and adding over x, y, z gives a recursion for sₙ = xⁿ + yⁿ + zⁿ:
  sₙ₊₃ = 3sₙ₊₂ − 2sₙ₊₁ + sₙ.
- Starting from s₀ = 3, s₁ = 3, s₂ = 5 the recursion gives 12, 29, 68, 158, 367, 853.

**Logic flow** *(members only)*
1. **Second symmetric sum (Step 1).** (x + y + z)² = x² + y² + z² + 2(xy + yz + zx) gives q = 2.
2. **Third symmetric sum (Step 2).** x³ + y³ + z³ − 3xyz = (x + y + z)(x² + y² + z² − xy − yz − zx) gives r = 1.
   *Why:* with p, q, r the cubic with roots x, y, z is known.
3. **Reduce powers (Step 3).** t³ = 3t² − 2t + 1 gives sₙ₊₃ = 3sₙ₊₂ − 2sₙ₊₁ + sₙ; first s₄ = 29.
4. **Run the recursion (Challenge).** s₅ = 68, s₆ = 158, s₇ = 367, s₈ = 853.

**Our full solution**
From 9 = (x + y + z)² = 5 + 2(xy + yz + zx) we get q = 2. From 12 − 3xyz = 3(5 − 2) we get r = xyz = 1. So x, y, z
are the roots of t³ − 3t² + 2t − 1 = 0 (Vieta), and each satisfies t³ = 3t² − 2t + 1. Multiplying by tⁿ and adding
over the three roots gives sₙ₊₃ = 3sₙ₊₂ − 2sₙ₊₁ + sₙ with s₀ = 3, s₁ = 3, s₂ = 5. Then s₃ = 15 − 6 + 3 = 12 (as given),
s₄ = 36 − 10 + 3 = 29, s₅ = 87 − 24 + 5 = 68, s₆ = 204 − 58 + 12 = 158, s₇ = 474 − 136 + 29 = 367,
s₈ = 1101 − 316 + 68 = **853**. Computer check: the roots computed numerically give the same power sums.

**Short solutions**
- Step 1: 9 = 5 + 2(xy + yz + zx), so xy + yz + zx = 2.
- Step 2: 12 − 3xyz = 3 · (5 − 2) = 9, so xyz = 1.
- Step 3: s₄ = 3s₃ − 2s₂ + s₁ = 36 − 10 + 3 = 29.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2020 A2 *(Related)*: uses t³ = pt² − qt + r to show which monomials can be written with p, q, r.
  Our Challenge uses the same reduction to compute a power sum.

**Similar problems on our site**
- Ladder P19 "Coins of Powers of Two": another answer reached by running a recursion.

**Explore** — *Status: not searched in the literature yet.*
Which of s₁, s₂, …, s₃₀ are divisible by 7? Is there a pattern?

**Proof problem** *(not graded)*
Prove that x³ + y³ + z³ − 3xyz = (x + y + z)(x² + y² + z² − xy − yz − zx).
- Hint 1: expand the right-hand side.
- Solution: expanding, the terms x²y, xy², … cancel in pairs and −xyz appears three times, leaving x³ + y³ + z³ − 3xyz.

**Hints**
- Step 1: Square x + y + z.
- Step 2: Use x³ + y³ + z³ − 3xyz = (x + y + z)(x² + y² + z² − xy − yz − zx).
- Step 3: Each of x, y, z is a root of t³ − 3t² + 2t − 1 = 0, so t⁴ = 3t³ − 2t² + t. Add over x, y, z.
- Challenge: sₙ₊₃ = 3sₙ₊₂ − 2sₙ₊₁ + sₙ for every n ≥ 0.
- Challenge: Continue the recursion from s₂, s₃, s₄ up to s₈.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: one algebraic identity (MATHCOUNTS State Sprint band).
- Step 2 — AMC 10: a known factorisation used to find xyz (AMC 10 #11–15).
- Step 3 — AMC 10: Vieta plus reducing a power with the cubic (AMC 10 #16–20; compare AMC 10A 2025 #7, a cubic
  and its remainders).
- Challenge — AIME: the recursion run carefully to the 8th power; like AIME #1–5.

**Research field:** symmetric polynomials (Newton's identities).

---

### Ladder P25 — The Cyclic Factor

**Idea card:** SL2006-A6 (the cyclic expression ab(a² − b²) + bc(b² − c²) + ca(c² − a²) vanishes when a = b,
b = c or a + b + c = 0, so it factors as (a − b)(b − c)(a − c)(a + b + c); after factoring, everything is about the
factors).

**Setup:** For whole numbers a, b, c let E(a, b, c) = ab(a² − b²) + bc(b² − c²) + ca(c² − a²).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is E(1, 2, 3)? | **-12** |
| 2 | AMC 10 | With b = 2 and c = 5, E is a cubic in a with roots a = 2 and a = 5. What is its third root? | **-7** |
| 3 | AMC 10 | How many triples 1 ≤ a < b < c ≤ 21 contain two numbers that leave the same remainder when divided by 7? | **385** |
| 4 | AMC 10 | How many triples 1 ≤ a < b < c ≤ 21 have a + b + c divisible by 7? | **190** |
| **Challenge** | AIME | How many triples 1 ≤ a < b < c ≤ 21 make E(a, b, c) divisible by 7? | **520** |

**Problem analysis** *(members only)*
- E is zero whenever two of a, b, c are equal, so (a − b), (b − c) and (a − c) are factors. E has degree 4, so one
  more linear factor is missing; trying values shows it is a + b + c:
  E(a, b, c) = (a − b)(b − c)(a − c)(a + b + c).
- 7 is prime, so 7 divides E exactly when it divides one of the four factors: two of the numbers leave the same
  remainder, or a + b + c is divisible by 7.
- From 1 to 21 every remainder appears exactly 3 times, which makes both counts clean.
- Inclusion–exclusion: (equal remainders) + (sum divisible by 7) − (both) = 385 + 190 − 55 = 520.

**Logic flow** *(members only)*
1. **Get a feel (Step 1).** E(1, 2, 3) = −12. *Why:* a value to test any factorisation against.
2. **Find the factors (Step 2).** For fixed b, c the roots in a are b, c and −b − c, so
   E = (a − b)(b − c)(a − c)(a + b + c). *Why:* divisibility is easy for a product.
3. **Equal remainders (Step 3).** Count the complement: all three remainders different: C(7, 3) · 3³ = 945.
4. **The sum (Step 4).** Adding 1 to every number (with 21 → 1) moves the sum's remainder by 3, so the 7 remainders are
   equally common: 1330/7 = 190.
5. **Inclusion–exclusion (Challenge).** Subtract the 55 triples counted twice: 520.

**Our full solution**
As a polynomial in a, E has degree 3 with leading coefficient b − c, and it vanishes at a = b, a = c and
a = −b − c (substitute). So E(a, b, c) = (b − c)(a − b)(a − c)(a + b + c); for example E(1, 2, 3) = (−1)(−1)(−2)(6) = −12. Since 7 is prime, 7 | E
exactly when 7 divides a − b, b − c, a − c or a + b + c. Among the C(21, 3) = 1330 triples, those with three different
remainders mod 7 number C(7, 3) · 3³ = 945, so 385 have two equal remainders. The map n → n + 1 (with 21 → 1) changes
every number by 1 modulo 7, so it maps the triples with sum ≡ s to those with sum ≡ s + 3 (mod 7); repeating the shift reaches every
remainder, so every remainder of the sum occurs 1330/7 = 190 times. Triples in both groups: all three remainders 0 (the triple 7,
14, 21): 1; exactly two equal remainders r ≠ 0 and a third remainder −2r ≠ r: 6 · 3 · 3 = 54. So 55 triples are in
both, and the answer is 385 + 190 − 55 = **520**. Computer check: E computed for all 1330 triples.

**Short solutions**
- Step 1: 1 · 2 · (1 − 4) + 2 · 3 · (4 − 9) + 3 · 1 · (9 − 1) = −6 − 30 + 24 = −12.
- Step 2: E = (a − b)(b − c)(a − c)(a + b + c), so the third root makes a + 2 + 5 = 0: a = −7.
- Step 3: 1330 − C(7, 3) · 27 = 1330 − 945 = 385.
- Step 4: the sum's remainder is equally likely to be each of 0, …, 6: 1330/7 = 190.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2006 A6 *(Related)*: factors the same expression and then bounds it against (a² + b² + c²)². Our
  Challenge uses the factorisation for divisibility instead.

**Similar problems on our site**
- Ladder P8 "Divisors That Leave 1": another count organised by remainders.

**Explore** — *Status: not searched in the literature yet.*
How many triples 1 ≤ a < b < c ≤ 21 make E(a, b, c) divisible by 49?

**Proof problem** *(not graded)*
Prove that E(a, b, c) = (a − b)(b − c)(a − c)(a + b + c).
- Hint 1: show the right-hand side and E agree when a = b, when a = c and when a = −b − c, then compare one coefficient.
- Solution: as a polynomial in a, E has degree 3 with leading coefficient b − c (from a³b − a³c), and it vanishes at
  a = b, a = c and a = −b − c (check by substitution). A cubic is fixed by its leading coefficient and its three roots,
  so E = (b − c)(a − b)(a − c)(a + b + c).

**Hints**
- Step 1: Work out the three products one at a time.
- Step 2: E is 0 when a = b or a = c. Which value of a makes a + b + c = 0?
- Step 3: Count the complement: triples whose three remainders mod 7 are all different. Each remainder appears 3 times from 1 to 21.
- Step 4: Adding 1 to every number (with 21 becoming 1) changes the sum's remainder by 3. What does that say about the 7 possible remainders?
- Challenge: 7 is prime, so it divides the product (a − b)(b − c)(a − c)(a + b + c) exactly when it divides one of the factors.
- Challenge: Use inclusion–exclusion: count the triples that are in both groups of Steps 3 and 4.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: direct substitution.
- Step 2 — AMC 10: roots of a polynomial and a factor found by substitution (compare AMC 10A 2025 #7).
- Step 3 — AMC 10: complement counting with remainders (compare AMC 10A 2025 #12, counting with conditions).
- Step 4 — AMC 10: a symmetry (shift) argument for equal counts (AMC 10 #16–20).
- Challenge — AIME: factorisation + primality + inclusion–exclusion; like AIME #4–8.

**Research field:** polynomial factorisation and counting modulo a prime.

---

### Ladder P26 — Red Corners

**Idea card:** SL2012-C3 (count the triples by their red middle cell: a red cell with a white cells in its row and b in
its column is the middle of ab triples; ab ≤ (a² + b²)/2 splits the count into rows and columns, and (n − x)x² is
largest at x ≈ 2n/3).

**Setup:** Each cell of an n × n board is painted red or white. A **red corner** is a triple of cells (C₁, C₂, C₃)
such that C₁ and C₂ are in the same row, C₂ and C₃ are in the same column, C₂ is red, and C₁ and C₃ are white.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | On a 4 × 4 board the red cells are exactly the 4 cells of one diagonal. How many red corners are there? | **36** |
| 2 | AMC 8 | For a whole number x from 0 to 6, what is the largest value of (6 − x) · x²? | **32** |
| 3 | AMC 10 | What is the largest possible number of red corners on a 6 × 6 board? | **192** |
| **Challenge** | AIME | What is the largest possible number of red corners on an 8 × 8 board? | **600** |

**Problem analysis** *(members only)*
- Count red corners by their middle cell: a red cell with a white cells in its row and b white cells in its column is
  the middle of exactly a · b red corners.
- a · b ≤ (a² + b²)/2 separates rows from columns. A row with x white cells has n − x red cells, each contributing at
  most x²/2 from the row side: (n − x)x²/2 per row. The same holds for columns.
- So the number of red corners is at most n · max (n − x)x², where x runs over whole numbers 0, …, n.
- For n = 8: x = 5 gives 3 · 25 = 75 (x = 6 gives 72), so the bound is 8 · 75 = 600.
- Equality needs a = b for every red cell, all equal to 5: 5 white cells in every row and every column. A cyclic
  pattern does it.

**Logic flow** *(members only)*
1. **Count by the middle cell (Step 1).** Each red cell gives (white in its row) × (white in its column).
   *Why:* the count becomes a sum over red cells.
2. **Rows and columns separately (Step 2).** ab ≤ (a² + b²)/2, so each row contributes at most (n − x)x²/2; for n = 6
   the largest value of (6 − x)x² is 32. *Why:* now each row and each column can be maximised on its own.
3. **Bound and construction (Step 3).** For 6 × 6: at most 6 · 32 = 192, reached with 4 white cells in every row and
   column. *Why:* the bound is exact when it can be met with equal a and b.
4. **Apply (Challenge).** For 8 × 8 the best whole number is x = 5 (75 > 72), so the answer is 8 · 75 = 600.

**Our full solution**
Let aᵢ be the number of white cells in row i and bⱼ the number in column j. A red cell (i, j) is the middle of aᵢbⱼ
red corners, and aᵢbⱼ ≤ (aᵢ² + bⱼ²)/2. Row i has 8 − aᵢ red cells, so adding over all red cells, the total is at most
½ Σᵢ (8 − aᵢ)aᵢ² + ½ Σⱼ (8 − bⱼ)bⱼ². For whole numbers x from 0 to 8, (8 − x)x² takes the values 0, 7, 24, 45, 64, 75,
72, 49, 0, so it is at most 75, and the total is at most ½ · 8 · 75 + ½ · 8 · 75 = 600. Paint cell (i, j) red when
j − i leaves remainder 0, 1 or 2 when divided by 8: every row and every column then has 3 red and 5 white cells, and
the 24 red cells each give 5 · 5 = 25, so the total is 600. The answer is **600**. Computer check: every colouring of
the 3 × 3 and 4 × 4 boards, and the construction for 6 × 6 and 8 × 8.

**Short solutions**
- Step 1: each red cell has 3 white cells in its row and 3 in its column: 4 · 9 = 36.
- Step 2: the values for x = 0, …, 6 are 0, 5, 16, 27, 32, 25, 0: the largest is 32 (x = 4).
- Step 3: the bound is ½ · 6 · 32 + ½ · 6 · 32 = 192, reached with 2 red cells (j − i ≡ 0, 1 mod 6) in every row and
  column: 12 red cells, each giving 4 · 4 = 16.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2012 C3 *(Strong)*: the same count on a 999 × 999 board, where 2n/3 is a whole number. Our Challenge
  uses a board where the best number of white cells must be found among whole numbers.

**Similar problems on our site**
- Ladder P15 "Equal Divisor Counts": another count where splitting into independent parts makes the bound exact.

**Explore** — *Status: not searched in the literature yet.*
How many different colourings of the 6 × 6 board reach 192 red corners?

**Proof problem** *(not graded)*
Prove that ab ≤ (a² + b²)/2 for all real numbers a and b.
- Hint 1: move everything to one side.
- Solution: (a² + b²)/2 − ab = (a − b)²/2 ≥ 0.

**Hints**
- Step 1: Each red cell sees 3 white cells in its row and 3 in its column.
- Step 2: Try every whole number x from 0 to 6.
- Step 3: A red cell with a white cells in its row and b in its column is the middle of a · b red corners, and a · b ≤ (a² + b²)/2. Then find a colouring with 4 white cells in every row and column.
- Challenge: The total is at most ½ Σ over rows of (8 − a)a² plus the same over columns. Which whole number x makes (8 − x)x² largest?
- Challenge: A colouring with exactly 5 white cells in every row and every column reaches the bound.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: a direct count with one product (compare Kangaroo Kadett 2025 #11, a grid count, one band up).
- Step 2 — AMC 8: a small table of values (AMC 8 #10–15).
- Step 3 — AMC 10: double counting, an inequality and a construction (AMC 10 #21–25; compare AMC 10A 2025 #21,
  an extremal count with a construction).
- Challenge — AIME: the same method with an integer optimisation step; like AIME #6–9.

**Research field:** extremal combinatorics (double counting).
