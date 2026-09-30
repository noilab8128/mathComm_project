"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Heart, MessageSquare, Eye, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import CommentSection from "@/components/community/CommentSection";

interface PostDetail {
  id: string;
  title: string;
  content: string;
  category: string;
  author_id: string;
  views: number;
  created_at: string;
  authorName: string;
  authorImage?: string;
  likesCount: number;
  isLiked: boolean;
}

export default function PostDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  
  const [post, setPost] = useState<PostDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [resolvedParams.id]);

  const fetchPost = async () => {
    try {
      const res = await fetch(`/api/community/posts/${resolvedParams.id}`);
      if (!res.ok) {
        if (res.status === 404) router.push('/dashboard');
        throw new Error("Failed to fetch post");
      }
      const data = await res.json();
      setPost(data.post);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!session) {
      alert("Please log in to like this post.");
      return;
    }
    try {
      setIsLikeLoading(true);
      const res = await fetch(`/api/community/posts/${resolvedParams.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to toggle like");
      
      const { liked } = await res.json();
      setPost(prev => prev ? {
        ...prev,
        isLiked: liked,
        likesCount: prev.likesCount + (liked ? 1 : -1)
      } : null);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetch(`/api/community/posts/${resolvedParams.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert("Failed to delete post.");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  }

  if (!post) {
    return <div className="text-center py-12 text-gray-500">Post not found.</div>;
  }

  const isAuthor = session?.user?.id === post.author_id;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6">
      <Button 
        variant="ghost" 
        className="mb-6 text-gray-500 hover:text-gray-900 pl-0 hover:bg-transparent"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Community
      </Button>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 capitalize">
              {post.category}
            </Badge>
            {isAuthor && (
              <Button variant="ghost" size="sm" onClick={handleDelete} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-3 mb-8">
            <Avatar className="w-10 h-10 border border-gray-200">
              <AvatarImage src={post.authorImage} />
              <AvatarFallback className="bg-gray-100 text-gray-600">
                {post.authorName?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-gray-900">{post.authorName}</div>
              <div className="text-sm text-gray-500">
                {new Date(post.created_at).toLocaleString()}
              </div>
            </div>
          </div>

          <div className="prose max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
            {post.content}
          </div>

          <Separator className="my-8" />

          <div className="flex items-center gap-6">
            <button 
              onClick={handleLike}
              disabled={isLikeLoading}
              className={`flex items-center gap-2 transition-colors ${post.isLiked ? 'text-red-500 font-medium' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <Heart className={`h-5 w-5 ${post.isLiked ? 'fill-current' : ''}`} />
              <span>{post.likesCount} {post.likesCount === 1 ? 'Like' : 'Likes'}</span>
            </button>
            <div className="flex items-center gap-2 text-gray-500">
              <Eye className="h-5 w-5" />
              <span>{post.views} {post.views === 1 ? 'View' : 'Views'}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50/50 px-6 sm:px-8 py-6 border-t border-gray-100">
          <CommentSection postId={post.id} />
        </div>
      </div>
    </div>
  );
}
