import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/stripe/checkout/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/stripe', () => ({
  getOrCreateCustomer: vi.fn(),
  createSubscriptionCheckout: vi.fn(),
  createCreditPurchaseCheckout: vi.fn(),
  SUBSCRIPTION_PLANS: {
    pro: { id: 'pro', name: 'Pro Plan' },
    business: { id: 'business', name: 'Business Plan' },
  },
  CREDIT_PACKAGES: [
    { id: 'small', credits: 100 },
    { id: 'medium', credits: 500 },
    { id: 'large', credits: 1000 },
  ],
}));

import { auth } from '@/lib/auth';
import {
  getOrCreateCustomer,
  createSubscriptionCheckout,
  createCreditPurchaseCheckout,
} from '@/lib/stripe';

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockGetOrCreateCustomer = getOrCreateCustomer as ReturnType<typeof vi.fn>;
const mockCreateSubscriptionCheckout = createSubscriptionCheckout as ReturnType<typeof vi.fn>;
const mockCreateCreditPurchaseCheckout = createCreditPurchaseCheckout as ReturnType<typeof vi.fn>;

describe('/api/stripe/checkout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const createRequest = (body: object): NextRequest => {
    return new NextRequest('http://localhost:3000/api/stripe/checkout', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' },
    });
  };

  describe('POST /api/stripe/checkout', () => {
    it('should return 401 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const request = createRequest({ type: 'subscription', planId: 'pro' });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Unauthorized');
    });

    it('should return 400 for missing type', async () => {
      mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });

      const request = createRequest({ planId: 'pro' });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid type. Must be "subscription" or "onetime"');
    });

    it('should return 400 for invalid type', async () => {
      mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });

      const request = createRequest({ type: 'invalid', planId: 'pro' });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid type. Must be "subscription" or "onetime"');
    });

    describe('subscription checkout', () => {
      it('should return 400 for invalid plan ID', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockGetOrCreateCustomer.mockResolvedValue('cus_123');

        const request = createRequest({ type: 'subscription', planId: 'invalid' });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid plan ID');
      });

      it('should return 400 for missing plan ID', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockGetOrCreateCustomer.mockResolvedValue('cus_123');

        const request = createRequest({ type: 'subscription' });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid plan ID');
      });

      it('should return 400 for invalid billing period', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockGetOrCreateCustomer.mockResolvedValue('cus_123');

        const request = createRequest({
          type: 'subscription',
          planId: 'pro',
          billingPeriod: 'weekly',
        });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid billing period. Must be "monthly" or "yearly"');
      });

      it('should create subscription checkout successfully', async () => {
        mockAuth.mockResolvedValue({
          user: { email: 'test@example.com', id: '1', name: 'Test User' },
        });
        mockGetOrCreateCustomer.mockResolvedValue('cus_123');
        mockCreateSubscriptionCheckout.mockResolvedValue({
          id: 'cs_123',
          url: 'https://checkout.stripe.com/session/123',
        });

        const request = createRequest({
          type: 'subscription',
          planId: 'pro',
          billingPeriod: 'monthly',
        });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.sessionId).toBe('cs_123');
        expect(body.url).toBe('https://checkout.stripe.com/session/123');
        expect(mockCreateSubscriptionCheckout).toHaveBeenCalledWith(
          'cus_123',
          'pro',
          'monthly',
          expect.stringContaining('/dashboard?payment=success'),
          expect.stringContaining('/pricing?payment=cancelled')
        );
      });

      it('should use yearly billing period', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockGetOrCreateCustomer.mockResolvedValue('cus_123');
        mockCreateSubscriptionCheckout.mockResolvedValue({
          id: 'cs_123',
          url: 'https://checkout.stripe.com/session/123',
        });

        const request = createRequest({
          type: 'subscription',
          planId: 'pro',
          billingPeriod: 'yearly',
        });
        await POST(request);

        expect(mockCreateSubscriptionCheckout).toHaveBeenCalledWith(
          'cus_123',
          'pro',
          'yearly',
          expect.any(String),
          expect.any(String)
        );
      });
    });

    describe('one-time purchase checkout', () => {
      it('should return 400 for invalid package ID', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockGetOrCreateCustomer.mockResolvedValue('cus_123');

        const request = createRequest({ type: 'onetime', packageId: 'invalid' });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid package ID');
      });

      it('should return 400 for missing package ID', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockGetOrCreateCustomer.mockResolvedValue('cus_123');

        const request = createRequest({ type: 'onetime' });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(400);
        expect(body.error).toBe('Invalid package ID');
      });

      it('should create credit purchase checkout successfully', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockGetOrCreateCustomer.mockResolvedValue('cus_123');
        mockCreateCreditPurchaseCheckout.mockResolvedValue({
          id: 'cs_456',
          url: 'https://checkout.stripe.com/session/456',
        });

        const request = createRequest({ type: 'onetime', packageId: 'medium' });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.sessionId).toBe('cs_456');
        expect(body.url).toBe('https://checkout.stripe.com/session/456');
        expect(mockCreateCreditPurchaseCheckout).toHaveBeenCalledWith(
          'cus_123',
          'medium',
          expect.stringContaining('/dashboard?payment=success'),
          expect.stringContaining('/pricing?payment=cancelled')
        );
      });
    });

    describe('error handling', () => {
      it('should return 500 with error message on Error', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockGetOrCreateCustomer.mockRejectedValue(new Error('Stripe API error'));

        const request = createRequest({ type: 'subscription', planId: 'pro' });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe('Stripe API error');
      });

      it('should return generic error message on non-Error', async () => {
        mockAuth.mockResolvedValue({ user: { email: 'test@example.com', id: '1' } });
        mockGetOrCreateCustomer.mockRejectedValue('Unknown error');

        const request = createRequest({ type: 'subscription', planId: 'pro' });
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(500);
        expect(body.error).toBe('Failed to create checkout session');
      });
    });
  });
});
