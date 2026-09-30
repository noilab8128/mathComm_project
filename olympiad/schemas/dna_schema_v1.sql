-- OlympiadAI DNA Table — Version 1.0
-- Relational schema for Problem DNA + Solution DNA, derived from
-- Validation 001-003 (IMO-SL-2006-A3, 2007-A1, 2008-A1, 2009-A1) and
-- OlympiadAI_Constitution_v1.0.md.
--
-- Portable ANSI SQL; CHECK constraints stand in for native ENUM types.
-- See docs/12_DNA_TABLE_v1.0.md for the field-by-field data dictionary,
-- mandatory/optional split, auto-vs-human-judgment marks, and the
-- redundancy eliminations made relative to the Constitution's raw field
-- list and the existing schemas/thinking_graph_v1.schema.json.

-- =========================================================
-- DICTIONARY TABLES (controlled vocabulary — the reusable "alphabet")
-- =========================================================

CREATE TABLE topic (
  topic_id     TEXT PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  area         TEXT NOT NULL CHECK (area IN
                 ('algebra','combinatorics','geometry','number_theory')),
  description  TEXT
);

CREATE TABLE principle_type (
  principle_type_id  TEXT PRIMARY KEY,
  name                TEXT NOT NULL UNIQUE,
  generic_form        TEXT NOT NULL,
  generality_class    TEXT NOT NULL CHECK (generality_class IN
                        ('universal','common_technique','specialized')),
  description         TEXT
);

CREATE TABLE reasoning_action_type (
  action_type_id  TEXT PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,
  category        TEXT NOT NULL CHECK (category IN
                    ('construction','deduction','structural','logical_closing','framing')),
  description     TEXT
);

CREATE TABLE proof_feature_type (
  feature_type_id TEXT PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE CHECK (name IN
                    ('direct','contradiction','construction','extremal','invariant',
                     'monovariant','functional','recursive','symmetric'))
);

-- =========================================================
-- PROBLEM DNA
-- =========================================================

CREATE TABLE problem (
  problem_id        TEXT PRIMARY KEY,          -- e.g. 'IMO-SL-2009-A1'
  contest           TEXT NOT NULL,
  year              INTEGER NOT NULL,
  round             TEXT,
  problem_number    TEXT NOT NULL,
  source            TEXT NOT NULL,             -- PDF + page reference
  statement_text    TEXT NOT NULL,
  difficulty        INTEGER CHECK (difficulty BETWEEN 1 AND 10),
  objects_text      TEXT,                      -- surface mathematical objects
  hidden_structure  TEXT,                      -- deep isomorphism/analogy (e.g. "Zeckendorf in disguise")
  expected_insight  TEXT,                      -- the intended "aha"
  problem_family    TEXT,                      -- links related problems across years/contests
  problem_template  TEXT,                      -- parameterizable skeleton for generation
  UNIQUE (contest, year, problem_number)
);

CREATE TABLE problem_topic (                   -- many-to-many: a problem can span topics
  problem_id  TEXT NOT NULL REFERENCES problem(problem_id),
  topic_id    TEXT NOT NULL REFERENCES topic(topic_id),
  PRIMARY KEY (problem_id, topic_id)
);

-- =========================================================
-- SOLUTION DNA
-- =========================================================

CREATE TABLE solution (
  solution_id           TEXT PRIMARY KEY,      -- e.g. 'IMO-SL-2009-A1-SOL1'
  problem_id            TEXT NOT NULL REFERENCES problem(problem_id),
  label                 TEXT NOT NULL,         -- 'Solution', 'Comment', 'Solution 2'
  is_primary            BOOLEAN NOT NULL DEFAULT FALSE,
  is_complete           BOOLEAN NOT NULL DEFAULT TRUE,   -- FALSE: partial alternate (e.g. 2008-A1's Comment)
  replaces_solution_id  TEXT REFERENCES solution(solution_id),  -- self-ref; set only for modular partial alternates
  replaces_span_note    TEXT,                  -- human note: which node range is swapped out
  construction_type     TEXT,
  source_reference      TEXT NOT NULL,

  -- Graph-feature cache: COMPUTED from thinking_graph_node/edge, never hand-authored.
  -- Populate via trigger/ETL after node/edge writes; treat as a read-optimization,
  -- not a source of truth.
  node_count            INTEGER,
  edge_count            INTEGER,
  entry_node_count      INTEGER,
  terminal_node_count   INTEGER,
  max_depth             INTEGER,
  branch_count          INTEGER,               -- nodes with out-degree > 1
  merge_count           INTEGER,               -- nodes with in-degree > 1
  has_cycle             BOOLEAN,               -- expected FALSE; violation should hard-fail extraction
  graph_shape           TEXT                   -- human narrative label, optional (e.g. "two-arms-converging")
);

CREATE TABLE solution_proof_feature (           -- many-to-many: a solution can combine features
  solution_id     TEXT NOT NULL REFERENCES solution(solution_id),
  feature_type_id TEXT NOT NULL REFERENCES proof_feature_type(feature_type_id),
  PRIMARY KEY (solution_id, feature_type_id)
);

CREATE TABLE strategy (
  strategy_id     TEXT PRIMARY KEY,             -- e.g. 'IMO-SL-2009-A1-SOL1-S2'
  solution_id     TEXT NOT NULL REFERENCES solution(solution_id),
  sequence_index  INTEGER NOT NULL,
  subgoal_text    TEXT NOT NULL,
  -- NULL = genuinely contested by the analyst (this ambiguity recurred in every
  -- validation to date, always at the same two locations: proof start / proof end).
  -- Do not force a boolean where the evidence says the boundary is unsettled.
  is_framing      BOOLEAN,
  is_bookkeeping  BOOLEAN,
  UNIQUE (solution_id, sequence_index)
);

CREATE TABLE thinking_graph_node (
  node_id        TEXT PRIMARY KEY,              -- globally unique, e.g. 'IMO-SL-2009-A1-SOL1-N7'
  solution_id    TEXT NOT NULL REFERENCES solution(solution_id),
  sequence_index INTEGER NOT NULL,
  node_type      TEXT NOT NULL CHECK (node_type IN
                   ('given','goal','definition','reformulation','observation',
                    'case_split','construction','lemma','inference','calculation',
                    'contradiction','conclusion')),
  statement_text TEXT NOT NULL,
  purpose        TEXT,                          -- free-text rationale, optional
  importance     TEXT NOT NULL CHECK (importance IN ('supporting','important','critical')),
  source_span    TEXT,                          -- page/quote provenance, optional
  strategy_id    TEXT REFERENCES strategy(strategy_id),  -- nullable: given/goal nodes may sit outside any strategy
  UNIQUE (solution_id, sequence_index)
);

-- Adjacency lives here ONLY. Do not add a duplicate `depends_on` array on the
-- node (see redundancy note R1 in docs/12_DNA_TABLE_v1.0.md).
CREATE TABLE thinking_graph_edge (
  edge_id         TEXT PRIMARY KEY,
  solution_id     TEXT NOT NULL REFERENCES solution(solution_id),  -- denormalized for per-solution queries
  parent_node_id  TEXT NOT NULL REFERENCES thinking_graph_node(node_id),
  child_node_id   TEXT NOT NULL REFERENCES thinking_graph_node(node_id),
  relation        TEXT NOT NULL CHECK (relation IN
                    ('supports','requires','derives','motivates','splits_into',
                     'resolves','contradicts','concludes')),
  -- Reasoning Action per Constitution: "an attribute of the edge, not a
  -- separate layer." Mandatory — every validation to date assigned exactly
  -- one primary action to every reasoning edge without exception.
  action_type_id  TEXT NOT NULL REFERENCES reasoning_action_type(action_type_id),
  UNIQUE (parent_node_id, child_node_id)
);

CREATE TABLE principle_instance (
  instance_id           TEXT PRIMARY KEY,
  solution_id           TEXT NOT NULL REFERENCES solution(solution_id),
  principle_type_id     TEXT NOT NULL REFERENCES principle_type(principle_type_id),
  -- Nullable: cross-cutting principles (e.g. the involution-symmetry P8 in
  -- 2008-A1, the numeral-representation P7 in 2006-A3) attach to no single
  -- strategy by construction.
  primary_strategy_id   TEXT REFERENCES strategy(strategy_id),
  is_cross_cutting      BOOLEAN NOT NULL DEFAULT FALSE,
  is_problem_intrinsic  TEXT NOT NULL CHECK (is_problem_intrinsic IN
                          ('intrinsic','solution_specific','mixed')),
  -- 'low' marks classifications made without a confirming alternate solution
  -- to test against (2008-A1 ideas 6-7 were explicitly flagged this way).
  intrinsic_confidence  TEXT NOT NULL DEFAULT 'high' CHECK (intrinsic_confidence IN ('high','low')),
  justification_text    TEXT NOT NULL
);

CREATE TABLE principle_instance_node (          -- optional provenance junction
  instance_id  TEXT NOT NULL REFERENCES principle_instance(instance_id),
  node_id      TEXT NOT NULL REFERENCES thinking_graph_node(node_id),
  PRIMARY KEY (instance_id, node_id)
);

CREATE TABLE principle_dependency_edge (
  edge_id             TEXT PRIMARY KEY,
  source_instance_id  TEXT NOT NULL REFERENCES principle_instance(instance_id),
  target_instance_id  TEXT NOT NULL REFERENCES principle_instance(instance_id),
  relation_type       TEXT NOT NULL CHECK (relation_type IN ('requires','enables','motivates')),
  justification_text  TEXT NOT NULL,           -- must cite a specific node, not narrative order
  UNIQUE (source_instance_id, target_instance_id)
);
