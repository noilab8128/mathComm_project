import { supabaseAdmin } from "./supabase-admin";

/**
 * Server-side writes for the admin problem editor (`problems`, `solutions`, `problem_hierarchies`).
 * Called only from /api/admin/* routes after requireAdmin(); uses the service key.
 *
 * Before 2026-10-26 the editor wrote with the public anon key straight from the browser, which needed
 * "write for everyone" policies on these tables. Moving the writes here lets those policies be dropped.
 */

type Row = Record<string, unknown>;

export class BadRequest extends Error {}

export function asObject(value: unknown, name: string): Row {
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new BadRequest(`${name} must be an object`);
    return value as Row;
}

export function asSolutions(value: unknown): Row[] | undefined {
    if (value === undefined || value === null) return undefined;
    if (!Array.isArray(value) || value.some((s) => !s || typeof s !== "object")) {
        throw new BadRequest("solutions must be a list of objects");
    }
    return value as Row[];
}

/** Columns the editor may not set: the row id, and the problem a solution belongs to (set here). */
function withoutKeys(row: Row, keys: string[]): Row {
    const copy = { ...row };
    for (const key of keys) delete copy[key];
    return copy;
}

export async function createProblem(problem: Row, solutions?: Row[]) {
    const { data: created, error } = await supabaseAdmin
        .from("problems")
        .insert([withoutKeys(problem, ["id"])])
        .select()
        .single();
    if (error) throw error;

    if (solutions && solutions.length > 0) {
        const rows = solutions.map((s) => ({ ...withoutKeys(s, ["id", "problem_id"]), problem_id: created.id }));
        const { error: solError } = await supabaseAdmin.from("solutions").insert(rows);
        if (solError) {
            // Do not leave a problem without its solutions behind.
            await supabaseAdmin.from("problems").delete().eq("id", created.id);
            throw solError;
        }
    }
    return created;
}

/**
 * Updates a problem. When `solutions` is given, it becomes the complete list: solutions not in it are deleted,
 * ones with an id are updated, ones without an id are added (ids are kept so hierarchy links stay valid).
 */
export async function updateProblem(id: string, problem: Row, solutions?: Row[]) {
    const { data: updated, error } = await supabaseAdmin
        .from("problems")
        .update({ ...withoutKeys(problem, ["id"]), updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
    if (error) throw error;

    if (solutions) {
        const { data: existing, error: readError } = await supabaseAdmin
            .from("solutions")
            .select("id")
            .eq("problem_id", id);
        if (readError) throw readError;

        const keep = new Set(solutions.map((s) => s.id).filter((v): v is string => typeof v === "string" && !!v));
        const toDelete = (existing || []).map((s) => s.id as string).filter((sid) => !keep.has(sid));
        if (toDelete.length > 0) {
            const { error: delError } = await supabaseAdmin.from("solutions").delete().in("id", toDelete);
            if (delError) throw delError;
        }

        const withId = solutions
            .filter((s) => typeof s.id === "string" && s.id)
            .map((s) => ({ ...withoutKeys(s, ["problem_id"]), problem_id: id }));
        const withoutId = solutions
            .filter((s) => !(typeof s.id === "string" && s.id))
            .map((s) => ({ ...withoutKeys(s, ["id", "problem_id"]), problem_id: id }));

        if (withId.length > 0) {
            const { error: upError } = await supabaseAdmin.from("solutions").upsert(withId, { onConflict: "id" });
            if (upError) throw upError;
        }
        if (withoutId.length > 0) {
            const { error: insError } = await supabaseAdmin.from("solutions").insert(withoutId);
            if (insError) throw insError;
        }
    }
    return updated;
}

export async function deleteProblem(id: string) {
    const { error } = await supabaseAdmin.from("problems").delete().eq("id", id);
    if (error) throw error;
}

export async function createHierarchyLink(link: {
    parentProblemId: string;
    childProblemId: string;
    parentSolutionId: string | null;
    stageName: string;
    sequenceOrder: number;
    depth: number;
}) {
    const { data, error } = await supabaseAdmin
        .from("problem_hierarchies")
        .insert([{
            parent_problem_id: link.parentProblemId,
            child_problem_id: link.childProblemId,
            parent_solution_id: link.parentSolutionId,
            stage_name: link.stageName,
            sequence_order: link.sequenceOrder,
            depth: link.depth,
        }])
        .select()
        .single();
    if (error) throw error;
    return data;
}

export async function deleteHierarchyLink(parentProblemId: string, childProblemId: string) {
    const { error } = await supabaseAdmin
        .from("problem_hierarchies")
        .delete()
        .match({ parent_problem_id: parentProblemId, child_problem_id: childProblemId });
    if (error) throw error;
}

/** JSON error body the editor shows as `error.message`. */
export function errorMessage(err: unknown): string {
    if (err && typeof err === "object" && "message" in err) return String((err as { message: unknown }).message);
    return "Unknown error";
}
