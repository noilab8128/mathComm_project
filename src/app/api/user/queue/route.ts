import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

/**
 * GET /api/user/queue
 * Returns the problems currently in the user's queue.
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        // Fetch user's queue joined with problem details
        const { data, error } = await adminSupabase
            .from("user_queue")
            .select(`
                problem_id,
                created_at,
                problem:problems (
                    id,
                    title,
                    difficulty,
                    xp,
                    source,
                    level,
                    content,
                    category_path,
                    tags
                )
            `)
            .eq("user_id", session.user.id)
            .order("created_at", { ascending: true });

        if (error) {
            console.error("Error fetching queue:", error);
            return NextResponse.json({ message: "Failed to fetch queue" }, { status: 500 });
        }

        // Flatten the response
        const formattedQueue = (data || []).map((item: any) => ({
            ...item.problem,
            xp: item.problem.xp || 0
        }));

        return NextResponse.json(formattedQueue);
    } catch (error) {
        console.error("Queue GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * POST /api/user/queue
 * Adds a problem to the user's queue (limit 5).
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

        // 1. Check current queue size
        const { count, error: countError } = await adminSupabase
            .from("user_queue")
            .select("*", { count: "exact", head: true })
            .eq("user_id", session.user.id);

        if (countError) throw countError;

        if ((count || 0) >= 5) {
            return NextResponse.json({ message: "Queue is full (Max 5 problems)" }, { status: 400 });
        }

        // 2. Add to queue
        const { error: insertError } = await adminSupabase
            .from("user_queue")
            .upsert({
                user_id: session.user.id,
                problem_id: problemId
            }, { onConflict: "user_id, problem_id" });

        if (insertError) {
            console.error("Error adding to queue:", insertError);
            return NextResponse.json({ message: "Failed to add to queue" }, { status: 500 });
        }

        return NextResponse.json({ message: "Added to queue" });
    } catch (error) {
        console.error("Queue POST error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

/**
 * DELETE /api/user/queue
 * Removes a problem from the user's queue.
 */
export async function DELETE(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const problemId = searchParams.get("problemId");

        if (!problemId) {
            return NextResponse.json({ message: "Problem ID is required" }, { status: 400 });
        }

        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        const { error } = await adminSupabase
            .from("user_queue")
            .delete()
            .match({ user_id: session.user.id, problem_id: problemId });

        if (error) {
            console.error("Error removing from queue:", error);
            return NextResponse.json({ message: "Failed to remove from queue" }, { status: 500 });
        }

        return NextResponse.json({ message: "Removed from queue" });
    } catch (error) {
        console.error("Queue DELETE error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
