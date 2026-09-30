import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/user/progress
 * Per-problem progress for the home page: which problems the user has solved or attempted,
 * and the problems they started, most recent first.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const [{ data: submissions, error: subError }, { data: starts, error: startError }] = await Promise.all([
            supabaseAdmin
                .from("user_submissions")
                .select("problem_id, is_correct, created_at")
                .eq("user_id", userId),
            supabaseAdmin
                .from("user_starts")
                .select("problem_id, created_at")
                .eq("user_id", userId)
                .order("created_at", { ascending: false }),
        ]);

        if (subError || startError) {
            console.error("Error fetching progress:", subError || startError);
            return NextResponse.json({ message: "Failed to fetch progress" }, { status: 500 });
        }

        const solvedIds = new Set<string>();
        const attemptedIds = new Set<string>();
        for (const s of submissions || []) {
            attemptedIds.add(s.problem_id);
            if (s.is_correct) solvedIds.add(s.problem_id);
        }

        return NextResponse.json({
            solvedIds: [...solvedIds],
            attemptedIds: [...attemptedIds],
            recentStarts: (starts || []).map((s) => ({ problemId: s.problem_id, startedAt: s.created_at })),
        });
    } catch (error) {
        console.error("Progress GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
