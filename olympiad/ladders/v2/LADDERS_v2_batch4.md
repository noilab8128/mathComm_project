# Solution-path ladders v2 — batch 4 (P17–P21)

- Date: 2026-10-11
- Status: **draft for review, not imported.** Built with [LADDER_RULES_v2.md](../LADDER_RULES_v2.md).
- Answer check: `python3 ladders/v2/verify_v2_batch4.py` (every answer and every number in the analysis, flow and
  solutions).
- Internal only: the `Idea card` lines name the sources. They are never shown on the site.

---

### Ladder P17 — Heads Up

**Idea card:** SL2023-C1 (label each cell by (row + column) modulo 3; every move flips exactly one coin of each label,
so all heads needs the three label classes to have sizes of the same parity, which happens exactly when 3 divides mn;
blocks of 3 × 2 and 3 × 3 do the rest).

**Setup:** An m × n grid (m, n ≥ 2) has a coin on every cell, all showing tails. A **move**: choose a 2 × 2 square,
flip the coins in its top-left and bottom-right cells, and flip one of the other two coins (top-right or
bottom-left, your choice). The goal is to make every coin show heads.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | On a 2 × 3 grid, what is the fewest number of moves that makes every coin heads? | **2** |
| 2 | AMC 8 | Label each cell of a 4 × 4 grid with the remainder when (row number + column number) is divided by 3. Every move flips exactly one coin of each label. How many cells have the most common label? | **6** |
| 3 | AMC 10 | Every move flips one coin of each label, so all heads is possible only if the three label classes have sizes of the same parity (all even or all odd). Every grid that passes this test can be solved: a 2 × 3, 3 × 2 or 3 × 3 block can be made all heads, and a grid with a side divisible by 3 can be cut into such blocks. Of the grids 2 × 4, 3 × 5, 4 × 5, 5 × 6 and 4 × 7, how many can be made all heads? | **2** |
| 4 | AMC 10 | What is the fewest number of moves that makes a 3 × 4 grid all heads? | **4** |
| **Challenge** | AIME | For how many pairs (m, n) with 2 ≤ m ≤ 20 and 2 ≤ n ≤ 20 can the m × n grid be made all heads? | **192** |

**Problem analysis** *(members only)*
- A 2 × 2 square has labels t, t + 1, t + 1, t + 2 (top-left, top-right, bottom-left, bottom-right, modulo 3). A
  move flips the top-left, the bottom-right and one middle cell: exactly one cell of each label.
- After j moves, each class has received exactly j flips in total. All heads needs every coin flipped an odd number
  of times, so each class size has the parity of j: the three sizes must have the same parity.
- If 3 divides mn the three classes have equal size. Otherwise two classes differ in size by 1, so the parities
  differ and all heads is impossible.
- If 3 divides m (or n), the grid splits into 3 × 2 and 3 × 3 blocks (every n ≥ 2 is a sum of 2s and 3s), each solved
  on its own. So all heads is possible exactly when 3 divides mn.
- The Challenge counts pairs in 2..20 with 3 dividing m or n.

**Logic flow** *(members only)*
1. **Solve a tiny grid (Step 1).** Two moves solve 2 × 3 (and 3 × 2). *Why:* a building block for later.
2. **Label by (row + column) mod 3 (Step 2).** Every move hits one cell of each label. *Why:* it gives an invariant.
3. **Parity test (Step 3).** All heads needs the three class sizes to have the same parity, which fails when 3 does
   not divide mn. *Why:* it rules out boards.
4. **Build solutions (Step 4).** Cut a board with 3 | m into 3 × 2 and 3 × 3 blocks (3 × 4 is two 3 × 2 blocks, 4
   moves). *Why:* it shows every remaining board works.
5. **Count (Challenge).** Pairs in 2..20 with 3 | mn: 361 − 169 = 192.

**Our full solution**
Label cell (r, c) with (r + c) mod 3. A move flips the top-left (label t), the bottom-right (label t + 2) and one of
the two middle cells (label t + 1): one cell of each label. After j moves each class has received j flips in total,
while all heads needs every coin of a class flipped an odd number of times, so every class size has the parity of j.
If 3 does not divide mn, two classes differ in size by exactly 1, so all heads is impossible. If 3 divides m (the case
3 | n is the same after turning the board over its main diagonal, which keeps the moves), split the board into 3-row
strips and each strip into blocks 3 × 2 and 3 × 3 (every n ≥ 2 is a sum of 2s and 3s); a 3 × 2 block is solved in
2 moves and a 3 × 3 block in 5 moves, without touching other blocks. So the board works exactly when 3 divides mn.
Among the 19 × 19 = 361 pairs, the ones with neither m nor n divisible by 3 number 13 × 13 = 169 (2..20 contains six
multiples of 3), so the answer is **192**. Computer check: solvability of every board from 2 × 2 to 20 × 20 by linear
algebra modulo 2.

**Short solutions**
- Step 1: one move flips only 3 of the 6 coins. Two moves work: on the left 2 × 2 square flip the top-left,
  bottom-right and bottom-left coins; on the right square flip the top-left, bottom-right and top-right coins.
- Step 2: the 16 cells split 6, 5, 5 among the labels.
- Step 3: the class sizes are 3, 3, 2 for 2 × 4; 5, 5, 5 for 3 × 5; 7, 7, 6 for 4 × 5; 10, 10, 10 for 5 × 6;
  10, 9, 9 for 4 × 7. Only 3 × 5 and 5 × 6 pass: 2.
- Step 4: 12 coins must each flip at least once and a move flips 3, so at least 4 moves; two 3 × 2 blocks take
  2 moves each.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2023 C1 *(Strong)*: asks for all (m, n) for which all heads is possible; the answer is 3 | mn. Our
  Challenge counts them in a range.

**Similar problems on our site**
- Ladder 0 "The Candy Game" (live): another process controlled by an invariant.

**Explore** — *Status: not searched in the literature yet.*
On boards where all heads is possible, what is the fewest number of moves? (The computer finds 5 for 3 × 3 and 7 for
3 × 5, more than mn/3.)

**Proof problem** *(not graded)*
Prove that a move always flips exactly one coin of each label.
- Hint 1: write the labels of the four cells of a 2 × 2 square.
- Solution: with top-left label t, the top-right and bottom-left cells have label t + 1 and the bottom-right cell has
  label t + 2 (all modulo 3). A move flips the top-left (t), the bottom-right (t + 2) and one middle cell (t + 1).

**Research field:** combinatorics of games and puzzles (invariants, colourings).

---

### Ladder P18 — The Coins of Oslo

**Idea card:** SL2022-C2 (the number of same-metal blocks never increases and drops whenever a middle block moves;
for k < n or k > ⌈3n/2⌉ an explicit row is stuck forever; for n ≤ k ≤ ⌈3n/2⌉ two blocks of the same metal cannot
both be long, which forces the process to finish).

**Setup:** A row has 2n coins: n aluminium (A) and n copper (C). A number k with 1 ≤ k ≤ 2n is fixed. An **operation**:
find the longest run of neighbouring coins of the same metal that contains the k-th coin from the left, and move that
whole run to the left end. For example, with n = 4 and k = 5: CACAACCA → AACACCCA (the run AA in places 4–5 moves to
the front). The number k is **good** (for this n) if, from every starting row, at some point the first n coins are all
the same metal.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | With n = 4 and k = 5, start from CACAACCA. After how many operations are the first 4 coins all the same metal for the first time? | **4** |
| 2 | AMC 8 | With n = 5 and k = 9, start from AACCAAACCC. After how many operations is the row back to AACCAAACCC for the first time? | **4** |
| 3 | AMC 10 | With n = 4, how many values of k from 1 to 8 are good? | **3** |
| 4 | AMC 10 | With n = 10, start from the row of five A, five C, five A, five C. For how many values of k from 1 to 20 do the first 10 coins never become all the same metal? | **10** |
| **Challenge** | AIME | With n = 2026, how many values of k are good? | **1014** |

**Problem analysis** *(members only)*
- Call a maximal run of same-metal coins a **block**. The goal (first n coins the same) is the same as having exactly
  two blocks.
- An operation never increases the number of blocks. When a middle block moves, its two neighbours (same metal) join,
  so the number drops.
- Two ways to get stuck: the k-th coin stays in the first block (nothing changes), or the k-th coin is always in the
  last block and the blocks just rotate. Rows built for these two cases show k < n and k > ⌈3n/2⌉ are not good.
- For n ≤ k ≤ ⌈3n/2⌉: if the first block contains the k-th coin it has at least n coins (goal). If the process keeps
  moving the last block, every block becomes last at some point and then has more than n/2 coins; two A-blocks of
  more than n/2 coins each are too many, so there are only two blocks.
- So the good k are n, n + 1, …, ⌈3n/2⌉. For n = 2026 that is 2026..3039: 1014 values.

**Logic flow** *(members only)*
1. **Run the process (Step 1).** CACAACCA → AACACCCA → CCCAACAA → AACCCCAA → CCCCAAAA. *Why:* to see blocks merging.
2. **A row that rotates forever (Step 2).** With k near the end the last block moves each time and the row returns
   after 4 operations. *Why:* this is how large k fails.
3. **Small n by hand (Step 3).** For n = 4, only k = 4, 5, 6 are good. *Why:* it suggests the range n..⌈3n/2⌉.
4. **Both failures at once (Step 4).** For the row A⁵C⁵A⁵C⁵, k = 1..5 keep moving the first block and k = 16..20 keep
   rotating: 10 values. *Why:* these rows give the two ends of the range.
5. **Count (Challenge).** For n = 2026 the good k are 2026..3039: 1014 values.

**Our full solution**
*Bad k.* If k < n, the row A…A (n − 1 coins) C…C (n coins) A has the k-th coin in its first block, so nothing ever
changes and the goal is never reached. If k > ⌈3n/2⌉, take the row of ⌊n/2⌋ A, ⌊n/2⌋ C, ⌈n/2⌉ A, ⌈n/2⌉ C. Every block
has at least ⌊n/2⌋ coins, so the last block always covers the places from 2n − ⌊n/2⌋ + 1 = ⌈3n/2⌉ + 1 on, which
contain the k-th place; moving it keeps four blocks and rotates the row, forever.
*Good k.* Let n ≤ k ≤ ⌈3n/2⌉. The number of blocks never increases, so from some moment on it stays fixed, and then no
middle block moves (that would lower it). If the first block ever contains the k-th coin, it has at least k ≥ n coins
and the goal is reached. Otherwise the last block moves every time without joining the first block, so the number of
blocks is even, the blocks just rotate and every block is last at some point. A last block containing the k-th place
has at least 2n − k + 1 ≥ ⌊n/2⌋ + 1 coins, so every block has more than n/2 coins. With four or more blocks there are
two A-blocks, which is more than n aluminium coins: impossible. So there are two blocks and the goal is reached.
Hence the good k are n..⌈3n/2⌉. For n = 2026: ⌈3 × 2026/2⌉ = 3039, giving **1014** values. Computer check: every
starting row and every k for n ≤ 6; both bad rows for n ≤ 12.

**Short solutions**
- Step 1: CACAACCA → AACACCCA → CCCAACAA → AACCCCAA → CCCCAAAA: 4 operations.
- Step 2: AACCAAACCC → CCCAACCAAA → AAACCCAACC → CCAAACCCAA → AACCAAACCC: 4 operations (the 9th coin is always in the
  last block).
- Step 3: a computer check of all 70 starting rows: k = 4, 5, 6 are good.
- Step 4: for k ≤ 5 the first block never changes. Every block has 5 coins, so for k ≥ 16 the k-th coin is always in
  the last block and the row rotates. For 6 ≤ k ≤ 15 a middle block moves and the row finishes. So 5 + 5 = 10.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2022 C2 (IMO 2022 Problem 1) *(Strong)*: asks for all pairs (n, k) for which k is good; the answer is
  n ≤ k ≤ ⌈3n/2⌉. Our Challenge counts them for n = 2026.

**Similar problems on our site**
- Ladder Q "Flip the k-th Coin" (draft v0.3): another process on a row of coins driven by the k-th position.

**Explore** — *Status: not searched in the literature yet.*
With n = 4 and k = 4, which starting row needs the most operations? How many?

**Proof problem** *(not graded)*
Prove that the number of blocks never increases, and drops when a middle block moves.
- Hint 1: first take the block out, then put it at the front.
- Solution: suppose there are b blocks and a block other than the first moves. Taking it out leaves b − 2 blocks if it
  was in the middle (its two neighbours have the same metal and join) and b − 1 blocks if it was last. Putting it at
  the front adds at most one block. So afterwards there are at most b − 1 blocks in the first case and at most b in
  the second. Moving the first block changes nothing.

**Research field:** combinatorial processes (sorting by block moves).

---

### Ladder P19 — Coins of Powers of Two

**Idea card:** SL2014-N1 (coins worth 2ⁿ − 2ᵏ for k = 0, …, n − 1; the only odd coin is 2ⁿ − 1 and the even coins are
twice the coins for n − 1, giving f(n) = 2f(n − 1) + 2ⁿ − 1 and f(n) = (n − 2)2ⁿ + 1; counting coins shows that amount
cannot be paid).

**Setup:** For a fixed n ≥ 2, a country has coins worth 2ⁿ − 2ᵏ for k = 0, 1, …, n − 1 (each kind as many times as
needed). For example, for n = 3 the coins are worth 7, 6 and 4. Let f(n) be the largest amount that cannot be paid
exactly.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | For n = 3 (coins 7, 6, 4), what is the largest amount that cannot be paid? | **9** |
| 2 | AMC 8 | For n = 4 the coins are 15, 14, 12, 8. The even coins 14, 12, 8 are twice 7, 6, 4. What is the largest even amount that cannot be paid with the coins 14, 12 and 8 only? | **18** |
| 3 | AMC 10 | For n = 4 (coins 15, 14, 12, 8), what is the largest amount that cannot be paid? | **33** |
| 4 | AMC 10 | For any n, the only odd coin is 2ⁿ − 1, and the even coins are exactly twice the coins for n − 1. An odd amount uses the odd coin, and the rest is paid with the even coins. This gives f(n) = 2f(n − 1) + 2ⁿ − 1, and f(2) = 1. What is f(7)? | **641** |
| **Challenge** | AIME | What is f(10)? | **8193** |

**Problem analysis** *(members only)*
- All coins except 2ⁿ − 1 are even, so an odd amount must use the coin 2ⁿ − 1.
- The even coins 2ⁿ − 2ᵏ (k ≥ 1) are twice the coins for n − 1, so an even amount paid with them is twice an amount
  paid with the coins for n − 1.
- Every amount above 2f(n − 1) + 2ⁿ − 1 can be paid (if odd, take one coin 2ⁿ − 1 first, then halve). This suggests
  f(n) = 2f(n − 1) + 2ⁿ − 1, with values 1, 9, 33, 97, 257 for n = 2..6, and f(n) = (n − 2)2ⁿ + 1.
- Showing that (n − 2)2ⁿ + 1 itself cannot be paid is the hard part: write a payment with m coins as m × 2ⁿ minus a
  sum of m powers of two, and count how many powers of two that sum needs.
- So f(10) = 8 × 1024 + 1 = 8193.

**Logic flow** *(members only)*
1. **Try small amounts (Step 1).** With 7, 6, 4, the amounts 1, 2, 3, 5, 9 cannot be paid; everything from 10 on can.
2. **Halve the even coins (Step 2).** Even amounts with 14, 12, 8 are twice amounts with 7, 6, 4, so the largest bad one
   is 2 × 9 = 18. *Why:* this links n to n − 1.
3. **Add the odd coin (Step 3).** f(4) = 18 + 15 = 33. *Why:* this is the recursion f(n) = 2f(n − 1) + 2ⁿ − 1.
4. **Run the recursion (Step 4).** 1, 9, 33, 97, 257, 641: these fit f(n) = (n − 2)2ⁿ + 1.
5. **Apply (Challenge).** f(10) = 8 × 1024 + 1 = 8193.

**Our full solution**
Let N(n) = (n − 2)2ⁿ + 1; it satisfies N(2) = 1 and N(n) = 2N(n − 1) + 2ⁿ − 1.
*Every amount above N(n) can be paid* (induction on n; for n = 2 the coins are 3 and 2). Take an amount x > N(n). If x
is even, x/2 > N(n − 1) can be paid with the coins for n − 1, and doubling gives a payment of x with the even coins
2ⁿ − 2ᵏ (k ≥ 1). If x is odd, x − (2ⁿ − 1) is even and greater than 2N(n − 1), so it can be paid the same way; add one
coin 2ⁿ − 1.
*N(n) cannot be paid.* Suppose N(n) is paid with m coins 2ⁿ − 2^(k₁), …, 2ⁿ − 2^(kₘ). Then
s = 2^(k₁) + … + 2^(kₘ) = m × 2ⁿ − N(n) = j × 2ⁿ − 1 with j = m − n + 2, and j ≥ 1 because s > 0. So s is a sum of m
powers of two, each at most 2ⁿ⁻¹. In such a sum with as few terms as possible, every power below 2ⁿ⁻¹ appears at most
once (two equal ones could be merged), so the fewest terms is (number of 2ⁿ⁻¹'s that fit into s) + (binary digits 1
of the rest). Here s = (2j − 1) × 2ⁿ⁻¹ + (2ⁿ⁻¹ − 1), so s needs at least (2j − 1) + (n − 1) = m + j > m terms, a
contradiction. Hence f(n) = (n − 2)2ⁿ + 1 and f(10) = **8193**. Computer check: f(n) found by listing payable amounts
for every n from 2 to 10.

**Short solutions**
- Step 1: 1, 2, 3, 5, 9 cannot be paid; 10 = 6 + 4, 11 = 7 + 4, 12 = 6 + 6, 13 = 7 + 6, and adding 4s covers every
  larger amount.
- Step 2: these are twice the amounts payable with 7, 6, 4; the largest bad one is 2 × 9 = 18.
- Step 3: an odd amount needs an odd number of 15s. For 33: one 15 leaves 18 (bad by Step 2) and three 15s make 45 > 33.
  Every larger amount works: even ones are more than 18, and odd ones minus 15 are even and more than 18.
- Step 4: 1, 9, 33, 97, 257, 641 (for example 2 × 257 + 127 = 641).
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2014 N1 *(Strong)*: asks for f(n) in general. Our Challenge asks for one value.

**Similar problems on our site**
- Ladder B "Coins You Can't Make" (live): the two-coin version of the same question.

**Explore** — *Status: not searched in the literature yet.*
Use coins 3ⁿ − 3ᵏ for k = 0, …, n − 1. What is the largest amount that cannot be paid for n = 2, 3 and 4?

**Proof problem** *(not graded)*
Prove that N(n) = (n − 2)2ⁿ + 1 satisfies N(n) = 2N(n − 1) + 2ⁿ − 1.
- Hint 1: expand 2N(n − 1).
- Solution: 2((n − 3)2ⁿ⁻¹ + 1) + 2ⁿ − 1 = (n − 3)2ⁿ + 2 + 2ⁿ − 1 = (n − 2)2ⁿ + 1.

**Research field:** additive number theory (the Frobenius coin problem).

---

### Ladder P20 — Sheets That Double

**Idea card:** SL2014-C2 (replacing a and b by a + b on both sheets multiplies the product by (a + b)²/(ab) ≥ 4, so after
k steps the product is at least 4ᵏ, and AM–GM turns a product bound into a sum bound; pairing sheets reaches it).

**Setup:** N sheets of paper each show the number 1. A **step**: choose two different sheets showing a and b, erase
both, and write a + b on both sheets. We want the sum of all N numbers to stay as small as possible.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | With 4 sheets, after 2 steps, what is the smallest possible sum? | **8** |
| 2 | AMC 8 | One step multiplies the product of all the numbers by (a + b)²/(ab), which is at least 4. With 5 sheets, what is the smallest possible product of the five numbers after 3 steps? | **64** |
| 3 | AMC 8 | Six positive numbers have product 4⁶. What is the smallest possible sum of the six numbers? | **24** |
| 4 | AMC 10 | With 8 sheets, after 12 steps, what is the smallest possible sum? | **64** |
| **Challenge** | AIME | With 12 sheets, after 30 steps, what is the smallest possible sum? | **384** |

**Problem analysis** *(members only)*
- The sum is hard to control step by step, but the product behaves well: (a + b)² ≥ 4ab, so each step at least
  quadruples the product.
- After k steps the product is at least 4ᵏ, and AM–GM says N positive numbers with product P have sum at least
  N × P^(1/N).
- So the sum after k steps is at least N × 4^(k/N). For N = 12 and k = 30 that is 12 × 4^2.5 = 12 × 32 = 384.
- The bound is reached by pairing: one round of N/2 steps on disjoint pairs of equal numbers doubles every number, and
  30 steps are exactly 5 rounds for 12 sheets, leaving every sheet at 32.

**Logic flow** *(members only)*
1. **Small case (Step 1).** Two disjoint pairs give 2, 2, 2, 2: sum 8.
2. **Product grows (Step 2).** (a + b)² ≥ 4ab, so the product at least quadruples each step. *Why:* the product is the
   quantity that can be bounded.
3. **From product to sum (Step 3).** AM–GM: for a fixed product, equal numbers give the smallest sum.
4. **Reach the bound (Step 4).** Rounds of disjoint pairs double every number: 8 sheets, 12 steps = 3 rounds: all 8s.
5. **Apply (Challenge).** 12 sheets, 30 steps = 5 rounds: twelve 32s, sum 384, matching 12 × 4^(30/12).

**Our full solution**
Each step replaces a and b by a + b and a + b, multiplying the product by (a + b)²/(ab) ≥ 4. After 30 steps the
product is at least 4³⁰ = 2⁶⁰, and by AM–GM the 12 numbers have sum at least 12 × (2⁶⁰)^(1/12) = 12 × 2⁵ = 384.
Pairing the 12 sheets into 6 pairs and doing one step on each pair doubles every number; 5 such rounds use 30 steps
and leave every sheet at 32, sum 384. So the smallest sum is **384**. Computer check: every possible sequence of steps
for Steps 1, 2 and 4, plus the bound and the construction.

**Short solutions**
- Step 1: pairs (1, 1) and (1, 1) give 2, 2, 2, 2: sum 8. The sum grows by a + b ≥ 2 each step, so 8 is the least.
- Step 2: each step multiplies the product by at least 4, so at least 4³ = 64; steps on equal numbers reach it
  (1, 1 → 2, 2 → 4, 4 → 8, 8 on the same two sheets).
- Step 3: by AM–GM the sum is at least 6 × 4 = 24, reached when all six numbers are 4.
- Step 4: the product is at least 4¹², so the sum is at least 8 × 4^(12/8) = 64; three rounds of four disjoint pairs
  give all 8s: sum 64.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2014 C2 *(Strong)*: with 2ᵐ sheets and m × 2ᵐ⁻¹ steps, proves the sum is at least 4ᵐ. Our Challenge
  uses a number of sheets that is not a power of 2.

**Similar problems on our site**
- Ladder G "Stickers That Double" (draft v0.2): another minimum where doubling is the key.

**Explore** — *Status: not searched in the literature yet.*
With 12 sheets, what is the smallest possible sum after 31 steps, when the steps no longer split into whole rounds?

**Proof problem** *(not graded)*
Prove that (a + b)² ≥ 4ab for all positive a and b.
- Hint 1: subtract.
- Solution: (a + b)² − 4ab = (a − b)² ≥ 0.

**Research field:** inequalities (AM–GM) and monovariants.

---

### Ladder P21 — Weights of Three

**Idea card:** SL2011-C1 (with weights 2⁰, …, 2ⁿ⁻¹ the lightest weight can be inserted into any valid placement of the
others in 2n − 1 ways, so f(n) = (2n − 1)f(n − 1)). Here the weights are powers of 3; the same argument works because
a signed sum of different powers of 3 is never 0.

**Setup:** A balance has two pans. The weights are 1, 3, 9, …, 3ⁿ⁻¹ (one of each). They are placed one at a time: the
first chosen weight goes on the left pan; each later weight goes on the left or on the right pan. The right pan must
never be heavier than the left pan. Count the ways (orders and pans) to place all n weights.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | MATHCOUNTS | With the weights 1 and 3, how many ways are there? | **3** |
| 2 | AMC 8 | With the weights 1, 3, 9 and 27, how many ways start with 27? | **48** |
| 3 | AMC 8 | With the weights 1, 3 and 9, how many ways are there? | **15** |
| 4 | AMC 10 | The weight 1 can be added to any valid placement of the other n − 1 weights in exactly 2n − 1 ways. With 5 weights, how many ways are there? | **945** |
| **Challenge** | AIME | With the weights 1, 3, 9, …, 3⁷ (8 weights), how many ways are there? | **2027025** |

**Problem analysis** *(members only)*
- Each power of 3 is heavier than all smaller ones together (1 + 3 + … + 3ᵏ⁻¹ = (3ᵏ − 1)/2 < 3ᵏ). So once 27 is on the
  left, nothing smaller can tip the balance (Step 2).
- The difference left − right is a signed sum of different powers of 3, so it is never 0 after the first move.
  Without the weight 1 it is a multiple of 3, hence at least 3.
- So the weight 1 can be inserted into a valid placement of the others at any of the n moves and on either pan,
  except "first, on the right": 2n − 1 ways. Removing it from a valid placement leaves a valid one.
- Hence f(n) = (2n − 1) f(n − 1) = 1 × 3 × 5 × … × (2n − 1), the same count as for powers of 2.

**Logic flow** *(members only)*
1. **Count a tiny case (Step 1).** Weights 1 and 3: 3 left then 1 on either pan, or 1 left then 3 left: 3 ways.
2. **The heaviest weight decides (Step 2).** After 27 goes left, the other three go anywhere: 3! × 2³ = 48. *Why:* a
   power of 3 outweighs all smaller ones together.
3. **A bigger case (Step 3).** 1, 3, 9 give 15 = 3 × 5 ways. *Why:* the numbers 1, 3, 15 suggest odd factors.
4. **The lightest weight is free (Step 4).** It can be inserted in 2n − 1 ways: 1, 3, 15, 105, 945.
5. **Apply (Challenge).** f(8) = 1 × 3 × 5 × … × 15 = 2027025.

**Our full solution**
Let f(n) count valid placements of 1, 3, …, 3ⁿ⁻¹. After any move the difference D = left − right is a signed sum of
different powers of 3, which is never 0 (if 3ᵃ is the smallest power used, the sum is not divisible by 3ᵃ⁺¹).
*Removing 1.* In a valid placement, delete the weight 1. At every moment the new difference D' is a multiple of 3
with |D − D'| ≤ 1 and D ≥ 0, so D' ≥ 0: the rest is a valid placement of 3, 9, …, 3ⁿ⁻¹ (if 1 was first, the next
weight had to go on the left, since it is heavier). These are the weights 1, 3, …, 3ⁿ⁻² multiplied by 3, so there
are f(n − 1) of them.
*Inserting 1.* Into a valid placement of the others, insert 1 as the very first move (left pan only) or as a later
move on either pan. Before the insertion nothing changes; after it, the difference is D' ± 1 where D' is a nonzero,
non-negative multiple of 3 (at least one other weight is already placed), so D' ≥ 3 and the left pan stays heavier.
That is 1 + 2(n − 1) = 2n − 1 ways.
So f(n) = (2n − 1) f(n − 1) with f(1) = 1, and f(8) = 1 × 3 × 5 × 7 × 9 × 11 × 13 × 15 = **2027025**.
Computer check: every placement counted directly for 1 to 7 weights.

**Short solutions**
- Step 1: 3 then 1 (left or right), or 1 then 3 (left only): 3.
- Step 2: 27 is heavier than 1 + 3 + 9 = 13, so the other three weights can go in any order (6) on any pan (8): 48.
- Step 3: 9 first: the other two go anywhere, 2 × 4 = 8. 3 first: 9 must go left; orders 3, 9, 1 and 3, 1, 9 each
  leave 1 free: 4. 1 first: 1, 3, 9 needs both left (1); 1, 9, 3 has 9 left and 3 free (2): 3. Total 8 + 4 + 3 = 15.
- Step 4: 15 × 7 × 9 = 945.
- Challenge: see "Our full solution".

**Similar olympiad problems**
- IMO Shortlist 2011 C1 (IMO 2011 Problem 4) *(Strong)*: the same question with weights 1, 2, 4, …, 2ⁿ⁻¹; the answer is
  1 × 3 × 5 × … × (2n − 1). Our Challenge uses powers of 3 and asks for one value.

**Similar problems on our site**
- Ladder U "Doubling Prefix Sums" (draft v0.3): another count built one size at a time.

**Explore** — *Status: not searched in the literature yet.*
Use the weights 1, 2, 3, …, n instead. How many valid placements are there for n = 4 and n = 5?

**Proof problem** *(not graded)*
Prove that 3ᵏ is heavier than 1 + 3 + 9 + … + 3ᵏ⁻¹.
- Hint 1: find the sum in closed form.
- Solution: 1 + 3 + … + 3ᵏ⁻¹ = (3ᵏ − 1)/2 < 3ᵏ.

**Research field:** enumerative combinatorics (recursive counting).
