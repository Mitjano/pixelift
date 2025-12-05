import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/content-hub/articles - List all articles
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');
    const status = searchParams.get('status');
    const contentType = searchParams.get('contentType');
    const search = searchParams.get('search');
    const aiGenerated = searchParams.get('aiGenerated');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (locale) {
      where.locale = locale;
    }
    if (status) {
      where.status = status;
    }
    if (contentType) {
      where.contentType = contentType;
    }
    if (aiGenerated === 'true') {
      where.aiGenerated = true;
    } else if (aiGenerated === 'false') {
      where.aiGenerated = false;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.contentArticle.count({ where });

    // Get articles
    const articles = await prisma.contentArticle.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        locale: true,
        status: true,
        contentType: true,
        excerpt: true,
        featuredImage: true,
        author: true,
        categories: true,
        tags: true,
        wordCount: true,
        seoScore: true,
        readabilityScore: true,
        aiGenerated: true,
        aiModel: true,
        publishedAt: true,
        scheduledAt: true,
        version: true,
        createdAt: true,
        updatedAt: true,
        contentPlanId: true,
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      articles,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    );
  }
}

// POST /api/content-hub/articles - Create new article
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      locale = 'en',
      content = '',
      excerpt,
      metaTitle,
      metaDescription,
      featuredImage,
      author = 'Pixelift Team',
      categories = [],
      tags = [],
      contentType = 'blog',
      contentPlanId,
      aiGenerated = false,
      aiModel,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate slug if not provided
    const finalSlug = slug || title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check for duplicate slug in same locale
    const existingArticle = await prisma.contentArticle.findFirst({
      where: {
        slug: finalSlug,
        locale,
      },
    });

    if (existingArticle) {
      return NextResponse.json(
        { error: 'An article with this slug already exists in this locale' },
        { status: 409 }
      );
    }

    // Calculate word count
    const wordCount = content ? content.trim().split(/\s+/).filter(Boolean).length : 0;

    // Create the article
    const article = await prisma.contentArticle.create({
      data: {
        title,
        slug: finalSlug,
        locale,
        content,
        excerpt,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        featuredImage,
        author,
        categories,
        tags,
        contentType,
        contentPlanId,
        wordCount,
        aiGenerated,
        aiModel,
        status: 'draft',
        version: 1,
      },
    });

    // Create initial version
    await prisma.contentArticleVersion.create({
      data: {
        articleId: article.id,
        version: 1,
        content,
        wordCount,
        changes: 'Initial creation',
        createdBy: aiGenerated ? 'ai_generation' : 'manual',
      },
    });

    // Update plan status if linked
    if (contentPlanId) {
      await prisma.contentPlan.update({
        where: { id: contentPlanId },
        data: { status: 'writing' },
      });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error creating article:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
