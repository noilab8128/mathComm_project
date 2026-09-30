"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import SideNav from "@/components/SideNav";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { Loader2, Zap, Target, Flame, CheckCircle, TrendingUp, Calendar, Hash } from "lucide-react";

interface StatsData {
  hero: {
    totalXp: number;
    solvedCount: number;
    currentStreak: number;
    accuracy: number;
  };
  mastery: { topic: string; score: number }[];
  history: any[];
  difficultyProgress: { name: string; solved: number; attempted: number }[];
  activity: { date: string; count: number }[];
}

export default function StatsPage() {
  const { data: session, status } = useSession();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  useEffect(() => {
    if (status === "loading") return;

    async function fetchStats() {
      try {
        const res = await fetch("/api/user/stats");
        if (res.ok) {
          const json = await res.json();
          setData(json);
          // Auto-select up to 4 categories initially, but respect user's last choice via localStorage
          if (json.history && json.history.length > 0) {
            const allCats = Object.keys(json.history[0]).filter(k => k !== 'date');
            
            // Only show categories that have at least some performance > 0 in history
            const validCats = allCats.filter(cat => {
              // Using any to bypass strict type check for dynamic object keys
              return json.history.some((dayObj: any) => parseFloat(dayObj[cat]) > 0);
            });
            
            setAvailableCategories(validCats);

            let initialCategories = validCats.slice(0, 4);

            if (session?.user?.id) {
              try {
                const saved = localStorage.getItem(`stats_active_categories_${session.user.id}`);
                if (saved) {
                  const parsed = JSON.parse(saved);
                  // Ensure saved values actually exist in validCats
                  const validSaved = parsed.filter((c: string) => validCats.includes(c));
                  if (validSaved.length > 0) {
                    initialCategories = validSaved;
                  }
                }
              } catch (e) {
                console.error("Failed to parse saved categories", e);
              }
            }
            
            setActiveCategories(initialCategories);
          }
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [status, session?.user?.id]);

  return (
    <div className="flex flex-col min-h-screen w-full bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <Header />
      <div className="flex flex-1">
        <SideNav active="stats" isAdmin={session?.user?.role === 'admin'} />
        <main className="flex-1 overflow-auto p-4 lg:p-6 pb-20">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Header Area */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Your Learning Statistics</h1>
                <p className="text-muted-foreground text-sm mt-1">Track your mathematical journey and skill progression.</p>
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mb-4" />
                <p className="text-sm text-gray-500">Compiling your performance metrics...</p>
              </div>
            ) : !data ? (
              <div className="text-center py-20 bg-gray-50 rounded-xl border border-gray-100">
                <p className="text-gray-500">Failed to load statistics.</p>
              </div>
            ) : (
              <>
                {/* Hero Metrics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard title="Total XP" value={data.hero.totalXp.toLocaleString()} icon={<Zap className="h-4 w-4 text-amber-500" />} />
                  <MetricCard title="Problems Solved" value={data.hero.solvedCount} icon={<CheckCircle className="h-4 w-4 text-emerald-500" />} />
                  <MetricCard title="Current Streak" value={`${data.hero.currentStreak} Days`} icon={<Flame className="h-4 w-4 text-orange-500" />} />
                  <MetricCard title="Accuracy" value={`${data.hero.accuracy.toFixed(1)}%`} icon={<Target className="h-4 w-4 text-indigo-500" />} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column (Radar + Difficulty) */}
                  <div className="space-y-6 lg:col-span-1">
                    <Card className="shadow-sm border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <CompassIcon className="h-4 w-4 text-indigo-500" />
                          Skill Radar
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="h-64 pt-0">
                        {data.mastery.length === 0 ? (
                          <EmptyState message="Solve topics to build your radar" />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data.mastery}>
                              <PolarGrid stroke="#e5e7eb" />
                              <PolarAngleAxis dataKey="topic" tick={{ fill: '#6b7280', fontSize: 11 }} />
                              <PolarRadiusAxis angle={30} domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 10 }} />
                              <Radar name="Level" dataKey="score" stroke="#6366f1" fill="#818cf8" fillOpacity={0.4} />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-rose-500" />
                          Difficulty Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {data.difficultyProgress.map((tier) => {
                          const percentage = tier.attempted > 0 ? (tier.solved / tier.attempted) * 100 : 0;
                          return (
                            <div key={tier.name} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-medium text-gray-700">{tier.name}</span>
                                <span className="text-gray-500">{tier.solved} / {tier.attempted}</span>
                              </div>
                              <Progress value={percentage} className="h-2" />
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Right Column (History + Activity) */}
                  <div className="space-y-6 lg:col-span-2">
                    <Card className="shadow-sm border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-indigo-500" />
                            Growth History
                          </CardTitle>
                        </div>
                        {data.history.length > 0 && availableCategories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {availableCategories.map(cat => {
                              const isActive = activeCategories.includes(cat);
                              return (
                                <button
                                  key={cat}
                                  onClick={() => {
                                    setActiveCategories(prev => {
                                      const next = isActive ? prev.filter(c => c !== cat) : [...prev, cat];
                                      // Save preference to localStorage
                                      if (session?.user?.id) {
                                        try {
                                          localStorage.setItem(`stats_active_categories_${session.user.id}`, JSON.stringify(next));
                                        } catch (e) {
                                          console.error("Failed to save categories", e);
                                        }
                                      }
                                      return next;
                                    });
                                  }}
                                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                                    isActive 
                                      ? "bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200" 
                                      : "bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100"
                                  }`}
                                >
                                  {cat}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="h-64">
                        {data.history.length === 0 ? (
                          <EmptyState message="No growth history available yet" />
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                              <XAxis dataKey="date" tick={{ fill: '#9ca3af', fontSize: 11 }} tickFormatter={(val) => val.split('-').slice(1).join('/')} />
                              <YAxis domain={[0, 10]} tick={{ fill: '#9ca3af', fontSize: 11 }} />
                              <Tooltip 
                                contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                labelStyle={{ fontWeight: 'bold', color: '#374151' }}
                              />
                              <Legend wrapperStyle={{ fontSize: 12 }} />
                              
                              {/* Render only active and valid categories */}
                              {availableCategories.filter(k => activeCategories.includes(k)).map((key, i) => {
                                const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#8b5cf6', '#14b8a6', '#f43f5e', '#84cc16', '#06b6d4'];
                                return (
                                  <Line 
                                    key={key} 
                                    type="monotone" 
                                    dataKey={key} 
                                    stroke={colors[i % colors.length]} 
                                    strokeWidth={2} 
                                    dot={{ r: 3, strokeWidth: 1 }} 
                                    activeDot={{ r: 5 }} 
                                  />
                                );
                              })}
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </CardContent>
                    </Card>

                    <Card className="shadow-sm border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-purple-500" />
                          Activity Heatmap (Last 90 Days)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {/* Standard grid format for 90 days usually requires columns for weeks */}
                        {/* We use flex layout designed to break cleanly into a dense block */}
                        <div className="flex flex-wrap gap-1.5 justify-start max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                          {data.activity.map((day, i) => {
                            let bgClass = "bg-gray-100";
                            let tooltext = "No activity";
                            
                            if (day.count > 0) {
                              bgClass = "bg-indigo-200";
                              tooltext = `${day.count} activities`;
                            }
                            if (day.count > 2) bgClass = "bg-indigo-400";
                            if (day.count > 4) {
                              bgClass = "bg-indigo-600";
                              tooltext = `${day.count} activities (On Fire!)`;
                            }

                            // Calculate month names for tooltip enhancement
                            const dateObj = new Date(day.date);
                            const monthStr = dateObj.toLocaleString('default', { month: 'short', day: 'numeric', year: 'numeric' });

                            return (
                              <div 
                                key={i} 
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm ${bgClass} transition-colors hover:ring-2 ring-offset-1 ring-indigo-300 cursor-pointer`}
                                title={`${monthStr}: ${tooltext}`}
                              />
                            );
                          })}
                        </div>
                        <div className="mt-3 flex items-center justify-end gap-2 text-xs text-gray-500">
                          <span>Less</span>
                          <div className="flex gap-1">
                            <div className="w-3 h-3 rounded-sm bg-gray-100"></div>
                            <div className="w-3 h-3 rounded-sm bg-indigo-200"></div>
                            <div className="w-3 h-3 rounded-sm bg-indigo-400"></div>
                            <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                          </div>
                          <span>More</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}
            
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-4 flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
        </div>
        <div className="mt-2">
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function CompassIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
    </svg>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50/50 rounded-lg border border-dashed border-gray-200">
      <p className="text-sm text-gray-400">{message}</p>
    </div>
  );
}
