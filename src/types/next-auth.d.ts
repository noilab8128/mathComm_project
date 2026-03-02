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
            gender?: string;
            country?: string;
            language?: string;
        };
    }

    interface User {
        id: string;
        role?: string;
    }
}
