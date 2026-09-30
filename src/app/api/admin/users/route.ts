/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    try {
        const { data: usersData, error: usersError } = await supabaseAdmin.schema('next_auth').from('users').select('*');
        if (usersError) throw usersError;

        const { data: rolesData, error: rolesError } = await supabaseAdmin.from('user_roles').select('*');
        if (rolesError) throw rolesError;

        const { data: statsData, error: statsError } = await supabaseAdmin.from('user_stats').select('*');
        if (statsError) throw statsError;

        const roleMap = new Map(rolesData.map((r: any) => [r.user_id, r.role]));
        const statsMap = new Map(statsData.map((s: any) => [s.user_id, s]));

        const adminUsers = usersData.map((u: any) => {
            const stats = statsMap.get(u.id) || {};
            return {
                id: u.id,
                name: u.name || 'Unknown',
                email: u.email || '',
                image: u.image || '',
                role: roleMap.get(u.id) || 'user',
                createdAt: u.created_at || new Date().toISOString(),
                level: stats.current_level || 1,
                xp: stats.total_xp || 0,
                rp: stats.ranking_points || 0,
                tier: stats.tier || 'Bronze III',
                problems_solved: stats.problems_solved || 0
            };
        }).sort((a: any, b: any) => b.xp - a.xp); // Sort by XP descending by default

        return NextResponse.json({ users: adminUsers });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'admin') {
        return new NextResponse('Unauthorized', { status: 403 });
    }

    try {
        const { userId, newRole } = await req.json();

        if (newRole === 'admin') {
            const { error } = await supabaseAdmin
                .from('user_roles')
                .upsert({ user_id: userId, role: 'admin' }, { onConflict: 'user_id' });
            if (error) throw error;
        } else {
            const { error } = await supabaseAdmin
                .from('user_roles')
                .delete()
                .eq('user_id', userId);
            if (error) throw error;
        }

        return NextResponse.json({ success: true, newRole });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
