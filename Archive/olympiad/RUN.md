# RUN.md

# OlympiadAI Development Guide

This file is the first document that should be read before making any changes to this project.

---

# Project Philosophy

OlympiadAI is **not** a parser.

OlympiadAI is a research project whose purpose is to build a structured representation of mathematical reasoning from official olympiad problems.

The project must always preserve

- correctness
- traceability
- reproducibility
- maintainability

Every architectural decision should support these goals.

---

# Source of Truth

The documentation inside

docs/

is the source of truth.

Never redesign the project from memory.

Always consult the documentation first.

---

# Reading Order

Before starting any work, read the following documents in order.

1.
docs/00_PROJECT_VISION.md

Understand the long-term goal.

----------------------------

2.
docs/01_ARCHITECTURE.md

Understand the overall architecture.

----------------------------

3.
docs/02_DATA_PIPELINE.md

Understand where today's task belongs.

----------------------------

4.
docs/03_DATA_SCHEMA.md

Read before changing any JSON.

----------------------------

5.
docs/04_REASONING_MODEL.md

Read before modifying reasoning data.

----------------------------

6.
docs/05_THINKING_GRAPH.md

Read before modifying Thinking Graphs.

----------------------------

7.
docs/06_STRATEGY_GRAPH.md

Read before modifying Strategy Graphs.

----------------------------

8.
docs/07_PROBLEM_DNA.md

Read before touching generation.

----------------------------

9.
docs/09_VALIDATION.md

Read before changing validators.

----------------------------

10.
docs/10_DEVELOPMENT_GUIDE.md

Read before writing code.

---

# Before Starting Any Task

Always determine

1. Which phase of the pipeline is affected?

2. Which documents apply?

3. Which schema version is current?

4. Which tests will be affected?

Do not modify code until these questions are answered.

---

# Development Rules

Always

✓ preserve official source text

✓ preserve source spans

✓ preserve traceability

✓ preserve backward compatibility whenever possible

✓ update tests

✓ update documentation

✓ update schema version if necessary

---

Never

✗ invent mathematical reasoning

✗ invent missing source text

✗ rewrite official solutions

✗ remove fields without migration

✗ change architecture without updating documentation

✗ skip validation

✗ skip tests

---

# Source Separation

The project intentionally separates information.

Source Layer

contains only

• extracted text

• source locations

• metadata

Nothing else.

Never place

Thinking Graph

Reasoning Intent

Problem DNA

Generation metadata

inside source records.

Analysis belongs only inside Gold Dataset records.

---

# Development Workflow

For every task

Step 1

Read the documentation.

↓

Step 2

Understand the current implementation.

↓

Step 3

Design the change.

↓

Step 4

Implement the change.

↓

Step 5

Run validation.

↓

Step 6

Run tests.

↓

Step 7

Update documentation if necessary.

↓

Step 8

Create a report.

---

# Task Workflow

Every task should contain

Objective

Files affected

Implementation

Validation

Tests

Report

Stop condition

Do not continue into future roadmap items.

---

# Versioning

Whenever schema changes

Update

schema version

migration notes

validation

tests

documentation

Do not silently modify schemas.

---

# Documentation First

If documentation and implementation disagree

documentation wins.

Update the implementation.

Do not update documentation unless explicitly requested.

---

# Current Pipeline

PDF

↓

Source JSON

↓

Gold Dataset

↓

Reasoning Intent

↓

Thinking Graph

↓

Strategy Graph

↓

Problem DNA

↓

Generator

↓

Verification

↓

Benchmark

---

# Daily Checklist

Before finishing today's work verify

[ ] Documentation still correct

[ ] Source files untouched

[ ] Gold Dataset valid

[ ] Thinking Graph valid

[ ] Strategy Graph valid

[ ] Tests pass

[ ] Validation passes

[ ] Report generated

---

# When Unsure

Do not guess.

Instead

1. Stop.

2. Explain the ambiguity.

3. Suggest possible designs.

4. Wait for a decision.

---

# Final Principle

Correctness is more important than speed.

Traceability is more important than convenience.

Maintainability is more important than cleverness.

OlympiadAI is intended to become a long-term research platform, not merely a collection of scripts.