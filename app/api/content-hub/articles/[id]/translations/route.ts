import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/content-hub/articles/[id]/translations - Get all translations of an article
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get article
    const article = await prisma.contentArticle.findUnique({
      where: { id },
      include: {
        sourceArticle: {
          select: {
            id: true,
            title: true,
            locale: true,
            slug: true,
            status: true,
          },
        },
        translations: {
          select: {
            id: true,
            title: true,
            locale: true,
            slug: true,
            status: true,
            wordCount: true,
            createdAt: true,
          },
          orderBy: { locale: 'asc' },
        },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // If this is a translation, get the source article's translations too
    let allTranslations = article.translations;
    let sourceArticle = article.sourceArticle;

    if (article.isTranslation && article.sourceArticleId) {
      const source = await prisma.contentArticle.findUnique({
        where: { id: article.sourceArticleId },
        include: {
          translations: {
            select: {
              id: true,
              title: true,
              locale: true,
              slug: true,
              status: true,
              wordCount: true,
              createdAt: true,
            },
            orderBy: { locale: 'asc' },
          },
        },
      });

      if (source) {
        sourceArticle = {
          id: source.id,
          title: source.title,
          locale: source.locale,
          slug: source.slug,
          status: source.status,
        };
        allTranslations = source.translations.filter(t => t.id !== article.id);
      }
    }

    // Get available locales for translation
    const supportedLocales = ['en', 'pl', 'es', 'fr', 'de', 'it', 'pt', 'nl'];
    const existingLocales = [
      article.locale,
      ...allTranslations.map(t => t.locale),
      ...(sourceArticle ? [sourceArticle.locale] : []),
    ];
    const availableLocales = supportedLocales.filter(l => !existingLocales.includes(l));

    return NextResponse.json({
      currentArticle: {
        id: article.id,
        title: article.title,
        locale: article.locale,
        isTranslation: article.isTranslation,
      },
      sourceArticle,
      translations: allTranslations,
      availableLocales,
    });
  } catch (error) {
    console.error('Error fetching translations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch translations' },
      { status: 500 }
    );
  }
}
