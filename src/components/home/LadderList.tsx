"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { LadderDots } from "./NextUpCard";
import type { HomeProblem, Ladder } from "./useHomeData";

function LadderCard({
  ladder,
  solvedIds,
  startedIds,
  onOpen,
}: {
  ladder: Ladder;
  solvedIds: Set<string>;
  startedIds: Set<string>;
  onOpen: (p: HomeProblem) => void;
}) {
  const done = ladder.next === null;
  const first = ladder.steps[0].problem;
  const topic = ladder.root.category_path?.split(" > ")[0];
  const nextStarted = ladder.next && startedIds.has(ladder.next.problem.id);

  return (
    <div className="flex flex-col rounded-md border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900">{ladder.name}</h3>
          {topic && <div className="mt-0.5 truncate text-xs text-slate-500">{topic}</div>}
        </div>
        {done ? (
          <span className="inline-flex items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-px text-[11px] font-medium text-emerald-700">
            <CheckCircle2 className="h-3 w-3" />Completed
          </span>
        ) : ladder.matchesInterest ? (
          <span className="whitespace-nowrap rounded border border-slate-200 px-1.5 py-px text-[11px] text-slate-600" title="Matches your interests">For you</span>
        ) : null}
      </div>

      <div className="tnum mt-3 text-xs text-slate-500">
        Difficulty {first.difficulty} → {ladder.root.difficulty} · {ladder.steps.length} problems
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <LadderDots ladder={ladder} currentId={ladder.next?.problem.id} solvedIds={solvedIds} />
        <span className="tnum text-xs text-slate-600">
          {ladder.solvedCount}/{ladder.steps.length}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <span className="truncate text-xs text-slate-500">
          {done ? "All steps solved" : `Next: ${ladder.next!.label}`}
        </span>
        <Button
          size="sm"
          variant={ladder.solvedCount > 0 && !done ? "default" : "outline"}
          className={`h-8 rounded-md text-[13px] ${
            ladder.solvedCount > 0 && !done
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "border-slate-300 text-slate-700 hover:text-slate-900"
          }`}
          onClick={() => onOpen(done ? ladder.root : ladder.next!.problem)}
        >
          {done ? "Review" : ladder.solvedCount > 0 || nextStarted ? "Continue" : "Start"}
        </Button>
      </div>
    </div>
  );
}

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
    return <div className="py-8 text-center text-sm text-slate-500">No ladders yet.</div>;
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {ladders.map((l) => (
        <LadderCard key={l.root.id} ladder={l} solvedIds={solvedIds} startedIds={startedIds} onOpen={onOpen} />
      ))}
    </div>
  );
}
