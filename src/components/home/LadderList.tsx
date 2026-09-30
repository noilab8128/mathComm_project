"use client"
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { getDifficultyLabel } from "@/lib/supabase";
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
    <div className="flex flex-col rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-blue-200">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-semibold text-gray-800">{ladder.name}</h3>
          {topic && <div className="mt-0.5 truncate text-xs text-gray-500">{topic}</div>}
        </div>
        {done ? (
          <Badge className="gap-1 bg-emerald-600 text-[10px]"><CheckCircle2 className="h-3 w-3" />Done</Badge>
        ) : ladder.matchesInterest ? (
          <Badge variant="secondary" className="bg-violet-50 text-[10px] text-violet-700">For you</Badge>
        ) : null}
      </div>

      <div className="mt-3 text-xs text-gray-500">
        {getDifficultyLabel(first.difficulty)} {first.difficulty} → {getDifficultyLabel(ladder.root.difficulty)}{" "}
        {ladder.root.difficulty} · {ladder.steps.length} problems
      </div>

      <div className="mt-3 flex items-center justify-between gap-2">
        <LadderDots ladder={ladder} currentId={ladder.next?.problem.id} solvedIds={solvedIds} />
        <span className="text-xs font-medium text-gray-600">
          {ladder.solvedCount}/{ladder.steps.length}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-gray-100 pt-3">
        <span className="truncate text-xs text-gray-500">
          {done ? "All steps solved" : `Next: ${ladder.next!.label}`}
        </span>
        <Button
          size="sm"
          variant={ladder.solvedCount > 0 && !done ? "default" : "outline"}
          className={`h-8 ${ladder.solvedCount > 0 && !done ? "bg-blue-600 hover:bg-blue-700" : ""}`}
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
    return <div className="py-8 text-center text-sm text-gray-500">No ladders yet.</div>;
  }
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      {ladders.map((l) => (
        <LadderCard key={l.root.id} ladder={l} solvedIds={solvedIds} startedIds={startedIds} onOpen={onOpen} />
      ))}
    </div>
  );
}
