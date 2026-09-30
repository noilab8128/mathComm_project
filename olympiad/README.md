# OlympiadAI

Research side of MathQuest. It studies official IMO Shortlist solutions to find the reusable ideas
("DNA") behind Olympiad problems, and uses them to build **problem ladders**: short-answer steps that lead
a student from Math Kangaroo level to an Olympiad-style challenge and on to a real open problem.

Moved here from `/Volumes/T7/Projects/OlympiadAI` on 2026-09-26. Git history stays in that folder. Delete
it only after confirming this copy works. Merged from the former `README.md`, `HANDOFF.md`, `RUN.md` and
`docs/00–11, 99` stubs (originals in `../Archive/olympiad/`).

## Current direction: problem ladders

[ladders/LADDERS_v0.1.md](ladders/LADDERS_v0.1.md) holds the rules, pipeline, template and 7 ladders:
Candy Game, Fibonacci Stairs, Coins You Can't Make, Reverse and Add, No Three in a Line, Dots on a Circle, Carries Cost Nine.

```bash
python3 ladders/verify_ladders.py            # recomputes every answer: 55 checks, about 5 s
python3 ladders/import_ladders.py            # preview the rows for the app (writes nothing)
python3 ladders/import_ladders.py --apply    # add the ladders to Supabase (problems, solutions, problem_hierarchies)
python3 ladders/import_ladders.py --remove   # take them out again
```

The importer uses the app's existing tables and the same row shape the admin page creates. Each Challenge
becomes a root problem, and its steps are linked under it. Answers and short solutions go in `solutions`,
which students never see. Rows are tagged `source = "MathQuest Ladders v0.1"` and `is_reviewed = false`.
The endings (related IMO problems, Explore, open problem) go in the Challenge's solution by default.
`--endings content` shows them to students instead, but in ladders B and D that text gives away the
Challenge answer.

Rules agreed so far:

- Short-answer only. Every answer is checked by computer **and** by an independent solver.
- Every person or object a question refers to is named ("Ana", not "the first kid").
- Copyright: use ideas, never wording. Related contest problems are cited (competition, year, number) with a
  one-sentence description in our own words. AMC 8 / Kangaroo / MATHCOUNTS material only calibrates difficulty.
- Each ladder ends with honest labels: Challenge / Related Olympiad problems (Strong, Related, Loose) /
  Explore (with literature status) / Famous open problem (sourced, with a status date).

How ladders map onto the app's tables: [../docs/LEARNING_PATHS.md](../docs/LEARNING_PATHS.md#4-problem-ladders-from-olympiadai).

### Next steps

1. Independent-solver pass on all 6 ladders (ambiguity check), then human review.
2. Calibrate step difficulty against AMC 8 / Kangaroo / MATHCOUNTS
   (`/Volumes/T7/Projects/Math_Materials/Math`, AMC 8 by year in `AoPS/`).
3. Add citations for Fibonacci primes, the 196 problem, the Gauss circle problem and Curtis 1990.
4. Confirm the "IMO 2010 Problem 5" and "IMO 2011 Problem 2" labels (added from memory).
5. Connect ladders to the app (see the mapping link above).
6. Add AMC 12 material so related AMC 12 problems can be searched.

## Earlier work: the DNA pipeline

The long-term idea ([OlympiadAI_Constitution_v1.0.md](OlympiadAI_Constitution_v1.0.md)): treat existing
problems as organisms, extract their mathematical DNA from the **official solutions**, store it, then
generate new problems by recombining DNA, never by copying problems.

```
PDF → Source JSON → Gold record → Reasoning Intent → Thinking Graph → Strategy Graph
    → Problem DNA → Generator → Verification → Human review
```

| Term | Meaning |
|---|---|
| Source JSON | Extracted text and page locations only, no analysis (`data/extracted/`) |
| Gold record | Validated record with the analysis (`data/gold/`) |
| Reasoning Intent | Per step: question, obstacle, needed result, success condition |
| Thinking Graph | Nodes = mathematical claims tied to the official solution; edges = logical moves labelled with a reasoning action (substitution, case split, bounding…) |
| Strategy Graph | Groups Thinking Graph nodes into high-level proof plans |
| Problem DNA | One per problem: area, topics, objects, difficulty, hidden structure |
| Solution DNA | One per official solution: strategies, principles and their dependencies, proof features |

What exists:

- One full Thinking Graph: IMO-SL-2006-A3 (`data/gold/`, `reports/IMO-SL-2006-A3_*`).
- Validation reports for 10 problems (`reports/*_validation_report.md`).
- DNA database: `schemas/dna_schema_v1.sql`, documented in `docs/12_DNA_TABLE_v1.0.md`. It is loaded into
  Supabase (10 problems, 16 solutions) by `scripts/load_dna_seed_v1.py`. **This is the same Supabase project as
  the app, in the `public` schema** (see `../docs/DATABASE.md`).
- Generation experiments: `reports/generation_feasibility_test_001.md`, `generated/GEN-002`, `GEN-003`.
- Working notes from the DNA sessions: `reports/ClaudeResponse.md`, `reports/ClaudeDNAResponse.md`.

## Layout

```text
OlympiadAI_Constitution_v1.0.md   vision and DNA framework
ladders/          problem ladders + answer checker (current work)
docs/             01_SCHEMA.md (gold record), 02_THINKING_GRAPH_SPEC.md, 12_DNA_TABLE_v1.0.md
schemas/          JSON schemas (gold record, Thinking Graph) and DNA SQL schema
data/raw/imo/     IMO Shortlist PDFs 2006–2024 (not committed to git)
data/extracted/   source-only JSON
data/gold/        validated gold records
reports/          validation reports, Thinking Graphs, generation tests, session notes
generated/        generated problem candidates
scripts/          Supabase DNA loader (+ per-problem fragments)
src/olympiadai/   validation code (parsing/analysis packages are empty placeholders)
tests/            pytest
```

## Setup

```bash
cd /Volumes/T7/Projects/Mathcomm/olympiad
/Users/mookwonseo/anaconda3/bin/python3.11 -m venv ~/olympiadai-venv
source ~/olympiadai-venv/bin/activate
python -m pip install -e ".[dev]"

python -m olympiadai.validation.validate_gold_record   # validate the gold sample
pytest                                                  # tests
```

Secrets for the loader are in `olympiad/.env` (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, …). It is
git-ignored; never commit it. The direct Postgres host is IPv6-only, so the loader uses the REST API.

To view a Thinking Graph, open `reports/IMO-SL-2006-A3_thinking_graph.md` in a Mermaid viewer, or paste the
`.mmd` file into https://mermaid.live.

## Working rules

- Keep official source text and page references unchanged. Source records hold text and locations only.
  Analysis goes in gold records.
- Never invent reasoning or rewrite official solutions. Every Thinking Graph node points back to the solution.
- Schema changes need a version bump, migration notes, and updated validation, tests and docs.
- When something is ambiguous, stop and ask rather than guess.

Math sources: IMO papers 1959–2005 and 2025 (PDF), and IMO Shortlist 2006–2024 split into text in
`/Volumes/T7/Projects/Math_Materials/Math/Split_IMO/PythonCode_v2/output`.
