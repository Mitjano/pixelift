import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Style-specific context for enhancing prompts
const STYLE_CONTEXTS: Record<string, string> = {
  cyberpunk: 'Cyberpunk aesthetic - neon lights, futuristic city, high-tech environment, dark atmosphere with vibrant neon colors',
  fantasy: 'Fantasy world - magical elements, enchanted atmosphere, mystical lighting, fairy tale environment',
  professional: 'Professional corporate setting - modern office, business environment, clean and polished look',
  anime: 'Japanese anime style - vibrant colors, anime aesthetics, Japanese animation elements',
  vintage: '1950s retro aesthetic - classic film look, sepia tones, nostalgic atmosphere, old Hollywood glamour',
  nature: 'Natural outdoor setting - lush greenery, golden hour lighting, serene natural environment',
  beach: 'Tropical beach paradise - ocean, palm trees, sunset colors, summer vacation vibes',
  urban: 'Urban city environment - street photography style, metropolitan backdrop, modern city life',
  artistic: 'Artistic oil painting style - renaissance inspired, dramatic lighting, museum quality art',
  scifi: 'Sci-fi space setting - spaceship interior, futuristic technology, space station, holographic elements',
};

const ENHANCE_SYSTEM_PROMPT = `You are an expert at writing prompts for AI portrait style transfer.
The user wants to transform their portrait photo while PRESERVING THEIR IDENTITY (face stays exactly the same).
Given a simple scene description, expand it into a detailed, vivid prompt for the scene/background/environment.

Rules:
- The face/identity will be preserved automatically by the AI model - focus on describing the SCENE, BACKGROUND, ENVIRONMENT, CLOTHING, and MOOD
- Keep the core idea but add rich details about lighting, atmosphere, clothing/outfit, pose context, background elements
- Be specific about visual elements that DON'T involve changing the person's face features
- Keep it under 300 characters
- Don't add inappropriate or NSFW content
- Write in English (translate if input is in another language)
- Return ONLY the enhanced prompt, no explanations or quotes
- Focus on: environment, lighting, mood, clothing/accessories, background details`;

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
    const { prompt, stylePreset } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (prompt.trim().length < 2) {
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

    const styleContext = STYLE_CONTEXTS[stylePreset] || 'Custom style transformation';

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: ENHANCE_SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Base style: ${styleContext}\n\nUser's additional scene details: "${prompt.trim()}"\n\nEnhance this into a detailed scene description for style transfer (remember: the person's face will stay identical, focus on describing the scene/environment/clothing/mood around them):`
        },
      ],
      max_tokens: 120,
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
    console.error('Enhance style prompt error:', error);
    return NextResponse.json(
      { error: 'Failed to enhance prompt' },
      { status: 500 }
    );
  }
}
