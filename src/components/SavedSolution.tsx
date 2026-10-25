"use client"
// Shown instead of the answer form when the student has already solved the problem (decision 2026-10-25):
// their saved answer and explanation, with a "Solve again" button.

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCcw } from "lucide-react";
import MathPreview from "@/components/MathPreview";
import type { SavedSubmission } from "@/lib/savedWork";

export default function SavedSolution({
  submission,
  attempts,
  solvedAt,
  note,
  onSolveAgain,
}: {
  submission: SavedSubmission;
  attempts: number;
  /** When the problem was first solved */
  solvedAt: string;
  /** e.g. "Correct! +40 XP" right after solving */
  note?: string | null;
  onSolveAgain: () => void;
}) {
  const [html, setHtml] = useState("");

  // Render the saved explanation the same way as the editor preview
  useEffect(() => {
    let cancelled = false;
    setHtml("");
    if (!submission.explanation) return;
    fetch("/api/preview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: submission.explanation }),
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!cancelled) setHtml(typeof data?.html === "string" ? data.html : "");
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [submission.explanation]);

  const date = new Date(solvedAt).toLocaleDateString("en", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="rounded-md border border-emerald-200">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-emerald-100 bg-emerald-50/60 px-5 py-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" /> Solved
          </div>
          <p className="mt-0.5 text-xs text-slate-600">
            {note ? `${note} · ` : ""}
            Solved on {date}
            {attempts > 1 ? ` · ${attempts} submissions` : ""}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onSolveAgain}
          className="h-8 gap-1.5 rounded-md border-slate-300 text-[13px] text-slate-700 hover:text-slate-900"
        >
          <RefreshCcw className="h-3.5 w-3.5" /> Solve again
        </Button>
      </div>

      <div className="space-y-4 px-5 py-4">
        {submission.answer && (
          <div className="text-sm">
            <span className="text-slate-500">Your answer: </span>
            <code className="tnum font-mono text-slate-900">{submission.answer}</code>
          </div>
        )}
        <div>
          <div className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
            {submission.mode === "written" ? "Your solution" : "Your explanation"}
          </div>
          {submission.explanation ? (
            <MathPreview html={html} className="font-serif text-[15px] leading-relaxed text-slate-900" />
          ) : (
            <p className="text-sm text-slate-500">You did not write an explanation.</p>
          )}
        </div>
      </div>
    </div>
  );
}
