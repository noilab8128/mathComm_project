"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { BookOpen, Send, Star, Loader2, Heart, GitBranch, CheckCircle2, AlertCircle, RefreshCcw } from "lucide-react";
import MathPreview from "@/components/MathPreview";
import LadderExtras from "@/components/LadderExtras";
import { DifficultyBadge } from "@/components/DifficultyRating";
import { getDifficultyLabel, calculateXP, type Problem as SupabaseProblem, problemHierarchiesAPI } from "@/lib/supabase";
import { useLikes } from "@/hooks/useUserInteractions";

// -------------------------------------------------------
// Types
// -------------------------------------------------------
export interface ProblemDisplay {
  id: string;
  title: string;
  level: string;
  age: string;
  xp: number;
  difficulty: string;
  difficulty_score: number;
  tags: string[];
  unlocked: boolean;
  content: string;
  hint?: string;
  solution?: string;
  category_path?: string;
  source?: string | null;
  likes_count?: number;
  starts_count?: number;
  completes_count?: number;
}

interface GradingFeedback {
  criterion: string;
  comment: string;
  hint?: string;
}

interface GradingResult {
  scores: {
    accuracy: number;
    communication: number;
    logic: number;
    presentation: number;
    justification: number;
  };
  totalScore: number;
  maxScore: number;
  feedback: GradingFeedback[];
  overallSummary: string;
  isCorrect: boolean;
}

// -------------------------------------------------------
// Utility: Convert Supabase Problem to display format
// -------------------------------------------------------
export function convertSupabaseProblem(sp: SupabaseProblem): ProblemDisplay {
  // @ts-ignore - solutions might be joined
  const solutions = sp.solutions;
  const solutionContent = solutions && solutions.length > 0 ? solutions[0].content : null;

  return {
    id: sp.id,
    title: sp.title,
    level: sp.level || getDifficultyLabel(sp.difficulty),
    age: sp.age_range || "All Ages",
    xp: calculateXP(sp.difficulty), // problems.xp was dropped; XP comes from difficulty
    difficulty: getDifficultyLabel(sp.difficulty),
    difficulty_score: sp.difficulty,
    tags: sp.tags || (sp.category_path ? sp.category_path.split(' > ') : []),
    unlocked: true, 
    content: sp.content,
    hint: undefined, 
    solution: solutionContent || undefined,
    category_path: sp.category_path || undefined,
    source: sp.source || null,
    // @ts-ignore
    likes_count: sp.likes_count ?? 0,
    // @ts-ignore
    starts_count: sp.starts_count ?? 0,
    // @ts-ignore
    completes_count: sp.completes_count ?? 0,
  };
}

// -------------------------------------------------------
// Sub-component: Learning Path Item
// -------------------------------------------------------
function LearningPathItem({
  title,
  isCurrent = false,
  isFinal = false,
  isLast = false,
}: {
  title: string;
  isCurrent?: boolean;
  /** The top (final) problem of the path */
  isFinal?: boolean;
  /** Last row: no connector line below the marker */
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      {/* Marker + connector */}
      <div className="relative flex w-4 flex-shrink-0 justify-center">
        {!isLast && <span className="absolute top-5 bottom-[-4px] w-px bg-slate-200" aria-hidden />}
        <span
          className={`relative z-10 mt-1.5 h-3 w-3 rounded-full border ${
            isCurrent ? "border-slate-900 bg-slate-900" : isFinal ? "border-slate-700 bg-white" : "border-slate-300 bg-white"
          }`}
          aria-hidden
        />
      </div>
      <div
        className={`mb-1 min-w-0 flex-1 rounded-md px-2.5 py-1.5 transition-colors ${
          isCurrent ? "bg-white shadow-[0_0_0_1px_rgb(15_23_42)]" : "hover:bg-white"
        }`}
      >
        <div className={`truncate text-[13px] ${isCurrent ? "font-semibold text-slate-900" : "text-slate-700"}`} title={title}>
          {title}
        </div>
        {(isCurrent || isFinal) && (
          <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">
            {isCurrent ? "Current" : ""}{isCurrent && isFinal ? " · " : ""}{isFinal ? "Final problem" : ""}
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Sub-component: Hierarchy Panel
// Shows the whole path from the top (final) problem down to the easiest step. The path stays
// the same while the student moves between steps; only the "current step" mark moves.
// -------------------------------------------------------
type PathNode = { problem: ProblemDisplay; depth: number };
type LearningPathRoute = { id: string; nodes: PathNode[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const byOrderDesc = (a: any, b: any) => b.sequence_order - a.sequence_order;

async function loadRoutes(openedProblem: ProblemDisplay): Promise<{ root: ProblemDisplay; routes: LearningPathRoute[] }> {
  // 1. Climb to the top problem (each problem has at most one parent).
  let root = openedProblem;
  const climbed = new Set([root.id]);
  for (;;) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const parents: any[] = await problemHierarchiesAPI.getParents(root.id);
    const parent = parents?.[0]?.parent_problem;
    if (!parent || climbed.has(parent.id)) break;
    root = convertSupabaseProblem(parent);
    climbed.add(root.id);
  }

  // 2. Load every level below the top problem.
  const seen = new Set([root.id]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const childrenOf = new Map<string, any[]>();
  let level = [root.id];
  while (level.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[][] = await Promise.all(level.map((id) => problemHierarchiesAPI.getChildren(id)));
    const next: string[] = [];
    level.forEach((id, i) => {
      const rels = (results[i] || []).filter((rel) => rel.child_problem && !seen.has(rel.child_problem.id));
      rels.forEach((rel) => { seen.add(rel.child_problem.id); next.push(rel.child_problem.id); });
      childrenOf.set(id, rels);
    });
    level = next;
  }

  // 3. A route is one full path from the top problem down. Where a problem splits into several
  //    solutions (parent_solution_id), each choice is a separate route.
  const groupKey = (rel: { parent_solution_id: string | null }) => rel.parent_solution_id || "default";
  const splits = [...childrenOf.entries()]
    .map(([id, rels]) => ({ id, keys: [...new Set(rels.map(groupKey))] }))
    .filter((node) => node.keys.length > 1);

  let choices: Record<string, string>[] = [{}];
  for (const node of splits) {
    choices = choices.flatMap((c) => node.keys.map((key) => ({ ...c, [node.id]: key }))).slice(0, 16);
  }

  const flatten = (id: string, depth: number, choice: Record<string, string>): PathNode[] =>
    (childrenOf.get(id) || [])
      .filter((rel) => !(id in choice) || groupKey(rel) === choice[id])
      .sort(byOrderDesc)
      .flatMap((rel) => [
        { problem: convertSupabaseProblem(rel.child_problem), depth },
        ...flatten(rel.child_problem.id, depth + 1, choice),
      ]);

  const routes: LearningPathRoute[] = [];
  for (const choice of choices) {
    const nodes = flatten(root.id, 1, choice);
    const id = nodes.map((n) => n.problem.id).join(",");
    if (!routes.some((r) => r.id === id)) routes.push({ id, nodes });
  }
  return { root, routes };
}

function HierarchyPanel({
  openedProblem,
  currentId,
  onSelect,
}: {
  openedProblem: ProblemDisplay;
  currentId: string;
  onSelect: (problem: ProblemDisplay) => void;
}) {
  const [root, setRoot] = useState<ProblemDisplay>(openedProblem);
  const [routes, setRoutes] = useState<LearningPathRoute[]>([]);
  const [activeRoute, setActiveRoute] = useState("");
  const [loading, setLoading] = useState(true);

  // Built once per opened problem, so it does not change when the student clicks a step.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    loadRoutes(openedProblem)
      .then((result) => {
        if (cancelled) return;
        setRoot(result.root);
        setRoutes(result.routes);
        const withOpened = result.routes.find((r) => r.nodes.some((n) => n.problem.id === openedProblem.id));
        setActiveRoute((withOpened || result.routes[0]).id);
      })
      .catch((err) => console.error("Failed to fetch hierarchy:", err))
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openedProblem.id]);

  // Follow the current step if it is not on the route being shown.
  useEffect(() => {
    const onRoute = (r?: LearningPathRoute) => r?.nodes.some((n) => n.problem.id === currentId);
    if (currentId === root.id || onRoute(routes.find((r) => r.id === activeRoute))) return;
    const route = routes.find(onRoute);
    if (route) setActiveRoute(route.id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentId, routes]);

  if (loading) {
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        <span className="text-xs text-slate-400">Loading path…</span>
      </div>
    );
  }

  const nodes = routes.find((r) => r.id === activeRoute)?.nodes ?? [];

  return (
    <div className="flex h-full flex-col">
      {routes.length > 1 && (
        <div className="sticky top-0 z-20 mb-4 bg-slate-50 pb-1">
          <div className="mb-1.5 text-[11px] text-slate-500">This problem has {routes.length} solution paths</div>
          <Tabs value={activeRoute} onValueChange={setActiveRoute} className="w-full">
            <TabsList className="grid h-auto w-full grid-cols-2 gap-0 rounded-md border border-slate-200 bg-white p-0">
              {routes.map((route, idx) => (
                <TabsTrigger
                  key={route.id}
                  value={route.id}
                  className="h-8 rounded-none border-l border-slate-200 text-xs text-slate-600 first:border-l-0 data-[state=active]:bg-slate-900 data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  Path {idx + 1}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      )}

      <div className="w-full pb-6">
        <button className="block w-full text-left" onClick={() => onSelect(root)}>
          <LearningPathItem title={root.title} isCurrent={root.id === currentId} isFinal isLast={nodes.length === 0} />
        </button>

        {nodes.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-slate-200 px-4 py-6 text-center text-xs leading-relaxed text-slate-500">
            No easier steps are linked to this problem.
          </p>
        ) : (
          nodes.map(({ problem, depth }, i) => (
            <button
              key={problem.id}
              className="block w-full text-left"
              style={{ paddingLeft: `${(depth - 1) * 14}px` }}
              onClick={() => onSelect(problem)}
            >
              <LearningPathItem title={problem.title} isCurrent={problem.id === currentId} isLast={i === nodes.length - 1} />
            </button>
          ))
        )}
      </div>
    </div>
  );
}


// -------------------------------------------------------
// Component: ProblemDialog
// -------------------------------------------------------
export function ProblemDialog({ problem: initialProblem }: { problem: ProblemDisplay }) {
  const [currentProblem, setCurrentProblem] = useState<ProblemDisplay>(initialProblem);

  const [tab, setTab] = useState<"write" | "auto">("write");
  const [solutionDraft, setSolutionDraft] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewStatus, setPreviewStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState("");

  const [problemHtml, setProblemHtml] = useState<string>("");
  const [problemContentLoading, setProblemContentLoading] = useState(true);

  // New Grading State
  const [isGrading, setIsGrading] = useState(false);
  const [gradingResult, setGradingResult] = useState<GradingResult | null>(null);
  const [showGradingResult, setShowGradingResult] = useState(false);

  const { likedIds, toggleLike } = useLikes();

  // Reset local state when initialProblem changes (if the whole dialog is reopened with a different problem)
  useEffect(() => {
    setCurrentProblem(initialProblem);
  }, [initialProblem.id]);

  const previewHeaderStatus = useMemo(() => {
    if (previewStatus === "loading") return "Rendering…";
    if (previewStatus === "error") return "Error";
    if (previewStatus === "ready" && previewSource !== solutionDraft) return "Needs refresh";
    if (previewStatus === "ready") return "Up to date";
    if (previewVisible) return "Ready";
    return "Awaiting input";
  }, [previewStatus, previewSource, solutionDraft, previewVisible]);

  const handlePreviewClick = useCallback(async () => {
    setPreviewVisible(true);

    if (!solutionDraft.trim()) {
      setPreviewStatus("error");
      setPreviewHtml("");
      setPreviewSource("");
      setPreviewError("Start typing your solution to generate a preview.");
      return;
    }

    try {
      setPreviewStatus("loading");
      setPreviewError(null);
      const response = await fetch("/api/preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: solutionDraft }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error((payload as { error?: string }).error || "Preview request failed.");
      }

      const html = typeof (payload as { html?: unknown }).html === "string" ? (payload as { html: string }).html : "";
      setPreviewHtml(html);
      setPreviewStatus("ready");
      setPreviewSource(solutionDraft);
    } catch (error) {
      setPreviewStatus("error");
      setPreviewHtml("");
      setPreviewSource("");
      setPreviewError(error instanceof Error ? error.message : "Unable to render preview.");
    }
  }, [solutionDraft]);

  const handleSubmitSolution = useCallback(async () => {
    if (!solutionDraft.trim() || isGrading) return;

    try {
      setIsGrading(true);
      const response = await fetch("/api/grade-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          problemId: currentProblem.id,
          problemContent: currentProblem.content, 
          studentSolution: solutionDraft 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Grading failed.");
      }

      setGradingResult(data.gradingResult);
      setShowGradingResult(true);
    } catch (error) {
      console.error("Grading error:", error);
      // Fallback for UI if needed
    } finally {
      setIsGrading(false);
    }
  }, [solutionDraft, currentProblem.content, isGrading]);

  useEffect(() => {
    const loadProblemContent = async () => {
      if (!currentProblem?.content) {
        setProblemHtml("");
        setProblemContentLoading(false);
        return;
      }

      try {
        setProblemContentLoading(true);
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: currentProblem.content }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error((payload as { error?: string }).error || "Failed to render problem content.");
        }

        const html = typeof (payload as { html?: unknown }).html === "string" ? (payload as { html: string }).html : "";
        setProblemHtml(html || currentProblem.content);
      } catch (error) {
        console.error("Failed to render problem content:", error);
        setProblemHtml(currentProblem.content);
      } finally {
        setProblemContentLoading(false);
      }
    };

    loadProblemContent();
    // Clear solution draft when switching problems
    setSolutionDraft("");
    setPreviewStatus("idle");
    setPreviewHtml("");
    setGradingResult(null);
    setShowGradingResult(false);
  }, [currentProblem?.id, currentProblem?.content]);

  return (
    <DialogContent className="flex h-[90vh] w-[98vw] max-w-none flex-col overflow-hidden rounded-lg border border-slate-200 bg-white p-0 shadow-xl sm:max-w-[1400px]">
      <div className="flex h-full overflow-hidden">
        {/* Main Problem/Solution Column (Left) */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="scroll-thin flex-1 overflow-y-auto px-8 py-7">
              <DialogHeader className="space-y-0 pb-3 pr-8 text-left">
                {currentProblem.category_path && (
                  <div className="mb-1.5 text-xs text-slate-500">{currentProblem.category_path.split(" > ").join(" › ")}</div>
                )}
                <div className="flex items-start justify-between gap-4">
                  <DialogTitle className="text-xl font-semibold leading-snug tracking-tight text-slate-900">
                    {currentProblem.title}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(currentProblem.id)}
                    aria-pressed={likedIds.has(currentProblem.id)}
                    className={`h-8 flex-shrink-0 gap-1.5 rounded-md px-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 ${likedIds.has(currentProblem.id) ? "text-slate-900" : ""}`}
                  >
                    <Heart className={`h-4 w-4 ${likedIds.has(currentProblem.id) ? "fill-current" : ""}`} />
                    <span className="tnum font-mono text-xs">{currentProblem.likes_count ?? 0}</span>
                  </Button>
                </div>
              </DialogHeader>

              <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-b border-slate-100 pb-4 text-xs text-slate-500">
                {currentProblem.difficulty_score !== undefined && <DifficultyBadge difficulty={currentProblem.difficulty_score} />}
                <span className="tnum font-mono">{currentProblem.xp} XP</span>
                {currentProblem.source && <span>Source: {currentProblem.source}</span>}
                {currentProblem.tags && currentProblem.tags.length > 0 && (
                  <span className="flex flex-wrap gap-1">
                    {currentProblem.tags.map((t: string, idx: number) => (
                      <span key={`${currentProblem.id}-tag-${idx}`} className="rounded border border-slate-200 px-1.5 py-px text-[11px] text-slate-500">{t}</span>
                    ))}
                  </span>
                )}
              </div>

              <section aria-label="Problem statement" className="mb-8 border-l-2 border-slate-900 pl-5">
                <div className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Problem</div>
                {problemContentLoading ? (
                  <div className="flex items-center gap-2 text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Rendering…</span>
                  </div>
                ) : problemHtml ? (
                  <MathPreview html={problemHtml} className="font-serif text-[17px] leading-[1.7] text-slate-900" />
                ) : (
                  <div className="italic text-slate-400">No problem content available.</div>
                )}
              </section>

              <div className="flex flex-col gap-4">
                <Tabs value={tab} onValueChange={(v) => setTab(v as "write" | "auto")} className="w-full">
                  <TabsList className="mb-4 h-auto w-full justify-start gap-1 rounded-none border-b border-slate-200 bg-transparent p-0">
                    <TabsTrigger value="write" className="-mb-px h-auto flex-none rounded-none border-0 border-b-2 border-transparent px-3 py-2 text-sm font-normal text-slate-500 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-slate-900 data-[state=active]:shadow-none">Written solution</TabsTrigger>
                    <TabsTrigger value="auto" className="-mb-px h-auto flex-none rounded-none border-0 border-b-2 border-transparent px-3 py-2 text-sm font-normal text-slate-500 data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:font-medium data-[state=active]:text-slate-900 data-[state=active]:shadow-none">Short answer</TabsTrigger>
                  </TabsList>

                  <TabsContent value="write" className="mt-0 outline-none">
                    {showGradingResult && gradingResult ? (
                      <div className="rounded-md border border-slate-200">
                        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
                          <div className="max-w-2xl">
                            <div className="flex items-center gap-2">
                              {gradingResult.isCorrect ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              ) : (
                                <AlertCircle className="h-4 w-4 text-amber-600" />
                              )}
                              <h3 className="text-sm font-semibold text-slate-900">
                                {gradingResult.isCorrect ? "Correct" : "Not yet correct"}
                              </h3>
                            </div>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{gradingResult.overallSummary}</p>
                          </div>
                          <div className="text-right">
                            <div className="tnum text-2xl font-semibold text-slate-900">
                              {gradingResult.totalScore}<span className="text-base text-slate-400"> / {gradingResult.maxScore}</span>
                            </div>
                            <div className="text-[11px] text-slate-500">Total score</div>
                          </div>
                        </div>

                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-slate-100">
                            {Object.entries(gradingResult.scores).map(([key, score]) => (
                              <tr key={key}>
                                <td className="px-5 py-2 capitalize text-slate-600">{key.replace(/_/g, " ")}</td>
                                <td className="w-40 px-5 py-2">
                                  <div className="h-1 bg-slate-100">
                                    <div className="h-1 bg-slate-800" style={{ width: `${Math.max(0, Math.min(10, Number(score))) * 10}%` }} />
                                  </div>
                                </td>
                                <td className="tnum w-16 px-5 py-2 text-right font-mono text-slate-900">{score}<span className="text-slate-400">/10</span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        {gradingResult.feedback.length > 0 && (
                          <div className="border-t border-slate-200 px-5 py-4">
                            <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Feedback</div>
                            <ol className="space-y-4">
                              {gradingResult.feedback.map((f, idx) => (
                                <li key={idx} className="text-sm">
                                  <div className="font-medium text-slate-900">{f.criterion}</div>
                                  <p className="mt-0.5 leading-relaxed text-slate-600">{f.comment}</p>
                                  {f.hint && (
                                    <p className="mt-2 border-l-2 border-slate-300 pl-3 text-[13px] leading-relaxed text-slate-600">
                                      <span className="font-medium text-slate-800">Hint. </span>{f.hint}
                                    </p>
                                  )}
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}

                        <div className="flex justify-end border-t border-slate-200 px-5 py-3">
                          <Button
                            variant="outline"
                            onClick={() => setShowGradingResult(false)}
                            className="h-9 gap-2 rounded-md border-slate-300 text-slate-700 hover:text-slate-900"
                          >
                            <RefreshCcw className="h-4 w-4" /> Back to editor
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
                          {/* Editor */}
                          <div className="flex h-[300px] flex-col overflow-hidden rounded-md border border-slate-200 bg-white transition-colors focus-within:border-slate-400">
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5">
                              <span className="text-xs text-slate-500">Your solution · LaTeX</span>
                            </div>
                            <textarea
                              className="w-full flex-1 resize-none bg-white p-4 font-mono text-[13px] leading-relaxed text-slate-800 outline-none placeholder:text-slate-400"
                              placeholder="Write your solution. Use $...$ for math, e.g. $x^2 + 1$."
                              value={solutionDraft}
                              onChange={(e) => setSolutionDraft(e.target.value)}
                            />
                          </div>
    
                          {/* Preview */}
                          <div className="flex h-[300px] flex-col overflow-hidden rounded-md border border-slate-200 bg-white">
                            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-1.5">
                              <span className="text-xs text-slate-500">Preview</span>
                              <span className="text-[11px] text-slate-400">{previewHeaderStatus}</span>
                            </div>
                            <div className="scroll-thin flex-1 overflow-y-auto p-4 font-serif text-[15px] leading-relaxed text-slate-900">
                              {previewStatus === "loading" && <div className="flex items-center gap-2 font-sans text-sm text-slate-400"><Loader2 className="h-4 w-4 animate-spin" /> Rendering…</div>}
                              {previewStatus === "error" && previewError && (
                                <div className="rounded-md border border-red-200 bg-red-50 p-3 font-sans text-xs text-red-700">{previewError}</div>
                              )}
                              {previewStatus === "ready" && (
                                <>
                                  {previewSource !== solutionDraft && (
                                    <div className="mb-4 font-sans text-[11px] text-amber-700">Edited since last preview — click Preview to update.</div>
                                  )}
                                  <MathPreview html={previewHtml} />
                                </>
                              )}
                              {previewStatus === "idle" && (
                                <div className="flex h-full items-center justify-center py-10 font-sans text-sm text-slate-400">
                                  Click Preview to render your solution.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex gap-3">
                            <Button 
                              onClick={handleSubmitSolution}
                              disabled={isGrading || !solutionDraft.trim()}
                              className="h-9 min-w-[150px] rounded-md bg-slate-900 px-5 text-sm text-white hover:bg-slate-800"
                            >
                              {isGrading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Grading…
                                </>
                              ) : (
                                <>
                                  Submit solution <Send className="ml-2 h-3.5 w-3.5" />
                                </>
                              )}
                            </Button>
                            <Button variant="outline" className="h-9 rounded-md border-slate-300 px-4 text-sm text-slate-700 hover:text-slate-900" onClick={handlePreviewClick} disabled={previewStatus === "loading" || isGrading}>
                              {previewStatus === "loading" ? "Rendering…" : "Preview"}
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="h-9 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"><Star className="mr-1.5 h-4 w-4" /> Hint <span className="ml-1 text-slate-400">(−10 XP)</span></Button>
                            <Button variant="ghost" size="sm" className="h-9 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-900"><BookOpen className="mr-1.5 h-4 w-4" /> Theory</Button>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="auto" className="mt-0">
                    <div className="max-w-md">
                      <label className="text-sm font-medium text-slate-900" htmlFor="short-answer">Your answer</label>
                      <p className="mt-0.5 text-xs text-slate-500">For problems with a single number as the answer.</p>
                      <div className="mt-3 flex gap-2">
                        <Input id="short-answer" inputMode="numeric" placeholder="e.g. 42" className="tnum h-9 rounded-md border-slate-300 font-mono focus-visible:ring-slate-400" />
                        <Button className="h-9 rounded-md bg-slate-900 px-4 text-sm text-white hover:bg-slate-800">Check</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              <LadderExtras problemId={currentProblem.id} />
            </div>
        </div>

        {/* Learning Path Column (Right) */}
        <div className="flex min-h-0 w-[340px] flex-shrink-0 flex-col border-l border-slate-200 bg-slate-50">
          <div className="border-b border-slate-200 px-5 py-4">
            <h3 className="flex items-center gap-2 text-[13px] font-semibold text-slate-900">
              <GitBranch className="h-4 w-4 text-slate-400" />
              Learning path
            </h3>
            <p className="mt-0.5 text-xs text-slate-500">From the final problem down to the first step</p>
          </div>
          <div className="scroll-thin flex-1 overflow-y-auto px-4 py-4">
            <HierarchyPanel
                openedProblem={initialProblem}
                currentId={currentProblem.id}
                onSelect={setCurrentProblem}
              />
          </div>
          <dl className="tnum grid grid-cols-2 border-t border-slate-200 bg-white text-center">
            <div className="border-r border-slate-200 px-4 py-3">
              <dt className="text-[11px] text-slate-500">Solved by</dt>
              <dd className="text-base font-semibold text-slate-900">{currentProblem.completes_count ?? 0}</dd>
            </div>
            <div className="px-4 py-3">
              <dt className="text-[11px] text-slate-500">Attempted by</dt>
              <dd className="text-base font-semibold text-slate-900">{currentProblem.starts_count ?? 0}</dd>
            </div>
          </dl>
        </div>

      </div>
    </DialogContent>
  );
}
