"use client"
// Data and derived state for the redesigned home page (HomeDashboard).
// Loads problems, ladders, the user's profile and progress once, then works out:
//  - the user's stage (new / regular / heavy), which changes what the page shows first
//  - the single "Next up" problem
//  - ranked "For you" recommendations with a short reason for each
//  - per-ladder progress

import { useCallback, useEffect, useMemo, useState } from "react";
import { problemsAPI, problemHierarchiesAPI, type Problem } from "@/lib/supabase";

export type HomeProblem = Problem & {
  solutions?: { content: string; sequence_order?: number }[];
  // Counter columns kept up to date by triggers; not in database.types.ts yet
  likes_count?: number | null;
  starts_count?: number | null;
};

export type UserStage = "new" | "regular" | "heavy";

/** Solved-problem count from which the page switches to the denser "heavy user" layout. */
export const HEAVY_USER_SOLVED = 15;

export interface UserStats {
  current_level: number;
  total_xp: number;
  ranking_points: number;
  tier: string;
  current_streak: number;
  longest_streak: number;
  problems_solved: number;
  problems_attempted: number;
}

export interface CategoryStat {
  category_id: number;
  ranking_points: number;
  tier: string;
  category_name: string | null;
}

interface Profile {
  interestedCategories: string[];
  categoryLevels: Record<string, number>;
  userCategoryLevels: { category_id: number; level_score: number; category_name: string | null }[];
  userStats?: UserStats;
  userCategoryStats: CategoryStat[];
}

interface Progress {
  solvedIds: Set<string>;
  attemptedIds: Set<string>;
  recentStarts: { problemId: string; startedAt: string }[];
}

interface HierarchyRow {
  parent_problem_id: string;
  child_problem_id: string;
  stage_name: string | null;
  sequence_order: number | null;
}

export interface LadderStep {
  problem: HomeProblem;
  label: string; // "Step 1", "Bridge", "Challenge"
}

export interface Ladder {
  root: HomeProblem;
  name: string;
  steps: LadderStep[]; // easiest first, the root (Challenge) last
  solvedCount: number;
  next: LadderStep | null; // first unsolved step, null when finished
  matchesInterest: boolean;
}

export interface Recommendation {
  problem: HomeProblem;
  reasons: string[];
  ladder?: Ladder;
  /** What opens when the row is clicked: for a ladder, its next unsolved step. */
  entry: HomeProblem;
}

export type NextUp =
  | { kind: "resume"; problem: HomeProblem; startedAt: string; ladder?: Ladder; stepLabel?: string }
  | { kind: "ladder"; problem: HomeProblem; ladder: Ladder; stepLabel: string }
  | { kind: "first-step"; problem: HomeProblem; ladder: Ladder; stepLabel: string }
  | { kind: "recommended"; problem: HomeProblem; reasons: string[] };

const EMPTY_PROGRESS: Progress = { solvedIds: new Set(), attemptedIds: new Set(), recentStarts: [] };

const hasSource = (p: HomeProblem) => !!p.source && p.source.trim() !== "";

export function ladderName(title: string) {
  return title.replace(/\s*[—-]\s*Challenge\s*$/i, "").trim();
}

export function useHomeData() {
  const [problems, setProblems] = useState<HomeProblem[]>([]);
  const [links, setLinks] = useState<HierarchyRow[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/user/progress");
      if (!res.ok) return;
      const data = await res.json();
      setProgress({
        solvedIds: new Set(data.solvedIds || []),
        attemptedIds: new Set(data.attemptedIds || []),
        recentStarts: data.recentStarts || [],
      });
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [all, hierarchy, profileRes] = await Promise.all([
          problemsAPI.getAll(),
          problemHierarchiesAPI.getAll(),
          fetch("/api/user/profile").then((r) => (r.ok ? r.json() : null)),
          refreshProgress(),
        ]);
        setProblems(all as HomeProblem[]);
        setLinks(hierarchy as HierarchyRow[]);
        if (profileRes) {
          setProfile({
            interestedCategories: profileRes.interested_categories || [],
            categoryLevels: profileRes.category_levels || {},
            userCategoryLevels: profileRes.user_category_levels || [],
            userStats: profileRes.user_stats,
            userCategoryStats: profileRes.user_category_stats || [],
          });
        }
      } catch (err) {
        console.error("Failed to load home data:", err);
        setLoadError("Problems could not be loaded. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [refreshProgress]);

  const problemsById = useMemo(() => new Map(problems.map((p) => [p.id, p])), [problems]);

  // --- Interest matching -------------------------------------------------
  const interest = useMemo(() => {
    const catIds = new Set((profile?.userCategoryLevels || []).map((c) => c.category_id));
    const names = [
      ...(profile?.interestedCategories || []),
      ...(profile?.userCategoryLevels || []).map((c) => c.category_name).filter((n): n is string => !!n),
    ].map((n) => n.toLowerCase());
    const uniqueNames = [...new Set(names)];

    /** Returns the matched interest label, or null. */
    const match = (p: HomeProblem): string | null => {
      for (const id of [p.category_level1, p.category_level2, p.category_level3]) {
        if (id != null && catIds.has(id)) {
          const hit = profile?.userCategoryLevels.find((c) => c.category_id === id);
          return hit?.category_name || p.category_path?.split(" > ")[0] || "your interests";
        }
      }
      const path = p.category_path?.toLowerCase() || "";
      const name = uniqueNames.find((n) => path.includes(n));
      if (name) return (profile?.interestedCategories || []).find((c) => c.toLowerCase() === name) || name;
      return null;
    };
    return { match, hasAny: catIds.size > 0 || uniqueNames.length > 0 };
  }, [profile]);

  // --- Ladders (problems that have steps under them) -----------------------
  const { ladders, ladderOfProblem, stepIds } = useMemo(() => {
    const childrenOf = new Map<string, HierarchyRow[]>();
    for (const l of links) {
      if (!childrenOf.has(l.parent_problem_id)) childrenOf.set(l.parent_problem_id, []);
      childrenOf.get(l.parent_problem_id)!.push(l);
    }
    const stepIds = new Set(links.map((l) => l.child_problem_id));
    const ladderOfProblem = new Map<string, Ladder>();
    const ladders: Ladder[] = [];

    // Steps in study order: deepest (easiest) first, children in sequence order.
    const collect = (parentId: string, seen: Set<string>): LadderStep[] => {
      const kids = [...(childrenOf.get(parentId) || [])].sort(
        (a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0)
      );
      const out: LadderStep[] = [];
      for (const k of kids) {
        if (seen.has(k.child_problem_id)) continue;
        seen.add(k.child_problem_id);
        const p = problemsById.get(k.child_problem_id);
        if (!p) continue;
        out.push(...collect(p.id, seen));
        out.push({ problem: p, label: k.stage_name || `Step ${out.length + 1}` });
      }
      return out;
    };

    for (const root of problems) {
      if (stepIds.has(root.id) || !childrenOf.has(root.id) || !hasSource(root)) continue;
      const steps = [...collect(root.id, new Set([root.id])), { problem: root, label: "Challenge" }];
      const solvedCount = steps.filter((s) => progress.solvedIds.has(s.problem.id)).length;
      const ladder: Ladder = {
        root,
        name: ladderName(root.title),
        steps,
        solvedCount,
        next: steps.find((s) => !progress.solvedIds.has(s.problem.id)) || null,
        matchesInterest: !!interest.match(root),
      };
      ladders.push(ladder);
      for (const s of steps) ladderOfProblem.set(s.problem.id, ladder);
    }

    // In progress first, then ones that match interests, then not started, finished last.
    const rank = (l: Ladder) =>
      l.next === null ? 3 : l.solvedCount > 0 ? 0 : l.matchesInterest ? 1 : 2;
    ladders.sort((a, b) => rank(a) - rank(b) || a.steps[0].problem.difficulty - b.steps[0].problem.difficulty);

    return { ladders, ladderOfProblem, stepIds };
  }, [problems, links, problemsById, progress.solvedIds, interest]);

  // --- Stage ------------------------------------------------------------------
  const solvedCount = Math.max(progress.solvedIds.size, profile?.userStats?.problems_solved || 0);
  const stage: UserStage =
    solvedCount >= HEAVY_USER_SOLVED ? "heavy" : solvedCount === 0 && progress.recentStarts.length === 0 ? "new" : "regular";

  // --- Target difficulty ---------------------------------------------------
  // Start from the self-reported onboarding levels; once the user has solved a few problems,
  // aim one level above what they have actually been solving.
  const targetDifficulty = useMemo(() => {
    const solved = [...progress.solvedIds].map((id) => problemsById.get(id)).filter((p): p is HomeProblem => !!p);
    if (solved.length >= 3) {
      const avg = solved.reduce((s, p) => s + p.difficulty, 0) / solved.length;
      return Math.min(10, Math.round(avg + 1));
    }
    const scores = [
      ...(profile?.userCategoryLevels || []).map((c) => c.level_score),
      ...Object.values(profile?.categoryLevels || {}),
    ].filter((n) => typeof n === "number" && n > 0);
    if (scores.length > 0) return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    return 3;
  }, [progress.solvedIds, problemsById, profile]);

  // --- Recommendations ------------------------------------------------------
  const recommendations: Recommendation[] = useMemo(() => {
    const pool = problems.filter((p) => hasSource(p) && !stepIds.has(p.id));
    return pool
      .map((p) => {
        const matched = interest.match(p);
        const ladder = ladderOfProblem.get(p.id);
        // A ladder is entered at its next unsolved step, so judge it by that step's difficulty.
        const entry = ladder?.next?.problem ?? p;
        const distance = Math.abs(entry.difficulty - targetDifficulty);
        const popularity = (p.likes_count || 0) + (p.starts_count || 0);
        const score =
          (matched ? 3 : 0) - distance * 0.8 + Math.log1p(popularity) * 0.3 + (ladder ? 0.5 : 0);

        const reasons: string[] = [];
        if (matched) reasons.push(`Matches ${matched}`);
        if (distance <= 1) reasons.push("At your level");
        else if (entry.difficulty > targetDifficulty + 2) reasons.push("Stretch goal");
        if (popularity >= 60) reasons.push("Popular");
        return { problem: p, reasons: reasons.slice(0, 2), ladder, entry, score };
      })
      .sort((a, b) => b.score - a.score)
      .map(({ problem, reasons, ladder, entry }) => ({ problem, reasons, ladder, entry }));
  }, [problems, stepIds, interest, targetDifficulty, ladderOfProblem]);

  // --- Next up --------------------------------------------------------------
  const nextUp: NextUp | null = useMemo(() => {
    const resume = progress.recentStarts.find(
      (s) => problemsById.has(s.problemId) && !progress.solvedIds.has(s.problemId)
    );
    if (resume) {
      const problem = problemsById.get(resume.problemId)!;
      const ladder = ladderOfProblem.get(problem.id);
      const stepLabel = ladder?.steps.find((s) => s.problem.id === problem.id)?.label;
      return { kind: "resume", problem, startedAt: resume.startedAt, ladder, stepLabel };
    }
    const inProgress = ladders.find((l) => l.solvedCount > 0 && l.next);
    if (inProgress?.next) {
      return { kind: "ladder", problem: inProgress.next.problem, ladder: inProgress, stepLabel: inProgress.next.label };
    }
    if (stage === "new") {
      const first = ladders.find((l) => l.next);
      if (first?.next) return { kind: "first-step", problem: first.next.problem, ladder: first, stepLabel: first.next.label };
    }
    const top = recommendations.find((r) => !progress.solvedIds.has(r.problem.id));
    return top ? { kind: "recommended", problem: top.problem, reasons: top.reasons } : null;
  }, [progress, problemsById, ladderOfProblem, ladders, stage, recommendations]);

  return {
    isLoading,
    loadError,
    profile,
    problemsById,
    progress,
    refreshProgress,
    stage,
    solvedCount,
    targetDifficulty,
    hasInterests: interest.hasAny,
    ladders,
    ladderOfProblem,
    recommendations,
    nextUp,
  };
}
