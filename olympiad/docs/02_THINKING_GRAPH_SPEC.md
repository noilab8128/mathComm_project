# Thinking Graph Specification v1.0

Graph version: `1.0.0`

A Thinking Graph is a concise, auditable representation of the **official solution's** mathematical reasoning. It is not a hidden chain-of-thought and must not invent an independent solution.

## Top-level structure

```json
{
  "graph_version": "1.0.0",
  "solution_id": "official_solution_1",
  "nodes": [],
  "edges": [],
  "entry_nodes": [],
  "terminal_nodes": []
}
```

## Node fields

| Field | Required | Description |
|-------|----------|-------------|
| node_id | yes | Unique within the graph |
| node_type | yes | One of the allowed types below |
| statement | yes | Concise mathematical claim |
| purpose | yes | Why this step appears in the official argument |
| source_span | yes | Exact page / paragraph / line reference into the official solution |
| depends_on | yes | Array of prerequisite `node_id`s (may be empty for givens/goals) |
| importance | yes | `supporting`, `important`, or `critical` |

## Allowed `node_type`

```text
given
goal
definition
reformulation
observation
case_split
construction
lemma
inference
calculation
contradiction
conclusion
```

## Allowed `importance`

```text
supporting
important
critical
```

## Edge fields

| Field | Required | Description |
|-------|----------|-------------|
| from | yes | Source node_id |
| to | yes | Target node_id |
| relation | yes | One of the allowed relations below |

## Allowed `relation`

```text
supports
requires
derives
motivates
splits_into
resolves
contradicts
concludes
```

## Integrity rules

1. Every `node_id` is unique.
2. Every edge endpoint exists.
3. Every `depends_on` entry exists.
4. Every entry node and terminal node exists.
5. Every reasoning node has a nonempty `source_span`.
6. The directed dependency graph induced by edges / `depends_on` must be acyclic.
7. One node = one mathematically meaningful reasoning unit.
8. Nodes must preserve the official solution's meaning; do not replace official reasoning with an independent solve.

## Source span convention (Day 1)

Prefer:

```text
pdf:IMO2006SL.pdf; pdf_page:N; printed_page:M; paragraph:"..."
```

or extracted line ranges when line-numbered text is stored.
