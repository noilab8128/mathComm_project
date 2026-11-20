import { NextResponse } from 'next/server';
import { requireReviewer } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { apiErrorMessage } from '@/lib/verification';
import { CHECK_WORKFLOWS, githubSettings, listRuns, type CheckWorkflow } from '@/lib/githubActions';

// GET /api/admin/reviews/history -> history of the automatic checks (admins and reviewers)
//   github: every recent run of the two GitHub Actions workflows (also runs that found nothing new)
//   runs:   results saved in problem_verifications, grouped by run: counts per layer and the flagged problems
// report.py saves a row only when a problem's content or result changed, so a quiet night has a GitHub run but no
// saved rows.

const MAX_ROWS = 5000;   // newest history rows read (several weeks of runs)
const MAX_FLAGGED = 50;  // flagged problems listed per run

type Row = { run_id: string | null; layer: string; status: 'pass' | 'warn' | 'fail'; model: string | null; created_at: string; problem_id: string };

export async function GET() {
    const who = await requireReviewer();
    if (!who) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    try {
        const cfg = githubSettings();
        const githubRuns = cfg
            ? (await Promise.all((Object.keys(CHECK_WORKFLOWS) as CheckWorkflow[]).map(async (key) =>
                (await listRuns(cfg.token, cfg.repo, CHECK_WORKFLOWS[key].file, 15).catch(() => []))
                    .map((r) => ({ ...r, workflow: key, name: CHECK_WORKFLOWS[key].name })))))
                .flat().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
            : [];

        const { data, error } = await supabaseAdmin.from('problem_verifications')
            .select('run_id, layer, status, model, created_at, problem_id')
            .order('created_at', { ascending: false }).limit(MAX_ROWS);
        if (error) throw error;
        const rows = (data || []) as Row[];

        type Run = {
            runId: string; kind: 'ai' | 'regular' | 'other'; startedAt: string; models: Set<string>; problems: Set<string>;
            layers: Record<string, { pass: number; warn: number; fail: number }>;
            flagged: { problemId: string; layer: string; status: string }[];
        };
        const runs = new Map<string, Run>();
        for (const r of rows) {
            const id = r.run_id || '(no run id)';
            let run = runs.get(id);
            if (!run) {
                run = {
                    runId: id, kind: id.startsWith('ai ') ? 'ai' : id.startsWith('report ') ? 'regular' : 'other',
                    startedAt: r.created_at, models: new Set(), problems: new Set(), layers: {}, flagged: [],
                };
                runs.set(id, run);
            }
            if (r.created_at < run.startedAt) run.startedAt = r.created_at;
            if (r.model) run.models.add(r.model);
            run.problems.add(r.problem_id);
            const counts = (run.layers[r.layer] ||= { pass: 0, warn: 0, fail: 0 });
            counts[r.status] = (counts[r.status] || 0) + 1;
            if (r.status !== 'pass' && run.flagged.length < MAX_FLAGGED) {
                run.flagged.push({ problemId: r.problem_id, layer: r.layer, status: r.status });
            }
        }

        const flaggedIds = [...new Set([...runs.values()].flatMap((r) => r.flagged.map((f) => f.problemId)))];
        const titles = new Map<string, string>();
        if (flaggedIds.length) {
            const { data: problems, error: pErr } = await supabaseAdmin.from('problems').select('id, title').in('id', flaggedIds);
            if (pErr) throw pErr;
            for (const p of problems || []) titles.set(p.id, p.title);
        }

        return NextResponse.json({
            github: { configured: !!cfg, runs: githubRuns },
            runs: [...runs.values()].sort((a, b) => b.startedAt.localeCompare(a.startedAt)).map((r) => ({
                runId: r.runId, kind: r.kind, startedAt: r.startedAt, models: [...r.models], problems: r.problems.size,
                layers: r.layers,
                flagged: r.flagged.map((f) => ({ ...f, title: titles.get(f.problemId) ?? '(deleted problem)' })),
            })),
            truncated: rows.length >= MAX_ROWS,
        });
    } catch (e) {
        console.error('Check history failed:', e);
        return NextResponse.json({ error: apiErrorMessage(e, 'Failed to load the check history') }, { status: 500 });
    }
}
