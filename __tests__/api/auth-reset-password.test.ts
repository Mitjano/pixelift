import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/auth/reset-password/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    passwordResetToken: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    user: {
      update: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: vi.fn(() => Promise.resolve('new_hashed_password')),
  },
}));

import { prisma } from '@/lib/prisma';

const mockFindUnique = prisma.passwordResetToken.findUnique as ReturnType<typeof vi.fn>;
const mockTokenUpdate = prisma.passwordResetToken.update as ReturnType<typeof vi.fn>;
const mockTokenDelete = prisma.passwordResetToken.delete as ReturnType<typeof vi.fn>;
const mockUserUpdate = prisma.user.update as ReturnType<typeof vi.fn>;

describe('/api/auth/reset-password', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  const createRequest = (body: object): NextRequest => {
    return new NextRequest('http://localhost:3000/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  describe('POST /api/auth/reset-password', () => {
    it('should return 400 when token is missing', async () => {
      const request = createRequest({ password: 'NewPassword123' });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Reset token is required');
    });

    it('should return 400 when password is missing', async () => {
      const request = createRequest({ token: 'valid-token' });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('New password is required');
    });

    it('should return 400 when password is too short', async () => {
      const request = createRequest({
        token: 'valid-token',
        password: 'Pass1',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('at least 8 characters');
    });

    it('should return 400 when password has no uppercase', async () => {
      const request = createRequest({
        token: 'valid-token',
        password: 'password123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('uppercase');
    });

    it('should return 400 when password has no lowercase', async () => {
      const request = createRequest({
        token: 'valid-token',
        password: 'PASSWORD123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('lowercase');
    });

    it('should return 400 when password has no number', async () => {
      const request = createRequest({
        token: 'valid-token',
        password: 'Passwordabc',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('number');
    });

    it('should return 400 when token not found', async () => {
      mockFindUnique.mockResolvedValue(null);

      const request = createRequest({
        token: 'invalid-token',
        password: 'NewPassword123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toBe('Invalid or expired reset token');
    });

    it('should return 400 when token is expired', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'token-id',
        token: 'expired-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        usedAt: null,
      });
      mockTokenDelete.mockResolvedValue({});

      const request = createRequest({
        token: 'expired-token',
        password: 'NewPassword123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('expired');
    });

    it('should return 400 when token was already used', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'token-id',
        token: 'used-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 3600000), // Still valid
        usedAt: new Date(), // But already used
      });

      const request = createRequest({
        token: 'used-token',
        password: 'NewPassword123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(400);
      expect(body.error).toContain('already been used');
    });

    it('should reset password successfully with valid token', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'token-id',
        token: 'valid-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      });
      mockUserUpdate.mockResolvedValue({ id: 'user-123' });
      mockTokenUpdate.mockResolvedValue({ id: 'token-id' });

      const request = createRequest({
        token: 'valid-token',
        password: 'NewPassword123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.success).toBe(true);
      expect(body.message).toContain('Password reset successfully');
    });

    it('should hash the new password', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'token-id',
        token: 'valid-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      });
      mockUserUpdate.mockResolvedValue({ id: 'user-123' });
      mockTokenUpdate.mockResolvedValue({ id: 'token-id' });

      const request = createRequest({
        token: 'valid-token',
        password: 'NewPassword123',
      });
      await POST(request);

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          password: 'new_hashed_password',
        }),
      });
    });

    it('should mark email as verified after password reset', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'token-id',
        token: 'valid-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      });
      mockUserUpdate.mockResolvedValue({ id: 'user-123' });
      mockTokenUpdate.mockResolvedValue({ id: 'token-id' });

      const request = createRequest({
        token: 'valid-token',
        password: 'NewPassword123',
      });
      await POST(request);

      expect(mockUserUpdate).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        data: expect.objectContaining({
          emailVerified: true,
          emailVerifiedAt: expect.any(Date),
        }),
      });
    });

    it('should mark token as used after successful reset', async () => {
      mockFindUnique.mockResolvedValue({
        id: 'token-id',
        token: 'valid-token',
        userId: 'user-123',
        expiresAt: new Date(Date.now() + 3600000),
        usedAt: null,
      });
      mockUserUpdate.mockResolvedValue({ id: 'user-123' });
      mockTokenUpdate.mockResolvedValue({ id: 'token-id' });

      const request = createRequest({
        token: 'valid-token',
        password: 'NewPassword123',
      });
      await POST(request);

      expect(mockTokenUpdate).toHaveBeenCalledWith({
        where: { token: 'valid-token' },
        data: { usedAt: expect.any(Date) },
      });
    });

    it('should return 500 on database error', async () => {
      mockFindUnique.mockRejectedValue(new Error('Database error'));

      const request = createRequest({
        token: 'valid-token',
        password: 'NewPassword123',
      });
      const response = await POST(request);
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe('Failed to reset password. Please try again.');
    });
  });
});
