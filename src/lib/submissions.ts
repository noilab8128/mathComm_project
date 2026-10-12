// Saving a graded answer: the submission row, XP/RP, the activity log, user_stats and user_category_stats.
// Shared by /api/grade-solution (written solutions, AI grading) and /api/check-answer (short answers).
// Moved here unchanged from grade-solution; the only new option is `rewardRepeatSolves`.

import { createClient } from "@supabase/supabase-js";
import { calculateRewards, calculateLevel, calculateTier } from "@/lib/progression";

// Admin client to bypass RLS for logging submissions
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export interface SubmissionInput {
  userId: string;
  problemId?: string | null;
  submittedAnswer: string;
  gradingResult: unknown;
  totalScore: number;
  isCorrect: boolean;
  /**
   * true (written solutions, unchanged behaviour): every submission updates the stats.
   * false (short answers): once the user has solved the problem, later submissions are saved but give no XP/RP
   * and do not change user_stats again.
   */
  rewardRepeatSolves?: boolean;
  /**
   * true (written solutions, unchanged behaviour): a wrong answer still gives a small attempt XP.
   * false (short answers): wrong answers count as attempts but give no XP, since guessing a number costs nothing.
   */
  rewardWrongAnswers?: boolean;
}

export interface SubmissionOutcome {
  saved: boolean;
  alreadySolved: boolean;
  xpEarned: number;
  rpEarned: number;
}

export async function recordSubmission({
  userId,
  problemId,
  submittedAnswer,
  gradingResult,
  totalScore,
  isCorrect,
  rewardRepeatSolves = true,
  rewardWrongAnswers = true,
}: SubmissionInput): Promise<SubmissionOutcome> {
  // 1. Fetch Problem Details for XP/RP scaling
  let difficulty = 1;
  let categoryLevel1: number | null = null;
  let isFirstConqueror = false;
  let alreadySolved = false;

  if (problemId) {
    const { data: problemData } = await adminSupabase
      .from("problems")
      .select("difficulty, category_level1")
      .eq("id", problemId)
      .single();

    if (problemData) {
      difficulty = problemData.difficulty || 1;
      categoryLevel1 = problemData.category_level1;

      if (isCorrect) {
        // Check first conqueror
        const { count } = await adminSupabase
          .from("user_submissions")
          .select("id", { count: "exact", head: true })
          .eq("problem_id", problemId)
          .eq("is_correct", true);

        isFirstConqueror = (count || 0) < 3;
      }
    }

    if (!rewardRepeatSolves) {
      const { count } = await adminSupabase
        .from("user_submissions")
        .select("id", { count: "exact", head: true })
        .eq("problem_id", problemId)
        .eq("user_id", userId)
        .eq("is_correct", true);
      alreadySolved = (count || 0) > 0;
    }
  }

  // 2. Calculate XP/RP
  const skipStats = alreadySolved && !rewardRepeatSolves;
  const { xpEarned, rpEarned } =
    skipStats || (!isCorrect && !rewardWrongAnswers)
      ? { xpEarned: 0, rpEarned: 0 }
      : calculateRewards(difficulty, isCorrect, isFirstConqueror);

  // 3. Save Submission
  const { error: dbError } = await adminSupabase.from("user_submissions").insert({
    user_id: userId,
    problem_id: problemId || null,
    submitted_answer: submittedAnswer,
    grading_result: gradingResult,
    total_score: totalScore,
    is_correct: isCorrect,
  });

  if (dbError) {
    console.error("[DATABASE ERROR] Failed to save submission:", dbError);
    return { saved: false, alreadySolved, xpEarned: 0, rpEarned: 0 };
  }
  console.log("[DATABASE SUCCESS] Submission saved for user:", userId);

  // 4. Update Stats & Logs
  // NOTE: A proper SQL RPC function is recommended for atomicity and handling current_streak logic,
  // but we do direct updates here as MVP.
  // (calculateRewards always gives XP, so for written solutions this runs for every submission, as before)
  if (!skipStats) {
    // 4.1 Log Activity
    await adminSupabase.from("activity_logs").insert({
      user_id: userId,
      action_type: isCorrect ? "SOLVE_CORRECT" : "SOLVE_INCORRECT",
      problem_id: problemId || null,
      xp_change: xpEarned,
      rp_change: rpEarned,
      description: isCorrect ? "Correct solution submitted" : "Attempt submitted",
    });

    // 4.2 Update Global User Stats
    // Since we don't have atomic increment in simple upsert via API, we fetch first
    const { data: currentStats } = await adminSupabase.from("user_stats").select("*").eq("user_id", userId).single();

    const newXp = (currentStats?.total_xp || 0) + xpEarned;
    const newRp = (currentStats?.ranking_points || 0) + rpEarned;

    await adminSupabase.from("user_stats").upsert(
      {
        user_id: userId,
        total_xp: newXp,
        ranking_points: newRp,
        current_level: calculateLevel(newXp),
        tier: calculateTier(newRp),
        problems_attempted: (currentStats?.problems_attempted || 0) + 1,
        problems_solved: (currentStats?.problems_solved || 0) + (isCorrect ? 1 : 0),
        last_activity_date: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

    // 4.3 Update Category Specific Stats
    if (categoryLevel1 && isCorrect) {
      const { data: currentCatStats } = await adminSupabase
        .from("user_category_stats")
        .select("*")
        .eq("user_id", userId)
        .eq("category_level1_id", categoryLevel1)
        .single();

      const newCatRp = (currentCatStats?.ranking_points || 0) + rpEarned;

      await adminSupabase.from("user_category_stats").upsert(
        {
          id: currentCatStats?.id, // include ID if exists to update
          user_id: userId,
          category_level1_id: categoryLevel1,
          ranking_points: newCatRp,
          tier: calculateTier(newCatRp),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id, category_level1_id" }
      );
    }
  }

  return { saved: true, alreadySolved, xpEarned, rpEarned };
}
