"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Eye, EyeOff, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";

interface Notice {
    id: string;
    title: string;
    is_published: boolean;
    created_at: string;
}

export default function NoticesManagementPage() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    // Editor State
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [isPublished, setIsPublished] = useState(true);

    useEffect(() => {
        // Mock data fetch - replace with supabase API
        const loadNotices = () => {
            setTimeout(() => {
                setNotices([
                    { id: "1", title: "Welcome to MathQuest Beta!", is_published: true, created_at: new Date().toISOString() },
                    { id: "2", title: "Scheduled Maintenance this weekend", is_published: false, created_at: new Date(Date.now() - 86400000).toISOString() },
                ]);
                setIsLoading(false);
            }, 600);
        };
        loadNotices();
    }, []);

    const handleSaveNotice = () => {
        if (!title.trim()) return;

        if (editId) {
            setNotices(notices.map(n => n.id === editId ? { ...n, title, is_published: isPublished } : n));
        } else {
            setNotices([{
                id: Math.random().toString(),
                title,
                is_published: isPublished,
                created_at: new Date().toISOString()
            }, ...notices]);
        }

        setIsEditorOpen(false);
        resetEditor();
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this notice?")) {
            setNotices(notices.filter(n => n.id !== id));
        }
    };

    const handleEdit = (notice: Notice) => {
        setEditId(notice.id);
        setTitle(notice.title);
        setContent("Mock content for " + notice.title); // In reality, fetch full content
        setIsPublished(notice.is_published);
        setIsEditorOpen(true);
    };

    const resetEditor = () => {
        setEditId(null);
        setTitle("");
        setContent("");
        setIsPublished(true);
    };

    const filteredNotices = notices.filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Notices & Announcements</h2>
                    <p className="text-sm text-gray-500 mt-1">Manage platform-wide announcements.</p>
                </div>

                <Dialog open={isEditorOpen} onOpenChange={(open) => {
                    setIsEditorOpen(open);
                    if (!open) resetEditor();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                            <Plus className="w-4 h-4 mr-2" />
                            New Notice
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{editId ? "Edit Notice" : "Create New Notice"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Title</label>
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Enter announcement title..."
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Content (Markdown)</label>
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full min-h-[300px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y font-mono text-sm"
                                    placeholder="# Big Announcement\n\nWrite your content here..."
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="publish-toggle"
                                    checked={isPublished}
                                    onChange={(e) => setIsPublished(e.target.checked)}
                                    className="rounded text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="publish-toggle" className="text-sm font-medium cursor-pointer">
                                    Publish immediately
                                </label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditorOpen(false)}>Cancel</Button>
                            <Button onClick={handleSaveNotice} className="bg-indigo-600 hover:bg-indigo-700">Save Notice</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50/50">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search notices..."
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
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Date Created</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-indigo-600 mb-2" />
                                        <p className="text-sm text-gray-500">Loading notices...</p>
                                    </TableCell>
                                </TableRow>
                            ) : filteredNotices.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-32 text-center text-gray-500">
                                        No notices found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredNotices.map((notice) => (
                                    <TableRow key={notice.id}>
                                        <TableCell className="font-medium text-gray-900">
                                            {notice.title}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={notice.is_published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-600 border-gray-200'}>
                                                {notice.is_published ? (
                                                    <><Eye className="w-3 h-3 mr-1" /> Published</>
                                                ) : (
                                                    <><EyeOff className="w-3 h-3 mr-1" /> Draft</>
                                                )}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-500 text-sm">
                                            {new Date(notice.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEdit(notice)} className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" onClick={() => handleDelete(notice.id)} className="text-red-600 hover:bg-red-50 hover:text-red-700">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
