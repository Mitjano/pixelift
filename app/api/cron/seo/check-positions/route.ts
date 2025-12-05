/**
 * SEO Cron Job: Daily Position Check
 *
 * Automatically checks keyword positions for high-priority keywords.
 * Schedule: Daily at 6:00 AM UTC
 *
 * Security: Requires CRON_SECRET header for authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scrapeSerpBasic, findPositionInSerp } from '@/lib/seo/serp-scraper';
import { getLocaleByCode } from '@/lib/seo/locales';

const TARGET_DOMAIN = 'pixelift.pl';
const MAX_KEYWORDS_PER_RUN = 50; // Limit to prevent timeout
const DELAY_BETWEEN_CHECKS_MS = 3000; // 3 seconds between requests

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // If no CRON_SECRET is set, allow in development
  if (!cronSecret && process.env.NODE_ENV === 'development') {
    return true;
  }

  if (!cronSecret) {
    console.error('CRON_SECRET not configured');
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(request: NextRequest) {
  // Verify authentication
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    // Get keywords to check, prioritized by:
    // 1. High priority keywords (priority = 1)
    // 2. Keywords not checked recently
    // 3. Active keywords only
    const keywords = await prisma.trackedKeyword.findMany({
      where: { isActive: true },
      include: { locale: true },
      take: MAX_KEYWORDS_PER_RUN,
      orderBy: [
        { priority: 'asc' },
        { lastChecked: 'asc' },
      ],
    });

    if (keywords.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No keywords to check',
        checked: 0,
      });
    }

    const results: Array<{
      keywordId: string;
      keyword: string;
      locale: string;
      oldPosition: number | null;
      newPosition: number | null;
      change: number;
      direction: string;
      url?: string;
      error?: string;
    }> = [];

    // Process each keyword
    for (const kw of keywords) {
      const localeConfig = getLocaleByCode(kw.localeCode);

      if (!localeConfig) {
        results.push({
          keywordId: kw.id,
          keyword: kw.keyword,
          locale: kw.localeCode,
          oldPosition: kw.currentPosition,
          newPosition: null,
          change: 0,
          direction: 'error',
          error: 'Invalid locale',
        });
        continue;
      }

      try {
        // Scrape SERP
        const serpResult = await scrapeSerpBasic(kw.keyword, kw.localeCode);

        if (serpResult.error) {
          results.push({
            keywordId: kw.id,
            keyword: kw.keyword,
            locale: kw.localeCode,
            oldPosition: kw.currentPosition,
            newPosition: null,
            change: 0,
            direction: 'error',
            error: serpResult.error,
          });
          continue;
        }

        // Find our position
        const newPosition = findPositionInSerp(serpResult.results, TARGET_DOMAIN);
        const oldPosition = kw.currentPosition;

        // Calculate change
        let change = 0;
        let direction = 'stable';

        if (newPosition === null && oldPosition !== null) {
          direction = 'lost';
          change = oldPosition;
        } else if (newPosition !== null && oldPosition === null) {
          direction = 'new';
          change = newPosition;
        } else if (newPosition !== null && oldPosition !== null) {
          change = oldPosition - newPosition;
          if (change > 0) direction = 'up';
          else if (change < 0) {
            direction = 'down';
            change = Math.abs(change);
          }
        }

        // Get URL that ranks
        const rankingResult = serpResult.results.find(r =>
          r.domain.includes(TARGET_DOMAIN) || TARGET_DOMAIN.includes(r.domain)
        );

        // Update keyword in database
        await prisma.trackedKeyword.update({
          where: { id: kw.id },
          data: {
            previousPosition: oldPosition,
            currentPosition: newPosition,
            lastChecked: new Date(),
            bestPosition: newPosition !== null
              ? (kw.bestPosition === null ? newPosition : Math.min(kw.bestPosition, newPosition))
              : kw.bestPosition,
            worstPosition: newPosition !== null
              ? (kw.worstPosition === null ? newPosition : Math.max(kw.worstPosition, newPosition))
              : kw.worstPosition,
          },
        });

        // Add to history
        await prisma.keywordPositionHistory.create({
          data: {
            keywordId: kw.id,
            position: newPosition,
            url: rankingResult?.url,
            title: rankingResult?.title,
            snippet: rankingResult?.snippet,
            features: rankingResult?.features || [],
          },
        });

        results.push({
          keywordId: kw.id,
          keyword: kw.keyword,
          locale: kw.localeCode,
          oldPosition,
          newPosition,
          change,
          direction,
          url: rankingResult?.url,
        });
      } catch (error) {
        results.push({
          keywordId: kw.id,
          keyword: kw.keyword,
          locale: kw.localeCode,
          oldPosition: kw.currentPosition,
          newPosition: null,
          change: 0,
          direction: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }

      // Add delay between requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHECKS_MS));
    }

    const duration = Date.now() - startTime;

    const summary = {
      improved: results.filter(r => r.direction === 'up').length,
      declined: results.filter(r => r.direction === 'down').length,
      stable: results.filter(r => r.direction === 'stable').length,
      new: results.filter(r => r.direction === 'new').length,
      lost: results.filter(r => r.direction === 'lost').length,
      errors: results.filter(r => r.direction === 'error').length,
    };

    // Log summary
    console.log(`[CRON] Position check completed in ${duration}ms`, {
      checked: results.length,
      ...summary,
    });

    return NextResponse.json({
      success: true,
      checked: results.length,
      duration: `${duration}ms`,
      summary,
      results,
    });
  } catch (error) {
    console.error('[CRON] Position check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check positions', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
