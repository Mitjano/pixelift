import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { generateThumbnail, thumbnailExists, generateMissingThumbnails } from '@/lib/knowledge-thumbnails';
import { getAllArticles, updateArticle, SupportedLocale } from '@/lib/knowledge';

// POST: Generate thumbnail for a specific article
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, category, slug, locale = 'en' } = body;

    if (!title || !category || !slug) {
      return NextResponse.json(
        { error: 'Missing required fields: title, category, slug' },
        { status: 400 }
      );
    }

    // Check if thumbnail already exists
    if (thumbnailExists(slug)) {
      return NextResponse.json({
        success: true,
        message: 'Thumbnail already exists',
        imagePath: `/api/knowledge-image/${slug}`,
      });
    }

    // Generate thumbnail
    const result = await generateThumbnail(title, category, slug);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Thumbnail generation failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      imagePath: result.imagePath,
    });
  } catch (error) {
    console.error('Thumbnail generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Generate thumbnails for all articles that don't have one
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { locale = 'en' } = body;

    // Get all articles for the locale
    const articles = await getAllArticles(locale as SupportedLocale);

    // Filter articles that need thumbnails
    const articlesNeedingThumbnails = articles
      .filter(article => !thumbnailExists(article.slug))
      .map(article => ({
        title: article.title,
        category: article.category,
        slug: article.slug,
      }));

    if (articlesNeedingThumbnails.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'All articles already have thumbnails',
        generated: [],
        failed: [],
      });
    }

    // Generate missing thumbnails
    const result = await generateMissingThumbnails(articlesNeedingThumbnails);

    // Update articles with new thumbnail paths
    for (const slug of result.generated) {
      const article = articles.find(a => a.slug === slug);
      if (article) {
        await updateArticle(article.id, {
          featuredImage: `/api/knowledge-image/${slug}`,
        }, locale as SupportedLocale);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Generated ${result.generated.length} thumbnails`,
      generated: result.generated,
      failed: result.failed,
    });
  } catch (error) {
    console.error('Batch thumbnail generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Check thumbnail status for all articles
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const locale = (searchParams.get('locale') || 'en') as SupportedLocale;

    const articles = await getAllArticles(locale);

    const status = articles.map(article => ({
      slug: article.slug,
      title: article.title,
      hasThumbnail: thumbnailExists(article.slug),
      currentImage: article.featuredImage,
    }));

    const withThumbnails = status.filter(s => s.hasThumbnail).length;
    const withoutThumbnails = status.filter(s => !s.hasThumbnail).length;

    return NextResponse.json({
      total: articles.length,
      withThumbnails,
      withoutThumbnails,
      articles: status,
    });
  } catch (error) {
    console.error('Thumbnail status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
