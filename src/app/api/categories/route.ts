import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cache this API response for 1 hour (3600 seconds)
export const revalidate = 3600;

export async function GET() {
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        // In PostgREST, aliases are denoted by `new_name:old_name`
        const { data, error } = await supabase
            .from("categories")
            .select("id:category_id, name, level, parent_id");

        if (error) throw error;

        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error("Categories fetch error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
