import { useState, useEffect } from "react";

export interface QueuedProblem {
  id: string;
  title: string;
  difficulty: number;
  source?: string | null;
  xp: number;
  level?: string;
  content?: string;
  category_path?: string;
  tags?: string[];
}

export function useMyQueue() {
  const [queue, setQueue] = useState<QueuedProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQueue = async () => {
      try {
        const res = await fetch('/api/user/queue');
        if (res.ok) {
          const data = await res.json();
          setQueue(data);
        }
      } catch (err) {
        console.error('Failed to fetch queue:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchQueue();
  }, []);

  const addToQueue = async (p: QueuedProblem) => {
    if (queue.length >= 5) {
      alert("Your queue is full! (Max 5 problems)");
      return;
    }
    
    if (queue.some(q => q.id === p.id)) return;

    const prevQueue = [...queue];
    setQueue(prev => [...prev, p]);

    try {
      const res = await fetch('/api/user/queue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId: p.id }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Failed to add to queue");
        setQueue(prevQueue);
      }
    } catch (err) {
      console.error('Error adding to queue:', err);
      setQueue(prevQueue);
    }
  };

  const removeFromQueue = async (id: string) => {
    const prevQueue = [...queue];
    setQueue(prev => prev.filter(q => q.id !== id));

    try {
      const res = await fetch(`/api/user/queue?problemId=${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        console.error("Failed to remove from queue");
        setQueue(prevQueue);
      }
    } catch (err) {
      console.error('Error removing from queue:', err);
      setQueue(prevQueue);
    }
  };

  const isQueued = (id: string) => queue.some(q => q.id === id);

  return { queue, addToQueue, removeFromQueue, isQueued, isLoading };
}

export function useLikes() {
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [isLikeLoading, setIsLikeLoading] = useState(true);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await fetch('/api/user/like');
        if (res.ok) {
          const data = await res.json();
          if (data.error) {
             console.error('Server reported error:', data.error);
             // alert(`Database Error: ${data.error}`); // Optional: show to user
          }
          setLikedIds(new Set(data.likedIds || []));
        }
      } catch (err) {
        console.error('Failed to fetch likes:', err);
      } finally {
        setIsLikeLoading(false);
      }
    };
    fetchLikes();
  }, []);

  const toggleLike = async (problemId: string, onToggle?: (liked: boolean) => void) => {
    const isLiked = likedIds.has(problemId);
    
    // Optimistic update
    const nextIds = new Set(likedIds);
    if (isLiked) nextIds.delete(problemId);
    else nextIds.add(problemId);
    setLikedIds(nextIds);
    if (onToggle) onToggle(!isLiked);

    try {
      const res = await fetch('/api/user/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId }),
      });
      if (!res.ok) {
        // Rollback
        setLikedIds(likedIds);
        if (onToggle) onToggle(isLiked);
      }
    } catch (err) {
      console.error('Error toggling like:', err);
      // Rollback
      setLikedIds(likedIds);
      if (onToggle) onToggle(isLiked);
    }
  };

  return { likedIds, toggleLike, isLikeLoading };
}

export function useStarts() {
  const [startedIds, setStartedIds] = useState<Set<string>>(new Set());
  const [isStartLoading, setIsStartLoading] = useState(false);

  useEffect(() => {
    const fetchStarts = async () => {
      try {
        const res = await fetch('/api/user/start');
        if (res.ok) {
          const data = await res.json();
          setStartedIds(new Set(data.startedIds || []));
        }
      } catch (err) {
        console.error('Failed to fetch starts', err);
      }
    };
    fetchStarts();
  }, []);

  const markStarted = async (problemId: string, onStarted?: () => void) => {
    if (startedIds.has(problemId)) return;

    // Optimistic update
    const nextIds = new Set(startedIds);
    nextIds.add(problemId);
    setStartedIds(nextIds);
    if (onStarted) onStarted();

    try {
      const res = await fetch('/api/user/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemId }),
      });
      if (!res.ok) {
        // Rollback
        setStartedIds(startedIds);
      }
    } catch (err) {
      console.error('Failed to save start', err);
      setStartedIds(startedIds);
    }
  };

  const isStarted = (problemId: string) => startedIds.has(problemId);

  return { startedIds, markStarted, isStarted, isStartLoading };
}
