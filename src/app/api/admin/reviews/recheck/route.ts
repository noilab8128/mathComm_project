import { NextResponse } from 'next/server';
import { requireReviewer } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiErrorMessage } from '@/lib/verification';
import { CHECK_WORKFLOWS, github, githubSettings, latestRun as latestWorkflowRun } from '@/lib/githubActions';

// GET  /api/admin/reviews/recheck -> { configured, run, lastCheckedAt }   state of the automatic check
// POST /api/admin/reviews/recheck -> starts the "Verify problems" GitHub Actions workflow (.github/workflows/verify-problems.yml)
// Admins and reviewers only. Plan: Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md stage 6.
//
// GitHub settings and calls: src/lib/githubActions.ts. The token stays on the server; the browser only sees the run's state.

const WORKFLOW = CHECK_WORKFLOWS.regular.file;
const REF = 'main';
const settings = githubSettings;
const latestRun = (token: string, repo: string) => latestWorkflowRun(token, repo, WORKFLOW);

async function lastCheckedAt(): Promise<string | null> {
    const { data, error } = await supabaseAdmin.from('problem_verification_status')
        .select('last_checked_at').order('last_checked_at', { ascending: false, nullsFirst: false }).limit(1);
    if (error) throw error;
    return (data?.[0]?.last_checked_at as string | undefined) ?? null;
}

export async function GET() {
    const who = await requireReviewer();
    if (!who) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const cfg = settings();
        const [run, checkedAt] = await Promise.all([
            cfg ? latestRun(cfg.token, cfg.repo).catch((e) => { console.error('Recheck status failed:', e); return null; }) : null,
            lastCheckedAt(),
        ]);
        return NextResponse.json({ configured: !!cfg, run, lastCheckedAt: checkedAt });
    } catch (e) {
        console.error('Recheck status failed:', e);
        return NextResponse.json({ error: apiErrorMessage(e, 'Failed to read the check status') }, { status: 500 });
    }
}

export async function POST() {
    const who = await requireReviewer();
    if (!who) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const cfg = settings();
    if (!cfg) {
        return NextResponse.json({ error: 'The automatic check is not connected yet (GITHUB_DISPATCH_TOKEN is not set on the server).' }, { status: 503 });
    }
    try {
        // One run at a time: a run that is queued or running already covers this request.
        const run = await latestRun(cfg.token, cfg.repo);
        if (run && run.status !== 'completed') {
            return NextResponse.json({ error: 'A check is already running. It takes about two minutes.', run }, { status: 409 });
        }
        const res = await github(`/repos/${cfg.repo}/actions/workflows/${WORKFLOW}/dispatches`, cfg.token, {
            method: 'POST',
            // Public logs: no names or emails, only that the review page asked.
            body: JSON.stringify({ ref: REF, inputs: { requested_by: `review page (${who.role})` } }),
        });
        if (res.status !== 204) {
            const text = await res.text().catch(() => '');
            console.error('Recheck dispatch failed:', res.status, text.slice(0, 300));
            return NextResponse.json({ error: `GitHub refused to start the check (${res.status}). Check the token and its permissions.` }, { status: 502 });
        }
        return NextResponse.json({ started: true }, { status: 202 });
    } catch (e) {
        console.error('Recheck dispatch failed:', e);
        return NextResponse.json({ error: apiErrorMessage(e, 'Failed to start the check') }, { status: 500 });
    }
}
