import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = await params;
    
    // 1. Fetch post
    const { data: post, error: postError } = await supabaseAdmin
      .from('community_posts')
      .select('*')
      .eq('id', id)
      .single();

    if (postError) throw postError;

    // 2. Fetch author
    const { data: author } = await supabaseAdmin
      .schema('next_auth')
      .from('users')
      .select('name, image')
      .eq('id', post.author_id)
      .single();

    // 3. Increment views
    await supabaseAdmin
      .from('community_posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', id);

    // 4. Fetch likes count & status
    const session = await getServerSession(authOptions);
    const { data: likes } = await supabaseAdmin
      .from('community_likes')
      .select('user_id')
      .eq('post_id', id);
      
    const isLiked = session?.user?.id ? likes?.some(l => l.user_id === session.user.id) : false;

    return NextResponse.json({ 
      post: {
        ...post,
        views: (post.views || 0) + 1,
        authorName: author?.name || 'Unknown',
        authorImage: author?.image || null,
        likesCount: likes?.length || 0,
        isLiked
      }
    });
  } catch (error: any) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    // Verify ownership
    const { data: post } = await supabaseAdmin
      .from('community_posts')
      .select('author_id')
      .eq('id', id)
      .single();

    if (post?.author_id !== session.user.id) {
      // Allow admin deletion here if needed
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error } = await supabaseAdmin
      .from('community_posts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
