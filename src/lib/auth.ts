
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
                try {
                    const { data, error } = await supabase
                        .from('user_roles')
                        .select('role')
                        .eq('user_id', user.id)
                        .maybeSingle();

                    if (data && !error) {
                        token.role = (data as any).role;
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
