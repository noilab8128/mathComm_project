import { NextResponse } from 'next/server';
import { requireReviewer } from '@/lib/auth';
import { isAdminRole } from '@/lib/roles';
import { apiErrorMessage } from '@/lib/verification';
import {
    CHECK_WORKFLOWS, githubSettings, latestRun, setWorkflowEnabled, workflowState, type CheckWorkflow,
} from '@/lib/githubActions';

// GET  /api/admin/reviews/automation -> { configured, canChange, workflows: [{ key, name, schedule, state, enabled, run }] }
// POST /api/admin/reviews/automation { workflow: "regular" | "ai", enabled: boolean } -> turns the nightly check on or off
// Reviewers can see the state; only admins can change it. Turning a workflow off stops its nightly run and its manual
// runs (including the "Run automatic check" button) until it is turned on again.

export async function GET() {
    const who = await requireReviewer();
    if (!who) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const cfg = githubSettings();
    if (!cfg) return NextResponse.json({ configured: false, canChange: false, workflows: [] });
    try {
        const workflows = await Promise.all((Object.keys(CHECK_WORKFLOWS) as CheckWorkflow[]).map(async (key) => {
            const w = CHECK_WORKFLOWS[key];
            const [state, run] = await Promise.all([
                workflowState(cfg.token, cfg.repo, w.file),
                latestRun(cfg.token, cfg.repo, w.file).catch(() => null),
            ]);
            return { key, name: w.name, schedule: w.schedule, state, enabled: state === 'active', run };
        }));
        return NextResponse.json({ configured: true, canChange: isAdminRole(who.role), workflows });
    } catch (e) {
        console.error('Automation status failed:', e);
        return NextResponse.json({ error: apiErrorMessage(e, 'Failed to read the automatic checks') }, { status: 502 });
    }
}

export async function POST(req: Request) {
    const who = await requireReviewer();
    if (!who) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    if (!isAdminRole(who.role)) return NextResponse.json({ error: 'Only admins can turn automatic checks on or off.' }, { status: 403 });

    const cfg = githubSettings();
    if (!cfg) return NextResponse.json({ error: 'GITHUB_DISPATCH_TOKEN is not set on the server.' }, { status: 503 });

    const body = await req.json().catch(() => ({}));
    const key = body?.workflow as CheckWorkflow;
    if (!(key in CHECK_WORKFLOWS) || typeof body?.enabled !== 'boolean') {
        return NextResponse.json({ error: 'workflow must be "regular" or "ai", and enabled true or false' }, { status: 400 });
    }
    try {
        await setWorkflowEnabled(cfg.token, cfg.repo, CHECK_WORKFLOWS[key].file, body.enabled);
        console.info(`Automatic check ${key} turned ${body.enabled ? 'on' : 'off'} by ${who.userId}`);
        return NextResponse.json({ workflow: key, enabled: body.enabled });
    } catch (e) {
        console.error('Automation change failed:', e);
        return NextResponse.json({ error: apiErrorMessage(e, 'Failed to change the automatic check') }, { status: 502 });
    }
}
