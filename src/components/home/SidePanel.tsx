"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Flame, Heart, Loader2, Lock, Trophy, X } from "lucide-react";
import type { CategoryStat, UserStage, UserStats } from "./useHomeData";

const card = "rounded-md border border-slate-200 bg-white p-4";
const cardTitle = "text-[13px] font-semibold text-slate-900";

// ---------------------------------------------------------------------------
// Getting started — replaces the empty stats for brand-new users
// ---------------------------------------------------------------------------
const CHECKLIST_DISMISSED_KEY = "mq-home-checklist-dismissed";

export function GettingStartedCard({
  steps,
  onDismiss,
}: {
  steps: { label: string; done: boolean }[];
  onDismiss: () => void;
}) {
  const doneCount = steps.filter((s) => s.done).length;
  return (
    <div className={card}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className={cardTitle}>Getting started</h3>
          <div className="tnum mt-0.5 text-xs text-slate-500">{doneCount} of {steps.length} done</div>
        </div>
        <button onClick={onDismiss} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" title="Hide">
          <X className="h-4 w-4" />
        </button>
      </div>
      <Progress value={(doneCount / steps.length) * 100} className="mt-3 h-1 rounded-none bg-slate-100 [&>div]:bg-slate-900" />
      <ul className="mt-3 space-y-2">
        {steps.map((s) => (
          <li key={s.label} className={`flex items-center gap-2 text-sm ${s.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
            {s.done ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <Circle className="h-4 w-4 text-slate-300" />}
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function useChecklistDismissed() {
  const [dismissed, setDismissed] = useState(true); // hidden until storage is read, so it never flashes
  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(CHECKLIST_DISMISSED_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);
  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(CHECKLIST_DISMISSED_KEY, "1");
    } catch {
      /* storage unavailable */
    }
  };
  return { dismissed, dismiss };
}

// ---------------------------------------------------------------------------
// Progress — level, tier, streak
// ---------------------------------------------------------------------------
export function ProgressCard({ stats, solvedCount, stage }: { stats?: UserStats; solvedCount: number; stage: UserStage }) {
  const s = stats ?? {
    current_level: 1, total_xp: 0, ranking_points: 0, tier: "Bronze III",
    current_streak: 0, longest_streak: 0, problems_solved: 0, problems_attempted: 0,
  };
  // Level L starts at (L-1)^2 * 100 XP (see lib/progression.ts)
  const levelStart = Math.pow(s.current_level - 1, 2) * 100;
  const levelEnd = Math.pow(s.current_level, 2) * 100;
  const pct = Math.min(100, Math.max(0, ((s.total_xp - levelStart) / (levelEnd - levelStart)) * 100));
  const accuracy = s.problems_attempted > 0 ? Math.round((s.problems_solved / s.problems_attempted) * 100) : null;

  return (
    <div className={card}>
      <div className="flex items-baseline justify-between">
        <h3 className={cardTitle}>Progress</h3>
        <span className="rounded border border-slate-200 px-1.5 py-px text-[11px] text-slate-600">{s.tier}</span>
      </div>

      <dl className="tnum mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded border border-slate-100 bg-slate-50 py-2">
          <dt className="text-[11px] text-slate-500">Level</dt>
          <dd className="text-lg font-semibold text-slate-900">{s.current_level}</dd>
        </div>
        <div className="rounded border border-slate-100 bg-slate-50 py-2">
          <dt className="text-[11px] text-slate-500">Solved</dt>
          <dd className="text-lg font-semibold text-slate-900">{solvedCount}</dd>
        </div>
        <div className="rounded border border-slate-100 bg-slate-50 py-2">
          <dt className="text-[11px] text-slate-500">Rating</dt>
          <dd className="text-lg font-semibold text-slate-900">{s.ranking_points}</dd>
        </div>
      </dl>

      <div className="mt-3">
        <div className="flex justify-between text-[11px] text-slate-500">
          <span>Level {s.current_level}</span>
          <span className="tnum">{levelEnd - s.total_xp} XP to level {s.current_level + 1}</span>
        </div>
        <Progress value={pct} className="mt-1 h-1 rounded-none bg-slate-100 [&>div]:bg-slate-900" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Flame className={`h-3.5 w-3.5 ${s.current_streak > 0 ? "text-slate-700" : "text-slate-300"}`} />
          Streak <span className="font-medium text-slate-900">{s.current_streak}</span>
        </div>
        {stage === "heavy" ? (
          <div className="text-right">
            Accuracy <span className="font-medium text-slate-900">{accuracy ?? "–"}{accuracy !== null && "%"}</span>
          </div>
        ) : (
          <div className="text-right">
            Best <span className="font-medium text-slate-900">{s.longest_streak}</span>
          </div>
        )}
      </div>
      {s.current_streak === 0 && (
        <p className="mt-2 text-xs text-slate-500">Solve one problem today to start a streak.</p>
      )}
      <Link href="/dashboard/stats" className="mt-3 inline-block text-xs font-medium text-blue-800 hover:underline">
        Full statistics →
      </Link>
    </div>
  );
}

export function MasteryCard({ stats }: { stats: CategoryStat[] }) {
  const top = [...stats].sort((a, b) => b.ranking_points - a.ranking_points).slice(0, 5);
  if (top.length === 0) return null;
  const max = Math.max(...top.map((t) => t.ranking_points), 1);
  return (
    <div className={card}>
      <h3 className={cardTitle}>Strongest topics</h3>
      <div className="mt-3 space-y-3">
        {top.map((t) => (
          <div key={t.category_id}>
            <div className="flex justify-between text-xs">
              <span className="text-slate-700">{t.category_name || "Unknown"}</span>
              <span className="tnum font-mono text-slate-500">{t.ranking_points} RP · {t.tier}</span>
            </div>
            <div className="mt-1 h-1 bg-slate-100">
              <div className="h-1 bg-slate-800" style={{ width: `${(t.ranking_points / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardCard() {
  const [rows, setRows] = useState<{ name: string; xp: number; streak: number }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    fetch("/api/leaderboard")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setRows(Array.isArray(d) ? d : []))
      .catch(() => setRows([]))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className={card}>
      <h3 className={`flex items-center gap-2 ${cardTitle}`}>
        <Trophy className="h-3.5 w-3.5 text-slate-400" /> Top solvers
      </h3>
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="h-4 w-4 animate-spin text-slate-400" /></div>
      ) : rows.length === 0 ? (
        <p className="pt-2 text-sm text-slate-500">No one on the board yet.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {rows.map((u, i) => (
            <li key={i + u.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="tnum w-5 text-right font-mono text-xs text-slate-400">{i + 1}</span>
                <span className="text-slate-800">{u.name}</span>
              </span>
              <span className="tnum font-mono text-xs text-slate-500">{u.xp} XP</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function SupportCard({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="space-y-2 px-1 text-xs text-slate-500">
      <a
        href="https://paypal.me/mookwonseo"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 hover:text-slate-900"
      >
        <Heart className="h-3.5 w-3.5" /> Support Math Quest
      </a>
      {isAdmin && (
        <Link href="/admin/problems">
          <Button size="sm" variant="ghost" className="h-7 gap-1 px-0 text-xs text-slate-500 hover:bg-transparent hover:text-slate-900">
            <Lock className="h-3.5 w-3.5" /> Admin
          </Button>
        </Link>
      )}
    </div>
  );
}
