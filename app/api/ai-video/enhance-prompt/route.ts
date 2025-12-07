import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ENHANCE_SYSTEM_PROMPT = `You are an expert at writing prompts for AI video generation.
Given a simple description, expand it into a detailed, vivid prompt that will produce stunning videos.

Rules:
- Keep the core idea but add rich details about camera movement, lighting, atmosphere, mood
- Be specific about visual elements (textures, materials, colors, environment)
- Add cinematic descriptions (camera angles, motion, transitions)
- Keep it under 500 characters
- Don't add inappropriate or NSFW content
- Write in English (translate if input is in another language)
- Return ONLY the enhanced prompt, no explanations or quotes

Examples of good video prompts:
- "A golden retriever running through autumn leaves in slow motion, warm sunlight filtering through trees, shallow depth of field, cinematic 4K"
- "Drone shot slowly rising over misty mountains at sunrise, orange and pink clouds, peaceful atmosphere, smooth camera movement"`;

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { prompt } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Prompt too short' },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: 'Prompt too long (max 500 characters)' },
        { status: 400 }
      );
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ENHANCE_SYSTEM_PROMPT },
        { role: 'user', content: `Original prompt: "${prompt.trim()}"` },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const enhancedPrompt = completion.choices[0]?.message?.content?.trim();

    if (!enhancedPrompt) {
      return NextResponse.json(
        { error: 'Failed to enhance prompt' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      original: prompt.trim(),
      enhanced: enhancedPrompt,
    });
  } catch (error) {
    console.error('Enhance video prompt error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance prompt' },
      { status: 500 }
    );
  }
}
