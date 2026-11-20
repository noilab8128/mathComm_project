/**
 * GitHub Actions calls for the automatic problem checks (server only). The token never reaches the browser.
 *
 * Server settings (Netlify environment variables, and .env.local for local testing):
 *   GITHUB_DISPATCH_TOKEN  fine-grained token of the repository owner: this repository only, "Actions: Read and write"
 *   GITHUB_REPOSITORY      optional, default noilab8128/mathComm_project
 */

/** The two scheduled workflows in .github/workflows/. */
export const CHECK_WORKFLOWS = {
    regular: { file: "verify-problems.yml", name: "Automatic check (L0, L1)", schedule: "Every night 03:00 KST" },
    ai: { file: "verify-problems-ai.yml", name: "AI check (L2, L4)", schedule: "Every night 03:40 KST" },
} as const;
export type CheckWorkflow = keyof typeof CHECK_WORKFLOWS;

export function githubSettings() {
    const token = process.env.GITHUB_DISPATCH_TOKEN;
    const repo = process.env.GITHUB_REPOSITORY || "noilab8128/mathComm_project";
    return token ? { token, repo } : null;
}

export async function github(path: string, token: string, init?: RequestInit) {
    return fetch(`https://api.github.com${path}`, {
        ...init,
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${token}`,
            "X-GitHub-Api-Version": "2022-11-28",
            ...(init?.body ? { "Content-Type": "application/json" } : {}),
        },
        cache: "no-store",
    });
}

export type WorkflowRun = { status: string; conclusion: string | null; createdAt: string; url: string; event: string };

export async function latestRun(token: string, repo: string, file: string): Promise<WorkflowRun | null> {
    const res = await github(`/repos/${repo}/actions/workflows/${file}/runs?per_page=1`, token);
    if (!res.ok) throw new Error(`GitHub answered ${res.status} when reading the workflow runs`);
    const data = await res.json();
    const r = data.workflow_runs?.[0];
    return r ? { status: r.status, conclusion: r.conclusion, createdAt: r.created_at, url: r.html_url, event: r.event } : null;
}

/** "active", "disabled_manually", "disabled_inactivity", ... (GitHub's workflow state). */
export async function workflowState(token: string, repo: string, file: string): Promise<string> {
    const res = await github(`/repos/${repo}/actions/workflows/${file}`, token);
    if (!res.ok) throw new Error(`GitHub answered ${res.status} when reading the workflow`);
    const data = await res.json();
    return String(data.state || "unknown");
}

/** Turns a workflow on or off (its schedule and its manual runs). */
export async function setWorkflowEnabled(token: string, repo: string, file: string, enabled: boolean) {
    const res = await github(`/repos/${repo}/actions/workflows/${file}/${enabled ? "enable" : "disable"}`, token, { method: "PUT" });
    if (res.status !== 204) {
        const text = await res.text().catch(() => "");
        throw new Error(`GitHub refused (${res.status}). Check the token and its permissions. ${text.slice(0, 200)}`);
    }
}
