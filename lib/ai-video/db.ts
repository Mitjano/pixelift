/**
 * AI Video Database Operations
 *
 * Operacje na bazie danych dla wygenerowanych wideo.
 */

import { prisma } from '@/lib/prisma';
import type { VideoModelId, VideoProvider, AspectRatio, Duration } from './models';

// Define the status type locally until Prisma migration runs
export type VideoGenerationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface CreateVideoParams {
  userId: string;
  userEmail: string;
  userName?: string;
  prompt: string;
  enhancedPrompt?: string;
  negativePrompt?: string;
  model: VideoModelId;
  provider: VideoProvider;
  modelVersion?: string;
  duration: Duration;
  resolution: string;
  aspectRatio: AspectRatio;
  fps?: number;
  withAudio?: boolean;
  sourceImageUrl?: string;
  sourceImagePath?: string;
  jobId?: string;
  webhookUrl?: string;
  creditsReserved: number;
  seed?: number;
}

export interface UpdateVideoParams {
  status?: VideoGenerationStatus;
  progress?: number;
  jobId?: string;
  videoUrl?: string;
  localPath?: string;
  thumbnailUrl?: string;
  thumbnailPath?: string;
  fileSize?: number;
  actualDuration?: number;
  processingTime?: number;
  seed?: number;
  creditsUsed?: number;
  costUSD?: number;
  errorMessage?: string;
  errorCode?: string;
  retryCount?: number;
  completedAt?: Date;
}

/**
 * Utwórz nowy rekord wideo
 */
export async function createVideoRecord(params: CreateVideoParams) {
  return prisma.generatedVideo.create({
    data: {
      userId: params.userId,
      userEmail: params.userEmail,
      userName: params.userName,
      prompt: params.prompt,
      enhancedPrompt: params.enhancedPrompt,
      negativePrompt: params.negativePrompt,
      model: params.model,
      provider: params.provider,
      modelVersion: params.modelVersion,
      duration: params.duration,
      resolution: params.resolution,
      aspectRatio: params.aspectRatio,
      fps: params.fps || 24,
      withAudio: params.withAudio || false,
      sourceImageUrl: params.sourceImageUrl,
      sourceImagePath: params.sourceImagePath,
      jobId: params.jobId,
      webhookUrl: params.webhookUrl,
      creditsReserved: params.creditsReserved,
      seed: params.seed,
      status: 'pending',
      isPublic: true,
    },
  });
}

/**
 * Aktualizuj rekord wideo
 */
export async function updateVideoRecord(id: string, params: UpdateVideoParams) {
  return prisma.generatedVideo.update({
    where: { id },
    data: {
      ...params,
      updatedAt: new Date(),
    },
  });
}

/**
 * Pobierz wideo po ID
 */
export async function getVideoById(id: string) {
  return prisma.generatedVideo.findUnique({
    where: { id },
  });
}

/**
 * Pobierz wideo po jobId
 */
export async function getVideoByJobId(jobId: string) {
  return prisma.generatedVideo.findFirst({
    where: { jobId },
  });
}

/**
 * Pobierz wideo użytkownika
 */
export async function getUserVideos(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    status?: VideoGenerationStatus;
    orderBy?: 'createdAt' | 'completedAt';
    order?: 'asc' | 'desc';
  }
) {
  const { limit = 20, offset = 0, status, orderBy = 'createdAt', order = 'desc' } = options || {};

  return prisma.generatedVideo.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    orderBy: { [orderBy]: order },
    take: limit,
    skip: offset,
  });
}

/**
 * Policz wideo użytkownika
 */
export async function countUserVideos(userId: string, status?: VideoGenerationStatus) {
  return prisma.generatedVideo.count({
    where: {
      userId,
      ...(status && { status }),
    },
  });
}

/**
 * Pobierz publiczne wideo (galeria)
 */
export async function getPublicVideos(options?: {
  limit?: number;
  offset?: number;
  model?: VideoModelId;
}) {
  const { limit = 20, offset = 0, model } = options || {};

  return prisma.generatedVideo.findMany({
    where: {
      isPublic: true,
      status: 'completed',
      ...(model && { model }),
    },
    orderBy: [{ likes: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    skip: offset,
    select: {
      id: true,
      prompt: true,
      model: true,
      duration: true,
      aspectRatio: true,
      thumbnailUrl: true,
      videoUrl: true,
      localPath: true,
      likes: true,
      views: true,
      createdAt: true,
      userName: true,
    },
  });
}

/**
 * Usuń wideo
 */
export async function deleteVideo(id: string, userId: string) {
  return prisma.generatedVideo.deleteMany({
    where: {
      id,
      userId, // Zapewnij, że tylko właściciel może usunąć
    },
  });
}

/**
 * Ustaw widoczność publiczną
 */
export async function setVideoPublic(id: string, userId: string, isPublic: boolean) {
  return prisma.generatedVideo.updateMany({
    where: {
      id,
      userId,
    },
    data: {
      isPublic,
    },
  });
}

/**
 * Dodaj polubienie
 */
export async function likeVideo(id: string, viewerId: string) {
  const video = await prisma.generatedVideo.findUnique({
    where: { id },
    select: { likedBy: true },
  });

  if (!video) return null;

  if (video.likedBy.includes(viewerId)) {
    // Usuń polubienie
    return prisma.generatedVideo.update({
      where: { id },
      data: {
        likes: { decrement: 1 },
        likedBy: { set: video.likedBy.filter(uid => uid !== viewerId) },
      },
    });
  } else {
    // Dodaj polubienie
    return prisma.generatedVideo.update({
      where: { id },
      data: {
        likes: { increment: 1 },
        likedBy: { push: viewerId },
      },
    });
  }
}

/**
 * Zwiększ licznik wyświetleń
 */
export async function incrementViews(id: string) {
  return prisma.generatedVideo.update({
    where: { id },
    data: {
      views: { increment: 1 },
    },
  });
}

/**
 * Pobierz wideo w trakcie przetwarzania (do pollingu)
 */
export async function getProcessingVideos(olderThanMinutes: number = 0) {
  const cutoffDate = new Date();
  cutoffDate.setMinutes(cutoffDate.getMinutes() - olderThanMinutes);

  return prisma.generatedVideo.findMany({
    where: {
      status: { in: ['pending', 'processing'] },
      createdAt: { lt: cutoffDate },
    },
    orderBy: { createdAt: 'asc' },
  });
}

/**
 * Oznacz jako nieudane po przekroczeniu limitu czasu
 */
export async function markTimedOutVideos(maxMinutes: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setMinutes(cutoffDate.getMinutes() - maxMinutes);

  return prisma.generatedVideo.updateMany({
    where: {
      status: { in: ['pending', 'processing'] },
      createdAt: { lt: cutoffDate },
    },
    data: {
      status: 'failed',
      errorMessage: 'Generation timed out',
      errorCode: 'TIMEOUT',
    },
  });
}

/**
 * Pobierz statystyki użytkownika
 */
export async function getUserVideoStats(userId: string) {
  const [totalVideos, completedVideos, failedVideos, totalCreditsUsed] = await Promise.all([
    prisma.generatedVideo.count({ where: { userId } }),
    prisma.generatedVideo.count({ where: { userId, status: 'completed' } }),
    prisma.generatedVideo.count({ where: { userId, status: 'failed' } }),
    prisma.generatedVideo.aggregate({
      where: { userId, status: 'completed' },
      _sum: { creditsUsed: true },
    }),
  ]);

  return {
    totalVideos,
    completedVideos,
    failedVideos,
    successRate: totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0,
    totalCreditsUsed: totalCreditsUsed._sum.creditsUsed || 0,
  };
}

/**
 * Pobierz ostatnio wygenerowane wideo użytkownika
 */
export async function getRecentUserVideos(userId: string, limit: number = 5) {
  return prisma.generatedVideo.findMany({
    where: {
      userId,
      status: 'completed',
    },
    orderBy: { completedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      prompt: true,
      model: true,
      thumbnailUrl: true,
      duration: true,
      createdAt: true,
      completedAt: true,
    },
  });
}
