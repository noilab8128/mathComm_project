"""
Data fragment for IMO-SL-2019-C5, transcribed from
reports/IMO-SL-2019-C5_validation_report.md, matching the exact row shapes
used in scripts/load_dna_seed_v1.py (see its IMO-SL-2006-A3 block,
lines ~380-627, as the structural template).

Pure data + a build() function. No DB calls, no side effects.
"""

NEW_TOPICS = [
    {"topic_id": "graph_rewriting_invariants", "name": "Graph Rewriting Invariants", "area": "combinatorics",
     "description": "Local edge-rewriting rules on graphs and the structural invariants/monovariants that control their long-run behavior."},
]

# (id, name, generic_form, generality_class) -- P5 is NOT here; it merges into
# the existing well_founded_descent_monovariant_induction principle_type.
NEW_PRINCIPLE_TYPES = [
    ("degree_sum_threshold_pigeonhole_connectivity", "Degree-Sum Threshold Pigeonhole for Connectivity",
     "If every pair of elements in a finite ground set has combined 'reach' exceeding the number of remaining elements, any two elements must interact directly or through a common intermediary.",
     "common_technique"),
    ("direct_verification_invariant_base_case", "Direct Verification of an Invariant's Base Case",
     "Check a proposed structural invariant against the problem's initial data.",
     "universal"),
    ("maximal_substructure_boundary_extraction", "Maximal Substructure Boundary Extraction",
     "Take a maximal object satisfying a closure property; by maximality, anything just outside it fails to close back in, producing a witnessed non-relation at the boundary.",
     "common_technique"),
    ("case_exhaustive_local_move_invariant_preservation", "Case-Exhaustive Local-Move Invariant Preservation",
     "To preserve a structural invariant under a general local rewriting rule, enumerate an exhaustive, mutually exclusive case decomposition of how the rule can apply, and verify invariant preservation separately in each case.",
     "common_technique"),
    ("terminal_state_characterization_invariant_until_termination", "Terminal-State Characterization via Invariant-Preservation-Until-Forced-Termination",
     "If a structural invariant survives every step while some progress condition holds, and the process is guaranteed to terminate, then the invariant plus the failure of the progress condition together characterize the necessary shape of the final state.",
     "common_technique"),
]

# No new reasoning actions needed -- every move here (pigeonhole/bounding,
# case_split, merge_cases, extremal_choice, construct_auxiliary_object,
# monovariant_descent_step, combine_bounds_squeeze_assemble, conclude,
# framing_setup, invoke_prior_lemma_fact, invoke_given_definitional_property,
# direct_computation_verification, define_object) already exists in the
# 27-entry REASONING_ACTION_TYPES list.
NEW_REASONING_ACTIONS = []

PROBLEM = {
    "problem_id": "IMO-SL-2019-C5", "contest": "IMO Shortlist", "year": 2019, "round": "Shortlist",
    "problem_number": "C5", "source": "data/raw/imo/IMO2019SL.pdf, statement p. 6, Solution 1 pp. 39-40, Solution 2 p. 41",
    "statement_text": ("On a certain social network, there are 2019 users, some pairs of which are friends, "
                       "where friendship is a symmetric relation. Initially, there are 1010 people with 1009 "
                       "friends each and 1009 people with 1010 friends each. However, the friendships are "
                       "rather unstable, so events of the following kind may happen repeatedly, one at a time: "
                       "Let A, B, and C be people such that A is friends with both B and C, but B and C are "
                       "not friends; then B and C become friends, but A is no longer friends with them. "
                       "Prove that, regardless of the initial friendships, there exists a sequence of such "
                       "events after which each user is friends with at most one other user."),
    "difficulty": None,
    "objects_text": "A graph G on 2019 vertices with a near-regular degree sequence (1010 vertices of degree 1009, 1009 vertices of degree 1010); a local rewriting rule (refriending) on adjacent triples A,B,C.",
    "hidden_structure": "The refriending rule is a degree-parity- and edge-count-monotone rewriting system: it always strictly shrinks the edge set while a structural invariant (non-completeness + an odd-degree witness, per component) survives every legal move -- the problem is really about finding an invariant robust enough to survive an adversarial-looking local rule, not about friendship at all.",
    "expected_insight": "Reformulate socially-phrased combinatorics as a graph rewriting system; find an invariant that (a) holds initially, (b) is preserved by some legal move whenever the process could still continue, and (c) forces the desired terminal shape once no move is possible -- then let a strictly-decreasing edge count guarantee the process can't run forever.",
    "problem_family": None, "problem_template": None,
}

PROBLEM_TOPIC_IDS = ["graph_rewriting_invariants"]


def build(all_solutions, all_strategies, all_nodes, all_edges, all_proof_features,
          all_principle_instances, all_principle_dep_edges, solution_graph_data, sid):
    P = "IMO-SL-2019-C5"
    SOL1 = sid(P, "SOL1")

    strategies = [
        ("S0", 0, "Reformulate the friendship problem as a graph rewriting system (2019 vertices, near-regular degree sequence, refriending rule); state the goal (max degree <= 1).", True, False),
        ("S1", 1, "Establish connectivity of G via a degree-sum pigeonhole bound.", False, False),
        ("S2", 2, "Define the two-part structural invariant condition (1) (not complete + has an odd-degree vertex, per component >=3) and verify it holds initially.", False, False),
        ("S3", 3, "State the invariant-preservation lemma as the key sub-goal: if G satisfies (1) and has a vertex of degree >=2, some refriending preserves (1).", None, False),
        ("S4", 4, "Choose a hub vertex A of degree >=2 via a maximal complete subgraph, guaranteeing a witnessed non-adjacent neighbour pair.", False, False),
        ("S5", 5, "Case-exhaustive proof (4 configurations on component count / edge multiplicity to A) that the chosen refriending preserves the invariant.", False, False),
        ("S6", 6, "Show total edge count strictly decreases by 1 with every refriending, a bounded-below monovariant forcing termination.", False, False),
        ("S7", 7, "Assemble base case + preservation lemma + termination into the terminal-state characterization (max degree <=1, i.e. a disjoint union of edges/vertices).", False, True),
    ]
    for suf, seq, goal, framing, bookkeeping in strategies:
        all_strategies.append({
            "strategy_id": sid(SOL1, suf), "solution_id": SOL1, "sequence_index": seq,
            "subgoal_text": goal, "is_framing": framing, "is_bookkeeping": bookkeeping,
        })

    nodes = [
        ("N1", "given", "Reformulate as graph G: 2019 vertices, 1010 of degree 1009, 1009 of degree 1010; refriending rule defined.", "critical", "p.39, Common remarks", "S0"),
        ("N2", "goal", "Reach, via refriendings, a graph that is a disjoint union of single edges and isolated vertices.", "critical", "p.6 / p.39", "S0"),
        ("N3", "inference", "Any two vertices have degree sum >= 2018 = n-1, forcing adjacency or a common neighbour (pigeonhole) => G is connected.", "critical", "p.39", "S1"),
        ("N4", "construction", "Define condition (1): every connected component with >=3 vertices is not complete and has a vertex of odd degree.", "critical", "p.39, condition (1)", "S2"),
        ("N5", "inference", "Initial G satisfies (1): connected (N3), not complete (max degree 1010 < 2018), has odd-degree vertices (degree 1009).", "critical", "p.39", "S2"),
        ("N6", "goal", "Key lemma: if G satisfies (1) and has a vertex of degree >=2, some refriending on G preserves (1).", "critical", "p.39", "S3"),
        ("N7", "construction", "Choose vertex A of degree >=2 with two non-adjacent neighbours, via a maximal complete subgraph K: some A in K has a neighbour C outside K non-adjacent to some B in K.", "important", "p.40", "S4"),
        ("N8", "construction", "Removing A splits its component into connected components G_1..G_k (k>=1), each attached to A by >=1 edge.", "important", "p.40", "S5"),
        ("N9", "case_split", "Four cases on (k, edge-multiplicity A->G_i): (1) k>=2, >=2 edges to some G_i; (2) k>=2, one edge to each G_i; (3) k=1, >=3 edges to G_1; (4) k=1, exactly 2 edges to G_1.", "important", "p.40, Case 1-4", "S5"),
        ("N10", "calculation", "Case 1: B in G_i, C in G_j (i!=j) both adjacent to A -- automatically non-adjacent; refriend AB,AC -> BC.", "supporting", "p.40", "S5"),
        ("N11", "inference", "Case 2: handshake-lemma parity on {A} union G_i forces G_i to contain an odd-degree vertex; choose B,C as A's neighbours in two different G_i's.", "supporting", "p.40", "S5"),
        ("N12", "inference", "Case 3: reuse N7's guaranteed non-adjacent neighbour pair B,C, both inside G_1.", "supporting", "p.40", "S5"),
        ("N13", "calculation", "Case 4: B,C are A's only two neighbours (non-adjacent by N7); if the merged component would illegally be complete on >=3 vertices, a further refriending via a third vertex D reduces to Case 1's pattern.", "supporting", "p.40, Case 4", "S5"),
        ("N14", "conclusion", "In every case, condition (1) is preserved by the exhibited refriending.", "important", "p.40", "S5"),
        ("N15", "conclusion", "Lemma (N6) established.", "critical", "p.40", "S5"),
        ("N16", "calculation", "Each refriending strictly decreases total edge count by exactly 1 (removes 2 edges, adds 1).", "critical", "p.39", "S6"),
        ("N17", "inference", "Edge count is a non-negative integer => any sequence of refriendings terminates after finitely many steps.", "critical", "p.39", "S6"),
        ("N18", "conclusion", "Combining N5 (base case), N15 (a preserving move is always available while degree >=2), N17 (forced termination): the process must terminate at a graph with max degree <=1.", "critical", "p.39", "S7"),
        ("N19", "conclusion", "The terminal graph is a disjoint union of single edges and isolated vertices -- exactly the goal (N2).", "critical", "p.39", "S7"),
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

    edges = [
        ("N1", "N2", "supports", "framing_setup"),
        ("N1", "N3", "derives", "bounding"),
        ("N1", "N4", "supports", "define_object"),
        ("N3", "N5", "requires", "invoke_prior_lemma_fact"),
        ("N4", "N5", "requires", "direct_computation_verification"),
        ("N5", "N6", "motivates", "framing_setup"),
        ("N6", "N7", "requires", "extremal_choice"),
        ("N7", "N8", "derives", "construct_auxiliary_object"),
        ("N8", "N9", "derives", "case_split"),
        ("N9", "N10", "splits_into", "case_split"),
        ("N9", "N11", "splits_into", "case_split"),
        ("N9", "N12", "splits_into", "case_split"),
        ("N9", "N13", "splits_into", "case_split"),
        ("N10", "N14", "resolves", "merge_cases"),
        ("N11", "N14", "resolves", "merge_cases"),
        ("N12", "N14", "resolves", "merge_cases"),
        ("N13", "N14", "resolves", "merge_cases"),
        ("N14", "N15", "derives", "conclude"),
        ("N1", "N16", "derives", "invoke_given_definitional_property"),
        ("N16", "N17", "derives", "monovariant_descent_step"),
        ("N5", "N18", "requires", "combine_bounds_squeeze_assemble"),
        ("N15", "N18", "requires", "combine_bounds_squeeze_assemble"),
        ("N17", "N18", "requires", "combine_bounds_squeeze_assemble"),
        ("N18", "N19", "derives", "conclude"),
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
        "solution_id": SOL1, "problem_id": P, "label": "Official Solution 1",
        "is_primary": True, "is_complete": True, "replaces_solution_id": None, "replaces_span_note": None,
        "construction_type": "invariant-preservation lemma (case-exhaustive) + edge-count monovariant termination argument",
        "source_reference": "pdf:IMO2019SL.pdf; printed_pages:39-40; heading:Solution 1.",
    })

    all_proof_features += [
        {"solution_id": SOL1, "feature_type_id": f} for f in ("direct", "construction", "invariant", "monovariant")
    ]

    pi = [
        ("degree_sum_threshold_pigeonhole_connectivity", "S1", False, "intrinsic", "high",
         "The fact that G is connected is forced by the given degree sequence itself (any graph with these exact degrees is connected, regardless of proof technique); pigeonhole is the mechanism used here, not the reason it's true."),
        ("direct_verification_invariant_base_case", "S2", False, "intrinsic", "high",
         "Checking the invariant against the given initial data; problem-intrinsic but a weak/low-value DNA candidate (universal principles are poor discriminators, per the project's prior finding on Canonical Representation in 2006-A3)."),
        ("maximal_substructure_boundary_extraction", "S4", False, "mixed", "low",
         "The underlying fact (a non-complete graph has some vertex with two non-adjacent neighbours) is intrinsic and trivial, but using maximal-clique machinery specifically to exhibit it is this proof's choice; a more pedestrian argument would work equally well. Confidence flagged low on the mechanism half specifically."),
        ("case_exhaustive_local_move_invariant_preservation", "S5", False, "solution_specific", "high",
         "Confirmed directly by Solution 2 in the same source, which proves the identical theorem via a completely different route (cycle-existence + tree-reduction) that never defines condition (1) or performs this case split at all."),
        ("well_founded_descent_monovariant_induction", "S6", False, "intrinsic", "high",
         "A fact about the refriending operation itself (any legal refriending removes 2 edges and adds 1, unconditionally), not a choice this proof makes; every possible sequence of refriendings must terminate. Merged into the existing well_founded_descent_monovariant_induction principle_type (2006-A3 Comment) -- same generic fact, differing only in surface application (process-termination vs. recursive-descent existence)."),
        ("terminal_state_characterization_invariant_until_termination", "S7", False, "intrinsic", "high",
         "This composite fact is the theorem's content; any correct proof, by any route, ultimately asserts exactly this coincidence."),
    ]
    for ptid, strat, cc, intr, conf, just in pi:
        all_principle_instances.append({
            "instance_id": f"{SOL1}-PI-{ptid}", "solution_id": SOL1, "principle_type_id": ptid,
            "primary_strategy_id": sid(SOL1, strat) if strat else None, "is_cross_cutting": cc,
            "is_problem_intrinsic": intr, "intrinsic_confidence": conf, "justification_text": just,
        })

    dep_edges = [
        ("degree_sum_threshold_pigeonhole_connectivity", "direct_verification_invariant_base_case", "requires",
         "The base-case check (N5) explicitly cites connectedness (N3) as one of its three verified facts."),
        ("maximal_substructure_boundary_extraction", "case_exhaustive_local_move_invariant_preservation", "requires",
         "Case 3 and Case 4 (N12,N13) directly consume the non-adjacent neighbour pair this principle supplies; Case 1/2 (N10,N11) get non-adjacency for free from being in different components, so the dependency is partial."),
        ("degree_sum_threshold_pigeonhole_connectivity", "terminal_state_characterization_invariant_until_termination", "requires",
         "Via the base case: the terminal-state argument's base case ultimately rests on connectivity."),
        ("direct_verification_invariant_base_case", "terminal_state_characterization_invariant_until_termination", "requires",
         "Assembly (N18) explicitly cites the base case (N5) as one of its three inputs."),
        ("case_exhaustive_local_move_invariant_preservation", "terminal_state_characterization_invariant_until_termination", "requires",
         "Assembly cites the preservation lemma (N15) as a second input."),
        ("well_founded_descent_monovariant_induction", "terminal_state_characterization_invariant_until_termination", "requires",
         "Assembly cites forced termination (N17) as a third input."),
    ]
    for i, (src, tgt, rel, just) in enumerate(dep_edges):
        all_principle_dep_edges.append({
            "edge_id": f"{P}-PDE-{i+1}",
            "source_instance_id": f"{SOL1}-PI-{src}", "target_instance_id": f"{SOL1}-PI-{tgt}",
            "relation_type": rel, "justification_text": just,
        })
