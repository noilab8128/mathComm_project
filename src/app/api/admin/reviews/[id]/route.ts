import { NextResponse } from 'next/server';
import { requireReviewer } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiErrorMessage, contestLabel, ladderPart, type ReviewDecision } from '@/lib/verification';
import { addReview, loadProblem } from '@/lib/reviewActions';

// GET  /api/admin/reviews/[id] -> problem, automatic check results, and the full review history
// POST /api/admin/reviews/[id] { decision, comment?, acknowledgeFailed? } -> add a review (never edited or deleted)
//      decision: approve | request_changes | reject | comment | withdraw (removes your current verdict)
// Admins and reviewers only. Plan: Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md §3 and §6.

// Saving rules live in src/lib/reviewActions.ts (shared with bulk approval).

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
        return NextResponse.json({ error: apiErrorMessage(e, 'Failed to load the problem') }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const who = await requireReviewer();
    if (!who) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const { id } = await params;
        const body = await req.json().catch(() => ({}));
        const result = await addReview(who.userId, id, {
            decision: body?.decision as ReviewDecision,
            comment: typeof body?.comment === 'string' ? body.comment : '',
            acknowledgeFailed: body?.acknowledgeFailed === true,
        });
        if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.httpStatus });
        const { reviewStatus, approvals, requiredApprovals } = result;
        return NextResponse.json({ reviewStatus, approvals, requiredApprovals });
    } catch (e) {
        console.error('Review save failed:', e);
        return NextResponse.json({ error: apiErrorMessage(e, 'Failed to save the review') }, { status: 500 });
    }
}
