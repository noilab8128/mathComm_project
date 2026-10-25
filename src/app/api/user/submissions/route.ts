import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import type { SavedSubmission, SavedWork } from "@/lib/savedWork";

/**
 * GET /api/user/submissions?problemId=...
 * The signed-in user's own submissions to one problem, so the problem window can show a solved problem's answer
 * instead of asking for it again, or bring back the last attempt. Read-only, own record only.
 * Returns { solved, attempts, solvedWith (latest correct), firstSolvedAt, last (most recent) }.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const problemId = request.nextUrl.searchParams.get("problemId");
        if (!problemId) {
            return NextResponse.json({ message: "problemId is required" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("user_submissions")
            .select("submitted_answer, grading_result, is_correct, created_at")
            .eq("user_id", session.user.id)
            .eq("problem_id", problemId)
            .order("created_at", { ascending: true });
        if (error) throw error;

        const rows: SavedSubmission[] = (data || []).map((row) => {
            const result = (row.grading_result || {}) as { mode?: string; explanation?: string | null };
            const shortAnswer = result.mode === "short_answer";
            return {
                mode: shortAnswer ? "short_answer" : "written",
                answer: shortAnswer ? row.submitted_answer : null,
                explanation: shortAnswer ? result.explanation ?? null : row.submitted_answer,
                isCorrect: !!row.is_correct,
                createdAt: row.created_at,
            };
        });

        const correct = rows.filter((r) => r.isCorrect);
        const solvedWith = correct[correct.length - 1] ?? null;
        const work: SavedWork = {
            solved: !!solvedWith,
            attempts: rows.length,
            solvedWith,
            firstSolvedAt: correct[0]?.createdAt ?? null,
            last: rows[rows.length - 1] ?? null,
        };
        return NextResponse.json(work);
    } catch (error) {
        console.error("Submissions GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
