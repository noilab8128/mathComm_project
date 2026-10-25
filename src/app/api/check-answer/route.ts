import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { parseNumber, sameNumber, storedAnswer } from "@/lib/answers";
import { rateLimit } from "@/lib/rate-limit";
import { recordSubmission } from "@/lib/submissions";

// Enough for honest trying, too few for guessing a number by brute force
const checkLimiter = rateLimit({ windowMs: 10 * 60 * 1000, maxRequests: 20 });

const MAX_EXPLANATION = 20000;

/**
 * POST /api/check-answer  { problemId, answer, explanation? }
 * Short-answer check: compares the student's number with the stored answer ("Answer: ..." in the problem's
 * solution). No AI, so no cost. The optional explanation (the student's LaTeX working) is saved with the
 * submission in grading_result.explanation but not graded (decision 2026-10-25). The result is saved like a graded solution (lib/submissions.ts), but XP/RP are
 * given only for the first correct answer to a problem, and wrong answers give no XP (guessing is free).
 * The stored answer is never sent to the browser.
 */
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ message: "Please sign in to check answers." }, { status: 401 });
        }
        const userId = session.user.id;

        const limit = checkLimiter.check(`check-answer:${userId}`);
        if (!limit.success) {
            return NextResponse.json(
                { message: "Too many tries in a short time. Take a moment and try again in a few minutes." },
                { status: 429 }
            );
        }

        const { problemId, answer, explanation } = await request.json();
        if (!problemId || typeof answer !== "string" || !answer.trim()) {
            return NextResponse.json({ message: "Enter a number first." }, { status: 400 });
        }
        if (explanation !== undefined && (typeof explanation !== "string" || explanation.length > MAX_EXPLANATION)) {
            return NextResponse.json(
                { message: `The explanation is too long (at most ${MAX_EXPLANATION.toLocaleString("en")} characters).` },
                { status: 400 }
            );
        }

        const given = parseNumber(answer);
        if (!given) {
            return NextResponse.json(
                { message: "Enter a single number, for example 42, -3, 7/64 or 2.5." },
                { status: 400 }
            );
        }

        const { data: solutions, error } = await supabaseAdmin
            .from("solutions")
            .select("content, sequence_order")
            .eq("problem_id", problemId);
        if (error) throw error;

        const expected = storedAnswer(solutions || []);
        if (!expected) {
            return NextResponse.json(
                { message: "This problem has no number answer. Leave the answer box empty and submit your explanation." },
                { status: 422 }
            );
        }

        const isCorrect = sameNumber(given, expected);
        const outcome = await recordSubmission({
            userId,
            problemId,
            submittedAnswer: answer.trim(),
            gradingResult: { mode: "short_answer", isCorrect, explanation: explanation?.trim() || null },
            totalScore: isCorrect ? 1 : 0,
            isCorrect,
            rewardRepeatSolves: false,
            rewardWrongAnswers: false,
        });

        return NextResponse.json({
            isCorrect,
            alreadySolved: outcome.alreadySolved,
            xpEarned: outcome.xpEarned,
        });
    } catch (error) {
        console.error("Check answer error:", error);
        return NextResponse.json({ message: "Something went wrong. Please try again." }, { status: 500 });
    }
}
