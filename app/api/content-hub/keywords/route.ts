import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/content-hub/keywords - List all keywords with filtering
export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locale = searchParams.get('locale');
    const status = searchParams.get('status');
    const cluster = searchParams.get('cluster');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    // Build where clause
    const where: Record<string, unknown> = {};

    if (locale) {
      where.locale = locale;
    }
    if (status) {
      where.status = status;
    }
    if (cluster) {
      where.cluster = cluster;
    }
    if (search) {
      where.keyword = {
        contains: search,
        mode: 'insensitive'
      };
    }

    // Get total count
    const total = await prisma.keywordBank.count({ where });

    // Get keywords with pagination
    const keywords = await prisma.keywordBank.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        usedInArticles: {
          include: {
            contentPlan: {
              select: {
                id: true,
                title: true,
                status: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json({
      keywords,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching keywords:', error);
    return NextResponse.json(
      { error: 'Failed to fetch keywords' },
      { status: 500 }
    );
  }
}

// POST /api/content-hub/keywords - Add new keyword(s)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Support both single keyword and array of keywords
    const keywordsToAdd = Array.isArray(body.keywords) ? body.keywords : [body];

    const results = {
      created: [] as string[],
      duplicates: [] as string[],
      errors: [] as string[]
    };

    for (const keywordData of keywordsToAdd) {
      try {
        const {
          keyword,
          locale = 'en',
          searchVolume,
          difficulty,
          cpc,
          intent,
          cluster,
          source = 'manual',
          relatedKeywords = [],
          serpFeatures = [],
          trend,
          priority = 0
        } = keywordData;

        if (!keyword || typeof keyword !== 'string') {
          results.errors.push(`Invalid keyword: ${keyword}`);
          continue;
        }

        // Check if keyword already exists
        const existing = await prisma.keywordBank.findUnique({
          where: {
            keyword_locale: {
              keyword: keyword.toLowerCase().trim(),
              locale
            }
          }
        });

        if (existing) {
          results.duplicates.push(keyword);
          continue;
        }

        // Create keyword
        await prisma.keywordBank.create({
          data: {
            keyword: keyword.toLowerCase().trim(),
            locale,
            searchVolume,
            difficulty,
            cpc,
            intent,
            cluster,
            source,
            relatedKeywords,
            serpFeatures,
            trend,
            priority,
            status: 'new'
          }
        });

        results.created.push(keyword);
      } catch (err) {
        results.errors.push(`Failed to add ${keywordData.keyword}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Error adding keywords:', error);
    return NextResponse.json(
      { error: 'Failed to add keywords' },
      { status: 500 }
    );
  }
}
