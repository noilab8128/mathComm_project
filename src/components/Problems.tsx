// Problems Component - Browse and solve mathematical problems
// Features problem filtering, detailed problem view, and solution submission

"use client"
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Heart, Search } from "lucide-react";
import { useLikes } from "@/hooks/useUserInteractions";
import { problemsAPI } from "@/lib/supabase";
import { DifficultyBadge } from "@/components/DifficultyRating";
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
  const { likedIds, toggleLike } = useLikes();

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

  // Filters and sorting (client-side; the full list is already loaded)
  const [query, setQuery] = useState("");
  const [topic, setTopic] = useState("All");
  const [sort, setSort] = useState<"newest" | "easiest" | "hardest" | "popular">("newest");
  const topicOf = (p: ProblemDisplay) => p.category_path?.split(" > ")[0] || "Other";

  const filteredProblems = problems
    .filter(problem => {
      const levelMatch = selectedLevel === "All" || problem.level === selectedLevel;
      const ageMatch = selectedAge === "All" || problem.age === selectedAge;
      const topicMatch = topic === "All" || topicOf(problem) === topic;
      const q = query.trim().toLowerCase();
      const queryMatch = !q || problem.title.toLowerCase().includes(q) || (problem.category_path ?? "").toLowerCase().includes(q);
      return levelMatch && ageMatch && topicMatch && queryMatch;
    })
    .sort((a, b) => {
      if (sort === "easiest") return a.difficulty_score - b.difficulty_score;
      if (sort === "hardest") return b.difficulty_score - a.difficulty_score;
      if (sort === "popular") return (b.likes_count ?? 0) - (a.likes_count ?? 0);
      return 0; // newest: API order
    });

  // Filter options
  const LEVEL_ORDER = ["Easy", "Medium", "Hard", "Olympiad"];
  const levels = ["All", ...LEVEL_ORDER.filter(l => problems.some(p => p.level === l)), ...[...new Set(problems.map(p => p.level).filter(Boolean))].filter(l => !LEVEL_ORDER.includes(l))];
  const ages = ["All", ...new Set(problems.map(p => p.age).filter(Boolean))];
  const topics = ["All", ...[...new Set(problems.map(topicOf))].sort()];
  const selectClass = "h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-700 focus:border-slate-500 focus:outline-none";

  return (
    <div className="mx-auto w-full max-w-7xl p-4 sm:p-6">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Problems</h1>
          <p className="tnum mt-1 text-sm text-slate-500">
            {isLoading ? "Loading…" : `${filteredProblems.length} of ${problems.length} problems`}
          </p>
        </div>
      </header>

      {/* Toolbar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search by title or topic"
            className="h-9 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none"
          />
        </div>
        <div className="flex overflow-hidden rounded-md border border-slate-300" role="group" aria-label="Level">
          {levels.map(level => (
            <button
              key={level}
              onClick={() => setSelectedLevel(level)}
              aria-pressed={selectedLevel === level}
              className={`border-l border-slate-300 px-3 py-1.5 text-sm first:border-l-0 ${selectedLevel === level ? "bg-slate-900 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
            >
              {level}
            </button>
          ))}
        </div>
        <select value={topic} onChange={e => setTopic(e.target.value)} className={selectClass} aria-label="Topic">
          {topics.map(t => <option key={t} value={t}>{t === "All" ? "All topics" : t}</option>)}
        </select>
        {ages.length > 2 && (
          <select value={selectedAge} onChange={e => setSelectedAge(e.target.value)} className={selectClass} aria-label="Age">
            {ages.map(a => <option key={a} value={a}>{a === "All" ? "All ages" : a}</option>)}
          </select>
        )}
        <select value={sort} onChange={e => setSort(e.target.value as typeof sort)} className={`${selectClass} sm:ml-auto`} aria-label="Sort">
          <option value="newest">Newest</option>
          <option value="easiest">Easiest first</option>
          <option value="hardest">Hardest first</option>
          <option value="popular">Most liked</option>
        </select>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-[360px] items-center justify-center rounded-md border border-slate-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-5">
          <div className="text-sm font-medium text-red-800">Could not load problems</div>
          <div className="mt-1 text-xs text-red-700">{error}</div>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm" className="mt-3">
            Retry
          </Button>
        </div>
      )}

      {/* Problem table */}
      {!isLoading && !error && (
        <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
          <div className="hidden grid-cols-[48px_1fr_140px_64px_96px] items-center gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500 md:grid">
            <span>#</span>
            <span>Problem</span>
            <span>Difficulty</span>
            <span className="text-right">Likes</span>
            <span />
          </div>
          <ul className="divide-y divide-slate-100">
            {filteredProblems.map((problem, index) => (
              <li key={problem.id} data-problem-id={problem.id}>
                <Dialog>
                  <div className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-3 transition-colors hover:bg-slate-50 md:grid-cols-[48px_1fr_140px_64px_96px]">
                    <span className="tnum hidden font-mono text-xs text-slate-400 md:block">{index + 1}</span>
                    <DialogTrigger asChild>
                      <button className="min-w-0 text-left">
                        <span className="block truncate font-medium text-slate-900 hover:text-blue-800">{problem.title}</span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500">
                          {problem.category_path ? problem.category_path.split(" > ").join(" › ") : "Uncategorized"}
                        </span>
                      </button>
                    </DialogTrigger>
                    <span className="col-start-1 md:col-start-auto">
                      <DifficultyBadge difficulty={problem.difficulty_score} />
                    </span>
                    <button
                      onClick={() => toggleLike(problem.id, (liked) => {
                        setProblems(prev => prev.map(p =>
                          p.id === problem.id ? { ...p, likes_count: (p.likes_count ?? 0) + (liked ? 1 : -1) } : p
                        ));
                      })}
                      className="tnum hidden items-center justify-end gap-1 text-xs text-slate-500 hover:text-slate-900 md:flex"
                      title={likedIds.has(problem.id) ? "Unlike" : "Like"}
                      aria-pressed={likedIds.has(problem.id)}
                    >
                      <Heart className={`h-3.5 w-3.5 ${likedIds.has(problem.id) ? "fill-slate-700 text-slate-700" : ""}`} />
                      {problem.likes_count ?? 0}
                    </button>
                    <div className="row-span-2 row-start-1 flex justify-end md:row-span-1 md:row-start-auto">
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="h-8 min-w-[72px]">Solve</Button>
                      </DialogTrigger>
                    </div>
                  </div>
                  <ProblemDialog problem={problem} />
                </Dialog>
              </li>
            ))}
          </ul>

          {filteredProblems.length === 0 && problems.length > 0 && (
            <div className="py-12 text-center text-sm text-slate-500">No problems match these filters.</div>
          )}
          {problems.length === 0 && (
            <div className="py-12 text-center text-sm text-slate-500">No problems yet.</div>
          )}
        </div>
      )}
    </div>
  );
}
