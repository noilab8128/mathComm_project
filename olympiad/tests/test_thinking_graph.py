"""Tests for Day 1 Thinking Graph validation."""

from __future__ import annotations

import json
from pathlib import Path

from olympiadai.validation.validate_gold_record import (
    validate_gold_record,
    validate_source_only,
    validate_thinking_graph_integrity,
)

ROOT = Path(__file__).resolve().parents[1]
GOLD_PATH = ROOT / "data/gold/IMO-SL-2006-A3.json"
SOURCE_PATH = ROOT / "data/extracted/IMO-SL-2006-A3.source.json"
PROBLEM_SCHEMA_PATH = ROOT / "schemas/olympiad_problem_v1.schema.json"
GRAPH_SCHEMA_PATH = ROOT / "schemas/thinking_graph_v1.schema.json"


def _load(path: Path):
    with path.open(encoding="utf-8") as handle:
        return json.load(handle)


def _problem_schema():
    schema = _load(PROBLEM_SCHEMA_PATH)
    schema["properties"]["thinking"]["properties"]["thinking_graph"] = {
        "oneOf": [{"type": "object"}, {"type": "null"}]
    }
    return schema


def test_gold_record_passes_schema_and_graph_integrity() -> None:
    gold = _load(GOLD_PATH)
    errors = validate_gold_record(gold, _problem_schema(), _load(GRAPH_SCHEMA_PATH))
    assert errors == []


def test_source_json_has_no_analysis_fields() -> None:
    source = _load(SOURCE_PATH)
    assert validate_source_only(source) == []


def test_thinking_graph_rejects_cycle() -> None:
    graph = {
        "graph_version": "1.0.0",
        "solution_id": "official_solution_1",
        "nodes": [
            {
                "node_id": "A",
                "node_type": "observation",
                "statement": "A",
                "purpose": "A",
                "source_span": "span-a",
                "depends_on": ["B"],
                "importance": "important",
            },
            {
                "node_id": "B",
                "node_type": "observation",
                "statement": "B",
                "purpose": "B",
                "source_span": "span-b",
                "depends_on": ["A"],
                "importance": "important",
            },
        ],
        "edges": [
            {"from": "A", "to": "B", "relation": "supports"},
            {"from": "B", "to": "A", "relation": "supports"},
        ],
        "entry_nodes": ["A"],
        "terminal_nodes": ["B"],
    }
    errors = validate_thinking_graph_integrity(graph)
    assert any("cycle" in error for error in errors)


def test_official_solution_text_present() -> None:
    gold = _load(GOLD_PATH)
    solutions = gold["solutions"]["official_solutions"]
    assert solutions
    assert all(solution["text"].strip() for solution in solutions)
