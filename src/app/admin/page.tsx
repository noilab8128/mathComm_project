/* eslint-disable */
"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, FileQuestion, BookOpen, Clock, Activity, TrendingUp, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface DashboardMetrics {
    totalUsers: number;
    activeProblems: number;
    publishedNotices: number;
}

export default function AdminOverviewPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchMetrics = async () => {
            try {
                const res = await fetch('/api/admin/metrics');
                if (res.ok) {
                    const data = await res.json();
                    setMetrics({
                        totalUsers: data.totalUsers,
                        activeProblems: data.activeProblems,
                        publishedNotices: data.publishedNotices,
                    });
                }
            } catch (error) {
                console.error("Failed to fetch admin metrics", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMetrics();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2 mb-8">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900">Welcome Back, Admin.</h2>
                <p className="text-gray-500">Here's a quick overview of what's happening today.</p>
            </div>

            {/* Key Metrics Grid */}
            {isLoading ? (
                <div className="flex justify-center items-center h-32">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <MetricCard
                        title="Total Users"
                        value={metrics?.totalUsers.toLocaleString() || "0"}
                        icon={<Users className="w-5 h-5 text-blue-600" />}
                        trend="+12% this month"
                        trendUp={true}
                        colorClass="bg-blue-50"
                    />
                    <MetricCard
                        title="Active Problems"
                        value={metrics?.activeProblems.toLocaleString() || "0"}
                        icon={<FileQuestion className="w-5 h-5 text-indigo-600" />}
                        trend="+54 this week"
                        trendUp={true}
                        colorClass="bg-indigo-50"
                    />
                    <MetricCard
                        title="Published Notices"
                        value={metrics?.publishedNotices.toLocaleString() || "0"}
                        icon={<BookOpen className="w-5 h-5 text-emerald-600" />}
                        trend="2 pending"
                        trendUp={false}
                        colorClass="bg-emerald-50"
                    />
                    <MetricCard
                        title="Peak Online Time"
                        value="14:00"
                        icon={<Clock className="w-5 h-5 text-purple-600" />}
                        trend="Daily average"
                        trendUp={true}
                        colorClass="bg-purple-50"
                    />
                </div>
            )}

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <Card className="lg:col-span-2 shadow-sm border-gray-200">
                    <CardHeader className="bg-white rounded-t-xl border-b border-gray-100 pb-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Recent User Activity</CardTitle>
                                <CardDescription>Activity logs over the last 24 hours</CardDescription>
                            </div>
                            <Activity className="w-5 h-5 text-gray-400" />
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="flex items-center justify-center p-12 text-gray-400 bg-gray-50/50 rounded-b-xl border-t border-gray-100/50">
                            <div className="text-center">
                                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                                <p className="text-sm">Activity charts and graphs will appear here.</p>
                                <p className="text-xs mt-1">Implement recharts here for analytics visualization.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-200">
                    <CardHeader className="bg-white rounded-t-xl border-b border-gray-100 pb-4">
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                        <CardDescription>Shortcut to common tasks</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4 flex flex-col gap-3 bg-gray-50/50 rounded-b-xl">
                        <Link href="/admin/problems">
                            <Button className="w-full justify-start bg-white text-gray-700 border border-gray-200 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 shadow-sm transition-all h-12">
                                <FileQuestion className="w-4 h-4 mr-3" />
                                Manage Problem Database
                            </Button>
                        </Link>
                        <Link href="/admin/users">
                            <Button className="w-full justify-start bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 shadow-sm transition-all h-12">
                                <Users className="w-4 h-4 mr-3" />
                                Review User Roles
                            </Button>
                        </Link>
                        <Link href="/admin/notices">
                            <Button className="w-full justify-start bg-white text-gray-700 border border-gray-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 shadow-sm transition-all h-12">
                                <BookOpen className="w-4 h-4 mr-3" />
                                Post New Announcement
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function MetricCard({ title, value, icon, trend, trendUp, colorClass }: { title: string, value: string, icon: React.ReactNode, trend: string, trendUp: boolean, colorClass: string }) {
    return (
        <Card className="shadow-sm border-gray-100 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl ${colorClass}`}>
                        {icon}
                    </div>
                </div>
                <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
                    <div className="text-3xl font-bold tracking-tight text-gray-900 mb-2">{value}</div>
                    <div className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-gray-500'}`}>
                        {trend}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
