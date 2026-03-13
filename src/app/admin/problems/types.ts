/* eslint-disable */
// @ts-nocheck
export interface Solution {
    id?: string;
    title?: string;
    content: string; // Markdown/LaTeX
    sequenceOrder?: number;
}

export interface Problem {
    id: string;
    title: string;
    content: string; // KaTeX format
    difficulty: number;

    // Categories
    categoryLevel1Id?: number;
    categoryLevel2Id?: number;
    categoryLevel3Id?: number;
    categoryPath?: string;

    // Solutions (New Structure)
    solutions: Solution[];

    // Legacy support (optional, for backward compatibility if needed)
    solution?: string;

    // Metadata
    level?: string;
    ageRange?: string;
    xp: number;
    tags?: string[];
    diagramImageUrl?: string;
    source?: string;

    // Analytics (New)
    startsCount?: number;
    completesCount?: number;
    attemptsCount?: number;
    rating?: number;
    likesCount?: number;
    lastSolvedAt?: string;

    // AI & Hierarchy

    isGenerated: boolean;
    aiConfidence?: number;
    concepts?: string[];

    // Hierarchy Info (if it's a child problem)
    parentProblemId?: string;
    hierarchyInfo?: {
        parentSolutionId?: string;
        stageName?: string;
        sequenceOrder: number;
        depth: number;
    };

    // Client-side only
    linkedProblems?: string[];
    category?: string; // Mapped from path or ID for UI convenience

    createdAt: string;
    updatedAt: string;
}

export interface RelatedProblem {
    title: string;
    content: string;
    solution: string;
    difficulty: number;
    category: string;
    concepts?: string[]; // or stages
    stage?: string;
    concept?: string;
    explanation?: string;
}
