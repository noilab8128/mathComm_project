"use client"
import React from "react";
import { getDifficultyLabel } from "@/lib/supabase";

/**
 * Difficulty as a rating: the 1–10 number plus a five-bar meter (two points per bar).
 * The label (Easy / Medium / Hard / Olympiad) is in the tooltip and for screen readers.
 */
export function DifficultyBadge({ difficulty }: { difficulty: number }) {
  const label = getDifficultyLabel(difficulty);
  const filled = Math.max(1, Math.min(5, Math.ceil(difficulty / 2)));
  return (
    <span
      className="inline-flex items-center gap-1.5 text-xs text-slate-600"
      title={`${label} · difficulty ${difficulty} of 10`}
      aria-label={`${label}, difficulty ${difficulty} of 10`}
    >
      <span className="flex items-end gap-[2px]" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <span
            key={i}
            className={`w-[3px] rounded-[1px] ${i <= filled ? "bg-slate-700" : "bg-slate-200"}`}
            style={{ height: `${4 + i * 2}px` }}
          />
        ))}
      </span>
      <span className="tnum font-mono text-[11px] font-medium text-slate-700">{difficulty}</span>
      <span className="text-slate-400">{label}</span>
    </span>
  );
}
