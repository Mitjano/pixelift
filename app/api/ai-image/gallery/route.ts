import { NextRequest, NextResponse } from 'next/server';
import { getPublicGalleryImages, TimeFilter, SortBy } from '@/lib/ai-image/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const model = searchParams.get('model') || undefined;
    const timeFilter = (searchParams.get('timeFilter') || 'all') as TimeFilter;
    const sortBy = (searchParams.get('sortBy') || 'newest') as SortBy;

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

    const { images, total, hasMore } = getPublicGalleryImages({
      page,
      limit,
      model,
      timeFilter,
      sortBy,
    });

    return NextResponse.json({
      images: images.map(img => {
        // Use local view URL if available, otherwise fall back to outputUrl
        const imageUrl = img.localPath
          ? `/api/ai-image/${img.id}/view`
          : img.outputUrl;

        return {
          id: img.id,
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
        };
      }),
      hasMore,
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
