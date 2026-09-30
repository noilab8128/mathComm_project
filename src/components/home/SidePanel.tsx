"use client"
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Flame, Heart, Loader2, Lock, Trophy, X } from "lucide-react";
import type { CategoryStat, UserStage, UserStats } from "./useHomeData";

const card = "rounded-lg border border-gray-200 bg-white p-4";

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
    <div className={`${card} border-blue-100`}>
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-800">Getting started</h3>
          <div className="text-xs text-gray-500">{doneCount} of {steps.length} done</div>
        </div>
        <button onClick={onDismiss} className="rounded p-1 text-gray-400 hover:bg-gray-100" title="Hide">
          <X className="h-4 w-4" />
        </button>
      </div>
      <Progress value={(doneCount / steps.length) * 100} className="mt-3 h-1.5 bg-blue-100 [&>div]:bg-blue-600" />
      <ul className="mt-3 space-y-2">
        {steps.map((s) => (
          <li key={s.label} className={`flex items-center gap-2 text-sm ${s.done ? "text-gray-400 line-through" : "text-gray-700"}`}>
            {s.done ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Circle className="h-4 w-4 text-gray-300" />}
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
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs text-gray-500">Level</div>
          <div className="text-2xl font-bold text-gray-800">{s.current_level}</div>
        </div>
        <div className="text-right">
          <Badge className="bg-indigo-600 hover:bg-indigo-600">{s.tier}</Badge>
          <div className="mt-1 font-mono text-xs text-indigo-700">{s.ranking_points} RP</div>
        </div>
      </div>
      <Progress value={pct} className="mt-3 h-2 bg-blue-100 [&>div]:bg-blue-600" />
      <div className="mt-1 text-xs text-gray-500">
        {levelEnd - s.total_xp} XP to level {s.current_level + 1}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-gray-100 pt-3 text-sm">
        <div className="flex items-center gap-1.5">
          <Flame className={`h-4 w-4 ${s.current_streak > 0 ? "fill-orange-500 text-orange-500" : "text-gray-300"}`} />
          <span className="font-medium text-gray-800">{s.current_streak}</span>
          <span className="text-gray-500">day streak</span>
        </div>
        <div className="text-right text-gray-500">
          <span className="font-medium text-gray-800">{solvedCount}</span> solved
        </div>
        {stage === "heavy" && (
          <>
            <div className="text-gray-500">Best streak <span className="font-medium text-gray-800">{s.longest_streak}</span></div>
            <div className="text-right text-gray-500">
              Accuracy <span className="font-medium text-gray-800">{accuracy ?? "–"}{accuracy !== null && "%"}</span>
            </div>
          </>
        )}
      </div>
      {s.current_streak === 0 && (
        <p className="mt-3 rounded-md bg-orange-50 px-3 py-2 text-xs text-orange-700">
          Solve one problem today to start a streak.
        </p>
      )}
      <Link href="/dashboard/stats" className="mt-3 block text-xs font-medium text-blue-600 hover:underline">
        See full stats →
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
      <h3 className="font-semibold text-gray-800">Strongest topics</h3>
      <div className="mt-3 space-y-3">
        {top.map((t) => (
          <div key={t.category_id}>
            <div className="flex justify-between text-xs">
              <span className="font-medium text-gray-700">{t.category_name || "Unknown"}</span>
              <span className="font-mono text-gray-500">{t.ranking_points} RP · {t.tier}</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-gray-100">
              <div className="h-1.5 rounded-full bg-blue-600" style={{ width: `${(t.ranking_points / max) * 100}%` }} />
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
      <h3 className="flex items-center gap-2 font-semibold text-gray-800">
        <Trophy className="h-4 w-4 text-amber-500" /> Top solvers
      </h3>
      {isLoading ? (
        <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-blue-500" /></div>
      ) : rows.length === 0 ? (
        <p className="py-3 text-sm text-gray-500">No one on the board yet. Solve a problem to be first.</p>
      ) : (
        <ol className="mt-3 space-y-2">
          {rows.map((u, i) => (
            <li key={i + u.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className={`w-5 text-center text-xs font-bold ${i === 0 ? "text-amber-500" : "text-gray-400"}`}>{i + 1}</span>
                <span className="font-medium text-gray-800">{u.name}</span>
              </span>
              <span className="text-xs text-gray-500">{u.xp} XP</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export function SupportCard({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="space-y-2 px-1 text-xs text-gray-500">
      <a
        href="https://paypal.me/mookwonseo"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 hover:text-amber-600"
      >
        <Heart className="h-3.5 w-3.5" /> Support Math Quest — donate via PayPal
      </a>
      {isAdmin && (
        <Link href="/admin/problems">
          <Button size="sm" variant="ghost" className="h-7 gap-1 px-0 text-xs text-gray-500 hover:text-gray-800">
            <Lock className="h-3.5 w-3.5" /> Admin
          </Button>
        </Link>
      )}
    </div>
  );
}
