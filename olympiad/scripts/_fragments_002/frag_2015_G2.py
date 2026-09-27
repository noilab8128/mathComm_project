"""
Data fragment for IMO-SL-2015-G2, to be merged into scripts/load_dna_seed_v1.py.
Transcribed from reports/IMO-SL-2015-G2_validation_report.md. Pure data + a build()
function -- no DB calls here.
"""

NEW_TOPICS = [
    {"topic_id": "circle_configurations", "name": "Circle Configurations", "area": "geometry",
     "description": "Multi-circle configurations (radical axes, common chords, re-intersecting "
                     "circumcircles) and the symmetry/angle-chase arguments they support."},
]

NEW_PRINCIPLE_TYPES = [
    ("equal_chord_symmetry_axis_two_centers", "Equal-Chord Symmetry Axis via Two Independent Centers",
     "If two circles centered at distinct points A,O both pass through the same two points F,G, then A,O "
     "both lie on the perpendicular bisector of FG, so line AO is that perpendicular bisector -- the axis "
     "of the involution swapping F<->G.", "common_technique"),
    ("symmetry_reduction_collinearity_to_angle_equality", "Symmetry-Reduction of a Collinearity Claim to a Single Angle Equality",
     "Given two objects already known to be mirror images about a fixed axis, a claim about their "
     "intersection point lying on that axis reduces to proving the objects are mirror images -- for two "
     "lines, to one angle equality with the axis.", "common_technique"),
    ("four_circle_inscribed_angle_substitution_chain", "Four-Circle Inscribed-Angle Substitution Chain",
     "Chase a target angle through a sequence of concyclic-point substitutions across several circles "
     "sharing configuration-defined points, converting it into an expression in the base triangle's "
     "primitive angles.", "common_technique"),
    ("bilateral_configuration_symmetry", "Bilateral (B<->C) Configuration Symmetry",
     "If a configuration admits an involutive symmetry swapping labeled objects pairwise, a claim about "
     "one object translates verbatim into the mirrored claim about its image under that symmetry.", "universal"),
]

NEW_REASONING_ACTIONS = [
    ("goal_reduction_via_symmetry", "Goal Reduction via Symmetry", "structural"),
]

PROBLEM = {
    "problem_id": "IMO-SL-2015-G2", "contest": "IMO Shortlist", "year": 2015, "round": "Shortlist",
    "problem_number": "G2", "source": "data/raw/imo/IMO2015SL.pdf, pp. 44-45",
    "statement_text": (
        "Let ABC be a triangle inscribed into a circle Omega with center O. A circle Gamma with center A "
        "meets the side BC at points D and E such that D lies between B and E. Moreover, let F and G be "
        "the common points of Gamma and Omega. We assume that F lies on the arc AB of Omega not "
        "containing C, and G lies on the arc AC of Omega not containing B. The circumcircles of the "
        "triangles BDF and CEG meet the sides AB and AC again at K and L, respectively. Suppose that the "
        "lines FK and GL are distinct and intersect at X. Prove that the points A, X, and O are collinear."
    ),
    "difficulty": None,
    "objects_text": ("Triangle ABC inscribed in Omega (center O); circle Gamma centered at A meeting BC at "
                      "D,E; F,G = common points of Gamma,Omega; circumcircles omega_B=(BDF), omega_C=(CEG) "
                      "re-meeting AB,AC at K,L; X = FK cap GL."),
    "hidden_structure": ("AF=AG (both radii of Gamma) and OF=OG (both radii of Omega) force A and O to both "
                          "lie on the perpendicular bisector of FG -- so line AO is already, before any "
                          "angle-chasing, the axis of an involutive symmetry of the whole configuration "
                          "(B<->C, D<->E, K<->L, omega_B<->omega_C). The collinearity claim is a disguised "
                          "statement that this symmetry maps line FK to line GL."),
    "expected_insight": ("Spot the free symmetry axis before touching any angle chase -- it converts 'prove "
                          "3 points collinear' into 'prove one angle equality', at which point the problem "
                          "is routine (if intricate) inscribed-angle chasing across four circles."),
    "problem_family": None, "problem_template": None,
}

PROBLEM_TOPIC_IDS = ["circle_configurations"]


def build(all_solutions, all_strategies, all_nodes, all_edges, all_proof_features,
          all_principle_instances, all_principle_dep_edges, solution_graph_data, sid):
    P = "IMO-SL-2015-G2"
    SOL1 = sid(P, "SOL1")
    SOL2 = sid(P, "SOL2")

    # -----------------------------------------------------------------
    # Solution 1 (primary)
    # -----------------------------------------------------------------
    strategies_sol1 = [
        ("S0", 0, "Framing: state the full configuration and the collinearity target.", True, False),
        ("S1", 1, "Establish AO as the symmetry axis via two independent equal-radii facts.", False, False),
        ("S2", 2, "Reduce the collinearity claim to a single angle equality (1).", False, False),
        ("S3", 3, "Prove (1), B-side: chase angle KFA via omega_B, Gamma, Omega.", False, False),
        ("S4", 4, "Prove (1), C-side: chase the same target value via omega_C, Omega.", False, False),
        ("S5", 5, "Assemble: combine (1) with the axis fact to close the proof.", False, True),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_sol1:
        all_strategies.append({
            "strategy_id": sid(SOL1, suf), "solution_id": SOL1, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    nodes_sol1 = [
        ("N1", "given", "Full configuration: ABC,Omega,O,Gamma,D,E,F,G,omega_B,omega_C,K,L,X.", "critical",
         "p.44, problem statement", "S0"),
        ("GOAL", "goal", "Prove A,X,O collinear.", "critical", "p.44", "S0"),
        ("N2", "observation", "AF=AG (both radii of Gamma).", "critical",
         "p.44, implicit: F,G in Gamma centered at A", "S1"),
        ("N3", "observation", "OF=OG (both radii of Omega, since F,G in Omega).", "critical",
         "p.44, implicit: F,G in Omega by construction", "S1"),
        ("N4", "inference", "A and O both lie on the perpendicular bisector of FG.", "critical",
         "derived from N2, N3", "S1"),
        ("N5", "inference", "Line AO is the perpendicular bisector of FG, the axis of isosceles triangle AFG; "
                             "AF,AG are symmetric about it.", "critical",
         "p.44, 'the segments AF and AG ... are clearly symmetric with respect to AO'", "S1"),
        ("N6", "inference", "It suffices to prove lines FK and GL are symmetric about AO -- then X=FK cap GL "
                             "lies on the mirror axis automatically.", "critical",
         "p.44, 'It suffices to prove that the lines FK and GL are symmetric about AO'", "S2"),
        ("N7", "inference", "Given N5, this reduces to one angle equality: angle KFA = angle AGL -- (1).", "critical",
         "p.44, 'Hence it is enough to show angle KFA = angle AGL (1)'", "S2"),
        ("N8", "calculation", "Via omega_B,Gamma,Omega: angle KFA = angle DFG+angle GFA-angle DFK = "
                               "angle CEG+angle GBA-angle DBK = angle CEG-angle CBG.", "important",
         "p.44, displayed equation chain", "S3"),
        ("N9", "calculation", "Via omega_C,Omega: angle CEG-angle CBG = angle CLG-angle CAG = angle AGL.", "important",
         "p.44, 'Due to the circles omega_C and Omega...'", "S4"),
        ("N10", "conclusion", "Combining N8, N9: angle KFA = angle AGL -- (1) proved.", "critical",
         "p.44, 'Thereby the problem is solved'", "S5"),
        ("N11", "conclusion", "By N5 (axis) + N10 (angle equality): lines FK, GL are reflections of each "
                               "other about AO.", "critical",
         "implicit closing of the reduction opened at N6", "S5"),
        ("N12", "conclusion", "Reflected lines meet on the mirror axis => X in AO => A,X,O collinear.", "critical",
         "implicit -- the statement being proved", "S5"),
    ]
    node_ids_sol1 = []
    for nid_suf, ntype, stmt, imp, span, strat in nodes_sol1:
        nid = sid(SOL1, nid_suf)
        node_ids_sol1.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL1, "sequence_index": len(node_ids_sol1) - 1,
            "node_type": ntype, "statement_text": stmt, "purpose": None, "importance": imp,
            "source_span": span, "strategy_id": sid(SOL1, strat) if strat else None,
        })

    edges_sol1 = [
        ("N1", "GOAL", "motivates", "framing_setup"),
        ("GOAL", "N2", "requires", "invoke_given_definitional_property"),
        ("GOAL", "N3", "requires", "invoke_given_definitional_property"),
        ("N2", "N4", "derives", "structural_invariant_identification"),
        ("N3", "N4", "derives", "structural_invariant_identification"),
        ("N4", "N5", "derives", "structural_invariant_identification"),
        ("N5", "N6", "derives", "goal_reduction_via_symmetry"),
        ("N6", "N7", "derives", "goal_reduction_via_symmetry"),
        ("N7", "N8", "requires", "invoke_given_definitional_property"),
        ("N7", "N9", "requires", "invoke_given_definitional_property"),
        ("N8", "N10", "resolves", "merge_cases"),
        ("N9", "N10", "resolves", "merge_cases"),
        ("N5", "N11", "resolves", "merge_cases"),
        ("N10", "N11", "resolves", "merge_cases"),
        ("N11", "N12", "derives", "conclude"),
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
        "construction_type": "symmetry-axis identification + reduction to one angle equality, closed by "
                              "a four-circle inscribed-angle chase",
        "source_reference": "pdf:IMO2015SL.pdf; printed_pages:44-45; heading:Solution 1.",
    })

    # -----------------------------------------------------------------
    # Solution 2 (alternate; is_complete=False -- reuses Solution 1's N2-N7
    # reduction by explicit citation ('Again, we reduce our task to proving
    # (1)'), replaces only the proof of (1), and Comment 3 (p.45) further
    # notes the original proposal asked for concurrency, not just
    # collinearity -- provenance detail, not modeled as a graph node here.)
    # -----------------------------------------------------------------
    strategies_sol2 = [
        ("T1", 0, "Prove angle equality (1) via a named-angle isosceles-triangle computation on the B-side, "
                   "then invoke Bilateral B<->C Symmetry (P4) directly to get the C-side for free instead of "
                   "re-deriving it.", False, False),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies_sol2:
        all_strategies.append({
            "strategy_id": sid(SOL2, suf), "solution_id": SOL2, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    nodes_sol2 = [
        ("M1", "definition", "Define alpha=angle BAC, phi=angle ABF, psi=angle EDA=angle AED.", "important", "p.45"),
        ("M2", "inference", "AF=AG => phi=angle GCA (both angles 'respect the symmetry between B,C').",
         "important", "p.45"),
        ("M3", "calculation", "2*angle KFA = 2*(angle DFA - angle DFK).", "important", "p.45"),
        ("M4", "calculation", "angle DFA=angle ADF=angle EDF-psi=angle BFD+angle EBF-psi (triangle AFD "
                               "isosceles: AF=AD, both radii of Gamma).", "important", "p.45"),
        ("M5", "calculation", "Via omega_B: angle DFK=angle CBA.", "important", "p.45"),
        ("M6", "calculation", "Combine M3-M5: 2*angle KFA = angle BFA+phi-psi-angle CBA.", "important", "p.45"),
        ("M7", "calculation", "AFBC cyclic (on Omega) => 2*angle KFA = alpha+phi-psi.", "critical", "p.45"),
        ("M8", "inference", "By P4 (explicit invocation), symmetrically: 2*angle AGL = alpha+phi-psi.",
         "critical", "p.45, \"due to the 'symmetry' between B and C alluded to above\""),
        ("M9", "conclusion", "Combine M7, M8: angle KFA = angle AGL, i.e. (1).", "critical", "p.45"),
    ]
    node_ids_sol2 = []
    for nid_suf, ntype, stmt, imp, span in nodes_sol2:
        nid = sid(SOL2, nid_suf)
        node_ids_sol2.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL2, "sequence_index": len(node_ids_sol2) - 1,
            "node_type": ntype, "statement_text": stmt, "purpose": None, "importance": imp,
            "source_span": span, "strategy_id": sid(SOL2, "T1"),
        })

    edges_sol2 = [
        ("M1", "M2", "derives", "algebraic_simplification"),
        ("M1", "M3", "derives", "algebraic_simplification"),
        ("M1", "M4", "derives", "algebraic_simplification"),
        ("M3", "M6", "resolves", "merge_cases"),
        ("M4", "M6", "resolves", "merge_cases"),
        ("M5", "M6", "resolves", "merge_cases"),
        ("M6", "M7", "derives", "invoke_given_definitional_property"),
        ("M7", "M8", "motivates", "symmetry_wlog"),
        ("M7", "M9", "resolves", "merge_cases"),
        ("M8", "M9", "resolves", "merge_cases"),
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
        "solution_id": SOL2, "problem_id": P, "label": "Official Solution 2 (alternate proof of (1))",
        "is_primary": False, "is_complete": False, "replaces_solution_id": SOL1,
        "replaces_span_note": "Replaces only the proof of (1) (N8-N10 of Solution 1's graph); reuses "
                               "Solution 1's axis reduction (N2-N7) and closing argument (N11-N12) by "
                               "explicit textual reference ('Again, we reduce our task to proving (1)').",
        "construction_type": "named-angle isosceles-triangle computation + explicit symmetry shortcut for "
                              "the second half",
        "source_reference": "pdf:IMO2015SL.pdf; printed_page:45; heading:Solution 2.",
    })

    all_proof_features += [
        {"solution_id": SOL1, "feature_type_id": f} for f in ("direct", "symmetric")
    ] + [
        {"solution_id": SOL2, "feature_type_id": f} for f in ("direct", "symmetric")
    ]

    # -----------------------------------------------------------------
    # Principle instances
    # -----------------------------------------------------------------
    pi_sol1 = [
        ("equal_chord_symmetry_axis_two_centers", "S1", False, "mixed", "high",
         "The raw fact AF=AG, OF=OG is problem-intrinsic -- true of this configuration under any proof "
         "method. But promoting it to the organizing device of the whole proof (naming AO as 'the axis') "
         "is a solution-specific architectural choice; classified mixed, high confidence."),
        ("symmetry_reduction_collinearity_to_angle_equality", "S2", False, "solution_specific", "high",
         "A coordinate proof solves for X directly and checks collinearity numerically/algebraically -- it "
         "never needs this reduction."),
        ("four_circle_inscribed_angle_substitution_chain", "S3", False, "solution_specific", "high",
         "Confirmed by direct evidence: Solution 2 proves the same lemma (1) via a genuinely different "
         "technique (named angles + isosceles exterior-angle relation, not this substitution chain). "
         "Also covers S4 (the C-side chase uses the identical technique)."),
        ("bilateral_configuration_symmetry", None, True, "intrinsic", "high",
         "The B<->C symmetry is a structural fact about the problem's own hypotheses, true regardless of "
         "proof method. Cross-cutting: Solution 1 never invokes it as a shortcut (re-derives the C-side "
         "from scratch by the same method as the B-side), so here it motivates S4 rather than being "
         "load-bearing."),
    ]
    for ptid, strat, cc, intr, conf, just in pi_sol1:
        all_principle_instances.append({
            "instance_id": f"{SOL1}-PI-{ptid}", "solution_id": SOL1, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL1, strat) if strat else None, "is_cross_cutting": cc,
            "is_problem_intrinsic": intr, "intrinsic_confidence": conf, "justification_text": just,
        })

    all_principle_instances.append({
        "instance_id": f"{SOL2}-PI-bilateral_configuration_symmetry", "solution_id": SOL2,
        "principle_type_id": "bilateral_configuration_symmetry", "primary_strategy_id": sid(SOL2, "T1"),
        "is_cross_cutting": False, "is_problem_intrinsic": "intrinsic", "intrinsic_confidence": "high",
        "justification_text": "Solution 2 explicitly invokes this principle at M8 ('due to the symmetry "
                               "between B and C alluded to above') to skip re-deriving its S4-analogue "
                               "entirely -- here the principle is load-bearing, not just suggestive, unlike "
                               "its motivates-only role in Solution 1. Note: the technique this bypasses "
                               "(an S4-analogue of the B-side named-angle computation M1-M7) is never "
                               "actually built in Solution 2's own graph -- deliberately not modeled as a "
                               "principle_dependency_edge to a nonexistent instance; flagged as a real "
                               "schema-fit limitation, not silently forced.",
    })

    # -----------------------------------------------------------------
    # Principle dependency edges (Solution 1 only -- see justification_text
    # above for why the Solution-2-specific P4-requires-P3 finding from the
    # report is not modeled as an edge here: its target would be a P3
    # instance that does not exist in Solution 2's own graph.)
    # -----------------------------------------------------------------
    dep_edges = [
        ("equal_chord_symmetry_axis_two_centers", "symmetry_reduction_collinearity_to_angle_equality",
         "requires",
         "P2's reduction ('suffices to show symmetric') is only meaningful once P1 has established which "
         "line is the axis to test symmetry about."),
        ("bilateral_configuration_symmetry", "four_circle_inscribed_angle_substitution_chain", "motivates",
         "In Solution 1, S4 (N9) is derived independently by the same method as S3, not by invoking P4 as "
         "a shortcut -- Solution 1 never writes 'by symmetry' for this step."),
    ]
    for i, (src, tgt, rel, just) in enumerate(dep_edges):
        all_principle_dep_edges.append({
            "edge_id": f"{P}-PDE-{i+1}",
            "source_instance_id": f"{SOL1}-PI-{src}", "target_instance_id": f"{SOL1}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })
