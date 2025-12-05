import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/content-hub/keywords/[id] - Get single keyword
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const keyword = await prisma.keywordBank.findUnique({
      where: { id },
      include: {
        usedInArticles: {
          include: {
            contentPlan: {
              select: {
                id: true,
                title: true,
                status: true,
                slug: true
              }
            }
          }
        }
      }
    });

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 });
    }

    return NextResponse.json(keyword);
  } catch (error) {
    console.error('Error fetching keyword:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keyword' },
      { status: 500 }
    );
  }
}

// PUT /api/content-hub/keywords/[id] - Update keyword
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

    // Check if keyword exists
    const existing = await prisma.keywordBank.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 });
    }

    // Update keyword
    const updated = await prisma.keywordBank.update({
      where: { id },
      data: {
        searchVolume: body.searchVolume,
        difficulty: body.difficulty,
        cpc: body.cpc,
        intent: body.intent,
        cluster: body.cluster,
        status: body.status,
        priority: body.priority,
        relatedKeywords: body.relatedKeywords,
        serpFeatures: body.serpFeatures,
        trend: body.trend,
        lastChecked: body.lastChecked ? new Date(body.lastChecked) : undefined
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating keyword:', error);
    return NextResponse.json(
      { error: 'Failed to update keyword' },
      { status: 500 }
    );
  }
}

// DELETE /api/content-hub/keywords/[id] - Delete keyword
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check if keyword exists
    const existing = await prisma.keywordBank.findUnique({
      where: { id }
    });

    if (!existing) {
      return NextResponse.json({ error: 'Keyword not found' }, { status: 404 });
    }

    // Delete keyword (cascade will remove related ArticleKeyword entries)
    await prisma.keywordBank.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting keyword:', error);
    return NextResponse.json(
      { error: 'Failed to delete keyword' },
      { status: 500 }
    );
  }
}
