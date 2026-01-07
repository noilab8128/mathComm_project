import React, { useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import MathPreview from "@/components/MathPreview";
import { Problem, RelatedProblem } from "../types";
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
    linkedProblems: string[];

    // AI & Upload State
    inputMethod: "manual" | "file";
    setInputMethod: (value: "manual" | "file") => void;
    uploadedFile: File | null;
    uploadedFilePreview: string;
    extractedDiagrams: string[];
    isAnalyzing: boolean;
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
    onAIAnalyze: () => void;
    onAIGenerateSolution: () => void;
    onAIDifficulty: () => void;
    onGenerateRelated: () => void;
    onAddRelated: (problem: RelatedProblem) => void;
    onRemoveRelated: (problem: RelatedProblem) => void;
    onSelectExtractedDiagram: (url: string) => void;
    onRemoveExtractedDiagram: (index: number) => void;
    onClearRelated: () => void;
}

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
    linkedProblems,
    inputMethod,
    setInputMethod,
    uploadedFile,
    uploadedFilePreview,
    extractedDiagrams,
    isAnalyzing,
    relatedProblems,
    showRelatedProblems,
    setShowRelatedProblems,
    concepts,
    addedProblemTitles,
    onSave,
    onCancel,
    onFileUpload,
    onDiagramUpload,
    onAIAnalyze,
    onAIGenerateSolution,
    onAIDifficulty,
    onGenerateRelated,
    onAddRelated,
    onRemoveRelated,
    onSelectExtractedDiagram,
    onRemoveExtractedDiagram,
    onClearRelated
}: ProblemEditorProps) {
    const problemFileInputRef = useRef<HTMLInputElement>(null);
    const diagramFileInputRef = useRef<HTMLInputElement>(null);
    const [selectedRelatedProblem, setSelectedRelatedProblem] = React.useState<RelatedProblem | null>(null);

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="!max-w-[98vw] !max-h-[98vh] w-full h-full p-0 overflow-hidden bg-white shadow-2xl">
                <div className="flex flex-col h-full max-h-[98vh]">
                    <DialogHeader className="p-6 border-b flex-shrink-0">
                        <DialogTitle className="text-2xl font-semibold text-gray-800">
                            {isEditing ? "Edit Problem" : "New Problem"}
                        </DialogTitle>
                    </DialogHeader>

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
                                        <div className="p-4 border border-gray-200 rounded-md bg-gray-50">
                                            <h3 className="text-sm font-medium text-gray-800 mb-2">Uploaded File Preview</h3>
                                            <img
                                                src={uploadedFilePreview}
                                                alt="Uploaded file"
                                                className="max-w-full h-auto rounded-md"
                                            />
                                        </div>
                                    )}

                                    <Button
                                        onClick={onAIAnalyze}
                                        disabled={!uploadedFile || isAnalyzing}
                                        className="w-full bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                    >
                                        {isAnalyzing ? "Analyzing..." : "Analyze with AI"}
                                    </Button>

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

                            {/* Problem Content */}
                            <div>
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

                            {/* Preview */}
                            <div>
                                <h3 className="text-sm font-medium text-gray-800">Preview</h3>
                                <div className="p-4 border border-gray-200 rounded-md mt-1 bg-gray-50 min-h-[120px]">
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
                            </div>

                            {/* Solution */}
                            <div>
                                <div className="flex items-center justify-between">
                                    <label htmlFor="solution" className="text-sm font-medium text-gray-800">
                                        Solution
                                    </label>
                                    <Button
                                        onClick={onAIGenerateSolution}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs text-gray-700 border-gray-300 hover:bg-gray-50"
                                        disabled={isAnalyzing || !problemContent}
                                    >
                                        Generate with AI
                                    </Button>
                                </div>
                                <textarea
                                    id="solution"
                                    value={solution}
                                    onChange={(e) => setSolution(e.target.value)}
                                    placeholder="Enter the solution (supports KaTeX/MathJax) or generate with AI"
                                    className="w-full h-32 p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 mt-1 text-sm"
                                />

                                {/* Solution Preview */}
                                {solution && (
                                    <div className="mt-2">
                                        <h4 className="text-xs font-medium text-gray-700 mb-1">Solution Preview</h4>
                                        <div className="p-3 border border-gray-200 rounded-md bg-gray-50 min-h-[80px] max-h-[200px] overflow-y-auto">
                                            <MathPreview html={solution} />
                                        </div>
                                    </div>
                                )}
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
                                            className="text-xs text-gray-700 border-gray-300 hover:bg-gray-50"
                                            disabled={isAnalyzing || !problemContent}
                                        >
                                            {relatedProblems.length > 0 ? 'Generate More' : 'Generate Related Problems with AI'}
                                        </Button>
                                    </div>
                                </div>
                                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                                    <p className="text-xs text-gray-700">
                                        💡 Click "Generate Related Problems with AI" to automatically create foundational problems linked to this one.
                                        {linkedProblems.length > 0 && (
                                            <span className="font-medium text-blue-700"> Currently {linkedProblems.length} problem(s) linked.</span>
                                        )}
                                    </p>
                                </div>
                            </div>

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
                                                                        <DialogContent className="max-w-7xl max-h-[85vh] overflow-y-auto bg-white">
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
                                        className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700"
                                    >
                                        {isEditing ? "💾 Update Problem" : "💾 Save Problem"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
