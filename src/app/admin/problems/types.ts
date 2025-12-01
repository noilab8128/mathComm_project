export interface Problem {
    id: string;
    title: string;
    content: string;
    solution: string;
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
    solution: string;
    difficulty: number;
    category: string;
    concept: string;
    explanation: string;
}
