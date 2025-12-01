import { useState, useEffect, useCallback } from "react";
import { problemsAPI, problemRelationshipsAPI, getDifficultyLabel, calculateXP, categoryToTags } from "@/lib/supabase";
import { exportFilteredProblemsToCSV } from "@/lib/csvExport";
import { Problem, RelatedProblem } from "../types";

export function useProblems() {
    const [problems, setProblems] = useState<Problem[]>([]);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [totalCount, setTotalCount] = useState(0);

    // Filtering and sorting states
    const [filterCategory, setFilterCategory] = useState<string>("all");
    const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"newest" | "title" | "difficulty">("newest");
    const [searchQuery, setSearchQuery] = useState("");

    // Supabase connection states
    const [isDbConnected, setIsDbConnected] = useState(false);
    const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);
    const [isSavingToDb, setIsSavingToDb] = useState(false);

    // Toast notification state
    const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({
        show: false,
        message: "",
        type: "success"
    });

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
                onlyRoots: true,
                sortBy: sortBy
            });

            setTotalCount(count);

            // 2. Fetch children for these roots
            const rootIds = roots.map(p => p.id);
            const children = await problemsAPI.getChildrenBatch(rootIds);

            // 3. Combine and convert
            const supabaseProblems = [...roots, ...children];

            // Convert Supabase format to local format
            const convertedProblems = supabaseProblems.map(sp => ({
                id: sp.id,
                title: sp.title,
                content: sp.content,
                solution: sp.solution || '',
                difficulty: sp.difficulty,
                category: sp.category_path || sp.category_level1 || '',
                diagramImageUrl: sp.diagram_image_url,
                linkedProblems: sp.linked_problem_ids || [],
                isGenerated: sp.is_generated,
                parentProblemId: sp.parent_problem_id,
                createdAt: sp.created_at ? new Date(sp.created_at) : new Date(),
                updatedAt: sp.updated_at ? new Date(sp.updated_at) : new Date(),
            })) as Problem[];

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
                solution: problem.solution || undefined,
                difficulty: problem.difficulty,
                category_path: problem.category,
                // Use INTEGER category IDs from the state
                category_level1: selectedLevel1 ? parseInt(selectedLevel1) : undefined,
                category_level2: selectedLevel2 ? parseInt(selectedLevel2) : undefined,
                category_level3: selectedLevel3 ? parseInt(selectedLevel3) : undefined,
                level: getDifficultyLabel(problem.difficulty),
                xp: calculateXP(problem.difficulty),
                tags: categoryToTags(problem.category),
                diagram_image_url: problem.diagramImageUrl || undefined,
                linked_problem_ids: problem.linkedProblems,
                is_generated: problem.isGenerated,
                parent_problem_id: problem.parentProblemId || undefined,
            };

            let savedProblem;
            if (problem.id.startsWith('temp-') || !isDbConnected) {
                // New problem - create
                console.log('Creating new problem in Supabase...');
                savedProblem = await problemsAPI.create(supabaseProblem);
            } else {
                // Existing problem - update
                console.log('Updating problem in Supabase:', problem.id);
                savedProblem = await problemsAPI.update(problem.id, supabaseProblem);
            }

            return savedProblem;
        } catch (error: any) {
            console.error('Failed to save to Supabase:', error);

            // More user-friendly error message
            const errorMsg = error?.message || error?.toString() || 'Unknown error';
            showToast(`❌ Database save failed: ${errorMsg}`, "error");

            throw new Error(`Database save failed: ${errorMsg}`);
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
            showToast(`✅ Deleted "${problemToDelete?.title}"${isDbConnected && !id.startsWith('temp-') ? ' (from database)' : ' (local only)'}`, "success");
        } catch (error: any) {
            console.error('❌ Failed to delete problem:', error);
            showToast(`❌ Failed to delete: ${error.message}`, "error");
        }
    };

    const handleExportCSV = () => {
        try {
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
        totalPages: Math.ceil(totalCount / pageSize)
    };
}
