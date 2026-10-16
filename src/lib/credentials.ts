/**
 * Shared rules for email/password accounts (sign-up, login, password change).
 */

// bcrypt cost factor for new hashes. Existing hashes with cost 10 still verify.
export const BCRYPT_ROUNDS = 12;

// bcrypt only uses the first 72 bytes of a password, so longer passwords are rejected instead of silently truncated.
const PASSWORD_MAX_BYTES = 72;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const PASSWORD_POLICY_MESSAGE =
    "Password must be 8 or more characters (at most 72 bytes) with uppercase, lowercase, and a number";

export function isValidPassword(password: unknown): password is string {
    return (
        typeof password === "string" &&
        PASSWORD_REGEX.test(password) &&
        new TextEncoder().encode(password).length <= PASSWORD_MAX_BYTES
    );
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trimmed, lower-cased email, or null when it is not a plausible address. */
export function normalizeEmail(email: unknown): string | null {
    if (typeof email !== "string") return null;
    const normalized = email.trim().toLowerCase();
    if (normalized.length > 254 || !EMAIL_REGEX.test(normalized)) return null;
    return normalized;
}

/** Escapes LIKE wildcards so `.ilike("email", …)` matches the address exactly, ignoring case only. */
export function escapeLike(value: string): string {
    return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

type HeaderSource = Headers | Record<string, string | string[] | undefined> | undefined;

/** Client IP for rate limiting. Netlify sets x-nf-client-connection-ip; the others are fallbacks. */
export function getClientIp(headers: HeaderSource): string {
    const get = (name: string): string | undefined => {
        if (!headers) return undefined;
        if (headers instanceof Headers) return headers.get(name) ?? undefined;
        const value = headers[name];
        return Array.isArray(value) ? value[0] : value;
    };
    return (
        get("x-nf-client-connection-ip") ||
        get("x-real-ip") ||
        get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "unknown"
    );
}
