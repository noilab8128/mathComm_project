import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화 (서버 사이드에서만 실행)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, imagesBase64, action } = await request.json();
    const images = imagesBase64 || (imageBase64 ? [imageBase64] : []);
    console.log(`Action: ${action}, Images count: ${images.length}`);

    if (images.length === 0) {
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

    const keyPrefix = process.env.OPENAI_API_KEY.substring(0, 7);
    console.log('OpenAI API Key configured:', keyPrefix + '...');

    // action에 따라 다른 프롬프트 사용
    let systemPrompt = '';
    let userPrompt = '';

    if (action === 'analyze') {
      systemPrompt = `You are an expert mathematics problem analyzer. You MUST respond with valid JSON only.

Extract from the image(s):
1. Problem statement text with KaTeX syntax.
2. Diagrams/graphs description if present.
3. Solution(s) if present. If multiple distinct solving methods exist, list them all.
4. Difficulty (1-10).
5. Specific category following the hierarchy: Level 1 > Level 2 > Level 3.

CRITICAL: Respond ONLY with valid JSON:
{
  "title": "Brief descriptive title",
  "content": "Full problem with KaTeX",
  "solutions": [
    {"title": "Method 1: ...", "content": "..."}
  ],
  "difficulty": 5,
  "category": "Level 1 > Level 2 > Level 3",
  "concepts": ["concept1", "concept2"]
}`;

      userPrompt = 'Analyze this math problem. Extract all details. If there are multiple solutions, extract each one separately. Respond with ONLY valid JSON.';
    } else if (action === 'extract-solution') {
      systemPrompt = `You are an expert mathematics solution analyzer. You MUST respond with valid JSON only.
Based on the image(s) provided, extract the full step-by-step solution(s). 
If the images contain multiple distinct solutions or methods, extract each as a separate entry in the 'solutions' array.

CRITICAL: Respond ONLY with valid JSON:
{
  "solutions": [
    {
      "title": "Solution 1: [Descriptive title]",
      "content": "Full detailed solution using KaTeX syntax",
      "explanation": "Brief summary of the method"
    }
  ]
}`;

      userPrompt = 'Extract all solutions from these image(s). If multiple methods are shown, separate them. Respond with ONLY valid JSON.';
    }

    // OpenAI Vision API 호출
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
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
            ...images.map((img: string) => ({
              type: 'image_url',
              image_url: {
                url: img,
              },
            })),
          ],
        },
      ],
      max_tokens: 3000,
      temperature: 0.3,
      response_format: { type: "json_object" },
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

      // 데이터 정규화 및 하위 호환성 유지
      if (parsedResponse.solutions && Array.isArray(parsedResponse.solutions) && parsedResponse.solutions.length > 0) {
        // 첫 번째 솔루션을 기본 solution 필드에 설정
        if (!parsedResponse.solution) {
          parsedResponse.solution = parsedResponse.solutions[0].content;
        }
      } else if (parsedResponse.solution && !parsedResponse.solutions) {
        // 단일 solution만 온 경우 배열로 변환
        parsedResponse.solutions = [
          { title: 'Standard Solution', content: parsedResponse.solution }
        ];
      }
    } catch (e) {
      console.error('JSON Parse Error:', e);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response as JSON.',
        rawResponse: aiResponse,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: parsedResponse,
    });

  } catch (error: any) {
    console.error('OpenAI API Error:', error);

    // Check for OpenAI specific errors
    if (error.status === 413 || error.code === 'payload_too_large') {
      return NextResponse.json(
        { error: 'The image file is too large for the AI to process. Please try a smaller image.' },
        { status: 413 }
      );
    }

    return NextResponse.json(
      {
        error: error.message || 'Failed to analyze problem',
        status: error.status,
        code: error.code,
        details: error.response?.data || error.error || null,
      },
      { status: error.status || 500 }
    );
  }
}

