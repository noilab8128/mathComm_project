// The skill map: the short 3-level list of topics the Skill Tree shows (decided 2026-10-17, docs/SKILL_TREE_RULES.md
// section 2.3). The 115 categories (src/lib/categories.ts) stay as they are for tagging problems; each core topic
// here gathers one or more level-3 categories, so no problem has to be re-tagged.
//
//   field (4, the olympiad areas)  >  area (2 per field)  >  core topic (2 per area) = 16 core topics
//
// Ids are fixed numbers so they can be stored later (badges): fields use their level-1 category id, areas 201..,
// core topics 301... Categories not listed here (Analysis, Statistics, …) have no ladders and are not shown.

export interface CoreTopic {
  id: number;
  name: string;
  categoryIds: number[]; // level-3 category ids gathered here
}

export interface MapArea {
  id: number;
  name: string;
  topics: CoreTopic[];
}

export interface MapField {
  id: number; // the level-1 category id
  name: string;
  areas: MapArea[];
}

export const SKILL_MAP: MapField[] = [
  {
    id: 1,
    name: "Algebra",
    areas: [
      {
        id: 201,
        name: "Equations and Inequalities",
        topics: [
          { id: 301, name: "Inequalities and Optimization", categoryIds: [46] },
          { id: 302, name: "Polynomials and Factoring", categoryIds: [45, 47, 48] },
        ],
      },
      {
        id: 202,
        name: "Functions and Sequences",
        topics: [
          { id: 303, name: "Sequences, Sums and Floors", categoryIds: [103, 105] },
          { id: 304, name: "Functional Equations", categoryIds: [104] },
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Number Theory",
    areas: [
      {
        id: 203,
        name: "Divisibility",
        topics: [
          { id: 305, name: "Primes and Divisors", categoryIds: [81, 106, 84, 85] },
          { id: 306, name: "Congruences", categoryIds: [82] },
        ],
      },
      {
        id: 204,
        name: "Equations and Digits",
        topics: [
          { id: 307, name: "Diophantine Equations", categoryIds: [83] },
          { id: 308, name: "Digits and Bases", categoryIds: [107] },
        ],
      },
    ],
  },
  {
    id: 5,
    name: "Combinatorics",
    areas: [
      {
        id: 205,
        name: "Counting",
        topics: [
          { id: 309, name: "Counting and Probability", categoryIds: [86, 87, 88, 114, 96, 97, 98, 99] },
          { id: 310, name: "Graphs", categoryIds: [89, 90, 91, 92] },
        ],
      },
      {
        id: 206,
        name: "Combinatorial Reasoning",
        topics: [
          { id: 311, name: "Invariants and Games", categoryIds: [109, 112] },
          { id: 312, name: "Extremal and Pigeonhole", categoryIds: [110, 111, 113] },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Geometry",
    areas: [
      {
        id: 207,
        name: "Triangles and Circles",
        topics: [
          { id: 313, name: "Triangle Centres and Circles", categoryIds: [115] },
          { id: 314, name: "Congruence and Similarity", categoryIds: [60, 57] },
        ],
      },
      {
        id: 208,
        name: "Measurement",
        topics: [
          { id: 315, name: "Lengths, Areas and Trigonometry", categoryIds: [59, 58] },
          { id: 316, name: "Coordinates and Vectors", categoryIds: [61, 62, 63] },
        ],
      },
    ],
  },
];

export interface TopicPlace {
  field: MapField;
  area: MapArea;
  topic: CoreTopic;
}

const PLACE_BY_CATEGORY = new Map<number, TopicPlace>();
const PLACE_BY_TOPIC = new Map<number, TopicPlace>();
for (const field of SKILL_MAP) {
  for (const area of field.areas) {
    for (const topic of area.topics) {
      const place = { field, area, topic };
      PLACE_BY_TOPIC.set(topic.id, place);
      for (const c of topic.categoryIds) PLACE_BY_CATEGORY.set(c, place);
    }
  }
}

/** Where a level-3 category sits on the skill map, or null if it is not on the map. */
export function placeOfCategory(level3Id: number | null | undefined): TopicPlace | null {
  return level3Id != null ? PLACE_BY_CATEGORY.get(level3Id) ?? null : null;
}

export function placeOfTopic(topicId: number): TopicPlace | null {
  return PLACE_BY_TOPIC.get(topicId) ?? null;
}
