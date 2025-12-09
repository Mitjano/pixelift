import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getToolCost, type ToolType } from '@/lib/credits-config';
import { prisma } from '@/lib/prisma';
import { createUsage } from '@/lib/db';

// Fal.ai Hedra (Talking Avatar) API
const FAL_AVATAR_ENDPOINT = 'https://queue.fal.run/fal-ai/hedra';

// Available avatar styles
const AVATAR_STYLES = [
  { id: 'realistic', name: 'Realistic', description: 'Photorealistic avatar' },
  { id: 'cartoon', name: 'Cartoon', description: 'Animated cartoon style' },
  { id: 'anime', name: 'Anime', description: 'Japanese anime style' },
  { id: 'professional', name: 'Professional', description: 'Business presenter' },
];

// Available voice options (using MiniMax Speech)
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

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Handle multipart form data or JSON
    const contentType = request.headers.get('content-type') || '';
    let text: string | undefined;
    let audioUrl: string | undefined;
    let audioFile: File | undefined;
    let imageUrl: string | undefined;
    let imageFile: File | undefined;
    let voiceId = 'en-female-1';
    let aspectRatio = '16:9';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      text = formData.get('text') as string | undefined;
      audioUrl = formData.get('audioUrl') as string | undefined;
      audioFile = formData.get('audioFile') as File | undefined;
      imageUrl = formData.get('imageUrl') as string | undefined;
      imageFile = formData.get('imageFile') as File | undefined;
      voiceId = (formData.get('voiceId') as string) || 'en-female-1';
      aspectRatio = (formData.get('aspectRatio') as string) || '16:9';
    } else {
      const body = await request.json();
      text = body.text;
      audioUrl = body.audioUrl;
      imageUrl = body.imageUrl;
      voiceId = body.voiceId || 'en-female-1';
      aspectRatio = body.aspectRatio || '16:9';
    }

    // Validate: need either text (to generate speech) or audio
    if (!text && !audioUrl && !audioFile) {
      return NextResponse.json(
        { error: 'Either text or audio is required' },
        { status: 400 }
      );
    }

    // Validate text length if provided
    if (text && text.trim().length < 10) {
      return NextResponse.json(
        { error: 'Text too short (min 10 characters)' },
        { status: 400 }
      );
    }

    if (text && text.length > 3000) {
      return NextResponse.json(
        { error: 'Text too long (max 3000 characters)' },
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

    const creditCost = getToolCost('talking_avatar' as ToolType);

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

    // API key check
    const apiKey = process.env.FAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Avatar service not configured' },
        { status: 500 }
      );
    }

    // Step 1: If text provided, generate audio first using MiniMax Speech
    let finalAudioUrl = audioUrl;

    if (text && !audioUrl && !audioFile) {
      const ttsResponse = await fetch('https://fal.run/fal-ai/minimax-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${apiKey}`,
        },
        body: JSON.stringify({
          text: text.trim(),
          voice_id: voiceId,
          speed: 1.0,
        }),
      });

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.json().catch(() => ({}));
        console.error('TTS error:', errorData);
        return NextResponse.json(
          { error: 'Failed to generate speech' },
          { status: 500 }
        );
      }

      const ttsResult = await ttsResponse.json();
      finalAudioUrl = ttsResult.audio?.url || ttsResult.audio_url;
    }

    // Step 2: If audio file provided, upload to Fal storage
    if (audioFile && !finalAudioUrl) {
      const audioFormData = new FormData();
      audioFormData.append('file', audioFile);

      const uploadResponse = await fetch('https://fal.run/fal-ai/storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
        },
        body: audioFormData,
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        finalAudioUrl = uploadResult.url;
      }
    }

    if (!finalAudioUrl) {
      return NextResponse.json(
        { error: 'Failed to prepare audio' },
        { status: 500 }
      );
    }

    // Step 3: Prepare image (if provided)
    let finalImageUrl = imageUrl;

    if (imageFile && !finalImageUrl) {
      const imageFormData = new FormData();
      imageFormData.append('file', imageFile);

      const uploadResponse = await fetch('https://fal.run/fal-ai/storage/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
        },
        body: imageFormData,
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        finalImageUrl = uploadResult.url;
      }
    }

    // Step 4: Call Hedra API for talking avatar
    const hedraPayload: Record<string, unknown> = {
      audio_url: finalAudioUrl,
      aspect_ratio: aspectRatio,
    };

    // If image provided, use it for the avatar
    if (finalImageUrl) {
      hedraPayload.character_image_url = finalImageUrl;
    }

    const response = await fetch(FAL_AVATAR_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
      },
      body: JSON.stringify(hedraPayload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Hedra avatar error:', errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to generate avatar video' },
        { status: 500 }
      );
    }

    const result = await response.json();

    // For queue-based API, return job ID
    if (result.request_id) {
      // Deduct credits immediately for queued jobs
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: creditCost } },
      });

      await createUsage({
        userId: user.id,
        type: 'talking_avatar',
        creditsUsed: creditCost,
        model: 'hedra',
      });

      return NextResponse.json({
        success: true,
        status: 'processing',
        jobId: result.request_id,
        message: 'Avatar video is being generated',
        metadata: {
          hasCustomImage: !!finalImageUrl,
          textLength: text?.length || 0,
          voiceId,
          aspectRatio,
          creditsUsed: creditCost,
          remainingCredits: user.credits - creditCost,
        },
      });
    }

    // For synchronous response
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: creditCost } },
    });

    await createUsage({
      userId: user.id,
      type: 'talking_avatar',
      creditsUsed: creditCost,
      model: 'hedra',
    });

    return NextResponse.json({
      success: true,
      status: 'completed',
      videoUrl: result.video?.url || result.video_url,
      metadata: {
        hasCustomImage: !!finalImageUrl,
        textLength: text?.length || 0,
        voiceId,
        aspectRatio,
        creditsUsed: creditCost,
        remainingCredits: user.credits - creditCost,
      },
    });
  } catch (error) {
    console.error('Talking avatar error:', error);
    return NextResponse.json(
      { error: 'Failed to generate talking avatar' },
      { status: 500 }
    );
  }
}

// GET endpoint to check job status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (!jobId) {
    // Return available options
    return NextResponse.json({
      avatarStyles: AVATAR_STYLES,
      voices: VOICE_OPTIONS,
      aspectRatios: [
        { id: '16:9', name: 'Landscape (16:9)' },
        { id: '9:16', name: 'Portrait (9:16)' },
        { id: '1:1', name: 'Square (1:1)' },
      ],
      limits: {
        minTextLength: 10,
        maxTextLength: 3000,
        maxAudioSize: '20MB',
        maxImageSize: '10MB',
      },
      pricing: {
        cost: 15,
        description: '15 credits per avatar video',
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

  const apiKey = process.env.FAL_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Service not configured' },
      { status: 500 }
    );
  }

  try {
    const statusResponse = await fetch(
      `https://queue.fal.run/fal-ai/hedra/requests/${jobId}/status`,
      {
        headers: {
          'Authorization': `Key ${apiKey}`,
        },
      }
    );

    if (!statusResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to check status' },
        { status: 500 }
      );
    }

    const statusResult = await statusResponse.json();

    if (statusResult.status === 'COMPLETED') {
      // Fetch the result
      const resultResponse = await fetch(
        `https://queue.fal.run/fal-ai/hedra/requests/${jobId}`,
        {
          headers: {
            'Authorization': `Key ${apiKey}`,
          },
        }
      );

      if (resultResponse.ok) {
        const result = await resultResponse.json();
        return NextResponse.json({
          status: 'completed',
          videoUrl: result.video?.url || result.video_url,
        });
      }
    }

    return NextResponse.json({
      status: statusResult.status?.toLowerCase() || 'processing',
      progress: statusResult.progress,
    });
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check job status' },
      { status: 500 }
    );
  }
}
