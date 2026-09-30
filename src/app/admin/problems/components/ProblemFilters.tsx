/* eslint-disable */
// @ts-nocheck
import React from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Problem } from "../types";
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
    filterStatus: string;
    setFilterStatus: (value: string) => void;
    sortBy: "newest" | "oldest" | "difficulty_asc" | "difficulty_desc";
    setSortBy: (sort: "newest" | "oldest" | "difficulty_asc" | "difficulty_desc") => void;
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
    filterStatus,
    setFilterStatus,
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

                <Select value={sortBy} onValueChange={(value: "newest" | "oldest" | "difficulty_asc" | "difficulty_desc") => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">Newest First</SelectItem>
                        <SelectItem value="oldest">Oldest First</SelectItem>
                        <SelectItem value="difficulty_asc">Difficulty (Low to High)</SelectItem>
                        <SelectItem value="difficulty_desc">Difficulty (High to Low)</SelectItem>
                    </SelectContent>
                </Select>

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

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                    <option value="all">All Statuses</option>
                    <option value="pending-review">Pending AI Review</option>
                </select>
            </div>
        </>
    );
}
