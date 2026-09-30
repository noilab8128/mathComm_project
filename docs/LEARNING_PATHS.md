# Learning Paths and Problem Ladders

How MathQuest breaks a hard problem into easier steps, and how the OlympiadAI **problem ladders** fit into
it. Merged from the former `LEARNING_PATH_DESIGN.md`, `PROBLEM_RELATIONSHIPS_GUIDE.md` and
`HIERARCHICAL_SAVE_FIX.md` (originals in `Archive/docs/`), and updated to match the current code.

## 1. Goal

A student starts from easy problems and climbs, step by step, until they can solve a target problem.

## 2. Current model: `problem_hierarchies`

The first design used a `problem_relationships` table with types (`derived`, `prerequisite`, `next`,
`alternative`, `related`) and a `linked_problem_ids` array. **Both are gone.** The code now uses one table:

| Column | Meaning |
|---|---|
| `parent_problem_id` | The harder problem |
| `parent_solution_id` | Which of the parent's solutions this step belongs to (a problem can have several solutions, each with its own path) |
| `child_problem_id` | The easier sub-problem. **Each child has exactly one parent** (`UNIQUE(child_problem_id)`) |
| `stage_name` | Label of the step, e.g. "Stage 1: variable decomposition" |
| `sequence_order` | Order of the children under one parent (1, 2, 3…) |
| `depth` | Level in the tree (a parent's children are at parent depth + 1) |

Children can have children, so one target problem becomes a tree:

```
Target problem (difficulty 8)
├─ Stage 1 → sub-problem (difficulty 3)
│   ├─ Stage 1 → sub-sub-problem (difficulty 1)
│   └─ Stage 2 → sub-sub-problem (difficulty 2)
├─ Stage 2 → sub-problem (difficulty 5)
└─ Stage 3 → sub-problem (difficulty 7)
```

Suggested study order: walk the tree from the deepest, easiest nodes up to the target.

### Code

- `problemHierarchiesAPI` in `src/lib/supabase.ts`: `getAll`, `create`, `getChain(parent, solution?)`,
  `getParents(child)`, `getChildren(parent)`, `delete(parent, child)`. Children come back sorted by
  `sequence_order`.
- `problemsAPI.getChildrenBatch(parentIds)` loads many children at once (admin list).
- **Admin** (`src/app/admin/problems/`): "Generate related problems" calls
  `/api/generate-related-problems`, which follows `ai_problem_generation_guide.md` to produce staged
  sub-problems for one solution. Saving creates the child problems and their hierarchy rows.
  `LearningPathView.tsx` draws the tree; `LinkManagerDialog.tsx` adds or removes links by hand.
- **Student** (`src/components/ProblemDialog.tsx`): shows a problem's children as stepping stones.

### How generated sub-problems are saved

`src/app/admin/problems/page.tsx` saves the parent first, then for each generated sub-problem it:

1. creates the child with `problemsAPI.create` (with `is_generated = true` and its solution),
2. links it to the parent solution the AI named (`solutionIndex` → `solutions.sequence_order`, or the
   first solution as a fallback), and
3. writes the hierarchy row with `sequence_order = i + 1` and `depth = parent depth + 1`.

The parent must already have a real UUID before its children are saved. (An older bug with temporary ids
is described in `Archive/docs/HIERARCHICAL_SAVE_FIX.md`.)

## 3. Not built yet

- A student-facing learning-path view with progress tracking and a "next problem" suggestion.
- A path across different problems. `problem_hierarchies` only models "easier version of this problem";
  there is no "prerequisite" or "alternative" link between independent problems any more.
- Automatic starting-point choice from the student's level (`user_category_levels`).

## 4. Problem ladders (from OlympiadAI)

`olympiad/ladders/LADDERS_v0.1.md` has 6 hand-built, computer-verified ladders: 4–6 short-answer steps from
Math Kangaroo / MATHCOUNTS / AMC 8 level up to an AIME-level **Challenge**. Each ladder then ends with
related IMO problems (cited, never copied), an **Explore** question and a documented **famous open
problem**. A ladder has the same shape as a learning path.

### How ladders are stored (`olympiad/ladders/import_ladders.py`)

The importer uses the existing tables only; no app code or table changes.

| Ladder part | Stored as |
|---|---|
| Challenge | `problems` row, root of the ladder, `is_generated = false` |
| Steps 1…n, Bridge | `problems` rows (`is_generated = true`), linked to the Challenge in `problem_hierarchies`: `sequence_order` = step order, `stage_name` = "Step 1" … "Bridge", `depth` = 2, `parent_solution_id` = the Challenge's solution |
| Answer + short solution | One `solutions` row per problem, starting `Answer: …`. Students never see solutions |
| Related Olympiad problems, Explore, Famous open problem, research field | End of the Challenge's solution (default) or of its problem text (`--endings content`) |
| Contest level (Kangaroo → 2, MATHCOUNTS → 4, AMC 8 → 5, AMC 10 → 6, AIME → 8) | `difficulty`; `level` = Easy / Medium / Hard from difficulty, as the admin page does; the contest name goes in `tags` |
| Category | `category_level1–3` + `category_path` ("Number Theory > Elementary Number Theory > …") |
| Traceability | `source = "MathQuest Ladders v0.1"`, `license = "Original (NOI.LAB)"`, `is_reviewed = false` |

Problem text is stored as plain text, because the site keeps line breaks and renders only `$…$` math (no
markdown). Steps written as follow-ups in the ladder table ("On a 4 × 4 grid?") are expanded to full
questions.

### Limits with the current app (not changed — owned by the app team)

- AI grading (`/api/grade-solution`) does not get the stored answer, so the model must solve each problem
  itself to judge it. Hard Challenges (answers like 2018 or 233) may be graded wrongly.
- Students cannot see the ladder endings unless `--endings content` is used.
- `is_reviewed = false` does not hide problems: the site shows them immediately.

### Before ladders go live

Open items from the ladder doc: independent-solver pass, human review, difficulty calibration against
AMC 8 / Kangaroo / MATHCOUNTS, missing citations.
