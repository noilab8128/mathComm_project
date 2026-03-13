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
        const { 
            nickname, gender, country, language, currentPassword, newPassword,
            onboarding_data, is_onboarded 
        } = body;

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

            const { data: userRaw } = await adminSupabase
                .schema("next_auth")
                .from("users")
                .select("id, password_hash")
                .eq("email", session.user.email)
                .maybeSingle();

            if (!userRaw) {
                return NextResponse.json({ message: "User not found" }, { status: 404 });
            }

            if (!userRaw.password_hash) {
                return NextResponse.json({ message: "Password authentication is not set up for this account." }, { status: 400 });
            }

            const isPasswordValid = await bcrypt.compare(currentPassword, userRaw.password_hash);
            if (!isPasswordValid) {
                return NextResponse.json({ message: "Incorrect current password" }, { status: 400 });
            }

            // Hash new password
            updateData.password_hash = await bcrypt.hash(newPassword, 10);
        }

        // Handle onboarding data update
        if (is_onboarded !== undefined) updateData.is_onboarded = is_onboarded;
        if (onboarding_data) {
            if (onboarding_data.role_type) updateData.role_type = onboarding_data.role_type;
            if (onboarding_data.goals) updateData.goals = onboarding_data.goals;
            if (onboarding_data.interested_categories) updateData.interested_categories = onboarding_data.interested_categories;
            if (onboarding_data.category_levels) updateData.category_levels = onboarding_data.category_levels;
        }

        // Only update next_auth.users if there's something to update
        if (Object.keys(updateData).length > 0) {
            const { error: userUpdateErr } = await adminSupabase
                .schema("next_auth")
                .from("users")
                .update(updateData)
                .eq("email", session.user.email);

            if (userUpdateErr) {
                console.error("[API ERROR] Error updating next_auth.users:", userUpdateErr);
                return NextResponse.json({ message: "Failed to update profile" }, { status: 500 });
            }
        }

        // Process Category Levels Translation and History Logging
        if (onboarding_data?.category_levels && Object.keys(onboarding_data.category_levels).length > 0) {
            // Need user_id for relational tables
            const { data: userRaw } = await adminSupabase
                .schema("next_auth")
                .from("users")
                .select("id")
                .eq("email", session.user.email)
                .maybeSingle();

            if (userRaw?.id) {
                const userId = userRaw.id;
                
                // 1. Fetch all categories to build the tree
                const { data: allCategories } = await adminSupabase
                    .from("categories")
                    .select("category_id, name, parent_id");
                
                if (allCategories) {
                    // Helper to get all leaf IDs for a given category recursively
                    const getLeafIds = (catId: number): number[] => {
                        const children = allCategories.filter(c => c.parent_id === catId);
                        if (children.length === 0) return [catId]; // Leaf!
                        return children.flatMap(c => getLeafIds(c.category_id));
                    };

                    const catLevelsToInsert: any[] = [];
                    const historyToInsert: any[] = [];
                    
                    const selectedCatNames = Object.keys(onboarding_data.category_levels);
                    
                    selectedCatNames.forEach(catName => {
                        const targetScore = onboarding_data.category_levels[catName];
                        const matchedCat = allCategories.find(c => c.name === catName);
                        
                        if (matchedCat) {
                            const leafIds = getLeafIds(matchedCat.category_id);
                            
                            leafIds.forEach(leafId => {
                                // Add to Levels table
                                catLevelsToInsert.push({
                                    user_id: userId,
                                    category_id: leafId,
                                    level_score: targetScore,
                                    is_inferred: false
                                });
                                // Add to History table
                                historyToInsert.push({
                                    user_id: userId,
                                    category_id: leafId,
                                    old_level_score: null,
                                    new_level_score: targetScore,
                                    change_reason: "ONBOARDING"
                                });
                            });
                        }
                    });

                    // 2. Perform DB Upserts & Inserts
                    if (catLevelsToInsert.length > 0) {
                        try {
                            // Clear existing levels first to avoid accumulation of unselected categories
                            await adminSupabase.from("user_category_levels").delete().eq("user_id", userId);
                            // Optionally clear history if we strictly want only the new 'ONBOARDING' logs
                            // await adminSupabase.from("user_category_level_history").delete().eq("user_id", userId);
                            
                            // Upsert levels (ON CONFLICT DO UPDATE)
                            const { error: upsertErr } = await adminSupabase.from("user_category_levels").upsert(catLevelsToInsert, {
                                onConflict: "user_id, category_id"
                            });
                            if (upsertErr) {
                                console.error("[API ERROR] UPSERT LEVELS ERROR:", upsertErr);
                                throw upsertErr;
                            }
                            
                            // Insert history log
                            const { error: histErr } = await adminSupabase.from("user_category_level_history").insert(historyToInsert);
                            if (histErr) {
                                console.error("[API ERROR] INSERT HISTORY ERROR:", histErr);
                                throw histErr;
                            }
                        } catch (err) {
                            console.error("[API ERROR] DB Transaction Failed:", err);
                            return NextResponse.json({ message: "Failed to save category levels" }, { status: 500 });
                        }
                    }
                }
            }
        }

        return NextResponse.json({ message: "Profile updated successfully" }, { status: 200 });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
