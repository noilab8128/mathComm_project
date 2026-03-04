import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Read the AI problem generation guide
const GUIDE_PATH = path.join(process.cwd(), 'ai_problem_generation_guide.md');
let AI_GUIDE_CONTENT = '';

try {
  AI_GUIDE_CONTENT = fs.readFileSync(GUIDE_PATH, 'utf-8');
} catch (error) {
  console.error('Failed to read AI problem generation guide:', error);
  AI_GUIDE_CONTENT = 'Guide file not found. Generate problems based on best practices.';
}

export async function POST(request: NextRequest) {
  try {
    const { problemContent, solutions, category, difficulty } = await request.json();

    if (!problemContent) {
      return NextResponse.json(
        { error: 'Problem content is required' },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key is not configured' },
        { status: 500 }
      );
    }

    const solutionsText = solutions && solutions.length > 0
      ? solutions.map((s: { title: string, content: string }, i: number) => `Solution Method ${i + 1} (${s.title}):\n${s.content}`).join('\n\n')
      : 'No reference solutions provided.';

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are an expert mathematics educator. You MUST respond with valid JSON only.

PROBLEM GENERATION GUIDE:
${AI_GUIDE_CONTENT}

Based on the guide above, analyze the original problem and its provided solution method(s):
1. Break down the problem into logical stages.
2. If multiple solution methods are provided, analyze each one and identify the prerequisite concepts and skills required for EVERY method.
3. Generate a comprehensive set of foundational sub-problems that cover the logic of all provided solution approaches.
4. The sub-problems should span difficulty levels starting from 1 up to the difficulty of the original problem (${difficulty || 5}).
5. For each difficulty level (1 to ${difficulty || 5}), you may generate multiple problems if there are different concepts or skills from different solution paths to address.
6. Do not feel limited to a small number of problems; provide as many as needed to build a solid foundation across all identified methods.
7. Each sub-problem must have a clear "stage", "concept", and "difficulty" (1-10).

CRITICAL: Respond ONLY with valid JSON in this exact format:
{
  "stages": ["Stage 1: Description", "Stage 2: Description", ...],
  "relatedProblems": [
    {
      "title": "Short problem title",
      "content": "Problem with KaTeX formulas using \\\\\\\\( \\\\\\\\) or \\\\\\\\[ \\\\\\\\]",
      "solution": "Step-by-step solution with KaTeX",
      "difficulty": 1-10,
      "category": "Algebra",
      "stage": "Stage 1: Description",
      "concept": "Which concept this teaches",
      "explanation": "Why this is foundational for this stage"
    }
  ]
}

Use double backslashes in JSON: \\\\\\\\( x^2 \\\\\\\\) for inline, \\\\\\\\[ ... \\\\\\\\] for display.`,
        },
        {
          role: 'user',
          content: `Original Problem (Difficulty: ${difficulty || 5}, Category: ${category || 'Math'}):
${problemContent}

Reference Solution(s):
${solutionsText}

Analyze this problem and all provided solution methods. Generate a comprehensive sequence of sub-problems (from difficulty level 1 up to ${difficulty || 5}) that cover all prerequisite concepts for all approaches. Respond with ONLY valid JSON.`,
        },
      ],
      max_tokens: 4000,
      temperature: 0.5,
      response_format: { type: "json_object" },
    });

    const aiResponse = response.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    console.log('Related Problems - Raw AI Response:', aiResponse);

    // JSON 파싱
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      console.error('Related Problems - JSON Parse Error:', e);
      console.error('Failed to parse:', aiResponse);

      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response. Check server console for details.',
        rawResponse: aiResponse,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: parsedResponse,
    });

  } catch (error: unknown) {
    const err = error as { message?: string, response?: { data?: unknown } };
    console.error('OpenAI API Error:', err);
    return NextResponse.json(
      {
        error: err.message || 'Failed to generate related problems',
        details: err.response?.data || null,
      },
      { status: 500 }
    );
  }
}

