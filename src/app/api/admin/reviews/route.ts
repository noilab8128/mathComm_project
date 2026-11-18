import { NextResponse } from 'next/server';
import { requireReviewer } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiErrorMessage, contentHash, contestLabel, ladderPart, type HashSolution } from '@/lib/verification';

// GET /api/admin/reviews -> every problem with its verification and review state (admins and reviewers).
// Reads with the service key; problem_verification_status and problem_reviews have no public access.
export async function GET() {
    const who = await requireReviewer();
    if (!who) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const [problemsRes, solutionsRes, statusRes, myReviewsRes] = await Promise.all([
            supabaseAdmin.from('problems')
                .select('id, title, content, difficulty, level, tags, source, is_reviewed, created_at, updated_at'),
            supabaseAdmin.from('solutions').select('problem_id, content, sequence_order'),
            supabaseAdmin.from('problem_verification_status').select('*'),
            supabaseAdmin.from('problem_reviews')
                .select('problem_id, content_hash, decision, created_at')
                .eq('reviewer_id', who.userId),
        ]);
        for (const res of [problemsRes, solutionsRes, statusRes, myReviewsRes]) {
            if (res.error) throw res.error;
        }

        const solutionsBy = new Map<string, HashSolution[]>();
        for (const s of solutionsRes.data || []) {
            const list = solutionsBy.get(s.problem_id) || [];
            list.push({ content: s.content, sequence_order: s.sequence_order });
            solutionsBy.set(s.problem_id, list);
        }
        const statusBy = new Map((statusRes.data || []).map((s) => [s.problem_id, s]));
        const mineBy = new Map<string, { content_hash: string; decision: string; created_at: string }[]>();
        for (const r of myReviewsRes.data || []) {
            const list = mineBy.get(r.problem_id) || [];
            list.push(r);
            mineBy.set(r.problem_id, list);
        }

        const rows = (problemsRes.data || []).map((p) => {
            const hash = contentHash(p, solutionsBy.get(p.id) || []);
            const st = statusBy.get(p.id);
            const mine = (mineBy.get(p.id) || []).filter((r) => r.content_hash === hash)
                .sort((a, b) => a.created_at.localeCompare(b.created_at));
            const { ladder, part } = ladderPart(p.title);
            return {
                id: p.id,
                title: p.title,
                ladder,
                part,
                label: contestLabel(p.tags),
                source: p.source,
                difficulty: p.difficulty,
                isReviewed: p.is_reviewed,
                createdAt: p.created_at,
                // Automatic checks (scripts/verify/report.py --save)
                autoStatus: st?.auto_status ?? 'unverified',
                autoSummary: st?.auto_summary ?? {},
                lastCheckedAt: st?.last_checked_at ?? null,
                // The content changed after the last automatic check: run the check again before approving
                stale: !!st && st.content_hash !== hash,
                reviewStatus: st?.review_status ?? 'pending',
                approvals: st?.approvals ?? 0,
                requiredApprovals: st?.required_approvals ?? 1,
                lastReviewedAt: st?.last_reviewed_at ?? null,
                myDecision: mine.length ? mine[mine.length - 1].decision : null,
            };
        });

        return NextResponse.json({ me: { id: who.userId, role: who.role }, problems: rows });
    } catch (e) {
        console.error('Review list failed:', e);
        return NextResponse.json({ error: apiErrorMessage(e, 'Failed to load reviews') }, { status: 500 });
    }
}
