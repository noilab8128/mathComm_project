"""
One-off loader: populate the DNA Table v1.0 schema (schemas/dna_schema_v1.sql)
in Supabase with Problem DNA + Solution DNA for the four problems studied in
Validations 001-003 (IMO-SL-2006-A3, 2007-A1, 2008-A1, 2009-A1).

Source material used, strictly:
  - data/gold/IMO-SL-2006-A3.json (nodes/edges/relations already structured)
  - reports/IMO-SL-2006-A3_thinking_graph.md, _solution_comparison.md
  - reports/ClaudeResponse.md (Tasks 003-006: strategies, principles, principle graph for 2006-A3)
  - reports/IMO-SL-2007-A1_validation_report.md
  - reports/IMO-SL-2008-A1_validation_002_report.md
  - reports/IMO-SL-2009-A1_validation_003_report.md

Uses the Supabase REST API (PostgREST) exclusively -- the direct Postgres
host is IPv6-only and unreachable from this network. Credentials come from
.env (SUPABASE_URL, SUPABASE_SECRET_KEY).

Run: python3 scripts/load_dna_seed_v1.py
"""

import json
import os
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[1]

# ---------------------------------------------------------------------------
# Validation round "test 2": 6 additional problems (2020-A6, 2015-N4,
# 2019-C2, 2019-C5, 2019-G4, 2015-G2), transcribed from their
# reports/IMO-SL-*_validation_report.md into self-contained fragments, each
# exposing NEW_TOPICS / NEW_PRINCIPLE_TYPES / NEW_REASONING_ACTIONS / PROBLEM
# / PROBLEM_TOPIC_IDS / build(...). See reports/ClaudeDNAResponse.md "- 003" section.
# ---------------------------------------------------------------------------
sys.path.insert(0, str(ROOT / "scripts" / "_fragments_002"))
import frag_2020_A6
import frag_2015_N4
import frag_2019_C2
import frag_2019_C5
import frag_2019_G4
import frag_2015_G2

FRAGMENTS_002 = [frag_2020_A6, frag_2015_N4, frag_2019_C2, frag_2019_C5, frag_2019_G4, frag_2015_G2]


def load_env():
    env = {}
    for line in (ROOT / ".env").read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        env[k.strip()] = v.strip()
    return env


ENV = load_env()
SUPABASE_URL = ENV["SUPABASE_URL"].rstrip("/")
SUPABASE_KEY = ENV["SUPABASE_SECRET_KEY"]

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}


def post(table, rows):
    if not rows:
        return
    r = requests.post(f"{SUPABASE_URL}/rest/v1/{table}", headers=HEADERS, data=json.dumps(rows))
    if r.status_code >= 300:
        print(f"FAILED insert into {table}: HTTP {r.status_code}")
        print(r.text)
        sys.exit(1)
    print(f"  inserted {len(rows)} row(s) into {table}")


def patch(table, filter_col, filter_val, fields):
    r = requests.patch(
        f"{SUPABASE_URL}/rest/v1/{table}?{filter_col}=eq.{filter_val}",
        headers=HEADERS,
        data=json.dumps(fields),
    )
    if r.status_code >= 300:
        print(f"FAILED patch on {table}: HTTP {r.status_code}")
        print(r.text)
        sys.exit(1)


def delete_all(table, pk):
    r = requests.delete(
        f"{SUPABASE_URL}/rest/v1/{table}?{pk}=neq.__none__",
        headers={**HEADERS, "Prefer": "return=minimal"},
    )
    if r.status_code >= 300:
        print(f"FAILED cleanup delete on {table}: HTTP {r.status_code}")
        print(r.text)
        sys.exit(1)


def cleanup():
    print("Cleaning up any partially-loaded rows from a previous run...")
    for table, pk in [
        ("principle_dependency_edge", "edge_id"),
        ("principle_instance_node", "instance_id"),
        ("principle_instance", "instance_id"),
        ("thinking_graph_edge", "edge_id"),
        ("thinking_graph_node", "node_id"),
        ("strategy", "strategy_id"),
        ("solution_proof_feature", "solution_id"),
        ("solution", "solution_id"),
        ("problem_topic", "problem_id"),
        ("problem", "problem_id"),
        ("proof_feature_type", "feature_type_id"),
        ("reasoning_action_type", "action_type_id"),
        ("principle_type", "principle_type_id"),
        ("topic", "topic_id"),
    ]:
        delete_all(table, pk)
    print("Cleanup done.\n")


def count_rows(table):
    h = dict(HEADERS)
    h["Prefer"] = "count=exact"
    r = requests.get(f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1", headers=h)
    cr = r.headers.get("content-range", "*/0")
    return int(cr.split("/")[-1])


def compute_graph_stats(node_ids, edges):
    """edges: list of (parent, child, ...). node_ids: list of full node ids for
    THIS solution. Edges may reference a parent belonging to another solution
    (a documented cross-solution dependency, e.g. an alternate text reusing a
    node from the main Solution) -- such parents are treated as external and
    always already-satisfied for topological/cycle purposes."""
    node_set = set(node_ids)
    indeg = {n: 0 for n in node_ids}
    outdeg = {n: 0 for n in node_ids}
    adj = {n: [] for n in node_ids}
    external_indeg = {n: 0 for n in node_ids}
    for e in edges:
        p, c = e[0], e[1]
        p_local = p in node_set
        c_local = c in node_set
        if p_local:
            outdeg[p] += 1
            if c_local:
                adj[p].append(c)
        if c_local:
            indeg[c] += 1
            if not p_local:
                external_indeg[c] += 1

    entry = [n for n in node_ids if indeg[n] == 0]
    terminal = [n for n in node_ids if outdeg[n] == 0]
    branch = sum(1 for n in node_ids if outdeg[n] > 1)
    merge = sum(1 for n in node_ids if indeg[n] > 1)

    # topological order + cycle check + longest path (max_depth), counting
    # only local edges (external parents are always considered satisfied)
    from collections import deque

    indeg_work = {n: indeg[n] - external_indeg[n] for n in node_ids}
    order = []
    q = deque([n for n in node_ids if indeg_work[n] == 0])
    while q:
        n = q.popleft()
        order.append(n)
        for m in adj[n]:
            indeg_work[m] -= 1
            if indeg_work[m] == 0:
                q.append(m)
    has_cycle = len(order) != len(node_ids)

    depth = {n: 0 for n in node_ids}
    if not has_cycle:
        for n in order:
            for m in adj[n]:
                depth[m] = max(depth[m], depth[n] + 1)
    max_depth = max(depth.values()) if depth else 0

    return {
        "node_count": len(node_ids),
        "edge_count": len(edges),
        "entry_node_count": len(entry),
        "terminal_node_count": len(terminal),
        "max_depth": max_depth,
        "branch_count": branch,
        "merge_count": merge,
        "has_cycle": has_cycle,
    }


# =====================================================================
# DICTIONARY DATA
# =====================================================================

TOPICS = [
    {"topic_id": "linear_recurrences", "name": "Linear Recurrences", "area": "algebra",
     "description": "Sequences defined by linear recurrence relations and their characteristic equations."},
    {"topic_id": "algebraic_number_theory", "name": "Algebraic Number Theory", "area": "number_theory",
     "description": "Properties of algebraic/irrational numbers (conjugate roots, irrationality arguments)."},
    {"topic_id": "sequences_and_bounds", "name": "Sequences and Bounds", "area": "algebra",
     "description": "Real sequences and inequalities bounding functionals of them."},
    {"topic_id": "functional_equations", "name": "Functional Equations", "area": "algebra",
     "description": "Equations whose unknown is a function, solved by substitution/dichotomy arguments."},
    {"topic_id": "order_statistics", "name": "Order Statistics", "area": "combinatorics",
     "description": "Sorted/ranked sequences and extremal arguments about them."},
    {"topic_id": "triangle_geometry", "name": "Triangle Geometry", "area": "geometry",
     "description": "Triangle inequality and non-degeneracy conditions."},
]

PROBLEM_TOPICS = {
    "IMO-SL-2006-A3": ["linear_recurrences", "algebraic_number_theory"],
    "IMO-SL-2007-A1": ["sequences_and_bounds"],
    "IMO-SL-2008-A1": ["functional_equations"],
    "IMO-SL-2009-A1": ["order_statistics", "triangle_geometry"],
}

PRINCIPLE_TYPES = [
    ("dominant_eigenvalue_domination", "Dominant-Eigenvalue / Growth-Rate Domination",
     "A sequence in the solution space of a linear recurrence that must stay bounded cannot have a nonzero component along a root of magnitude >1.", "common_technique"),
    ("canonical_representation_gauge_fixing", "Canonical Representation via Gauge/Scale Fixing",
     "Fix an arbitrary but convenient representative from a family related by a scaling/symmetry action.", "universal"),
    ("coordinate_transformation_eigenbasis", "Coordinate Transformation (change of basis to the problem's natural eigenbasis)",
     "Re-express the objects in the basis in which the governing recurrence/operator is diagonal.", "common_technique"),
    ("extremal_bounding_convergent_series", "Extremal Bounding of a Convergent Series",
     "Any finite subselection from an absolutely summable sequence is squeezed between the sums of the extremal (full) selections.", "common_technique"),
    ("extremal_principle_minimal_representative", "Extremal Principle (minimal-counterexample / well-ordering argument)",
     "Prove existence of a well-behaved object by taking an extremal member of a nonempty candidate set and showing any defect contradicts extremality.", "universal"),
    ("linear_independence_over_q", "Linear Independence over Q (unique representation in a Q-basis)",
     "Coefficients in a rational-basis representation of an irrational quantity are unique.", "common_technique"),
    ("positional_canonical_numeral_representation", "Positional / Canonical Numeral Representation",
     "The object set is secretly a positional numeral system with a no-adjacent-digit carrying rule.", "common_technique"),
    ("galois_conjugate_symmetry", "Galois / Algebraic Conjugate Symmetry",
     "The nontrivial automorphism swapping a quadratic irrational and its conjugate underlies the proof's identities and mirror-image case structure.", "specialized"),
    ("well_founded_descent_monovariant_induction", "Well-Founded Descent / Monovariant Induction",
     "A strictly decreasing integer measure along each recursive branch guarantees termination, proving existence by strong induction.", "universal"),
    ("covering_partition_argument", "Covering / Partition Argument",
     "Show two ranges cover the whole domain so at least one of two recursive cases always applies.", "common_technique"),
    ("extremal_witness_instantiation", "Extremal Witness Instantiation",
     "A maximum/minimum of a nonempty finite set of reals is attained by some element, which may be named and manipulated as an ordinary number.", "common_technique"),
    ("additive_two_term_averaging", "Additive Two-Term Averaging",
     "For reals u,v: if u+v>=S then max(u,v)>=S/2.", "common_technique"),
    ("monotone_envelope_construction", "Monotone Envelope / Running-Extremum Construction",
     "The running maximum x_k=max(x_{k-1},L_k) is the pointwise-smallest nondecreasing sequence with x_k>=L_k for all k.", "common_technique"),
    ("last_change_freshness_tracing", "Last-Change (Freshness) Tracing on a Recursive Max",
     "In x_k=max(x_{k-1},L_k), every x_k equals L at the largest index at which the max was freshly set.", "common_technique"),
    ("two_sided_squeeze", "Two-Sided Squeeze to Establish an Extremal Value",
     "Prove f>=B in general and exhibit one witness with f=B to pin down an exact extremal constant.", "universal"),
    ("value_extraction_symmetric_degenerate_substitution", "Value Extraction by Symmetric/Degenerate Substitution",
     "Plugging a symmetric or degenerate instance into a functional/relational equation collapses several unknowns into one, pinning a specific value.", "common_technique"),
    ("parametrized_substitution_factoring_dichotomy", "Parametrized Substitution -> Pointwise Polynomial Constraint, Solved by Factoring",
     "A substitution depending on a free parameter x turns a functional equation into a pointwise polynomial equation, factored into a finite menu of possibilities.", "common_technique"),
    ("direct_verification_of_candidates", "Direct Verification of Candidate Solutions",
     "To confirm a proposed answer set is complete, separately check each candidate satisfies the original condition.", "universal"),
    ("witness_extraction_negated_universal_claim", "Witness Extraction from a Negated Universal Claim",
     "To disprove 'every object is of form A or B', negate to get 'some object fails A and some fails B' and name those witnesses.", "universal"),
    ("combine_two_data_points_joint_substitution", "Combine Two Known Data Points via a Joint Substitution",
     "Given known values at two points, choose an instance of the governing relation using both simultaneously to force a linking constraint.", "common_technique"),
    ("exhaustive_case_elimination_against_constraints", "Exhaustive Case Elimination Against Prior Constraints",
     "Given a finite menu of possibilities, test each against previously established facts and eliminate all of them.", "common_technique"),
    ("fixed_point_coincidence_branch_crossing", "Fixed-Point Coincidence at the Branch-Crossing Point",
     "The point where two dichotomy branches agree is a natural collapse point; forcing an exceptional object there makes it non-exceptional after all.", "specialized"),
    ("union_sufficiency_refuted_alternative", "Union of Sufficiency and Refuted-Alternative to Close a Classification",
     "Combine (i) each candidate genuinely works and (ii) nothing else can work into 'these are exactly the solutions'.", "universal"),
    ("involution_symmetry_x_inverse_x", "x <-> 1/x Involution Symmetry of the Governing Equation",
     "The candidate solutions are related by a fixed involution of the domain; the proof architecture is implicitly organized around it.", "specialized"),
    ("build_paired_symmetric_relations_dual_substitution", "Build Paired Symmetric Relations via Dual Substitution",
     "Substitute two related instances (e.g. x and 1/x) to build a pair of symmetric relations in the unknown function.", "common_technique"),
    ("difference_of_squares_extraction", "Difference-of-Squares Extraction",
     "Square and subtract a pair of symmetric relations to isolate a difference-of-squares identity that reproduces the target dichotomy.", "common_technique"),
    ("assert_target_extremal_value_guess_verify", "Guess-and-Verify Framing of an Extremal Claim",
     "State the conjectured extremal value upfront, then split the proof into a universal bound and a matching sharp example.", "universal"),
    ("bounding_order_statistic_via_witness", "Bounding an Order Statistic via a Witness",
     "To lower-bound a property of the maximum of a sorted list, find one real object achieving that maximum and transfer its properties.", "common_technique"),
    ("explicit_extremal_family_construction", "Explicit Extremal Family Construction",
     "To show a bound is not improvable, exhibit a concrete family of instances realizing the boundary.", "universal"),
    ("engineered_alignment_construction_order_statistic", "Engineered Alignment Between Local Construction and Global Order Statistic",
     "Design a construction so each instance's own value already equals the corresponding order statistic of the whole collection.", "common_technique"),
]

REASONING_ACTION_TYPES = [
    ("assert_target_value", "Assert Target Value", "construction"),
    ("symmetry_wlog", "Symmetry (WLOG)", "construction"),
    ("existence_instantiation", "Existence Instantiation", "construction"),
    ("construct_auxiliary_object", "Construct Auxiliary Object", "construction"),
    ("define_object", "Define Object", "construction"),
    ("extremal_choice", "Extremal Choice", "construction"),
    ("recursive_construction", "Recursive Construction", "construction"),
    ("induction", "Induction", "construction"),
    ("invoke_given_definitional_property", "Invoke Given/Definitional Property", "deduction"),
    ("substitution", "Substitution", "deduction"),
    ("algebraic_simplification", "Algebraic Simplification", "deduction"),
    ("factorization", "Factorization", "deduction"),
    ("inequality_chaining", "Inequality Chaining (Transitivity)", "deduction"),
    ("direct_computation_verification", "Direct Computation/Verification", "deduction"),
    ("irrationality_uniqueness_argument", "Irrationality Uniqueness Argument", "deduction"),
    ("invoke_prior_lemma_fact", "Invoke Prior Lemma/Fact", "structural"),
    ("structural_invariant_identification", "Structural/Invariant Identification", "structural"),
    ("bounding", "Bounding", "structural"),
    ("case_split", "Case Split", "logical_closing"),
    ("merge_cases", "Merge Cases", "logical_closing"),
    ("contradiction", "Contradiction", "logical_closing"),
    ("boundary_equality_identification", "Boundary/Equality Identification", "logical_closing"),
    ("covering_case_union", "Covering Case Union", "logical_closing"),
    ("monovariant_descent_step", "Monovariant Descent Step", "logical_closing"),
    ("combine_bounds_squeeze_assemble", "Combine Bounds (Squeeze/Assemble)", "logical_closing"),
    ("conclude", "Conclude", "logical_closing"),
    ("framing_setup", "Framing/Setup", "framing"),
]

PROOF_FEATURE_TYPES = ["direct", "contradiction", "construction", "extremal", "invariant",
                        "monovariant", "functional", "recursive", "symmetric"]


# =====================================================================
# PROBLEMS
# =====================================================================

PROBLEMS = [
    {
        "problem_id": "IMO-SL-2006-A3", "contest": "IMO Shortlist", "year": 2006, "round": "Shortlist",
        "problem_number": "A3", "source": "data/raw/imo/IMO2006SL.pdf, pp. 10-12",
        "statement_text": ("The sequence c_0, c_1, ..., c_n, ... is defined by c_0 = 1, c_1 = 0 and "
                           "c_{n+2} = c_{n+1} + c_n for n >= 0. Consider the set S of ordered pairs (x, y) "
                           "for which there is a finite set J of positive integers such that x = sum_{j in J} c_j, "
                           "y = sum_{j in J} c_{j-1}. Prove that there exist real numbers alpha, beta and m, M "
                           "with the following property: An ordered pair of nonnegative integers (x, y) satisfies "
                           "the inequality m < alpha*x + beta*y < M if and only if (x, y) in S."),
        "difficulty": None,
        "objects_text": "Fibonacci-type recurrence sequence c_n; finite index sets J of positive integers; ordered pairs (x,y) generated by J; reals alpha,beta,m,M defining a bounded linear strip.",
        "hidden_structure": "Zeckendorf's theorem in disguise: distinct-index sums of powers of psi form a base-psi positional numeral system, mirroring how distinct-index Fibonacci sums biject onto N.",
        "expected_insight": "The recurrence's own characteristic roots phi,psi are the right coordinates -- expressing membership in S in that eigenbasis turns a 2D combinatorial problem into a 1D analytic one; existence then follows from an extremal minimal-representation argument.",
        "problem_family": None, "problem_template": None,
    },
    {
        "problem_id": "IMO-SL-2007-A1", "contest": "IMO Shortlist", "year": 2007, "round": "Shortlist",
        "problem_number": "A1", "source": "data/raw/imo/IMO2007SL.pdf, pp. 7-9",
        "statement_text": ("Given a sequence a_1, a_2, ..., a_n of real numbers. For each i (1<=i<=n) define "
                           "d_i = max{a_j : 1<=j<=i} - min{a_j : i<=j<=n} and let d = max{d_i : 1<=i<=n}. "
                           "(a) Prove that for arbitrary real numbers x_1<=x_2<=...<=x_n, "
                           "max{|x_i - a_i| : 1<=i<=n} >= d/2. (b) Show that there exists a sequence "
                           "x_1<=x_2<=...<=x_n of real numbers such that equality holds."),
        "difficulty": None,
        "objects_text": "Finite real sequence a_1..a_n; derived quantities d_i, d; a nondecreasing real sequence x_1..x_n approximating it.",
        "hidden_structure": None,
        "expected_insight": "The same maximum-gap quantity d has two faces: a lower bound from a two-term pigeonhole on any single witness triple, and a matching upper bound from an explicit running-max construction -- the difficulty concentrates entirely in tracing the construction's last reset.",
        "problem_family": None, "problem_template": None,
    },
    {
        "problem_id": "IMO-SL-2008-A1", "contest": "IMO Shortlist", "year": 2008, "round": "Shortlist",
        "problem_number": "A1", "source": "data/raw/imo/IMO2008SL.pdf, pp. 7-8",
        "statement_text": ("Find all functions f:(0,infinity)->(0,infinity) such that "
                           "(f(p)^2+f(q)^2)/(f(r^2)+f(s^2)) = (p^2+q^2)/(r^2+s^2) for all p,q,r,s>0 with pq=rs."),
        "difficulty": None,
        "objects_text": "Function f:(0,infinity)->(0,infinity); functional equation relating f at four positive reals p,q,r,s with pq=rs.",
        "hidden_structure": "The two candidate solutions f=x and f=1/x are related by the involution x<->1/x; the whole dichotomy-then-eliminate-mixing architecture is implicitly organized around that symmetry even where no single proof step names it.",
        "expected_insight": "Anchoring f(1)=1 forces a clean quadratic factorization at every point, producing a two-way pointwise dichotomy; ruling out 'mixed' solutions then reduces to cross-substituting two hypothetical exceptions and re-invoking the same dichotomy at their product.",
        "problem_family": None, "problem_template": None,
    },
    {
        "problem_id": "IMO-SL-2009-A1", "contest": "IMO Shortlist", "year": 2009, "round": "Shortlist",
        "problem_number": "A1", "source": "data/raw/imo/IMO2009SL.pdf, p. 12",
        "statement_text": ("Find the largest possible integer k such that: Let 2009 arbitrary non-degenerate "
                           "triangles be given. In every triangle the three sides are colored blue, red, white. "
                           "For every color separately, sort the lengths, obtaining b_1<=...<=b_2009, "
                           "r_1<=...<=r_2009, w_1<=...<=w_2009. Then there exist k indices j such that "
                           "b_j,r_j,w_j form a non-degenerate triangle."),
        "difficulty": None,
        "objects_text": "2009 non-degenerate triangles with sides colored blue/red/white; sorted sequences b_j,r_j,w_j of same-colored side lengths.",
        "hidden_structure": None,
        "expected_insight": "The answer k=1 splits cleanly into two independent halves: an extremal-witness argument shows index 2009 always works for any collection, while a single explicitly-constructed, already-sorted family shows no smaller index can be guaranteed.",
        "problem_family": None, "problem_template": None,
    },
]

# Extend the controlled vocabularies + problem list with the 6 "test 2" fragments.
# Topics are deduped by id (2015-G2 and 2019-G4 independently proposed the same
# circle_configurations topic; kept once, referenced by both problems).
_seen_topic_ids = {t["topic_id"] for t in TOPICS}
for _frag in FRAGMENTS_002:
    for _t in _frag.NEW_TOPICS:
        if _t["topic_id"] not in _seen_topic_ids:
            TOPICS.append(_t)
            _seen_topic_ids.add(_t["topic_id"])
    PRINCIPLE_TYPES.extend(_frag.NEW_PRINCIPLE_TYPES)
    REASONING_ACTION_TYPES.extend(_frag.NEW_REASONING_ACTIONS)
    PROBLEMS.append(_frag.PROBLEM)
    PROBLEM_TOPICS[_frag.PROBLEM["problem_id"]] = _frag.PROBLEM_TOPIC_IDS


def sid(pid, suf):
    return f"{pid}-{suf}"


def main():
    print("Verifying REST connectivity...")
    r = requests.get(f"{SUPABASE_URL}/rest/v1/topic?select=*", headers=HEADERS)
    r.raise_for_status()
    print("OK\n")

    cleanup()

    print("== Dictionary tables ==")
    post("topic", TOPICS)
    post("principle_type", [
        {"principle_type_id": pid, "name": name, "generic_form": gf, "generality_class": gc}
        for pid, name, gf, gc in PRINCIPLE_TYPES
    ])
    post("reasoning_action_type", [
        {"action_type_id": aid, "name": name, "category": cat}
        for aid, name, cat in REASONING_ACTION_TYPES
    ])
    post("proof_feature_type", [{"feature_type_id": f, "name": f} for f in PROOF_FEATURE_TYPES])

    print("\n== problem / problem_topic ==")
    post("problem", PROBLEMS)
    pt_rows = []
    for pid, topics in PROBLEM_TOPICS.items():
        for t in topics:
            pt_rows.append({"problem_id": pid, "topic_id": t})
    post("problem_topic", pt_rows)

    all_solutions = []
    all_strategies = []
    all_nodes = []
    all_edges = []
    all_proof_features = []
    all_principle_instances = []
    all_principle_dep_edges = []
    solution_graph_data = {}  # solution_id -> (node_ids, edges) for stats

    # =================================================================
    # IMO-SL-2006-A3
    # =================================================================
    P = "IMO-SL-2006-A3"
    SOL1 = sid(P, "SOL1")
    COMMENT = sid(P, "COMMENT")

    data_2006 = json.loads((ROOT / "data/gold/IMO-SL-2006-A3.json").read_text())
    tg = data_2006["thinking"]["thinking_graph"]

    strategy_of = {
        "N3": "S0", "N4": "S0", "N5": "S0",
        "N6": "S1", "N7": "S1", "N8": "S1",
        "N9": "S2",
        "N10": "S3", "N11": "S3",
        "N12": "S4", "N13": "S4",
        "N14": "S5", "N15": "S5", "N16": "S5", "N17": "S5", "N18": "S5", "N19": "S5", "N20": "S5", "N21": "S5",
        "N22": "S6",
        "N23": "S7",
    }
    strategies_2006 = [
        ("S0", 0, "Fix coordinate system: introduce phi,psi, Binet formula and Vieta identities.", True, False),
        ("S1", 1, "Force the line via a stress test on an unbounded witness family.", False, False),
        ("S2", 2, "Normalize the witness by choosing alpha=psi, beta=1.", False, False),
        ("S3", 3, "Recode set membership as a power-sum identity.", False, False),
        ("S4", 4, "Bound the recoded object via geometric series.", False, False),
        ("S5", 5, "Prove existence via extremal (minimal-length) representative.", False, False),
        ("S6", 6, "Prove uniqueness via irrationality of psi.", False, False),
        ("S7", 7, "Assemble forward and converse directions.", False, True),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_2006:
        all_strategies.append({
            "strategy_id": sid(SOL1, suf), "solution_id": SOL1, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    node_ids_2006 = []
    for i, n in enumerate(tg["nodes"]):
        nid = sid(SOL1, n["node_id"])
        node_ids_2006.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL1, "sequence_index": i,
            "node_type": n["node_type"], "statement_text": n["statement"], "purpose": n.get("purpose"),
            "importance": n["importance"], "source_span": n.get("source_span"),
            "strategy_id": sid(SOL1, strategy_of[n["node_id"]]) if n["node_id"] in strategy_of else None,
        })

    action_override_2006 = {
        ("N1", "N2"): "framing_setup", ("N1", "N3"): "define_object", ("N3", "N4"): "algebraic_simplification",
        ("N1", "N5"): "invoke_given_definitional_property", ("N3", "N5"): "algebraic_simplification",
        ("N1", "N6"): "invoke_given_definitional_property", ("N2", "N7"): "invoke_given_definitional_property",
        ("N6", "N7"): "substitution", ("N5", "N8"): "invoke_given_definitional_property",
        ("N7", "N8"): "inequality_chaining", ("N8", "N9"): "substitution",
        ("N4", "N9"): "invoke_given_definitional_property", ("N5", "N10"): "substitution",
        ("N9", "N10"): "substitution", ("N1", "N11"): "invoke_given_definitional_property",
        ("N10", "N11"): "algebraic_simplification", ("N3", "N12"): "invoke_given_definitional_property",
        ("N4", "N12"): "invoke_given_definitional_property", ("N11", "N12"): "bounding",
        ("N11", "N13"): "inequality_chaining", ("N12", "N13"): "inequality_chaining",
        ("N2", "N14"): "assert_target_value", ("N13", "N14"): "invoke_given_definitional_property",
        ("N14", "N15"): "construct_auxiliary_object", ("N15", "N16"): "structural_invariant_identification",
        ("N4", "N16"): "invoke_given_definitional_property", ("N15", "N17"): "case_split",
        ("N4", "N18"): "invoke_given_definitional_property", ("N16", "N19"): "invoke_prior_lemma_fact",
        ("N4", "N19"): "invoke_given_definitional_property", ("N14", "N19"): "invoke_given_definitional_property",
        ("N16", "N20"): "invoke_prior_lemma_fact", ("N4", "N20"): "invoke_given_definitional_property",
        ("N14", "N20"): "invoke_given_definitional_property", ("N18", "N21"): "merge_cases",
        ("N19", "N21"): "merge_cases", ("N20", "N21"): "merge_cases", ("N11", "N22"): "substitution",
        ("N21", "N22"): "irrationality_uniqueness_argument", ("N13", "N23"): "combine_bounds_squeeze_assemble",
        ("N22", "N23"): "combine_bounds_squeeze_assemble",
        ("N17", "N18"): "contradiction", ("N17", "N19"): "contradiction", ("N17", "N20"): "contradiction",
    }
    edges_2006 = []
    for i, e in enumerate(tg["edges"]):
        key = (e["from"], e["to"])
        action = action_override_2006[key]
        pn, cn = sid(SOL1, e["from"]), sid(SOL1, e["to"])
        edges_2006.append((pn, cn))
        all_edges.append({
            "edge_id": f"{SOL1}-E{i+1}", "solution_id": SOL1, "parent_node_id": pn, "child_node_id": cn,
            "relation": e["relation"], "action_type_id": action,
        })
    solution_graph_data[SOL1] = (node_ids_2006, edges_2006)

    all_solutions.append({
        "solution_id": SOL1, "problem_id": P, "label": "Official Solution", "is_primary": True,
        "is_complete": True, "replaces_solution_id": None, "replaces_span_note": None,
        "construction_type": "eigenbasis recoding + extremal minimal-representation existence proof",
        "source_reference": "pdf:IMO2006SL.pdf; pdf_pages:11-12; printed_pages:10-11; heading:Solution.",
    })

    # 2006-A3 Comment (partial alternate, only replaces the existence Lemma / S5)
    strategies_comment_2006 = [("S1", 0, "Prove the existence lemma via induction on n=3x+2y instead of extremal minimal-representation.", False, False)]
    for suf, seq, goal, framing, bookkeeping in strategies_comment_2006:
        all_strategies.append({
            "strategy_id": sid(COMMENT, suf), "solution_id": COMMENT, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })
    comment_nodes_2006 = [
        ("CN1", "definition", "Induct on n=3x+2y; base case J=empty for x=y=0.", "critical", "pdf:IMO2006SL.pdf; printed_page:11-12; heading:Comment.", "S1"),
        ("CN2", "case_split", "Current J must reduce to one of two shapes, i.e. whether (psi*x+y)/psi is in (-1,phi) [case A] or (psi*x+y-1)/psi is in (-1,phi) [case B].", "critical", "printed_page:12", "S1"),
        ("CN3", "calculation", "Case A: set x'=y, y'=x-y; verify range (3) and 3x'+2y'<=(3/2)n, so induction applies.", "important", "printed_page:12", "S1"),
        ("CN4", "calculation", "Case B: set x'=y-1, y'=x-y+1; verify range (4) and 3x'+2y'<(3/2)n, so induction applies.", "important", "printed_page:12", "S1"),
        ("CN5", "inference", "Covering argument: (-1,-psi) union (0,phi) = (-1,phi), so at least one of (3),(4) always holds.", "critical", "printed_page:12", "S1"),
        ("CN6", "conclusion", "Induction step justified; hence J exists for all n by strong induction.", "critical", "printed_page:12", "S1"),
    ]
    node_ids_comment_2006 = []
    for i, (suf, ntype, stmt, imp, span, strat) in enumerate(comment_nodes_2006):
        nid = sid(COMMENT, suf)
        node_ids_comment_2006.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": COMMENT, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(COMMENT, strat),
        })
    comment_edges_2006 = [
        ("CN1", "CN2", "requires", "case_split"),
        ("CN2", "CN3", "splits_into", "substitution"),
        ("CN2", "CN4", "splits_into", "substitution"),
        ("CN1", "CN5", "requires", "bounding"),
        ("CN3", "CN6", "resolves", "merge_cases"),
        ("CN4", "CN6", "resolves", "merge_cases"),
        ("CN5", "CN6", "requires", "covering_case_union"),
    ]
    comment_edge_tuples_2006 = []
    for i, (fr, to, rel, act) in enumerate(comment_edges_2006):
        pn, cn = sid(COMMENT, fr), sid(COMMENT, to)
        comment_edge_tuples_2006.append((pn, cn))
        all_edges.append({
            "edge_id": f"{COMMENT}-E{i+1}", "solution_id": COMMENT, "parent_node_id": pn, "child_node_id": cn,
            "relation": rel, "action_type_id": act,
        })
    solution_graph_data[COMMENT] = (node_ids_comment_2006, comment_edge_tuples_2006)

    all_solutions.append({
        "solution_id": COMMENT, "problem_id": P, "label": "Official Comment - alternate inductive proof of the Lemma",
        "is_primary": False, "is_complete": False, "replaces_solution_id": SOL1,
        "replaces_span_note": "Replaces only the existence Lemma / Strategy S5 (minimal-representation argument); leaves S0-S4 and S6-S7 untouched and hands back to the main Solution's final paragraph to complete the theorem.",
        "construction_type": "induction on n=3x+2y with a covering/partition argument",
        "source_reference": "pdf:IMO2006SL.pdf; pdf_pages:12-13; printed_pages:11-12; heading:Comment.",
    })

    all_proof_features += [
        {"solution_id": SOL1, "feature_type_id": f} for f in ("extremal", "contradiction", "construction", "invariant")
    ] + [
        {"solution_id": COMMENT, "feature_type_id": f} for f in ("recursive", "monovariant", "construction")
    ]

    # Principle instances for 2006-A3-SOL1
    pi_2006 = [
        ("dominant_eigenvalue_domination", "S1", False, "intrinsic", "high",
         "P1<->P2 dependency verified algebraically; forces alpha*phi+beta=0 via the unbounded witness family (c_n,c_{n-1}) in S. Task004 idea 2: problem-intrinsic, high confidence."),
        ("canonical_representation_gauge_fixing", "S2", False, "solution_specific", "high",
         "Choosing alpha=psi,beta=1 is one representative of the one-parameter family {(t,-t*phi)}; Task004 idea 3: solution-specific, high confidence (any nonzero scalar works equally)."),
        ("coordinate_transformation_eigenbasis", "S3", False, "solution_specific", "high",
         "Composing with psi to collapse the set-indexed sum into a power sum is this proof's architectural choice; Task004 idea 4: solution-specific, high confidence."),
        ("extremal_bounding_convergent_series", "S4", False, "intrinsic", "low",
         "No direct Task004 idea maps onto this bounding step; defaulted to intrinsic/low per instructions (no explicit classification found)."),
        ("extremal_principle_minimal_representative", "S5", False, "solution_specific", "high",
         "Task004 idea 6: strongest case in the set -- the Comment proves the identical Lemma via a wholly different technique (Well-Founded Descent), so this specific extremal-representative technique is solution-specific, high confidence."),
        ("linear_independence_over_q", "S6", False, "intrinsic", "high",
         "Task004 idea 8: any correct converse proof needs to separate integer coordinates from a psi-linear combination, i.e. needs irrationality; problem-intrinsic, high confidence."),
        ("positional_canonical_numeral_representation", None, True, "intrinsic", "high",
         "Task004 idea 5 (Zeckendorf in disguise): problem-intrinsic, high confidence; cross-cutting, not owned by a single strategy (Task005 SB)."),
        ("galois_conjugate_symmetry", None, True, "mixed", "high",
         "Task004 idea 7: the raw identity 1+psi=psi^2 is intrinsic, but its role as the 'carrying rule' driving this proof's specific contradictions is solution-specific -- classified mixed, high confidence (a clean logical distinction, not a low-confidence guess)."),
    ]
    for ptid, strat, cc, intr, conf, just in pi_2006:
        all_principle_instances.append({
            "instance_id": f"{SOL1}-PI-{ptid}", "solution_id": SOL1, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL1, strat) if strat else None, "is_cross_cutting": cc,
            "is_problem_intrinsic": intr, "intrinsic_confidence": conf, "justification_text": just,
        })
    all_principle_instances += [
        {"instance_id": f"{COMMENT}-PI-well_founded_descent", "solution_id": COMMENT,
         "principle_type_id": "well_founded_descent_monovariant_induction",
         "primary_strategy_id": sid(COMMENT, "S1"), "is_cross_cutting": False,
         "is_problem_intrinsic": "solution_specific", "intrinsic_confidence": "high",
         "justification_text": "Task005/006: two entirely different principles (Extremal Principle vs Monovariant Descent+Covering) both prove the same intrinsic Lemma, so neither principle itself is 'the' reason -- solution-specific, high confidence."},
        {"instance_id": f"{COMMENT}-PI-covering_partition", "solution_id": COMMENT,
         "principle_type_id": "covering_partition_argument",
         "primary_strategy_id": sid(COMMENT, "S1"), "is_cross_cutting": False,
         "is_problem_intrinsic": "solution_specific", "intrinsic_confidence": "high",
         "justification_text": "Structural-decomposition argument specific to this alternate route's recursive-case mechanism; no counterpart in the main Solution."},
    ]

    # cross-solution dependency edges (documented, not modeled as thinking_graph_edge -- see final report)
    dep_edges_2006 = [
        ("coordinate_transformation_eigenbasis", "dominant_eigenvalue_domination", "requires",
         "N5 (Binet formula, an instance of Coordinate Transformation) must already be in place before growth-rate comparison in N7-N8 is meaningful."),
        ("dominant_eigenvalue_domination", "canonical_representation_gauge_fixing", "enables",
         "P1 produces the family of valid (alpha,beta); P2 selects a representative from it."),
        ("galois_conjugate_symmetry", "canonical_representation_gauge_fixing", "requires",
         "Verifying the witness (alpha=psi,beta=1) satisfies alpha*phi+beta=0 uses phi*psi=-1."),
        ("coordinate_transformation_eigenbasis", "extremal_bounding_convergent_series", "requires",
         "The object being bounded (a sum of powers of psi) only exists after the recoding."),
        ("galois_conjugate_symmetry", "extremal_bounding_convergent_series", "requires",
         "The bound's exact endpoint phi comes from 1-psi=phi."),
        ("coordinate_transformation_eigenbasis", "linear_independence_over_q", "requires",
         "Matching coefficients needs both sides already expressed in the {1,psi} coordinate system."),
        ("extremal_bounding_convergent_series", "extremal_principle_minimal_representative", "motivates",
         "P5's target constants (-1,phi) are inherited from P4 so both directions close on the same interval, though P5's technique does not logically require P4's proof."),
        ("galois_conjugate_symmetry", "extremal_principle_minimal_representative", "requires",
         "The collapsing identity 1+psi=psi^2 is what makes every contradiction case (N16,N18-N20) work."),
        ("extremal_principle_minimal_representative", "linear_independence_over_q", "requires",
         "Coefficient-matching needs a concrete J already shown to exist."),
        ("positional_canonical_numeral_representation", "coordinate_transformation_eigenbasis", "motivates",
         "Recognizing the numeral-system structure predicts that a coordinate/basis recoding will be the right move."),
        ("positional_canonical_numeral_representation", "extremal_bounding_convergent_series", "motivates",
         "Predicts that the range of representable values will need a bounding argument."),
        ("positional_canonical_numeral_representation", "extremal_principle_minimal_representative", "motivates",
         "Predicts that uniqueness of representation will be established via a canonical/extremal digit expansion."),
        ("positional_canonical_numeral_representation", "linear_independence_over_q", "motivates",
         "Predicts that the system will need a uniqueness-of-digits argument, here supplied by irrationality."),
    ]
    for i, (src, tgt, rel, just) in enumerate(dep_edges_2006):
        all_principle_dep_edges.append({
            "edge_id": f"{P}-PDE-{i+1}",
            "source_instance_id": f"{SOL1}-PI-{src}", "target_instance_id": f"{SOL1}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })

    # =================================================================
    # IMO-SL-2007-A1
    # =================================================================
    P = "IMO-SL-2007-A1"
    SOL1 = sid(P, "SOL1")
    SOL2 = sid(P, "SOL2")

    strategies_2007 = [
        ("Strategy1", 0, "Witness Selection.", False, False),
        ("Strategy2", 1, "Additive Two-Term Pigeonhole.", False, False),
        ("Strategy3", 2, "Greedy Running-Max Construction.", False, False),
        ("Strategy4", 3, "Last-Reset Tracing.", False, False),
        ("Strategy5", 4, "Two-Sided Squeeze.", False, None),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_2007:
        all_strategies.append({
            "strategy_id": sid(SOL1, suf), "solution_id": SOL1, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    strat_of_2007 = {}
    for n in ["N1", "N2", "N3", "N4"]:
        strat_of_2007[n] = "Strategy1"
    for n in ["N5", "N6", "N7", "N8", "N9", "N10"]:
        strat_of_2007[n] = "Strategy2"
    for n in ["N11", "N12", "N13"]:
        strat_of_2007[n] = "Strategy3"
    for n in ["N14", "N15", "N16", "N17", "N18", "N19", "N20"]:
        strat_of_2007[n] = "Strategy4"
    for n in ["N21", "N22", "N23"]:
        strat_of_2007[n] = "Strategy5"

    nodes_2007_sol1 = [
        ("G1", "given", "sequence a_1,...,a_n in R", "critical", "p.7, problem statement"),
        ("D1", "definition", "d_i = max_{j<=i} a_j - min_{j>=i} a_j", "critical", "p.7, problem statement"),
        ("D2", "definition", "d = max_i d_i", "critical", "p.7, problem statement"),
        ("GA", "goal", "max_i|x_i-a_i|>=d/2 for every nondecreasing (x_i)", "critical", "p.7, part (a)"),
        ("GB", "goal", "some nondecreasing (x_i) attains equality", "critical", "p.7, part (b)"),
        ("N1", "observation", "exists q with d=d_q (max over a finite set is attained)", "important", "p.7"),
        ("N2", "construction", "pick p<=q with a_p=max_{j<=q} a_j", "important", "p.7"),
        ("N3", "construction", "pick r>=q with a_r=min_{j>=q} a_j", "important", "p.7"),
        ("N4", "inference", "hence p<=q<=r and d=a_p-a_r", "critical", "p.7"),
        ("N5", "calculation", "(a_p-x_p)+(x_r-a_r)=(a_p-a_r)+(x_r-x_p)", "important", "p.7, displayed equation"),
        ("N6", "inference", "x_r-x_p>=0 since p<=r and (x_i) nondecreasing", "important", "p.7"),
        ("N7", "inference", "(a_p-x_p)+(x_r-a_r)>=a_p-a_r=d", "critical", "p.7"),
        ("N8", "lemma", "if u+v>=S then max(u,v)>=S/2", "important", "p.7"),
        ("N9", "inference", "max(a_p-x_p,x_r-a_r)>=d/2", "critical", "p.7"),
        ("N10", "conclusion", "max_i|x_i-a_i|>=d/2 -- part (a) proved", "critical", "p.7, final displayed line"),
        ("N11", "construction", "x_1=a_1-d/2; x_k=max{x_{k-1},a_k-d/2}, k>=2", "critical", "p.8"),
        ("N12", "observation", "(x_k) is nondecreasing by construction", "supporting", "p.8"),
        ("N13", "observation", "x_k-a_k>=-d/2 for all k (immediate from def.)", "important", "p.8"),
        ("N14", "lemma", "remains to show x_k-a_k<=d/2 for all k", "important", "p.8, eq. (2)"),
        ("N15", "construction", "let l<=k be the smallest index with x_k=x_l", "important", "p.8"),
        ("N16", "case_split", "either l=1, or l>=2 and x_l>x_{l-1}", "important", "p.8"),
        ("N17", "inference", "in both cases x_l = a_l - d/2", "critical", "p.8, eq. (3)"),
        ("N18", "calculation", "so x_k=x_l=a_l-d/2", "important", "p.8"),
        ("N19", "calculation", "a_l-a_k <= max_{j<=k}a_j - min_{j>=k}a_j = d_k <= d", "critical", "p.8"),
        ("N20", "calculation", "x_k-a_k = a_l-a_k-d/2 <= d-d/2 = d/2", "critical", "p.8"),
        ("N21", "conclusion", "-d/2<=x_k-a_k<=d/2 for all k, so max_i|x_i-a_i|<=d/2", "critical", "p.8"),
        ("N22", "observation", "equality holds since |x_1-a_1|=d/2 exactly", "important", "p.8, last line"),
        ("N23", "conclusion", "combining N10,N21,N22: this (x_k) attains equality -- part (b) proved", "critical", "p.8"),
    ]
    node_ids_2007_sol1 = []
    for i, (suf, ntype, stmt, imp, span) in enumerate(nodes_2007_sol1):
        nid = sid(SOL1, suf)
        node_ids_2007_sol1.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL1, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(SOL1, strat_of_2007[suf]) if suf in strat_of_2007 else None,
        })

    edges_2007_sol1 = [
        ("G1", "D1", "requires", "define_object"), ("D1", "D2", "requires", "define_object"),
        ("D2", "GA", "motivates", "framing_setup"), ("D2", "GB", "motivates", "framing_setup"),
        ("D2", "N1", "motivates", "existence_instantiation"), ("N1", "N2", "requires", "extremal_choice"),
        ("N1", "N3", "requires", "extremal_choice"), ("N2", "N4", "derives", "algebraic_simplification"),
        ("N3", "N4", "derives", "algebraic_simplification"), ("N4", "N5", "motivates", "algebraic_simplification"),
        ("N5", "N7", "derives", "inequality_chaining"), ("N6", "N7", "derives", "inequality_chaining"),
        ("N5", "N6", "motivates", "invoke_given_definitional_property"),
        ("N7", "N9", "derives", "invoke_prior_lemma_fact"), ("N8", "N9", "derives", "invoke_prior_lemma_fact"),
        ("N9", "N10", "concludes", "conclude"), ("N10", "GA", "concludes", "conclude"),
        ("D2", "N11", "motivates", "recursive_construction"), ("N11", "N12", "derives", "structural_invariant_identification"),
        ("N11", "N13", "derives", "structural_invariant_identification"),
        ("N13", "N14", "motivates", "structural_invariant_identification"),
        ("N14", "N15", "requires", "extremal_choice"), ("N15", "N16", "splits_into", "case_split"),
        ("N16", "N17", "resolves", "merge_cases"), ("N17", "N18", "derives", "substitution"),
        ("D1", "N19", "requires", "invoke_given_definitional_property"),
        ("D2", "N19", "requires", "invoke_given_definitional_property"),
        ("N18", "N20", "derives", "substitution"), ("N19", "N20", "derives", "inequality_chaining"),
        ("N13", "N21", "derives", "combine_bounds_squeeze_assemble"),
        ("N20", "N21", "derives", "combine_bounds_squeeze_assemble"),
        ("N21", "N23", "supports", "combine_bounds_squeeze_assemble"),
        ("N22", "N23", "supports", "combine_bounds_squeeze_assemble"),
        ("N23", "GB", "concludes", "conclude"),
    ]
    edge_tuples_2007_sol1 = []
    for i, (fr, to, rel, act) in enumerate(edges_2007_sol1):
        pn, cn = sid(SOL1, fr), sid(SOL1, to)
        edge_tuples_2007_sol1.append((pn, cn))
        all_edges.append({
            "edge_id": f"{SOL1}-E{i+1}", "solution_id": SOL1, "parent_node_id": pn, "child_node_id": cn,
            "relation": rel, "action_type_id": act,
        })
    solution_graph_data[SOL1] = (node_ids_2007_sol1, edge_tuples_2007_sol1)

    all_solutions.append({
        "solution_id": SOL1, "problem_id": P, "label": "Official Solution 1", "is_primary": True,
        "is_complete": True, "replaces_solution_id": None, "replaces_span_note": None,
        "construction_type": "witness pigeonhole (a) + greedy running-max last-reset tracing (b)",
        "source_reference": "pdf:IMO2007SL.pdf; pages 7-8; heading: Solution 1.",
    })

    # Solution 2 (reuses part (a); replaces only part (b)'s construction with a doubled envelope)
    strategies_2007_sol2 = [
        ("S1", 0, "Double envelope: running max M_i and running min m_i, sandwich bound.", False, False),
        ("S2", 1, "Two-sided squeeze: average the envelope to hit equality.", False, None),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_2007_sol2:
        all_strategies.append({
            "strategy_id": sid(SOL2, suf), "solution_id": SOL2, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })
    nodes_2007_sol2 = [
        ("M1", "construction", "M_i=max_{j<=i} a_j, m_i=min_{j>=i} a_j", "critical", "p.8, Solution 2.", "S1"),
        ("M2", "inference", "(M_i) and (m_i) are both nondecreasing in i", "important", "p.8", "S1"),
        ("M3", "observation", "m_i <= a_i <= M_i for every i", "important", "p.8", "S1"),
        ("M4", "construction", "set x_i = (M_i+m_i)/2", "critical", "p.8", "S1"),
        ("M5", "inference", "(x_i) is nondecreasing (average of two nondecreasing sequences)", "supporting", "p.8", "S1"),
        ("M6", "calculation", "-d_i/2 = x_i-M_i <= x_i-a_i <= x_i-m_i = d_i/2", "critical", "p.9", "S1"),
        ("M7", "conclusion", "max_i|x_i-a_i| <= max_i d_i/2 = d/2", "critical", "p.9", "S2"),
        ("M8", "conclusion", "with part (a)'s >=d/2, equality holds -- part (b) proved (alt.)", "critical", "p.9", "S2"),
    ]
    node_ids_2007_sol2 = []
    for i, (suf, ntype, stmt, imp, span, strat) in enumerate(nodes_2007_sol2):
        nid = sid(SOL2, suf)
        node_ids_2007_sol2.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL2, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(SOL2, strat),
        })
    edges_2007_sol2 = [
        ("D1", "M1", "requires", "define_object", SOL1),
        ("M1", "M2", "derives", "structural_invariant_identification", SOL2),
        ("M1", "M3", "derives", "structural_invariant_identification", SOL2),
        ("M1", "M4", "motivates", "construct_auxiliary_object", SOL2),
        ("M2", "M5", "requires", "structural_invariant_identification", SOL2),
        ("M4", "M5", "derives", "structural_invariant_identification", SOL2),
        ("M3", "M6", "requires", "inequality_chaining", SOL2),
        ("M4", "M6", "derives", "substitution", SOL2),
        ("M6", "M7", "derives", "conclude", SOL2),
        ("M7", "M8", "concludes", "combine_bounds_squeeze_assemble", SOL2),
        ("N10", "M8", "concludes", "combine_bounds_squeeze_assemble", SOL1),
        ("M5", "M8", "supports", "combine_bounds_squeeze_assemble", SOL2),
    ]
    edge_tuples_2007_sol2 = []
    for i, (fr, to, rel, act, fr_sol) in enumerate(edges_2007_sol2):
        pn, cn = sid(fr_sol, fr), sid(SOL2, to)
        edge_tuples_2007_sol2.append((pn, cn))
        all_edges.append({
            "edge_id": f"{SOL2}-E{i+1}", "solution_id": SOL2, "parent_node_id": pn, "child_node_id": cn,
            "relation": rel, "action_type_id": act,
        })
    solution_graph_data[SOL2] = (node_ids_2007_sol2, edge_tuples_2007_sol2)

    all_solutions.append({
        "solution_id": SOL2, "problem_id": P, "label": "Official Solution 2", "is_primary": False,
        "is_complete": True, "replaces_solution_id": SOL1,
        "replaces_span_note": "Reuses part (a) (N1-N10) verbatim from Solution 1; replaces only the part-(b) construction (N11-N23) with a doubled running-max/running-min envelope. Complete end-to-end for part (b) once part (a) is taken as given.",
        "construction_type": "doubled monotone envelope (running max and running min) sandwich",
        "source_reference": "pdf:IMO2007SL.pdf; page 8-9; heading: Solution 2.",
    })

    all_proof_features += [
        {"solution_id": SOL1, "feature_type_id": f} for f in ("extremal", "construction")
    ] + [
        {"solution_id": SOL2, "feature_type_id": f} for f in ("construction", "direct")
    ]

    pi_2007_sol1 = [
        ("extremal_witness_instantiation", "Strategy1", False),
        ("additive_two_term_averaging", "Strategy2", False),
        ("monotone_envelope_construction", "Strategy3", False),
        ("last_change_freshness_tracing", "Strategy4", False),
        ("two_sided_squeeze", "Strategy5", False),
    ]
    for ptid, strat, cc in pi_2007_sol1:
        all_principle_instances.append({
            "instance_id": f"{SOL1}-PI-{ptid}", "solution_id": SOL1, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL1, strat), "is_cross_cutting": cc,
            "is_problem_intrinsic": "intrinsic", "intrinsic_confidence": "low",
            "justification_text": "No dedicated intrinsic/solution-specific classification deliverable exists in this report for individual principles; defaulted to intrinsic/low per instructions.",
        })
    pi_2007_sol2 = [
        ("monotone_envelope_construction", "S1"),
        ("two_sided_squeeze", "S2"),
    ]
    for ptid, strat in pi_2007_sol2:
        all_principle_instances.append({
            "instance_id": f"{SOL2}-PI-{ptid}", "solution_id": SOL2, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL2, strat), "is_cross_cutting": False,
            "is_problem_intrinsic": "intrinsic", "intrinsic_confidence": "low",
            "justification_text": "P3 is instantiated twice in the same official document (shifted single envelope in Sol.1, doubled max/min envelope here) -- evidence it is not tied to this problem's specific arithmetic, but no formal intrinsic/specific tag was given in the report; defaulted to intrinsic/low.",
        })

    dep_edges_2007 = [
        ("monotone_envelope_construction", "last_change_freshness_tracing", "requires",
         "Last-change tracing is meaningful only as an analysis technique applied to an object built by a running-max recursion (P3)."),
        ("additive_two_term_averaging", "two_sided_squeeze", "requires",
         "P5 (squeeze) needs one lower-bound-producing principle (P2 supplies >=d/2) as an input."),
        ("last_change_freshness_tracing", "two_sided_squeeze", "requires",
         "P5 needs one upper-bound-producing principle; in Solution 1 that is P4 (supplies <=d/2)."),
        ("monotone_envelope_construction", "two_sided_squeeze", "requires",
         "Solution 2 shows P3 (doubled form) can feed P5 directly without P4 as an intermediate -- the minimal solution-independent skeleton is P3->P5."),
    ]
    for i, (src, tgt, rel, just) in enumerate(dep_edges_2007):
        all_principle_dep_edges.append({
            "edge_id": f"{P}-PDE-{i+1}",
            "source_instance_id": f"{SOL1}-PI-{src}", "target_instance_id": f"{SOL1}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })

    # =================================================================
    # IMO-SL-2008-A1
    # =================================================================
    P = "IMO-SL-2008-A1"
    SOL1 = sid(P, "SOL1")
    COMMENT = sid(P, "COMMENT")

    strategies_2008 = [
        ("S1", 0, "Anchor f(1) via a degenerate substitution.", None, False),
        ("S2", 1, "Derive the pointwise dichotomy.", False, False),
        ("S3", 2, "Verify sufficiency.", False, None),
        ("S4", 3, "Assume an exceptional solution and extract two witnesses.", False, False),
        ("S5", 4, "Cross-substitute the two witnesses.", False, False),
        ("S6", 5, "Exhaust both dichotomy branches at ab into contradiction.", False, False),
        ("S7", 6, "Conclude.", False, None),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_2008:
        all_strategies.append({
            "strategy_id": sid(SOL1, suf), "solution_id": SOL1, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    strat_of_2008 = {}
    for n in ["N1", "N2", "N3"]: strat_of_2008[n] = "S1"
    for n in ["N4", "N5", "N6", "N7", "N8"]: strat_of_2008[n] = "S2"
    strat_of_2008["N9"] = "S3"
    for n in ["N10", "N11"]: strat_of_2008[n] = "S4"
    for n in ["N12", "N13", "N14", "N15"]: strat_of_2008[n] = "S5"
    for n in ["N16", "N17", "N18", "N19", "N20"]: strat_of_2008[n] = "S6"
    strat_of_2008["N21"] = "S7"

    nodes_2008_sol1 = [
        ("G1", "given", "f:(0,infinity)->(0,infinity) satisfying the functional equation for all valid p,q,r,s", "critical", "p.7, problem statement"),
        ("GOAL", "goal", "determine all such f", "critical", "p.7"),
        ("N1", "construction", "substitute p=q=r=s=1 (valid: pq=1=rs)", "important", "p.7"),
        ("N2", "calculation", "equation reduces to f(1)^2=f(1)", "important", "p.7"),
        ("N3", "inference", "since f(1) in (0,infinity), f(1)=1", "critical", "p.7"),
        ("N4", "construction", "for arbitrary x>0, substitute p=x,q=1,r=s=sqrt(x) (valid: pq=x=rs)", "critical", "p.7"),
        ("N5", "calculation", "equation becomes (f(x)^2+1)/(2f(x)) = (x^2+1)/(2x) (uses N3)", "important", "p.7"),
        ("N6", "calculation", "cross-multiply/rearrange: x*f(x)^2+x = x^2*f(x)+f(x)", "important", "p.7"),
        ("N7", "calculation", "factor: (x*f(x)-1)(f(x)-x)=0", "critical", "p.7"),
        ("N8", "inference", "dichotomy (1): for every x>0, f(x)=x or f(x)=1/x", "critical", "p.7, eq. (1)"),
        ("N9", "observation", "f=identity and f=1/x each satisfy the original equation", "supporting", "p.7, eq. (2)"),
        ("N10", "construction", "assume f solves the problem but is neither global candidate: exists a with f(a)!=a, exists b with f(b)!=1/b", "critical", "p.7"),
        ("N11", "inference", "by N8, f(a)!=a => f(a)=1/a; f(b)!=1/b => f(b)=b", "critical", "p.7"),
        ("N12", "construction", "substitute p=a,q=b,r=s=sqrt(ab) (valid: pq=ab=rs)", "important", "p.7"),
        ("N13", "calculation", "equation becomes (f(a)^2+f(b)^2)/(2f(ab)) = (a^2+b^2)/(2ab)", "important", "p.7"),
        ("N14", "calculation", "substitute f(a)=1/a,f(b)=b: (a^-2+b^2)/(2f(ab)) = (a^2+b^2)/(2ab)", "important", "p.7"),
        ("N15", "calculation", "solve: f(ab) = ab(a^-2+b^2)/(a^2+b^2) -- eq. (3)", "critical", "p.7"),
        ("N16", "inference", "by N8 at x=ab: f(ab)=ab or f(ab)=1/ab", "critical", "p.7"),
        ("N17", "case_split", "the two cases from N16", "important", "p.7"),
        ("N18", "contradiction", "case f(ab)=ab: (3) gives a^-2=a^2 => a=1 => f(a)=1=a, contradicting f(a)!=a", "critical", "p.7"),
        ("N19", "contradiction", "case f(ab)=1/ab: (3) gives a^2*b^2*(a^-2+b^2)=a^2+b^2 => b=1 => f(b)=1=1/b, contradicting f(b)!=1/b", "critical", "p.7"),
        ("N20", "inference", "both cases contradictory => no such a,b exist => N10's assumption is false", "critical", "p.7"),
        ("N21", "conclusion", "therefore f=identity or f=1/x on all of (0,infinity); with N9, these are exactly the solutions", "critical", "p.7"),
    ]
    node_ids_2008_sol1 = []
    for i, (suf, ntype, stmt, imp, span) in enumerate(nodes_2008_sol1):
        nid = sid(SOL1, suf)
        node_ids_2008_sol1.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL1, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(SOL1, strat_of_2008[suf]) if suf in strat_of_2008 else None,
        })

    edges_2008_sol1 = [
        ("G1", "GOAL", "requires", "framing_setup"), ("GOAL", "N1", "requires", "substitution"),
        ("N1", "N2", "derives", "algebraic_simplification"), ("N2", "N3", "derives", "invoke_given_definitional_property"),
        ("N3", "N4", "derives", "substitution"), ("N4", "N5", "derives", "algebraic_simplification"),
        ("N5", "N6", "derives", "algebraic_simplification"), ("N6", "N7", "derives", "factorization"),
        ("N7", "N8", "derives", "invoke_prior_lemma_fact"), ("N8", "N9", "motivates", "direct_computation_verification"),
        ("N8", "N10", "motivates", "construct_auxiliary_object"), ("N10", "N11", "derives", "invoke_prior_lemma_fact"),
        ("N11", "N12", "derives", "substitution"), ("N12", "N13", "derives", "algebraic_simplification"),
        ("N13", "N14", "derives", "substitution"), ("N14", "N15", "derives", "algebraic_simplification"),
        ("N8", "N16", "requires", "invoke_prior_lemma_fact"), ("N15", "N16", "requires", "substitution"),
        ("N16", "N17", "splits_into", "case_split"), ("N17", "N18", "contradicts", "contradiction"),
        ("N17", "N19", "contradicts", "contradiction"), ("N10", "N18", "contradicts", "contradiction"),
        ("N10", "N19", "contradicts", "contradiction"), ("N18", "N20", "resolves", "merge_cases"),
        ("N19", "N20", "resolves", "merge_cases"), ("N20", "N21", "concludes", "conclude"),
        ("N9", "N21", "concludes", "combine_bounds_squeeze_assemble"),
    ]
    edge_tuples_2008_sol1 = []
    for i, (fr, to, rel, act) in enumerate(edges_2008_sol1):
        pn, cn = sid(SOL1, fr), sid(SOL1, to)
        edge_tuples_2008_sol1.append((pn, cn))
        all_edges.append({
            "edge_id": f"{SOL1}-E{i+1}", "solution_id": SOL1, "parent_node_id": pn, "child_node_id": cn,
            "relation": rel, "action_type_id": act,
        })
    solution_graph_data[SOL1] = (node_ids_2008_sol1, edge_tuples_2008_sol1)

    all_solutions.append({
        "solution_id": SOL1, "problem_id": P, "label": "Official Solution", "is_primary": True,
        "is_complete": True, "replaces_solution_id": None, "replaces_span_note": None,
        "construction_type": "pointwise factoring dichotomy + witness-based proof by contradiction against mixed solutions",
        "source_reference": "pdf:IMO2008SL.pdf; page 7; heading: Solution.",
    })

    strategies_2008_comment = [
        ("S1", 0, "Build paired symmetric relations via dual substitution.", False, False),
        ("S2", 1, "Difference-of-squares extraction to reproduce the dichotomy.", False, False),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_2008_comment:
        all_strategies.append({
            "strategy_id": sid(COMMENT, suf), "solution_id": COMMENT, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })
    nodes_2008_comment = [
        ("C1", "construction", "substitute p=q=1,r=sqrt(x),s=1/sqrt(x) (valid: pq=1=rs)", "important", "p.8, Comment.", "S1"),
        ("C2", "calculation", "yields f(x)+f(1/x)=x+1/x -- first half of eq. (4) (uses N3)", "important", "p.8", "S1"),
        ("C3", "construction", "substitute p=x,q=1/x,r=s=1 (valid: pq=1=rs)", "important", "p.8", "S1"),
        ("C4", "calculation", "yields f(x)^2+f(1/x)^2=x^2+1/x^2 -- second half of eq. (4)", "important", "p.8", "S1"),
        ("C5", "calculation", "square C2: f(x)^2+2f(x)f(1/x)+f(1/x)^2=x^2+2+1/x^2", "supporting", "p.8", "S2"),
        ("C6", "calculation", "subtract C4 from C5: 2f(x)f(1/x)=2", "important", "p.8", "S2"),
        ("C7", "calculation", "subtract C6's relation from C4: (f(x)-f(1/x))^2=(x-1/x)^2", "important", "p.8", "S2"),
        ("C8", "inference", "so f(x)-f(1/x)=+-(x-1/x)", "important", "p.8", "S2"),
        ("C9", "inference", "combined with C2, this reproduces the two alternatives of dichotomy (1)", "critical", "p.8", "S2"),
    ]
    node_ids_2008_comment = []
    for i, (suf, ntype, stmt, imp, span, strat) in enumerate(nodes_2008_comment):
        nid = sid(COMMENT, suf)
        node_ids_2008_comment.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": COMMENT, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(COMMENT, strat),
        })
    edges_2008_comment = [
        ("N3", "C1", "requires", "invoke_given_definitional_property", SOL1),
        ("C1", "C2", "derives", "algebraic_simplification", COMMENT),
        ("N3", "C3", "requires", "invoke_given_definitional_property", SOL1),
        ("C3", "C4", "derives", "algebraic_simplification", COMMENT),
        ("C2", "C5", "derives", "algebraic_simplification", COMMENT),
        ("C5", "C6", "requires", "algebraic_simplification", COMMENT),
        ("C4", "C6", "requires", "algebraic_simplification", COMMENT),
        ("C4", "C7", "requires", "algebraic_simplification", COMMENT),
        ("C6", "C7", "requires", "algebraic_simplification", COMMENT),
        ("C7", "C8", "derives", "algebraic_simplification", COMMENT),
        ("C2", "C9", "requires", "combine_bounds_squeeze_assemble", COMMENT),
        ("C8", "C9", "requires", "combine_bounds_squeeze_assemble", COMMENT),
        ("C9", "N8", "resolves", "conclude", COMMENT),
    ]
    edge_tuples_2008_comment = []
    for i, (fr, to, rel, act, fr_sol) in enumerate(edges_2008_comment):
        to_sol = COMMENT if to != "N8" else SOL1
        pn, cn = sid(fr_sol, fr), sid(to_sol, to)
        edge_tuples_2008_comment.append((pn, cn))
        all_edges.append({
            "edge_id": f"{COMMENT}-E{i+1}", "solution_id": COMMENT, "parent_node_id": pn, "child_node_id": cn,
            "relation": rel, "action_type_id": act,
        })
    solution_graph_data[COMMENT] = (node_ids_2008_comment, edge_tuples_2008_comment)

    all_solutions.append({
        "solution_id": COMMENT, "problem_id": P, "label": "Official Comment", "is_primary": False,
        "is_complete": False, "replaces_solution_id": SOL1,
        "replaces_span_note": "Replaces only N4-N8 (the pointwise dichotomy derivation); reuses N3 (f(1)=1) as a prerequisite and explicitly hands its result back into the main Solution ('combined with the first equation of (4) imply the two alternatives of (1)') to finish the theorem.",
        "construction_type": "paired symmetric substitutions + difference-of-squares extraction",
        "source_reference": "pdf:IMO2008SL.pdf; page 8; heading: Comment.",
    })

    all_proof_features += [
        {"solution_id": SOL1, "feature_type_id": f} for f in ("functional", "contradiction", "construction")
    ] + [
        {"solution_id": COMMENT, "feature_type_id": f} for f in ("functional", "symmetric")
    ]

    pi_2008_sol1 = [
        ("value_extraction_symmetric_degenerate_substitution", "S1", False, "intrinsic", "low",
         "No direct match in Deliverable 5's 8 critical ideas; defaulted intrinsic/low."),
        ("parametrized_substitution_factoring_dichotomy", "S2", False, "intrinsic", "low",
         "No direct match in Deliverable 5's ideas at the technique level (ideas 2 and 4 concern the dichotomy fact and the factoring mechanism separately); defaulted intrinsic/low."),
        ("direct_verification_of_candidates", "S3", False, "intrinsic", "low",
         "Weakest principle assignment per the report's own Q3 discussion; no direct intrinsic/specific tag given; defaulted intrinsic/low."),
        ("witness_extraction_negated_universal_claim", "S4", False, "solution_specific", "low",
         "Matches Deliverable 5 idea 6 (proof-by-contradiction with two named witnesses), explicitly flagged '(lower confidence)' in the report -- solution-specific, low confidence."),
        ("combine_two_data_points_joint_substitution", "S5", False, "intrinsic", "low",
         "Matches idea 7's cross-substitution only partially (idea 7 concerns the specific r=s=sqrt(ab) choice, flagged lower confidence, solution-specific); the principle itself (combine two data points) is more generic than idea 7's specific substitution. Defaulted intrinsic/low given the mismatch in granularity."),
        ("exhaustive_case_elimination_against_constraints", "S6", False, "intrinsic", "low",
         "No direct match; defaulted intrinsic/low."),
        ("fixed_point_coincidence_branch_crossing", "S6", False, "intrinsic", "high",
         "Matches Deliverable 5 idea 8 exactly (a=1/b=1 collapse at x=1, the unique point where x=1/x): 'Problem-intrinsic... an algebraic fact... forced regardless of proof path', no lower-confidence flag -- intrinsic, high confidence."),
        ("union_sufficiency_refuted_alternative", "S7", False, "intrinsic", "low",
         "No direct match; defaulted intrinsic/low."),
        ("involution_symmetry_x_inverse_x", None, True, "mixed", "high",
         "Deliverable 5 idea 7 analog at the cross-cutting level: the raw x<->1/x involution is a structural fact about the equation itself (intrinsic), but the main Solution's proof never names it explicitly, only the Comment makes it the explicit organizing device -- classified mixed, high confidence (a clean, explicitly discussed distinction, not a low-confidence guess)."),
    ]
    for ptid, strat, cc, intr, conf, just in pi_2008_sol1:
        all_principle_instances.append({
            "instance_id": f"{SOL1}-PI-{ptid}", "solution_id": SOL1, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL1, strat) if strat else None, "is_cross_cutting": cc,
            "is_problem_intrinsic": intr, "intrinsic_confidence": conf, "justification_text": just,
        })
    pi_2008_comment = [
        ("build_paired_symmetric_relations_dual_substitution", "S1"),
        ("difference_of_squares_extraction", "S2"),
    ]
    for ptid, strat in pi_2008_comment:
        all_principle_instances.append({
            "instance_id": f"{COMMENT}-PI-{ptid}", "solution_id": COMMENT, "principle_type_id": ptid,
            "primary_strategy_id": sid(COMMENT, strat), "is_cross_cutting": False,
            "is_problem_intrinsic": "solution_specific", "intrinsic_confidence": "high",
            "justification_text": "The dichotomy itself is intrinsic (established twice, by genuinely different algebra), but this specific mechanism (paired symmetric substitution + difference-of-squares) is one of two ways to reach it -- solution-specific, high confidence, mirroring the main Solution's own idea-3/4 classification.",
        })

    dep_edges_2008 = [
        ("value_extraction_symmetric_degenerate_substitution", "parametrized_substitution_factoring_dichotomy", "requires",
         "N5 substitutes f(1)=1 literally; the clean factorization in N7 structurally requires this specific value (verified algebraically: a general anchor c!=1 breaks the clean factorization)."),
        ("parametrized_substitution_factoring_dichotomy", "witness_extraction_negated_universal_claim", "requires",
         "N11 uses the dichotomy to convert f(a)!=a into f(a)=1/a."),
        ("witness_extraction_negated_universal_claim", "combine_two_data_points_joint_substitution", "requires",
         "N12 substitutes exactly the two witnesses N10/N11 produced."),
        ("parametrized_substitution_factoring_dichotomy", "exhaustive_case_elimination_against_constraints", "requires",
         "N16 re-invokes the dichotomy, now at x=ab."),
        ("combine_two_data_points_joint_substitution", "exhaustive_case_elimination_against_constraints", "requires",
         "N18/N19 test the closed form (3) against the two branches."),
        ("witness_extraction_negated_universal_claim", "exhaustive_case_elimination_against_constraints", "requires",
         "N18/N19 each close by contradicting S4's named hypothesis directly."),
        ("exhaustive_case_elimination_against_constraints", "union_sufficiency_refuted_alternative", "requires",
         "N21 needs the refutation."),
        ("direct_verification_of_candidates", "union_sufficiency_refuted_alternative", "requires",
         "N21 needs the sufficiency check."),
    ]
    for i, (src, tgt, rel, just) in enumerate(dep_edges_2008):
        all_principle_dep_edges.append({
            "edge_id": f"{P}-PDE-{i+1}",
            "source_instance_id": f"{SOL1}-PI-{src}", "target_instance_id": f"{SOL1}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })

    # =================================================================
    # IMO-SL-2009-A1
    # =================================================================
    P = "IMO-SL-2009-A1"
    SOL1 = sid(P, "SOL1")

    strategies_2009 = [
        ("S1", 0, "State the target value.", None, False),
        ("S2", 1, "Universal lower bound via an extremal witness.", False, False),
        ("S3", 2, "Construct the sharp counterexample family.", False, False),
        ("S4", 3, "Exploit the construction's built-in order.", False, False),
        ("S5", 4, "Assemble.", False, None),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_2009:
        all_strategies.append({
            "strategy_id": sid(SOL1, suf), "solution_id": SOL1, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    strat_of_2009 = {"N1": "S1"}
    for n in ["N2", "N3", "N4", "N5", "N6", "N7", "N8"]: strat_of_2009[n] = "S2"
    for n in ["N9", "N10", "N11", "N12", "N13", "N14"]: strat_of_2009[n] = "S3"
    for n in ["N15", "N16", "N17"]: strat_of_2009[n] = "S4"
    for n in ["N18", "N19"]: strat_of_2009[n] = "S5"

    nodes_2009_sol1 = [
        ("G1", "given", "2009 triangles, sides colored blue/red/white; sorted sequences b,r,w", "critical", "p.12, problem statement"),
        ("GOAL", "goal", "find the largest k such that k indices are always guaranteed", "critical", "p.12"),
        ("N1", "observation", "claim: the answer is k=1", "critical", "p.12"),
        ("N2", "construction", "WLOG w_2009>=r_2009>=b_2009", "important", "p.12"),
        ("N3", "observation", "w_2009 is the white side of some actual triangle Delta in the collection", "important", "p.12"),
        ("N4", "inference", "Delta's own blue side b and red side r satisfy b+r>w_2009 (triangle inequality on Delta)", "critical", "p.12"),
        ("N5", "inference", "b_2009>=b and r_2009>=r (definition of b_2009,r_2009 as maxima)", "important", "p.12"),
        ("N6", "calculation", "b_2009+r_2009 >= b+r > w_2009", "critical", "p.12"),
        ("N7", "inference", "since w_2009 is (WLOG) the largest of the three, this one inequality suffices for the full triangle inequality", "important", "p.12"),
        ("N8", "conclusion", "b_2009,r_2009,w_2009 always form a non-degenerate triangle -- k>=1", "critical", "p.12"),
        ("N9", "construction", "define Delta_j, j=1..2009: blue=2j; red=j (j<=2008) or 4018 (j=2009); white=j+1 (j<=2007), 4018 (j=2008), or 1 (j=2009)", "critical", "p.12"),
        ("N10", "case_split", "verify non-degeneracy of Delta_j in three ranges: j<=2007, j=2008, j=2009", "important", "p.12"),
        ("N11", "calculation", "case j<=2007: (j+1)+j>2j>=j+1>j", "important", "p.12"),
        ("N12", "calculation", "case j=2008: 2j+j>4018>2j>j", "important", "p.12"),
        ("N13", "calculation", "case j=2009: 4018+1>2j=4018>1", "important", "p.12"),
        ("N14", "inference", "all three cases confirm: every Delta_j is a genuine non-degenerate triangle", "important", "p.12"),
        ("N15", "observation", "by construction, w_j=j, r_j=j, b_j=2j for 1<=j<=2008 (the family is already self-sorted)", "critical", "p.12"),
        ("N16", "calculation", "substituting: w_j+r_j = j+j = 2j = b_j", "important", "p.12"),
        ("N17", "conclusion", "b_j,r_j,w_j do not form a non-degenerate triangle for any 1<=j<=2008 (equality, not strict inequality)", "critical", "p.12"),
        ("N18", "conclusion", "this example admits no guaranteed index below 2009 -- k cannot exceed 1", "critical", "p.12"),
        ("N19", "conclusion", "combining N8 and N18: the largest possible k is exactly 1", "critical", "p.12"),
    ]
    node_ids_2009_sol1 = []
    for i, (suf, ntype, stmt, imp, span) in enumerate(nodes_2009_sol1):
        nid = sid(SOL1, suf)
        node_ids_2009_sol1.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL1, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(SOL1, strat_of_2009[suf]) if suf in strat_of_2009 else None,
        })

    edges_2009_sol1 = [
        ("G1", "GOAL", "requires", "framing_setup"), ("GOAL", "N1", "requires", "assert_target_value"),
        ("N1", "N2", "derives", "symmetry_wlog"), ("N2", "N3", "derives", "existence_instantiation"),
        ("N3", "N4", "derives", "invoke_given_definitional_property"),
        ("G1", "N5", "requires", "invoke_given_definitional_property"),
        ("N4", "N6", "derives", "inequality_chaining"), ("N5", "N6", "derives", "inequality_chaining"),
        ("N6", "N7", "derives", "invoke_prior_lemma_fact"), ("N7", "N8", "concludes", "conclude"),
        ("N1", "N9", "motivates", "construct_auxiliary_object"), ("N9", "N10", "requires", "case_split"),
        ("N10", "N11", "splits_into", "direct_computation_verification"),
        ("N10", "N12", "splits_into", "direct_computation_verification"),
        ("N10", "N13", "splits_into", "direct_computation_verification"),
        ("N11", "N14", "resolves", "merge_cases"), ("N12", "N14", "resolves", "merge_cases"),
        ("N13", "N14", "resolves", "merge_cases"), ("N14", "N15", "derives", "structural_invariant_identification"),
        ("N15", "N16", "derives", "substitution"), ("N16", "N17", "derives", "boundary_equality_identification"),
        ("N17", "N18", "concludes", "conclude"), ("N8", "N19", "concludes", "combine_bounds_squeeze_assemble"),
        ("N18", "N19", "concludes", "combine_bounds_squeeze_assemble"),
    ]
    edge_tuples_2009_sol1 = []
    for i, (fr, to, rel, act) in enumerate(edges_2009_sol1):
        pn, cn = sid(SOL1, fr), sid(SOL1, to)
        edge_tuples_2009_sol1.append((pn, cn))
        all_edges.append({
            "edge_id": f"{SOL1}-E{i+1}", "solution_id": SOL1, "parent_node_id": pn, "child_node_id": cn,
            "relation": rel, "action_type_id": act,
        })
    solution_graph_data[SOL1] = (node_ids_2009_sol1, edge_tuples_2009_sol1)

    all_solutions.append({
        "solution_id": SOL1, "problem_id": P, "label": "Official Solution", "is_primary": True,
        "is_complete": True, "replaces_solution_id": None, "replaces_span_note": None,
        "construction_type": "extremal witness bound (universal half) + explicit self-sorted family (sharpness half)",
        "source_reference": "pdf:IMO2009SL.pdf; page 12; heading: (untitled, single Solution).",
    })

    all_proof_features += [{"solution_id": SOL1, "feature_type_id": f} for f in ("extremal", "construction")]

    pi_2009_sol1 = [
        ("assert_target_extremal_value_guess_verify", "S1"),
        ("bounding_order_statistic_via_witness", "S2"),
        ("explicit_extremal_family_construction", "S3"),
        ("engineered_alignment_construction_order_statistic", "S4"),
        ("two_sided_squeeze", "S5"),
    ]
    for ptid, strat in pi_2009_sol1:
        all_principle_instances.append({
            "instance_id": f"{SOL1}-PI-{ptid}", "solution_id": SOL1, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL1, strat), "is_cross_cutting": False,
            "is_problem_intrinsic": "intrinsic", "intrinsic_confidence": "low",
            "justification_text": "No dedicated intrinsic/solution-specific classification deliverable exists in this report; defaulted to intrinsic/low per instructions.",
        })

    dep_edges_2009 = [
        ("explicit_extremal_family_construction", "engineered_alignment_construction_order_statistic", "requires",
         "S4 analyzes exactly the family P3 built (N15 reads off properties of N9's construction)."),
        ("bounding_order_statistic_via_witness", "two_sided_squeeze", "requires",
         "S5's assembly (N19) needs P2's universal bound (N8) as one input."),
        ("engineered_alignment_construction_order_statistic", "two_sided_squeeze", "requires",
         "S5's assembly needs P4's degeneracy result (N18, itself built on N17) as the other input."),
    ]
    for i, (src, tgt, rel, just) in enumerate(dep_edges_2009):
        all_principle_dep_edges.append({
            "edge_id": f"{P}-PDE-{i+1}",
            "source_instance_id": f"{SOL1}-PI-{src}", "target_instance_id": f"{SOL1}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })

    # =================================================================
    # "Test 2" additions: 2020-A6, 2015-N4, 2019-C2, 2019-C5, 2019-G4, 2015-G2
    # =================================================================
    for _frag in FRAGMENTS_002:
        _frag.build(all_solutions, all_strategies, all_nodes, all_edges,
                     all_proof_features, all_principle_instances, all_principle_dep_edges,
                     solution_graph_data, sid)

    # =================================================================
    # Compute graph stats + insert solutions
    # =================================================================
    for s in all_solutions:
        nids, edgs = solution_graph_data[s["solution_id"]]
        stats = compute_graph_stats(nids, edgs)
        s.update(stats)

    print("\n== solution ==")
    post("solution", all_solutions)

    print("\n== solution_proof_feature ==")
    post("solution_proof_feature", all_proof_features)

    print("\n== strategy ==")
    post("strategy", all_strategies)

    print("\n== thinking_graph_node ==")
    post("thinking_graph_node", all_nodes)

    print("\n== thinking_graph_edge ==")
    post("thinking_graph_edge", all_edges)

    print("\n== principle_instance ==")
    post("principle_instance", all_principle_instances)

    print("\n== principle_dependency_edge ==")
    post("principle_dependency_edge", all_principle_dep_edges)

    print("\n== Verification (row counts) ==")
    tables = ["topic", "principle_type", "reasoning_action_type", "proof_feature_type",
              "problem", "problem_topic", "solution", "solution_proof_feature", "strategy",
              "thinking_graph_node", "thinking_graph_edge", "principle_instance",
              "principle_instance_node", "principle_dependency_edge"]
    for t in tables:
        print(f"  {t}: {count_rows(t)}")


if __name__ == "__main__":
    main()
