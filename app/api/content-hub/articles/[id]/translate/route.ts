import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface TranslationResult {
  title: string;
  content: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  slug: string;
}

const LOCALE_NAMES: Record<string, string> = {
  en: 'English',
  pl: 'Polish',
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  nl: 'Dutch',
  ru: 'Russian',
  ja: 'Japanese',
  ko: 'Korean',
  zh: 'Chinese',
};

// POST /api/content-hub/articles/[id]/translate - Translate article to another language
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      targetLocale,
      createNewArticle = true, // Create new article or just return translation
      preserveSeoKeywords = true, // Keep original SEO keywords in translation
      adaptCulturally = true, // Adapt examples/references for target culture
    } = body;

    if (!targetLocale) {
      return NextResponse.json(
        { error: 'Target locale is required' },
        { status: 400 }
      );
    }

    // Get original article
    const article = await prisma.contentArticle.findUnique({
      where: { id },
      include: {
        contentPlan: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    if (!article.content) {
      return NextResponse.json(
        { error: 'Article has no content to translate' },
        { status: 400 }
      );
    }

    if (article.locale === targetLocale) {
      return NextResponse.json(
        { error: 'Target locale is the same as source locale' },
        { status: 400 }
      );
    }

    const sourceLanguage = LOCALE_NAMES[article.locale] || article.locale;
    const targetLanguage = LOCALE_NAMES[targetLocale] || targetLocale;
    const targetKeyword = article.contentPlan?.targetKeyword || '';

    // Build translation prompt
    const prompt = buildTranslationPrompt(
      article.title,
      article.content,
      article.metaTitle || article.title,
      article.metaDescription || '',
      article.excerpt || '',
      article.slug,
      sourceLanguage,
      targetLanguage,
      targetKeyword,
      preserveSeoKeywords,
      adaptCulturally
    );

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8192,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Extract text from response
    const textContent = message.content.find(block => block.type === 'text');
    if (!textContent || textContent.type !== 'text') {
      throw new Error('No text response from Claude');
    }

    // Parse translation result
    let translation: TranslationResult;
    try {
      let jsonStr = textContent.text;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      translation = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse translation response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse translation response' },
        { status: 500 }
      );
    }

    // Create new article with translation if requested
    if (createNewArticle) {
      // Check if translation already exists
      const existingTranslation = await prisma.contentArticle.findFirst({
        where: {
          locale: targetLocale,
          slug: translation.slug,
        },
      });

      if (existingTranslation) {
        return NextResponse.json(
          {
            error: 'A translation with this slug already exists',
            existingId: existingTranslation.id,
          },
          { status: 409 }
        );
      }

      const wordCount = translation.content.trim().split(/\s+/).filter(Boolean).length;

      // Create translated article
      const translatedArticle = await prisma.contentArticle.create({
        data: {
          title: translation.title,
          slug: translation.slug,
          locale: targetLocale,
          content: translation.content,
          excerpt: translation.excerpt,
          metaTitle: translation.metaTitle,
          metaDescription: translation.metaDescription,
          author: article.author,
          categories: article.categories,
          tags: article.tags,
          contentType: article.contentType,
          status: 'draft',
          wordCount,
          aiGenerated: true,
          aiModel: 'claude-sonnet-4-20250514',
          version: 1,
          contentPlanId: article.contentPlanId,
          sourceArticleId: article.id,
          isTranslation: true,
        },
      });

      // Create initial version
      await prisma.contentArticleVersion.create({
        data: {
          articleId: translatedArticle.id,
          version: 1,
          content: translation.content,
          wordCount,
          changes: `Translated from ${sourceLanguage} to ${targetLanguage}`,
          createdBy: 'ai_translation',
        },
      });

      return NextResponse.json({
        success: true,
        translatedArticleId: translatedArticle.id,
        translation,
        sourceLocale: article.locale,
        targetLocale,
      });
    }

    // Just return the translation without creating article
    return NextResponse.json({
      success: true,
      translation,
      sourceLocale: article.locale,
      targetLocale,
    });
  } catch (error) {
    console.error('Error translating article:', error);
    return NextResponse.json(
      { error: 'Failed to translate article' },
      { status: 500 }
    );
  }
}

function buildTranslationPrompt(
  title: string,
  content: string,
  metaTitle: string,
  metaDescription: string,
  excerpt: string,
  slug: string,
  sourceLanguage: string,
  targetLanguage: string,
  targetKeyword: string,
  preserveSeoKeywords: boolean,
  adaptCulturally: boolean
): string {
  return `You are a professional content translator and SEO specialist. Translate the following article from ${sourceLanguage} to ${targetLanguage}.

**IMPORTANT GUIDELINES:**
1. Translate naturally - don't do word-for-word translation
2. Maintain the original tone, style, and formatting (markdown)
3. Keep all markdown syntax intact (headings, bold, lists, links, etc.)
4. ${preserveSeoKeywords ? `Preserve SEO intent - translate the target keyword "${targetKeyword}" appropriately for the target market` : 'Focus on natural translation over SEO optimization'}
5. ${adaptCulturally ? 'Adapt cultural references, idioms, and examples for the target audience' : 'Keep original examples and references'}
6. Generate an appropriate URL slug for the target language (lowercase, hyphens, no special characters)
7. Translate meta title (keep under 60 chars) and meta description (keep under 160 chars)

**ORIGINAL CONTENT:**

Title: ${title}
Slug: ${slug}
Meta Title: ${metaTitle}
Meta Description: ${metaDescription}
Excerpt: ${excerpt || 'N/A'}

Content:
${content}

**RESPOND WITH JSON:**
{
  "title": "Translated title",
  "slug": "translated-url-slug",
  "metaTitle": "Translated meta title (max 60 chars)",
  "metaDescription": "Translated meta description (max 160 chars)",
  "excerpt": "Translated excerpt (2-3 sentences)",
  "content": "Full translated content in markdown format"
}`;
}
