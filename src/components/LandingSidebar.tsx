"use client";

import React from "react";
import { Brain, Network, LineChart, Users, Home, Crown } from "lucide-react";
import Link from "next/link";

interface LandingSidebarProps {
    active?: string;
}

export default function LandingSidebar({ active }: LandingSidebarProps) {
    const items = [
        { key: "main", label: "Home", icon: <Home className="h-4 w-4" />, href: "/landing" },
        { key: "problems", label: "Problems", icon: <Brain className="h-4 w-4" />, href: "/landing" },
        { key: "skill-tree", label: "Skill Trees", icon: <Network className="h-4 w-4" />, href: "/landing" },
        { key: "stats", label: "Stats", icon: <LineChart className="h-4 w-4" />, href: "/landing" },
        { key: "community", label: "Community", icon: <Users className="h-4 w-4" />, href: "/landing" },
    ];

    return (
        <div className="w-64 border-r bg-white h-screen flex flex-col p-3 shadow-sm">
            {/* App Logo and Title */}
            <div className="flex items-center gap-2 px-2 py-6 mb-4">
                <Crown className="h-6 w-6 text-blue-600" />
                <div className="font-bold text-xl tracking-tight text-gray-900">MathQuest</div>
            </div>

            {/* Navigation Menu Items */}
            <div className="space-y-1">
                {items.map((it) => (
                    <Link
                        key={it.key}
                        href={it.href}
                        className={`w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors font-medium text-sm ${active === it.key
                                ? "bg-gray-100 text-gray-900 shadow-sm"
                                : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                            }`}
                    >
                        {it.icon}
                        <span>{it.label}</span>
                    </Link>
                ))}
            </div>

            {/* Footer hint in sidebar */}
            <div className="mt-auto p-4 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 leading-relaxed text-center">
                    Sign in to unlock your personalized learning path.
                </p>
            </div>
        </div>
    );
}
