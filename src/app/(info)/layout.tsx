// Shared frame for the public info pages (About, FAQ, legal, …).
// "(info)" is a route group: it does not change the URLs.
import React from "react";
import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/footer";

export default function InfoLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-900">
            <LandingHeader />
            <main className="flex-1">{children}</main>
            <Footer />
        </div>
    );
}
