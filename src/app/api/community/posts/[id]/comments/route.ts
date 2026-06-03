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
    const { id: post_id } = await params;

    // Fetch comments
    const { data: comments, error: commentsError } = await supabaseAdmin
      .from('community_comments')
      .select('*')
      .eq('post_id', post_id)
      .order('created_at', { ascending: true });

    if (commentsError) throw commentsError;

    // Fetch authors
    const authorIds = Array.from(new Set(comments.map(c => c.author_id)));
    let authorMap = new Map();
    if (authorIds.length > 0) {
      const { data: authors } = await supabaseAdmin
        .schema('next_auth')
        .from('users')
        .select('id, name, image')
        .in('id', authorIds);
      
      authorMap = new Map(authors?.map(a => [a.id, a]));
    }

    const enrichedComments = comments.map(c => {
      const author = authorMap.get(c.author_id) || { name: 'Unknown', image: null };
      return {
        ...c,
        authorName: author.name,
        authorImage: author.image
      };
    });

    return NextResponse.json({ comments: enrichedComments });
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { id: post_id } = await params;
    const { content, parent_id } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('community_comments')
      .insert([
        {
          post_id,
          content,
          parent_id: parent_id || null,
          author_id: session.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Fetch newly created comment's author info to return
    const { data: author } = await supabaseAdmin
      .schema('next_auth')
      .from('users')
      .select('name, image')
      .eq('id', session.user.id)
      .single();

    return NextResponse.json({ 
      comment: {
        ...data,
        authorName: author?.name || 'Unknown',
        authorImage: author?.image || null
      } 
    });
  } catch (error: any) {
    console.error('Error creating comment:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
