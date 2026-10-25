# Solution-path ladders v2 — batch 7 (P32–P36)

- Date: 2026-10-24
- Status: **checked, ready to import.** Built with [LADDER_RULES_v2.md](../LADDER_RULES_v2.md); levels set with
  [LEVEL_GUIDE.md](../LEVEL_GUIDE.md). Challenge answers are AIME-format integers from 0 to 999.
- Answer check: `python3 ladders/v2/verify_v2_batch7.py`.
- Chosen to fill Skill Tree topics that had no ladders: Games and Strategies, Basic Laws of Probability, Trees.
- Internal only: the `Idea card` lines name the sources. They are never shown on the site.

---

### Ladder P32 — Knights and Queens

**Idea card:** SL2018-C2 (knights on squares of one colour never attack each other, which guarantees half of those
squares; the 4 × 4 block splits into four knight-move cycles of length 4, and answering each knight with a queen on
the opposite square of its cycle limits every cycle to one knight).

**Setup:** Horst and Queenie take turns on a board, Horst first. Horst puts a knight on an empty square where it does
not attack any knight already on the board. Queenie puts a queen on any empty square. When a player cannot move, the
game ends. K is the largest number of knights Horst can be sure to place, however Queenie plays. (Squares are
coloured black and white like a chessboard; a knight always moves to a square of the other colour.)

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | On an 8 × 8 board Horst uses only black squares; each turn uses at most one black square for him and one for Queenie. How many knights can he be sure to place this way? | **16** |
| 2 | AMC 8 | On a 4 × 4 board, the knight moves split the 16 squares into cycles of four squares (each square attacks its two neighbours in its cycle). How many cycles are there? | **4** |
| 3 | AMC 10 | What is K for a 12 × 16 board? | **48** |
| **Challenge** | AIME | The board is 28 × 28 with the four 4 × 4 blocks in its corners removed (720 squares remain). What is K? | **180** |

**Problem analysis** *(members only)*
- Horst's side: knights on the same colour can never attack each other. If he only uses black squares, every round
  uses at most two black squares, so he places at least half of them.
- Queenie's side: cut the board into 4 × 4 blocks. In each block the knight moves form four cycles of four squares.
  When Horst plays a square, Queenie plays the square opposite it in the same cycle; the other two squares of that
  cycle are attacked by the knight. So every cycle holds at most one knight.
- The two bounds meet: K = (number of squares)/4 when the board is made of 4 × 4 blocks.
- The cut-off board is 45 blocks of 4 × 4 with 360 black squares: K = 180.

**Logic flow** *(members only)*
1. **Horst's lower bound (Step 1).** Black squares only: 32 black squares give at least 16 knights.
   *Why:* one colour is safe for knights.
2. **The cycles (Step 2).** A 4 × 4 block is exactly four knight-move 4-cycles. *Why:* this is Queenie's tool.
3. **Both bounds on a full board (Step 3).** 12 × 16: Horst gets 96/2 = 48, and Queenie's 48 cycles allow at most 48.
4. **Apply (Challenge).** 45 blocks: 360 black squares and 180 cycles: K = 180.

**Our full solution**
The board consists of 49 − 4 = 45 blocks of 4 × 4 (720 squares, 360 of each colour). *Horst can place 180.* He always
puts his knight on an empty black square; knights on black squares never attack each other because a knight move
changes colour. After he has placed t knights, at most t queens are on the board, so at most 2t black squares are
used; while t < 180 an empty black square remains, so he places at least 180. *Queenie can stop him at 180.* Each
4 × 4 block splits into four knight-move cycles s → t → u → v → s (exactly one such split exists). Whenever Horst puts a
knight on s, Queenie puts her queen on the opposite square u of the same cycle. That square is empty: a queen sits on
a cycle square only opposite an earlier knight, and an earlier knight in this cycle would attack s or have forced a
queen on s. The squares t and v are attacked by the new knight, so the cycle never gets a second knight, and there
are 45 · 4 = 180 cycles. So K = **180**. Computer check: the knight graph of a 4 × 4 block and its unique split into
four 4-cycles, and the colour count of the cut board.

**Short solutions**
- Step 1: 32 black squares; at most two are used per round: 16.
- Step 2: each of the four corner squares has only two knight moves; following moves splits the block into 4 cycles.
- Step 3: Horst gets half of the 96 black squares (48), and the board is 12 blocks with 4 cycles each (48 cycles).
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2018 C2 (IMO 2018 Problem 4) *(Strong)*: the same game on a 20 × 20 board. Our Challenge uses a board
  with its corners cut off.

**Similar problems on our site**
- Ladder P17 "Heads Up": another board problem settled by a colouring.

**Explore** — *Status: not searched in the literature yet.*
What is K on a 6 × 6 board, where 4 × 4 blocks do not fit?

**Proof problem** *(not graded)*
Prove that a knight on a black square only attacks white squares.
- Hint 1: a knight move changes one coordinate by 1 and the other by 2.
- Solution: the colour of square (r, c) is decided by the parity of r + c, and a knight move changes r + c by 1 + 2 = 3
  or by 1 − 2 = −1, both odd, so the colour always changes.

**Hints**
- Step 1: Knights on black squares can never attack each other. Each round uses at most two black squares.
- Step 2: Start from a corner square: it has only two knight moves. Follow the moves around.
- Step 3: Horst gets half of the black squares; Queenie answers each knight inside its 4 × 4 block.
- Challenge: Count the 4 × 4 blocks of the cut board, then use Horst's black-square plan for the lower bound.
- Challenge: Queenie answers every knight with a queen on the opposite square of its knight cycle, so each cycle holds at most one knight.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: a colour count and halving (compare Kangaroo Kadett 2025 #28, a board-filling puzzle, one band up).
- Step 2 — AMC 8: tracing knight moves on a small board.
- Step 3 — AMC 10: two strategies that meet (AMC 10 #21–25 style reasoning on a known board).
- Challenge — AIME: adapting both strategies to a new board; like AIME #5–8.

**Research field:** combinatorial games (strategy-stealing and pairing strategies).

---

### Ladder P33 — Red Hulls

**Idea card:** SL2006-C3 (the hull of a random set of chosen points is the polygon P exactly when the corners of P are
chosen and the points outside P are not; the points inside are free, so the probability is x^(corners) (1 − x)^(outside),
and these probabilities add up to 1).

**Setup:** Six points are given: the five corners of a regular pentagon and its centre O (no three on a line). Each
point is painted red with probability 2/3, independently. The **red hull** is the smallest convex polygon containing
all red points.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | Three points form a triangle, and each is red with probability 1/2. Add up x^a (1 − x)^b over the empty set, the 3 single points, the 3 segments and the triangle, where a is the number of corners and b the number of points outside, with x = 1/2. | **1** |
| 2 | AMC 8 | How many of the 10 triangles with three pentagon corners contain the centre O? | **5** |
| 3 | AMC 10 | What is the probability that the red hull is exactly the triangle formed by three given pentagon corners that contain O? Give your answer as a fraction. | **8/243** |
| 4 | AMC 10 | What is the probability that the red hull is exactly the triangle formed by O and two given pentagon corners? Give your answer as a fraction. | **8/729** |
| **Challenge** | AIME | The probability that the red hull is a triangle is a fraction m/n in lowest terms. Find m + n. | **323** |

**Problem analysis** *(members only)*
- The red hull is a given polygon P exactly when every corner of P is red and every point outside P is not red; the
  points inside P can be anything. So P(hull = P) = x^(number of corners) · (1 − x)^(number of points outside).
- Adding these over all possible hulls (including the empty set, single points and segments) gives exactly 1, because
  every set of red points has exactly one hull.
- A triangle hull has three types here: three pentagon corners around O (O inside, two corners outside), three
  pentagon corners not around O (three points outside), and O with two corners (three corners outside).
- With x = 2/3: 5 · (2/3)³(1/3)² + 5 · (2/3)³(1/3)³ + 10 · (2/3)³(1/3)³ = 80/243.

**Logic flow** *(members only)*
1. **Probabilities of hulls add to 1 (Step 1).** For a triangle alone the eight terms add up to 1.
   *Why:* it shows the formula x^a (1 − x)^b is the probability of each hull.
2. **Which triangles contain O (Step 2).** 5 of the 10 corner triangles contain the centre. *Why:* for those, O is a
   free inside point.
3. **One triangle with O inside (Step 3).** (2/3)³ · (1/3)² = 8/243.
4. **One triangle with O as a corner (Step 4).** (2/3)³ · (1/3)³ = 8/729.
5. **Add all triangles (Challenge).** 5 · 8/243 + 15 · 8/729 = 240/729 = 80/243; m + n = 323.

**Our full solution**
For a convex polygon P with corners among the six points, the red hull equals P exactly when the corners of P are red
and the points outside P are not red; points inside P do not matter. So P(hull = P) = (2/3)^a (1/3)^b, a = number of
corners, b = number of points outside. The 20 triangles split into: 5 triangles of three pentagon corners that contain
O (b = 2), 5 that do not contain O (b = 3), and 10 with O as a corner (b = 3, the other three pentagon corners are
outside). So P(hull is a triangle) = 5 · (8/27)(1/9) + 15 · (8/27)(1/27) = 120/729 + 120/729 = 240/729 = 80/243, and
m + n = **323**. Computer check: all 64 colourings with their probabilities and hulls.

**Short solutions**
- Step 1: (1/2)³ · 1 + 3 · (1/2)(1/2)² + 3 · (1/2)²(1/2) + (1/2)³ = 1/8 + 3/8 + 3/8 + 1/8 = 1.
- Step 2: a triangle of three corners contains O unless its three corners lie within two neighbouring sides (5 such),
  so 10 − 5 = 5.
- Step 3: three corners red, the two other corners not red, O free: (2/3)³(1/3)² = 8/243.
- Step 4: O and two corners red, the other three corners not red: (2/3)³(1/3)³ = 8/729.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2006 C3 *(Related)*: proves that the sum of x^a (1 − x)^b over all convex polygons is 1 for any point
  set. Our Challenge uses one term type of that sum as a probability.

**Similar problems on our site**
- Ladder P29 "Sorting Letters": another probability computed by sorting outcomes into types.

**Explore** — *Status: not searched in the literature yet.*
For the six points with red probability x, which x makes "the red hull is a triangle" most likely?

**Proof problem** *(not graded)*
Prove that for any finite set of points, no three on a line, the probabilities P(hull = P) over all possible hulls P
(including the empty set) add up to 1.
- Hint 1: every set of red points has exactly one hull.
- Solution: the events "hull = P" for different P are disjoint and one of them always happens, so their probabilities
  add up to 1.

**Hints**
- Step 1: Each of the eight sets has probability (1/2)³; there are eight sets.
- Step 2: Which corner triangles have all three corners on one side of a line through O?
- Step 3: The three corners must be red, the two other corners must not, and O can be anything.
- Step 4: O and the two corners must be red; the other three corners must not.
- Challenge: The hull is the polygon P exactly when its corners are red and the points outside it are not; points inside are free.
- Challenge: Sort the 20 triangles by how many points lie outside them.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: probabilities of independent events (MATHCOUNTS State Target #4 band, a probability with cards and dice).
- Step 2 — AMC 8: a small geometric count.
- Step 3 — AMC 10: one event made of independent conditions (AMC 10 #11–15).
- Step 4 — AMC 10: same with a different shape.
- Challenge — AIME: the hull characterisation plus a sorted count; like AIME #4–7 (compare AIME 2026 I #9, a
  probability with structure).

**Research field:** geometric probability (random convex hulls).

---

### Ladder P34 — Shifted Fractions

**Idea card:** SL2008-A2 (with a = x/(x − 1) and so on, the condition xyz = 1 becomes a + b + c − 1 = ab + bc + ca, so
a² + b² + c² = (a + b + c − 1)² + 1).

**Setup:** Real numbers x, y, z, none equal to 1, satisfy xyz = 1. Let a = x/(x − 1), b = y/(y − 1), c = z/(z − 1).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | If a = 3, what is x? Give your answer as a fraction. | **3/2** |
| 2 | AMC 8 | For x = 2, y = 3, z = 1/6, what is a² + b² + c²? Give your answer as a fraction. | **629/100** |
| 3 | AMC 10 | The condition xyz = 1 turns into a + b + c − 1 = ab + bc + ca. If a + b + c = 5/2, what is ab + bc + ca? Give your answer as a fraction. | **3/2** |
| **Challenge** | AIME | Suppose a + b + c = 19/2. Then a² + b² + c² is a fraction m/n in lowest terms. Find m + n. | **297** |

**Problem analysis** *(members only)*
- a = x/(x − 1) can be solved for x: x = a/(a − 1). So any statement about x, y, z can be moved to a, b, c.
- xyz = 1 becomes abc = (a − 1)(b − 1)(c − 1); expanding, abc cancels and leaves a + b + c − 1 = ab + bc + ca.
- Then a² + b² + c² = (a + b + c)² − 2(ab + bc + ca) = s² − 2(s − 1) = (s − 1)² + 1, where s = a + b + c.
- For s = 19/2: (17/2)² + 1 = 293/4. Real x, y, z with these values exist.

**Logic flow** *(members only)*
1. **Invert the substitution (Step 1).** x = a/(a − 1): a = 3 gives x = 3/2.
2. **Try an example (Step 2).** a = 2, b = 3/2, c = −1/5: a² + b² + c² = 629/100. *Why:* a value to test identities.
3. **Translate the condition (Step 3).** xyz = 1 ⇔ a + b + c − 1 = ab + bc + ca. *Why:* it ties the two symmetric sums.
4. **Apply (Challenge).** a² + b² + c² = (s − 1)² + 1 = 293/4; m + n = 297.

**Our full solution**
From a = x/(x − 1) we get x = a/(a − 1), and similarly for y, z (a, b, c ≠ 1). Then xyz = 1 means
abc = (a − 1)(b − 1)(c − 1) = abc − (ab + bc + ca) + (a + b + c) − 1, i.e. ab + bc + ca = a + b + c − 1. With
s = a + b + c = 19/2: ab + bc + ca = 17/2 and a² + b² + c² = s² − 2(s − 1) = 361/4 − 17 = 293/4. Such numbers exist: for
example a = b = (38 + √1036)/12 and c = 19/2 − 2a satisfy both symmetric conditions and none equals 1, and
x = a/(a − 1) etc. then satisfy xyz = 1. So m + n = 293 + 4 = **297**. Computer check: the identity on random
triples with xyz = 1, and the example triple.

**Short solutions**
- Step 1: a(x − 1) = x gives x = a/(a − 1) = 3/2.
- Step 2: a = 2, b = 3/2, c = (1/6)/(−5/6) = −1/5: 4 + 9/4 + 1/25 = 629/100.
- Step 3: ab + bc + ca = 5/2 − 1 = 3/2.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2008 A2 (IMO 2008 Problem 2) *(Strong)*: proves a² + b² + c² ≥ 1 with the same substitution and shows
  equality happens for infinitely many rational triples. Our Challenge fixes a + b + c.

**Similar problems on our site**
- Ladder P24 "Power Sums": another problem solved with symmetric sums.

**Explore** — *Status: not searched in the literature yet.*
Which values can a + b + c take at all when x, y, z are real?

**Proof problem** *(not graded)*
Prove that a² + b² + c² ≥ 1 for all such x, y, z.
- Hint 1: write a² + b² + c² in terms of s = a + b + c.
- Solution: a² + b² + c² = (s − 1)² + 1 ≥ 1.

**Hints**
- Step 1: Multiply out a(x − 1) = x and solve for x.
- Step 2: Work out a, b, c first: 2, 3/2 and (1/6)/(1/6 − 1).
- Step 3: Substitute a + b + c = 5/2 into a + b + c − 1 = ab + bc + ca.
- Challenge: a² + b² + c² = (a + b + c)² − 2(ab + bc + ca).
- Challenge: The condition gives ab + bc + ca = (a + b + c) − 1.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: solve a one-step equation with fractions.
- Step 2 — AMC 8: arithmetic with fractions.
- Step 3 — AMC 10: rewriting a condition by expanding a product (AMC 10 #11–15).
- Challenge — AIME: the substitution plus a symmetric-sum identity; like AIME #2–5.

**Research field:** algebraic inequalities (substitutions and sums of squares).

---

### Ladder P35 — Fibonacci Gaps

**Idea card:** SL2020-C4 (pick one pair of points for each odd-index Fibonacci difference; these pairs form a forest,
because in a cycle the largest difference would be at most the sum of the smaller odd-index ones, which telescopes to
a smaller Fibonacci number; the even-index Fibonacci numbers give a matching construction).

**Setup:** The Fibonacci numbers are F₀ = 0, F₁ = 1, F₂ = 1, F₃ = 2, F₄ = 3, F₅ = 5, … (each is the sum of the two
before). A set S of whole numbers **measures** a number d if two elements of S differ by exactly d.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | What is F₁ + F₃ + F₅ + F₇? | **21** |
| 2 | AMC 8 | A graph with 6 points and no cycle (no closed path) has at most how many edges? | **5** |
| 3 | AMC 10 | What is the smallest size of a set that measures each of F₂, F₃, …, F₈? | **5** |
| **Challenge** | AIME | What is the smallest size of a set that measures each of F₂, F₃, …, F₁₉₉₆? | **999** |

**Problem analysis** *(members only)*
- The odd-index numbers F₁, F₃, F₅, … add up nicely: F₁ + F₃ + … + F₂ₘ₋₁ = F₂ₘ, which is smaller than F₂ₘ₊₁.
- For each odd-index difference that must be measured, pick one pair of elements of S and join them by an edge. In any
  cycle of edges, the largest difference is at most the sum of the others (go around the cycle), but that sum is at
  most F₂ₘ < F₂ₘ₊₁. So there is no cycle: the edges form a forest.
- A forest with e edges needs at least e + 1 points. The odd-index differences among F₁ = F₂, F₃, …, F₁₉₉₅ number 998,
  so |S| ≥ 999.
- The set {F₀, F₂, F₄, …, F₁₉₉₆} has 999 elements and measures everything: F₂ⱼ − F₀ = F₂ⱼ and F₂ⱼ − F₂ⱼ₋₂ = F₂ⱼ₋₁.

**Logic flow** *(members only)*
1. **The telescoping sum (Step 1).** F₁ + F₃ + F₅ + F₇ = 21 = F₈. *Why:* it beats any single larger odd-index number.
2. **Forests (Step 2).** No cycle means at most (points − 1) edges. *Why:* this converts "many differences" into
   "many points".
3. **A small case (Step 3).** For F₂ … F₈: four odd-index differences (F₁ = F₂, F₃, F₅, F₇) need 5 points, and
   {0, 1, 3, 8, 21} works.
4. **Apply (Challenge).** 998 odd-index differences need 999 points; the even-index Fibonacci numbers give 999.

**Our full solution**
Since F₂ = F₁ = 1, the numbers to measure include the 998 odd-index values F₁, F₃, …, F₁₉₉₅, which are all different.
For each one choose a pair of elements of S at that distance, and draw an edge between them; this is a graph on S
with 998 edges. Suppose it had a cycle, and let F₂ₘ₊₁ be the largest label in it. Going around the cycle, the signed
differences add up to 0, so F₂ₘ₊₁ is at most the sum of the other labels, which is at most
F₁ + F₃ + … + F₂ₘ₋₁ = F₂ₘ < F₂ₘ₊₁ (the telescoping identity follows from F₂ⱼ₋₁ = F₂ⱼ − F₂ⱼ₋₂). Contradiction: the graph
is a forest, so it has at least 998 + 1 = 999 points, |S| ≥ 999. The set {F₀, F₂, F₄, …, F₁₉₉₆} has 999 elements; it
measures every even-index Fₖ as Fₖ − F₀ and every odd-index F₂ⱼ₋₁ as F₂ⱼ − F₂ⱼ₋₂. So the answer is **999**. Computer
check: the smallest sets for F₂ … Fₙ with n ≤ 9 (searching sets of small numbers), matching ⌈n/2⌉ + 1.

**Short solutions**
- Step 1: 1 + 2 + 5 + 13 = 21.
- Step 2: a forest on 6 points has at most 5 edges (a tree).
- Step 3: the differences F₁ = F₂, F₃, F₅, F₇ give 4 edges without a cycle, so at least 5 points; {0, 1, 3, 8, 21} works.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2020 C4 *(Strong)*: asks for the smallest size for every n. Our Challenge asks for one large n.

**Similar problems on our site**
- Ladder A "Fibonacci Stairs" (live): another problem built on sums of Fibonacci numbers.

**Explore** — *Status: not searched in the literature yet.*
What is the smallest set measuring the powers of 2 from 2⁰ to 2¹⁰?

**Proof problem** *(not graded)*
Prove that F₁ + F₃ + … + F₂ₘ₋₁ = F₂ₘ.
- Hint 1: write each odd-index term as a difference of two even-index terms.
- Solution: F₂ⱼ₋₁ = F₂ⱼ − F₂ⱼ₋₂, so the sum telescopes to F₂ₘ − F₀ = F₂ₘ.

**Hints**
- Step 1: Add the four numbers and compare the total with the Fibonacci numbers.
- Step 2: A connected graph with no cycle is a tree.
- Step 3: Which of F₂, …, F₈ have odd index (F₂ = F₁)? Join one pair of points for each; can those edges make a cycle?
- Challenge: Join one pair for each odd-index difference. In a cycle the largest difference would be at most the sum of the smaller ones.
- Challenge: The set of even-index Fibonacci numbers F₀, F₂, …, F₁₉₉₆ measures everything.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: a sum of listed numbers.
- Step 2 — AMC 8: a basic fact about graphs without cycles.
- Step 3 — AMC 10: the forest argument on a small case plus a construction (AMC 10 #21–25).
- Challenge — AIME: the same argument at scale; like AIME #4–6.

**Research field:** graph theory (forests) and additive combinatorics (difference sets).

---

### Ladder P36 — Divisor Chains

**Idea card:** SL2023-N1 (read the divisor list from both ends: if p < q are the two smallest primes of n, the
divisors just below n are n/p, …, n/pᵃ, n/q, and the condition at the top forces pᵃ to divide p + 1, which is
impossible; prime powers work).

**Setup:** List the divisors of a whole number n > 1 in increasing order: 1 = d₁ < d₂ < … < dₖ = n. Call n
**chain-like** if dᵢ divides dᵢ₊₁ + dᵢ₊₂ for every i from 1 to k − 2.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | How many of 4, 6, 8, 9, 10, 12 are chain-like? | **3** |
| 2 | AMC 8 | What is the fourth-largest divisor of 40? | **8** |
| 3 | AMC 10 | How many composite numbers from 4 to 100 are chain-like? | **10** |
| **Challenge** | AIME | How many composite numbers from 4 to 1000 are chain-like? | **25** |

**Problem analysis** *(members only)*
- Prime powers pʳ are chain-like: pⁱ divides pⁱ⁺¹ + pⁱ⁺² = pⁱ(p + p²).
- Divisors come in pairs d and n/d, so the list read from the top is n, n/d₂, n/d₃, ….
- If n has two different primes, let p < q be the two smallest and pᵃ < q < pᵃ⁺¹. The smallest divisors are
  1, p, …, pᵃ, q, so the largest are …, n/q, n/pᵃ, n/pᵃ⁻¹, ….
- The condition for the triple (n/q, n/pᵃ, n/pᵃ⁻¹) says n/q divides n(p + 1)/pᵃ, i.e. pᵃ divides q(p + 1), so pᵃ divides
  p + 1, which is impossible for a ≥ 1. So exactly the prime powers with exponent at least 2 are composite and
  chain-like.
- Count pʳ ≤ 1000 with r ≥ 2: 11 squares, 4 cubes, 3 fourth powers, 2 fifth, 2 sixth, 1 seventh, 1 eighth, 1 ninth: 25.

**Logic flow** *(members only)*
1. **Test small numbers (Step 1).** 4, 8, 9 work; 6, 10, 12 fail. *Why:* prime powers look special.
2. **Read from the top (Step 2).** The fourth-largest divisor of 40 is 40/5 = 8. *Why:* the top of the list mirrors
   the bottom.
3. **The top triple fails (Step 3).** With two primes, n/q must divide n(p + 1)/pᵃ, impossible; so only prime powers
   work: 10 of them up to 100.
4. **Count (Challenge).** Prime powers pʳ ≤ 1000 with r ≥ 2: 25.

**Our full solution**
If n = pʳ (r ≥ 2) the divisors are 1, p, …, pʳ and pⁱ | pⁱ⁺¹ + pⁱ⁺² for all i, so n is chain-like. Suppose n has at least
two prime factors; let p < q be the two smallest, and let a ≥ 1 be the largest exponent with pᵃ dividing n and
pᵃ < q. Every divisor of n smaller than q is a power of p (it cannot contain q or a larger prime), so the divisors below
q are exactly 1, p, …, pᵃ, and q comes next. Pairing d ↔ n/d, the divisors n/q, n/pᵃ, n/pᵃ⁻¹ are consecutive in the
list. The condition gives n/q | n/pᵃ + n/pᵃ⁻¹ = n(1 + p)/pᵃ, so q(p + 1)/pᵃ is a whole number. Since p does not divide q,
pᵃ divides p + 1; but a ≥ 1 and p does not divide p + 1, a contradiction. So the composite
chain-like numbers are exactly pʳ with r ≥ 2. Up to 1000: squares of the 11 primes up to 31, cubes 8, 27, 125, 343,
fourth powers 16, 81, 625, fifth 32, 243, sixth 64, 729, and 128, 256, 512: 11 + 4 + 3 + 2 + 2 + 1 + 1 + 1 = **25**.
Computer check: every n from 2 to 1000 tested directly.

**Short solutions**
- Step 1: 4 (1, 2, 4), 8 and 9 work; 6 fails (2 ∤ 3 + 6), 10 fails (2 ∤ 5 + 10), 12 fails (2 ∤ 3 + 4): 3.
- Step 2: the divisors of 40 from the top are 40, 20, 10, 8, …: 8.
- Step 3: the prime powers 4, 8, 16, 32, 64, 9, 27, 81, 25, 49: 10.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2023 N1 (IMO 2023 Problem 1) *(Strong)*: asks for all composite n with this property. Our Challenge
  counts them up to 1000.

**Similar problems on our site**
- Ladder P15 "Equal Divisor Counts": another problem about the structure of divisor lists.

**Explore** — *Status: not searched in the literature yet.*
What if dᵢ must divide dᵢ₊₁ + dᵢ₊₂ + dᵢ₊₃ instead (for i up to k − 3)?

**Proof problem** *(not graded)*
Prove that every prime power pʳ with r ≥ 2 is chain-like.
- Hint 1: write the divisors as powers of p.
- Solution: the divisors are pⁱ for i = 0, …, r, and pⁱ⁺¹ + pⁱ⁺² = pⁱ(p + p²) is a multiple of pⁱ.

**Hints**
- Step 1: List the divisors of each number and test every consecutive triple.
- Step 2: The divisors read from the top are 40 divided by the divisors read from the bottom.
- Step 3: Only prime powers work. Look at the three divisors just below n/pᵃ⁻¹ when n has two different primes.
- Challenge: If p < q are the two smallest primes of n, the triple n/q, n/pᵃ, n/pᵃ⁻¹ fails. So only prime powers remain.
- Challenge: Count prime powers pʳ ≤ 1000 with r ≥ 2, exponent by exponent.

**Level check** *(internal)*
- Step 1 — MATHCOUNTS: listing divisors.
- Step 2 — AMC 8: divisor pairs.
- Step 3 — AMC 10: the structural argument on a small range (AMC 10 #16–20).
- Challenge — AIME: the argument plus a careful count by exponent; like AIME #3–5 (compare AIME 2026 I #8, a
  divisor count).

**Research field:** elementary number theory (divisor structure).
