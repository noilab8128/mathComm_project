import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화 (서버 사이드에서만 실행)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, action } = await request.json();

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      );
    }

    // API 키 확인
    if (!process.env.OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not set in environment variables');
      return NextResponse.json(
        {
          error: 'OpenAI API key is not configured',
          hint: 'Please create .env.local file with OPENAI_API_KEY=your-key and restart the server'
        },
        { status: 500 }
      );
    }

    console.log('OpenAI API Key configured:', process.env.OPENAI_API_KEY.substring(0, 7) + '...');

    // action에 따라 다른 프롬프트 사용
    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'analyze') {
      systemPrompt = `You are an expert mathematics problem analyzer. You MUST respond with valid JSON only.

Extract from the image:
1. Problem statement text with KaTeX syntax. (Critical: Ensure all mathematical symbols are correctly converted to KaTeX)
2. Diagrams/graphs description if present.
3. Solution if present.
4. Difficulty (1-10): 1-3=Easy, 4-6=Medium, 7-9=Hard, 10=Olympic.
5. Specific category following the hierarchy: Level 1 > Level 2 > Level 3.

CRITICAL: Respond ONLY with valid JSON:
{
  "title": "Brief descriptive title (5-10 words)",
  "content": "Full problem with KaTeX: \\\\( inline \\\\) or \\\\[ display \\\\]",
  "solution": "Detailed solution if present, otherwise empty string",
  "difficulty": 5,
  "category": "Level 1 > Level 2 > Level 3",
  "categoryLevel1": "Level 1",
  "categoryLevel2": "Level 2",
  "categoryLevel3": "Level 3",
  "hasDiagrams": true|false,
  "concepts": ["concept1", "concept2"]
}`;

      userPrompt = 'Analyze this math problem. Extract all details including formulas and diagrams. Respond with ONLY valid JSON.';
    } else if (action === 'extract-solution') {
      systemPrompt = `You are an expert mathematics solution analyzer. You MUST respond with valid JSON only.
Based on the image provided, extract the full step-by-step solution.

CRITICAL: Respond ONLY with valid JSON:
{
  "solution": "The full detailed solution using KaTeX syntax for all formulas: \\\\( inline \\\\) or \\\\[ display \\\\]",
  "explanation": "Brief summary of the solving method used"
}`;

      userPrompt = 'Extract the complete solution from this image. Focus on mathematical accuracy and formatting formulas with KaTeX. Respond with ONLY valid JSON.';
    } else if (action === 'generate-related') {
      systemPrompt = `You are an expert mathematics problem generator. Based on the given problem, create related problems that focus on the underlying mathematical concepts.

Respond in JSON format with:
{
  "relatedProblems": [
    {
      "title": "Problem title",
      "content": "Problem with KaTeX formulas",
      "solution": "Solution with KaTeX formulas",
      "difficulty": 1-10,
      "category": "Category",
      "concept": "Core concept this problem teaches"
    }
  ]
}`;

      userPrompt = 'Generate 2-3 related problems that teach the fundamental concepts needed to solve this problem.';
    }

    // OpenAI Vision API 호출
    const response = await openai.chat.completions.create({
      model: 'gpt-4o', // GPT-4 Vision model
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageBase64,
              },
            },
          ],
        },
      ],
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: "json_object" }, // Force JSON response
    });

    const aiResponse = response.choices[0]?.message?.content;

    if (!aiResponse) {
      return NextResponse.json(
        { error: 'No response from AI' },
        { status: 500 }
      );
    }

    console.log('Raw AI Response:', aiResponse);

    // JSON 파싱
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      // JSON 파싱 실패 시 텍스트 응답 반환
      console.error('JSON Parse Error:', e);
      console.error('Failed to parse:', aiResponse);

      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response as JSON. The AI may have returned text instead of JSON.',
        rawResponse: aiResponse,
        hint: 'This usually happens if the model did not use json_object mode. Check if you are using a compatible model.',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: parsedResponse,
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to analyze problem',
        details: error.response?.data || null,
      },
      { status: 500 }
    );
  }
}

