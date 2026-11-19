import { NextResponse } from 'next/server';
import { requireReviewer } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiErrorMessage } from '@/lib/verification';

// GET  /api/admin/reviews/recheck -> { configured, run, lastCheckedAt }   state of the automatic check
// POST /api/admin/reviews/recheck -> starts the "Verify problems" GitHub Actions workflow (.github/workflows/verify-problems.yml)
// Admins and reviewers only. Plan: Archive/docs/PROBLEM_VERIFICATION_PLAN_v2.md stage 6.
//
// Server settings (Netlify environment variables, and .env.local for local testing):
//   GITHUB_DISPATCH_TOKEN  fine-grained token of the repository owner: this repository only, "Actions: Read and write"
//   GITHUB_REPOSITORY      optional, default noilab8128/mathComm_project
// The token stays on the server; the browser only sees the run's state.

const WORKFLOW = 'verify-problems.yml';
const REF = 'main';

function settings() {
    const token = process.env.GITHUB_DISPATCH_TOKEN;
    const repo = process.env.GITHUB_REPOSITORY || 'noilab8128/mathComm_project';
    return token ? { token, repo } : null;
}

async function github(path: string, token: string, init?: RequestInit) {
    return fetch(`https://api.github.com${path}`, {
        ...init,
        headers: {
            Accept: 'application/vnd.github+json',
            Authorization: `Bearer ${token}`,
            'X-GitHub-Api-Version': '2022-11-28',
            ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        },
        cache: 'no-store',
    });
}

type Run = { status: string; conclusion: string | null; createdAt: string; url: string; event: string };

async function latestRun(token: string, repo: string): Promise<Run | null> {
    const res = await github(`/repos/${repo}/actions/workflows/${WORKFLOW}/runs?per_page=1`, token);
    if (!res.ok) throw new Error(`GitHub answered ${res.status} when reading the workflow runs`);
    const data = await res.json();
    const r = data.workflow_runs?.[0];
    return r ? { status: r.status, conclusion: r.conclusion, createdAt: r.created_at, url: r.html_url, event: r.event } : null;
}

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
