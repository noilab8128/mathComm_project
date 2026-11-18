/**
 * Roles stored in public.user_roles.role (one row per user; no row = "user").
 *
 * - admin:    super administrator. Every admin page and API, problem reviews, and choosing who has which role.
 * - reviewer: problem reviews only (/admin/reviews and /api/admin/reviews/*).
 * - user:     everyone else.
 *
 * Shared by server and browser code: no server-only imports here.
 */
export const ROLES = ["user", "reviewer", "admin"] as const;
export type Role = (typeof ROLES)[number];

export const ROLE_LABELS: Record<Role, string> = {
    user: "User",
    reviewer: "Reviewer",
    admin: "Admin",
};

export function isRole(value: unknown): value is Role {
    return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

export function isAdminRole(role: unknown): boolean {
    return role === "admin";
}

/** Admins can review too; reviewers can only review. */
export function canReview(role: unknown): boolean {
    return role === "admin" || role === "reviewer";
}

/** Admin pages a reviewer may open. Everything else under /admin is for admins only. */
export const REVIEWER_PATHS = ["/admin/reviews"];

export function reviewerMayOpen(pathname: string): boolean {
    return REVIEWER_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"));
}
