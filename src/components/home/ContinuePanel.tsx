"use client"
// "Continue" panel at the top of the dashboard: the next problem on the left and, for a ladder,
// the whole staircase on the right (Challenge on top, solved steps ticked, the current step marked).
import React from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/DifficultyRating";
import type { HomeProblem, Ladder, NextUp } from "./useHomeData";

const EYEBROW: Record<NextUp["kind"], string> = {
  resume: "Continue where you left off",
  ladder: "Next step on your ladder",
  "first-step": "Start here",
  recommended: "Recommended next",
};
const CTA: Record<NextUp["kind"], string> = {
  resume: "Resume",
  ladder: "Next step",
  "first-step": "Start the first step",
  recommended: "Solve",
};

function timeAgo(iso: string) {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  return `${Math.floor(days / 30)} month${days >= 60 ? "s" : ""} ago`;
}

/** Plain-text preview of a statement, or null when it contains LaTeX (it would show raw). */
function excerpt(content: string | null | undefined) {
  if (!content || /[$\\]/.test(content)) return null;
  const text = content.replace(/\n*Answer with a single number\.\s*$/i, "").replace(/\s+/g, " ").trim();
  return text.length > 260 ? text.slice(0, 257).replace(/\s+\S*$/, "") + " …" : text;
}

function LadderStaircase({
  ladder,
  currentId,
  solvedIds,
  onOpen,
}: {
  ladder: Ladder;
  currentId: string;
  solvedIds: Set<string>;
  onOpen: (p: HomeProblem) => void;
}) {
  const top = [...ladder.steps].reverse(); // Challenge first
  return (
    <ol className="space-y-0.5" aria-label={`${ladder.name}: ${ladder.solvedCount} of ${ladder.steps.length} solved`}>
      {top.map((s, i) => {
        const solved = solvedIds.has(s.problem.id);
        const current = s.problem.id === currentId;
        const last = i === top.length - 1;
        return (
          <li key={s.problem.id} className="relative flex gap-3">
            <div className="relative flex w-4 flex-shrink-0 justify-center" aria-hidden>
              {!last && <span className="absolute bottom-[-6px] top-[18px] w-px bg-slate-200" />}
              <span
                className={`relative z-10 mt-[7px] flex h-3.5 w-3.5 items-center justify-center rounded-full border ${
                  solved ? "border-slate-900 bg-slate-900 text-white" : current ? "border-slate-900 bg-white ring-2 ring-slate-900/15" : "border-slate-300 bg-white"
                }`}
              >
                {solved && <Check className="h-2.5 w-2.5" strokeWidth={3} />}
                {current && !solved && <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
              </span>
            </div>
            <button
              onClick={() => onOpen(s.problem)}
              className={`flex min-w-0 flex-1 items-center justify-between gap-3 rounded px-2 py-1 text-left text-[13px] transition-colors hover:bg-slate-50 ${
                current ? "bg-slate-50 font-medium text-slate-900" : solved ? "text-slate-500" : "text-slate-700"
              }`}
            >
              <span className="truncate">{s.label}</span>
              <span className="tnum flex-shrink-0 font-mono text-[11px] text-slate-400">{s.problem.difficulty}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function ContinuePanel({
  nextUp,
  solvedIds,
  onOpen,
  onBrowseLadders,
}: {
  nextUp: NextUp | null;
  solvedIds: Set<string>;
  onOpen: (p: HomeProblem) => void;
  onBrowseLadders: () => void;
}) {
  if (!nextUp) {
    return (
      <section className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500">
        You have solved everything available right now. New problems are added regularly.
      </section>
    );
  }

  const ladder = "ladder" in nextUp ? nextUp.ladder : undefined;
  const stepLabel = "stepLabel" in nextUp ? nextUp.stepLabel : undefined;
  const preview = excerpt(nextUp.problem.content);
  const category = nextUp.problem.category_path?.split(" > ").slice(0, 2).join(" › ");

  return (
    <section
      aria-label="Continue"
      className={`grid overflow-hidden rounded-md border border-slate-200 bg-white ${ladder ? "lg:grid-cols-[1fr_300px]" : ""}`}
    >
      <div className="flex flex-col p-6">
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{EYEBROW[nextUp.kind]}</div>
        <h2 className="mt-2 text-[22px] font-semibold leading-snug tracking-tight text-slate-900">{nextUp.problem.title}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
          <DifficultyBadge difficulty={nextUp.problem.difficulty} />
          {ladder && stepLabel && (
            <span>
              {stepLabel === "Challenge" ? "Final challenge" : stepLabel} of {ladder.steps.length} · {ladder.solvedCount} solved
            </span>
          )}
          {!ladder && category && <span>{category}</span>}
          {nextUp.kind === "resume" && <span>Started {timeAgo(nextUp.startedAt)}</span>}
          {nextUp.kind === "recommended" && nextUp.reasons.map((r) => <span key={r}>{r}</span>)}
        </div>

        {preview && (
          <p className="mt-5 line-clamp-4 border-l-2 border-slate-200 pl-4 font-serif text-[16px] leading-relaxed text-slate-700">
            {preview}
          </p>
        )}
        {nextUp.kind === "first-step" && !preview && (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-600">
            Ladders take you from a warm-up question to a competition-level Challenge in a few short steps.
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-2 pt-6">
          <Button onClick={() => onOpen(nextUp.problem)} className="h-9 gap-2 px-4">
            {CTA[nextUp.kind]} <ArrowRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" onClick={onBrowseLadders} className="h-9 px-3 text-slate-600">
            All ladders
          </Button>
        </div>
      </div>

      {ladder && (
        <aside className="border-t border-slate-200 bg-slate-50/60 p-5 lg:border-l lg:border-t-0">
          <div className="mb-3 flex items-baseline justify-between gap-2">
            <div className="min-w-0">
              <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Ladder</div>
              <div className="truncate text-sm font-semibold text-slate-900">{ladder.name}</div>
            </div>
            <span className="tnum flex-shrink-0 text-xs text-slate-500">
              {ladder.solvedCount}/{ladder.steps.length}
            </span>
          </div>
          <LadderStaircase ladder={ladder} currentId={nextUp.problem.id} solvedIds={solvedIds} onOpen={onOpen} />
        </aside>
      )}
    </section>
  );
}
