"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Shield, ShieldOff, MoreHorizontal, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// TODO: Hook up to actual supabase admin API
// import { supabaseAdmin } from "@/lib/supabase-admin"

interface UserDisplay {
    id: string;
    name: string;
    email: string;
    image: string;
    role: "admin" | "user";
    createdAt: string;
    level: number;
    xp: number;
    rp: number;
    tier: string;
    problems_solved: number;
}

interface CategoryStat {
    category_name: string;
    ranking_points: number;
    tier: string;
}

interface ActivityLog {
    id: string;
    action_type: string;
    xp_change: number;
    rp_change: number;
    description: string;
    created_at: string;
    problem_title?: string;
}

interface UserDetails {
    categoryStats: CategoryStat[];
    logs: ActivityLog[];
}

export default function UsersManagementPage() {
    const [users, setUsers] = useState<UserDisplay[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Details Sheet State
    const [selectedUser, setSelectedUser] = useState<UserDisplay | null>(null);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [isDetailsLoading, setIsDetailsLoading] = useState(false);

    // Points Adjustment State
    const [xpAdjust, setXpAdjust] = useState("");
    const [rpAdjust, setRpAdjust] = useState("");
    const [adjustReason, setAdjustReason] = useState("");

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users || []);
            }
        } catch (error) {
            console.error("Failed to fetch admin users", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleToggleRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as "admin" | "user" } : u));

        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, newRole })
            });
            if (!res.ok) {
                throw new Error("Failed to update role");
            }
        } catch (error) {
            console.error(error);
            // Revert on failure
            setUsers(users.map(u => u.id === userId ? { ...u, role: currentRole as "admin" | "user" } : u));
        }
    };

    const handleViewDetails = async (user: UserDisplay) => {
        setSelectedUser(user);
        setUserDetails(null);
        setIsDetailsLoading(true);
        setXpAdjust("");
        setRpAdjust("");
        setAdjustReason("");

        try {
            const res = await fetch(`/api/admin/users/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setUserDetails(data);
            }
        } catch (error) {
            console.error("Failed to fetch user details", error);
        } finally {
            setIsDetailsLoading(false);
        }
    };

    const handleAdjustPoints = async () => {
        if (!selectedUser) return;
        
        const xpNum = parseInt(xpAdjust) || 0;
        const rpNum = parseInt(rpAdjust) || 0;
        
        if (xpNum === 0 && rpNum === 0) return;

        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}/points`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    xp_change: xpNum, 
                    rp_change: rpNum,
                    description: adjustReason || 'Admin adjustment'
                })
            });
            
            if (res.ok) {
                // Refresh details
                handleViewDetails(selectedUser);
                // Also refresh main list
                fetchUsers();
                setXpAdjust("");
                setRpAdjust("");
                setAdjustReason("");
            }
        } catch (error) {
            console.error("Failed to adjust points", error);
        }
    };

    const filteredUsers = users.filter(u =>
        u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage user accounts and administrative roles.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search users by name or email..."
                            className="pl-9 bg-white border-gray-300"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Progression</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
                                        <p className="text-sm text-gray-500">Loading users...</p>
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                        No users found matching &quot;{searchQuery}&quot;
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                                    alt=""
                                                    className="w-10 h-10 rounded-full bg-gray-100"
                                                />
                                                <div>
                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? "default" : "secondary"} className={user.role === 'admin' ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100' : 'bg-gray-100 text-gray-600'}>
                                                {user.role === 'admin' ? (
                                                    <Shield className="w-3 h-3 mr-1" />
                                                ) : null}
                                                {user.role.toUpperCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="bg-blue-600">{user.tier}</Badge>
                                                    <span className="text-sm font-semibold">Lv.{user.level}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {user.xp.toLocaleString()} XP • {user.rp?.toLocaleString() || 0} RP • {user.problems_solved} Solved
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-white shadow-lg border border-gray-200">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleViewDetails(user)}
                                                        className="cursor-pointer"
                                                    >
                                                        View Details
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleToggleRole(user.id, user.role)}
                                                        className="cursor-pointer"
                                                    >
                                                        {user.role === 'admin' ? (
                                                            <><ShieldOff className="w-4 h-4 mr-2" /> Remove Admin</>
                                                        ) : (
                                                            <><Shield className="w-4 h-4 mr-2" /> Make Admin</>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Custom Side Sheet for User Details */}
            {selectedUser && (
                <>
                    {/* Backdrop */}
                    <div 
                        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
                        onClick={() => setSelectedUser(null)}
                    />
                    
                    {/* Sheet */}
                    <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col">
                        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="font-bold text-lg">{selectedUser.name}</h3>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>✕</Button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Overview */}
                            <div>
                                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Global Progression</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                                        <div className="text-xs text-blue-600 font-medium">Level</div>
                                        <div className="text-lg font-bold">{selectedUser.level}</div>
                                    </div>
                                    <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                                        <div className="text-xs text-indigo-600 font-medium">Tier</div>
                                        <div className="text-lg font-bold">{selectedUser.tier}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="text-xs text-gray-500 font-medium">Total XP</div>
                                        <div className="text-lg font-bold">{selectedUser.xp.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                                        <div className="text-xs text-gray-500 font-medium">Total RP</div>
                                        <div className="text-lg font-bold">{selectedUser.rp?.toLocaleString() || 0}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Manual Points Adjustment */}
                            <div className="bg-yellow-50/50 p-4 rounded-xl border border-yellow-200">
                                <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                                    Adjust Points (Admin)
                                </h4>
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-600 mb-1 block">XP Change (+/-)</label>
                                            <Input type="number" placeholder="e.g. 500" value={xpAdjust} onChange={e => setXpAdjust(e.target.value)} className="bg-white" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs text-gray-600 mb-1 block">RP Change (+/-)</label>
                                            <Input type="number" placeholder="e.g. 50" value={rpAdjust} onChange={e => setRpAdjust(e.target.value)} className="bg-white" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600 mb-1 block">Reason (Logged)</label>
                                        <Input placeholder="e.g. Event winner bonus" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} className="bg-white" />
                                    </div>
                                    <Button onClick={handleAdjustPoints} className="w-full bg-yellow-600 hover:bg-yellow-700 text-white">Apply Adjustment</Button>
                                </div>
                            </div>

                            {isDetailsLoading ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-indigo-500" /></div>
                            ) : userDetails ? (
                                <>
                                    {/* Category Stats */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Domain Mastery</h4>
                                        {userDetails.categoryStats.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No category data yet.</p>
                                        ) : (
                                            <div className="space-y-2">
                                                {userDetails.categoryStats.map((cat, i) => (
                                                    <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-100">
                                                        <span className="text-sm font-medium">{cat.category_name}</span>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-gray-500">{cat.ranking_points} RP</span>
                                                            <Badge variant="outline" className="text-xs">{cat.tier}</Badge>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Activity Logs */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Recent Activity</h4>
                                        {userDetails.logs.length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No activity logs.</p>
                                        ) : (
                                            <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-gray-200 ml-2">
                                                {userDetails.logs.map((log) => (
                                                    <div key={log.id} className="relative pl-6">
                                                        <div className="absolute left-1 top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-white" />
                                                        <div className="text-xs text-gray-500 mb-0.5">{new Date(log.created_at).toLocaleString()}</div>
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {log.action_type === 'PROBLEM_SOLVED' ? `Solved: ${log.problem_title}` : log.description}
                                                        </div>
                                                        <div className="text-xs text-indigo-600 font-medium mt-0.5">
                                                            {log.xp_change > 0 ? `+${log.xp_change} XP` : log.xp_change < 0 ? `${log.xp_change} XP` : ''} 
                                                            {log.rp_change !== 0 ? ` • ${log.rp_change > 0 ? '+' : ''}${log.rp_change} RP` : ''}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : null}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
