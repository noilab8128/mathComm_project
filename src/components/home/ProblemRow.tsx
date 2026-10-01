"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Heart, ListPlus, ListChecks } from "lucide-react";
import { DifficultyBadge } from "@/components/DifficultyRating";
import type { HomeProblem } from "./useHomeData";

// Re-exported for existing imports (NextUpCard)
export { DifficultyBadge };

export interface RowActions {
  isQueued: boolean;
  isLiked: boolean;
  isStarted: boolean;
  isSolved: boolean;
  onOpen: () => void;
  onToggleQueue: () => void;
  onToggleLike: () => void;
  /** Replaces the default Solve / Resume / Review label. */
  openLabel?: string;
}

/**
 * One problem in a list. Rows sit inside a bordered list with dividers (see HomeDashboard).
 * `compact` is used for heavy users and the queue, where more rows should fit on screen.
 */
export function ProblemRow({
  problem,
  reasons = [],
  context,
  compact = false,
  actions,
}: {
  problem: HomeProblem;
  reasons?: string[];
  context?: string; // e.g. "Candy Game · Step 3"
  compact?: boolean;
  actions: RowActions;
}) {
  const { isQueued, isLiked, isStarted, isSolved, onOpen, onToggleQueue, onToggleLike, openLabel } = actions;
  const category = problem.category_path?.split(" > ").slice(0, 2).join(" › ");
  const inProgress = isStarted && !isSolved;

  return (
    <div
      className={`group flex flex-col gap-2 bg-white transition-colors hover:bg-slate-50 sm:flex-row sm:items-center sm:gap-4 ${
        compact ? "px-4 py-2.5" : "px-4 py-3"
      }`}
    >
      {/* Status */}
      <span
        className={`hidden h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border sm:flex ${
          isSolved ? "border-emerald-600 bg-emerald-600 text-white" : inProgress ? "border-slate-500" : "border-slate-300"
        }`}
        title={isSolved ? "Solved" : inProgress ? "In progress" : "Not started"}
        aria-label={isSolved ? "Solved" : inProgress ? "In progress" : "Not started"}
      >
        {isSolved ? <Check className="h-3 w-3" strokeWidth={3} /> : inProgress ? <span className="h-2 w-2 rounded-full bg-slate-500" /> : null}
      </span>

      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <span className={`line-clamp-2 font-medium text-slate-900 group-hover:text-blue-800 sm:line-clamp-1 ${compact ? "text-sm" : "text-[15px]"}`}>
          {problem.title}
        </span>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          {context && <span className="text-slate-600">{context}</span>}
          {context && (category || reasons.length > 0) && !compact && <span className="text-slate-300">·</span>}
          {!compact && category && <span className="truncate">{category}</span>}
          {reasons.map((r) => (
            <span key={r} className="rounded border border-slate-200 px-1.5 py-px text-[11px] text-slate-500">
              {r}
            </span>
          ))}
        </div>
      </button>

      <div className="flex flex-shrink-0 items-center justify-between gap-3 sm:justify-end">
        <div className="w-[104px]">
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onToggleLike}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title={isLiked ? "Unlike" : "Like"}
            aria-pressed={isLiked}
          >
            <Heart className={`h-4 w-4 ${isLiked ? "fill-slate-700 text-slate-700" : ""}`} />
          </button>
          <button
            onClick={onToggleQueue}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            title={isQueued ? "Remove from My Queue" : "Save to My Queue"}
            aria-pressed={isQueued}
          >
            {isQueued ? <ListChecks className="h-4 w-4 text-slate-800" /> : <ListPlus className="h-4 w-4" />}
          </button>
          <Button
            size="sm"
            onClick={onOpen}
            variant={inProgress ? "default" : "outline"}
            className={`ml-1.5 h-8 min-w-[76px] rounded-md text-[13px] ${
              inProgress
                ? "bg-slate-900 text-white hover:bg-slate-800"
                : "border-slate-300 text-slate-700 hover:bg-white hover:text-slate-900"
            }`}
          >
            {openLabel ?? (isSolved ? "Review" : isStarted ? "Resume" : "Solve")}
          </Button>
        </div>
      </div>
    </div>
  );
}
