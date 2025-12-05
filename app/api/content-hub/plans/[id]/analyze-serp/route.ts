import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface SerpResult {
  position: number;
  title: string;
  url: string;
  description: string;
  domain: string;
}

interface ContentAnalysis {
  avgWordCount: number;
  commonHeadings: string[];
  commonTopics: string[];
  contentGaps: string[];
  recommendations: string[];
}

interface SerpAnalysisData {
  keyword: string;
  locale: string;
  serpResults: SerpResult[];
  contentAnalysis: ContentAnalysis;
  analyzedAt: string;
}

// POST /api/content-hub/plans/[id]/analyze-serp - Analyze SERP for plan keyword
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

    if (!plan.targetKeyword) {
      return NextResponse.json(
        { error: 'Plan has no target keyword' },
        { status: 400 }
      );
    }

    const keyword = plan.targetKeyword;
    const locale = plan.targetLocale;

    // Fetch SERP results using Google Custom Search API
    let serpResults: SerpResult[] = [];

    try {
      const googleApiKey = process.env.GOOGLE_API_KEY;
      const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

      if (googleApiKey && searchEngineId) {
        const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${googleApiKey}&cx=${searchEngineId}&q=${encodeURIComponent(keyword)}&num=10&gl=${locale}`;

        const searchResponse = await fetch(searchUrl);
        if (searchResponse.ok) {
          const searchData = await searchResponse.json();

          serpResults = (searchData.items || []).map((item: { title: string; link: string; snippet: string }, index: number) => ({
            position: index + 1,
            title: item.title,
            url: item.link,
            description: item.snippet,
            domain: new URL(item.link).hostname,
          }));
        }
      }
    } catch (searchError) {
      console.error('SERP fetch error:', searchError);
      // Continue with AI analysis even if SERP fetch fails
    }

    // Analyze content with AI
    let contentAnalysis: ContentAnalysis = {
      avgWordCount: 0,
      commonHeadings: [],
      commonTopics: [],
      contentGaps: [],
      recommendations: [],
    };

    try {
      const analysisPrompt = `Analyze the search intent and content requirements for the keyword: "${keyword}"

${serpResults.length > 0 ? `Top SERP results:
${serpResults.slice(0, 5).map(r => `${r.position}. ${r.title}\n   ${r.description}`).join('\n\n')}` : ''}

Based on this keyword and search results, provide:
1. Estimated average word count for ranking content
2. 5-7 common heading topics/sections that top results cover
3. 5-7 main topics/themes addressed
4. 3-5 content gaps or opportunities (topics competitors miss)
5. 5 specific recommendations for creating better content

Respond in JSON format:
{
  "avgWordCount": number,
  "commonHeadings": ["heading1", "heading2", ...],
  "commonTopics": ["topic1", "topic2", ...],
  "contentGaps": ["gap1", "gap2", ...],
  "recommendations": ["rec1", "rec2", ...]
}`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an SEO content analyst. Analyze search results and provide actionable insights for content creation. Always respond with valid JSON.',
          },
          {
            role: 'user',
            content: analysisPrompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const analysisText = completion.choices[0]?.message?.content;
      if (analysisText) {
        contentAnalysis = JSON.parse(analysisText);
      }
    } catch (aiError) {
      console.error('AI analysis error:', aiError);
    }

    // Save SERP analysis directly on the plan (serpAnalysis is Json field)
    const serpAnalysisData: SerpAnalysisData = {
      keyword,
      locale,
      serpResults,
      contentAnalysis,
      analyzedAt: new Date().toISOString(),
    };

    // Also save to SerpSnapshot table for history
    await prisma.serpSnapshot.create({
      data: {
        keyword,
        locale,
        results: JSON.parse(JSON.stringify(serpResults)),
        avgWordCount: contentAnalysis.avgWordCount,
        commonHeadings: contentAnalysis.commonHeadings,
        commonQuestions: contentAnalysis.contentGaps, // Using contentGaps as questions
      },
    });

    // Update plan with analysis
    await prisma.contentPlan.update({
      where: { id },
      data: {
        serpAnalysis: JSON.parse(JSON.stringify(serpAnalysisData)),
        status: plan.status === 'planned' ? 'researching' : plan.status,
        estimatedWords: contentAnalysis.avgWordCount || plan.estimatedWords,
      },
    });

    return NextResponse.json({
      serpAnalysis: serpAnalysisData,
      serpResults,
      contentAnalysis,
    });
  } catch (error) {
    console.error('Error analyzing SERP:', error);
    return NextResponse.json(
      { error: 'Failed to analyze SERP' },
      { status: 500 }
    );
  }
}
