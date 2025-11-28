/**
 * Stripe Checkout API
 * Creates checkout sessions for subscriptions and one-time purchases
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getOrCreateCustomer,
  createSubscriptionCheckout,
  createCreditPurchaseCheckout,
  SUBSCRIPTION_PLANS,
  CREDIT_PACKAGES,
  type BillingPeriod,
  type SubscriptionPlanId,
} from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, planId, packageId, billingPeriod = 'monthly' } = body;

    // Validate request
    if (!type || (type !== 'subscription' && type !== 'onetime')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "subscription" or "onetime"' },
        { status: 400 }
      );
    }

    // Get or create Stripe customer
    const customerId = await getOrCreateCustomer(
      session.user.id || session.user.email,
      session.user.email,
      session.user.name || undefined
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/dashboard?payment=success`;
    const cancelUrl = `${appUrl}/pricing?payment=cancelled`;

    let checkoutSession;

    if (type === 'subscription') {
      // Validate subscription plan
      if (!planId || !SUBSCRIPTION_PLANS[planId as SubscriptionPlanId]) {
        return NextResponse.json(
          { error: 'Invalid plan ID' },
          { status: 400 }
        );
      }

      // Validate billing period
      if (billingPeriod !== 'monthly' && billingPeriod !== 'yearly') {
        return NextResponse.json(
          { error: 'Invalid billing period. Must be "monthly" or "yearly"' },
          { status: 400 }
        );
      }

      checkoutSession = await createSubscriptionCheckout(
        customerId,
        planId as SubscriptionPlanId,
        billingPeriod as BillingPeriod,
        successUrl,
        cancelUrl
      );
    } else {
      // One-time purchase
      if (!packageId || !CREDIT_PACKAGES.find((p) => p.id === packageId)) {
        return NextResponse.json(
          { error: 'Invalid package ID' },
          { status: 400 }
        );
      }

      checkoutSession = await createCreditPurchaseCheckout(
        customerId,
        packageId,
        successUrl,
        cancelUrl
      );
    }

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error('Stripe checkout error:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
