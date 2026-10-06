"use client"
// Last 12 weeks of activity (problems opened per day), one square per day, Monday at the top.
import React, { useMemo } from "react";

const WEEKS = 12;
const DAY = 86_400_000;

function dayKey(d: Date) {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function ActivityCard({ starts }: { starts: { startedAt: string }[] }) {
  const { columns, total, activeDays } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const s of starts) {
      const k = dayKey(new Date(s.startedAt));
      counts.set(k, (counts.get(k) || 0) + 1);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const mondayOffset = (today.getDay() + 6) % 7; // days since Monday
    const firstMonday = new Date(today.getTime() - (mondayOffset + (WEEKS - 1) * 7) * DAY);
    const columns: { date: Date; count: number; future: boolean }[][] = [];
    let total = 0;
    let activeDays = 0;
    for (let w = 0; w < WEEKS; w++) {
      const col = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(firstMonday.getTime() + (w * 7 + d) * DAY);
        const future = date > today;
        const count = future ? 0 : counts.get(dayKey(date)) || 0;
        total += count;
        if (count > 0) activeDays++;
        col.push({ date, count, future });
      }
      columns.push(col);
    }
    return { columns, total, activeDays };
  }, [starts]);

  const shade = (n: number) => (n === 0 ? "bg-slate-100" : n === 1 ? "bg-slate-300" : n === 2 ? "bg-slate-500" : "bg-slate-800");

  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className="flex items-baseline justify-between">
        <h3 className="text-[13px] font-semibold text-slate-900">Activity</h3>
        <span className="text-[11px] text-slate-500">last 12 weeks</span>
      </div>
      <div className="mt-3 flex gap-[3px]" role="img" aria-label={`${total} problems opened on ${activeDays} days in the last 12 weeks`}>
        {columns.map((col, i) => (
          <div key={i} className="flex flex-1 flex-col gap-[3px]">
            {col.map((c) => (
              <span
                key={c.date.toISOString()}
                title={c.future ? "" : `${c.date.toLocaleDateString()}: ${c.count} opened`}
                className={`aspect-square w-full rounded-[2px] ${c.future ? "bg-transparent" : shade(c.count)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="tnum mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>
          {total} opened · {activeDays} active {activeDays === 1 ? "day" : "days"}
        </span>
        <span className="flex items-center gap-1">
          Less
          {[0, 1, 2, 3].map((n) => <span key={n} className={`h-2.5 w-2.5 rounded-[2px] ${shade(n)}`} />)}
          More
        </span>
      </div>
    </div>
  );
}
