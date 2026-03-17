// Problems Component - Browse and solve mathematical problems
// Features problem filtering, detailed problem view, and solution submission

"use client"
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Send, Lock, Unlock, Star, Filter, Loader2 } from "lucide-react";
import MathPreview from "@/components/MathPreview";
import { problemsAPI, getDifficultyLabel, type Problem as SupabaseProblem } from "@/lib/supabase";
import { StepsButton } from "@/components/ProblemHierarchyModal";
import { ProblemDialog, convertSupabaseProblem, type ProblemDisplay } from "@/components/ProblemDialog";



/**
 * Main Problems Component
 * Displays a scrollable list of problems with filtering options
 * Each problem can be opened in a detailed dialog for solving
 * Fetches problems from Supabase database
 */
export default function Problems() {
  // State for problems and loading
  const [problems, setProblems] = useState<ProblemDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for filtering
  const [selectedLevel, setSelectedLevel] = useState("All");
  const [selectedAge, setSelectedAge] = useState("All");

  // Fetch problems from Supabase on mount
  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const supabaseProblems = await problemsAPI.getAll();
        // Convert all problems and ensure all are unlocked regardless of hierarchy
        const convertedProblems = supabaseProblems.map((sp) => {
          const converted = convertSupabaseProblem(sp);
          // Force unlock status to true for all problems (no hierarchy restrictions)
          converted.unlocked = true;
          return converted;
        });
        setProblems(convertedProblems);
      } catch (err: unknown) {
        console.error('Failed to fetch problems from Supabase:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage || 'Failed to load problems. Please check your connection.');
        // Fallback to empty array on error
        setProblems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []);

  // Check for selectedProblemId in sessionStorage when component mounts or problems are loaded
  // and auto-open the dialog for that problem
  useEffect(() => {
    if (!isLoading && problems.length > 0 && typeof window !== 'undefined') {
      const selectedProblemId = sessionStorage.getItem('selectedProblemId');
      if (selectedProblemId) {
        // Check if the problem exists in the loaded problems
        const problemExists = problems.some(p => p.id === selectedProblemId);
        if (problemExists) {
          // Scroll to the problem element after a short delay to ensure it's rendered
          setTimeout(() => {
            const problemElement = document.querySelector(`[data-problem-id="${selectedProblemId}"]`);
            if (problemElement) {
              problemElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Find the Open button for this problem and click it to open the dialog
              const openButton = problemElement.querySelector('button');
              if (openButton) {
                setTimeout(() => {
                  openButton.click();
                }, 200);
              }
            }
          }, 100);
          // Clear the sessionStorage after using it
          sessionStorage.removeItem('selectedProblemId');
        } else {
          // Problem not found, clear it anyway
          sessionStorage.removeItem('selectedProblemId');
        }
      }
    }
  }, [isLoading, problems]);

  // Filter problems based on selected criteria
  const filteredProblems = problems.filter(problem => {
    const levelMatch = selectedLevel === "All" || problem.level === selectedLevel;
    const ageMatch = selectedAge === "All" || problem.age === selectedAge;
    return levelMatch && ageMatch;
  });

  // Get unique levels and ages for filter options
  const levels = ["All", ...new Set(problems.map(p => p.level).filter(Boolean))];
  const ages = ["All", ...new Set(problems.map(p => p.age).filter(Boolean))];

  return (
    <div className="p-4 space-y-4 bg-white text-gray-800">
      {/* Header with filtering options */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-semibold text-gray-800">Math Problems</div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">Filter by:</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-4">
          {/* Level Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">Level:</span>
            <div className="flex gap-1">
              {levels.map(level => (
                <Button
                  key={level}
                  size="sm"
                  variant={selectedLevel === level ? "default" : "outline"}
                  onClick={() => setSelectedLevel(level)}
                  className={`text-xs ${selectedLevel === level
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {level}
                </Button>
              ))}
            </div>
          </div>

          {/* Age Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-800">Age:</span>
            <div className="flex gap-1">
              {ages.map(age => (
                <Button
                  key={age}
                  size="sm"
                  variant={selectedAge === age ? "default" : "outline"}
                  onClick={() => setSelectedAge(age)}
                  className={`text-xs ${selectedAge === age
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                    }`}
                >
                  {age}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-[560px] rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col items-center gap-3 text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <div className="text-sm font-medium">Loading problems...</div>
          </div>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6">
          <div className="text-sm font-semibold text-red-800 mb-2">Error Loading Problems</div>
          <div className="text-xs text-red-600">{error}</div>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4 bg-red-600 text-white hover:bg-red-700"
            size="sm"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Scrollable problem list */}
      {!isLoading && !error && (
        <ScrollArea className="h-[560px] rounded-xl border border-gray-200 p-4 bg-white">
          <div className="grid gap-3">
            {filteredProblems.map((problem) => {
              const isOlympiad = problem.level === "Olympiad";
              const isBeginner = problem.level === "Beginner";

              return (
                <div
                  key={problem.id}
                  data-problem-id={problem.id}
                  className={`rounded-lg border p-3 flex items-center justify-between bg-white border-gray-200 shadow-sm ${isOlympiad ? 'border-yellow-300 bg-yellow-50' :
                    isBeginner ? 'border-green-300 bg-green-50' :
                      ''
                    }`}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-gray-800">{problem.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Level: {problem.level} • Age: {problem.age} • XP: {problem.xp} • Difficulty: {problem.difficulty}
                    </div>
                    {problem.category_path && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        Category: {problem.category_path}
                      </div>
                    )}
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {problem.tags.map((tag, idx) => (
                          <Badge key={`${problem.id}-${tag}-${idx}`} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StepsButton problemId={problem.id} problemTitle={problem.title} />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-300 text-gray-700 hover:bg-gray-100"
                        >
                          Open
                        </Button>
                      </DialogTrigger>
                      <ProblemDialog problem={problem} />
                    </Dialog>
                  </div>
                </div>
              );
            })}

            {/* Show message if no problems match filter */}
            {filteredProblems.length === 0 && !isLoading && (
              <div className="text-center py-8 text-gray-500">
                No problems match the selected filters. Try adjusting your selection.
              </div>
            )}

            {/* Show message if no problems at all */}
            {problems.length === 0 && !isLoading && !error && (
              <div className="text-center py-8 text-gray-500">
                No problems available. Check back later or contact support.
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
