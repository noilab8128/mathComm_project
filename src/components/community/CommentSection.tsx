"use client";

import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSession } from "next-auth/react";
import { Loader2, Reply } from "lucide-react";

interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  authorName: string;
  authorImage?: string;
}

export default function CommentSection({ postId }: { postId: string }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/community/posts/${postId}/comments`);
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (parentId: string | null, content: string) => {
    if (!session) {
      alert("Please log in to comment.");
      return;
    }
    if (!content.trim()) return;

    try {
      setIsSubmitting(true);
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parent_id: parentId }),
      });

      if (!res.ok) throw new Error("Failed to post comment");
      
      const { comment } = await res.json();
      setComments([...comments, comment]);
      
      if (parentId) {
        setReplyingTo(null);
        setReplyContent("");
      } else {
        setNewComment("");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to post comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Build comment tree
  const rootComments = comments.filter(c => !c.parent_id);
  const getReplies = (parentId: string) => comments.filter(c => c.parent_id === parentId);

  if (isLoading) {
    return <div className="py-8 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-gray-400" /></div>;
  }

  const renderComment = (comment: Comment, isReply = false) => {
    const replies = getReplies(comment.id);
    const isReplying = replyingTo === comment.id;

    return (
      <div key={comment.id} className={`flex gap-3 ${isReply ? 'mt-4' : 'mt-6'}`}>
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarImage src={comment.authorImage} />
          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
            {comment.authorName?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-sm text-gray-900">{comment.authorName}</span>
              <span className="text-xs text-gray-500">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <p className="text-sm text-gray-800 whitespace-pre-wrap">{comment.content}</p>
          </div>
          
          <div className="mt-1 flex items-center">
            <button 
              onClick={() => setReplyingTo(isReplying ? null : comment.id)}
              className="text-xs text-gray-500 hover:text-gray-900 flex items-center gap-1 font-medium px-2 py-1"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          </div>

          {/* Reply Form */}
          {isReplying && (
            <div className="mt-3 flex gap-3">
              <Avatar className="w-8 h-8 shrink-0">
                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">Me</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <Textarea 
                  placeholder="Write a reply..." 
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-[80px] text-sm"
                />
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={() => setReplyingTo(null)}>Cancel</Button>
                  <Button size="sm" onClick={() => handleSubmit(comment.id, replyContent)} disabled={isSubmitting || !replyContent.trim()}>
                    {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                    Post Reply
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Nested Replies */}
          {replies.length > 0 && (
            <div className="pl-4 border-l-2 border-gray-100 mt-2">
              {replies.map(reply => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Comments ({comments.length})
      </h3>

      {/* Main Comment Form */}
      <div className="flex gap-4 mb-8">
        <Avatar className="w-10 h-10 shrink-0">
          <AvatarImage src={session?.user?.image || undefined} />
          <AvatarFallback className="bg-indigo-100 text-indigo-700">
            {session?.user?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <Textarea 
            placeholder="What are your thoughts?" 
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[100px]"
          />
          <div className="flex justify-end">
            <Button 
              onClick={() => handleSubmit(null, newComment)} 
              disabled={isSubmitting || !newComment.trim()}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              {isSubmitting && !replyingTo ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Post Comment
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {rootComments.length === 0 ? (
          <p className="text-gray-500 text-center py-4 text-sm">No comments yet. Be the first to share your thoughts!</p>
        ) : (
          rootComments.map(c => renderComment(c))
        )}
      </div>
    </div>
  );
}
