"use client"
// "Problem analysis" for solution-path ladders (olympiad/ladders/LADDER_RULES_v2.md): what a strong solver
// notices, and the solution as numbered moves, each linked to the step problem that practises it.
// Members only: loaded from /api/ladders/guide, which checks the sign-in. Ladders without a guide show nothing.
import React, { useEffect, useState } from "react";
import { ChevronDown, Lightbulb, Route } from "lucide-react";

interface FlowMove {
  title: string;
  text: string;
  stepProblemId: string | null;
  stepTitle: string | null;
}

interface Guide {
  rootId: string;
  analysis: string[];
  flow: FlowMove[];
}

export default function LadderGuide({
  problemId,
  onOpenProblem,
}: {
  problemId: string;
  onOpenProblem: (id: string) => void;
}) {
  const [guide, setGuide] = useState<Guide | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setGuide(null);
    fetch(`/api/ladders/guide?problemId=${encodeURIComponent(problemId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((g) => {
        if (!cancelled) setGuide(g);
      })
      .catch(() => {
        if (!cancelled) setGuide(null);
      });
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  if (!guide || (guide.analysis.length === 0 && guide.flow.length === 0)) return null;

  return (
    <section className="mt-6 rounded-md border border-slate-200 bg-white">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-slate-400" />
          <span className="text-[13px] font-semibold text-slate-900">Problem analysis</span>
          <span className="text-xs text-slate-500">How to approach this ladder&apos;s Challenge, move by move</span>
        </span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="space-y-5 border-t border-slate-100 px-4 py-4">
          {guide.analysis.length > 0 && (
            <div>
              <h4 className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">What to notice</h4>
              <ul className="mt-2 list-disc space-y-1.5 pl-5 font-serif text-[15px] leading-relaxed text-slate-800">
                {guide.analysis.map((a, i) => (
                  <li key={i}>{a}</li>
                ))}
              </ul>
            </div>
          )}

          {guide.flow.length > 0 && (
            <div>
              <h4 className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
                <Route className="h-3.5 w-3.5" /> Solution flow
              </h4>
              <ol className="mt-2 space-y-2">
                {guide.flow.map((m, i) => {
                  const isHere = m.stepProblemId === problemId;
                  return (
                    <li
                      key={i}
                      className={`rounded-md border px-3 py-2.5 ${isHere ? "border-slate-400 bg-slate-50" : "border-slate-200"}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-slate-900">
                            <span className="tnum mr-1.5 text-slate-400">{i + 1}.</span>
                            {m.title}
                          </div>
                          <p className="mt-1 font-serif text-[14px] leading-relaxed text-slate-700">{m.text}</p>
                        </div>
                        {m.stepProblemId && !isHere && (
                          <button
                            onClick={() => onOpenProblem(m.stepProblemId!)}
                            className="flex-shrink-0 rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                            title={m.stepTitle ?? undefined}
                          >
                            Open step
                          </button>
                        )}
                        {isHere && <span className="flex-shrink-0 text-[11px] text-slate-500">This step</span>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
