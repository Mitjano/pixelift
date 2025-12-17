import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/stripe/webhook/route';
import { NextRequest } from 'next/server';

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

// Mock dependencies
vi.mock('@/lib/stripe', () => ({
  verifyWebhookSignature: vi.fn(),
  getPlanByPriceId: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getUserByEmail: vi.fn(),
  updateUser: vi.fn(),
  createTransaction: vi.fn(),
  getAllUsers: vi.fn(),
  getTransactionsByUserId: vi.fn(),
}));

vi.mock('@/lib/email', () => ({
  sendPurchaseConfirmationEmail: vi.fn(),
  sendPaymentFailedEmail: vi.fn(),
  sendSubscriptionCancelledEmail: vi.fn(),
}));

import { headers } from 'next/headers';
import { verifyWebhookSignature, getPlanByPriceId } from '@/lib/stripe';
import {
  getUserByEmail,
  updateUser,
  createTransaction,
  getAllUsers,
  getTransactionsByUserId,
} from '@/lib/db';
import {
  sendPurchaseConfirmationEmail,
  sendPaymentFailedEmail,
} from '@/lib/email';

const mockHeaders = headers as ReturnType<typeof vi.fn>;
const mockVerifyWebhookSignature = verifyWebhookSignature as ReturnType<typeof vi.fn>;
const mockGetPlanByPriceId = getPlanByPriceId as ReturnType<typeof vi.fn>;
const mockGetUserByEmail = getUserByEmail as ReturnType<typeof vi.fn>;
const mockUpdateUser = updateUser as ReturnType<typeof vi.fn>;
const mockCreateTransaction = createTransaction as ReturnType<typeof vi.fn>;
const mockGetAllUsers = getAllUsers as ReturnType<typeof vi.fn>;
const mockGetTransactionsByUserId = getTransactionsByUserId as ReturnType<typeof vi.fn>;
const mockSendPurchaseConfirmationEmail = sendPurchaseConfirmationEmail as ReturnType<typeof vi.fn>;
const mockSendPaymentFailedEmail = sendPaymentFailedEmail as ReturnType<typeof vi.fn>;

describe('/api/stripe/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  const createRequest = (body: string): NextRequest => {
    return new NextRequest('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  describe('POST /api/stripe/webhook', () => {
    it('should return 400 when signature is missing', async () => {
      mockHeaders.mockResolvedValue({
        get: () => null,
      });

      const request = createRequest('{}');
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Missing signature');
    });

    it('should return 400 when signature verification fails', async () => {
      mockHeaders.mockResolvedValue({
        get: (name: string) => (name === 'stripe-signature' ? 'sig_123' : null),
      });
      mockVerifyWebhookSignature.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      const request = createRequest('{}');
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid signature');
    });

    it('should handle unhandled event types gracefully', async () => {
      mockHeaders.mockResolvedValue({
        get: (name: string) => (name === 'stripe-signature' ? 'sig_123' : null),
      });
      mockVerifyWebhookSignature.mockReturnValue({
        type: 'some.unknown.event',
        data: { object: {} },
      });

      const request = createRequest('{}');
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.received).toBe(true);
    });

    describe('checkout.session.completed', () => {
      it('should add credits for one-time purchase', async () => {
        mockHeaders.mockResolvedValue({
          get: (name: string) => (name === 'stripe-signature' ? 'sig_123' : null),
        });
        mockVerifyWebhookSignature.mockReturnValue({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_123',
              customer_email: 'test@example.com',
              amount_total: 4900,
              currency: 'pln',
              metadata: {
                type: 'onetime',
                credits: '500',
                packageId: 'medium',
              },
            },
          },
        });
        mockGetUserByEmail.mockResolvedValue({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          credits: 100,
        });
        mockUpdateUser.mockResolvedValue({});
        mockCreateTransaction.mockResolvedValue({});
        mockSendPurchaseConfirmationEmail.mockResolvedValue(true);

        const request = createRequest('{}');
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.received).toBe(true);
        expect(mockUpdateUser).toHaveBeenCalledWith('1', { credits: 600 });
        expect(mockCreateTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: '1',
            type: 'purchase',
            amount: 49,
            status: 'completed',
          })
        );
      });

      it('should update role for subscription', async () => {
        mockHeaders.mockResolvedValue({
          get: (name: string) => (name === 'stripe-signature' ? 'sig_123' : null),
        });
        mockVerifyWebhookSignature.mockReturnValue({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_123',
              customer_email: 'test@example.com',
              metadata: {
                type: 'subscription',
              },
            },
          },
        });
        mockGetUserByEmail.mockResolvedValue({
          id: '1',
          email: 'test@example.com',
        });
        mockUpdateUser.mockResolvedValue({});

        const request = createRequest('{}');
        const response = await POST(request);

        expect(mockUpdateUser).toHaveBeenCalledWith('1', { role: 'premium' });
      });

      it('should handle missing metadata gracefully', async () => {
        mockHeaders.mockResolvedValue({
          get: (name: string) => (name === 'stripe-signature' ? 'sig_123' : null),
        });
        mockVerifyWebhookSignature.mockReturnValue({
          type: 'checkout.session.completed',
          data: {
            object: {
              id: 'cs_123',
              customer_email: 'test@example.com',
              metadata: null,
            },
          },
        });

        const request = createRequest('{}');
        const response = await POST(request);
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.received).toBe(true);
        expect(mockUpdateUser).not.toHaveBeenCalled();
      });
    });

    describe('invoice.payment_succeeded', () => {
      it('should add credits for subscription payment', async () => {
        mockHeaders.mockResolvedValue({
          get: (name: string) => (name === 'stripe-signature' ? 'sig_123' : null),
        });
        mockVerifyWebhookSignature.mockReturnValue({
          type: 'invoice.payment_succeeded',
          data: {
            object: {
              id: 'in_123',
              subscription: 'sub_123',
              customer_email: 'test@example.com',
              amount_paid: 9900,
              currency: 'pln',
              lines: {
                data: [{ price: { id: 'price_pro_monthly' } }],
              },
            },
          },
        });
        mockGetUserByEmail.mockResolvedValue({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
          credits: 50,
        });
        mockGetPlanByPriceId.mockReturnValue({
          plan: { id: 'pro', name: 'Pro', credits: 1000 },
          billingPeriod: 'monthly',
        });
        mockUpdateUser.mockResolvedValue({});
        mockCreateTransaction.mockResolvedValue({});
        mockSendPurchaseConfirmationEmail.mockResolvedValue(true);

        const request = createRequest('{}');
        const response = await POST(request);

        expect(mockUpdateUser).toHaveBeenCalledWith('1', { credits: 1050 });
        expect(mockCreateTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: '1',
            type: 'subscription',
            status: 'completed',
          })
        );
      });

      it('should skip non-subscription invoices', async () => {
        mockHeaders.mockResolvedValue({
          get: (name: string) => (name === 'stripe-signature' ? 'sig_123' : null),
        });
        mockVerifyWebhookSignature.mockReturnValue({
          type: 'invoice.payment_succeeded',
          data: {
            object: {
              id: 'in_123',
              subscription: null, // No subscription
              customer_email: 'test@example.com',
            },
          },
        });

        const request = createRequest('{}');
        await POST(request);

        expect(mockGetUserByEmail).not.toHaveBeenCalled();
      });
    });

    describe('invoice.payment_failed', () => {
      it('should record failed transaction and send email', async () => {
        mockHeaders.mockResolvedValue({
          get: (name: string) => (name === 'stripe-signature' ? 'sig_123' : null),
        });
        mockVerifyWebhookSignature.mockReturnValue({
          type: 'invoice.payment_failed',
          data: {
            object: {
              id: 'in_123',
              subscription: 'sub_123',
              customer_email: 'test@example.com',
              amount_due: 9900,
              currency: 'pln',
              attempt_count: 1,
              lines: {
                data: [{ price: { id: 'price_pro_monthly' } }],
              },
            },
          },
        });
        mockGetUserByEmail.mockResolvedValue({
          id: '1',
          email: 'test@example.com',
          name: 'Test User',
        });
        mockGetPlanByPriceId.mockReturnValue({
          plan: { id: 'pro', name: 'Pro' },
        });
        mockCreateTransaction.mockResolvedValue({});
        mockSendPaymentFailedEmail.mockResolvedValue(true);

        const request = createRequest('{}');
        const response = await POST(request);

        expect(mockCreateTransaction).toHaveBeenCalledWith(
          expect.objectContaining({
            userId: '1',
            type: 'subscription',
            status: 'failed',
          })
        );
        expect(mockSendPaymentFailedEmail).toHaveBeenCalled();
      });
    });

    describe('customer.subscription.updated', () => {
      it('should update user role to premium when subscription is active', async () => {
        mockHeaders.mockResolvedValue({
          get: (name: string) => (name === 'stripe-signature' ? 'sig_123' : null),
        });
        mockVerifyWebhookSignature.mockReturnValue({
          type: 'customer.subscription.updated',
          data: {
            object: {
              id: 'sub_123',
              customer: 'cus_123',
              status: 'active',
            },
          },
        });
        mockGetAllUsers.mockResolvedValue([{ id: '1', email: 'test@example.com' }]);
        mockGetTransactionsByUserId.mockResolvedValue([
          { metadata: JSON.stringify({ customerId: 'cus_123' }) },
        ]);
        mockUpdateUser.mockResolvedValue({});

        const request = createRequest('{}');
        await POST(request);

        expect(mockUpdateUser).toHaveBeenCalledWith('1', { role: 'premium' });
      });

      it('should downgrade user when subscription is canceled', async () => {
        mockHeaders.mockResolvedValue({
          get: (name: string) => (name === 'stripe-signature' ? 'sig_123' : null),
        });
        mockVerifyWebhookSignature.mockReturnValue({
          type: 'customer.subscription.updated',
          data: {
            object: {
              id: 'sub_123',
              customer: 'cus_123',
              status: 'canceled',
            },
          },
        });
        mockGetAllUsers.mockResolvedValue([{ id: '1', email: 'test@example.com' }]);
        mockGetTransactionsByUserId.mockResolvedValue([
          { metadata: JSON.stringify({ customerId: 'cus_123' }) },
        ]);
        mockUpdateUser.mockResolvedValue({});

        const request = createRequest('{}');
        await POST(request);

        expect(mockUpdateUser).toHaveBeenCalledWith('1', { role: 'user' });
      });
    });

    it('should return 500 on unexpected error', async () => {
      mockHeaders.mockResolvedValue({
        get: (name: string) => (name === 'stripe-signature' ? 'sig_123' : null),
      });
      mockVerifyWebhookSignature.mockImplementation(() => {
        throw new Error('Unexpected error');
      });

      const request = createRequest('{}');
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid signature');
    });
  });
});
