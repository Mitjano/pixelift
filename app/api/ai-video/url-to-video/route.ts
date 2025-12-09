import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getToolCost, type ToolType } from '@/lib/credits-config';
import { prisma } from '@/lib/prisma';
import { createUsage } from '@/lib/db';

// Video style options
const VIDEO_STYLES = [
  { id: 'professional', name: 'Professional', description: 'Clean, corporate style' },
  { id: 'casual', name: 'Casual', description: 'Relaxed, friendly tone' },
  { id: 'educational', name: 'Educational', description: 'Tutorial-style presentation' },
  { id: 'news', name: 'News Style', description: 'News report format' },
];

// Duration options
const DURATION_OPTIONS = [
  { id: 'short', name: 'Short (1-2 min)', minutes: 2 },
  { id: 'medium', name: 'Medium (3-5 min)', minutes: 5 },
  { id: 'long', name: 'Long (5-10 min)', minutes: 10 },
];

// Voice options
const VOICE_OPTIONS = [
  { id: 'en-male-1', name: 'English Male (Adam)', language: 'en' },
  { id: 'en-female-1', name: 'English Female (Emily)', language: 'en' },
  { id: 'pl-male-1', name: 'Polish Male (Jan)', language: 'pl' },
  { id: 'pl-female-1', name: 'Polish Female (Anna)', language: 'pl' },
  { id: 'es-male-1', name: 'Spanish Male (Carlos)', language: 'es' },
  { id: 'es-female-1', name: 'Spanish Female (Maria)', language: 'es' },
  { id: 'fr-male-1', name: 'French Male (Pierre)', language: 'fr' },
  { id: 'fr-female-1', name: 'French Female (Claire)', language: 'fr' },
];

// Helper: Extract content from URL using simple fetch
async function extractContentFromUrl(url: string): Promise<{ title: string; content: string; images: string[] }> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PixeliftBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch URL');
    }

    const html = await response.text();

    // Simple extraction - in production you'd want a proper parser
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';

    // Extract text content from article/main tags, or body
    let content = '';
    const articleMatch = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
    const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);

    const rawContent = articleMatch?.[1] || mainMatch?.[1] || html;

    // Strip HTML tags and get text
    content = rawContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 10000); // Limit content length

    // Extract images
    const imageMatches = html.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi);
    const images: string[] = [];
    for (const match of imageMatches) {
      if (images.length >= 10) break;
      const imgUrl = match[1];
      if (imgUrl && !imgUrl.includes('data:') && !imgUrl.includes('svg')) {
        // Make absolute URL
        try {
          const absoluteUrl = new URL(imgUrl, url).href;
          images.push(absoluteUrl);
        } catch {
          // Skip invalid URLs
        }
      }
    }

    return { title, content, images };
  } catch (error) {
    console.error('Content extraction error:', error);
    throw new Error('Failed to extract content from URL');
  }
}

// Helper: Generate script from content using OpenAI
async function generateScriptFromContent(
  content: string,
  title: string,
  style: string,
  durationMinutes: number
): Promise<string> {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) {
    throw new Error('OpenAI not configured');
  }

  const wordsPerMinute = 150; // Average speaking rate
  const targetWords = durationMinutes * wordsPerMinute;

  const styleGuides: Record<string, string> = {
    professional: 'Use formal language, clear structure, and business-appropriate tone.',
    casual: 'Use conversational language, friendly tone, and relatable examples.',
    educational: 'Break down concepts clearly, use simple explanations, include learning objectives.',
    news: 'Use journalistic style, lead with key facts, maintain objectivity.',
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${openaiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a professional video script writer. Create engaging video scripts that are perfect for voiceover narration.

${styleGuides[style] || styleGuides.professional}

Guidelines:
- Write approximately ${targetWords} words (${durationMinutes} minutes of speech)
- Structure with clear intro, body, and conclusion
- Use short sentences for easy narration
- Include natural pauses [PAUSE] where appropriate
- Suggest visual cues in [VISUAL: description] brackets
- Keep the audience engaged throughout`,
        },
        {
          role: 'user',
          content: `Create a ${durationMinutes}-minute video script based on this article:

Title: ${title}

Content:
${content.substring(0, 6000)}

Write an engaging script that covers the key points. Include visual suggestions and natural pauses.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate script');
  }

  const result = await response.json();
  return result.choices[0].message.content;
}

// Store jobs in memory (in production, use Redis or database)
const jobStore = new Map<string, {
  status: string;
  progress: number;
  result?: {
    scriptUrl?: string;
    videoUrl?: string;
    audioUrl?: string;
  };
  error?: string;
}>();

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
      url,
      style = 'professional',
      voiceId = 'en-female-1',
      duration = 'medium',
      includeCaptions = true,
      includeBackgroundMusic = true,
    } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Validate style
    if (!VIDEO_STYLES.find(s => s.id === style)) {
      return NextResponse.json(
        { error: 'Invalid video style' },
        { status: 400 }
      );
    }

    // Get duration config
    const durationConfig = DURATION_OPTIONS.find(d => d.id === duration);
    if (!durationConfig) {
      return NextResponse.json(
        { error: 'Invalid duration' },
        { status: 400 }
      );
    }

    // Get user and check credits
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, credits: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Calculate credit cost: base + duration multiplier
    const baseCost = getToolCost('url_to_video' as ToolType);
    const durationMultiplier = Math.ceil(durationConfig.minutes / 2); // +10 per 2 min
    const creditCost = baseCost + (durationMultiplier - 1) * 10;

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

    // Check API keys
    const falApiKey = process.env.FAL_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!falApiKey || !openaiKey) {
      return NextResponse.json(
        { error: 'Service not fully configured' },
        { status: 500 }
      );
    }

    // Generate job ID
    const jobId = `utv_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // Initialize job
    jobStore.set(jobId, {
      status: 'extracting',
      progress: 10,
    });

    // Deduct credits immediately
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: creditCost } },
    });

    await createUsage({
      userId: user.id,
      type: 'url_to_video',
      creditsUsed: creditCost,
      model: 'url-to-video-pipeline',
    });

    // Start async processing
    processUrlToVideo(jobId, {
      url,
      style,
      voiceId,
      durationMinutes: durationConfig.minutes,
      includeCaptions,
      includeBackgroundMusic,
      falApiKey,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      status: 'processing',
      jobId,
      message: 'Video generation started',
      metadata: {
        url,
        style,
        voiceId,
        duration,
        includeCaptions,
        includeBackgroundMusic,
        creditsUsed: creditCost,
        remainingCredits: user.credits - creditCost,
      },
    });
  } catch (error) {
    console.error('URL to video error:', error);
    return NextResponse.json(
      { error: 'Failed to start video generation' },
      { status: 500 }
    );
  }
}

// Async processing function
async function processUrlToVideo(
  jobId: string,
  params: {
    url: string;
    style: string;
    voiceId: string;
    durationMinutes: number;
    includeCaptions: boolean;
    includeBackgroundMusic: boolean;
    falApiKey: string;
  }
) {
  try {
    // Step 1: Extract content
    jobStore.set(jobId, { status: 'extracting', progress: 20 });
    const { title, content, images } = await extractContentFromUrl(params.url);

    if (content.length < 200) {
      jobStore.set(jobId, { status: 'failed', progress: 0, error: 'Content too short' });
      return;
    }

    // Step 2: Generate script
    jobStore.set(jobId, { status: 'scripting', progress: 40 });
    const script = await generateScriptFromContent(
      content,
      title,
      params.style,
      params.durationMinutes
    );

    // Clean script for TTS (remove visual cues)
    const ttsScript = script
      .replace(/\[VISUAL:[^\]]+\]/g, '')
      .replace(/\[PAUSE\]/g, '...')
      .trim();

    // Step 3: Generate voiceover
    jobStore.set(jobId, { status: 'voiceover', progress: 60 });
    const ttsResponse = await fetch('https://fal.run/fal-ai/minimax-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${params.falApiKey}`,
      },
      body: JSON.stringify({
        text: ttsScript.substring(0, 5000), // Limit for API
        voice_id: params.voiceId,
        speed: 1.0,
      }),
    });

    if (!ttsResponse.ok) {
      throw new Error('Failed to generate voiceover');
    }

    const ttsResult = await ttsResponse.json();
    const audioUrl = ttsResult.audio?.url || ttsResult.audio_url;

    // Step 4: For now, return script and audio
    // In production, you'd use a video generation API to combine visuals, audio, captions
    jobStore.set(jobId, {
      status: 'completed',
      progress: 100,
      result: {
        audioUrl,
        scriptUrl: `data:text/plain;base64,${Buffer.from(script).toString('base64')}`,
        // videoUrl would come from video generation API
      },
    });
  } catch (error) {
    console.error('Processing error:', error);
    jobStore.set(jobId, {
      status: 'failed',
      progress: 0,
      error: error instanceof Error ? error.message : 'Processing failed',
    });
  }
}

// GET endpoint for status and options
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    // Return available options
    return NextResponse.json({
      styles: VIDEO_STYLES,
      voices: VOICE_OPTIONS,
      durations: DURATION_OPTIONS,
      pricing: {
        baseCost: 20,
        perDurationTier: 10,
        description: '20 credits base + 10 per 2 minutes',
      },
    });
  }

  // Check job status
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  const job = jobStore.get(jobId);
  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    status: job.status,
    progress: job.progress,
    result: job.result,
    error: job.error,
  });
}
