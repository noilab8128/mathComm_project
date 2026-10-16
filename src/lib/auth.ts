import { NextAuthOptions, getServerSession } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { supabaseAdmin } from "./supabase-admin";
import { verifyTurnstileToken } from "./turnstile";
import { loginEmailRateLimiter, loginIpRateLimiter } from "./rate-limit";
import { escapeLike, getClientIp, normalizeEmail } from "./credentials";

// One message for every failed sign-in, so the form does not reveal which emails have accounts.
const INVALID_LOGIN = "Invalid email or password";

// Compared against when the email has no password, so a failed login takes about as long either way.
// Hash (cost 12) of a random value that was thrown away; no password matches it.
const DUMMY_HASH = "$2b$12$hYMz4QzHfZFk8o2TdvVB7OylgjluCvphE76wDDcLi29OTTkDfm4Um";

// How often the role and profile in the session token are reloaded from the database.
const CLAIMS_REFRESH_MS = 5 * 60 * 1000;

/**
 * Role and profile fields kept in the session token. Always read from the database with the service key,
 * never taken from the browser: `useSession().update(data)` sends `data` from the client.
 */
async function loadUserClaims(userId: string) {
    const [{ data: profile, error: profileError }, { data: roleRow, error: roleError }] = await Promise.all([
        supabaseAdmin
            .schema("next_auth")
            .from("users")
            .select("nickname, gender, country, language, is_onboarded, image")
            .eq("id", userId)
            .maybeSingle(),
        supabaseAdmin.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    ]);
    if (profileError) console.error("Error fetching user profile:", profileError.message);
    if (roleError) console.error("Error fetching user role:", roleError.message);

    return {
        role: (roleRow as { role?: string } | null)?.role || "user",
        nickname: profile?.nickname ?? undefined,
        gender: profile?.gender ?? undefined,
        country: profile?.country ?? undefined,
        language: profile?.language ?? undefined,
        is_onboarded: profile?.is_onboarded === true,
        image: profile?.image ?? undefined,
    };
}

async function refreshClaims(token: JWT): Promise<JWT> {
    if (!token.sub) return token;
    try {
        const claims = await loadUserClaims(token.sub);
        token.role = claims.role;
        token.nickname = claims.nickname;
        token.gender = claims.gender;
        token.country = claims.country;
        token.language = claims.language;
        token.is_onboarded = claims.is_onboarded;
        if (claims.image !== undefined) token.picture = claims.image;
        token.claimsCheckedAt = Date.now();
    } catch (err) {
        console.error("Error refreshing session claims:", err);
        // Keep the old values, but never let a failed lookup keep an admin role.
        token.role = "user";
    }
    return token;
}

export const authOptions: NextAuthOptions = {
    adapter: SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        // Service key only. The adapter writes to next_auth.*, which the public anon key must never reach.
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    }),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
            authorization: {
                params: {
                    prompt: "select_account"
                }
            }
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID as string,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email", placeholder: "test@example.com" },
                password: { label: "Password", type: "password" },
                turnstileToken: { label: "Turnstile Token", type: "text" }
            },
            async authorize(credentials, req) {
                const email = normalizeEmail(credentials?.email);
                const password = credentials?.password;
                if (!email || typeof password !== "string" || !password) {
                    throw new Error(INVALID_LOGIN);
                }

                // Rate limiting: 15 minutes, 30 tries per IP and 10 tries per email.
                const ip = getClientIp(req?.headers);
                const byIp = loginIpRateLimiter.check(ip);
                const byEmail = loginEmailRateLimiter.check(email);
                if (!byIp.success || !byEmail.success) {
                    throw new Error("Too many login attempts. Please try again later.");
                }

                // 0. Verify Turnstile Token
                const isVerified = await verifyTurnstileToken(credentials?.turnstileToken || "");
                if (!isVerified) {
                    throw new Error("Security verification failed. Please try again.");
                }

                // 1. Fetch user by email from next_auth.users (case-insensitive exact match)
                const { data: userRaw, error } = await supabaseAdmin
                    .schema("next_auth")
                    .from("users")
                    .select("id, name, email, image, password_hash")
                    .ilike("email", escapeLike(email))
                    .maybeSingle();

                if (error) {
                    console.error("Login lookup failed:", error.message);
                }

                const user = userRaw as { id: string, name?: string, email?: string, image?: string, password_hash?: string } | null;

                // 2. Validate password. Unknown emails and social-only accounts get the same answer as a wrong
                // password, after a comparison of the same cost.
                const isPasswordValid = await bcrypt.compare(password, user?.password_hash || DUMMY_HASH);

                if (!user?.password_hash || !isPasswordValid) {
                    throw new Error(INVALID_LOGIN);
                }

                // Any object returned will be saved in `user` property of the JWT
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                };
            }
        }),
    ],
    session: {
        strategy: "jwt",
        maxAge: 7 * 24 * 60 * 60, // 7 days
    },
    pages: {
        signIn: "/login",
    },
    debug: process.env.NODE_ENV === "development",
    callbacks: {
        async session({ session, token }) {
            if (session?.user && token) {
                session.user.id = token.sub as string;
                session.user.role = (token.role as string) || 'user';
                session.user.nickname = token.nickname as string;
                session.user.gender = token.gender as string;
                session.user.country = token.country as string;
                session.user.language = token.language as string;
                session.user.is_onboarded = token.is_onboarded as boolean;
            }
            return session;
        },
        async jwt({ token, user, trigger }) {
            if (user) {
                token.sub = user.id;
                return refreshClaims(token);
            }

            // `update()` from the browser only asks for a refresh: the values it sends are ignored and
            // everything is read again from the database. The same happens every few minutes, so a removed
            // admin role or a changed profile reaches the token without signing out.
            const checkedAt = typeof token.claimsCheckedAt === "number" ? token.claimsCheckedAt : 0;
            if (trigger === "update" || Date.now() - checkedAt > CLAIMS_REFRESH_MS) {
                return refreshClaims(token);
            }
            return token;
        },
    },
};

/**
 * Session of a signed-in admin, or null. Checks `user_roles` in the database on every call instead of trusting
 * the role inside the session token. Use it at the top of every admin-only API route.
 */
export async function requireAdmin() {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    if (!userId) return null;

    const { data, error } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        console.error("Admin check failed:", error.message);
        return null;
    }
    return (data as { role?: string } | null)?.role === "admin" ? session : null;
}
