// A student's own work on a problem (decision 2026-10-25):
//  - submissions are saved in user_submissions and read back by /api/user/submissions, so a solved problem shows
//    the saved answer instead of asking for it again;
//  - unsent work (explanation + answer) is kept as a draft in this browser while the student types.

/** One saved submission, as /api/user/submissions returns it. */
export interface SavedSubmission {
  /** "short_answer": answer checked, explanation saved; "written": explanation graded by AI */
  mode: "short_answer" | "written";
  answer: string | null;
  explanation: string | null;
  isCorrect: boolean;
  createdAt: string;
}

export interface SavedWork {
  solved: boolean;
  attempts: number;
  /** The latest correct submission (shown on a solved problem) */
  solvedWith: SavedSubmission | null;
  /** When the problem was first solved */
  firstSolvedAt: string | null;
  /** The most recent submission */
  last: SavedSubmission | null;
}

export interface Draft {
  explanation: string;
  answer: string;
}

// Drafts are per user and per problem, so two accounts on one computer do not see each other's work.
export const draftKey = (userId: string, problemId: string) => `mathquest:draft:${userId}:${problemId}`;

export function readDraft(key: string): Draft | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const d = JSON.parse(raw) as Partial<Draft>;
    const draft = { explanation: d.explanation ?? "", answer: d.answer ?? "" };
    return draft.explanation.trim() || draft.answer.trim() ? draft : null;
  } catch {
    return null;
  }
}

export function writeDraft(key: string, draft: Draft) {
  try {
    if (draft.explanation.trim() || draft.answer.trim()) localStorage.setItem(key, JSON.stringify(draft));
    else localStorage.removeItem(key);
  } catch {
    // storage full or blocked: the draft is simply not kept
  }
}

export function clearDraft(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    // nothing to clear
  }
}
