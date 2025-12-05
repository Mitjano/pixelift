/**
 * SEO Cron Job: Weekly Backlink Check
 *
 * Automatically checks the status of all tracked backlinks.
 * Schedule: Every Sunday at 7:00 AM UTC
 *
 * Security: Requires CRON_SECRET header for authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DELAY_BETWEEN_CHECKS_MS = 1000; // 1 second between requests
const REQUEST_TIMEOUT_MS = 10000; // 10 second timeout per request

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

// Check if a backlink is still present on the source page
async function checkBacklink(
  sourceUrl: string,
  targetUrl: string
): Promise<{ isActive: boolean; isDoFollow: boolean; statusCode?: number; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    const response = await fetch(sourceUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return {
        isActive: false,
        isDoFollow: false,
        statusCode: response.status,
        error: `HTTP ${response.status}`,
      };
    }

    const html = await response.text();

    // Check if target URL is present in the HTML
    const targetDomain = new URL(targetUrl).hostname.replace('www.', '');
    const hasTargetUrl = html.includes(targetUrl);
    const hasTargetDomain = html.includes(targetDomain);
    const isActive = hasTargetUrl || hasTargetDomain;

    // More sophisticated nofollow detection
    let isDoFollow = true;
    if (isActive) {
      // Look for links containing the target URL
      const linkRegex = new RegExp(
        `<a[^>]*href=["'][^"']*${targetDomain.replace('.', '\\.')}[^"']*["'][^>]*>`,
        'gi'
      );
      const matches = html.match(linkRegex);

      if (matches) {
        // Check if any of the matching links have nofollow
        for (const match of matches) {
          if (match.toLowerCase().includes('nofollow')) {
            isDoFollow = false;
            break;
          }
        }
      }
    }

    return {
      isActive,
      isDoFollow,
      statusCode: response.status,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return {
      isActive: false,
      isDoFollow: false,
      error: errorMessage.includes('abort') ? 'Timeout' : errorMessage,
    };
  }
}

export async function GET(request: NextRequest) {
  // Verify authentication
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const backlinks = await prisma.backlink.findMany({
      orderBy: { lastChecked: 'asc' },
    });

    if (backlinks.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No backlinks to check',
        checked: 0,
      });
    }

    const results: Array<{
      id: string;
      sourceUrl: string;
      oldStatus: string;
      newStatus: string;
      isDoFollow: boolean;
      error?: string;
    }> = [];

    let active = 0;
    let lost = 0;
    let broken = 0;

    // Check backlinks sequentially with delays
    for (const bl of backlinks) {
      const result = await checkBacklink(bl.sourceUrl, bl.targetUrl);

      let newStatus: 'active' | 'lost' | 'broken';
      if (result.error && !result.isActive) {
        // If there's an error (like timeout or connection refused), mark as broken
        newStatus = result.statusCode && result.statusCode >= 400 ? 'broken' : 'lost';
      } else {
        newStatus = result.isActive ? 'active' : 'lost';
      }

      await prisma.backlink.update({
        where: { id: bl.id },
        data: {
          status: newStatus,
          isDoFollow: result.isActive ? result.isDoFollow : bl.isDoFollow,
          lastChecked: new Date(),
        },
      });

      if (newStatus === 'active') active++;
      else if (newStatus === 'broken') broken++;
      else lost++;

      results.push({
        id: bl.id,
        sourceUrl: bl.sourceUrl,
        oldStatus: bl.status,
        newStatus,
        isDoFollow: result.isDoFollow,
        error: result.error,
      });

      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CHECKS_MS));
    }

    const duration = Date.now() - startTime;

    // Log summary
    console.log(`[CRON] Backlink check completed in ${duration}ms`, {
      checked: backlinks.length,
      active,
      lost,
      broken,
    });

    // Find backlinks that changed status
    const statusChanges = results.filter(r => r.oldStatus !== r.newStatus);

    return NextResponse.json({
      success: true,
      checked: backlinks.length,
      duration: `${duration}ms`,
      summary: {
        active,
        lost,
        broken,
        statusChanges: statusChanges.length,
      },
      changes: statusChanges,
    });
  } catch (error) {
    console.error('[CRON] Backlink check failed:', error);
    return NextResponse.json(
      { error: 'Failed to check backlinks', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
