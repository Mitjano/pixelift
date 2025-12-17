import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/auth/forgot-password/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  getUserByEmail: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    passwordResetToken: {
      deleteMany: vi.fn(),
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/rate-limit', () => ({
  createRateLimiter: vi.fn(() => ({
    check: vi.fn(() => ({ allowed: true, remaining: 2, resetAt: Date.now() + 3600000 })),
  })),
}));

import { getUserByEmail } from '@/lib/db';
import { prisma } from '@/lib/prisma';

const mockGetUserByEmail = getUserByEmail as ReturnType<typeof vi.fn>;
const mockCreate = prisma.passwordResetToken.create as ReturnType<typeof vi.fn>;

describe('/api/auth/forgot-password', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    // Don't set RESEND_API_KEY to skip email sending
    process.env = { ...originalEnv, NEXTAUTH_URL: 'http://localhost:3000' };
    delete process.env.RESEND_API_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const createRequest = (body: object): NextRequest => {
    return new NextRequest('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
    });
  };

  describe('POST /api/auth/forgot-password', () => {
    it('should return 400 when email is missing', async () => {
      const request = createRequest({});
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Email is required');
    });

    it('should return success even when user does not exist (prevents enumeration)', async () => {
      mockGetUserByEmail.mockResolvedValue(null);

      const request = createRequest({ email: 'nonexistent@example.com' });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toContain('If an account with that email exists');
    });

    it('should return success for OAuth user without password (prevents enumeration)', async () => {
      mockGetUserByEmail.mockResolvedValue({
        id: '1',
        email: 'oauth@example.com',
        password: null, // OAuth user
      });

      const request = createRequest({ email: 'oauth@example.com' });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      // Should not create token for OAuth users
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should normalize email to lowercase', async () => {
      mockGetUserByEmail.mockResolvedValue(null);

      const request = createRequest({ email: '  USER@EXAMPLE.COM  ' });
      await POST(request);

      expect(mockGetUserByEmail).toHaveBeenCalledWith('user@example.com');
    });

    it('should return 500 on database error', async () => {
      mockGetUserByEmail.mockRejectedValue(new Error('Database error'));

      const request = createRequest({ email: 'user@example.com' });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe('Failed to process request. Please try again.');
    });
  });
});
