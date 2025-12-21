import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAnalyticsStats, getRealTimeStats } from '@/lib/analytics';
import { apiLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit';
import { handleApiError } from '@/lib/api-utils';
import { getAllUsage, getAllUsers, getAllTransactions } from '@/lib/db';

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

    if (type === 'advanced') {
      // Advanced analytics with cohort analysis, retention, revenue
      const [users, transactions, usage] = await Promise.all([
        getAllUsers(),
        getAllTransactions(),
        getAllUsage(),
      ]);

      const now = new Date();
      const periodStart = new Date();
      periodStart.setDate(now.getDate() - days);

      // Filter by period
      const periodUsers = users.filter(u => new Date(u.createdAt) >= periodStart);
      const periodTransactions = transactions.filter(t => new Date(t.createdAt) >= periodStart);
      const completedTransactions = periodTransactions.filter(t => t.status === 'completed');

      // ===== USER METRICS =====
      const totalUsers = users.length;
      const newUsers = periodUsers.length;
      const activeUsers = new Set(usage.filter(u => new Date(u.createdAt) >= periodStart).map(u => u.userId)).size;
      const verifiedUsers = users.filter(u => u.emailVerified).length;
      const premiumUsers = users.filter(u => u.role === 'premium').length;

      // User growth by day
      const userGrowth: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        userGrowth[dateStr] = 0;
      }
      periodUsers.forEach(u => {
        const dateStr = u.createdAt.split('T')[0];
        if (userGrowth[dateStr] !== undefined) {
          userGrowth[dateStr]++;
        }
      });
      const dailyUserGrowth = Object.entries(userGrowth).map(([date, count]) => ({ date, users: count }));

      // ===== REVENUE METRICS =====
      const totalRevenue = completedTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
      const avgTransactionValue = completedTransactions.length > 0
        ? totalRevenue / completedTransactions.length
        : 0;

      // Revenue by day
      const revenueByDay: Record<string, number> = {};
      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dateStr = date.toISOString().split('T')[0];
        revenueByDay[dateStr] = 0;
      }
      completedTransactions.forEach(t => {
        const dateStr = t.createdAt.split('T')[0];
        if (revenueByDay[dateStr] !== undefined) {
          revenueByDay[dateStr] += t.amount || 0;
        }
      });
      const dailyRevenue = Object.entries(revenueByDay).map(([date, amount]) => ({ date, revenue: amount }));

      // Revenue by plan
      const revenueByPlan: Record<string, number> = {};
      completedTransactions.forEach(t => {
        const plan = t.plan || 'Unknown';
        revenueByPlan[plan] = (revenueByPlan[plan] || 0) + (t.amount || 0);
      });
      const planRevenue = Object.entries(revenueByPlan).map(([plan, amount]) => ({
        plan,
        amount,
        count: completedTransactions.filter(t => (t.plan || 'Unknown') === plan).length
      })).sort((a, b) => b.amount - a.amount);

      // ===== GEOGRAPHIC DISTRIBUTION =====
      // Geographic data comes from session tracking - aggregate by auth provider location
      // For now, provide empty array as this requires session data
      const topCountries: Array<{ country: string; count: number }> = [];

      // ===== COHORT ANALYSIS (simplified) =====
      // Users who signed up and made a purchase
      const usersWithPurchases = new Set(completedTransactions.map(t => t.userId));
      const conversionRate = newUsers > 0
        ? (periodUsers.filter(u => usersWithPurchases.has(u.id)).length / newUsers * 100)
        : 0;

      // Weekly cohorts
      const weeklyCohorts: Array<{ week: string; users: number; active: number; converted: number }> = [];
      for (let w = 0; w < Math.ceil(days / 7); w++) {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - (w + 1) * 7);
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - w * 7);

        const cohortUsers = users.filter(u => {
          const created = new Date(u.createdAt);
          return created >= weekStart && created < weekEnd;
        });

        const cohortActive = cohortUsers.filter(u =>
          usage.some(usg => usg.userId === u.id && new Date(usg.createdAt) >= weekStart)
        ).length;

        const cohortConverted = cohortUsers.filter(u => usersWithPurchases.has(u.id)).length;

        weeklyCohorts.push({
          week: `Week ${w + 1}`,
          users: cohortUsers.length,
          active: cohortActive,
          converted: cohortConverted,
        });
      }

      // ===== AUTH PROVIDER DISTRIBUTION =====
      const authProviders: Record<string, number> = {};
      users.forEach(u => {
        const provider = u.authProvider || 'email';
        authProviders[provider] = (authProviders[provider] || 0) + 1;
      });
      const authProviderStats = Object.entries(authProviders).map(([provider, count]) => ({
        provider,
        count,
        percentage: (count / totalUsers * 100).toFixed(1),
      }));

      return NextResponse.json({
        period: days,
        users: {
          total: totalUsers,
          new: newUsers,
          active: activeUsers,
          verified: verifiedUsers,
          premium: premiumUsers,
          verificationRate: (verifiedUsers / totalUsers * 100).toFixed(1),
          premiumRate: (premiumUsers / totalUsers * 100).toFixed(1),
        },
        revenue: {
          total: totalRevenue.toFixed(2),
          average: avgTransactionValue.toFixed(2),
          transactions: completedTransactions.length,
          currency: 'PLN',
        },
        growth: {
          dailyUsers: dailyUserGrowth,
          dailyRevenue,
        },
        plans: planRevenue,
        geographic: topCountries,
        cohorts: weeklyCohorts.reverse(),
        conversion: {
          rate: conversionRate.toFixed(1),
          total: periodUsers.filter(u => usersWithPurchases.has(u.id)).length,
        },
        authProviders: authProviderStats,
      });
    }

    const stats = await getAnalyticsStats(days);
    return NextResponse.json(stats);
  } catch (error) {
    return handleApiError(error, 'admin/analytics:GET', 'Failed to fetch analytics');
  }
}
