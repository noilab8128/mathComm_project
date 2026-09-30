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

/** One dot per ladder step: solved = filled, current = ring. */
export function LadderDots({ ladder, currentId, solvedIds }: { ladder: Ladder; currentId?: string; solvedIds: Set<string> }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${ladder.solvedCount} of ${ladder.steps.length} steps solved`}>
      {ladder.steps.map((s) => {
        const solved = solvedIds.has(s.problem.id);
        const current = s.problem.id === currentId;
        const isChallenge = s.label === "Challenge";
        return (
          <span
            key={s.problem.id}
            title={`${s.label}${solved ? " (solved)" : ""}`}
            className={`h-2 rounded-full ${isChallenge ? "w-5" : "w-3"} ${
              solved ? "bg-blue-600" : current ? "bg-white ring-2 ring-blue-600" : "bg-blue-100"
            }`}
          />
        );
      })}
    </div>
  );
}

const COPY: Record<NextUp["kind"], { eyebrow: string; cta: string; icon: React.ReactNode }> = {
  resume: { eyebrow: "Pick up where you left off", cta: "Resume", icon: <RotateCcw className="h-4 w-4" /> },
  ladder: { eyebrow: "Continue your ladder", cta: "Next step", icon: <Mountain className="h-4 w-4" /> },
  "first-step": { eyebrow: "Start here", cta: "Start the first step", icon: <PlayCircle className="h-4 w-4" /> },
  recommended: { eyebrow: "Next up for you", cta: "Solve", icon: <Sparkles className="h-4 w-4" /> },
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
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-sm text-gray-500">
        You have solved everything available right now. New problems are added regularly.
      </div>
    );
  }

  const copy = COPY[nextUp.kind];
  const ladder = "ladder" in nextUp ? nextUp.ladder : undefined;
  const stepLabel = "stepLabel" in nextUp ? nextUp.stepLabel : undefined;
  const stepIndex = ladder ? ladder.steps.findIndex((s) => s.problem.id === nextUp.problem.id) + 1 : 0;

  return (
    <section
      aria-label="Next up"
      className="relative overflow-hidden rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 sm:p-6"
    >
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
        {copy.icon}
        {copy.eyebrow}
      </div>

      <h2 className="mt-2 text-xl font-semibold text-gray-800 sm:text-2xl">{nextUp.problem.title}</h2>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-600">
        <DifficultyBadge difficulty={nextUp.problem.difficulty} />
        {ladder && (
          <span>
            {/* Ladder step titles already start with the ladder name ("Candy Game — Step 1") */}
            {!nextUp.problem.title.startsWith(ladder.name) && (
              <strong className="font-medium text-gray-800">{ladder.name} · </strong>
            )}
            {stepLabel ? `${stepLabel === "Challenge" ? "Final challenge" : `Problem ${stepIndex}`} of ${ladder.steps.length}` : null}
          </span>
        )}
        {nextUp.kind === "resume" && <span className="text-gray-500">· started {timeAgo(nextUp.startedAt)}</span>}
        {nextUp.kind === "recommended" &&
          nextUp.reasons.map((r) => (
            <span key={r} className="text-gray-500">
              · {r}
            </span>
          ))}
      </div>

      {ladder && (
        <div className="mt-4">
          <LadderDots ladder={ladder} currentId={nextUp.problem.id} solvedIds={solvedIds} />
        </div>
      )}

      {nextUp.kind === "first-step" && (
        <p className="mt-3 max-w-xl text-sm text-gray-600">
          Ladders take you from a warm-up question to a competition-level Challenge in a few short steps.
          Each step uses the idea you need for the next one.
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <Button onClick={onOpen} className="h-10 gap-2 bg-blue-600 px-5 hover:bg-blue-700">
          {copy.cta}
          <ArrowRight className="h-4 w-4" />
        </Button>
        <Button variant="ghost" onClick={onBrowseLadders} className="h-10 text-gray-600">
          Browse all ladders
        </Button>
      </div>
    </section>
  );
}
