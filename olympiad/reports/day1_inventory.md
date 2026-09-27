# Day 1 Inventory

Date: 2026-07-22

## Current files and directories (workspace root)

Present at inspection time:

- `OlympiadAI_Day1_Thinking_Graph.md` — today's instruction document
- `data/raw/imo/` — local IMO Shortlist PDFs
- `docs/` — legacy documentation from the previous architecture (not used today)
- `src/olympiad_ai/` — legacy Python package from previous sprints (not used today)
- `tests/` — legacy tests from previous sprints
- `research/` — prior research notes on other problems
- `.git/` — existing Git history / remote reference
- `pyproject.toml`, `README.md`, `.env.example` — may be updated for the clean restart

Today's Day 1 structure is being created under:

- `data/extracted/`, `data/processed/`, `data/gold/`
- `schemas/`, `prompts/`, `reports/`
- `src/olympiadai/` (new package; separate from legacy `olympiad_ai`)

## Available PDFs

Located in `data/raw/imo/`:

- `IMO2006SL.pdf` through `IMO2024SL.pdf` (19 Shortlist PDFs)

Source PDF for today:

- `data/raw/imo/IMO2006SL.pdf`
- Title: IMO 2006 Shortlisted Problems
- Pages: 65
- Format: text-extractable PDF (pdftotext works)

## Environment / configuration files

- `.env.example` exists (legacy Supabase / OpenAI placeholders)
- No `.env` required for Day 1 (no API / Supabase work today)
- Python tooling available: Anaconda `pdftotext`, existing `~/olympiadai-venv` Python 3.11

## IMO Shortlist 2006 A3 availability

| Item | Status |
|------|--------|
| Problem statement | Present in `IMO2006SL.pdf` (PDF pages 11–12; printed pages 10–11) |
| Full official solution | Present (same pages) |
| Official alternative solutions | One main Solution; a Comment provides an alternate lemma proof |
| Extraction method | `pdftotext -layout` |

Conclusion: **A3 and its full official solution are available locally.** Proceed with Day 1.

## Reusable parser code outside this clean repository

- Legacy package `src/olympiad_ai/` exists in this repo history (Supabase / OpenAI / Domain DNA). **Not copied or reused today.**
- Sibling archive: `/Volumes/T7/Projects/OlympiadAI_v1_NotContinue.zip` — historical only; not opened or copied.
- System tool used for extraction: `pdftotext` (external binary), not project parser code.

## Day 1 scope reminder

Do **not** implement today:

- Google Drive upload
- Supabase sync
- full multi-competition parser
- Problem DNA population
- problem generation
- old sprint / journal / ADR workflow
