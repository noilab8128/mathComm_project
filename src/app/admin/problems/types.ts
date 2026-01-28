export interface SolutionItem {
    id: string;
    title: string;
    content: string;
}

export interface Problem {
    id: string;
    title: string;
    content: string;
    solution: string; // Kept for backward compatibility
    solutions: SolutionItem[]; // Supporting multiple solutions
    difficulty: number;
    category: string;
    diagramImageUrl?: string;
    linkedProblems: string[];
    isGenerated?: boolean;
    parentProblemId?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RelatedProblem {
    title: string;
    content: string;
    solution: string; // Kept for backward compatibility
    solutions?: SolutionItem[];
    difficulty: number;
    category: string;
    stage: string;
    concept: string;
    explanation: string;
}
