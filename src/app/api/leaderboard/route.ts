import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
    try {
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        // Fetch top 5 users by total_xp from user_stats, joined with next_auth.users to get nickname/name
        // Note: Supabase JS client doesn't support joining across schemas (public -> next_auth) directly 
        // in a single query unless there's a view.
        // We will fetch top stats first, then fetch their names from next_auth.users.
        const { data: topStats, error: statsError } = await adminSupabase
            .from("user_stats")
            .select("user_id, total_xp, current_streak")
            .order("total_xp", { ascending: false })
            .limit(5);

        if (statsError) {
            console.error("Error fetching leaderboard stats:", statsError);
            return NextResponse.json({ message: "Error fetching leaderboard" }, { status: 500 });
        }

        if (!topStats || topStats.length === 0) {
            return NextResponse.json([]);
        }

        const userIds = topStats.map(s => s.user_id);

        const { data: usersData, error: usersError } = await adminSupabase
            .schema("next_auth")
            .from("users")
            .select("id, name, nickname")
            .in("id", userIds);

        if (usersError) {
            console.error("Error fetching users for leaderboard:", usersError);
            return NextResponse.json({ message: "Error fetching user details" }, { status: 500 });
        }

        const leaderboard = topStats.map(stat => {
            const user = usersData?.find(u => u.id === stat.user_id);
            return {
                name: user?.nickname || user?.name || "Anonymous Mathlete",
                xp: stat.total_xp,
                streak: stat.current_streak
            };
        });

        return NextResponse.json(leaderboard);
    } catch (error) {
        console.error("Leaderboard GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
