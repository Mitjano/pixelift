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

// POST /api/content-hub/plans/[id]/generate-outline - Generate article outline with Claude
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get plan
    const plan = await prisma.contentPlan.findUnique({
      where: { id },
    });

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }

    const keyword = plan.targetKeyword || plan.title;
    const serpData = plan.serpAnalysis as SerpAnalysisData | null;

    // Secondary keywords are stored as String[]
    const secondaryKeywords = plan.secondaryKeywords || [];

    // Build the prompt
    const prompt = `Generate a comprehensive article outline for the following content plan:

**Primary Keyword:** ${keyword}
**Title:** ${plan.title}
**Content Type:** ${plan.contentType || 'blog'}
**Target Locale:** ${plan.targetLocale}
**Target Word Count:** ${plan.estimatedWords || serpData?.contentAnalysis?.avgWordCount || 1500}

${secondaryKeywords.length > 0 ? `**Secondary Keywords:** ${secondaryKeywords.join(', ')}` : ''}

${serpData?.contentAnalysis ? `
**SERP Analysis Insights:**
- Common Topics: ${serpData.contentAnalysis.commonTopics?.join(', ') || 'N/A'}
- Common Headings: ${serpData.contentAnalysis.commonHeadings?.join(', ') || 'N/A'}
- Content Gaps to Address: ${serpData.contentAnalysis.contentGaps?.join(', ') || 'N/A'}
- Recommendations: ${serpData.contentAnalysis.recommendations?.join(', ') || 'N/A'}
` : ''}

${plan.brief ? `**Brief:** ${JSON.stringify(plan.brief)}` : ''}

Generate a detailed article outline that:
1. Is optimized for the primary keyword and includes secondary keywords naturally
2. Addresses search intent and user needs
3. Covers topics that competitors cover PLUS the content gaps
4. Has a logical flow with proper heading hierarchy (H1, H2, H3)
5. Includes estimated word count per section
6. Is engaging and provides unique value

Respond in JSON format:
{
  "title": "SEO-optimized article title with keyword",
  "metaDescription": "Compelling 150-160 character meta description",
  "introduction": "Brief outline of what the introduction should cover",
  "sections": [
    {
      "heading": "Section heading",
      "level": 2,
      "keyPoints": ["point 1", "point 2", "point 3"],
      "suggestedWordCount": 200
    }
  ],
  "conclusion": "Brief outline of conclusion",
  "totalWordCount": 1500,
  "callToAction": "Suggested CTA for the article"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
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

    // Parse JSON from response
    let outline: ArticleOutline;
    try {
      // Extract JSON from the response (handle potential markdown code blocks)
      let jsonStr = textContent.text;
      const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        jsonStr = jsonMatch[1];
      }
      outline = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error('Failed to parse outline JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to parse outline response' },
        { status: 500 }
      );
    }

    // Update plan with outline
    await prisma.contentPlan.update({
      where: { id },
      data: {
        outline: JSON.parse(JSON.stringify(outline)),
        estimatedWords: outline.totalWordCount,
        status: plan.status === 'planned' || plan.status === 'researching' ? 'writing' : plan.status,
      },
    });

    return NextResponse.json({
      outline,
      planId: id,
    });
  } catch (error) {
    console.error('Error generating outline:', error);
    return NextResponse.json(
      { error: 'Failed to generate outline' },
      { status: 500 }
    );
  }
}
