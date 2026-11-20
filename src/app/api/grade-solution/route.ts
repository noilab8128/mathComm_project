import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { recordSubmission } from "@/lib/submissions";
import { rateLimit } from "@/lib/rate-limit";
import { supabaseAdmin } from "@/lib/supabase-admin";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Each grading is a paid OpenAI call: signed-in students only, a few per 10 minutes, and a size limit.
const gradeLimiter = rateLimit({ windowMs: 10 * 60 * 1000, maxRequests: 10 });
const MAX_SOLUTION = 20000; // same as the explanation limit of /api/check-answer

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please sign in to submit a solution.' }, { status: 401 });
    }
    if (!gradeLimiter.check(`grade-solution:${session.user.id}`).success) {
      return NextResponse.json(
        { error: 'Too many submissions in a short time. Take a moment and try again in a few minutes.' },
        { status: 429 }
      );
    }

    const { problemId, studentSolution } = await request.json();
    if (typeof problemId !== 'string' || !problemId || typeof studentSolution !== 'string' || !studentSolution.trim()) {
      return NextResponse.json({ error: 'A problem and a solution are required' }, { status: 400 });
    }
    if (studentSolution.length > MAX_SOLUTION) {
      return NextResponse.json(
        { error: `The solution is too long (at most ${MAX_SOLUTION.toLocaleString('en')} characters).` },
        { status: 400 }
      );
    }

    // The problem text comes from the database, not from the browser, so the grader always sees the real problem
    // (a request could otherwise send any text and have it graded against the problem's id).
    const { data: problem, error: problemError } = await supabaseAdmin
      .from('problems').select('content').eq('id', problemId).maybeSingle();
    if (problemError) throw problemError;
    if (!problem?.content) {
      return NextResponse.json({ error: 'Problem not found' }, { status: 404 });
    }
    const problemContent = problem.content;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const systemPrompt = `You are an expert mathematics grader. Your task is to evaluate a student's solution based on five core criteria.
You must be unbiased, consistent, and provide actionable, scaffolded feedback.

### GRADING CRITERIA (0-10 each):
1. **Step-by-Step Accuracy**: Mathematical correctness of each step.
2. **Mathematical Communication**: Clarity and precision of language/notation (using KaTeX).
3. **Logical Reasoning and Structure**: Organizational flow and logical sequence.
4. **Presentation and Precision**: Readability, professional appearance, and concise phrasing.
5. **Justification of Methods**: Explanation of why methods/theorems were chosen.

### ANTI-BIAS PROTOCOLS:
- **No Self-Bias**: Accept any valid mathematical approach, even if unconventional.
- **No Formatting Bias**: Do not favor verbosity. A terse but correct solution should receive full marks for accuracy and reasoning.

### FEEDBACK REQUIREMENTS:
- Provide specific, scaffolded hints (e.g., "Check your expansion" or "Consider using induction").
- Do not reveal the full answer immediately if the student is stuck.
- Tone should be encouraging and pedagogically sound.

### OUTPUT FORMAT:
You MUST return a JSON object with the following structure:
{
  "scores": {
    "accuracy": number,
    "communication": number,
    "logic": number,
    "presentation": number,
    "justification": number
  },
  "totalScore": number,
  "maxScore": 50,
  "feedback": [
    { "criterion": "string", "comment": "string", "hint": "string (optional)" }
  ],
  "overallSummary": "string",
  "isCorrect": boolean
}

Current Problem:
${problemContent}

Student's Solution:
${studentSolution}

Grade the solution now and respond in strict JSON format.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Please grade my solution.' }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000,
      temperature: 0.3, // Lower temperature for more consistent grading
    });

    const resultString = response.choices[0]?.message?.content;

    if (!resultString) {
      return NextResponse.json(
        { error: 'No grading result generated' },
        { status: 500 }
      );
    }

    const gradingResult = JSON.parse(resultString);

    // PERSISTENCE LOGIC (shared with /api/check-answer, see lib/submissions.ts)
    try {
      if (session?.user?.id) {
        await recordSubmission({
          userId: session.user.id,
          problemId,
          submittedAnswer: studentSolution,
          gradingResult,
          totalScore: gradingResult.totalScore,
          isCorrect: gradingResult.isCorrect,
          // XP only for the first correct solution, like the number answers (/api/check-answer): later
          // submissions after "solve again" and wrong attempts are saved but give no XP (decision 2026-11-20).
          rewardRepeatSolves: false,
          rewardWrongAnswers: false,
        });
      }
    } catch (persistError) {
      console.error('[PERSISTENCE ERROR] Error in submission logging flow:', persistError);
    }

    return NextResponse.json({
      success: true,
      gradingResult,
    });

  } catch (error: unknown) {
    const err = error as { message?: string, response?: { data?: unknown } };
    console.error('Grading API Error:', err);
    return NextResponse.json(
      {
        error: err.message || 'Failed to grade solution',
        details: err.response?.data || null,
      },
      { status: 500 }
    );
  }
}
