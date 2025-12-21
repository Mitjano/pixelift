import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getUserByEmail } from '@/lib/db';
import { userEndpointLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit';

/**
 * GET /api/user/credits
 * Get current user's credits - lightweight endpoint for frequent polling
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const { allowed, resetAt } = userEndpointLimiter.check(identifier);
    if (!allowed) {
      return rateLimitResponse(resetAt);
    }

    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required', credits: 0 },
        { status: 401 }
      );
    }

    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found', credits: 0 },
        { status: 404 }
      );
    }

    return NextResponse.json({
      credits: user.credits || 0,
    });
  } catch (error) {
    console.error('[api/user/credits] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credits', credits: 0 },
      { status: 500 }
    );
  }
}
