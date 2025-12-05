import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/content-hub/plans/from-keyword - Create plan directly from keyword
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { keywordId, contentType = 'blog' } = body;

    if (!keywordId) {
      return NextResponse.json(
        { error: 'Keyword ID is required' },
        { status: 400 }
      );
    }

    // Get keyword from KeywordBank
    const keyword = await prisma.keywordBank.findUnique({
      where: { id: keywordId },
    });

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword not found' },
        { status: 404 }
      );
    }

    // Generate title and meta description with AI
    let generatedTitle = keyword.keyword;
    let suggestedSlug = keyword.keyword.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO content strategist. Generate engaging, SEO-optimized article titles.',
          },
          {
            role: 'user',
            content: `Generate an engaging article title for the keyword: "${keyword.keyword}"

The title should:
- Include the keyword naturally
- Be compelling and click-worthy
- Be 50-60 characters ideally
- Match the search intent: ${keyword.intent || 'informational'}

Also suggest a URL slug (lowercase, hyphens only).

Respond in JSON:
{
  "title": "Your engaging title here",
  "slug": "url-friendly-slug"
}`,
          },
        ],
        temperature: 0.8,
        response_format: { type: 'json_object' },
      });

      const result = completion.choices[0]?.message?.content;
      if (result) {
        const parsed = JSON.parse(result);
        generatedTitle = parsed.title || generatedTitle;
        suggestedSlug = parsed.slug || suggestedSlug;
      }
    } catch (aiError) {
      console.error('AI title generation error:', aiError);
      // Use keyword as title if AI fails
      generatedTitle = keyword.keyword
        .split(' ')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }

    // Check for duplicate slug
    let finalSlug = suggestedSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.contentPlan.findFirst({
        where: {
          slug: finalSlug,
          targetLocale: keyword.locale,
        },
      });
      if (!existing) break;
      finalSlug = `${suggestedSlug}-${counter}`;
      counter++;
    }

    // Create the plan (using targetKeyword: String, not relation)
    const plan = await prisma.contentPlan.create({
      data: {
        title: generatedTitle,
        slug: finalSlug,
        targetKeyword: keyword.keyword, // String field
        targetLocale: keyword.locale,
        contentType,
        status: 'planned',
        estimatedWords: 1500, // Default, will be updated after SERP analysis
        priority: keyword.priority || 0,
      },
    });

    // Update keyword status in KeywordBank
    await prisma.keywordBank.update({
      where: { id: keywordId },
      data: { status: 'planned' },
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating plan from keyword:', error);
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    );
  }
}
