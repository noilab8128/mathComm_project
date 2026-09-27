"""
Data fragment for IMO-SL-2019-C2, to be merged into scripts/load_dna_seed_v1.py.
Source: reports/IMO-SL-2019-C2_validation_report.md (full transcription, no invented content,
except one inferred edge M3->M16 in Solution 2 -- see NOTE below).

Two fully independent, complete official solutions (not a modular-swap pair):
  Solution 1: induction on block count n, extremal-peel + shift reconstruction. 14 nodes/19 edges.
  Solution 2: induction on sorted-prefix count k, doubling filtration + contradiction. 16 nodes/17 edges.
"""

NEW_TOPICS = [
    {"topic_id": "subset_sum_covering", "name": "Subset-Sum Covering", "area": "combinatorics",
     "description": "Achievable subset-sum sets and gap/mesh bounds guaranteeing coverage of target windows."},
]

# (principle_type_id, name, generic_form, generality_class)
NEW_PRINCIPLE_TYPES = [
    ("inductive_hypothesis_strengthening", "Strengthen the Inductive Hypothesis",
     "When a target statement is pinned to one fixed global parameter, replace it with a stronger claim "
     "parameterized over a range of that quantity before inducting, because shrinking the induction variable "
     "also shrinks the fixed parameter and the original claim cannot absorb that shift on its own.", "universal"),
    ("extremal_element_peeling_induction_reduction", "Extremal-Element Peeling for an Induction-Reduction Bound",
     "To reduce an n-object instance to an (n-1)-object instance inside an induction, remove the extremal object "
     "specifically -- its extremality licenses the quantitative shrink-bound that makes the smaller instance "
     "satisfy the induction hypothesis's precondition.", "common_technique"),
    ("shift_reconstruct_coverage_from_subinstance", "Reconstruct Coverage by Uniformly Shifting a Sub-Solution",
     "Given a family of solutions covering an interval for a reduced instance, produce a family covering a "
     "shifted interval for the full instance by uniformly re-adding the removed component to every member.",
     "common_technique"),
    ("mesh_reformulation_window_covering", "Recast a Window-Covering Claim as a Mesh Bound on a Derived Set",
     "Convert 'some element of a generated set lands in every length-c window of an interval' into 'the "
     "generated set's consecutive gaps are all <= c'.", "common_technique"),
    ("prefix_doubling_filtration", "Filtration by Prefix Doubling Recursion",
     "Build a nested family S_k = S_{k-1} union (x_k + S_{k-1}) by successively adding one more generator, "
     "turning an n-generator combinatorial question into an induction on the number of generators included so "
     "far.", "common_technique"),
    ("quadratic_bound_contradiction_fixed_extremal_value", "Contradiction via a Fixed Quadratic/Extremal-Value Bound",
     "Negate a needed linear inequality, sum it over a matching index range to obtain a bound on a symmetric "
     "quadratic expression, then contradict using that expression's known extremal value on the given range.",
     "specialized"),
]

# (action_type_id, name, category)
NEW_REASONING_ACTIONS = [
    ("strengthen_inductive_hypothesis", "Strengthen Inductive Hypothesis", "construction"),
]

PROBLEM = {
    "problem_id": "IMO-SL-2019-C2", "contest": "IMO Shortlist", "year": 2019, "round": "Shortlist",
    "problem_number": "C2", "source": "data/raw/imo/IMO2019SL.pdf, statement p.6, solutions p.31",
    "statement_text": ("You are given a set of n blocks, each weighing at least 1; their total weight is 2n. "
                       "Prove that for every real number r with 0<=r<=2n-2 you can choose a subset of the "
                       "blocks whose total weight is at least r but at most r+2."),
    "difficulty": None,
    "objects_text": "A finite set of n real-weighted blocks, each weight >=1, total weight exactly 2n; subsets of blocks and their total weights; a target real r in [0,2n-2].",
    "hidden_structure": "The set of all achievable subset-sums, viewed as a subset of [0,2n], has mesh (largest gap between consecutive achievable values) at most 2 -- a discrete covering fact forced purely by the >=1-per-block/2n-total constraint, independent of subset-generation order.",
    "expected_insight": "The >=1-per-block/2n-total pairing is exactly tight enough that some subset always lands within any length-2 window -- provable either by peeling the heaviest block and inductively re-covering (Solution 1), or by tracking the reachable-sum set's growth in sorted order and bounding the worst-case gap directly (Solution 2).",
    "problem_family": None, "problem_template": None,
}

PROBLEM_TOPIC_IDS = ["subset_sum_covering"]


def build(all_solutions, all_strategies, all_nodes, all_edges, all_proof_features,
          all_principle_instances, all_principle_dep_edges, solution_graph_data, sid):
    P = "IMO-SL-2019-C2"
    SOL1 = sid(P, "SOL1")
    SOL2 = sid(P, "SOL2")

    # -----------------------------------------------------------------
    # Solution 1
    # -----------------------------------------------------------------
    strategies_sol1 = [
        ("S0", 0, "Framing: state the problem.", True, False),
        ("S1", 1, "Strengthen the target into an inductively closable claim.", False, False),
        ("S2", 2, "Base case.", False, False),
        ("S3", 3, "Extremal reduction: peel the heaviest block and re-bound the remainder.", False, False),
        ("S4", 4, "Apply the induction hypothesis and reconstruct by shifting.", False, False),
        ("S5", 5, "Verify the two coverage ranges leave no gap.", False, False),
        ("S6", 6, "Assemble: close the induction, specialize.", False, True),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_sol1:
        all_strategies.append({
            "strategy_id": sid(SOL1, suf), "solution_id": SOL1, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    strat_of_sol1 = {
        "N1": "S0", "N2": "S0", "N3": "S1", "N4": "S2", "N5": "S3", "N6": "S3", "N7": "S3",
        "N8": "S4", "N9": "S4", "N10": "S5", "N11": "S5", "N12": "S5", "N13": "S6", "N14": "S6",
    }
    nodes_sol1 = [
        ("N1", "given", "n blocks, each weight >=1, total weight 2n", "critical", "p.31, problem statement"),
        ("N2", "goal", "for every r in [0,2n-2], some subset has total in [r,r+2]", "critical", "p.31"),
        ("N3", "construction", "strengthen to general Claim: for total s<=2n, holds for every r in [-2,s]", "critical", "p.31, \"We prove the following more general statement by induction on n\""),
        ("N4", "calculation", "base case n=1: single block x in [1,2]; empty set covers r in [-2,0], the block covers r in [x-2,x], union is [-2,x] since x<=2", "important", "p.31, \"The base case n=1 is trivial\""),
        ("N5", "construction", "let x = weight of the (an) heaviest block among the n", "critical", "p.31, \"let x be the largest block weight\""),
        ("N6", "inference", "x >= s/n (max >= mean)", "important", "p.31, \"Clearly, x>=s/n\""),
        ("N7", "calculation", "s-x <= (n-1)/n * s <= 2(n-1)", "critical", "p.31"),
        ("N8", "inference", "apply the induction hypothesis to the remaining n-1 blocks (total s-x<=2(n-1)): coverage holds for every r in [-2, s-x]", "critical", "p.31, \"we can apply the inductive hypothesis\""),
        ("N9", "construction", "add the excluded block x back onto each of those subsets: produces coverage for every r in [x-2, s]", "critical", "p.31, \"Adding the excluded block to each of those combinations\""),
        ("N10", "inference", "the two coverage ranges are [-2,s-x] (from N8) and [x-2,s] (from N9)", "important", "p.31"),
        ("N11", "calculation", "x-2 <= s-x, using x<=s-(n-1) (remaining blocks total >= n-1) and s<=2n", "critical", "p.31, \"we have x-2<=...<=s-x\""),
        ("N12", "conclusion", "the two ranges abut/overlap with no gap, so their union covers all of [-2,s] -- inductive step complete", "critical", "p.31"),
        ("N13", "conclusion", "Claim holds for all n>=1 by induction", "critical", "p.31"),
        ("N14", "conclusion", "specialize s=2n: since [0,2n-2] subset of [-2,2n], the original statement follows", "critical", "p.31"),
    ]
    node_ids_sol1 = []
    for i, (suf, ntype, stmt, imp, span) in enumerate(nodes_sol1):
        nid = sid(SOL1, suf)
        node_ids_sol1.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL1, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(SOL1, strat_of_sol1[suf]),
        })

    edges_sol1 = [
        ("N1", "N2", "motivates", "framing_setup"),
        ("N2", "N3", "derives", "strengthen_inductive_hypothesis"),
        ("N3", "N4", "supports", "direct_computation_verification"),
        ("N3", "N5", "supports", "extremal_choice"),
        ("N5", "N6", "derives", "invoke_given_definitional_property"),
        ("N6", "N7", "derives", "bounding"),
        ("N5", "N8", "requires", "induction"),
        ("N7", "N8", "requires", "invoke_prior_lemma_fact"),
        ("N8", "N9", "derives", "construct_auxiliary_object"),
        ("N5", "N9", "requires", "substitution"),
        ("N8", "N10", "supports", "structural_invariant_identification"),
        ("N9", "N10", "supports", "structural_invariant_identification"),
        ("N7", "N11", "requires", "invoke_prior_lemma_fact"),
        ("N1", "N11", "requires", "invoke_given_definitional_property"),
        ("N10", "N12", "derives", "covering_case_union"),
        ("N11", "N12", "requires", "boundary_equality_identification"),
        ("N4", "N13", "supports", "merge_cases"),
        ("N12", "N13", "derives", "merge_cases"),
        ("N13", "N14", "derives", "substitution"),
    ]
    edge_tuples_sol1 = []
    for i, (fr, to, rel, act) in enumerate(edges_sol1):
        pn, cn = sid(SOL1, fr), sid(SOL1, to)
        edge_tuples_sol1.append((pn, cn))
        all_edges.append({
            "edge_id": f"{SOL1}-E{i+1}", "solution_id": SOL1, "parent_node_id": pn, "child_node_id": cn,
            "relation": rel, "action_type_id": act,
        })
    solution_graph_data[SOL1] = (node_ids_sol1, edge_tuples_sol1)

    all_solutions.append({
        "solution_id": SOL1, "problem_id": P, "label": "Official Solution 1", "is_primary": True,
        "is_complete": True, "replaces_solution_id": None, "replaces_span_note": None,
        "construction_type": "strengthened induction on block count, extremal-peel + shift reconstruction",
        "source_reference": "pdf:IMO2019SL.pdf; page 31; heading: Solution 1.",
    })

    # -----------------------------------------------------------------
    # Solution 2 (fully independent alternate -- not a modular swap of Solution 1)
    # NOTE: the source report's node table + mermaid for Solution 2 gives 16 nodes but
    # only 16 edges are drawn in its mermaid diagram, while the report's own stated total
    # is "16 nodes, 17 edges". The 17th edge is not spelled out in the report text; the
    # most defensible candidate given the node semantics is M3->M16 (the mesh/covering
    # equivalence established in M3 is exactly what M16 invokes to translate "mesh<=2"
    # back into the original covering claim). Added here as a best-effort reconstruction
    # to match the report's stated count -- flagged, not silently guessed.
    # -----------------------------------------------------------------
    strategies_sol2 = [
        ("T0", 0, "Framing: state the problem.", True, False),
        ("T1", 1, "Reformulate as a mesh bound on the achievable-sum set.", False, False),
        ("T2", 2, "Define a nested prefix filtration.", False, False),
        ("T3", 3, "Base case.", False, False),
        ("T4", 4, "Reduce the inductive step to one needed inequality via the doubling recursion.", False, False),
        ("T5", 5, "Close the inequality by contradiction.", False, False),
        ("T6", 6, "Assemble.", False, True),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_sol2:
        all_strategies.append({
            "strategy_id": sid(SOL2, suf), "solution_id": SOL2, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    strat_of_sol2 = {
        "M1": "T0", "M2": "T0", "M3": "T1", "M4": "T2", "M5": "T3", "M6": "T3",
        "M7": "T4", "M8": "T4", "M9": "T5", "M10": "T5", "M11": "T5", "M12": "T5", "M13": "T5", "M14": "T5",
        "M15": "T6", "M16": "T6",
    }
    nodes_sol2 = [
        ("M1", "given", "weights x_1<=...<=x_n (sorted), total 2n", "critical", "p.31, \"Let x_1,...,x_n be the weights... in weakly increasing order\""),
        ("M2", "goal", "show mesh of S (largest gap between consecutive achievable subset-sums) is <=2", "critical", "p.31, \"We want to prove that the mesh of S... is at most 2\""),
        ("M3", "observation", "reformulation: mesh(S)<=2, together with 0,2n in S, is equivalent to the original covering claim", "important", "p.31 (implicit reformulation)"),
        ("M4", "construction", "define S_k = achievable sums using only the first k (sorted) blocks, k=0,...,n", "critical", "p.31, \"let S_k denote the set of sums...\""),
        ("M5", "goal", "prove by induction on k: mesh(S_k)<=2", "critical", "p.31"),
        ("M6", "calculation", "base case k=0: S_0={0}, mesh trivially <=2", "supporting", "p.31, \"The base case k=0 is trivial\""),
        ("M7", "observation", "recursive structure: S_k = S_{k-1} union (x_k + S_{k-1})", "critical", "p.31"),
        ("M8", "inference", "suffices to show x_k <= sum_{j<k} x_j + 2", "important", "p.31, \"it suffices to prove that x_k<=sum_{j<k}x_j+2\""),
        ("M9", "construction", "(contradiction) suppose instead x_k > sum_{j<k} x_j + 2", "important", "p.31, \"if this were not the case\""),
        ("M10", "inference", "since sorted increasing, x_l > sum_{j<k}x_j+2 >= k+1 for all l>=k", "important", "p.31"),
        ("M11", "calculation", "summing: 2n = sum x_j > (n+1-k)(k+1)+(k-1)", "critical", "p.31"),
        ("M12", "calculation", "rearranges to n > k(n+1-k)", "critical", "p.31, \"This rearranges to...\""),
        ("M13", "inference", "false for every 1<=k<=n (the quadratic k(n+1-k) has minimum value exactly n at the endpoints k=1,n)", "critical", "p.31, \"which is false for 1<=k<=n\""),
        ("M14", "conclusion", "contradiction -- the supposition in M9 is impossible, so x_k<=sum_{j<k}x_j+2", "critical", "p.31"),
        ("M15", "conclusion", "mesh(S_k)<=2 for all k; in particular mesh(S_n)=mesh(S)<=2", "critical", "p.31 (induction closure)"),
        ("M16", "conclusion", "combined with 0,2n in S: every r in [0,2n-2] has a subset sum in [r,r+2] -- QED", "critical", "p.31"),
    ]
    node_ids_sol2 = []
    for i, (suf, ntype, stmt, imp, span) in enumerate(nodes_sol2):
        nid = sid(SOL2, suf)
        node_ids_sol2.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL2, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(SOL2, strat_of_sol2[suf]),
        })

    edges_sol2 = [
        ("M1", "M2", "motivates", "framing_setup"),
        ("M2", "M3", "derives", "structural_invariant_identification"),
        ("M3", "M4", "motivates", "define_object"),
        ("M4", "M5", "motivates", "induction"),
        ("M5", "M6", "supports", "direct_computation_verification"),
        ("M5", "M7", "supports", "structural_invariant_identification"),
        ("M7", "M8", "derives", "algebraic_simplification"),
        ("M8", "M9", "requires", "contradiction"),
        ("M9", "M10", "derives", "invoke_given_definitional_property"),
        ("M10", "M11", "derives", "inequality_chaining"),
        ("M11", "M12", "derives", "algebraic_simplification"),
        ("M12", "M13", "derives", "bounding"),
        ("M13", "M14", "derives", "contradiction"),
        ("M6", "M15", "supports", "merge_cases"),
        ("M14", "M15", "derives", "merge_cases"),
        ("M15", "M16", "derives", "conclude"),
        ("M3", "M16", "requires", "invoke_prior_lemma_fact"),
    ]
    edge_tuples_sol2 = []
    for i, (fr, to, rel, act) in enumerate(edges_sol2):
        pn, cn = sid(SOL2, fr), sid(SOL2, to)
        edge_tuples_sol2.append((pn, cn))
        all_edges.append({
            "edge_id": f"{SOL2}-E{i+1}", "solution_id": SOL2, "parent_node_id": pn, "child_node_id": cn,
            "relation": rel, "action_type_id": act,
        })
    solution_graph_data[SOL2] = (node_ids_sol2, edge_tuples_sol2)

    all_solutions.append({
        "solution_id": SOL2, "problem_id": P, "label": "Official Solution 2", "is_primary": False,
        "is_complete": True, "replaces_solution_id": None, "replaces_span_note": None,
        "construction_type": "induction on sorted-prefix count via doubling filtration + contradiction",
        "source_reference": "pdf:IMO2019SL.pdf; page 31; heading: Solution 2.",
    })

    all_proof_features += [
        {"solution_id": SOL1, "feature_type_id": f} for f in ("recursive", "extremal", "construction")
    ] + [
        {"solution_id": SOL2, "feature_type_id": f} for f in ("recursive", "contradiction", "construction")
    ]

    # -----------------------------------------------------------------
    # Principle instances
    # -----------------------------------------------------------------
    pi_sol1 = [
        ("inductive_hypothesis_strengthening", "S1", False, "solution_specific", "high",
         "Solution 2 proves the identical theorem without ever strengthening a statement or inducting on n; it inducts on a different index (k) over a structurally different object (the achievable-sum set)."),
        ("extremal_element_peeling_induction_reduction", "S3", False, "solution_specific", "high",
         "Solution 2 never removes any block or invokes an extremal element in this reduction sense; it adds blocks one at a time in sorted order, the opposite direction."),
        ("shift_reconstruct_coverage_from_subinstance", "S4", False, "solution_specific", "high",
         "Solution 2 has no analogous shift step; its induction directly reasons about the doubling recursion S_k=S_{k-1} union (x_k+S_{k-1}), a different mechanism entirely."),
        ("covering_partition_argument", "S5", False, "mixed", "high",
         "The underlying fact -- the achievable-sum set has no gap wider than 2 -- is problem-intrinsic: Solution 2 independently proves the exact same fact by a completely different mechanism (contradiction on sorted prefix sums, no interval-union check anywhere). The specific mechanism here -- two shifted coverage ranges built from an induction step, checked to abut -- is Solution-1-specific."),
    ]
    for ptid, strat, cc, intr, conf, just in pi_sol1:
        all_principle_instances.append({
            "instance_id": f"{SOL1}-PI-{ptid}", "solution_id": SOL1, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL1, strat) if strat else None, "is_cross_cutting": cc,
            "is_problem_intrinsic": intr, "intrinsic_confidence": conf, "justification_text": just,
        })

    pi_sol2 = [
        ("mesh_reformulation_window_covering", "T1", False, "solution_specific", "high",
         "Solution 1 never forms this derived set or reasons about its mesh; it argues directly about subset existence."),
        ("prefix_doubling_filtration", "T2", False, "solution_specific", "high",
         "Solution 1 has no filtration or per-block induction; it inducts on total block count n directly with extremal peeling, a different index and different reduction."),
        ("quadratic_bound_contradiction_fixed_extremal_value", "T5", False, "solution_specific", "high",
         "Tightly tied to this exact counting setup (sorted weights, fixed total); Solution 1 never forms or bounds this quadratic expression."),
    ]
    for ptid, strat, cc, intr, conf, just in pi_sol2:
        all_principle_instances.append({
            "instance_id": f"{SOL2}-PI-{ptid}", "solution_id": SOL2, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL2, strat) if strat else None, "is_cross_cutting": cc,
            "is_problem_intrinsic": intr, "intrinsic_confidence": conf, "justification_text": just,
        })

    # -----------------------------------------------------------------
    # Principle dependency graphs (both simple linear chains, per report)
    # -----------------------------------------------------------------
    dep_edges_sol1 = [
        ("inductive_hypothesis_strengthening", "extremal_element_peeling_induction_reduction", "enables",
         "P2's induction (peeling a block, applying IH) only makes sense against the generalized claim P1 introduces -- the original fixed-total statement doesn't support an IH at all."),
        ("extremal_element_peeling_induction_reduction", "shift_reconstruct_coverage_from_subinstance", "requires",
         "P3's shift-reconstruction (N9) operates on exactly the sub-instance and excluded block P2 produced (N5, N7)."),
        ("shift_reconstruct_coverage_from_subinstance", "covering_partition_argument", "requires",
         "P4's covering check (N12) directly consumes the two ranges P3 (via N8's IH-application) and P3's own shift (N9) produced."),
    ]
    for i, (src, tgt, rel, just) in enumerate(dep_edges_sol1):
        all_principle_dep_edges.append({
            "edge_id": f"{SOL1}-PDE-{i+1}",
            "source_instance_id": f"{SOL1}-PI-{src}", "target_instance_id": f"{SOL1}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })

    dep_edges_sol2 = [
        ("mesh_reformulation_window_covering", "prefix_doubling_filtration", "motivates",
         "The mesh reformulation (Q1) suggests building the object whose mesh will be tracked (Q2), but Q2's filtration could in principle be defined without ever naming mesh -- not a logical necessity."),
        ("prefix_doubling_filtration", "quadratic_bound_contradiction_fixed_extremal_value", "requires",
         "Q3's contradiction argument (M9-M14) operates directly on the recursive structure Q2 established (M7) -- nothing to negate/bound before Q2 exists."),
    ]
    for i, (src, tgt, rel, just) in enumerate(dep_edges_sol2):
        all_principle_dep_edges.append({
            "edge_id": f"{SOL2}-PDE-{i+1}",
            "source_instance_id": f"{SOL2}-PI-{src}", "target_instance_id": f"{SOL2}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })
