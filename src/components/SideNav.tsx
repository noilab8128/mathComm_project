"use client"
import React from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Crown, Network, Users, Brain, Home, LineChart, ShieldAlert } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function SideNav({ active, onChange, isAdmin }: { active: string; onChange?: (k: string) => void, isAdmin: boolean }) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { key: "dashboard", label: "Home", icon: <Home className="h-4 w-4" />, href: "/dashboard" },
    { key: "skill-tree", label: "Skill Tree", icon: <Network className="h-4 w-4" />, href: "/dashboard" },
    { key: "problems", label: "Problems", icon: <Brain className="h-4 w-4" />, href: "/dashboard" },
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
    <div className="h-full w-64 border-r bg-white/60 backdrop-blur p-3 hidden xl:flex xl:flex-col shrink-0 min-h-[calc(100vh-64px)]">
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
            onClick={() => handleNav(it)}
            className={`w-full flex items-center gap-2 rounded-xl px-3 py-2 text-left hover:bg-muted ${active === it.key ? "bg-muted text-indigo-700 font-semibold" : "text-gray-700 font-medium"}`}
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
            <Avatar className="h-8 w-8">
              {session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={session.user.name || "User"} />
              ) : (
                <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
              )}
            </Avatar>
            <div className="overflow-hidden">
              <div className="text-sm font-medium truncate">{session?.user?.name || "Loading..."}</div>
              <div className="text-xs text-muted-foreground truncate">{session?.user?.email || "Loading..."}</div>
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
