import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    const session = await getServerSession(authOptions);
    // @ts-expect-error - Custom role property
    if (session?.user?.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    try {
        const { count: totalUsers, error: usersError } = await supabaseAdmin
            .schema('next_auth')
            .from('users')
            .select('*', { count: 'exact', head: true });
        if (usersError) throw usersError;

        const { count: activeProblems, error: problemsError } = await supabaseAdmin
            .from('problems')
            .select('*', { count: 'exact', head: true });
        if (problemsError) throw problemsError;

        const { count: publishedNotices, error: noticesError } = await supabaseAdmin
            .from('notices')
            .select('*', { count: 'exact', head: true })
            .eq('is_published', true);
        if (noticesError) throw noticesError;

        return NextResponse.json({
            totalUsers: totalUsers || 0,
            activeProblems: activeProblems || 0,
            publishedNotices: publishedNotices || 0,
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
