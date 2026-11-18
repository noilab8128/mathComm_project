// Labels and colours shared by the review list and detail pages.

export const AUTO_STYLE: Record<string, { label: string; className: string }> = {
    unverified: { label: "Not checked", className: "bg-slate-100 text-slate-600" },
    passed: { label: "Passed", className: "bg-emerald-50 text-emerald-700" },
    warning: { label: "Warning", className: "bg-amber-50 text-amber-700" },
    failed: { label: "Failed", className: "bg-red-50 text-red-700" },
};

export const REVIEW_STYLE: Record<string, { label: string; className: string }> = {
    pending: { label: "Waiting for review", className: "bg-slate-100 text-slate-700" },
    approved: { label: "Approved", className: "bg-emerald-600 text-white" },
    changes_requested: { label: "Changes requested", className: "bg-amber-500 text-white" },
    rejected: { label: "Rejected", className: "bg-red-600 text-white" },
    needs_recheck: { label: "Re-check needed", className: "bg-violet-600 text-white" },
};

export const DECISION_LABEL: Record<string, string> = {
    approve: "Approved", request_changes: "Requested changes", reject: "Rejected", comment: "Commented",
};

export const DECISION_STYLE: Record<string, string> = {
    approve: "bg-emerald-50 text-emerald-700 border-emerald-200",
    request_changes: "bg-amber-50 text-amber-800 border-amber-200",
    reject: "bg-red-50 text-red-700 border-red-200",
    comment: "bg-slate-50 text-slate-700 border-slate-200",
};
