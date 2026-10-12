import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { RULES } from "@/lib/skillTree";

/**
 * GET /api/user/first-solves
 * Problems the user solved among the first few students (RULES.trailblazerFirstSolvers) to solve them.
 * Used by the skill tree for the Trailblazer badge. Read-only.
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
            .select("problem_id")
            .eq("user_id", userId)
            .eq("is_correct", true);
        if (mineError) throw mineError;

        const problemIds = [...new Set((mine || []).map((s) => s.problem_id))];
        if (problemIds.length === 0) return NextResponse.json({ problemIds: [] });

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
        });
    } catch (error) {
        console.error("First solves GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
