"""
Data fragment for IMO-SL-2020-A6, to be merged into scripts/load_dna_seed_v1.py.
Source: reports/IMO-SL-2020-A6_validation_report.md (full, re-derived from the report
table, not from the earlier fork summary).

Note on edge count: the report's prose says "46 edges total (framing edge counted)",
but expanding every multi-parent table row ("Na,Nb -> Nc") into one edge per parent --
the only correct representation for thinking_graph_edge, a strict parent/child table --
yields 62 edges. This fragment uses the expanded (62-edge) count as ground truth; the
merge step should be aware of this discrepancy against the report's summary prose.
"""

NEW_TOPICS = []  # reuse existing "functional_equations" -- no new topic needed

NEW_REASONING_ACTIONS = []  # all 27 existing action types cover this problem's edges

NEW_PRINCIPLE_TYPES = [
    ("single_variable_specialization_multivar_fe", "Systematic Single-Variable Specialization of a Multi-Variable Functional Equation",
     "Substitute simple values (e.g. 0, -1) for one variable of a multi-variable functional/relational equation to extract single-variable content as a foothold.", "universal"),
    ("iterate_tail_equivalence_dynamical_dichotomy", "Iterate-Tail Equivalence Propagates a Local Coincidence into a Global Dynamical Dichotomy",
     "A local coincidence between consecutive iterate-orbits, shown to hold everywhere, promotes to a single global alternative (e.g. all orbits finite, or all orbits infinite) governing the whole dynamical system.", "specialized"),
    ("bounded_finite_set_forces_vanishing_coefficient", "Boundedness of a Fixed Finite Set Forces an Unboundedly-Scaled Coefficient to Vanish",
     "If a quantity scaled by an unboundedly growing parameter must always land in one fixed finite set, the quantity it scales must eventually be forced to a specific value (often zero).", "common_technique"),
    ("coprime_moduli_period_pin", "Divisibility by Two Coprime Moduli Pins an Exact Common Period",
     "If an integer period divides two coprime moduli (e.g. from two nearby witnesses), it must divide their gcd, pinning it to a small explicit value.", "common_technique"),
    ("paired_complementary_substitution_global_identity", "Paired/Complementary Substitution Yields a Global Linear Identity",
     "Substituting a complementary pair of values (e.g. n and 1-n, or x and c-x) into a relation produces a new identity anchored at an already-known point.", "common_technique"),
    ("extremal_principle_minimal_counterexample", "Extremal Principle (minimal-counterexample / refutation form)",
     "Disprove a universal claim by assuming a minimal counterexample exists and deriving a strictly smaller one, a contradiction -- the refutation-facing mirror of the minimal-witness existence form.", "universal"),
    ("close_last_value_via_known_fact_reuse", "Compose a Known-Value Fact with a General Identity to Close the Last Unknown",
     "Reuse an already-derived general identity at one well-chosen point where enough values are already pinned down to determine the one remaining unknown.", "specialized"),
    ("nonunique_iterate_coincidence_forces_periodicity", "Non-Unique Iterate-Coincidence Forces Eventual Periodicity",
     "If an iterate-matching quantity between two orbits fails to be uniquely determined, the underlying orbit must in fact be finite/eventually periodic -- the converse-direction mechanism to iterate-tail-equivalence.", "specialized"),
    ("discrete_cauchy_cocycle_additivity", "Discrete Cauchy/Cocycle Additivity Pinned by One Calibration Point",
     "An additive cocycle relation on a discrete domain, combined with one known base value, forces the cocycle to equal the unique linear function through that value (a discrete Cauchy equation).", "common_technique"),
    ("transport_formula_through_map", "Transport a Two-Point Iterate Formula Through the Map to Get a Local Recurrence",
     "Apply the governing map to both sides of an already-established iterate identity and re-interpret the result as a fresh instance of the same auxiliary structure, yielding a local recurrence.", "specialized"),
    ("anchor_plus_constant_step_affine_induction", "Anchor + Constant Step Forces the Affine Formula by Two-Sided Induction",
     "One known value plus a proven constant step between consecutive values forces the unique affine (arithmetic-progression) formula by induction in both directions.", "universal"),
    ("iterate_exponent_as_orbit_depth", "Read an Iteration-Count Exponent as Orbit Depth, Not Mere Evaluation",
     "Recognize that an exponent counting map-iterations in a functional equation is itself a statement about orbit/iteration depth, predicting that orbit, tail-sharing, and periodicity reasoning will be the productive tools.", "specialized"),
]

PROBLEM = {
    "problem_id": "IMO-SL-2020-A6", "contest": "IMO Shortlist", "year": 2020, "round": "Shortlist",
    "problem_number": "A6", "source": "data/raw/imo/IMO2020SL.pdf, p.4 (statement), pp.22-23 (solution)",
    "statement_text": ("Determine all functions f: Z -> Z such that f^{a^2+b^2}(a+b) = a*f(a) + b*f(b) "
                        "for every a,b in Z. Here f^n denotes the n-th iteration of f, i.e. f^0(x)=x and "
                        "f^{n+1}(x)=f(f^n(x)) for all n>=0."),
    "difficulty": None,
    "objects_text": "A function f:Z->Z; its iterates f^n; the identity f^{a^2+b^2}(a+b)=a*f(a)+b*f(b); the forward orbit O(x)={x,f(x),f(f(x)),...} of a point under f.",
    "hidden_structure": ("The exponent a^2+b^2 is literally 'how many times to iterate' -- the equation is a "
                          "disguised statement about orbit depth, not pointwise values. f=0 collapses every "
                          "orbit into a period<=2 cycle at 0; f=x+1 makes every orbit an unbounded arithmetic "
                          "progression. The finite/infinite-orbit dichotomy the proof manufactures is the "
                          "f=0 / f=x+1 dichotomy in the answer."),
    "expected_insight": ("Two single-variable specializations (b=0, b=-1) chain into one identity linking the "
                          "orbit of a-1 to the orbit of a; recognizing this as a statement about shared tails "
                          "of iteration sequences splits the proof into a finite-orbit case (boundedness + "
                          "periodicity) and an infinite-orbit case (promote tail-sharing into a well-defined "
                          "additive 'clock' function)."),
    "problem_family": None, "problem_template": None,
}

PROBLEM_TOPIC_IDS = ["functional_equations"]


def build(all_solutions, all_strategies, all_nodes, all_edges, all_proof_features,
          all_principle_instances, all_principle_dep_edges, solution_graph_data, sid):
    P = "IMO-SL-2020-A6"
    SOL1 = sid(P, "SOL1")

    strategies = [
        ("S0", 0, "Framing: state the equation E(a,b) and the goal (determine all f).", True, False),
        ("S1", 1, "Specialization harvest: substitute b=0 then b=-1 into E, combine into identity (1).", False, False),
        ("S2", 2, "Orbit tail-equivalence -> global dichotomy: define orbits, promote the local coincidence (1) into cofinite tail-sharing, conclude one global alternative governs every orbit.", False, False),
        ("S3", 3, "Bounded orbit forces f(a)=f(-a): substitute E(a,-a); since the result lives in the fixed finite set O(0), unboundedly large a forces the coefficient to vanish.", False, False),
        ("S4", 4, "Coprime moduli pin the exact period: squeeze the minimal period T down to T|2 using gcd(a^2,(a+1)^2)=1.", False, False),
        ("S5", 5, "Paired substitution -> global linear identity: substitute the complementary pair (n,1-n) to produce identity (heart), anchored at the known point f(1)=0.", False, False),
        ("S6", 6, "Minimal-counterexample descent: assume a smallest |m| violating f=0, manufacture a strictly smaller one from (club)+(heart), contradiction.", False, False),
        ("S7", 7, "Close the last value, assemble Case 1: reuse Fact X at a=2 plus the period fact to pin f(0)=0 and assemble f=0.", False, False),
        ("S8", 8, "Well-defined orbit 'clock' via infiniteness: contradiction subproof showing the iterate-coincidence difference X(a,b) is well-defined.", False, False),
        ("S9", 9, "Cauchy/telescoping pins X(a,b)=b-a: compute one base value from identity (1), establish additivity, solve the resulting discrete Cauchy equation.", False, False),
        ("S10", 10, "Transport through f -> unit local recurrence: apply f to identity (1) itself and re-read the output as a fresh instance of X, extracting f(a)-f(a-1)=1.", False, False),
        ("S11", 11, "Two-sided induction -> explicit formula, verify: anchor plus constant step forces the unique affine formula; check it satisfies E.", False, False),
        ("S12", 12, "Assemble: conjoin S7's and S11's outputs into the final answer set.", False, True),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies:
        all_strategies.append({
            "strategy_id": sid(SOL1, suf), "solution_id": SOL1, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    nodes = [
        ("N1", "given", "E(a,b): f^{a^2+b^2}(a+b) = a*f(a) + b*f(b) for all a,b in Z", "critical", "p.22, problem restated", "S0"),
        ("GOAL", "goal", "Determine all such f", "critical", "p.4", "S0"),
        ("N2", "inference", "E(a,0): f^{a^2}(a) = a*f(a) for all a (Fact X)", "critical", "p.22, derivable directly from the stated equation", "S1"),
        ("N3", "calculation", "Fact X at a=-1: f(-1) = -f(-1) => f(-1)=0", "critical", "p.22, 'For b=-1 this gives f(-1)=0'", "S1"),
        ("N4", "inference", "E(a,-1): f^{a^2+1}(a-1) = a*f(a) (using f(-1)=0)", "critical", "p.22, eq. (1) derivation", "S1"),
        ("N5", "inference", "Combine N2,N4: f^{a^2+1}(a-1) = f^{a^2}(a) for all a -- identity (1)", "critical", "p.22, '(1)'", "S1"),
        ("N6", "definition", "Orbit O(x) = {x, f(x), f(f(x)), ...}", "important", "p.22, 'define the orbit of x'", "S2"),
        ("N7", "inference", "O(a-1) and O(a) differ by finitely many terms, for every a", "important", "p.22, 'O(a-1) and O(a) differ by finitely many terms'", "S2"),
        ("N8", "inference", "Hence any two orbits O(a), O(b) differ by finitely many terms", "important", "p.22, 'any two orbits differ by finitely many terms'", "S2"),
        ("N9", "case_split", "Dichotomy: all orbits finite, or all orbits infinite", "critical", "p.22, 'either all orbits are finite or all orbits are infinite'", "S2"),
        ("N10", "construction", "Case 1: assume O(0) finite; let M = max_{z in O(0)} |z|", "important", "p.22, 'Case 1: All orbits are finite...'", "S3"),
        ("N11", "calculation", "E(a,-a): f^{2a^2}(0) = a*(f(a)-f(-a))", "critical", "p.22, 'Using E(a,-a) we get...'", "S3"),
        ("N12", "inference", "For |a|>M: forces f(a)=f(-a) and f^{2a^2}(0)=0", "critical", "p.22, 'this yields f(a)=f(-a) and f^{2a^2}(0)=0'", "S3"),
        ("N13", "inference", "(f^k(0)) is purely periodic with minimal period T, T | 2a^2 for all |a|>M", "important", "p.22, 'purely periodic with a minimal period T which divides 2a^2'", "S4"),
        ("N14", "calculation", "T | gcd(2a^2, 2(a+1)^2) = 2 (consecutive integers coprime) => T in {1,2}", "critical", "p.22, 'T|gcd(2a^2,2(a+1)^2)=2'", "S4"),
        ("N15", "conclusion", "f^{2a^2}(0)=0 for all a => (club) f(a)=f(-a) for a!=0", "critical", "p.22, 'a(f(a)-f(-a))=f^{2a^2}(0)=0 for all a'", "S4"),
        ("N16", "calculation", "(club) at a=1, with N3: (spade) f(1)=f(-1)=0", "important", "p.22, 'f(1)=f(-1)=0'", "S5"),
        ("N17", "inference", "E(n,1-n): n*f(n) + (1-n)*f(1-n) = f^{2n^2-2n+1}(1)", "important", "p.22, 'by E(n,1-n) we get...'", "S5"),
        ("N18", "inference", "Since f(1)=0 (N16): f^{2n^2-2n+1}(1) = f^{2n^2-2n}(0) = 0 (2n^2-2n even, T|2)", "important", "p.22, '(heart) derivation'", "S5"),
        ("N19", "conclusion", "(heart) n*f(n) + (1-n)*f(1-n) = 0 for all n", "critical", "p.22, '(heart)'", "S5"),
        ("N20", "construction", "Suppose exists m!=0 with f(m)!=0; choose |m| minimal among such m", "critical", "p.22, 'Assume there exists some m!=0... minimal possible'", "S6"),
        ("N21", "inference", "|m|>1 (by spade) and f(|m|)=f(m)!=0 (by club)", "important", "p.22, '|m|>1 due to (spade); f(|m|)!=0 due to (club)'", "S6"),
        ("N22", "inference", "(heart) at n=|m| forces f(1-|m|)!=0", "important", "p.22, 'f(1-|m|)!=0 due to (heart)'", "S6"),
        ("N23", "contradiction", "1-|m|!=0 and |1-|m||=|m|-1<|m| -- contradicts minimality of N20", "critical", "p.22, 'This contradicts the minimality assumption'", "S6"),
        ("N24", "conclusion", "No such m: f(n)=0 for all n!=0", "critical", "p.22, 'f(n)=0 for n!=0'", "S6"),
        ("N25", "calculation", "Fact X at a=2: f^4(2)=2f(2)=0 (N24) = f^3(f(2))=f^3(0)", "important", "p.22, 'f(0)=f^3(0)=f^4(2)=2f(2)=0'", "S7"),
        ("N26", "inference", "T|2 => f^3(0)=f(0)", "important", "p.22 (implicit in same sentence)", "S7"),
        ("N27", "conclusion", "f(0)=0; combined with N24, f=0 on all of Z", "critical", "p.22, 'Finally, f(0)=...=0'", "S7"),
        ("N28", "conclusion", "Verify: f=0 satisfies E(a,b) (both sides 0) -- first answer", "critical", "p.22, 'Clearly, the function f(x)=0 satisfies the problem condition'", "S7"),
        ("N29", "construction", "Case 2: assume all orbits infinite", "important", "p.22, 'Case 2: All orbits are infinite'", "S8"),
        ("N30", "inference", "Any two orbits O(a),O(b) have infinitely many common terms", "important", "p.22, 'each two orbits... have infinitely many common terms'", "S8"),
        ("N31", "definition", "For fixed a,b: consider pairs (n,m) with f^n(a)=f^m(b); define candidate X(a,b):=n-m", "important", "p.23, 'we claim that all pairs (n,m)... have the same difference n-m'", "S8"),
        ("N32", "contradiction", "If two such pairs had different differences, O(b) would be eventually periodic (finite) -- contradicts N29; so X(a,b) is well-defined", "critical", "p.23, 'so O(b) is finite, which is impossible'", "S8"),
        ("N33", "calculation", "X(a-1,a)=1 directly from identity (1) (N5)", "critical", "p.23, 'X(a-1,a)=1 by (1)'", "S9"),
        ("N34", "inference", "Additivity: X(a,b)+X(b,c)=X(a,c)", "important", "p.23, 'X(a,b)+X(b,c)=X(a,c)'", "S9"),
        ("N35", "conclusion", "Combine N33,N34 (Cauchy-style telescoping on Z): X(a,b)=b-a for all a,b", "critical", "p.23, 'these two properties imply that X(a,b)=b-a'", "S9"),
        ("N36", "calculation", "Apply f to identity (1): f^{a^2+1}(f(a-1)) = f^{a^2}(f(a))", "critical", "p.23, '(1) yields f^{a^2+1}(f(a-1))=f^{a^2}(f(a))'", "S10"),
        ("N37", "inference", "By definition of X (N31): X(f(a-1),f(a))=1", "important", "p.23, '1=X(f(a-1),f(a))'", "S10"),
        ("N38", "conclusion", "By N35's formula, X(f(a-1),f(a))=f(a)-f(a-1); equate: f(a)-f(a-1)=1 for all a", "critical", "p.23, '1=X(f(a-1),f(a))=f(a)-f(a-1)'", "S10"),
        ("N39", "inference", "Two-sided induction from f(-1)=0 (N3): f(x)=x+1 for all x in Z", "critical", "p.23, 'we conclude by (two-sided) induction... f(x)=x+1'", "S11"),
        ("N40", "conclusion", "Verify: f^n(x)=x+n => f^{a^2+b^2}(a+b)=a+b+a^2+b^2=a(a+1)+b(b+1)=af(a)+bf(b) -- second answer", "critical", "p.23, 'the obtained function also satisfies the assumption'", "S11"),
        ("N41", "conclusion", "Assemble: the solutions are exactly f=0 and f(x)=x+1", "critical", "p.22, 'Answer'", "S12"),
    ]
    node_ids = []
    for i, (suf, ntype, stmt, imp, span, strat) in enumerate(nodes):
        nid = sid(SOL1, suf)
        node_ids.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL1, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(SOL1, strat),
        })

    # Edges expanded from the report's table: every multi-parent row ("Na,Nb -> Nc")
    # becomes one edge per parent (thinking_graph_edge is a strict parent/child table).
    edges = [
        ("N1", "GOAL", "requires", "framing_setup"),
        ("GOAL", "N2", "derives", "substitution"),
        ("N2", "N3", "derives", "direct_computation_verification"),
        ("N1", "N4", "derives", "substitution"),
        ("N3", "N4", "requires", "substitution"),
        ("N2", "N5", "requires", "invoke_prior_lemma_fact"),
        ("N4", "N5", "requires", "algebraic_simplification"),
        ("N5", "N6", "motivates", "define_object"),
        ("N5", "N7", "requires", "structural_invariant_identification"),
        ("N6", "N7", "requires", "structural_invariant_identification"),
        ("N7", "N8", "requires", "structural_invariant_identification"),
        ("N8", "N9", "requires", "case_split"),
        ("N9", "N10", "requires", "case_split"),
        ("N1", "N11", "derives", "substitution"),
        ("N10", "N12", "requires", "bounding"),
        ("N11", "N12", "requires", "bounding"),
        ("N12", "N13", "requires", "structural_invariant_identification"),
        ("N13", "N14", "requires", "invoke_prior_lemma_fact"),
        ("N12", "N15", "requires", "direct_computation_verification"),
        ("N14", "N15", "requires", "direct_computation_verification"),
        ("N15", "N16", "requires", "substitution"),
        ("N3", "N16", "requires", "substitution"),
        ("N1", "N17", "derives", "substitution"),
        ("N14", "N18", "requires", "algebraic_simplification"),
        ("N16", "N18", "requires", "algebraic_simplification"),
        ("N17", "N18", "requires", "algebraic_simplification"),
        ("N18", "N19", "requires", "conclude"),
        ("N19", "N20", "motivates", "extremal_choice"),
        ("N15", "N21", "requires", "invoke_prior_lemma_fact"),
        ("N20", "N21", "requires", "invoke_prior_lemma_fact"),
        ("N19", "N22", "requires", "substitution"),
        ("N20", "N22", "requires", "substitution"),
        ("N21", "N23", "requires", "contradiction"),
        ("N22", "N23", "requires", "contradiction"),
        ("N20", "N23", "requires", "contradiction"),
        ("N23", "N24", "requires", "conclude"),
        ("N2", "N25", "requires", "substitution"),
        ("N24", "N25", "requires", "substitution"),
        ("N14", "N26", "requires", "invoke_prior_lemma_fact"),
        ("N25", "N26", "requires", "invoke_prior_lemma_fact"),
        ("N24", "N27", "requires", "merge_cases"),
        ("N26", "N27", "requires", "merge_cases"),
        ("N27", "N28", "requires", "direct_computation_verification"),
        ("N9", "N29", "requires", "case_split"),
        ("N7", "N30", "requires", "invoke_given_definitional_property"),
        ("N29", "N30", "requires", "invoke_given_definitional_property"),
        ("N30", "N31", "motivates", "define_object"),
        ("N31", "N32", "requires", "contradiction"),
        ("N29", "N32", "requires", "invoke_given_definitional_property"),
        ("N5", "N33", "derives", "direct_computation_verification"),
        ("N32", "N34", "requires", "structural_invariant_identification"),
        ("N33", "N35", "requires", "algebraic_simplification"),
        ("N34", "N35", "requires", "algebraic_simplification"),
        ("N5", "N36", "derives", "substitution"),
        ("N36", "N37", "requires", "invoke_given_definitional_property"),
        ("N35", "N38", "requires", "boundary_equality_identification"),
        ("N37", "N38", "requires", "boundary_equality_identification"),
        ("N38", "N39", "requires", "induction"),
        ("N3", "N39", "requires", "induction"),
        ("N39", "N40", "requires", "direct_computation_verification"),
        ("N28", "N41", "requires", "combine_bounds_squeeze_assemble"),
        ("N40", "N41", "requires", "combine_bounds_squeeze_assemble"),
    ]
    edge_tuples = []
    for i, (fr, to, rel, act) in enumerate(edges):
        pn, cn = sid(SOL1, fr), sid(SOL1, to)
        edge_tuples.append((pn, cn))
        all_edges.append({
            "edge_id": f"{SOL1}-E{i+1}", "solution_id": SOL1, "parent_node_id": pn, "child_node_id": cn,
            "relation": rel, "action_type_id": act,
        })
    solution_graph_data[SOL1] = (node_ids, edge_tuples)

    all_solutions.append({
        "solution_id": SOL1, "problem_id": P, "label": "Official Solution", "is_primary": True,
        "is_complete": True, "replaces_solution_id": None, "replaces_span_note": None,
        "construction_type": "case-split dynamical analysis via orbit tail-equivalence (finite-orbit periodicity descent vs infinite-orbit additive clock)",
        "source_reference": "pdf:IMO2020SL.pdf; pdf_pages:24-25; printed_pages:22-23; heading:Solution.",
    })

    all_proof_features += [
        {"solution_id": SOL1, "feature_type_id": f}
        for f in ("functional", "recursive", "contradiction", "construction", "extremal", "invariant")
    ]

    # Principle instances. Note: no vocabulary merges recommended for this problem --
    # all 11 + 1 cross-cutting principles are new (see NEW_PRINCIPLE_TYPES above).
    principle_instances = [
        ("single_variable_specialization_multivar_fe", "S1", False, "intrinsic", "high",
         "Setting b=0 and b=-1 reads off the only directly available single-variable content in E(a,b); essentially every solution to this problem opens with an equivalent pair of specializations."),
        ("iterate_tail_equivalence_dynamical_dichotomy", "S2", False, "mixed", "low",
         "The raw fact that O(a-1) and O(a) eventually coincide is forced by identity (1) (intrinsic), but formalizing it via 'orbit' vocabulary and deriving the global finite/infinite case split from it is this proof's architecture; not tested against an alternate proof."),
        ("bounded_finite_set_forces_vanishing_coefficient", "S3", False, "solution_specific", "low",
         "Tied to substituting E(a,-a) and the prior establishment that O(0) is finite; a different Case-1 proof could reach f(a)=f(-a) by another route."),
        ("coprime_moduli_period_pin", "S4", False, "solution_specific", "low",
         "The exact witnesses a,a+1 are a proof choice -- any two coprime large integers would pin T|2 equally well."),
        ("paired_complementary_substitution_global_identity", "S5", False, "solution_specific", "low",
         "The pairing n,1-n is chosen because a+b=1 keeps the iterate anchored at the already-known point f(1)=0; a different closing identity is conceivable."),
        ("extremal_principle_minimal_counterexample", "S6", False, "intrinsic", "low",
         "(heart) relates f(n) to a strictly-shrinking-in-|.| companion f(1-n); essentially any proof of 'f(n)=0 for all n!=0' from a relation of this shape needs some induction/descent on |n|. No alternate solution to confirm, hence medium confidence."),
        ("close_last_value_via_known_fact_reuse", "S7", False, "solution_specific", "low",
         "The specific evaluation point a=2 is arbitrary; any a with f(a) already pinned to 0 and period-2 aligned would close the argument."),
        ("nonunique_iterate_coincidence_forces_periodicity", "S8", False, "solution_specific", "low",
         "One way to formalize 'there's a consistent clock'; other proofs of Case 2 might avoid defining X and argue by direct double induction instead. Logical converse of P2's mechanism."),
        ("discrete_cauchy_cocycle_additivity", "S9", False, "intrinsic", "low",
         "Once X is well-defined and additivity is immediate from composing iterations (forced by what X means, not a proof choice), and the base value X(a-1,a)=1 is forced by identity (1), the linear formula X(a,b)=b-a is a forced consequence."),
        ("transport_formula_through_map", "S10", False, "solution_specific", "low",
         "A specific architectural move (apply f to identity (1), re-read the output as a fresh X-instance); the resulting fact (f is a unit-step map) is intrinsic to the answer, but this mechanism is one proof's path."),
        ("anchor_plus_constant_step_affine_induction", "S11", False, "intrinsic", "high",
         "Once a constant difference and one anchor value are established, the affine formula is forced -- closing-move bookkeeping, not a creative choice."),
        ("iterate_exponent_as_orbit_depth", None, True, "intrinsic", "high",
         "The equation genuinely is a statement about iteration depth (the exponent a^2+b^2), independent of which proof strategy is used -- any correct solution has to engage with f's dynamics under iteration in some form."),
    ]
    for ptid, strat, cc, intr, conf, just in principle_instances:
        all_principle_instances.append({
            "instance_id": f"{SOL1}-PI-{ptid}", "solution_id": SOL1, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL1, strat) if strat else None, "is_cross_cutting": cc,
            "is_problem_intrinsic": intr, "intrinsic_confidence": conf, "justification_text": just,
        })

    dep_edges = [
        ("single_variable_specialization_multivar_fe", "iterate_tail_equivalence_dynamical_dichotomy", "requires",
         "P2's tail-sharing claim is read directly off identity (1) = P1's output at N5."),
        ("single_variable_specialization_multivar_fe", "bounded_finite_set_forces_vanishing_coefficient", "motivates",
         "N11's fresh specialization E(a,-a) reuses P1's specialization technique on a new pair, not P1's data."),
        ("iterate_tail_equivalence_dynamical_dichotomy", "bounded_finite_set_forces_vanishing_coefficient", "requires",
         "Case 1's setup ('O(0) finite', N10) is literally one branch of P2's dichotomy at N9."),
        ("bounded_finite_set_forces_vanishing_coefficient", "coprime_moduli_period_pin", "requires",
         "N13's periodicity claim is built directly on N12 (P3's output)."),
        ("coprime_moduli_period_pin", "paired_complementary_substitution_global_identity", "requires",
         "N18 needs T|2 (N14/P4's output) to reduce f^{2n^2-2n}(0) to 0."),
        ("single_variable_specialization_multivar_fe", "paired_complementary_substitution_global_identity", "requires",
         "N16's f(1)=0 needs the anchor f(-1)=0 (N3, P1's output)."),
        ("paired_complementary_substitution_global_identity", "extremal_principle_minimal_counterexample", "requires",
         "N21/N22 directly cite (club) and (heart) -- P5's and P4-via-P3's outputs."),
        ("bounded_finite_set_forces_vanishing_coefficient", "extremal_principle_minimal_counterexample", "requires",
         "N21 cites (club) (N15, P3/P4's joint output) to get f(|m|)!=0."),
        ("single_variable_specialization_multivar_fe", "close_last_value_via_known_fact_reuse", "requires",
         "N25 reuses Fact X (N2, P1's output) at a=2."),
        ("extremal_principle_minimal_counterexample", "close_last_value_via_known_fact_reuse", "requires",
         "N25 needs f(2)=0, which is P6's output (N24)."),
        ("coprime_moduli_period_pin", "close_last_value_via_known_fact_reuse", "requires",
         "N26 reuses T|2 (P4's output) a second time to reduce f^3(0) to f(0)."),
        ("iterate_tail_equivalence_dynamical_dichotomy", "nonunique_iterate_coincidence_forces_periodicity", "requires",
         "N29 (Case 2) is the other branch of P2's dichotomy at N9."),
        ("single_variable_specialization_multivar_fe", "discrete_cauchy_cocycle_additivity", "requires",
         "N33's base value X(a-1,a)=1 is read directly off identity (1) (N5, P1)."),
        ("nonunique_iterate_coincidence_forces_periodicity", "discrete_cauchy_cocycle_additivity", "requires",
         "N34's additivity manipulation presupposes X is well-defined (P8's N32 output)."),
        ("single_variable_specialization_multivar_fe", "transport_formula_through_map", "requires",
         "N36 re-applies f to identity (1) (N5, P1's output)."),
        ("discrete_cauchy_cocycle_additivity", "transport_formula_through_map", "requires",
         "N38 explicitly reuses the general formula X(u,v)=v-u (N35, P9's output)."),
        ("transport_formula_through_map", "anchor_plus_constant_step_affine_induction", "requires",
         "N39's induction consumes the unit-step recurrence (N38, P10's output)."),
        ("single_variable_specialization_multivar_fe", "anchor_plus_constant_step_affine_induction", "requires",
         "N39's induction anchor is f(-1)=0 (N3, P1's output)."),
        ("iterate_exponent_as_orbit_depth", "iterate_tail_equivalence_dynamical_dichotomy", "motivates",
         "Recognizing f^{a^2+b^2} as orbit-depth predicts that tail/orbit reasoning will be the productive move."),
        ("iterate_exponent_as_orbit_depth", "nonunique_iterate_coincidence_forces_periodicity", "motivates",
         "Same recognition predicts Case 2 will need an iteration-count bookkeeping device (the clock X)."),
        ("iterate_exponent_as_orbit_depth", "discrete_cauchy_cocycle_additivity", "motivates",
         "Predicts the clock will behave additively -- a 'depth' measure should compose under composition of iterates."),
        ("iterate_exponent_as_orbit_depth", "transport_formula_through_map", "motivates",
         "Predicts that pushing the map through the depth-identity will again yield a depth-type fact."),
    ]
    for i, (src, tgt, rel, just) in enumerate(dep_edges):
        all_principle_dep_edges.append({
            "edge_id": f"{P}-PDE-{i+1}",
            "source_instance_id": f"{SOL1}-PI-{src}", "target_instance_id": f"{SOL1}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })
