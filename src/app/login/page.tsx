"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import Turnstile, { useTurnstile } from "react-turnstile";

function LoginContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const modeParam = searchParams.get("mode");

    const [isLoading, setIsLoading] = useState<"google" | "facebook" | "credentials" | false>(false);
    const [isRegistering, setIsRegistering] = useState(modeParam === "signup");
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const turnstile = useTurnstile();

    const { status } = useSession();

    useEffect(() => {
        if (status === "authenticated") {
            router.push("/dashboard");
        }
    }, [status, router]);

    useEffect(() => {
        if (modeParam === "signup") {
            setIsRegistering(true);
        } else {
            setIsRegistering(false);
        }
    }, [modeParam]);

    const handleTabChange = (mode: "signin" | "signup") => {
        setIsRegistering(mode === "signup");
        setRegistrationSuccess(false);
        setErrorMsg("");
        // Optional: Update URL to reflect state without hard reload
        router.replace(mode === "signup" ? "/login?mode=signup" : "/login", { scroll: false });
    };

    const handleOAuthLogin = async (provider: "google" | "facebook") => {
        try {
            setErrorMsg("");
            setIsLoading(provider);
            await signIn(provider, { callbackUrl: "/dashboard" });
        } catch (error) {
            console.error(`${provider} Login failed:`, error);
            setIsLoading(false);
        }
    };

    const handleCredentialsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg("");

        if (!turnstileToken) {
            setErrorMsg("Please verify that you are a human first.");
            return;
        }

        if (!email || !password) {
            setErrorMsg("Please enter both email and password.");
            return;
        }

        if (isRegistering && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            setErrorMsg("Password must be at least 8 characters with uppercase, lowercase, and a number.");
            return;
        }

        try {
            setIsLoading("credentials");

            if (isRegistering) {
                // Register flow
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, turnstileToken }),
                });

                if (!res.ok) {
                    const data = await res.json();
                    throw new Error(data.message || "Registration failed");
                }

                // Show Welcome Message instead of instant sign in
                setRegistrationSuccess(true);
                setIsLoading(false);
                return;
            }

            // Normal Sign In flow
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
                turnstileToken,
            });

            if (result?.error) {
                setErrorMsg(result.error);
                setIsLoading(false);
                turnstile.reset();
            } else {
                // Success, route to dashboard manually
                router.push("/dashboard");
                router.refresh();
            }
        } catch (error: unknown) {
            const err = error as Error;
            setErrorMsg(err.message || "An unexpected error occurred.");
            setIsLoading(false);
            turnstile.reset();
        }
    };

    const input =
        "block h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200";

    // If registration just succeeded, show the welcome screen
    if (registrationSuccess) {
        return (
            <AuthFrame>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <h1 className="mt-6 text-2xl font-semibold tracking-tight text-slate-900">Your account is ready</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Sign in with your email and password to start your first ladder.
                </p>
                <Button onClick={() => handleTabChange("signin")} className="mt-8 h-10 w-full">
                    Sign in
                </Button>
            </AuthFrame>
        )
    }

    return (
        <AuthFrame>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {isRegistering ? "Create your account" : "Sign in to Math Quest"}
            </h1>
            <p className="mt-2 text-sm text-slate-600">
                {isRegistering ? "Already have an account? " : "New to Math Quest? "}
                <button
                    type="button"
                    onClick={() => handleTabChange(isRegistering ? "signin" : "signup")}
                    className="font-medium text-slate-900 underline underline-offset-4 hover:text-slate-700"
                >
                    {isRegistering ? "Sign in" : "Create an account"}
                </button>
            </p>

            <div className="mt-8 grid gap-2.5">
                <Button
                    onClick={() => handleOAuthLogin("google")}
                    disabled={isLoading !== false || !turnstileToken}
                    type="button"
                    variant="outline"
                    className="h-10 w-full gap-3 text-slate-800"
                >
                    {isLoading === "google" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <svg className="h-4 w-4" aria-hidden="true" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                    )}
                    Continue with Google
                </Button>
                <Button
                    onClick={() => handleOAuthLogin("facebook")}
                    disabled={isLoading !== false || !turnstileToken}
                    type="button"
                    variant="outline"
                    className="h-10 w-full gap-3 text-slate-800"
                >
                    {isLoading === "facebook" ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <svg className="h-4 w-4 fill-[#1877F2]" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                    )}
                    Continue with Facebook
                </Button>
            </div>

            <div className="my-6 flex items-center gap-3 text-xs text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                or with email
                <span className="h-px flex-1 bg-slate-200" />
            </div>

            {errorMsg && (
                <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
                    {errorMsg}
                </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">Email</label>
                    <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={input}
                        required
                    />
                </div>
                <div>
                    <div className="mb-1.5 flex items-center justify-between">
                        <label htmlFor="password" className="block text-sm font-medium text-slate-700">Password</label>
                        {!isRegistering && (
                            <a href="#" className="text-xs text-slate-500 hover:text-slate-900">Forgot password?</a>
                        )}
                    </div>
                    <input
                        id="password"
                        type="password"
                        autoComplete={isRegistering ? "new-password" : "current-password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={input}
                        required
                        minLength={isRegistering ? 6 : undefined}
                    />
                    {isRegistering && (
                        <p className="mt-1.5 text-xs text-slate-500">At least 8 characters, with an uppercase letter, a lowercase letter and a number.</p>
                    )}
                </div>

                {/* Bot Protection Widget */}
                <div className="flex min-h-[65px] justify-center">
                    <Turnstile
                        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"} // Dummy testing key
                        onVerify={(token: string) => setTurnstileToken(token)}
                        theme="light"
                    />
                </div>

                <Button type="submit" disabled={isLoading !== false || !turnstileToken} className="h-10 w-full">
                    {isLoading === "credentials" ? <Loader2 className="h-4 w-4 animate-spin" /> : (isRegistering ? "Create account" : "Sign in")}
                </Button>
            </form>

            <p className="mt-8 text-xs leading-relaxed text-slate-500">
                By continuing, you agree to our <Link href="/terms" className="underline hover:text-slate-900">Terms of Service</Link> and{" "}
                <Link href="/privacy" className="underline hover:text-slate-900">Privacy Policy</Link>.
            </p>
            <Link href="/top-secret" className="mt-3 inline-block text-xs text-slate-400 hover:text-slate-600">
                Staff sign-in
            </Link>
        </AuthFrame>
    );
}

/** Two-panel frame: brand panel on the left (large screens), form on the right. */
function AuthFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className="grid min-h-screen bg-white lg:grid-cols-[1fr_1.1fr]">
            <aside className="relative hidden flex-col justify-between overflow-hidden bg-slate-900 p-12 text-white lg:flex">
                <div
                    className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:32px_32px]"
                    aria-hidden
                />
                <Link href="/" className="relative flex items-center gap-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/noilab_logo.png" alt="" className="h-7 w-7 rounded bg-white object-contain p-0.5" />
                    <span className="text-[15px] font-semibold tracking-tight">Math Quest</span>
                </Link>
                <figure className="relative max-w-md">
                    <div className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Fibonacci Stairs · Challenge</div>
                    <blockquote className="mt-4 font-serif text-2xl leading-snug text-white">
                        In how many ways can 2026 be written as a sum of different numbers from the list 1, 2, 3, 5, 8, 13, 21, …?
                    </blockquote>
                    <figcaption className="mt-6 text-sm text-slate-400">
                        Five short steps lead up to it.
                    </figcaption>
                </figure>
                <div className="relative text-xs text-slate-500">© {new Date().getFullYear()} noi.lab</div>
            </aside>

            <main className="flex flex-col px-6 py-8 sm:px-12">
                <Link href="/" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
                    <span aria-hidden="true">&larr;</span> Back to home
                </Link>
                <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-10">{children}</div>
            </main>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white"><Loader2 className="h-6 w-6 animate-spin text-slate-400" /></div>}>
            <LoginContent />
        </Suspense>
    );
}
