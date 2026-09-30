import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { authRateLimiter } from "@/lib/rate-limit";

export async function POST(req: Request) {
    try {
        // Rate Limiting: IP당 15분에 10회까지 허용
        const forwarded = req.headers.get("x-forwarded-for");
        const ip = forwarded?.split(",")[0]?.trim() || "unknown";
        const rateLimitResult = authRateLimiter.check(ip);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { message: "Too many requests. Please try again later." },
                { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) } }
            );
        }

        const { email, password, turnstileToken } = await req.json();

        // 1. Basic validation
        if (!email || !password) {
            return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
        }

        // Password policy: min 8 chars, at least 1 uppercase, 1 lowercase, 1 number
        const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        if (!PASSWORD_REGEX.test(password)) {
            return NextResponse.json({ 
                message: "Password must be at least 8 characters with uppercase, lowercase, and a number" 
            }, { status: 400 });
        }
        if (!turnstileToken) {
            return NextResponse.json({ message: "Please verify you are human" }, { status: 400 });
        }

        // 2. Server-side Turnstile verification
        const isVerified = await verifyTurnstileToken(turnstileToken);
        if (!isVerified) {
            return NextResponse.json({ message: "Security verification failed. Please try again." }, { status: 403 });
        }

        // Initialize Admin Supabase Client to access next_auth schema
        const adminSupabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL as string,
            process.env.SUPABASE_SERVICE_ROLE_KEY as string
        );

        // 2. Check if user already exists in next_auth schema
        const { data: existingUser } = await adminSupabase
            .schema("next_auth")
            .from("users")
            .select("id")
            .eq("email", email)
            .maybeSingle();

        if (existingUser) {
            return NextResponse.json({ message: "Email is already registered" }, { status: 409 });
        }

        // 3. Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. Create new user in next_auth.users table
        const id = crypto.randomUUID();

        const { error: createError } = await adminSupabase
            .schema("next_auth")
            .from("users")
            .insert([
                {
                    id: id,
                    email: email,
                    password_hash: hashedPassword,
                }
            ]);

        if (createError) {
            console.error("Database user creation error:", createError);
            // Fallback for cache issue explicitly mapped
            if (createError.code === 'PGRST204') {
                return NextResponse.json({ message: "Database schema cache needs reloading. Please restart the database or wait a moment." }, { status: 500 });
            }
            return NextResponse.json({ message: "Failed to create user account" }, { status: 500 });
        }

        // Construct the expected newUser shape for NextAuth
        const newUser = { id, email };

        return NextResponse.json({ message: "User created successfully", user: newUser }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
