/**
 * SEO Cron Job: Weekly Report Generation
 *
 * Generates a weekly SEO performance report and optionally sends it via email.
 * Schedule: Every Monday at 8:00 AM UTC
 *
 * Security: Requires CRON_SECRET header for authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

// Initialize Resend if API key is available
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

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

interface WeeklyReport {
  period: {
    start: string;
    end: string;
  };
  keywords: {
    total: number;
    tracked: number;
    avgPosition: number | null;
    improved: number;
    declined: number;
    stable: number;
    newRankings: number;
    lostRankings: number;
    top3: number;
    top10: number;
    top100: number;
    topMovers: Array<{
      keyword: string;
      locale: string;
      oldPosition: number | null;
      newPosition: number | null;
      change: number;
    }>;
    biggestDrops: Array<{
      keyword: string;
      locale: string;
      oldPosition: number | null;
      newPosition: number | null;
      change: number;
    }>;
  };
  backlinks: {
    total: number;
    active: number;
    lost: number;
    broken: number;
    doFollow: number;
    noFollow: number;
    newThisWeek: number;
    lostThisWeek: number;
  };
  audit: {
    lastScore: number | null;
    criticalIssues: number;
    warnings: number;
  };
}

async function generateWeeklyReport(): Promise<WeeklyReport> {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Get keyword stats
  const keywords = await prisma.trackedKeyword.findMany({
    where: { isActive: true },
    include: {
      history: {
        where: {
          checkedAt: { gte: weekAgo },
        },
        orderBy: { checkedAt: 'desc' },
      },
    },
  });

  // Calculate keyword metrics
  const keywordStats = {
    total: keywords.length,
    tracked: keywords.filter(k => k.currentPosition !== null).length,
    avgPosition: 0 as number | null,
    improved: 0,
    declined: 0,
    stable: 0,
    newRankings: 0,
    lostRankings: 0,
    top3: 0,
    top10: 0,
    top100: 0,
    topMovers: [] as Array<{ keyword: string; locale: string; oldPosition: number | null; newPosition: number | null; change: number }>,
    biggestDrops: [] as Array<{ keyword: string; locale: string; oldPosition: number | null; newPosition: number | null; change: number }>,
  };

  const positionsWithValue = keywords.filter(k => k.currentPosition !== null);
  if (positionsWithValue.length > 0) {
    keywordStats.avgPosition = Math.round(
      positionsWithValue.reduce((acc, k) => acc + (k.currentPosition || 0), 0) / positionsWithValue.length * 10
    ) / 10;
  } else {
    keywordStats.avgPosition = null;
  }

  // Calculate position distribution and changes
  const changes: Array<{ keyword: string; locale: string; oldPosition: number | null; newPosition: number | null; change: number }> = [];

  for (const kw of keywords) {
    const current = kw.currentPosition;
    const previous = kw.previousPosition;

    // Position distribution
    if (current !== null) {
      if (current <= 3) keywordStats.top3++;
      if (current <= 10) keywordStats.top10++;
      if (current <= 100) keywordStats.top100++;
    }

    // Calculate changes
    if (current !== null && previous !== null) {
      const change = previous - current;
      if (change > 0) keywordStats.improved++;
      else if (change < 0) keywordStats.declined++;
      else keywordStats.stable++;

      changes.push({
        keyword: kw.keyword,
        locale: kw.localeCode,
        oldPosition: previous,
        newPosition: current,
        change,
      });
    } else if (current !== null && previous === null) {
      keywordStats.newRankings++;
      changes.push({
        keyword: kw.keyword,
        locale: kw.localeCode,
        oldPosition: null,
        newPosition: current,
        change: 100 - current, // Positive for new rankings
      });
    } else if (current === null && previous !== null) {
      keywordStats.lostRankings++;
      changes.push({
        keyword: kw.keyword,
        locale: kw.localeCode,
        oldPosition: previous,
        newPosition: null,
        change: -previous, // Negative for lost rankings
      });
    }
  }

  // Sort to find top movers and biggest drops
  const sortedChanges = [...changes].sort((a, b) => b.change - a.change);
  keywordStats.topMovers = sortedChanges.filter(c => c.change > 0).slice(0, 5);
  keywordStats.biggestDrops = sortedChanges.filter(c => c.change < 0).slice(0, 5);

  // Get backlink stats
  const backlinks = await prisma.backlink.findMany();
  const newBacklinks = await prisma.backlink.count({
    where: { firstSeen: { gte: weekAgo } },
  });

  const backlinkStats = {
    total: backlinks.length,
    active: backlinks.filter(b => b.status === 'active').length,
    lost: backlinks.filter(b => b.status === 'lost').length,
    broken: backlinks.filter(b => b.status === 'broken').length,
    doFollow: backlinks.filter(b => b.isDoFollow).length,
    noFollow: backlinks.filter(b => !b.isDoFollow).length,
    newThisWeek: newBacklinks,
    lostThisWeek: backlinks.filter(b =>
      b.status === 'lost' &&
      b.lastChecked &&
      b.lastChecked >= weekAgo
    ).length,
  };

  // Get latest audit
  const latestAudit = await prisma.siteAuditResult.findFirst({
    orderBy: { createdAt: 'desc' },
  });

  const auditStats = {
    lastScore: latestAudit?.overallScore ?? null,
    criticalIssues: 0,
    warnings: 0,
  };

  if (latestAudit?.issues) {
    const issues = latestAudit.issues as Array<{ severity: string }>;
    auditStats.criticalIssues = issues.filter(i => i.severity === 'critical').length;
    auditStats.warnings = issues.filter(i => i.severity === 'warning').length;
  }

  return {
    period: {
      start: weekAgo.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0],
    },
    keywords: keywordStats,
    backlinks: backlinkStats,
    audit: auditStats,
  };
}

function formatReportHtml(report: WeeklyReport): string {
  const positionChangeIcon = (change: number) => {
    if (change > 0) return '🟢';
    if (change < 0) return '🔴';
    return '⚪';
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Weekly SEO Report - PixeLift</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a2e; color: #e5e5e5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; }
    .header { text-align: center; padding: 30px 0; }
    .header h1 { color: #06b6d4; margin: 0; font-size: 28px; }
    .header p { color: #9ca3af; margin: 10px 0 0; }
    .card { background: #242442; border-radius: 12px; padding: 20px; margin: 20px 0; }
    .card h2 { color: #fff; margin: 0 0 15px; font-size: 18px; border-bottom: 1px solid #374151; padding-bottom: 10px; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; }
    .stat { text-align: center; padding: 15px; background: #1a1a2e; border-radius: 8px; }
    .stat-value { font-size: 24px; font-weight: bold; color: #06b6d4; }
    .stat-label { font-size: 12px; color: #9ca3af; margin-top: 5px; }
    .stat-green .stat-value { color: #10b981; }
    .stat-red .stat-value { color: #ef4444; }
    .mover { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #374151; }
    .mover:last-child { border-bottom: none; }
    .mover-keyword { color: #fff; }
    .mover-change { font-weight: bold; }
    .mover-change.positive { color: #10b981; }
    .mover-change.negative { color: #ef4444; }
    .footer { text-align: center; padding: 30px 0; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📊 Weekly SEO Report</h1>
      <p>${report.period.start} - ${report.period.end}</p>
    </div>

    <div class="card">
      <h2>🔑 Keywords Performance</h2>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-value">${report.keywords.tracked}/${report.keywords.total}</div>
          <div class="stat-label">Tracked Keywords</div>
        </div>
        <div class="stat">
          <div class="stat-value">${report.keywords.avgPosition !== null ? report.keywords.avgPosition.toFixed(1) : 'N/A'}</div>
          <div class="stat-label">Avg Position</div>
        </div>
        <div class="stat stat-green">
          <div class="stat-value">${report.keywords.improved}</div>
          <div class="stat-label">Improved</div>
        </div>
        <div class="stat stat-red">
          <div class="stat-value">${report.keywords.declined}</div>
          <div class="stat-label">Declined</div>
        </div>
        <div class="stat">
          <div class="stat-value">${report.keywords.top3}</div>
          <div class="stat-label">Top 3</div>
        </div>
        <div class="stat">
          <div class="stat-value">${report.keywords.top10}</div>
          <div class="stat-label">Top 10</div>
        </div>
      </div>
    </div>

    ${report.keywords.topMovers.length > 0 ? `
    <div class="card">
      <h2>🚀 Top Movers</h2>
      ${report.keywords.topMovers.map(m => `
        <div class="mover">
          <span class="mover-keyword">${m.keyword} <small style="color:#6b7280">(${m.locale})</small></span>
          <span class="mover-change positive">${positionChangeIcon(m.change)} +${m.change} (${m.oldPosition || '∞'} → ${m.newPosition})</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${report.keywords.biggestDrops.length > 0 ? `
    <div class="card">
      <h2>📉 Biggest Drops</h2>
      ${report.keywords.biggestDrops.map(m => `
        <div class="mover">
          <span class="mover-keyword">${m.keyword} <small style="color:#6b7280">(${m.locale})</small></span>
          <span class="mover-change negative">${positionChangeIcon(m.change)} ${m.change} (${m.oldPosition} → ${m.newPosition || '∞'})</span>
        </div>
      `).join('')}
    </div>
    ` : ''}

    <div class="card">
      <h2>🔗 Backlinks</h2>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-value">${report.backlinks.total}</div>
          <div class="stat-label">Total Backlinks</div>
        </div>
        <div class="stat stat-green">
          <div class="stat-value">${report.backlinks.active}</div>
          <div class="stat-label">Active</div>
        </div>
        <div class="stat stat-red">
          <div class="stat-value">${report.backlinks.lost}</div>
          <div class="stat-label">Lost</div>
        </div>
        <div class="stat">
          <div class="stat-value">${report.backlinks.doFollow}</div>
          <div class="stat-label">DoFollow</div>
        </div>
      </div>
    </div>

    <div class="card">
      <h2>🔍 Site Audit</h2>
      <div class="stats-grid">
        <div class="stat">
          <div class="stat-value">${report.audit.lastScore !== null ? report.audit.lastScore + '%' : 'N/A'}</div>
          <div class="stat-label">Last Score</div>
        </div>
        <div class="stat stat-red">
          <div class="stat-value">${report.audit.criticalIssues}</div>
          <div class="stat-label">Critical Issues</div>
        </div>
      </div>
    </div>

    <div class="footer">
      <p>This report was automatically generated by PixeLift SEO Hub</p>
      <p><a href="https://pixelift.pl/admin/seo" style="color: #06b6d4;">View Full Dashboard →</a></p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function GET(request: NextRequest) {
  // Verify authentication
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    // Generate report
    const report = await generateWeeklyReport();

    // Save report to database
    const savedReport = await prisma.sEOReport.create({
      data: {
        name: `Weekly Report ${report.period.start} - ${report.period.end}`,
        type: 'weekly',
        periodStart: new Date(report.period.start),
        periodEnd: new Date(report.period.end),
        keywordsTracked: report.keywords.total,
        avgPosition: report.keywords.avgPosition,
        positionsUp: report.keywords.improved,
        positionsDown: report.keywords.declined,
        positionsStable: report.keywords.stable,
        newKeywords: report.keywords.newRankings,
        lostKeywords: report.keywords.lostRankings,
        newBacklinks: report.backlinks.newThisWeek,
        lostBacklinks: report.backlinks.lostThisWeek,
        data: JSON.parse(JSON.stringify(report)),
      },
    });

    // Send email if configured
    let emailSent = false;
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SEO_REPORT_EMAIL;

    if (resend && adminEmail) {
      try {
        await resend.emails.send({
          from: 'SEO Reports <seo@pixelift.pl>',
          to: adminEmail,
          subject: `📊 Weekly SEO Report: ${report.period.start} - ${report.period.end}`,
          html: formatReportHtml(report),
        });
        emailSent = true;
        console.log(`[CRON] Weekly report sent to ${adminEmail}`);
      } catch (emailError) {
        console.error('[CRON] Failed to send email:', emailError);
      }
    }

    const duration = Date.now() - startTime;

    console.log(`[CRON] Weekly report generated in ${duration}ms`, {
      reportId: savedReport.id,
      emailSent,
    });

    return NextResponse.json({
      success: true,
      reportId: savedReport.id,
      duration: `${duration}ms`,
      emailSent,
      report,
    });
  } catch (error) {
    console.error('[CRON] Weekly report generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate report', details: error instanceof Error ? error.message : 'Unknown' },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
