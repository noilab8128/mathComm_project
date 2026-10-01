import React from "react";
import Link from "next/link";
import { ArrowRight, Check, FileText, GitBranch, LineChart } from "lucide-react";
import LandingHeader from "@/components/LandingHeader";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { DifficultyBadge } from "@/components/DifficultyRating";

// A real ladder (olympiad/ladders/LADDERS_v0.1.md, Ladder F), shown top-down: the Challenge on top.
const LADDER = {
    name: "Carries Cost Nine",
    source: "Built from the idea of IMO Shortlist 2022 A7",
    steps: [
        { label: "Challenge", level: "AIME", d: 8, q: "Let Q(x) = x² + 9x. Add up s(Q(101 · 10ᵐ)) for m = 0, 1, …, 20." },
        { label: "Step 5", level: "AMC 10", d: 6, q: "What is s(1001⁶)?" },
        { label: "Step 4", level: "AMC 8", d: 5, q: "What is s(1001 × 1001 × 1001)?" },
        { label: "Step 3", level: "MATHCOUNTS", d: 4, q: "s(A) = 50, s(B) = 40, and adding them carries 6 times. Find s(A + B)." },
        { label: "Step 2", level: "MATHCOUNTS", d: 3, q: "Find s(4768) + s(1325) − s(4768 + 1325)." },
        { label: "Step 1", level: "Kangaroo", d: 2, q: "Find s(999) + s(1) − s(1000)." },
    ],
    frontier: "Erdős asked whether every power of 2 beyond 2⁸ uses the digit 2 in base 3. Still open.",
};

const TOPICS = [
    { name: "Number Theory", items: ["Divisibility and primes", "Congruences", "Diophantine equations", "Digit problems"] },
    { name: "Combinatorics", items: ["Counting", "Invariants and processes", "Graph theory", "Games"] },
    { name: "Algebra", items: ["Polynomials", "Inequalities", "Functional equations", "Sequences"] },
    { name: "Geometry", items: ["Euclidean geometry", "Coordinates", "Circles", "Lattice points"] },
    { name: "Analysis", items: ["Limits and series", "Real analysis", "Calculus"] },
    { name: "Probability", items: ["Expected value", "Conditional probability", "Random processes"] },
];

const STEPS_EXPLAINED = [
    {
        n: "01",
        title: "Start with a warm-up",
        body: "Every ladder opens with a question at Math Kangaroo level. You can answer it in a few minutes, and it already contains the idea.",
    },
    {
        n: "02",
        title: "Climb one idea at a time",
        body: "Each step adds one move: a pattern, a bound, a construction. Every step has a single numeric answer, verified by computer.",
    },
    {
        n: "03",
        title: "Reach the Challenge",
        body: "The last step is an AIME or olympiad-style problem built on the same idea. Then we show you the real contest problems and the open question behind it.",
    },
];

function LadderPreview() {
    return (
        <div className="rounded-lg border border-slate-200 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.04),0_12px_32px_-12px_rgb(15_23_42/0.18)]">
            <div className="flex items-baseline justify-between gap-4 border-b border-slate-200 px-5 py-4">
                <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Ladder</div>
                    <div className="mt-0.5 font-semibold text-slate-900">{LADDER.name}</div>
                </div>
                <div className="text-right text-xs text-slate-500">{LADDER.steps.length} problems</div>
            </div>

            <div className="border-b border-dashed border-slate-200 bg-slate-50 px-5 py-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Beyond the ladder · open problem</div>
                <p className="mt-1 font-serif text-[15px] leading-snug text-slate-800">{LADDER.frontier}</p>
            </div>

            <ol className="divide-y divide-slate-100">
                {LADDER.steps.map((s, i) => {
                    const isChallenge = s.label === "Challenge";
                    return (
                        <li key={s.label} className="flex gap-4 px-5 py-3">
                            <div className="flex w-4 flex-col items-center pt-1.5" aria-hidden>
                                <span className={`h-2.5 w-2.5 rounded-full ${isChallenge ? "bg-slate-900" : "border border-slate-400 bg-white"}`} />
                                {i < LADDER.steps.length - 1 && <span className="mt-1 w-px flex-1 bg-slate-200" />}
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-0.5">
                                    <span className={`text-xs ${isChallenge ? "font-semibold text-slate-900" : "font-medium text-slate-600"}`}>
                                        {s.label} <span className="font-normal text-slate-400">· {s.level}</span>
                                    </span>
                                    <DifficultyBadge difficulty={s.d} />
                                </div>
                                <p className="mt-1 font-serif text-[15px] leading-snug text-slate-900">{s.q}</p>
                            </div>
                        </li>
                    );
                })}
            </ol>
            <div className="border-t border-slate-200 px-5 py-2.5 text-[11px] text-slate-500">
                s(n) is the sum of the digits of n · {LADDER.source}
            </div>
        </div>
    );
}

export default function LandingPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white text-slate-900">
            <LandingHeader />

            <main className="flex-1">
                {/* Hero */}
                <section className="relative overflow-hidden border-b border-slate-200">
                    <div
                        className="pointer-events-none absolute inset-0 opacity-[0.35] [background-image:linear-gradient(to_right,rgb(226_232_240)_1px,transparent_1px),linear-gradient(to_bottom,rgb(226_232_240)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:radial-gradient(ellipse_at_top_left,black,transparent_70%)]"
                        aria-hidden
                    />
                    <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:py-24">
                        <div>
                            <div className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Competition mathematics, step by step</div>
                            <h1 className="mt-4 font-serif text-[40px] font-semibold leading-[1.1] tracking-tight text-slate-900 sm:text-5xl lg:text-[56px]">
                                From a first idea to an Olympiad problem.
                            </h1>
                            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
                                Math Quest turns competition problems into ladders of short, solvable steps. Each ladder starts at
                                Kangaroo level, ends at an olympiad-style Challenge, and shows you the open question beyond it.
                            </p>
                            <div className="mt-8 flex flex-wrap items-center gap-3">
                                <Link href="/login?mode=signup">
                                    <Button className="h-11 gap-2 px-6 text-[15px]">
                                        Start solving <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                                <Link href="#ladders">
                                    <Button variant="outline" className="h-11 px-6 text-[15px] text-slate-700">See a ladder</Button>
                                </Link>
                            </div>
                            <ul className="mt-8 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
                                {[
                                    "Ideas from the IMO Shortlist",
                                    "Every answer checked by computer",
                                    "Feedback on written solutions",
                                    "Free to start",
                                ].map((t) => (
                                    <li key={t} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-slate-900" /> {t}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div id="ladders" className="scroll-mt-24">
                            <LadderPreview />
                        </div>
                    </div>
                </section>

                {/* How it works */}
                <section id="how-it-works" className="scroll-mt-16 border-b border-slate-200">
                    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                        <div className="max-w-2xl">
                            <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">How a ladder works</h2>
                            <p className="mt-4 text-slate-600">
                                Hard problems are rarely hard everywhere. They hide one or two ideas. A ladder isolates those ideas and
                                lets you meet them in order.
                            </p>
                        </div>
                        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 md:grid-cols-3">
                            {STEPS_EXPLAINED.map((s) => (
                                <div key={s.n} className="bg-white p-7">
                                    <div className="font-mono text-sm text-slate-400">{s.n}</div>
                                    <h3 className="mt-3 text-lg font-semibold text-slate-900">{s.title}</h3>
                                    <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{s.body}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* A problem, as students see it */}
                <section className="border-b border-slate-200 bg-slate-50">
                    <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:items-center">
                        <div>
                            <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Problems worth thinking about</h2>
                            <p className="mt-4 text-slate-600">
                                No drills and no tricks for their own sake. Every problem is written to be read carefully, the way
                                problems are set in real competitions, with every person and object named.
                            </p>
                            <dl className="mt-8 space-y-5">
                                <div className="flex gap-4">
                                    <FileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                                    <div>
                                        <dt className="font-medium text-slate-900">Write full solutions</dt>
                                        <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                                            Type your argument in LaTeX and get feedback on accuracy, reasoning, communication,
                                            presentation and justification.
                                        </dd>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <GitBranch className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                                    <div>
                                        <dt className="font-medium text-slate-900">Step down when you are stuck</dt>
                                        <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                                            Every hard problem shows its learning path, so you can drop to an easier step and climb back.
                                        </dd>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <LineChart className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                                    <div>
                                        <dt className="font-medium text-slate-900">Track real progress</dt>
                                        <dd className="mt-1 text-sm leading-relaxed text-slate-600">
                                            A rating per topic, your solved problems and your streak, without noise.
                                        </dd>
                                    </div>
                                </div>
                            </dl>
                        </div>

                        <figure className="rounded-lg border border-slate-200 bg-white p-7 shadow-sm">
                            <div className="flex items-center justify-between gap-4 text-xs text-slate-500">
                                <span>Candy Game · Challenge</span>
                                <DifficultyBadge difficulty={8} />
                            </div>
                            <div className="mt-5 border-l-2 border-slate-900 pl-5">
                                <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-500">Problem</div>
                                <p className="mt-2 font-serif text-[17px] leading-[1.7] text-slate-900">
                                    A kid who has at least two more candies than another kid may give that kid one candy. The game ends
                                    when no gift is possible. Ana has 2026 candies, Ben has 1000, and Cal has 7. What is the largest
                                    number of moves the game could last?
                                </p>
                            </div>
                            <div className="mt-6 flex items-center gap-2">
                                <div className="flex h-9 flex-1 items-center rounded-md border border-slate-300 px-3 font-mono text-sm text-slate-400">
                                    Your answer
                                </div>
                                <div className="flex h-9 items-center rounded-md bg-slate-900 px-4 text-sm text-white">Check</div>
                            </div>
                            <figcaption className="mt-4 text-xs text-slate-500">
                                Related: IMO Shortlist 2022 C4 and IMO 1986 Problem 3. Beyond it: the Collatz conjecture.
                            </figcaption>
                        </figure>
                    </div>
                </section>

                {/* Topics */}
                <section id="topics" className="scroll-mt-16 border-b border-slate-200">
                    <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
                        <div className="flex flex-wrap items-end justify-between gap-4">
                            <div className="max-w-2xl">
                                <h2 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Topics</h2>
                                <p className="mt-4 text-slate-600">The four olympiad areas, plus analysis and probability for university students.</p>
                            </div>
                            <Link href="/login?mode=signup" className="text-sm font-medium text-slate-900 underline-offset-4 hover:underline">
                                Browse all problems →
                            </Link>
                        </div>
                        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                            {TOPICS.map((t) => (
                                <div key={t.name} className="border-t border-slate-900 pt-4">
                                    <h3 className="font-semibold text-slate-900">{t.name}</h3>
                                    <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
                                        {t.items.map((i) => (
                                            <li key={i}>{i}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Call to action */}
                <section className="bg-slate-900">
                    <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 md:flex-row md:items-center">
                        <div>
                            <h2 className="font-serif text-3xl font-semibold tracking-tight text-white sm:text-4xl">Start with one step.</h2>
                            <p className="mt-3 max-w-xl text-slate-300">
                                Pick a ladder, answer the warm-up, and see how far the idea takes you.
                            </p>
                        </div>
                        <Link href="/login?mode=signup">
                            <Button className="h-11 gap-2 bg-white px-6 text-[15px] text-slate-900 hover:bg-slate-100">
                                Create a free account <ArrowRight className="h-4 w-4" />
                            </Button>
                        </Link>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
