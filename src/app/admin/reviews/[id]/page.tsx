"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import MathPreview from "@/components/MathPreview";
import { AlertTriangle, ArrowLeft, Loader2, RefreshCw, Info } from "lucide-react";
import { AUTO_STYLE, REVIEW_STYLE, DECISION_LABEL, DECISION_STYLE } from "../styles";

// Problem reviews: one problem. Admins and reviewers. Plan: Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md §3 and §6.

interface Issue { rule: string; severity: "fail" | "warn" | "info"; message: string }
interface Layer { layer: string; status: "pass" | "warn" | "fail"; issues: Issue[]; checkedAt: string; forCurrentContent: boolean }
interface Review {
    id: string; reviewerId: string | null; reviewerName: string; decision: string; comment: string | null;
    autoStatus: string | null; createdAt: string; forCurrentContent: boolean;
}
interface Detail {
    me: { id: string; role: string };
    problem: {
        id: string; title: string; content: string; difficulty: number; level: string | null; tags: string[] | null;
        source: string | null; category_path: string | null; is_reviewed: boolean; ladder: string | null;
        part: string | null; label: string | null; updated_at: string;
    };
    solutions: { id: string; content: string; sequence_order: number }[];
    verification: null | {
        autoStatus: string; autoSummary: Record<string, string>; reviewStatus: string; approvals: number;
        requiredApprovals: number; lastCheckedAt: string | null; lastReviewedAt: string | null; stale: boolean;
    };
    layers: Layer[];
    reviews: Review[];
}

const LAYER_NAMES: Record<string, string> = {
    L0: "L0 Format checks", L1: "L1 Comparison with the markdown source", L2: "L2 Independent recomputation",
    L3: "L3 AI solve", L4: "L4 Ambiguity", L5: "L5 Rule review", L6: "L6 Similarity to the source", L8: "L8 After publishing",
};
const SEVERITY_STYLE: Record<string, string> = {
    fail: "text-red-700 bg-red-50 border-red-200", warn: "text-amber-800 bg-amber-50 border-amber-200",
    info: "text-slate-600 bg-slate-50 border-slate-200",
};
const DECISIONS = [
    { key: "approve", label: "Approve", hint: "Ready for students." },
    { key: "request_changes", label: "Request changes", hint: "Fix and review again (a comment is required)." },
    { key: "reject", label: "Reject", hint: "Do not use this problem (a comment is required)." },
    { key: "comment", label: "Comment only", hint: "A note or question without a decision." },
] as const;

/** Problem text as safe HTML for MathPreview: escape tags, keep line breaks; MathJax still renders $…$. */
function textToHtml(text: string) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>");
}

function when(iso: string | null) {
    return iso ? new Date(iso).toLocaleString() : "-";
}

export default function ReviewDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [data, setData] = useState<Detail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [decision, setDecision] = useState<string>("approve");
    const [comment, setComment] = useState("");
    const [acknowledged, setAcknowledged] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saved, setSaved] = useState("");

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/admin/reviews/${id}`);
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to load");
            setData(json);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    }, [id]);
    useEffect(() => { load(); }, [load]);

    if (loading && !data) return <div className="py-20 text-center text-slate-500"><Loader2 className="inline w-5 h-5 animate-spin mr-2" />Loading…</div>;
    if (error) return <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>;
    if (!data) return null;

    const { problem, solutions, verification: v, layers, reviews } = data;
    const autoFailed = v?.autoStatus === "failed";
    const notChecked = !v || v.autoStatus === "unverified";
    const stale = !!v?.stale;
    const failedIssues = layers.filter((l) => l.forCurrentContent).flatMap((l) => l.issues.filter((i) => i.severity === "fail").map((i) => ({ ...i, layer: l.layer })));
    const myLatest = [...reviews].reverse().find((r) => r.reviewerId === data.me.id && r.forCurrentContent && r.decision !== "comment");

    const approveBlocked = decision === "approve" && (notChecked || stale);
    const needsComment = decision !== "approve" || autoFailed;
    const needsAck = decision === "approve" && autoFailed;
    const canSubmit = !saving && !approveBlocked && (!needsComment || comment.trim().length > 0) && (!needsAck || acknowledged);

    const submit = async () => {
        setSaving(true);
        setSaveError("");
        setSaved("");
        try {
            const res = await fetch(`/api/admin/reviews/${id}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ decision, comment, acknowledgeFailed: acknowledged }),
            });
            const json = await res.json();
            if (!res.ok) throw new Error(json.error || "Failed to save");
            setSaved(`Saved. Status: ${REVIEW_STYLE[json.reviewStatus]?.label ?? json.reviewStatus} (${json.approvals}/${json.requiredApprovals} approvals).`);
            setComment("");
            setAcknowledged(false);
            await load();
        } catch (e) {
            setSaveError(e instanceof Error ? e.message : "Failed to save");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl">
            <div className="flex items-center justify-between gap-4">
                <Link href="/admin/reviews" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" /> All reviews
                </Link>
                <button onClick={load} className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">{problem.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    {problem.label && <Badge variant="secondary">{problem.label}</Badge>}
                    <span>Difficulty {problem.difficulty}</span>
                    <span>·</span><span>{problem.source || "No source"}</span>
                    {problem.category_path && <><span>·</span><span>{problem.category_path}</span></>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Badge className={AUTO_STYLE[v?.autoStatus ?? "unverified"]?.className}>Automatic check: {AUTO_STYLE[v?.autoStatus ?? "unverified"]?.label}</Badge>
                    <Badge className={REVIEW_STYLE[v?.reviewStatus ?? "pending"]?.className}>{REVIEW_STYLE[v?.reviewStatus ?? "pending"]?.label}</Badge>
                    <span className="text-sm text-slate-600 tabular-nums">Approvals {v?.approvals ?? 0}/{v?.requiredApprovals ?? 1}</span>
                    {problem.is_reviewed && <span className="text-xs text-emerald-700">Marked as approved for students</span>}
                </div>
            </div>

            {/* Warnings a reviewer must see */}
            {notChecked && (
                <div className="flex gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                    <Info className="w-5 h-5 shrink-0" />
                    <div>This problem has not been checked automatically yet, so it cannot be approved. Run <code>python3 scripts/verify/report.py --save</code>, then refresh.</div>
                </div>
            )}
            {stale && (
                <div className="flex gap-3 rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm text-violet-800">
                    <Info className="w-5 h-5 shrink-0" />
                    <div>The problem changed after the last automatic check. The results below are for the earlier content. Run the check again before approving.</div>
                </div>
            )}
            {autoFailed && !stale && (
                <div className="rounded-lg border-2 border-red-300 bg-red-50 p-4">
                    <div className="flex items-center gap-2 font-semibold text-red-800"><AlertTriangle className="w-5 h-5" /> The automatic check failed</div>
                    <ul className="mt-2 space-y-1 text-sm text-red-800 list-disc pl-6">
                        {failedIssues.length ? failedIssues.map((i, k) => <li key={k}><code>{i.layer} {i.rule}</code> {i.message}</li>)
                            : <li>See the automatic check results below.</li>}
                    </ul>
                    <p className="mt-2 text-sm text-red-800">You can still approve it if this is a false alarm: confirm below and explain in the comment.</p>
                </div>
            )}

            {/* Problem and solution */}
            <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
                <h2 className="font-semibold text-slate-900">Problem (as students see it)</h2>
                <MathPreview html={textToHtml(problem.content || "")} className="text-slate-800 leading-relaxed" />
                <h2 className="font-semibold text-slate-900 pt-2">Answer and solution</h2>
                {solutions.length === 0 ? <p className="text-sm text-red-700">No solution stored.</p> : solutions.map((s) => {
                    const [first, ...rest] = (s.content || "").split("\n");
                    return (
                        <div key={s.id} className="rounded-md bg-slate-50 p-4">
                            <div className="font-semibold text-slate-900">{first}</div>
                            {rest.join("\n").trim() && <MathPreview html={textToHtml(rest.join("\n").trim())} className="mt-2 text-sm text-slate-700 leading-relaxed" />}
                        </div>
                    );
                })}
            </section>

            {/* Automatic checks */}
            <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-slate-900">Automatic checks</h2>
                    <span className="text-xs text-slate-500">Last checked {when(v?.lastCheckedAt ?? null)}</span>
                </div>
                {layers.length === 0 ? <p className="text-sm text-slate-500">No results yet.</p> : layers.map((l) => (
                    <div key={l.layer} className="rounded-md border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="font-medium text-slate-800">{LAYER_NAMES[l.layer] ?? l.layer}</div>
                            <div className="flex items-center gap-2">
                                {!l.forCurrentContent && <span className="text-xs text-violet-700">earlier content</span>}
                                <Badge className={l.status === "fail" ? "bg-red-600 text-white" : l.status === "warn" ? "bg-amber-500 text-white" : "bg-emerald-600 text-white"}>
                                    {l.status === "fail" ? "Fail" : l.status === "warn" ? "Warning" : "Pass"}
                                </Badge>
                            </div>
                        </div>
                        {l.issues.length > 0 && (
                            <ul className="mt-2 space-y-1">
                                {l.issues.map((i, k) => (
                                    <li key={k} className={`rounded border px-2 py-1 text-sm ${SEVERITY_STYLE[i.severity] ?? ""}`}>
                                        <code className="mr-1">{i.rule}</code>{i.message}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ))}
            </section>

            {/* Review history */}
            <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-3">
                <h2 className="font-semibold text-slate-900">Review history <span className="text-sm font-normal text-slate-500">({reviews.length})</span></h2>
                {reviews.length === 0 ? <p className="text-sm text-slate-500">No reviews yet.</p> : (
                    <ol className="space-y-3">
                        {reviews.map((r) => (
                            <li key={r.id} className={`rounded-md border p-3 ${DECISION_STYLE[r.decision] ?? ""} ${r.forCurrentContent ? "" : "opacity-60"}`}>
                                <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                                    <div><span className="font-semibold">{r.reviewerName}</span> · {DECISION_LABEL[r.decision] ?? r.decision}
                                        {r.autoStatus === "failed" && r.decision === "approve" && <span className="ml-2 text-red-700">(automatic check had failed)</span>}
                                    </div>
                                    <div className="text-xs text-slate-500">{when(r.createdAt)}{!r.forCurrentContent && " · earlier version of the problem"}</div>
                                </div>
                                {r.comment && <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">{r.comment}</p>}
                            </li>
                        ))}
                    </ol>
                )}
            </section>

            {/* New review */}
            <section className="rounded-lg border border-slate-200 bg-white p-5 space-y-4">
                <div>
                    <h2 className="font-semibold text-slate-900">Your review</h2>
                    <p className="text-sm text-slate-500 mt-1">
                        {myLatest ? `Your last decision on this version: ${DECISION_LABEL[myLatest.decision]}. A new review replaces it in the count; both stay in the history.`
                            : "Reviews cannot be edited or deleted. To change your decision, add a new review."}
                    </p>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                    {DECISIONS.map((d) => (
                        <label key={d.key} className={`flex cursor-pointer gap-3 rounded-md border p-3 ${decision === d.key ? "border-slate-900 bg-slate-50" : "border-slate-200"}`}>
                            <input id={`decision-${d.key}`} type="radio" name="decision" value={d.key} checked={decision === d.key} onChange={() => setDecision(d.key)} className="mt-1" />
                            <span><span className="font-medium text-slate-900">{d.label}</span><span className="block text-xs text-slate-500">{d.hint}</span></span>
                        </label>
                    ))}
                </div>

                {approveBlocked && (
                    <p className="text-sm text-violet-800">Approval is not possible until the automatic check has run on the current content.</p>
                )}

                {needsAck && (
                    <label className="flex cursor-pointer gap-3 rounded-md border-2 border-red-300 bg-red-50 p-3 text-sm text-red-800">
                        <input id="acknowledge-failed" type="checkbox" checked={acknowledged} onChange={(e) => setAcknowledged(e.target.checked)} className="mt-0.5" />
                        <span>I checked every failed automatic check above and I am sure the problem is correct. I explain why in the comment.</span>
                    </label>
                )}

                <div>
                    <label htmlFor="review-comment" className="text-sm font-medium text-slate-800">
                        Comment {needsComment ? <span className="text-red-600">(required)</span> : <span className="text-slate-500">(optional)</span>}
                    </label>
                    <Textarea id="review-comment" value={comment} onChange={(e) => setComment(e.target.value)} rows={4} maxLength={5000}
                        placeholder={decision === "approve" ? "Optional note" : "What should change, or why?"} className="mt-1" />
                </div>

                {saveError && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{saveError}</div>}
                {saved && <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{saved}</div>}

                <Button onClick={submit} disabled={!canSubmit}>
                    {saving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}Save review
                </Button>
            </section>
        </div>
    );
}
