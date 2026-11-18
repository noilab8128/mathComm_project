import { NextResponse } from 'next/server';
import { requireReviewer } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import {
    REVIEW_DECISIONS, computeReviewStatus, contentHash, contestLabel, ladderPart,
    type ReviewDecision, type ReviewRow, type ReviewStatus,
} from '@/lib/verification';

// GET  /api/admin/reviews/[id] -> problem, automatic check results, and the full review history
// POST /api/admin/reviews/[id] { decision, comment?, acknowledgeFailed? } -> add a review (never edited or deleted)
// Admins and reviewers only. Plan: Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md §3 and §6.

const MAX_COMMENT = 5000;
const DEFAULT_REQUIRED_APPROVALS = 1; // decision 4 (2026-11-18); scripts/verify/save.py uses the same value

async function loadProblem(id: string) {
    const [problemRes, solutionsRes, statusRes] = await Promise.all([
        supabaseAdmin.from('problems')
            .select('id, title, content, difficulty, level, tags, source, category_path, is_reviewed, reviewer_id, created_at, updated_at')
            .eq('id', id).maybeSingle(),
        supabaseAdmin.from('solutions').select('id, content, sequence_order').eq('problem_id', id),
        supabaseAdmin.from('problem_verification_status').select('*').eq('problem_id', id).maybeSingle(),
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

async function reviewerNames(ids: string[]) {
    const unique = [...new Set(ids.filter(Boolean))];
    if (!unique.length) return new Map<string, string>();
    const { data } = await supabaseAdmin.schema('next_auth').from('users')
        .select('id, name, nickname, email').in('id', unique);
    return new Map((data || []).map((u) => [
        u.id, u.nickname || u.name || (u.email ? String(u.email).split('@')[0] : 'Reviewer'),
    ]));
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const who = await requireReviewer();
    if (!who) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id } = await params;
        const loaded = await loadProblem(id);
        if (!loaded) return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        const { problem, solutions, status, hash } = loaded;

        const [checksRes, reviewsRes] = await Promise.all([
            supabaseAdmin.from('problem_verifications').select('*').eq('problem_id', id)
                .order('created_at', { ascending: false }).limit(100),
            supabaseAdmin.from('problem_reviews').select('*').eq('problem_id', id)
                .order('created_at', { ascending: true }),
        ]);
        if (checksRes.error) throw checksRes.error;
        if (reviewsRes.error) throw reviewsRes.error;

        // Latest result per layer (L0 format, L1 source comparison, later L2-L6 AI checks)
        const latestByLayer = new Map<string, (typeof checksRes.data)[number]>();
        for (const c of checksRes.data || []) {
            if (!latestByLayer.has(c.layer)) latestByLayer.set(c.layer, c);
        }
        const layers = [...latestByLayer.values()].sort((a, b) => a.layer.localeCompare(b.layer)).map((c) => ({
            layer: c.layer,
            status: c.status,
            issues: (c.details?.issues || []) as { rule: string; severity: string; message: string }[],
            checkedAt: c.created_at,
            forCurrentContent: c.content_hash === hash,
        }));

        const names = await reviewerNames((reviewsRes.data || []).map((r) => r.reviewer_id));
        const reviews = (reviewsRes.data || []).map((r) => ({
            id: r.id,
            reviewerId: r.reviewer_id,
            reviewerName: r.reviewer_id ? names.get(r.reviewer_id) || 'Reviewer' : '(removed account)',
            decision: r.decision,
            comment: r.comment,
            autoStatus: r.auto_status,
            createdAt: r.created_at,
            forCurrentContent: r.content_hash === hash,
        }));

        const { ladder, part } = ladderPart(problem.title);
        return NextResponse.json({
            me: { id: who.userId, role: who.role },
            problem: { ...problem, ladder, part, label: contestLabel(problem.tags) },
            solutions,
            verification: status ? {
                autoStatus: status.auto_status,
                autoSummary: status.auto_summary,
                reviewStatus: status.review_status,
                approvals: status.approvals,
                requiredApprovals: status.required_approvals,
                lastCheckedAt: status.last_checked_at,
                lastReviewedAt: status.last_reviewed_at,
                stale: status.content_hash !== hash,
            } : null,
            layers,
            reviews,
        });
    } catch (e) {
        console.error('Review detail failed:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to load the problem' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const who = await requireReviewer();
    if (!who) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const decision = body?.decision as ReviewDecision;
        const comment = typeof body?.comment === 'string' ? body.comment.trim() : '';
        const acknowledgeFailed = body?.acknowledgeFailed === true;

        if (!REVIEW_DECISIONS.includes(decision)) {
            return NextResponse.json({ error: 'decision must be approve, request_changes, reject or comment' }, { status: 400 });
        }
        if (comment.length > MAX_COMMENT) {
            return NextResponse.json({ error: `The comment is too long (at most ${MAX_COMMENT} characters).` }, { status: 400 });
        }
        if (decision !== 'approve' && !comment) {
            return NextResponse.json({ error: 'A comment is required for this decision.' }, { status: 400 });
        }

        const loaded = await loadProblem(id);
        if (!loaded) return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
        const { status, hash } = loaded;
        const stale = !!status && status.content_hash !== hash;

        if (decision === 'approve') {
            // Approve only what the automatic checks have seen (decision 3; plan §3.4)
            if (!status || status.auto_status === 'unverified') {
                return NextResponse.json({ error: 'This problem has not been checked yet. Run the automatic check first (scripts/verify/report.py --save).' }, { status: 409 });
            }
            if (stale) {
                return NextResponse.json({ error: 'The problem changed after the last automatic check. Run the check again before approving (scripts/verify/report.py --save).' }, { status: 409 });
            }
            // Decision 7: a problem whose automatic check failed can be approved, with a comment and an explicit
            // confirmation that the reviewer looked at the failed checks.
            if (status.auto_status === 'failed' && (!comment || !acknowledgeFailed)) {
                return NextResponse.json({ error: 'The automatic check failed. Confirm that you checked the failures and explain why you approve in the comment.' }, { status: 400 });
            }
        }
        // Decision 6 (author may review own problem when 1 approval is needed; with 2, another reviewer must approve)
        // needs to know the author. Problems do not record their author yet, so this is checked when Challenges move
        // to 2 approvals (plan §8, decision 4).

        const { error: insertError } = await supabaseAdmin.from('problem_reviews').insert({
            problem_id: id,
            reviewer_id: who.userId,
            decision,
            comment: comment || null,
            content_hash: hash,
            auto_status: status && !stale ? status.auto_status : 'unverified',
        });
        if (insertError) throw insertError;

        const { data: allReviews, error: reviewsError } = await supabaseAdmin.from('problem_reviews')
            .select('reviewer_id, decision, content_hash, created_at').eq('problem_id', id);
        if (reviewsError) throw reviewsError;

        const required = status?.required_approvals ?? DEFAULT_REQUIRED_APPROVALS;
        const waiting: ReviewStatus = status?.review_status === 'needs_recheck' ? 'needs_recheck' : 'pending';
        const { status: reviewStatus, approvals } = computeReviewStatus(allReviews as ReviewRow[], hash, required, waiting);
        const now = new Date().toISOString();

        if (status) {
            const { error } = await supabaseAdmin.from('problem_verification_status')
                .update({ review_status: reviewStatus, approvals, last_reviewed_at: now, updated_at: now })
                .eq('problem_id', id);
            if (error) throw error;
        } else {
            // Not checked yet: keep the review state anyway; the automatic check fills in the rest later
            const { error } = await supabaseAdmin.from('problem_verification_status').insert({
                problem_id: id, content_hash: hash, auto_status: 'unverified', review_status: reviewStatus,
                approvals, required_approvals: required, last_reviewed_at: now, updated_at: now,
            });
            if (error) throw error;
        }

        // Visibility (decision 2 and 3): approved -> shown; rejected -> hidden. Other states keep the current value,
        // so a published problem stays visible while changes are requested.
        // Who approved is kept in problem_reviews. problems.reviewer_id is not set: older schema notes link it to
        // auth.users, while accounts here live in next_auth.users.
        if (reviewStatus === 'approved') {
            const { error } = await supabaseAdmin.from('problems').update({ is_reviewed: true }).eq('id', id);
            if (error) throw error;
        } else if (reviewStatus === 'rejected') {
            const { error } = await supabaseAdmin.from('problems').update({ is_reviewed: false }).eq('id', id);
            if (error) throw error;
        }

        return NextResponse.json({ reviewStatus, approvals, requiredApprovals: required });
    } catch (e) {
        console.error('Review save failed:', e);
        return NextResponse.json({ error: e instanceof Error ? e.message : 'Failed to save the review' }, { status: 500 });
    }
}
