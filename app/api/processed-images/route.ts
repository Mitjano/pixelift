import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ProcessedImagesDB } from '@/lib/processed-images-db'
import { userEndpointLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'

/**
 * GET /api/processed-images
 * Get all processed images for the authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(req);
    const { allowed, resetAt } = userEndpointLimiter.check(identifier);
    if (!allowed) {
      return rateLimitResponse(resetAt);
    }

    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const images = await ProcessedImagesDB.getByUserId(session.user.email)

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error fetching processed images:', error)
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    )
  }
}
