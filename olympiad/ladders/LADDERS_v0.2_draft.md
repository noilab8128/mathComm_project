# Problem Ladders v0.2 — draft (pilot built from idea cards)

- Date: 2026-10-06
- Status: **pilot, not imported**. Two ladders (G, H) built from idea cards instead of DNA records.
- Answer check: `python3 ladders/verify_ladders_v0_2.py` (every answer below is recomputed by brute force)
- Same rules as v0.1 (short answer only, no ambiguity, computer check, copyright). Each ladder uses only the
  idea from its card; problems, numbers, stories and solutions are our own.
- Internal only: the `Idea card` line names the source. It is never shown on the site.

---

### Ladder G — Stickers That Double

**Idea card:** SL2024-A2 (weights that double make the problem copy itself: take away the first variable and
what is left is the same problem with every cost doubled).

**Setup:** Ana buys stickers over several days, numbered day 0, day 1, day 2, and so on. If she buys k stickers
on day i, that day costs k² × 2ⁱ coins (so day 0 costs k², day 1 costs 2k², day 2 costs 4k², ...). She may buy
nothing on some days, and she may use as many days as she likes.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | Ana needs 3 stickers and shops only on day 0 and day 1. What is the cheapest total cost? | **6** |
| 2 | Kangaroo / MATHCOUNTS | Ana needs 4 stickers and shops only on days 0, 1 and 2. What is the cheapest total cost? | **10** |
| 3 | MATHCOUNTS | Ana needs 6 stickers. What is the cheapest total cost? | **21** |
| 4 | AMC 8 | The cheapest costs for 0, 1, 2, ..., 6 stickers are 0, 1, 3, 6, 10, 15, 21 coins. Ana needs 9 stickers and decides to buy exactly 3 of them on day 0. What is the cheapest total cost she can still get? | **51** |
| 5 | AMC 10 | Ana needs 100 stickers. What is the cheapest total cost? | **5050** |
| **Challenge** | AIME | Ben's shop triples instead: k stickers on day i cost k² × 3ⁱ coins. Ben needs 12 stickers. What is the cheapest total cost? | **100** |

**Short solutions**
- Step 1: (2 on day 0, 1 on day 1) costs 4 + 2 = 6; the other splits cost 9, 9 or 18.
- Step 2: (2, 1, 1) costs 4 + 2 + 4 = 10.
- Step 3: (3, 2, 1) costs 9 + 8 + 4 = 21.
- Step 4 (the key idea): after day 0, days 1, 2, 3, ... cost exactly twice what days 0, 1, 2, ... would cost.
  So buying the other 6 stickers from day 1 on costs at least 2 × 21. Total 9 + 42 = 51.
- Step 5: Step 4 gives the rule best(n) = smallest value of x² + 2 × best(n − x). The table 1, 3, 6, 10, 15, 21
  suggests best(n) = n(n + 1)/2. Check: x² + (n − x)(n − x + 1) − n(n + 1)/2 = (2x − n)(2x − n − 1)/2, a product
  of two neighbouring integers, so it is never negative and is 0 when x is about n/2. So best(100) = 5050.
- Challenge: same rule with 3: best(n) = smallest value of x² + 3 × best(n − x). Working up from 0 gives
  0, 1, 4, 7, 12, 19, 28, 37, 46, 57, 70, 85, 100. The best plan buys 8, 3, 1 on days 0, 1, 2:
  64 + 27 + 9 = 100. Computer check: brute force over 7 days.

**Explore** — *Status: not searched in the literature yet.*
What happens when the cost multiplies by 4 each day? By 10? Compare the cheapest costs with n(n + 1)/2.

**Research field:** discrete optimisation; self-similar recursions.

---

### Ladder H — Divisors Plus Three

**Idea card:** SL2024-N1 (a condition on every divisor collapses once you test a few clever divisors: n itself,
the powers of two, and the odd part).

**Setup:** Call a whole number n **lucky** if for every divisor d of n (including 1 and n), the number d + 3 is
prime or divides n. For example, 4 is lucky: its divisors are 1, 2, 4, and 1 + 3 = 4 divides 4, 2 + 3 = 5 is
prime, 4 + 3 = 7 is prime.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | The divisors of 16 are 1, 2, 4, 8, 16. For how many of them is d + 3 a prime number? | **4** |
| 2 | Kangaroo / MATHCOUNTS | What is the smallest positive whole number k for which 2ᵏ + 3 is not prime? | **5** |
| 3 | MATHCOUNTS | How many odd numbers from 1 to 99 are lucky? | **0** |
| 4 | AMC 8 | Some powers of 2 are lucky. What is the largest lucky power of 2? | **16** |
| 5 | AMC 10 | For which whole number a is 5 × 2ᵃ lucky? There are two such values; what is their sum? | **7** |
| **Challenge** | AIME | What is the sum of all lucky numbers from 1 to 1000? | **148** |

**Short solutions**
- Step 1: 4, 5, 7, 11, 19: four of them are prime.
- Step 2: 5, 7, 11, 19 are prime, but 2⁵ + 3 = 35 = 5 × 7.
- Step 3 (first key test, d = n): n + 3 is bigger than n, so it cannot divide n; it must be prime. For odd n,
  n + 3 is even and at least 4, so it is not prime. No odd number is lucky.
- Step 4 (second test, d = 1): 4 must divide n. For n = 2ᵃ, every d + 3 = 2ʲ + 3 is odd and cannot divide n, so
  all of 2¹ + 3, ..., 2ᵃ + 3 must be prime. Step 2 says this stops at a = 4: n = 16.
- Step 5: d = 1 needs a ≥ 2; d = 5 needs 8 | n, so a ≥ 3; d = 2⁵ = 32 gives 35, which is not prime and does
  not divide 5 × 2ᵃ, so a ≤ 4. Both a = 3 (40) and a = 4 (80) work: 3 + 4 = 7.
- Challenge: n is a multiple of 4 (Step 4). Write n = 2ᵃ × m with m odd. Every odd divisor e of m has e + 3 even,
  so e + 3 must divide n. With m = 1 this gives 4, 8, 16. With m > 1, e = m forces m + 3 to be 2ᵇ (or 3 × 2ᵇ when
  3 divides m), and checking the divisors 2ʲ and 2ʲ × m leaves only 40 and 80 below 1000.
  Sum: 4 + 8 + 16 + 40 + 80 = 148. Computer check: every n from 1 to 1000 (and up to 200 000: no others).

**Explore** — *Status: not searched in the literature yet.*
Replace "+ 3" by "+ 1", "+ 5" or "+ 7". For which of these are there only finitely many lucky numbers?
(With "+ 1" the computer finds only 1, 2, 4, 12.)

**Research field:** elementary number theory (divisors and primes).

---

## Assessment of the pilot

- **Difficulty:** about the same as v0.1 at the top (AIME), but the Challenge now needs a real olympiad idea
  (self-similar recursion; testing chosen divisors) instead of a classic theme. The lower steps stay easy.
- **Not done yet:** independent-solver pass, human review, web search for each Challenge's twist,
  a famous open problem for each ladder.
