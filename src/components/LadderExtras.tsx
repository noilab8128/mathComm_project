"use client"
// "After this ladder": three buttons under a ladder's Challenge (top problem). Similar olympiad problems
// (citations only), research problems, and olympiad proof problems with hints and a full proof (no points).
// Rows come from public.ladder_extras (olympiad/ladders/import_extras.py). Problems without rows show nothing.
import React, { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { BookMarked, ExternalLink, FlaskConical, PenLine } from "lucide-react";
import { supabase } from "@/lib/supabase";
import MathPreview from "@/components/MathPreview";

type Kind = "similar" | "research" | "proof";

interface Extra {
  id: string;
  kind: Kind;
  sort_order: number;
  title: string;
  meta: string | null;
  body: string;
  hints: string[];
  solution: string | null;
  link: string | null;
}

const SECTIONS: { kind: Kind; label: string; blurb: string; icon: typeof BookMarked }[] = [
  { kind: "similar", label: "Similar olympiad problems", blurb: "Real contest problems built on the same idea. Described in our words; the full statements are at the official source.", icon: BookMarked },
  { kind: "research", label: "Research problems", blurb: "Open-ended questions and famous unsolved problems connected to this ladder.", icon: FlaskConical },
  { kind: "proof", label: "Olympiad proof problems", blurb: "Prove the idea behind this ladder. No points: try it, use the hints, then compare with the full proof.", icon: PenLine },
];

const ESCAPE: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };

// Plain text -> HTML for MathPreview: blank lines split paragraphs, single newlines become line breaks,
// and paragraphs whose lines look like "a  |  b  |  c" become a table. Math stays as $...$ for MathJax.
function textToHtml(text: string) {
  const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESCAPE[c]);
  return text
    .trim()
    .split(/\n\s*\n/)
    .map((para) => {
      const lines = para.split("\n").filter((l) => l.trim());
      if (lines.length > 1 && lines.every((l) => l.includes("  |  "))) {
        const rows = lines.map((l) => l.split("  |  ").map((c) => esc(c.trim())));
        const head = `<tr>${rows[0].map((c) => `<th class="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-medium">${c}</th>`).join("")}</tr>`;
        const body = rows.slice(1).map((r) => `<tr>${r.map((c) => `<td class="tnum border border-slate-200 px-2 py-1">${c}</td>`).join("")}</tr>`).join("");
        return `<div class="my-3 overflow-x-auto"><table class="border-collapse font-sans text-xs">${head}${body}</table></div>`;
      }
      return `<p class="my-2">${lines.map(esc).join("<br/>")}</p>`;
    })
    .join("");
}

function Text({ text, className }: { text: string; className?: string }) {
  return <MathPreview html={textToHtml(text)} className={`font-serif text-[15px] leading-relaxed text-slate-800 ${className ?? ""}`} />;
}

function ProofCard({ item, index }: { item: Extra; index: number }) {
  const [shownHints, setShownHints] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  return (
    <li className="rounded-md border border-slate-200 bg-white">
      <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
        <h4 className="text-sm font-semibold text-slate-900">
          <span className="tnum mr-1.5 font-mono text-xs text-slate-400">P{index + 1}</span>
          {item.title}
        </h4>
        {item.meta && <span className="flex-shrink-0 rounded border border-slate-200 px-1.5 py-px text-[11px] text-slate-500">{item.meta}</span>}
      </div>
      <div className="px-4 py-2">
        <Text text={item.body} />
        {item.hints.slice(0, shownHints).map((hint, i) => (
          <div key={i} className="my-2 border-l-2 border-slate-300 pl-3">
            <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Hint {i + 1}</div>
            <Text text={hint} className="text-[14px]" />
          </div>
        ))}
        {showSolution && item.solution && (
          <div className="my-3 rounded-md bg-slate-50 px-4 py-2">
            <div className="pt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Proof</div>
            <Text text={item.solution} className="text-[14px]" />
          </div>
        )}
      </div>
      <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-2.5">
        {shownHints < item.hints.length && (
          <button
            type="button"
            onClick={() => setShownHints((n) => n + 1)}
            className="h-8 rounded-md border border-slate-300 px-3 text-xs text-slate-700 hover:border-slate-400 hover:text-slate-900"
          >
            {shownHints === 0 ? "Show a hint" : "Next hint"} ({shownHints + 1}/{item.hints.length})
          </button>
        )}
        {item.solution && (
          <button
            type="button"
            onClick={() => setShowSolution((s) => !s)}
            className="h-8 rounded-md border border-slate-300 px-3 text-xs text-slate-700 hover:border-slate-400 hover:text-slate-900"
          >
            {showSolution ? "Hide proof" : "Show full proof"}
          </button>
        )}
      </div>
    </li>
  );
}

export function LadderExtras({ problemId }: { problemId: string }) {
  const [items, setItems] = useState<Extra[]>([]);
  const [open, setOpen] = useState<Kind | null>(null);

  useEffect(() => {
    let cancelled = false;
    setItems([]);
    setOpen(null);
    // ladder_extras is not in the generated Database types yet, so use the untyped client.
    (supabase as unknown as SupabaseClient)
      .from("ladder_extras")
      .select("id, kind, sort_order, title, meta, body, hints, solution, link")
      .eq("root_problem_id", problemId)
      .order("sort_order")
      .then(({ data, error }) => {
        if (!cancelled && !error && data) setItems(data as Extra[]);
      });
    return () => {
      cancelled = true;
    };
  }, [problemId]);

  if (items.length === 0) return null;

  const sections = SECTIONS.filter((s) => items.some((i) => i.kind === s.kind));
  const active = sections.find((s) => s.kind === open);
  const activeItems = items.filter((i) => i.kind === open);

  return (
    <section aria-label="After this ladder" className="mt-10 border-t border-slate-200 pt-6">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">After this ladder</div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {sections.map(({ kind, label, icon: Icon }) => {
          const count = items.filter((i) => i.kind === kind).length;
          const isOpen = open === kind;
          return (
            <button
              key={kind}
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : kind)}
              className={`flex items-center gap-2.5 rounded-md border px-3 py-2.5 text-left text-sm transition-colors ${
                isOpen ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
              }`}
            >
              <Icon className={`h-4 w-4 flex-shrink-0 ${isOpen ? "text-slate-300" : "text-slate-400"}`} />
              <span className="flex-1 font-medium leading-snug">{label}</span>
              <span className={`tnum font-mono text-xs ${isOpen ? "text-slate-300" : "text-slate-400"}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {active && (
        <div className="mt-4">
          <p className="mb-3 text-xs text-slate-500">{active.blurb}</p>

          {active.kind === "similar" && (
            <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white">
              {activeItems.map((item) => (
                <li key={item.id} className="px-4 py-3">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <span className="text-sm font-semibold text-slate-900">{item.title}</span>
                    {item.meta && <span className="rounded border border-slate-200 px-1.5 py-px text-[11px] text-slate-500">{item.meta} match</span>}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-slate-600">{item.body}</p>
                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline">
                      Official problems <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}

          {active.kind === "research" && (
            <ul className="space-y-3">
              {activeItems.map((item) => (
                <li key={item.id} className="rounded-md border border-slate-200 bg-white px-4 py-3">
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                    {item.meta && <span className="text-[11px] text-slate-500">{item.meta}</span>}
                  </div>
                  <Text text={item.body} />
                </li>
              ))}
            </ul>
          )}

          {active.kind === "proof" && (
            <ol className="space-y-3">
              {activeItems.map((item, i) => (
                <ProofCard key={item.id} item={item} index={i} />
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}

export default LadderExtras;
