import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RULES } from "@/lib/skillTree";

/**
 * GET /api/user/first-solves
 * Problems the user solved among the first few students (RULES.trailblazerFirstSolvers) to solve them, and,
 * for every problem the user solved, how many wrong attempts came before the first correct one.
 * Used by the skill tree for the Trailblazer, First Try and Persistent badges. Read-only, own record only.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const { data: mine, error: mineError } = await supabaseAdmin
            .from("user_submissions")
            .select("problem_id, is_correct, created_at")
            .eq("user_id", userId)
            .order("created_at", { ascending: true });
        if (mineError) throw mineError;

        // Wrong attempts before the first correct one, per solved problem
        const wrong = new Map<string, number>();
        const wrongBeforeSolve: Record<string, number> = {};
        for (const s of mine || []) {
            if (s.problem_id in wrongBeforeSolve) continue;
            if (s.is_correct) wrongBeforeSolve[s.problem_id] = wrong.get(s.problem_id) ?? 0;
            else wrong.set(s.problem_id, (wrong.get(s.problem_id) ?? 0) + 1);
        }

        const problemIds = Object.keys(wrongBeforeSolve);
        if (problemIds.length === 0) return NextResponse.json({ problemIds: [], wrongBeforeSolve });

        const { data: all, error: allError } = await supabaseAdmin
            .from("user_submissions")
            .select("problem_id, user_id, created_at")
            .in("problem_id", problemIds)
            .eq("is_correct", true)
            .order("created_at", { ascending: true });
        if (allError) throw allError;

        // First distinct solvers per problem, in order of their first correct answer
        const firstSolvers = new Map<string, string[]>();
        for (const s of all || []) {
            const list = firstSolvers.get(s.problem_id) ?? [];
            if (list.length < RULES.trailblazerFirstSolvers && !list.includes(s.user_id)) list.push(s.user_id);
            firstSolvers.set(s.problem_id, list);
        }

        return NextResponse.json({
            problemIds: problemIds.filter((id) => firstSolvers.get(id)?.includes(userId)),
            wrongBeforeSolve,
        });
    } catch (error) {
        console.error("First solves GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
