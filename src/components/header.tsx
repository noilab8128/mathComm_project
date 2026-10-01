"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Menu, Home, Settings, HelpCircle, LogOut, X, Search, Heart, ShieldAlert } from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const Header = () => {
    const { data: session } = useSession();
    const isAdmin = session?.user?.role === "admin";
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="w-full bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-50">
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
                <div className="flex h-14 items-center gap-6">
                    {/* Logo and name */}
                    <Link href="/dashboard" className="flex shrink-0 items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src="/noilab_logo.png"
                            alt="noi.lab Logo"
                            className="h-7 w-7 object-contain mix-blend-multiply"
                        />
                        <span className="text-[15px] font-semibold tracking-tight text-slate-900">
                            Math Quest
                        </span>
                    </Link>

                    {/* Search */}
                    <div className="relative hidden w-full max-w-sm md:block">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search problems"
                            className="h-9 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:bg-white focus:outline-none"
                        />
                    </div>

                    {/* Right side */}
                    <div className="ml-auto flex items-center gap-1">
                        <a
                            href="https://paypal.me/mookwonseo"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hidden items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 sm:flex"
                        >
                            <Heart className="h-4 w-4" />
                            Support
                        </a>

                        {/* Menu Toggle and Dropdown Container */}
                        <div className="relative">
                            <button
                                onClick={toggleMenu}
                                className="rounded-md p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                aria-label="Open menu"
                            >
                                {isMenuOpen ? (
                                    <X className="h-5 w-5" />
                                ) : (
                                    <Menu className="h-5 w-5" />
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {isMenuOpen && (
                                <div className="absolute right-0 z-50 mt-2 w-52 origin-top-right divide-y divide-slate-100 rounded-md border border-slate-200 bg-white shadow-md focus:outline-none">
                                    <div className="py-1">
                                        <Link
                                            href="/"
                                            className="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Home className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-500" />
                                            Home
                                        </Link>
                                        <Link
                                            href="/settings"
                                            className="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <Settings className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-500" />
                                            Settings
                                        </Link>
                                        <Link
                                            href="/faq"
                                            className="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <HelpCircle className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-500" />
                                            Help
                                        </Link>
                                        {isAdmin && (
                                            <Link
                                                href="/admin"
                                                className="group flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 border-t border-slate-100"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                <ShieldAlert className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-500" />
                                                Admin Dashboard
                                            </Link>
                                        )}
                                    </div>
                                    <div className="py-1">
                                        <button
                                            className="group flex w-full items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                signOut({ callbackUrl: '/' });
                                            }}
                                        >
                                            <LogOut className="mr-3 h-4 w-4 text-slate-400 group-hover:text-slate-500" />
                                            Log out
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
