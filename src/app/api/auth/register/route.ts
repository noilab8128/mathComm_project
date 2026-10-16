import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { verifyTurnstileToken } from "@/lib/turnstile";
import { authRateLimiter } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase-admin";
import {
    BCRYPT_ROUNDS,
    PASSWORD_POLICY_MESSAGE,
    escapeLike,
    getClientIp,
    isValidPassword,
    normalizeEmail,
} from "@/lib/credentials";

export async function POST(req: Request) {
    try {
        // Rate Limiting: IP당 15분에 10회까지 허용
        const ip = getClientIp(req.headers);
        const rateLimitResult = authRateLimiter.check(ip);
        if (!rateLimitResult.success) {
            return NextResponse.json(
                { message: "Too many requests. Please try again later." },
                { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) } }
            );
        }

        const { email: rawEmail, password, turnstileToken } = await req.json();

        // 1. Basic validation
        const email = normalizeEmail(rawEmail);
        if (!email || !password) {
            return NextResponse.json({ message: "A valid email and a password are required" }, { status: 400 });
        }

        if (!isValidPassword(password)) {
            return NextResponse.json({ message: PASSWORD_POLICY_MESSAGE }, { status: 400 });
        }
        if (!turnstileToken) {
            return NextResponse.json({ message: "Please verify you are human" }, { status: 400 });
        }

        // 2. Server-side Turnstile verification
        const isVerified = await verifyTurnstileToken(turnstileToken);
        if (!isVerified) {
            return NextResponse.json({ message: "Security verification failed. Please try again." }, { status: 403 });
        }

        // 3. Check if user already exists in next_auth schema (case-insensitive, so A@x.com and a@x.com are one account)
        // Note: this answer tells a visitor that the email has an account. Removing it needs email verification.
        const { data: existingUser } = await supabaseAdmin
            .schema("next_auth")
            .from("users")
            .select("id")
            .ilike("email", escapeLike(email))
            .maybeSingle();

        if (existingUser) {
            return NextResponse.json({ message: "Email is already registered" }, { status: 409 });
        }

        // 4. Hash the password
        const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

        // 5. Create new user in next_auth.users table
        const id = crypto.randomUUID();

        const { error: createError } = await supabaseAdmin
            .schema("next_auth")
            .from("users")
            .insert([
                {
                    id: id,
                    email: email,
                    password_hash: hashedPassword,
                }
            ]);

        if (createError?.code === "23505") {
            // Unique email constraint: the same address was registered at the same moment.
            return NextResponse.json({ message: "Email is already registered" }, { status: 409 });
        }
        if (createError) {
            console.error("Database user creation error:", createError.code, createError.message);
            return NextResponse.json({ message: "Failed to create user account" }, { status: 500 });
        }

        return NextResponse.json({ message: "User created successfully", user: { id, email } }, { status: 201 });

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
