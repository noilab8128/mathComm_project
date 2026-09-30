"use client"
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Heart, ListPlus, ListChecks } from "lucide-react";
import { getDifficultyLabel } from "@/lib/supabase";
import type { HomeProblem } from "./useHomeData";

const DIFFICULTY_STYLE: Record<string, string> = {
  Easy: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border-amber-200",
  Hard: "bg-orange-50 text-orange-700 border-orange-200",
  Olympiad: "bg-red-50 text-red-700 border-red-200",
};

export function DifficultyBadge({ difficulty }: { difficulty: number }) {
  const label = getDifficultyLabel(difficulty);
  return (
    <Badge variant="outline" className={`text-[10px] font-medium ${DIFFICULTY_STYLE[label]}`}>
      {label} · {difficulty}
    </Badge>
  );
}

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
 * One problem in a list. `compact` is used for heavy users and the queue, where more rows
 * should fit on screen.
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

  return (
    <div
      className={`group flex flex-col gap-2 rounded-lg sm:flex-row sm:items-center sm:gap-3 border border-gray-200 bg-white transition-colors hover:border-blue-200 hover:bg-blue-50/30 ${
        compact ? "px-3 py-2" : "p-3"
      }`}
    >
      <button onClick={onOpen} className="min-w-0 flex-1 text-left">
        <div className="flex items-center gap-2">
          {isSolved && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" aria-label="Solved" />}
          <span className={`line-clamp-2 font-medium text-gray-800 sm:line-clamp-1 ${compact ? "text-sm" : "text-[15px]"}`}>
            {problem.title}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-gray-500">
          <DifficultyBadge difficulty={problem.difficulty} />
          {context && <span className="font-medium text-blue-700">{context}</span>}
          {!compact && category && <span className="truncate">{category}</span>}
          {reasons.map((r) => (
            <Badge key={r} variant="secondary" className="bg-slate-100 text-[10px] font-normal text-slate-600">
              {r}
            </Badge>
          ))}
        </div>
      </button>

      <div className="flex flex-shrink-0 items-center justify-end gap-1">
        <button
          onClick={onToggleLike}
          className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-pink-50 hover:text-pink-500"
          title={isLiked ? "Unlike" : "Like"}
          aria-pressed={isLiked}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-pink-500 text-pink-500" : ""}`} />
        </button>
        <button
          onClick={onToggleQueue}
          className="rounded-full p-1.5 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
          title={isQueued ? "Remove from My Queue" : "Save to My Queue"}
          aria-pressed={isQueued}
        >
          {isQueued ? <ListChecks className="h-4 w-4 text-blue-600" /> : <ListPlus className="h-4 w-4" />}
        </button>
        <Button
          size="sm"
          onClick={onOpen}
          variant={isStarted && !isSolved ? "default" : "outline"}
          className={`ml-1 h-8 min-w-[76px] ${isStarted && !isSolved ? "bg-blue-600 hover:bg-blue-700" : ""}`}
        >
          {openLabel ?? (isSolved ? "Review" : isStarted ? "Resume" : "Solve")}
        </Button>
      </div>
    </div>
  );
}
