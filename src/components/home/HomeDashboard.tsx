"use client"
// Redesigned home page (replaces User_home_page; switch back in app/dashboard/page.tsx).
//
// One page, three kinds of users:
//  - new:     one clear first step (a ladder's warm-up) + a getting-started checklist instead of empty stats
//  - regular: "pick up where you left off" at the top, then the feed
//  - heavy:   same, with denser rows, more rows, filters and extra stats
// The three separate lists of the old page (My Queue, Problems for You, Recommended) are one tabbed
// feed here, so the same problem never appears twice.

import React, { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ListPlus } from "lucide-react";
import { ProblemDialog, convertSupabaseProblem } from "@/components/ProblemDialog";
import { useLikes, useMyQueue, useStarts } from "@/hooks/useUserInteractions";
import { calculateXP, getDifficultyLabel } from "@/lib/supabase";
import { useHomeData, type HomeProblem, type Ladder } from "./useHomeData";
import { NextUpCard } from "./NextUpCard";
import { ProblemRow, type RowActions } from "./ProblemRow";
import { LadderList } from "./LadderList";
import {
  GettingStartedCard,
  LeaderboardCard,
  MasteryCard,
  ProgressCard,
  SupportCard,
  useChecklistDismissed,
} from "./SidePanel";

type FeedTab = "for-you" | "ladders" | "queue";

function ladderContext(ladder: Ladder, entry: HomeProblem) {
  if (ladder.next === null) return `Ladder · all ${ladder.steps.length} solved`;
  if (ladder.solvedCount === 0) return `Ladder · ${ladder.steps.length} problems, starts at ${getDifficultyLabel(entry.difficulty)} ${entry.difficulty}`;
  return `Ladder · ${ladder.solvedCount}/${ladder.steps.length} · next: ${ladder.next.label}`;
}
type LevelFilter = "all" | "Easy" | "Medium" | "Hard+";

const TAB_KEY = "mq-home-tab";

function readStoredTab(): FeedTab | null {
  try {
    const t = localStorage.getItem(TAB_KEY);
    return t === "for-you" || t === "ladders" || t === "queue" ? t : null;
  } catch {
    return null;
  }
}

export default function HomeDashboard() {
  const { data: session } = useSession();
  const data = useHomeData();
  const { queue, addToQueue, removeFromQueue, isQueued } = useMyQueue();
  const { likedIds, toggleLike } = useLikes();
  const { startedIds, markStarted } = useStarts();
  const { dismissed: checklistDismissed, dismiss: dismissChecklist } = useChecklistDismissed();

  const [openProblem, setOpenProblem] = useState<HomeProblem | null>(null);
  const [chosenTab, setChosenTab] = useState<FeedTab | null>(null);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [hideSolved, setHideSolved] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => setChosenTab(readStoredTab()), []);

  const { stage, progress, recommendations, ladders, nextUp, problemsById } = data;
  const solvedIds = progress.solvedIds;
  const isHeavy = stage === "heavy";

  // Default tab: the queue if the user keeps one, otherwise recommendations.
  const tab: FeedTab = chosenTab ?? (queue.length > 0 ? "queue" : "for-you");
  const selectTab = (t: FeedTab) => {
    setChosenTab(t);
    try {
      localStorage.setItem(TAB_KEY, t);
    } catch {
      /* storage unavailable */
    }
  };

  const open = (p: HomeProblem) => {
    markStarted(p.id);
    setOpenProblem(p);
  };

  const toggleQueue = (p: HomeProblem) => {
    if (isQueued(p.id)) removeFromQueue(p.id);
    else
      addToQueue({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        source: p.source,
        xp: calculateXP(p.difficulty),
        content: p.content,
        level: p.level ?? undefined,
        category_path: p.category_path ?? undefined,
        tags: p.tags ?? undefined,
      });
  };

  const actionsFor = (p: HomeProblem): RowActions => ({
    isQueued: isQueued(p.id),
    isLiked: likedIds.has(p.id),
    isStarted: startedIds.has(p.id),
    isSolved: solvedIds.has(p.id),
    onOpen: () => open(p),
    onToggleQueue: () => toggleQueue(p),
    onToggleLike: () => toggleLike(p.id),
  });

  const feed = useMemo(() => {
    return recommendations.filter(({ problem: p, ladder, entry }) => {
      if (hideSolved && (ladder ? ladder.next === null : solvedIds.has(p.id))) return false;
      // Already the big card above (for a ladder, the card may show one of its steps)
      if (nextUp && (p.id === nextUp.problem.id || entry.id === nextUp.problem.id)) return false;
      const label = getDifficultyLabel(p.difficulty);
      if (levelFilter === "Hard+") return label === "Hard" || label === "Olympiad";
      return levelFilter === "all" || label === levelFilter;
    });
  }, [recommendations, hideSolved, solvedIds, nextUp, levelFilter]);

  const pageSize = isHeavy ? 10 : 5;
  const visibleFeed = showAll ? feed : feed.slice(0, pageSize);

  const checklist = [
    { label: "Choose your interests", done: data.hasInterests },
    { label: "Open your first problem", done: progress.recentStarts.length > 0 || startedIds.size > 0 },
    { label: "Solve a problem", done: data.solvedCount > 0 },
    { label: "Save a problem to My Queue", done: queue.length > 0 },
  ];
  const showChecklist = !checklistDismissed && data.solvedCount < 3 && checklist.some((c) => !c.done);

  const firstName = session?.user?.name?.split(" ")[0];

  if (data.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <header className="mb-5">
        <h1 className="text-2xl font-bold text-gray-800">
          {stage === "new" ? "Welcome to Math Quest" : "Welcome back"}
          {firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {stage === "new"
            ? "Start with a short warm-up. Each ladder climbs one idea at a time."
            : `${data.solvedCount} solved so far. Here is what to do next.`}
        </p>
      </header>

      {data.loadError && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{data.loadError}</div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Main column */}
        <div className="space-y-6 xl:col-span-2">
          <NextUpCard
            nextUp={nextUp}
            solvedIds={solvedIds}
            onOpen={() => nextUp && open(nextUp.problem)}
            onBrowseLadders={() => selectTab("ladders")}
          />

          <section className="rounded-lg border border-gray-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 px-4 pt-3">
              <div role="tablist" aria-label="Problems" className="flex gap-1">
                {([
                  ["for-you", "For you"],
                  ["ladders", `Ladders (${ladders.length})`],
                  ["queue", `My Queue (${queue.length}/5)`],
                ] as [FeedTab, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    role="tab"
                    aria-selected={tab === key}
                    onClick={() => selectTab(key)}
                    className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                      tab === key
                        ? "border-blue-600 text-gray-800"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {tab === "for-you" && stage !== "new" && (
                <div className="flex flex-wrap items-center gap-1.5 pb-2">
                  {(["all", "Easy", "Medium", "Hard+"] as LevelFilter[]).map((f) => (
                    <button
                      key={f}
                      onClick={() => setLevelFilter(f)}
                      className={`rounded-full border px-2.5 py-0.5 text-xs ${
                        levelFilter === f
                          ? "border-blue-600 bg-blue-600 text-white"
                          : "border-gray-200 text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      {f === "all" ? "All levels" : f}
                    </button>
                  ))}
                  <label className="ml-1 flex cursor-pointer items-center gap-1 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={hideSolved}
                      onChange={(e) => setHideSolved(e.target.checked)}
                      className="h-3.5 w-3.5 accent-blue-600"
                    />
                    Hide solved
                  </label>
                </div>
              )}
            </div>

            <div className="p-4">
              {tab === "for-you" && (
                <div className="space-y-2">
                  {visibleFeed.length === 0 ? (
                    <p className="py-8 text-center text-sm text-gray-500">
                      Nothing matches these filters. Try &ldquo;All levels&rdquo;.
                    </p>
                  ) : (
                    visibleFeed.map(({ problem, reasons, ladder, entry }) => (
                      <ProblemRow
                        key={problem.id}
                        problem={problem}
                        reasons={reasons}
                        context={ladder ? ladderContext(ladder, entry) : undefined}
                        compact={isHeavy}
                        actions={
                          ladder
                            ? {
                                ...actionsFor(problem),
                                isStarted: ladder.solvedCount > 0 || startedIds.has(entry.id),
                                isSolved: ladder.next === null,
                                onOpen: () => open(entry),
                                openLabel: ladder.next === null ? "Review" : ladder.solvedCount > 0 || startedIds.has(entry.id) ? "Continue" : "Start",
                              }
                            : actionsFor(problem)
                        }
                      />
                    ))
                  )}
                  {feed.length > pageSize && (
                    <Button variant="ghost" size="sm" className="w-full text-gray-600" onClick={() => setShowAll((v) => !v)}>
                      {showAll ? "Show less" : `Show ${feed.length - pageSize} more`}
                    </Button>
                  )}
                </div>
              )}

              {tab === "ladders" && (
                <LadderList ladders={ladders} solvedIds={solvedIds} startedIds={startedIds} onOpen={open} />
              )}

              {tab === "queue" &&
                (queue.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-gray-500">
                    <ListPlus className="h-6 w-6 text-gray-300" />
                    <p>Save up to 5 problems you want to come back to.</p>
                    <p className="text-xs">
                      Use the <ListPlus className="inline h-3.5 w-3.5" /> button on any problem.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {queue.map((q) => {
                      const p = problemsById.get(q.id);
                      if (!p) return null;
                      return <ProblemRow key={q.id} problem={p} compact actions={actionsFor(p)} />;
                    })}
                  </div>
                ))}
            </div>
          </section>
        </div>

        {/* Side column */}
        <aside className="space-y-4">
          {showChecklist && <GettingStartedCard steps={checklist} onDismiss={dismissChecklist} />}
          <ProgressCard stats={data.profile?.userStats} solvedCount={data.solvedCount} stage={stage} />
          <MasteryCard stats={data.profile?.userCategoryStats || []} />
          <LeaderboardCard />
          <SupportCard isAdmin={session?.user?.role === "admin"} />
        </aside>
      </div>

      <Dialog
        open={!!openProblem}
        onOpenChange={(o) => {
          if (!o) {
            setOpenProblem(null);
            data.refreshProgress(); // the user may have just solved it
          }
        }}
      >
        {openProblem && <ProblemDialog key={openProblem.id} problem={convertSupabaseProblem(openProblem)} />}
      </Dialog>
    </div>
  );
}
