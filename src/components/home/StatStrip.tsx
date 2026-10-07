"use client"
// Key numbers: solved, rating, streak, level.
//  - SidebarStats: a 4x1 column in the left sidebar (SideNav), on wide screens
//  - StatStrip variant="row": a 1x4 row on the dashboard, for screens where the sidebar is hidden
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { UserStats } from "./useHomeData";

/** Fire this after the user may have solved something, so the sidebar numbers reload. */
export const STATS_CHANGED_EVENT = "mq-stats-changed";

const EMPTY: UserStats = {
  current_level: 1, total_xp: 0, ranking_points: 0, tier: "Bronze III",
  current_streak: 0, longest_streak: 0, problems_solved: 0, problems_attempted: 0,
};

type Variant = "row" | "column";

function Cell({ label, children, sub, variant }: { label: string; children: React.ReactNode; sub?: React.ReactNode; variant: Variant }) {
  if (variant === "column") {
    return (
      <div className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="min-w-0">
          <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</div>
          {sub && <div className="mt-0.5 truncate text-[11px] text-slate-500">{sub}</div>}
        </div>
        <div className="tnum text-lg font-semibold tracking-tight text-slate-900">{children}</div>
      </div>
    );
  }
  return (
    <div className="min-w-0 px-5 py-4">
      <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">{label}</div>
      <div className="tnum mt-1 text-2xl font-semibold tracking-tight text-slate-900">{children}</div>
      {sub && <div className="mt-0.5 truncate text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function StatStrip({ stats, solvedCount, variant = "row" }: { stats?: UserStats; solvedCount: number; variant?: Variant }) {
  const s = stats ?? EMPTY;
  // Level L starts at (L-1)^2 * 100 XP (see lib/progression.ts)
  const levelStart = Math.pow(s.current_level - 1, 2) * 100;
  const levelEnd = Math.pow(s.current_level, 2) * 100;
  const pct = Math.min(100, Math.max(0, ((s.total_xp - levelStart) / (levelEnd - levelStart)) * 100));
  const column = variant === "column";

  const level = (
    <div className={column ? "px-3 py-2.5" : "min-w-0 px-5 py-4"}>
      <div className="flex items-baseline justify-between gap-2">
        <div className={`${column ? "text-[10px]" : "text-[11px]"} font-medium uppercase tracking-[0.08em] text-slate-500`}>Level</div>
        {column ? (
          <div className="tnum text-lg font-semibold tracking-tight text-slate-900">{s.current_level}</div>
        ) : (
          <Link href="/dashboard/stats" className="text-[11px] text-slate-500 hover:text-slate-900">Statistics →</Link>
        )}
      </div>
      {!column && <div className="tnum mt-1 text-2xl font-semibold tracking-tight text-slate-900">{s.current_level}</div>}
      <div className="mt-1.5 h-1 bg-slate-100" aria-hidden>
        <div className="h-1 bg-slate-900" style={{ width: `${pct}%` }} />
      </div>
      <div className={`tnum mt-1 truncate ${column ? "text-[11px]" : "text-xs"} text-slate-500`}>
        {Math.max(0, levelEnd - s.total_xp)} XP to level {s.current_level + 1}
      </div>
    </div>
  );

  return (
    <section
      aria-label="Your progress"
      className={
        column
          ? "divide-y divide-slate-200 rounded-md border border-slate-200 bg-white"
          : "grid grid-cols-2 divide-slate-200 rounded-md border border-slate-200 bg-white md:grid-cols-4 md:divide-x [&>*:nth-child(-n+2)]:border-b [&>*:nth-child(-n+2)]:border-slate-200 md:[&>*:nth-child(-n+2)]:border-b-0"
      }
    >
      <Cell variant={variant} label="Solved" sub={s.problems_attempted > 0 ? `${s.problems_attempted} attempted` : "problems"}>
        {solvedCount}
      </Cell>
      <Cell variant={variant} label="Rating" sub={s.tier}>
        {s.ranking_points}
      </Cell>
      <Cell variant={variant} label="Streak" sub={s.longest_streak > 0 ? `best ${s.longest_streak} days` : "days in a row"}>
        {s.current_streak}
      </Cell>
      {level}
    </section>
  );
}

/** The stats column for the left sidebar. Loads its own numbers, so it works on every page with the sidebar. */
export function SidebarStats() {
  const [stats, setStats] = useState<UserStats | undefined>();
  const [solvedCount, setSolvedCount] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const [profile, progress] = await Promise.all([
        fetch("/api/user/profile").then((r) => (r.ok ? r.json() : null)),
        fetch("/api/user/progress").then((r) => (r.ok ? r.json() : null)),
      ]);
      const userStats: UserStats | undefined = profile?.user_stats ?? undefined;
      setStats(userStats);
      // Same rule as the dashboard (useHomeData): the larger of the two counts
      setSolvedCount(Math.max(progress?.solvedIds?.length || 0, userStats?.problems_solved || 0));
    } catch (err) {
      console.error("Failed to load sidebar stats:", err);
    }
  }, []);

  useEffect(() => {
    load();
    window.addEventListener(STATS_CHANGED_EVENT, load);
    return () => window.removeEventListener(STATS_CHANGED_EVENT, load);
  }, [load]);

  if (solvedCount === null) return null;
  return (
    <div>
      <StatStrip variant="column" stats={stats} solvedCount={solvedCount} />
      <Link href="/dashboard/stats" className="mt-1.5 inline-block px-1 text-[11px] text-slate-500 hover:text-slate-900">
        Statistics →
      </Link>
    </div>
  );
}
