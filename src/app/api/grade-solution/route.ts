import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Admin client to bypass RLS for logging submissions
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export async function POST(request: NextRequest) {
  try {
    const { problemId, problemContent, studentSolution } = await request.json();

    if (!problemContent || !studentSolution) {
      return NextResponse.json(
        { error: 'Both problem content and student solution are required' },
        { status: 400 }
      );
    }

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

    // PERSISTENCE LOGIC
    try {
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        // Save to database
        const { error: dbError } = await adminSupabase
          .from('user_submissions')
          .insert({
            user_id: session.user.id,
            problem_id: problemId || null,
            submitted_answer: studentSolution,
            grading_result: gradingResult,
            total_score: gradingResult.totalScore,
            is_correct: gradingResult.isCorrect
          });

        if (dbError) {
          console.error('[DATABASE ERROR] Failed to save submission:', dbError);
        } else {
          console.log('[DATABASE SUCCESS] Submission saved for user:', session.user.id);
        }
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
