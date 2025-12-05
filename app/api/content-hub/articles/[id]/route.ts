import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/content-hub/articles/[id] - Get single article with full content
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const article = await prisma.contentArticle.findUnique({
      where: { id },
      include: {
        contentPlan: {
          select: {
            id: true,
            title: true,
            targetKeyword: true,
            outline: true,
            serpAnalysis: true,
          },
        },
        versions: {
          orderBy: { version: 'desc' },
          take: 10,
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error fetching article:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    );
  }
}

// PUT /api/content-hub/articles/[id] - Update article
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Check if article exists
    const existing = await prisma.contentArticle.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.content !== undefined) {
      updateData.content = body.content;
      updateData.wordCount = body.content.trim().split(/\s+/).filter(Boolean).length;
    }
    if (body.excerpt !== undefined) updateData.excerpt = body.excerpt;
    if (body.metaTitle !== undefined) updateData.metaTitle = body.metaTitle;
    if (body.metaDescription !== undefined) updateData.metaDescription = body.metaDescription;
    if (body.featuredImage !== undefined) updateData.featuredImage = body.featuredImage;
    if (body.author !== undefined) updateData.author = body.author;
    if (body.categories !== undefined) updateData.categories = body.categories;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.seoScore !== undefined) updateData.seoScore = body.seoScore;
    if (body.readabilityScore !== undefined) updateData.readabilityScore = body.readabilityScore;
    if (body.scheduledAt !== undefined) updateData.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;

    // Handle publishing
    if (body.status === 'published' && existing.status !== 'published') {
      updateData.publishedAt = new Date();
    }

    // Create new version if content changed
    const contentChanged = body.content !== undefined && body.content !== existing.content;
    if (contentChanged) {
      const newVersion = existing.version + 1;
      updateData.version = newVersion;

      await prisma.contentArticleVersion.create({
        data: {
          articleId: id,
          version: newVersion,
          content: body.content,
          wordCount: body.content.trim().split(/\s+/).filter(Boolean).length,
          changes: body.versionNote || 'Content updated',
          createdBy: body.aiUpdated ? 'ai_optimization' : 'manual',
          seoScore: body.seoScore,
        },
      });
    }

    // Update article
    const updated = await prisma.contentArticle.update({
      where: { id },
      data: updateData,
    });

    // Update plan status if article is published
    if (body.status === 'published' && existing.contentPlanId) {
      await prisma.contentPlan.update({
        where: { id: existing.contentPlanId },
        data: { status: 'published' },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating article:', error);
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    );
  }
}

// DELETE /api/content-hub/articles/[id] - Delete article
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if article exists
    const existing = await prisma.contentArticle.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Don't allow deletion of published articles
    if (existing.status === 'published') {
      return NextResponse.json(
        { error: 'Cannot delete published article. Archive it instead.' },
        { status: 400 }
      );
    }

    // Delete article (versions will cascade)
    await prisma.contentArticle.delete({
      where: { id },
    });

    // Reset plan status if it was linked
    if (existing.contentPlanId) {
      await prisma.contentPlan.update({
        where: { id: existing.contentPlanId },
        data: { status: 'writing' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting article:', error);
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    );
  }
}
