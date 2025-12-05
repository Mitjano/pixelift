import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface ArticleOutline {
  title: string;
  metaDescription: string;
}

// POST /api/content-hub/articles/from-plan - Create article from content plan
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { planId, contentType = 'blog' } = body;

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Get plan
    const plan = await prisma.contentPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Check if article already exists for this plan
    const existingArticle = await prisma.contentArticle.findFirst({
      where: { contentPlanId: planId },
    });

    if (existingArticle) {
      return NextResponse.json(
        { error: 'Article already exists for this plan', articleId: existingArticle.id },
        { status: 409 }
      );
    }

    const outline = plan.outline as ArticleOutline | null;

    // Generate slug
    const slug = plan.slug || plan.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check for duplicate slug
    let finalSlug = slug;
    let counter = 1;
    while (true) {
      const existing = await prisma.contentArticle.findFirst({
        where: {
          slug: finalSlug,
          locale: plan.targetLocale,
        },
      });
      if (!existing) break;
      finalSlug = `${slug}-${counter}`;
      counter++;
    }

    // Create article
    const article = await prisma.contentArticle.create({
      data: {
        contentPlanId: planId,
        title: outline?.title || plan.title,
        slug: finalSlug,
        locale: plan.targetLocale,
        content: '',
        excerpt: outline?.metaDescription || null,
        metaTitle: outline?.title || plan.title,
        metaDescription: outline?.metaDescription || null,
        contentType: contentType || plan.contentType,
        categories: [],
        tags: plan.secondaryKeywords || [],
        status: 'draft',
        aiGenerated: true,
        version: 1,
      },
    });

    // Create initial empty version
    await prisma.contentArticleVersion.create({
      data: {
        articleId: article.id,
        version: 1,
        content: '',
        wordCount: 0,
        changes: 'Created from content plan',
        createdBy: 'manual',
      },
    });

    // Update plan status
    await prisma.contentPlan.update({
      where: { id: planId },
      data: { status: 'writing' },
    });

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error creating article from plan:', error);
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    );
  }
}
