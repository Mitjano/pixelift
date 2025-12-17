import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

// Mock stripe functions
vi.mock('@/lib/stripe', () => ({
  getOrCreateCustomer: vi.fn(),
  createSubscriptionCheckout: vi.fn(),
  createCreditPurchaseCheckout: vi.fn(),
  SUBSCRIPTION_PLANS: {
    starter: { name: 'Starter', monthlyPrice: 999, yearlyPrice: 9990, monthlyCredits: 100 },
    pro: { name: 'Pro', monthlyPrice: 2999, yearlyPrice: 29990, monthlyCredits: 500 },
    business: { name: 'Business', monthlyPrice: 9999, yearlyPrice: 99990, monthlyCredits: 2000 },
  },
  CREDIT_PACKAGES: [
    { id: 'credits_10', credits: 10, price: 499 },
    { id: 'credits_50', credits: 50, price: 1999 },
    { id: 'credits_100', credits: 100, price: 3499 },
  ],
}));

import { auth } from '@/lib/auth';
import {
  getOrCreateCustomer,
  createSubscriptionCheckout,
  createCreditPurchaseCheckout,
} from '@/lib/stripe';
import { POST } from '@/app/api/stripe/checkout/route';

// Helper to create mock request
function createMockRequest(body: object): NextRequest {
  return new NextRequest('http://localhost:3000/api/stripe/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
    },
  });
}

describe('Payment Flow Integration Tests', () => {
  const mockSession = {
    user: {
      id: 'user-123',
      email: 'user@example.com',
      name: 'Test User',
    },
  };

  const mockCheckoutSession = {
    id: 'cs_test_123',
    url: 'https://checkout.stripe.com/pay/cs_test_123',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default authenticated user
    (auth as ReturnType<typeof vi.fn>).mockResolvedValue(mockSession);

    // Mock Stripe functions
    (getOrCreateCustomer as ReturnType<typeof vi.fn>).mockResolvedValue('cus_test_123');
    (createSubscriptionCheckout as ReturnType<typeof vi.fn>).mockResolvedValue(mockCheckoutSession);
    (createCreditPurchaseCheckout as ReturnType<typeof vi.fn>).mockResolvedValue(mockCheckoutSession);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    it('should reject unauthenticated request', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should reject request without email', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: { id: 'user-123' },
      });

      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });

  describe('Subscription Checkout', () => {
    it('should create checkout for starter plan monthly', async () => {
      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
        billingPeriod: 'monthly',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe('cs_test_123');
      expect(data.url).toContain('checkout.stripe.com');
    });

    it('should create checkout for pro plan yearly', async () => {
      const request = createMockRequest({
        type: 'subscription',
        planId: 'pro',
        billingPeriod: 'yearly',
      });

      const response = await POST(request);

      expect(createSubscriptionCheckout).toHaveBeenCalledWith(
        'cus_test_123',
        'pro',
        'yearly',
        expect.stringContaining('payment=success'),
        expect.stringContaining('payment=cancelled')
      );
    });

    it('should default to monthly billing', async () => {
      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
      });

      await POST(request);

      expect(createSubscriptionCheckout).toHaveBeenCalledWith(
        expect.any(String),
        'starter',
        'monthly',
        expect.any(String),
        expect.any(String)
      );
    });

    it('should reject invalid plan ID', async () => {
      const request = createMockRequest({
        type: 'subscription',
        planId: 'invalid_plan',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid plan ID');
    });

    it('should reject missing plan ID', async () => {
      const request = createMockRequest({
        type: 'subscription',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid plan ID');
    });

    it('should reject invalid billing period', async () => {
      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
        billingPeriod: 'weekly',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid billing period. Must be "monthly" or "yearly"');
    });
  });

  describe('One-time Credit Purchase', () => {
    it('should create checkout for 10 credits package', async () => {
      const request = createMockRequest({
        type: 'onetime',
        packageId: 'credits_10',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.sessionId).toBe('cs_test_123');
      expect(createCreditPurchaseCheckout).toHaveBeenCalled();
    });

    it('should create checkout for 50 credits package', async () => {
      const request = createMockRequest({
        type: 'onetime',
        packageId: 'credits_50',
      });

      await POST(request);

      expect(createCreditPurchaseCheckout).toHaveBeenCalledWith(
        'cus_test_123',
        'credits_50',
        expect.stringContaining('payment=success'),
        expect.stringContaining('payment=cancelled')
      );
    });

    it('should create checkout for 100 credits package', async () => {
      const request = createMockRequest({
        type: 'onetime',
        packageId: 'credits_100',
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should reject invalid package ID', async () => {
      const request = createMockRequest({
        type: 'onetime',
        packageId: 'invalid_package',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid package ID');
    });

    it('should reject missing package ID', async () => {
      const request = createMockRequest({
        type: 'onetime',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid package ID');
    });
  });

  describe('Type Validation', () => {
    it('should reject missing type', async () => {
      const request = createMockRequest({
        planId: 'starter',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid type. Must be "subscription" or "onetime"');
    });

    it('should reject invalid type', async () => {
      const request = createMockRequest({
        type: 'invalid',
        planId: 'starter',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid type. Must be "subscription" or "onetime"');
    });
  });

  describe('Stripe Customer', () => {
    it('should get or create Stripe customer', async () => {
      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
      });

      await POST(request);

      expect(getOrCreateCustomer).toHaveBeenCalledWith(
        'user-123',
        'user@example.com',
        'Test User'
      );
    });

    it('should use email as fallback when no user ID', async () => {
      (auth as ReturnType<typeof vi.fn>).mockResolvedValue({
        user: {
          email: 'user@example.com',
          name: 'Test User',
        },
      });

      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
      });

      await POST(request);

      expect(getOrCreateCustomer).toHaveBeenCalledWith(
        'user@example.com',
        'user@example.com',
        'Test User'
      );
    });
  });

  describe('Success and Cancel URLs', () => {
    it('should include success URL with payment success param', async () => {
      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
      });

      await POST(request);

      expect(createSubscriptionCheckout).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.stringContaining('dashboard?payment=success'),
        expect.any(String)
      );
    });

    it('should include cancel URL with payment cancelled param', async () => {
      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
      });

      await POST(request);

      expect(createSubscriptionCheckout).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.any(String),
        expect.stringContaining('pricing?payment=cancelled')
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe error gracefully', async () => {
      (createSubscriptionCheckout as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Stripe API error')
      );

      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Stripe API error');
    });

    it('should handle unknown error', async () => {
      (createSubscriptionCheckout as ReturnType<typeof vi.fn>).mockRejectedValue('Unknown error');

      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create checkout session');
    });

    it('should handle customer creation error', async () => {
      (getOrCreateCustomer as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('Customer creation failed')
      );

      const request = createMockRequest({
        type: 'subscription',
        planId: 'starter',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Customer creation failed');
    });
  });

  describe('All Plans', () => {
    const plans = ['starter', 'pro', 'business'];

    plans.forEach((planId) => {
      it(`should create checkout for ${planId} plan`, async () => {
        const request = createMockRequest({
          type: 'subscription',
          planId,
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(createSubscriptionCheckout).toHaveBeenCalledWith(
          expect.any(String),
          planId,
          expect.any(String),
          expect.any(String),
          expect.any(String)
        );
      });
    });
  });

  describe('All Credit Packages', () => {
    const packages = ['credits_10', 'credits_50', 'credits_100'];

    packages.forEach((packageId) => {
      it(`should create checkout for ${packageId} package`, async () => {
        const request = createMockRequest({
          type: 'onetime',
          packageId,
        });

        const response = await POST(request);

        expect(response.status).toBe(200);
        expect(createCreditPurchaseCheckout).toHaveBeenCalledWith(
          expect.any(String),
          packageId,
          expect.any(String),
          expect.any(String)
        );
      });
    });
  });
});
