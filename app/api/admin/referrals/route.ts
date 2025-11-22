import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { createReferral, updateReferral, deleteReferral, trackReferralClick } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, code } = body;

    if (action === 'track_click' && code) {
      trackReferralClick(code);
      return NextResponse.json({ success: true });
    }

    const { referrerId, referrerName, referralCode, status, expiresAt } = body;

    if (!referrerId || !referrerName || !referralCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const referral = createReferral({
      referrerId,
      referrerName,
      code: referralCode,
      status: status || 'pending',
      expiresAt,
    });

    return NextResponse.json({ success: true, referral });
  } catch (error) {
    console.error('Referral creation error:', error);
    return NextResponse.json({ error: 'Failed to create referral' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, updates } = body;

    if (!id || !updates) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const referral = updateReferral(id, updates);

    if (!referral) {
      return NextResponse.json({ error: 'Referral not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, referral });
  } catch (error) {
    console.error('Referral update error:', error);
    return NextResponse.json({ error: 'Failed to update referral' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    const success = deleteReferral(id);
    return NextResponse.json({ success });
  } catch (error) {
    console.error('Referral delete error:', error);
    return NextResponse.json({ error: 'Failed to delete referral' }, { status: 500 });
  }
}
