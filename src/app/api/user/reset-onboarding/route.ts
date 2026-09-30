import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        // Initialize Admin Supabase Client
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        // 1. Get user UUID
        const { data: userRaw } = await adminSupabase
            .schema("next_auth")
            .from("users")
            .select("id")
            .eq("email", session.user.email)
            .maybeSingle();

        if (!userRaw || !userRaw.id) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const userId = userRaw.id;

        // 2. Clear onboarding fields in next_auth.users
        console.log(`[RESET API] Resetting onboarding for email: ${session.user.email}`);

        const { error: userUpdateError, data } = await adminSupabase
            .schema("next_auth")
            .from("users")
            .update({
                is_onboarded: false,
                role_type: null,
                goals: null,
                interested_categories: null,
                category_levels: null
            })
            .eq("email", session.user.email)
            .select();

        if (userUpdateError) {
            console.error("[RESET API] Error resetting user onboarding fields:", userUpdateError);
            return NextResponse.json({ message: "Failed to reset onboarding data" }, { status: 500 });
        }

        console.log(`[RESET API] Successfully updated DB. Rows affected: ${data?.length || 0}`);

        // 3. Clear data in public.user_category_levels and public.user_category_level_history
        const { error: levelsError } = await adminSupabase
            .from("user_category_levels")
            .delete()
            .eq("user_id", userId);

        if (levelsError) {
             console.error("Error clearing levels:", levelsError);
        }

        const { error: historyError } = await adminSupabase
            .from("user_category_level_history")
            .delete()
            .eq("user_id", userId);

        if (historyError) {
             console.error("Error clearing history:", historyError);
        }

        return NextResponse.json({ message: "Onboarding state reset successfully" }, { status: 200 });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
