/* eslint-disable @typescript-eslint/ban-ts-comment */
// @ts-nocheck
/* eslint-disable */
// UserHomePage Component - Main overview page for MathQuest
// Displays user progress, skill tree, recommended problems, and leaderboard

// User Home Page Component - Updated for Hierarchy
"use client"
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Loader2, Lock, Unlock, BookOpen, Star, Send, Flame, ZoomIn, ZoomOut, Maximize2, Heart, PlusCircle, CheckCircle2, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { MathPreview } from "@/components/MathPreview";
import { supabase, problemsAPI, problemHierarchiesAPI, getDifficultyLabel } from "@/lib/supabase";
import { Sparkles } from "lucide-react";
import { StepsButton } from "@/components/ProblemHierarchyModal";
import { ProblemDialog, convertSupabaseProblem, type ProblemDisplay } from "@/components/ProblemDialog";

// -------------------------------------------------------
// User Preference Helpers
// -------------------------------------------------------
interface UserCategoryLevel {
  category_id: number;
  level_score: number; // 1-10
  category_name: string | null;
}

interface UserPreferences {
  interestedCategories: string[];
  categoryLevels: Record<string, number>; // { categoryName: 1-10 }
  userCategoryLevels: UserCategoryLevel[]; // from user_category_levels DB table
}

/** Convert average category-level score (1-10) to a problem level label */
function scoresToLevelLabel(levels: Record<string, number>): string | null {
  const scores = Object.values(levels);
  if (scores.length === 0) return null;
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  if (avg <= 3) return 'Easy';
  if (avg <= 6) return 'Medium';
  if (avg <= 9) return 'Hard';
  return 'Olympiad';
}

const LEVEL_ORDER: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3, Olympiad: 4 };

/** Returns true if the problem matches the user's preferences */
function matchesPreferences(problem: { category_path?: string | null; level?: string | null }, prefs: UserPreferences | null): boolean {
  if (!prefs || (prefs.interestedCategories.length === 0 && Object.keys(prefs.categoryLevels).length === 0)) return true;
  const catMatch = prefs.interestedCategories.length === 0 || prefs.interestedCategories.some(
    cat => problem.category_path?.toLowerCase().includes(cat.toLowerCase())
  );
  const preferredLevel = scoresToLevelLabel(prefs.categoryLevels);
  const levelMatch = !preferredLevel || (LEVEL_ORDER[problem.level ?? ''] || 0) <= (LEVEL_ORDER[preferredLevel] || 4);
  return catMatch && levelMatch;
}

// -------------------------------------------------------
// My Queue — localStorage-backed picked problems
// -------------------------------------------------------
const QUEUE_STORAGE_KEY = 'mathcomm_my_queue';

interface QueuedProblem {
  id: string;
  title: string;
  difficulty: string;
  source?: string | null;
  xp: number;
}

function useMyQueue() {
  const [queue, setQueue] = useState<QueuedProblem[]>(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(QUEUE_STORAGE_KEY) : null;
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const persist = (next: QueuedProblem[]) => {
    setQueue(next);
    try { localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  };

  const addToQueue = (p: QueuedProblem) => {
    setQueue(prev => {
      if (prev.find(q => q.id === p.id)) return prev;
      const next = [...prev, p];
      try { localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  };

  const removeFromQueue = (id: string) => {
    persist(queue.filter(q => q.id !== id));
  };

  const isQueued = (id: string) => queue.some(q => q.id === id);

  return { queue, addToQueue, removeFromQueue, isQueued };
}

// Weekly leaderboard data
const leaderboard: { name: string; xp: number; streak: number }[] = [
  { name: "Ada L.", xp: 12450, streak: 21 },
  { name: "Carl F.", xp: 11880, streak: 12 },
  { name: "M. Seo", xp: 10320, streak: 8 },
  { name: "Noether E.", xp: 9920, streak: 5 },
];

// Mock data for mastery chart
const masteryByTopic = [
  { topic: "Number Theory", percent: 65 },
  { topic: "Algebra", percent: 45 },
  { topic: "Geometry", percent: 30 },
  { topic: "Combinatorics", percent: 20 },
];

// Skill Node Interface
interface SkillNode {
  id: string;
  label: string;
  x: number;
  y: number;
  unlocked: boolean;
  level: string;
  age: string;
  problems: string[]; // Problem IDs from Supabase
  description: string;
}



// Build hierarchical learning paths based on hierarchy data (like admin page)
function buildLearningPaths(problems: any[], parentMap: Map<string, string>): { nodes: SkillNode[], edges: string[][] } {
  const nodes: SkillNode[] = [];
  const edges: string[][] = [];

  // Find root problems (no parent in hierarchy)
  const rootProblems = problems.filter((p: any) => !parentMap.has(p.id));

  if (rootProblems.length === 0) {
    // If no root problems, use all problems as roots (fallback)
    rootProblems.push(...problems.slice(0, 10));
  }

  // Row index tracking (unused for now but kept for logic structure if needed)
  // let rowIndex = 0;
  const level0X = 150;  // Root problems (left)
  const level1X = 450;  // Level 1 derived problems (middle)
  const level2X = 750;  // Level 2 grandchildren (right)
  const ySpacing = 120; // Vertical spacing between root problems
  const ySpacingDerived = 100; // Vertical spacing for derived problems
  const startY = 80;

  // Process each root problem and its hierarchy
  rootProblems.slice(0, 8).forEach((rootProblem, rootIdx) => {
    const rootNodeId = `problem-${rootProblem.id}`;
    const level = rootProblem.level || getDifficultyLabel(rootProblem.difficulty);

    // Position root problem (Level 0) - left side
    const rootY = startY + (rootIdx * ySpacing);

    nodes.push({
      id: rootNodeId,
      label: rootProblem.title.length > 25 ? rootProblem.title.substring(0, 25) + '...' : rootProblem.title,
      x: level0X,
      y: rootY,
      unlocked: true,
      level: level,
      age: rootProblem.age_range || "All Ages",
      problems: [rootProblem.id],
      description: rootProblem.category_path || level,
    });

    // Find Level 1: Derived problems (children of root)
    const derivedProblems = problems.filter(p => parentMap.get(p.id) === rootProblem.id);
    derivedProblems.sort((a, b) => a.difficulty - b.difficulty);

    let derivedYOffset = 0;
    derivedProblems.forEach((derived) => {
      const derivedNodeId = `problem-${derived.id}`;
      const derivedLevel = derived.level || getDifficultyLabel(derived.difficulty);

      // Position Level 1 problems (middle column) - vertically aligned with root
      const derivedY = rootY + (derivedYOffset);

      nodes.push({
        id: derivedNodeId,
        label: derived.title.length > 25 ? derived.title.substring(0, 25) + '...' : derived.title,
        x: level1X,
        y: derivedY,
        unlocked: true,
        level: derivedLevel,
        age: derived.age_range || "All Ages",
        problems: [derived.id],
        description: derived.category_path || derivedLevel,
      });

      // Create edge from root to derived
      edges.push([rootNodeId, derivedNodeId]);

      // Find Level 2: Grandchildren (children of derived)
      const grandchildren = problems.filter(p => parentMap.get(p.id) === derived.id);
      grandchildren.sort((a, b) => a.difficulty - b.difficulty);

      grandchildren.forEach((grandchild, gcIdx) => {
        const grandchildNodeId = `problem-${grandchild.id}`;
        const grandchildLevel = grandchild.level || getDifficultyLabel(grandchild.difficulty);

        // Position Level 2 problems (right column) - vertically aligned
        const grandchildY = derivedY + (gcIdx * ySpacingDerived);

        nodes.push({
          id: grandchildNodeId,
          label: grandchild.title.length > 25 ? grandchild.title.substring(0, 25) + '...' : grandchild.title,
          x: level2X,
          y: grandchildY,
          unlocked: true,
          level: grandchildLevel,
          age: grandchild.age_range || "All Ages",
          problems: [grandchild.id],
          description: grandchild.category_path || grandchildLevel,
        });

        // Create edge from derived to grandchild
        edges.push([derivedNodeId, grandchildNodeId]);
      });

      // Adjust Y offset for next derived problem
      derivedYOffset += Math.max(100, grandchildren.length * ySpacingDerived) + 20;
    });


  });

  return { nodes, edges };
}

// ------------------------------------------------------------
// Reusable UI Components
// ------------------------------------------------------------
// Reusable UI Components
// ------------------------------------------------------------

/**
 * StatBar Component - Displays a progress bar with label and percentage
 * @param label - Text label for the stat
 * @param value - Percentage value (0-100)
 */
function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs"><span>{label}</span><span className="font-mono">{value}%</span></div>
      <Progress value={value} />
    </div>
  );
}

/**
 * MasteryChart Component - Bar chart showing user's mastery by topic
 * Uses Recharts library for data visualization
 */
function MasteryChart() {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Mastery by Topic</CardTitle></CardHeader>
      <CardContent className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={masteryByTopic}>
            <XAxis dataKey="topic" tickLine={false} axisLine={false} />
            <YAxis hide />
            <Tooltip />
            <Bar dataKey="percent" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

/**
 * LeaderboardCard Component - Shows weekly top performers
 * Displays rank, name, XP, and current streak
 */
function LeaderboardCard() {
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Top Solvers (This Week)</CardTitle></CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((u, i) => (
            <div key={u.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="w-6 justify-center">{i + 1}</Badge>
                <div className="font-medium">{u.name}</div>
              </div>
              <div className="text-sm text-muted-foreground">XP {u.xp} • 🔥 {u.streak}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * RecommendedProblems Component - Shows personalized problem recommendations
 */
function RecommendedProblems({ prefs }: { prefs: UserPreferences | null }) {
  const [recommendedProblems, setRecommendedProblems] = useState<(ProblemDisplay & { likes_count?: number; starts_count?: number; completes_count?: number; source?: string | null })[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendedProblems = async () => {
      try {
        setIsLoading(true);

        // Use the proven getAll() which we know works, then sort client-side.
        // likes/starts_count/complete_count are included if the columns exist.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const all = await problemsAPI.getAll() as any[];

        // Only problems with a known source
        const withSource = all.filter((p) => p.source && p.source.trim() !== '');

        // Apply preference filter, then sort by popularity stats (desc), then slice to 5
        const filtered = withSource
          .filter((p) => matchesPreferences(p, prefs))
          .sort((a, b) => {
            const likeDiff = (b.likes_count ?? 0) - (a.likes_count ?? 0);
            if (likeDiff !== 0) return likeDiff;
            const startDiff = (b.starts_count ?? 0) - (a.starts_count ?? 0);
            if (startDiff !== 0) return startDiff;
            return (b.completes_count ?? 0) - (a.completes_count ?? 0);
          })
          .slice(0, 5)
          .map((p) => ({
            ...convertSupabaseProblem(p),
            likes_count: p.likes_count ?? 0,
            starts_count: p.starts_count ?? 0,
            completes_count: p.completes_count ?? 0,
            source: p.source ?? null,
          }));

        // If prefs filtering left us with nothing, fall back to top 5 from all-source problems
        if (filtered.length === 0) {
          const fallback = withSource
            .sort((a, b) => (b.likes_count ?? 0) - (a.likes_count ?? 0))
            .slice(0, 5)
            .map((p) => ({
              ...convertSupabaseProblem(p),
              likes_count: p.likes_count ?? 0,
              starts_count: p.starts_count ?? 0,
              completes_count: p.completes_count ?? 0,
              source: p.source ?? null,
            }));
          setRecommendedProblems(fallback);
        } else {
          setRecommendedProblems(filtered);
        }
      } catch (err: unknown) {
        console.error('Failed to fetch recommended problems:', err);
        setRecommendedProblems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedProblems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Recommended Problems</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  const isPersonalized = prefs && (prefs.interestedCategories.length > 0 || Object.keys(prefs.categoryLevels).length > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          Recommended Problems
          {isPersonalized && (
            <Badge className="bg-violet-600 text-white gap-1 text-[10px]">
              <Sparkles className="h-3 w-3" /> Personalized
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px] gap-1 ml-auto">🔥 Most Popular</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendedProblems.length === 0 ? (
          <div className="text-center py-4 text-gray-500 text-sm">No recommended problems available</div>
        ) : (
          recommendedProblems.map((p) => (
            <div key={p.id} className="flex items-center justify-between rounded-xl border border-gray-200 p-3 bg-white hover:shadow-sm transition-shadow">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm text-gray-800 truncate">{p.title}</div>
                <div className="mt-0.5 flex flex-wrap gap-2 text-xs text-muted-foreground items-center">
                  <Badge
                    className={`text-[10px] ${
                      p.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                      p.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      p.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}
                    variant="secondary"
                  >
                    {p.difficulty}
                  </Badge>
                  {p.likes_count != null && p.likes_count > 0 && (
                    <span className="text-pink-500 font-medium">❤️ {p.likes_count}</span>
                  )}
                  {p.starts_count != null && p.starts_count > 0 && (
                    <span className="text-blue-500 font-medium">▶ {p.starts_count}</span>
                  )}
                  {p.completes_count != null && p.completes_count > 0 && (
                    <span className="text-emerald-600 font-medium">✓ {p.completes_count}</span>
                  )}
                  <span className="text-gray-400">XP {p.xp}</span>
                  {p.source && (
                    <span className="text-[10px] text-blue-600 font-medium">📚 {p.source}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <StepsButton problemId={p.id} problemTitle={p.title} />
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">Solve</Button>
                  </DialogTrigger>
                  <ProblemDialog problem={p} />
                </Dialog>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

/**
 * ProblemDialog Component - Modal for solving math problems
 * Features two modes: written solution and auto-check
 * @param problem - Problem object with title, XP, difficulty, tags, and unlock status
 */


// ------------------------------------------------------------
// PersonalizedLearningPath — replaces the skill tree canvas
// Shows problems matched to the user's category levels from DB
// ------------------------------------------------------------
function PersonalizedLearningPath({ prefs, queueIds, onToggleQueue }: {
  prefs: UserPreferences | null;
  queueIds: Set<string>;
  onToggleQueue: (p: QueuedProblem) => void;
}) {
  const [problems, setProblems] = useState<ProblemDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openProblem, setOpenProblem] = useState<ProblemDisplay | null>(null);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        const all = await problemsAPI.getAll();

        // Only show problems that have a known source
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const withSource = all.filter((p: any) => p.source && p.source.trim() !== '');
        const catLevels = prefs?.userCategoryLevels ?? [];
        const hasLevels = catLevels.length > 0;

        let filtered: ProblemDisplay[];

        if (hasLevels) {
          // Build a score map: category_id -> level_score
          const scoreMap = new Map(catLevels.map(cl => [cl.category_id, cl.level_score]));
          const userCatIds = new Set(catLevels.map(cl => cl.category_id));

          // Keep problems whose category_level1/2/3 overlaps with user's categories
          // OR whose category_path contains one of the user's category names
          const userCatNames = catLevels
            .map(cl => cl.category_name)
            .filter((n): n is string => !!n)
            .map(n => n.toLowerCase());

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const matched = withSource.filter((p: any) => {
            const idMatch =
              userCatIds.has(p.category_level1) ||
              userCatIds.has(p.category_level2) ||
              userCatIds.has(p.category_level3);
            const nameMatch = userCatNames.length > 0 && userCatNames.some(
              name => p.category_path?.toLowerCase().includes(name)
            );
            return idMatch || nameMatch;
          });

          // Sort: closest difficulty to user's level_score; randomise ties
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          matched.sort((a: any, b: any) => {
            const getScore = (p: any) => {
              for (const col of ['category_level1', 'category_level2', 'category_level3']) {
                if (p[col] && scoreMap.has(p[col])) return scoreMap.get(p[col])!;
              }
              return 5; // default mid
            };
            const diff = Math.abs(a.difficulty - getScore(a)) - Math.abs(b.difficulty - getScore(b));
            // If same distance from target level, shuffle randomly
            return diff !== 0 ? diff : Math.random() - 0.5;
          });

          filtered = matched.map(convertSupabaseProblem).slice(0, 5);
        } else {
          // Fallback: show easiest problems first from source-only pool
          filtered = withSource
            .map(convertSupabaseProblem)
            .sort((a, b) => {
              const order: Record<string, number> = { Easy: 1, Medium: 2, Hard: 3, Olympiad: 4 };
              const diff = (order[a.difficulty] || 5) - (order[b.difficulty] || 5);
              return diff !== 0 ? diff : Math.random() - 0.5;
            })
            .slice(0, 5);
        }

        setProblems(filtered);
      } catch (err) {
        console.error('Failed to fetch personalized problems:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProblems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefs]);

  const isPersonalized = (prefs?.userCategoryLevels?.length ?? 0) > 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Problems for You</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          Problems for You
          {isPersonalized ? (
            <Badge className="bg-violet-600 text-white gap-1 text-[10px]">
              <Sparkles className="h-3 w-3" /> Personalized
            </Badge>
          ) : (
            <Badge variant="secondary" className="text-[10px]">All levels</Badge>
          )}
        </CardTitle>
        {isPersonalized && prefs?.userCategoryLevels && (
          <div className="flex flex-wrap gap-1 mt-1">
            {prefs.userCategoryLevels.map(cl => cl.category_name).filter(Boolean).slice(0, 4).map(name => (
              <Badge key={name} variant="outline" className="text-[10px] text-gray-600">{name}</Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {problems.length === 0 ? (
          <div className="text-center py-6 text-gray-500 text-sm">
            No matching problems found. Try updating your preferences in onboarding.
          </div>
        ) : (
          problems.map(p => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-800 text-sm truncate">{p.title}</div>
                <div className="mt-0.5 flex flex-wrap gap-1 items-center text-xs text-muted-foreground">
                  <Badge
                    className={`text-[10px] ${
                      p.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                      p.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                      p.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }`}
                    variant="secondary"
                  >
                    {p.difficulty}
                  </Badge>
                  <span>XP {p.xp}</span>
                  {p.source && (
                    <span className="text-[10px] text-blue-600 font-medium">📚 {p.source}</span>
                  )}
                  {p.tags.slice(0, 2).map(t => (
                    <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>
                  ))}
                </div>
              </div>
                <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                  <StepsButton problemId={p.id} problemTitle={p.title} />
                  <button
                    title={queueIds.has(p.id) ? 'Remove from My Queue' : 'Add to My Queue'}
                    onClick={() => onToggleQueue({ id: p.id, title: p.title, difficulty: p.difficulty, source: p.source, xp: p.xp })}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    {queueIds.has(p.id)
                      ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      : <PlusCircle className="h-5 w-5 text-blue-500" />}
                  </button>
                  <Dialog open={openProblem?.id === p.id} onOpenChange={o => setOpenProblem(o ? p : null)}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="flex-shrink-0">
                      Solve
                    </Button>
                  </DialogTrigger>
                  <ProblemDialog problem={p} />
                </Dialog>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}



/**
 * Main Dashboard Component — Combined Home + My Board
 * Fetches user preferences from onboarding, filters Learning Path
 * and Recommended Problems by preferred categories and level.
 */
export default function UserHomePage() {
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const { queue, addToQueue, removeFromQueue, isQueued } = useMyQueue();
  const queueIds = new Set(queue.map(q => q.id));

  const handleToggleQueue = (p: QueuedProblem) => {
    if (isQueued(p.id)) removeFromQueue(p.id);
    else addToQueue(p);
  };

  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const res = await fetch('/api/user/profile');
        if (res.ok) {
          const data = await res.json();
          setPrefs({
            interestedCategories: data.interested_categories || [],
            categoryLevels: data.category_levels || {},
            userCategoryLevels: data.user_category_levels || [],
          });
        }
      } catch (err) {
        console.error('Failed to fetch user preferences:', err);
      }
    };
    fetchPrefs();
  }, []);

  const preferredLevelLabel = prefs ? scoresToLevelLabel(prefs.categoryLevels) : null;
  const hasPrefs = prefs && (prefs.interestedCategories.length > 0 || Object.keys(prefs.categoryLevels).length > 0);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 p-4">
        {/* Main Content Area - Left 2/3 */}
        <div className="xl:col-span-2 space-y-6">
          {/* My Queue */}
          <Card>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  My Queue
                  {queue.length > 0 && (
                    <Badge className="bg-blue-600 text-white text-[10px]">{queue.length}</Badge>
                  )}
                </CardTitle>
                <div className="mt-1 text-xs text-muted-foreground">
                  {queue.length === 0
                    ? 'Hit + on any problem below to add it here'
                    : `${queue.length} problem${queue.length > 1 ? 's' : ''} you\'re working on`}
                </div>
              </div>
              <Badge variant="secondary" className="gap-1"><Flame className="h-3 w-3" />Streak 8</Badge>
            </CardHeader>
            <CardContent>
              {queue.length === 0 ? (
                <div className="flex items-center gap-3 py-4 px-2 rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm">
                  <PlusCircle className="h-5 w-5 flex-shrink-0" />
                  <span>Add problems from <strong>Problems for You</strong> to track your progress here.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {queue.map(q => (
                    <div key={q.id} className="flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-800 truncate">{q.title}</div>
                        <div className="flex gap-2 mt-0.5 items-center text-xs text-muted-foreground">
                          <Badge
                            className={`text-[10px] ${
                              q.difficulty === 'Easy' ? 'bg-emerald-100 text-emerald-700' :
                              q.difficulty === 'Medium' ? 'bg-amber-100 text-amber-700' :
                              q.difficulty === 'Hard' ? 'bg-orange-100 text-orange-700' :
                              'bg-red-100 text-red-700'
                            }`}
                            variant="secondary"
                          >
                            {q.difficulty}
                          </Badge>
                          {q.source && <span className="text-blue-600 text-[10px]">📚 {q.source}</span>}
                          <span className="text-gray-400">XP {q.xp}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <StepsButton problemId={q.id} problemTitle={q.title} />
                        <button
                          onClick={() => removeFromQueue(q.id)}
                          className="p-1 rounded-full hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remove from queue"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Problems for You — pass queue state */}
          <PersonalizedLearningPath prefs={prefs} queueIds={queueIds} onToggleQueue={handleToggleQueue} />

          {/* Recommended Problems — filtered by preferences */}
          <RecommendedProblems prefs={prefs} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <MasteryChart />
          <LeaderboardCard />

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Quick Actions</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm">Continue Learning</Button>
              <Button size="sm" variant="outline">Challenge of the Day</Button>
              <Button size="sm" variant="ghost">Theory Review</Button>
              <Link href="/admin/problems">
                <Button size="sm" variant="ghost" className="gap-1 text-gray-600 hover:text-gray-800">
                  <Lock className="h-4 w-4" />Admin
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-amber-800 flex items-center gap-2">
                <Heart className="h-4 w-4 text-amber-600" />
                Support MathComm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-amber-700 mb-3">
                Your donation helps us keep MathComm free and growing for students everywhere.
              </p>
              <a href="https://paypal.me/mookwonseo" target="_blank" rel="noopener noreferrer">
                <Button size="sm" className="w-full gap-2 bg-amber-500 hover:bg-amber-600 text-white border-0">
                  <Heart className="h-4 w-4" />
                  Donate via PayPal
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}