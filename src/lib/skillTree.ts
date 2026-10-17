// Skill tree and badges: rules and calculation (docs/SKILL_TREE_RULES.md).
//
// Pure functions only: give it the ladders, the problems in them and the ids the user has solved, and it
// returns every domain, subdomain and badge. Nothing is stored; badges are worked out from the solve record,
// so the same record always gives the same badges. Change the numbers in RULES (doc section 7) to tune.

import { SKILL_MAP, placeOfCategory } from "@/lib/skillMap";

export const RULES = {
  hardDifficulty: 7, // "hard" = difficulty 7 or more
  pointsPerDifficulty: 10, // domain points for a solved problem = 10 x difficulty (same as RP, without bonuses)
  explorer: { solved: 5, ladders: 2 },
  specialist: { solved: 15, atLeastDifficulty: 6, count: 4 },
  virtuoso: { solved: 30, hard: 5, challenges: 2 },
  expert: { hard: 10, points: 1000, explorerSubdomains: 2 },
  champion: { hard: 25, points: 3000, specialistSubdomains: 2, challenges: 5 },
  legend: { hard: 50, points: 7000, virtuosoSubdomains: 1, specialistSubdomains: 3 },
  polymath: { domainsWithExplorer: 3 },
  universalMind: { domainsWithExpert: 3 },
  ladderBadges: [
    { name: "First Summit", ladders: 1 },
    { name: "Climber", ladders: 5 },
    { name: "Mountaineer", ladders: 20 },
    { name: "Summiteer", ladders: 50 },
  ],
  trailblazerFirstSolvers: 3,
  // Badges added 2026-10-17 (docs/SKILL_TREE_RULES.md section 4.6)
  navigator: { explorerSubdomains: 2 }, // area (middle level of lib/skillMap.ts): Explorer in 2 of its core topics
  cartographer: { groups: 5 }, // solved problems in 5 different areas
  thorough: { ladders: 3 }, // finished 3 ladders with every step solved, not only the Challenge
  firstTry: [
    { name: "First Try", challenges: 1 },
    { name: "Sharpshooter", challenges: 5 },
  ], // Challenges correct on the first attempt
  persistent: [
    { name: "Persistent", problems: 1 },
    { name: "Unstoppable", problems: 5 },
  ], // problems solved after at least `wrongTries` wrong attempts
  wrongTries: 3,
  /** A tier is shown only when the subdomain has this many times the problems it needs. */
  reachableFactor: 1.5,
} as const;

export const SUBDOMAIN_TIERS = ["Explorer", "Specialist", "Virtuoso"] as const;
export const DOMAIN_TIERS = ["Expert", "Champion", "Legend"] as const;
export type SubdomainTier = (typeof SUBDOMAIN_TIERS)[number];
export type DomainTier = (typeof DOMAIN_TIERS)[number];

// ---------------------------------------------------------------------------------------------------------
// Input and output types
// ---------------------------------------------------------------------------------------------------------

export interface SkillProblem {
  id: string;
  difficulty: number;
  category_level1: number | null;
  category_level2: number | null;
  category_level3: number | null;
}

export interface SkillLadder {
  rootId: string; // the Challenge
  name: string;
  problemIds: string[]; // every step and the Challenge, easiest first
}

/** One rule of a badge, e.g. "hard problems 3 / 10". */
export interface Requirement {
  label: string;
  have: number;
  need: number;
}

export interface NextTier<T extends string> {
  tier: T;
  requirements: Requirement[];
  /** false when there are not yet enough problems on the site to reach this tier */
  reachable: boolean;
}

export interface SubdomainProgress {
  id: number;
  name: string;
  groupId: number | null; // level-2 category, used to group nodes on screen
  groupName: string;
  total: number;
  solved: number;
  hardSolved: number;
  challengesSolved: number;
  laddersTouched: number;
  ladders: { rootId: string; name: string; solved: number; total: number }[];
  tier: SubdomainTier | null;
  next: NextTier<SubdomainTier> | null;
}

export interface DomainProgress {
  id: number;
  name: string;
  total: number;
  solved: number;
  hardSolved: number;
  points: number;
  tier: DomainTier | null;
  next: NextTier<DomainTier> | null;
  subdomains: SubdomainProgress[];
}

export type BadgeKind = "subdomain" | "group" | "domain" | "breadth" | "ladder" | "style";

export interface Badge {
  key: string;
  name: string;
  kind: BadgeKind;
  level: number; // 1 bronze, 2 silver, 3 gold (breadth and ladder badges: 1-4 by difficulty)
  detail: string;
}

/** A badge not earned yet, with what it needs; the page shows the closest few. */
export interface UpcomingBadge {
  key: string;
  name: string;
  requirements: Requirement[];
  /** share of the requirements done, 0..1 (average over the requirements) */
  progress: number;
}

export interface SkillTree {
  domains: DomainProgress[];
  badges: Badge[];
  laddersFinished: number;
  /** reachable badges not earned yet, closest first */
  upcoming: UpcomingBadge[];
}

// ---------------------------------------------------------------------------------------------------------
// Calculation
// ---------------------------------------------------------------------------------------------------------


/** Short display name for a domain ("Combinatorics & Discrete Mathematics" -> "Combinatorics"). */
export function shortDomainName(name: string) {
  return name.replace(/ & Discrete Mathematics$/, "");
}

function req(label: string, have: number, need: number): Requirement {
  return { label, have, need };
}

const met = (rs: Requirement[]) => rs.every((r) => r.have >= r.need);

/** Highest tier whose rules (and all lower tiers' rules) are met, plus what the next tier needs. */
function climb<T extends string>(tiers: readonly T[], rules: Requirement[][], reachable: boolean[]) {
  let tier: T | null = null;
  for (let i = 0; i < tiers.length; i++) {
    if (!met(rules[i])) {
      return { tier, next: { tier: tiers[i], requirements: rules[i], reachable: reachable[i] } };
    }
    tier = tiers[i];
  }
  return { tier, next: null };
}

export function computeSkillTree(
  ladders: SkillLadder[],
  problems: Map<string, SkillProblem>,
  solvedIds: Set<string>,
  trailblazerRootIds: Set<string> = new Set(),
  /** for each solved problem: wrong attempts before the first correct one (from /api/user/first-solves) */
  wrongBeforeSolve: Map<string, number> = new Map()
): SkillTree {
  const hard = (p: SkillProblem) => p.difficulty >= RULES.hardDifficulty;
  const challengeIds = new Set(ladders.map((l) => l.rootId));

  // Every problem of a ladder takes the ladder Challenge's categories unless it has its own subdomain.
  // Each problem is placed on the skill map (field > area > core topic) by its level-3 category (lib/skillMap.ts).
  type Entry = { p: SkillProblem; ladder: SkillLadder; l1: number; l2: number | null; l3: number | null; topic: number; area: number; field: number };
  const entries: Entry[] = [];
  for (const ladder of ladders) {
    const root = problems.get(ladder.rootId);
    if (!root || root.category_level1 == null) continue;
    for (const id of ladder.problemIds) {
      const p = problems.get(id);
      if (!p) continue;
      const own = p.category_level3 != null && p.category_level1 != null;
      entries.push({
        p,
        ladder,
        l1: own ? p.category_level1! : root.category_level1,
        l2: own ? p.category_level2 : root.category_level2,
        l3: own ? p.category_level3 : root.category_level3,
        topic: 0, area: 0, field: 0,
      });
      const e = entries[entries.length - 1];
      const place = placeOfCategory(e.l3);
      if (!place) {
        entries.pop(); // not on the skill map (e.g. Analysis): not shown
        continue;
      }
      e.topic = place.topic.id;
      e.area = place.area.id;
      e.field = place.field.id;
    }
  }

  const domains: DomainProgress[] = [];
  const badges: Badge[] = [];
  const upcoming: UpcomingBadge[] = [];
  const progressOf = (rs: Requirement[]) => rs.reduce((a, r) => a + Math.min(1, r.have / r.need), 0) / rs.length;
  const addUpcoming = (key: string, name: string, next: { requirements: Requirement[]; reachable: boolean } | null) => {
    if (next && next.reachable) upcoming.push({ key, name, requirements: next.requirements, progress: progressOf(next.requirements) });
  };

  for (const fieldDef of SKILL_MAP) {
    const l1 = fieldDef.id;
    const inDomain = entries.filter((e) => e.field === l1);
    const solvedInDomain = inDomain.filter((e) => solvedIds.has(e.p.id));
    const domainName = fieldDef.name;

    // Subdomains
    const subdomains: SubdomainProgress[] = [];
    // Every core topic of the field is listed, also the ones with no ladders yet ("coming soon")
    for (const { area, topic } of fieldDef.areas.flatMap((area) => area.topics.map((topic) => ({ area, topic })))) {
      const l3 = topic.id;
      const inSub = inDomain.filter((e) => e.topic === l3);
      const solved = inSub.filter((e) => solvedIds.has(e.p.id));
      const ladderMap = new Map<string, { rootId: string; name: string; solved: number; total: number }>();
      for (const e of inSub) {
        const row = ladderMap.get(e.ladder.rootId) ?? { rootId: e.ladder.rootId, name: e.ladder.name, solved: 0, total: 0 };
        row.total += 1;
        if (solvedIds.has(e.p.id)) row.solved += 1;
        ladderMap.set(e.ladder.rootId, row);
      }
      const laddersTouched = [...ladderMap.values()].filter((l) => l.solved > 0).length;
      const hardSolved = solved.filter((e) => hard(e.p)).length;
      const midSolved = solved.filter((e) => e.p.difficulty >= RULES.specialist.atLeastDifficulty).length;
      const challengesSolved = solved.filter((e) => challengeIds.has(e.p.id)).length;
      const totalHard = inSub.filter((e) => hard(e.p)).length;
      const totalMid = inSub.filter((e) => e.p.difficulty >= RULES.specialist.atLeastDifficulty).length;
      const totalChallenges = inSub.filter((e) => challengeIds.has(e.p.id)).length;
      const f = RULES.reachableFactor;
      const n = inSub.length;

      const { tier, next } = climb(
        SUBDOMAIN_TIERS,
        [
          [req("problems solved", solved.length, RULES.explorer.solved), req("ladders", laddersTouched, RULES.explorer.ladders)],
          [req("problems solved", solved.length, RULES.specialist.solved), req(`solved at difficulty ${RULES.specialist.atLeastDifficulty}+`, midSolved, RULES.specialist.count)],
          [req("problems solved", solved.length, RULES.virtuoso.solved), req("hard problems solved", hardSolved, RULES.virtuoso.hard), req("Challenges solved", challengesSolved, RULES.virtuoso.challenges)],
        ],
        [
          n >= RULES.explorer.solved * f && ladderMap.size >= RULES.explorer.ladders,
          n >= RULES.specialist.solved * f && totalMid >= RULES.specialist.count,
          n >= RULES.virtuoso.solved * f && totalHard >= RULES.virtuoso.hard && totalChallenges >= RULES.virtuoso.challenges,
        ]
      );

      const groupId = area.id;
      const name = topic.name;
      subdomains.push({
        id: l3, name, groupId, groupName: area.name,
        total: n, solved: solved.length, hardSolved, challengesSolved, laddersTouched,
        ladders: [...ladderMap.values()], tier, next,
      });
      if (tier) {
        badges.push({
          key: `sub-${l3}`, name: `${name} ${tier}`, kind: "subdomain",
          level: SUBDOMAIN_TIERS.indexOf(tier) + 1, detail: `${solved.length} problems solved in ${name}`,
        });
      }
      if (solved.length > 0 && next) addUpcoming(`sub-${l3}-next`, `${name} ${next.tier}`, next);
    }

    // Domain badge
    const hardSolved = solvedInDomain.filter((e) => hard(e.p)).length;
    const points = solvedInDomain.reduce((s, e) => s + RULES.pointsPerDifficulty * e.p.difficulty, 0);
    const atLeast = (t: SubdomainTier) => subdomains.filter((s) => s.tier && SUBDOMAIN_TIERS.indexOf(s.tier) >= SUBDOMAIN_TIERS.indexOf(t)).length;
    const challengesSolved = solvedInDomain.filter((e) => challengeIds.has(e.p.id)).length;
    const totalHard = inDomain.filter((e) => hard(e.p)).length;
    const totalChallenges = inDomain.filter((e) => challengeIds.has(e.p.id)).length;
    const f = RULES.reachableFactor;
    const { tier, next } = climb(
      DOMAIN_TIERS,
      [
        [req("hard problems solved", hardSolved, RULES.expert.hard), req("domain points", points, RULES.expert.points), req("Explorer subdomains", atLeast("Explorer"), RULES.expert.explorerSubdomains)],
        [req("hard problems solved", hardSolved, RULES.champion.hard), req("domain points", points, RULES.champion.points), req("Specialist subdomains", atLeast("Specialist"), RULES.champion.specialistSubdomains), req("Challenges solved", challengesSolved, RULES.champion.challenges)],
        [req("hard problems solved", hardSolved, RULES.legend.hard), req("domain points", points, RULES.legend.points), req("Virtuoso subdomains", atLeast("Virtuoso"), RULES.legend.virtuosoSubdomains), req("Specialist subdomains", atLeast("Specialist"), RULES.legend.specialistSubdomains)],
      ],
      [
        totalHard >= RULES.expert.hard * f,
        totalHard >= RULES.champion.hard * f && totalChallenges >= RULES.champion.challenges,
        totalHard >= RULES.legend.hard * f,
      ]
    );
    if (tier) {
      badges.push({
        key: `dom-${l1}`, name: `${domainName} ${tier}`, kind: "domain",
        level: DOMAIN_TIERS.indexOf(tier) + 1, detail: `${hardSolved} hard problems, ${points} points in ${domainName}`,
      });
    }
    if (solvedInDomain.length > 0 && next) addUpcoming(`dom-${l1}-next`, `${domainName} ${next.tier}`, next);

    // Group badges (level-2 categories): Navigator = Explorer in 2 subdomains of the group
    const groupIds = [...new Set(subdomains.map((s) => s.groupId).filter((g): g is number => g != null))];
    for (const g of groupIds) {
      const subs = subdomains.filter((s) => s.groupId === g);
      const explorers = subs.filter((s) => s.tier).length;
      const groupName = fieldDef.areas.find((a) => a.id === g)?.name ?? "Area";
      const need = RULES.navigator.explorerSubdomains;
      if (explorers >= need) {
        badges.push({ key: `grp-${g}`, name: `${groupName} Navigator`, kind: "group", level: 2, detail: `Explorer in ${explorers} topics of ${groupName}` });
      } else if (subs.some((s) => s.solved > 0)) {
        addUpcoming(`grp-${g}-next`, `${groupName} Navigator`, {
          requirements: [req("Explorer topics in this area", explorers, need)],
          reachable: subs.filter((s) => s.total > 0).length >= need,
        });
      }
    }

    domains.push({
      id: l1, name: domainName, total: inDomain.length, solved: solvedInDomain.length,
      hardSolved, points, tier, next, subdomains,
    });
  }

  // Breadth badges
  const withExplorer = domains.filter((d) => d.subdomains.some((s) => s.tier)).length;
  if (withExplorer >= RULES.polymath.domainsWithExplorer) {
    badges.push({ key: "polymath", name: "Polymath", kind: "breadth", level: 2, detail: `Explorer badges in ${withExplorer} domains` });
  }
  const withExpert = domains.filter((d) => d.tier).length;
  if (withExpert >= RULES.universalMind.domainsWithExpert) {
    badges.push({ key: "universal-mind", name: "Universal Mind", kind: "breadth", level: 3, detail: `Expert badges in ${withExpert} domains` });
  }
  const allSubs = domains.flatMap((d) => d.subdomains);
  const groupsTouched = new Set(allSubs.filter((s) => s.solved > 0).map((s) => s.groupId ?? -s.id)).size;
  const allGroups = new Set(allSubs.filter((s) => s.total > 0).map((s) => s.groupId ?? -s.id)).size;
  if (groupsTouched >= RULES.cartographer.groups) {
    badges.push({ key: "cartographer", name: "Cartographer", kind: "breadth", level: 2, detail: `problems solved in ${groupsTouched} areas` });
  } else if (groupsTouched > 0) {
    addUpcoming("cartographer-next", "Cartographer", {
      requirements: [req("areas with a solved problem", groupsTouched, RULES.cartographer.groups)],
      reachable: allGroups >= RULES.cartographer.groups,
    });
  }

  // Ladder badges: a ladder is finished when its Challenge is solved
  const laddersFinished = ladders.filter((l) => solvedIds.has(l.rootId)).length;
  RULES.ladderBadges.forEach((b, i) => {
    if (laddersFinished >= b.ladders) {
      badges.push({ key: `ladders-${b.ladders}`, name: b.name, kind: "ladder", level: i + 1, detail: `${laddersFinished} ladders finished` });
    }
  });
  const nextLadderBadge = RULES.ladderBadges.find((b) => laddersFinished < b.ladders);
  if (nextLadderBadge && ladders.length >= nextLadderBadge.ladders) {
    addUpcoming(`ladders-${nextLadderBadge.ladders}-next`, nextLadderBadge.name, {
      requirements: [req("ladders finished", laddersFinished, nextLadderBadge.ladders)], reachable: true,
    });
  }
  const thorough = ladders.filter((l) => l.problemIds.every((id) => solvedIds.has(id))).length;
  if (thorough >= RULES.thorough.ladders) {
    badges.push({ key: "thorough", name: "Thorough", kind: "ladder", level: 2, detail: `${thorough} ladders with every step solved` });
  } else if (thorough > 0 || laddersFinished > 0) {
    addUpcoming("thorough-next", "Thorough", {
      requirements: [req("ladders with every step solved", thorough, RULES.thorough.ladders)],
      reachable: ladders.length >= RULES.thorough.ladders,
    });
  }
  if (trailblazerRootIds.size > 0) {
    badges.push({
      key: "trailblazer", name: "Trailblazer", kind: "ladder", level: 3,
      detail: `among the first ${RULES.trailblazerFirstSolvers} to solve ${trailblazerRootIds.size} Challenge${trailblazerRootIds.size > 1 ? "s" : ""}`,
    });
  }

  // Style badges, from the attempt record
  const firstTry = [...challengeIds].filter((id) => solvedIds.has(id) && wrongBeforeSolve.get(id) === 0).length;
  RULES.firstTry.forEach((b, i) => {
    if (firstTry >= b.challenges) {
      badges.push({ key: `first-try-${b.challenges}`, name: b.name, kind: "style", level: i + 1, detail: `${firstTry} Challenges correct on the first attempt` });
    }
  });
  const persistent = [...solvedIds].filter((id) => (wrongBeforeSolve.get(id) ?? 0) >= RULES.wrongTries).length;
  RULES.persistent.forEach((b, i) => {
    if (persistent >= b.problems) {
      badges.push({ key: `persistent-${b.problems}`, name: b.name, kind: "style", level: i + 1, detail: `${persistent} problems solved after ${RULES.wrongTries}+ wrong tries` });
    }
  });

  upcoming.sort((a, b) => b.progress - a.progress);
  return { domains, badges, laddersFinished, upcoming };
}
