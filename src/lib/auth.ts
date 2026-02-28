
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
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
            if (session?.user) {
                // @ts-expect-error - Adding custom id binding
                session.user.id = token.sub;
                // @ts-expect-error - Adding custom role binding
                session.user.role = token.role || 'user';
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            // Trigger update to refresh role
            if (trigger === "update" && session?.role) {
                token.role = session.role;
            }

            if (user) {
                token.sub = user.id;

                // Fetch user role from public.user_roles on sign in
                console.log("[AUTH DEBUG] New sign-in detected.");
                console.log("[AUTH DEBUG] user.id (used to look up role):", user.id);
                console.log("[AUTH DEBUG] user.email:", user.email);

                try {
                    const { data, error } = await supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    console.log("[AUTH DEBUG] user_roles query result - data:", data);
                    console.log("[AUTH DEBUG] user_roles query result - error:", error);

                    if (data && !error) {
                        console.log("[AUTH DEBUG] Role found! Assigning role:", (data as any).role);
                        token.role = (data as any).role;
                    } else {
                        console.log("[AUTH DEBUG] No role found. Defaulting to 'user'.");
                        token.role = 'user'; // Default role
                    }
                } catch (err) {
                    console.error("[AUTH DEBUG] Error fetching user role:", err);
                    token.role = 'user';
                }

                console.log("[AUTH DEBUG] Final token.role assigned:", token.role);
            }
            return token;
        },
    },
};
