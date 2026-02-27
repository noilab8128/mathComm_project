// Main MathQuest UI Application
// This is the root page component that handles navigation and renders different views

"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Flame, Search, MessageSquare, Trophy, LineChart, LayoutDashboard, Network, Users, Brain, Home } from "lucide-react";
import UserHomePage from "@/components/User_home_page";
import Problems from "@/components/Problems";
import Stats from "@/components/Stats";
import Community, { CommunityTab } from "@/components/Community";
import SkillTree from "@/components/SkillTree";
import MainPage from "@/components/MainPage";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

// ------------------------------------------------------------
// Navigation Components
// ------------------------------------------------------------

import Header from "@/components/header";
import Footer from "@/components/footer";

/**
 * SideNav Component - Left sidebar navigation
 * @param active - Currently active page/section
 * @param onChange - Callback function to change active page
 * @param isAdmin - Boolean whether the current user is an admin
 */
function SideNav({ active, onChange, isAdmin }: { active: string; onChange: (k: string) => void, isAdmin: boolean }) {
  // Navigation menu items with icons and labels
  const items = [
    { key: "main", label: "Home", icon: <Home className="h-4 w-4" /> },
    { key: "dashboard", label: "My board", icon: <LayoutDashboard className="h-4 w-4" /> },
    { key: "skill-tree", label: "Skill Tree", icon: <Network className="h-4 w-4" /> },
    { key: "problems", label: "Problems", icon: <Brain className="h-4 w-4" /> },
    { key: "stats", label: "Stats", icon: <LineChart className="h-4 w-4" /> },
    { key: "community", label: "Community", icon: <Users className="h-4 w-4" /> },
  ];

  return (
    <div className="h-full w-64 border-r bg-white/60 backdrop-blur p-3 hidden xl:flex xl:flex-col">
      {/* App Logo and Title */}
      <div className="flex items-center gap-2 px-2 py-3">
        <Crown className="h-5 w-5" />
        <div className="font-bold">MathQuest</div>
      </div>

      {/* Navigation Menu Items */}
      <div className="mt-2 space-y-1">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-muted ${active === it.key ? "bg-muted font-semibold" : ""
              }`}
          >
            {it.icon}
            <span>{it.label}</span>
          </button>
        ))}
        {isAdmin && (
          <Link href="/admin" className="block w-full">
            <button className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left text-indigo-600 hover:bg-indigo-50 font-medium mt-4 border border-indigo-100">
              <ShieldAlert className="h-4 w-4" />
              <span>Admin Dashboard</span>
            </button>
          </Link>
        )}
      </div>

      {/* User Profile Section */}
      <div className="mt-auto p-3">
        <div className="rounded-xl border bg-white/60 backdrop-blur p-3">
          <div className="pb-2">
            <div className="text-sm font-semibold">Your Profile</div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8"><AvatarFallback>MS</AvatarFallback></Avatar>
            <div>
              <div className="text-sm font-medium">M. Seo</div>
              <div className="text-xs text-muted-foreground">Rank #3 • Level 7</div>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full mt-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 justify-start"
            onClick={() => signOut({ callbackUrl: '/' })}
          >
            Log out
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Main MathQuest UI Component
 * Handles page routing and renders the appropriate component based on active page
 */
export default function MathQuestUIMock() {
  const { data: session } = useSession();
  // State to track the currently active page/section
  const [page, setPage] = useState("main");
  const [communityTab, setCommunityTab] = useState<CommunityTab>("discussions");

  const handleCommunityNavigate = (tab: CommunityTab) => {
    setPage("community");
    setCommunityTab(tab);
  };

  // Listen for navigation events from child components (like Dashboard)
  React.useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      if (event.detail?.page) {
        setPage(event.detail.page);
      }
    };

    window.addEventListener('navigate-to-page', handleNavigate as EventListener);
    return () => {
      window.removeEventListener('navigate-to-page', handleNavigate as EventListener);
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-slate-50 to-white text-slate-900">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Layout Container */}
      <div className="flex flex-1">
        {/* Left Sidebar Navigation */}
        {/* @ts-expect-error - Custom role property in session */}
        <SideNav active={page} onChange={setPage} isAdmin={session?.user?.role === 'admin'} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {/* Conditional Rendering based on active page */}
          {page === "main" && <MainPage />}
          {page === "dashboard" && <UserHomePage />}
          {page === "skill-tree" && <SkillTree />}
          {page === "problems" && <Problems />}
          {page === "stats" && <Stats />}
          {page === "community" && <Community activeTab={communityTab} onTabChange={setCommunityTab} />}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
