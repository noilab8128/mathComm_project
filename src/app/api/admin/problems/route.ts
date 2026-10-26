import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { BadRequest, asObject, asSolutions, createProblem, errorMessage } from '@/lib/adminProblemWrites';

// POST /api/admin/problems  { problem, solutions? } -> { data: created problem }
// Used by problemsAPI.create (admin problem editor).
export async function POST(req: Request) {
    // Checks user_roles in the database; the role inside the session token is not trusted.
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const data = await createProblem(asObject(body?.problem, 'problem'), asSolutions(body?.solutions));
        return NextResponse.json({ data }, { status: 201 });
    } catch (e) {
        const status = e instanceof BadRequest ? 400 : 500;
        if (status === 500) console.error('Admin create problem failed:', e);
        return NextResponse.json({ error: errorMessage(e) }, { status });
    }
}
