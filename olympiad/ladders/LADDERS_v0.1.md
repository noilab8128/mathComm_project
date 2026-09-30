# Problem Ladders v0.1

Step-by-step short-answer problem ladders that lead a curious student from Math Kangaroo / MATHCOUNTS / AMC 8
level up to an Olympiad-style challenge, and then to a real open question in mathematics.

- Date: 2026-09-26
- Status: draft for review — 7 ladders (Candy + A–F)
- Answer check: `python3 ladders/verify_ladders.py` (every answer below is recomputed; all 55 checks pass)

---

## 1. Goal

1. Take ideas (not text) from past Olympiad problems.
2. Build a **ladder**: 4–6 short-answer steps, each at Kangaroo / MATHCOUNTS / AMC 8 level, that together
   rebuild the key idea.
3. End with a **Challenge** (Olympiad-style short answer), an **Explore** question, and a **real open problem**
   so students can see what mathematical research looks like.

Target audience: students who like math, even if they are not (yet) strong at it.

---

## 2. Rules for every problem

### 2.1 Short answer only
- Every step, including the Challenge, has **one numeric answer**.
- Converting a proof problem to short answer usually lowers difficulty. To keep it meaningful, ask for a number
  that **requires the key idea** (an exact minimum/maximum, a count), not one that can be guessed.

### 2.2 No ambiguity
- Every person or object the question asks about must be **named or clearly described** (e.g. "Ana", not
  "the first kid").
- An independent solver reads each problem cold and reports anything unclear before it is accepted.

### 2.3 Verification
- Every answer is checked by computer (brute force on small cases, exhaustive search, or an explicit witness),
  **and** by an independent solver. Reasoning alone is not enough: an early "obvious" bound for the candy game
  gave 13 when the true answer was 6.
- All checks live in [`verify_ladders.py`](verify_ladders.py).

### 2.4 Copyright
Not legal advice — have a lawyer review once if the project is commercial.
- **Free to use:** mathematical ideas, techniques, theorems, famous conjectures.
- **Protected:** the specific wording, solutions and figures of IMO / AMC / Math Kangaroo / MATHCOUNTS materials.
- Therefore:
  - Never copy or closely paraphrase a problem. Change objects, setting, numbers and question.
  - Build each ladder from **our own solution**, not from an official solution.
  - AMC 8 / Kangaroo / MATHCOUNTS materials are used **only to calibrate difficulty and style**.
  - State famous conjectures in our own words, with a citation.
  - **Related contest problems** are cited by competition, year and number with a one-sentence description in
    our own words — never the original statement. Readers find the full text at the official source
    ([imo-official.org](https://www.imo-official.org/problems.aspx)).
- **Originality ≠ copyright.** Several ladders below use classic ideas (Frobenius coins, 196, no-three-in-line).
  That is legally fine, but describe them as "original problems built on classic ideas", not "brand-new
  mathematics". Before publishing, web-search each problem's specific twist.

### 2.5 Honesty labels for the ending

| Label | Meaning |
|---|---|
| **Challenge** | Hard, but the answer is known and verified. |
| **Explore** | Open-ended investigation. Each one states whether the answer is known in the literature or whether we could not find it. |
| **Famous open problem** | A documented unsolved problem, with a source and the date its status was checked. |

Never say "researchers are struggling with this" unless it is documented. Open-problem status must come from
reliable sources (not unreviewed online "proofs") and must be re-checked before each release — open problems
do get solved.

---

## 3. Pipeline (per ladder)

1. **Choose source** — a problem from the DNA pool (10 problems in Supabase) or the IMO Shortlist PDFs in
   `data/raw/imo/` (2006–2024).
2. **Generate** a short-answer variant from the problem's DNA (domain + structure), never from its text.
3. **Verify** — computer check + independent solver.
4. **Build the ladder** from the Thinking Graph of *our* solution: key nodes → steps.
5. **Human review** — cannot be automated.
6. **Similarity + originality check** — against the source pool and a web search.

---

## 4. Ladder template

| Part | Level | Purpose |
|---|---|---|
| Step 1 | Kangaroo | Play with a tiny concrete case |
| Step 2 | Kangaroo / MATHCOUNTS | Notice what never changes (or the first pattern) |
| Step 3 | MATHCOUNTS | Use the pattern on a medium case |
| Step 4 | AMC 8 | First "why" question: a bound or an argument |
| Step 5 / Bridge | AMC 8–10 | Combine the ideas |
| Challenge | AIME / junior olympiad | Needs the key idea; answer not guessable |
| Related Olympiad problems | IMO / IMO Shortlist | Real contest problems built on the same idea (cited, not copied) |
| Explore | open-ended | Discover a pattern |
| Famous open problem | research | Show the frontier |
| Research field | — | Name the real area of mathematics |

Each ladder also records: DNA source, answers, short solutions, originality notes.

---

## 5. Ladders

### Ladder 0 — The Candy Game

**DNA source:** GEN-002 (from IMO-SL-2019-C5 structure: invariant + strictly decreasing quantity forces the
process to stop).

**Rule used in every step:** A kid who has at least 2 more candies than another kid may give that kid 1 candy.
The game ends when no gift is possible.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | Ana has 7 candies, Ben has 2, and Cal has 0. How many candies does Ana have when the game ends? | **3** |
| 2 | Kangaroo | Ana, Ben, Cal and Dev have 9, 5, 1 and 0 candies. When the game ends, what is the largest number of candies any kid has? | **4** |
| 3 | MATHCOUNTS | Ana has 20 candies and her 5 friends have none. When the game ends, how many kids have 4 candies? | **2** |
| 4 | AMC 8 | Ana, Ben, Cal and Dev have 9, 5, 1 and 0 candies. What is the fewest number of moves the game can take? | **6** |
| 5 | AMC 10 | Ana has 2026 candies and her 99 friends have none. What is the fewest number of moves the game can take? | **2005** |
| Bridge | AMC 8 / MATHCOUNTS | Ana has 9 candies, Ben has 4, and Cal has 0. What is the **largest** number of moves the game could last? | **8** |
| **Challenge** | AIME / junior olympiad | Ana has 2026 candies, Ben has 1000, and Cal has 7. What is the largest number of moves the game could last? | **2018** |

**Short solutions**
- Steps 1–3: The total never changes. At the end, no two kids differ by 2 or more, so everyone has *q* or *q*+1
  where total = *q* × (number of kids) + *r*; exactly *r* kids have *q*+1. (20 = 3·6 + 2 → two kids have 4.)
- Step 4: Each move shifts exactly one candy. Final state is 4, 4, 4, 3; the kids above their final amounts
  must give away (9−4) + (5−4) = 6 candies, and 6 moves suffice.
- Step 5: 2026 = 20·100 + 26, so Ana ends with at most 21. At least 2026 − 21 = 2005 candies must leave her;
  giving one at a time to whoever has the fewest does it in exactly 2005 moves.
- Challenge: With 3 kids, the answer is always *largest − smallest − 1* (Ben's 1000 is irrelevant).
  - Every move shrinks the gap between the richest and poorest kid by at least 1.
  - The last move either shrinks it by 2, or the game ends with gap ≥ 1. Either way: at most gap − 1 moves.
  - Moves that shrink the gap by exactly 1 always exist, so gap − 1 is reached. 2026 − 7 − 1 = 2018.
  - Computer check: formula matches every 3-kid start with up to 30 candies each (and up to 59 in an earlier run,
    37,820 starts).

**Related Olympiad problems** — *match strength: Strong = same idea; Related = shares the key step; Loose = same theme*

| Problem | Match | In our words |
|---|---|---|
| IMO Shortlist 2022 C4 | Strong | Children sit in a circle; a child with 2+ coins gives one to each neighbour. Which starting distributions can end with exactly one coin each? Our candy game, played around a circle. |
| IMO 1986 Problem 3 | Strong | Integers sit on the corners of a pentagon, and an operation repeatedly "fixes" a negative number. Must the process stop? The same question as Steps 1–4, solved with a quantity that keeps shrinking. |
| IMO Shortlist 2014 C7 | Related | Crossing segments between points are repeatedly swapped; prove the number of swaps is limited. Like our Challenge: how many moves can a process possibly make? |
| IMO Shortlist 2010 C4 (IMO 2010 Problem 5) | Related | Six stacks of coins with two kinds of moves: can you pile up an astronomically large number of coins? The opposite surprise: a simple process that can run for an enormously long time. |
| IMO Shortlist 2019 C5 | Related | Friendships in a network are rewired by a local rule until it stops. The DNA source of this ladder. |

**Explore** — *Status: we could not find this in the literature.*
With 4 kids and all N candies starting with Ana, the largest number of moves is:

| N | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| max moves | 0 | 1 | 2 | 4 | 5 | 6 | 8 | 10 | 11 | 12 | 14 | 16 | 17 | 18 | 20 | 22 | 23 | 24 |

Can you find the rule? What about 5 kids? A student who finds one has done something we have not.

**Famous open problem — Collatz conjecture** (status checked 2026-09-26)
Our candy game always ends — we proved it. Here is an equally simple game nobody can prove always ends:
take any positive whole number; if it is even, halve it; if it is odd, triple it and add 1. Repeat.
Does every starting number eventually reach 1? Computers have checked every number below 2^71, but there is
no proof. (Beware: many unreviewed online "proofs" exist; none is accepted.)

**Research field:** chip-firing games (Anderson, Lovász, Shor, Spencer and others, since the late 1980s).

---

### Ladder A — Fibonacci Stairs

**DNA source:** IMO-SL-2006-A3 hidden structure ("Zeckendorf's theorem in disguise").

**Setup:** The Fibonacci sequence is 1, 1, 2, 3, 5, 8, 13, … (each number is the sum of the two before it).
In Steps 2–Challenge we use the list **1, 2, 3, 5, 8, 13, 21, 34, …**, each number at most once.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | What is the 12th number of the Fibonacci sequence 1, 1, 2, 3, 5, 8, …? | **144** |
| 2 | MATHCOUNTS | Mia writes 100 as a sum of numbers from the list, always taking the largest number that still fits. How many numbers does she use? | **3** |
| 3 | AMC 8 | In how many ways can 20 be written as a sum of different numbers from the list? (Order does not matter.) | **1** |
| 4 | AMC 10 | In how many ways can 100 be written as a sum of different numbers from the list? | **9** |
| **Challenge** | AIME | In how many ways can 2026 be written as a sum of different numbers from the list? | **24** |

**Short solutions**
- Step 2: 100 = 89 + 8 + 3.
- Step 3: 1 + 2 + 3 + 5 + 8 = 19 < 20, so 13 must be used; then 7 = 5 + 2 is forced. Only 13 + 5 + 2.
- Steps 4 and Challenge: start from the greedy form (2026 = 1597 + 377 + 34 + 13 + 5) and count the ways to
  split each term into two smaller neighbours (e.g. 13 → 8 + 5); the number of splits depends on the gaps
  between the greedy terms. Verified by exhaustive count.

**Related Olympiad problems**

| Problem | Match | In our words |
|---|---|---|
| IMO Shortlist 2006 A3 | Strong | Pairs of sums built from a Fibonacci-type sequence are exactly the points in a narrow strip. Our "sums of Fibonacci numbers" in disguise; the DNA source of this ladder. |
| IMO 1981 Problem 3 | Strong | Among whole numbers m, n up to 1981 satisfying (n² − mn − m²)² = 1, find the largest value of an expression in m and n. The solutions turn out to be consecutive Fibonacci numbers. |
| IMO Shortlist 2020 C4 | Related | Find the smallest set of integers whose differences include every Fibonacci number up to a given one. |

**Explore** — *Status: known result; find it yourself.*
Which numbers can be written in **exactly one** way? Up to 100: 1, 2, 4, 7, 12, 20, 33, 54, 88.
What pattern do you see (compare with the list)? Can you explain why?

**Famous open problem — Fibonacci primes** (status checked 2026-09-26)
Some Fibonacci numbers are prime: 2, 3, 5, 13, 89, 233, … Are there infinitely many? Nobody knows.

**Research field:** numeration systems; combinatorics on words.

---

### Ladder B — Coins You Can't Make

**DNA source:** IMO-SL-2019-C2 (which sums can be reached) + two-sided squeeze ending (IMO-SL-2007-A1, 2009-A1):
prove nothing larger fails, then show the answer itself fails.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | A post office sells only 3¢ and 5¢ stamps. What is the largest postage that **cannot** be made exactly? | **7** |
| 2 | MATHCOUNTS | Leo has unlimited 4¢ and 7¢ coins. How many positive amounts can he **not** pay exactly? | **9** |
| 3 | AMC 8 | With unlimited 5¢ and 8¢ coins, what is the largest amount that cannot be paid exactly? | **27** |
| Bridge | AMC 10 | With unlimited 6¢, 10¢ and 15¢ coins, what is the largest amount that cannot be paid exactly? | **29** |
| **Challenge** | AIME | The country of Zeta has coins worth 7, 11 and 13 zets. What is the largest amount that cannot be paid exactly? | **30** |

**Short solutions**
- Steps 1–3: for two coin values *a*, *b* with no common factor, the largest impossible amount is
  *ab − a − b* and the number of impossible amounts is (*a*−1)(*b*−1)/2.
- Challenge: sort amounts by remainder mod 7. Find the smallest amount in each remainder class made from
  11s and 13s: 0, 22, 37, 24, 11, 26, 13 (remainders 0–6). Everything at or above these is possible (add 7s);
  the largest miss is 37 − 7 = 30.

**Related Olympiad problems**

| Problem | Match | In our words |
|---|---|---|
| IMO 1983 Problem 3 | Strong | For three coin values of a special form built from pairwise coprime a, b, c, prove that the largest impossible amount is 2abc − ab − bc − ca. The Olympiad version of our Challenge: three coins, with a formula. |
| IMO Shortlist 2014 N1 | Strong | Coins are worth 2ⁿ − 2ᵏ for several k. Find the largest amount that cannot be made. |

**Explore** — *Status: known in the literature.*
Is there a simple formula for three coin values like the *ab − a − b* formula for two? (Known: no simple
formula of that kind exists — Curtis, 1990. Try to see why the three-coin answers look irregular.)

**Famous open problem — Wilf's conjecture (1978)** (status checked 2026-09-26)
For a set of coins, let F = the largest impossible amount, n = how many amounts from 0 to F *can* be made,
and e = the number of coin values that are really needed. Wilf asked whether always n × e ≥ F + 1.
Check it for Zeta: F = 30, n = 15, e = 3 → 45 ≥ 31. It is verified in many special cases but open in general.

**Research field:** numerical semigroups; the Frobenius problem.

---

### Ladder C — Reverse and Add

**DNA source (loose):** IMO-SL-2015-N4 (a repeated process: does it stabilize?).

**Rule:** Reverse the digits of a number and add. Repeat until you get a palindrome (reads the same both ways).
Example: 57 + 75 = 132, 132 + 231 = 363.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | How many steps does 57 take to become a palindrome? | **2** |
| 2 | MATHCOUNTS | How many steps does 87 take? | **4** |
| 3 | AMC 8 | How many two-digit numbers become a palindrome after exactly one step? | **53** |
| **Challenge** | AIME | How many three-digit numbers become a palindrome after exactly one step? | **233** |

**Short solutions**
- Step 2: 87 → 165 → 726 → 1353 → 4884.
- Step 3: 10a + b plus 10b + a = 11(a + b). This is a palindrome when a + b ≤ 9 (11, 22, …, 99) or
  a + b = 11 (121). Count: 45 + 8 = 53.
- Challenge: case analysis on which digit sums carry. Verified by exhaustive count.

**Related Olympiad problems**

| Problem | Match | In our words |
|---|---|---|
| IMO 1962 Problem 1 | Loose | Find the smallest number ending in 6 that becomes four times larger when the 6 is moved to the front. Digit play, but not reversal. |

No IMO or Shortlist problem in our set (1959–2025) uses digit reversal or palindromes. This ladder is best
connected to recreational mathematics rather than Olympiad problems.

**Explore** — *Status: computer project; results known.*
89 needs **24 steps** and ends at 8,813,200,023,188. Below 1000, **13 numbers** still have no palindrome after
300 steps (196, 295, 394, 493, 592, 689, 691, 788, 790, 879, 887, 978, 986). Why do they come in families?

**Famous open problem — the 196 problem** (status checked 2026-09-26)
Does 196 ever reach a palindrome? Computers have run it for an enormous number of steps without success,
but nobody can prove it never will. (Numbers that never do are called "Lychrel numbers"; none has been proven
to exist in base 10.)

**Research field:** recreational number theory; digit dynamics.

---

### Ladder D — No Three in a Line

**DNA source:** two-sided squeeze ending (IMO-SL-2007-A1, 2009-A1): an upper bound plus a matching example.

**Rule:** Place dots on the points of a square grid so that **no three dots lie on one straight line** (in any
direction, including diagonals of any slope).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | On a 3 × 3 grid of points, what is the largest number of dots? | **6** |
| 2 | MATHCOUNTS | On a 4 × 4 grid? | **8** |
| 3 | AMC 8 | On a 5 × 5 grid? | **10** |
| **Challenge** | AIME / junior olympiad | On a 10 × 10 grid? | **20** |

**Short solutions**
- Upper bound: a row cannot hold 3 dots, so an n × n grid holds at most 2n.
- Matching example (the hard part): must be found. One valid 10 × 10 arrangement (verified by computer):

```
row 0: ● . ● . . . . . . .
row 1: . . . . . ● . . ● .
row 2: . . . . . . ● ● . .
row 3: . . ● . . ● . . . .
row 4: . ● . . . . . . . ●
row 5: . . . . . . ● . ● .
row 6: ● . . . . . . . . ●
row 7: . . . ● ● . . . . .
row 8: . . . . ● . . ● . .
row 9: . ● . ● . . . . . .
```

**Related Olympiad problems**

| Problem | Match | In our words |
|---|---|---|
| IMO 2025 Problem 1 | Related | Lines must cover a triangular pattern of grid points; how many of them can avoid the three "standard" directions? Grid points and lines, as in our ladder. |
| IMO Shortlist 2011 C3 (IMO 2011 Problem 2) | Loose | The famous "windmill": a line spins around points with no three in a line, jumping from pivot to pivot. |
| IMO 1989 Problem 3 | Loose | Points with no three in a line, each having many others at equal distance; bound how many. |

**Explore** — *Status: known sequence (listed in the OEIS).*
How many different 2n-dot arrangements are there? Computer counts: 3 × 3 → 2, 4 × 4 → 11, 5 × 5 → 32,
6 × 6 → 50. Can you find all 11 for the 4 × 4 grid by hand?

**Famous open problem — the no-three-in-line problem** (Dudeney, 1917; status checked 2026-09-26)
Can 2n dots always be placed on an n × n grid? Computers have found arrangements for every grid checked
(up to about n = 50), but nobody can prove it for all n. Guy and Kelly conjectured the opposite: for very
large grids, only about 1.81·n dots fit.

**Research field:** discrete geometry.

---

### Ladder E — Dots on a Circle

**DNA source (loose):** IMO-SL-2015-G2, 2019-G4 (circle configurations).

**Rule:** Count the points (x, y) with **whole-number coordinates** (positive, negative or zero) on a circle
centered at (0, 0).

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | How many such points lie on the circle of radius 5? | **12** |
| 2 | MATHCOUNTS | How many points satisfy x² + y² = 50? | **12** |
| 3 | AMC 8 | How many points satisfy x² + y² = 65? | **16** |
| 4 | AMC 10 | How many points satisfy x² + y² = 325? | **24** |
| **Challenge** | AIME | How many such points lie on the circle of radius 2025? | **20** |

**Short solutions**
- Step 1: (±5, 0), (0, ±5), (±3, ±4), (±4, ±3).
- Steps 2–4: list pairs: 50 = 1 + 49 = 25 + 25; 65 = 1 + 64 = 16 + 49; 325 = 1 + 324 = 36 + 289 = 100 + 225.
- Challenge: the count equals 4 × (number of divisors of r² that leave remainder 1 when divided by 4, minus
  those that leave remainder 3). 2025² = 3⁸ · 5⁴ → 4 × (1 × 5) = 20.

**Related Olympiad problems**

| Problem | Match | In our words |
|---|---|---|
| IMO 1996 Problem 1 | Strong | A piece jumps between squares of a 20 × 12 board, and each jump must have length √r. The allowed jumps are exactly the whole-number solutions of x² + y² = r, the points our ladder counts. |
| IMO 1977 Problem 5 | Related | a² + b² is divided by a + b; find all pairs where the quotient and remainder satisfy a given equation. |
| IMO 1988 Problem 6 | Related | If ab + 1 divides a² + b², prove the quotient is a perfect square. One of the most famous IMO problems. |

**Explore** — *Status: this leads directly to the open problem below.*
Count the points **inside** the circle of radius R and compare with the area πR²:

| R | points inside | πR² |
|---|---|---|
| 10 | 317 | 314.16 |
| 100 | 31,417 | 31,415.93 |
| 1000 | 3,141,549 | 3,141,592.65 |

How big is the difference compared with R?

**Famous open problem — Gauss circle problem** (status checked 2026-09-26)
The difference between the number of points inside and πR² grows roughly like √R at most (up to small factors)
— that is the conjecture. Proving the exact growth rate has been open for over 100 years.

**Research field:** analytic number theory.

---

### Ladder F — Carries Cost Nine

**DNA source:** IMO-SL-2022-A7 (digit sums of a polynomial's values): numbers that sit far apart add without
carries, and every carry lowers a digit sum by exactly 9, so one planted carry flips the parity.

**Setup:** s(n) means the sum of the digits of n. For example, s(2026) = 2 + 0 + 2 + 6 = 10.

| Step | Level | Problem | Answer |
|---|---|---|---|
| 1 | Kangaroo | What is s(999) + s(1) − s(1000)? | **27** |
| 2 | Kangaroo / MATHCOUNTS | Ben adds 4768 and 1325. What is s(4768) + s(1325) − s(4768 + 1325)? | **18** |
| 3 | MATHCOUNTS | The numbers A and B have s(A) = 50 and s(B) = 40. When Cara adds A and B in columns, she carries exactly 6 times. What is s(A + B)? | **36** |
| 4 | AMC 8 | What is s(1001 × 1001 × 1001)? | **8** |
| 5 | AMC 10 | What is s(1001⁶)? | **28** |
| Bridge | AMC 8 / MATHCOUNTS | Let Q(x) = x² + 9x. The numbers 1 and 10 both have digit sum 1. What is s(Q(10)) − s(Q(1))? | **9** |
| **Challenge** | AIME | Let Q(x) = x² + 9x. For each whole number m from 0 to 20, Zoe writes down s(Q(101 × 10ᵐ)). (All 21 inputs have digit sum 2.) What is the sum of the 21 numbers Zoe writes? | **435** |

**Short solutions**
- Steps 1–3: When you add in columns, every carry replaces a column total of 10 or more by one digit plus a 1
  in the next column, which lowers the digit sum by exactly 9. So s(A) + s(B) − s(A + B) = 9 × (number of
  carries). Step 1 has 3 carries (27), Step 2 has 2 (18), and Step 3 gives 50 + 40 − 54 = 36
  (for example A = 35982342266, B = 75081053236).
- Step 4: 1001³ = 1003003001. The numbers 1, 3, 3, 1 sit in separate three-digit blocks and never touch,
  so s = 1 + 3 + 3 + 1 = 8.
- Step 5: 1001⁶ = 1006015020015006001. Each block holds one number of the row 1, 6, 15, 20, 15, 6, 1, and the
  blocks never touch: s = 1 + 6 + 6 + 2 + 6 + 6 + 1 = 28.
- Bridge: Q(10) = 190, where the 100 and the 90 sit apart, so s = 10. Q(1) = 10, where the 1 and the 9 land
  in the same column and carry, so s = 1. The difference is one carry: 9.
- Challenge: Q(101 × 10ᵐ) = 10201 × 10²ᵐ + 909 × 10ᵐ.
  - For m ≥ 3 the two blocks never touch, so the digit sum is 4 + 18 = 22.
  - m = 0: 11110, digit sum 4. m = 1: 1029190, digit sum 22 (no carry).
  - m = 2: 102100900, digit sum 13: the first 9 of 909 lands on the last 1 of 10201, and that one carry costs 9.
  - Total: 4 + 22 + 13 + 18 × 22 = 435. Computer check: every value recomputed directly.

**Related Olympiad problems**

| Problem | Match | In our words |
|---|---|---|
| IMO Shortlist 2022 A7 | Strong | For a polynomial whose coefficients are positive whole numbers, can the digit sums of k and P(k) always have the same parity? Far-apart blocks plus one planted carry settle it. The DNA source of this ladder. |
| IMO Shortlist 2016 N1 | Strong | Find every polynomial with integer coefficients for which the digit sum of P(n) equals P applied to the digit sum of n, for all large n. The same tool: numbers built from far-apart blocks. |
| IMO 1975 Problem 4 | Related | Take the digit sum of 4444 to the power 4444, then the digit sum of that, then once more. Uses the fact behind Steps 1–3: carries change a digit sum only by multiples of 9. |

**Explore** — *Status: known result (Kummer's theorem, 1852).*
Add two numbers in base 2 and count the carries. For example, 5 + 3 is 101 + 11 in base 2, with 3 carries.
Now count how many times 2 divides 56, the number of ways to choose 3 things from 8. Try other pairs.
What do you notice?

**Famous open problem — powers of 2 in base 3** (Erdős, about 1978; status checked 2026-09-26)
In base 3, 4 is written 11 and 256 is written 100111: only the digits 0 and 1. Erdős conjectured that from
2⁹ on, every power of 2 uses the digit 2 somewhere in base 3. Computers have checked every exponent up to
about 5.9 × 10²¹, but there is no proof: carries between digits are hard to control, just as in this ladder.

**Research field:** digit sums and carries (combinatorial number theory).

---

## 6. Honest assessment

- **Levels:** the Challenges are AIME / junior-olympiad level. Short-answer conversion rarely reaches true IMO
  difficulty; that is a known trade-off of the format.
- **Originality:** Ladders 0, A and F are closest to our own DNA-driven generation (F rebuilds the idea of
  IMO Shortlist 2022 A7 with new objects and questions; no wording is reused). Ladders B–E rest on
  classic, well-known themes; their DNA links (marked "loose") are at the level of strategy, not content.
- **Still needed before release:** independent-solver pass on every step (ambiguity check), human review,
  web search for each Challenge's specific twist, and difficulty calibration against the AMC 8 / Kangaroo /
  MATHCOUNTS materials.

---

## 7. Sources

- Related Olympiad problems: searched in `/Volumes/T7/Projects/Math_Materials/Math` — IMO papers 1959–2005 and
  2025, IMO Shortlist 2006–2024 (the 1979 paper is in Bulgarian and was not searched). Official statements:
  [imo-official.org](https://www.imo-official.org/problems.aspx). No AMC 12 material is in the folder yet.

- Chip-firing: [Wikipedia](https://en.wikipedia.org/wiki/Chip-firing_game),
  [ScienceDirect](https://www.sciencedirect.com/science/article/pii/S0012365X05002967),
  [arXiv math/0010315](https://arxiv.org/html/math/0010315v1)
- Collatz: [arXiv 2502.16743](https://arxiv.org/pdf/2502.16743), [Collatz Conjecture Challenge](https://ccchallenge.org/)
- Wilf's conjecture: [arXiv 2501.04417](https://arxiv.org/html/2501.04417v1),
  [arXiv 2306.09876](https://arxiv.org/abs/2306.09876)
- Powers of 2 in base 3 (Erdős): [erdosproblems.com #406](https://www.erdosproblems.com/forum/thread/406),
  [arXiv 2202.13256](https://arxiv.org/abs/2202.13256) (checked up to n ≤ 2·3⁴⁵),
  [arXiv 2511.03861](https://arxiv.org/abs/2511.03861) (Nov 2025: still open)
- No-three-in-line: [Wikipedia](https://en.wikipedia.org/wiki/No-three-in-line_problem),
  [Flammenkamp](https://wwwhomes.uni-bielefeld.de/achim/no3in/readme.html),
  [MathWorld](https://mathworld.wolfram.com/No-Three-in-a-LineProblem.html)
- Fibonacci primes, 196 / Lychrel numbers, Gauss circle problem, Frobenius problem (Curtis 1990): standard
  references; add specific citations before release.
