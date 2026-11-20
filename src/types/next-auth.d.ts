import "next-auth";

declare module "next-auth" {
    interface Session {
        user?: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            role?: string;
            nickname?: string;
            is_onboarded?: boolean;
        };
    }

    interface User {
        id: string;
        role?: string;
    }
}
