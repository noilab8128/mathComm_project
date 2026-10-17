"use client"
// Skill tree: where the student is (current ladder and its place on the skill map), the map of 16 core topics
// (3 levels: field > area > core topic, lib/skillMap.ts) drawn as a picture on computers and a list on phones, and
// badges (earned + the closest next ones). Layout decided 2026-10-17 (docs/SKILL_TREE_RULES.md sections 2.3, 6).
// Rules and the calculation are in lib/skillTree.ts. Nothing is stored: badges are worked out from the solve
// record each time the page loads.

import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Award, Check, ChevronDown, Compass, Loader2, MapPin, Mountain, Network, Sparkles, Target } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProblemDialog, convertSupabaseProblem } from "@/components/ProblemDialog";
import { useStarts } from "@/hooks/useUserInteractions";
import { useHomeData, type HomeProblem, type Ladder } from "@/components/home/useHomeData";
import { STATS_CHANGED_EVENT } from "@/components/home/StatStrip";
import { LadderDots } from "@/components/home/LadderList";
import { placeOfCategory } from "@/lib/skillMap";
import {
  DOMAIN_TIERS,
  RULES,
  SUBDOMAIN_TIERS,
  computeSkillTree,
  type Badge,
  type DomainProgress,
  type NextTier,
  type SkillProblem,
  type SubdomainProgress,
  type UpcomingBadge,
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
  const Icon =
    badge.kind === "ladder" ? Mountain : badge.kind === "breadth" ? Sparkles : badge.kind === "group" ? Compass : badge.kind === "style" ? Target : Award;
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

/** "2 more problems solved · 1 more different ladders" for the requirements not met yet. */
function remaining(next: NextTier<string>) {
  return next.requirements
    .filter((r) => r.have < r.need)
    .map((r) => `${r.need - r.have} more ${r.label}`)
    .join(" · ");
}

function Bar({ value, total, className = "w-20" }: { value: number; total: number; className?: string }) {
  return (
    <span className={`inline-block h-1.5 overflow-hidden rounded-full bg-slate-100 align-middle ${className}`} aria-hidden>
      <span className="block h-1.5 rounded-full bg-slate-800" style={{ width: `${total ? Math.min(100, (value / total) * 100) : 0}%` }} />
    </span>
  );
}

function YouAreHerePin() {
  return (
    <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-px text-[10px] font-medium text-blue-800">
      <MapPin className="h-3 w-3" /> You are here
    </span>
  );
}

/** One ladder of a topic, with its Start / Continue / Review button. */
function LadderRow({ ladder, startedIds, onOpen }: { ladder: Ladder; startedIds: Set<string>; onOpen: (p: HomeProblem) => void }) {
  const done = ladder.next === null;
  // Same rule as the Home ladder list: in progress once a step is solved or the next step was opened
  const inProgress = !done && (ladder.solvedCount > 0 || startedIds.has(ladder.next!.problem.id));
  return (
    <li className="flex items-center justify-between gap-2 py-2">
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
}

/** A topic (level-3 category) as one line; opens to show what the next badge needs and its ladders. */
function TopicRow({
  sub,
  isHere,
  isOpen,
  onToggle,
  ladders,
  startedIds,
  onOpen,
}: {
  sub: SubdomainProgress;
  isHere: boolean;
  isOpen: boolean;
  onToggle: () => void;
  ladders: Map<string, Ladder>;
  startedIds: Set<string>;
  onOpen: (p: HomeProblem) => void;
}) {
  const level = sub.tier ? SUBDOMAIN_TIERS.indexOf(sub.tier) + 1 : 0;
  const state = sub.tier ? "badge" : sub.solved > 0 ? "progress" : "new";
  if (sub.total === 0) {
    return (
      <li className="flex items-center gap-3 px-2 py-2 text-left">
        <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-dashed border-slate-300" />
        <span className="min-w-0 flex-1 truncate text-sm text-slate-400">{sub.name}</span>
        <span className="text-[11px] text-slate-400">Coming soon</span>
      </li>
    );
  }
  return (
    <li className={isHere ? "rounded-md bg-blue-50/40" : ""}>
      <button onClick={onToggle} aria-expanded={isOpen} className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-slate-50">
        <span
          className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${
            state === "badge" ? "bg-slate-900" : state === "progress" ? "border-2 border-slate-900 bg-white" : "border border-slate-300 bg-white"
          }`}
          title={state === "badge" ? "Badge earned" : state === "progress" ? "In progress" : "Not started"}
        />
        <span className="min-w-0 flex-1 truncate text-sm text-slate-900">{sub.name}</span>
        {isHere && <YouAreHerePin />}
        {sub.tier && <TierChip name={sub.tier} level={level} />}
        <span className="hidden sm:inline">
          <Bar value={sub.solved} total={sub.total} />
        </span>
        <span className="tnum w-12 text-right text-xs text-slate-500">{sub.solved}/{sub.total}</span>
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="mb-2 ml-[22px] mr-2 border-l border-slate-200 pl-3">
          {sub.next && (
            <p className="py-1 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Next: {sub.next.tier}.</span>{" "}
              {sub.next.reachable ? remaining(sub.next) : "Not enough problems on the site for this badge yet. More are coming."}
            </p>
          )}
          <ul className="divide-y divide-slate-100">
            {sub.ladders.map((row) => {
              const ladder = ladders.get(row.rootId);
              return ladder ? <LadderRow key={row.rootId} ladder={ladder} startedIds={startedIds} onOpen={onOpen} /> : null;
            })}
          </ul>
        </div>
      )}
    </li>
  );
}

/** A field (level-1 category) as one line; opens to its groups (level 2) and topics (level 3). */
function DomainSection({
  domain,
  hereTopicId,
  isOpen,
  onToggle,
  openTopicId,
  onToggleTopic,
  ladders,
  startedIds,
  onOpen,
}: {
  domain: DomainProgress;
  hereTopicId: number | null;
  isOpen: boolean;
  onToggle: () => void;
  openTopicId: number | null;
  onToggleTopic: (id: number) => void;
  ladders: Map<string, Ladder>;
  startedIds: Set<string>;
  onOpen: (p: HomeProblem) => void;
}) {
  const groups = useMemo(() => {
    const m = new Map<string, SubdomainProgress[]>();
    for (const s of domain.subdomains) m.set(s.groupName, [...(m.get(s.groupName) ?? []), s]);
    return [...m.entries()];
  }, [domain]);
  const level = domain.tier ? DOMAIN_TIERS.indexOf(domain.tier) + 1 : 0;
  const containsHere = domain.subdomains.some((s) => s.id === hereTopicId);

  return (
    <section className="rounded-md border border-slate-200 bg-white">
      <button onClick={onToggle} aria-expanded={isOpen} className="flex w-full items-center gap-3 px-4 py-3 text-left">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="text-[15px] font-semibold text-slate-900">{domain.name}</span>
            {containsHere && !isOpen && <YouAreHerePin />}
            {domain.tier && <TierChip name={domain.tier} level={level} />}
          </span>
          <span className="tnum mt-0.5 block text-xs text-slate-500">
            {domain.subdomains.length} topic{domain.subdomains.length === 1 ? "" : "s"} · {domain.solved} of {domain.total} problems solved
          </span>
        </span>
        <Bar value={domain.solved} total={domain.total} className="hidden w-32 sm:inline-block" />
        <ChevronDown className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="space-y-3 border-t border-slate-100 px-2 pb-3 pt-2 sm:px-3">
          {domain.next && domain.solved > 0 && (
            <p className="px-2 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Next: {domain.name} {domain.next.tier}.</span>{" "}
              {domain.next.reachable ? remaining(domain.next) : "Not enough problems on the site for this badge yet."}
            </p>
          )}
          {groups.map(([group, subs]) => (
            <div key={group}>
              <h4 className="px-2 pb-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">{group}</h4>
              <ul>
                {subs.map((s) => (
                  <TopicRow
                    key={s.id}
                    sub={s}
                    isHere={s.id === hereTopicId}
                    isOpen={openTopicId === s.id}
                    onToggle={() => onToggleTopic(s.id)}
                    ladders={ladders}
                    startedIds={startedIds}
                    onOpen={onOpen}
                  />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** The ladders of one topic and what its next badge needs (shown under the picture). */
function TopicDetail({
  sub,
  areaName,
  ladders,
  startedIds,
  onOpen,
}: {
  sub: SubdomainProgress;
  areaName: string;
  ladders: Map<string, Ladder>;
  startedIds: Set<string>;
  onOpen: (p: HomeProblem) => void;
}) {
  const level = sub.tier ? SUBDOMAIN_TIERS.indexOf(sub.tier) + 1 : 0;
  return (
    <div className="border-t border-slate-100 px-5 py-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-[15px] font-semibold text-slate-900">
          {sub.name} <span className="ml-1 text-xs font-normal text-slate-500">{areaName}</span>
        </h3>
        {sub.total > 0 && (
          <span className="flex items-center gap-2">
            {sub.tier && <TierChip name={sub.tier} level={level} />}
            <span className="tnum text-xs text-slate-500">{sub.solved} of {sub.total} problems solved</span>
          </span>
        )}
      </div>
      {sub.total === 0 ? (
        <p className="mt-2 text-sm text-slate-500">No ladders in this topic yet. Coming soon.</p>
      ) : (
        <>
          {sub.next && (
            <p className="mt-1 text-xs text-slate-500">
              <span className="font-medium text-slate-700">Next: {sub.next.tier}.</span>{" "}
              {sub.next.reachable ? remaining(sub.next) : "Not enough problems on the site for this badge yet. More are coming."}
            </p>
          )}
          <ul className="mt-2 divide-y divide-slate-100">
            {sub.ladders.map((row) => {
              const ladder = ladders.get(row.rootId);
              return ladder ? <LadderRow key={row.rootId} ladder={ladder} startedIds={startedIds} onOpen={onOpen} /> : null;
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * One field drawn as a small tree: the field on top, its areas in the middle, its core topics as circles at the
 * bottom (computer screens; phones get the list). Positions are in percent, so it scales with the width.
 */
function MapPicture({
  domain,
  hereTopicId,
  selectedTopicId,
  onSelectTopic,
}: {
  domain: DomainProgress;
  hereTopicId: number | null;
  selectedTopicId: number | null;
  onSelectTopic: (id: number) => void;
}) {
  const topics = domain.subdomains;
  const x = (i: number) => ((i + 0.5) / topics.length) * 100;
  const areas = [...new Map(topics.map((t) => [t.groupId, t.groupName])).entries()].map(([id, name]) => {
    const idx = topics.map((t, i) => (t.groupId === id ? i : -1)).filter((i) => i >= 0);
    return { id, name, x: idx.reduce((a, i) => a + x(i), 0) / idx.length, idx };
  });
  const Y = { field: 13, area: 43, topic: 75 };
  const level = domain.tier ? DOMAIN_TIERS.indexOf(domain.tier) + 1 : 0;

  return (
    <div className="relative h-[320px] w-full">
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {areas.map((a) => (
          <g key={a.id}>
            <line x1={50} y1={Y.field} x2={a.x} y2={Y.area} stroke="#cbd5e1" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            {a.idx.map((i) => (
              <line key={i} x1={a.x} y1={Y.area} x2={x(i)} y2={Y.topic} stroke="#cbd5e1" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        ))}
      </svg>

      {/* Field */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-md border border-slate-300 bg-white px-4 py-2 text-center shadow-sm" style={{ left: "50%", top: `${Y.field}%` }}>
        <div className="text-sm font-semibold text-slate-900">{domain.name}</div>
        <div className="tnum text-[11px] text-slate-500">{domain.solved} of {domain.total} solved</div>
        {domain.tier && <div className="mt-1"><TierChip name={domain.tier} level={level} /></div>}
      </div>

      {/* Areas */}
      {areas.map((a) => (
        <div
          key={a.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700"
          style={{ left: `${a.x}%`, top: `${Y.area}%` }}
        >
          {a.name}
        </div>
      ))}

      {/* Core topics */}
      {topics.map((t, i) => {
        const empty = t.total === 0;
        const state = empty ? "empty" : t.tier ? "badge" : t.solved > 0 ? "progress" : "new";
        const selected = t.id === selectedTopicId;
        const here = t.id === hereTopicId;
        const tierLevel = t.tier ? SUBDOMAIN_TIERS.indexOf(t.tier) + 1 : 0;
        return (
          <button
            key={t.id}
            onClick={() => onSelectTopic(t.id)}
            aria-pressed={selected}
            title={empty ? `${t.name}: coming soon` : `${t.name}: ${t.solved} of ${t.total} solved`}
            className="group absolute flex w-40 -translate-x-1/2 -translate-y-[28px] flex-col items-center text-center"
            style={{ left: `${x(i)}%`, top: `${Y.topic}%` }}
          >
            {here && (
              <span className="absolute -top-6 inline-flex items-center gap-0.5 whitespace-nowrap rounded-full bg-blue-50 px-1.5 py-px text-[10px] font-medium text-blue-800">
                <MapPin className="h-3 w-3" /> You are here
              </span>
            )}
            <span
              className={`flex h-14 w-14 items-center justify-center rounded-full text-xs transition-shadow ${
                state === "badge"
                  ? "bg-slate-900 text-white"
                  : state === "progress"
                    ? "border-2 border-slate-900 bg-white text-slate-900"
                    : state === "new"
                      ? "border border-slate-300 bg-white text-slate-600"
                      : "border border-dashed border-slate-300 bg-slate-50 text-slate-400"
              } ${selected ? "ring-2 ring-blue-500 ring-offset-2" : "group-hover:ring-2 group-hover:ring-slate-200 group-hover:ring-offset-2"}`}
            >
              {state === "badge" ? <Award className="h-5 w-5" /> : empty ? "soon" : <span className="tnum">{t.solved}/{t.total}</span>}
            </span>
            <span className={`mt-1.5 line-clamp-2 text-xs leading-tight ${empty ? "text-slate-400" : "font-medium text-slate-800"}`}>{t.name}</span>
            {t.tier && <span className="mt-1"><TierChip name={t.tier} level={tierLevel} /></span>}
          </button>
        );
      })}
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
            A solved problem gives {r.pointsPerDifficulty} × its difficulty in points for its field. Fields contain areas, and areas contain topics. Badges are never taken away.
          </p>
          <table className="w-full">
            <tbody className="[&_td]:py-1 [&_td]:pr-3 [&_td]:align-top">
              <tr><td className="font-medium text-slate-900">Explorer</td><td>{r.explorer.solved} problems in a topic, from at least {r.explorer.ladders} ladders</td></tr>
              <tr><td className="font-medium text-slate-900">Specialist</td><td>{r.specialist.solved} problems in a topic, {r.specialist.count} of them difficulty {r.specialist.atLeastDifficulty}+</td></tr>
              <tr><td className="font-medium text-slate-900">Virtuoso</td><td>{r.virtuoso.solved} problems in a topic, {r.virtuoso.hard} hard, {r.virtuoso.challenges} Challenges</td></tr>
              <tr><td className="font-medium text-slate-900">Expert</td><td>{r.expert.hard} hard problems in a field, {r.expert.points} points, Explorer in {r.expert.explorerSubdomains} topics</td></tr>
              <tr><td className="font-medium text-slate-900">Champion</td><td>{r.champion.hard} hard, {r.champion.points} points, Specialist in {r.champion.specialistSubdomains} topics, {r.champion.challenges} Challenges</td></tr>
              <tr><td className="font-medium text-slate-900">Legend</td><td>{r.legend.hard} hard, {r.legend.points} points, Virtuoso in {r.legend.virtuosoSubdomains} and Specialist in {r.legend.specialistSubdomains} topics</td></tr>
              <tr><td className="font-medium text-slate-900">Polymath</td><td>Explorer badges in {r.polymath.domainsWithExplorer} fields</td></tr>
              <tr><td className="font-medium text-slate-900">Ladders</td><td>{r.ladderBadges.map((b) => `${b.name} (${b.ladders})`).join(", ")} ladders finished</td></tr>
              <tr><td className="font-medium text-slate-900">Trailblazer</td><td>among the first {r.trailblazerFirstSolvers} students to solve a Challenge</td></tr>
              <tr><td className="font-medium text-slate-900">Navigator</td><td>Explorer in {r.navigator.explorerSubdomains} topics of the same area (e.g. Divisibility)</td></tr>
              <tr><td className="font-medium text-slate-900">Cartographer</td><td>problems solved in {r.cartographer.groups} different areas</td></tr>
              <tr><td className="font-medium text-slate-900">Thorough</td><td>{r.thorough.ladders} ladders finished with every step solved, not only the Challenge</td></tr>
              <tr><td className="font-medium text-slate-900">First Try</td><td>{r.firstTry.map((b) => `${b.name} (${b.challenges})`).join(", ")} Challenges correct on the first attempt</td></tr>
              <tr><td className="font-medium text-slate-900">Persistent</td><td>{r.persistent.map((b) => `${b.name} (${b.problems})`).join(", ")} problems solved after {r.wrongTries} or more wrong tries</td></tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function UpcomingList({ items }: { items: UpcomingBadge[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <h3 className="mb-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Closest next badges</h3>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {items.map((u) => (
          <li key={u.key} className="rounded-md border border-slate-200 p-3">
            <p className="mb-2 text-[13px] font-medium text-slate-900">{u.name}</p>
            <Requirements next={{ tier: u.name, requirements: u.requirements, reachable: true }} compact />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function SkillTree() {
  const data = useHomeData();
  const { startedIds, markStarted } = useStarts();
  const [openProblem, setOpenProblem] = useState<HomeProblem | null>(null);
  const [firstSolves, setFirstSolves] = useState<Set<string>>(new Set());
  const [wrongBeforeSolve, setWrongBeforeSolve] = useState<Map<string, number>>(new Map());
  const [openDomain, setOpenDomain] = useState<number | null | undefined>(undefined); // undefined = default
  const [openTopic, setOpenTopic] = useState<number | null | undefined>(undefined);

  useEffect(() => {
    fetch("/api/user/first-solves")
      .then((r) => (r.ok ? r.json() : { problemIds: [], wrongBeforeSolve: {} }))
      .then((d) => {
        setFirstSolves(new Set(d.problemIds || []));
        setWrongBeforeSolve(new Map(Object.entries((d.wrongBeforeSolve || {}) as Record<string, number>)));
      })
      .catch(() => setFirstSolves(new Set()));
  }, [data.progress.solvedIds]);

  const ladderByRoot = useMemo(() => new Map(data.ladders.map((l) => [l.root.id, l])), [data.ladders]);

  const tree = useMemo(() => {
    const ladders = data.ladders.map((l) => ({ rootId: l.root.id, name: l.name, problemIds: l.steps.map((s) => s.problem.id) }));
    const trailblazer = new Set([...firstSolves].filter((id) => ladderByRoot.has(id)));
    return computeSkillTree(ladders, data.problemsById as Map<string, SkillProblem>, data.progress.solvedIds, trailblazer, wrongBeforeSolve);
  }, [data.ladders, data.problemsById, data.progress.solvedIds, firstSolves, ladderByRoot, wrongBeforeSolve]);

  // "You are here": the problem the student is on (same choice as the Home page's Continue card)
  const here = useMemo(() => {
    const nextUp = data.nextUp;
    if (!nextUp || nextUp.kind === "recommended" || data.stage === "new") return null;
    const ladder = nextUp.ladder ?? data.ladderOfProblem.get(nextUp.problem.id);
    if (!ladder) return null;
    const index = ladder.steps.findIndex((s) => s.problem.id === nextUp.problem.id);
    const place = placeOfCategory(ladder.root.category_level3);
    const topicId = place?.topic.id ?? null;
    const topic = tree.domains.flatMap((d) => d.subdomains).find((s) => s.id === topicId) ?? null;
    const domain = tree.domains.find((d) => d.subdomains.some((s) => s.id === topicId)) ?? null;
    const path = place ? [place.field.name, place.area.name, place.topic.name].join(" › ") : "";
    return { problem: nextUp.problem, ladder, index, topic, domain, path };
  }, [data.nextUp, data.stage, data.ladderOfProblem, tree]);

  const domainOpen = openDomain === undefined ? here?.domain?.id ?? tree.domains[0]?.id ?? null : openDomain;
  const topicOpen = openTopic === undefined ? here?.topic?.id ?? null : openTopic;
  // The picture always shows one field and one selected topic
  const pictureDomain = tree.domains.find((d) => d.id === domainOpen) ?? tree.domains[0] ?? null;
  const pictureTopic =
    pictureDomain?.subdomains.find((s) => s.id === topicOpen) ?? pictureDomain?.subdomains.find((s) => s.total > 0) ?? null;

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
    <div className="mx-auto w-full max-w-[1000px] space-y-6 p-4 sm:p-6 lg:p-8">
      <header>
        <h1 className="flex items-center gap-2 text-lg font-semibold text-slate-900">
          <Network className="h-5 w-5 text-slate-400" /> Skill Tree
        </h1>
        <p className="mt-1 text-sm text-slate-500">Where you are in math, and what you are mastering. Badges are never taken away.</p>
      </header>

      {data.loadError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{data.loadError}</div>}

      {/* You are here */}
      <section aria-label="You are here" className="rounded-md border border-slate-300 bg-white p-4">
        <p className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-[0.08em] text-blue-800">
          <MapPin className="h-3.5 w-3.5" /> You are here
        </p>
        {here ? (
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-slate-500">{here.path}</p>
              <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-base font-semibold text-slate-900">
                {here.ladder.name}
                <span className="text-sm font-normal text-slate-500">{here.ladder.steps[here.index]?.label ?? "Step"}</span>
                <LadderDots ladder={here.ladder} currentId={here.problem.id} solvedIds={data.progress.solvedIds} />
              </div>
              {here.topic?.next && here.topic.next.reachable && (
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-medium text-slate-700">Next badge: {here.topic.name} {here.topic.next.tier}.</span> {remaining(here.topic.next)}
                </p>
              )}
            </div>
            <Button size="sm" className="h-8" onClick={() => open(here.problem)}>
              Continue <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            You have not started a ladder yet. Open a field below, pick a topic, and press <b>Start</b>.
          </p>
        )}
      </section>

      {/* Your map: a picture of one field on computers, a list on phones (same data) */}
      {tree.domains.length > 0 && (
        <section aria-label="Your map" className="hidden md:block">
          <h2 className="mb-2 text-[13px] font-semibold text-slate-900">Your map</h2>
          <div className="rounded-md border border-slate-200 bg-white">
            <div role="tablist" aria-label="Fields" className="flex gap-1 border-b border-slate-200 px-3">
              {tree.domains.map((d) => (
                <button
                  key={d.id}
                  role="tab"
                  aria-selected={d.id === pictureDomain?.id}
                  onClick={() => {
                    setOpenDomain(d.id);
                    setOpenTopic(d.subdomains.find((s) => s.total > 0)?.id ?? null);
                  }}
                  className={`-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm transition-colors ${
                    d.id === pictureDomain?.id ? "border-slate-900 font-medium text-slate-900" : "border-transparent text-slate-500 hover:text-slate-900"
                  }`}
                >
                  {d.name}
                  {d.subdomains.some((s) => s.id === here?.topic?.id) && <MapPin className="h-3.5 w-3.5 text-blue-700" />}
                  <span className="tnum text-xs text-slate-400">{d.solved}/{d.total}</span>
                </button>
              ))}
            </div>
            {pictureDomain && (
              <>
                <div className="px-4 pt-6">
                  <MapPicture
                    domain={pictureDomain}
                    hereTopicId={here?.topic?.id ?? null}
                    selectedTopicId={pictureTopic?.id ?? null}
                    onSelectTopic={(id) => setOpenTopic(id)}
                  />
                </div>
                {pictureTopic && (
                  <TopicDetail
                    sub={pictureTopic}
                    areaName={pictureTopic.groupName}
                    ladders={ladderByRoot}
                    startedIds={startedIds}
                    onOpen={open}
                  />
                )}
              </>
            )}
          </div>
        </section>
      )}
      {tree.domains.length > 0 && (
        <section aria-label="Your map (list)" className="space-y-2 md:hidden">
          <h2 className="text-[13px] font-semibold text-slate-900">Your map</h2>
          {tree.domains.map((d) => (
            <DomainSection
              key={d.id}
              domain={d}
              hereTopicId={here?.topic?.id ?? null}
              isOpen={domainOpen === d.id}
              onToggle={() => setOpenDomain(domainOpen === d.id ? null : d.id)}
              openTopicId={topicOpen}
              onToggleTopic={(id) => setOpenTopic(topicOpen === id ? null : id)}
              ladders={ladderByRoot}
              startedIds={startedIds}
              onOpen={open}
            />
          ))}
        </section>
      )}

      {/* Badges */}
      <section className="rounded-md border border-slate-200 bg-white p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[13px] font-semibold text-slate-900">My badges</h2>
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
        <UpcomingList items={tree.upcoming.slice(0, 3)} />
      </section>

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
