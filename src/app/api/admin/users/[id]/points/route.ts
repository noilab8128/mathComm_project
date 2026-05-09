import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { calculateLevel, calculateTier } from '@/lib/progression';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    try {
        const userId = params.id;
        const { xp_change, rp_change, description } = await req.json();

        const xpChangeNum = parseInt(xp_change) || 0;
        const rpChangeNum = parseInt(rp_change) || 0;

        if (xpChangeNum === 0 && rpChangeNum === 0) {
            return NextResponse.json({ message: "No points to change" }, { status: 400 });
        }

        // 1. Fetch current stats
        const { data: currentStats, error: fetchError } = await supabaseAdmin
            .from('user_stats')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (fetchError && fetchError.code !== 'PGRST116') {
            // PGRST116 is row not found, which is fine, we can upsert
            throw fetchError;
        }

        const newXp = Math.max(0, (currentStats?.total_xp || 0) + xpChangeNum);
        const newRp = Math.max(0, (currentStats?.ranking_points || 0) + rpChangeNum);
        const newLevel = calculateLevel(newXp);
        const newTier = calculateTier(newRp);

        // 2. Upsert updated stats
        const newStats = {
            user_id: userId,
            total_xp: newXp,
            ranking_points: newRp,
            current_level: newLevel,
            tier: newTier,
            updated_at: new Date().toISOString()
        };

        const { error: upsertError } = await supabaseAdmin
            .from('user_stats')
            .upsert(newStats, { onConflict: 'user_id' });

        if (upsertError) throw upsertError;

        // 3. Log the activity
        const { error: logError } = await supabaseAdmin
            .from('activity_logs')
            .insert({
                user_id: userId,
                action_type: 'ADMIN_ADJUSTMENT',
                xp_change: xpChangeNum,
                rp_change: rpChangeNum,
                description: description || 'Admin manual point adjustment'
            });

        if (logError) throw logError;

        return NextResponse.json({ success: true, newStats });
    } catch (e: unknown) {
        const err = e as Error;
        console.error("Admin Point Adjustment Error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
