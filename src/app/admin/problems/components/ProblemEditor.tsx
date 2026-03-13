/* eslint-disable */
// @ts-nocheck
import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import MathPreview from "@/components/MathPreview";
import { ChevronRight, ChevronDown, Trash2, Plus, PlusCircle, Search, Hash, X } from "lucide-react";
import { Problem, RelatedProblem, Solution } from "../types";
import { CATEGORIES } from "@/lib/categories";

interface ProblemEditorProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    isEditing: boolean;
    selectedProblem: Problem | null;

    // Form State
    problemTitle: string;
    setProblemTitle: (value: string) => void;
    problemContent: string;
    setProblemContent: (value: string) => void;
    solution: string;
    setSolution: (value: string) => void;
    solutions: Solution[];
    setSolutions: (value: Solution[]) => void;
    difficulty: number;
    setDifficulty: (value: number) => void;
    category: string;
    setCategory: (value: string) => void;
    selectedLevel1: string;
    setSelectedLevel1: (value: string) => void;
    selectedLevel2: string;
    setSelectedLevel2: (value: string) => void;
    selectedLevel3: string;
    setSelectedLevel3: (value: string) => void;
    diagramImageUrl: string;
    setDiagramImageUrl: (value: string) => void;
    source: string;
    setSource: (value: string) => void;
    allSources: string[];
    linkedProblems: string[];

    // AI & Upload State
    inputMethod: "manual" | "file";
    setInputMethod: (value: "manual" | "file") => void;
    uploadedFile: File | null;
    uploadedFilePreview: string;
    extractedDiagrams: string[];
    isAnalyzing: boolean;
    isAnalyzingSolution?: boolean;
    isGeneratingRelated?: boolean;
    relatedProblems: RelatedProblem[];
    showRelatedProblems: boolean;
    setShowRelatedProblems: (show: boolean) => void;
    concepts: string[];
    addedProblemTitles: Set<string>;

    // Handlers
    onSave: () => void;
    onCancel: () => void;
    onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDiagramUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onSolutionFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAIAnalyze: () => void;
    onAISolutionAnalyze: () => void;
    onAIGenerateSolution: () => void;
    onAIDifficulty: () => void;
    onGenerateRelated: () => void;
    onAddRelated: (problem: RelatedProblem) => void;
    onRemoveRelated: (problem: RelatedProblem) => void;
    onSelectExtractedDiagram: (url: string) => void;
    onRemoveExtractedDiagram: (index: number) => void;
    onClearRelated: () => void;
    uploadedSolutionFile?: File | null;
    uploadedSolutionFilePreview?: string;
    uploadedSolutionFiles?: File[];
    uploadedSolutionFilesPreviews?: string[];

    // Bulk Mode
    isBulkMode?: boolean;
    pendingProblems?: Partial<Problem>[];
    currentBulkIndex?: number;
    onBulkIndexChange?: (index: number) => void;

    // Targeted Extraction
    problemPageRange?: string;
    setProblemPageRange?: (v: string) => void;
    solutionPageRange?: string;
    setSolutionPageRange?: (v: string) => void;
    questionIndices?: string;
    setQuestionIndices?: (v: string) => void;
    totalPdfPages?: number;
    selectedProblemIndices?: Set<number>;
    setSelectedProblemIndices?: (v: Set<number> | ((prev: Set<number>) => Set<number>)) => void;
}

const GENERATION_STEPS = [
    "Analyzing problem structure...",
    "Reading problem generation guide...",
    "Identifying key concepts and stages...",
    "Generating foundational sub-problems...",
    "Formatting mathematical formulas...",
    "Finalizing stages and categories..."
];


export function ProblemEditor({
    isOpen,
    onOpenChange,
    isEditing,
    selectedProblem,
    problemTitle,
    setProblemTitle,
    problemContent,
    setProblemContent,
    solution,
    setSolution,
    difficulty,
    setDifficulty,
    category,
    setCategory,
    selectedLevel1,
    setSelectedLevel1,
    selectedLevel2,
    setSelectedLevel2,
    selectedLevel3,
    setSelectedLevel3,
    diagramImageUrl,
    setDiagramImageUrl,
    source,
    setSource,
    allSources,
    linkedProblems,
    inputMethod,
    setInputMethod,
    uploadedFile,
    uploadedFilePreview,
    extractedDiagrams,
    isAnalyzing,
    isAnalyzingSolution,
    isGeneratingRelated,
    relatedProblems,
    showRelatedProblems,
    setShowRelatedProblems,
    concepts,
    addedProblemTitles,
    onSave,
    onCancel,
    onFileUpload,
    onDiagramUpload,
    onSolutionFileUpload,
    onAIAnalyze,
    onAISolutionAnalyze,
    onAIGenerateSolution,
    onAIDifficulty,
    onGenerateRelated,
    onAddRelated,
    onRemoveRelated,
    onSelectExtractedDiagram,
    onRemoveExtractedDiagram,
    onClearRelated,
    uploadedSolutionFile,
    uploadedSolutionFilePreview,
    solutions,
    setSolutions,
    uploadedSolutionFiles,
    uploadedSolutionFilesPreviews,
    isBulkMode = false,
    pendingProblems = [],
    currentBulkIndex = 0,
    onBulkIndexChange,
    problemPageRange = "",
    setProblemPageRange,
    solutionPageRange = "",
    setSolutionPageRange,
    questionIndices = "",
    setQuestionIndices,
    totalPdfPages = 0,
    selectedProblemIndices = new Set(),
    setSelectedProblemIndices
}: ProblemEditorProps) {
    const problemFileInputRef = useRef<HTMLInputElement>(null);
    const diagramFileInputRef = useRef<HTMLInputElement>(null);
    const solutionFileInputRef = useRef<HTMLInputElement>(null);
    const [selectedRelatedProblem, setSelectedRelatedProblem] = React.useState<RelatedProblem | null>(null);
    const [progress, setProgress] = React.useState(0);
    const [stepIndex, setStepIndex] = React.useState(0);

    const [inputValue, setInputValue] = React.useState(source);
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const dropdownRef = React.useRef<HTMLDivElement>(null);

    // AI Generation Progress Logic
    React.useEffect(() => {
        let interval: NodeJS.Timeout;
        let stepInterval: NodeJS.Timeout;

        // Current active AI process
        const isCurrentAnalyzing = isAnalyzing || isAnalyzingSolution || isGeneratingRelated;

        if (isCurrentAnalyzing) {
            setProgress(0);
            setStepIndex(0);

            // Increment progress bar
            interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 95) return prev; // Cap at 95% until finished
                    return prev + Math.random() * 5;
                });
            }, 800);

            // Cycle through steps
            stepInterval = setInterval(() => {
                setStepIndex(prev => (prev + 1) % GENERATION_STEPS.length);
            }, 3000);
        } else {
            setProgress(0);
            setStepIndex(0);
        }

        return () => {
            clearInterval(interval);
            clearInterval(stepInterval);
        };
    }, [isAnalyzing, isAnalyzingSolution, isGeneratingRelated]);

    // Filter unique sources based on input
    const filteredSources = allSources.filter(s =>
        s.toLowerCase().includes(inputValue.toLowerCase()) && s !== inputValue
    );

    const showCreateNew = inputValue.trim() !== "" && !allSources.includes(inputValue);

    // Sync input value with source prop when it changes (e.g. when selecting a new problem)
    React.useEffect(() => {
        setInputValue(source);
    }, [source]);

    // Handle clicking outside to close dropdown
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectSource = (value: string) => {
        setSource(value);
        setInputValue(value);
        setIsDropdownOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[98vw] !max-h-[98vh] w-full h-full p-0 overflow-hidden bg-white shadow-2xl">
                <div className="flex flex-col h-full max-h-[98vh]">
                    <DialogHeader className="p-6 border-b flex-shrink-0">
                        <DialogTitle className="text-2xl font-semibold text-gray-800">
                            {isEditing ? "Edit Problem" : "New Problem"}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden flex min-h-0">
                        {/* Bulk Sidebar */}
                        {isBulkMode && pendingProblems.length > 0 && (
                            <div className="w-64 border-r bg-gray-50 flex flex-col flex-shrink-0">
                                <div className="p-4 border-b bg-white">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Problems in PDF</h3>
                                    <p className="text-[10px] text-gray-500 mt-1">{pendingProblems.length} problems detected</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                    {pendingProblems.map((prob, idx) => (
                                        <div
                                            key={idx}
                                            className={`relative p-3 rounded-lg border transition-all cursor-pointer ${currentBulkIndex === idx
                                                ? "bg-indigo-600 border-indigo-600 shadow-md text-white"
                                                : "bg-white border-gray-200 text-gray-700 hover:border-indigo-300"
                                                }`}
                                            onClick={() => onBulkIndexChange?.(idx)}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div
                                                    className="mt-0.5"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (!setSelectedProblemIndices) return;
                                                        setSelectedProblemIndices(prev => {
                                                            const next = new Set(prev);
                                                            if (next.has(idx)) next.delete(idx);
                                                            else next.add(idx);
                                                            return next;
                                                        });
                                                    }}
                                                >
                                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedProblemIndices.has(idx)
                                                        ? (currentBulkIndex === idx ? 'bg-white text-indigo-600 border-white' : 'bg-indigo-600 text-white border-indigo-600')
                                                        : (currentBulkIndex === idx ? 'bg-indigo-700/50 border-white' : 'bg-white border-gray-300')
                                                        }`}>
                                                        {selectedProblemIndices.has(idx) && (
                                                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge className={`${currentBulkIndex === idx ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"} border-none text-[10px] font-bold px-1`}>
                                                            #{idx + 1}
                                                        </Badge>
                                                        <span className={`text-[10px] font-bold uppercase tracking-tight truncate ${currentBulkIndex === idx ? "text-white/70" : "text-gray-400"}`}>
                                                            {prob.solutions && prob.solutions.length > 1 ? `${prob.solutions.length} Solutions` : (prob.category?.split(' > ').pop() || "No Category")}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs font-semibold line-clamp-1">{prob.title || "Untitled Problem"}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex-1 overflow-y-auto p-6 min-h-0">
                            <div className="w-full space-y-4">
                                {/* Input Method Tabs */}
                                <Tabs value={inputMethod} onValueChange={(v) => setInputMethod(v as "manual" | "file")}>
                                    <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg">
                                        <TabsTrigger
                                            value="file"
                                            className={`text-sm font-medium rounded-md transition-all ${inputMethod === "file"
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "bg-transparent text-gray-600 hover:text-gray-800"
                                                }`}
                                        >
                                            Upload File (AI)
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="manual"
                                            className={`text-sm font-medium rounded-md transition-all ${inputMethod === "manual"
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : "bg-transparent text-gray-600 hover:text-gray-800"
                                                }`}
                                        >
                                            Manual Input
                                        </TabsTrigger>
                                    </TabsList>

                                    {/* File Upload Tab */}
                                    <TabsContent value="file" className="space-y-4 mt-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-800">
                                                Upload Problem File (Image or PDF)
                                            </label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Input
                                                    type="file"
                                                    ref={problemFileInputRef}
                                                    onChange={onFileUpload}
                                                    accept="image/*,.pdf"
                                                    className="hidden"
                                                />
                                                <Button
                                                    onClick={() => problemFileInputRef.current?.click()}
                                                    variant="outline"
                                                    className="text-sm text-gray-700 border-gray-300 hover:bg-gray-50"
                                                    disabled={isAnalyzing}
                                                >
                                                    Choose File
                                                </Button>
                                                {uploadedFile && (
                                                    <span className="text-xs text-gray-600">{uploadedFile.name}</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                AI will extract problem content, formulas, diagrams, and solution from the file
                                            </p>
                                        </div>

                                        {uploadedFilePreview && (
                                            <div className="p-4 border border-gray-200 rounded-md bg-gray-50 mb-4">
                                                <h3 className="text-sm font-medium text-gray-800 mb-2">
                                                    Uploaded File Preview {totalPdfPages > 0 && `(Total ${totalPdfPages} pages)`}
                                                </h3>
                                                <img
                                                    src={uploadedFilePreview}
                                                    alt="Uploaded file"
                                                    className="max-w-full h-auto rounded-md shadow-sm border border-gray-200"
                                                />
                                            </div>
                                        )}

                                        {/* Targeted Extraction Settings (PDF Bulk Only) */}
                                        {isBulkMode && uploadedFile?.type === 'application/pdf' && (
                                            <div className="p-4 border border-indigo-200 rounded-lg bg-indigo-50/30 space-y-4 mb-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-indigo-600"><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9Z" /><path d="M9.17 14.83 14.83 9.17" /><path d="m9.17 9.17 5.66 5.66" /></svg>
                                                    <h3 className="text-sm font-bold text-indigo-900">Targeted Extraction Settings</h3>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Problem Page Range</label>
                                                        <Input
                                                            placeholder="e.g., 1-3, 5"
                                                            value={problemPageRange}
                                                            onChange={(e) => setProblemPageRange?.(e.target.value)}
                                                            className="bg-white border-indigo-200 text-sm h-9 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Solution Page Range</label>
                                                        <Input
                                                            placeholder="e.g., 120-125"
                                                            value={solutionPageRange}
                                                            onChange={(e) => setSolutionPageRange?.(e.target.value)}
                                                            className="bg-white border-indigo-200 text-sm h-9 focus:ring-indigo-500"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1.5">
                                                    <label className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Specific Question Numbers</label>
                                                    <Input
                                                        placeholder="e.g., 1, 3, 5-8 (Optional)"
                                                        value={questionIndices}
                                                        onChange={(e) => setQuestionIndices?.(e.target.value)}
                                                        className="bg-white border-indigo-200 text-sm h-9 focus:ring-indigo-500"
                                                    />
                                                    <p className="text-[10px] text-indigo-600/70 italic">
                                                        Leaving this empty will extract all visible problems on the selected pages.
                                                    </p>
                                                </div>
                                            </div>
                                        )}



                                        <Button
                                            onClick={onAIAnalyze}
                                            disabled={!uploadedFile || isAnalyzing}
                                            className="w-full bg-blue-600 text-white font-medium py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-md transition-all flex items-center justify-center gap-3"
                                        >
                                            {isAnalyzing ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                    <span>AI is analyzing problem...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" /></svg>
                                                    <span>Analyze with AI</span>
                                                </>
                                            )}
                                        </Button>

                                        {isAnalyzing && (
                                            <div className="mt-4 p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex items-start gap-4">
                                                <div className="mt-1">
                                                    <div className="w-5 h-5 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-sm font-semibold text-indigo-900">
                                                        {isBulkMode ? "Bulk Problem Extraction in Progress" : "Problem Extraction in Progress"}
                                                    </p>
                                                    <p className="text-xs text-indigo-700/80 leading-relaxed">
                                                        {isBulkMode
                                                            ? "AI is identifying multiple problems and mapping their solutions from the PDF..."
                                                            : "AI is identifying formulas, converting text to LaTeX, and detecting potential diagrams..."}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Extracted Diagrams Section */}
                                        {extractedDiagrams.length > 0 && (
                                            <div className="p-4 border border-blue-200 rounded-md bg-blue-50">
                                                <h3 className="text-sm font-medium text-gray-800 mb-2">
                                                    Extracted Diagrams/Graphs ({extractedDiagrams.length})
                                                </h3>
                                                <p className="text-xs text-gray-600 mb-3">
                                                    AI detected these diagrams. Click to select one for the problem.
                                                </p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {extractedDiagrams.map((diagramUrl, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative"
                                                        >
                                                            <div
                                                                className={`p-2 border-2 rounded-md cursor-pointer hover:border-blue-400 transition-all ${diagramImageUrl === diagramUrl
                                                                    ? 'border-blue-600 bg-blue-50'
                                                                    : 'border-gray-300 bg-white'
                                                                    }`}
                                                                onClick={() => onSelectExtractedDiagram(diagramUrl)}
                                                            >
                                                                <img
                                                                    src={diagramUrl}
                                                                    alt={`Extracted diagram ${index + 1}`}
                                                                    className="w-full h-auto rounded-sm"
                                                                />
                                                            </div>
                                                            <div className="flex items-center justify-between mt-2">
                                                                {diagramImageUrl === diagramUrl ? (
                                                                    <span className="text-xs text-blue-600 font-medium">✓ Selected</span>
                                                                ) : (
                                                                    <span className="text-xs text-gray-500">Diagram {index + 1}</span>
                                                                )}
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        onRemoveExtractedDiagram(index);
                                                                    }}
                                                                    className="text-xs text-red-600 hover:text-red-800 font-medium"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </TabsContent>

                                    {/* Manual Input Tab */}
                                    <TabsContent value="manual" className="space-y-4 mt-4">
                                        <p className="text-xs text-gray-500">Manually enter problem details using KaTeX/MathJax syntax</p>
                                    </TabsContent>
                                </Tabs>

                                {/* Title */}
                                <div>
                                    <label htmlFor="problemTitle" className="text-sm font-medium text-gray-800">
                                        Problem Title *
                                    </label>
                                    <Input
                                        id="problemTitle"
                                        value={problemTitle}
                                        onChange={(e) => setProblemTitle(e.target.value)}
                                        placeholder="Enter the problem title"
                                        className="mt-1 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Category & Difficulty */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-800">
                                            Category (Hierarchical)
                                        </label>
                                        <div className="space-y-2 mt-1">
                                            <select
                                                value={selectedLevel1}
                                                onChange={(e) => {
                                                    setSelectedLevel1(e.target.value);
                                                    setSelectedLevel2("");
                                                    const l1 = CATEGORIES.level1.find(c => c.id === e.target.value);
                                                    setCategory(l1?.name || "");
                                                }}
                                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                            >
                                                <option value="">Select Level 1</option>
                                                {CATEGORIES.level1.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>

                                            {selectedLevel1 && CATEGORIES.level2[selectedLevel1 as keyof typeof CATEGORIES.level2] && (
                                                <select
                                                    value={selectedLevel2}
                                                    onChange={(e) => {
                                                        setSelectedLevel2(e.target.value);
                                                        const l2Options = CATEGORIES.level2[selectedLevel1 as keyof typeof CATEGORIES.level2];
                                                        const l2 = l2Options?.find((c: any) => c.id === e.target.value);
                                                        const l1 = CATEGORIES.level1.find(c => c.id === selectedLevel1);
                                                        setCategory(l2 ? `${l1?.name} > ${l2.name}` : l1?.name || "");
                                                    }}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                >
                                                    <option value="">Select Level 2 (Optional)</option>
                                                    {CATEGORIES.level2[selectedLevel1 as keyof typeof CATEGORIES.level2]?.map((cat: any) => (
                                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {selectedLevel2 && CATEGORIES.level3[selectedLevel2 as keyof typeof CATEGORIES.level3] && (
                                                <select
                                                    value={category.split(' > ')[2] || ""}
                                                    onChange={(e) => {
                                                        const l3Options = CATEGORIES.level3[selectedLevel2 as keyof typeof CATEGORIES.level3];
                                                        const l3 = l3Options?.find((c: any) => c.name === e.target.value);
                                                        const l2Options = CATEGORIES.level2[selectedLevel1 as keyof typeof CATEGORIES.level2];
                                                        const l2 = l2Options?.find((c: any) => c.id === selectedLevel2);
                                                        const l1 = CATEGORIES.level1.find(c => c.id === selectedLevel1);
                                                        setCategory(l3 ? `${l1?.name} > ${l2?.name} > ${l3.name}` : `${l1?.name} > ${l2?.name}`);
                                                    }}
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
                                                >
                                                    <option value="">Select Level 3 (Optional)</option>
                                                    {CATEGORIES.level3[selectedLevel2 as keyof typeof CATEGORIES.level3]?.map((cat: any) => (
                                                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                                                    ))}
                                                </select>
                                            )}

                                            {category && (
                                                <div className="text-xs text-gray-600 bg-blue-50 p-2 rounded border border-blue-200">
                                                    Selected: <span className="font-medium">{category}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Source & Difficulty */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="relative" ref={dropdownRef}>
                                            <label htmlFor="source" className="text-sm font-medium text-gray-800 flex items-center gap-1.5">
                                                Problem Source
                                            </label>
                                            <div className="relative mt-1">
                                                <Input
                                                    id="source"
                                                    value={inputValue}
                                                    onChange={(e) => {
                                                        setInputValue(e.target.value);
                                                        setSource(e.target.value); // Keep parent in sync
                                                        setIsDropdownOpen(true);
                                                    }}
                                                    onFocus={() => setIsDropdownOpen(true)}
                                                    placeholder="Type to search or add new..."
                                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-8"
                                                />
                                                {inputValue && (
                                                    <button 
                                                        onClick={() => handleSelectSource("")}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Autocomplete Dropdown */}
                                            {isDropdownOpen && (inputValue.trim() || filteredSources.length > 0) && (
                                                <div className="absolute z-50 mt-1 w-full bg-slate-900 text-slate-100 rounded-lg shadow-xl border border-slate-700 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-100">
                                                    {filteredSources.length > 0 && (
                                                        <div className="max-h-48 overflow-y-auto">
                                                            {filteredSources.map((s) => (
                                                                <button
                                                                    key={s}
                                                                    onClick={() => handleSelectSource(s)}
                                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-800 transition-colors text-left group"
                                                                >
                                                                    <span className="flex-1 truncate">{s}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {showCreateNew && (
                                                        <button
                                                            onClick={() => handleSelectSource(inputValue)}
                                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-800 transition-colors text-left border-t border-slate-700/50 group"
                                                        >
                                                            <PlusCircle className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300" />
                                                            <span className="truncate">Add as new source <span className="font-semibold text-emerald-100">"{inputValue}"</span></span>
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label htmlFor="difficulty" className="text-sm font-medium text-gray-800">
                                                Difficulty (1-10)
                                            </label>
                                            <div className="flex items-center gap-2 mt-1">
                                                <Input
                                                    id="difficulty"
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={difficulty}
                                                    onChange={(e) => setDifficulty(parseInt(e.target.value) || 1)}
                                                    className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                                                />
                                                <Button
                                                    onClick={onAIDifficulty}
                                                    variant="outline"
                                                    className="text-xs text-gray-700 border-gray-300 hover:bg-gray-50"
                                                    disabled={isAnalyzing}
                                                >
                                                    AI
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Problem Content */}
                                <div>
                                    <h3 className="text-sm font-medium text-gray-800 mb-1">Preview</h3>
                                    <div className="p-4 border border-gray-200 rounded-md bg-gray-50 min-h-[100px] mb-2">
                                        {diagramImageUrl && (
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-600 mb-2">Diagram:</p>
                                                <img
                                                    src={diagramImageUrl}
                                                    alt="Diagram"
                                                    className="max-w-full h-auto rounded-md"
                                                />
                                            </div>
                                        )}
                                        <MathPreview html={problemContent} />
                                    </div>

                                    <label htmlFor="problemContent" className="text-sm font-medium text-gray-800">
                                        Problem Content (KaTeX/MathJax) *
                                    </label>
                                    <textarea
                                        id="problemContent"
                                        value={problemContent}
                                        onChange={(e) => setProblemContent(e.target.value)}
                                        placeholder="Enter the problem content using KaTeX/MathJax syntax. e.g., \( E = mc^2 \) or \[ \int_0^1 x^2 dx \]"
                                        className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mt-1 text-sm"
                                    />
                                </div>

                                {/* Diagram/Graph Image Upload */}
                                <div>
                                    <label className="text-sm font-medium text-gray-800">
                                        Diagram/Graph Image (Optional)
                                    </label>
                                    {inputMethod === "file" && extractedDiagrams.length > 0 ? (
                                        <div className="mt-1">
                                            {diagramImageUrl ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-green-600">Using AI-extracted diagram</span>
                                                    <Button
                                                        onClick={() => setDiagramImageUrl("")}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs text-gray-700 border-gray-300 hover:bg-gray-50"
                                                    >
                                                        Clear
                                                    </Button>
                                                </div>
                                            ) : (
                                                <p className="text-xs text-gray-500">
                                                    Select a diagram from the extracted diagrams above, or upload manually below
                                                </p>
                                            )}
                                        </div>
                                    ) : null}
                                    <div className="flex items-center gap-2 mt-2">
                                        <Input
                                            type="file"
                                            ref={diagramFileInputRef}
                                            onChange={onDiagramUpload}
                                            accept="image/*"
                                            className="hidden"
                                        />
                                        <Button
                                            onClick={() => diagramFileInputRef.current?.click()}
                                            variant="outline"
                                            className="text-sm text-gray-700 border-gray-300 hover:bg-gray-50"
                                        >
                                            {diagramImageUrl && inputMethod === "file" && extractedDiagrams.length > 0
                                                ? "Upload Different Diagram"
                                                : "Upload Diagram"}
                                        </Button>
                                        {diagramImageUrl && inputMethod !== "file" && (
                                            <span className="text-xs text-green-600">Diagram uploaded</span>
                                        )}
                                    </div>
                                    {inputMethod === "manual" && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Upload separate diagrams or graphs that accompany the problem
                                        </p>
                                    )}
                                </div>

                                {/* Preview removed from here and moved above content */}

                                {/* Solution Section */}
                                <div className="space-y-4 pt-4 border-t">
                                    <div className="flex items-center justify-between">
                                        <label className="text-lg font-semibold text-gray-800">Solutions</label>
                                        <div className="flex gap-2">
                                            <Button
                                                onClick={onAIGenerateSolution}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs text-gray-700 border-gray-300 hover:bg-gray-50"
                                                disabled={isAnalyzing || !problemContent}
                                            >
                                                Generate with AI
                                            </Button>
                                            <Button
                                                onClick={() => setSolutions([...solutions, { id: `manual-${Date.now()}`, title: `Method ${solutions.length + 1}`, content: "" }])}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs text-gray-700 border-gray-300 hover:bg-gray-50"
                                            >
                                                Add Solution
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Solution Image Upload Area */}
                                    <div className="mt-2 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50/50">
                                        <div className="flex items-center justify-between gap-4 mb-4">
                                            <div className="flex-1">
                                                <p className="text-[11px] font-bold text-indigo-600 mb-1 uppercase tracking-wider">Extract Solutions from Images (AI)</p>
                                                <p className="text-xs text-gray-500 mb-3">Upload one or more images (e.g., long solutions, multiple methods).</p>
                                                <div className="flex items-center gap-2">
                                                    <Input
                                                        type="file"
                                                        ref={solutionFileInputRef}
                                                        onChange={onSolutionFileUpload}
                                                        accept="image/*"
                                                        multiple
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        onClick={() => solutionFileInputRef.current?.click()}
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-xs h-8 text-gray-700 bg-white border-gray-300 hover:bg-gray-100"
                                                        disabled={isAnalyzing}
                                                    >
                                                        Choose Solution Image(s)
                                                    </Button>
                                                    {(uploadedSolutionFiles?.length || 0) > 0 ? (
                                                        <span className="text-[10px] text-indigo-600 font-medium">{uploadedSolutionFiles?.length} file(s) selected</span>
                                                    ) : uploadedSolutionFile ? (
                                                        <span className="text-[10px] text-gray-500 truncate max-w-[150px]">{uploadedSolutionFile.name}</span>
                                                    ) : null}
                                                </div>
                                            </div>
                                            <Button
                                                onClick={onAISolutionAnalyze}
                                                disabled={(!uploadedSolutionFile && (!uploadedSolutionFiles || uploadedSolutionFiles.length === 0)) || isAnalyzingSolution}
                                                size="sm"
                                                className="h-10 px-4 bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 disabled:bg-indigo-300 shadow-sm flex items-center gap-2"
                                            >
                                                {isAnalyzingSolution ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                        Extracting...
                                                    </>
                                                ) : "Extract All from Images"}
                                            </Button>
                                        </div>

                                        {isAnalyzingSolution && (
                                            <div className="mt-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg flex items-center gap-3 animate-pulse">
                                                <div className="w-4 h-4 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                                <p className="text-xs font-medium text-indigo-700">AI is identifying and formatting each solution method...</p>
                                            </div>
                                        )}

                                        {/* Image Previews */}
                                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                                            {(uploadedSolutionFilesPreviews || (uploadedSolutionFilePreview ? [uploadedSolutionFilePreview] : [])).map((url, idx) => (
                                                <div key={idx} className="relative flex-shrink-0 h-24 w-32 bg-black/5 rounded-md border border-gray-200 overflow-hidden shadow-sm">
                                                    <img
                                                        src={url}
                                                        alt={`Solution preview ${idx + 1}`}
                                                        className="h-full w-full object-contain"
                                                    />
                                                    <div className="absolute top-1 left-1 bg-black/50 text-white text-[8px] px-1 rounded">#{idx + 1}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Solutions List */}
                                    <div className="space-y-6 mt-4">
                                        {solutions.map((sol, idx) => (
                                            <div key={sol.id || idx} className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm space-y-4 transition-all hover:border-indigo-200">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <Badge className="bg-gray-100 text-gray-600 border-none font-bold">#{idx + 1}</Badge>
                                                        <Input
                                                            value={sol.title}
                                                            onChange={(e) => {
                                                                const newSols = [...solutions];
                                                                newSols[idx].title = e.target.value;
                                                                setSolutions(newSols);
                                                            }}
                                                            className="font-semibold text-sm border-none bg-gray-50 focus:bg-white transition-colors h-8"
                                                            placeholder="Solution Title (e.g., Method 1: Algebraic approach)"
                                                        />
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                                        onClick={() => setSolutions(solutions.filter((_, i) => i !== idx))}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Content (LaTeX/KaTeX)</label>
                                                        <textarea
                                                            value={sol.content}
                                                            onChange={(e) => {
                                                                const newSols = [...solutions];
                                                                newSols[idx].content = e.target.value;
                                                                setSolutions(newSols);
                                                                if (idx === 0) setSolution(e.target.value); // Sync with old state
                                                            }}
                                                            placeholder="Enter solution content here..."
                                                            className="w-full h-48 p-4 text-sm border border-gray-100 rounded-lg bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-300 outline-none transition-all resize-none"
                                                        />
                                                    </div>
                                                    <div className="space-y-2 flex flex-col h-full">
                                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Live Preview</label>
                                                        <div className="flex-1 p-4 border border-gray-50 rounded-lg bg-gray-50/30 overflow-y-auto max-h-48 min-h-[12rem]">
                                                            {sol.content ? (
                                                                <MathPreview html={sol.content} />
                                                            ) : (
                                                                <div className="flex items-center justify-center h-full text-gray-300 italic text-xs">Preview will appear here...</div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        {solutions.length === 0 && (
                                            <div className="text-center py-12 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/20">
                                                <p className="text-gray-400 text-sm">No detailed solutions added yet.</p>
                                                <p className="text-gray-300 text-xs mt-1">Use the buttons above to generate with AI or add manually.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Related Problems Generation */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium text-gray-800">
                                            Related Problems (AI Generated)
                                        </label>
                                        <div className="flex gap-2">
                                            {!showRelatedProblems && relatedProblems.length > 0 && (
                                                <Button
                                                    onClick={() => setShowRelatedProblems(true)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs text-green-600 border-green-300 hover:bg-green-50"
                                                >
                                                    Show Generated ({relatedProblems.length})
                                                </Button>
                                            )}
                                            <Button
                                                onClick={onGenerateRelated}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs text-gray-700 border-gray-300 hover:bg-gray-50 flex items-center gap-2"
                                                disabled={isBulkMode || isGeneratingRelated || !problemContent}
                                            >
                                                {isGeneratingRelated ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
                                                        Generating...
                                                    </>
                                                ) : (
                                                    relatedProblems.length > 0 ? 'Generate More' : 'Generate Related Problems with AI'
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                    {isBulkMode ? (
                                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                                            <p className="text-xs text-amber-700 flex items-center gap-2">
                                                <span>⚠️</span>
                                                Related problem generation is disabled in bulk mode. Save individual problems first.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                                            <p className="text-xs text-indigo-700">
                                                💡 Click "Generate Related Problems with AI" to automatically create foundational problems linked to this one.
                                                {linkedProblems.length > 0 && (
                                                    <span className="font-medium text-indigo-700"> Currently {linkedProblems.length} problem(s) linked.</span>
                                                )}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* AI Generation Progress Indicator */}
                                {isGeneratingRelated && (
                                    <div className="mt-4 p-6 border border-indigo-100 rounded-xl bg-indigo-50/50 animate-in fade-in duration-500">
                                        <div className="flex flex-col items-center text-center">
                                            <div className="mb-4 relative">
                                                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <span className="text-[10px] font-bold text-indigo-600">{Math.floor(progress)}%</span>
                                                </div>
                                            </div>

                                            <h4 className="text-sm font-semibold text-indigo-900 mb-1">
                                                {GENERATION_STEPS[stepIndex]}
                                            </h4>
                                            <p className="text-xs text-indigo-700/70 mb-4 max-w-xs">
                                                AI is carefully analyzing the problem based on the generation guide to create quality learning steps.
                                            </p>

                                            <div className="w-full max-w-md bg-indigo-100 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-indigo-600 h-full transition-all duration-500 ease-out"
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>

                                            <div className="mt-3 flex gap-2">
                                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                                                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* AI-Generated Related Problems */}
                                {showRelatedProblems && relatedProblems.length > 0 && (
                                    <div className="p-4 border border-green-200 rounded-md bg-gradient-to-br from-green-50 to-blue-50">
                                        <div className="flex items-center justify-between mb-3">
                                            <div>
                                                <h3 className="text-base font-semibold text-gray-800">
                                                    AI-Generated Related Problems ({relatedProblems.length})
                                                </h3>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Foundational problems organized by concept
                                                </p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={onGenerateRelated}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs text-blue-600 border-blue-300 hover:bg-blue-50"
                                                    disabled={isAnalyzing}
                                                >
                                                    Generate More
                                                </Button>
                                                <Button
                                                    onClick={() => setShowRelatedProblems(!showRelatedProblems)}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs text-gray-700 border-gray-300 hover:bg-gray-50"
                                                >
                                                    Collapse
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Stages Overview */}
                                        <div className="mb-4 p-3 bg-white border border-blue-200 rounded-md">
                                            <h4 className="text-xs font-medium text-gray-700 mb-2">Problem Solving Stages:</h4>
                                            <div className="flex flex-wrap gap-2">
                                                {concepts.map((stage, idx) => (
                                                    <Badge key={idx} className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                                        {stage}
                                                    </Badge>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Problems Grid - Organized by Stage */}
                                        <div className="space-y-6">
                                            {concepts.map((stage, stageIdx) => {
                                                const stageProblems = relatedProblems.filter(p => p.stage === stage);
                                                if (stageProblems.length === 0) return null;

                                                return (
                                                    <div key={stage} className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                                                        <div className="flex items-center gap-3 mb-4">
                                                            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-semibold text-sm">
                                                                {stageIdx + 1}
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="text-base font-semibold text-gray-800">{stage}</h4>
                                                                <span className="text-xs text-gray-500">
                                                                    {stageProblems.length} problem{stageProblems.length > 1 ? 's' : ''}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            {stageProblems.map((relProb, idx) => (
                                                                <div
                                                                    key={idx}
                                                                    className="p-4 border border-gray-200 rounded-md hover:border-blue-400 transition-all bg-gray-50 hover:shadow-sm"
                                                                >
                                                                    <div className="flex items-start justify-between mb-2">
                                                                        <div className="flex-1">
                                                                            <h5 className="text-sm font-medium text-gray-800 mb-2">
                                                                                {relProb.title}
                                                                            </h5>
                                                                            <div className="flex items-center gap-2">
                                                                                <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                                                                    Difficulty {relProb.difficulty}/10
                                                                                </Badge>
                                                                                <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                                                                                    {relProb.concept}
                                                                                </Badge>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                                        {relProb.explanation}
                                                                    </p>

                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <Dialog>
                                                                            <DialogTrigger asChild>
                                                                                <Button
                                                                                    variant="outline"
                                                                                    size="sm"
                                                                                    className="text-xs flex-1"
                                                                                    onClick={() => setSelectedRelatedProblem(relProb)}
                                                                                >
                                                                                    View Details
                                                                                </Button>
                                                                            </DialogTrigger>
                                                                            <DialogContent className="!max-w-[95vw] max-h-[85vh] overflow-y-auto bg-white">
                                                                                <DialogHeader>
                                                                                    <DialogTitle className="text-lg font-semibold">
                                                                                        {relProb.title}
                                                                                    </DialogTitle>
                                                                                </DialogHeader>
                                                                                <div className="space-y-4">
                                                                                    <div>
                                                                                        <div className="flex items-center gap-2 mb-2">
                                                                                            <Badge className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                                                                                                {relProb.stage}
                                                                                            </Badge>
                                                                                            <Badge className="text-xs bg-purple-100 text-purple-800 border-purple-200">
                                                                                                {relProb.concept}
                                                                                            </Badge>
                                                                                            <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                                                                                Difficulty {relProb.difficulty}/10
                                                                                            </Badge>
                                                                                            <Badge className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                                                                                                {relProb.category}
                                                                                            </Badge>
                                                                                        </div>
                                                                                        <p className="text-sm text-gray-600 italic">{relProb.explanation}</p>
                                                                                    </div>

                                                                                    <div>
                                                                                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Problem</h4>
                                                                                        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                                                                                            <MathPreview html={relProb.content} />
                                                                                        </div>
                                                                                    </div>

                                                                                    <div>
                                                                                        <h4 className="text-sm font-semibold text-gray-800 mb-2">Solution</h4>
                                                                                        <div className="p-4 border border-gray-200 rounded-md bg-blue-50">
                                                                                            <MathPreview html={relProb.solution} />
                                                                                        </div>
                                                                                    </div>

                                                                                    <div className="flex justify-end gap-2 pt-4">
                                                                                        <Button
                                                                                            onClick={() => onAddRelated(relProb)}
                                                                                            className="bg-green-600 text-white font-medium py-2 px-4 rounded-md hover:bg-green-700"
                                                                                        >
                                                                                            Add to Problem List
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>
                                                                            </DialogContent>
                                                                        </Dialog>

                                                                        {addedProblemTitles.has(relProb.title) ? (
                                                                            <Button
                                                                                onClick={() => onRemoveRelated(relProb)}
                                                                                size="sm"
                                                                                variant="outline"
                                                                                className="border-red-300 text-red-600 font-medium text-xs hover:bg-red-50"
                                                                            >
                                                                                ✓ Added - Remove
                                                                            </Button>
                                                                        ) : (
                                                                            <Button
                                                                                onClick={() => onAddRelated(relProb)}
                                                                                size="sm"
                                                                                className="bg-green-600 text-white font-medium text-xs hover:bg-green-700"
                                                                            >
                                                                                Add
                                                                            </Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Bulk Actions */}
                                        <div className="mt-4 p-3 bg-white border border-gray-200 rounded-md">
                                            <p className="text-xs text-gray-600 mb-2">
                                                Bulk Actions: {addedProblemTitles.size} of {relatedProblems.length} problems added
                                            </p>
                                            <div className="flex gap-2">
                                                <Button
                                                    onClick={() => {
                                                        // Only add problems that haven't been added yet
                                                        relatedProblems
                                                            .filter(prob => !addedProblemTitles.has(prob.title))
                                                            .forEach(prob => onAddRelated(prob));
                                                    }}
                                                    size="sm"
                                                    disabled={addedProblemTitles.size === relatedProblems.length}
                                                    className="bg-green-600 text-white font-medium text-xs hover:bg-green-700 disabled:bg-gray-300"
                                                >
                                                    Add All Remaining ({relatedProblems.length - addedProblemTitles.size})
                                                </Button>
                                                <Button
                                                    onClick={onClearRelated}
                                                    variant="outline"
                                                    size="sm"
                                                    className="text-xs text-gray-700 border-gray-300 hover:bg-gray-50"
                                                >
                                                    Deselect All
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex justify-between items-center pt-4">
                                    <div className="text-xs text-gray-500">
                                        {isEditing ? (
                                            <span>✏️ Editing: <strong>{selectedProblem?.title}</strong></span>
                                        ) : (
                                            <span>📝 Creating new problem</span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            onClick={onCancel}
                                            variant="outline"
                                            className="text-gray-700 border-gray-300 hover:bg-gray-50"
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            onClick={onSave}
                                            className="bg-blue-600 text-white font-medium py-2 px-6 rounded-lg hover:bg-blue-700 shadow-md transition-all active:scale-95"
                                        >
                                            {isBulkMode
                                                ? `📝 Save Selected (${selectedProblemIndices.size})`
                                                : isEditing ? "💾 Update Problem" : "💾 Save Problem"
                                            }
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
