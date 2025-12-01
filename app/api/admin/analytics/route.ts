import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAnalyticsStats, getRealTimeStats } from '@/lib/analytics';
import { apiLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';
import { getAllUsage, getAllUsers } from '@/lib/db';

// Tool labels for display
const TOOL_LABELS: Record<string, string> = {
  'upscale': 'Image Upscaler',
  'enhance': 'Quality Enhancement',
  'restore': 'Photo Restoration',
  'background': 'Background Removal',
  'background_remove': 'Background Removal',
  'packshot': 'Packshot Generator',
  'expand': 'Image Expansion',
  'compress': 'Image Compressor',
  'colorize': 'Photo Colorization',
  'denoise': 'Noise Removal',
  'object_removal': 'Object Removal',
};

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const { allowed, resetAt } = apiLimiter.check(identifier);
    if (!allowed) {
      return rateLimitResponse(resetAt);
    }

    const session = await auth();

    if (!session || !session.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'stats';
    const days = parseInt(searchParams.get('days') || '30');

    if (type === 'realtime') {
      const realtimeStats = await getRealTimeStats();
      return NextResponse.json(realtimeStats);
    }

    if (type === 'tools') {
      // Get tool-specific usage statistics
      const [usage, users] = await Promise.all([
        getAllUsage(),
        getAllUsers(),
      ]);

      const now = new Date();
      const periodStart = new Date();
      periodStart.setDate(now.getDate() - days);

      // Filter by period
      const periodUsage = usage.filter(u => new Date(u.createdAt) >= periodStart);

      // Calculate usage by tool type
      const toolStats: Record<string, { operations: number; credits: number; users: Set<string> }> = {};
      periodUsage.forEach(u => {
        if (!toolStats[u.type]) {
          toolStats[u.type] = { operations: 0, credits: 0, users: new Set() };
        }
        toolStats[u.type].operations += 1;
        toolStats[u.type].credits += u.creditsUsed || 0;
        toolStats[u.type].users.add(u.userId);
      });

      // Convert to array format
      const toolUsage = Object.entries(toolStats).map(([type, stats]) => ({
        type,
        label: TOOL_LABELS[type] || type,
        operations: stats.operations,
        credits: stats.credits,
        uniqueUsers: stats.users.size,
      })).sort((a, b) => b.operations - a.operations);

      // Daily tool usage for trends
      const dailyToolUsage: Record<string, Record<string, number>> = {};
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        dailyToolUsage[dateStr] = {};
      }

      periodUsage.forEach(u => {
        const dateStr = u.createdAt.split('T')[0];
        if (dailyToolUsage[dateStr]) {
          dailyToolUsage[dateStr][u.type] = (dailyToolUsage[dateStr][u.type] || 0) + 1;
        }
      });

      // Convert to chart-friendly format
      const dailyTrends = Object.entries(dailyToolUsage).map(([date, tools]) => ({
        date,
        ...tools,
        total: Object.values(tools).reduce((sum, count) => sum + count, 0),
      }));

      // Get top tools by different metrics
      const topByOperations = [...toolUsage].sort((a, b) => b.operations - a.operations).slice(0, 5);
      const topByCredits = [...toolUsage].sort((a, b) => b.credits - a.credits).slice(0, 5);
      const topByUsers = [...toolUsage].sort((a, b) => b.uniqueUsers - a.uniqueUsers).slice(0, 5);

      // Calculate totals
      const totalOperations = toolUsage.reduce((sum, t) => sum + t.operations, 0);
      const totalCredits = toolUsage.reduce((sum, t) => sum + t.credits, 0);
      const avgCreditsPerOperation = totalOperations > 0 ? (totalCredits / totalOperations).toFixed(2) : '0';

      // Active users who used tools in period
      const activeToolUsers = new Set(periodUsage.map(u => u.userId)).size;

      return NextResponse.json({
        period: days,
        summary: {
          totalOperations,
          totalCredits,
          avgCreditsPerOperation,
          activeUsers: activeToolUsers,
          uniqueTools: toolUsage.length,
        },
        toolUsage,
        dailyTrends,
        rankings: {
          byOperations: topByOperations,
          byCredits: topByCredits,
          byUsers: topByUsers,
        },
      });
    }

    const stats = await getAnalyticsStats(days);
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error, 'admin/analytics:GET', 'Failed to fetch analytics');
  }
}
