# OlympiadAI Task 002 — Reasoning-Intent Thinking Graph Upgrade

## Context

Day 1 is complete.

The current project already contains:

- original PDF
- extracted source-only JSON
- Gold Dataset JSON
- Thinking Graph schema
- one Thinking Graph for `official_solution_1`
- an official comment containing an alternate proof of the lemma

Do not restart the project.
Do not rerun the complete Day 1 workflow.
Do not modify PDF extraction unless validation shows a source-text problem.

The purpose of this task is to upgrade the existing Thinking Graph from a
mathematical dependency outline into an auditable reasoning-intent graph.

The upgraded graph must show:

- what each mathematical step establishes
- why the step is needed
- what obstacle prevents direct progress
- what intermediate result is required
- why one node leads to the next node

This must remain a concise analysis of the official solution.
Do not generate hidden chain-of-thought.
Do not speculate about the author's psychology.
Do not independently solve the problem.

---

# Scope

Modify only the schema, documentation, Gold record, graph reports,
validation code, and tests needed for this upgrade.

Do not implement:

- Google Drive
- Supabase
- generalized PDF parsing
- Problem DNA
- variation generation
- similar-problem generation

Stop after validating the upgraded IMO-SL-2006-A3 graph.

---

# Step 1 — Preserve the source-only record

Do not change:

```text
data/extracted/IMO-SL-2006-A3.source.json

# Step 2 — Upgrade schema to version 1.0.1

Update:

```text
docs/01_SCHEMA.md
docs/02_THINKING_GRAPH_SPEC.md
schemas/olympiad_problem_v1.schema.json
schemas/thinking_graph_v1.schema.json