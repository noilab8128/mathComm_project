"use client";
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, GitBranch, ArrowUp, ArrowDown, ChevronRight } from "lucide-react";
import { problemHierarchiesAPI, getDifficultyLabel } from "@/lib/supabase";
import { ProblemDialog, convertSupabaseProblem, type ProblemDisplay } from "@/components/ProblemDialog";

// -------------------------------------------------------
// Types
// -------------------------------------------------------
interface HierarchyData {
  parents: ProblemDisplay[];
  children: ProblemDisplay[];
}

// -------------------------------------------------------
// Difficulty badge helper
// -------------------------------------------------------
function DiffBadge({ difficulty }: { difficulty: string }) {
  const cls =
    difficulty === "Easy" ? "bg-emerald-100 text-emerald-700" :
    difficulty === "Medium" ? "bg-amber-100 text-amber-700" :
    difficulty === "Hard" ? "bg-orange-100 text-orange-700" :
    "bg-red-100 text-red-700";
  return (
    <Badge className={`text-[10px] ${cls}`} variant="secondary">
      {difficulty}
    </Badge>
  );
}

// -------------------------------------------------------
// Inner modal content — fetches and renders the hierarchy
// -------------------------------------------------------
function HierarchyContent({
  problemId,
  problemTitle,
}: {
  problemId: string;
  problemTitle: string;
}) {
  const [data, setData] = useState<HierarchyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [parentsRaw, childrenRaw] = await Promise.all([
          problemHierarchiesAPI.getParents(problemId),
          problemHierarchiesAPI.getChildren(problemId),
        ]);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parents = (parentsRaw ?? []).map((r: any) => 
          convertSupabaseProblem(r.parent_problem)
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const children = (childrenRaw ?? []).map((r: any) => 
          convertSupabaseProblem(r.child_problem)
        );

        setData({ parents, children });
      } catch (err) {
        console.error("Failed to fetch hierarchy:", err);
        setError("Could not load hierarchy data.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [problemId, problemTitle]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-8 text-red-500 text-sm">{error}</div>;
  }

  const { parents, children } = data!;
  const hasHierarchy = parents.length > 0 || children.length > 0;

  const ProblemRow = ({ p, index }: { p: ProblemDisplay; index: number }) => (
    <div
      key={p.id}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
    >
      <span className="text-xs text-gray-400 w-5 text-center font-mono">{index + 1}</span>
      <ChevronRight className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-800 truncate">{p.title}</div>
        <div className="flex gap-1.5 mt-0.5 items-center">
          <DiffBadge difficulty={p.difficulty} />
          {p.source && (
            <span className="text-[10px] text-blue-600">📚 {p.source}</span>
          )}
        </div>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" className="h-7 text-[11px] px-2 bg-white hover:bg-blue-50 hover:text-blue-600 border-gray-200">
            Solve
          </Button>
        </DialogTrigger>
        <ProblemDialog problem={p} />
      </Dialog>
    </div>
  );

  return (
    <div className="space-y-6 py-2">
      {/* ── Prerequisites (parents) ── */}
      {parents.length > 0 && (
        <section>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            <ArrowUp className="h-3.5 w-3.5" />
            Prerequisites — solve these first
          </div>
          <div className="space-y-2">
            {parents.map((p, i) => (
              <ProblemRow key={p.id} p={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* ── Current problem (center) ── */}
      <section>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
          <GitBranch className="h-3.5 w-3.5" />
          Current Problem
        </div>
        <div className="flex items-center gap-3 rounded-lg border-2 border-blue-400 bg-blue-50 px-3 py-3">
          <ChevronRight className="h-4 w-4 text-blue-500 flex-shrink-0" />
          <div className="text-sm font-semibold text-blue-800 truncate">{problemTitle}</div>
          <Badge className="ml-auto bg-blue-600 text-white text-[10px] flex-shrink-0">You are here</Badge>
        </div>
      </section>

      {/* ── Next steps (children) ── */}
      {children.length > 0 && (
        <section>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">
            <ArrowDown className="h-3.5 w-3.5" />
            Next Steps — problems unlocked after this
          </div>
          <div className="space-y-2">
            {children.map((p, i) => (
              <ProblemRow key={p.id} p={p} index={i} />
            ))}
          </div>
        </section>
      )}

      {!hasHierarchy && (
        <div className="text-center py-8 text-gray-400 text-sm">
          No hierarchy data found for this problem.
        </div>
      )}
    </div>
  );
}

// -------------------------------------------------------
// Exported button + modal — drop this anywhere
// -------------------------------------------------------
export function StepsButton({
  problemId,
  problemTitle,
  size = "sm",
}: {
  problemId: string;
  problemTitle: string;
  size?: "sm" | "default";
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size={size}
          variant="outline"
          className="gap-1 flex-shrink-0 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          title="View learning path steps"
        >
          <GitBranch className="h-3.5 w-3.5" />
          Steps
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-semibold text-gray-800">
            <GitBranch className="h-4 w-4 text-indigo-500" />
            Learning Path Steps
          </DialogTitle>
          <p className="text-xs text-gray-500 mt-1 truncate">{problemTitle}</p>
        </DialogHeader>
        <HierarchyContent problemId={problemId} problemTitle={problemTitle} />
      </DialogContent>
    </Dialog>
  );
}
