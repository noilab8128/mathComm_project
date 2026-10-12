import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * GET /api/ladders/guide?problemId=...
 * The Problem analysis and Logic flow of the ladder that contains the problem (any step or the Challenge).
 * Members only (olympiad/ladders/LADDER_RULES_v2.md): the table public.ladder_guides has no read policy, so it is
 * read here with the service-role key, after checking that the user is signed in.
 * 404 when the problem's ladder has no guide (older ladders), so the client simply shows nothing.
 */
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Sign in to see the problem analysis." }, { status: 401 });
        }

        const problemId = request.nextUrl.searchParams.get("problemId");
        if (!problemId) {
            return NextResponse.json({ message: "problemId is required" }, { status: 400 });
        }

        // Walk up to the ladder's Challenge (the problem with no parent). Ladders are at most a few levels deep.
        let rootId = problemId;
        for (let i = 0; i < 10; i++) {
            const { data: parent } = await supabaseAdmin
                .from("problem_hierarchies")
                .select("parent_problem_id")
                .eq("child_problem_id", rootId)
                .limit(1)
                .maybeSingle();
            if (!parent?.parent_problem_id) break;
            rootId = parent.parent_problem_id;
        }

        const { data: guide, error } = await supabaseAdmin
            .from("ladder_guides")
            .select("analysis, flow")
            .eq("root_problem_id", rootId)
            .maybeSingle();
        if (error || !guide) {
            // Missing table (not created yet) or no guide for this ladder: nothing to show
            return NextResponse.json({ message: "No analysis for this problem" }, { status: 404 });
        }

        // Titles of the step problems the flow links to, so the client can label "Open Step 2"
        const flow = (guide.flow || []) as { title: string; text: string; step_problem_id: string | null }[];
        const stepIds = flow.map((f) => f.step_problem_id).filter((id): id is string => !!id);
        const titles = new Map<string, string>();
        if (stepIds.length) {
            const { data: steps } = await supabaseAdmin.from("problems").select("id, title").in("id", stepIds);
            for (const s of steps || []) titles.set(s.id, s.title);
        }

        return NextResponse.json({
            rootId,
            analysis: (guide.analysis || []) as string[],
            flow: flow.map((f) => ({
                title: f.title,
                text: f.text,
                stepProblemId: f.step_problem_id,
                stepTitle: f.step_problem_id ? titles.get(f.step_problem_id) ?? null : null,
            })),
        });
    } catch (error) {
        console.error("Ladder guide GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
