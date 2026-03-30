// Main MathQuest UI Application
// This is the root page component that handles navigation and renders different views

"use client"
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Network, Users, Brain, Home, LineChart } from "lucide-react";
import UserHomePage from "@/components/User_home_page";
import Problems from "@/components/Problems";
import Stats from "@/components/Stats";
import Community, { CommunityTab } from "@/components/Community";
import SkillTree from "@/components/SkillTree";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";

// ------------------------------------------------------------
// Navigation Components
// ------------------------------------------------------------

import Header from "@/components/header";
import Footer from "@/components/footer";

import SideNav from "@/components/SideNav";

/**
 * Main MathQuest UI Component
 * Handles page routing and renders the appropriate component based on active page
 */
export default function MathQuestUIMock() {
  const { data: session } = useSession();
  // State to track the currently active page/section
  const [page, setPage] = useState("dashboard");
  const [communityTab, setCommunityTab] = useState<CommunityTab>("discussions");

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
        <SideNav active={page} onChange={setPage} isAdmin={session?.user?.role === 'admin'} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          {/* Conditional Rendering based on active page */}
          {page === "dashboard" && <UserHomePage />}
          {page === "skill-tree" && <SkillTree />}
          {page === "problems" && <Problems />}
          {page === "community" && <Community activeTab={communityTab} onTabChange={setCommunityTab} />}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
