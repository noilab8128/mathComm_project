# The 7 older live ladders in the v2 format (analysis, flow, hints)

- Date: 2026-10-11
- These ladders (built with the v0.1 level template, `LADDERS_v0.1.md`) are already live. Their problems, steps,
  answers and extras stay as they are, so students keep their progress. This file adds what the v2 format has and
  they lacked: the Problem analysis and Logic flow (members only), hints for every problem, and a full solution
  where the live one was only a sketch (Fibonacci Stairs, Reverse and Add).
- Labels are the live problem titles' endings: `Step 1`, …, `Bridge`, `Challenge`.
- Write to the site: `python3 ladders/import_guides_hints.py ladders/v2/LADDERS_v2_older.md --apply`.
- Number check: `python3 ladders/v2/verify_v2_older.py`.
- Note for review: some old steps are not on the Challenge's solution path (they are left out of the flow) and some
  are below the v2 floor (Kangaroo level, difficulty 2). Listed at the end.

---

### Ladder 0 — Candy Game

**Problem analysis** *(members only)*
- The total number of candies never changes, and the game ends exactly when any two kids differ by at most 1.
- For the longest game, watch the gap between the richest and the poorest kid. With 3 kids, every move shrinks this
  gap by at least 1.
- The game can only stop with a gap of 0 or 1, and ending with a gap of 0 needs a last move that shrinks it by 2. So
  the game lasts at most (starting gap) − 1 moves.
- Moves that shrink the gap by exactly 1 can be chosen all the way, so this bound is reached. The middle kid does not
  matter.
- For 2026, 1000 and 7 candies: 2026 − 7 − 1 = 2018.

**Logic flow** *(members only)*
1. **Where the game ends (Step 1).** The total stays the same, and at the end any two kids differ by at most 1. *Why:*
   it tells us when the game must stop.
2. **The end state (Step 3).** With 20 candies and 6 kids the end is 4, 4, 3, 3, 3, 3. *Why:* the end is fixed, only
   the route to it varies.
3. **Measure progress (Bridge).** The gap between the richest and the poorest kid shrinks by at least 1 each move, so
   9, 4, 0 lasts at most 9 − 0 − 1 moves. *Why:* a quantity that always drops bounds the length of the game.
4. **Reach the bound (Challenge).** Choose moves that shrink the gap by exactly 1 until the end.
5. **Apply (Challenge).** 2026 − 7 − 1 = 2018.

**Hints**
- Step 1: The total number of candies never changes. When the game ends, how far apart can two kids' amounts be?
- Step 2: The total is 15. At the end everyone has nearly the same amount.
- Step 3: 20 candies among 6 kids: at the end everyone has q or q + 1 candies.
- Step 4: The end state is fixed (Step 2). Each move moves one candy. How many candies must leave the kids who have too many?
- Step 5: Ana ends with at most ⌈2026/100⌉ candies, and each move takes at most one candy from her.
- Bridge: Watch the gap between the richest and the poorest kid. How much can one move change it?
- Challenge: Every move shrinks the gap between the richest and the poorest kid by at least 1.
- Challenge: Ben's candies do not matter. The game lasts at most (gap − 1) moves; check that moves shrinking the gap by exactly 1 are always available.

---

### Ladder A — Fibonacci Stairs

**Problem analysis** *(members only)*
- Taking the largest number that fits (the greedy way) gives a sum with no two neighbours of the list. This form is
  unique; it is called the Zeckendorf form.
- Every other way comes from **splitting** greedy terms: a term can be replaced by the two numbers just below it
  (13 = 8 + 5), and the lower of those can be split again (13 = 8 + 3 + 2), and so on.
- A term can only be split down as far as the next smaller term allows, so the gaps between the greedy terms decide
  the count.
- Count from the smallest term up, keeping two numbers: the ways where the current term is kept, and the ways where
  it is split.
- For 2026 = 1597 + 377 + 34 + 13 + 5 this gives 12 + 12 = 24.

**Logic flow** *(members only)*
1. **Know the list (Step 1).** Each number is the sum of the two before it. *Why:* this is exactly what makes a
   split possible.
2. **The greedy form (Step 2).** 100 = 89 + 8 + 3. *Why:* every count starts from this form.
3. **When nothing can be split (Step 3).** 20 = 13 + 5 + 2: the terms are too close together to split. *Why:* small
   gaps allow no splits.
4. **Count with the gaps (Step 4).** For 100 = 89 + 8 + 3 the splits give 9 ways. *Why:* it tests the counting rule.
5. **Apply (Challenge).** 2026 = 1597 + 377 + 34 + 13 + 5 gives 24 ways.

**Our full solution**
Number the list as F₂ = 1, F₃ = 2, F₄ = 3, F₅ = 5, …, F₁₇ = 1597. The greedy form of 2026 is
F₁₇ + F₁₄ + F₉ + F₇ + F₅. Splitting a term Fᵢ once gives Fᵢ₋₁ + Fᵢ₋₂; splitting the lowest piece again gives
Fᵢ₋₁ + Fᵢ₋₃ + Fᵢ₋₄, and so on: after t splits the lowest piece is Fᵢ₋₂ₜ. Every way of writing the number comes from
exactly one choice of t for each greedy term, subject to one condition: the pieces of a term must stay above the next
smaller term's pieces. If the next term Fⱼ is kept, that means i − 2t > j; if it is split (its top piece is Fⱼ₋₁),
i − 2t ≥ j. For the smallest term, i − 2t ≥ 2. Work upward with K = ways with the current term kept and S = ways with
it split. Smallest term F₅: K = 1, S = 1. Next F₇ (gap 2): K = 1 + 1 = 2, S = 1. Next F₉ (gap 2): K = 3, S = 1. Next
F₁₄ (gap 5): K = 4, S = 3 × 2 + 1 × 2 = 8. Top F₁₇ (gap 3): K = 12, S = 4 × 1 + 8 × 1 = 12. In general, for gap d
the new K is K + S and the new S is K × (⌈d/2⌉ − 1) + S × ⌊d/2⌋. The total is 12 + 12 = **24**. Computer check:
the rule matches a direct count for every number up to 3000.

**Hints**
- Step 1: Write the sequence out; each number is the sum of the two before it.
- Step 2: Take the largest number from the list that fits into 100, subtract it, and repeat.
- Step 3: Without 13, the numbers 1 + 2 + 3 + 5 + 8 add up to only 19.
- Step 4: Start from 100 = 89 + 8 + 3 and find every way to replace a number by the two numbers just below it.
- Challenge: Start from the greedy form 2026 = 1597 + 377 + 34 + 13 + 5.
- Challenge: How far a term can be split depends on the next smaller term. Work from the smallest term up, counting the ways with each term kept and with it split.

---

### Ladder B — Coins You Can't Make

**Problem analysis** *(members only)*
- Sort the amounts by their remainder when divided by the smallest coin.
- In each remainder class, once one amount can be paid, every larger amount in that class can be paid too (add the
  smallest coin).
- So the largest amount that cannot be paid is the largest of the class minimums, minus the smallest coin.
- For two coins a and b with no common factor this gives ab − a − b. With three coins, find the class minimums by
  hand.
- For 7, 11 and 13 the smallest payable amounts for remainders 0 to 6 (mod 7) are 0, 22, 37, 24, 11, 26, 13. The
  largest is 37, so the answer is 37 − 7 = 30.

**Logic flow** *(members only)*
1. **Two coins by hand (Step 1).** With 3 and 5, every amount from 8 on can be paid. *Why:* it shows the pattern.
2. **The two-coin formula (Step 3).** ab − a − b = 40 − 13 = 27 for 5 and 8. *Why:* it comes from the remainder
   classes.
3. **Remainder classes (Bridge).** Sort amounts by remainder mod 6 and find the smallest payable one in each class
   using 10s and 15s. *Why:* this works for any number of coins.
4. **Apply (Challenge).** Class minimums mod 7 with 11s and 13s; the largest is 37, so 30.

**Hints**
- Step 1: List the amounts you can make with 3 and 5 up to 15. Once three amounts in a row work, adding 3s covers everything after.
- Step 2: List the amounts from 1 to 20 and cross out the ones you can pay with 4 and 7.
- Step 3: Sort amounts by their remainder when divided by 5. In each class, find the smallest one you can pay using 8s.
- Bridge: Sort amounts by their remainder when divided by 6. In each class, find the smallest one you can pay using 10s and 15s.
- Challenge: Sort amounts by their remainder when divided by 7. In each class, find the smallest amount made from 11s and 13s.
- Challenge: Every amount at least that smallest one is possible (add 7s). The answer is the largest class minimum minus 7.

---

### Ladder C — Reverse and Add

**Problem analysis** *(members only)*
- A two-digit number 10a + b plus its reverse is 11(a + b). A three-digit number 100a + 10b + c plus its reverse is
  101(a + c) + 20b.
- So only s = a + c and the middle digit b matter.
- If s ≤ 9 and b ≤ 4 there is no carry, and the result has digits s, 2b, s: a palindrome.
- With a carry the result is a palindrome only when s = 11 and b = 0 (the result is 1111).
- Count: 45 × 5 + 8 = 233.

**Logic flow** *(members only)*
1. **Run the rule (Step 1).** 57 → 132 → 363. *Why:* to see what "one step" does.
2. **Two digits as algebra (Step 3).** 11(a + b) is a palindrome when a + b ≤ 9 or a + b = 11: 45 + 8 = 53. *Why:*
   carries are what break palindromes.
3. **Three digits as algebra (Challenge).** 101(a + c) + 20b; split by carries.
4. **Count (Challenge).** 225 numbers without a carry, 8 with s = 11 and b = 0: 233.

**Our full solution**
Write the number as 100a + 10b + c with a ≥ 1 (c may be 0). Adding its reverse gives 101s + 20b with s = a + c,
that is, 100s + 10 × 2b + s. *No carry* (s ≤ 9 and 2b ≤ 9): the digits are s, 2b, s, a palindrome. There are
1 + 2 + … + 9 = 45 pairs (a, c) with a ≥ 1 and a + c ≤ 9, and 5 choices b = 0, …, 4: 225 numbers. *s ≤ 9, b ≥ 5:*
the result is 100(s + 1) + 10(2b − 10) + s, whose first and last digits differ. *s = 10 + t ≥ 10:* the result is
1000 + 100t + 10(2b + 1) + t. If b ≤ 4 its digits are 1, t, 2b + 1, t, a palindrome only when t = 1 and 2b + 1 = 1,
so s = 11 and b = 0 (result 1111); the pairs a + c = 11 are a = 2, …, 9: 8 numbers. If b ≥ 5 the result is
1000 + 100(t + 1) + 10(2b − 9) + t, a palindrome would need t = 1 and t + 1 = 2b − 9, impossible because 2b − 9 is
odd. So the answer is 225 + 8 = **233**. Computer check: all 900 three-digit numbers.

**Hints**
- Step 1: Reverse and add, and after each step check whether the result reads the same both ways.
- Step 2: Keep going: 87 + 78 = 165, then 165 + 561, and so on.
- Step 3: 10a + b plus 10b + a = 11(a + b). Which multiples of 11 are palindromes?
- Challenge: 100a + 10b + c plus its reverse is 101(a + c) + 20b. Write s = a + c.
- Challenge: Split into cases: no carry (s ≤ 9 and b ≤ 4), and the cases with a carry. Only one carry case gives a palindrome.

---

### Ladder D — No Three in a Line

**Problem analysis** *(members only)*
- Every row is a line, so no row can hold 3 dots: an n × n grid holds at most 2n dots.
- The hard part is the example: 2n dots with no three on any line, including slanted lines of every slope.
- For small grids, two dots in every row and column plus a check of the slanted lines finds examples; for 10 × 10 a
  computer search finds one.
- So the answer is exactly 2n, which is 20 for the 10 × 10 grid.

**Logic flow** *(members only)*
1. **A small grid (Step 1).** 3 × 3: at most 2 per row, and 6 can be placed. *Why:* it shows the row bound.
2. **The row bound (Step 2).** At most 2 per row, and an example reaches 8 on 4 × 4. *Why:* the bound is the easy half.
3. **Slanted lines (Step 3).** On 5 × 5, two dots per row and column still need a check of every slope. *Why:* the
   example is the hard half.
4. **Apply (Challenge).** At most 20, and a computer-found example reaches 20.

**Hints**
- Step 1: Each of the 3 rows can hold at most 2 dots. Can you reach that bound without three dots on a diagonal?
- Step 2: Each row holds at most 2 dots. Try a pattern that looks the same after a quarter turn.
- Step 3: Put 2 dots in every row and every column, then check the diagonals and the other slanted lines.
- Challenge: A row with 3 dots breaks the rule. What is the most dots per row?
- Challenge: If 2 dots fit in every row, the bound is reached; an example for 10 × 10 exists (found by computer).

---

### Ladder E — Dots on a Circle

**Problem analysis** *(members only)*
- Count solutions of x² + y² = N with signs and order: a pair (a, b) with a ≠ b, both nonzero, gives 8 points;
  (a, 0) and (a, a) give 4.
- The count depends only on the prime factorization of N: primes leaving remainder 1 when divided by 4 add solutions,
  primes leaving remainder 3 must appear to an even power, and 2 does not change the count.
- Formula: the number of points is 4 × (number of divisors of N leaving remainder 1 when divided by 4 − number leaving
  remainder 3).
- For N = 2025² = 3⁸ × 5⁴: a divisor 3ⁱ × 5ʲ leaves remainder 1 exactly when i is even, so the difference is
  5 × 5 − 4 × 5 = 5 and the count is 20.

**Logic flow** *(members only)*
1. **Count by hand (Step 1).** 25 = 0 + 25 = 9 + 16 gives 4 + 8 = 12 points.
2. **Mind the symmetry (Step 2).** 50 = 1 + 49 = 25 + 25: the pair with equal parts gives only 4 points. *Why:*
   counting by pairs needs care.
3. **Two primes 4k + 1 (Step 3).** 65 = 5 × 13 has two ways as a sum of two squares. *Why:* each such prime adds ways.
4. **The divisor formula (Step 4).** 325 = 5² × 13: 4 × (3 × 2) = 24.
5. **Apply (Challenge).** 2025² = 3⁸ × 5⁴: 4 × 5 = 20.

**Hints**
- Step 1: Find every way to write 25 as a sum of two squares (0 counts), then add the signs and the order.
- Step 2: 50 = 1 + 49 = 25 + 25. How many sign and order choices does each give?
- Step 3: Find every way to write 65 as a² + b² with a < b; there are two.
- Step 4: 325 = 5² × 13. Count the divisors leaving remainder 1 and remainder 3 when divided by 4.
- Challenge: 2025 = 3⁴ × 5², so 2025² = 3⁸ × 5⁴.
- Challenge: Use the divisor formula. A divisor 3ⁱ × 5ʲ leaves remainder 1 when divided by 4 exactly when i is even.

---

### Ladder F — Carries Cost Nine

**Problem analysis** *(members only)*
- Adding in columns, each carry turns a column total of 10 or more into a digit plus a 1 in the next column, which
  lowers the digit sum by 9.
- So s(A) + s(B) − s(A + B) = 9 × (number of carries).
- Numbers like 1001³ are sums of shifted pieces; when the pieces never touch there is no carry, and the digit sum is
  the sum of the pieces' digit sums.
- Q(101 × 10ᵐ) = 10201 × 10²ᵐ + 909 × 10ᵐ: the two pieces touch only for m = 0, 1, 2, where the carries must be
  counted.
- Total: 4 + 22 + 13 + 18 × 22 = 435.

**Logic flow** *(members only)*
1. **One carry costs 9 (Step 1).** 999 + 1 has three carries: 27. *Why:* the whole ladder rests on this rule.
2. **Count carries (Step 2).** 4768 + 1325 has 2 carries: 18.
3. **Use the rule backwards (Step 3).** s(A + B) = 50 + 40 − 9 × 6 = 36.
4. **Pieces that never touch (Step 4).** 1001³ = 1003003001: no carries.
5. **Wider pieces (Step 5).** 1001⁶ still has no carries: 28.
6. **Where pieces meet (Bridge).** Q(1) = 10 has one carry and Q(10) = 190 none: the difference is 9.
7. **Apply (Challenge).** Pieces touch only for m = 0, 1, 2: 4 + 22 + 13 + 18 × 22 = 435.

**Hints**
- Step 1: Add 999 + 1 in columns and count the carries.
- Step 2: Add the two numbers in columns and count the carries; each carry costs 9.
- Step 3: s(A) + s(B) − s(A + B) = 9 × (number of carries).
- Step 4: 1001 = 1000 + 1, so 1001³ = (1000 + 1)³. Expand it.
- Step 5: Expand (1000 + 1)⁶ with the numbers 1, 6, 15, 20, 15, 6, 1 from Pascal's triangle.
- Bridge: Compute Q(10) and Q(1), then their digit sums.
- Challenge: Q(101 × 10ᵐ) = 10201 × 10²ᵐ + 909 × 10ᵐ. For large m the two pieces do not overlap.
- Challenge: Work out m = 0, 1, 2 by hand and count the carries; for m ≥ 3 the digit sum is s(10201) + s(909).

---

## Notes for review (not imported)

Steps that are not on the Challenge's solution path (left out of the flow): Candy Game Steps 2, 4, 5 (fewest moves,
a different question); Coins You Can't Make Step 2 (how many amounts are missing); Reverse and Add Step 2 (a long run).

Steps below the v2 floor (Kangaroo level, difficulty 2): Step 1 of every older ladder, and Candy Game Step 2.
Rebuilding these ladders under LADDER_RULES_v2 would replace those steps; that changes live problems, so it waits for
a decision.
