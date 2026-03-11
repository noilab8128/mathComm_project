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

        const roleMap = new Map(rolesData.map((r: any) => [r.user_id, r.role]));

        const adminUsers = usersData.map((u: any) => ({
            id: u.id,
            name: u.name || 'Unknown',
            email: u.email || '',
            image: u.image || '',
            role: roleMap.get(u.id) || 'user',
            createdAt: u.created_at || new Date().toISOString()
        })).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

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
