import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'discussions';

    // 1. Fetch posts
    const { data: posts, error: postsError } = await supabaseAdmin
      .from('community_posts')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (postsError) throw postsError;

    // 2. Fetch all authors
    const authorIds = Array.from(new Set(posts.map(p => p.author_id)));
    const { data: authors, error: authorsError } = await supabaseAdmin
      .schema('next_auth')
      .from('users')
      .select('id, name, image')
      .in('id', authorIds);

    if (authorsError) throw authorsError;
    const authorMap = new Map(authors?.map(a => [a.id, a]));

    // 3. Fetch likes and comments count
    const postIds = posts.map(p => p.id);
    const { data: likes } = await supabaseAdmin
      .from('community_likes')
      .select('post_id')
      .in('post_id', postIds);

    const { data: comments } = await supabaseAdmin
      .from('community_comments')
      .select('post_id')
      .in('post_id', postIds);

    const session = await getServerSession(authOptions);

    const enrichedPosts = posts.map(post => {
      const author = authorMap.get(post.author_id) || { name: 'Unknown', image: null };
      const postLikes = likes?.filter(l => l.post_id === post.id) || [];
      const postComments = comments?.filter(c => c.post_id === post.id) || [];
      
      const isLiked = session?.user?.id ? postLikes.some(l => l.user_id === session.user.id) : false;

      return {
        ...post,
        authorName: author.name,
        authorImage: author.image,
        likesCount: postLikes.length,
        commentsCount: postComments.length,
        isLiked
      };
    });

    return NextResponse.json({ posts: enrichedPosts });
  } catch (error: any) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content, category } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('community_posts')
      .insert([
        {
          title,
          content,
          category: category || 'discussions',
          author_id: session.user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ post: data });
  } catch (error: any) {
    console.error('Error creating post:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
