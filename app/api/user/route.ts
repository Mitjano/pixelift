import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { getUserByEmail } from '@/lib/db'
import { prisma } from '@/lib/prisma'
import { userEndpointLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'

/**
 * GET /api/user
 * Get current user data including role and credits
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
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

    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      email: user.email,
      name: user.name,
      displayName: user.displayName || user.name,
      role: user.role,
      credits: user.credits,
    })
  } catch (error) {
    console.error('Error fetching user data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user
 * Update user display name
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await getUserByEmail(session.user.email)

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { displayName } = body

    // Validate display name
    if (typeof displayName !== 'string') {
      return NextResponse.json(
        { error: 'Invalid display name' },
        { status: 400 }
      )
    }

    const trimmedName = displayName.trim()
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      return NextResponse.json(
        { error: 'Display name must be between 2 and 50 characters' },
        { status: 400 }
      )
    }

    // Update display name in database
    await prisma.user.update({
      where: { id: user.id },
      data: { displayName: trimmedName },
    })

    return NextResponse.json({
      success: true,
      displayName: trimmedName,
    })
  } catch (error) {
    console.error('Error updating user data:', error)
    return NextResponse.json(
      { error: 'Failed to update user data' },
      { status: 500 }
    )
  }
}
