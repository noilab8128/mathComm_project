# OlympiadAI — Day 1: Thinking Graph Gold Sample

## Project decision

This is a clean restart of OlympiadAI.

- Keep the previous GitHub repository only as historical reference.
- Do not copy the old sprint system, n8n workflow, Supabase schema, or legacy architecture documents into this project.
- Use Python for all preprocessing.
- Long-term pipeline:

```text
Local competition PDFs
→ Python parsing and normalization
→ optional Google Drive archival
→ local structured dataset
→ Supabase structured dataset
→ official-solution analysis
→ Thinking Graph
→ Problem DNA
→ generation metadata
→ new-problem generation
```

## Today's goal

Produce and inspect one high-quality Thinking Graph.

Use **data/raw/imo/IMO2006SL.pdf A3** as the first Gold Standard example, provided that its problem statement and full official solution are available locally.

Do not implement Google Drive upload, Supabase synchronization, the full multi-competition parser, Problem DNA, or problem generation today.

## Non-negotiable rules

1. Schema first.
2. Derive the Thinking Graph from the full official solution, not from a summary.
3. Do not independently solve the problem and present that as the official reasoning.
4. Preserve the original mathematical meaning.
5. Separate source text from AI-generated analysis.
6. Every graph node must be traceable to the official solution.
7. Store concise, auditable mathematical reasoning—not hidden chain-of-thought.
8. Do not redesign the schema during implementation.
9. If source material is missing, stop and report exactly what is missing.
10. Stop after completing today's deliverables.

## Step 1 — Inspect the clean project

Create `reports/day1_inventory.md` and report:

- current files and directories
- available PDFs
- available environment/configuration files
- whether IMO Shortlist 2006 A3 and its full official solution are present
- whether any reusable parser code exists outside this clean repository

Do not copy legacy code automatically.

## Step 2 — Create the minimal folder structure

```text
OlympiadAI/
├── data/
│   ├── raw/
│   │   └── imo/
│   ├── extracted/
│   ├── processed/
│   └── gold/
├── docs/
├── schemas/
├── src/
│   └── olympiadai/
│       ├── parsing/
│       ├── analysis/
│       └── validation/
├── prompts/
├── reports/
├── tests/
├── .env.example
├── pyproject.toml
└── README.md
```

Add `__init__.py` files where needed.

Do not create sprint, journal, release, review, or decision-log systems today.

## Step 3 — Freeze schema version 1.0

Create:

```text
docs/01_SCHEMA.md
schemas/olympiad_problem_v1.schema.json
```

Stable top-level sections:

```text
problem_information
problem
solutions
understanding
problem_dna
thinking
generation
metadata
```

Fields:

### problem_information
- problem_id
- contest
- year
- round
- problem_number
- category
- difficulty
- source

### problem
- problem_statement

### solutions
- official_solutions
- solution_summary

`official_solutions` must be an array. Each object contains:
- solution_id
- label
- text
- source_reference

### understanding
- concepts
- subconcepts
- prerequisites

### problem_dna
- problem_dna
- problem_family
- problem_template
- construction_type

### thinking
- thinking_graph
- reasoning_pattern
- key_observations
- critical_lemmas
- construction_steps
- failed_attempts

### generation
- variation_rules
- generalization
- generator_notes

### metadata
- schema_version
- created_at
- updated_at
- validation_status
- parser_version
- analyzer_version

Schema version:

```text
1.0.0
```

Do not add or remove fields without explicit approval. Fields not populated today may be null, empty arrays, or empty objects according to the JSON Schema.

## Step 4 — Define the Thinking Graph contract

Create:

```text
docs/02_THINKING_GRAPH_SPEC.md
schemas/thinking_graph_v1.schema.json
```

Structure:

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

Each node:

```text
node_id
node_type
statement
purpose
source_span
depends_on
importance
```

Allowed `node_type`:

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

Allowed `importance`:

```text
supporting
important
critical
```

Each edge:

```text
from
to
relation
```

Allowed `relation`:

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

`source_span` must identify the exact paragraph, sentence range, page, or extracted line range supporting the node.

The graph must be concise. One node equals one mathematically meaningful reasoning unit.



## Step 5 — Extract one Gold Standard problem

Locate the local PDF containing IMO Shortlist 2006 A3.

Extract:
- exact problem statement
- full official solution
- all official alternative solutions
- source page numbers or extracted line references

Create:

```text
data/extracted/IMO-SL-2006-A3.source.json
```

This file contains source material only. Do not include AI analysis.

If extraction is unreliable, preserve the raw text and mark uncertain formatting. Never invent missing symbols.

## Step 6 — Build the first Thinking Graph

Create:

```text
data/gold/IMO-SL-2006-A3.json
```

Populate:
- problem information
- problem statement
- official solution(s)
- concise solution summary
- concepts
- prerequisites
- Thinking Graph
- reasoning pattern
- key observations
- critical lemmas
- construction steps

For today, `problem_dna` and `generation` may remain unpopulated, but their schema fields must exist.

Create one Thinking Graph per official solution.

Also create:

```text
reports/IMO-SL-2006-A3_solution_comparison.md
```

Compare:
- shared ideas
- diverging approaches
- essential steps
- solution-specific steps

## Step 7 — Create a human-readable visualization

Generate:

```text
reports/IMO-SL-2006-A3_thinking_graph.md
reports/IMO-SL-2006-A3_thinking_graph.mmd
```

The Markdown report must show:

1. Problem statement
2. Official solution summary
3. Numbered graph nodes
4. Dependency edges
5. Mermaid flowchart
6. Key observations
7. Critical lemmas
8. Why the graph accurately reflects the official solution
9. Any uncertain extraction or interpretation

The Mermaid graph must show mathematical dependency, not decoration.

## Step 8 — Validate

Create:

```text
src/olympiadai/validation/validate_gold_record.py
tests/test_thinking_graph.py
reports/day1_validation.md
```

Validate:
- JSON Schema
- unique node IDs
- valid edge endpoints
- valid entry and terminal nodes
- no missing dependencies
- source span on every reasoning node
- cycle detection
- official solution text present
- no analysis fields in source-only JSON

## Required final report

Print:
- files created
- source PDF used
- extraction status
- number of official solutions found
- graph node and edge counts
- schema validation result
- test result
- unresolved issues
- exact command to render or inspect the Mermaid graph

Then stop.

Do not proceed to Google Drive, Supabase, Problem DNA, or new-problem generation.
