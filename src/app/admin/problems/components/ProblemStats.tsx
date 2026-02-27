import React from "react";
import { Card } from "@/components/ui/card";
import { Problem } from "../types";

interface ProblemStatsProps {
    problems: Problem[];
}

export function ProblemStats({ problems }: ProblemStatsProps) {
    if (problems.length === 0) return null;

    const stats = {
        total: problems.length,
        byDifficulty: {
            easy: problems.filter(p => p.difficulty <= 3).length,
            medium: problems.filter(p => p.difficulty >= 4 && p.difficulty <= 6).length,
            hard: problems.filter(p => p.difficulty >= 7 && p.difficulty <= 9).length,
            olympic: problems.filter(p => p.difficulty === 10).length,
        },
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500 font-medium">Total Problems</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">{stats.total}</div>
                <div className="text-xs text-blue-600 mt-1">All problems</div>
            </Card>
            <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500 font-medium">Easy (1-3)</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">{stats.byDifficulty.easy}</div>
                <div className="text-xs text-gray-500 mt-1">Beginner level</div>
            </Card>
            <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500 font-medium">Medium (4-6)</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">{stats.byDifficulty.medium}</div>
                <div className="text-xs text-gray-500 mt-1">Intermediate level</div>
            </Card>
            <Card className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="text-sm text-gray-500 font-medium">Hard (7-10)</div>
                <div className="text-3xl font-bold text-gray-800 mt-2">
                    {stats.byDifficulty.hard + stats.byDifficulty.olympic}
                </div>
                <div className="text-xs text-gray-500 mt-1">Advanced level</div>
            </Card>
        </div>
    );
}
