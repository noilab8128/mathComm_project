import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    try {
        const userId = params.id;

        // Fetch Global Stats
        const { data: userStats, error: statsError } = await supabaseAdmin
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

        if (statsError) throw statsError;

        // Fetch Category Stats
        const { data: categoryStats, error: catError } = await supabaseAdmin
            .from('user_category_stats')
            .select('category_level1_id, ranking_points, tier, categories(name)')
            .eq('user_id', userId);

        if (catError) throw catError;

        // Format Category Stats
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedCategoryStats = ((categoryStats || []) as any[]).map((row) => ({
            category_id: row.category_level1_id as number,
            ranking_points: row.ranking_points as number,
            tier: row.tier as string,
            category_name: (Array.isArray(row.categories) ? row.categories[0]?.name : row.categories?.name) ?? null,
        }));

        // Fetch Recent Activity Logs (Last 20)
        const { data: activityLogs, error: logsError } = await supabaseAdmin
            .from('activity_logs')
            .select('id, action_type, xp_change, rp_change, description, created_at, problems(title)')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

        if (logsError) throw logsError;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedLogs = ((activityLogs || []) as any[]).map(log => ({
            id: log.id,
            action_type: log.action_type,
            xp_change: log.xp_change,
            rp_change: log.rp_change,
            description: log.description,
            created_at: log.created_at,
            problem_title: (Array.isArray(log.problems) ? log.problems[0]?.title : log.problems?.title) ?? null
        }));

        return NextResponse.json({
            stats: userStats || null,
            categoryStats: formattedCategoryStats,
            logs: formattedLogs
        });
    } catch (e: unknown) {
        const err = e as Error;
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
