/* eslint-disable */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, BookOpen, Megaphone, Home, LogOut, ChevronLeft, ChevronRight, Menu, X, ShieldAlert, User, Settings, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { data: session } = useSession();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

    const navItems = [
        { name: "Overview", href: "/admin", icon: <Home className="w-5 h-5" /> },
        { name: "Users", href: "/admin/users", icon: <Users className="w-5 h-5" /> },
        { name: "Problems", href: "/admin/problems", icon: <BookOpen className="w-5 h-5" /> },
        { name: "Notices", href: "/admin/notices", icon: <Megaphone className="w-5 h-5" /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
            {/* Desktop Sidebar */}
            <aside className={`hidden md:flex flex-col bg-gray-900 text-white shadow-xl flex-shrink-0 z-20 transition-all duration-300 ${isDesktopCollapsed ? "w-20" : "w-64"}`}>
                <div className={`p-6 flex items-center justify-between border-b border-gray-800 ${isDesktopCollapsed ? "flex-col gap-4 px-0" : ""}`}>
                    <div className={`flex items-center gap-3 ${isDesktopCollapsed ? "justify-center" : ""}`}>
                        <div className="bg-red-500/10 p-2 rounded-lg text-red-400 shrink-0">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        {!isDesktopCollapsed && (
                            <div className="overflow-hidden transition-all">
                                <h2 className="text-xl font-bold tracking-tight whitespace-nowrap">Admin System</h2>
                                <span className="text-xs text-gray-400 font-medium tracking-wider uppercase">MathQuest</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
                        className={`text-gray-400 hover:text-white p-1 rounded-md hover:bg-gray-800 transition-colors ${isDesktopCollapsed ? "" : ""}`}
                        title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        {isDesktopCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
                    </button>
                </div>

                <nav className="flex-1 px-3 py-8 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                title={isDesktopCollapsed ? item.name : undefined}
                                className={`flex items-center gap-3 py-3 rounded-xl transition-all duration-200 group ${isActive
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-900/20"
                                    : "text-gray-300 hover:bg-gray-800 hover:text-white"
                                    } ${isDesktopCollapsed ? "justify-center px-0 mx-2" : "px-4"}`}
                            >
                                <span className={`${isActive ? "text-white" : "text-gray-400 group-hover:text-white"}`}>
                                    {item.icon}
                                </span>
                                {!isDesktopCollapsed && (
                                    <span className="font-medium whitespace-nowrap">{item.name}</span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-gray-800 space-y-2">
                    <Link href="/dashboard" className="block" title={isDesktopCollapsed ? "Exit Admin" : undefined}>
                        <Button variant="outline" className={`w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white ${isDesktopCollapsed ? "justify-center px-0" : "justify-start"}`}>
                            <ChevronLeft className={`w-4 h-4 ${!isDesktopCollapsed ? "mr-2" : ""}`} />
                            {!isDesktopCollapsed && <span>Exit Admin</span>}
                        </Button>
                    </Link>
                    <Button
                        variant="ghost"
                        className={`w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 ${isDesktopCollapsed ? "justify-center px-0" : "justify-start"}`}
                        onClick={() => signOut({ callbackUrl: '/' })}
                        title={isDesktopCollapsed ? "Log out" : undefined}
                    >
                        <LogOut className={`w-4 h-4 ${!isDesktopCollapsed ? "mr-2" : ""}`} />
                        {!isDesktopCollapsed && <span>Log out</span>}
                    </Button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-gray-900 flex items-center justify-between px-4 z-30 shadow-md">
                <div className="flex items-center gap-2 text-white">
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <span className="font-bold">Admin System</span>
                </div>
                <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="p-2 text-gray-300 hover:text-white"
                >
                    {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-20 pt-16 bg-gray-900 border-b border-gray-800 animate-in slide-in-from-top-4">
                    <nav className="p-4 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`flex items-center gap-3 px-4 py-4 rounded-xl ${pathname === item.href
                                    ? "bg-indigo-600 text-white"
                                    : "text-gray-300 hover:bg-gray-800"
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium text-lg">{item.name}</span>
                            </Link>
                        ))}
                        <div className="pt-4 mt-4 border-t border-gray-800">
                            <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="block mb-3">
                                <Button variant="outline" className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white h-12 justify-start">
                                    <Settings className="w-5 h-5 mr-2" />
                                    Settings
                                </Button>
                            </Link>
                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="block mb-3">
                                <Button variant="outline" className="w-full bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white h-12 justify-start">
                                    <ChevronLeft className="w-5 h-5 mr-2" />
                                    Exit to Dashboard
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                className="w-full text-red-400 hover:bg-red-500/10 hover:text-red-300 h-12"
                                onClick={() => signOut({ callbackUrl: '/' })}
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Log out
                            </Button>
                        </div>
                    </nav>
                </div>
            )}

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-gray-50/50">
                {/* Top Header Bar for Content Area */}
                <header className="hidden md:flex h-16 bg-white border-b border-gray-200 items-center justify-between px-8 shadow-sm z-10">
                    <h1 className="text-xl font-bold tracking-tight text-gray-800 capitalize">
                        {navItems.find(item => item.href === pathname)?.name || "Dashboard"}
                    </h1>
                    <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-4 hover:bg-gray-50 p-2 rounded-xl transition-colors outline-none cursor-pointer">
                            <div className="flex flex-col items-end">
                                <span className="text-sm font-semibold text-gray-900">{session?.user?.name || "Admin User"}</span>
                                <span className="text-xs text-gray-500">{session?.user?.email || "Super Administrator"}</span>
                            </div>
                            <Avatar className="w-10 h-10 border-2 border-indigo-100 shadow-sm">
                                <AvatarImage src={session?.user?.image || ""} alt="Profile" />
                                <AvatarFallback className="bg-gray-100">
                                    <User className="w-5 h-5 text-gray-400" />
                                </AvatarFallback>
                            </Avatar>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href="/settings" className="flex items-center w-full">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>Settings</span>
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-700" onClick={() => signOut({ callbackUrl: '/' })}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </header>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-4 md:p-8 mt-16 md:mt-0">
                    <div className="max-w-7xl mx-auto pb-20">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
