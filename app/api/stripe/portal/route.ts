/**
 * Stripe Customer Portal API
 * Creates portal sessions for subscription management
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getOrCreateCustomer,
  createCustomerPortalSession,
  getCustomerSubscriptions,
  cancelSubscription,
  resumeSubscription,
} from '@/lib/stripe';

/**
 * GET /api/stripe/portal
 * Get customer portal URL
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const customerId = await getOrCreateCustomer(
      session.user.id || session.user.email,
      session.user.email,
      session.user.name || undefined
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = `${appUrl}/dashboard`;

    const portalSession = await createCustomerPortalSession(customerId, returnUrl);

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error('Portal session error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/stripe/portal
 * Manage subscription (cancel/resume)
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, subscriptionId } = body;

    if (!action || !subscriptionId) {
      return NextResponse.json(
        { error: 'Missing action or subscriptionId' },
        { status: 400 }
      );
    }

    // Verify user owns this subscription
    const customerId = await getOrCreateCustomer(
      session.user.id || session.user.email,
      session.user.email,
      session.user.name || undefined
    );

    const subscriptions = await getCustomerSubscriptions(customerId);
    const subscription = subscriptions.find((s) => s.id === subscriptionId);

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    let result;

    switch (action) {
      case 'cancel':
        // Cancel at period end (not immediately)
        result = await cancelSubscription(subscriptionId, false);
        return NextResponse.json({
          message: 'Subscription will be canceled at the end of the billing period',
          cancelAtPeriodEnd: result.cancel_at_period_end,
          currentPeriodEnd: result.items.data[0]?.current_period_end,
        });

      case 'cancel_immediately':
        // Cancel immediately
        result = await cancelSubscription(subscriptionId, true);
        return NextResponse.json({
          message: 'Subscription canceled',
          status: result.status,
        });

      case 'resume':
        // Resume subscription that was set to cancel
        result = await resumeSubscription(subscriptionId);
        return NextResponse.json({
          message: 'Subscription resumed',
          cancelAtPeriodEnd: result.cancel_at_period_end,
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use "cancel", "cancel_immediately", or "resume"' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Subscription management error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to manage subscription' },
      { status: 500 }
    );
  }
}
