import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

// Generate unique referral code
function generateReferralCode(userName: string): string {
  const namePart = userName.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 6);
  const randomPart = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${namePart}${randomPart}`;
}

// GET - Fetch user's referral data
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get user's referral (create one if doesn't exist)
    let referral = await prisma.referral.findFirst({
      where: { referrerId: userId },
    });

    // Create referral if user doesn't have one
    if (!referral) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      const userName = user?.name || user?.email?.split('@')[0] || 'USER';

      referral = await prisma.referral.create({
        data: {
          referrerId: userId,
          referrerName: userName,
          code: generateReferralCode(userName),
          status: 'active',
        },
      });
    }

    // Get referred users
    const referredUsers = await prisma.referral.findMany({
      where: {
        referrerId: userId,
        referredUserId: { not: null },
      },
      select: {
        id: true,
        referredUserName: true,
        status: true,
        revenue: true,
        commission: true,
        commissionPaid: true,
        createdAt: true,
        convertedAt: true,
      },
    });

    // Calculate stats
    const stats = {
      totalClicks: referral.clicks,
      totalSignups: referral.signups,
      totalConversions: referral.conversions,
      totalRevenue: referral.revenue,
      totalCommission: referral.commission,
      unpaidCommission: referral.commissionPaid ? 0 : referral.commission,
      referralCode: referral.code,
      referralLink: `https://pixelift.pl/?ref=${referral.code}`,
    };

    return NextResponse.json({
      success: true,
      referral,
      referredUsers,
      stats,
    });
  } catch (error) {
    console.error('Failed to fetch referral data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referral data' },
      { status: 500 }
    );
  }
}

// POST - Register a referral click or signup
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, action, userId } = body;

    if (!code || !action) {
      return NextResponse.json(
        { error: 'Missing code or action' },
        { status: 400 }
      );
    }

    const referral = await prisma.referral.findUnique({
      where: { code },
    });

    if (!referral) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      );
    }

    // Handle different actions
    if (action === 'click') {
      await prisma.referral.update({
        where: { id: referral.id },
        data: { clicks: { increment: 1 } },
      });
    } else if (action === 'signup' && userId) {
      // Get the new user's info
      const newUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true },
      });

      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          signups: { increment: 1 },
          referredUserId: userId,
          referredUserName: newUser?.name || newUser?.email?.split('@')[0] || 'User',
          status: 'active',
        },
      });
    } else if (action === 'conversion') {
      const { amount } = body;
      const netAmount = amount * 0.7; // After Stripe fees etc. (estimate)
      const commission = netAmount * 0.3; // 30% commission

      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          conversions: { increment: 1 },
          revenue: { increment: amount },
          commission: { increment: commission },
          status: 'converted',
          convertedAt: new Date(),
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to process referral action:', error);
    return NextResponse.json(
      { error: 'Failed to process referral' },
      { status: 500 }
    );
  }
}
