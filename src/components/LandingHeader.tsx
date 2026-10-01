"use client";

// Public site header: landing page and the info pages (About, FAQ, legal, …).
import React, { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const NAV = [
    { href: "/#ladders", label: "Ladders" },
    { href: "/#how-it-works", label: "How it works" },
    { href: "/#topics", label: "Topics" },
    { href: "/about", label: "About" },
    { href: "/faq", label: "FAQ" },
];

export default function LandingHeader() {
    const { status } = useSession();
    const [open, setOpen] = useState(false);
    const signedIn = status === "authenticated";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur">
            <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-4 sm:px-6">
                <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/noilab_logo.png" alt="" className="h-7 w-7 object-contain mix-blend-multiply" />
                    <span className="text-[15px] font-semibold tracking-tight text-slate-900">Math Quest</span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
                    {NAV.map((n) => (
                        <Link key={n.href} href={n.href} className="text-sm text-slate-600 transition-colors hover:text-slate-900">
                            {n.label}
                        </Link>
                    ))}
                </nav>

                <div className="ml-auto flex items-center gap-2">
                    {signedIn ? (
                        <Link href="/dashboard">
                            <Button className="h-9 px-4">Go to dashboard</Button>
                        </Link>
                    ) : (
                        <>
                            <Link href="/login" className="hidden sm:block">
                                <Button variant="ghost" className="h-9 px-3 text-slate-700">Sign in</Button>
                            </Link>
                            <Link href="/login?mode=signup">
                                <Button className="h-9 px-4">Start solving</Button>
                            </Link>
                        </>
                    )}
                    <button
                        className="rounded-md p-2 text-slate-600 hover:bg-slate-100 md:hidden"
                        onClick={() => setOpen((o) => !o)}
                        aria-label={open ? "Close menu" : "Open menu"}
                        aria-expanded={open}
                    >
                        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>
            </div>

            {open && (
                <nav className="border-t border-slate-200 bg-white px-4 py-2 md:hidden" aria-label="Main">
                    {NAV.map((n) => (
                        <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block py-2 text-sm text-slate-700">
                            {n.label}
                        </Link>
                    ))}
                    {!signedIn && (
                        <Link href="/login" onClick={() => setOpen(false)} className="block py-2 text-sm text-slate-700">
                            Sign in
                        </Link>
                    )}
                </nav>
            )}
        </header>
    );
}
