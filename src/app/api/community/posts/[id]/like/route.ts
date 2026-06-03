import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: post_id } = await params;
    const user_id = session.user.id;

    // Check if already liked
    const { data: existingLike } = await supabaseAdmin
      .from('community_likes')
      .select('id')
      .eq('post_id', post_id)
      .eq('user_id', user_id)
      .single();

    if (existingLike) {
      // Unlike
      await supabaseAdmin
        .from('community_likes')
        .delete()
        .eq('id', existingLike.id);
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await supabaseAdmin
        .from('community_likes')
        .insert([{ post_id, user_id }]);
      return NextResponse.json({ liked: true });
    }
  } catch (error: any) {
    console.error('Error toggling like:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
