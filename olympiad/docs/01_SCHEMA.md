# OlympiadAI Schema Version 1.0

Schema version: `1.0.0`

This document freezes the top-level record layout for Olympiad problems.
Do not add or remove fields without explicit approval.

## Top-level sections

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

## Field definitions

### problem_information

| Field | Type | Notes |
|-------|------|-------|
| problem_id | string | Stable id, e.g. `IMO-SL-2006-A3` |
| contest | string | e.g. `IMO Shortlist` |
| year | integer | Contest year |
| round | string \| null | e.g. `Shortlist` |
| problem_number | string | e.g. `A3` |
| category | string \| null | e.g. `Algebra` |
| difficulty | integer \| null | Optional 1–10; null if unknown |
| source | string | Provenance note |

### problem

| Field | Type |
|-------|------|
| problem_statement | string |

### solutions

| Field | Type |
|-------|------|
| official_solutions | array of solution objects |
| solution_summary | string \| null |

Each object in `official_solutions`:

| Field | Type |
|-------|------|
| solution_id | string |
| label | string |
| text | string |
| source_reference | string |

### understanding

| Field | Type |
|-------|------|
| concepts | array of string |
| subconcepts | array of string |
| prerequisites | array of string |

### problem_dna

| Field | Type | Day 1 |
|-------|------|-------|
| problem_dna | object \| null | may be null |
| problem_family | string \| null | may be null |
| problem_template | string \| null | may be null |
| construction_type | string \| null | may be null |

### thinking

| Field | Type |
|-------|------|
| thinking_graph | object \| null | see Thinking Graph spec |
| reasoning_pattern | string \| null |
| key_observations | array of string |
| critical_lemmas | array of string |
| construction_steps | array of string |
| failed_attempts | array of string |

Day 1 stores one Thinking Graph object in `thinking_graph`, keyed to the primary official solution via `thinking_graph.solution_id`.

### generation

| Field | Type | Day 1 |
|-------|------|-------|
| variation_rules | array | may be empty |
| generalization | string \| null | may be null |
| generator_notes | string \| null | may be null |

### metadata

| Field | Type |
|-------|------|
| schema_version | string | must be `1.0.0` |
| created_at | string (ISO-8601) |
| updated_at | string (ISO-8601) |
| validation_status | string |
| parser_version | string \| null |
| analyzer_version | string \| null |

## Source vs analysis

- Extracted source material lives in `data/extracted/*.source.json` (no AI analysis fields).
- Gold records in `data/gold/` may contain both source text and analysis sections.
- Analysis must remain traceable to official solution text via Thinking Graph `source_span`.
