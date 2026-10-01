"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Mountain, PlayCircle, RotateCcw, Sparkles } from "lucide-react";
import { DifficultyBadge } from "./ProblemRow";
import type { Ladder, NextUp } from "./useHomeData";

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)} month${days >= 60 ? "s" : ""} ago`;
}

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

const COPY: Record<NextUp["kind"], { eyebrow: string; cta: string; icon: React.ReactNode }> = {
  resume: { eyebrow: "Pick up where you left off", cta: "Resume", icon: <RotateCcw className="h-3.5 w-3.5" /> },
  ladder: { eyebrow: "Continue your ladder", cta: "Next step", icon: <Mountain className="h-3.5 w-3.5" /> },
  "first-step": { eyebrow: "Start here", cta: "Start the first step", icon: <PlayCircle className="h-3.5 w-3.5" /> },
  recommended: { eyebrow: "Next up for you", cta: "Solve", icon: <Sparkles className="h-3.5 w-3.5" /> },
};

export function NextUpCard({
  nextUp,
  solvedIds,
  onOpen,
  onBrowseLadders,
}: {
  nextUp: NextUp | null;
  solvedIds: Set<string>;
  onOpen: () => void;
  onBrowseLadders: () => void;
}) {
  if (!nextUp) {
    return (
      <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500">
        You have solved everything available right now. New problems are added regularly.
      </div>
    );
  }

  const copy = COPY[nextUp.kind];
  const ladder = "ladder" in nextUp ? nextUp.ladder : undefined;
  const stepLabel = "stepLabel" in nextUp ? nextUp.stepLabel : undefined;
  const stepIndex = ladder ? ladder.steps.findIndex((s) => s.problem.id === nextUp.problem.id) + 1 : 0;

  return (
    <section aria-label="Next up" className="rounded-md border border-slate-200 border-l-[3px] border-l-slate-900 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
        {copy.icon}
        {copy.eyebrow}
      </div>

      <h2 className="mt-2 text-xl font-semibold tracking-tight text-slate-900 sm:text-[22px]">{nextUp.problem.title}</h2>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-600">
        <DifficultyBadge difficulty={nextUp.problem.difficulty} />
        {ladder && (
          <span>
            {/* Ladder step titles already start with the ladder name ("Candy Game — Step 1") */}
            {!nextUp.problem.title.startsWith(ladder.name) && (
              <span className="font-medium text-slate-800">{ladder.name} · </span>
            )}
            {stepLabel ? `${stepLabel === "Challenge" ? "Final challenge" : `Problem ${stepIndex}`} of ${ladder.steps.length}` : null}
          </span>
        )}
        {nextUp.kind === "resume" && <span className="text-slate-500">Started {timeAgo(nextUp.startedAt)}</span>}
        {nextUp.kind === "recommended" &&
          nextUp.reasons.map((r) => (
            <span key={r} className="text-slate-500">
              {r}
            </span>
          ))}
      </div>

      {ladder && (
        <div className="mt-4">
          <LadderDots ladder={ladder} currentId={nextUp.problem.id} solvedIds={solvedIds} />
        </div>
      )}

      {nextUp.kind === "first-step" && (
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
          Ladders take you from a warm-up question to a competition-level Challenge in a few short steps.
          Each step uses the idea you need for the next one.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button onClick={onOpen} className="h-9 gap-2 rounded-md bg-slate-900 px-4 text-sm text-white hover:bg-slate-800">
          {copy.cta}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" onClick={onBrowseLadders} className="h-9 rounded-md px-3 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          Browse all ladders
        </Button>
      </div>
    </section>
  );
}
