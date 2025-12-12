import { NextRequest, NextResponse } from 'next/server';
import { getThumbnailPath } from '@/lib/knowledge-thumbnails';
import fs from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Validate slug to prevent path traversal
    if (!slug || slug.includes('..') || slug.includes('/') || slug.includes('\\')) {
      return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    }

    const thumbnailPath = getThumbnailPath(slug);

    if (!thumbnailPath) {
      return NextResponse.json({ error: 'Thumbnail not found' }, { status: 404 });
    }

    const imageBuffer = fs.readFileSync(thumbnailPath);

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving knowledge image:', error);
    return NextResponse.json({ error: 'Failed to load image' }, { status: 500 });
  }
}
