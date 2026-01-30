// Main Page Component - Displays olympiad problems with their problem trees
// Shows a beautiful main page featuring olympiad-level problems and their hierarchical relationships

"use client"
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Trophy, ChevronRight, BookOpen, Star, Loader2, Sparkles, TrendingUp } from "lucide-react";
import MathPreview from "@/components/MathPreview";
import { problemsAPI, getDifficultyLabel, type Problem as SupabaseProblem } from "@/lib/supabase";

// Convert Supabase Problem to display format
interface ProblemDisplay {
  id: string;
  title: string;
  level: string;
  age: string;
  xp: number;
  difficulty: string;
  tags: string[];
  unlocked: boolean;
  content: string;
  hint?: string;
  solution?: string;
  category_path?: string;
}

function convertSupabaseProblem(sp: SupabaseProblem): ProblemDisplay {
  return {
    id: sp.id,
    title: sp.title,
    level: sp.level || getDifficultyLabel(sp.difficulty),
    age: sp.age_range || "All Ages",
    xp: sp.xp || sp.difficulty * 50,
    difficulty: getDifficultyLabel(sp.difficulty),
    tags: sp.tags || (sp.category_path ? sp.category_path.split(' > ') : []),
    unlocked: true,
    content: sp.content,
    hint: undefined,
    solution: sp.solution,
    category_path: sp.category_path,
  };
}

// Problem Tree Node Component - Recursive component to display problem hierarchy
function ProblemTreeNode({
  problem,
  allProblems,
  depth = 0,
  onProblemClick
}: {
  problem: ProblemDisplay;
  allProblems: ProblemDisplay[];
  depth?: number;
  onProblemClick: (problem: ProblemDisplay) => void;
}) {
  // Find children (problems that have this problem as parent)
  const children = allProblems.filter(p => {
    // We need to check parent_problem_id from the original Supabase data
    // For now, we'll use linked_problem_ids as a fallback
    return false; // Will be populated from parent component
  });

  const maxDepth = 3;
  const indent = depth * 24;

  return (
    <div className="relative">
      {/* Tree connector line */}
      {depth > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-blue-200"
          style={{ left: `${(depth - 1) * 24 + 8}px` }}
        />
      )}

      {/* Problem card */}
      <div
        className={`relative ml-${indent} mb-3 rounded-lg border-2 transition-all hover:shadow-lg ${depth === 0
          ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-md'
          : depth === 1
            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
            : 'bg-white border-gray-200'
          }`}
        style={{ marginLeft: `${indent}px` }}
      >
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                {depth === 0 && (
                  <Trophy className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                )}
                <h3 className={`font-bold text-gray-900 ${depth === 0 ? 'text-lg' : 'text-base'}`}>
                  {problem.title}
                </h3>
              </div>

              {problem.category_path && (
                <p className="text-xs text-gray-600 mb-2">{problem.category_path}</p>
              )}

              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge className="bg-yellow-600 text-white">XP {problem.xp}</Badge>
                <Badge variant="outline" className="border-gray-300 text-gray-700">
                  {problem.difficulty}
                </Badge>
                {problem.tags && problem.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Button
              size="sm"
              onClick={() => onProblemClick(problem)}
              className="flex-shrink-0 bg-blue-600 text-white hover:bg-blue-700"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Solve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Problem Dialog Component
function ProblemDialog({ problem }: { problem: ProblemDisplay }) {
  const [problemHtml, setProblemHtml] = useState<string>("");
  const [problemContentLoading, setProblemContentLoading] = useState(true);

  useEffect(() => {
    const loadProblemContent = async () => {
      if (!problem?.content) {
        setProblemHtml("");
        setProblemContentLoading(false);
        return;
      }

      try {
        setProblemContentLoading(true);
        const response = await fetch("/api/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: problem.content }),
        });

        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error((payload as { error?: string }).error || "Failed to render problem content.");
        }

        const html = typeof (payload as { html?: unknown }).html === "string" ? (payload as { html: string }).html : "";
        setProblemHtml(html || problem.content);
      } catch (error) {
        console.error("Failed to render problem content:", error);
        setProblemHtml(problem.content);
      } finally {
        setProblemContentLoading(false);
      }
    };

    loadProblemContent();
  }, [problem?.content]);

  return (
    <DialogContent className="flex w-[95vw] max-w-7xl max-h-[90vh] flex-col overflow-y-auto p-6 bg-white">
      <DialogHeader className="space-y-2">
        <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
          <Trophy className="h-5 w-5 text-yellow-600" />
          {problem.title}
        </DialogTitle>
      </DialogHeader>

      {problem.category_path && (
        <div className="text-sm text-gray-500">Topic: {problem.category_path}</div>
      )}

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge className="bg-yellow-600 text-white">XP {problem.xp}</Badge>
        <Badge variant="outline" className="border-gray-300 text-gray-700">
          {problem.difficulty}
        </Badge>
        {problem.tags && problem.tags.map((tag, idx) => (
          <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700">
            {tag}
          </Badge>
        ))}
      </div>

      <Separator className="my-4" />

      <div className="space-y-4">
        <div className="space-y-3">
          <div className="text-gray-800 leading-relaxed">
            <strong className="text-gray-800">Problem:</strong>{" "}
            {problemContentLoading ? (
              <div className="mt-2 text-sm text-gray-500">Loading problem content...</div>
            ) : problemHtml ? (
              <div className="mt-2">
                <MathPreview html={problemHtml} className="text-gray-800" />
              </div>
            ) : (
              <div className="mt-2 text-gray-600">No problem content available.</div>
            )}
          </div>
        </div>
      </div>
    </DialogContent>
  );
}

// Build problem tree for a given olympiad problem
function buildProblemTree(rootProblem: ProblemDisplay, allProblems: ProblemDisplay[]): ProblemDisplay[] {
  const tree: ProblemDisplay[] = [rootProblem];

  // Find direct children (problems with this as parent_problem_id)
  // Since we're working with ProblemDisplay, we need to check the original Supabase data
  // For now, we'll return just the root problem
  // The actual tree building will be done in the parent component with full Supabase data

  return tree;
}

/**
 * Main Page Component
 * Displays olympiad problems with their problem trees
 */
export default function MainPage() {
  const [officialProblems, setOfficialProblems] = useState<ProblemDisplay[]>([]);
  const [allProblems, setAllProblems] = useState<SupabaseProblem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<ProblemDisplay | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [problemTrees, setProblemTrees] = useState<Map<string, ProblemDisplay[]>>(new Map());

  // Fetch official problems (is_generated = false)
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch official problems (non-generated)
        const official = await problemsAPI.filter({ isGenerated: false });
        // Also fetch all problems to build the full tree if needed (dependencies might be generated?)
        // For now, let's assume we want to show the tree structure relative to these official problems.
        // If we need the *entire* database to find children, we might need a separate call or strategy.
        // But for the tree view, we usually want related problems. 
        // Let's grab all problems for now to be safe for children lookup, 
        // OR better, just use the official ones as roots.

        // Actually, the previous logic fetched ALL problems and filtered in JS. 
        // To support children that might be generated (e.g. AI simplified versions), we should probably fetch all.
        // BUT the user asked for "show problems where is_generated is False". 
        // If we strictly follow that for *display*, we act on `official` list.

        // Optimization: Let's fetch all for the tree construction if the dataset isn't huge.
        const supabaseProblems = await problemsAPI.getAll();
        setAllProblems(supabaseProblems);

        const officialFromAll = supabaseProblems.filter(p => p.is_generated === false);
        console.log(`Found ${officialFromAll.length} official problems`);

        // Convert to display format
        const convertedOfficial = officialFromAll.map(convertSupabaseProblem);
        setOfficialProblems(convertedOfficial);

        // Build trees for each official problem
        const trees = new Map<string, ProblemDisplay[]>();

        convertedOfficial.forEach(rootProblem => {
          // Find all problems in this tree (root + children recursively)
          const treeProblems: ProblemDisplay[] = [rootProblem];

          // Find direct children
          const findChildren = (parentId: string, depth: number = 0): void => {
            if (depth > 3) return; // Limit depth

            const children = supabaseProblems
              .filter(p => p.parent_problem_id === parentId)
              .map(convertSupabaseProblem);

            children.forEach(child => {
              if (!treeProblems.find(p => p.id === child.id)) {
                treeProblems.push(child);
                findChildren(child.id, depth + 1);
              }
            });
          };

          findChildren(rootProblem.id);
          trees.set(rootProblem.id, treeProblems);
        });

        setProblemTrees(trees);
      } catch (err: any) {
        console.error('Failed to fetch problems:', err);
        setError(err.message || 'Failed to load problems. Please check your connection.');
        setOfficialProblems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const handleProblemClick = (problem: ProblemDisplay) => {
    setSelectedProblem(problem);
    setIsDialogOpen(true);
  };

  // Render problem tree recursively
  const renderProblemTree = (rootProblem: ProblemDisplay, allProblemsData: SupabaseProblem[], depth: number = 0): React.ReactNode => {
    const children = allProblemsData
      .filter(p => p.parent_problem_id === rootProblem.id)
      .map(convertSupabaseProblem)
      .sort((a, b) => a.xp - b.xp);

    const maxDepth = 3;
    if (depth > maxDepth) return null;

    const indent = depth * 24;

    return (
      <div key={rootProblem.id} className="relative">
        {/* Tree connector line */}
        {depth > 0 && (
          <div
            className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-300 to-blue-200"
            style={{ left: `${(depth - 1) * 24 + 8}px` }}
          />
        )}

        {/* Problem card */}
        <div
          className={`relative mb-3 rounded-lg border-2 transition-all hover:shadow-lg ${depth === 0
            ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-300 shadow-md'
            : depth === 1
              ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300'
              : 'bg-white border-gray-200'
            }`}
          style={{ marginLeft: `${indent}px` }}
        >
          <div className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {depth === 0 && (
                    <Trophy className="h-5 w-5 text-yellow-600 flex-shrink-0" />
                  )}
                  <h3 className={`font-bold text-gray-900 ${depth === 0 ? 'text-lg' : 'text-base'}`}>
                    {rootProblem.title}
                  </h3>
                </div>

                {rootProblem.category_path && (
                  <p className="text-xs text-gray-600 mb-2">{rootProblem.category_path}</p>
                )}

                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge className={depth === 0 ? "bg-yellow-600 text-white" : "bg-blue-600 text-white"}>
                    XP {rootProblem.xp}
                  </Badge>
                  <Badge variant="outline" className="border-gray-300 text-gray-700">
                    {rootProblem.difficulty}
                  </Badge>
                  {rootProblem.tags && rootProblem.tags.slice(0, 3).map((tag, idx) => (
                    <Badge key={idx} variant="secondary" className="bg-gray-100 text-gray-700 text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => handleProblemClick(rootProblem)}
                className="flex-shrink-0 bg-blue-600 text-white hover:bg-blue-700"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                Solve
              </Button>
            </div>
          </div>
        </div>

        {/* Render children */}
        {children.length > 0 && (
          <div className="ml-6">
            {children.map(child => {
              const childSupabase = allProblemsData.find(p => p.id === child.id);
              if (!childSupabase) return null;
              return renderProblemTree(child, allProblemsData, depth + 1);
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Trophy className="h-10 w-10" />
            <h1 className="text-3xl font-bold">Official Problems</h1>
          </div>
          <p className="text-lg text-blue-100 max-w-2xl mb-2">
            Explore our curated collection of official mathematics problems.
          </p>
          {!isLoading && !error && (
            <p className="text-sm text-blue-200">
              {officialProblems.length === 0
                ? "No official problems available yet."
                : `Showing ${officialProblems.length} official ${officialProblems.length === 1 ? 'problem' : 'problems'}`}
            </p>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center h-96 rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="flex flex-col items-center gap-3 text-gray-500">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
              <div className="text-lg font-medium">Loading problems...</div>
            </div>
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-lg">
            <div className="text-lg font-semibold text-red-800 mb-2">Error Loading Problems</div>
            <div className="text-sm text-red-600">{error}</div>
            <Button
              onClick={() => window.location.reload()}
              className="mt-4 bg-red-600 text-white hover:bg-red-700"
            >
              Retry
            </Button>
          </div>
        )}

        {/* Official Problems Grid */}
        {!isLoading && !error && (
          <div className="space-y-8">
            {officialProblems.length === 0 ? (
              <Card className="p-8 text-center">
                <Trophy className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No Official Problems Yet</h3>
                <p className="text-gray-600">Check back later for challenging official problems!</p>
              </Card>
            ) : (
              officialProblems.map((rootProblem) => {
                const treeProblems = problemTrees.get(rootProblem.id) || [rootProblem];
                // Check if this problem has children in the full dataset
                const hasChildren = allProblems.some(p => p.parent_problem_id === rootProblem.id);

                return (
                  <Card key={rootProblem.id} className="overflow-hidden shadow-lg border-2 border-yellow-200">
                    <CardHeader className="bg-gradient-to-r from-yellow-50 to-amber-50 border-b border-yellow-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Trophy className="h-6 w-6 text-yellow-600" />
                          <CardTitle className="text-2xl text-gray-900">{rootProblem.title}</CardTitle>
                        </div>
                        <Badge className="bg-yellow-600 text-white text-sm px-3 py-1">
                          {treeProblems.length} {treeProblems.length === 1 ? 'Problem' : 'Problems'} in Tree
                        </Badge>
                      </div>
                      {rootProblem.category_path && (
                        <p className="text-sm text-gray-600 mt-2">{rootProblem.category_path}</p>
                      )}
                    </CardHeader>
                    <CardContent className="p-6">
                      <ScrollArea className="h-auto max-h-[600px] pr-4">
                        <div className="space-y-4">
                          {renderProblemTree(rootProblem, allProblems, 0)}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Problem Dialog */}
      {selectedProblem && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <ProblemDialog problem={selectedProblem} />
        </Dialog>
      )}
    </div>
  );
}

