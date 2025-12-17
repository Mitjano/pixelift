import { NextRequest, NextResponse } from 'next/server'
import { getUserByEmail, createUsage } from '@/lib/db'
import { sendCreditsLowEmail, sendCreditsDepletedEmail } from '@/lib/email'
import { imageProcessingLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'
import { authenticateRequest } from '@/lib/api-auth'
import { ImageProcessor } from '@/lib/image-processor'
import { CREDIT_COSTS } from '@/lib/credits-config'

// For App Router - set max duration for AI processing
export const maxDuration = 120 // 2 minutes timeout
export const dynamic = 'force-dynamic'

const CREDITS_PER_RESTORE = CREDIT_COSTS.face_restore.cost

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const { allowed, resetAt } = imageProcessingLimiter.check(identifier)
    if (!allowed) {
      return rateLimitResponse(resetAt)
    }

    // 1. AUTHENTICATION
    const authResult = await authenticateRequest(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.statusCode || 401 }
      )
    }

    // 2. GET USER
    const user = await getUserByEmail(authResult.user!.email)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // 3. GET FILE FROM FORMDATA
    const formData = await request.formData()
    const file = formData.get('file') as File
    const fidelityParam = parseFloat(formData.get('fidelity') as string) || 0.7

    // Fidelity between 0 and 1 (higher = more faithful to original, lower = more enhancement)
    const fidelity = Math.max(0, Math.min(1, fidelityParam))

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // 4. VALIDATE FILE
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: JPG, PNG, WEBP' },
        { status: 400 }
      )
    }

    const MAX_SIZE = 20 * 1024 * 1024 // 20MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 20MB' },
        { status: 400 }
      )
    }

    // 5. CHECK CREDITS
    if (user.credits < CREDITS_PER_RESTORE) {
      if (user.credits === 0) {
        sendCreditsDepletedEmail({
          userEmail: user.email,
          userName: user.name || 'User',
          totalImagesProcessed: user.totalUsage || 0,
        }).catch(err => console.error('Failed to send credits depleted email:', err))
      }
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          required: CREDITS_PER_RESTORE,
          available: user.credits,
        },
        { status: 402 }
      )
    }

    // 6. CONVERT TO BASE64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const mimeType = file.type
    const dataUrl = `data:${mimeType};base64,${base64}`

    // 7. CALL CODEFORMER
    const resultUrl = await ImageProcessor.restoreFace(dataUrl, fidelity)

    // 8. DOWNLOAD RESULT AND CONVERT TO BASE64
    const resultResponse = await fetch(resultUrl)
    if (!resultResponse.ok) {
      throw new Error('Failed to download restored image')
    }
    const resultBuffer = Buffer.from(await resultResponse.arrayBuffer())
    const resultBase64 = resultBuffer.toString('base64')
    const resultDataUrl = `data:image/png;base64,${resultBase64}`

    // 9. DEDUCT CREDITS & LOG USAGE
    await createUsage({
      userId: user.id,
      type: 'face_restore',
      creditsUsed: CREDITS_PER_RESTORE,
      imageSize: `${file.size} bytes`,
      model: 'CodeFormer',
    })

    const newCredits = user.credits - CREDITS_PER_RESTORE

    // 10. SEND LOW CREDITS WARNING
    if (newCredits > 0 && newCredits <= 10) {
      sendCreditsLowEmail({
        userEmail: user.email,
        userName: user.name || 'User',
        creditsRemaining: newCredits,
      }).catch(err => console.error('Failed to send low credits email:', err))
    }

    // 11. RETURN SUCCESS
    return NextResponse.json({
      success: true,
      restoredImage: resultDataUrl,
      model: 'CodeFormer',
      fidelity: fidelity,
      creditsUsed: CREDITS_PER_RESTORE,
      creditsRemaining: newCredits,
    })

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Face restoration error:', error)
    return NextResponse.json(
      {
        error: 'Failed to restore face',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
