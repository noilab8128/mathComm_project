"""Validate a Day 1 gold record and its Thinking Graph."""

from __future__ import annotations

import argparse
import json
from collections import defaultdict, deque
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator

ROOT = Path(__file__).resolve().parents[3]
SCHEMA_DIR = ROOT / "schemas"
PROBLEM_SCHEMA_PATH = SCHEMA_DIR / "olympiad_problem_v1.schema.json"
GRAPH_SCHEMA_PATH = SCHEMA_DIR / "thinking_graph_v1.schema.json"


def load_json(path: Path) -> Any:
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def _validator(schema: dict[str, Any]) -> Draft202012Validator:
    return Draft202012Validator(schema)


def validate_schema(instance: dict[str, Any], schema: dict[str, Any]) -> list[str]:
    return [error.message for error in sorted(_validator(schema).iter_errors(instance), key=str)]


def validate_thinking_graph_integrity(graph: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    nodes = graph.get("nodes") or []
    edges = graph.get("edges") or []
    node_ids = [node["node_id"] for node in nodes]
    node_set = set(node_ids)

    if len(node_ids) != len(node_set):
        errors.append("node_id values are not unique")

    for node in nodes:
        if not str(node.get("source_span") or "").strip():
            errors.append(f"node {node.get('node_id')} is missing source_span")
        for dep in node.get("depends_on") or []:
            if dep not in node_set:
                errors.append(f"node {node.get('node_id')} depends on missing node {dep}")

    for edge in edges:
        if edge.get("from") not in node_set:
            errors.append(f"edge from missing node {edge.get('from')}")
        if edge.get("to") not in node_set:
            errors.append(f"edge to missing node {edge.get('to')}")

    for entry in graph.get("entry_nodes") or []:
        if entry not in node_set:
            errors.append(f"entry node missing: {entry}")
    for terminal in graph.get("terminal_nodes") or []:
        if terminal not in node_set:
            errors.append(f"terminal node missing: {terminal}")

    adjacency: dict[str, list[str]] = defaultdict(list)
    indegree: dict[str, int] = {node_id: 0 for node_id in node_set}
    for edge in edges:
        start, end = edge["from"], edge["to"]
        if start in node_set and end in node_set:
            adjacency[start].append(end)
            indegree[end] += 1
    for node in nodes:
        for dep in node.get("depends_on") or []:
            if dep in node_set:
                adjacency[dep].append(node["node_id"])
                indegree[node["node_id"]] += 1

    queue = deque([node_id for node_id, degree in indegree.items() if degree == 0])
    seen = 0
    while queue:
        current = queue.popleft()
        seen += 1
        for nxt in adjacency[current]:
            indegree[nxt] -= 1
            if indegree[nxt] == 0:
                queue.append(nxt)
    if node_set and seen != len(node_set):
        errors.append("thinking graph contains a dependency cycle")

    return errors


def validate_source_only(source: dict[str, Any]) -> list[str]:
    forbidden = {
        "thinking",
        "thinking_graph",
        "problem_dna",
        "understanding",
        "generation",
        "reasoning_pattern",
        "key_observations",
        "critical_lemmas",
    }
    return [f"source JSON contains analysis field: {key}" for key in forbidden if key in source]


def validate_gold_record(
    record: dict[str, Any],
    problem_schema: dict[str, Any],
    graph_schema: dict[str, Any],
) -> list[str]:
    errors = validate_schema(record, problem_schema)

    solutions = record.get("solutions", {}).get("official_solutions") or []
    if not solutions:
        errors.append("official_solutions is empty")
    for solution in solutions:
        if not str(solution.get("text") or "").strip():
            errors.append(f"official solution {solution.get('solution_id')} has empty text")

    graph = record.get("thinking", {}).get("thinking_graph")
    if graph is None:
        errors.append("thinking_graph is null")
    else:
        errors.extend(validate_schema(graph, graph_schema))
        errors.extend(validate_thinking_graph_integrity(graph))

    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--gold",
        type=Path,
        default=ROOT / "data/gold/IMO-SL-2006-A3.json",
    )
    parser.add_argument(
        "--source",
        type=Path,
        default=ROOT / "data/extracted/IMO-SL-2006-A3.source.json",
    )
    args = parser.parse_args()

    problem_schema = load_json(PROBLEM_SCHEMA_PATH)
    # Validate thinking_graph separately; avoid fragile cross-file $ref resolution.
    problem_schema["properties"]["thinking"]["properties"]["thinking_graph"] = {
        "oneOf": [{"type": "object"}, {"type": "null"}]
    }
    graph_schema = load_json(GRAPH_SCHEMA_PATH)

    gold = load_json(args.gold)
    source = load_json(args.source)

    errors = validate_gold_record(gold, problem_schema, graph_schema)
    errors.extend(validate_source_only(source))

    if errors:
        print("VALIDATION FAILED")
        for item in errors:
            print(f"- {item}")
        return 1

    graph = gold["thinking"]["thinking_graph"]
    print("VALIDATION PASSED")
    print(f"nodes={len(graph['nodes'])} edges={len(graph['edges'])}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
