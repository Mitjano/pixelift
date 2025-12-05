import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface SeoAnalysis {
  score: number;
  issues: SeoIssue[];
  suggestions: string[];
}

interface SeoIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  fix?: string;
}

interface ReadabilityAnalysis {
  score: number;
  grade: string;
  metrics: {
    avgSentenceLength: number;
    avgWordLength: number;
    paragraphCount: number;
    sentenceCount: number;
    longSentences: number;
    passiveVoice: number;
    complexWords: number;
  };
  suggestions: string[];
}

interface KeywordAnalysis {
  keyword: string;
  density: number;
  count: number;
  inTitle: boolean;
  inFirstParagraph: boolean;
  inHeadings: boolean;
  inMetaDescription: boolean;
}

// POST /api/content-hub/articles/[id]/analyze - Analyze article SEO and readability
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

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

    const content = article.content || '';
    const title = article.title;
    const metaDescription = article.metaDescription || '';
    const targetKeyword = article.contentPlan?.targetKeyword || '';

    // Analyze SEO
    const seoAnalysis = analyzeSeo(content, title, metaDescription, targetKeyword);

    // Analyze Readability
    const readabilityAnalysis = analyzeReadability(content);

    // Analyze Keywords
    const keywordAnalysis = analyzeKeywords(content, title, metaDescription, targetKeyword);

    // Calculate overall scores
    const overallSeoScore = seoAnalysis.score;
    const overallReadabilityScore = readabilityAnalysis.score;

    // Update article with scores
    await prisma.contentArticle.update({
      where: { id },
      data: {
        seoScore: overallSeoScore,
        readabilityScore: overallReadabilityScore,
      },
    });

    return NextResponse.json({
      seo: seoAnalysis,
      readability: readabilityAnalysis,
      keywords: keywordAnalysis,
      overallScore: Math.round((overallSeoScore + overallReadabilityScore) / 2),
    });
  } catch (error) {
    console.error('Error analyzing article:', error);
    return NextResponse.json(
      { error: 'Failed to analyze article' },
      { status: 500 }
    );
  }
}

function analyzeSeo(content: string, title: string, metaDescription: string, targetKeyword: string): SeoAnalysis {
  const issues: SeoIssue[] = [];
  const suggestions: string[] = [];
  let score = 100;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const headings = content.match(/^#{1,6}\s.+$/gm) || [];
  const h1Count = (content.match(/^#\s.+$/gm) || []).length;
  const h2Count = (content.match(/^##\s.+$/gm) || []).length;
  const links = content.match(/\[.+?\]\(.+?\)/g) || [];
  const images = content.match(/!\[.*?\]\(.+?\)/g) || [];

  // Title checks
  if (!title) {
    issues.push({ type: 'error', category: 'Title', message: 'Missing title' });
    score -= 15;
  } else {
    if (title.length < 30) {
      issues.push({ type: 'warning', category: 'Title', message: 'Title is too short (< 30 chars)', fix: 'Make title 50-60 characters' });
      score -= 5;
    } else if (title.length > 60) {
      issues.push({ type: 'warning', category: 'Title', message: 'Title is too long (> 60 chars)', fix: 'Keep title under 60 characters' });
      score -= 5;
    }
    if (targetKeyword && !title.toLowerCase().includes(targetKeyword.toLowerCase())) {
      issues.push({ type: 'warning', category: 'Title', message: 'Target keyword not in title', fix: 'Include keyword in title' });
      score -= 10;
    }
  }

  // Meta description checks
  if (!metaDescription) {
    issues.push({ type: 'error', category: 'Meta', message: 'Missing meta description' });
    score -= 10;
  } else {
    if (metaDescription.length < 120) {
      issues.push({ type: 'warning', category: 'Meta', message: 'Meta description too short (< 120 chars)', fix: 'Make description 150-160 characters' });
      score -= 5;
    } else if (metaDescription.length > 160) {
      issues.push({ type: 'warning', category: 'Meta', message: 'Meta description too long (> 160 chars)', fix: 'Keep under 160 characters' });
      score -= 3;
    }
    if (targetKeyword && !metaDescription.toLowerCase().includes(targetKeyword.toLowerCase())) {
      issues.push({ type: 'warning', category: 'Meta', message: 'Target keyword not in meta description', fix: 'Include keyword in description' });
      score -= 5;
    }
  }

  // Content length checks
  if (wordCount < 300) {
    issues.push({ type: 'error', category: 'Content', message: `Content too short (${wordCount} words)`, fix: 'Add at least 300 words' });
    score -= 20;
  } else if (wordCount < 1000) {
    issues.push({ type: 'warning', category: 'Content', message: `Content may be thin (${wordCount} words)`, fix: 'Consider expanding to 1000+ words' });
    score -= 5;
  } else if (wordCount > 1500) {
    suggestions.push(`Great content length: ${wordCount} words`);
  }

  // Heading structure checks
  if (h1Count === 0) {
    issues.push({ type: 'warning', category: 'Structure', message: 'No H1 heading found', fix: 'Add one H1 heading at the beginning' });
    score -= 5;
  } else if (h1Count > 1) {
    issues.push({ type: 'warning', category: 'Structure', message: `Multiple H1 headings (${h1Count})`, fix: 'Use only one H1 heading' });
    score -= 5;
  }

  if (h2Count === 0) {
    issues.push({ type: 'warning', category: 'Structure', message: 'No H2 subheadings', fix: 'Add H2 headings to structure content' });
    score -= 5;
  } else if (h2Count < Math.floor(wordCount / 300)) {
    issues.push({ type: 'info', category: 'Structure', message: 'Consider adding more subheadings', fix: 'Add H2 every 200-300 words' });
    score -= 2;
  }

  // Keyword checks
  if (targetKeyword) {
    const keywordRegex = new RegExp(targetKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const keywordCount = (content.match(keywordRegex) || []).length;
    const keywordDensity = (keywordCount / wordCount) * 100;

    if (keywordCount === 0) {
      issues.push({ type: 'error', category: 'Keyword', message: 'Target keyword not found in content', fix: 'Add keyword naturally to content' });
      score -= 15;
    } else if (keywordDensity < 0.5) {
      issues.push({ type: 'warning', category: 'Keyword', message: `Low keyword density (${keywordDensity.toFixed(2)}%)`, fix: 'Increase keyword usage (0.5-2.5%)' });
      score -= 5;
    } else if (keywordDensity > 3) {
      issues.push({ type: 'warning', category: 'Keyword', message: `High keyword density (${keywordDensity.toFixed(2)}%)`, fix: 'Reduce keyword stuffing' });
      score -= 10;
    } else {
      suggestions.push(`Good keyword density: ${keywordDensity.toFixed(2)}%`);
    }

    // Check if keyword is in first paragraph
    const firstParagraph = content.split('\n\n')[0] || '';
    if (!firstParagraph.toLowerCase().includes(targetKeyword.toLowerCase())) {
      issues.push({ type: 'info', category: 'Keyword', message: 'Keyword not in first paragraph', fix: 'Include keyword early in content' });
      score -= 3;
    }

    // Check if keyword is in headings
    const keywordInHeadings = headings.some(h => h.toLowerCase().includes(targetKeyword.toLowerCase()));
    if (!keywordInHeadings && headings.length > 0) {
      issues.push({ type: 'info', category: 'Keyword', message: 'Keyword not in any heading', fix: 'Include keyword in at least one heading' });
      score -= 3;
    }
  }

  // Links checks
  if (links.length === 0) {
    issues.push({ type: 'info', category: 'Links', message: 'No links in content', fix: 'Add internal and external links' });
    score -= 3;
  } else {
    suggestions.push(`Found ${links.length} links in content`);
  }

  // Images checks
  if (images.length === 0) {
    issues.push({ type: 'info', category: 'Media', message: 'No images in content', fix: 'Add relevant images with alt text' });
    score -= 3;
  } else {
    // Check for alt text
    const imagesWithoutAlt = images.filter(img => img.match(/!\[\s*\]/));
    if (imagesWithoutAlt.length > 0) {
      issues.push({ type: 'warning', category: 'Media', message: `${imagesWithoutAlt.length} images without alt text`, fix: 'Add descriptive alt text to images' });
      score -= 5;
    } else {
      suggestions.push(`All ${images.length} images have alt text`);
    }
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    issues: issues.sort((a, b) => {
      const order = { error: 0, warning: 1, info: 2 };
      return order[a.type] - order[b.type];
    }),
    suggestions,
  };
}

function analyzeReadability(content: string): ReadabilityAnalysis {
  const suggestions: string[] = [];

  // Clean content from markdown
  const cleanContent = content
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Replace links with text
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '') // Remove images
    .replace(/^#{1,6}\s+/gm, '') // Remove heading markers
    .replace(/[*_]{1,2}([^*_]+)[*_]{1,2}/g, '$1') // Remove bold/italic
    .replace(/\n{2,}/g, '\n\n') // Normalize line breaks
    .trim();

  // Split into sentences (handle abbreviations)
  const sentences = cleanContent
    .replace(/([.!?])\s+/g, '$1|')
    .split('|')
    .filter(s => s.trim().length > 0);

  // Split into paragraphs
  const paragraphs = cleanContent.split(/\n\n+/).filter(p => p.trim().length > 0);

  // Get all words
  const words = cleanContent.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  if (wordCount === 0) {
    return {
      score: 0,
      grade: 'N/A',
      metrics: {
        avgSentenceLength: 0,
        avgWordLength: 0,
        paragraphCount: 0,
        sentenceCount: 0,
        longSentences: 0,
        passiveVoice: 0,
        complexWords: 0,
      },
      suggestions: ['Add content to analyze readability'],
    };
  }

  // Calculate metrics
  const sentenceCount = sentences.length;
  const paragraphCount = paragraphs.length;
  const avgSentenceLength = wordCount / sentenceCount;
  const avgWordLength = words.reduce((sum, w) => sum + w.replace(/[^a-zA-Z]/g, '').length, 0) / wordCount;

  // Count long sentences (> 20 words)
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 20).length;

  // Count passive voice (simple detection)
  const passivePatterns = /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi;
  const passiveVoice = (cleanContent.match(passivePatterns) || []).length;

  // Count complex words (3+ syllables)
  const complexWords = words.filter(w => countSyllables(w) >= 3).length;

  // Calculate Flesch Reading Ease score
  const fleschScore = 206.835 - (1.015 * avgSentenceLength) - (84.6 * (avgWordLength / 5));
  const normalizedScore = Math.max(0, Math.min(100, fleschScore));

  // Determine grade
  let grade: string;
  if (normalizedScore >= 90) grade = 'Very Easy (5th grade)';
  else if (normalizedScore >= 80) grade = 'Easy (6th grade)';
  else if (normalizedScore >= 70) grade = 'Fairly Easy (7th grade)';
  else if (normalizedScore >= 60) grade = 'Standard (8th-9th grade)';
  else if (normalizedScore >= 50) grade = 'Fairly Difficult (10th-12th grade)';
  else if (normalizedScore >= 30) grade = 'Difficult (College)';
  else grade = 'Very Difficult (Graduate)';

  // Generate suggestions
  if (avgSentenceLength > 20) {
    suggestions.push(`Shorten sentences. Average is ${avgSentenceLength.toFixed(1)} words (aim for 15-20)`);
  }

  if (longSentences > sentenceCount * 0.25) {
    suggestions.push(`${longSentences} long sentences (>20 words). Break them up.`);
  }

  if (passiveVoice > sentenceCount * 0.1) {
    suggestions.push(`${passiveVoice} passive voice instances. Use active voice more.`);
  }

  if (complexWords > wordCount * 0.1) {
    suggestions.push(`${complexWords} complex words (3+ syllables). Simplify vocabulary.`);
  }

  if (paragraphCount < 3 && wordCount > 300) {
    suggestions.push('Add more paragraph breaks for better readability');
  }

  const avgParagraphLength = wordCount / paragraphCount;
  if (avgParagraphLength > 150) {
    suggestions.push('Paragraphs are too long. Aim for 50-100 words per paragraph.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Good readability! Content is well-structured.');
  }

  return {
    score: Math.round(normalizedScore),
    grade,
    metrics: {
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      avgWordLength: Math.round(avgWordLength * 10) / 10,
      paragraphCount,
      sentenceCount,
      longSentences,
      passiveVoice,
      complexWords,
    },
    suggestions,
  };
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '');
  if (word.length <= 3) return 1;

  word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
  word = word.replace(/^y/, '');

  const syllables = word.match(/[aeiouy]{1,2}/g);
  return syllables ? syllables.length : 1;
}

function analyzeKeywords(content: string, title: string, metaDescription: string, targetKeyword: string): KeywordAnalysis | null {
  if (!targetKeyword) return null;

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const keywordRegex = new RegExp(targetKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');

  const count = (content.match(keywordRegex) || []).length;
  const density = wordCount > 0 ? (count / wordCount) * 100 : 0;

  const firstParagraph = content.split('\n\n')[0] || '';
  const headings = content.match(/^#{1,6}\s.+$/gm) || [];

  return {
    keyword: targetKeyword,
    density: Math.round(density * 100) / 100,
    count,
    inTitle: title.toLowerCase().includes(targetKeyword.toLowerCase()),
    inFirstParagraph: firstParagraph.toLowerCase().includes(targetKeyword.toLowerCase()),
    inHeadings: headings.some(h => h.toLowerCase().includes(targetKeyword.toLowerCase())),
    inMetaDescription: metaDescription.toLowerCase().includes(targetKeyword.toLowerCase()),
  };
}
