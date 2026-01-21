"use client";

import React, { useState, useEffect, useRef } from "react";
import { useProblems } from "./hooks/useProblems";
import { ProblemHeader } from "./components/ProblemHeader";
import { ProblemStats } from "./components/ProblemStats";
import { ProblemFilters } from "./components/ProblemFilters";
import { ProblemList } from "./components/ProblemList";
import { ProblemEditor } from "./components/ProblemEditor";
import { LinkManagerDialog, CreateLinkDialog } from "./components/LinkManagerDialog";
import { Problem, RelatedProblem } from "./types";
import { problemsAPI, problemRelationshipsAPI, getDifficultyLabel, calculateXP, categoryToTags } from "@/lib/supabase";
import { CATEGORIES } from "@/lib/categories";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [relatedProblems, setRelatedProblems] = useState<RelatedProblem[]>([]);
  const [showRelatedProblems, setShowRelatedProblems] = useState(false);
  const [concepts, setConcepts] = useState<string[]>([]);
  const [addedProblemTitles, setAddedProblemTitles] = useState<Set<string>>(new Set());

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
    if (!problemTitle || !problemContent) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    const problemToSave: Problem = {
      id: selectedProblem?.id || `temp-${Date.now()}`,
      title: problemTitle,
      content: problemContent,
      solution: solution,
      difficulty: difficulty,
      category: category,
      diagramImageUrl: diagramImageUrl,
      linkedProblems: linkedProblems,
      isGenerated: selectedProblem?.isGenerated || false,
      parentProblemId: selectedProblem?.parentProblemId,
      createdAt: selectedProblem?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    try {
      const saved = await saveProblemToSupabase(problemToSave, selectedLevel1, selectedLevel2, selectedLevel3);
      if (saved) {
        // Now save all staged related problems
        for (const relatedProblem of relatedProblems.filter(p => addedProblemTitles.has(p.title))) {
          try {
            const newProblemData: Omit<Problem, 'id' | 'created_at' | 'updated_at'> = {
              title: relatedProblem.title,
              content: relatedProblem.content,
              solution: relatedProblem.solution,
              difficulty: relatedProblem.difficulty,
              category_path: relatedProblem.category,
              diagram_image_url: undefined,
              linked_problem_ids: [],
              is_generated: true,
              parent_problem_id: saved.id, // Link to the saved problem
            };
            await problemsAPI.create(newProblemData);
          } catch (error) {
            console.error('Error saving related problem:', error);
          }
        }

        showToast(
          isEditing
            ? `Problem updated successfully! ${addedProblemTitles.size} related problems saved.`
            : `Problem created successfully! ${addedProblemTitles.size} related problems saved.`,
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
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
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

  const handleAIAnalyzeProblem = async () => {
    if (!uploadedFile) return;

    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('/api/analyze-problem', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();
      setProblemTitle(data.title || "");
      setProblemContent(data.content || "");
      setSolution(data.solution || "");
      setDifficulty(data.difficulty || 5);
      setCategory(data.category || "");
      if (data.diagrams && data.diagrams.length > 0) {
        setExtractedDiagrams(data.diagrams);
        setDiagramImageUrl(data.diagrams[0]);
      }
      showToast("Problem analyzed successfully!", "success");
    } catch (error) {
      console.error('Analysis error:', error);
      showToast("Failed to analyze problem", "error");
    } finally {
      setIsAnalyzing(false);
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

    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/generate-related-problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          problemContent: problemContent,
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
      setIsAnalyzing(false);
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

        // If it's a derived/prerequisite relationship, update parent pointer
        if (linkType === 'derived') {
          const targetProblem = problems.find(p => p.id === dropTargetId);
          if (targetProblem) {
            const updatedTarget = { ...targetProblem, parentProblemId: draggedProblemId };
            setProblems(prev => prev.map(p => p.id === dropTargetId ? updatedTarget : p));

            // Save parent update to DB
            if (isDbConnected) {
              await problemsAPI.update(dropTargetId, { parent_problem_id: draggedProblemId });
            }
          }
        }
      }

      // 2. Save link to DB
      if (isDbConnected) {
        await problemRelationshipsAPI.create(
          draggedProblemId,
          dropTargetId,
          linkType,
          { concept: linkConcept }
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

      // Delete from DB
      if (isDbConnected) {
        // We need the relationship ID to delete properly, but for now we'll just update the problems
        // In a real app, we'd query the relationship ID first or have an API to delete by source/target
        // For now, let's assume we just update the parent pointer if it exists
        const targetProblem = problems.find(p => p.id === targetId);
        if (targetProblem?.parentProblemId === sourceId) {
          await problemsAPI.update(targetId, { parent_problem_id: undefined });
        }
      }

      showToast("Link removed", "success");
    } catch (error) {
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
          relatedProblems={relatedProblems}
          showRelatedProblems={showRelatedProblems}
          setShowRelatedProblems={setShowRelatedProblems}
          concepts={concepts}
          addedProblemTitles={addedProblemTitles}
          onSave={handleSaveProblem}
          onCancel={() => setIsEditorOpen(false)}
          onFileUpload={handleProblemFileUpload}
          onDiagramUpload={handleDiagramImageUpload}
          onAIAnalyze={handleAIAnalyzeProblem}
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
