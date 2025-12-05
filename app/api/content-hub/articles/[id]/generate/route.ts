import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface OutlineSection {
  heading: string;
  level: number;
  keyPoints: string[];
  suggestedWordCount: number;
}

interface ArticleOutline {
  title: string;
  metaDescription: string;
  introduction: string;
  sections: OutlineSection[];
  conclusion: string;
  totalWordCount: number;
  callToAction: string;
}

interface SerpAnalysisData {
  contentAnalysis?: {
    commonTopics?: string[];
    commonHeadings?: string[];
    contentGaps?: string[];
    recommendations?: string[];
    avgWordCount?: number;
  };
}

// POST /api/content-hub/articles/[id]/generate - Generate article content with Claude AI
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
      regenerateSection, // Optional: regenerate specific section
      tone = 'professional', // professional, casual, formal, friendly
      style = 'informative', // informative, persuasive, educational, entertaining
    } = body;

    // Get article with plan
    const article = await prisma.contentArticle.findUnique({
      where: { id },
      include: {
        contentPlan: true,
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const plan = article.contentPlan;
    const outline = plan?.outline as ArticleOutline | null;
    const serpData = plan?.serpAnalysis as SerpAnalysisData | null;

    if (!outline) {
      return NextResponse.json(
        { error: 'No outline found. Generate an outline first.' },
        { status: 400 }
      );
    }

    // Build the prompt for full article generation
    const prompt = buildArticlePrompt({
      title: outline.title,
      metaDescription: outline.metaDescription,
      introduction: outline.introduction,
      sections: outline.sections,
      conclusion: outline.conclusion,
      callToAction: outline.callToAction,
      targetKeyword: plan?.targetKeyword || article.title,
      secondaryKeywords: plan?.secondaryKeywords || [],
      serpAnalysis: serpData,
      tone,
      style,
      locale: article.locale,
      regenerateSection,
      existingContent: regenerateSection ? article.content : undefined,
    });

    // Generate with Claude
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

    const generatedContent = textContent.text;

    // Calculate word count
    const wordCount = generatedContent.trim().split(/\s+/).filter(Boolean).length;

    // Update article
    const newVersion = article.version + 1;

    await prisma.contentArticle.update({
      where: { id },
      data: {
        content: generatedContent,
        wordCount,
        aiGenerated: true,
        aiModel: 'claude-sonnet-4-20250514',
        version: newVersion,
        metaTitle: outline.title,
        metaDescription: outline.metaDescription,
      },
    });

    // Create version record
    await prisma.contentArticleVersion.create({
      data: {
        articleId: id,
        version: newVersion,
        content: generatedContent,
        wordCount,
        changes: regenerateSection
          ? `Regenerated section: ${regenerateSection}`
          : 'AI generated full article',
        createdBy: 'ai_generation',
      },
    });

    // Update plan status
    if (plan) {
      await prisma.contentPlan.update({
        where: { id: plan.id },
        data: {
          status: 'review',
          actualWords: wordCount,
        },
      });
    }

    return NextResponse.json({
      content: generatedContent,
      wordCount,
      version: newVersion,
      model: 'claude-sonnet-4-20250514',
    });
  } catch (error) {
    console.error('Error generating article:', error);
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    );
  }
}

function buildArticlePrompt({
  title,
  metaDescription,
  introduction,
  sections,
  conclusion,
  callToAction,
  targetKeyword,
  secondaryKeywords,
  serpAnalysis,
  tone,
  style,
  locale,
  regenerateSection,
  existingContent,
}: {
  title: string;
  metaDescription: string;
  introduction: string;
  sections: OutlineSection[];
  conclusion: string;
  callToAction: string;
  targetKeyword: string;
  secondaryKeywords: string[];
  serpAnalysis: SerpAnalysisData | null;
  tone: string;
  style: string;
  locale: string;
  regenerateSection?: string;
  existingContent?: string;
}): string {
  const languageMap: Record<string, string> = {
    en: 'English',
    pl: 'Polish',
    es: 'Spanish',
    fr: 'French',
    de: 'German',
  };
  const language = languageMap[locale] || 'English';

  if (regenerateSection && existingContent) {
    return `You are a professional content writer. Regenerate the following section of an article while keeping the rest intact.

**Section to Regenerate:** ${regenerateSection}

**Existing Article:**
${existingContent}

**Guidelines:**
- Only rewrite the specified section
- Keep the same structure and format
- Maintain consistency with the rest of the article
- Target keyword: "${targetKeyword}"
- Language: ${language}
- Tone: ${tone}
- Style: ${style}

Output the complete article with the regenerated section.`;
  }

  return `You are a professional SEO content writer. Write a complete, high-quality article based on the following outline.

**Title:** ${title}
**Meta Description:** ${metaDescription}
**Target Keyword:** ${targetKeyword}
${secondaryKeywords.length > 0 ? `**Secondary Keywords:** ${secondaryKeywords.join(', ')}` : ''}

**Language:** ${language}
**Tone:** ${tone}
**Style:** ${style}

${serpAnalysis?.contentAnalysis ? `
**SEO Insights (from competitor analysis):**
- Topics to cover: ${serpAnalysis.contentAnalysis.commonTopics?.join(', ') || 'N/A'}
- Content gaps to address: ${serpAnalysis.contentAnalysis.contentGaps?.join(', ') || 'N/A'}
- Recommendations: ${serpAnalysis.contentAnalysis.recommendations?.join(', ') || 'N/A'}
` : ''}

**Article Outline:**

**Introduction:**
${introduction}

**Sections:**
${sections.map((section, index) => `
${index + 1}. ${section.level === 2 ? '## ' : '### '}${section.heading}
   - Target: ~${section.suggestedWordCount} words
   - Key points to cover:
${section.keyPoints.map(point => `     * ${point}`).join('\n')}
`).join('\n')}

**Conclusion:**
${conclusion}

**Call to Action:**
${callToAction}

**Writing Guidelines:**
1. Write the complete article in ${language}
2. Use proper markdown formatting (## for H2, ### for H3, **bold**, *italic*, etc.)
3. Include the target keyword naturally in the first paragraph, headings, and throughout the content
4. Write engaging, informative content that provides real value
5. Use short paragraphs (2-3 sentences) for readability
6. Include bullet points or numbered lists where appropriate
7. Add transition sentences between sections
8. Make the content scannable with clear headings
9. End with a compelling call-to-action
10. Aim for the suggested word counts per section

**Output Format:**
Write the complete article in markdown format, starting with the title as H1.
Do NOT include any explanations or meta-commentary - just the article content.`;
}
