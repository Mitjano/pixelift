import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Temporary debug endpoint to check video status
export async function GET() {
  try {
    if (!prisma) {
      return NextResponse.json({ error: 'Prisma not configured' });
    }

    const total = await prisma.generatedVideo.count();
    const completed = await prisma.generatedVideo.count({ where: { status: 'completed' } });
    const isPublicTrue = await prisma.generatedVideo.count({ where: { isPublic: true } });
    const hasVideoUrl = await prisma.generatedVideo.count({ where: { videoUrl: { not: null } } });
    const galleryReady = await prisma.generatedVideo.count({
      where: {
        isPublic: true,
        status: 'completed',
        videoUrl: { not: null },
      },
    });

    // Get sample of videos
    const samples = await prisma.generatedVideo.findMany({
      select: {
        id: true,
        status: true,
        isPublic: true,
        videoUrl: true,
        model: true,
        createdAt: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      stats: {
        total,
        completed,
        isPublicTrue,
        hasVideoUrl,
        galleryReady,
      },
      samples: samples.map(v => ({
        id: v.id,
        status: v.status,
        isPublic: v.isPublic,
        hasUrl: !!v.videoUrl,
        model: v.model,
        createdAt: v.createdAt,
      })),
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) });
  }
}
