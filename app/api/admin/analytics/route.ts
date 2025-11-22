import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getAnalyticsStats, getRealTimeStats } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
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

    const stats = await getAnalyticsStats(days);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
