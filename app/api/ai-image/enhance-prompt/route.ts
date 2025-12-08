import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ENHANCE_SYSTEM_PROMPT = `You are an expert at enhancing prompts for AI image generation.
Your task is to ENHANCE the user's prompt while strictly preserving their original subject and intent.

CRITICAL RULES:
1. PRESERVE THE EXACT SUBJECT - If user says "dog" keep it as dog, if "cat" keep cat. NEVER change the main subject.
2. Language handling: If input is in Polish/other language, first understand what it means, then translate to English correctly:
   - Polish "pies" = English "dog" (NOT pie/pastry!)
   - Polish "kot" = English "cat"
   - Polish "księżyc" = English "moon"
   - Polish "słońce" = English "sun"
   - Polish "kobieta" = English "woman"
   - Polish "mężczyzna" = English "man"
3. Only ADD visual details (lighting, composition, style, mood, colors) - never change the core concept
4. The enhanced prompt should be a DIRECT EXTENSION of what user wrote, not a new idea
5. Keep it under 400 characters
6. Don't add inappropriate or NSFW content
7. Return ONLY the enhanced prompt, no explanations

GOOD Enhancement examples:
- Input: "pies na księżycu" → "A dog standing on the moon's surface, Earth visible in the background, dramatic lighting, space atmosphere, highly detailed, 8K"
- Input: "kot śpiący" → "A cat sleeping peacefully on a soft blanket, warm afternoon sunlight, cozy atmosphere, shallow depth of field, photorealistic"
- Input: "samochód w deszczu" → "A car on a wet city street during heavy rain at night, neon reflections on wet pavement, moody cinematic atmosphere"

BAD Enhancement (DON'T DO THIS):
- Input: "pies na plaży" → "Whimsical pies floating on beach" ❌ (changed subject!)
- Input: "portret kobiety" → "A serene landscape with mountains" ❌ (completely different!)`;

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
    const { prompt, mode } = body;

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

    const modeContext = mode === 'image-to-image'
      ? 'This prompt will be used to transform/edit an existing image.'
      : 'This prompt will be used to generate a new image from scratch.';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ENHANCE_SYSTEM_PROMPT },
        { role: 'user', content: `${modeContext}\n\nOriginal prompt: "${prompt.trim()}"` },
      ],
      max_tokens: 150,
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
    console.error('Enhance prompt error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance prompt' },
      { status: 500 }
    );
  }
}
