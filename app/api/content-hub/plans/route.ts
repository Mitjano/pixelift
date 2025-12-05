import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/content-hub/plans - List all content plans
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');
    const status = searchParams.get('status');
    const keyword = searchParams.get('keyword');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (locale) {
      where.targetLocale = locale;
    }
    if (status) {
      where.status = status;
    }
    if (keyword) {
      where.targetKeyword = { contains: keyword, mode: 'insensitive' };
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { targetKeyword: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.contentPlan.count({ where });

    // Get plans with relations
    const plans = await prisma.contentPlan.findMany({
      where,
      include: {
        articles: {
          select: {
            id: true,
            status: true,
            publishedAt: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    return NextResponse.json({
      plans,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    );
  }
}

// POST /api/content-hub/plans - Create new content plan
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      slug,
      targetKeyword,
      secondaryKeywords = [],
      targetLocale = 'en',
      contentType = 'blog',
      estimatedWords,
      outline,
      brief,
      competitorUrls = [],
      priority = 0,
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

    // Check for duplicate slug
    const existingPlan = await prisma.contentPlan.findFirst({
      where: {
        slug: finalSlug,
        targetLocale,
      },
    });

    if (existingPlan) {
      return NextResponse.json(
        { error: 'A plan with this slug already exists' },
        { status: 409 }
      );
    }

    // Create the plan
    const plan = await prisma.contentPlan.create({
      data: {
        title,
        slug: finalSlug,
        targetKeyword: targetKeyword || title,
        secondaryKeywords,
        targetLocale,
        contentType,
        estimatedWords,
        outline,
        brief,
        competitorUrls,
        priority,
        status: 'planned',
      },
    });

    // Update keyword status in KeywordBank if it exists
    if (targetKeyword) {
      await prisma.keywordBank.updateMany({
        where: {
          keyword: targetKeyword.toLowerCase(),
          locale: targetLocale,
        },
        data: { status: 'planned' },
      });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}
