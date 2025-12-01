import React from "react";
import { Input } from "@/components/ui/input";
import { CardTitle } from "@/components/ui/card";

interface ProblemFiltersProps {
    totalCount: number;
    viewMode: "list" | "grid" | "learning-path";
    setViewMode: (mode: "list" | "grid" | "learning-path") => void;
    searchQuery: string;
    setSearchQuery: (query: string) => void;
    filterCategory: string;
    setFilterCategory: (category: string) => void;
    filterDifficulty: string;
    setFilterDifficulty: (value: string) => void;
    sortBy: "newest" | "title" | "difficulty";
    setSortBy: (value: "newest" | "title" | "difficulty") => void;
    categories: any;
}

export function ProblemFilters({
    totalCount,
    viewMode,
    setViewMode,
    searchQuery,
    setSearchQuery,
    filterCategory,
    setFilterCategory,
    filterDifficulty,
    setFilterDifficulty,
    sortBy,
    setSortBy,
    categories
}: ProblemFiltersProps) {
    return (
        <>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <CardTitle className="text-xl font-semibold text-gray-800">
                        Problem List
                        <span className="ml-2 text-sm font-normal text-gray-500">
                            ({totalCount})
                        </span>
                    </CardTitle>

                    {/* View Mode Switcher */}
                    <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`px-3 py-1 text-xs font-medium rounded transition-all ${viewMode === "list"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 hover:text-gray-800"
                                }`}
                        >
                            📋 List
                        </button>
                        <button
                            onClick={() => setViewMode("learning-path")}
                            className={`px-3 py-1 text-xs font-medium rounded transition-all ${viewMode === "learning-path"
                                ? "bg-blue-600 text-white shadow-sm"
                                : "text-gray-600 hover:text-gray-800"
                                }`}
                        >
                            🌳 Learning Path
                        </button>
                    </div>
                </div>
            </div>
            <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, category, or ID..."
                className="mt-2 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />

            {/* Filters and Sort Controls */}
            <div className="flex items-center gap-4 flex-wrap mt-4">
                <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                    <option value="all">All Categories</option>
                    <option value="algebra">Algebra</option>
                    <option value="geometry">Geometry</option>
                    <option value="calculus">Calculus</option>
                    <option value="analysis">Analysis</option>
                    <option value="number theory">Number Theory</option>
                    <option value="combinatorics">Combinatorics</option>
                </select>

                <select
                    value={filterDifficulty}
                    onChange={(e) => setFilterDifficulty(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                    <option value="all">All Difficulties</option>
                    <option value="easy">Easy (1-3)</option>
                    <option value="medium">Medium (4-6)</option>
                    <option value="hard">Hard (7-9)</option>
                    <option value="olympic">Olympic (10)</option>
                </select>
            </div>
        </>
    );
}
