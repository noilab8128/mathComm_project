# Generation Test 003 — Final Report

Engineering test, not a research report: can the current 10-problem DNA pool already generate a
valid, original, **short-answer** (single numeric value) Olympiad-style problem, distinct from the
proof-based format of every source problem in the pool?

---

## 1. Selected DNA

Kept brief per instructions. Drawn from ≥3 distinct source problems' structured Supabase data only
(topics, `objects_text`, `hidden_structure`, proof features, graph statistics, strategy
`subgoal_text`, principle `generic_form`/classification) — no `statement_text`, official-solution
prose, PDF, or report was read during generation.

| Component | Selection | Source | Why selected |
|---|---|---|---|
| Domain / object family | A finite multiset of positive integers ("coins"), split into two groups | `IMO-SL-2007-A1` (topic `sequences_and_bounds`), `IMO-SL-2009-A1` (topic `order_statistics`) | Both source problems concern a sequence of reals and a max/min-based bound on a derived quantity — a natural object family for a concrete, computable extremal answer. |
| Structural pattern | A case split on "which regime dominates" (one element outweighs the rest vs. near-balance), each regime closed independently | `IMO-SL-2009-A1-SOL1` (`two_sided_squeeze`: prove a bound, exhibit a matching witness); `IMO-SL-2008-A1-SOL1` (dichotomy-then-case-exhaust shape) | Selected specifically because it converts cleanly into a *computable* case rule — exactly what a short-answer format needs, as opposed to a universal "for all n" proof. |
| Primary principle | `bounding_order_statistic_via_witness` — "to lower-bound a property of the maximum, find one witness achieving it and transfer its properties" | `IMO-SL-2007-A1-SOL1` | Directly realizable as "isolate the dominant coin as the witness that forces the achieved minimum difference." |
| Secondary principle | `additive_two_term_averaging` — "for reals u,v: if u+v≥S then max(u,v)≥S/2" | `IMO-SL-2007-A1-SOL1` | Realized as the near-balance regime's parity-optimal split argument (minimize |difference| by choosing how many unit coins join each side). |
| Answer type | Single positive integer (sum of two evaluations of a derived function) | Matches this pool's own Problem-DNA convention of finite/extremal characterizations (`docs/12_DNA_TABLE_v1.0.md`) recast as a computable value rather than a proof target | Required by this test's short-answer constraint. |

**Disclosure:** this genome's *mathematical core* (partition a weighted set into two groups to
control a discrepancy via a dominant-vs-balanced case split) is the same underlying family used in
`generated/GEN-001` (Generation Feasibility Test 001), which was itself DNA-sourced from the same two
problems. GEN-003 is a genuinely different **problem** — a different question, concrete numeric
parameters instead of a universal constant, and a short-answer rather than proof format — but it is
not a fresh mathematical construction. Flagging this openly rather than presenting it as more novel
than it is.

---

## 2. Generated Problem

Frozen at `generated/GEN-003/problem.md`, reproduced here:

> Grace has 2023 coins, each worth \$1, along with one additional coin worth \$N, for some positive
> integer $N$, giving 2024 coins in total. She divides all 2024 coins into two nonempty groups so
> that the positive difference between the two groups' total values is as small as possible; call
> this smallest possible difference $D(N)$.
>
> Compute $D(1000) + D(3000)$.

No proof language ("prove", "show that", "determine all"), single numeric target, self-contained,
AIME-appropriate difficulty and phrasing style.

---

## 3. Independent Solver

A fresh, isolated subagent (not a fork — no access to the DNA selection, source IDs, or expected
answer) was given only the literal frozen statement, explicitly instructed not to read any other
files. Full report at `generated/GEN-003/solver_report.md`.

**Result:** derived the general closed form
$$D(N) = \begin{cases} 0, & N \text{ odd},\ N\le 2023\\ 1, & N\text{ even},\ N\le2023\\ N-2023, & N>2023\end{cases}$$
via a monotonicity/parity argument over the number of unit coins placed with the $N$-coin, verified it
by brute-force enumeration on a small structurally-identical case ($k=5$ unit coins, $N=1,\dots,14$,
all 14 matched), and computed $D(1000)=1$, $D(3000)=977$, **answer 978**. Self-assessed confidence:
High.

---

## 4. Verification

Performed independently: before writing `problem.md`, I privately derived the same case-split
formula and brute-force-verified it against exhaustive subset enumeration for $m=1,\dots,8$ unit
coins (covering both odd and even $m$) and $N=1,\dots,14$ — 0 mismatches — then applied it to get
$D(1000)+D(3000)=978$, *before* the solver ran.

- **Unique answer:** yes — $D(N)$ is a minimum over a finite set of partitions, always well-defined and single-valued.
- **No ambiguity:** coins are atomic (cannot be split); "nonempty groups" and "positive difference" are standard, unambiguous phrasings; both my derivation and the solver's independently flagged and dismissed the same two potential ambiguities (splittable coins, empty-group edge case) and reached the same conclusion.
- **No hidden assumptions:** the nonemptiness constraint ($x \le 2022$, at most 2022 of the 2023 unit coins join the $N$-coin's side) was checked explicitly by both parties and shown not to bind at the optimum.
- **Edge cases:** boundary $N=2023$ (all three formula cases agree, $D=0$); both parity regimes for $N\le2023$; both checked independently.
- **Consistency:** my pre-registered private answer (978) and the solver's fully independent blind answer (978) match exactly, with matching general formulas, not just matching final numbers.

**Classification: `PASS — rigorous solution verified`.**

---

## 5. Official Solution

**Setup.** The \$N coin lies entirely in one group, call it $A$; let $x\in\{0,1,\dots,2023\}$ be the
number of \$1 coins placed in $A$ alongside it, so group $B$ (the rest) has $2023-x$ dollars. Group
$B$ nonempty requires $x \le 2022$. The two group values are $N+x$ and $2023-x$, so
$$f(x) := (N+x)-(2023-x) = N-2023+2x,\qquad D(N)=\min_{0\le x\le 2022}|f(x)|.$$
$f$ is strictly increasing in $x$ with step size $2$.

**Case $N \le 2023$.** The real zero of $f$, $x^\*=(2023-N)/2$, lies in $[0,1011.5]\subset[0,2022]$
for every such $N$, so the constraint never binds. If $N$ is odd, $2023-N$ is even, so $x^\*$ is a
feasible integer and $D(N)=0$. If $N$ is even, $x^\*$ is a half-integer; the two nearest feasible
integers give $f=\pm1$, so $D(N)=1$.

**Case $N>2023$.** Now $x^\*<0$ is infeasible; since $f$ is increasing, the constrained minimum of
$|f|$ over $x\ge0$ occurs at $x=0$: $D(N)=f(0)=N-2023$. (Equivalently: group $A$'s value is always
$\ge N$, group $B$'s value is always $\le 2023$, so $D(N)\ge N-2023$ always, and $x=0$ — the $N$-coin
alone against all 2023 unit coins — achieves it exactly.)

**Evaluation.** $N=1000\le2023$ and even $\Rightarrow D(1000)=1$. $N=3000>2023 \Rightarrow
D(3000)=3000-2023=977$.

$$D(1000)+D(3000) = 1 + 977 = \boxed{978}$$

---

## 6. Failure Analysis

None — the generated problem passed verification cleanly on the first attempt; no repair was
attempted or needed, consistent with the "do not silently repair, do not hide failures" instruction
(there was nothing to hide). The one honest caveat, already disclosed in §1: the underlying
mathematical mechanism is not new to this project — it is a repackaging of `GEN-001`'s core lemma
into short-answer format, rather than DNA recombination discovering fresh mathematical content. That
is itself the most useful engineering finding of this run (see below).

---

## Recommendation

The current DNA is sufficient to produce a **correct, well-posed, appropriately-difficult
short-answer problem** — this run is unambiguous evidence for that, and the format transformation
(proof-based source pool → short-answer output) worked cleanly with no schema changes needed, since
`objects_text`/`hidden_structure`/principle `generic_form` fields already carry enough information to
re-target the answer type. The open question this run does *not* resolve is originality of the
underlying mathematics, since this genome deliberately reused a validated mechanism for correctness
safety. The next short-answer generation attempt should draw its primary/secondary principles from a
problem **not yet used as DNA source in any prior generation run** (e.g. `IMO-SL-2015-N4`,
`IMO-SL-2019-G4`, or either geometry problem) to test whether short-answer generation holds up on
genuinely fresh mathematical material, not just on a family already proven to work.

---

*Stop condition honored: exactly one problem generated and tested. No DNA framework changes, no new
fields, no schema edits, nothing inserted into Supabase, no additional source problems analyzed
beyond what's cited above, no second candidate generated.*
