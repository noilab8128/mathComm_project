"use client"
// Skill tree: domains -> subdomains, with the badges a student has earned and what the next badge needs.
// Rules and the calculation are in lib/skillTree.ts (docs/SKILL_TREE_RULES.md). Nothing is stored: badges are
// worked out from the solved problems each time the page loads.

import React, { useEffect, useMemo, useState } from "react";
import { Award, Check, ChevronDown, Loader2, Mountain, Network, Sparkles } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProblemDialog, convertSupabaseProblem } from "@/components/ProblemDialog";
import { useStarts } from "@/hooks/useUserInteractions";
import { useHomeData, type HomeProblem, type Ladder } from "@/components/home/useHomeData";
import { STATS_CHANGED_EVENT } from "@/components/home/StatStrip";
import {
  RULES,
  computeSkillTree,
  type Badge,
  type DomainProgress,
  type NextTier,
  type SkillProblem,
  type SubdomainProgress,
} from "@/lib/skillTree";

// Tier colours: bronze, silver, gold (used only for earned badges)
const TIER_STYLE = [
  "border-amber-300 bg-amber-50 text-amber-800",
  "border-slate-300 bg-slate-100 text-slate-700",
  "border-yellow-400 bg-yellow-50 text-yellow-800",
  "border-violet-300 bg-violet-50 text-violet-800",
];

function TierChip({ name, level }: { name: string; level: number }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-px text-[11px] font-medium ${TIER_STYLE[Math.min(level, 4) - 1]}`}>
      <Award className="h-3 w-3" /> {name}
    </span>
  );
}

function BadgeIcon({ badge }: { badge: Badge }) {
  const Icon = badge.kind === "ladder" ? Mountain : badge.kind === "breadth" ? Sparkles : Award;
  return <Icon className="h-4 w-4" />;
}

/** "3 / 5 problems solved" rows with a thin bar each. */
function Requirements<T extends string>({ next, compact = false }: { next: NextTier<T>; compact?: boolean }) {
  return (
    <div className={compact ? "space-y-1" : "space-y-1.5"}>
      {next.requirements.map((r) => {
        const done = r.have >= r.need;
        return (
          <div key={r.label}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className={done ? "text-slate-400" : "text-slate-600"}>
                {done && <Check className="mr-1 inline h-3 w-3 text-emerald-600" strokeWidth={3} />}
                {r.label}
              </span>
              <span className="tnum text-slate-500">
                {Math.min(r.have, r.need)} / {r.need}
              </span>
            </div>
            <div className="mt-0.5 h-1 bg-slate-100" aria-hidden>
              <div className={`h-1 ${done ? "bg-emerald-600" : "bg-slate-900"}`} style={{ width: `${Math.min(100, (r.have / r.need) * 100)}%` }} />
            </div>
          </div>
        );
      })}
      {!next.reachable && (
        <p className="text-[11px] text-slate-400">Not enough problems on the site for this badge yet. More are coming.</p>
      )}
    </div>
  );
}

function SubdomainCard({
  sub,
  ladders,
  startedIds,
  onOpen,
}: {
  sub: SubdomainProgress;
  ladders: Map<string, Ladder>;
  startedIds: Set<string>;
  onOpen: (p: HomeProblem) => void;
}) {
  const started = sub.solved > 0;
  const level = sub.tier ? ["Explorer", "Specialist", "Virtuoso"].indexOf(sub.tier) + 1 : 0;
  return (
    <div
      className={`rounded-md border bg-white p-4 ${
        level ? "border-slate-300" : started ? "border-slate-300" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold text-slate-900">{sub.name}</h4>
          <p className="tnum mt-0.5 text-xs text-slate-500">
            {sub.solved} of {sub.total} problems solved · {sub.ladders.length} ladder{sub.ladders.length === 1 ? "" : "s"}
          </p>
        </div>
        {sub.tier ? <TierChip name={sub.tier} level={level} /> : (
          <span className="rounded border border-slate-200 px-1.5 py-px text-[11px] text-slate-400">{started ? "In progress" : "Not started"}</span>
        )}
      </div>

      {sub.next && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Next: {sub.next.tier}</p>
          <Requirements next={sub.next} compact />
        </div>
      )}

      <ul className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
        {sub.ladders.map((row) => {
          const ladder = ladders.get(row.rootId);
          if (!ladder) return null;
          const done = ladder.next === null;
          // Same rule as the Home ladder list: in progress once a step is solved or the next step was opened
          const inProgress = !done && (ladder.solvedCount > 0 || startedIds.has(ladder.next!.problem.id));
          return (
            <li key={row.rootId} className="flex items-center justify-between gap-2 py-2">
              <span className="min-w-0 truncate text-[13px] text-slate-700">{ladder.name}</span>
              <span className="flex flex-shrink-0 items-center gap-2">
                <span className="tnum text-xs text-slate-500">{ladder.solvedCount}/{ladder.steps.length}</span>
                <Button
                  size="sm"
                  variant={inProgress ? "default" : "outline"}
                  className="h-7 min-w-[72px] text-xs"
                  onClick={() => onOpen(done ? ladder.root : ladder.next!.problem)}
                >
                  {done ? "Review" : inProgress ? "Continue" : "Start"}
                </Button>
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function DomainPanel({
  domain,
  ladders,
  startedIds,
  onOpen,
}: {
  domain: DomainProgress;
  ladders: Map<string, Ladder>;
  startedIds: Set<string>;
  onOpen: (p: HomeProblem) => void;
}) {
  const groups = useMemo(() => {
    const m = new Map<string, SubdomainProgress[]>();
    for (const s of domain.subdomains) m.set(s.groupName, [...(m.get(s.groupName) ?? []), s]);
    return [...m.entries()];
  }, [domain]);
  const level = domain.tier ? ["Expert", "Champion", "Legend"].indexOf(domain.tier) + 1 : 0;

  return (
    <div className="space-y-6">
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{domain.name}</h3>
            <p className="tnum mt-0.5 text-xs text-slate-500">
              {domain.solved} of {domain.total} problems solved · {domain.hardSolved} hard · {domain.points} points
            </p>
          </div>
          {domain.tier && <TierChip name={`${domain.name} ${domain.tier}`} level={level} />}
        </div>
        {domain.next && (
          <div className="mt-4 max-w-md">
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">
              Next: {domain.name} {domain.next.tier}
            </p>
            <Requirements next={domain.next} />
          </div>
        )}
      </section>

      {groups.map(([group, subs]) => (
        <section key={group}>
          <h4 className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-slate-500">{group}</h4>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {subs.map((s) => (
              <SubdomainCard key={s.id} sub={s} ladders={ladders} startedIds={startedIds} onOpen={onOpen} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function HowBadgesWork() {
  const [open, setOpen] = useState(false);
  const r = RULES;
  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between px-4 py-3 text-left">
        <span className="text-[13px] font-semibold text-slate-900">How badges work</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="space-y-3 border-t border-slate-100 px-4 py-3 text-xs leading-relaxed text-slate-600">
          <p>
            Each problem counts once, the first time you solve it. <b>Hard</b> means difficulty {r.hardDifficulty} or more.
            A solved problem gives {r.pointsPerDifficulty} × its difficulty in points for its topic. Badges are never taken away.
          </p>
          <table className="w-full">
            <tbody className="[&_td]:py-1 [&_td]:pr-3 [&_td]:align-top">
              <tr><td className="font-medium text-slate-900">Explorer</td><td>{r.explorer.solved} problems in a subdomain, from at least {r.explorer.ladders} ladders</td></tr>
              <tr><td className="font-medium text-slate-900">Specialist</td><td>{r.specialist.solved} problems in a subdomain, {r.specialist.count} of them difficulty {r.specialist.atLeastDifficulty}+</td></tr>
              <tr><td className="font-medium text-slate-900">Virtuoso</td><td>{r.virtuoso.solved} problems in a subdomain, {r.virtuoso.hard} hard, {r.virtuoso.challenges} Challenges</td></tr>
              <tr><td className="font-medium text-slate-900">Expert</td><td>{r.expert.hard} hard problems in a domain, {r.expert.points} points, Explorer in {r.expert.explorerSubdomains} subdomains</td></tr>
              <tr><td className="font-medium text-slate-900">Champion</td><td>{r.champion.hard} hard, {r.champion.points} points, Specialist in {r.champion.specialistSubdomains} subdomains, {r.champion.challenges} Challenges</td></tr>
              <tr><td className="font-medium text-slate-900">Legend</td><td>{r.legend.hard} hard, {r.legend.points} points, Virtuoso in {r.legend.virtuosoSubdomains} and Specialist in {r.legend.specialistSubdomains} subdomains</td></tr>
              <tr><td className="font-medium text-slate-900">Polymath</td><td>Explorer badges in {r.polymath.domainsWithExplorer} domains</td></tr>
              <tr><td className="font-medium text-slate-900">Ladders</td><td>{r.ladderBadges.map((b) => `${b.name} (${b.ladders})`).join(", ")} ladders finished</td></tr>
              <tr><td className="font-medium text-slate-900">Trailblazer</td><td>among the first {r.trailblazerFirstSolvers} students to solve a Challenge</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function SkillTree() {
  const data = useHomeData();
  const { startedIds, markStarted } = useStarts();
  const [openProblem, setOpenProblem] = useState<HomeProblem | null>(null);
  const [firstSolves, setFirstSolves] = useState<Set<string>>(new Set());
  const [domainId, setDomainId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/user/first-solves")
      .then((r) => (r.ok ? r.json() : { problemIds: [] }))
      .then((d) => setFirstSolves(new Set(d.problemIds || [])))
      .catch(() => setFirstSolves(new Set()));
  }, [data.progress.solvedIds]);

  const ladderByRoot = useMemo(() => new Map(data.ladders.map((l) => [l.root.id, l])), [data.ladders]);

  const tree = useMemo(() => {
    const ladders = data.ladders.map((l) => ({ rootId: l.root.id, name: l.name, problemIds: l.steps.map((s) => s.problem.id) }));
    const trailblazer = new Set([...firstSolves].filter((id) => ladderByRoot.has(id)));
    return computeSkillTree(ladders, data.problemsById as Map<string, SkillProblem>, data.progress.solvedIds, trailblazer);
  }, [data.ladders, data.problemsById, data.progress.solvedIds, firstSolves, ladderByRoot]);

  const domain = tree.domains.find((d) => d.id === domainId) ?? tree.domains[0];

  const open = (p: HomeProblem) => {
    markStarted(p.id);
    setOpenProblem(p);
  };

  if (data.isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Network className="h-5 w-5 text-slate-400" /> Skill Tree
        </h1>
        <p className="mt-1 text-sm text-slate-500">Solve problems in a topic to earn its badges. Badges are never taken away.</p>
      </header>

      {data.loadError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{data.loadError}</div>}

      {/* Earned badges */}
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold text-slate-900">Your badges</h2>
          <span className="tnum text-xs text-slate-500">{tree.badges.length} earned · {tree.laddersFinished} ladders finished</span>
        </div>
        {tree.badges.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">
            No badges yet. Finish a ladder for <b>First Summit</b>, or solve {RULES.explorer.solved} problems from {RULES.explorer.ladders} ladders
            in one topic for your first <b>Explorer</b> badge.
          </p>
        ) : (
          <ul className="mt-3 flex flex-wrap gap-2">
            {tree.badges.map((b) => (
              <li
                key={b.key}
                title={b.detail}
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-xs font-medium ${TIER_STYLE[Math.min(b.level, 4) - 1]}`}
              >
                <BadgeIcon badge={b} /> {b.name}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Domains */}
      {tree.domains.length > 0 && domain && (
        <>
          <div role="tablist" aria-label="Domains" className="flex flex-wrap gap-1 border-b border-slate-200">
            {tree.domains.map((d) => (
              <button
                key={d.id}
                role="tab"
                aria-selected={d.id === domain.id}
                onClick={() => setDomainId(d.id)}
                className={`-mb-px border-b-2 px-3 py-2.5 text-sm transition-colors ${
                  d.id === domain.id ? "border-slate-900 font-medium text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {d.name}
                <span className="tnum ml-1.5 text-xs text-slate-400">{d.solved}/{d.total}</span>
              </button>
            ))}
          </div>
          <DomainPanel domain={domain} ladders={ladderByRoot} startedIds={startedIds} onOpen={open} />
        </>
      )}

      <HowBadgesWork />

      <Dialog
        open={!!openProblem}
        onOpenChange={(o) => {
          if (!o) {
            setOpenProblem(null);
            data.refreshProgress();
            window.dispatchEvent(new Event(STATS_CHANGED_EVENT));
          }
        }}
      >
        {openProblem && <ProblemDialog key={openProblem.id} problem={convertSupabaseProblem(openProblem)} />}
      </Dialog>
    </div>
  );
}
