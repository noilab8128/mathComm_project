"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Send, Lock, Unlock, Star, Loader2 } from "lucide-react";
import MathPreview from "@/components/MathPreview";
import { getDifficultyLabel, type Problem as SupabaseProblem } from "@/lib/supabase";

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
// Component: ProblemDialog
// -------------------------------------------------------
export function ProblemDialog({ problem }: { problem: ProblemDisplay }) {
  const [tab, setTab] = useState<"write" | "auto">("write");
  const [solutionDraft, setSolutionDraft] = useState("");
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewStatus, setPreviewStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [previewSource, setPreviewSource] = useState("");

  const [problemHtml, setProblemHtml] = useState<string>("");
  const [problemContentLoading, setProblemContentLoading] = useState(true);

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
      if (!problem?.content) {
        setProblemHtml("");
        setProblemContentLoading(false);
        return;
      }

      try {
        setProblemContentLoading(true);
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: problem.content }),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error((payload as { error?: string }).error || "Failed to render problem content.");
        }

        const html = typeof (payload as { html?: unknown }).html === "string" ? (payload as { html: string }).html : "";
        setProblemHtml(html || problem.content);
      } catch (error) {
        console.error("Failed to render problem content:", error);
        setProblemHtml(problem.content);
      } finally {
        setProblemContentLoading(false);
      }
    };

    loadProblemContent();
  }, [problem?.content]);

  return (
    <DialogContent className="max-w-7xl w-[95vw] max-h-[90vh] bg-white border-2 border-gray-200 shadow-2xl overflow-hidden flex flex-col p-0">
      <ScrollArea className="flex-1">
        <div className="flex flex-col p-6">
          <div className="flex-shrink-0">
            <DialogHeader className="pb-4">
              <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
                {problem.title}
                {problem.unlocked ? <Unlock className="h-5 w-5 text-blue-600" /> : <Lock className="h-5 w-5 text-red-500" />}
              </DialogTitle>
            </DialogHeader>
            {problem.category_path && (
              <div className="text-sm text-gray-500 mb-3">Topic: {problem.category_path}</div>
            )}
            <div className="mt-2 flex flex-wrap gap-2 text-xs mb-4">
              <Badge className="bg-blue-600 text-white">XP {problem.xp}</Badge>
              <Badge variant="outline" className="border-gray-300 text-gray-700">{problem.difficulty}</Badge>
              {problem.tags && problem.tags.length > 0 && problem.tags.map((t: string, idx: number) => (
                <Badge key={`${problem.id}-tag-${idx}`} variant="secondary" className="bg-gray-100 text-gray-700">{t}</Badge>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="prose prose-sm max-w-none mb-6">
              <div className="text-gray-800 leading-relaxed">
                <strong className="text-gray-800">Problem:</strong>{" "}
                {problemContentLoading ? (
                  <span className="text-sm text-gray-500">Loading problem content...</span>
                ) : problemHtml ? (
                  <div className="mt-2">
                    <MathPreview html={problemHtml} className="text-gray-800" />
                  </div>
                ) : (
                  <div className="mt-2 text-gray-600">No problem content available.</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col">
            <Tabs value={tab} onValueChange={(v) => setTab(v as "write" | "auto")} className="flex-1 flex flex-col">
              <TabsList className="bg-gray-100 flex-shrink-0">
                <TabsTrigger value="write" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Write Solution</TabsTrigger>
                <TabsTrigger value="auto" className="data-[state=active]:bg-white data-[state=active]:text-gray-900">Auto-check</TabsTrigger>
              </TabsList>
              <TabsContent value="write" className="flex-1 mt-3 overflow-hidden">
                <div className="h-full rounded-xl border-2 border-gray-200 bg-gray-50 p-4 flex flex-col gap-4">
                  <div className="flex-1 grid gap-4 md:grid-cols-2">
                    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      <div className="border-b border-gray-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Editor</div>
                      <textarea
                        className="flex-1 min-h-[260px] w-full resize-none bg-white p-4 text-[13px] leading-6 text-gray-900 outline-none focus:ring-2 focus:ring-blue-500/70"
                        placeholder="Type your proof with Markdown/LaTeX…"
                        value={solutionDraft}
                        onChange={(event) => setSolutionDraft(event.target.value)}
                      ></textarea>
                    </div>
                    <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between border-b border-gray-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                        <span>Preview</span>
                        <span className="text-[11px] font-normal text-gray-400">{previewHeaderStatus}</span>
                      </div>
                      <div className="flex-1 overflow-auto bg-white p-4 text-[13px] leading-6 text-gray-800 min-h-[260px]">
                        {previewStatus === "loading" && <div className="text-xs text-gray-500">Rendering preview…</div>}
                        {previewStatus === "error" && previewError && (
                          <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">{previewError}</div>
                        )}
                        {previewStatus === "ready" && (
                          <>
                            {previewSource !== solutionDraft && (
                              <div className="mb-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">Out of date - refresh preview</div>
                            )}
                            {previewHtml ? <MathPreview html={previewHtml} className="min-h-[220px]" /> : <div className="text-xs text-gray-500">Empty</div>}
                          </>
                        )}
                        {previewStatus === "idle" && <div className="text-xs text-gray-500">Preview will appear here.</div>}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Submit Solution</Button>
                    <Button variant="outline" className="border-gray-300" onClick={handlePreviewClick} disabled={previewStatus === "loading"}>
                      {previewStatus === "loading" ? "Rendering…" : "Preview"}
                    </Button>
                    <Button variant="ghost" className="gap-1 text-gray-600"><BookOpen className="h-4 w-4" /> Review Theory</Button>
                    <Button variant="ghost" className="gap-1 text-gray-600"><Star className="h-4 w-4" /> Hint (−10 XP)</Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="auto" className="flex-1 mt-3 overflow-hidden">
                <div className="h-full rounded-xl border-2 border-gray-200 p-4 space-y-3 bg-gray-50 flex flex-col">
                  <div className="text-sm text-gray-700">Enter a numeric answer:</div>
                  <Input placeholder="e.g., 42" className="bg-white border-gray-300" />
                  <div className="flex items-center gap-2">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">Check</Button>
                    <span className="text-xs text-gray-500">Auto-grading available</span>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            <Separator className="my-4 flex-shrink-0" />
            <div className="flex-shrink-0 mb-4">
              <div className="mb-3 text-sm font-semibold text-gray-800">Discussion</div>
              <div className="rounded-xl border-2 border-gray-200 p-4 max-h-32 overflow-auto bg-gray-50 text-sm">
                Discussion comments would go here...
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </DialogContent>
  );
}
