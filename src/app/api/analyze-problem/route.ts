import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// OpenAI 클라이언트 초기화 (서버 사이드에서만 실행)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { imageBase64, imagesBase64, action, context } = await request.json();
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
3. ALL Solution(s) present. If multiple distinct solving methods, alternative solutions, or step-by-step variations exist in the text/images, you MUST extract EACH ONE separately.
4. Difficulty (1-10).
5. Specific category following the hierarchy: Level 1 > Level 2 > Level 3.

CRITICAL: If the input contains multiple solving methods (e.g., "Method 1", "Method 2", "Alternative Solution"), create a separate object in the "solutions" array for each.

CRITICAL: Respond ONLY with valid JSON:
{
  "title": "Brief descriptive title",
  "content": "Full problem with KaTeX",
  "solutions": [
    {"title": "Method 1: ...", "content": "..."},
    {"title": "Alternative Method: ...", "content": "..."}
  ],
  "difficulty": 5,
  "category": "Level 1 > Level 2 > Level 3",
  "concepts": ["concept1", "concept2"]
}
CRITICAL: Do NOT wrap the JSON in markdown code blocks like \` \` \`json. Respond with the raw JSON string only. No preamble or postscript.`;

      userPrompt = 'Analyze this math problem. Extract all details. If there are multiple solutions, extract each one separately. Respond with ONLY valid JSON.';
    } else if (action === 'bulk-analyze') {
      const { problemPages, solutionPages, questionIndices } = context || {};
      systemPrompt = `You are an expert mathematics educator and problem extractor. You MUST respond with valid JSON only.

Based on the provided image(s), identify and extract math problems.
${problemPages ? `IMPORTANT: Focus ONLY on problems from pages: ${problemPages}` : ""}
${solutionPages ? `IMPORTANT: Look for solutions on pages: ${solutionPages}` : ""}
${questionIndices ? `VERY IMPORTANT: Extract ONLY question numbers: ${questionIndices}` : "Extract all visible problems."}

For each problem, you must extract ALL corresponding solutions if present. 
CRITICAL: Many problems have multiple distinct solutions (e.g., "Solution 1", "Solution 2", "Alternative Way"). You MUST identify and extract EACH distinct solution separately into the "solutions" array.

CRITICAL: Respond ONLY with valid JSON in this format:
{
  "problems": [
    {
      "title": "Descriptive title for problem 1",
      "content": "Full problem 1 content with KaTeX",
      "solutions": [
        {"title": "Method 1: [Descriptive title]", "content": "Full solution 1 content with KaTeX"},
        {"title": "Method 2: [Descriptive title]", "content": "Full solution 2 content with KaTeX"}
      ],
      "difficulty": 1-10,
      "category": "Level 1 > Level 2 > Level 3"
    },
    ...
  ]
}
CRITICAL: Do NOT wrap the JSON in markdown code blocks. Respond with ONLY the raw JSON object. No preamble, no explanation, no markdown tags.`;

      userPrompt = `Extract ${questionIndices ? `questions ${questionIndices}` : "all problems"} and their solutions from these images. Organize them into the specified JSON format. Respond with ONLY valid JSON.`;
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
      max_tokens: 16384,
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

    // JSON 파싱 전 전처리: 마크다운 코드 블록(```json ... ```) 제거
    let cleanJson = aiResponse.trim();
    if (cleanJson.startsWith('```')) {
      const match = cleanJson.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        cleanJson = match[1].trim();
      }
    }

    // JSON 파싱
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(cleanJson);

      // 데이터 정규화 및 하위 호환성 유지
      const normalizeProblem = (p: any) => {
        if (p.solutions && Array.isArray(p.solutions) && p.solutions.length > 0) {
          if (!p.solution) {
            p.solution = p.solutions[0].content;
          }
        } else if (p.solution && (!p.solutions || p.solutions.length === 0)) {
          p.solutions = [
            { title: 'Standard Solution', content: p.solution }
          ];
        }
        return p;
      };

      if (action === 'bulk-analyze' && parsedResponse.problems && Array.isArray(parsedResponse.problems)) {
        parsedResponse.problems = parsedResponse.problems.map(normalizeProblem);
      } else {
        parsedResponse = normalizeProblem(parsedResponse);
      }
    } catch (e) {
      console.error('JSON Parse Error:', e);
      return NextResponse.json({
        success: false,
        error: 'Failed to parse AI response as JSON.',
        rawResponse: aiResponse,
        cleanJsonAttempt: cleanJson,
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

