"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Send, Lock, Unlock, Star, Loader2, Heart, GitBranch, ArrowUp, ArrowDown, ChevronRight, Sparkles, CheckCircle2, XCircle, AlertCircle, RefreshCcw } from "lucide-react";
import MathPreview from "@/components/MathPreview";
import { getDifficultyLabel, type Problem as SupabaseProblem, problemHierarchiesAPI } from "@/lib/supabase";
import { useLikes } from "@/hooks/useUserInteractions";

// Custom scrollbar styles to ensure they are always visible
const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 4px;
    border: 2px solid #f3f4f6;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #9ca3af;
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #d1d5db #f3f4f6;
  }
  @keyframes bounce-slow {
    0%, 100% { transform: translateY(-15%); animation-timing-function: cubic-bezier(0.8,0,1,1); }
    50% { transform: translateY(0); animation-timing-function: cubic-bezier(0,0,0.2,1); }
  }
  .animate-bounce-slow {
    animation: bounce-slow 3s infinite;
  }
`;

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
    xp: sp.xp || sp.difficulty * 50,
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
  isCompleted = false,
  isLocked = false 
}: { 
  title: string; 
  isCurrent?: boolean; 
  isCompleted?: boolean;
  isLocked?: boolean;
}) {
  return (
    <div className={`relative flex flex-col items-center w-full group`}>
      <div 
        className={`w-full p-3 rounded-xl border-2 transition-all duration-300 flex items-center gap-3 ${
          isCurrent 
            ? 'border-blue-500 bg-blue-50 shadow-md transform scale-[1.02] z-10' 
            : isCompleted
            ? 'border-emerald-200 bg-emerald-50'
            : 'border-gray-100 bg-white hover:border-blue-200 hover:shadow-sm'
        }`}
      >
        <div 
          className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${
            isCurrent 
              ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
              : isCompleted
              ? 'bg-emerald-500 text-white'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {isCompleted ? '✓' : ''}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-sm font-bold truncate ${isCurrent ? 'text-blue-900 font-extrabold' : 'text-gray-700'}`}>
            {title}
          </div>
          {isCurrent && (
            <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
              <Star className="h-2 w-2 fill-current" /> Current Step
            </div>
          )}
        </div>
        {!isCurrent && !isCompleted && isLocked && (
          <Lock className="h-4 w-4 text-gray-300" />
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------
// Sub-component: Hierarchy Panel
// -------------------------------------------------------
function HierarchyPanel({ 
  path, 
  onNavigate,
  onBackTo
}: { 
  path: ProblemDisplay[]; 
  onNavigate: (problem: ProblemDisplay) => void;
  onBackTo: (index: number) => void;
}) {
  const currentProblem = path[path.length - 1];
  const [solutionsMap, setSolutionsMap] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        setLoading(true);
        // Get all children associated with the CURRENT focused problem
        const childrenRaw: any[] = await problemHierarchiesAPI.getChildren(currentProblem.id);
        
        if (!childrenRaw || childrenRaw.length === 0) {
          setSolutionsMap({});
          return;
        }

        // Group by parent_solution_id
        const grouped: Record<string, any[]> = {};
        childrenRaw.forEach(rel => {
          const solId = rel.parent_solution_id || "default";
          if (!grouped[solId]) grouped[solId] = [];
          grouped[solId].push(rel);
        });

        // Sort each group by sequence order DESC (largest at top)
        Object.keys(grouped).forEach(solId => {
          grouped[solId].sort((a, b) => b.sequence_order - a.sequence_order);
        });

        setSolutionsMap(grouped);
        const firstSolId = Object.keys(grouped)[0];
        if (firstSolId) setActiveTab(firstSolId);
      } catch (err) {
        console.error("Failed to fetch hierarchy:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHierarchy();
  }, [currentProblem.id]);

  const solutionIds = Object.keys(solutionsMap);

  return (
    <div className="flex flex-col h-full">
      {/* Top Section: Persistent Title & Path Selector (Tabs) */}
      <div className="space-y-4 mb-6">
        {/* If the current focused problem has multiple solutions, show them at the very top of the panel content */}
        {solutionIds.length > 1 && (
          <div className="sticky top-0 z-20 bg-transparent">
             <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1.5 px-0.5">Focus Strategy</div>
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-white/50 backdrop-blur-sm border border-gray-100 flex-wrap h-auto min-h-10 p-1 mb-2 grid grid-cols-2 gap-1 shadow-sm rounded-xl">
                  {solutionIds.map((solId, idx) => (
                    <TabsTrigger 
                      key={solId} 
                      value={solId} 
                      className="text-[10px] font-bold h-7 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300 rounded-lg"
                    >
                      {solId === "default" ? "Primary Method" : `Solution ${idx + 1}`}
                    </TabsTrigger>
                  ))}
                </TabsList>
             </Tabs>
          </div>
        )}
      </div>

      <div className="flex-1 space-y-1">
        {/* Ancestors Path (Persistent) */}
        {path.length > 1 && (
          <div className="flex flex-col items-center space-y-1 w-full max-w-[320px] mx-auto opacity-70 hover:opacity-100 transition-opacity">
            {path.slice(0, -1).map((p, idx) => (
              <React.Fragment key={p.id}>
                <div 
                  className="w-full cursor-pointer hover:scale-[1.01] transition-transform"
                  onClick={() => onBackTo(idx)}
                >
                  <LearningPathItem 
                    title={p.title} 
                    isCompleted={true}
                  />
                </div>
                <div className="flex flex-col items-center py-1">
                   <ArrowUp className="h-4 w-4 text-gray-300" />
                </div>
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Current Problem & Children */}
        <PathDisplay 
          problemId={currentProblem.id} 
          problemTitle={currentProblem.title} 
          steps={solutionIds.length > 0 ? solutionsMap[activeTab || solutionIds[0]] : []} 
          onNavigate={onNavigate} 
          isLoading={loading}
        />
      </div>
    </div>
  );
}

function PathDisplay({ 
  problemId, 
  problemTitle, 
  steps, 
  onNavigate,
  isLoading
}: { 
  problemId: string; 
  problemTitle: string; 
  steps: any[]; 
  onNavigate: (problem: ProblemDisplay) => void;
  isLoading: boolean;
}) {
  return (
    <div className="flex flex-col items-center space-y-1 w-full max-w-[320px] mx-auto pb-10">
      {/* Current Problem Anchor */}
      <LearningPathItem 
        title={problemTitle} 
        isCurrent={true}
      />
      
      {isLoading ? (
        <div className="flex flex-col items-center py-12 gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          <span className="text-[10px] text-gray-400 font-bold uppercase">Loading Roadmap...</span>
        </div>
      ) : steps?.length > 0 ? (
        <>
          {/* Children below sorted by sequence order (largest at top) */}
          {steps.map((rel, idx) => {
            const child = convertSupabaseProblem(rel.child_problem);
            return (
              <React.Fragment key={child.id}>
                 <div className="flex flex-col items-center py-2">
                    <ArrowUp className="h-5 w-5 text-blue-500 shadow-sm transition-colors animate-bounce-slow" />
                  </div>
                  <div 
                    className="w-full cursor-pointer group"
                    onClick={() => onNavigate(child)}
                  >
                    <LearningPathItem 
                      title={child.title} 
                      isCompleted={false}
                    />
                  </div>
              </React.Fragment>
            );
          })}
        </>
      ) : (
        <div className="text-center py-12 px-6 mt-4 bg-white/30 backdrop-blur-sm rounded-2xl border border-dashed border-gray-200 w-full">
          <GitBranch className="h-10 w-10 text-gray-200 mx-auto mb-4" />
          <p className="text-[11px] text-gray-400 font-medium italic leading-relaxed">
            This problem is a foundational step.<br/>Master it to unlock more complex challenges!
          </p>
        </div>
      )}
    </div>
  );
}


// -------------------------------------------------------
// Component: ProblemDialog
// -------------------------------------------------------
export function ProblemDialog({ problem: initialProblem }: { problem: ProblemDisplay }) {
  const [navigationPath, setNavigationPath] = useState<ProblemDisplay[]>([initialProblem]);
  const currentProblem = navigationPath[navigationPath.length - 1];

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

  // Navigation handlers
  const handleNavigate = useCallback((problem: ProblemDisplay) => {
    setNavigationPath(prev => [...prev, problem]);
  }, []);

  const handleBackTo = useCallback((index: number) => {
    setNavigationPath(prev => prev.slice(0, index + 1));
  }, []);

  // Reset local state when initialProblem changes (if the whole dialog is reopened with a different problem)
  useEffect(() => {
    setNavigationPath([initialProblem]);
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
    <DialogContent className="max-w-none w-[98vw] sm:max-w-[1400px] h-[90vh] bg-white border-2 border-gray-200 shadow-2xl overflow-hidden flex flex-col p-0">
      <style dangerouslySetInnerHTML={{ __html: scrollbarStyles }} />
      <div className="flex h-full overflow-hidden">
        {/* Main Problem/Solution Column (Left) */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-gray-200">
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <DialogHeader className="pb-4">
                <div className="flex items-center justify-between gap-4">
                  <DialogTitle className="flex items-center gap-2 text-lg font-bold text-gray-800">
                    {currentProblem.title}
                    {currentProblem.unlocked ? <Unlock className="h-3.5 w-3.5 text-blue-600" /> : <Lock className="h-3.5 w-3.5 text-red-500" />}
                  </DialogTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleLike(currentProblem.id)}
                    className={`gap-2 ${likedIds.has(currentProblem.id) ? "text-pink-600 bg-pink-50" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    <Heart className={`h-5 w-5 ${likedIds.has(currentProblem.id) ? "fill-current" : ""}`} />
                    <span className="font-semibold">{currentProblem.likes_count ?? 0}</span>
                  </Button>
                </div>
              </DialogHeader>

              {currentProblem.category_path && (
                <div className="text-sm text-gray-500 mb-4 font-medium">Topic: {currentProblem.category_path}</div>
              )}

              <div className="flex flex-wrap gap-2 text-xs mb-8">
                <Badge className="bg-blue-600 text-white px-2.5 py-0.5">XP {currentProblem.xp}</Badge>
                <Badge variant="outline" className="border-gray-300 text-gray-700 px-2.5 py-0.5">{currentProblem.difficulty}</Badge>
                {currentProblem.tags?.map((t: string, idx: number) => (
                  <Badge key={`${currentProblem.id}-tag-${idx}`} variant="secondary" className="bg-gray-100 text-gray-700 px-2.5 py-0.5">{t}</Badge>
                ))}
              </div>

              <div className="mb-10 bg-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 text-gray-400">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">The Problem</span>
                </div>
                {problemContentLoading ? (
                  <div className="flex items-center gap-3 text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Rendering LaTeX...</span>
                  </div>
                ) : problemHtml ? (
                  <MathPreview html={problemHtml} className="text-gray-800 text-sm leading-relaxed" />
                ) : (
                  <div className="text-gray-400 italic">No problem content available.</div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <Tabs value={tab} onValueChange={(v) => setTab(v as "write" | "auto")} className="w-full">
                  <TabsList className="bg-gray-100 p-1 mb-2 h-10 w-fit">
                    <TabsTrigger value="write" className="px-4 h-8 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Solution Board</TabsTrigger>
                    <TabsTrigger value="auto" className="px-4 h-8 text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">Numerical Check</TabsTrigger>
                  </TabsList>

                  <TabsContent value="write" className="mt-0 outline-none">
                    {showGradingResult && gradingResult ? (
                      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className={`rounded-3xl p-8 mb-8 border-2 ${gradingResult.isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
                          <div className="flex items-start justify-between mb-8">
                            <div>
                               <div className="flex items-center gap-3 mb-2">
                                  {gradingResult.isCorrect ? (
                                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                                  ) : (
                                    <Sparkles className="h-8 w-8 text-blue-500" />
                                  )}
                                  <h3 className="text-2xl font-black text-gray-900">
                                    {gradingResult.isCorrect ? "Mastered!" : "AI Analysis Complete"}
                                  </h3>
                               </div>
                               <p className="text-gray-600 font-medium max-w-xl leading-relaxed">
                                 {gradingResult.overallSummary}
                               </p>
                            </div>
                            <div className="text-right">
                               <div className="text-4xl font-black text-gray-900">{gradingResult.totalScore}<span className="text-xl text-gray-400">/{gradingResult.maxScore}</span></div>
                               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Total Performance</div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                             {Object.entries(gradingResult.scores).map(([key, score]) => (
                               <div key={key} className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-sm">
                                  <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1 truncate">
                                    {key.replace('_', ' ')}
                                  </div>
                                  <div className="flex items-end gap-1">
                                    <span className="text-xl font-black text-gray-800">{score}</span>
                                    <span className="text-[10px] text-gray-400 font-bold mb-1">/10</span>
                                  </div>
                               </div>
                             ))}
                          </div>

                          <div className="space-y-4">
                             <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                               <ChevronRight className="h-4 w-4" /> Actionable Feedback
                             </div>
                             <div className="grid gap-3">
                                {gradingResult.feedback.map((f, idx) => (
                                  <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                     <div className="flex items-start gap-4">
                                        <div className="h-8 w-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-50 transition-colors">
                                          <AlertCircle className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
                                        </div>
                                        <div className="flex-1">
                                           <div className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest mb-1">{f.criterion}</div>
                                           <div className="text-sm text-gray-700 leading-relaxed font-medium mb-3">{f.comment}</div>
                                           {f.hint && (
                                             <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-start gap-3">
                                                <Star className="h-4 w-4 text-orange-400 mt-0.5 fill-current" />
                                                <div className="text-xs text-orange-800 font-medium">
                                                  <span className="font-bold uppercase text-[9px] block mb-0.5">Scaffolded Hint</span>
                                                  {f.hint}
                                                </div>
                                             </div>
                                           )}
                                        </div>
                                     </div>
                                  </div>
                                ))}
                             </div>
                          </div>
                          
                          <div className="mt-8 flex justify-center">
                             <Button 
                               variant="outline" 
                               onClick={() => setShowGradingResult(false)}
                               className="bg-white border-2 border-gray-200 text-gray-600 font-bold px-8 h-12 rounded-2xl hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all gap-2"
                             >
                               <RefreshCcw className="h-4 w-4" /> Return to Editor
                             </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
                          {/* Editor */}
                          <div className="flex flex-col h-[300px] rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
                            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">LaTeX Editor</span>
                            </div>
                            <textarea
                              className="flex-1 w-full p-4 text-[13px] font-mono leading-relaxed text-gray-800 resize-none outline-none bg-white"
                              placeholder="Write your proof here using LaTeX..."
                              value={solutionDraft}
                              onChange={(e) => setSolutionDraft(e.target.value)}
                            />
                          </div>
    
                          {/* Preview */}
                          <div className="flex flex-col h-[300px] rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
                            <div className="bg-gray-50 border-b border-gray-200 px-3 py-2 flex justify-between items-center">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Live Preview</span>
                              <Badge variant="outline" className="text-[9px] font-mono">{previewHeaderStatus}</Badge>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-200">
                              {previewStatus === "loading" && <div className="flex items-center gap-2 text-gray-400 text-sm"><Loader2 className="h-4 w-4 animate-spin" /> Rendering...</div>}
                              {previewStatus === "error" && previewError && (
                                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg">{previewError}</div>
                              )}
                              {previewStatus === "ready" && (
                                <>
                                  {previewSource !== solutionDraft && (
                                    <div className="mb-4 p-2 bg-amber-50 border border-amber-100 text-amber-600 text-[10px] rounded text-center">Content changed - refresh needed</div>
                                  )}
                                  <MathPreview html={previewHtml} />
                                </>
                              )}
                              {previewStatus === "idle" && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-3 py-10">
                                  <GitBranch className="h-10 w-10 opacity-20" />
                                  <p className="text-sm">Click preview to see your progress</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-8">
                          <div className="flex gap-3">
                            <Button 
                              onClick={handleSubmitSolution}
                              disabled={isGrading || !solutionDraft.trim()}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 shadow-md shadow-blue-100 min-w-[180px]"
                            >
                              {isGrading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Grading...
                                </>
                              ) : (
                                <>
                                  Submit Solution <Send className="ml-2 h-4 w-4" />
                                </>
                              )}
                            </Button>
                            <Button variant="outline" className="px-6 h-12 border-gray-200 hover:bg-gray-50" onClick={handlePreviewClick} disabled={previewStatus === "loading" || isGrading}>
                              {previewStatus === "loading" ? "Processing..." : "Preview"}
                            </Button>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600"><Star className="h-4 w-4 mr-1.5" /> Hint (-10 XP)</Button>
                            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600"><BookOpen className="h-4 w-4 mr-1.5" /> Theory</Button>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  <TabsContent value="auto" className="mt-0">
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 max-w-md shadow-sm">
                      <h4 className="text-sm font-bold text-gray-800 mb-4">Numerical Answer</h4>
                      <div className="flex flex-col gap-4">
                        <Input placeholder="Enter your answer (e.g. 42)" className="h-12 border-gray-200 focus:ring-blue-500" />
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white h-12">Verify Answer</Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
        </div>

        {/* Learning Path Column (Right) */}
        <div className="w-[380px] flex flex-col bg-[#F9FAFB] min-h-0 flex-shrink-0 border-l border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <GitBranch className="h-5 w-5 text-indigo-500" />
                Learning Path
              </h3>
              <Badge className="bg-violet-600 text-[10px] h-5 px-2">Hierarchical</Badge>
            </div>
            <p className="text-xs text-gray-500 font-medium">Master this topic step-by-step</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]">
            <HierarchyPanel 
                path={navigationPath} 
                onNavigate={handleNavigate} 
                onBackTo={handleBackTo}
              />
          </div>
          <div className="p-6 border-t border-gray-200 bg-white bg-opacity-90 backdrop-blur-sm">
           <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Path Stats</div>
           <div className="grid grid-cols-2 gap-4">
             <div className="flex flex-col p-3 rounded-xl bg-blue-50/50 border border-blue-100">
               <span className="text-lg font-black text-blue-700">{currentProblem.completes_count ?? 0}</span>
               <span className="text-[9px] text-blue-500 font-bold uppercase tracking-wider">Completed</span>
             </div>
             <div className="flex flex-col p-3 rounded-xl bg-orange-50/50 border border-orange-100">
               <span className="text-lg font-black text-orange-700">{currentProblem.starts_count ?? 0}</span>
               <span className="text-[9px] text-orange-500 font-bold uppercase tracking-wider">Enrolled</span>
             </div>
           </div>
          </div>
        </div>

      </div>
    </DialogContent>
  );
}
