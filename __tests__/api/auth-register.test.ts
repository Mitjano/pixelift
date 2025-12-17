import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/register/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/db', () => ({
  getUserByEmail: vi.fn(),
}));

vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/email-verification', () => ({
  createVerificationToken: vi.fn(),
  sendVerificationEmail: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  createRateLimiter: vi.fn(() => ({
    check: vi.fn(() => ({ allowed: true, remaining: 2, resetAt: Date.now() + 3600000 })),
  })),
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('hashed_password')),
  },
}));

import { getUserByEmail } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { createVerificationToken, sendVerificationEmail } from '@/lib/email-verification';

const mockGetUserByEmail = getUserByEmail as ReturnType<typeof vi.fn>;
const mockPrismaUserCreate = prisma.user.create as ReturnType<typeof vi.fn>;
const mockCreateVerificationToken = createVerificationToken as ReturnType<typeof vi.fn>;
const mockSendVerificationEmail = sendVerificationEmail as ReturnType<typeof vi.fn>;

describe('/api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  const createRequest = (body: object): NextRequest => {
    return new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '127.0.0.1',
      },
    });
  };

  describe('POST /api/auth/register', () => {
    it('should return 400 when email is missing', async () => {
      const request = createRequest({ password: 'Password123' });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Email and password are required');
    });

    it('should return 400 when password is missing', async () => {
      const request = createRequest({ email: 'test@example.com' });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Email and password are required');
    });

    it('should return 400 for invalid email format', async () => {
      const request = createRequest({
        email: 'invalid-email',
        password: 'Password123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid email format');
    });

    it('should return 400 when password is too short', async () => {
      const request = createRequest({
        email: 'test@example.com',
        password: 'Pass1',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('at least 8 characters');
    });

    it('should return 400 when password has no uppercase', async () => {
      const request = createRequest({
        email: 'test@example.com',
        password: 'password123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('uppercase');
    });

    it('should return 400 when password has no lowercase', async () => {
      const request = createRequest({
        email: 'test@example.com',
        password: 'PASSWORD123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('lowercase');
    });

    it('should return 400 when password has no number', async () => {
      const request = createRequest({
        email: 'test@example.com',
        password: 'Passwordabc',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('number');
    });

    it('should return 409 when email already exists', async () => {
      mockGetUserByEmail.mockResolvedValue({ id: '1', email: 'test@example.com' });

      const request = createRequest({
        email: 'test@example.com',
        password: 'Password123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(409);
      expect(body.error).toBe('An account with this email already exists');
    });

    it('should create user successfully with valid data', async () => {
      mockGetUserByEmail.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 'new-user-id',
        email: 'test@example.com',
        name: 'Test User',
      });
      mockCreateVerificationToken.mockResolvedValue('verification-token');
      mockSendVerificationEmail.mockResolvedValue(true);

      const request = createRequest({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Registration successful');
      expect(mockPrismaUserCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            email: 'test@example.com',
            name: 'Test User',
            password: 'hashed_password',
            credits: 3,
            authProvider: 'credentials',
          }),
        })
      );
    });

    it('should send verification email after registration', async () => {
      mockGetUserByEmail.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 'new-user-id',
        email: 'test@example.com',
        name: 'Test User',
      });
      mockCreateVerificationToken.mockResolvedValue('verification-token');
      mockSendVerificationEmail.mockResolvedValue(true);

      const request = createRequest({
        email: 'test@example.com',
        password: 'Password123',
        name: 'Test User',
      });
      await POST(request);

      expect(mockCreateVerificationToken).toHaveBeenCalledWith('new-user-id', 'test@example.com');
      expect(mockSendVerificationEmail).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        'verification-token'
      );
    });

    it('should handle email sending failure gracefully', async () => {
      mockGetUserByEmail.mockResolvedValue(null);
      mockPrismaUserCreate.mockResolvedValue({
        id: 'new-user-id',
        email: 'test@example.com',
        name: null,
      });
      mockCreateVerificationToken.mockResolvedValue('token');
      mockSendVerificationEmail.mockResolvedValue(false);

      const request = createRequest({
        email: 'test@example.com',
        password: 'Password123',
      });
      const response = await POST(request);
      const body = await response.json();

      // Should still return success even if email fails
      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
    });

    it('should return 500 on database error', async () => {
      mockGetUserByEmail.mockResolvedValue(null);
      mockPrismaUserCreate.mockRejectedValue(new Error('Database error'));

      const request = createRequest({
        email: 'test@example.com',
        password: 'Password123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe('Registration failed. Please try again.');
    });
  });
});
