"use client";

import { useEffect } from "react";
import { SessionProvider, useSession } from "next-auth/react";

const DRAFT_PREFIX = "mathquest:draft:"; // src/lib/savedWork.ts draftKey()

/**
 * Removes unfinished answers kept in this browser (src/lib/savedWork.ts) once nobody is signed in, so the next
 * person on a shared computer (school, library) cannot read them. Security item C1.
 */
function DraftCleaner() {
    const { status } = useSession();
    useEffect(() => {
        if (status !== "unauthenticated") return;
        try {
            const keys: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key?.startsWith(DRAFT_PREFIX)) keys.push(key);
            }
            keys.forEach((key) => localStorage.removeItem(key));
        } catch {
            // storage blocked (private mode, browser settings): nothing to clean
        }
    }, [status]);
    return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider refetchOnWindowFocus={true} refetchInterval={5 * 60}>
            <DraftCleaner />
            {children}
        </SessionProvider>
    );
}
