# Solver Report: Grace's Coins — Compute D(1000) + D(3000)

## 1. Problem Restatement

Grace has 2023 coins each worth \$1, plus one additional coin worth \$N (N a positive
integer), for 2024 coins total. She partitions all 2024 coins into two **nonempty**
groups so that the positive difference between the two groups' total values is as
small as possible; call this minimum difference $D(N)$.

**Compute $D(1000) + D(3000)$.**

## 2. Well-posedness

The problem is well-posed and unambiguous:

- The set of coins is fully specified (2023 indistinguishable-in-value \$1 coins, one
  distinguishable \$N coin).
- "Divides into two nonempty groups" is a partition of the 2024 individual coins into
  two nonempty parts — coins are atomic (not further divisible), which is the standard
  and only sensible reading.
- "Positive difference between the two groups' total values" is unambiguous: $|{\rm value}(A) - {\rm value}(B)|$.
- Minimizing over all such partitions gives a well-defined minimum $D(N)$ for every
  positive integer $N$, since the space of partitions is finite and nonempty (2024 ≥ 2
  coins, so nonempty two-part partitions exist).

There is no ambiguity about whether $N$ itself could be less than or greater than 2023,
whether coins can be split, or how "difference" is measured. The only two boundary
considerations (handled carefully below) are (a) that the \$N coin cannot be split
across groups, and (b) that both groups must be nonempty, which restricts how many of
the 2023 unit coins can be moved to the side containing the $N$ coin.

## 3. Derivation of a General Formula for $D(N)$

**Setup.** The \$N coin must be entirely in one of the two groups (call this group
$A$); the other group $B$ gets the remaining unit coins. Because all 2023 remaining
coins are worth exactly \$1 each and are otherwise interchangeable, the only thing that
matters is *how many* of them go into group $A$ versus group $B$ — any count is
achievable by simply moving that many unit coins.

Let $x$ = number of \$1 coins placed together with the \$N coin in group $A$, where
$x \in \{0, 1, \dots, 2023\}$. Then:

- Group $A$ value $= N + x$
- Group $B$ value $= 2023 - x$

**Nonemptiness constraint.** Group $A$ automatically contains the $N$-coin, so it is
always nonempty. Group $B$ must also be nonempty, i.e. it must contain at least one
unit coin (since the $N$ coin is in $A$), forcing
$$2023 - x \ge 1 \quad\Longleftrightarrow\quad x \le 2022.$$
So $x$ ranges over the integers $0, 1, \dots, 2022$ (2023 possible values).

**Objective.** The difference is
$$
f(x) \;=\; \big(N+x\big) - \big(2023-x\big) \;=\; N - 2023 + 2x,
$$
and we want $D(N) = \min_{0 \le x \le 2022} |f(x)|$.

Note $f$ is strictly increasing in $x$ (slope $+2$), and as $x$ ranges over consecutive
integers, $f(x)$ takes every value of a fixed parity (namely the parity of $N-2023$,
which — since 2023 is odd — is the *opposite* parity of $N$; equivalently $f(x)$ is
odd when $N$ is even, and even when $N$ is odd) in steps of 2, running from
$f(0) = N-2023$ up to $f(2022) = N+2021$.

**Case 1: $N \le 2023$.**
The unconstrained real zero of $f$ is at $x^\*=\tfrac{2023-N}{2} \in [0, 1011.5]$,
which lies inside the feasible range $[0,2022]$ for every $N$ in $1,\dots,2023$. Hence
the constraint $x\le 2022$ never binds, and we can get as close to 0 as parity allows:

- If $N$ is **odd**: $2023-N$ is even, so $x^\*$ is an integer in range, giving $f(x^\*)=0$. Thus $D(N)=0$.
- If $N$ is **even**: $2023-N$ is odd, so $x^\*$ is a half-integer; the two nearest
  integers $\lfloor x^\*\rfloor,\lceil x^\*\rceil$ both lie in $[0,2022]$ and give
  $f=\pm 1$. Thus $D(N)=1$.

**Case 2: $N > 2023$.**
Now $x^\* = \tfrac{2023-N}{2} < 0$, outside the feasible range. Since $f$ is increasing,
the minimum of $|f(x)|$ over $x\in[0,2022]$ is attained at the boundary $x=0$ (the
value closest to the true unconstrained root), giving
$$
D(N) = f(0) = N - 2023.
$$
(Equivalently: the group containing the $N$-coin is worth at least $N$ regardless of
partition, while the opposite group can be worth at most 2023 — the sum of *all* unit
coins — so the difference can never be less than $N-2023$, and this bound is achieved
by putting the $N$-coin alone against all 2023 unit coins together.)

**Summary — closed form:**
$$
D(N) = \begin{cases}
0, & N \text{ odd},\; N \le 2023 \\
1, & N \text{ even},\; N \le 2023 \\
N - 2023, & N > 2023
\end{cases}
$$
(The three cases agree at the boundary $N=2023$, where all give $0$.)

## 4. Small-Case Brute-Force Verification

To validate the reasoning, I replaced 2023 by a small **odd** number $k=5$ (preserving
the essential parity structure — 2023 is odd) and brute-force enumerated *all* subset
partitions of $k$ unit coins plus one $N$-coin, for $N=1,\dots,14$, comparing against
the formula
$$D(N)=\begin{cases}0,& N\text{ odd},\,N\le k\\ 1,& N\text{ even},\,N\le k\\ N-k,& N>k.\end{cases}$$

Brute-force script (Python, exhaustive over all $2^{k+1}-2$ nonempty-proper-subset
partitions):

```
k = 5
N :  1  2  3  4  5  6  7  8  9 10 11 12 13 14
brute: 0  1  0  1  0  1  2  3  4  5  6  7  8  9
formula: 0 1 0 1 0 1 2 3 4 5 6 7 8 9
```

All 14 test cases matched exactly (**OK** for every $N$), confirming both the
"$0$/$1$ alternating by parity" regime for $N\le k$ and the "$N-k$" regime for $N>k$,
including correct behavior right at and around the boundary $N=k$.

This small-case check exercises exactly the same combinatorial mechanism used in the
full-size problem (2023 in place of $k$), so it strongly corroborates the general
derivation; the argument itself is a simple monotonicity/parity argument that does not
depend on the specific size of $k$ beyond $k$ being odd, which 2023 is.

## 5. Applying the Formula

- **$N = 1000$:** $1000 \le 2023$ and $1000$ is even $\Rightarrow D(1000) = 1$.
- **$N = 3000$:** $3000 > 2023 \Rightarrow D(3000) = 3000 - 2023 = 977$.

$$
D(1000) + D(3000) = 1 + 977 = 978.
$$

## 6. Edge Cases / Potential Ambiguities Considered

- **Could the \$N coin be split?** No — coins are atomic physical objects; "divides all
  2024 coins into two groups" clearly means partitioning the *coins*, not their value.
  This is the only sensible reading and is standard for this well-known problem type.
- **Nonempty groups.** This constraint only matters in the regime $N>2023$ pushed to
  the boundary $x=0$; it does not affect the answer since $x=0$ (all unit coins in the
  opposite group) automatically satisfies nonemptiness for both groups whenever
  $2023\ge 1$, which it is. It also correctly rules out degenerate "one group empty"
  configurations, but the optimum was never at such a degenerate point anyway (except
  exactly at the natural boundary $x=0$, which is still a valid nonempty partition).
- **Parity of 2023.** The clean 0/1 alternation for $N\le 2023$ relies on 2023 being
  odd; this was used correctly throughout and verified in the brute-force check with
  another odd modulus ($k=5$).
- **Boundary $N=2023$:** all three cases of the formula agree ($D=0$), so there's no
  discontinuity or inconsistency there.
- No other ambiguity was found; the problem has a single well-defined numerical answer.

## 7. Final Answer

$$
\boxed{D(1000) + D(3000) = 978}
$$

**Confidence: High.** The derivation is a short, rigorous monotonicity/parity argument
with no delicate edge cases beyond the ones explicitly checked, and it was verified by
exhaustive brute-force enumeration on a structurally identical small case (odd unit-coin
count with the same case-boundary at $N=k$), matching the formula in all 14 test points.
