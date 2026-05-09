import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        // Fetch onboarding preferences from next_auth.users
        const { data: userRaw } = await adminSupabase
            .schema("next_auth")
            .from("users")
            .select("id, interested_categories, category_levels")
            .eq("email", session.user.email)
            .maybeSingle();

        if (!userRaw) {
            return NextResponse.json({ interested_categories: [], category_levels: {}, user_category_levels: [] });
        }

        // Fetch user_category_levels joined with categories (public schema)
        const { data: catLevels } = await adminSupabase
            .from("user_category_levels")
            .select("category_id, level_score, categories(name)")
            .eq("user_id", userRaw.id);

        // Fetch progression user stats (Global)
        const { data: userStats } = await adminSupabase
            .from("user_stats")
            .select("*")
            .eq("user_id", userRaw.id)
            .maybeSingle();

        // Fetch progression category stats (Mastery)
        const { data: userCategoryStats } = await adminSupabase
            .from("user_category_stats")
            .select("category_level1_id, ranking_points, tier, categories(name)")
            .eq("user_id", userRaw.id);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userCategoryLevels = ((catLevels || []) as any[]).map((row) => ({
            category_id: row.category_id as number,
            level_score: row.level_score as number,
            category_name: (Array.isArray(row.categories) ? row.categories[0]?.name : row.categories?.name) ?? null,
        }));

        // Format progression category stats
        const formattedCategoryStats = ((userCategoryStats || []) as any[]).map((row) => ({
            category_id: row.category_level1_id as number,
            ranking_points: row.ranking_points as number,
            tier: row.tier as string,
            category_name: (Array.isArray(row.categories) ? row.categories[0]?.name : row.categories?.name) ?? null,
        }));

        return NextResponse.json({
            interested_categories: userRaw.interested_categories || [],
            category_levels: userRaw.category_levels || {},
            user_category_levels: userCategoryLevels,
            user_stats: userStats || {
                current_level: 1,
                total_xp: 0,
                ranking_points: 0,
                tier: 'Bronze III',
                current_streak: 0,
                longest_streak: 0,
                problems_solved: 0,
                problems_attempted: 0
            },
            user_category_stats: formattedCategoryStats
        });
    } catch (error) {
        console.error("Profile GET error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

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
