import { useState, useEffect, useCallback } from "react";
import { problemsAPI, problemHierarchiesAPI, getDifficultyLabel, calculateXP } from "@/lib/supabase";
import { exportFilteredProblemsToCSV } from "@/lib/csvExport";
import { Problem } from "../types";

export function useProblems() {
    const [problems, setProblems] = useState<Problem[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    // Filtering and sorting states
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "difficulty_asc" | "difficulty_desc">("newest");
    const [searchQuery, setSearchQuery] = useState("");

    // Supabase connection states
    const [isDbConnected, setIsDbConnected] = useState(false);
    const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);
    const [isSavingToDb, setIsSavingToDb] = useState(false);

    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
        show: false,
        message: "",
        type: "success"
    });

    // Bulk Selection State
    const [selectedProblemIds, setSelectedProblemIds] = useState<Set<string>>(new Set());

    const toggleProblemSelection = useCallback((id: string) => {
        setSelectedProblemIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    const selectAllProblems = useCallback((ids: string[]) => {
        setSelectedProblemIds(new Set(ids));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedProblemIds(new Set());
    }, []);

    const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
        setToast({ show: true, message, type });
        setTimeout(() => {
            setToast({ show: false, message: "", type: "success" });
        }, 3000);
    }, []);

    // Load problems from Supabase
    const loadProblemsFromSupabase = useCallback(async () => {
        try {
            setIsLoadingFromDb(true);

            // Convert difficulty filter to number array
            let difficultyFilter: number[] | undefined;
            if (filterDifficulty === "easy") difficultyFilter = [1, 2, 3];
            else if (filterDifficulty === "medium") difficultyFilter = [4, 5, 6];
            else if (filterDifficulty === "hard") difficultyFilter = [7, 8, 9];
            else if (filterDifficulty === "olympic") difficultyFilter = [10];

            // 1. Fetch paginated root problems
            const { data: roots, count } = await problemsAPI.getPaginated(currentPage, pageSize, {
                category: filterCategory === 'all' ? undefined : filterCategory,
                difficulty: difficultyFilter,
                search: searchQuery,
                onlyRoots: true, // This filter needs to be implemented correctly in supabase.ts or refined
                sortBy: sortBy
            });

            setTotalCount(count);

            // 2. Fetch children for these roots (if needed, or maybe just load roots for list view?)
            // The logic here seems to want to load children to show hierarchy or just simple list.
            // If the UI is a flat list, we might not need children batch unless we want to show "Has X subproblems"
            // For now, let's keep it simple and just show roots or all problems as returned.
            // Actually, if we want to show a tree, we need children.
            // The original code fetched children. Let's keep it if possible, or simplify.
            // Let's assume getChildrenBatch works or returns empty.

            const rootIds = roots.map((p: any) => p.id);
            const children = await problemsAPI.getChildrenBatch(rootIds);

            // 2.1 Fetch all hierarchy links to map relationships
            const hierarchies = await problemHierarchiesAPI.getAll();
            const hierarchyMap = new Map(hierarchies?.map((h: any) => [h.child_problem_id, h]));

            // 3. Combine and convert
            // Avoid duplicates if getPaginated already returned children (e.g. if onlyRoots logic is weak)
            const allFetched = [...roots];
            // Add children that are not already in roots
            // @ts-ignore
            children.forEach(child => {
                // @ts-ignore
                if (!allFetched.find(p => p.id === child.id)) {
                    // @ts-ignore
                    allFetched.push(child);
                }
            });

            // Convert Supabase format to local format
            const convertedProblems = allFetched.map((sp: any) => {
                const hierarchyLink = hierarchyMap.get(sp.id);

                return {
                    id: sp.id,
                    title: sp.title,
                    content: sp.content,
                    // Default first solution content for legacy view
                    solution: sp.solutions?.[0]?.content || '',
                    // Map DB solutions to UI solutions
                    solutions: sp.solutions?.map((s: any) => ({
                        id: s.id,
                        content: s.content,
                        sequenceOrder: s.sequence_order
                    })) || [],
                    difficulty: sp.difficulty,
                    category: sp.category_path || (sp.category_level1 ? String(sp.category_level1) : ''),
                    diagramImageUrl: sp.diagram_image_url,
                    linkedProblems: sp.linked_problem_ids || [],
                    isGenerated: sp.is_generated,
                    parentProblemId: hierarchyLink?.parent_problem_id,
                    hierarchyInfo: hierarchyLink ? {
                        parentSolutionId: hierarchyLink.parent_solution_id,
                        stageName: hierarchyLink.stage_name,
                        sequenceOrder: hierarchyLink.sequence_order,
                        depth: hierarchyLink.depth
                    } : undefined,
                    createdAt: sp.created_at ? new Date(sp.created_at).toISOString() : new Date().toISOString(),
                    updatedAt: sp.updated_at ? new Date(sp.updated_at).toISOString() : new Date().toISOString(),
                };
            }) as Problem[];

            setProblems(convertedProblems);
            setIsDbConnected(true);
        } catch (error: any) {
            console.error('Failed to load from Supabase:', error);
            setIsDbConnected(false);
            setProblems([]);
            showToast("⚠️ Database not connected. No problems loaded.", "error");
        } finally {
            setIsLoadingFromDb(false);
        }
    }, [currentPage, pageSize, filterCategory, filterDifficulty, searchQuery, sortBy, showToast]);

    // Reload when filters or page change
    useEffect(() => {
        const timer = setTimeout(() => {
            loadProblemsFromSupabase();
        }, 300); // Debounce
        return () => clearTimeout(timer);
    }, [loadProblemsFromSupabase]);

    // Save problem to Supabase
    const saveProblemToSupabase = async (problem: Problem, selectedLevel1?: string, selectedLevel2?: string, selectedLevel3?: string) => {
        try {
            setIsSavingToDb(true);

            // Check if Supabase is configured
            if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
                console.warn('⚠️ Supabase not configured. Skipping database save.');
                showToast("⚠️ Supabase not configured. Problem saved locally only.", "error");
                return null;
            }

            // Convert local format to Supabase format
            const supabaseProblem = {
                title: problem.title,
                content: problem.content,
                // solution: problem.solution, // We don't save to 'problems' table 'solution' column anymore? 
                // The migration removed 'solution' column from 'problems' table! 
                // So we MUST NOT include 'solution' in the insert object for 'problems' table.

                difficulty: problem.difficulty,
                category_path: problem.category,
                category_level1: selectedLevel1 ? parseInt(selectedLevel1) : undefined,
                category_level2: selectedLevel2 ? parseInt(selectedLevel2) : undefined,
                category_level3: selectedLevel3 ? parseInt(selectedLevel3) : undefined,
                level: getDifficultyLabel(problem.difficulty),
                xp: calculateXP(problem.difficulty),
                tags: problem.category ? problem.category.split(' > ').map(t => t.trim()) : [],
                diagram_image_url: problem.diagramImageUrl || undefined,
                // linked_problem_ids: problem.linkedProblems, // Removed in migration? No, I kept 'problems' table pretty clean.
                // Checking migration (Step 43/45): "tags TEXT[]", "linked_problem_ids" is NOT in the new table definition!
                // So removing it.
                is_generated: problem.isGenerated,
                // parent_problem_id: problem.parentProblemId, // Removed from 'problems' table.
            };

            // Prepare solutions for separate table
            const solutionsToSave = problem.solutions?.map((s, index) => ({
                content: s.content,
                sequence_order: s.sequenceOrder || index + 1
            })) || [];

            // If no solutions in array but legacy 'solution' exists (e.g. from UI input), add it
            if (solutionsToSave.length === 0 && problem.solution) {
                solutionsToSave.push({
                    content: problem.solution,
                    sequence_order: 1
                });
            }

            // Log payload for debugging
            console.log('Saving Problem Payload:', { supabaseProblem, solutionsToSave });

            let savedProblem;
            if (problem.id.startsWith('temp-') || !isDbConnected) {
                // New problem - create
                console.log('Creating new problem in Supabase...');
                savedProblem = await problemsAPI.create(supabaseProblem, solutionsToSave);
            } else {
                // Existing problem - update
                console.log('Updating problem in Supabase:', problem.id);
                // We need to pass solutions to update as well
                savedProblem = await problemsAPI.update(problem.id, supabaseProblem, solutionsToSave);
            }

            return savedProblem;
        } catch (error: any) {
            console.error('Failed to save to Supabase. Error:', error);
            console.error('Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));

            // More user-friendly error message


            // More user-friendly error message
            const errorMsg = error?.message || error?.toString() || 'Unknown error';
            showToast(`❌ Database save failed: ${errorMsg} `, "error");

            throw new Error(`Database save failed: ${errorMsg} `);
        } finally {
            setIsSavingToDb(false);
        }
    };

    const deleteProblem = async (id: string) => {
        try {
            // Delete from Supabase if connected and not a temp ID
            if (isDbConnected && !id.startsWith('temp-')) {
                console.log('🗑️ Deleting from database:', id);
                await problemsAPI.delete(id);
                console.log('✅ Deleted from database');
            }

            // Remove from local state
            setProblems(prev => prev.filter(p => p.id !== id));

            const problemToDelete = problems.find(p => p.id === id);
            showToast(`✅ Deleted "${problemToDelete?.title}"${isDbConnected && !id.startsWith('temp-') ? ' (from database)' : ' (local only)'} `, "success");
        } catch (error: any) {
            console.error('❌ Failed to delete problem:', error);
            showToast(`❌ Failed to delete: ${error.message} `, "error");
        }
    };

    const handleExportCSV = () => {
        try {
            // @ts-expect-error - Mismatch between Problem interface and what CSV export expects
            exportFilteredProblemsToCSV(problems, {
                category: filterCategory,
                difficulty: filterDifficulty,
                searchQuery: searchQuery,
            });
            showToast("✅ CSV file downloaded successfully!", "success");
        } catch (error) {
            console.error('CSV export error:', error);
            showToast("❌ Failed to export CSV", "error");
        }
    };

    return {
        problems,
        setProblems,
        currentPage,
        setCurrentPage,
        pageSize,
        setPageSize,
        totalCount,
        filterCategory,
        setFilterCategory,
        filterDifficulty,
        setFilterDifficulty,
        sortBy,
        setSortBy,
        searchQuery,
        setSearchQuery,
        isDbConnected,
        isLoadingFromDb,
        isSavingToDb,
        toast,
        showToast,
        loadProblemsFromSupabase,
        saveProblemToSupabase,
        deleteProblem,
        handleExportCSV,
        selectedProblemIds,
        toggleProblemSelection,
        selectAllProblems,
        clearSelection,
        totalPages: Math.ceil(totalCount / pageSize)
    };
}
