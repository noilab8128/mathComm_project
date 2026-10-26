import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { createHierarchyLink, deleteHierarchyLink, errorMessage } from '@/lib/adminProblemWrites';

// POST   /api/admin/problem-hierarchies  { parentProblemId, childProblemId, parentSolutionId, stageName,
//                                          sequenceOrder, depth } -> { data: link }   (problemHierarchiesAPI.create)
// DELETE /api/admin/problem-hierarchies  { parentProblemId, childProblemId }         (problemHierarchiesAPI.delete)
// Admin problem editor only.

const isId = (v: unknown): v is string => typeof v === 'string' && v.length > 0;

export async function POST(req: Request) {
    // Checks user_roles in the database; the role inside the session token is not trusted.
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const b = await req.json();
        if (!isId(b?.parentProblemId) || !isId(b?.childProblemId) ||
            !(b.parentSolutionId === null || isId(b.parentSolutionId)) ||
            typeof b.stageName !== 'string' || !Number.isFinite(b.sequenceOrder) || !Number.isFinite(b.depth)) {
            return NextResponse.json({ error: 'Invalid hierarchy link' }, { status: 400 });
        }
        const data = await createHierarchyLink({
            parentProblemId: b.parentProblemId,
            childProblemId: b.childProblemId,
            parentSolutionId: b.parentSolutionId,
            stageName: b.stageName,
            sequenceOrder: b.sequenceOrder,
            depth: b.depth,
        });
        return NextResponse.json({ data }, { status: 201 });
    } catch (e) {
        console.error('Admin create hierarchy link failed:', e);
        return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    if (!(await requireAdmin())) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const b = await req.json();
        if (!isId(b?.parentProblemId) || !isId(b?.childProblemId)) {
            return NextResponse.json({ error: 'parentProblemId and childProblemId are required' }, { status: 400 });
        }
        await deleteHierarchyLink(b.parentProblemId, b.childProblemId);
        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Admin delete hierarchy link failed:', e);
        return NextResponse.json({ error: errorMessage(e) }, { status: 500 });
    }
}
