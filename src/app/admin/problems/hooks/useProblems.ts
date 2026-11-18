/* eslint-disable */
// @ts-nocheck
import { useState, useEffect, useCallback } from "react";
import { problemsAPI, problemHierarchiesAPI, getDifficultyLabel } from "@/lib/supabase";
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
    const [filterStatus, setFilterStatus] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"newest" | "oldest" | "difficulty_asc" | "difficulty_desc">("newest");
    const [searchQuery, setSearchQuery] = useState("");

    // Supabase connection states
    const [isDbConnected, setIsDbConnected] = useState(false);
    const [isLoadingFromDb, setIsLoadingFromDb] = useState(false);
    const [isSavingToDb, setIsSavingToDb] = useState(false);
    const [uniqueSources, setUniqueSources] = useState<string[]>([]);

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

            // 1. One admin-only server call (service key): the page of problems, their children, all hierarchy
            //    links, known sources and which problems students cannot see. Before 2026-11-19 this read with the
            //    public key, so problems hidden by problem_visibility.sql (e.g. new, unapproved ones) were missing.
            const params = new URLSearchParams({ page: String(currentPage), pageSize: String(pageSize), sortBy });
            if (filterCategory !== 'all') params.set('category', filterCategory);
            if (difficultyFilter) params.set('difficulty', difficultyFilter.join(','));
            if (filterStatus === "pending-review") { params.set('isGenerated', 'true'); params.set('isReviewed', 'false'); }
            if (searchQuery) params.set('search', searchQuery);

            const res = await fetch(`/api/admin/problems?${params}`);
            const body = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(body.error || `Request failed (${res.status})`);
            const { problems: roots, children, hierarchies, count, sources, hiddenIds } = body;

            setTotalCount(count);
            const hierarchyMap = new Map(hierarchies?.map((h: any) => [h.child_problem_id, h]));
            const hidden = new Set<string>(hiddenIds || []);

            // 2. Combine: the page's problems, then children not already on the page
            const allFetched = [...roots];
            children.forEach((child: any) => {
                if (!allFetched.find(p => p.id === child.id)) allFetched.push(child);
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
                    source: sp.source,
                    startsCount: sp.starts_count,
                    completesCount: sp.completes_count,
                    attemptsCount: sp.attempts_count,
                    rating: sp.rating,
                    likesCount: sp.likes_count,
                    lastSolvedAt: sp.last_solved_at,
                    linkedProblems: sp.linked_problem_ids || [],
                    isGenerated: sp.is_generated,
                    isReviewed: sp.is_reviewed,
                    // Hidden from students (problem_visibility.sql); null hiddenIds = could not be checked
                    isHidden: hidden.has(sp.id),
                    reviewerId: sp.reviewer_id,
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

            // 3. Known sources for suggestions
            setUniqueSources(sources || []);

            setProblems(convertedProblems);
            setIsDbConnected(true);
        } catch (error: any) {
            console.error('Failed to load from Supabase:', error);
            setIsDbConnected(false);
            setProblems([]);
            showToast(`⚠️ Could not load problems: ${error?.message || "unknown error"}`, "error");
        } finally {
            setIsLoadingFromDb(false);
        }
    }, [currentPage, pageSize, filterCategory, filterDifficulty, filterStatus, searchQuery, sortBy, showToast]);

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
                tags: problem.category ? problem.category.split(' > ').map(t => t.trim()) : [],
                diagram_image_url: problem.diagramImageUrl || undefined,
                source: problem.source || undefined,
                // starts_count, completes_count, etc. are usually not manually edited via editor
                // but we include them if they exist in the object to prevent overwriting with 0 if needed
                starts_count: problem.startsCount,
                completes_count: problem.completesCount,
                attempts_count: problem.attemptsCount,
                rating: problem.rating,
                likes_count: problem.likesCount,
                last_solved_at: problem.lastSolvedAt,
                is_generated: problem.isGenerated,
                // parent_problem_id: problem.parentProblemId, // Removed from 'problems' table.
            };

            // Prepare solutions for separate table
            const solutionsToSave = problem.solutions?.map((s, index) => {
                const isValidUUID = s.id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.id);
                return {
                    id: isValidUUID ? s.id : undefined,
                    content: s.content,
                    sequence_order: s.sequenceOrder || index + 1
                };
            }) || [];

            // If no solutions in array but legacy 'solution' exists (e.g. from UI input), add it
            if (solutionsToSave.length === 0 && problem.solution) {
                solutionsToSave.push({
                    id: undefined,
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

    // No direct "approve" here: problems are approved on /admin/reviews/<id>, which records the review
    // and applies the required approvals (src/app/api/admin/reviews/[id]/route.ts).

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
        filterStatus,
        setFilterStatus,
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
        uniqueSources,
        totalPages: Math.ceil(totalCount / pageSize)
    };
}
