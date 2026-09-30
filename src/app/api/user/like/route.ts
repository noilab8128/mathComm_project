import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/user/like
 * Returns the list of problem IDs liked by the current user.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ likedIds: [] });
        }

        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        console.log("Checking user_likes table for user:", session.user.id);
        
        const { data, error } = await adminSupabase
            .from("user_likes")
            .select("problem_id")
            .eq("user_id", session.user.id);

        if (error) {
            console.error("Error fetching likes for user", session.user.id, ":", error);
            // If it's a 'not found' error, it confirms the table is missing
            return NextResponse.json({ likedIds: [], error: error.message });
        }

        return NextResponse.json({ likedIds: (data || []).map(row => row.problem_id) });
    } catch (error) {
        console.error("Like GET error:", error);
        return NextResponse.json({ likedIds: [] });
    }
}

/**
 * POST /api/user/like
 * Toggles a like for a problem.
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { problemId } = await req.json();
        if (!problemId) {
            return NextResponse.json({ message: "Problem ID is required" }, { status: 400 });
        }

        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        // 1. Check if already liked
        const { data: existing, error: checkError } = await adminSupabase
            .from("user_likes")
            .select("*")
            .match({ user_id: session.user.id, problem_id: problemId })
            .maybeSingle();

        if (checkError) {
          console.error("Like check error:", checkError);
          return NextResponse.json({ message: checkError.message || "Database check failed" }, { status: 500 });
        }

        if (existing) {
            // Remove like
            const { error: deleteError } = await adminSupabase
                .from("user_likes")
                .delete()
                .match({ user_id: session.user.id, problem_id: problemId });
            
            if (deleteError) throw deleteError;
            return NextResponse.json({ liked: false });
        } else {
            // Add like
            const { error: insertError } = await adminSupabase
                .from("user_likes")
                .insert({ user_id: session.user.id, problem_id: problemId });
            
            if (insertError) throw insertError;
            return NextResponse.json({ liked: true });
        }
    } catch (error) {
        console.error("Like POST error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
