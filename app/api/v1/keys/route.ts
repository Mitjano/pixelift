/**
 * API Keys Management Endpoint
 * GET /api/v1/keys - List user's API keys
 * POST /api/v1/keys - Create new API key
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserByEmail,
  getApiKeysByUserId,
  createApiKey,
} from '@/lib/database';

// Rate limit based on user's credits
function getRateLimitForUser(credits: number): number {
  if (credits >= 30000) return 1000; // Enterprise
  if (credits >= 2000) return 500;   // Business
  if (credits >= 500) return 300;    // Pro
  if (credits >= 100) return 60;     // Starter
  return 10; // Free
}

// Plan name based on user's credits
function getPlanNameForCredits(credits: number): string {
  if (credits >= 30000) return 'Enterprise';
  if (credits >= 2000) return 'Business';
  if (credits >= 500) return 'Pro';
  if (credits >= 100) return 'Starter';
  return 'Free';
}

/**
 * GET /api/v1/keys
 * Get all API keys for the authenticated user
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    const keys = await getApiKeysByUserId(user.id);
    const activeKeys = keys.filter((k) => (k as any).isActive ?? (k as any).status === 'active');
    const totalRequests = keys.reduce((sum, k) => sum + (k.usageCount || 0), 0);

    // Find last used key
    const lastUsedKey = keys
      .filter((k) => k.lastUsedAt)
      .sort((a, b) => {
        const aTime = a.lastUsedAt ? new Date(a.lastUsedAt).getTime() : 0;
        const bTime = b.lastUsedAt ? new Date(b.lastUsedAt).getTime() : 0;
        return bTime - aTime;
      })[0];

    const planName = getPlanNameForCredits(user.credits || 0);
    const rateLimit = getRateLimitForUser(user.credits || 0);

    return NextResponse.json({
      success: true,
      data: {
        keys: keys.map((k) => ({
          id: k.id,
          name: k.name,
          key: (k as any).keyPrefix || ((k as any).key?.substring(0, 12) + '...') || 'pk_****',
          environment: (k as any).environment || 'live',
          is_active: (k as any).isActive ?? (k as any).status === 'active',
          rate_limit: k.rateLimit || rateLimit,
          usage_count: k.usageCount || 0,
          created_at: k.createdAt,
          last_used_at: k.lastUsedAt || null,
          expires_at: k.expiresAt || null,
        })),
        stats: {
          total_keys: keys.length,
          active_keys: activeKeys.length,
          total_requests: totalRequests,
          last_used: lastUsedKey?.lastUsedAt || null,
        },
        plan: {
          name: planName,
          credits: user.credits || 0,
          rate_limit: rateLimit,
        },
      },
    });
  } catch (error) {
    console.error('API Keys GET error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to get API keys', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v1/keys
 * Create a new API key
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, environment = 'live' } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: { message: 'Name is required', code: 'INVALID_INPUT' } },
        { status: 400 }
      );
    }

    if (environment !== 'live' && environment !== 'test') {
      return NextResponse.json(
        { success: false, error: { message: 'Environment must be "live" or "test"', code: 'INVALID_INPUT' } },
        { status: 400 }
      );
    }

    // Check key limit (max 10 keys per user)
    const existingKeys = await getApiKeysByUserId(user.id);
    if (existingKeys.length >= 10) {
      return NextResponse.json(
        { success: false, error: { message: 'Maximum 10 API keys allowed', code: 'KEY_LIMIT_REACHED' } },
        { status: 400 }
      );
    }

    const rateLimit = getRateLimitForUser(user.credits || 0);

    const apiKey = await createApiKey({
      userId: user.id,
      name: name.trim(),
      environment,
      rateLimit,
    });

    return NextResponse.json({
      success: true,
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: (apiKey as any).key, // Full key - only shown once!
        key_prefix: (apiKey as any).keyPrefix || (apiKey as any).key?.substring(0, 12) + '...',
        environment: (apiKey as any).environment || 'live',
        rate_limit: apiKey.rateLimit || rateLimit,
        created_at: apiKey.createdAt,
      },
      message: 'API key created successfully. Save this key securely - it will only be shown once!',
    }, { status: 201 });
  } catch (error) {
    console.error('API Keys POST error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to create API key', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
