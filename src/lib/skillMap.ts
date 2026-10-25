// The skill map: the categories the Skill Tree shows (decided 2026-10-24, docs/SKILL_TREE_RULES.md section 2.3).
// It follows the team's category file (math_Category_Schema.xlsx: category_1 > category_2 > category_3) and keeps
// only the parts that appear in competition problems (Kangaroo, MATHCOUNTS, AMC, AIME, olympiads). The 13 olympiad
// topics added on 2026-10-09 (ids 103-115) stay in their place under the file's groups.
//
//   field (category_1, 5)  >  area (category_2, 10)  >  topic (category_3, 39)
//
// Ids are the category ids (src/lib/categories.ts), so a problem's place on the map is simply its category_level3.

import { CATEGORIES_DATA } from "@/lib/categories";

export interface CoreTopic {
  id: number;
  name: string;
  categoryIds: number[]; // level-3 category ids gathered here (one each: the topic itself)
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

/**
 * Level-3 categories shown on the map, in display order. Everything else is left out because it does not appear in
 * competition problems: Analysis, Linear and Abstract Algebra, Differential Geometry, Topology, Analytic Number
 * Theory, Predicate Logic, Random Variables and Distributions, Estimation and Hypothesis Testing, Regression,
 * Optimization Theory, Numerical Analysis, Cryptography and Game Theory (combinatorial games are under
 * "Games and Strategies").
 */
export const COMPETITION_TOPIC_IDS = [
  // Algebra > Elementary Algebra
  45, 46, 47, 48, 103, 104, 105,
  // Geometry > Euclidean Geometry, Analytic Geometry
  57, 58, 59, 60, 115, 61, 62, 63,
  // Number Theory > Elementary Number Theory
  81, 82, 83, 106, 107,
  // Combinatorics & Discrete Mathematics > Enumeration, Graph Theory, Logic and Set Theory, Combinatorial Reasoning
  86, 87, 88, 114, 89, 90, 91, 92, 93, 95, 109, 110, 111, 112, 113,
  // Probability & Statistics > Probability, Statistics
  96, 97, 99, 100,
];

const BY_ID = new Map(CATEGORIES_DATA.map((c) => [c.id, c]));

function buildMap(): MapField[] {
  const fields: MapField[] = [];
  for (const topicId of COMPETITION_TOPIC_IDS) {
    const topic = BY_ID.get(topicId);
    const area = topic?.parent_id != null ? BY_ID.get(topic.parent_id) : undefined;
    const field = area?.parent_id != null ? BY_ID.get(area.parent_id) : undefined;
    if (!topic || !area || !field) continue;
    let f = fields.find((x) => x.id === field.id);
    if (!f) fields.push((f = { id: field.id, name: field.name, areas: [] }));
    let a = f.areas.find((x) => x.id === area.id);
    if (!a) f.areas.push((a = { id: area.id, name: area.name, topics: [] }));
    a.topics.push({ id: topic.id, name: topic.name, categoryIds: [topic.id] });
  }
  return fields;
}

export const SKILL_MAP: MapField[] = buildMap();

export interface TopicPlace {
  field: MapField;
  area: MapArea;
  topic: CoreTopic;
}

const PLACE_BY_CATEGORY = new Map<number, TopicPlace>();
for (const field of SKILL_MAP) {
  for (const area of field.areas) {
    for (const topic of area.topics) {
      for (const c of topic.categoryIds) PLACE_BY_CATEGORY.set(c, { field, area, topic });
    }
  }
}

/** Where a level-3 category sits on the skill map, or null if it is not on the map. */
export function placeOfCategory(level3Id: number | null | undefined): TopicPlace | null {
  return level3Id != null ? PLACE_BY_CATEGORY.get(level3Id) ?? null : null;
}
