"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Send, Lock, Unlock, Star, Loader2, Heart, GitBranch, ArrowUp, ArrowDown, ChevronRight, Sparkles } from "lucide-react";
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
  problemId, 
  problemTitle, 
  onNavigate 
}: { 
  problemId: string; 
  problemTitle: string; 
  onNavigate: (problem: ProblemDisplay) => void 
}) {
  // Check if this is the "Parity of Sum of Digits" problem
  const isSpecialProblem = problemTitle.toLowerCase().includes("parity of sum of digits");

  if (isSpecialProblem) {
    const steps = [
      { title: "Advanced Parity Analysis", type: "next" },
      { title: "Digit Sum and Parity", type: "next" },
      { title: "Evaluating Polynomial at Large Powers", type: "next" },
      { title: "Modular Arithmetic Basics", type: "next" },
      { title: "Parity of Sum of Digits and Polynomial", type: "current" },
      { title: "Basic Polynomial Evaluation", type: "prev" },
      { title: "Digit Sum Calculation", type: "prev" },
      { title: "Parity of a Number", type: "prev" },
    ];

    return (
      <div className="flex flex-col items-center space-y-1 w-full max-w-[320px] mx-auto pb-10">
        {steps.map((step, idx) => (
          <React.Fragment key={idx}>
            <LearningPathItem 
              title={step.title} 
              isCurrent={step.type === "current"}
              isCompleted={step.type === "prev"}
            />
            {idx < steps.length - 1 && (
              <div className="flex flex-col items-center py-2">
                <ArrowUp className={`h-5 w-5 ${idx < 4 ? 'text-gray-300' : 'text-blue-500 shadow-sm'} transition-colors animate-bounce-slow`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
    );
  }

  const [paths, setPaths] = useState<ProblemDisplay[][]>([]);
  const [children, setChildren] = useState<ProblemDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHierarchy = async () => {
      try {
        setLoading(true);
        const problemCache = new Map<string, ProblemDisplay>();
        
        const fetchAncestorsRecursive = async (id: string): Promise<string[][]> => {
          const parentsRaw: any[] = await problemHierarchiesAPI.getParents(id);
          if (!parentsRaw || parentsRaw.length === 0) return [[id]];
          const results: string[][] = [];
          for (const rel of parentsRaw) {
            const parentProblem = rel.parent_problem;
            problemCache.set(parentProblem.id, convertSupabaseProblem(parentProblem));
            const subPaths = await fetchAncestorsRecursive(parentProblem.id);
            for (const subPath of subPaths) results.push([...subPath, id]);
          }
          return results;
        };
  
        const [ancestorPaths, childrenRaw] = await Promise.all([
          fetchAncestorsRecursive(problemId),
          problemHierarchiesAPI.getChildren(problemId),
        ]);
  
        const childrenList = (childrenRaw ?? []).map((r: any) => convertSupabaseProblem(r.child_problem));
        const resolvedPaths = ancestorPaths.map(pathIds => 
          pathIds.map(id => id === problemId ? { id, title: problemTitle } as ProblemDisplay : problemCache.get(id)!)
        );
  
        setPaths(resolvedPaths);
        setChildren(childrenList);
      } catch (err) {
        console.error("Failed to fetch hierarchy:", err);
      } finally {
        setLoading(false);
      }
    };
    loadHierarchy();
  }, [problemId, problemTitle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  const ProblemItemActionIndicator = ({ p, isCurrent = false }: { p: ProblemDisplay; isCurrent?: boolean }) => (
    <div className={`flex flex-col gap-1 p-2 rounded-lg border ${isCurrent ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300 transition-colors'}`}>
      <div className="flex items-center gap-2">
        <ChevronRight className={`h-3 w-3 ${isCurrent ? 'text-blue-500' : 'text-gray-300'}`} />
        <div className={`text-[12px] font-bold truncate ${isCurrent ? 'text-blue-800' : 'text-gray-800'}`}>
          {p.title}
        </div>
        {isCurrent && <Badge className="ml-auto bg-blue-600 text-[8px] h-3.5 px-1 uppercase tracking-tighter">Current</Badge>}
      </div>
      {!isCurrent && (
        <Button 
          size="sm" 
          variant="outline" 
          className="h-5 text-[9px] w-fit ml-4 border-gray-200 hover:bg-blue-600 hover:text-white px-2 transition-all font-bold"
          onClick={() => onNavigate(p)}
        >
          Jump to Step
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
          <GitBranch className="h-3 w-3" />
          Pre-requisites
        </div>
        <div className="space-y-2 relative pl-2 border-l-2 border-dashed border-gray-200 ml-1.5">
          {paths[0]?.map((p, idx) => (
            <ProblemItemActionIndicator key={`${p.id}-${idx}`} p={p} isCurrent={p.id === problemId} />
          ))}
        </div>
      </section>
 
      {children.length > 0 && (
        <section>
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3">
            <ArrowDown className="h-3 w-3" />
            Next Steps
          </div>
          <div className="grid grid-cols-1 gap-2">
            {children.map(c => (
              <ProblemItemActionIndicator key={c.id} p={c} />
            ))}
          </div>
        </section>
      )}
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
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 h-12 shadow-md shadow-blue-100">
                          Submit Solution <Send className="ml-2 h-4 w-4" />
                        </Button>
                        <Button variant="outline" className="px-6 h-12 border-gray-200 hover:bg-gray-50" onClick={handlePreviewClick} disabled={previewStatus === "loading"}>
                          {previewStatus === "loading" ? "Processing..." : "Preview"}
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600"><Star className="h-4 w-4 mr-1.5" /> Hint (-10 XP)</Button>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600"><BookOpen className="h-4 w-4 mr-1.5" /> Theory</Button>
                      </div>
                    </div>
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
              <Badge className="bg-violet-600 text-[10px] h-5">Customized</Badge>
            </div>
            <p className="text-xs text-gray-500">Master this topic step-by-step</p>
          </div>
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]">
            <HierarchyPanel 
                problemId={currentProblem.id} 
                problemTitle={currentProblem.title} 
                onNavigate={setCurrentProblem} 
              />
          </div>
          <div className="p-6 border-t border-gray-200 bg-white">
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
