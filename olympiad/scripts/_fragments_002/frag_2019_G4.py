"""
Data fragment for IMO-SL-2019-G4, transcribed from
reports/IMO-SL-2019-G4_validation_report.md, for merging into
scripts/load_dna_seed_v1.py.

Only Solution 1 (of 3 official solutions) is graphed -- the report itself
scoped Solutions 2/3 as "out of scope for this test round" (brief mention
only, no node-level detail available to transcribe).

Note: the report's own stated edge_count (22) undercounts its own mermaid
diagram, which lists 27 distinct edges. Transcribed here from the mermaid
diagram (the more complete/concrete source); the true node/edge counts are
computed automatically by compute_graph_stats() in the loader, not hand-entered,
so this discrepancy self-corrects on load.
"""

NEW_TOPICS = [
    {"topic_id": "circle_configurations", "name": "Circle Configurations", "area": "geometry",
     "description": "Synthetic facts about points, chords, and rays relative to a fixed circle (e.g. inside/outside tests, cyclic similarity, power of a point)."},
]

NEW_PRINCIPLE_TYPES = [
    ("pigeonhole_averaging_fixed_total_partition", "Pigeonhole Averaging over a Fixed-Total Partition",
     "If two collections of paired quantities have equal totals, not every pair can have the first strictly below the second -- at least one pair has first >= second.",
     "common_technique"),
    ("interior_point_angle_domination", "Interior-Point Angle Domination",
     "For P strictly inside triangle ABC, angle BPC exceeds angle BAC, via two applications of the exterior-angle-exceeds-remote-interior-angle theorem through the cevian foot.",
     "common_technique"),
    ("sine_symmetry_unimodality_half_pi", "Sine Symmetry/Unimodality about pi/2",
     "sin(theta) = sin(pi - theta) and sin is decreasing on (pi/2, pi), so any angle known to be >= max(phi, pi - phi) has sine <= sin(phi).",
     "common_technique"),
    ("chord_ray_inside_outside_correspondence", "Chord-Ray Inside/Outside Correspondence",
     "For a ray from P meeting a circle again at Y, a point X on that ray lies strictly inside/on/outside the circle iff PX is less than/equal to/greater than PY.",
     "common_technique"),
    ("cyclic_similarity_to_sine_ratio", "Cyclic-Similarity-to-Sine-Ratio Computation",
     "An inscribed-angle similar-triangle pair produced by a concyclic configuration converts a length ratio into a ratio of sines of named angles via the Law of Sines.",
     "common_technique"),
    ("product_pigeonhole", "Product Pigeonhole",
     "For positive reals a,b with a*b >= 1, at least one of a,b is >= 1 -- the multiplicative dual of additive-pigeonhole-on-a-fixed-total.",
     "universal"),
]

NEW_REASONING_ACTIONS = []  # all actions used here already exist in the 27-entry vocabulary

PROBLEM = {
    "problem_id": "IMO-SL-2019-G4", "contest": "IMO Shortlist", "year": 2019, "round": "Shortlist",
    "problem_number": "G4", "source": "data/raw/imo/IMO2019SL.pdf, p. 8 (statement), pp. 60-62 (solutions)",
    "statement_text": ("Let P be a point inside triangle ABC. Let AP meet BC at A1, let BP meet CA at B1, "
                       "and let CP meet AB at C1. Let A2 be the point such that A1 is the midpoint of PA2, "
                       "let B2 be the point such that B1 is the midpoint of PB2, and let C2 be the point such "
                       "that C1 is the midpoint of PC2. Prove that points A2, B2, and C2 cannot all lie "
                       "strictly inside the circumcircle of triangle ABC."),
    "difficulty": None,
    "objects_text": "Triangle ABC; interior point P; cevians AP,BP,CP meeting opposite sides at A1,B1,C1; doubled points A2,B2,C2 defined by A1,B1,C1 as midpoints of PA2,PB2,PC2; circumcircle Omega of ABC.",
    "hidden_structure": "Whether a doubled cevian point lies inside/outside the circumcircle reduces, via a ray-chord correspondence, to a pure length comparison PX vs PY along the same ray -- independently rediscovered by all three official solutions in different guises (synthetic ray argument, isogonal/angle-bisector argument, and algebraically via vector norms against a unit circumradius).",
    "expected_insight": "An interior-point angle-sum pigeonhole forces one cevian angle to dominate its opposite triangle angle in sine; translating the doubled-point membership question into a length-ratio product via cyclic similarity makes that sine bound directly close the proof.",
    "problem_family": None, "problem_template": None,
}

PROBLEM_TOPIC_IDS = ["circle_configurations"]


def build(all_solutions, all_strategies, all_nodes, all_edges, all_proof_features,
          all_principle_instances, all_principle_dep_edges, solution_graph_data, sid):
    P = "IMO-SL-2019-G4"
    SOL1 = sid(P, "SOL1")

    strategies = [
        ("S0", 0, "Fix the doubled-cevian construction and state the goal.", True, False),
        ("S1", 1, "Force a branch via angle-sum pigeonhole around P.", False, False),
        ("S2", 2, "Sharpen to a sine bound via a standard interior-point lemma.", False, False),
        ("S3", 3, "Reduce 'inside the circle' to a length-ratio comparison.", False, False),
        ("S4", 4, "Compute both ratios via cyclic similarity + Law of Sines.", False, False),
        ("S5", 5, "Assemble: multiply the ratios and pigeonhole on the product.", False, False),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies:
        all_strategies.append({
            "strategy_id": sid(SOL1, suf), "solution_id": SOL1, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    nodes = [
        ("G1", "given", "P strictly inside triangle ABC; cevians AP,BP,CP meet BC,CA,AB at A1,B1,C1.", "critical", "p.60, problem statement", "S0"),
        ("G2", "construction", "A2,B2,C2 defined by A1,B1,C1 = midpoints of PA2,PB2,PC2 (equivalently PA2=2*PA1, etc.)", "critical", "p.60, problem statement", "S0"),
        ("GOAL", "goal", "Prove A2,B2,C2 cannot all lie strictly inside circumcircle Omega.", "critical", "p.60", "S0"),
        ("N1", "observation", "Rays PA,PB,PC partition the full angle at interior point P: angle(APB)+angle(BPC)+angle(CPA)=2pi.", "important", "p.60", "S1"),
        ("N2", "calculation", "Triangle angle-sum gives (pi-C)+(pi-A)+(pi-B)=2pi.", "important", "p.60", "S1"),
        ("N3", "inference", "Since both triples sum to 2pi, at least one of angle(APB)>=pi-C, angle(BPC)>=pi-A, angle(CPA)>=pi-B holds.", "critical", "p.60, 'at least one of the following inequalities holds'", "S1"),
        ("N4", "case_split", "WLOG angle(BPC)>=pi-angle(BAC).", "important", "p.60", "S1"),
        ("N5", "lemma", "Standard lemma: P strictly inside triangle ABC implies angle(BPC)>angle(BAC), via two applications of the exterior-angle theorem through cevian foot A1.", "important", "p.60, 'angle BPC>angle BAC because P is inside triangle ABC'", "S2"),
        ("N6", "inference", "Combine N4,N5: angle(BPC)>=max(angle(BAC), pi-angle(BAC)).", "important", "p.60 (implicit)", "S2"),
        ("N7", "lemma", "sin is symmetric about pi/2 on (0,pi), so angle(BPC)>=max(...) implies sin(angle BPC)<=sin(angle BAC) -- call this (*).", "critical", "p.60, '(*)'", "S2"),
        ("N8", "construction", "Extend rays AP,BP,CP to meet Omega again at A3,B3,C3.", "critical", "p.60", "S3"),
        ("N9", "observation", "B1 lies strictly between P and B3 on the ray (likewise C1 between P,C3), since B1 is a cevian foot inside the triangle, hence inside the chord.", "important", "p.60, figure", "S3"),
        ("N10", "reformulation", "PB2=2*PB1 (from G2), so PB1>=B1B3 implies PB2>=PB3, i.e. B2 lies on/outside Omega (symmetrically for C1,C2) -- reduces GOAL to: at least one of PB1>=B1B3, PC1>=C1C3.", "critical", "p.60, 'which yields that one of the points B2 and C2 does not lie strictly inside Omega'", "S3"),
        ("N11", "lemma", "A,B,C,B3 concyclic implies triangle CB1B3 ~ triangle BB1A.", "important", "p.60, 'the triangles CB1B3 and BB1A are similar'", "S4"),
        ("N12", "calculation", "Sine rule + similarity gives PB1/B1B3 = (sin(ACP)/sin(BPC)) * (sin(BAC)/sin(PBA)).", "important", "p.60", "S4"),
        ("N13", "calculation", "Symmetric derivation (roles of B,C swapped) gives PC1/C1C3 = (sin(PBA)/sin(BPC)) * (sin(BAC)/sin(ACP)).", "important", "p.60, 'Similarly,'", "S4"),
        ("N14", "calculation", "Multiplying N12 x N13: (PB1/B1B3)*(PC1/C1C3) = sin^2(BAC)/sin^2(BPC).", "important", "p.60, 'Multiplying these two equations...'", "S4"),
        ("N15", "inference", "Apply (*) [N7]: sin^2(BAC)/sin^2(BPC) >= 1, so the product >= 1.", "critical", "p.60, 'using (*), which yields the desired conclusion'", "S5"),
        ("N16", "inference", "A product of two positive numbers >=1 forces at least one factor >=1: PB1>=B1B3 or PC1>=C1C3.", "critical", "p.60 (implicit closing step)", "S5"),
        ("N17", "conclusion", "Combine N16 with N10: B2 or C2 lies on/outside Omega, so A2,B2,C2 cannot all lie strictly inside Omega. QED.", "critical", "p.60", "S5"),
    ]
    node_ids = []
    for i, (nid_suf, ntype, stmt, imp, span, strat) in enumerate(nodes):
        nid = sid(SOL1, nid_suf)
        node_ids.append(nid)
        all_nodes.append({
            "node_id": nid, "solution_id": SOL1, "sequence_index": i, "node_type": ntype,
            "statement_text": stmt, "purpose": None, "importance": imp, "source_span": span,
            "strategy_id": sid(SOL1, strat),
        })

    edges = [
        ("G1", "G2", "requires", "define_object"),
        ("G2", "GOAL", "requires", "framing_setup"),
        ("G1", "N1", "requires", "invoke_given_definitional_property"),
        ("G1", "N2", "requires", "invoke_given_definitional_property"),
        ("N1", "N3", "derives", "case_split"),
        ("N2", "N3", "derives", "case_split"),
        ("N3", "N4", "derives", "symmetry_wlog"),
        ("G1", "N5", "requires", "invoke_prior_lemma_fact"),
        ("N4", "N6", "derives", "inequality_chaining"),
        ("N5", "N6", "derives", "inequality_chaining"),
        ("N6", "N7", "derives", "structural_invariant_identification"),
        ("G2", "N8", "requires", "construct_auxiliary_object"),
        ("G2", "N9", "requires", "invoke_given_definitional_property"),
        ("N8", "N9", "requires", "invoke_given_definitional_property"),
        ("G2", "N10", "requires", "structural_invariant_identification"),
        ("N9", "N10", "derives", "structural_invariant_identification"),
        ("G1", "N11", "requires", "invoke_given_definitional_property"),
        ("N8", "N11", "requires", "invoke_given_definitional_property"),
        ("N11", "N12", "derives", "direct_computation_verification"),
        ("N11", "N13", "derives", "direct_computation_verification"),
        ("N12", "N14", "derives", "algebraic_simplification"),
        ("N13", "N14", "derives", "algebraic_simplification"),
        ("N7", "N15", "requires", "combine_bounds_squeeze_assemble"),
        ("N14", "N15", "derives", "combine_bounds_squeeze_assemble"),
        ("N15", "N16", "derives", "invoke_prior_lemma_fact"),
        ("N16", "N17", "concludes", "conclude"),
        ("N10", "N17", "requires", "conclude"),
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
        "solution_id": SOL1, "problem_id": P, "label": "Official Solution 1 (angle pigeonhole + sine-rule ratio computation)",
        "is_primary": True, "is_complete": True, "replaces_solution_id": None, "replaces_span_note": None,
        "construction_type": "angle pigeonhole + cyclic-similarity ratio computation, assembled multiplicatively",
        "source_reference": "pdf:IMO2019SL.pdf; pdf_pages:60-61 (approx.); heading:Solution 1.",
    })

    all_proof_features += [
        {"solution_id": SOL1, "feature_type_id": f} for f in ("direct", "construction", "symmetric")
    ]

    principles = [
        ("pigeonhole_averaging_fixed_total_partition", "S1", False, "solution_specific", "high",
         "The angle-sum identity is problem-intrinsic, but using it via this three-way pigeonhole to launch the proof is Solution 1's own architecture -- Solution 2 argues by contradiction instead; Solution 3 bypasses angles entirely."),
        ("interior_point_angle_domination", "S2", False, "mixed", "high",
         "The fact (angle BPC>angle BAC for P interior) is problem-intrinsic, true of the configuration independent of any proof; its invocation in this exact form is solution-specific -- Solutions 2-3 never state or need it this way."),
        ("sine_symmetry_unimodality_half_pi", "S2", False, "solution_specific", "high",
         "This exact angle-to-sine conversion device is Solution 1's only; a domain-general trig tool applied here by this proof's specific choice."),
        ("chord_ray_inside_outside_correspondence", "S3", False, "intrinsic", "high",
         "Reused verbatim in Solution 2 (independently defines A3,B3,C3 and argues PA1<A1A3) and present in disguised algebraic form in Solution 3 (checking |A2|>=1 against unit circumradius) -- three-for-three official solutions rely on some version of this correspondence, the strongest intrinsic-confidence evidence found in the pool to date."),
        ("cyclic_similarity_to_sine_ratio", "S4", False, "solution_specific", "high",
         "Solution 2 computes the analogous ratio via the angle bisector theorem and isogonal conjugates instead; Solution 3 never computes an explicit ratio at all."),
        ("product_pigeonhole", "S5", False, "solution_specific", "high",
         "Solution 2 closes via an additive contradiction (summing three angle inequalities to pi<pi) rather than this multiplicative pigeonhole -- genuinely different closing devices reaching the same conclusion."),
    ]
    for ptid, strat, cc, intr, conf, just in principles:
        all_principle_instances.append({
            "instance_id": f"{SOL1}-PI-{ptid}", "solution_id": SOL1, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL1, strat) if strat else None, "is_cross_cutting": cc,
            "is_problem_intrinsic": intr, "intrinsic_confidence": conf, "justification_text": just,
        })

    dep_edges = [
        ("pigeonhole_averaging_fixed_total_partition", "sine_symmetry_unimodality_half_pi", "requires",
         "P2b's bound needs P1's angle inequality (angle BPC>=pi-angle BAC, from N3-N4) as one of its two hypotheses."),
        ("interior_point_angle_domination", "sine_symmetry_unimodality_half_pi", "requires",
         "P2b's bound needs the independent fact angle BPC>angle BAC (N5) as its other hypothesis."),
        ("chord_ray_inside_outside_correspondence", "cyclic_similarity_to_sine_ratio", "enables",
         "P3's reformulation (N9-N10) creates the length ratios that P4 (N11-N13) then computes explicitly."),
        ("cyclic_similarity_to_sine_ratio", "product_pigeonhole", "requires",
         "P5's product (N14-N15) is built directly from P4's two computed ratios."),
        ("sine_symmetry_unimodality_half_pi", "product_pigeonhole", "requires",
         "P5's product is shown >=1 only by substituting (*) from P2b (N7 -> N15)."),
        ("chord_ray_inside_outside_correspondence", "product_pigeonhole", "requires",
         "Translating P5's 'one factor >=1' (N16) back into 'B2 or C2 escapes Omega' (N17) uses P3's correspondence a second time, at the closing step."),
    ]
    for i, (src, tgt, rel, just) in enumerate(dep_edges):
        all_principle_dep_edges.append({
            "edge_id": f"{P}-PDE-{i+1}",
            "source_instance_id": f"{SOL1}-PI-{src}", "target_instance_id": f"{SOL1}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })
