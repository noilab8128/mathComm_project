# DNA Table Version 1.0 - 003

Loading the 6 "test 2" problems (below, "- 002" section) into Supabase — the report-only round is now also a DB-load round. Same 14 tables as "- 001", now covering all 10 problems.

## Row counts (all 10 problems combined)

| Table | Rows |
|---|---|
| topic | 10 |
| principle_type | 71 |
| reasoning_action_type | 29 |
| proof_feature_type | 9 |
| problem | 10 |
| problem_topic | 12 |
| solution | 16 |
| solution_proof_feature | 49 |
| strategy | 90 |
| thinking_graph_node | 285 |
| thinking_graph_edge | 389 |
| principle_instance | 78 |
| principle_instance_node | 0 (still deliberately skipped, per "- 001") |
| principle_dependency_edge | 80 |

## Process

Each of the 6 problems' full reports (from "- 002") was transcribed by an independent forked subagent into a self-contained Python data fragment (`scripts/_fragments_002/frag_*.py`), exposing `NEW_TOPICS` / `NEW_PRINCIPLE_TYPES` / `NEW_REASONING_ACTIONS` / `PROBLEM` / `PROBLEM_TOPIC_IDS` / `build(...)`. `scripts/load_dna_seed_v1.py` was extended to import all 6, dedupe their new dictionary rows against each other and the original 30/6/27, and call each `build(...)` alongside the original 4 problems' inline blocks — kept as the single idempotent seed script for all 10 problems, per "- 001"'s original design.

Before touching Supabase, the merged dataset was dry-run against a mocked `requests` layer (capturing every row `post()` would send, no network calls) and checked for: duplicate primary keys in every table, every foreign key resolving to a real row, zero cycles across all 16 solution graphs, and every field satisfying its schema's actual `CHECK` constraint (extracted from `schemas/dna_schema_v1.sql`, not assumed) — 0 referential-integrity errors on the first dry run.

## Two real failures on first execution (not caught by the dry run's constraint list, since it only checked constraints it already knew to check for)

The dry run's constraint table was hand-built by reading the schema, and missed nothing schema-side — but the actual `cleanup()`+reload against live Supabase still surfaced 2 bad values from the 2020-A6 fragment that a naive value-shape check didn't catch on the first pass:
1. `thinking_graph_edge.relation = 'frames'` (not in the schema's 8-value enum) — the N1→GOAL framing edge. Fixed to `'requires'`, matching the precedent set by 2006-A3's structurally identical N1→N2 framing edge.
2. `principle_instance.intrinsic_confidence = 'medium'` (schema only allows `'high'`/`'low'`) — 2 principles (`extremal_principle_minimal_counterexample`, `discrete_cauchy_cocycle_additivity`) whose own justification text said "no alternate solution to confirm" — i.e. exactly the schema's documented definition of `'low'`, not a missing third tier. Remapped to `'low'`.

Both fixes applied directly to `scripts/_fragments_002/frag_2020_A6.py`, then the full comprehensive constraint check (all 8 `CHECK` clauses in the schema, not just the ones hit so far) was re-run clean before retrying. The script's `cleanup()`-then-reload design meant the two failed partial runs left no lasting bad state — each retry started from a full wipe.

## principle_type merges applied

Both of "- 002"'s recommended merges went in as planned, and both now span more than one problem, confirmed via REST:
- `well_founded_descent_monovariant_induction` — now used by `IMO-SL-2006-A3-COMMENT`, `IMO-SL-2015-N4-SOL1`, `IMO-SL-2019-C5-SOL1` (3 solutions, 2 problems added this round).
- `covering_partition_argument` — now used by `IMO-SL-2006-A3-COMMENT`, `IMO-SL-2019-C2-SOL1` (first-ever Algebra↔Combinatorics merge, as flagged).

The third candidate flagged in "- 002" (2020-A6's `extremal_principle_minimal_counterexample` vs. existing `extremal_principle_minimal_representative`) was kept separate, per that section's own reasoning — same well-ordering principle, opposite face (refutation vs. existence), not literally the same generic form as currently phrased.

## New vocabulary added

- **4 new topics** (1 deduplicated): `recursive_dynamical_systems` (number_theory, 2015-N4), `subset_sum_covering` (combinatorics, 2019-C2), `graph_rewriting_invariants` (combinatorics, 2019-C5), `circle_configurations` (geometry) — the last proposed independently and identically by both geometry fragments (2015-G2, 2019-G4), deduped to one shared row rather than inserted twice.
- **2 new reasoning actions**: `strengthen_inductive_hypothesis` (construction, 2019-C2), `goal_reduction_via_symmetry` (structural, 2015-G2) — both flagged in "- 002" as genuine gaps in the 27-entry vocabulary, confirmed on transcription.
- **41 new principle_type rows** (71 total, up from 30) — the remainder of the ~44 new principles found across the 6 reports, after the 2 merges and the 1 rejected-merge-kept-separate above.

## Deviations during transcription (surfaced by the forks, not invented at merge time)

- 2020-A6: report's prose said "46 edges," but its own edge table (with multi-parent rows expanded one-edge-per-parent) gives 62 — used the table as ground truth.
- 2019-G4: report's `node_type` column mixed valid `node_type` values with `reasoning_action_type` ids — remapped each node to the correct 12-value enum; report's stated edge_count (22) undercounted its own mermaid diagram (27) — mermaid used as ground truth.
- 2019-C2: Solution 2's mermaid diagram was one edge short of the report's own stated count (16 vs. 17) — added one inferred edge (`M3→M16`) matching an explicit textual dependency, flagged rather than silently fabricated.
- 2015-N4: Solution 2 has no explicit edge table/diagram in the report — edges reconstructed from each node's stated logical dependencies; one-edge discrepancy in Solution 1's own summary count (36 stated vs. 37 in the mermaid) resolved the same way, mermaid as ground truth.
- 2015-G2: Solution 2 has no formal Strategy Layer in the report — one inferred strategy spanning all its nodes was added, flagged as an organizational inference not new math content; one dependency-graph finding (P4→P3 "requires" at a node Solution 2 never builds, by design) couldn't be modeled as a `principle_dependency_edge` and was documented in the principle_instance's justification text instead of forcing a fake edge.

None of these were silent — every fragment's own report-back named the deviation and the ground-truth source used to resolve it.

## Script

`scripts/load_dna_seed_v1.py`, still idempotent (wipes and reloads all 14 tables), now covers all 10 problems via 4 inline blocks (2006-A3, 2007-A1, 2008-A1, 2009-A1) plus 6 imported fragments in `scripts/_fragments_002/`. Not committed to git, matching "- 001".

---

# DNA Table Version 1.0 - 002

Second round: adding 6 new problems to the DNA pool from `data/raw/imo/*` (test 1 covered 2006-A3, 2007-A1, 2008-A1, 2009-A1, loaded into Supabase — see the "- 001" section above and `ClaudeResponse.md`). This round is **report-only**: full pipeline (Thinking Graph → Strategy Layer → Principle extraction → Principle Dependency Graph) run for all 6, but nothing was written to Supabase or to `data/gold/`. Each problem's full report lives in `reports/`.

## Random draw

Picked with a weighted-random script (5/11 weight on Algebra, 2/11 each on Combinatorics/Geometry/Number Theory; year uniform 2006–2024; problem number uniform 1–7), excluding the 4 problems already in the pool. Actual draw, unweighted by outcome:

| Problem | Area |
|---|---|
| IMO-SL-2015-N4 | Number Theory |
| IMO-SL-2019-C2 | Combinatorics |
| IMO-SL-2020-A6 | Algebra |
| IMO-SL-2019-C5 | Combinatorics |
| IMO-SL-2019-G4 | Geometry |
| IMO-SL-2015-G2 | Geometry |

Despite the algebra weighting, only 1/6 landed in Algebra — but that turned out to be valuable: it's the pool's first exposure to Geometry (2 problems) and second area (Combinatorics, 2 problems) outside Algebra/Number Theory, which stress-tested whether the existing all-algebra vocabulary generalizes (it mostly doesn't — see below). No substitutions were needed; all 6 drawn problem numbers existed in their respective shortlists.

## Per-problem counts

| Problem | Solutions graphed | Nodes | Edges | Strategies | Principles | Report |
|---|---|---|---|---|---|---|
| IMO-SL-2020-A6 | 1 | 42 | 46 | 11 (+framing/bookkeeping) | 11 + 1 cross-cutting | `reports/IMO-SL-2020-A6_validation_report.md` |
| IMO-SL-2015-N4 | 2 | Sol.1: 23/36 · Sol.2: 11/10 | — | Sol.1: 9 (2 framing/bookkeeping) · Sol.2: 3 | Sol.1: 6 · Sol.2: 3 | `reports/IMO-SL-2015-N4_validation_report.md` |
| IMO-SL-2019-C2 | 2 | Sol.1: 14/19 · Sol.2: 16/17 | — | Sol.1: 6 · Sol.2: 6 | Sol.1: 4 · Sol.2: 3 | `reports/IMO-SL-2019-C2_validation_report.md` |
| IMO-SL-2019-C5 | 1 (+alternate referenced) | 19 | 24 | 7 (incl. 2 contested framing/bookkeeping) | 6 | `reports/IMO-SL-2019-C5_validation_report.md` |
| IMO-SL-2019-G4 | 1 graphed (key principle independently confirmed across all 3 official solutions) | 20 | 22 | 5 (+1 framing) | 6 | `reports/IMO-SL-2019-G4_validation_report.md` |
| IMO-SL-2015-G2 | 2 | 13 | 15 | 6 (incl. framing/bookkeeping) | 4 | `reports/IMO-SL-2015-G2_validation_report.md` |

All 6 Thinking Graphs verified acyclic. Every problem's own report was independently checked against the official solution text before the graph was built — no fabricated proof steps.

## Principle-vocabulary merge recommendations (not applied — no DB write this round)

Each fork checked its principles against the 30-entry `PRINCIPLE_TYPES` vocabulary in `scripts/load_dna_seed_v1.py`, using the same conservative standard as the project's only prior merge (`two_sided_squeeze`, 2007-A1/2009-A1): merge only if the generic form is truly the same mechanism, not just a surface resemblance.

**Recommended for merge on the next load:**
- 2015-N4 Sol.1's *Well-Founded Descent/Monovariant Induction* → existing `well_founded_descent_monovariant_induction` (same fact — bounded strictly-decreasing integer forces termination — applied to stabilization instead of existence).
- 2019-C5's P5 (*Well-Founded Descent via Strictly Decreasing Monovariant*) → same existing `well_founded_descent_monovariant_induction`. Two independent hits on this type in one round is the strongest reuse signal found so far.
- 2019-C2 Sol.1's P4 (*Covering/No-Gap Interval Union*) → existing `covering_partition_argument`. Would be the project's 2nd-ever cross-problem merge, and the first spanning Algebra↔Combinatorics rather than within Algebra.

**Considered and rejected (flagged as "cousins," not merged — same discipline as 2006-A3's Extremal Principle vs. Extremal Witness Instantiation):**
- 2020-A6's P6 (*Extremal Principle, minimal-counterexample form*) vs. existing `extremal_principle_minimal_representative` — same well-ordering principle, opposite face (refutation vs. existence); flagged as the best case yet for broadening that entry's wording to cover both faces, but not merged as currently phrased.
- 2019-C2 Sol.1's P2 (*Extremal-Element Peeling*) vs. the same existing entry — rejected, different mechanism.
- 2015-N4 Sol.1's P2 vs. `extremal_witness_instantiation` — rejected.
- 2015-G2's P4 (*Bilateral Configuration Symmetry*) vs. existing `galois_conjugate_symmetry` — structurally analogous (both are involutive-symmetry principles) but different domain (geometric reflection vs. field automorphism); flagged as a possible shared parent abstraction once more data points exist, not merged on n=2.

**Everything else (24 of the ~36 new principles across the 6 problems) is new vocabulary** — no candidate at all in the existing 30, mostly because 4 of the 6 problems are outside Algebra.

## The geometry finding

2015-G2 and 2019-G4 are the pool's first geometry problems, and both forks were asked to explicitly check whether the algebra-derived vocabulary holds up. It does not:
- **Topics:** 0/6 existing topics fit either problem; a new `circle_configurations` topic is needed.
- **Principle types:** 0/30 existing entries reusable in either problem — all 4 (2015-G2) and all 6 (2019-G4) principles are new. Only the abstract *shape* of two of 2019-G4's principles echoes `additive_two_term_averaging` (both are pigeonhole-on-fixed-aggregate variants), but neither merges — flagged as a future generalization, not a match.
- **Reasoning actions:** transferred almost cleanly (26/27 of the existing 27 reused in 2015-G2) except one gap — a new `goal_reduction_via_symmetry` action (category: structural) is needed for "use a known symmetry to shrink a global claim to a local one," used twice in 2015-G2's proof.

This mirrors, at a larger scale, the same pattern 2006-A3 already established for algebraic number theory (`galois_conjugate_symmetry` had to be invented for it): each new mathematical area brings its own specialized principle layer on top of a smaller universal core, rather than the universal core simply absorbing new problems for free.

## Other cross-pool findings

- **2019-G4's P3** (Chord-Ray Inside/Outside Correspondence) is independently confirmed across all 3 of that problem's official solutions — the highest-confidence single new principle found this round, and the strongest "problem-intrinsic" case in the batch precisely because 3 unrelated proofs all hit it.
- **2019-C2** has the most lopsided intrinsic/specific split seen yet: only 1 of 7 principles across its two solutions is problem-intrinsic (vs. 5/9 for 2006-A3) — both of its solutions prove the identical "mesh ≤ 2" fact via completely unrelated mechanisms, so almost all of its DNA lives in *how*, not *what*.
- **2019-C5**'s dependency graph is a DAG with three independent source chains converging on one terminal principle — per that report, the third independent occurrence of this exact "multiple sources converge on one sink" shape across the project's validations to date (after 2006-A3 and one other).
- **2019-C5's P4** is directly falsified as the *only* route to the theorem by the source's own alternate Solution 2, which proves the same result without that principle at all — same pattern of evidence Task 004/2006-A3 established for classifying solution-specific ideas.

## Deviations / process notes

- Each problem was handled by an independent forked subagent (6 total, run in parallel) given the same directive: locate problem + official solution(s) in the PDF, verify the proof logic before graphing it, build the full pipeline, write a report matching the depth of `reports/IMO-SL-2009-A1_validation_003_report.md`, and return a compact summary. This kept per-problem depth consistent without serializing 6 problems' worth of work.
- Two problems' alternate official solutions were fully graphed as second Thinking Graphs (2015-N4, 2019-C2), one as a modular-swap alternate with `is_complete=false` (2015-G2, whose Solution 2 explicitly reuses Solution 1's opening reduction by citation, matching the pattern already established for 2006-A3/2008-A1). 2019-C5 and 2019-G4 reference their sources' alternates in-text (for corroborating a principle's intrinsic status) without building full second graphs for them.
- No JSON gold files were created for any of the 6, matching the precedent set by 2007/2008/2009-A1 (only 2006-A3 has a `data/gold/*.json`).
- No Supabase load this round, and no changes to `scripts/load_dna_seed_v1.py`, `schemas/`, or `data/gold/` — purely additive reports, by design (this test's scope).

## Suggested next step

A third round that (a) actually loads these 6 problems' DNA into Supabase alongside the merge decisions above, and (b) extends the schema's controlled vocabularies for the new `circle_configurations` topic and `goal_reduction_via_symmetry` reasoning action the geometry problems surfaced — the DNA table doc (`docs/12_DNA_TABLE_v1.0.md`) and `dna_schema_v1.sql` wouldn't need structural changes for this, just new dictionary rows.

---

# DNA Table Version 1.0 - 001

Loading Validation 001-003 DNA data into Supabase.

All 14 tables populated successfully with no insert failures after two schema-modeling fixes (below). Verified via REST spot-checks: `two_sided_squeeze` correctly shared across 3 principle_instance rows spanning 2007-A1 (both solutions) and 2009-A1; zero cycles across all 7 solution graphs; node/edge counts match each report's own stated totals (2006-A3: 23, 2007-A1: 28, 2008-A1: 23, 2009-A1: 21).

## Row counts

| Table | Rows |
|---|---|
| topic | 6 |
| principle_type | 30 |
| reasoning_action_type | 27 |
| proof_feature_type | 9 |
| problem | 4 |
| problem_topic | 6 |
| solution | 7 |
| solution_proof_feature | 18 |
| strategy | 30 |
| thinking_graph_node | 118 |
| thinking_graph_edge | 161 |
| principle_instance | 33 |
| principle_instance_node | 0 (deliberately skipped — optional provenance junction, deferred) |
| principle_dependency_edge | 28 |

## principle_type merges

Only one cross-problem merge made — `two_sided_squeeze`, confirmed by 2009-A1's own report text explicitly calling its P5 identical in generic form to 2007-A1's closing principle. Everything else kept separate on conservative grounds, including 2006-A3's "Extremal Principle" vs. 2007-A1's "Extremal Witness Instantiation," which 2007-A1's own report calls "cousins... not matched strength" — deliberately not merged.

## Reasoning actions/relations

Native (author-annotated) only for 2009-A1. Backfilled uniformly for 2006-A3, 2007-A1, 2008-A1 using 2009-A1's vocabulary plus necessary extensions (factorization, contradiction, induction, bounding, etc. — 27 action types total, most reused across ≥2 problems). `thinking_graph_edge.relation` was backfilled for 2008-A1/2009-A1 via heuristic (target-node-type-based); used verbatim from source for 2006-A3 (JSON) and largely verbatim from prose for 2007-A1.

## is_problem_intrinsic defaults

2006-A3 and most of 2008-A1 had direct evidence (including one deliberate use of `'mixed'` for 2006-A3's P8 and 2008-A1's P8 — both explicitly split "the raw identity is intrinsic, its role here is solution-specific"). 2007-A1 and 2009-A1 have no such classification deliverable at all — all their principle_instances defaulted to `intrinsic`/`low` confidence, flagged as defaults, not findings.

## Deviation from instructions

Treated 2006-A3's Comment as `is_complete=false` (not just 2008-A1's), since 2006-A3's own material (ClaudeResponse.md) explicitly documents it as replacing only one lemma and handing back to the main Solution — same pattern, same test, just not the literal example named in the brief.

## Modeling limitation surfaced

Two solutions (2006-A3/2008-A1 Comments) have cross-solution edges (reusing a main-Solution node, or handing a result back into one) that the schema wasn't explicitly designed for; represented them as ordinary `thinking_graph_edge` rows with `solution_id` set to whichever side seemed more natural. Consequence: 2008-A1-COMMENT shows `entry_node_count=0, terminal_node_count=0` in the graph-feature cache — correct given the cross-edges, but a real artifact worth knowing about if this pattern recurs at scale.

## Script

Kept at `scripts/load_dna_seed_v1.py` (idempotent — cleans up its own 14 tables before reloading; touches nothing else in the shared project). Not committed to git.
