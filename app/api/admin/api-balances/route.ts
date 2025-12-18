import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch all API platform balances
export async function GET() {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const balances = await prisma.apiPlatformBalance.findMany({
      orderBy: { platform: 'asc' },
      include: {
        history: {
          orderBy: { recordedAt: 'desc' },
          take: 10,
        },
      },
    });

    // Calculate alerts
    const alerts = balances
      .filter(b => b.isActive && b.currentBalance < b.alertThreshold)
      .map(b => ({
        platform: b.platform,
        displayName: b.displayName,
        currentBalance: b.currentBalance,
        alertThreshold: b.alertThreshold,
        criticalThreshold: b.criticalThreshold,
        isCritical: b.currentBalance < b.criticalThreshold,
        daysUntilDepleted: b.daysUntilDepleted,
      }));

    return NextResponse.json({
      balances,
      alerts,
      summary: {
        totalPlatforms: balances.length,
        activePlatforms: balances.filter(b => b.isActive).length,
        totalBalance: balances.reduce((sum, b) => sum + b.currentBalance, 0),
        platformsNeedingAttention: alerts.length,
        criticalAlerts: alerts.filter(a => a.isCritical).length,
      },
    });
  } catch (error) {
    console.error('[admin/api-balances] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch API balances' }, { status: 500 });
  }
}

// POST - Create or update a platform balance
export async function POST(request: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = await auth();
    const body = await request.json();
    const {
      platform,
      displayName,
      currentBalance,
      alertThreshold,
      criticalThreshold,
      notes,
      isActive,
      lastTopUp,
    } = body;

    if (!platform || !displayName) {
      return NextResponse.json({ error: 'Platform and displayName are required' }, { status: 400 });
    }

    // Calculate estimated costs based on usage (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Upsert the platform balance
    const existing = await prisma.apiPlatformBalance.findUnique({
      where: { platform },
    });

    let result;
    const previousBalance = existing?.currentBalance || 0;

    if (existing) {
      result = await prisma.apiPlatformBalance.update({
        where: { platform },
        data: {
          displayName,
          currentBalance: currentBalance ?? existing.currentBalance,
          alertThreshold: alertThreshold ?? existing.alertThreshold,
          criticalThreshold: criticalThreshold ?? existing.criticalThreshold,
          notes: notes ?? existing.notes,
          isActive: isActive ?? existing.isActive,
          lastTopUp: lastTopUp ?? existing.lastTopUp,
          lastTopUpAt: lastTopUp ? new Date() : existing.lastTopUpAt,
          lastChecked: new Date(),
          lastUpdatedBy: session?.user?.email || 'admin',
        },
      });

      // Record history if balance changed
      if (currentBalance !== undefined && currentBalance !== previousBalance) {
        const change = currentBalance - previousBalance;
        await prisma.apiPlatformBalanceHistory.create({
          data: {
            platformId: result.id,
            balance: currentBalance,
            change,
            changeType: change > 0 ? 'topup' : 'adjustment',
            description: change > 0 ? `Top-up of $${change.toFixed(2)}` : `Adjustment of $${change.toFixed(2)}`,
            recordedBy: session?.user?.email || 'admin',
          },
        });
      }
    } else {
      result = await prisma.apiPlatformBalance.create({
        data: {
          platform,
          displayName,
          currentBalance: currentBalance || 0,
          alertThreshold: alertThreshold || 50,
          criticalThreshold: criticalThreshold || 20,
          notes,
          isActive: isActive ?? true,
          lastTopUp: lastTopUp,
          lastTopUpAt: lastTopUp ? new Date() : null,
          lastChecked: new Date(),
          lastUpdatedBy: session?.user?.email || 'admin',
          apiKeyConfigured: !!process.env[`${platform.toUpperCase()}_API_TOKEN`] ||
                           !!process.env[`${platform.toUpperCase()}_API_KEY`],
        },
      });

      // Record initial balance
      if (currentBalance) {
        await prisma.apiPlatformBalanceHistory.create({
          data: {
            platformId: result.id,
            balance: currentBalance,
            change: currentBalance,
            changeType: 'initial',
            description: 'Initial balance set',
            recordedBy: session?.user?.email || 'admin',
          },
        });
      }
    }

    return NextResponse.json({ success: true, balance: result });
  } catch (error) {
    console.error('[admin/api-balances] Error creating/updating:', error);
    return NextResponse.json({ error: 'Failed to save API balance' }, { status: 500 });
  }
}

// DELETE - Remove a platform
export async function DELETE(request: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform');

    if (!platform) {
      return NextResponse.json({ error: 'Platform is required' }, { status: 400 });
    }

    await prisma.apiPlatformBalance.delete({
      where: { platform },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[admin/api-balances] Error deleting:', error);
    return NextResponse.json({ error: 'Failed to delete API balance' }, { status: 500 });
  }
}
