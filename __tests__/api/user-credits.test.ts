import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/user/credits/route';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(),
}));

vi.mock('@/lib/db', () => ({
  getUserByEmail: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  userEndpointLimiter: { check: vi.fn(() => ({ allowed: true, remaining: 10, resetAt: Date.now() + 60000 })) },
  getClientIdentifier: vi.fn(() => 'test-ip'),
  rateLimitResponse: vi.fn(),
}));

import { auth } from '@/lib/auth';
import { getUserByEmail } from '@/lib/db';

const mockAuth = auth as ReturnType<typeof vi.fn>;
const mockGetUserByEmail = getUserByEmail as ReturnType<typeof vi.fn>;

// Helper to create mock request
function createMockRequest(): NextRequest {
  return new NextRequest('http://localhost/api/user/credits', {
    headers: { 'x-forwarded-for': '127.0.0.1' }
  });
}

describe('/api/user/credits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('GET /api/user/credits', () => {
    it('should return 401 with credits 0 when not authenticated', async () => {
      mockAuth.mockResolvedValue(null);

      const response = await GET(createMockRequest());
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body.error).toBe('Authentication required');
      expect(body.credits).toBe(0);
    });

    it('should return 404 with credits 0 when user not found', async () => {
      mockAuth.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockGetUserByEmail.mockResolvedValue(null);

      const response = await GET(createMockRequest());
      const body = await response.json();

      expect(response.status).toBe(404);
      expect(body.error).toBe('User not found');
      expect(body.credits).toBe(0);
    });

    it('should return user credits when authenticated', async () => {
      mockAuth.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockGetUserByEmail.mockResolvedValue({ credits: 150 });

      const response = await GET(createMockRequest());
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.credits).toBe(150);
    });

    it('should return 0 credits when user has null credits', async () => {
      mockAuth.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockGetUserByEmail.mockResolvedValue({ credits: null });

      const response = await GET(createMockRequest());
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.credits).toBe(0);
    });

    it('should return 0 credits when user has undefined credits', async () => {
      mockAuth.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockGetUserByEmail.mockResolvedValue({});

      const response = await GET(createMockRequest());
      const body = await response.json();

      expect(response.status).toBe(200);
      expect(body.credits).toBe(0);
    });

    it('should return 500 with credits 0 on database error', async () => {
      mockAuth.mockResolvedValue({ user: { email: 'test@example.com' } });
      mockGetUserByEmail.mockRejectedValue(new Error('Database error'));

      const response = await GET(createMockRequest());
      const body = await response.json();

      expect(response.status).toBe(500);
      expect(body.error).toBe('Failed to fetch credits');
      expect(body.credits).toBe(0);
    });
  });
});
