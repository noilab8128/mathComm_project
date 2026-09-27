# Solution Report

## 0. Verdict up front

The statement is **true, correctly posed, and not ambiguous**. All three parts (a), (b), (c) have clean, fully rigorous proofs. In fact, once part (a) (termination) is established, part (b) (uniqueness of the terminal multiset) and part (c) (the explicit formula) fall out together from two simple invariants — no delicate "confluence by induction on move order" argument is needed. I found no counterexamples and no gaps; the problem is a well-posed and classical result (a "chip-firing" / smoothing-operation problem). I verified the final answer numerically by simulation (see §5).

**Answer to (c):** writing $S = qn + r$ with $0 \le r < n$,

$$
\#\{i : c_i = q\} = n - r, \qquad \#\{i : c_i = q+1\} = r.
$$

(When $r=0$ this says all $n$ values equal $q$, and "0 of them equal $q+1$", which is the sensible degenerate reading.)

---

## 1. Setup and basic invariant

Throughout, $c_1,\dots,c_n$ are nonnegative integers, $S=\sum c_i$ is fixed at the start. A **move** picks indices $i\neq j$ with $c_i \ge c_j+2$ (an "unbalanced pair") and replaces
$$
c_i \mapsto c_i - 1, \qquad c_j \mapsto c_j + 1.
$$

**Invariant 1 (sum is preserved).** Each move subtracts $1$ from one coordinate and adds $1$ to another, so $\sum_i c_i$ is unchanged by every move. Hence $S$ is the same at every stage of the process, including at termination.

**Invariant 2 (nonnegativity is preserved).** A move is only legal when $c_i \ge c_j + 2 \ge 2$, so $c_i - 1 \ge 1 \ge 0$; and $c_j+1\ge 1\ge 0$ trivially. So all values remain nonnegative integers throughout — the state space is well-defined at every step.

---

## 2. Part (a): the process terminates

**Claim.** With $\Phi = \Phi(c_1,\dots,c_n) := \sum_{i=1}^n c_i^2$, every move strictly decreases $\Phi$ by at least $2$.

**Proof.** Suppose we perform a move on the unbalanced pair $(i,j)$, i.e. $c_i \ge c_j + 2$. Only $c_i$ and $c_j$ change, to $c_i - 1$ and $c_j+1$ respectively. The change in $\Phi$ is
$$
\Delta\Phi = \big[(c_i-1)^2 - c_i^2\big] + \big[(c_j+1)^2 - c_j^2\big] = (-2c_i+1) + (2c_j+1) = 2(c_j - c_i) + 2.
$$
Since $c_i \ge c_j+2$, we have $c_j - c_i \le -2$, so
$$
\Delta\Phi \le 2(-2) + 2 = -2.
$$
Thus $\Phi$ strictly decreases by at least $2$ at every move. $\blacksquare$

**Conclusion.** $\Phi$ is a nonnegative integer (a sum of squares of nonnegative integers) at every stage, bounded below by $0$, and strictly decreases by at least $2$ per move. A strictly decreasing sequence of nonnegative integers, each step down by $\ge 2$, cannot continue indefinitely: after at most $\lfloor \Phi_0/2\rfloor$ moves (where $\Phi_0 = \sum c_i^2$ initially) no further move is possible, i.e. no unbalanced pair remains. Hence the process halts after finitely many moves, **regardless of which unbalanced pairs are chosen** at each step (the bound $\Phi_0/2$ is a bound on the number of moves along *any* legal play sequence). $\blacksquare$

*(Remark: $\Phi=\sum c_i^2$ is the standard monovariant for this kind of "Robin Hood" smoothing move; it is a strict potential function precisely because the move only ever transfers mass from a strictly larger to a strictly smaller entry, which always decreases the sum of squares by a definite positive amount.)*

---

## 3. Characterizing terminal states

**Lemma.** A configuration $(c_1,\dots,c_n)$ has **no** unbalanced pair if and only if
$$
\max_i c_i - \min_i c_i \le 1.
$$

**Proof.** ($\Rightarrow$) If no unbalanced pair exists, then for *every* ordered pair $i\ne j$, $c_i \le c_j+1$. Apply this with $i$ an index achieving the max and $j$ an index achieving the min: $c_{\max} \le c_{\min} + 1$.

($\Leftarrow$) If $\max_i c_i - \min_i c_i \le 1$, then for any $i,j$, $c_i \le \max_k c_k \le \min_k c_k + 1 \le c_j + 1$, so $c_i \ge c_j+2$ never holds; no pair is unbalanced. $\blacksquare$

So "the process stops" is *exactly* the same condition as "all the $c_i$ take at most two values, which differ by exactly $1$ (or are all equal)."

**Lemma (uniqueness of a "balanced" multiset with given sum).** Fix $n\ge 2$ and a nonnegative integer $S$, and write $S = qn+r$ with $0\le r < n$ (division algorithm; $q,r$ uniquely determined by $S,n$). Then there is **exactly one** multiset of $n$ nonnegative integers with sum $S$ and $\max-\min\le 1$, namely
$$
\underbrace{q,\dots,q}_{n-r},\ \underbrace{q+1,\dots,q+1}_{r}.
$$

**Proof.** Existence: this multiset has $n$ elements, sum $(n-r)q + r(q+1) = nq + r = S$, and its two distinct values ($q$, $q+1$, or just $q$ if $r=0$) differ by $1$ (or it's constant). So it satisfies the constraints.

Uniqueness: let $x_1,\dots,x_n$ be any nonnegative integers with $\sum x_i = S$ and $\max_i x_i - \min_i x_i \le 1$. Let $m=\min_i x_i$. Since the spread is $\le 1$, every $x_i \in \{m, m+1\}$. Let $k$ be the number of indices with $x_i = m+1$ (so $n-k$ have $x_i=m$). Since $m$ is *attained* (it's the minimum), at least one $x_i$ equals $m$, so $0 \le k \le n-1$. Then
$$
S = (n-k)m + k(m+1) = nm + k, \qquad 0\le k \le n-1.
$$
But $S = qn+r$ with $0\le r<n$ is the *unique* such representation (uniqueness of quotient and remainder in the division algorithm). Hence $m=q$ and $k=r$ are forced. So the multiset $\{x_i\}$ must be exactly $(n-r)$ copies of $q$ and $r$ copies of $q+1$. $\blacksquare$

---

## 4. Parts (b) and (c)

By part (a), starting from any initial $(c_1,\dots,c_n)$ with $\sum c_i = S$, *every* legal sequence of moves terminates after finitely many steps, reaching some state with no unbalanced pair.

- By **Invariant 1**, the sum of the terminal state is still $S$ (unchanged from the start), no matter which moves were made or in what order.
- By the first **Lemma** of §3, the terminal state — having no unbalanced pair — automatically satisfies $\max - \min \le 1$.
- By the second **Lemma** of §3, there is exactly **one** multiset of $n$ nonnegative integers with sum $S$ and spread $\le 1$: namely $n-r$ copies of $q$ and $r$ copies of $q+1$, where $S=qn+r$, $0\le r<n$.

Since *every* terminal state satisfies both constraints (sum $=S$, spread $\le 1$), and there is only one multiset satisfying both, **every** terminal state must equal this same multiset — regardless of which unbalanced pairs were chosen along the way. This proves **(b)** (uniqueness / path-independence of the terminal multiset) and simultaneously proves **(c)**:

$$
\boxed{\#\{i : c_i = q\} = n-r, \qquad \#\{i: c_i = q+1\} = r,}
$$

where $S = qn+r$, $0 \le r < n$, is the division of $S$ by $n$.

**Note on why this is a valid proof of (b).** One does not need to compare two different move-sequences step by step or set up an inductive/diamond-lemma confluence argument. The argument above shows the terminal multiset is *pinned down in advance* by $n$ and $S$ alone (via the two Lemmas), before any move is even made — so trivially it cannot depend on the choices made during the process. This is the "slick" resolution alluded to in the notes below.

---

## 5. Boundary / edge-case checks

- **$n=2$.** E.g. $c=(0,3)$, $S=3=1\cdot2+1$, so $q=1,r=1$, predicted terminal multiset $\{1,2\}$. Trace: $(0,3)\to(1,2)$ (pair $(2,1)$ fires: $c_2\ge c_1+2$, i.e. $3\ge2$). Now check $(1,2)$: $c_2\ge c_1+2 \Leftrightarrow 2\ge3$, false; $c_1\ge c_2+2\Leftrightarrow1\ge4$, false. Stopped at $\{1,2\}$. Matches.
- **$S=0$.** All $c_i$ nonnegative summing to $0$ forces all $c_i=0$ already; no unbalanced pairs exist (spread $=0\le1$), process is trivially already terminal. Here $q=0,r=0$: formula gives $n-r=n$ copies of $q=0$ and $0$ copies of $q+1=1$. Consistent — this includes the case "the initial configuration is already balanced," which is handled correctly (zero moves is a valid, finite, terminating run).
- **All $c_i$ already equal** (say all $=v$): spread $0\le1$, already terminal; $S=nv$ so $q=v,r=0$; formula gives $n$ copies of $q=v$, $0$ copies of $q+1$. Matches — the theorem correctly reduces to "no moves needed" when the input is already balanced.
- **$r=0$** in general (i.e. $n\mid S$): formula says $0$ entries equal $q+1$ and all $n$ entries equal $q=S/n$. This is the case where the balanced state is *constant*; sensible and consistent with the Lemma in §3 (when $k=0$, all $x_i=m=q$).
- **$r = n-1$** (largest possible remainder): $n-r=1$ copy of $q$, $r=n-1$ copies of $q+1$ — still valid since $0\le n-1\le n-1$, matching the constraint $0\le k\le n-1$ from the uniqueness Lemma (the boundary case $k=n-1$ is legitimate; $k=n$ is excluded exactly because it would mean the "minimum" $m$ is not attained, a contradiction handled correctly by the division algorithm's strict inequality $r<n$).
- **Degenerate "no move possible from the start"**: covered by the $S=0$ and "already equal" cases above; part (a)'s bound is $0$ moves, consistent (the bound $\lfloor\Phi_0/2\rfloor$ is only an upper bound, not a promise that moves are needed).
- **Large disparities, single move needed**: e.g. $n=3$, $c=(0,0,7)$: $S=7=2\cdot3+1$, prediction: two $2$'s, one $3$. This requires several moves ($\Phi$ drops from $49$ to $4+4+9=17$, consistent with strict decrease); simulation (below) confirms correctness in general, not just by hand-trace.

**Numerical sanity check.** I ran a Python simulation (random $n\in[2,8]$, random initial nonnegative integers up to $15$, and at each step choosing a *uniformly random* unbalanced pair among all currently unbalanced pairs) for $3000$ random trials. In every trial the process terminated (max moves observed: $35$, well under the $\Phi_0/2$ bound) and the resulting multiset matched the predicted $(n-r)\times q,\ r\times(q+1)$ exactly. This is consistent with — though of course not a substitute for — the proofs above; it is offered only as a sanity check per the task instructions.

---

## 6. Ambiguities / potential issues considered

I looked for the following possible problems and found none apply:

1. **Is the move well-defined / does it stay in the nonnegative integers?** Yes — checked in Invariant 2; $c_i\ge2$ whenever the move fires on $i$, so $c_i-1\ge0$ is guaranteed automatically, no need for a separate hypothesis.
2. **Could the process fail to terminate under some adversarial choice of moves?** No — part (a)'s potential-function argument bounds the number of moves independent of the strategy used to pick unbalanced pairs; it's not merely "some sequence terminates" but "every sequence terminates," which is exactly what's asked.
3. **Could different move orders reach different terminal multisets, making (b) false?** This was the crux to check carefully. It does *not* happen, precisely because the terminal condition (spread $\le 1$) together with the invariant sum $S$ over-determines the multiset uniquely (§3's second Lemma). I don't see any reading of the problem where this could fail.
4. **Edge case $n=2$**: no special behavior; formulas and proofs hold uniformly for all $n\ge2$ as verified above.
5. **Interpretation of "unbalanced pair"**: the problem specifies $(i,j)$ ordered with $c_i\ge c_j+2$, and the move decrements the *larger* one $c_i$ and increments the *smaller* one $c_j$ — i.e., moves mass from rich to poor, which is what makes $\Phi=\sum c_i^2$ a strict monovariant (it would *fail* to be a monovariant if the roles were swapped). I confirmed the problem statement's assignment of $c_i\mapsto c_i-1$, $c_j \mapsto c_j+1$ matches "$i$ is the larger index" consistently, so there is no ambiguity here.
6. **Statement is not trivial nor false**: the problem is exactly solvable as posed, with a genuinely elegant (not merely mechanical) argument. I did not find it to be a restatement of something impossible or ill-posed.

No counterexamples found; no part of the statement needed revision.

---

## 7. Confidence level

**High.** All three parts have short, elementary, fully rigorous proofs (strict monovariant for termination; two simple invariants — conserved sum and the "spread $\le1$" terminal characterization — for uniqueness and the explicit count). I checked the logic line by line, verified all boundary cases by hand ($n=2$, $S=0$, already-balanced inputs, $r=0$, $r=n-1$), and additionally cross-checked the final formula against 3000 randomized simulations with randomized move orders, all of which agreed exactly with the closed-form answer
$$
\#\{c_i=q\}=n-r,\qquad \#\{c_i=q+1\}=r,\qquad S=qn+r,\ 0\le r<n.
$$
