import { supabaseAdmin } from "./supabase-admin";
import {
    REVIEW_DECISIONS, computeReviewStatus, contentHash, currentVerdict,
    type ReviewDecision, type ReviewRow, type ReviewStatus,
} from "./verification";

/**
 * Saving a problem review (server only, service key). Shared by the single review page
 * (/api/admin/reviews/[id]) and bulk approval (/api/admin/reviews/bulk), so both follow the same rules.
 * Plan: Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md §3, §6 and §8.
 */

export const MAX_COMMENT = 5000;
export const DEFAULT_REQUIRED_APPROVALS = 1; // decision 4 (2026-11-18); scripts/verify/save.py uses the same value

export async function loadProblem(id: string) {
    const [problemRes, solutionsRes, statusRes] = await Promise.all([
        supabaseAdmin.from("problems")
            .select("id, title, content, difficulty, level, tags, source, category_path, is_reviewed, reviewer_id, created_at, updated_at")
            .eq("id", id).maybeSingle(),
        supabaseAdmin.from("solutions").select("id, content, sequence_order").eq("problem_id", id),
        supabaseAdmin.from("problem_verification_status").select("*").eq("problem_id", id).maybeSingle(),
    ]);
    for (const res of [problemRes, solutionsRes, statusRes]) {
        if (res.error) throw res.error;
    }
    if (!problemRes.data) return null;
    const solutions = (solutionsRes.data || []).sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));
    return {
        problem: problemRes.data,
        solutions,
        status: statusRes.data,
        hash: contentHash(problemRes.data, solutions),
    };
}

export type LoadedProblem = NonNullable<Awaited<ReturnType<typeof loadProblem>>>;

export type ReviewResult =
    | { ok: true; reviewStatus: ReviewStatus; approvals: number; requiredApprovals: number }
    | { ok: false; httpStatus: number; error: string };

/** This reviewer's current verdict on the problem's current content (approve, request_changes, reject) or null. */
export async function myCurrentVerdict(problemId: string, reviewerId: string, hash: string) {
    const { data, error } = await supabaseAdmin.from("problem_reviews")
        .select("reviewer_id, decision, content_hash, created_at").eq("problem_id", problemId).eq("reviewer_id", reviewerId);
    if (error) throw error;
    return currentVerdict((data || []) as ReviewRow[], reviewerId, hash);
}

/**
 * Adds one review (never edited or deleted), then recomputes the problem's review status and visibility.
 * Pass `loaded` when the caller already loaded the problem (bulk approval).
 */
export async function addReview(
    reviewerId: string,
    id: string,
    input: { decision: ReviewDecision; comment?: string; acknowledgeFailed?: boolean },
    loaded?: LoadedProblem | null,
): Promise<ReviewResult> {
    const decision = input.decision;
    const comment = (input.comment || "").trim();
    const acknowledgeFailed = input.acknowledgeFailed === true;

    if (!REVIEW_DECISIONS.includes(decision)) {
        return { ok: false, httpStatus: 400, error: "decision must be approve, request_changes, reject, comment or withdraw" };
    }
    if (comment.length > MAX_COMMENT) {
        return { ok: false, httpStatus: 400, error: `The comment is too long (at most ${MAX_COMMENT} characters).` };
    }
    if (decision !== "approve" && !comment) {
        return { ok: false, httpStatus: 400, error: "A comment is required for this decision." };
    }

    const found = loaded ?? await loadProblem(id);
    if (!found) return { ok: false, httpStatus: 404, error: "Problem not found" };
    const { status, hash } = found;
    const stale = !!status && status.content_hash !== hash;

    if (decision === "withdraw" && !(await myCurrentVerdict(id, reviewerId, hash))) {
        // Only a verdict this reviewer gave on the current content can be withdrawn.
        return { ok: false, httpStatus: 400, error: "You have no decision on this version of the problem to withdraw." };
    }

    if (decision === "approve") {
        // Approve only what the automatic checks have seen (decision 3; plan §3.4)
        if (!status || status.auto_status === "unverified") {
            return { ok: false, httpStatus: 409, error: "This problem has not been checked yet. Run the automatic check first (scripts/verify/report.py --save)." };
        }
        if (stale) {
            return { ok: false, httpStatus: 409, error: "The problem changed after the last automatic check. Run the check again before approving (scripts/verify/report.py --save)." };
        }
        // Decision 7: a problem whose automatic check failed can be approved, with a comment and an explicit
        // confirmation that the reviewer looked at the failed checks.
        if (status.auto_status === "failed" && (!comment || !acknowledgeFailed)) {
            return { ok: false, httpStatus: 400, error: "The automatic check failed. Confirm that you checked the failures and explain why you approve in the comment." };
        }
    }
    // Decision 6 (author may review own problem when 1 approval is needed; with 2, another reviewer must approve)
    // needs to know the author. Problems do not record their author yet, so this is checked when Challenges move
    // to 2 approvals (plan §8, decision 4).

    const { error: insertError } = await supabaseAdmin.from("problem_reviews").insert({
        problem_id: id,
        reviewer_id: reviewerId,
        decision,
        comment: comment || null,
        content_hash: hash,
        auto_status: status && !stale ? status.auto_status : "unverified",
    });
    if (insertError) throw insertError;

    const { data: allReviews, error: reviewsError } = await supabaseAdmin.from("problem_reviews")
        .select("reviewer_id, decision, content_hash, created_at").eq("problem_id", id);
    if (reviewsError) throw reviewsError;

    const required = status?.required_approvals ?? DEFAULT_REQUIRED_APPROVALS;
    const waiting: ReviewStatus = status?.review_status === "needs_recheck" ? "needs_recheck" : "pending";
    const { status: reviewStatus, approvals } = computeReviewStatus(allReviews as ReviewRow[], hash, required, waiting);
    const now = new Date().toISOString();

    if (status) {
        const { error } = await supabaseAdmin.from("problem_verification_status")
            .update({ review_status: reviewStatus, approvals, last_reviewed_at: now, updated_at: now })
            .eq("problem_id", id);
        if (error) throw error;
    } else {
        // Not checked yet: keep the review state anyway; the automatic check fills in the rest later
        const { error } = await supabaseAdmin.from("problem_verification_status").insert({
            problem_id: id, content_hash: hash, auto_status: "unverified", review_status: reviewStatus,
            approvals, required_approvals: required, last_reviewed_at: now, updated_at: now,
        });
        if (error) throw error;
    }

    // Visibility (decision 2 and 3): approved -> shown; rejected -> hidden. Other states keep the current value,
    // so a published problem stays visible while changes are requested. Withdrawing the approval that made a
    // problem approved hides it again (it was approved by mistake).
    // Who approved is kept in problem_reviews. problems.reviewer_id is not set: older schema notes link it to
    // auth.users, while accounts here live in next_auth.users.
    if (reviewStatus === "approved") {
        const { error } = await supabaseAdmin.from("problems").update({ is_reviewed: true }).eq("id", id);
        if (error) throw error;
    } else if (reviewStatus === "rejected" || (decision === "withdraw" && status?.review_status === "approved")) {
        const { error } = await supabaseAdmin.from("problems").update({ is_reviewed: false }).eq("id", id);
        if (error) throw error;
    }

    return { ok: true, reviewStatus, approvals, requiredApprovals: required };
}
