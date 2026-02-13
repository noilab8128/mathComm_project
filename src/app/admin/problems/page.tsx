"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProblems } from "./hooks/useProblems";
import { problemsAPI, problemHierarchiesAPI, getDifficultyLabel, calculateXP, categoryToTags } from "@/lib/supabase";
import { ProblemHeader } from "./components/ProblemHeader";
import { ProblemStats } from "./components/ProblemStats";
import { ProblemFilters } from "./components/ProblemFilters";
import { ProblemList } from "./components/ProblemList";
import { ProblemEditor } from "./components/ProblemEditor";
import { LinkManagerDialog, CreateLinkDialog } from "./components/LinkManagerDialog";
import { Problem, Solution, RelatedProblem } from "./types";
import { CATEGORIES } from "@/lib/categories";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { resizeImage } from "@/lib/imageUtils";
import { convertPdfToImages } from "@/lib/pdf-utils";

export default function ProblemManagementPage() {
  const {
    problems,
    setProblems,
    currentPage,
    setCurrentPage,
    pageSize,
    totalCount,
    totalPages,
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
    clearSelection
  } = useProblems();

  // --- UI State ---
  const [viewMode, setViewMode] = useState<"list" | "grid" | "learning-path">("list");
  const [expandedProblems, setExpandedProblems] = useState<Set<string>>(new Set());
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showLinkManagerDialog, setShowLinkManagerDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { }
  });

  // --- Form State (Problem Editor) ---
  const [problemTitle, setProblemTitle] = useState("");
  const [problemContent, setProblemContent] = useState("");
  const [solution, setSolution] = useState("");
  const [difficulty, setDifficulty] = useState(1);
  const [category, setCategory] = useState("");
  const [selectedLevel1, setSelectedLevel1] = useState("");
  const [selectedLevel2, setSelectedLevel2] = useState("");
  const [selectedLevel3, setSelectedLevel3] = useState("");
  const [diagramImageUrl, setDiagramImageUrl] = useState("");
  const [linkedProblems, setLinkedProblems] = useState<string[]>([]);
  const [inputMethod, setInputMethod] = useState<"manual" | "file">("manual");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedFilePreview, setUploadedFilePreview] = useState<string>("");
  const [extractedDiagrams, setExtractedDiagrams] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false); // Generic for problem extraction
  const [isAnalyzingSolution, setIsAnalyzingSolution] = useState(false);
  const [isGeneratingRelated, setIsGeneratingRelated] = useState(false);
  const [relatedProblems, setRelatedProblems] = useState<RelatedProblem[]>([]);
  const [showRelatedProblems, setShowRelatedProblems] = useState(false);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [addedProblemTitles, setAddedProblemTitles] = useState<Set<string>>(new Set());
  const [uploadedSolutionFile, setUploadedSolutionFile] = useState<File | null>(null);
  const [uploadedSolutionFilePreview, setUploadedSolutionFilePreview] = useState<string>("");
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [uploadedSolutionFiles, setUploadedSolutionFiles] = useState<File[]>([]);
  const [uploadedSolutionFilesPreviews, setUploadedSolutionFilesPreviews] = useState<string[]>([]);
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [pendingProblems, setPendingProblems] = useState<Partial<Problem>[]>([]);
  const [currentBulkIndex, setCurrentBulkIndex] = useState(0);
  const [pdfImages, setPdfImages] = useState<string[]>([]);
  const [problemPageRange, setProblemPageRange] = useState("");
  const [solutionPageRange, setSolutionPageRange] = useState("");
  const [questionIndices, setQuestionIndices] = useState("");
  const [totalPdfPages, setTotalPdfPages] = useState(0);
  const [selectedProblemIndices, setSelectedProblemIndices] = useState<Set<number>>(new Set());

  // --- Drag & Drop / Linking State ---
  const [draggedProblemId, setDraggedProblemId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [linkType, setLinkType] = useState<'prerequisite' | 'derived' | 'related' | 'next' | 'alternative'>('derived');
  const [linkConcept, setLinkConcept] = useState("");
  const [linkEditMode, setLinkEditMode] = useState(false);
  const [linkEditSourceId, setLinkEditSourceId] = useState<string | null>(null);
  const [linkEditSourcePosition, setLinkEditSourcePosition] = useState<{ x: number, y: number } | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number, y: number } | null>(null);

  // --- Effects ---
  useEffect(() => {
    loadProblemsFromSupabase();
  }, [loadProblemsFromSupabase]);

  // --- Handlers ---

  const handleToggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedProblems);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedProblems(newExpanded);
  };

  const handleNewProblem = () => {
    setSelectedProblem(null);
    setIsEditing(false);
    setProblemTitle("");
    setProblemContent("");
    setSolution("");
    setDifficulty(1);
    setCategory("");
    setSelectedLevel1("");
    setSelectedLevel2("");
    setSelectedLevel3("");
    setDiagramImageUrl("");
    setLinkedProblems([]);
    setUploadedFile(null);
    setUploadedFilePreview("");
    setExtractedDiagrams([]);
    setRelatedProblems([]);
    setConcepts([]);
    setAddedProblemTitles(new Set());
    setUploadedSolutionFilePreview("");
    setSolutions([]);
    setUploadedSolutionFiles([]);
    setUploadedSolutionFilesPreviews([]);
    setIsBulkMode(false);
    setPendingProblems([]);
    setCurrentBulkIndex(0);
    setPdfImages([]);
    setProblemPageRange("");
    setSolutionPageRange("");
    setQuestionIndices("");
    setTotalPdfPages(0);
    setSelectedProblemIndices(new Set());
    setIsEditorOpen(true);
  };

  const handleSelectProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setIsEditing(true);
    setProblemTitle(problem.title);
    setProblemContent(problem.content);
    setSolution(problem.solution || "");
    setDifficulty(problem.difficulty);
    setCategory(problem.category);
    setDiagramImageUrl(problem.diagramImageUrl || "");
    setLinkedProblems(problem.linkedProblems || []);
    setUploadedFile(null);
    setUploadedFilePreview("");
    setExtractedDiagrams([]);
    setRelatedProblems([]);
    setConcepts([]);
    setUploadedSolutionFile(null);
    setUploadedSolutionFilePreview("");
    setSolutions(problem.solutions || []);
    setUploadedSolutionFiles([]);
    setUploadedSolutionFilesPreviews([]);

    // Parse category levels
    if (problem.category) {
      const parts = problem.category.split(' > ');
      const l1 = CATEGORIES.level1.find(c => c.name === parts[0]);
      if (l1) {
        setSelectedLevel1(l1.id);
        if (parts[1]) {
          const l2List = CATEGORIES.level2[l1.id as keyof typeof CATEGORIES.level2];
          const l2 = l2List?.find((c: any) => c.name === parts[1]);
          if (l2) {
            setSelectedLevel2(l2.id);
            if (parts[2]) {
              // Level 3 logic if needed
            }
          }
        }
      }
    }

    setIsEditorOpen(true);
  };

  const handleSaveProblem = async () => {
    if (isBulkMode && pendingProblems.length > 0) {
      // Final sync of current editor state into pending list
      const currentProb = {
        title: problemTitle,
        content: problemContent,
        solutions: solutions,
        difficulty: difficulty,
        category: category
      };
      const allProblems = [...pendingProblems];
      allProblems[currentBulkIndex] = currentProb;

      let savedCount = 0;
      for (let i = 0; i < allProblems.length; i++) {
        const prob = allProblems[i];
        if (!prob.title || !prob.content) continue;
        if (!selectedProblemIndices.has(i)) continue; // Skip if not selected

        // Map category string "L1 > L2" to IDs for database
        let l1Id = undefined, l2Id = undefined;
        if (prob.category) {
          const parts = prob.category.split(' > ');
          const l1 = CATEGORIES.level1.find(c => c.name === parts[0]);
          if (l1) {
            l1Id = l1.id;
            if (parts[1]) {
              const l2List = CATEGORIES.level2[l1.id as keyof typeof CATEGORIES.level2];
              const l2 = l2List?.find((c: any) => c.name === parts[1]);
              if (l2) l2Id = l2.id;
            }
          }
        }

        const problemToSave: Problem = {
          id: `temp-${Date.now()}-${savedCount}`,
          title: prob.title || "Untitled",
          content: prob.content || "",
          solution: prob.solutions && prob.solutions.length > 0 ? prob.solutions[0].content : "",
          solutions: prob.solutions ? prob.solutions.map((s: any, idx: number) => ({
            id: s.id,
            content: s.content,
            sequenceOrder: idx + 1
          })) : [],
          difficulty: prob.difficulty || 5,
          category: prob.category || "",
          xp: calculateXP(prob.difficulty || 5),
          diagramImageUrl: "",
          linkedProblems: [],
          isGenerated: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        try {
          await saveProblemToSupabase(problemToSave, l1Id, l2Id);
          savedCount++;
        } catch (error) {
          console.error('Error saving bulk problem:', error);
        }
      }

      showToast(`Successfully saved ${savedCount} problems from PDF!`, "success");
      setIsEditorOpen(false);
      setIsBulkMode(false);
      setPendingProblems([]);
      loadProblemsFromSupabase();
      return;
    }

    if (!problemTitle || !problemContent) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    const problemToSave: Problem = {
      id: selectedProblem?.id || `temp-${Date.now()}`,
      title: problemTitle,
      content: problemContent,
      solution: solution,
      solutions: solutions,
      difficulty: difficulty,
      category: category,
      xp: calculateXP(difficulty),
      diagramImageUrl: diagramImageUrl,
      linkedProblems: linkedProblems,
      isGenerated: selectedProblem?.isGenerated || false,
      parentProblemId: selectedProblem?.parentProblemId,
      createdAt: selectedProblem?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const saved = await saveProblemToSupabase(problemToSave, selectedLevel1, selectedLevel2, selectedLevel3);
      if (saved) {
        // Now save all staged related problems with hierarchy
        // We need to know which solution/stage they belong to
        // For now, we assume simple linear generation or rely on 'concepts' (stages) mapping if available
        // In the new 'relatedProblems' structure from API, we might expect stage info.

        const problemsToSave = relatedProblems.filter(p => addedProblemTitles.has(p.title));

        for (let i = 0; i < problemsToSave.length; i++) {
          const relatedProblem = problemsToSave[i];
          try {
            // Map RelatedProblem (client) to Problem (database)
            const newProblemData = {
              title: relatedProblem.title,
              content: relatedProblem.content,
              solution: relatedProblem.solution, // legacy
              difficulty: relatedProblem.difficulty,
              category_path: relatedProblem.category,
              category_level1: selectedLevel1 ? parseInt(selectedLevel1) : undefined,
              category_level2: selectedLevel2 ? parseInt(selectedLevel2) : undefined,
              category_level3: selectedLevel3 ? parseInt(selectedLevel3) : undefined,
              level: getDifficultyLabel(relatedProblem.difficulty),
              xp: calculateXP(relatedProblem.difficulty),
              tags: categoryToTags(relatedProblem.category),
              is_generated: true,
              // parent_problem_id: saved.id, // Removed from columns, use hierarchy table
            };

            // Create the child problem
            // Prepare child problem data - remove 'solution' as it's not in problems table
            const { solution, ...problemData } = newProblemData as any;

            // Cast solutions to any because problemsAPI.create handles assigning 'problem_id'
            const savedChild = await problemsAPI.create(problemData, [{
              content: relatedProblem.solution,
              sequence_order: 1
            }] as any);

            if (savedChild) {
              const stageName = concepts?.[0] || "Next Step";
              const currentDepth = saved.hierarchyInfo?.depth || 1;

              // Create Hierarchy Link
              await problemHierarchiesAPI.create(
                saved.id,
                savedChild.id,
                null, // parent_solution_id
                stageName,
                i + 1, // sequence_order
                currentDepth + 1 // depth
              );
            }

          } catch (error: any) {
            console.error('Error saving related problem:', error);
            console.error('Error Details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
          }
        }

        showToast(
          isEditing ? "Problem updated successfully!" : "Problem created successfully!",
          "success"
        );
        setIsEditorOpen(false);
        loadProblemsFromSupabase(); // Reload to get fresh data
      }
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleDeleteProblem = (id: string) => {
    setConfirmDialog({
      isOpen: true,
      title: "Delete Problem",
      message: "Are you sure you want to delete this problem? This action cannot be undone.",
      onConfirm: async () => {
        await deleteProblem(id);
        setConfirmDialog(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // --- AI Handlers ---

  const handleProblemFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);

      if (file.type === 'application/pdf') {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const arrayBuffer = reader.result as ArrayBuffer;
          try {
            // Initial preview (page 1)
            const result = await convertPdfToImages(arrayBuffer, [1]);
            setTotalPdfPages(result.totalPages);
            setPdfImages(result.images);
            setUploadedFilePreview(result.images[0]);
            setIsBulkMode(true);

            showToast(`PDF loaded: ${result.totalPages} pages. Enter ranges for extraction.`, "success");
          } catch (error) {
            console.error('Failed to convert PDF:', error);
            showToast("Failed to process PDF file", "error");
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          try {
            const resized = await resizeImage(base64);
            setUploadedFilePreview(resized);
            setIsBulkMode(false);
          } catch (error) {
            console.error('Failed to resize image:', error);
            setUploadedFilePreview(base64);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDiagramImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDiagramImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSolutionFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileList = Array.from(files);
      setUploadedSolutionFiles(prev => [...prev, ...fileList]);

      const newPreviews: string[] = [];
      for (const file of fileList) {
        const reader = new FileReader();
        const promise = new Promise<string>((resolve) => {
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            try {
              const resized = await resizeImage(base64);
              resolve(resized);
            } catch (error) {
              resolve(base64);
            }
          };
        });
        reader.readAsDataURL(file);
        newPreviews.push(await promise);
      }
      setUploadedSolutionFilesPreviews(prev => [...prev, ...newPreviews]);

      // Keep backward compatibility for now
      if (newPreviews.length > 0 && !uploadedSolutionFilePreview) {
        setUploadedSolutionFile(fileList[0]);
        setUploadedSolutionFilePreview(newPreviews[0]);
      }
    }
  };

  const handleAIAnalyzeProblem = async () => {
    if (!uploadedFilePreview && !uploadedFile) return;

    setIsAnalyzing(true);
    try {
      let finalImages = [uploadedFilePreview];
      let analysisAction = 'analyze';
      let requestPayload: any = { action: 'analyze' };

      if (isBulkMode && uploadedFile?.type === 'application/pdf') {
        analysisAction = 'bulk-analyze';

        // Helper to parse range string "1-3, 5" into [1, 2, 3, 5]
        const parseRange = (rangeStr: string) => {
          if (!rangeStr) return [];
          const pages = new Set<number>();
          rangeStr.split(',').forEach(part => {
            const [start, end] = part.split('-').map(s => parseInt(s.trim()));
            if (end) {
              for (let i = start; i <= end; i++) if (!isNaN(i)) pages.add(i);
            } else if (!isNaN(start)) {
              pages.add(start);
            }
          });
          return Array.from(pages).sort((a, b) => a - b);
        };

        const pPages = parseRange(problemPageRange);
        const sPages = parseRange(solutionPageRange);
        const allTargetPages = Array.from(new Set([...pPages, ...sPages])).sort((a, b) => a - b);

        if (allTargetPages.length > 0) {
          const reader = new FileReader();
          const arrayBuffer = await new Promise<ArrayBuffer>((resolve) => {
            reader.onload = () => resolve(reader.result as ArrayBuffer);
            reader.readAsArrayBuffer(uploadedFile);
          });

          const { images } = await convertPdfToImages(arrayBuffer, allTargetPages);
          finalImages = images;
        } else {
          finalImages = pdfImages; // Use the initial preview images if no range specified
        }

        requestPayload = {
          imagesBase64: finalImages,
          action: 'bulk-analyze',
          context: {
            problemPages: problemPageRange,
            solutionPages: solutionPageRange,
            questionIndices: questionIndices
          }
        };
      } else {
        requestPayload = {
          imageBase64: uploadedFilePreview,
          action: 'analyze'
        };
      }

      const response = await fetch('/api/analyze-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      });

      if (!response.ok) {
        let errorMessage = 'Analysis failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          errorMessage = `${errorMessage} (${response.status} ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success && result.data) {
        if (analysisAction === 'bulk-analyze' && result.data.problems) {
          if (result.data.problems.length === 0) {
            showToast("AI could not extract any problems. Try a clearer page range.", "error");
            return;
          }

          setPendingProblems(result.data.problems);
          setCurrentBulkIndex(0);
          // Auto-select all extracted problems by default
          setSelectedProblemIndices(new Set(result.data.problems.map((_: any, i: number) => i)));

          const first = result.data.problems[0];
          setProblemTitle(first.title || "");
          setProblemContent(first.content || "");
          setSolutions(first.solutions || []);
          if (first.solutions && first.solutions.length > 0) {
            setSolution(first.solutions[0].content);
          } else {
            setSolution("");
          }
          setDifficulty(first.difficulty || 5);
          setCategory(first.category || "");

          showToast(`Extracted ${result.data.problems.length} problems!`, "success");
        } else {
          const data = result.data;
          setProblemTitle(data.title || "");
          setProblemContent(data.content || "");
          setSolution(data.solution || "");
          setSolutions(data.solutions || []);
          setDifficulty(data.difficulty || 5);
          setCategory(data.category || "");

          if (data.concepts) setConcepts(data.concepts);
          showToast("Problem analyzed successfully!", "success");
        }
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);

      let finalMessage = error.message || "Failed to analyze problem";

      // Handle truncation/JSON parse errors specifically
      if (finalMessage.includes('JSON') || finalMessage.includes('parse')) {
        finalMessage = "AI Response Truncated: The content was too large for a single response. Please use more specific 'Question Numbers' or a smaller page range.";
      }
      else if (finalMessage.includes('429') || finalMessage.includes('too large') || finalMessage.includes('tokens')) {
        finalMessage = "TPM Limit REACHED: The range/indices are too broad for a single request. Please try a smaller page range or fewer question indices.";
      }

      showToast(finalMessage, "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAISolutionAnalyze = async () => {
    if (uploadedSolutionFilesPreviews.length === 0 && !uploadedSolutionFilePreview) return;

    setIsAnalyzingSolution(true);
    try {
      const response = await fetch('/api/analyze-problem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imagesBase64: uploadedSolutionFilesPreviews.length > 0 ? uploadedSolutionFilesPreviews : [uploadedSolutionFilePreview],
          action: 'extract-solution'
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Solution extraction failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          // If not JSON, use the status text
          errorMessage = `${errorMessage} (${response.status} ${response.statusText})`;
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      if (result.success && result.data?.solutions) {
        const extractedSolutions = result.data.solutions.map((s: any, idx: number) => ({
          id: `ext-${Date.now()}-${idx}`,
          title: s.title || `Solution ${idx + 1}`,
          content: s.content
        }));

        setSolutions(prev => [...prev, ...extractedSolutions]);

        // Also update the main 'solution' for backward compatibility
        if (extractedSolutions.length > 0) {
          setSolution(extractedSolutions[0].content);
        }

        showToast(`Extracted ${extractedSolutions.length} solution(s)!`, "success");
      } else {
        throw new Error(result.error || 'Failed to extract solution');
      }
    } catch (error: any) {
      console.error('Solution extraction error:', error);
      showToast(error.message || "Failed to extract solution from image", "error");
    } finally {
      setIsAnalyzingSolution(false);
    }
  };

  const handleAIGenerateSolution = async () => {
    if (!problemContent) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/generate-solution', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: problemContent }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const data = await response.json();
      setSolution(data.solution);
      showToast("Solution generated successfully!", "success");
    } catch (error) {
      console.error('Generation error:', error);
      showToast("Failed to generate solution", "error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAIDifficulty = async () => {
    // Mock implementation for now
    setIsAnalyzing(true);
    setTimeout(() => {
      setDifficulty(Math.floor(Math.random() * 10) + 1);
      setIsAnalyzing(false);
      showToast("Difficulty estimated!", "success");
    }, 1000);
  };

  const handleGenerateRelatedProblems = async () => {
    if (!problemContent) return;

    setIsGeneratingRelated(true);
    try {
      const response = await fetch('/api/generate-related-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemContent: problemContent,
          solutions: solutions.map(s => ({ content: s.content })),
          category: category,
          difficulty: difficulty
        }),
      });

      if (!response.ok) throw new Error('Generation failed');

      const result = await response.json();
      if (result.success && result.data?.relatedProblems) {
        setRelatedProblems(prev => [...prev, ...result.data.relatedProblems]);
        // Use stages instead of concepts
        setConcepts(result.data.stages || []);
        setShowRelatedProblems(true);
        showToast(`Generated ${result.data.relatedProblems.length} related problems!`, "success");
      } else {
        throw new Error(result.error || 'No problems generated');
      }
    } catch (error) {
      console.error('Generation error:', error);
      showToast("Failed to generate related problems", "error");
    } finally {
      setIsGeneratingRelated(false);
    }
  };

  const handleAddRelatedProblem = async (relatedProblem: RelatedProblem) => {
    // Just mark as added, don't save to DB yet
    setAddedProblemTitles(prev => new Set(prev).add(relatedProblem.title));
    showToast(`"${relatedProblem.title}" will be saved when you click Update Problem`, "success");
  };

  const handleRemoveRelatedProblem = async (relatedProblem: RelatedProblem) => {
    // Just remove from added set
    setAddedProblemTitles(prev => {
      const newSet = new Set(prev);
      newSet.delete(relatedProblem.title);
      return newSet;
    });
    showToast(`"${relatedProblem.title}" removed from selection`, "success");
  };

  // --- Drag & Drop Handlers ---

  const handleDragStart = (e: React.DragEvent, problemId: string) => {
    setDraggedProblemId(problemId);
    e.dataTransfer.setData("text/plain", problemId);
    e.dataTransfer.effectAllowed = "link";
  };

  const handleDragOver = (e: React.DragEvent, problemId: string) => {
    e.preventDefault();
    if (draggedProblemId && draggedProblemId !== problemId) {
      setDropTargetId(problemId);
      e.dataTransfer.dropEffect = "link";
    }
  };

  const handleDragLeave = (e: React.DragEvent, problemId: string) => {
    if (dropTargetId === problemId) {
      setDropTargetId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetProblemId: string) => {
    e.preventDefault();
    const sourceId = e.dataTransfer.getData("text/plain");

    if (sourceId && sourceId !== targetProblemId) {
      setDraggedProblemId(sourceId);
      setDropTargetId(targetProblemId);
      setShowLinkDialog(true);
    } else {
      setDraggedProblemId(null);
      setDropTargetId(null);
    }
  };

  const handleCreateLink = async () => {
    if (!draggedProblemId || !dropTargetId) return;

    try {
      // 1. Update local state
      const sourceProblem = problems.find(p => p.id === draggedProblemId);
      if (sourceProblem) {
        const updatedSource = {
          ...sourceProblem,
          linkedProblems: [...(sourceProblem.linkedProblems || []), dropTargetId]
        };
        setProblems(prev => prev.map(p => p.id === draggedProblemId ? updatedSource : p));

        // If it's a derived/prerequisite relationship, update parent pointer locally for UI
        const targetProblem = problems.find(p => p.id === dropTargetId);
        if (targetProblem) {
          // Update local state only to reflect hierarchy in UI if needed
          const updatedTarget = { ...targetProblem, parentProblemId: draggedProblemId };
          setProblems(prev => prev.map(p => p.id === dropTargetId ? updatedTarget : p));
        }
      }

      // 2. Save link to DB using Hierarchy
      if (isDbConnected) {
        // We need depth and sequence. 
        // Default: 1st child, depth = parent depth + 1
        const parent = problems.find(p => p.id === draggedProblemId);
        const parentDepth = parent?.hierarchyInfo?.depth || 1;

        await problemHierarchiesAPI.create(
          draggedProblemId,
          dropTargetId,
          null, // parent_solution_id
          linkConcept || "Linked", // stage_name
          1, // sequence_order (TODO: calculate properly)
          parentDepth + 1
        );
      }

      showToast("Link created successfully!", "success");
    } catch (error) {
      console.error('Failed to create link:', error);
      showToast("Failed to create link", "error");
    } finally {
      setShowLinkDialog(false);
      setDraggedProblemId(null);
      setDropTargetId(null);
      setLinkConcept("");
    }
  };

  const handleDeleteLink = async (sourceId: string, targetId: string) => {
    try {
      // Update local state
      setProblems(prev => prev.map(p => {
        if (p.id === sourceId) {
          return {
            ...p,
            linkedProblems: p.linkedProblems?.filter(id => id !== targetId)
          };
        }
        if (p.id === targetId && p.parentProblemId === sourceId) {
          return {
            ...p,
            parentProblemId: undefined
          };
        }
        return p;
      }));

      // Delete from DB (Hierarchy)
      if (isDbConnected) {
        await problemHierarchiesAPI.delete(sourceId, targetId);
      }

      showToast("Link removed", "success");
    } catch (error: any) {
      console.error('Failed to delete link:', error);
      showToast("Failed to delete link", "error");
    }
  };

  // --- Link Editing (Visual) ---

  const handleStartLinkEdit = (e: React.MouseEvent, problemId: string) => {
    e.stopPropagation();
    setLinkEditMode(true);
    setLinkEditSourceId(problemId);
    setLinkEditSourcePosition({ x: e.clientX, y: e.clientY });
    setMousePosition({ x: e.clientX, y: e.clientY });
    showToast("Select a new parent problem", "success");
  };

  const handleCancelLinkEdit = () => {
    setLinkEditMode(false);
    setLinkEditSourceId(null);
    setLinkEditSourcePosition(null);
    setMousePosition(null);
  };

  const handleChangeLinkParent = async (newParentId: string) => {
    if (!linkEditSourceId || !newParentId || linkEditSourceId === newParentId) return;

    try {
      // Update local state
      setProblems(prev => prev.map(p => {
        if (p.id === linkEditSourceId) {
          return { ...p, parentProblemId: newParentId };
        }
        return p;
      }));

      // Update DB
      if (isDbConnected) {
        await problemsAPI.update(linkEditSourceId, { parent_problem_id: newParentId });
      }

      showToast("Parent problem updated!", "success");
    } catch (error) {
      console.error('Failed to update parent:', error);
      showToast("Failed to update parent", "error");
    } finally {
      handleCancelLinkEdit();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-900">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <ProblemHeader
          isDbConnected={isDbConnected}
          onSync={loadProblemsFromSupabase}
          onExport={handleExportCSV}
          onNewProblem={handleNewProblem}
          onManageLinks={() => setShowLinkManagerDialog(true)}
          isLoadingFromDb={isLoadingFromDb}
        />

        {/* Stats */}
        <ProblemStats problems={problems} />

        {/* Filters & List */}
        <div className="space-y-4">
          <ProblemFilters
            totalCount={totalCount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            filterDifficulty={filterDifficulty}
            setFilterDifficulty={setFilterDifficulty}
            sortBy={sortBy}
            setSortBy={setSortBy}
            categories={CATEGORIES}
          />

          <ProblemList
            problems={problems}
            viewMode={viewMode}
            selectedProblem={selectedProblem}
            expandedProblems={expandedProblems}
            draggedProblemId={draggedProblemId}
            dropTargetId={dropTargetId}
            linkEditMode={linkEditMode}
            linkEditSourceId={linkEditSourceId}
            linkEditSourcePosition={linkEditSourcePosition}
            mousePosition={mousePosition}
            currentPage={currentPage}
            pageSize={pageSize}
            totalCount={totalCount}
            totalPages={Math.ceil(totalCount / pageSize)}
            isLoadingFromDb={isLoadingFromDb}
            onSelectProblem={handleSelectProblem}
            onDeleteProblem={handleDeleteProblem}
            onToggleExpanded={handleToggleExpanded}
            onPageChange={setCurrentPage}
            onDragStart={handleDragStart}
            onDragEnd={() => {
              setDraggedProblemId(null);
              setDropTargetId(null);
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onStartLinkEdit={handleStartLinkEdit}
            onCancelLinkEdit={handleCancelLinkEdit}
            onChangeLinkParent={handleChangeLinkParent}
            onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
            selectedProblemIds={selectedProblemIds}
            toggleProblemSelection={toggleProblemSelection}
            selectAllProblems={selectAllProblems}
            clearSelection={clearSelection}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
        </div>

        {/* Dialogs */}
        <ProblemEditor
          isOpen={isEditorOpen}
          onOpenChange={setIsEditorOpen}
          isEditing={isEditing}
          selectedProblem={selectedProblem}
          problemTitle={problemTitle}
          setProblemTitle={setProblemTitle}
          problemContent={problemContent}
          setProblemContent={setProblemContent}
          solution={solution}
          setSolution={setSolution}
          difficulty={difficulty}
          setDifficulty={setDifficulty}
          category={category}
          setCategory={setCategory}
          selectedLevel1={selectedLevel1}
          setSelectedLevel1={setSelectedLevel1}
          selectedLevel2={selectedLevel2}
          setSelectedLevel2={setSelectedLevel2}
          selectedLevel3={selectedLevel3}
          setSelectedLevel3={setSelectedLevel3}
          diagramImageUrl={diagramImageUrl}
          setDiagramImageUrl={setDiagramImageUrl}
          linkedProblems={linkedProblems}
          inputMethod={inputMethod}
          setInputMethod={setInputMethod}
          uploadedFile={uploadedFile}
          uploadedFilePreview={uploadedFilePreview}
          extractedDiagrams={extractedDiagrams}
          isAnalyzing={isAnalyzing}
          isAnalyzingSolution={isAnalyzingSolution}
          isGeneratingRelated={isGeneratingRelated}
          relatedProblems={relatedProblems}
          showRelatedProblems={showRelatedProblems}
          setShowRelatedProblems={setShowRelatedProblems}
          concepts={concepts}
          addedProblemTitles={addedProblemTitles}
          onSave={handleSaveProblem}
          onCancel={() => setIsEditorOpen(false)}
          onFileUpload={handleProblemFileUpload}
          onDiagramUpload={handleDiagramImageUpload}
          onSolutionFileUpload={handleSolutionFileUpload}
          onAIAnalyze={handleAIAnalyzeProblem}
          onAISolutionAnalyze={handleAISolutionAnalyze}
          onAIGenerateSolution={handleAIGenerateSolution}
          onAIDifficulty={handleAIDifficulty}
          onGenerateRelated={handleGenerateRelatedProblems}
          onAddRelated={handleAddRelatedProblem}
          onRemoveRelated={handleRemoveRelatedProblem}
          onSelectExtractedDiagram={(url) => setDiagramImageUrl(url)}
          onRemoveExtractedDiagram={(index) => setExtractedDiagrams(prev => prev.filter((_, i) => i !== index))}
          onClearRelated={() => {
            // Only clear the added status, don't remove the generated problems
            setAddedProblemTitles(new Set());
          }}
          uploadedSolutionFile={uploadedSolutionFile}
          uploadedSolutionFilePreview={uploadedSolutionFilePreview}
          solutions={solutions}
          setSolutions={setSolutions}
          uploadedSolutionFiles={uploadedSolutionFiles}
          uploadedSolutionFilesPreviews={uploadedSolutionFilesPreviews}
          isBulkMode={isBulkMode}
          pendingProblems={pendingProblems}
          currentBulkIndex={currentBulkIndex}
          onBulkIndexChange={(index) => {
            // Save current changes to the pending list before switching
            const currentProb = {
              title: problemTitle,
              content: problemContent,
              solutions: solutions,
              difficulty: difficulty,
              category: category
            };
            const updatedPending = [...pendingProblems];
            updatedPending[currentBulkIndex] = currentProb;
            setPendingProblems(updatedPending);

            // Switch to new problem from pending list
            const nextProb = updatedPending[index];
            setProblemTitle(nextProb.title || "");
            setProblemContent(nextProb.content || "");
            setSolutions(nextProb.solutions || []);
            if (nextProb.solutions && nextProb.solutions.length > 0) {
              setSolution(nextProb.solutions[0].content);
            }
            setDifficulty(nextProb.difficulty || 5);
            setCategory(nextProb.category || "");
            setCurrentBulkIndex(index);
          }}
          problemPageRange={problemPageRange}
          setProblemPageRange={setProblemPageRange}
          solutionPageRange={solutionPageRange}
          setSolutionPageRange={setSolutionPageRange}
          questionIndices={questionIndices}
          setQuestionIndices={setQuestionIndices}
          totalPdfPages={totalPdfPages}
          selectedProblemIndices={selectedProblemIndices}
          setSelectedProblemIndices={setSelectedProblemIndices}
        />

        <LinkManagerDialog
          isOpen={showLinkManagerDialog}
          onOpenChange={setShowLinkManagerDialog}
          problemId={selectedProblem?.id || null}
          problems={problems}
          onDeleteLink={handleDeleteLink}
        />

        <CreateLinkDialog
          isOpen={showLinkDialog}
          onOpenChange={setShowLinkDialog}
          draggedProblemId={draggedProblemId}
          dropTargetId={dropTargetId}
          problems={problems}
          linkType={linkType}
          setLinkType={setLinkType}
          linkConcept={linkConcept}
          setLinkConcept={setLinkConcept}
          onCreateLink={handleCreateLink}
          onCancel={() => setShowLinkDialog(false)}
        />

        {/* Global Toast */}
        {toast.show && (
          <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white transition-all transform translate-y-0 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}>
            {toast.message}
          </div>
        )}

        {/* Confirmation Dialog */}
        <Dialog open={confirmDialog.isOpen} onOpenChange={(open) => !open && setConfirmDialog(prev => ({ ...prev, isOpen: false }))}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{confirmDialog.title}</DialogTitle>
              <DialogDescription className="whitespace-pre-wrap">
                {confirmDialog.message}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDialog.onConfirm}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  );
}
