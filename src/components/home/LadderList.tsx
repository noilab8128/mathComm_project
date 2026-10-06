"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import type { HomeProblem, Ladder } from "./useHomeData";

/** One segment per ladder step: solved = dark, current = outlined, the Challenge segment is wider. */
export function LadderDots({ ladder, currentId, solvedIds }: { ladder: Ladder; currentId?: string; solvedIds: Set<string> }) {
  return (
    <div className="flex items-center gap-[3px]" aria-label={`${ladder.solvedCount} of ${ladder.steps.length} steps solved`}>
      {ladder.steps.map((s) => {
        const solved = solvedIds.has(s.problem.id);
        const current = s.problem.id === currentId;
        const isChallenge = s.label === "Challenge";
        return (
          <span
            key={s.problem.id}
            title={`${s.label}${solved ? " (solved)" : current ? " (current)" : ""}`}
            className={`h-1.5 rounded-[1px] ${isChallenge ? "w-7" : "w-4"} ${
              solved ? "bg-slate-800" : current ? "bg-white ring-1 ring-inset ring-slate-800" : "bg-slate-200"
            }`}
          />
        );
      })}
    </div>
  );
}

/** Ladders as a compact table: one row per ladder with progress and the next action. */
export function LadderList({
  ladders,
  solvedIds,
  startedIds,
  onOpen,
}: {
  ladders: Ladder[];
  solvedIds: Set<string>;
  startedIds: Set<string>;
  onOpen: (p: HomeProblem) => void;
}) {
  if (ladders.length === 0) {
    return <div className="rounded-md border border-slate-200 bg-white py-8 text-center text-sm text-slate-500">No ladders yet.</div>;
  }
  return (
    <ul className="divide-y divide-slate-100 overflow-hidden rounded-md border border-slate-200 bg-white">
      {ladders.map((ladder) => {
        const done = ladder.next === null;
        const first = ladder.steps[0].problem;
        const topic = ladder.root.category_path?.split(" > ")[0];
        const inProgress = !done && (ladder.solvedCount > 0 || (!!ladder.next && startedIds.has(ladder.next.problem.id)));
        return (
          <li key={ladder.root.id} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 px-4 py-3 transition-colors hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_180px_88px_96px]">
            <button className="col-start-1 row-start-1 min-w-0 text-left sm:col-start-auto sm:row-start-auto" onClick={() => onOpen(done ? ladder.root : ladder.next!.problem)}>
              <span className="flex items-center gap-2">
                <span className="truncate font-medium text-slate-900">{ladder.name}</span>
                {done && (
                  <span className="inline-flex items-center gap-0.5 rounded border border-emerald-200 bg-emerald-50 px-1 py-px text-[10px] font-medium text-emerald-700">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} /> Done
                  </span>
                )}
                {!done && ladder.matchesInterest && (
                  <span className="rounded border border-slate-200 px-1 py-px text-[10px] text-slate-500" title="Matches your interests">For you</span>
                )}
              </span>
              <span className="mt-0.5 block truncate text-xs text-slate-500">
                {topic ? `${topic} · ` : ""}
                {done ? "All steps solved" : `Next: ${ladder.next!.label}`}
              </span>
            </button>
            <div className="col-span-2 flex items-center gap-3 sm:col-span-1">
              <LadderDots ladder={ladder} currentId={ladder.next?.problem.id} solvedIds={solvedIds} />
              <span className="tnum text-xs text-slate-500">{ladder.solvedCount}/{ladder.steps.length}</span>
            </div>
            <span className="tnum hidden text-xs text-slate-500 sm:block" title="Difficulty of the first step and of the Challenge">
              {first.difficulty} → {ladder.root.difficulty}
            </span>
            <div className="col-start-2 row-start-1 flex justify-end sm:col-start-auto sm:row-start-auto">
              <Button
                size="sm"
                variant={inProgress ? "default" : "outline"}
                className="h-8 min-w-[80px] text-[13px]"
                onClick={() => onOpen(done ? ladder.root : ladder.next!.problem)}
              >
                {done ? "Review" : inProgress ? "Continue" : "Start"}
              </Button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
