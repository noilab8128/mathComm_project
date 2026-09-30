# Generation Test 002 — Final Report

## Part 1 — Selected DNA

Drawn from **3 distinct source problems**, no single source's complete DNA reused. Selection was
brief (per instructions), using only structured Supabase fields (topics, objects_text,
hidden_structure, proof_features, graph statistics, strategy `subgoal_text`, principle
`generic_form`/classification, principle dependency edges) — no statement_text or node prose read.

| Component | Selection | Source (Supabase identifier) |
|---|---|---|
| Domain / object family | Combinatorics; a finite collection of integers subject to a repeated local rewriting move | `IMO-SL-2019-C5` (topic `graph_rewriting_invariants`) |
| Structural pattern | Invariant + strictly-decreasing monovariant forces termination; the terminal state is then characterized | `IMO-SL-2019-C5-SOL1` (strategy sequence: connectivity → invariant defined → preservation lemma → monovariant termination → terminal-state characterization) |
| Primary problem-intrinsic principle | `well_founded_descent_monovariant_induction` — "a strictly decreasing integer measure along each recursive branch guarantees termination" | `IMO-SL-2019-C5-SOL1` (`is_problem_intrinsic = intrinsic`, confidence `high`) |
| Secondary principle | `covering_partition_argument` — "show two ranges cover the whole domain so at least one of two recursive cases always applies" | `IMO-SL-2019-C2-SOL1` (also present in `IMO-SL-2006-A3-COMMENT`) |
| Proof-ending pattern | `assert_target_extremal_value_guess_verify` — "state the conjectured extremal value upfront, then split into a universal bound and a matching sharp example" | `IMO-SL-2009-A1-SOL1` |

---

## Part 2 — Frozen Problem

Saved to `generated/GEN-002/problem.md` (reproduced here for reference):

> Let $n \ge 2$ be an integer and let $c_1, c_2, \ldots, c_n$ be given nonnegative integers. Write
> $S = c_1 + \cdots + c_n$. Call a pair $(i,j)$, $i\ne j$, *unbalanced* if $c_i \ge c_j+2$. While an
> unbalanced pair exists, one may replace $c_i \to c_i-1$, $c_j \to c_j+1$ for any chosen unbalanced
> pair $(i,j)$.
>
> **(a)** Prove the process always stops after finitely many moves, regardless of which unbalanced
> pairs are chosen. **(b)** Prove the terminal multiset $\{c_1,\ldots,c_n\}$ does not depend on the
> choices made. **(c)** Writing $S=qn+r$, $0\le r<n$, determine how many $c_i$ equal $q$ and how many
> equal $q+1$ at termination.

## Part 3 — Freeze Check

- All variables defined ($n$, $c_i$, $S$, $q$, $r$). ✓
- Quantifiers clear (statement is universally quantified over all valid initial $c_i$ and all legal
  move sequences, standard implicit convention matching the pool's own problem phrasing). ✓
- Requested answer unambiguous (two explicit counts summing to $n$). ✓
- Nonempty object class (e.g. $n=2$, $c_1=c_2=0$ is a valid, trivially-already-terminal instance). ✓

```text
PROBLEM FROZEN
```

No revision made before solving.

---

## Part 4 — Independent Solver Result

A **fresh, isolated subagent** (not a fork of this conversation — deliberately, so it had no access
to the Phase 1 DNA selection, the source problem IDs, or any expected answer) was given only the
literal text of `problem.md`, with explicit instructions not to read any other files. Its full report
is saved at `generated/GEN-002/solver_report.md`.

**Result: the statement is true, well-posed, and the solver found a complete, correct proof.**

- **(a)** $\Phi=\sum c_i^2$ strictly decreases by $\ge 2$ per move (since $\Delta\Phi = 2(c_j-c_i)+2 \le -2$
  whenever $c_i\ge c_j+2$); bounded below by $0$, forcing termination within $\lfloor \Phi_0/2\rfloor$ moves.
- **(b)+(c), proved together:** "no unbalanced pair" is shown to be exactly equivalent to
  $\max_i c_i - \min_i c_i \le 1$; combined with the sum-conservation invariant, there is a unique
  multiset of $n$ nonnegative integers with sum $S$ and spread $\le1$ (via uniqueness of quotient/remainder
  in the division algorithm) — namely $n-r$ copies of $q$ and $r$ copies of $q+1$. Since every terminal
  state must satisfy both constraints, it must equal this multiset, proving path-independence and the
  explicit count simultaneously.
- Six boundary cases checked by hand ($n=2$, $S=0$, already-balanced input, $r=0$, $r=n-1$, a larger
  worked example); no ambiguity or counterexample found; solver's own 3000-trial randomized simulation
  matched the formula exactly. Solver's self-assessed confidence: **High**.

---

## Part 5 — Verification

Performed independently of the solver, by re-deriving the problem privately before dispatching the
solver (so the answer was known in advance for comparison, not reverse-engineered from the solver's
report), plus a separate computational check (**300 random configurations × 6 random move-orders
each = 1800 runs**, all matching the predicted terminal multiset, run before the solver's report was
read).

Having now read the solver's full proof line by line: every step is valid. The monovariant
computation ($\Delta\Phi \le -2$) matches an independent hand derivation exactly. The uniqueness
argument (§3 of the solver's report) is in fact a cleaner resolution of part (b) than the one
prepared privately in advance — it avoids needing to reason about the swap/move mechanics directly at
all, instead pinning the terminal multiset in advance from the two invariants alone.

**Classification: `PASS — rigorous solution verified`.**

---

## Part 6 — DNA Usage Review

| Component | Intended | Actually used | Result |
|---|---|---|---|
| Domain DNA | Combinatorics; finite collection under a local rewriting move | Same — nonnegative integers in $n$ slots under a pairwise transfer move | **Survived** |
| Structural DNA | Invariant + monovariant forces termination; terminal state characterized | Same shape exactly: sum-invariant + $\Phi=\sum c_i^2$ monovariant force termination; terminal state characterized via the spread-$\le1$ equivalence | **Survived, full match** |
| Primary principle | `well_founded_descent_monovariant_induction` | Realized directly as the $\Phi$ monovariant argument | **Survived, full match** |
| Secondary principle | `covering_partition_argument` | **Not used.** Uniqueness was instead proved via "two independent invariants (sum, spread) jointly pin a unique multiset, by uniqueness of the division algorithm" — a genuinely different mechanism, not a two-case covering argument at all | **Did not survive** |
| Proof ending | `assert_target_extremal_value_guess_verify` (state value upfront, verify via bound+example) | **Not used.** The solver derived (b) and (c) *deductively* from the two invariants, with no "guess the value, then verify" framing — the value falls out forced, not guessed | **Did not survive** |

**Reading:** 3 of 5 selected components survived intact — notably both halves of Structural DNA and
the primary principle, which is a stronger survival rate than Generation Test 001 (where Structural
DNA survived but the primary principle did not). The 2 components that did not survive were both
replaced by a single unified mechanism (the two-invariant uniqueness argument) that is arguably a
finer-grained relative of `terminal_state_characterization_invariant_until_termination` — a principle
already present in the same source problem (`IMO-SL-2019-C5-SOL1`) as the Structural DNA selection,
but which was not itself one of the 5 explicitly selected components. This repeats Test 001's finding:
when a selected principle doesn't survive, what replaces it tends to be drawn from the *same
neighborhood* of the DNA pool rather than something unrelated — the pool's structure is influencing
generation even where explicit selection fails to.

---

## Part 7 — Originality Check

Compared against the 10 source problems' full DNA (topics, objects, principles) and, where relevant,
their actual statements.

- **Literal statement similarity:** Low against all 10 — none concern integers in slots under a
  pairwise "unbalanced pair" transfer move.
- **Mathematical object similarity:** Low–moderate. The closest relative is `IMO-SL-2019-C5` (a local
  rewriting rule on a combinatorial structure with a preserved invariant and a strictly-decreasing
  monovariant forcing termination) and, more loosely, `IMO-SL-2015-N4` (a process that provably
  stabilizes). Neither uses integers-in-slots or a pairwise-transfer move; both operate on graphs or
  interleaved sequences instead.
- **Distinctive construction similarity:** Low. Neither the $\Phi=\sum c_i^2$ monovariant nor the
  "spread-$\le1$ pins a unique multiset via the division algorithm" argument appears anywhere in the
  10-problem pool's principle set.
- **Full-solution similarity:** Low.

**Classification: likely original**, relative to the 10-problem source pool specifically. (Not a
copyright-clearance claim — and worth noting for completeness, though outside this check's formal
scope: this style of "chip-firing"/smoothing-move problem, with the sum-of-squares monovariant, is a
recognized classical technique in the wider olympiad and discrete-math literature, independent of
this pool. The solver's own report flagged this directly. That's a fact about the broader field, not
about similarity to these 10 sources.)

---

## Recommendation for the Next Generation Attempt

Test 001 and Test 002 now agree on the same pattern twice: **Domain DNA and Structural DNA transfer
reliably; principle-level selection (primary, secondary, and especially the specific proof-ending
motif) frequently gets overridden by whatever a genuine solve actually needs.** Test 002 additionally
shows that when a principle *is* realized as selected (here, the primary one), it can be realized with
full fidelity — so the failure mode isn't that principles are unusable as DNA, only that pre-selecting
*which one* will end up load-bearing is unreliable, especially for secondary/ending-pattern slots.

Concrete next step: run Test 003 selecting **Domain + Structural DNA only**, deliberately leaving all
of Part 1 items 3–5 (primary principle, secondary principle, proof-ending pattern) unselected, and
have the DNA-usage review instead ask *retrospectively* which existing pool principles the actual
solution's DNA reconstruction turns out to match — closer to how Test 001/002's "unplanned survivors"
were discovered by accident. This would test the Test 001 recommendation directly rather than
introducing a 5th genome slot each time and watching most of it get discarded.

---

*Stop condition honored: exactly one problem generated and tested. No schema, table, or Supabase
changes made; the generated problem was not inserted into Supabase; no additional source problems
were analyzed; no repaired or alternate candidate was generated (none was needed — result was PASS).*
