import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getToolCost, type ToolType } from '@/lib/credits-config';
import { prisma } from '@/lib/prisma';
import { createUsage } from '@/lib/db';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Video types with specific guidelines
const VIDEO_TYPES = {
  'tiktok': {
    name: 'TikTok/Reels',
    duration: '15-60 seconds',
    style: 'Fast-paced, hook in first 3 seconds, trendy, engaging, vertical format',
    structure: 'Hook → Problem/Setup → Solution/Content → CTA',
  },
  'youtube-short': {
    name: 'YouTube Short',
    duration: '30-60 seconds',
    style: 'Informative or entertaining, strong hook, vertical format',
    structure: 'Hook → Main content → Surprise/Punchline → Subscribe CTA',
  },
  'youtube-long': {
    name: 'YouTube Video',
    duration: '8-15 minutes',
    style: 'In-depth, well-structured, engaging throughout',
    structure: 'Hook → Intro → Main sections → Summary → CTA',
  },
  'product-demo': {
    name: 'Product Demo',
    duration: '1-3 minutes',
    style: 'Professional, benefit-focused, clear demonstration',
    structure: 'Problem → Solution intro → Feature showcase → Benefits → CTA',
  },
  'explainer': {
    name: 'Explainer Video',
    duration: '2-5 minutes',
    style: 'Educational, clear, step-by-step',
    structure: 'Introduction → Problem → Solution steps → Summary → Next steps',
  },
  'ad': {
    name: 'Advertisement',
    duration: '15-30 seconds',
    style: 'Attention-grabbing, emotional, memorable, clear message',
    structure: 'Attention → Interest → Desire → Action',
  },
  'tutorial': {
    name: 'Tutorial/How-to',
    duration: '5-15 minutes',
    style: 'Clear instructions, visual cues, beginner-friendly',
    structure: 'Intro → Requirements → Step-by-step → Tips → Conclusion',
  },
  'vlog': {
    name: 'Vlog/Personal',
    duration: '5-10 minutes',
    style: 'Authentic, personal, storytelling',
    structure: 'Intro → Story/Experience → Reflections → Outro',
  },
};

type VideoType = keyof typeof VIDEO_TYPES;

const SCRIPT_SYSTEM_PROMPT = `You are an expert video scriptwriter who creates engaging, professional scripts for various video formats.

Your scripts should:
1. Be well-structured with clear sections
2. Include visual directions in [brackets]
3. Include timing suggestions
4. Be engaging and hold viewer attention
5. Match the specified video type and tone
6. Include hooks that grab attention immediately

Format your response as a structured script with:
- HOOK: The opening line/scene (crucial for engagement)
- SCENES: Numbered scenes with dialogue/narration and [visual directions]
- CTA: Call to action at the end
- ESTIMATED DURATION: Total estimated time

Always write in the language specified by the user or detected from their input.`;

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
    const {
      topic,
      videoType = 'tiktok',
      tone = 'engaging',
      targetAudience = 'general',
      additionalNotes = '',
      language = 'en'
    } = body;

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (topic.trim().length < 3) {
      return NextResponse.json(
        { error: 'Topic too short (min 3 characters)' },
        { status: 400 }
      );
    }

    if (topic.length > 500) {
      return NextResponse.json(
        { error: 'Topic too long (max 500 characters)' },
        { status: 400 }
      );
    }

    const videoConfig = VIDEO_TYPES[videoType as VideoType] || VIDEO_TYPES['tiktok'];

    // Get user and check credits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, credits: true, name: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const creditCost = getToolCost('video_script' as ToolType);

    // Check credits
    if (user.credits < creditCost) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: creditCost,
          available: user.credits,
        },
        { status: 402 }
      );
    }

    // Deduct credits
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: creditCost } },
    });

    const userPrompt = `Create a ${videoConfig.name} script about: "${topic}"

Video Details:
- Type: ${videoConfig.name}
- Target Duration: ${videoConfig.duration}
- Style: ${videoConfig.style}
- Structure: ${videoConfig.structure}
- Tone: ${tone}
- Target Audience: ${targetAudience}
- Language: ${language === 'en' ? 'English' : language === 'pl' ? 'Polish' : language === 'es' ? 'Spanish' : language === 'fr' ? 'French' : 'English'}
${additionalNotes ? `\nAdditional notes: ${additionalNotes}` : ''}

Please create a complete, ready-to-use script following the structure above.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SCRIPT_SYSTEM_PROMPT },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.8,
    });

    const script = completion.choices[0]?.message?.content?.trim();

    if (!script) {
      // Refund credit if generation failed
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { increment: creditCost } },
      });

      return NextResponse.json(
        { error: 'Failed to generate script' },
        { status: 500 }
      );
    }

    // Log usage
    await createUsage({
      userId: user.id,
      type: 'video_script',
      creditsUsed: creditCost,
      model: 'gpt-4o-mini',
    });

    return NextResponse.json({
      success: true,
      script,
      metadata: {
        topic,
        videoType,
        videoTypeName: videoConfig.name,
        duration: videoConfig.duration,
        tone,
        targetAudience,
        language,
        creditsUsed: creditCost,
        remainingCredits: user.credits - creditCost,
      },
    });
  } catch (error) {
    console.error('Script generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
}

// GET endpoint to return available video types
export async function GET() {
  return NextResponse.json({
    videoTypes: Object.entries(VIDEO_TYPES).map(([key, value]) => ({
      id: key,
      ...value,
    })),
    tones: ['engaging', 'professional', 'casual', 'humorous', 'inspirational', 'educational', 'dramatic'],
    audiences: ['general', 'young adults', 'professionals', 'students', 'parents', 'tech enthusiasts', 'beginners'],
  });
}
