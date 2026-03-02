
import { NextAuthOptions } from "next-auth";
import { createClient } from "@supabase/supabase-js";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { SupabaseAdapter } from "@auth/supabase-adapter";
import { supabase } from "./supabase";

export const authOptions: NextAuthOptions = {
    adapter: SupabaseAdapter({
        url: process.env.NEXT_PUBLIC_SUPABASE_URL as string,
        secret: process.env.SUPABASE_SERVICE_ROLE_KEY as string || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
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
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                // Create a service role client to access next_auth schema
                const adminSupabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
                    process.env.SUPABASE_SERVICE_ROLE_KEY as string
                );

                // 1. Fetch user by email from next_auth.users
                const { data: userRaw, error } = await adminSupabase
                    .schema("next_auth")
                    .from("users")
                    .select("*")
                    .eq("email", credentials.email)
                    .maybeSingle();

                if (error || !userRaw) {
                    throw new Error("No user found with this email");
                }

                const user = userRaw as { id: string, name?: string, email?: string, image?: string, password_hash?: string };

                if (!user.password_hash) {
                    // This means they probably signed up with Google/Facebook earlier
                    throw new Error("Please sign in using your social account or reset your password.");
                }

                // 2. Validate password
                const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

                if (!isPasswordValid) {
                    throw new Error("Incorrect password");
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
    },
    pages: {
        signIn: "/login",
    },
    debug: true,
    callbacks: {
        async session({ session, token }) {
            if (session?.user && token) {
                session.user.id = token.sub as string;
                session.user.role = (token.role as string) || 'user';
                session.user.nickname = token.nickname as string;
                session.user.gender = token.gender as string;
                session.user.country = token.country as string;
                session.user.language = token.language as string;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            // Trigger update to refresh role and profile
            if (trigger === "update" && session) {
                if (session.role) token.role = session.role;
                if (session.nickname !== undefined) token.nickname = session.nickname;
                if (session.gender !== undefined) token.gender = session.gender;
                if (session.country !== undefined) token.country = session.country;
                if (session.language !== undefined) token.language = session.language;
                if (session.image !== undefined) token.picture = session.image; // NextAuth standard for image
            }

            if (user) {
                token.sub = user.id;

                // Create admin client to fetch user profile since they are in next_auth schema
                const adminSupabase = createClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
                    process.env.SUPABASE_SERVICE_ROLE_KEY as string
                );

                try {
                    // Fetch full user profile from next_auth schema
                    const { data: profile } = await adminSupabase
                        .schema("next_auth")
                        .from('users')
                        .select('nickname, gender, country, language')
                        .eq('id', user.id)
                        .maybeSingle();

                    if (profile) {
                        token.nickname = profile.nickname;
                        token.gender = profile.gender;
                        token.country = profile.country;
                        token.language = profile.language;
                    }
                } catch (err) {
                    console.error("Error fetching user profile:", err);
                }

                // Fetch user role from public.user_roles on sign in
                try {
                    const { data, error } = await supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (data && !error) {
                        token.role = (data as { role?: string }).role;
                    } else {
                        token.role = 'user'; // Default role
                    }
                } catch (err) {
                    console.error("Error fetching user role:", err);
                    token.role = 'user';
                }
            }
            return token;
        },
    },
};
