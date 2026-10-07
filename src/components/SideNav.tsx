"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Network, Users, BookOpen, Home, LineChart, ShieldAlert } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SidebarStats } from "@/components/home/StatStrip";

export const SIDENAV_SLOT_ID = "sidenav-page-slot";

export default function SideNav({ active, onChange, isAdmin }: { active: string; onChange?: (k: string) => void, isAdmin: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { key: "dashboard", label: "Home", icon: <Home className="h-4 w-4" />, href: "/dashboard" },
    { key: "skill-tree", label: "Skill Tree", icon: <Network className="h-4 w-4" />, href: "/dashboard" },
    { key: "problems", label: "Problems", icon: <BookOpen className="h-4 w-4" />, href: "/dashboard" },
    { key: "stats", label: "Stats", icon: <LineChart className="h-4 w-4" />, href: "/dashboard/stats" },
    { key: "community", label: "Community", icon: <Users className="h-4 w-4" />, href: "/dashboard" },
  ];

  const handleNav = (item: typeof items[0]) => {
    if (item.href !== pathname && item.href.includes("stats")) {
      router.push(item.href);
    } else if (pathname !== "/dashboard" && item.href === "/dashboard") {
      // Need to go back to dashboard SPA and ideally trigger tab change. 
      // A simple push works but forgets the tab, which is fine since "Home" is the default anyway.
      // If we clicked something else like "problems", we could pass a query like ?tab=problems.
      router.push(`/dashboard?tab=${item.key}`);
    } else {
      if (onChange) onChange(item.key);
    }
  };

  return (
    <nav className="hidden min-h-[calc(100vh-56px)] w-64 shrink-0 flex-col border-r border-slate-200 bg-white px-3 py-4 xl:flex">
      {/* Navigation Menu Items */}
      <div className="space-y-0.5">
        {items.map((it) => {
          const isActive = active === it.key;
          return (
            <button
              key={it.key}
              onClick={() => handleNav(it)}
              aria-current={isActive ? "page" : undefined}
              className={`flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors ${
                isActive
                  ? "bg-slate-100 font-medium text-slate-900"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span className={isActive ? "text-slate-900" : "text-slate-400"}>{it.icon}</span>
              <span>{it.label}</span>
            </button>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            className="mt-3 flex w-full items-center gap-2.5 rounded-md border-t border-slate-100 px-2.5 pb-1.5 pt-3 text-sm text-slate-600 hover:text-slate-900"
          >
            <ShieldAlert className="h-4 w-4 text-slate-400" />
            <span>Admin</span>
          </Link>
        )}
      </div>

      {/* Solved / rating / streak / level */}
      {session?.user && (
        <div className="mt-5">
          <SidebarStats />
        </div>
      )}

      {/* The Home dashboard puts its Getting started / Activity / Top solvers cards here (HomeDashboard, createPortal) */}
      <div id={SIDENAV_SLOT_ID} className="mt-4 space-y-3 empty:hidden" />

      {/* Signed-in user */}
      <div className="mt-auto border-t border-slate-100 pt-3">
        <div className="flex items-center gap-2.5 px-1">
          <Avatar className="h-7 w-7">
            {session?.user?.image ? (
              <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
            ) : (
              <AvatarFallback className="bg-slate-100 text-xs text-slate-600">{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-slate-900">{session?.user?.name || "…"}</div>
            <div className="truncate text-xs text-slate-500">{session?.user?.email || ""}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-2 h-8 w-full justify-start px-2 text-sm font-normal text-slate-500 hover:bg-slate-50 hover:text-slate-900"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          Log out
        </Button>
      </div>
    </nav>
  );
}
