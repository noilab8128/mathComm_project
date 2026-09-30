"""
Data fragment for IMO-SL-2015-N4, produced from reports/IMO-SL-2015-N4_validation_report.md.
Pure data + a build() function -- no DB calls. Merged into scripts/load_dna_seed_v1.py by a
separate step.

Merge decision: Solution 1's P3 (Well-Founded Descent / Monovariant Induction, stabilizing w_n)
reuses the existing principle_type_id "well_founded_descent_monovariant_induction" verbatim --
same generic fact (a non-increasing N-valued sequence must stabilize), same bar as the project's
`two_sided_squeeze` precedent merge. No new principle_type row created for it.
"""

NEW_TOPICS = [
    {"topic_id": "recursive_dynamical_systems",
     "name": "Recursive Dynamical Systems / Eventual Periodicity",
     "area": "number_theory",
     "description": "Integer sequences defined by deterministic recursions (often via gcd/lcm or "
                     "modular update rules) analyzed as finite-state processes to prove eventual "
                     "periodicity or stabilization."},
]

# (id, name, generic_form, generality_class) -- matches PRINCIPLE_TYPES tuple shape.
# P3 deliberately excluded (merged into existing well_founded_descent_monovariant_induction).
NEW_PRINCIPLE_TYPES = [
    ("auxiliary_additive_invariant_construction", "Auxiliary Additive Invariant Construction",
     "When a recursion updates a pair of variables, introduce their sum (or another simple "
     "combination) that is provably unchanged on at least one branch of the recursion, to reduce "
     "the effective state dimension.", "common_technique"),
    ("minimal_non_divisor_witness_threshold", "Minimal-Non-Divisor Witness/Threshold Extraction",
     "Given a growing integer parameter x and a reference integer s, the least integer >= x that "
     "fails to divide s is a well-defined witness measuring how far x can freely increment before "
     "the divisibility relation with s breaks.", "specialized"),
    ("threshold_based_case_determination", "Threshold-Based Case Determination",
     "Once a monovariant threshold has stabilized, partition the index set by comparison to that "
     "fixed value to recover which branch of an underlying case split is active at each step.",
     "common_technique"),
    ("case_wise_algebraic_invariant_verification", "Case-wise Algebraic Invariant Verification",
     "To show a derived quantity is preserved or determined by a recursive process, verify the "
     "claim separately in each branch of a governing case split using direct algebraic identities.",
     "common_technique"),
    ("explicit_deterministic_recurrence_readoff",
     "Read Off an Explicit Deterministic Recurrence from a Pinned Case Structure",
     "Once a case-classified recursion's branch-selection rule and the invariant(s) governing each "
     "branch are both pinned down, the recursion collapses into a fully explicit, deterministic "
     "transition rule.", "common_technique"),
    ("modulus_reduction_escape_unboundedness", "Modulus Reduction to Escape Unboundedness",
     "Reduce an a priori-unbounded coordinate modulo an invariant derived from a bounded one, to "
     "obtain a finite proxy state.", "common_technique"),
    ("self_contained_state_space_reduction", "Self-Contained State-Space Reduction",
     "A state reduction is valid only if the reduced coordinates alone determine their own future "
     "evolution; this closure must be verified explicitly before applying any pigeonhole argument "
     "to it.", "universal"),
    ("pigeonhole_finite_deterministic_state_space", "Pigeonhole on a Finite Deterministic State Space",
     "A deterministic map from a finite set to itself, iterated, must eventually enter a cycle.",
     "universal"),
]

NEW_REASONING_ACTIONS = []  # all 27 existing action types sufficed

PROBLEM = {
    "problem_id": "IMO-SL-2015-N4", "contest": "IMO Shortlist", "year": 2015, "round": "Shortlist",
    "problem_number": "N4", "source": "data/raw/imo/IMO2015SL.pdf, statement p.7, solutions pp.68-69",
    "statement_text": ("Suppose that a_0,a_1,... and b_0,b_1,... are two sequences of positive integers "
                        "satisfying a_0,b_0>=2 and a_{n+1}=gcd(a_n,b_n)+1, b_{n+1}=lcm(a_n,b_n)-1 for "
                        "all n>=0. Prove that the sequence (a_n) is eventually periodic; in other words, "
                        "there exist integers N>=0 and t>0 such that a_{n+t}=a_n for all n>=N."),
    "difficulty": None,
    "objects_text": ("Two interleaved positive-integer sequences (a_n),(b_n) governed by a gcd/lcm "
                       "recursion; derived quantities s_n=a_n+b_n, a minimal-non-divisor threshold w_n, "
                       "and a gcd-based invariant g_n."),
    "hidden_structure": ("The recursion is a disguised finite-state process: a_n climbs by +1 each step "
                           "while it divides b_n, until it hits a capacity w (the least integer >= a_n "
                           "not dividing the locally-conserved sum s_n); at that point it resets to a "
                           "floor g+1 and climbs again. Both the ceiling w and floor g stabilize, so the "
                           "long-run behavior is an exact repeating cycle g+1 -> g+2 -> ... -> w -> g+1 "
                           "-> ..."),
    "expected_insight": ("Track the coarser sum s_n=a_n+b_n instead of (a_n,b_n) directly, since it is "
                           "provably unchanged exactly while a_n | b_n; this collapses the two-variable "
                           "recursion to a one-variable threshold question that can only move downward, "
                           "forcing stabilization and an explicit cycle."),
    "problem_family": None, "problem_template": None,
}

PROBLEM_TOPIC_IDS = ["recursive_dynamical_systems"]


def build(all_solutions, all_strategies, all_nodes, all_edges, all_proof_features,
          all_principle_instances, all_principle_dep_edges, solution_graph_data, sid):
    P = "IMO-SL-2015-N4"
    SOL1 = sid(P, "SOL1")
    SOL2 = sid(P, "SOL2")

    # ---------------- Solution 1 ----------------
    strategies_1 = [
        ("S0", 0, "Framing: state the gcd/lcm recursion and the eventual-periodicity goal.", True, False),
        ("S1", 1, "Introduce the auxiliary additive invariant s_n=a_n+b_n.", False, False),
        ("S2", 2, "Two-regime case classification on a_n|b_n; pin the non-divisor threshold w_n.", False, False),
        ("S3", 3, "Prove the threshold w_n is non-increasing (well-founded descent).", False, False),
        ("S4", 4, "Stabilization: w_n is eventually constant at w.", False, False),
        ("S5", 5, "Read off the branch rule once w_n has stabilized.", False, False),
        ("S6", 6, "Second invariant g_n=gcd(w,s_n) and its eventual constancy.", False, False),
        ("S7", 7, "Assemble the explicit two-branch deterministic recurrence for a_{n+1}.", False, False),
        ("S8", 8, "Conclude: read the rule as an explicit cycle.", False, True),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_1:
        all_strategies.append({
            "strategy_id": sid(SOL1, suf), "solution_id": SOL1, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    strategy_of_1 = {
        "N1": "S0", "N2": "S0",
        "N3": "S1",
        "N4": "S2", "N5": "S2", "N6": "S2", "N7": "S2",
        "N8": "S3", "N9": "S3", "N10": "S3", "N11": "S3", "N12": "S3",
        "N13": "S4",
        "N14": "S5",
        "N15": "S6", "N16": "S6", "N17": "S6", "N18": "S6", "N19": "S6",
        "N20": "S7", "N21": "S7", "N22": "S7",
        "N23": "S8",
    }
    nodes_1 = [
        ("N1", "given", "a_0,b_0>=2; a_{n+1}=gcd(a_n,b_n)+1, b_{n+1}=lcm(a_n,b_n)-1", "critical", "p.68, problem statement"),
        ("N2", "goal", "prove (a_n) is eventually periodic", "critical", "p.68"),
        ("N3", "construction", "define s_n=a_n+b_n", "critical", "p.68, 'Let s_n=a_n+b_n'"),
        ("N4", "inference", "Sub-claim A: if a_n|b_n then a_{n+1}=a_n+1, b_{n+1}=b_n-1, s_{n+1}=s_n", "critical", "p.68"),
        ("N5", "construction", "define W_n={m>=a_n: m does not divide s_n}, w_n=min W_n", "critical", "p.68"),
        ("N6", "observation", "a_n|s_n iff a_n|b_n (since s_n=a_n+b_n)", "important", "p.68 (implicit)"),
        ("N7", "inference", "Sub-claim B: if a_n does not divide b_n then w_n=a_n exactly", "critical", "p.68"),
        ("N8", "inference", "Case a_n|b_n: a_n not in W_n and s_{n+1}=s_n => W_{n+1}=W_n => w_{n+1}=w_n", "important", "p.68, Claim 1 proof"),
        ("N9", "inference", "Case a_n does not divide b_n: a_{n+1}=gcd(a_n,b_n)+1<=a_n", "important", "p.68"),
        ("N10", "inference", "Case a_n does not divide b_n: a_n does not divide s_{n+1}", "important", "p.68"),
        ("N11", "inference", "N9+N10 => a_n in W_{n+1} => w_{n+1}<=a_n=w_n", "important", "p.68"),
        ("N12", "conclusion", "Claim 1: (w_n) is non-increasing", "critical", "p.68"),
        ("N13", "conclusion", "a non-increasing sequence of positive integers is eventually constant: w_n=w for n>=N", "critical", "p.68"),
        ("N14", "inference", "for n>=N: a_n<w => a_n|b_n (case 1); a_n=w => a_n does not divide b_n (case 2)", "important", "p.68"),
        ("N15", "construction", "define g_n=gcd(w,s_n) for n>=N", "important", "p.68"),
        ("N16", "inference", "case 2: gcd(a_n,b_n)=gcd(w,s_n)=g_n", "critical", "p.68, eq. (1)"),
        ("N17", "calculation", "case 2: s_{n+1}=g_n + w(s_n-w)/g_n", "critical", "p.68, eq. (1)"),
        ("N18", "inference", "case 2: g_{n+1}=gcd(w,s_{n+1})=gcd(w,g_n)=g_n", "critical", "p.68"),
        ("N19", "conclusion", "Claim 2: (g_n) is constant for n>=N", "critical", "p.68"),
        ("N20", "inference", "case 2 => a_{n+1}=g_n+1=g+1 (g=g_N)", "critical", "p.68"),
        ("N21", "inference", "case 1 => a_{n+1}=a_n+1", "important", "p.68"),
        ("N22", "inference", "g<w strictly", "important", "p.68 (implicit)"),
        ("N23", "conclusion", "a_n deterministically cycles g+1 -> g+2 -> ... -> w -> g+1, period t=w-g; QED", "critical", "p.68"),
    ]
    node_ids_1 = []
    for i, (suf, ntype, stmt, imp, span) in enumerate(nodes_1):
        nid = sid(SOL1, suf)
        node_ids_1.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL1, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(SOL1, strategy_of_1[suf]),
        })

    edges_1 = [
        ("N1", "N2", "motivates", "framing_setup"),
        ("N1", "N3", "requires", "define_object"),
        ("N1", "N4", "requires", "invoke_given_definitional_property"),
        ("N3", "N4", "requires", "substitution"),
        ("N1", "N5", "requires", "define_object"),
        ("N3", "N5", "requires", "invoke_given_definitional_property"),
        ("N3", "N6", "derives", "algebraic_simplification"),
        ("N1", "N6", "requires", "invoke_given_definitional_property"),
        ("N5", "N7", "derives", "structural_invariant_identification"),
        ("N6", "N7", "requires", "substitution"),
        ("N4", "N8", "requires", "case_split"),
        ("N6", "N8", "requires", "invoke_prior_lemma_fact"),
        ("N5", "N8", "requires", "invoke_prior_lemma_fact"),
        ("N1", "N9", "requires", "invoke_given_definitional_property"),
        ("N1", "N10", "requires", "invoke_given_definitional_property"),
        ("N9", "N11", "requires", "inequality_chaining"),
        ("N10", "N11", "requires", "structural_invariant_identification"),
        ("N7", "N11", "requires", "invoke_prior_lemma_fact"),
        ("N8", "N12", "derives", "merge_cases"),
        ("N11", "N12", "derives", "merge_cases"),
        ("N12", "N13", "derives", "monovariant_descent_step"),
        ("N13", "N14", "derives", "case_split"),
        ("N1", "N15", "requires", "define_object"),
        ("N13", "N15", "requires", "invoke_prior_lemma_fact"),
        ("N14", "N16", "requires", "case_split"),
        ("N1", "N16", "requires", "invoke_given_definitional_property"),
        ("N16", "N17", "derives", "substitution"),
        ("N17", "N18", "derives", "algebraic_simplification"),
        ("N8", "N19", "derives", "merge_cases"),
        ("N18", "N19", "derives", "merge_cases"),
        ("N19", "N20", "derives", "substitution"),
        ("N14", "N21", "derives", "case_split"),
        ("N9", "N22", "requires", "inequality_chaining"),
        ("N16", "N22", "requires", "invoke_prior_lemma_fact"),
        ("N20", "N23", "derives", "combine_bounds_squeeze_assemble"),
        ("N21", "N23", "derives", "combine_bounds_squeeze_assemble"),
        ("N22", "N23", "derives", "combine_bounds_squeeze_assemble"),
    ]
    edge_tuples_1 = []
    for i, (fr, to, rel, act) in enumerate(edges_1):
        pn, cn = sid(SOL1, fr), sid(SOL1, to)
        edge_tuples_1.append((pn, cn))
        all_edges.append({
            "edge_id": f"{SOL1}-E{i+1}", "solution_id": SOL1, "parent_node_id": pn, "child_node_id": cn,
            "relation": rel, "action_type_id": act,
        })
    solution_graph_data[SOL1] = (node_ids_1, edge_tuples_1)

    all_solutions.append({
        "solution_id": SOL1, "problem_id": P, "label": "Official Solution 1", "is_primary": True,
        "is_complete": True, "replaces_solution_id": None, "replaces_span_note": None,
        "construction_type": "auxiliary additive invariant + monovariant threshold descent + case-wise invariant verification",
        "source_reference": "pdf:IMO2015SL.pdf; printed_pages:68-69; heading:Solution 1.",
    })

    # ---------------- Solution 2 (alternate, is_complete=False) ----------------
    strategies_2 = [
        ("T1", 0, "Import Solution 1's boundedness of a_n; construct a finite modulus proxy for b_n.", False, False),
        ("T2", 1, "Verify the reduced pair (a_n, r_n) is self-contained (determines its own future).", False, False),
        ("T3", 2, "Pigeonhole on the finite deterministic state space to conclude periodicity.", False, False),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_2:
        all_strategies.append({
            "strategy_id": sid(SOL2, suf), "solution_id": SOL2, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    strategy_of_2 = {
        "M1": "T1", "M2": "T1", "M3": "T1",
        "M4": "T2", "M5": "T2", "M6": "T2", "M7": "T2", "M8": "T2",
        "M9": "T3", "M10": "T3", "M11": "T3",
    }
    nodes_2 = [
        ("M1", "given", "cites Sol.1 Claim 1: a_n<=w_n<=w_0 => (a_n) bounded, finitely many values", "critical", "p.68-69, 'By Claim 1 in the first solution'"),
        ("M2", "construction", "define M=lcm(a_1,a_2,...) (finite lcm, finitely many values)", "important", "p.69"),
        ("M3", "construction", "define r_n = b_n mod M", "important", "p.69"),
        ("M4", "inference", "since a_n|M and M|(b_n-r_n): gcd(a_n,b_n)=gcd(a_n,r_n)", "critical", "p.69"),
        ("M5", "inference", "hence a_{n+1}=gcd(a_n,r_n)+1, determined by (a_n,r_n) alone", "critical", "p.69"),
        ("M6", "calculation", "r_{n+1} = (a_n/gcd(a_n,r_n))*r_n - 1 (mod M)", "critical", "p.69"),
        ("M7", "inference", "hence r_{n+1} is also determined by (a_n,r_n) alone", "critical", "p.69"),
        ("M8", "conclusion", "the pair (a_n,r_n) determines (a_{n+1},r_{n+1}): a well-defined self-map on the reduced state", "critical", "p.69"),
        ("M9", "observation", "(a_n,r_n) ranges over a finite set (a_n finitely many values, r_n in {0,...,M-1})", "critical", "p.69"),
        ("M10", "conclusion", "a deterministic self-map on a finite set, iterated, must eventually revisit a state and cycle (pigeonhole)", "critical", "p.69"),
        ("M11", "conclusion", "(a_n), a coordinate-projection of the eventually-periodic pair sequence, is itself eventually periodic. QED", "critical", "p.69"),
    ]
    node_ids_2 = []
    for i, (suf, ntype, stmt, imp, span) in enumerate(nodes_2):
        nid = sid(SOL2, suf)
        node_ids_2.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL2, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(SOL2, strategy_of_2[suf]),
        })

    edges_2 = [
        ("M1", "M2", "requires", "invoke_prior_lemma_fact"),
        ("M2", "M3", "requires", "define_object"),
        ("M2", "M4", "requires", "invoke_given_definitional_property"),
        ("M3", "M4", "requires", "algebraic_simplification"),
        ("M4", "M5", "derives", "substitution"),
        ("M2", "M6", "requires", "algebraic_simplification"),
        ("M4", "M6", "requires", "algebraic_simplification"),
        ("M5", "M6", "requires", "substitution"),
        ("M6", "M7", "derives", "algebraic_simplification"),
        ("M5", "M8", "requires", "structural_invariant_identification"),
        ("M7", "M8", "requires", "structural_invariant_identification"),
        ("M1", "M9", "requires", "invoke_prior_lemma_fact"),
        ("M3", "M9", "requires", "structural_invariant_identification"),
        ("M8", "M10", "requires", "invoke_prior_lemma_fact"),
        ("M9", "M10", "requires", "invoke_prior_lemma_fact"),
        ("M10", "M11", "derives", "conclude"),
        ("M1", "M11", "requires", "invoke_prior_lemma_fact"),
    ]
    edge_tuples_2 = []
    for i, (fr, to, rel, act) in enumerate(edges_2):
        pn, cn = sid(SOL2, fr), sid(SOL2, to)
        edge_tuples_2.append((pn, cn))
        all_edges.append({
            "edge_id": f"{SOL2}-E{i+1}", "solution_id": SOL2, "parent_node_id": pn, "child_node_id": cn,
            "relation": rel, "action_type_id": act,
        })
    solution_graph_data[SOL2] = (node_ids_2, edge_tuples_2)

    all_solutions.append({
        "solution_id": SOL2, "problem_id": P,
        "label": "Official Solution 2 - modulus reduction + pigeonhole", "is_primary": False,
        "is_complete": False, "replaces_solution_id": SOL1,
        "replaces_span_note": ("Imports Solution 1's Claim 1 (N12/N13, boundedness/stabilization of "
                                 "w_n) by direct citation ('By Claim 1 in the first solution...') and "
                                 "replaces everything downstream (Claim 2 onward) with a modulus-"
                                 "reduction + pigeonhole argument."),
        "construction_type": "modulus reduction to a finite state space + pigeonhole on a deterministic self-map",
        "source_reference": "pdf:IMO2015SL.pdf; printed_pages:68-69; heading:Solution 2.",
    })

    all_proof_features += [
        {"solution_id": SOL1, "feature_type_id": f} for f in ("invariant", "monovariant", "construction", "direct")
    ] + [
        {"solution_id": SOL2, "feature_type_id": f} for f in ("invariant", "recursive", "construction", "direct")
    ]

    # ---------------- Principle instances, Solution 1 ----------------
    pi_1 = [
        ("auxiliary_additive_invariant_construction", "S1", False, "solution_specific", "high",
         "Test: does any correct proof need s_n=a_n+b_n specifically? No -- Solution 2 never defines "
         "s_n at all, instead reducing b_n modulo a bound derived from (a_n)'s own finiteness. "
         "Confirmed solution-specific by the existence of an alternate official proof that sidesteps "
         "it entirely."),
        ("minimal_non_divisor_witness_threshold", "S2", False, "solution_specific", "high",
         "Same test as P1 -- Solution 2 never constructs W_n/w_n. Kept separate from the existing "
         "extremal_witness_instantiation entry: that one is about max/min of a finite set of reals; "
         "this is a minimum of an infinite set of positive integers, justified by well-ordering, not "
         "finiteness -- cousins, not identical, same conservative standard as 2006-A3/2007-A1."),
        ("well_founded_descent_monovariant_induction", "S3", False, "solution_specific", "high",
         "S3+S4 is genuinely one principle applied across two adjacent strategies (the descent proof "
         "and its stabilization consequence). Same generic fact as the entry seeded from 2006-A3's "
         "Comment (a non-increasing N-valued sequence must stabilize), applied here to threshold "
         "stabilization rather than construction termination -- reused verbatim, not a new type."),
        ("threshold_based_case_determination", "S5", False, "intrinsic", "low",
         "Any correct proof that establishes some stabilized threshold governing this recursion's "
         "branch choice would need exactly this translation -- forced by what 'branch fires' means "
         "once w_n is fixed, not a proof-path choice. Low confidence: no independent alternate proof "
         "isolates this exact micro-step for cross-checking."),
        ("case_wise_algebraic_invariant_verification", "S6", False, "solution_specific", "high",
         "Solution 2 never verifies constancy of any g_n-like quantity; it sidesteps the need entirely "
         "by working with residues mod a fixed M from the start."),
        ("explicit_deterministic_recurrence_readoff", "S7", False, "solution_specific", "high",
         "Strong case, directly confirmed: Solution 2 proves the identical conclusion without ever "
         "exhibiting an explicit cycle, using an abstract pigeonhole argument instead -- the direct "
         "number-theory analogue of 2006-A3's Extremal-Representative vs. Monovariant-Descent split."),
    ]
    for ptid, strat, cc, intr, conf, just in pi_1:
        all_principle_instances.append({
            "instance_id": f"{SOL1}-PI-{ptid}", "solution_id": SOL1, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL1, strat) if strat else None, "is_cross_cutting": cc,
            "is_problem_intrinsic": intr, "intrinsic_confidence": conf, "justification_text": just,
        })

    # ---------------- Principle instances, Solution 2 ----------------
    pi_2 = [
        ("modulus_reduction_escape_unboundedness", "T1", False, "solution_specific", "high",
         "Solution 1 never reduces mod anything -- reducing an a priori-unbounded coordinate modulo an "
         "invariant derived from a bounded one is this proof's own architectural choice."),
        ("self_contained_state_space_reduction", "T2", False, "mixed", "high",
         "The requirement to verify closure is intrinsic to using any pigeonhole-on-reduced-state "
         "strategy, but the concrete gcd/lcm-mod-M verification (M4-M7) carrying it out is "
         "solution-specific."),
        ("pigeonhole_finite_deterministic_state_space", "T3", False, "intrinsic", "high",
         "Essentially definitional of what 'eventual periodicity of a process confined to a finite, "
         "deterministically-evolving state space' means; any correct proof of this shape must invoke "
         "it in some form. Cross-cutting intrinsic fact both P6 (explicit cycle) and Q3 (pigeonhole) "
         "instantiate concretely."),
    ]
    for ptid, strat, cc, intr, conf, just in pi_2:
        all_principle_instances.append({
            "instance_id": f"{SOL2}-PI-{ptid}", "solution_id": SOL2, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL2, strat) if strat else None, "is_cross_cutting": cc,
            "is_problem_intrinsic": intr, "intrinsic_confidence": conf, "justification_text": just,
        })

    # ---------------- Principle dependency edges ----------------
    dep_edges_1 = [
        ("auxiliary_additive_invariant_construction", "minimal_non_divisor_witness_threshold", "requires",
         "W_n's definition (N5) is stated in terms of 'does not divide s_n' -- s_n must already exist."),
        ("minimal_non_divisor_witness_threshold", "well_founded_descent_monovariant_induction", "requires",
         "Claim 1 (N12) is a statement about w_n; w_n's case-dependent formula (Sub-claim B / N7) must "
         "already be established before non-increase can even be asked."),
        ("well_founded_descent_monovariant_induction", "threshold_based_case_determination", "enables",
         "P4's branch rule (N14) reads off consequences of the stabilized value w produced at N13; "
         "nothing to branch on until w exists."),
        ("auxiliary_additive_invariant_construction", "case_wise_algebraic_invariant_verification", "requires",
         "g_n=gcd(w,s_n) (N15) needs s_n already defined."),
        ("well_founded_descent_monovariant_induction", "case_wise_algebraic_invariant_verification", "requires",
         "g_n is only defined/meaningful for n>=N -- the stabilization index produced by the descent."),
        ("threshold_based_case_determination", "case_wise_algebraic_invariant_verification", "requires",
         "Verifying g_n's constancy in the case-2 branch (N16) uses the branch fact (a_n=w) to know "
         "which algebraic identity applies."),
        ("threshold_based_case_determination", "explicit_deterministic_recurrence_readoff", "requires",
         "The explicit rule's case-1 half (N21, a_{n+1}=a_n+1) is exactly the branch condition "
         "re-applied."),
        ("case_wise_algebraic_invariant_verification", "explicit_deterministic_recurrence_readoff", "requires",
         "The explicit rule's case-2 half (N20, a_{n+1}=g+1) needs g_n's constancy to replace g_n with "
         "the fixed g."),
    ]
    dep_edges_2 = [
        ("modulus_reduction_escape_unboundedness", "self_contained_state_space_reduction", "requires",
         "Closure-checking (M4-M8) needs the modulus reduction (M2-M3) to exist first."),
        ("modulus_reduction_escape_unboundedness", "pigeonhole_finite_deterministic_state_space", "requires",
         "Pigeonhole needs a finite space, which requires the modulus reduction plus the imported "
         "boundedness of a_n (M1, M9)."),
        ("self_contained_state_space_reduction", "pigeonhole_finite_deterministic_state_space", "requires",
         "Pigeonhole needs a genuinely self-contained deterministic map (M8), not just a finite set."),
    ]
    idx = 1
    for src, tgt, rel, just in dep_edges_1:
        all_principle_dep_edges.append({
            "edge_id": f"{P}-PDE-{idx}",
            "source_instance_id": f"{SOL1}-PI-{src}", "target_instance_id": f"{SOL1}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })
        idx += 1
    for src, tgt, rel, just in dep_edges_2:
        all_principle_dep_edges.append({
            "edge_id": f"{P}-PDE-{idx}",
            "source_instance_id": f"{SOL2}-PI-{src}", "target_instance_id": f"{SOL2}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })
        idx += 1
