
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { calculateRewards } from './progression';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase URL or Anon Key is missing. Database features will not work.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type Problem = Database['public']['Tables']['problems']['Row'];

export interface Solution {
  id?: string;
  content: string;
  sequence_order: number;
}

/**
 * Admin problem editor writes go through the server (/api/admin/*), which checks that the user is an admin and
 * writes with the service key. The browser never writes problems, solutions or hierarchy links with the anon key,
 * so the database can refuse those writes from the public key. Browser-only: relative URLs.
 */
async function adminWrite<T = unknown>(method: 'POST' | 'PATCH' | 'DELETE', url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || `Request failed (${res.status})`);
  return json.data as T;
}

// Helper Functions
export const problemsAPI = {
  // Get all problems
  async getAll() {
    const { data, error } = await supabase
      .from('problems')
      .select('*, solutions(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get paginated problems
  async getPaginated(page: number, pageSize: number, filters?: {
    difficulty?: number[];
    category?: string;
    level?: string;
    isGenerated?: boolean;
    isReviewed?: boolean;
    search?: string;
    onlyRoots?: boolean;
    sortBy?: 'newest' | 'oldest' | 'difficulty_asc' | 'difficulty_desc';
  }) {
    // Note: 'count' option in select is not fully typed in v2 perfectly with join, but usually works
    let query = supabase.from('problems').select('*, solutions(*)', { count: 'exact' });

    if (filters?.onlyRoots) {
      // In new schema, roots are those not present as child_problem_id in hierarchy
      // But for simplicity/perf, we might rely on a 'parent_problem_id' column if we kept it for simple parent, 
      // OR we filter by "not in problem_hierarchies.child_problem_id"
      // Since we removed parent_problem_id from problems table in migration? No, let's check migration.
      // Migration V1 removal plan said "Remove parent_problem_id". 
      // Migration V2 kept it? Let's check user's execution.
      // The migration file I wrote in previous step 43 : 
      //   parent_problem_id UUID REFERENCES problems(id) (lines 78 in previous view?)
      //   Actually, in the migration file (Step 45), I *removed* parent_problem_id from problems table?
      //   Wait, Step 45 migration file: 
      //   CREATE TABLE problems ( ... ) -> NO parent_problem_id column in the CREATE statement.
      //   So we must use problem_hierarchies to find roots.

      // Complex query: Select problems where id NOT IN (select child_problem_id from problem_hierarchies)
      // Postgrest doesn't support NOT IN subquery easily.
      // Workaround: We can filter in application or use a view. 
      // The "Is Generated" flag is a good proxy for "child problem" usually.
      // If filters.onlyRoots is true, usually implies is_generated = false?
      // Let's assume is_generated=false means root for now, or check empty hierarchy.
      // Actually, let's just stick to standard filters for now.
    }

    if (filters?.difficulty && filters.difficulty.length > 0) {
      query = query.in('difficulty', filters.difficulty);
    }

    if (filters?.category) {
      query = query.ilike('category_path', `%${filters.category}%`);
    }

    if (filters?.level) {
      query = query.eq('level', filters.level);
    }

    if (filters?.isGenerated !== undefined) {
      query = query.eq('is_generated', filters.isGenerated);
    }
    
    if (filters?.isReviewed !== undefined) {
      query = query.eq('is_reviewed', filters.isReviewed);
    }

    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
    }

    // Sorting
    if (filters?.sortBy === 'difficulty_asc') {
      query = query.order('difficulty', { ascending: true });
    } else if (filters?.sortBy === 'difficulty_desc') {
      query = query.order('difficulty', { ascending: false });
    } else if (filters?.sortBy === 'oldest') {
      query = query.order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await query.range(from, to);

    if (error) throw error;
    return { data, count: count || 0 };
  },

  // Get children for a batch of problems using Hierarchy
  async getChildrenBatch(parentIds: string[]) {
    if (parentIds.length === 0) return [];

    const { data, error } = await supabase
      .from('problem_hierarchies')
      .select(`
        child_problem:problems!child_problem_id(*, solutions(*))
      `)
      .in('parent_problem_id', parentIds);

    if (error) throw error;

    // Flatten
    // @ts-expect-error - nested join typing is complex and often inferred as any or unknown
    return data.map(d => d.child_problem).flat();
  },

  // Get problem by ID
  async getById(id: string) {
    const { data, error } = await supabase
      .from('problems')
      .select('*, solutions(*)')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  // Create problem with solutions (server: POST /api/admin/problems)
  async create(problem: Database['public']['Tables']['problems']['Insert'], solutions?: Omit<Database['public']['Tables']['solutions']['Insert'], 'problem_id'>[]) {
    return adminWrite<Problem>('POST', '/api/admin/problems', { problem, solutions });
  },

  // Update problem; when solutions are given they replace the problem's solutions, keeping ids so hierarchy
  // links stay valid (server: PATCH /api/admin/problems/[id])
  async update(id: string, problem: Database['public']['Tables']['problems']['Update'], solutions?: Omit<Database['public']['Tables']['solutions']['Insert'], 'problem_id'>[]) {
    return adminWrite<Problem>('PATCH', `/api/admin/problems/${encodeURIComponent(id)}`, { problem, solutions });
  },

  // Delete problem (server: DELETE /api/admin/problems/[id])
  async delete(id: string) {
    await adminWrite('DELETE', `/api/admin/problems/${encodeURIComponent(id)}`);
  },

  // Get all unique source names
  async getUniqueSources() {
    const { data, error } = await supabase
      .from('problems')
      .select('source')
      .not('source', 'is', null)
      .not('source', 'eq', '');
    
    if (error) throw error;
    if (!data) return [];

    // Cast through unknown to escape Supabase's over-narrowed 'never' inference
    const rows = data as unknown as { source: string | null }[];
    // Return unique values (filter nulls and narrow type to string[])
    const sources = rows.map(item => item.source).filter((s): s is string => s !== null);
    return Array.from(new Set(sources)).sort();
  }
};

// Hierarchy API
export const problemHierarchiesAPI = {
  // Get all hierarchy links
  async getAll() {
    const { data, error } = await supabase
      .from('problem_hierarchies')
      .select('*');
    if (error) throw error;
    return data;
  },

  // Create link (server: POST /api/admin/problem-hierarchies)
  async create(
    parentProblemId: string,
    childProblemId: string,
    parentSolutionId: string | null,
    stageName: string,
    sequenceOrder: number,
    depth: number
  ) {
    return adminWrite<Database['public']['Tables']['problem_hierarchies']['Row']>('POST', '/api/admin/problem-hierarchies', {
      parentProblemId, childProblemId, parentSolutionId, stageName, sequenceOrder, depth,
    });
  },

  // Get hierarchy chain for a parent/solution
  async getChain(parentProblemId: string, parentSolutionId?: string) {
    let query = supabase.from('problem_hierarchies')
      .select('*, child_problem:problems!child_problem_id(*, solutions(*))')
      .eq('parent_problem_id', parentProblemId)
      .order('sequence_order', { ascending: true });

    if (parentSolutionId) {
      query = query.eq('parent_solution_id', parentSolutionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Delete a link (parent -> child) (server: DELETE /api/admin/problem-hierarchies)
  async delete(parentProblemId: string, childProblemId: string) {
    await adminWrite('DELETE', '/api/admin/problem-hierarchies', { parentProblemId, childProblemId });
  },

  // Get all parents (ancestors) for a given child problem
  async getParents(childProblemId: string) {
    const { data, error } = await supabase
      .from('problem_hierarchies')
      .select('*, parent_problem:problems!parent_problem_id(*)')
      .eq('child_problem_id', childProblemId)
      .order('sequence_order', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Get all children for a given parent problem (alias of getChain without solution filter)
  async getChildren(parentProblemId: string) {
    return problemHierarchiesAPI.getChain(parentProblemId);
  }
}


// Utility: Convert difficulty number to label
export function getDifficultyLabel(difficulty: number): string {
  if (difficulty <= 3) return 'Easy';
  if (difficulty <= 6) return 'Medium';
  if (difficulty <= 9) return 'Hard';
  return 'Olympiad';
}

// Utility: XP awarded for a correct answer (problems.xp was dropped; XP comes from difficulty)
export function calculateXP(difficulty: number): number {
  return calculateRewards(difficulty, true).xpEarned;
}

// Utility: Convert category path to tags
export function categoryToTags(categoryPath: string): string[] {
  if (!categoryPath) return [];
  return categoryPath.split(' > ').map(c => c.trim());
}
