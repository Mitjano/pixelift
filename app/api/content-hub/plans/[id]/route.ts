import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/content-hub/plans/[id] - Get single plan with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const plan = await prisma.contentPlan.findUnique({
      where: { id },
      include: {
        articles: {
          include: {
            versions: {
              orderBy: { version: 'desc' },
              take: 5,
            },
          },
        },
        keywords: {
          include: {
            keyword: true,
          },
        },
      },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Try to find related keyword in KeywordBank for additional info
    let keywordInfo = null;
    if (plan.targetKeyword) {
      keywordInfo = await prisma.keywordBank.findFirst({
        where: {
          keyword: plan.targetKeyword.toLowerCase(),
          locale: plan.targetLocale,
        },
        select: {
          id: true,
          keyword: true,
          searchVolume: true,
          difficulty: true,
          intent: true,
        },
      });
    }

    return NextResponse.json({
      ...plan,
      keywordInfo,
    });
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
}

// PUT /api/content-hub/plans/[id] - Update plan
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

    // Check if plan exists
    const existing = await prisma.contentPlan.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (body.title !== undefined) updateData.title = body.title;
    if (body.titleVariants !== undefined) updateData.titleVariants = body.titleVariants;
    if (body.slug !== undefined) updateData.slug = body.slug;
    if (body.targetKeyword !== undefined) updateData.targetKeyword = body.targetKeyword;
    if (body.secondaryKeywords !== undefined) updateData.secondaryKeywords = body.secondaryKeywords;
    if (body.targetLocale !== undefined) updateData.targetLocale = body.targetLocale;
    if (body.contentType !== undefined) updateData.contentType = body.contentType;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.scheduledFor !== undefined) updateData.scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
    if (body.scheduledTimezone !== undefined) updateData.scheduledTimezone = body.scheduledTimezone;
    if (body.outline !== undefined) updateData.outline = body.outline;
    if (body.brief !== undefined) updateData.brief = body.brief;
    if (body.serpAnalysis !== undefined) updateData.serpAnalysis = body.serpAnalysis;
    if (body.competitorUrls !== undefined) updateData.competitorUrls = body.competitorUrls;
    if (body.estimatedWords !== undefined) updateData.estimatedWords = body.estimatedWords;
    if (body.actualWords !== undefined) updateData.actualWords = body.actualWords;

    // Update plan
    const updated = await prisma.contentPlan.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Failed to update plan' },
      { status: 500 }
    );
  }
}

// DELETE /api/content-hub/plans/[id] - Delete plan
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if plan exists
    const existing = await prisma.contentPlan.findUnique({
      where: { id },
      include: { articles: true },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    // Don't allow deletion if any article is published
    const hasPublished = existing.articles.some(a => a.status === 'published');
    if (hasPublished) {
      return NextResponse.json(
        { error: 'Cannot delete plan with published article' },
        { status: 400 }
      );
    }

    // Delete plan
    await prisma.contentPlan.delete({
      where: { id },
    });

    // Reset keyword status if it was linked
    if (existing.targetKeyword) {
      await prisma.keywordBank.updateMany({
        where: {
          keyword: existing.targetKeyword.toLowerCase(),
          locale: existing.targetLocale,
        },
        data: { status: 'researched' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Failed to delete plan' },
      { status: 500 }
    );
  }
}
