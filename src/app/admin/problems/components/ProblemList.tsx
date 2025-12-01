import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Problem } from "../types";
import { getDifficultyLabel } from "@/lib/supabase";

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
    onMouseMove
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
                                /* Learning Path View */
                                <div
                                    className="w-full overflow-x-auto relative"
                                    onMouseMove={onMouseMove}
                                    onClick={() => {
                                        if (linkEditMode) {
                                            onCancelLinkEdit();
                                        }
                                    }}
                                >
                                    {/* Visual Link Line */}
                                    {linkEditMode && linkEditSourcePosition && mousePosition && (
                                        <svg
                                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                                            style={{ zIndex: 9999 }}
                                        >
                                            <defs>
                                                <marker
                                                    id="arrowhead-link-edit"
                                                    markerWidth="10"
                                                    markerHeight="10"
                                                    refX="9"
                                                    refY="3"
                                                    orient="auto"
                                                >
                                                    <polygon points="0 0, 10 3, 0 6" fill="#3B82F6" />
                                                </marker>
                                            </defs>
                                            <line
                                                x1={linkEditSourcePosition.x}
                                                y1={linkEditSourcePosition.y}
                                                x2={mousePosition.x}
                                                y2={mousePosition.y}
                                                stroke="#3B82F6"
                                                strokeWidth="3"
                                                strokeDasharray="8,4"
                                                markerEnd="url(#arrowhead-link-edit)"
                                            />
                                            <circle
                                                cx={linkEditSourcePosition.x}
                                                cy={linkEditSourcePosition.y}
                                                r="6"
                                                fill="#3B82F6"
                                            />
                                        </svg>
                                    )}

                                    <div className="min-w-[1200px] relative">
                                        {problems.filter(p => !p.parentProblemId).map((rootProblem, rootIdx) => {
                                            const derivedProblems = problems.filter(p => p.parentProblemId === rootProblem.id);

                                            return (
                                                <div key={rootProblem.id} className="mb-12">
                                                    <h3 className="text-lg font-semibold text-gray-800 mb-6">
                                                        {rootProblem.title}
                                                    </h3>

                                                    <div className="relative flex gap-12">
                                                        {/* Level 0: Root Problems */}
                                                        <div className="flex flex-col gap-6">
                                                            <div
                                                                className={`group transition-opacity ${linkEditMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                                                                    } ${draggedProblemId === rootProblem.id ? 'opacity-50' : 'opacity-100'}`}
                                                                draggable={!linkEditMode}
                                                                onDragStart={(e) => {
                                                                    if (!linkEditMode) {
                                                                        e.stopPropagation();
                                                                        onDragStart(e, rootProblem.id);
                                                                    }
                                                                }}
                                                                onDragEnd={onDragEnd}
                                                                onDragOver={(e) => {
                                                                    if (!linkEditMode) {
                                                                        e.stopPropagation();
                                                                        onDragOver(e, rootProblem.id);
                                                                    }
                                                                }}
                                                                onDragLeave={(e) => !linkEditMode && onDragLeave(e, rootProblem.id)}
                                                                onDrop={(e) => {
                                                                    if (!linkEditMode) {
                                                                        e.stopPropagation();
                                                                        onDrop(e, rootProblem.id);
                                                                    }
                                                                }}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (linkEditMode && linkEditSourceId !== rootProblem.id) {
                                                                        onChangeLinkParent(rootProblem.id);
                                                                    } else if (!draggedProblemId && !linkEditMode) {
                                                                        onSelectProblem(rootProblem);
                                                                    }
                                                                }}
                                                            >
                                                                <div className={`
                                      relative p-4 rounded-xl border-2 bg-white shadow-md transition-all
                                      ${dropTargetId === rootProblem.id && draggedProblemId !== rootProblem.id
                                                                        ? 'border-green-500 border-dashed shadow-xl ring-4 ring-green-200'
                                                                        : selectedProblem?.id === rootProblem.id
                                                                            ? 'border-blue-500 shadow-lg'
                                                                            : 'border-gray-300 hover:border-blue-400 hover:shadow-lg'}
                                      w-64
                                    `}>
                                                                    {/* Link Edit Button */}
                                                                    {rootProblem.parentProblemId && (
                                                                        <button
                                                                            onClick={(e) => onStartLinkEdit(e, rootProblem.id)}
                                                                            className={`absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded transition-all ${linkEditSourceId === rootProblem.id
                                                                                ? 'bg-blue-500 text-white scale-110'
                                                                                : 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600'
                                                                                }`}
                                                                            title="부모 문제 변경"
                                                                        >
                                                                            🔗
                                                                        </button>
                                                                    )}

                                                                    <div className="flex items-center gap-2 mb-2">
                                                                        <span className="text-2xl">🔒</span>
                                                                        <div className="flex-1 pr-6">
                                                                            <div className="font-semibold text-sm text-gray-800">{rootProblem.title}</div>
                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                {getDifficultyLabel(rootProblem.difficulty)} • D{rootProblem.difficulty}
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="text-xs text-gray-400 truncate">{rootProblem.category}</div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Level 1: Derived Problems (Vertical) */}
                                                        {derivedProblems.length > 0 && (
                                                            <div className="flex flex-col gap-6">
                                                                {derivedProblems.sort((a, b) => a.difficulty - b.difficulty).map((derived, idx) => {
                                                                    const grandchildren = problems.filter(p => p.parentProblemId === derived.id);

                                                                    return (
                                                                        <div key={derived.id} className="relative">
                                                                            {/* Connection Line */}
                                                                            <svg
                                                                                className="absolute top-1/2 -left-8 w-8 h-4 pointer-events-none"
                                                                                style={{ transform: 'translateY(-50%)' }}
                                                                                viewBox="0 0 32 4"
                                                                            >
                                                                                <line x1="0" y1="2" x2="28" y2="2" stroke="#94A3B8" strokeWidth="2" />
                                                                                <polygon points="28,0 32,2 28,4" fill="#94A3B8" />
                                                                            </svg>

                                                                            <div
                                                                                className={`group transition-opacity ${linkEditMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                                                                                    } ${draggedProblemId === derived.id ? 'opacity-50' : 'opacity-100'}`}
                                                                                draggable={!linkEditMode}
                                                                                onDragStart={(e) => {
                                                                                    if (!linkEditMode) {
                                                                                        e.stopPropagation();
                                                                                        onDragStart(e, derived.id);
                                                                                    }
                                                                                }}
                                                                                onDragEnd={onDragEnd}
                                                                                onDragOver={(e) => {
                                                                                    if (!linkEditMode) {
                                                                                        e.stopPropagation();
                                                                                        onDragOver(e, derived.id);
                                                                                    }
                                                                                }}
                                                                                onDragLeave={(e) => !linkEditMode && onDragLeave(e, derived.id)}
                                                                                onDrop={(e) => {
                                                                                    if (!linkEditMode) {
                                                                                        e.stopPropagation();
                                                                                        onDrop(e, derived.id);
                                                                                    }
                                                                                }}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (linkEditMode && linkEditSourceId !== derived.id) {
                                                                                        onChangeLinkParent(derived.id);
                                                                                    } else if (!draggedProblemId && !linkEditMode) {
                                                                                        onSelectProblem(derived);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <div className={`
                                                  relative p-4 rounded-xl border-2 bg-white shadow-md transition-all
                                                  ${dropTargetId === derived.id && draggedProblemId !== derived.id
                                                                                        ? 'border-green-500 border-dashed shadow-xl ring-4 ring-green-200'
                                                                                        : selectedProblem?.id === derived.id
                                                                                            ? 'border-green-500 shadow-lg'
                                                                                            : 'border-green-300 hover:border-green-500 hover:shadow-lg'}
                                                  w-56
                                                `}>
                                                                                    {/* Link Edit Button */}
                                                                                    <button
                                                                                        onClick={(e) => onStartLinkEdit(e, derived.id)}
                                                                                        className={`absolute top-2 left-2 w-7 h-7 flex items-center justify-center rounded transition-all z-10 ${linkEditSourceId === derived.id
                                                                                            ? 'bg-blue-500 text-white scale-110'
                                                                                            : 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600'
                                                                                            }`}
                                                                                        title="부모 문제 변경"
                                                                                    >
                                                                                        🔗
                                                                                    </button>

                                                                                    <div className="flex items-center gap-2 mb-2">
                                                                                        <span className="text-xl">🌱</span>
                                                                                        <div className="flex-1 pl-4">
                                                                                            <div className="font-semibold text-sm text-gray-800">{derived.title}</div>
                                                                                            <div className="text-xs text-gray-500 mt-1">
                                                                                                {getDifficultyLabel(derived.difficulty)} • D{derived.difficulty}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-xs text-gray-400 truncate">{derived.category}</div>
                                                                                    {derived.isGenerated && (
                                                                                        <div className="absolute top-2 right-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                                                                                            🤖 AI
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {/* Level 2: Grandchildren (Vertical, Collected from all derived) */}
                                                        {(() => {
                                                            const allGrandchildren = derivedProblems.flatMap(derived =>
                                                                problems.filter(p => p.parentProblemId === derived.id)
                                                            );

                                                            if (allGrandchildren.length === 0) return null;

                                                            return (
                                                                <div className="flex flex-col gap-6">
                                                                    {allGrandchildren.sort((a, b) => a.difficulty - b.difficulty).map((grandchild) => (
                                                                        <div key={grandchild.id} className="relative">
                                                                            {/* Connection Line */}
                                                                            <svg
                                                                                className="absolute top-1/2 -left-8 w-8 h-4 pointer-events-none"
                                                                                style={{ transform: 'translateY(-50%)' }}
                                                                                viewBox="0 0 32 4"
                                                                            >
                                                                                <line x1="0" y1="2" x2="28" y2="2" stroke="#6EE7B7" strokeWidth="2" />
                                                                                <polygon points="28,0 32,2 28,4" fill="#6EE7B7" />
                                                                            </svg>

                                                                            <div
                                                                                className={`group transition-opacity ${linkEditMode ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'
                                                                                    } ${draggedProblemId === grandchild.id ? 'opacity-50' : 'opacity-100'}`}
                                                                                draggable={!linkEditMode}
                                                                                onDragStart={(e) => {
                                                                                    if (!linkEditMode) {
                                                                                        e.stopPropagation();
                                                                                        onDragStart(e, grandchild.id);
                                                                                    }
                                                                                }}
                                                                                onDragEnd={onDragEnd}
                                                                                onDragOver={(e) => {
                                                                                    if (!linkEditMode) {
                                                                                        e.stopPropagation();
                                                                                        onDragOver(e, grandchild.id);
                                                                                    }
                                                                                }}
                                                                                onDragLeave={(e) => !linkEditMode && onDragLeave(e, grandchild.id)}
                                                                                onDrop={(e) => {
                                                                                    if (!linkEditMode) {
                                                                                        e.stopPropagation();
                                                                                        onDrop(e, grandchild.id);
                                                                                    }
                                                                                }}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (linkEditMode && linkEditSourceId !== grandchild.id) {
                                                                                        onChangeLinkParent(grandchild.id);
                                                                                    } else if (!draggedProblemId && !linkEditMode) {
                                                                                        onSelectProblem(grandchild);
                                                                                    }
                                                                                }}
                                                                            >
                                                                                <div className={`
                                                relative p-3 rounded-lg border bg-white shadow-sm transition-all w-48
                                                ${dropTargetId === grandchild.id && draggedProblemId !== grandchild.id
                                                                                        ? 'border-green-500 border-dashed shadow-lg ring-2 ring-green-200'
                                                                                        : selectedProblem?.id === grandchild.id
                                                                                            ? 'border-green-500 shadow-md'
                                                                                            : 'border-green-200 hover:border-green-400'}
                                              `}>
                                                                                    {/* Link Edit Button */}
                                                                                    <button
                                                                                        onClick={(e) => onStartLinkEdit(e, grandchild.id)}
                                                                                        className={`absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded transition-all text-xs z-10 ${linkEditSourceId === grandchild.id
                                                                                            ? 'bg-blue-500 text-white scale-110'
                                                                                            : 'bg-gray-100 hover:bg-blue-100 text-gray-600 hover:text-blue-600'
                                                                                            }`}
                                                                                        title="부모 문제 변경"
                                                                                    >
                                                                                        🔗
                                                                                    </button>

                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-sm">🌿</span>
                                                                                        <div className="flex-1 min-w-0 pr-6">
                                                                                            <div className="text-xs font-medium text-gray-700 truncate">{grandchild.title}</div>
                                                                                            <div className="text-xs text-gray-400">D{grandchild.difficulty}</div>
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ) : (
                                /* List View */
                                problems.filter(p => !p.parentProblemId).map((problem) => {
                                    // Get all linked problems (both derived and explicitly linked)
                                    const childProblems = problems.filter(p => p.parentProblemId === problem.id);
                                    const explicitLinkedProblems = problem.linkedProblems
                                        ? problems.filter(p =>
                                            problem.linkedProblems.includes(p.id) &&
                                            p.parentProblemId !== problem.id  // Exclude if already in childProblems
                                        )
                                        : [];

                                    // Combine all linked problems
                                    const allLinkedProblems = [...childProblems, ...explicitLinkedProblems];

                                    const parentProblem = problem.parentProblemId
                                        ? problems.find(p => p.id === problem.parentProblemId)
                                        : null;
                                    const isExpanded = expandedProblems.has(problem.id);
                                    const hasLinkedProblems = allLinkedProblems.length > 0;

                                    return (
                                        <div key={problem.id}>
                                            {/* Main Problem Card */}
                                            <div
                                                className={`p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors ${selectedProblem?.id === problem.id
                                                    ? "bg-blue-50 border-blue-600"
                                                    : "bg-white border-gray-200"
                                                    } ${problem.isGenerated ? 'ml-4 border-l-4 border-l-green-400' : ''}`}
                                                onClick={(e) => {
                                                    // Don't open editor if clicking on a button
                                                    if ((e.target as HTMLElement).tagName === 'BUTTON' ||
                                                        (e.target as HTMLElement).closest('button')) {
                                                        return;
                                                    }
                                                    onSelectProblem(problem);
                                                }}
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    {/* Expand/Collapse Button (always reserve space) */}
                                                    <div className="w-6 flex-shrink-0 flex items-center justify-center">
                                                        {hasLinkedProblems && !problem.isGenerated && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    onToggleExpanded(problem.id);
                                                                }}
                                                                className="text-gray-500 hover:text-gray-700 transition-transform"
                                                                style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                                                            >
                                                                ▶
                                                            </button>
                                                        )}
                                                    </div>

                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                            <h3 className="text-sm font-medium text-gray-800">{problem.title}</h3>
                                                            {problem.isGenerated && (
                                                                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                                                    🤖 AI
                                                                </Badge>
                                                            )}
                                                            <Badge className={`text-xs ${getDifficultyColor(problem.difficulty)} border`}>
                                                                D{problem.difficulty}
                                                            </Badge>
                                                        </div>

                                                        <p className="text-xs text-gray-500 mb-1">{problem.category}</p>

                                                        {/* Parent Problem Info */}
                                                        {parentProblem && (
                                                            <p className="text-xs text-blue-600 mb-1">
                                                                ↳ Derived from: <span className="font-medium">{parentProblem.title}</span>
                                                            </p>
                                                        )}

                                                        {/* Linked Problems Summary */}
                                                        {hasLinkedProblems && !problem.isGenerated && (
                                                            <div className="flex items-center gap-2 mt-2">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onToggleExpanded(problem.id);
                                                                    }}
                                                                    className="text-xs text-green-600 hover:text-green-800 font-medium"
                                                                >
                                                                    {isExpanded ? '▼' : '▶'} {allLinkedProblems.length} Linked Problems
                                                                </button>
                                                                {childProblems.length > 0 && (
                                                                    <span className="text-xs text-gray-400">
                                                                        ({childProblems.length} derived)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-xs text-gray-400 text-right">
                                                            {problem.updatedAt.toLocaleDateString()}
                                                        </span>
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                e.preventDefault();
                                                                onDeleteProblem(problem.id);
                                                            }}
                                                            className="text-xs text-red-600 hover:text-red-800 hover:underline"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Expanded Linked Problems - Hierarchical Tree View */}
                                            {isExpanded && hasLinkedProblems && !problem.isGenerated && (
                                                <div className="mt-2">
                                                    {/* Recursive function to render problem hierarchy */}
                                                    {(() => {
                                                        const renderProblemTree = (parentId: string, depth: number = 0): React.ReactNode[] => {
                                                            // Find all direct children of this parent
                                                            const directChildren = problems.filter(p => p.parentProblemId === parentId);

                                                            // Sort by difficulty
                                                            const sortedChildren = directChildren.sort((a, b) => a.difficulty - b.difficulty);

                                                            return sortedChildren.map((child, idx) => {
                                                                const hasGrandchildren = problems.some(p => p.parentProblemId === child.id);
                                                                const isChildExpanded = expandedProblems.has(child.id);

                                                                return (
                                                                    <div key={child.id} className="relative">
                                                                        {/* Tree connector lines */}
                                                                        {depth > 0 && (
                                                                            <div
                                                                                className="absolute left-0 top-0 bottom-0 w-px bg-green-200"
                                                                                style={{ left: `${(depth - 1) * 24 + 8}px` }}
                                                                            />
                                                                        )}

                                                                        {/* Problem card */}
                                                                        <div
                                                                            className={`relative mb-2`}
                                                                            style={{ marginLeft: `${depth * 24 + 8}px` }}
                                                                        >
                                                                            {/* Horizontal connector */}
                                                                            {depth >= 0 && (
                                                                                <div
                                                                                    className="absolute top-4 h-px bg-green-200"
                                                                                    style={{
                                                                                        left: '-16px',
                                                                                        width: '16px'
                                                                                    }}
                                                                                />
                                                                            )}

                                                                            <div
                                                                                onClick={(e) => {
                                                                                    // Don't open editor if clicking on a button
                                                                                    if ((e.target as HTMLElement).tagName === 'BUTTON' ||
                                                                                        (e.target as HTMLElement).closest('button')) {
                                                                                        return;
                                                                                    }
                                                                                    onSelectProblem(child);
                                                                                }}
                                                                                className={`p-2 rounded-lg border cursor-pointer hover:shadow-sm transition-all ${selectedProblem?.id === child.id
                                                                                    ? "bg-blue-50 border-blue-400 shadow-sm"
                                                                                    : "bg-white border-gray-200 hover:border-green-300"
                                                                                    }`}
                                                                            >
                                                                                <div className="flex items-center gap-2">
                                                                                    {/* Expand/Collapse button for children */}
                                                                                    {hasGrandchildren && (
                                                                                        <button
                                                                                            onClick={(e) => {
                                                                                                e.stopPropagation();
                                                                                                onToggleExpanded(child.id);
                                                                                            }}
                                                                                            className="text-gray-400 hover:text-gray-600 text-xs flex-shrink-0"
                                                                                        >
                                                                                            {isChildExpanded ? '▼' : '▶'}
                                                                                        </button>
                                                                                    )}

                                                                                    <div className="flex-1 min-w-0">
                                                                                        <div className="flex items-center gap-2 flex-wrap">
                                                                                            <span className="text-xs text-gray-400">
                                                                                                {'└' + '─'.repeat(depth > 0 ? 1 : 0)}
                                                                                            </span>
                                                                                            <span className="text-xs">🌱</span>
                                                                                            <h4 className="text-xs font-medium text-gray-700 truncate">
                                                                                                {child.title}
                                                                                            </h4>
                                                                                            <Badge className={`text-xs ${getDifficultyColor(child.difficulty)} border flex-shrink-0`}>
                                                                                                D{child.difficulty}
                                                                                            </Badge>
                                                                                            {child.isGenerated && (
                                                                                                <Badge className="text-xs bg-green-100 text-green-600 border-green-200 flex-shrink-0">
                                                                                                    🤖 AI
                                                                                                </Badge>
                                                                                            )}
                                                                                            {hasGrandchildren && (
                                                                                                <span className="text-xs text-gray-400">
                                                                                                    ({problems.filter(p => p.parentProblemId === child.id).length} children)
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        <p className="text-xs text-gray-400 mt-1 ml-6 truncate">{child.category}</p>
                                                                                    </div>

                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={async (e) => {
                                                                                            e.stopPropagation();
                                                                                            e.preventDefault();
                                                                                            onDeleteProblem(child.id);
                                                                                        }}
                                                                                        className="text-xs text-red-400 hover:text-red-600 flex-shrink-0"
                                                                                        title="Delete problem"
                                                                                    >
                                                                                        🗑️
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {/* Recursively render grandchildren if expanded */}
                                                                        {isChildExpanded && hasGrandchildren && (
                                                                            <div className="ml-0">
                                                                                {renderProblemTree(child.id, depth + 1)}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            });
                                                        };

                                                        // Start rendering from current problem's children
                                                        return (
                                                            <div className="border-l-4 border-green-200 pl-2">
                                                                <p className="text-xs font-semibold text-green-700 mb-3 ml-2">
                                                                    🌳 Problem Hierarchy ({allLinkedProblems.length} total)
                                                                </p>
                                                                <div className="space-y-1">
                                                                    {renderProblemTree(problem.id, 0)}
                                                                </div>
                                                            </div>
                                                        );
                                                    })()}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })
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
