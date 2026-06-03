/* eslint-disable */
// @ts-nocheck
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Problem } from "../types";
import { getDifficultyLabel } from "@/lib/supabase";
import { LearningPathView } from "./LearningPathView";

interface ProblemListProps {
    problems: Problem[];
    viewMode: "list" | "grid" | "learning-path";
    selectedProblem: Problem | null;
    expandedProblems: Set<string>;
    draggedProblemId: string | null;
    dropTargetId: string | null;
    linkEditMode: boolean;
    linkEditSourceId: string | null;
    linkEditSourcePosition: { x: number, y: number } | null;
    mousePosition: { x: number, y: number } | null;
    currentPage: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    isLoadingFromDb: boolean;
    selectedProblemIds: Set<string>;
    onSelectProblem: (problem: Problem) => void;
    onDeleteProblem: (id: string) => void;
    onToggleExpanded: (id: string) => void;
    onPageChange: (page: number) => void;
    onDragStart: (e: React.DragEvent, problemId: string) => void;
    onDragEnd: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent, problemId: string) => void;
    onDragLeave: (e: React.DragEvent, problemId: string) => void;
    onDrop: (e: React.DragEvent, targetProblemId: string) => void;
    onStartLinkEdit: (e: React.MouseEvent, problemId: string) => void;
    onCancelLinkEdit: () => void;
    onChangeLinkParent: (newParentId: string) => void;
    onMouseMove: (e: React.MouseEvent) => void;
    toggleProblemSelection: (id: string) => void;
    selectAllProblems: (ids: string[]) => void;
    clearSelection: () => void;
    sortBy: "newest" | "oldest" | "difficulty_asc" | "difficulty_desc";
    onSortChange: (sort: "newest" | "oldest" | "difficulty_asc" | "difficulty_desc") => void;
    onApproveProblem?: (id: string) => void;
}

export function ProblemList({
    problems,
    viewMode,
    selectedProblem,
    expandedProblems,
    draggedProblemId,
    dropTargetId,
    linkEditMode,
    linkEditSourceId,
    linkEditSourcePosition,
    mousePosition,
    currentPage,
    pageSize,
    totalCount,
    totalPages,
    isLoadingFromDb,
    onSelectProblem,
    onDeleteProblem,
    onToggleExpanded,
    onPageChange,
    onDragStart,
    onDragEnd,
    onDragOver,
    onDragLeave,
    onDrop,
    onStartLinkEdit,
    onCancelLinkEdit,
    onChangeLinkParent,
    onMouseMove,
    selectedProblemIds,
    toggleProblemSelection,
    selectAllProblems,
    clearSelection,
    sortBy,
    onSortChange,
    onApproveProblem
}: ProblemListProps) {

    const getDifficultyColor = (diff: number) => {
        if (diff <= 3) return "bg-green-100 text-green-800 border-green-200";
        if (diff <= 6) return "bg-yellow-100 text-yellow-800 border-yellow-200";
        return "bg-red-100 text-red-800 border-red-200";
    };

    return (
        <div className="w-full">
            <Card className="bg-white rounded-lg shadow-sm border border-gray-200">
                <CardContent className="p-0">
                    <ScrollArea className="h-[600px]">
                        <div className={viewMode === "learning-path" ? "p-6" : "space-y-2 p-4"}>
                            {problems.filter(p => !p.parentProblemId).length === 0 ? (
                                <div className="text-center text-gray-500 py-8">
                                    <p className="text-sm">No problems found</p>
                                </div>
                            ) : viewMode === "learning-path" ? (
                                /* Learning Path View - React Flow */
                                <LearningPathView
                                    problems={problems}
                                    selectedProblem={selectedProblem}
                                    onSelectProblem={onSelectProblem}
                                    onChangeLinkParent={onChangeLinkParent}
                                />
                            ) : (
                                /* Table View */
                                <div>
                                    {selectedProblemIds.size > 0 && (
                                        <div className="bg-blue-50 p-2 mb-2 rounded-md flex items-center justify-between border border-blue-100">
                                            <span className="text-sm text-blue-700 font-medium px-2">
                                                {selectedProblemIds.size} problems selected
                                            </span>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to delete ${selectedProblemIds.size} problems?`)) {
                                                            selectedProblemIds.forEach(id => onDeleteProblem(id));
                                                            clearSelection();
                                                        }
                                                    }}
                                                >
                                                    Delete Selected
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={clearSelection}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="w-[50px]">
                                                    <input
                                                        type="checkbox"
                                                        onChange={(e) => {
                                                            if (e.target.checked) {
                                                                selectAllProblems(problems.map(p => p.id));
                                                            } else {
                                                                clearSelection();
                                                            }
                                                        }}
                                                        checked={problems.length > 0 && problems.every(p => selectedProblemIds.has(p.id))}
                                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                    />
                                                </TableHead>
                                                <TableHead>Title</TableHead>
                                                <TableHead>Source</TableHead>
                                                <TableHead>Category</TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => {
                                                        if (sortBy === 'difficulty_asc') onSortChange('difficulty_desc');
                                                        else onSortChange('difficulty_asc');
                                                    }}
                                                >
                                                    Difficulty {sortBy === 'difficulty_asc' ? '↑' : sortBy === 'difficulty_desc' ? '↓' : ''}
                                                </TableHead>
                                                <TableHead>Linked</TableHead>
                                                <TableHead
                                                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                                                    onClick={() => {
                                                        if (sortBy === 'newest') onSortChange('oldest');
                                                        else onSortChange('newest');
                                                    }}
                                                >
                                                    Created {sortBy === 'newest' ? '↓' : sortBy === 'oldest' ? '↑' : ''}
                                                </TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {(() => {
                                                const renderProblemRow = (problem: Problem, depth: number = 0): React.ReactNode[] => {
                                                    const childProblems = problems.filter(p => p.parentProblemId === problem.id);

                                                    // Group by stage/solution
                                                    const groups = new Map<string, Problem[]>();
                                                    childProblems.forEach(p => {
                                                        const groupKey = p.hierarchyInfo?.stageName || "General";
                                                        if (!groups.has(groupKey)) groups.set(groupKey, []);
                                                        groups.get(groupKey)!.push(p);
                                                    });

                                                    // Sort groups by sequence order of first item
                                                    const sortedGroups = Array.from(groups.entries()).sort((a, b) => {
                                                        const seqA = a[1][0].hierarchyInfo?.sequenceOrder || 0;
                                                        const seqB = b[1][0].hierarchyInfo?.sequenceOrder || 0;
                                                        return seqA - seqB;
                                                    });

                                                    // Sort children in each group by difficulty DESCENDING (Standard -> Easier)
                                                    for (const group of sortedGroups) {
                                                        group[1].sort((a, b) => b.difficulty - a.difficulty);
                                                    }

                                                    const explicitLinkedProblems = problem.linkedProblems
                                                        ? problems.filter(p =>
                                                            problem.linkedProblems?.includes(p.id) &&
                                                            p.parentProblemId !== problem.id
                                                        )
                                                        : [];
                                                    const allLinkedProblems = [...childProblems, ...explicitLinkedProblems];
                                                    const isSelected = selectedProblemIds.has(problem.id);
                                                    const isExpanded = expandedProblems.has(problem.id);
                                                    const hasChildren = childProblems.length > 0;

                                                    const rows: React.ReactNode[] = [
                                                        <TableRow
                                                            key={problem.id}
                                                            className={`cursor-pointer ${isSelected ? "bg-blue-50" : ""} hover:bg-gray-50`}
                                                            onClick={() => onSelectProblem(problem)}
                                                        >
                                                            <TableCell onClick={(e) => e.stopPropagation()} className="w-[50px]">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isSelected}
                                                                    onChange={() => toggleProblemSelection(problem.id)}
                                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                                />
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
                                                                    {hasChildren && (
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                onToggleExpanded(problem.id);
                                                                            }}
                                                                            className="p-1 hover:bg-gray-200 rounded text-gray-500 w-6 h-6 flex items-center justify-center transition-transform"
                                                                        >
                                                                            {isExpanded ? '▼' : '▶'}
                                                                        </button>
                                                                    )}
                                                                    {!hasChildren && <div className="w-6" />} {/* Spacer */}

                                                                    {depth > 0 && <span className="text-gray-400">↳</span>}

                                                                    <span className={depth > 0 ? "text-gray-600" : "text-gray-900"}>
                                                                        {problem.title}
                                                                    </span>

                                                                    {problem.isGenerated && (
                                                                        <Badge variant="secondary" className={`text-xs ${problem.isReviewed ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>
                                                                            {problem.isReviewed ? "AI (Reviewed)" : "AI (Pending Review)"}
                                                                        </Badge>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                {problem.source ? (
                                                                    <Badge 
                                                                        variant="outline" 
                                                                        className={`text-[10px] px-1.5 py-0 h-5 font-normal uppercase tracking-tight ${
                                                                            problem.source.toLowerCase().includes('ai') 
                                                                            ? "bg-purple-50 text-purple-600 border-purple-200" 
                                                                            : "bg-gray-50 text-gray-500 border-gray-200"
                                                                        }`}
                                                                    >
                                                                        {problem.source}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-gray-300 text-xs">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>{problem.category}</TableCell>
                                                            <TableCell>
                                                                <Badge className={`text-xs ${getDifficultyColor(problem.difficulty)} border`}>
                                                                    D{problem.difficulty}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {allLinkedProblems.length > 0 ? (
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {allLinkedProblems.length}
                                                                    </Badge>
                                                                ) : (
                                                                    <span className="text-gray-400">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell className="text-gray-500 text-xs">
                                                                {new Date(problem.createdAt).toLocaleDateString()}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {problem.isGenerated && !problem.isReviewed && onApproveProblem && (
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onApproveProblem(problem.id);
                                                                        }}
                                                                        className="text-green-600 hover:text-green-800 hover:bg-green-50 mr-2"
                                                                    >
                                                                        Approve
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onDeleteProblem(problem.id);
                                                                    }}
                                                                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                                                                >
                                                                    Delete
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ];

                                                    if (isExpanded && hasChildren) {
                                                        // Render groups
                                                        sortedGroups.forEach(([groupName, groupProblems]) => {

                                                            // If multiple groups, show separator/header
                                                            if (sortedGroups.length > 1) {
                                                                rows.push(
                                                                    <TableRow key={`group-${problem.id}-${groupName}`} className="bg-gray-50/50">
                                                                        <TableCell colSpan={8} className="py-1">
                                                                            <div className="flex items-center gap-2 text-xs font-semibold text-blue-600/80 uppercase tracking-wider" style={{ paddingLeft: `${(depth + 1) * 24 + 20}px` }}>
                                                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                                                                                Stage: {groupName}
                                                                            </div>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            }

                                                            groupProblems.forEach(child => {
                                                                rows.push(...renderProblemRow(child, depth + 1));
                                                            });
                                                        });
                                                    }

                                                    return rows;
                                                };

                                                // Only render root problems at the top level
                                                return problems
                                                    .filter(p => !p.parentProblemId)
                                                    .map(root => renderProblemRow(root));
                                            })()}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Pagination Controls */}
                    <div className="flex items-center justify-between p-4 border-t bg-gray-50">
                        <div className="text-sm text-gray-500">
                            Showing {totalCount === 0 ? 0 : ((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} problems
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1 || isLoadingFromDb}
                            >
                                Previous
                            </Button>
                            <div className="flex items-center gap-1">
                                <span className="text-sm text-gray-600 px-2">
                                    Page {currentPage} of {totalPages || 1}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages || isLoadingFromDb}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
