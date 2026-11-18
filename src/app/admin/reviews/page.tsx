"use client";

import React, { useEffect, useMemo, useState } from "react";
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

    const load = async () => {
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
    };
    useEffect(() => { load(); }, []);

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

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900">Problem reviews</h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Automatic checks first, then reviewers approve. A problem needs its required number of approvals
                        on its current content. Every review is kept.
                    </p>
                </div>
                <button onClick={load} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
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

            <div className="rounded-lg border border-slate-200 bg-white overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Problem</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Automatic check</TableHead>
                            <TableHead>Review</TableHead>
                            <TableHead>My review</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow><TableCell colSpan={5} className="py-10 text-center text-slate-500">
                                <Loader2 className="inline w-5 h-5 animate-spin mr-2" /> Loading…
                            </TableCell></TableRow>
                        ) : shown.length === 0 ? (
                            <TableRow><TableCell colSpan={5} className="py-10 text-center text-slate-500">No problems here.</TableCell></TableRow>
                        ) : shown.map((r) => (
                            <TableRow key={r.id}>
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
