"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Search, AlertTriangle, CheckCircle2, Clock, XCircle, MessageSquare, RefreshCw } from "lucide-react";
import { AUTO_STYLE, REVIEW_STYLE, DECISION_LABEL } from "./styles";

// Problem reviews: list. Admins and reviewers. Plan: Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md §6.

interface ReviewRow {
    id: string;
    title: string;
    ladder: string | null;
    part: string | null;
    label: string | null;
    source: string | null;
    difficulty: number;
    isReviewed: boolean;
    autoStatus: "unverified" | "passed" | "warning" | "failed";
    stale: boolean;
    reviewStatus: "pending" | "approved" | "changes_requested" | "rejected" | "needs_recheck";
    approvals: number;
    requiredApprovals: number;
    myDecision: string | null;
}

const FILTERS = [
    { key: "todo", label: "To review" },
    { key: "failed", label: "Auto check failed" },
    { key: "changes_requested", label: "Changes requested" },
    { key: "needs_recheck", label: "Re-check needed" },
    { key: "rejected", label: "Rejected" },
    { key: "approved", label: "Approved" },
    { key: "unverified", label: "Not checked" },
    { key: "all", label: "All" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function matches(row: ReviewRow, key: FilterKey): boolean {
    switch (key) {
        case "todo": return row.reviewStatus === "pending" || row.reviewStatus === "needs_recheck";
        case "failed": return row.autoStatus === "failed";
        case "unverified": return row.autoStatus === "unverified";
        case "all": return true;
        default: return row.reviewStatus === key;
    }
}

// Bulk approval takes only problems whose automatic check passed on their current content, that wait for review,
// and that I have not approved yet (the server checks the same: /api/admin/reviews/bulk).
function bulkEligible(row: ReviewRow): boolean {
    return row.autoStatus === "passed" && !row.stale
        && (row.reviewStatus === "pending" || row.reviewStatus === "needs_recheck")
        && row.myDecision !== "approve";
}

const BULK_BATCH = 10; // problems per request (hosting time limit)

const TOOL_BUTTON = "inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-100";

interface CheckState {
    configured: boolean;
    run: { status: string; conclusion: string | null; createdAt: string; url: string; event: string } | null;
    lastCheckedAt: string | null;
}

function when(iso: string | null) {
    return iso ? new Date(iso).toLocaleString() : "never";
}

/** Automatic check: last time it ran, and a button that starts it on GitHub Actions (stage 6). */
function AutoCheck({ onFinished }: { onFinished: () => void }) {
    const [state, setState] = useState<CheckState | null>(null);
    const [message, setMessage] = useState("");
    const [waiting, setWaiting] = useState(false);

    const read = async (): Promise<CheckState | null> => {
        const res = await fetch("/api/admin/reviews/recheck");
        const data = await res.json().catch(() => null);
        if (!res.ok || !data) return null;
        setState(data);
        return data;
    };
    useEffect(() => { read(); }, []);

    // While a run is queued or running, look again every 15 seconds; reload the list when it ends.
    useEffect(() => {
        if (!waiting) return;
        const started = Date.now();
        const timer = setInterval(async () => {
            const now = await read();
            const run = now?.run;
            if (run && run.status === "completed" && new Date(run.createdAt).getTime() >= started - 120_000) {
                setWaiting(false);
                setMessage(run.conclusion === "success" ? "Check finished. The list is up to date." : `Check ended: ${run.conclusion}. See the run on GitHub.`);
                onFinished();
            } else if (Date.now() - started > 15 * 60_000) {
                setWaiting(false);
                setMessage("The check is taking longer than expected. See the run on GitHub.");
            }
        }, 15_000);
        return () => clearInterval(timer);
    }, [waiting, onFinished]);

    const start = async () => {
        setMessage("");
        const res = await fetch("/api/admin/reviews/recheck", { method: "POST" });
        const data = await res.json().catch(() => ({}));
        if (res.status === 202 || res.status === 409) {
            setWaiting(true);
            setMessage(res.status === 409 ? data.error : "Check started. It takes about two minutes.");
        } else {
            setMessage(data.error || `Could not start the check (${res.status})`);
        }
    };

    const running = waiting || (state?.run && state.run.status !== "completed");
    return (
        <>
            <span className="text-sm text-slate-500">Last automatic check: {when(state?.lastCheckedAt ?? null)}</span>
                {state?.configured ? (
                    <button onClick={start} disabled={!!running} className={`${TOOL_BUTTON} disabled:opacity-60`}>
                        {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                        {running ? "Checking…" : "Run automatic check"}
                    </button>
                ) : state ? (
                    <span className="text-xs text-slate-400" title="Set GITHUB_DISPATCH_TOKEN on the server to start checks from here">Runs every night</span>
                ) : null}
            {message && (
                <span className="order-last basis-full text-xs text-slate-600">
                    {message}{" "}
                    {state?.run?.url && <a href={state.run.url} target="_blank" rel="noreferrer" className="underline">GitHub run</a>}
                </span>
            )}
        </>
    );
}

interface BulkOutcome { id: string; title: string | null; outcome: "approved" | "skipped" | "error"; reason?: string }

function sortKey(row: ReviewRow) {
    const auto = { failed: 0, warning: 1, unverified: 2, passed: 3 }[row.autoStatus] ?? 4;
    return `${auto}-${row.ladder ?? "~"}-${row.part === "Challenge" ? "~" : row.part ?? ""}-${row.title}`;
}

export default function ReviewListPage() {
    const [rows, setRows] = useState<ReviewRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState<FilterKey>("todo");
    const [onlyMine, setOnlyMine] = useState(false);
    const [source, setSource] = useState("all");
    const [query, setQuery] = useState("");
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [confirming, setConfirming] = useState(false);
    const [bulkComment, setBulkComment] = useState("");
    const [bulkRead, setBulkRead] = useState(false);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [bulkResults, setBulkResults] = useState<BulkOutcome[] | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/reviews");
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to load");
            setRows(data.problems);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);

    const sources = useMemo(() => [...new Set(rows.map((r) => r.source || "(no source)"))].sort(), [rows]);
    const counts = useMemo(() => Object.fromEntries(FILTERS.map((f) => [f.key, rows.filter((r) => matches(r, f.key)).length])), [rows]);

    const shown = useMemo(() => {
        const q = query.trim().toLowerCase();
        return rows
            .filter((r) => matches(r, filter))
            .filter((r) => !onlyMine || !r.myDecision)
            .filter((r) => source === "all" || (r.source || "(no source)") === source)
            .filter((r) => !q || r.title.toLowerCase().includes(q))
            .sort((a, b) => sortKey(a).localeCompare(sortKey(b)));
    }, [rows, filter, onlyMine, source, query]);

    // A changed filter or reload starts a new selection, so nothing hidden from view stays selected.
    useEffect(() => { setSelected(new Set()); setConfirming(false); }, [rows, filter, onlyMine, source, query]);

    const eligibleShown = useMemo(() => shown.filter(bulkEligible), [shown]);
    const allEligibleSelected = eligibleShown.length > 0 && eligibleShown.every((r) => selected.has(r.id));
    const toggle = (id: string) => setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id); else next.add(id);
        return next;
    });
    const toggleAll = () => setSelected(allEligibleSelected ? new Set() : new Set(eligibleShown.map((r) => r.id)));

    const runBulk = async () => {
        const ids = [...selected];
        const results: BulkOutcome[] = [];
        setProgress({ done: 0, total: ids.length });
        setBulkResults(null);
        for (let i = 0; i < ids.length; i += BULK_BATCH) {
            const batch = ids.slice(i, i + BULK_BATCH);
            try {
                const res = await fetch("/api/admin/reviews/bulk", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ problemIds: batch, comment: bulkComment }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
                results.push(...(data.results as BulkOutcome[]));
            } catch (e) {
                const reason = e instanceof Error ? e.message : "Request failed";
                const titleOf = (id: string) => rows.find((r) => r.id === id)?.title ?? null;
                results.push(...batch.map((id) => ({ id, title: titleOf(id), outcome: "error" as const, reason })));
            }
            setProgress({ done: Math.min(i + BULK_BATCH, ids.length), total: ids.length });
        }
        setBulkResults(results);
        setProgress(null);
        setConfirming(false);
        setBulkComment("");
        setBulkRead(false);
        await load();
    };

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Problem reviews</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Automatic checks first, then reviewers approve. A problem needs its required number of approvals
                        on its current content. Every review is kept.
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <AutoCheck onFinished={load} />
                    <button onClick={load} className={TOOL_BUTTON}>
                        <RefreshCw className="w-4 h-4" /> Refresh list
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                {FILTERS.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${filter === f.key
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"}`}
                    >
                        {f.label} <span className="ml-1 opacity-70 tabular-nums">{counts[f.key] ?? 0}</span>
                    </button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input id="review-search" placeholder="Search titles" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
                </div>
                <select
                    id="review-source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                >
                    <option value="all">All sources</option>
                    {sources.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <label className="inline-flex items-center gap-2 text-sm text-slate-700">
                    <input id="review-only-mine" type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
                    Only problems I have not reviewed
                </label>
            </div>

            {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

            {bulkResults && (() => {
                const approved = bulkResults.filter((r) => r.outcome === "approved").length;
                const others = bulkResults.filter((r) => r.outcome !== "approved");
                return (
                    <div className={`rounded-md border p-3 text-sm ${others.length ? "border-amber-200 bg-amber-50 text-amber-900" : "border-emerald-200 bg-emerald-50 text-emerald-900"}`}>
                        <div className="flex items-center justify-between gap-2">
                            <span>Bulk approval: {approved} approved{others.length ? `, ${others.length} not approved` : ""}.</span>
                            <button onClick={() => setBulkResults(null)} className="text-xs underline">Close</button>
                        </div>
                        {others.length > 0 && (
                            <ul className="mt-2 list-disc pl-5 space-y-0.5">
                                {others.map((r) => <li key={r.id}>{r.title || r.id}: {r.reason}</li>)}
                            </ul>
                        )}
                    </div>
                );
            })()}

            {selected.size > 0 && (
                <div className="rounded-md border border-slate-300 bg-slate-50 p-3 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-slate-900">{selected.size} selected</span>
                        <div className="flex gap-2">
                            <button onClick={() => setSelected(new Set())} disabled={!!progress}
                                className="px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50">
                                Clear
                            </button>
                            {!confirming && (
                                <button onClick={() => setConfirming(true)}
                                    className="px-3 py-1.5 rounded-md bg-emerald-600 text-sm text-white hover:bg-emerald-700">
                                    Approve selected
                                </button>
                            )}
                        </div>
                    </div>
                    {confirming && (
                        <div className="space-y-2 border-t border-slate-200 pt-3">
                            <p className="text-sm text-slate-700">
                                Each selected problem gets its own approval, recorded as &ldquo;Bulk approval from the review list&rdquo;
                                and kept in its history. Approved problems are shown to students. Only problems whose automatic
                                check passed can be selected.
                            </p>
                            <textarea id="bulk-comment" value={bulkComment} onChange={(e) => setBulkComment(e.target.value)}
                                placeholder="Comment (optional), added to every approval" rows={2} maxLength={1000}
                                className="w-full rounded-md border border-slate-200 bg-white p-2 text-sm" />
                            <label className="flex items-center gap-2 text-sm text-slate-800">
                                <input id="bulk-read" type="checkbox" checked={bulkRead} onChange={(e) => setBulkRead(e.target.checked)} />
                                I have read these {selected.size} problems and their solutions.
                            </label>
                            <div className="flex items-center gap-2">
                                <button onClick={runBulk} disabled={!bulkRead || !!progress}
                                    className="px-3 py-1.5 rounded-md bg-emerald-600 text-sm text-white hover:bg-emerald-700 disabled:opacity-50">
                                    {progress ? `Approving ${progress.done}/${progress.total}…` : `Approve ${selected.size} problems`}
                                </button>
                                {!progress && (
                                    <button onClick={() => setConfirming(false)} className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-10">
                                <input type="checkbox" aria-label="Select every problem that can be bulk approved"
                                    title="Select every problem shown that can be bulk approved (automatic check passed)"
                                    checked={allEligibleSelected} disabled={eligibleShown.length === 0 || !!progress} onChange={toggleAll} />
                            </TableHead>
                            <TableHead>Problem</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Automatic check</TableHead>
                            <TableHead>Review</TableHead>
                            <TableHead>My review</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={6} className="py-10 text-center text-slate-500">
                                <Loader2 className="inline w-5 h-5 animate-spin mr-2" /> Loading…
                            </TableCell></TableRow>
                        ) : shown.length === 0 ? (
                            <TableRow><TableCell colSpan={6} className="py-10 text-center text-slate-500">No problems here.</TableCell></TableRow>
                        ) : shown.map((r) => (
                            <TableRow key={r.id} className={selected.has(r.id) ? "bg-emerald-50/50" : undefined}>
                                <TableCell className="w-10">
                                    <input type="checkbox" aria-label={`Select ${r.title}`}
                                        title={bulkEligible(r) ? "Select for bulk approval" : "Review this problem on its own page (automatic check not passed, already reviewed, or changed since the check)"}
                                        checked={selected.has(r.id)} disabled={!bulkEligible(r) || !!progress} onChange={() => toggle(r.id)} />
                                </TableCell>
                                <TableCell className="max-w-md">
                                    <Link href={`/admin/reviews/${r.id}`} className="font-medium text-slate-900 hover:underline">{r.title}</Link>
                                    <div className="text-xs text-slate-500 mt-0.5">{r.source || "No source"}{r.isReviewed ? " · visible to students as approved" : ""}</div>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600 whitespace-nowrap">{r.label || "-"}</TableCell>
                                <TableCell>
                                    <Badge className={AUTO_STYLE[r.autoStatus]?.className}>
                                        {r.autoStatus === "failed" && <AlertTriangle className="w-3 h-3 mr-1" />}
                                        {AUTO_STYLE[r.autoStatus]?.label ?? r.autoStatus}
                                    </Badge>
                                    {r.stale && <div className="text-xs text-violet-700 mt-1">Content changed since the last check</div>}
                                </TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <Badge className={REVIEW_STYLE[r.reviewStatus]?.className}>{REVIEW_STYLE[r.reviewStatus]?.label ?? r.reviewStatus}</Badge>
                                    <span className="ml-2 text-xs text-slate-500 tabular-nums">{r.approvals}/{r.requiredApprovals}</span>
                                </TableCell>
                                <TableCell className="text-sm text-slate-600 whitespace-nowrap">
                                    {r.myDecision === "approve" ? <span className="inline-flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-4 h-4" />{DECISION_LABEL[r.myDecision]}</span>
                                        : r.myDecision === "reject" ? <span className="inline-flex items-center gap-1 text-red-700"><XCircle className="w-4 h-4" />{DECISION_LABEL[r.myDecision]}</span>
                                        : r.myDecision === "comment" ? <span className="inline-flex items-center gap-1"><MessageSquare className="w-4 h-4" />{DECISION_LABEL[r.myDecision]}</span>
                                        : r.myDecision === "withdraw" ? <span className="text-slate-500">Withdrew</span>
                                        : r.myDecision ? <span className="inline-flex items-center gap-1 text-amber-700"><Clock className="w-4 h-4" />{DECISION_LABEL[r.myDecision]}</span>
                                        : <span className="text-slate-400">Not yet</span>}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            {!loading && <p className="text-xs text-slate-500">{shown.length} of {rows.length} problems</p>}
        </div>
    );
}
