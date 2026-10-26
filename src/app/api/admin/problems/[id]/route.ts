import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { BadRequest, asObject, asSolutions, deleteProblem, errorMessage, updateProblem } from '@/lib/adminProblemWrites';

// PATCH  /api/admin/problems/[id]  { problem, solutions? } -> { data: updated problem }   (problemsAPI.update)
// DELETE /api/admin/problems/[id]                                                     (problemsAPI.delete)
// Admin problem editor only.

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    // Checks user_roles in the database; the role inside the session token is not trusted.
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const data = await updateProblem(id, asObject(body?.problem, 'problem'), asSolutions(body?.solutions));
        return NextResponse.json({ data });
    } catch (e) {
        const status = e instanceof BadRequest ? 400 : 500;
        if (status === 500) console.error('Admin update problem failed:', e);
        return NextResponse.json({ error: errorMessage(e) }, { status });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const { id } = await params;
        await deleteProblem(id);
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Admin delete problem failed:', e);
        return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
    }
}
