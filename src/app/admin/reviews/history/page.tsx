"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, ArrowLeft } from "lucide-react";

// History of the automatic checks: GitHub Actions runs and the results each run saved (problem_verifications).
// Admins and reviewers. API: /api/admin/reviews/history.

interface GithubRun { workflow: "regular" | "ai"; name: string; status: string; conclusion: string | null; createdAt: string; url: string; event: string }
interface SavedRun {
    runId: string; kind: "ai" | "regular" | "other"; startedAt: string; models: string[]; problems: number;
    layers: Record<string, { pass: number; warn: number; fail: number }>;
    flagged: { problemId: string; title: string; layer: string; status: string }[];
}
interface History { github: { configured: boolean; runs: GithubRun[] }; runs: SavedRun[]; truncated: boolean }

const EVENT_LABEL: Record<string, string> = { schedule: "Nightly", workflow_dispatch: "Manual / button" };
const KIND_LABEL: Record<SavedRun["kind"], string> = { regular: "Automatic check", ai: "AI check", other: "Other" };

function result(run: GithubRun) {
    if (run.status !== "completed") return <Badge className="bg-sky-100 text-sky-800">{run.status}</Badge>;
    return run.conclusion === "success"
        ? <Badge className="bg-emerald-100 text-emerald-800">success</Badge>
        : <Badge className="bg-red-100 text-red-800">{run.conclusion}</Badge>;
}

export default function CheckHistoryPage() {
    const [data, setData] = useState<History | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState<string | null>(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/admin/reviews/history");
            const body = await res.json();
            if (!res.ok) throw new Error(body.error || "Failed to load");
            setData(body);
        } catch (e) {
            setError(e instanceof Error ? e.message : "Failed to load");
        } finally {
            setLoading(false);
        }
    }, []);
    useEffect(() => { load(); }, [load]);

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <Link href="/admin/reviews" className="inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                    <ArrowLeft className="w-4 h-4" /> Problem reviews
                </Link>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">Automatic check history</h1>
                <p className="text-sm text-slate-500">
                    Every run of the nightly checks, and what each run saved. A run saves results only for problems that are new,
                    changed, or got a different result, so a quiet night shows a run here but no saved results.
                </p>
                <button onClick={load} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-slate-300 bg-white text-sm text-slate-700 hover:bg-slate-100">
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {error && <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            {loading && !data && <p className="text-sm text-slate-500"><Loader2 className="inline w-4 h-4 animate-spin mr-2" />Loading…</p>}

            {data && (
                <>
                    <section className="rounded-lg border border-slate-200 bg-white">
                        <h2 className="px-4 pt-4 font-semibold text-slate-900">Runs (GitHub Actions)</h2>
                        {!data.github.configured ? (
                            <p className="p-4 text-sm text-slate-500">Not connected (GITHUB_DISPATCH_TOKEN is not set on the server).</p>
                        ) : data.github.runs.length === 0 ? (
                            <p className="p-4 text-sm text-slate-500">No runs yet.</p>
                        ) : (
                            <table className="w-full text-sm mt-2">
                                <thead className="text-left text-slate-500">
                                    <tr><th className="px-4 py-2 font-medium">Started</th><th className="px-4 py-2 font-medium">Check</th>
                                        <th className="px-4 py-2 font-medium">How</th><th className="px-4 py-2 font-medium">Result</th></tr>
                                </thead>
                                <tbody>
                                    {data.github.runs.map((r) => (
                                        <tr key={r.url} className="border-t border-slate-100">
                                            <td className="px-4 py-2 whitespace-nowrap">
                                                <a href={r.url} target="_blank" rel="noreferrer" className="underline">{new Date(r.createdAt).toLocaleString()}</a>
                                            </td>
                                            <td className="px-4 py-2">{r.name}</td>
                                            <td className="px-4 py-2 text-slate-600">{EVENT_LABEL[r.event] ?? r.event}</td>
                                            <td className="px-4 py-2">{result(r)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>

                    <section className="rounded-lg border border-slate-200 bg-white">
                        <h2 className="px-4 pt-4 font-semibold text-slate-900">Saved results</h2>
                        {data.runs.length === 0 ? <p className="p-4 text-sm text-slate-500">Nothing saved yet.</p> : (
                            <table className="w-full text-sm mt-2">
                                <thead className="text-left text-slate-500">
                                    <tr><th className="px-4 py-2 font-medium">Saved</th><th className="px-4 py-2 font-medium">Check</th>
                                        <th className="px-4 py-2 font-medium">Problems</th><th className="px-4 py-2 font-medium">Results per layer</th>
                                        <th className="px-4 py-2 font-medium">Flagged</th></tr>
                                </thead>
                                <tbody>
                                    {data.runs.map((r) => (
                                        <React.Fragment key={r.runId}>
                                            <tr className="border-t border-slate-100 align-top">
                                                <td className="px-4 py-2 whitespace-nowrap">{new Date(r.startedAt).toLocaleString()}</td>
                                                <td className="px-4 py-2">
                                                    {KIND_LABEL[r.kind]}
                                                    {r.models.length > 0 && <span className="block text-xs text-slate-500">{r.models.join(", ")}</span>}
                                                </td>
                                                <td className="px-4 py-2 tabular-nums">{r.problems}</td>
                                                <td className="px-4 py-2 text-xs text-slate-600 space-y-0.5">
                                                    {Object.entries(r.layers).sort().map(([layer, c]) => (
                                                        <div key={layer} className="tabular-nums">
                                                            <span className="font-medium text-slate-800">{layer}</span>{" "}
                                                            pass {c.pass}{c.warn ? <span className="text-amber-700"> · warn {c.warn}</span> : null}
                                                            {c.fail ? <span className="text-red-700"> · fail {c.fail}</span> : null}
                                                        </div>
                                                    ))}
                                                </td>
                                                <td className="px-4 py-2">
                                                    {r.flagged.length === 0 ? <span className="text-slate-400">-</span> : (
                                                        <button onClick={() => setOpen(open === r.runId ? null : r.runId)} className="text-sm underline text-amber-800">
                                                            {r.flagged.length} {open === r.runId ? "(hide)" : "(show)"}
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                            {open === r.runId && (
                                                <tr className="bg-amber-50/40">
                                                    <td colSpan={5} className="px-4 py-2">
                                                        <ul className="space-y-1 text-sm">
                                                            {r.flagged.map((f, k) => (
                                                                <li key={k}>
                                                                    <code className="mr-2 text-xs">{f.layer} {f.status}</code>
                                                                    <Link href={`/admin/reviews/${f.problemId}`} className="underline">{f.title}</Link>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        {data.truncated && <p className="px-4 pb-3 text-xs text-slate-500">Showing the most recent results only.</p>}
                    </section>
                </>
            )}
        </div>
    );
}
