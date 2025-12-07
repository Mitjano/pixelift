import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  generateVideo,
  createVideoRecord,
  getModelConfig,
  getToolTypeForModel,
  type VideoModelId,
  type Duration,
  type AspectRatio,
} from '@/lib/ai-video';
import { getToolCost, type ToolType } from '@/lib/credits-config';
import { prisma } from '@/lib/prisma';
import { createUsage } from '@/lib/db';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pixelift.pl';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      prompt,
      negativePrompt,
      model = 'pixverse-v5',
      duration = 5,
      aspectRatio = '16:9',
      resolution = '720p',
      sourceImageUrl,
    } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length < 3) {
      return NextResponse.json(
        { error: 'Prompt is required and must be at least 3 characters' },
        { status: 400 }
      );
    }

    // Validate model
    const modelConfig = getModelConfig(model as VideoModelId);
    if (!modelConfig || !modelConfig.isActive) {
      return NextResponse.json(
        { error: 'Invalid or inactive model selected' },
        { status: 400 }
      );
    }

    // Validate duration
    if (!modelConfig.durations.includes(duration as Duration)) {
      return NextResponse.json(
        { error: `Duration ${duration}s is not supported for ${model}` },
        { status: 400 }
      );
    }

    // Validate aspect ratio
    if (!modelConfig.aspectRatios.includes(aspectRatio as AspectRatio)) {
      return NextResponse.json(
        { error: `Aspect ratio ${aspectRatio} is not supported for ${model}` },
        { status: 400 }
      );
    }

    // Get user
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

    // Calculate credit cost
    const toolType = getToolTypeForModel(model as VideoModelId, duration as Duration) as ToolType;
    const creditCost = getToolCost(toolType);

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

    // Create video record first
    const videoRecord = await createVideoRecord({
      userId: user.id,
      userEmail: user.email,
      userName: user.name || undefined,
      prompt: prompt.trim(),
      negativePrompt: negativePrompt || undefined,
      model: model as VideoModelId,
      provider: modelConfig.provider,
      duration: duration as Duration,
      resolution,
      aspectRatio: aspectRatio as AspectRatio,
      fps: 24,
      withAudio: modelConfig.supportsAudio,
      sourceImageUrl,
      creditsReserved: creditCost,
    });

    // Reserve credits (deduct them)
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: creditCost } },
    });

    // Generate webhook URL
    const webhookUrl = `${APP_URL}/api/ai-video/webhook?videoId=${videoRecord.id}`;

    // Start generation
    const result = await generateVideo({
      prompt: prompt.trim(),
      negativePrompt,
      model: model as VideoModelId,
      duration: duration as Duration,
      aspectRatio: aspectRatio as AspectRatio,
      resolution,
      sourceImageUrl,
      webhookUrl,
    });

    if (!result.success) {
      // Refund credits on failure
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { increment: creditCost } },
      });

      // Update record with error
      await prisma.generatedVideo.update({
        where: { id: videoRecord.id },
        data: {
          status: 'failed',
          errorMessage: result.error,
          creditsReserved: 0,
        },
      });

      return NextResponse.json(
        { error: result.error || 'Video generation failed' },
        { status: 500 }
      );
    }

    // Update record with job ID
    await prisma.generatedVideo.update({
      where: { id: videoRecord.id },
      data: {
        jobId: result.jobId,
        status: 'processing',
        webhookUrl,
      },
    });

    // Log usage
    await createUsage({
      userId: user.id,
      type: toolType,
      creditsUsed: creditCost,
      model: model as string,
    });

    return NextResponse.json({
      success: true,
      videoId: videoRecord.id,
      jobId: result.jobId,
      status: 'processing',
      estimatedTime: result.estimatedTime,
      creditsUsed: creditCost,
      remainingCredits: user.credits - creditCost,
    });
  } catch (error) {
    console.error('Video generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Get available models and settings
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Import inside to avoid circular dependency
    const { getActiveModels } = await import('@/lib/ai-video');
    const models = getActiveModels();

    return NextResponse.json({
      models: models.map(model => ({
        id: model.id,
        name: model.name,
        description: model.description,
        provider: model.provider,
        durations: model.durations,
        aspectRatios: model.aspectRatios,
        resolutions: model.resolutions,
        supportsImageToVideo: model.supportsImageToVideo,
        supportsAudio: model.supportsAudio,
        estimatedTime: model.estimatedProcessingTime,
        isPremium: model.isPremium,
        costs: model.durations.map(d => ({
          duration: d,
          credits: getToolCost(getToolTypeForModel(model.id, d) as ToolType),
        })),
      })),
    });
  } catch (error) {
    console.error('Get models error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
