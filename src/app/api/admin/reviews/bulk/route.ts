import { NextResponse } from 'next/server';
import { requireReviewer } from '@/lib/auth';
import { apiErrorMessage } from '@/lib/verification';
import { MAX_COMMENT, addReview, loadProblem, myCurrentVerdict } from '@/lib/reviewActions';

// POST /api/admin/reviews/bulk { problemIds: string[], comment? } -> { results: [{ id, title, outcome, reason? }] }
// Bulk approval from the review list. Admins and reviewers only.
//
// Each problem gets its own review row (same rules as the single review page, src/lib/reviewActions.ts).
// Bulk approval is narrower than a single approval: only problems whose automatic check PASSED on their current
// content, that are waiting for review (pending / re-check), and that this reviewer has not approved yet. Warnings,
// failures, change requests and rejections need a look on the problem's own page.
// At most MAX_PER_REQUEST problems per call so a request stays inside the hosting time limit; the page sends batches.

const MAX_PER_REQUEST = 10;
const BULK_NOTE = 'Bulk approval from the review list';

type Outcome = { id: string; title: string | null; outcome: 'approved' | 'skipped' | 'error'; reason?: string };

export async function POST(req: Request) {
    const who = await requireReviewer();
    if (!who) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const body = await req.json().catch(() => ({}));
    const ids: unknown = body?.problemIds;
    if (!Array.isArray(ids) || ids.length === 0 || ids.some((v) => typeof v !== 'string' || !v)) {
        return NextResponse.json({ error: 'problemIds must be a non-empty list of problem ids' }, { status: 400 });
    }
    const unique = [...new Set(ids as string[])];
    if (unique.length > MAX_PER_REQUEST) {
        return NextResponse.json({ error: `At most ${MAX_PER_REQUEST} problems per request` }, { status: 400 });
    }
    const extra = typeof body?.comment === 'string' ? body.comment.trim() : '';
    const comment = extra ? `${BULK_NOTE}: ${extra}` : BULK_NOTE;
    if (comment.length > MAX_COMMENT) {
        return NextResponse.json({ error: `The comment is too long (at most ${MAX_COMMENT} characters).` }, { status: 400 });
    }

    const results: Outcome[] = [];
    // One at a time: each approval reads the reviews it is added to.
    for (const id of unique) {
        try {
            const loaded = await loadProblem(id);
            if (!loaded) { results.push({ id, title: null, outcome: 'skipped', reason: 'Problem not found' }); continue; }
            const title = loaded.problem.title ?? null;
            const { status, hash } = loaded;
            const skip = (reason: string) => results.push({ id, title, outcome: 'skipped', reason });

            if (!status || status.content_hash !== hash) { skip('Not checked on its current content'); continue; }
            if (status.auto_status !== 'passed') { skip(`Automatic check is "${status.auto_status}": review it on its own page`); continue; }
            if (status.review_status !== 'pending' && status.review_status !== 'needs_recheck') {
                skip(`Review status is "${status.review_status}": review it on its own page`); continue;
            }
            if ((await myCurrentVerdict(id, who.userId, hash)) === 'approve') { skip('You already approved it'); continue; }

            const result = await addReview(who.userId, id, { decision: 'approve', comment }, loaded);
            if (result.ok) results.push({ id, title, outcome: 'approved', reason: result.reviewStatus });
            else skip(result.error);
        } catch (e) {
            console.error('Bulk approval failed for', id, e);
            results.push({ id, title: null, outcome: 'error', reason: apiErrorMessage(e, 'Failed to save the review') });
        }
    }
    return NextResponse.json({ results });
}
