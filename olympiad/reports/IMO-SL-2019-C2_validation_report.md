# DNA Extraction Report — IMO Shortlist 2019, Combinatorics C2

**Problem ID:** `IMO-SL-2019-C2`
**Source:** `data/raw/imo/IMO2019SL.pdf` — statement p. 6, official solutions pp. 31 (Solution 1 and Solution 2, both complete and self-contained; confirmed by reading through to the start of C3 on p. 32, no third solution present).
**Proposing country:** Thailand.

This is one of 6 problems added in "test 2" of the DNA pool (test 1 covered 2006-A3, 2007-A1, 2008-A1, 2009-A1). Report-only round — no Supabase load, no gold JSON, matching the pattern already used for 2007/2008/2009-A1.

---

## 0. Problem statement (verbatim, p. 6/31)

> You are given a set of $n$ blocks, each weighing at least $1$; their total weight is $2n$. Prove that for every real number $r$ with $0\le r\le 2n-2$ you can choose a subset of the blocks whose total weight is at least $r$ but at most $r+2$.

Two official solutions are given, both complete, neither marked as a partial "Comment." Both are treated as full, independent Solution DNA below (`is_primary=true` for Solution 1, `is_primary=false, is_complete=true` for Solution 2 — an alternate, not a partial replacement, so `replaces_solution_id` is null for both).

---

## 1. Problem DNA

| Field | Value |
|---|---|
| contest | IMO Shortlist |
| year | 2019 |
| round | Shortlist |
| problem_number | C2 |
| source | `data/raw/imo/IMO2019SL.pdf`, statement p. 6, solutions p. 31 |
| difficulty | null (not classified, consistent with the 4 existing problems) |
| objects_text | A finite set of $n$ real-weighted "blocks," each of weight $\ge 1$, total weight exactly $2n$; subsets of blocks and their total weights; a target real $r\in[0,2n-2]$. |
| hidden_structure | The set of all achievable subset-sums, viewed as a subset of $[0,2n]$, has "mesh" (largest gap between consecutive achievable values) at most 2 — a discrete covering/intermediate-value fact forced purely by the "each weight $\ge 1$, total $=2n$" constraint, independent of which subset-generation order is used. |
| expected_insight | The $\ge 1$-per-block / $2n$-total pairing is exactly tight enough that *some* subset always lands within any length-2 window — provable either by peeling off the single heaviest block and inductively re-covering (Solution 1), or by tracking how the reachable-sum set grows one block at a time in sorted order and bounding the worst-case gap directly (Solution 2). |
| problem_family | null |
| problem_template | null |

**Topics:** Combinatorics (primary); secondary tag Number-Theory-adjacent "extremal/covering argument" (kept as a Combinatorics-only single tag here — no numeric divisibility content, unlike 2009-A1's cross-tagging case).

---

## 2. Solution 1 (primary) — Thinking Graph

Solution 1 proves a **strengthened, parameterized** claim by induction on $n$, then specializes:

> **Claim.** For $n$ blocks each of weight $\ge 1$ and total weight $s\le 2n$, for every real $r$ with $-2\le r\le s$, some subset has total weight in $[r,r+2]$.

| id | node_type | statement | importance | source_span |
|---|---|---|---|---|
| N1 | given | $n$ blocks, each weight $\ge1$, total weight $2n$ | critical | p.31, problem statement |
| N2 | goal | for every $r\in[0,2n-2]$, some subset has total in $[r,r+2]$ | critical | p.31 |
| N3 | construction | strengthen to general Claim: for total $s\le 2n$, holds for every $r\in[-2,s]$ | critical | p.31, "We prove the following more general statement by induction on $n$" |
| N4 | calculation | base case $n=1$: single block $x\in[1,2]$; empty set covers $r\in[-2,0]$, the block covers $r\in[x-2,x]$, union is $[-2,x]$ since $x\le2$ | important | p.31, "The base case $n=1$ is trivial" |
| N5 | construction | let $x$ = weight of the (an) heaviest block among the $n$ | critical | p.31, "let $x$ be the largest block weight" |
| N6 | inference | $x\ge s/n$ (max $\ge$ mean) | important | p.31, "Clearly, $x\ge s/n$" |
| N7 | calculation | $s-x\le \frac{n-1}{n}s\le 2(n-1)$ | critical | p.31 |
| N8 | inference | apply the induction hypothesis to the remaining $n-1$ blocks (total $s-x\le2(n-1)$): coverage holds for every $r\in[-2,\,s-x]$ | critical | p.31, "we can apply the inductive hypothesis" |
| N9 | construction | add the excluded block $x$ back onto each of those subsets: produces coverage for every $r\in[x-2,\,s]$ | critical | p.31, "Adding the excluded block to each of those combinations" |
| N10 | inference | the two coverage ranges are $[-2,s-x]$ (from N8) and $[x-2,s]$ (from N9) | important | p.31 |
| N11 | calculation | $x-2\le s-x$, using $x\le s-(n-1)$ (remaining blocks total $\ge n-1$) and $s\le2n$ | critical | p.31, "we have $x-2\le\dots\le s-x$" |
| N12 | conclusion | the two ranges abut/overlap with no gap, so their union covers all of $[-2,s]$ — inductive step complete | critical | p.31 |
| N13 | conclusion | Claim holds for all $n\ge1$ by induction | critical | p.31 |
| N14 | conclusion | specialize $s=2n$: since $[0,2n-2]\subseteq[-2,2n]$, the original statement follows | critical | p.31 |

`entry_nodes = [N1]`; `terminal_nodes = [N14]`. **14 nodes, 19 edges.** Acyclic (verified by inspection — every edge points from a lower-index construction step to a step that consumes it; no back-references).

**Edge list** (parent → child : relation : reasoning action):

| Edge | Relation | Reasoning Action |
|---|---|---|
| N1→N2 | — | *(Framing, not a reasoning action)* |
| N2→N3 | derives | **Strengthen Inductive Hypothesis** *(new — see §9)* |
| N3→N4 | supports | **Direct Computation/Verification** |
| N3→N5 | supports | **Extremal Choice** |
| N5→N6 | derives | **Invoke Given/Definitional Property** (max $\ge$ mean) |
| N6→N7 | derives | **Bounding** |
| N5→N8 | requires | **Induction** (apply IH to the object N5 produced) |
| N7→N8 | requires | **Invoke Prior Lemma/Fact** (bound satisfies IH's precondition) |
| N8→N9 | derives | **Construct Auxiliary Object** (shift-back construction) |
| N5→N9 | requires | **Substitution** ($x$ itself is reused) |
| N8→N10 | supports | **Structural/Invariant Identification** |
| N9→N10 | supports | **Structural/Invariant Identification** |
| N7→N11 | requires | **Invoke Prior Lemma/Fact** |
| N1→N11 | requires | **Invoke Given/Definitional Property** ($s\le2n$) |
| N10→N12 | derives | **Covering Case Union** |
| N11→N12 | requires | **Boundary/Equality Identification** |
| N4→N13 | supports | **Merge Cases** |
| N12→N13 | derives | **Merge Cases** |
| N13→N14 | derives | **Substitution** |

```mermaid
flowchart TD
    N1[Given: n blocks, wt>=1, total 2n] --> N2[Goal: cover every r in 0..2n-2]
    N2 --> N3[Strengthen: general Claim for total s<=2n, r in -2..s]
    N3 --> N4[Base case n=1 verified]
    N3 --> N5[Pick heaviest block x]
    N5 --> N6[x >= s/n]
    N6 --> N7[s-x <= 2(n-1)]
    N5 --> N8[Apply IH to n-1 blocks: covers -2..s-x]
    N7 --> N8
    N8 --> N9[Add x back: covers x-2..s]
    N5 --> N9
    N8 --> N10[Two coverage ranges]
    N9 --> N10
    N7 --> N11[Verify x-2 <= s-x]
    N1 --> N11
    N10 --> N12[Ranges cover -2..s, no gap]
    N11 --> N12
    N4 --> N13[Claim holds for all n]
    N12 --> N13
    N13 --> N14[Specialize s=2n: original statement follows]
```

---

## 3. Solution 1 — Strategy Layer

**S0 — Framing** (`N1–N2`). Not a strategy; states the problem.

**S1 — Strengthen the target into an inductively closable claim** (`N3`). Singleton, a genuine decision point (the original statement, fixed at $s=2n$, doesn't self-strengthen under naive induction on $n$ — shrinking $n$ also shrinks the total, so the claim must be re-parameterized over *all* $s\le2n$ before induction can close). Its own strategy for the same reason 2006-A3's S2 (normalize the witness) got its own boundary: a construction-type decision, not a derivation.

**S2 — Base case** (`N4`). Singleton verification.

**S3 — Extremal reduction: peel the heaviest block and re-bound the remainder** (`N5–N7`). Technique: extremal choice + an averaging bound, self-contained input (the $n$ blocks) to output (a bounded $(n-1)$-block sub-instance).

**S4 — Apply the induction hypothesis and reconstruct by shifting** (`N8–N9`). Technique: invoke IH on the sub-instance, then splice the excluded block back onto every resulting subset. A clean input→output unit distinct from S3 (S3 produces the *sub-instance*; S4 *consumes* it and produces new coverage).

**S5 — Verify the two coverage ranges leave no gap** (`N10–N12`). Technique: interval-covering check using the weight bound from S3. This is where the theorem's actual difficulty concentrates — S3/S4 are mechanical once the strategy is chosen, but S5 is the step that could fail for a *different* choice of extremal object (e.g. peeling the lightest block instead of the heaviest would not give a tight-enough bound to close this gap check).

**S6 — Assemble: close the induction, specialize** (`N13–N14`). Bookkeeping, not a proof technique — combines S2+S5's outputs and substitutes $s=2n$.

**Real strategies: S1→S2|S3→S4→S5→S6** (S0, S6 are framing/bookkeeping, matching the recurring S0/S7-type pattern from every prior validation).

---

## 4. Solution 1 — Mathematical Principles

**P1 (S1) — Strengthen the Inductive Hypothesis.**
*Generic form:* When a target statement is pinned to one fixed global parameter (here, total weight exactly $2n$), replace it with a stronger claim parameterized over a *range* of that quantity (total weight $\le 2n$) before inducting, because shrinking the induction variable also shrinks the fixed parameter and the original claim can't absorb that shift on its own.
*Generality:* **universal** — this is the standard "strengthen to induct" meta-technique taught across all of olympiad combinatorics/algebra, not tied to blocks or weights at all.
*Intrinsic vs. solution-specific:* **Solution-specific.** Test: does *any* correct proof need this? No — Solution 2 (§6–8) proves the identical theorem without ever strengthening a statement or inducting on $n$; it inducts on a different index ($k$, the number of sorted blocks included) over a structurally different object (the achievable-sum set). Confirmed by direct comparison, not assumed.

**P2 (S3) — Extremal-Element Peeling as an Induction-Reduction Step.**
*Generic form:* To reduce an $n$-object instance to an $(n-1)$-object instance inside an induction, remove the *extremal* (here: heaviest) object specifically — its extremality is what licenses the quantitative bound ($x\ge s/n \Rightarrow s-x\le 2(n-1)$) that makes the smaller instance satisfy the induction hypothesis's precondition. Removing an arbitrary (non-extremal) object would not give this bound.
*Generality:* **common_technique** — recurs in induction proofs needing a shrink-bound on a global constraint, not universal (needs a global additive constraint whose bound is exactly what extremality controls).
*Not the same as* the existing `extremal_principle_minimal_representative` (minimal-counterexample/well-ordering) — that principle proves *existence via contradiction from minimality*; this one uses extremality only to get a **quantitative shrink bound**, with no contradiction anywhere in Solution 1. Kept as a distinct, new principle (see §12).
*Intrinsic vs. solution-specific:* **Solution-specific.** Solution 2 never removes any block or invokes an extremal element in this reduction sense (it does sort by weight, but that's ordering for a different purpose — see Q2 in §8).

**P3 (S4) — Reconstruct Coverage by Uniformly Shifting a Sub-Solution.**
*Generic form:* Given a family of solutions covering an interval for a reduced instance, produce a family covering a *shifted* interval for the full instance by uniformly re-adding the removed component to every member of the family.
*Generality:* **common_technique** — a standard "translate the smaller solution set" move in induction proofs building up an interval or a covering set.
*Intrinsic vs. solution-specific:* **Solution-specific** (Solution 2 has no analogous shift step; its induction directly reasons about the doubling recursion $S_k=S_{k-1}\cup(x_k+S_{k-1})$, a different mechanism entirely — see Q2).

**P4 (S5) — Covering / No-Gap Interval Union.**
*Generic form:* To show two (possibly overlapping) sub-ranges jointly cover a target interval, check that the right endpoint of the lower range meets or exceeds the left endpoint of the upper range.
*Generality:* **common_technique.**
*Vocabulary match:* This is the **same generic form**, verbatim in substance, as the existing `covering_partition_argument` principle type (2006-A3's Comment: "Show two ranges cover the whole domain so at least one of two recursive cases always applies"). Flagged as a genuine reuse candidate in §12 — the *specific instantiation* differs (here: two additive-shift coverage ranges from one induction step; there: two multiplicative/positional ranges $(-1,-\psi)\cup(0,\varphi)=(-1,\varphi)$) but the underlying principle — verify two ranges abut/overlap to conclude full coverage — is identical.
*Intrinsic vs. solution-specific:* **Mixed.** The underlying *fact* — "the achievable-sum set has no gap wider than 2" — is problem-intrinsic: Solution 2 independently proves the exact same fact (its "mesh $\le 2$" claim, §7–8) by a completely different mechanism (a contradiction argument on sorted prefix sums, no interval-union check anywhere). But the specific *mechanism* used here — two shifted coverage ranges built from an induction step, checked to abut — is Solution 1-specific. This mirrors the 2006-A3/2008-A1 precedent for `is_problem_intrinsic='mixed'` exactly: intrinsic content, solution-specific delivery.

S6 (assemble) produces no new principle — it is pure bookkeeping (substitution), matching the S0/S7 pattern from every prior validation.

---

## 5. Solution 1 — Principle Dependency Graph

| Source | Target | Type | Justification |
|---|---|---|---|
| P1 | P2 | enables | P2's induction (peeling a block, applying IH) only makes sense against the *generalized* claim P1 introduces — the original fixed-total statement doesn't support an IH at all. |
| P2 | P3 | requires | P3's shift-reconstruction (N9) operates on exactly the sub-instance and excluded block P2 produced (N5, N7). |
| P3 | P4 | requires | P4's covering check (N12) directly consumes the two ranges P3 (via N8's IH-application) and P3's own shift (N9) produced — nothing to check coverage of before P3 exists. |

```mermaid
flowchart LR
    P1[P1: Strengthen Inductive Hypothesis] -->|enables| P2[P2: Extremal-Element Peeling]
    P2 -->|requires| P3[P3: Shift-Reconstruct Coverage]
    P3 -->|requires| P4[P4: Covering / No-Gap Union]
```

A DAG — in fact a **simple linear chain**, P1→P2→P3→P4, with no branching and no independent converging arms. This is a notable structural contrast with every prior validated problem (2006-A3, 2007-A1, 2008-A1, 2009-A1 all had at least two independent principle-graph arms that later converge or stay separate). Here the proof is one continuous inductive thread with no forward/backward-direction split — consistent with the Strategy Layer in §3 also being a single S1→S5 chain rather than a branching structure.

---

## 6. Solution 2 (alternate, complete) — Thinking Graph

Solution 2 proves the same theorem by sorting the weights and tracking the **achievable-subset-sum set** directly, inducting on how many (sorted) blocks are included.

| id | node_type | statement | importance | source_span |
|---|---|---|---|---|
| M1 | given | weights $x_1\le\cdots\le x_n$ (sorted), total $2n$ | critical | p.31, "Let $x_1,\dots,x_n$ be the weights... in weakly increasing order" |
| M2 | goal | show mesh of $S$ (largest gap between consecutive achievable subset-sums) is $\le2$ | critical | p.31, "We want to prove that the mesh of $S$... is at most 2" |
| M3 | observation | reformulation: mesh$(S)\le2$, together with $0,2n\in S$, is equivalent to the original covering claim | important | p.31 (implicit reformulation) |
| M4 | construction | define $S_k$ = achievable sums using only the first $k$ (sorted) blocks, $k=0,\dots,n$ | critical | p.31, "let $S_k$ denote the set of sums..." |
| M5 | goal | prove by induction on $k$: mesh$(S_k)\le2$ | critical | p.31 |
| M6 | calculation | base case $k=0$: $S_0=\{0\}$, mesh trivially $\le2$ | supporting | p.31, "The base case $k=0$ is trivial" |
| M7 | observation | recursive structure: $S_k=S_{k-1}\cup(x_k+S_{k-1})$ | critical | p.31 |
| M8 | inference | suffices to show $x_k\le\sum_{j<k}x_j+2$ | important | p.31, "it suffices to prove that $x_k\le\sum_{j<k}x_j+2$" |
| M9 | construction | (contradiction) suppose instead $x_k>\sum_{j<k}x_j+2$ | important | p.31, "if this were not the case" |
| M10 | inference | since sorted increasing, $x_l>\sum_{j<k}x_j+2\ge k+1$ for all $l\ge k$ | important | p.31 |
| M11 | calculation | summing: $2n=\sum x_j>(n+1-k)(k+1)+(k-1)$ | critical | p.31 |
| M12 | calculation | rearranges to $n>k(n+1-k)$ | critical | p.31, "This rearranges to..." |
| M13 | inference | false for every $1\le k\le n$ (the quadratic $k(n+1-k)$ has minimum value exactly $n$ at the endpoints $k=1,n$) | critical | p.31, "which is false for $1\le k\le n$" |
| M14 | conclusion | contradiction — the supposition in M9 is impossible, so $x_k\le\sum_{j<k}x_j+2$ | critical | p.31 |
| M15 | conclusion | mesh$(S_k)\le2$ for all $k$; in particular mesh$(S_n)=$mesh$(S)\le2$ | critical | p.31 (induction closure) |
| M16 | conclusion | combined with $0,2n\in S$: every $r\in[0,2n-2]$ has a subset sum in $[r,r+2]$ — QED | critical | p.31 |

`entry_nodes = [M1]`; `terminal_nodes = [M16]`. **16 nodes, 17 edges.** Acyclic.

```mermaid
flowchart TD
    M1[Given: sorted weights, total 2n] --> M2[Goal: mesh(S) <= 2]
    M2 --> M3[Reformulation equivalence]
    M3 --> M4[Define S_k, k=0..n]
    M4 --> M5[Induct on k: mesh(S_k) <= 2]
    M5 --> M6[Base case k=0]
    M5 --> M7[S_k = S_k-1 U (x_k + S_k-1)]
    M7 --> M8[Reduces to x_k <= sum_j<k x_j + 2]
    M8 --> M9[Suppose x_k > that bound]
    M9 --> M10[x_l > k+1 for all l>=k]
    M10 --> M11[Sum: 2n > (n+1-k)(k+1)+(k-1)]
    M11 --> M12[Rearranges to n > k(n+1-k)]
    M12 --> M13[False for all 1<=k<=n]
    M13 --> M14[Contradiction closes]
    M6 --> M15[mesh(S_k) <= 2 for all k]
    M14 --> M15
    M15 --> M16[Original covering claim follows]
```

---

## 7. Solution 2 — Strategy Layer

**T0 — Framing** (`M1–M2`).

**T1 — Reformulate as a mesh bound on the achievable-sum set** (`M3`). A genuine reframing decision — the original claim is stated in terms of "a subset for every $r$"; this recasts it as a global structural property (mesh) of one derived set.

**T2 — Define a nested prefix filtration** (`M4`). Sets up the object the induction will run on.

**T3 — Base case** (`M5–M6`).

**T4 — Reduce the inductive step to one needed inequality via the doubling recursion** (`M7–M8`). Technique: exploit $S_k=S_{k-1}\cup(x_k+S_{k-1})$ to isolate the single condition that controls the mesh.

**T5 — Close the inequality by contradiction** (`M9–M14`). Technique: negate, chain inequalities using sortedness, sum over the relevant index range, reduce to a fixed quadratic bound, contradict.

**T6 — Assemble** (`M15–M16`). Bookkeeping.

---

## 8. Solution 2 — Mathematical Principles

**Q1 (T1) — Recast a Window-Covering Claim as a Mesh Bound on a Derived Set.**
*Generic form:* Convert "some element of a generated set lands in every length-$c$ window of an interval" into "the generated set's consecutive gaps are all $\le c$."
*Generality:* common_technique.
*Intrinsic/specific:* **Solution-specific** — Solution 1 never forms this derived set or reasons about its mesh; it argues directly about subset existence.

**Q2 (T2/T4) — Filtration by Prefix Doubling Recursion.**
*Generic form:* Build a nested family $S_k=S_{k-1}\cup(x_k+S_{k-1})$ by successively adding one more generator, turning an $n$-generator combinatorial question into an induction on the number of generators included so far.
*Generality:* common_technique — this is the standard subset-sum/knapsack recursive-doubling structure, transferable well beyond this problem (e.g. numeral-system digit-by-digit constructions).
*Not merged* with the existing `positional_canonical_numeral_representation` (2006-A3): that principle specifically involves a *no-adjacent-digit carrying rule*; this one has no carrying rule or positional-digit interpretation. Related in spirit (both are "build up reachable values one generator at a time"), kept distinct per the conservative-merge instruction.
*Intrinsic/specific:* **Solution-specific** — Solution 1 has no filtration or per-block induction; it inducts on total block *count* $n$ directly with extremal peeling, a different index and different reduction.

**Q3 (T5) — Contradiction via a Fixed Quadratic/Extremal-Value Bound.**
*Generic form:* Negate a needed linear inequality, sum it over a matching index range to obtain a bound on a symmetric quadratic expression $k(n{+}1{-}k)$, then contradict using that expression's known extremal value on the given range.
*Generality:* **specialized** — tightly tied to this exact counting setup (sorted weights, fixed total).
*Intrinsic/specific:* **Solution-specific.**

### Solution 2 Principle Dependency Graph

| Source | Target | Type | Justification |
|---|---|---|---|
| Q1 | Q2 | motivates | The mesh reformulation (Q1) suggests building the object whose mesh will be tracked (Q2), but Q2's filtration could in principle be defined without ever naming "mesh" — not a logical necessity. |
| Q2 | Q3 | requires | Q3's contradiction argument (M9–M14) operates directly on the recursive structure Q2 established (M7) — nothing to negate/bound before Q2 exists. |

```mermaid
flowchart LR
    Q1[Q1: Mesh Reformulation] -->|motivates| Q2[Q2: Prefix Doubling Filtration]
    Q2 -->|requires| Q3[Q3: Quadratic-Bound Contradiction]
```

Also a DAG, also a simple linear chain — both official solutions to this problem turn out to be single continuous threads with no branching principle graph, unlike every algebra problem validated so far (2006-A3/2007-A1/2008-A1/2009-A1 all split into $\ge2$ independent arms). Tentatively: this may be a combinatorics-vs-algebra pattern (a single global counting/covering argument vs. algebra's frequent iff-split into two directions), but **N=1 problem is not enough evidence** — flagged as a hypothesis for future validations to test, not a finding.

---

## 9. Cross-Solution Comparison (Task-004-style intrinsic/specific confirmation)

Direct, concrete test of every "solution-specific" classification above, using the fact that **both solutions exist and are complete**:

| Idea | Present in Solution 1? | Present in Solution 2? | Verdict |
|---|---|---|---|
| Strengthen the induction hypothesis before inducting (P1) | Yes (N3) | No — Solution 2 never restates or strengthens the target claim | **Solution-specific**, confirmed |
| Peel the extremal (heaviest) element to shrink an induction (P2) | Yes (N5–N7) | No — Solution 2 removes nothing; it *adds* blocks one at a time in sorted order, the opposite direction | **Solution-specific**, confirmed |
| Reconstruct by shifting a sub-solution (P3) | Yes (N8–N9) | No | **Solution-specific**, confirmed |
| The achievable-sum set has no gap $>2$ (the fact underlying P4/M15) | Yes, proved via interval-union (N10–N12) | Yes, proved via contradiction on sorted prefix sums (M9–M14) | **Problem-intrinsic** — both solutions, using unrelated mechanisms, are forced to establish this identical fact. Confirms P4's `mixed` classification concretely: the *fact* is intrinsic, each solution's *mechanism* for reaching it is solution-specific. |
| Mesh-of-a-generated-set reformulation (Q1) | No | Yes (M3) | **Solution-specific**, confirmed |
| Prefix-doubling filtration (Q2) | No | Yes (M4, M7) | **Solution-specific**, confirmed |

This is the cleanest possible instance of the project's intrinsic/specific test to date: **every single technique-level principle in both solutions turns out to be solution-specific**, and there is exactly **one** shared problem-intrinsic fact (mesh $\le2$ / no-gap), reached by two structurally unrelated routes. Compare 2006-A3, where 5 of 9 critical ideas were intrinsic — this problem's DNA is much more concentrated: nearly all of the mathematical content is *how you get there*, and only one compact fact is *what's true regardless*.

---

## 10. Graph Features

| Field | Solution 1 | Solution 2 |
|---|---|---|
| node_count | 14 | 16 |
| edge_count | 19 | 17 |
| entry_nodes | N1 | M1 |
| terminal_nodes | N14 | M16 |
| max_depth | 12 (N1→N2→N3→N5→N6→N7→N8→N9→N10→N12→N13→N14) | 13 (M1→M2→M3→M4→M5→M7→M8→M9→M10→M11→M12→M13→M14→M15→M16, 14 edges) |
| branch_count | 1 (N3 → N4, N5) | 1 (M5 → M6, M7) |
| merge_count | 3 (→N10, →N12, →N13) | 2 (→M15, plus the linear-chain joins) |
| has_cycle | false | false |
| proof_feature tags | recursive, extremal, construction | recursive, contradiction, construction |

`is_primary`: Solution 1 = true, Solution 2 = false. `is_complete`: both = true (neither is a partial Comment; both independently prove the full theorem). `replaces_solution_id`: null for both — this is a genuine **alternate solution** pair, not a **modular swap** pattern (contrast 2006-A3/2008-A1's Comments, which replace one span of a shared main proof). Worth noting as a second solution-pair *shape* the schema needs to support alongside modular-swap: two fully independent, non-overlapping proofs of the same theorem.

---

## 11. Deviations / Notes

- No deviation from the DNA-extraction instructions. Both official solutions were read in full from the PDF (p. 31) and independently re-derived by hand to confirm correctness before graphing; no step was fabricated.
- One minor transcription note: the printed proof of Solution 1's overlap check (`x−2 ⩽ (s−(n−1))−2 = s−(2n−(n−1)) ⩽ s−(s−(n−1)) = s−x`) contains what reads as a labeling shorthand rather than a literal chain of equalities in its last step; the *conclusion* ($x-2\le s-x$) was independently re-verified as correct via $x\le s-(n-1)$ and $s\le 2n$ (N11 above), so this is flagged as a presentation quirk of the source text, not an error in the extracted DNA.
- Both solutions being complete, independent proofs (rather than one main + one partial Comment) is a new *pair shape* relative to the 4 existing problems — see §10.

---

## 12. Principle-Type Vocabulary — Merge Candidates (checked against `scripts/load_dna_seed_v1.py` `PRINCIPLE_TYPES`, 30 entries)

- **Merge candidate, recommended:** P4 ("Covering / No-Gap Interval Union") ↔ existing `covering_partition_argument` ("Show two ranges cover the whole domain so at least one of two recursive cases always applies"). Same generic form in substance (verify two ranges abut/overlap to guarantee full coverage); different concrete instantiation (additive-shift induction ranges here vs. 2006-A3's positional/multiplicative ranges). Recommend reusing `covering_partition_argument` as P4's `principle_type_id` rather than minting a new type — this would be only the **second** cross-problem merge in the project's history (after `two_sided_squeeze`), and the first one spanning Algebra ↔ Combinatorics.
- **Considered, not merged:** P2 ("Extremal-Element Peeling for an Induction-Reduction Bound") vs. `extremal_principle_minimal_representative` — different logical shape (quantitative shrink-bound vs. minimal-counterexample contradiction); vs. `extremal_witness_instantiation` — that principle is about naming a max/min value, not about removing it to reduce induction size. Kept P2 as a new, distinct type.
- **Considered, not merged:** Q2 ("Filtration by Prefix Doubling Recursion") vs. `positional_canonical_numeral_representation` — no carrying rule or positional-digit structure present here. Kept distinct.
- All other principles (P1, P3, Q1, Q3) are genuinely new, no close match found in the existing 30-entry vocabulary.

## 13. New Reasoning-Action-Type Candidate

The existing 27-entry `reasoning_action_type` vocabulary (in `scripts/load_dna_seed_v1.py`) has no entry for the N2→N3 move (restating a fixed-parameter claim as a parameterized, stronger one specifically to make induction close). The closest existing type, `induction`, describes *applying* an inductive step, not this prior *reformulation* move. Recommend adding:

- `strengthen_inductive_hypothesis` — "Replace a target statement pinned to one fixed global parameter with a stronger claim parameterized over a range of that quantity, so that induction on a sub-index doesn't fall outside the claim's scope." Category: `construction` (it builds a new, more general proposition to work with, alongside `define_object`/`construct_auxiliary_object`).

This is used only once here (N2→N3) — a single-problem occurrence, so recommended as a candidate for the vocabulary rather than an immediate addition; worth confirming on a second problem before promoting, per the project's own replication standard for new layers/types.

---

## Summary

| Metric | Solution 1 | Solution 2 | Combined |
|---|---|---|---|
| Nodes | 14 | 16 | 30 |
| Edges | 19 | 17 | 36 |
| Strategies | 6 (S1–S6; S0 framing excluded) | 6 (T1–T6; T0 framing excluded) | 12 |
| Principles | 4 (P1–P4) | 3 (Q1–Q3) | 7 |
| Principle-dependency edges | 3 (simple chain) | 2 (simple chain) | 5 |
| New principle-type candidates | P1, P2, P3 (P4 merges into existing) | Q1, Q2, Q3 | 6 new + 1 merge |
| New reasoning-action candidates | 1 (`strengthen_inductive_hypothesis`) | 0 | 1 |

**Core transferable DNA of this problem:** the single problem-intrinsic fact — a set built from $n$ generators each $\ge1$, total $2n$, always has subset-sum mesh $\le2$ — is reachable by two genuinely unrelated mechanisms (extremal-peel-and-shift induction on object count; sorted-prefix-doubling induction on inclusion order), making it a strong candidate for a *combinatorics-family* discriminating signature analogous to how 2006-A3's Zeckendorf structure served that role for the recurrence/algebraic-number-theory family.
