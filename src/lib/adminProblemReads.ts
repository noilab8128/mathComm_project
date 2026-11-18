import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "./supabase-admin";

/**
 * Server-side reads for the admin problem editor (/admin/problems), with the service key.
 * Called only from /api/admin/* routes after requireAdmin().
 *
 * Before 2026-11-19 the editor read with the public anon key in the browser. Since problem_visibility.sql hides
 * unapproved problems from that key, new problems vanished from the editor as soon as they were saved. Reading here
 * shows every problem, and tells the editor which ones students cannot see (`hiddenIds`).
 */

const SORTS = ["newest", "oldest", "difficulty_asc", "difficulty_desc"] as const;
type Sort = (typeof SORTS)[number];
const MAX_PAGE_SIZE = 100;

export interface ProblemListQuery {
    page: number;
    pageSize: number;
    difficulty?: number[];
    category?: string;
    isGenerated?: boolean;
    isReviewed?: boolean;
    search?: string;
    sortBy: Sort;
}

function bool(value: string | null): boolean | undefined {
    return value === "true" ? true : value === "false" ? false : undefined;
}

/** Query string of GET /api/admin/problems -> checked query. Bad values fall back to the defaults. */
export function parseListQuery(params: URLSearchParams): ProblemListQuery {
    const page = Math.max(1, Math.floor(Number(params.get("page")) || 1));
    const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(Number(params.get("pageSize")) || 20)));
    const difficulty = (params.get("difficulty") || "")
        .split(",").map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 10);
    const sort = params.get("sortBy");
    // PostgREST's or=(...) syntax breaks on these characters, so they are removed from the search text.
    const search = (params.get("search") || "").replace(/[,()\\*%]/g, " ").trim().slice(0, 100);
    const category = (params.get("category") || "").trim().slice(0, 200);
    return {
        page,
        pageSize,
        difficulty: difficulty.length > 0 ? difficulty : undefined,
        category: category || undefined,
        isGenerated: bool(params.get("isGenerated")),
        isReviewed: bool(params.get("isReviewed")),
        search: search || undefined,
        sortBy: (SORTS as readonly string[]).includes(sort || "") ? (sort as Sort) : "newest",
    };
}

type Row = Record<string, unknown> & { id: string };

/** Ids among `ids` that the public key cannot read (hidden from students), or null if that could not be checked. */
async function hiddenFromPublic(ids: string[]): Promise<string[] | null> {
    if (ids.length === 0) return [];
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    const anon = createClient(url, anonKey, { auth: { persistSession: false } });
    const { data, error } = await anon.from("problems").select("id").in("id", ids);
    if (error) {
        console.error("Admin problem list: visibility check failed:", error.message);
        return null;
    }
    const visible = new Set((data || []).map((r: { id: string }) => r.id));
    return ids.filter((id) => !visible.has(id));
}

/**
 * One page of problems for the editor, plus what the list needs around it: the children of those problems, all
 * hierarchy links, the known sources and which of the loaded problems are hidden from students.
 */
export async function listProblems(q: ProblemListQuery) {
    let query = supabaseAdmin.from("problems").select("*, solutions(*)", { count: "exact" });
    if (q.difficulty) query = query.in("difficulty", q.difficulty);
    if (q.category) query = query.ilike("category_path", `%${q.category}%`);
    if (q.isGenerated !== undefined) query = query.eq("is_generated", q.isGenerated);
    if (q.isReviewed !== undefined) query = query.eq("is_reviewed", q.isReviewed);
    if (q.search) query = query.or(`title.ilike.%${q.search}%,content.ilike.%${q.search}%`);

    if (q.sortBy === "difficulty_asc") query = query.order("difficulty", { ascending: true });
    else if (q.sortBy === "difficulty_desc") query = query.order("difficulty", { ascending: false });
    else query = query.order("created_at", { ascending: q.sortBy === "oldest" });

    const from = (q.page - 1) * q.pageSize;
    const { data: problems, error, count } = await query.range(from, from + q.pageSize - 1);
    if (error) throw error;
    const rows = (problems || []) as Row[];

    const [childRes, hierarchyRes, sourceRes] = await Promise.all([
        rows.length > 0
            ? supabaseAdmin.from("problem_hierarchies")
                .select("child_problem:problems!child_problem_id(*, solutions(*))")
                .in("parent_problem_id", rows.map((r) => r.id))
            : Promise.resolve({ data: [], error: null }),
        supabaseAdmin.from("problem_hierarchies").select("*"),
        supabaseAdmin.from("problems").select("source").not("source", "is", null).not("source", "eq", ""),
    ]);
    if (childRes.error) throw childRes.error;
    if (hierarchyRes.error) throw hierarchyRes.error;
    if (sourceRes.error) throw sourceRes.error;

    const children = ((childRes.data || []) as { child_problem: Row | Row[] | null }[])
        .flatMap((d) => (Array.isArray(d.child_problem) ? d.child_problem : d.child_problem ? [d.child_problem] : []));
    const sources = Array.from(new Set(
        ((sourceRes.data || []) as { source: string | null }[]).map((r) => r.source).filter((s): s is string => !!s),
    )).sort();
    const loadedIds = Array.from(new Set([...rows, ...children].map((r) => r.id)));

    return {
        problems: rows,
        children,
        hierarchies: hierarchyRes.data || [],
        count: count || 0,
        sources,
        hiddenIds: await hiddenFromPublic(loadedIds),
    };
}

/** One problem with its solutions (in order), or null. */
export async function getProblem(id: string) {
    const { data, error } = await supabaseAdmin
        .from("problems")
        .select("*, solutions(*)")
        .eq("id", id)
        .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const solutions = ((data as { solutions?: { sequence_order: number | null }[] }).solutions || [])
        .slice().sort((a, b) => (a.sequence_order || 0) - (b.sequence_order || 0));
    return { ...data, solutions };
}
