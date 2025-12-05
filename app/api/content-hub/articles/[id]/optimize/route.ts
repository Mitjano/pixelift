import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

interface OptimizationResult {
  originalContent: string;
  optimizedContent: string;
  changes: string[];
  seoImprovements: string[];
  readabilityImprovements: string[];
}

// POST /api/content-hub/articles/[id]/optimize - Auto-optimize article with AI
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
      optimizeFor = ['seo', 'readability'], // what to optimize for
      preserveVoice = true, // maintain original tone/voice
      aggressiveness = 'moderate', // light, moderate, aggressive
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

    if (!article.content) {
      return NextResponse.json(
        { error: 'No content to optimize' },
        { status: 400 }
      );
    }

    const targetKeyword = article.contentPlan?.targetKeyword || '';
    const secondaryKeywords = article.contentPlan?.secondaryKeywords || [];

    // Build optimization prompt
    const prompt = buildOptimizationPrompt(
      article.content,
      article.title,
      article.metaDescription || '',
      targetKeyword,
      secondaryKeywords,
      optimizeFor,
      preserveVoice,
      aggressiveness
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

    // Parse response
    let result: OptimizationResult;
    try {
      let jsonStr = textContent.text;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      result = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse optimization response:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse optimization response' },
        { status: 500 }
      );
    }

    // Create new version with optimized content
    const newVersion = article.version + 1;
    const wordCount = result.optimizedContent.trim().split(/\s+/).filter(Boolean).length;

    await prisma.contentArticleVersion.create({
      data: {
        articleId: id,
        version: newVersion,
        content: result.optimizedContent,
        wordCount,
        changes: `AI Optimization: ${result.changes.slice(0, 3).join(', ')}`,
        createdBy: 'ai_optimization',
      },
    });

    // Update article
    await prisma.contentArticle.update({
      where: { id },
      data: {
        content: result.optimizedContent,
        wordCount,
        version: newVersion,
      },
    });

    return NextResponse.json({
      success: true,
      version: newVersion,
      changes: result.changes,
      seoImprovements: result.seoImprovements,
      readabilityImprovements: result.readabilityImprovements,
      wordCountBefore: article.wordCount,
      wordCountAfter: wordCount,
    });
  } catch (error) {
    console.error('Error optimizing article:', error);
    return NextResponse.json(
      { error: 'Failed to optimize article' },
      { status: 500 }
    );
  }
}

function buildOptimizationPrompt(
  content: string,
  title: string,
  metaDescription: string,
  targetKeyword: string,
  secondaryKeywords: string[],
  optimizeFor: string[],
  preserveVoice: boolean,
  aggressiveness: string
): string {
  const optimizationGuidelines: string[] = [];

  if (optimizeFor.includes('seo')) {
    optimizationGuidelines.push(`
**SEO Optimization:**
- Ensure target keyword "${targetKeyword}" appears naturally (0.5-2.5% density)
- Include keyword in first paragraph if missing
- Add keyword to at least one heading if not present
- Use secondary keywords naturally: ${secondaryKeywords.join(', ') || 'none provided'}
- Ensure proper heading hierarchy (H1 > H2 > H3)
- Add internal linking opportunities where appropriate (use [text](URL) format)
- Optimize for featured snippets where possible
`);
  }

  if (optimizeFor.includes('readability')) {
    optimizationGuidelines.push(`
**Readability Optimization:**
- Break up long sentences (aim for 15-20 words average)
- Reduce passive voice usage
- Replace complex words with simpler alternatives where possible
- Add paragraph breaks for better flow (aim for 50-100 words per paragraph)
- Use bullet points or numbered lists for complex information
- Add transition words between sections
`);
  }

  const aggressivenessInstructions = {
    light: 'Make minimal changes. Only fix obvious issues.',
    moderate: 'Make balanced improvements. Fix issues and enhance where beneficial.',
    aggressive: 'Significantly improve the content. Restructure if needed.',
  };

  return `You are an expert content optimizer. Optimize the following article content based on the guidelines below.

**Title:** ${title}
**Meta Description:** ${metaDescription}
**Target Keyword:** ${targetKeyword}
**Aggressiveness Level:** ${aggressiveness} - ${aggressivenessInstructions[aggressiveness as keyof typeof aggressivenessInstructions]}
${preserveVoice ? '**IMPORTANT:** Preserve the original voice, tone, and style of the content.' : ''}

${optimizationGuidelines.join('\n')}

**Original Content:**
${content}

**Instructions:**
1. Apply the optimizations based on the guidelines above
2. Keep the markdown formatting
3. Don't add placeholder links - only suggest where links could go
4. Maintain factual accuracy
5. Don't change the core message or information

**Respond with JSON:**
{
  "originalContent": "first 100 chars of original...",
  "optimizedContent": "the full optimized content in markdown",
  "changes": ["specific change 1", "specific change 2", ...],
  "seoImprovements": ["seo improvement 1", "seo improvement 2", ...],
  "readabilityImprovements": ["readability improvement 1", ...]
}`;
}
