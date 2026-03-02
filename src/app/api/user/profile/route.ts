import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { nickname, gender, country, language, currentPassword, newPassword } = body;

        // Initialize Admin Supabase Client to update next_auth schema
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        const updateData: Record<string, string> = {};
        if (nickname !== undefined) updateData.nickname = nickname;
        if (gender !== undefined) updateData.gender = gender;
        if (country !== undefined) updateData.country = country;
        if (language !== undefined) updateData.language = language;

        // Handle password change if requested
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ message: "Current password is required to set a new password" }, { status: 400 });
            }

            // Verify current password
            const { data: userRaw } = await adminSupabase
                .schema("next_auth")
                .from("users")
                .select("password_hash")
                .eq("email", session.user.email)
                .maybeSingle();

            if (!userRaw || !userRaw.password_hash) {
                return NextResponse.json({ message: "Password authentication is not set up for this account (maybe you used social login?)." }, { status: 400 });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, userRaw.password_hash);
            if (!isPasswordValid) {
                return NextResponse.json({ message: "Incorrect current password" }, { status: 400 });
            }

            // Hash new password
            updateData.password_hash = await bcrypt.hash(newPassword, 10);
        }

        // Only update if there's something to update
        if (Object.keys(updateData).length > 0) {
            const { error } = await adminSupabase
                .schema("next_auth")
                .from("users")
                .update(updateData)
                .eq("email", session.user.email);

            if (error) {
                console.error("Error updating profile:", error);
                return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
            }
        }

        return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
