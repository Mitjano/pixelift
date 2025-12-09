import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getToolCost, type ToolType } from '@/lib/credits-config';
import { prisma } from '@/lib/prisma';
import { createUsage } from '@/lib/db';

// MiniMax Speech-02 voice options via Fal.ai
const VOICE_OPTIONS = {
  // English voices
  'en-male-1': { name: 'English Male (Adam)', language: 'en', gender: 'male' },
  'en-male-2': { name: 'English Male (Brian)', language: 'en', gender: 'male' },
  'en-female-1': { name: 'English Female (Emily)', language: 'en', gender: 'female' },
  'en-female-2': { name: 'English Female (Sarah)', language: 'en', gender: 'female' },
  // Polish voices
  'pl-male-1': { name: 'Polish Male (Jan)', language: 'pl', gender: 'male' },
  'pl-female-1': { name: 'Polish Female (Anna)', language: 'pl', gender: 'female' },
  // Spanish voices
  'es-male-1': { name: 'Spanish Male (Carlos)', language: 'es', gender: 'male' },
  'es-female-1': { name: 'Spanish Female (Maria)', language: 'es', gender: 'female' },
  // French voices
  'fr-male-1': { name: 'French Male (Pierre)', language: 'fr', gender: 'male' },
  'fr-female-1': { name: 'French Female (Claire)', language: 'fr', gender: 'female' },
  // German voices
  'de-male-1': { name: 'German Male (Hans)', language: 'de', gender: 'male' },
  'de-female-1': { name: 'German Female (Greta)', language: 'de', gender: 'female' },
};

type VoiceId = keyof typeof VOICE_OPTIONS;

// Speed options
const SPEED_OPTIONS = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];

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
      text,
      voiceId = 'en-female-1',
      speed = 1.0,
    } = body;

    // Validate text
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    if (text.trim().length < 10) {
      return NextResponse.json(
        { error: 'Text too short (min 10 characters)' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    // Validate voice
    if (!VOICE_OPTIONS[voiceId as VoiceId]) {
      return NextResponse.json(
        { error: 'Invalid voice selected' },
        { status: 400 }
      );
    }

    // Validate speed
    if (!SPEED_OPTIONS.includes(speed)) {
      return NextResponse.json(
        { error: 'Invalid speed selected' },
        { status: 400 }
      );
    }

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

    // Calculate credit cost based on text length
    // Base cost: 2 credits, +1 per 1000 characters
    const baseCost = getToolCost('voiceover' as ToolType);
    const additionalCost = Math.floor(text.length / 1000);
    const creditCost = baseCost + additionalCost;

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

    // Call Fal.ai MiniMax Speech-02
    const apiKey = process.env.FAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'TTS service not configured' },
        { status: 500 }
      );
    }

    const voiceConfig = VOICE_OPTIONS[voiceId as VoiceId];

    // Use Fal.ai's MiniMax Speech-02 API
    const response = await fetch('https://fal.run/fal-ai/minimax-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
      },
      body: JSON.stringify({
        text: text.trim(),
        voice_id: voiceId,
        speed: speed,
        language: voiceConfig.language,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fal.ai TTS error:', errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to generate voiceover' },
        { status: 500 }
      );
    }

    const result = await response.json();

    // Deduct credits only after successful generation
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: creditCost } },
    });

    // Log usage
    await createUsage({
      userId: user.id,
      type: 'voiceover',
      creditsUsed: creditCost,
      model: 'minimax-speech-02',
    });

    return NextResponse.json({
      success: true,
      audioUrl: result.audio?.url || result.audio_url,
      duration: result.duration,
      metadata: {
        text: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
        textLength: text.length,
        voiceId,
        voiceName: voiceConfig.name,
        language: voiceConfig.language,
        speed,
        creditsUsed: creditCost,
        remainingCredits: user.credits - creditCost,
      },
    });
  } catch (error) {
    console.error('Voiceover generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate voiceover' },
      { status: 500 }
    );
  }
}

// GET endpoint to return available voices and options
export async function GET() {
  return NextResponse.json({
    voices: Object.entries(VOICE_OPTIONS).map(([id, config]) => ({
      id,
      ...config,
    })),
    speeds: SPEED_OPTIONS.map(s => ({
      value: s,
      label: s === 1.0 ? 'Normal' : `${s}x`,
    })),
    limits: {
      minLength: 10,
      maxLength: 5000,
    },
    pricing: {
      baseCost: 2,
      perThousandChars: 1,
      description: '2 credits + 1 per 1000 characters',
    },
  });
}
