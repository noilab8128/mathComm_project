# OlympiadAI → Mathcomm handoff (2026-09-26)

This folder is a copy of `/Volumes/T7/Projects/OlympiadAI` (git history stays there; the original folder is
kept until the owner confirms this copy works, then deleted by the owner).

## Where things stand

- **Current direction: problem ladders.** Short-answer step problems (Kangaroo / MATHCOUNTS / AMC 8 level)
  that climb to an Olympiad-style Challenge, then point to real IMO problems, an Explore question, and a
  documented open problem. See [ladders/LADDERS_v0.1.md](ladders/LADDERS_v0.1.md) — rules, pipeline,
  template, and 6 ladders (Candy, Fibonacci, Coins, Reverse-and-Add, No-Three-in-Line, Circle points).
- **Every answer is machine-checked:** `python3 ladders/verify_ladders.py` (40 checks, ~1 s).
- **Earlier work (DNA pipeline):** Thinking Graph for IMO-SL-2006-A3 (`data/gold/`), validation reports for
  10 problems (`reports/`), DNA framework (`OlympiadAI_Constitution_v1.0.md`, `docs/12_DNA_TABLE_v1.0.md`,
  `schemas/dna_schema_v1.sql`), Supabase loader (`scripts/load_dna_seed_v1.py`), generation tests
  (`reports/generation_feasibility_test_001.md`, `generated/GEN-002`, `generated/GEN-003`).

## Decisions made

- Short-answer format only; every answer verified by computer + independent solver.
- Name every person/object a question refers to (no "the first kid").
- Copyright: use ideas, never wording. Related contest problems are cited (competition, year, number) with a
  one-sentence description in our own words. AMC 8 / Kangaroo / MATHCOUNTS materials only calibrate difficulty.
- Honesty labels at the end of each ladder: Challenge / Related Olympiad problems (Strong / Related / Loose) /
  Explore (with literature status) / Famous open problem (sourced, status date).

## Open next steps

1. Independent-solver pass on all 6 ladders (ambiguity check); human review.
2. Calibrate step difficulty against AMC 8 / Kangaroo / MATHCOUNTS materials in
   `/Volumes/T7/Projects/Math_Materials/Math` (AMC 8 by year is in `AoPS/`).
3. Add citations for Fibonacci primes, 196, Gauss circle problem, Curtis 1990.
4. Confirm "IMO 2010 Problem 5" and "IMO 2011 Problem 2" labels (added from memory; files only give SL codes).
5. Connect ladders to the Mathcomm app — `../LEARNING_PATH_DESIGN.md` already describes easy-to-target
   learning paths, which is the same shape as a ladder.
6. No AMC 12 material exists yet; add it to search for related AMC 12 problems.

## Notes

- `.env` holds Supabase secrets; it is git-ignored (`olympiad/.gitignore`). Never commit it.
- Math materials: IMO papers 1959–2005 + 2025 (PDF) and IMO Shortlist 2006–2024 (split text in
  `Math_Materials/Math/Split_IMO/PythonCode_v2/output`).
