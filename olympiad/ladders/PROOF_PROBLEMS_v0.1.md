# Proof problems v0.1

Proof problems shown after the Challenge of each ladder (button "Olympiad proof problems"). No points, no
grading: statement, hints one at a time, then a full written proof.

- Date: 2026-10-06
- All problems and proofs are our own; each one proves the idea behind its ladder.
- Imported by `import_extras.py` together with the related problems and research sections of LADDERS_v0.1.md.
- Format (parsed by the import script): `## Ladder <key> — <name>`, then per problem `### <title>`,
  a `Level:` line, the statement, `Hint:` paragraphs, and a `Solution:` that runs to the next heading.
  Math goes between `$...$` (rendered by MathJax on the site).

---

## Ladder 0 — The Candy Game

### The game always ends
Level: Warm-up proof

Any number of kids each have some candies. A kid who has at least 2 more candies than another kid may give that kid 1 candy. Prove that, however the kids choose their moves, the game always ends.

Hint: Look for a whole number that gets smaller with every move.

Hint: Try adding up the squares of everyone's number of candies.

Solution:
Let $S$ be the sum of the squares of all the kids' numbers of candies. Suppose a kid with $a$ candies gives one to a kid with $b$ candies, where $a \ge b + 2$. Only these two numbers change, so $S$ changes by
$$(a-1)^2 + (b+1)^2 - a^2 - b^2 = -2(a - b - 1) \le -2.$$
So every move lowers $S$ by at least 2. But $S$ is a whole number that is never negative, so it cannot go down forever: after at most $S/2$ moves no move is possible, and the game has ended.

### Three kids: exactly gap minus one moves
Level: Olympiad proof

Three kids play the candy game. The richest kid has $x$ candies and the poorest has $z$, with $G = x - z \ge 2$. Prove that the game lasts at most $G - 1$ moves, and that the kids can choose their moves so that it lasts exactly $G - 1$ moves.

Hint: Follow the gap between the richest and the poorest kid. What can one move do to it?

Hint: A move is possible exactly when the gap is at least 2.

Hint: For the second part, show that while the gap is at least 3 there is always a move that lowers it by exactly 1.

Solution:
At any moment write the three amounts as $p \ge q \ge r$ and call $g = p - r$ the gap. If $g \ge 2$ the richest kid can give to the poorest, and if $g \le 1$ nobody has 2 more than anyone else. So the game goes on exactly while $g \ge 2$.

Claim: every move lowers the gap by at least 1. There are three kinds of moves.
(i) From the kid with $p$ to the kid with $q$ (needs $p \ge q + 2$): the amounts become $p - 1, q + 1, r$, and $p - 1 \ge q + 1 > r$, so the new gap is $g - 1$.
(ii) From the kid with $q$ to the kid with $r$ (needs $q \ge r + 2$): the amounts become $p, q - 1, r + 1$ with $p \ge q - 1 \ge r + 1$, so the new gap is $g - 1$.
(iii) From the kid with $p$ to the kid with $r$: the amounts become $p - 1, q, r + 1$. If $q < p$, the new largest is $p - 1$ and the new smallest is at least $r$, so the gap is at most $g - 1$. If $q = p$, the new largest is $p$ and the new smallest is $r + 1$ (because $q = p \ge r + 2$), so the gap is $g - 1$.

Upper bound: the gap starts at $G$ and drops by at least 1 per move, so before move number $k$ it is at most $G - (k - 1)$. That move needs a gap of at least 2, so $G - (k - 1) \ge 2$, that is $k \le G - 1$.

Exactly $G - 1$ moves: while $g \ge 3$, use move (ii) if $q \ge r + 2$. Otherwise $q \le r + 1$, so $p \ge r + 3 \ge q + 2$ and move (i) is allowed. Either way the gap drops by exactly 1. After $G - 2$ such moves the gap is exactly 2, so one more move is possible. That makes $(G - 2) + 1 = G - 1$ moves.

---

## Ladder A — Fibonacci Stairs

### Every number is a sum without neighbours
Level: Warm-up proof

Use the list $1, 2, 3, 5, 8, 13, 21, \ldots$, where each number is the sum of the two before it. Prove that every positive whole number can be written as a sum of different numbers from the list so that no two of the numbers used are next to each other in the list.

Hint: Be greedy: take the largest list number that fits.

Hint: If $F$ is the largest list number that fits into $n$, compare what is left, $n - F$, with the list number just before $F$.

Solution:
Call the list $F_1 = 1, F_2 = 2$ and $F_{k+1} = F_k + F_{k-1}$. We use strong induction on $n$. The numbers 1 and 2 are in the list.

Take $n \ge 3$ and assume every smaller positive number has such a sum. Let $F_k$ be the largest list number with $F_k \le n$. If $n = F_k$ we are done. Otherwise $F_k < n < F_{k+1} = F_k + F_{k-1}$, so
$$0 < n - F_k < F_{k-1}.$$
By the induction hypothesis, $n - F_k$ is a sum of different, non-neighbouring list numbers. All of them are less than $F_{k-1}$, so the largest is at most $F_{k-2}$. Adding $F_k$ therefore creates no neighbours, and we get the sum we want for $n$.

### ...and the sum is unique
Level: Olympiad proof

Prove that the sum in the previous problem is unique: a positive whole number cannot be written in two different ways as a sum of different, non-neighbouring numbers from the list $1, 2, 3, 5, 8, \ldots$

Hint: First show: if such a sum has largest number $F_k$, then the whole sum is less than $F_{k+1}$.

Hint: Given two different sums with the same total, cross out the numbers they share and compare the largest numbers left.

Solution:
Lemma: a sum of different, non-neighbouring list numbers whose largest number is $F_k$ is less than $F_{k+1}$. For $k = 1$ the sum is $1 < 2$; for $k = 2$ it is $2 < 3$ (the number 1 is a neighbour of 2). For $k \ge 3$, the other numbers in the sum form a sum of the same kind with largest number at most $F_{k-2}$, so by induction they add up to less than $F_{k-1}$ (or to 0). The whole sum is then less than $F_k + F_{k-1} = F_{k+1}$.

Now suppose two different sets $A$ and $B$ of non-neighbouring list numbers have the same total. Remove the numbers they share. What is left, $A'$ and $B'$, still has no neighbours, still has equal totals, and the two sets have no number in common. They are not both empty, because $A \ne B$; and if one were empty its total would be 0 while the other's is positive. So both are non-empty. Let their largest numbers be $F_a$ and $F_b$; they differ, say $a > b$. By the lemma,
$$\text{total of } B' < F_{b+1} \le F_a \le \text{total of } A',$$
which contradicts the equal totals. So the sum is unique.

---

## Ladder B — Coins You Can't Make

### The largest amount you cannot pay
Level: Warm-up proof

Coins are worth $a$ and $b$, where $a, b \ge 2$ are whole numbers with no common factor larger than 1. An amount can be paid if it equals $ax + by$ for some whole numbers $x, y \ge 0$. Prove that the amount $ab - a - b$ cannot be paid.

Hint: Suppose $ax + by = ab - a - b$ and move everything to one side: $a(x + 1) + b(y + 1) = ab$.

Hint: What does this say about $y + 1$ when you look at remainders after dividing by $a$?

Solution:
Suppose $ax + by = ab - a - b$ with $x, y \ge 0$. Then $a(x + 1) + b(y + 1) = ab$. The terms $a(x+1)$ and $ab$ are multiples of $a$, so $a$ divides $b(y + 1)$. Since $a$ and $b$ have no common factor, $a$ divides $y + 1$, so $y + 1 \ge a$. In the same way $b$ divides $x + 1$, so $x + 1 \ge b$. But then
$$a(x + 1) + b(y + 1) \ge ab + ab = 2ab > ab,$$
a contradiction. So $ab - a - b$ cannot be paid.

### Every larger amount can be paid
Level: Olympiad proof

With coins worth $a$ and $b$ as before (no common factor), prove that every amount larger than $ab - a - b$ can be paid.

Hint: Look at the numbers $N, N - b, N - 2b, \ldots, N - (a-1)b$. What are their remainders when divided by $a$?

Hint: One of them is a multiple of $a$. Show it is not negative.

Solution:
Let $N > ab - a - b$. The $a$ numbers $N - yb$ for $y = 0, 1, \ldots, a - 1$ all have different remainders when divided by $a$: if two of them, with $y_1 \ne y_2$, had the same remainder, then $a$ would divide $(y_1 - y_2)b$, so $a$ would divide $y_1 - y_2$, which is impossible because $0 < |y_1 - y_2| < a$. So these $a$ numbers use every remainder once, and one of them, say $N - y_0 b$, is a multiple of $a$.

It is not negative: $N - y_0 b \ge N - (a - 1)b > (ab - a - b) - ab + b = -a$. A multiple of $a$ that is larger than $-a$ is at least 0. So $N - y_0 b = ax$ with $x \ge 0$, and $N = ax + y_0 b$ can be paid.

### Exactly half of the small amounts
Level: Olympiad proof

With coins worth $a$ and $b$ as before, prove that exactly $\frac{(a-1)(b-1)}{2}$ positive amounts cannot be paid.

Hint: Pair each amount $N$ from 0 to $ab - a - b$ with $ab - a - b - N$.

Hint: Show that in every pair exactly one of the two amounts can be paid. Write $N = ax + by$ with $0 \le y \le a - 1$ and $x$ allowed to be negative.

Solution:
Let $F = ab - a - b$. By the previous problem, every unpayable amount lies between 0 and $F$. Pair $N$ with $F - N$ for $N = 0, 1, \ldots, F$.

Not both can be paid: otherwise their sum $F$ could be paid, which the first problem rules out.

At least one can be paid: as in the previous problem, we can write $N = ax + by$ with $0 \le y \le a - 1$ and $x$ a whole number, possibly negative. If $x \ge 0$, then $N$ can be paid. If $x \le -1$, then
$$F - N = a(-x - 1) + b(a - 1 - y),$$
and both $-x - 1$ and $a - 1 - y$ are at least 0, so $F - N$ can be paid.

So exactly half of the $F + 1 = (a - 1)(b - 1)$ amounts from 0 to $F$ cannot be paid, and none of them is 0. That gives $\frac{(a-1)(b-1)}{2}$ positive amounts.

---

## Ladder C — Reverse and Add

### No carries, then a palindrome
Level: Warm-up proof

Let $\overline{n}$ be the number $n$ with its digits written in reverse order. Prove that if the column addition $n + \overline{n}$ has no carries, then the result is a palindrome.

Hint: Write the digits of $n$ as $d_{L-1} \ldots d_1 d_0$. Which digit of $\overline{n}$ sits in column $i$?

Solution:
Write $n = d_{L-1} \ldots d_1 d_0$, so the digit in column $i$ (counting from the right, starting at 0) is $d_i$. In $\overline{n}$ the digit in column $i$ is $d_{L-1-i}$ (if $n$ ends in zeros, $\overline{n}$ simply has leading zeros). Without carries, column $i$ of the sum is
$$d_i + d_{L-1-i},$$
and column $L - 1 - i$ holds $d_{L-1-i} + d_i$, the same digit. So the sum reads the same from both ends.

### Even length gives a multiple of 11
Level: Olympiad proof

Prove that if $n$ has an even number of digits, then $n + \overline{n}$ is a multiple of 11.

Hint: $10$ leaves remainder $-1$ when divided by 11, so $10^i$ leaves remainder $(-1)^i$.

Hint: When the number of digits $L$ is even, the positions $i$ and $L - 1 - i$ have opposite parity.

Solution:
Since $10 \equiv -1 \pmod{11}$, we have $n = \sum_i d_i 10^i \equiv \sum_i (-1)^i d_i \pmod{11}$. In $\overline{n}$ the digit $d_i$ sits in position $L - 1 - i$. If $L$ is even, $L - 1$ is odd, so $(-1)^{L-1-i} = -(-1)^i$, and
$$\overline{n} \equiv -\sum_i (-1)^i d_i \pmod{11}.$$
Adding, $n + \overline{n} \equiv 0 \pmod{11}$.

---

## Ladder D — No Three in a Line

### At most 2n dots
Level: Warm-up proof

Dots are placed on the points of an $n \times n$ grid so that no three dots lie on one straight line. Prove that there are at most $2n$ dots.

Hint: Look at one row of the grid.

Solution:
Each row of the grid is a straight line, so it holds at most 2 dots. There are $n$ rows, so there are at most $2n$ dots.

### A parabola that works for every prime
Level: Olympiad proof

Let $p$ be an odd prime. Use the grid of points $(x, y)$ with $x, y \in \{0, 1, \ldots, p - 1\}$. For each $x$, put a dot at $(x, r_x)$, where $r_x$ is the remainder when $x^2$ is divided by $p$. Prove that no three of these $p$ dots lie on one straight line.

Hint: The dots are in different columns, so a line through three of them is not vertical. Write "same slope" without fractions.

Hint: Reduce the equation modulo $p$ using $r_x \equiv x^2$, and factor.

Solution:
Take three dots with different first coordinates $x_1, x_2, x_3$ and second coordinates $r_1, r_2, r_3$. They lie on one line exactly when
$$(r_2 - r_1)(x_3 - x_1) = (r_3 - r_1)(x_2 - x_1).$$
Suppose this holds. Since $r_i \equiv x_i^2 \pmod p$, reducing modulo $p$ gives
$$(x_2^2 - x_1^2)(x_3 - x_1) - (x_3^2 - x_1^2)(x_2 - x_1) \equiv 0 \pmod p.$$
The left side factors as $(x_2 - x_1)(x_3 - x_1)\big[(x_2 + x_1) - (x_3 + x_1)\big] = (x_2 - x_1)(x_3 - x_1)(x_2 - x_3)$. Because $p$ is prime, it divides one of the three differences. But each difference is between $-(p-1)$ and $p - 1$ and is not 0, so $p$ cannot divide it. This contradiction shows no three dots are on a line. (So a $p \times p$ grid always has room for at least $p$ dots.)

---

## Ladder E — Dots on a Circle

### Remainder 3 means no points
Level: Warm-up proof

Prove that if a whole number $N$ leaves remainder 3 when divided by 4, then there are no whole numbers $x, y$ with $x^2 + y^2 = N$.

Hint: What remainders can a square leave when divided by 4?

Solution:
An even number is $2k$ and its square is $4k^2$, remainder 0. An odd number is $2k + 1$ and its square is $4k^2 + 4k + 1$, remainder 1. So $x^2 + y^2$ leaves remainder $0 + 0$, $0 + 1$ or $1 + 1$, that is 0, 1 or 2, never 3.

### Sums of two squares multiply
Level: Olympiad proof

Prove that if $N$ and $M$ are both sums of two squares of whole numbers, then so is $NM$. Use it to write $65 = 5 \times 13$ as a sum of two squares in two different ways.

Hint: Try to write $(a^2 + b^2)(c^2 + d^2)$ as $(\ldots)^2 + (\ldots)^2$. Expand $(ac - bd)^2 + (ad + bc)^2$.

Solution:
Let $N = a^2 + b^2$ and $M = c^2 + d^2$. Expanding,
$$(ac - bd)^2 + (ad + bc)^2 = a^2c^2 - 2abcd + b^2d^2 + a^2d^2 + 2abcd + b^2c^2 = (a^2 + b^2)(c^2 + d^2).$$
So $NM$ is a sum of two squares. With $5 = 1^2 + 2^2$ and $13 = 2^2 + 3^2$: $(1 \cdot 2 - 2 \cdot 3)^2 + (1 \cdot 3 + 2 \cdot 2)^2 = 16 + 49 = 65$. Using $13 = 3^2 + 2^2$ instead: $(1 \cdot 3 - 2 \cdot 2)^2 + (1 \cdot 2 + 2 \cdot 3)^2 = 1 + 64 = 65$.

### Primes of the form 4k + 3
Level: Olympiad proof

Let $p$ be a prime that leaves remainder 3 when divided by 4. Prove that if $p$ divides $x^2 + y^2$ for whole numbers $x, y$, then $p$ divides both $x$ and $y$. (This is why the factor $3^8$ in $2025^2$ adds no new points in the Challenge.)

Hint: If $p$ does not divide $x$, there is a whole number $t$ with $tx \equiv y \pmod p$. What is $t^2$ modulo $p$?

Hint: Use Fermat's little theorem: $t^{p-1} \equiv 1 \pmod p$ when $p$ does not divide $t$.

Solution:
Suppose $p$ does not divide $x$. Then $x$ has an inverse modulo $p$, so there is a $t$ with $y \equiv tx \pmod p$. From $x^2 + y^2 \equiv 0$ we get $x^2(1 + t^2) \equiv 0$, and since $p$ does not divide $x^2$, $t^2 \equiv -1 \pmod p$. Then $p$ does not divide $t$, and Fermat's little theorem gives
$$1 \equiv t^{p-1} = (t^2)^{\frac{p-1}{2}} \equiv (-1)^{\frac{p-1}{2}} \pmod p.$$
Because $p = 4k + 3$, the exponent $\frac{p-1}{2} = 2k + 1$ is odd, so the right side is $-1$. Then $p$ divides $1 - (-1) = 2$, impossible for an odd prime. So $p$ divides $x$, then $p$ divides $y^2$, and since $p$ is prime it divides $y$.

---

## Ladder F — Carries Cost Nine

### Every carry costs exactly 9
Level: Warm-up proof

Let $s(n)$ be the sum of the digits of $n$. Prove that when $a$ and $b$ are added in columns with $K$ carries, $s(a) + s(b) - s(a + b) = 9K$.

Hint: Write down what happens in one column: digit of $a$ + digit of $b$ + carry in = digit of the sum + 10 × carry out.

Hint: Add these equations over all columns. Each carry appears once as "carry out" and once as "carry in" (or as the new leading digit).

Solution:
Number the columns $0, 1, \ldots, L - 1$ from the right, let $a_i, b_i$ be the digits of $a$ and $b$ (with leading zeros), and let $c_i$ be the carry into column $i$, with $c_0 = 0$. Column $i$ gives
$$a_i + b_i + c_i = e_i + 10c_{i+1},$$
where $e_i$ is digit $i$ of $a + b$. The last carry $c_L$ becomes the leading digit of $a + b$, so $s(a + b) = e_0 + \cdots + e_{L-1} + c_L$. Add the column equations and write $K = c_1 + \cdots + c_L$:
$$s(a) + s(b) + (K - c_L) = \big(s(a + b) - c_L\big) + 10K.$$
So $s(a) + s(b) - s(a + b) = 9K$. Each $c_i$ is 0 or 1, so $K$ is the number of carries.

### Digit sum of a square
Level: Olympiad proof

Prove that for every positive whole number $m$ there is a number $n$ with $s(n) = m$ and $s(n^2) = m^2$.

Hint: Use a number made of $m$ ones separated by many zeros, so that nothing collides when you square it.

Hint: Put the ones at positions that are powers of 2. Sums of two different powers of 2 are all different.

Solution:
Let $n = 10^{2^1} + 10^{2^2} + \cdots + 10^{2^m}$, so $s(n) = m$. Then
$$n^2 = \sum_{i=1}^{m} 10^{2^{i+1}} + \sum_{1 \le i < j \le m} 2 \cdot 10^{2^i + 2^j}.$$
The exponents $2^{i+1}$ have one 1 in binary and the exponents $2^i + 2^j$ (with $i < j$) have two, and every whole number has only one binary form. So all these exponents are different: every term is its own digit of $n^2$, with digits 1 and 2 only and no carries. Hence
$$s(n^2) = m \cdot 1 + \binom{m}{2} \cdot 2 = m + m(m - 1) = m^2.$$
