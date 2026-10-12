"use client"
// Hint and Theory buttons under the problem statement (decisions 2026-10-11, docs/OPERATING_POLICY.md):
//  - Hint: hints written in advance (public.problem_hints, members-only API), revealed one at a time. Free.
//  - Theory: our own short card for the problem's topic (src/lib/theory.ts) with AoPS Wiki / Wikipedia links.

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Lightbulb, Loader2 } from "lucide-react";
import { theoryFor } from "@/lib/theory";

export default function ProblemHelp({ problemId, subdomainId }: { problemId: string; subdomainId?: number | null }) {
  const [hints, setHints] = useState<string[] | null>(null); // null = not loaded yet
  const [shown, setShown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);
  const [theoryOpen, setTheoryOpen] = useState(false);
  const card = theoryFor(subdomainId);

  useEffect(() => {
    setHints(null);
    setShown(0);
    setHintError(null);
    setTheoryOpen(false);
  }, [problemId]);

  const showHint = async () => {
    if (hints) {
      setShown((n) => Math.min(n + 1, hints.length));
      return;
    }
    setLoading(true);
    setHintError(null);
    try {
      const res = await fetch(`/api/problems/hints?problemId=${encodeURIComponent(problemId)}`);
      if (!res.ok) throw new Error(res.status === 401 ? "Sign in to see hints." : "Hints could not be loaded.");
      const data = (await res.json()) as { hints: string[] };
      setHints(data.hints || []);
      setShown(data.hints?.length ? 1 : 0);
    } catch (err) {
      setHintError(err instanceof Error ? err.message : "Hints could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  const allShown = hints !== null && shown >= hints.length;
  const hintLabel = hints === null || shown === 0 ? "Hint" : allShown ? "No more hints" : `Hint ${shown + 1} of ${hints.length}`;

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={showHint}
          disabled={loading || (hints !== null && allShown)}
          className="h-8 rounded-md border-slate-300 text-[13px] text-slate-700 hover:text-slate-900"
        >
          {loading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-1.5 h-4 w-4" />}
          {hintLabel}
        </Button>
        {card && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setTheoryOpen((o) => !o)}
            aria-expanded={theoryOpen}
            className="h-8 rounded-md border-slate-300 text-[13px] text-slate-700 hover:text-slate-900"
          >
            <BookOpen className="mr-1.5 h-4 w-4" /> Theory
          </Button>
        )}
      </div>

      {hintError && <p className="mt-2 text-sm text-red-600">{hintError}</p>}
      {hints !== null && hints.length === 0 && (
        <p className="mt-2 text-sm text-slate-500">There is no hint for this problem yet.</p>
      )}
      {hints !== null && shown > 0 && (
        <ol className="mt-3 space-y-2">
          {hints.slice(0, shown).map((h, i) => (
            <li key={i} className="border-l-2 border-amber-300 pl-3 text-sm leading-relaxed text-slate-700">
              <span className="font-medium text-slate-900">Hint {i + 1}. </span>
              {h}
            </li>
          ))}
        </ol>
      )}

      {card && theoryOpen && (
        <section aria-label="Theory" className="mt-3 rounded-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <h4 className="font-semibold text-slate-900">{card.title}</h4>
          <p className="mt-1 leading-relaxed text-slate-700">{card.summary}</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 leading-relaxed text-slate-700">
            {card.keyIdeas.map((k) => (
              <li key={k}>{k}</li>
            ))}
          </ul>
          <p className="mt-2 leading-relaxed text-slate-700">
            <span className="font-medium text-slate-900">Example. </span>
            {card.example}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
            {card.links.map((l) => (
              <a
                key={l.url}
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[13px] text-blue-800 underline-offset-2 hover:underline"
              >
                {l.label} <ExternalLink className="h-3 w-3" />
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
