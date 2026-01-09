"use client";

import React from "react";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingHeader() {
    return (
        <header className="w-full h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between sticky top-0 z-50">
            {/* Search / Left hint */}
            <div className="hidden md:block">
                <p className="text-sm text-gray-400 font-medium">Guest Access Mode</p>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
                {/* Help Link */}
                <Link
                    href="/landing"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mr-2"
                >
                    <HelpCircle className="h-4 w-4" />
                    <span>FAQ/Help</span>
                </Link>

                {/* Auth Buttons */}
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <Button
                            variant="ghost"
                            className="text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-md py-2 px-4 h-9"
                        >
                            Sign in
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button
                            className="bg-gray-900 text-white hover:bg-black text-sm font-semibold rounded-md py-2 px-4 h-9 shadow-sm"
                        >
                            Sign up
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
