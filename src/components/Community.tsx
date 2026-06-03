"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Discussions from "./Discussions";

// ------------------------------------------------------------
// Utility data (mock)
// ------------------------------------------------------------
export type CommunityTab = "discussions" | "theory" | "leaderboard" | "peer";

type CommunityProps = {
  activeTab?: CommunityTab;
  onTabChange?: (tab: CommunityTab) => void;
};

const leaderboard = [
  { name: "Ada L.", xp: 12450, streak: 21 },
  { name: "Carl F.", xp: 11880, streak: 12 },
  { name: "M. Seo", xp: 10320, streak: 8 },
  { name: "Noether E.", xp: 9920, streak: 5 },
];

// ------------------------------------------------------------
// Small components
// ------------------------------------------------------------
function LeaderboardCard() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top Solvers (This Week)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leaderboard.map((u, i) => (
            <div key={u.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Badge variant="secondary" className="w-6 justify-center">
                  {i + 1}
                </Badge>
                <div className="font-medium">{u.name}</div>
              </div>
              <div className="text-sm text-muted-foreground">
                XP {u.xp} | Streak {u.streak}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function Community({ activeTab = "discussions", onTabChange }: CommunityProps) {
  const handleTabChange = (value: string) => {
    onTabChange?.(value as CommunityTab);
  };

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <TabsList>
          <TabsTrigger value="discussions">Problem Discussions</TabsTrigger>
          <TabsTrigger value="theory">Theory Q&amp;A</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="peer">Peer Review</TabsTrigger>
        </TabsList>
        <TabsContent value="discussions" className="mt-4">
          <Discussions category="discussions" title="Problem Discussions" description="Discuss problems, share hints, and help each other." />
        </TabsContent>
        <TabsContent value="theory" className="mt-4">
          <Discussions category="theory" title="Theory Q&A" description="Ask questions about mathematical concepts and theorems." />
        </TabsContent>
        <TabsContent value="leaderboard" className="mt-4">
          <LeaderboardCard />
        </TabsContent>
        <TabsContent value="peer" className="mt-4">
          <Discussions category="peer" title="Peer Review" description="Submit your solutions for community feedback." />
        </TabsContent>
      </Tabs>
    </div>
  );
}
