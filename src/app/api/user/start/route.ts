import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/user/start
 * Returns the list of problem IDs the user has already started.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ startedIds: [] });
        }

        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        const { data, error } = await adminSupabase
            .from("user_starts")
            .select("problem_id")
            .eq("user_id", session.user.id);

        if (error) {
            console.error("Error fetching starts:", error);
            return NextResponse.json({ startedIds: [] });
        }

        return NextResponse.json({ startedIds: (data || []).map(row => row.problem_id) });
    } catch (error) {
        console.error("Starts GET error:", error);
        return NextResponse.json({ startedIds: [] });
    }
}

/**
 * POST /api/user/start
 * Adds a problem to the user's started list.
 */
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { problemId } = await request.json();
        if (!problemId) {
            return NextResponse.json({ message: "problemId is required" }, { status: 400 });
        }

        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        // Check if already started
        const { data: existing, error: checkError } = await adminSupabase
            .from("user_starts")
            .select("*")
            .match({ user_id: session.user.id, problem_id: problemId })
            .maybeSingle();

        if (checkError) {
          console.error("Start check error:", checkError);
          return NextResponse.json({ message: checkError.message || "Database check failed" }, { status: 500 });
        }

        if (!existing) {
            // Add start record
            const { error: insertError } = await adminSupabase
                .from("user_starts")
                .insert({ user_id: session.user.id, problem_id: problemId });

            if (insertError) {
                console.error("Start insert error:", insertError);
                return NextResponse.json({ message: insertError.message || "Failed to save start" }, { status: 500 });
            }
        }

        return NextResponse.json({ success: true, started: true });
    } catch (error) {
        console.error("Starts POST error:", error);
        return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
    }
}
