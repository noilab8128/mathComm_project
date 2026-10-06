"use client"
// One row of key numbers at the top of the dashboard (replaces the side "Progress" card).
import React from "react";
import Link from "next/link";
import type { UserStats } from "./useHomeData";

const EMPTY: UserStats = {
  current_level: 1, total_xp: 0, ranking_points: 0, tier: "Bronze III",
  current_streak: 0, longest_streak: 0, problems_solved: 0, problems_attempted: 0,
};

function Cell({ label, children, sub }: { label: string; children: React.ReactNode; sub?: React.ReactNode }) {
  return (
    <div className="min-w-0 px-5 py-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="tnum mt-1 text-2xl font-semibold tracking-tight text-slate-900">{children}</div>
      {sub && <div className="mt-0.5 truncate text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function StatStrip({ stats, solvedCount }: { stats?: UserStats; solvedCount: number }) {
  const s = stats ?? EMPTY;
  // Level L starts at (L-1)^2 * 100 XP (see lib/progression.ts)
  const levelStart = Math.pow(s.current_level - 1, 2) * 100;
  const levelEnd = Math.pow(s.current_level, 2) * 100;
  const pct = Math.min(100, Math.max(0, ((s.total_xp - levelStart) / (levelEnd - levelStart)) * 100));

  return (
    <section
      aria-label="Your progress"
      className="grid grid-cols-2 divide-slate-200 rounded-md border border-slate-200 bg-white md:grid-cols-4 md:divide-x [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-slate-200 md:[&>*:nth-child(-n+2)]:border-b-0"
    >
      <Cell label="Solved" sub={s.problems_attempted > 0 ? `${s.problems_attempted} attempted` : "problems"}>
        {solvedCount}
      </Cell>
      <Cell label="Rating" sub={s.tier}>
        {s.ranking_points}
      </Cell>
      <Cell label="Streak" sub={s.longest_streak > 0 ? `best ${s.longest_streak} days` : "days in a row"}>
        {s.current_streak}
      </Cell>
      <div className="min-w-0 px-5 py-4">
        <div className="flex items-baseline justify-between">
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Level</div>
          <Link href="/dashboard/stats" className="text-[11px] text-slate-500 hover:text-slate-900">Statistics →</Link>
        </div>
        <div className="tnum mt-1 text-2xl font-semibold tracking-tight text-slate-900">{s.current_level}</div>
        <div className="mt-1.5 h-1 bg-slate-100" aria-hidden>
          <div className="h-1 bg-slate-900" style={{ width: `${pct}%` }} />
        </div>
        <div className="tnum mt-1 truncate text-xs text-slate-500">
          {Math.max(0, levelEnd - s.total_xp)} XP to level {s.current_level + 1}
        </div>
      </div>
    </section>
  );
}
