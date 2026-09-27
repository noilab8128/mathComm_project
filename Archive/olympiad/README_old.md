# OlympiadAI

Clean restart. Day 1 focuses on one Gold Standard Thinking Graph for IMO Shortlist 2006 A3.

## Day 1 layout

```text
data/raw/imo/           # local competition PDFs
data/extracted/         # source-only JSON
data/gold/              # validated gold records
schemas/                # frozen schema v1.0
src/olympiadai/         # parsing / analysis / validation
reports/                # inventory, graphs, validation
```

## Setup

```bash
cd /Volumes/T7/Projects/Mathcomm/olympiad
/Users/mookwonseo/anaconda3/bin/python3.11 -m venv ~/olympiadai-venv
source ~/olympiadai-venv/bin/activate
python -m pip install -e ".[dev]"
```

## Validate today's gold sample

```bash
python -m olympiadai.validation.validate_gold_record
pytest tests/test_thinking_graph.py
```

## Inspect the Mermaid graph

Open `reports/IMO-SL-2006-A3_thinking_graph.md` in a Mermaid-capable viewer, or render:

```bash
# if mermaid-cli is installed
mmdc -i reports/IMO-SL-2006-A3_thinking_graph.mmd -o reports/IMO-SL-2006-A3_thinking_graph.svg
```

Or paste the `.mmd` file into https://mermaid.live

## Out of scope for Day 1

Google Drive, Supabase, Problem DNA population, and problem generation.
