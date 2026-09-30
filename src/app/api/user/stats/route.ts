import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

// Mock data fallback in case DB tables are empty or missing
const MOCK_STATS = {
  hero: {
    totalXp: 12450,
    solvedCount: 142,
    currentStreak: 8,
    accuracy: 89.5
  },
  mastery: [
    { topic: "Algebra", score: 8.5 },
    { topic: "Geometry", score: 4.2 },
    { topic: "Number Theory", score: 6.8 },
    { topic: "Combinatorics", score: 5.1 },
    { topic: "Calculus", score: 2.0 },
    { topic: "Probability", score: 7.4 },
    { topic: "Logic", score: 9.1 },
    { topic: "Set Theory", score: 6.5 },
    { topic: "Matrices", score: 3.5 },
    { topic: "Statistics", score: 5.8 }
  ],
  history: [
    { date: "2026-03-01", Algebra: 5.0, Geometry: 3.0, "Number Theory": 4.0, Combinatorics: 3.0, Calculus: 0, Probability: 4.0, Logic: 5.0, "Set Theory": 4.0, Matrices: 0, Statistics: 2.0 },
    { date: "2026-03-10", Algebra: 6.5, Geometry: 3.5, "Number Theory": 5.5, Combinatorics: 4.0, Calculus: 1.0, Probability: 5.5, Logic: 7.0, "Set Theory": 5.0, Matrices: 1.0, Statistics: 3.5 },
    { date: "2026-03-20", Algebra: 7.5, Geometry: 4.0, "Number Theory": 6.0, Combinatorics: 4.5, Calculus: 1.5, Probability: 6.5, Logic: 8.5, "Set Theory": 6.0, Matrices: 2.5, Statistics: 4.5 },
    { date: "2026-03-30", Algebra: 8.5, Geometry: 4.2, "Number Theory": 6.8, Combinatorics: 5.1, Calculus: 2.0, Probability: 7.4, Logic: 9.1, "Set Theory": 6.5, Matrices: 3.5, Statistics: 5.8 }
  ],
  difficultyProgress: [
    { name: "Easy", solved: 45, attempted: 50 },
    { name: "Medium", solved: 60, attempted: 80 },
    { name: "Hard", solved: 25, attempted: 60 },
    { name: "Olympiad", solved: 12, attempted: 45 }
  ],
  activity: Array.from({ length: 90 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (89 - i));
    return {
      date: d.toISOString().split('T')[0],
      count: Math.random() > 0.4 ? Math.floor(Math.random() * 6) : 0
    };
  })
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // We will attempt to fetch real data from vw_user_category_levels 
    // and user_category_level_history. If tables don't exist yet, we fall back to mock.
    
    // 1. Fetch Mastery from vw_user_category_levels
    const { data: masteryData, error: masteryErr } = await supabase
      .from('vw_user_category_levels')
      .select('category_id, level_score, categories(name, level)')
      .eq('user_id', userId);
      
    // 2. Fetch History
    const { data: historyData, error: historyErr } = await supabase
      .from('user_category_level_history')
      .select('category_id, new_level_score, created_at, categories(name)')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    let finalStats = { ...MOCK_STATS };

    // Process Mastery if available
    if (!masteryErr && masteryData && masteryData.length > 0) {
      // Filter primarily for top-level categories or use all available
      const processedMastery = masteryData
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .filter((row: any) => row.categories?.level === 1 || row.categories?.level === 2)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((row: any) => ({
          topic: row.categories?.name || 'Unknown',
          score: Number(row.level_score)
        }));
        
      if (processedMastery.length > 0) {
        finalStats.mastery = processedMastery;
      }
    }

    // Process History if available
    if (!historyErr && historyData && historyData.length > 0) {
      // Group by date (YYYY-MM-DD)
      const historyByDate: Record<string, any> = {};
      
      historyData.forEach((row: any) => {
        const dateString = new Date(row.created_at).toISOString().split('T')[0];
        if (!historyByDate[dateString]) {
          historyByDate[dateString] = { date: dateString };
        }
        const topicName = row.categories?.name || 'Unknown';
        historyByDate[dateString][topicName] = Number(row.new_level_score);
      });
      
      const historyArray = Object.values(historyByDate).sort((a, b) => a.date.localeCompare(b.date));
      if (historyArray.length > 0) {
        finalStats.history = historyArray;
      }
    }

    // We can also compute activity dates from user_starts / user_likes as a proxy for submissions
    const { data: startsData } = await supabase
      .from('user_starts')
      .select('created_at')
      .eq('user_id', userId);
      
    if (startsData && startsData.length > 0) {
      const activityMap: Record<string, number> = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      startsData.forEach((row: any) => {
        const d = new Date(row.created_at).toISOString().split('T')[0];
        activityMap[d] = (activityMap[d] || 0) + 1;
      });
      // Convert to array
      const realActivity = Object.entries(activityMap).map(([date, count]) => ({ date, count }));
      if (realActivity.length > 0) {
        // Only override if we have real activity, otherwise let mock show the UI feature
        // Merge with a 90-day window so empty days show as 0
        const last90Days = Array.from({ length: 90 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (89 - i));
          const dateStr = d.toISOString().split('T')[0];
          return {
            date: dateStr,
            count: activityMap[dateStr] || 0
          };
        });
        finalStats.activity = last90Days;
        
        // Update hero metrics based on starts
        finalStats.hero.solvedCount = startsData.length; // rough placeholder
      }
    }

    return NextResponse.json(finalStats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
