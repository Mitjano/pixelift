import { NextRequest, NextResponse } from 'next/server';
import { getPublicGalleryImages, TimeFilter, SortBy } from '@/lib/ai-image/db';
import { prisma } from '@/lib/prisma';

// Unified gallery item type
interface GalleryItem {
  id: string;
  type: 'image' | 'video';
  thumbnailUrl: string;
  outputUrl: string;
  videoUrl?: string;
  prompt: string;
  model: string;
  aspectRatio: string;
  width: number;
  height: number;
  duration?: number;
  user: {
    name: string;
    image?: string;
  };
  likes: number;
  views: number;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const model = searchParams.get('model') || undefined;
    const timeFilter = (searchParams.get('timeFilter') || 'all') as TimeFilter;
    const sortBy = (searchParams.get('sortBy') || 'newest') as SortBy;
    const mediaType = searchParams.get('type') || 'all'; // 'all', 'image', 'video'

    // Validate pagination params
    if (page < 1 || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid pagination parameters' },
        { status: 400 }
      );
    }

    // Validate time filter
    const validTimeFilters: TimeFilter[] = ['today', '7days', '30days', 'all'];
    if (!validTimeFilters.includes(timeFilter)) {
      return NextResponse.json(
        { error: 'Invalid time filter' },
        { status: 400 }
      );
    }

    // Validate sort by
    const validSortBy: SortBy[] = ['newest', 'best'];
    if (!validSortBy.includes(sortBy)) {
      return NextResponse.json(
        { error: 'Invalid sort option' },
        { status: 400 }
      );
    }

    // Build time filter for videos
    let videoDateFilter: Date | undefined;
    if (timeFilter !== 'all') {
      const now = new Date();
      switch (timeFilter) {
        case 'today':
          videoDateFilter = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case '7days':
          videoDateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          videoDateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
      }
    }

    const items: GalleryItem[] = [];

    // Get images (if not filtering for videos only)
    if (mediaType === 'all' || mediaType === 'image') {
      const { images } = getPublicGalleryImages({
        page: 1,
        limit: 1000, // Get all, we'll merge and paginate
        model,
        timeFilter,
        sortBy,
      });

      for (const img of images) {
        const imageUrl = img.localPath
          ? `/api/ai-image/${img.id}/view`
          : img.outputUrl;

        items.push({
          id: img.id,
          type: 'image',
          thumbnailUrl: img.thumbnailUrl || imageUrl,
          outputUrl: imageUrl,
          prompt: img.prompt,
          model: img.model,
          aspectRatio: img.aspectRatio,
          width: img.width,
          height: img.height,
          user: {
            name: img.userName || 'Anonymous',
            image: img.userImage,
          },
          likes: img.likes,
          views: img.views,
          createdAt: img.createdAt,
        });
      }
    }

    // Get public videos (if not filtering for images only)
    if (mediaType === 'all' || mediaType === 'video') {
      const videos = await prisma.generatedVideo.findMany({
        where: {
          isPublic: true,
          status: 'completed',
          videoUrl: { not: null },
          ...(videoDateFilter && { createdAt: { gte: videoDateFilter } }),
        },
        orderBy: sortBy === 'best'
          ? [{ likes: 'desc' }, { createdAt: 'desc' }]
          : { createdAt: 'desc' },
      });

      for (const video of videos) {
        const videoUrl = video.localPath
          ? '/' + video.localPath.replace(/^\.?\/?public\//, '')
          : video.videoUrl;
        const thumbUrl = video.thumbnailPath
          ? '/' + video.thumbnailPath.replace(/^\.?\/?public\//, '')
          : video.thumbnailUrl;

        // Parse aspect ratio to get approximate dimensions
        const [w, h] = (video.aspectRatio || '16:9').split(':').map(Number);
        const baseSize = 720;
        const width = w > h ? baseSize : Math.round(baseSize * (w / h));
        const height = h > w ? baseSize : Math.round(baseSize * (h / w));

        items.push({
          id: video.id,
          type: 'video',
          thumbnailUrl: thumbUrl || videoUrl || '',
          outputUrl: videoUrl || '',
          videoUrl: videoUrl || undefined,
          prompt: video.prompt,
          model: video.model,
          aspectRatio: video.aspectRatio,
          width,
          height,
          duration: video.duration,
          user: {
            name: video.userName || 'Anonymous',
            image: undefined,
          },
          likes: video.likes,
          views: video.views,
          createdAt: video.createdAt.toISOString(),
        });
      }
    }

    // Sort combined items
    if (sortBy === 'best') {
      items.sort((a, b) => {
        if (b.likes !== a.likes) return b.likes - a.likes;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
    } else {
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    // Paginate
    const total = items.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedItems = items.slice(startIndex, endIndex);

    return NextResponse.json({
      images: paginatedItems, // Keep 'images' key for backwards compatibility
      hasMore: endIndex < total,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery' },
      { status: 500 }
    );
  }
}
