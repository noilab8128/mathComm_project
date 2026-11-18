import { createHash } from "crypto";

/**
 * Problem verification and review helpers (server only). Plan: Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md.
 * Tables: supabase/sql/problem_verification.sql. The automatic checks run in scripts/verify (Python).
 */

// "withdraw" removes the reviewer's current verdict (approve, request_changes or reject); it is kept in the history.
export type ReviewDecision = "approve" | "request_changes" | "reject" | "comment" | "withdraw";
export const REVIEW_DECISIONS: ReviewDecision[] = ["approve", "request_changes", "reject", "comment", "withdraw"];

export type ReviewStatus = "pending" | "approved" | "changes_requested" | "rejected" | "needs_recheck";

// ---- content hash: must give exactly the same value as content_hash() in scripts/verify/checks.py -----------------
// Python: json.dumps(payload, ensure_ascii=False, sort_keys=True) -> separators ", " and ": ", keys sorted.

type Json = null | boolean | number | string | Json[] | { [key: string]: Json };

function pyJson(value: Json): string {
    if (value === null) return "null";
    if (typeof value === "boolean") return value ? "true" : "false";
    if (typeof value === "number") return Number.isInteger(value) ? String(value) : JSON.stringify(value);
    if (typeof value === "string") return JSON.stringify(value); // same escapes as Python with ensure_ascii=False
    if (Array.isArray(value)) return "[" + value.map(pyJson).join(", ") + "]";
    const keys = Object.keys(value).sort(compareCodePoints);
    return "{" + keys.map((k) => `${JSON.stringify(k)}: ${pyJson(value[k])}`).join(", ") + "}";
}

/** Python compares strings by code point; JavaScript's default by UTF-16 unit. */
function compareCodePoints(a: string, b: string): number {
    const x = Array.from(a), y = Array.from(b);
    for (let i = 0; i < Math.min(x.length, y.length); i++) {
        const d = x[i].codePointAt(0)! - y[i].codePointAt(0)!;
        if (d !== 0) return d;
    }
    return x.length - y.length;
}

export interface HashProblem {
    title: string | null;
    content: string | null;
    difficulty: number | null;
    level: string | null;
    tags: string[] | null;
}

export interface HashSolution {
    content: string | null;
    sequence_order: number | null;
}

export function contentHash(problem: HashProblem, solutions: HashSolution[]): string {
    const sorted = [...solutions].sort((a, b) =>
        ((a.sequence_order || 0) - (b.sequence_order || 0)) || compareCodePoints(a.content || "", b.content || ""));
    const payload: Json = {
        title: problem.title ?? null,
        content: problem.content ?? null,
        difficulty: problem.difficulty ?? null,
        level: problem.level ?? null,
        tags: problem.tags ?? null,
        solutions: sorted.map((s) => [s.sequence_order ?? null, s.content ?? null]),
    };
    return createHash("sha256").update(pyJson(payload), "utf8").digest("hex");
}

// ---- review status (plan §3.3) ---------------------------------------------------------------------------------------

export interface ReviewRow {
    reviewer_id: string | null;
    decision: ReviewDecision;
    content_hash: string;
    created_at: string;
}

/**
 * Status of a problem from its reviews of the current content. Each reviewer's latest verdict counts
 * (comments are not verdicts; a withdraw leaves that reviewer without a verdict). Order: any reject -> rejected;
 * any request_changes -> changes_requested; approvals >= required -> approved; otherwise the previous waiting
 * state (pending or needs_recheck).
 */
export function computeReviewStatus(
    reviews: ReviewRow[], currentHash: string, required: number, waiting: ReviewStatus = "pending",
): { status: ReviewStatus; approvals: number } {
    const latest = new Map<string, ReviewRow>();
    for (const r of reviews) {
        if (r.content_hash !== currentHash || !r.reviewer_id || r.decision === "comment") continue;
        const prev = latest.get(r.reviewer_id);
        if (!prev || r.created_at > prev.created_at) latest.set(r.reviewer_id, r);
    }
    const verdicts = [...latest.values()].map((r) => r.decision).filter((d) => d !== "withdraw");
    const approvals = verdicts.filter((d) => d === "approve").length;
    if (verdicts.includes("reject")) return { status: "rejected", approvals };
    if (verdicts.includes("request_changes")) return { status: "changes_requested", approvals };
    if (approvals >= Math.max(1, required)) return { status: "approved", approvals };
    const stillWaiting: ReviewStatus = waiting === "needs_recheck" ? "needs_recheck" : "pending";
    return { status: stillWaiting, approvals };
}

/** "Name — Step 3" -> { ladder: "Name", part: "Step 3" }, mirrors ladder_part() in scripts/verify/checks.py. */
/** The reviewer's current verdict on this content (approve, request_changes, reject), or null. */
export function currentVerdict(reviews: ReviewRow[], reviewerId: string, currentHash: string): ReviewDecision | null {
    let last: ReviewRow | null = null;
    for (const r of reviews) {
        if (r.reviewer_id !== reviewerId || r.content_hash !== currentHash || r.decision === "comment") continue;
        if (!last || r.created_at > last.created_at) last = r;
    }
    return last && last.decision !== "withdraw" ? last.decision : null;
}

export function ladderPart(title: string | null): { ladder: string | null; part: string | null } {
    if (!title || !title.includes(" — ")) return { ladder: null, part: null };
    const i = title.lastIndexOf(" — ");
    const part = title.slice(i + 3);
    if (part === "Challenge" || part === "Bridge" || /^Step \d+$/.test(part)) return { ladder: title.slice(0, i).trim(), part };
    return { ladder: null, part: null };
}

const CONTEST_LABELS = ["kangaroo", "kangaroo / mathcounts", "mathcounts", "amc 8 / mathcounts", "amc 8", "amc 8–10",
    "amc 10", "amc 12", "aime", "aime / junior olympiad"];

/** Contest label from the tags (last match), mirrors contest_label() in checks.py. */
export function contestLabel(tags: string[] | null): string | null {
    for (const t of [...(tags || [])].reverse()) {
        if (typeof t === "string" && CONTEST_LABELS.includes(t.trim().toLowerCase())) return t.trim();
    }
    return null;
}

/**
 * Message for an API error. Supabase errors are plain objects ({ message, code }), not Error instances, so
 * `e instanceof Error` alone hid them behind a generic text.
 */
export function apiErrorMessage(e: unknown, fallback: string): string {
    if (e && typeof e === "object") {
        const { message, code } = e as { message?: unknown; code?: unknown };
        if (code === "23514" && typeof message === "string" && message.includes("problem_reviews_decision_check")) {
            return "The database does not accept this decision yet. Run section 8 of supabase/sql/problem_verification.sql once.";
        }
        if (typeof message === "string" && message) return code ? `${message} (${code})` : message;
    }
    return fallback;
}

