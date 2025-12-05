import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface TagRecommendation {
  tag: string;
  relevancyScore: number;
  category: 'highly_relevant' | 'related' | 'trending' | 'low_competition';
  difficulty?: 'easy' | 'medium' | 'hard';
  searchIntent?: string;
  source?: string;
  searchVolume?: number;
}

// POST /api/content-hub/keywords/import - Import keywords from Tag Recommender
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tags, locale = 'en', cluster, source = 'tag_recommender' } = body;

    if (!tags || !Array.isArray(tags) || tags.length === 0) {
      return NextResponse.json(
        { error: 'No tags provided' },
        { status: 400 }
      );
    }

    const results = {
      imported: [] as string[],
      duplicates: [] as string[],
      errors: [] as string[]
    };

    for (const tag of tags as TagRecommendation[]) {
      try {
        const keyword = typeof tag === 'string' ? tag : tag.tag;

        if (!keyword || typeof keyword !== 'string') {
          continue;
        }

        const normalizedKeyword = keyword.toLowerCase().trim();

        // Check if already exists
        const existing = await prisma.keywordBank.findUnique({
          where: {
            keyword_locale: {
              keyword: normalizedKeyword,
              locale
            }
          }
        });

        if (existing) {
          results.duplicates.push(keyword);
          continue;
        }

        // Map difficulty from Tag Recommender format
        let difficulty: number | undefined;
        if (typeof tag === 'object' && tag.difficulty) {
          difficulty = tag.difficulty === 'easy' ? 30 : tag.difficulty === 'medium' ? 60 : 80;
        }

        // Map category to priority
        let priority = 50;
        if (typeof tag === 'object' && tag.category) {
          switch (tag.category) {
            case 'highly_relevant':
              priority = 90;
              break;
            case 'related':
              priority = 70;
              break;
            case 'trending':
              priority = 80;
              break;
            case 'low_competition':
              priority = 60;
              break;
          }
        }

        // Create keyword
        await prisma.keywordBank.create({
          data: {
            keyword: normalizedKeyword,
            locale,
            searchVolume: typeof tag === 'object' ? tag.searchVolume : undefined,
            difficulty,
            intent: typeof tag === 'object' ? tag.searchIntent : undefined,
            cluster,
            source,
            priority,
            status: 'new'
          }
        });

        results.imported.push(keyword);
      } catch (err) {
        const keyword = typeof tag === 'string' ? tag : tag.tag;
        results.errors.push(`Failed to import ${keyword}: ${err}`);
      }
    }

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: tags.length,
        imported: results.imported.length,
        duplicates: results.duplicates.length,
        errors: results.errors.length
      }
    });
  } catch (error) {
    console.error('Error importing keywords:', error);
    return NextResponse.json(
      { error: 'Failed to import keywords' },
      { status: 500 }
    );
  }
}
