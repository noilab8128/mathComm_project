# Hints for ladders P1–P21

- Date: 2026-10-11
- Shown one at a time by the Hint button (members only, free; decisions in docs/OPERATING_POLICY.md 6.6).
- Rule: a hint points to the next move and never states the answer. One hint per step, two per Challenge (the second
  goes further). `python3 ladders/import_guides_hints.py` checks that no hint contains its problem's answer.
- Labels are the problem titles' endings: `Step 1`, …, `Challenge`.

---

### Ladder P1 — The Cheapest Bakery

**Hints**
- Step 1: Compare the cost of 5 loaves in oven 2 with the cost of 4 loaves in oven 2.
- Step 2: Write the extra costs of the first few loaves in each oven (oven 0: 1, 3, 5, …; oven 1: 3, 9, 15, …) and pick the smallest ones.
- Step 3: Write 45 as 3ⁱ × (an odd number) in every possible way.
- Step 4: Count the odd numbers up to 100, then the entries 3 × (odd) up to 100, then 9 × (odd), and so on.
- Step 5: Go oven by oven: the odd numbers up to 30, then 3 × (odd) up to 30, then 9 × (odd), then 27 × (odd).
- Step 6: You need 4 more entries after the 76 entries up to 100. Which entries come right after 100?
- Challenge: Find the value M for which the number of entries up to M is just below 2026, counting layer by layer as in Step 4.
- Challenge: Add the entries up to M layer by layer (each layer is 3ⁱ times a sum of odd numbers), then add the few next entries you still need.

---

### Ladder P2 — The Floor Table

**Hints**
- Step 1: Write the 4 × 4 table of ⌊ij/5⌋ row by row; many small entries are 0.
- Step 2: Column 3 holds ⌊3i/7⌋ for every row i. Pair row i with row 7 − i.
- Step 3: Pair row i with row 13 − i in every column: the two fractions add up to the whole number j.
- Step 4: For each row i, which columns j make ij a multiple of 12? It depends on the common factor of i and 12.
- Step 5: Put n = 11 and your count from Step 4 into the formula.
- Challenge: Use 4S(n) = n²(n − 1) + 2D, where D counts the cells with ij divisible by n + 1 = 2026.
- Challenge: 2026 = 2 × 1013. In row i the entry is whole when j is a multiple of 2026/gcd(i, 2026); sort the rows by gcd(i, 2026).

---

### Ladder P3 — The Safe Start

**Hints**
- Step 1: From each start, write the 4 running totals and check which are divisible by 4.
- Step 2: From each start, look for a block of beads in a row, beginning at the start, whose sum is a multiple of 6.
- Step 3: If a and 12 have a common factor g, then 12/g copies of a add up to a multiple of 12. Check each a.
- Step 4: Do 10 and 7 have a common factor? If not, what must divide k?
- Challenge: Steps 2 and 3 show that composite numbers are not good. Which numbers are left?
- Challenge: For a prime n, suppose every start fails and follow the bad blocks around the circle, as in Step 4.

---

### Ladder P4 — Primes That Add Up

**Hints**
- Step 1: The primes up to 7 are 2, 3, 5, 7. List the six sums p + q and multiply them.
- Step 2: A sum p + q with p < q ≤ 13 is less than 26, so it must equal 13 exactly.
- Step 3: Among r − 4, r − 2 and r, one is always a multiple of 3.
- Step 4: For each n, check whether the largest prime up to n divides some p + q.
- Challenge: The largest prime r ≤ n must equal some p + q, which forces p = 2 and q = r − 2 prime. Repeat for the second largest prime.
- Challenge: This leaves only a few n to check by hand.

---

### Ladder P5 — Square Triples

**Hints**
- Step 1: 6 + z and 19 + z are two squares that differ by 13. Which squares differ by 13?
- Step 2: Add all three equations to get x + y + z, then subtract y + z.
- Step 3: Put k = 5 into the three formulas and add.
- Step 4: Call the sums a² < b² < c². Then x = (a² + b² − c²)/2 must be a positive whole number.
- Challenge: Choose the three sums as squares a² < b² < c². You need a² + b² + c² even and a² + b² > c².
- Challenge: Then z = (b² + c² − a²)/2 ≤ 100 limits c. List the cases carefully.

---

### Ladder P6 — The Half That Never Ends

**Hints**
- Step 1: a₁ = (11/2) × 5. Keep applying the rule until the result is a whole number.
- Step 2: b₁ = 11 × 10/2.
- Step 3: Start with b₀ = 195. How many factors of 2 does 195 − 3 have?
- Step 4: Count the multiples of 2 up to 1024, then the multiples of 4, of 8, and so on, and add.
- Challenge: From Step 3, T(M) is one more than the number of factors of 2 in M − 1.
- Challenge: Add over M − 1 = 1, 2, …, 1024: one for each M, plus the total number of factors of 2 (Step 4).

---

### Ladder P7 — Lanterns on a Pyramid

**Hints**
- Step 1: Try the possible paths, or compute labels row by row as in Step 2.
- Step 2: Fill in the labels row by row from the top. The top lantern is lit, so its label is 1.
- Step 3: Find the guarantee for very small pyramids (1 row, 2 rows, 3 rows, …) and watch what happens each time the number of rows doubles.
- Step 4: Compute the labels row by row as in Step 2.
- Challenge: Some path always passes 1 + ⌊log₂ n⌋ lit lanterns, and the pattern of Step 4 shows this cannot be improved.
- Challenge: Find the smallest n with 1 + ⌊log₂ n⌋ ≥ 8.

---

### Ladder P8 — Divisors That Leave 1

**Hints**
- Step 1: List the divisors of 40 and their remainders when divided by 3.
- Step 2: 2 and 5 both leave remainder 2 when divided by 3, so 2ᵃ × 5ᵇ leaves 1 exactly when a + b is even.
- Step 3: Count all divisors of 810 = 2 × 3⁴ × 5, then the ones with no factor 3 and an even number of factors from 2 and 5.
- Step 4: For an odd value, every prime that leaves remainder 2 must have an even exponent. Try small cases of the formula (c + 1) × B/⌈B/2⌉.
- Challenge: Every even number occurs (try B = 2). Which odd numbers occur?
- Challenge: The odd values are exactly the odd composite numbers (Step 4). Count the even numbers and the odd composite numbers up to 100.

---

### Ladder P9 — Switching Lamps

**Hints**
- Step 1: Lamp 1 must be switched an odd number of times and lamp 2 an even number of times.
- Step 2: Lamps 1 and 2 are each switched an odd number of times, 4 switches in total.
- Step 3: Multiply your answer to Step 2 by 2⁴⁻².
- Step 4: Which three odd numbers add up to 5? For each pattern, count the orders of the switches.
- Challenge: N(3, 9) = 2⁶ × M(3, 9), where M(3, 9) counts 9 switches on 3 lamps with every lamp switched an odd number of times.
- Challenge: Expand (x₁ + x₂ + x₃)⁹ and keep only the terms with all exponents odd: substitute xᵢ = ±1 and average.

---

### Ladder P10 — Functions That Grow Slowly

**Hints**
- Step 1: f(9) ≥ f(5) + f(f(4)) − 1, and f(f(4)) is at least 1.
- Step 2: f(6) ≥ f(3) + f(f(3)) − 1 = 5 + f(5) − 1.
- Step 3: For each function, test small m and n first; one failing pair rules it out.
- Step 4: Use the bound f(n) ≤ n + 1 and the example given.
- Challenge: First show f(n) ≤ n + 1, which bounds f(2026) from above.
- Challenge: For each possible value, find a slow function that reaches it, for example by shifting max(1, n − c).

---

### Ladder P11 — The Halfway Point

**Hints**
- Step 1: The distance from A to the touching point is (AB + AC − BC)/2.
- Step 2: Drop the altitude from B to AC; D is the reflection of A in its foot. Find cos A with the law of cosines.
- Step 3: In triangle BCD, the distance from D to the touching point is (DB + DC − BC)/2, with DC = 15 − AD.
- Step 4: AM = AD + DM, and DM = 2 × DT.
- Challenge: Write AM = AD + 2 × DT and expand DT = (BD + CD − BC)/2 with BD = AB.
- Challenge: AD + CD = AC, so D drops out of the answer.

---

### Ladder P12 — The Closest Climb

**Hints**
- Step 1: Look for a large number that comes before a small one.
- Step 2: If an earlier number exceeds a later one by d, the list must satisfy xₚ ≤ xᵣ. How close can both be?
- Step 3: Compute x₁, x₂, … one at a time with the rule.
- Step 4: List i² mod 11 for i = 1, …, 10, find the largest drop, and halve it.
- Challenge: The smallest error is half the largest drop. Where are the largest and the smallest values in the list?
- Challenge: Solve 37i ≡ 100 and 37i ≡ 1 (mod 101) to see whether the 100 comes before the 1.

---

### Ladder P13 — Every Power of Two

**Hints**
- Step 1: The digits of 1/7 repeat every 6 places. Find the 2nd, 4th, 8th and 16th digits.
- Step 2: Compute 2¹⁰ = 1024 and divide by 5.
- Step 3: Compute 2, 4, 8, 16, 32, … modulo 17 until you reach 1.
- Step 4: Write out 2ⁿ modulo 34 for n = 1, 2, 3, … until a value repeats.
- Challenge: The (2ⁿ)-th digit of 1/103 depends only on 2ⁿ modulo 34, the period of 1/103.
- Challenge: Find when the powers of 2 modulo 34 start repeating (Step 4), then check that no shorter period works for the digits.

---

### Ladder P14 — Six Points on a Circle

**Hints**
- Step 1: The area of the 13-14-15 triangle is 84 (Heron's formula).
- Step 2: R = 65/8 and a/2 = 7.
- Step 3: Put R² = 4225/64, a = 14, b = 15 and c = 13 into the formula.
- Step 4: Add your answers to Steps 2 and 3.
- Challenge: Adding the two formulas gives r² = 5R² − (a² + b² + c²)/2.
- Challenge: Find R² = (abc)²/(16 × area²) for the 7-8-9 triangle, with the area from Heron's formula.

---

### Ladder P15 — Equal Divisor Counts

**Hints**
- Step 1: 12 = 2² × 3 and 18 = 2 × 3². The number of divisors is the product of (exponent + 1).
- Step 2: If n divides k, then sn is a proper divisor of sk. For the other pairs, try small s by hand.
- Step 3: Try s = 3ʲ for small j, to balance the exponents of 2 and 3 in 8s and 12s.
- Step 4: For each n, the multiples of n up to 30, other than n itself, number ⌊30/n⌋ − 1.
- Challenge: Pairs with n dividing k are never balanced, and every other pair turns out to be balanced.
- Challenge: Subtract the divisible pairs (Step 4) from all pairs n < k ≤ 30.

---

### Ladder P16 — Powers on Both Sides

**Hints**
- Step 1: For m² − Sm + P = 0, the two roots add up to S.
- Step 2: Find two numbers with sum 63 and product 486.
- Step 3: 2¹⁸ − 1 = (2⁹ − 1)(2⁹ + 1) = 511 × 513. Factor each.
- Step 4: For each n from 0 to 5, check whether (2ⁿ⁺¹ − 1)² − 8 × 3ⁿ is a perfect square.
- Challenge: Both roots divide 2 × 3ⁿ, so they are 3ᵖ and 2 × 3^q with p + q = n.
- Challenge: Their sum is 2ⁿ⁺¹ − 1. Count the factors of 3 in 2ⁿ⁺¹ − 1 to show that n must be small.

---

### Ladder P17 — Heads Up

**Hints**
- Step 1: One move flips only 3 of the 6 coins.
- Step 2: Write the label of every cell of the 4 × 4 grid and count each label.
- Step 3: For each grid, count the cells of each label and compare their parities.
- Step 4: 12 coins must each be flipped at least once, and a move flips 3. Can 3 × 2 blocks reach that bound?
- Challenge: A grid can be made all heads exactly when 3 divides mn.
- Challenge: Count the pairs where neither m nor n is a multiple of 3, and subtract from 19 × 19.

---

### Ladder P18 — The Coins of Oslo

**Hints**
- Step 1: Find the run containing the 5th coin, move it to the front, and repeat.
- Step 2: The 9th coin is always in the last run. Watch how the runs rotate.
- Step 3: For small k the first run can hold the k-th coin forever; for large k the last run can. Try each k on a few rows.
- Step 4: For which k does the k-th coin stay in the first run forever, and for which in the last run?
- Challenge: The good k are exactly those with n ≤ k ≤ ⌈3n/2⌉.
- Challenge: Count the whole numbers from 2026 to ⌈3 × 2026/2⌉.

---

### Ladder P19 — Coins of Powers of Two

**Hints**
- Step 1: Try every amount from 1 upward. Once 4 amounts in a row can be paid, adding 4s covers everything after.
- Step 2: Even amounts made with 14, 12 and 8 are twice amounts made with 7, 6 and 4 (Step 1).
- Step 3: An odd amount must use the coin 15. Which odd amount minus 15 is the bad even amount from Step 2?
- Step 4: Apply f(n) = 2f(n − 1) + 2ⁿ − 1 again and again, starting from f(2) = 1.
- Challenge: Guess a formula from f(2), f(3), f(4), … (Steps 1, 3 and 4).
- Challenge: f(n) = (n − 2)2ⁿ + 1 fits the recursion. Put n = 10.

---

### Ladder P20 — Sheets That Double

**Hints**
- Step 1: Each step adds a + b to the sum, which is at least 2.
- Step 2: Each step multiplies the product by at least 4. Can every step multiply it by exactly 4?
- Step 3: AM–GM: for a fixed product, the sum is smallest when all the numbers are equal.
- Step 4: After 12 steps the product is at least 4¹². Use AM–GM for 8 numbers.
- Challenge: After 30 steps the product is at least 4³⁰; AM–GM turns this into a lower bound for the sum.
- Challenge: Steps on disjoint pairs of equal numbers double every number, 6 steps per round.

---

### Ladder P21 — Weights of Three

**Hints**
- Step 1: Try both orders (the weight 1 first, or the other first) and check the pans each time.
- Step 2: 27 is heavier than 1 + 3 + 9. Once it is on the left, can the right pan ever be heavier?
- Step 3: Split the count by which weight is placed first.
- Step 4: Use f(n) = (2n − 1) × f(n − 1), starting from f(1) = 1.
- Challenge: Remove the weight 1 from a valid placement: what is left is a valid placement of the other weights.
- Challenge: The weight 1 can be inserted in 2n − 1 ways, so the count is 1 × 3 × 5 × ⋯.
