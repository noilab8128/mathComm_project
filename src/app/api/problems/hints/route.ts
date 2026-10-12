import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/problems/hints?problemId=...
 * The hints written for one problem, in the order they should be revealed. Free to use (no XP cost).
 * Members only, like the ladder guide: public.problem_hints has no read policy, so it is read here with the
 * service-role key after checking the session. Returns an empty list when the problem has no hints yet.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Sign in to see hints." }, { status: 401 });
        }

        const problemId = request.nextUrl.searchParams.get("problemId");
        if (!problemId) {
            return NextResponse.json({ message: "problemId is required" }, { status: 400 });
        }

        const { data, error } = await supabaseAdmin
            .from("problem_hints")
            .select("hints")
            .eq("problem_id", problemId)
            .maybeSingle();
        // Missing table (not created yet) or no row: no hints to show
        const hints = !error && Array.isArray(data?.hints) ? (data.hints as string[]) : [];
        return NextResponse.json({ hints });
    } catch (error) {
        console.error("Problem hints GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
