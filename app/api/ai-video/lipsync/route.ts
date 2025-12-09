import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getToolCost, type ToolType } from '@/lib/credits-config';
import { prisma } from '@/lib/prisma';
import { createUsage } from '@/lib/db';

// Lip Sync uses Fal.ai sync/lipsync-2-pro model
const FAL_LIPSYNC_ENDPOINT = 'https://queue.fal.run/sync/lipsync-2-pro';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const videoFile = formData.get('videoFile') as File | null;
    const videoUrl = formData.get('videoUrl') as string | null;
    const audioFile = formData.get('audioFile') as File | null;
    const audioUrl = formData.get('audioUrl') as string | null;

    // Validate inputs
    if (!videoFile && !videoUrl) {
      return NextResponse.json(
        { error: 'Please provide a video file or URL' },
        { status: 400 }
      );
    }

    if (!audioFile && !audioUrl) {
      return NextResponse.json(
        { error: 'Please provide an audio file or URL' },
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

    const creditCost = getToolCost('lipsync' as ToolType);

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

    // Prepare video URL
    let videoInput: string;
    if (videoUrl) {
      videoInput = videoUrl;
    } else if (videoFile) {
      const buffer = await videoFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = videoFile.type || 'video/mp4';
      videoInput = `data:${mimeType};base64,${base64}`;
    } else {
      return NextResponse.json(
        { error: 'No video provided' },
        { status: 400 }
      );
    }

    // Prepare audio URL
    let audioInput: string;
    if (audioUrl) {
      audioInput = audioUrl;
    } else if (audioFile) {
      const buffer = await audioFile.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = audioFile.type || 'audio/mpeg';
      audioInput = `data:${mimeType};base64,${base64}`;
    } else {
      return NextResponse.json(
        { error: 'No audio provided' },
        { status: 400 }
      );
    }

    // Call Fal.ai Lip Sync API
    const apiKey = process.env.FAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Lip sync service not configured' },
        { status: 500 }
      );
    }

    const response = await fetch(FAL_LIPSYNC_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
      },
      body: JSON.stringify({
        video_url: videoInput,
        audio_url: audioInput,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fal.ai Lip Sync error:', errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to process lip sync' },
        { status: 500 }
      );
    }

    const result = await response.json();

    // For queue-based API, we get a request_id
    if (result.request_id) {
      // Deduct credits for queued job
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: creditCost } },
      });

      // Log usage
      await createUsage({
        userId: user.id,
        type: 'lipsync',
        creditsUsed: creditCost,
        model: 'lipsync-2-pro',
      });

      return NextResponse.json({
        success: true,
        status: 'processing',
        jobId: result.request_id,
        message: 'Lip sync processing started. Use the status endpoint to check progress.',
        metadata: {
          creditsUsed: creditCost,
          remainingCredits: user.credits - creditCost,
        },
      });
    }

    // If we got immediate result
    if (result.video?.url || result.output?.video_url) {
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: creditCost } },
      });

      await createUsage({
        userId: user.id,
        type: 'lipsync',
        creditsUsed: creditCost,
        model: 'lipsync-2-pro',
      });

      return NextResponse.json({
        success: true,
        status: 'completed',
        videoUrl: result.video?.url || result.output?.video_url,
        metadata: {
          creditsUsed: creditCost,
          remainingCredits: user.credits - creditCost,
        },
      });
    }

    return NextResponse.json(
      { error: 'Unexpected response from lip sync service' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Lip sync error:', error);
    return NextResponse.json(
      { error: 'Failed to process lip sync' },
      { status: 500 }
    );
  }
}

// Check status of a lip sync job
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      // Return info about the service
      return NextResponse.json({
        description: 'AI Lip Sync - Synchronize video lip movements with audio',
        pricing: {
          cost: 10,
          description: '10 credits per lip sync generation',
        },
        limits: {
          maxVideoSize: 50 * 1024 * 1024, // 50MB
          maxAudioSize: 20 * 1024 * 1024, // 20MB
          supportedVideoFormats: ['mp4', 'webm', 'mov'],
          supportedAudioFormats: ['mp3', 'wav', 'm4a', 'ogg'],
        },
      });
    }

    const apiKey = process.env.FAL_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Lip sync service not configured' },
        { status: 500 }
      );
    }

    // Check job status
    const statusResponse = await fetch(
      `${FAL_LIPSYNC_ENDPOINT}/requests/${jobId}/status`,
      {
        headers: {
          'Authorization': `Key ${apiKey}`,
        },
      }
    );

    if (!statusResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to check job status' },
        { status: 500 }
      );
    }

    const statusData = await statusResponse.json();

    if (statusData.status === 'COMPLETED') {
      // Fetch the result
      const resultResponse = await fetch(
        `${FAL_LIPSYNC_ENDPOINT}/requests/${jobId}`,
        {
          headers: {
            'Authorization': `Key ${apiKey}`,
          },
        }
      );

      const result = await resultResponse.json();

      return NextResponse.json({
        status: 'completed',
        videoUrl: result.video?.url || result.output?.video_url,
      });
    }

    if (statusData.status === 'FAILED') {
      return NextResponse.json({
        status: 'failed',
        error: statusData.error || 'Lip sync processing failed',
      });
    }

    return NextResponse.json({
      status: 'processing',
      progress: statusData.progress || 0,
    });
  } catch (error) {
    console.error('Lip sync status error:', error);
    return NextResponse.json(
      { error: 'Failed to check lip sync status' },
      { status: 500 }
    );
  }
}
