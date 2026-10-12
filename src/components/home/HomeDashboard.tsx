"use client"
// Redesigned home page (replaces User_home_page; switch back in app/dashboard/page.tsx).
//
// One page, three kinds of users:
//  - new:     one clear first step (a ladder's warm-up) + a getting-started checklist instead of empty stats
//  - regular: "pick up where you left off" at the top, then the feed
//  - heavy:   same, with denser rows, more rows, filters and extra stats
// Every problem belongs to a ladder, so "Ladders" and "Problems for you" were the same list. They are one
// tabbed section here: For you (recommended ladders with a reason), All ladders (with filters), My queue.

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { SIDENAV_SLOT_ID } from "@/components/SideNav";
import { useSession } from "next-auth/react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, ListPlus } from "lucide-react";
import { ProblemDialog, convertSupabaseProblem } from "@/components/ProblemDialog";
import { useLikes, useMyQueue, useStarts } from "@/hooks/useUserInteractions";
import { calculateXP, getDifficultyLabel } from "@/lib/supabase";
import { useHomeData, type HomeProblem, type Ladder } from "./useHomeData";
import { ContinuePanel } from "./ContinuePanel";
import { StatStrip, STATS_CHANGED_EVENT } from "./StatStrip";
import { ActivityCard } from "./ActivityCard";
import { ProblemRow, type RowActions } from "./ProblemRow";
import { LadderList } from "./LadderList";
import {
  GettingStartedCard,
  LeaderboardCard,
  MasteryCard,
  SupportCard,
  useChecklistDismissed,
} from "./SidePanel";

type FeedTab = "for-you" | "all" | "queue";
type LevelFilter = "all" | "Easy" | "Medium" | "Hard+";

const TAB_KEY = "mq-home-tab";
/** Recommended ladders shown on the "For you" tab, and at most this many from the same topic. */
const RECOMMENDED_COUNT = 5;
const PER_TOPIC = 2;

function readStoredTab(): FeedTab | null {
  try {
    const t = localStorage.getItem(TAB_KEY);
    return t === "for-you" || t === "all" || t === "queue" ? t : null;
  } catch {
    return null;
  }
}

function matchesLevel(difficulty: number, filter: LevelFilter) {
  const label = getDifficultyLabel(difficulty);
  if (filter === "Hard+") return label === "Hard" || label === "Olympiad";
  return filter === "all" || label === filter;
}

const topicOf = (p: HomeProblem) => p.category_path?.split(" > ")[0] ?? "";

/** The left sidebar's slot element while the sidebar is shown (xl and up, see SideNav), otherwise null. */
function useSidebarSlot() {
  const [slot, setSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1280px)");
    const update = () => setSlot(wide.matches ? document.getElementById(SIDENAV_SLOT_ID) : null);
    update();
    wide.addEventListener("change", update);
    return () => wide.removeEventListener("change", update);
  }, []);
  return slot;
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
  const [topicFilter, setTopicFilter] = useState("all");
  const [hideSolved, setHideSolved] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => setChosenTab(readStoredTab()), []);
  const sidebarSlot = useSidebarSlot();

  const { stage, progress, recommendations, ladders, ladderOfProblem, nextUp, problemsById } = data;
  const solvedIds = progress.solvedIds;
  const isHeavy = stage === "heavy";

  const tab: FeedTab = chosenTab ?? "for-you";
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

  const toggleLadderQueue = (ladder: Ladder) => toggleQueue(ladder.root);

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

  // For you: the best-scoring unfinished ladders, at most PER_TOPIC from one topic, each with its reasons.
  // The ladder already shown in the big "Continue" card is left out.
  const { recommended, recommendedReasons, singles } = useMemo(() => {
    const candidates = recommendations.filter(
      (r) => r.ladder && r.ladder.next !== null && !(nextUp && r.ladder.steps.some((s) => s.problem.id === nextUp.problem.id))
    );
    const picked: typeof candidates = [];
    const perTopic = new Map<string, number>();
    for (const r of candidates) {
      const topic = r.problem.category_path?.split(" > ").slice(0, 2).join(" > ") ?? "";
      if ((perTopic.get(topic) ?? 0) >= PER_TOPIC) continue;
      perTopic.set(topic, (perTopic.get(topic) ?? 0) + 1);
      picked.push(r);
      if (picked.length === RECOMMENDED_COUNT) break;
    }
    // Not enough topics to stay diverse: fill up with the next best.
    for (const r of candidates) {
      if (picked.length >= RECOMMENDED_COUNT) break;
      if (!picked.includes(r)) picked.push(r);
    }
    return {
      recommended: picked.map((r) => r.ladder!),
      recommendedReasons: new Map(picked.map((r) => [r.problem.id, r.reasons])),
      // Top-level problems that are not ladders (few for now)
      singles: recommendations.filter((r) => !r.ladder).map((r) => r.problem),
    };
  }, [recommendations, nextUp]);

  const topics = useMemo(() => [...new Set(ladders.map((l) => topicOf(l.root)).filter(Boolean))].sort(), [ladders]);

  // All ladders: in progress first, then matching interests, then by starting difficulty (see useHomeData).
  const filteredLadders = useMemo(
    () =>
      ladders.filter(
        (l) =>
          !(hideSolved && l.next === null) &&
          (topicFilter === "all" || topicOf(l.root) === topicFilter) &&
          matchesLevel(l.steps[0].problem.difficulty, levelFilter)
      ),
    [ladders, hideSolved, topicFilter, levelFilter]
  );
  const filteredSingles = singles.filter(
    (p) =>
      !(hideSolved && solvedIds.has(p.id)) &&
      (topicFilter === "all" || topicOf(p) === topicFilter) &&
      matchesLevel(p.difficulty, levelFilter)
  );

  const pageSize = isHeavy ? 15 : 10;
  const visibleLadders = showAll ? filteredLadders : filteredLadders.slice(0, pageSize);

  const checklist = [
    { label: "Choose your interests", done: data.hasInterests },
    { label: "Open your first problem", done: progress.recentStarts.length > 0 || startedIds.size > 0 },
    { label: "Solve a problem", done: data.solvedCount > 0 },
    { label: "Save a problem to My Queue", done: queue.length > 0 },
  ];
  const showChecklist = !checklistDismissed && data.solvedCount < 3 && checklist.some((c) => !c.done);

  if (data.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // Shown in the left sidebar when it is visible, otherwise at the top of the right column
  const sidebarCards = (
    <>
      {showChecklist && <GettingStartedCard steps={checklist} onDismiss={dismissChecklist} />}
      <ActivityCard starts={progress.recentStarts} />
      <LeaderboardCard />
      <SupportCard isAdmin={session?.user?.role === "admin"} />
    </>
  );

  const scrollToLadders = () => {
    selectTab("all");
    document.getElementById("ladders")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const ladderQueue = { isQueued, onToggle: toggleLadderQueue };

  return (
    <div className="mx-auto w-full max-w-[1280px] p-4 sm:p-6 lg:p-8">
      {/* The greeting and date are in the site header (components/header.tsx). */}
      {stage === "new" && (
        <p className="mb-4 text-sm text-slate-500">
          <span className="font-medium text-slate-900">Welcome to Math Quest.</span> Start with a short warm-up. Each ladder climbs one idea at a time.
        </p>
      )}

      {data.loadError && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{data.loadError}</div>
      )}

      {/* On wide screens the stats are in the left sidebar (SideNav); the sidebar is hidden below xl. */}
      <div className="mb-5 xl:hidden">
        <StatStrip stats={data.profile?.userStats} solvedCount={data.solvedCount} />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_320px]">
        {/* Main column */}
        <div className="min-w-0 space-y-8">
          <ContinuePanel nextUp={nextUp} solvedIds={solvedIds} onOpen={open} onBrowseLadders={scrollToLadders} />

          <section id="ladders" className="scroll-mt-20">
            <div className="mb-3 flex items-baseline justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Ladders</h2>
                <p className="mt-0.5 text-xs text-slate-500">From a warm-up to a competition-level Challenge, one idea at a time.</p>
              </div>
              <span className="tnum text-xs text-slate-500">
                {ladders.filter((l) => l.next === null).length} of {ladders.length} completed
              </span>
            </div>

            <div className="rounded-md border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 pt-2">
                <div role="tablist" aria-label="Ladders" className="flex gap-1">
                  {([
                    ["for-you", "For you"],
                    ["all", `All ladders (${ladders.length})`],
                    ["queue", `My queue (${queue.length}/5)`],
                  ] as [FeedTab, string][]).map(([key, label]) => (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={tab === key}
                      onClick={() => selectTab(key)}
                      className={`-mb-px border-b-2 px-3 py-2.5 text-sm transition-colors ${
                        tab === key
                          ? "border-slate-900 font-medium text-slate-900"
                          : "border-transparent text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                {tab === "all" && (
                  <div className="flex flex-wrap items-center gap-3 pb-2">
                    <select
                      value={topicFilter}
                      onChange={(e) => setTopicFilter(e.target.value)}
                      aria-label="Topic"
                      className="h-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-700"
                    >
                      <option value="all">All topics</option>
                      {topics.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-500">Starts at</span>
                      <div className="flex overflow-hidden rounded-md border border-slate-200" role="group" aria-label="Starting level">
                        {(["all", "Easy", "Medium", "Hard+"] as LevelFilter[]).map((f) => (
                          <button
                            key={f}
                            onClick={() => setLevelFilter(f)}
                            aria-pressed={levelFilter === f}
                            className={`border-l border-slate-200 px-2.5 py-1 text-xs first:border-l-0 ${
                              levelFilter === f ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"
                            }`}
                          >
                            {f === "all" ? "Any" : f}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={hideSolved}
                        onChange={(e) => setHideSolved(e.target.checked)}
                        className="h-3.5 w-3.5 accent-slate-900"
                      />
                      Hide completed
                    </label>
                  </div>
                )}
              </div>

              {tab === "for-you" &&
                (recommended.length === 0 ? (
                  <p className="py-10 text-center text-sm text-slate-500">
                    No new ladders to suggest right now.{" "}
                    <button className="underline underline-offset-2 hover:text-slate-900" onClick={() => selectTab("all")}>
                      See all ladders
                    </button>
                  </p>
                ) : (
                  <>
                    <LadderList
                      ladders={recommended}
                      reasons={recommendedReasons}
                      queue={ladderQueue}
                      solvedIds={solvedIds}
                      startedIds={startedIds}
                      onOpen={open}
                      bare
                    />
                    <button
                      className="h-10 w-full border-t border-slate-100 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      onClick={() => selectTab("all")}
                    >
                      Browse all {ladders.length} ladders
                    </button>
                  </>
                ))}

              {tab === "all" && (
                <>
                  <LadderList
                    ladders={visibleLadders}
                    queue={ladderQueue}
                    solvedIds={solvedIds}
                    startedIds={startedIds}
                    onOpen={open}
                    bare
                  />
                  {filteredLadders.length > pageSize && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-10 w-full rounded-none border-t border-slate-100 text-[13px] text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      onClick={() => setShowAll((v) => !v)}
                    >
                      {showAll ? "Show less" : `Show ${filteredLadders.length - pageSize} more`}
                    </Button>
                  )}
                  {filteredSingles.length > 0 && (
                    <div className="border-t border-slate-200">
                      <h3 className="px-4 pb-1 pt-3 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Single problems</h3>
                      <div className="divide-y divide-slate-100">
                        {filteredSingles.map((p) => (
                          <ProblemRow key={p.id} problem={p} compact actions={actionsFor(p)} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              {tab === "queue" &&
                (queue.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 py-10 text-center text-sm text-slate-500">
                    <ListPlus className="h-5 w-5 text-slate-300" />
                    <p>Save up to 5 ladders or problems you want to come back to.</p>
                    <p className="text-xs">
                      Use the <ListPlus className="inline h-3.5 w-3.5" /> button on any ladder.
                    </p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {queue.map((q) => {
                      const p = problemsById.get(q.id);
                      if (!p) return null;
                      const ladder = ladderOfProblem.get(p.id);
                      const entry = ladder?.root.id === p.id ? (ladder.next?.problem ?? p) : p;
                      return (
                        <ProblemRow
                          key={q.id}
                          problem={p}
                          compact
                          context={ladder?.root.id === p.id ? `Ladder · ${ladder.solvedCount}/${ladder.steps.length}` : undefined}
                          actions={{ ...actionsFor(p), onOpen: () => open(entry) }}
                        />
                      );
                    })}
                  </div>
                ))}
            </div>
          </section>
        </div>

        {/* Right column */}
        <aside className="space-y-4">
          {!sidebarSlot && sidebarCards}
          <MasteryCard stats={data.profile?.userCategoryStats || []} />
        </aside>
        {sidebarSlot && createPortal(sidebarCards, sidebarSlot)}
      </div>

      <Dialog
        open={!!openProblem}
        onOpenChange={(o) => {
          if (!o) {
            setOpenProblem(null);
            data.refreshProgress(); // the user may have just solved it
            window.dispatchEvent(new Event(STATS_CHANGED_EVENT)); // reload the sidebar numbers too
          }
        }}
      >
        {openProblem && <ProblemDialog key={openProblem.id} problem={convertSupabaseProblem(openProblem)} />}
      </Dialog>
    </div>
  );
}
