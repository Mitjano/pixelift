import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { getUserByEmail, createUsage } from '@/lib/db'
import { sendCreditsLowEmail, sendCreditsDepletedEmail } from '@/lib/email'
import { imageProcessingLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'
import { authenticateRequest } from '@/lib/api-auth'
import { CREDIT_COSTS } from '@/lib/credits-config'
import { ProcessedImagesDB } from '@/lib/processed-images-db'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

// For App Router - set max duration for processing
export const maxDuration = 120 // 2 minutes timeout
export const dynamic = 'force-dynamic'

const WATERMARK_REMOVER_CREDITS = CREDIT_COSTS.watermark_remover.cost

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
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 3. EXTRACT FORMDATA
    const formData = await request.formData()
    const file = formData.get('file') as File
    const maskFile = formData.get('mask') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // 4. VALIDATE FILE
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Supported: JPG, PNG, WEBP' },
        { status: 400 }
      )
    }

    const MAX_SIZE = 20 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 20MB' },
        { status: 400 }
      )
    }

    // 5. CHECK CREDITS
    const creditsNeeded = WATERMARK_REMOVER_CREDITS
    if (user.credits < creditsNeeded) {
      if (user.credits === 0) {
        sendCreditsDepletedEmail({
          userEmail: user.email,
          userName: user.name || 'User',
          totalImagesProcessed: user.totalUsage || 0,
        }).catch(err => console.error('Failed to send credits depleted email:', err))
      }
      return NextResponse.json(
        { error: 'Insufficient credits', required: creditsNeeded, available: user.credits },
        { status: 402 }
      )
    }

    // 6. CONVERT FILES TO BASE64
    const arrayBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString('base64')
    const imageDataUrl = `data:${file.type};base64,${base64}`

    let maskDataUrl: string | undefined
    if (maskFile) {
      const maskBuffer = await maskFile.arrayBuffer()
      const maskBase64 = Buffer.from(maskBuffer).toString('base64')
      maskDataUrl = `data:${maskFile.type};base64,${maskBase64}`
    }

    console.log('Processing watermark removal with LaMA...')

    // 7. PROCESS WITH LAMA INPAINTING
    // Using LaMA (Large Mask Inpainting) model for watermark removal
    const output = await replicate.run(
      "andreasjansson/stable-diffusion-inpainting:e490d072a34a94a11e9711ed5a6ba621c3fab884eda1665d9d3a282d65a21571",
      {
        input: {
          image: imageDataUrl,
          mask: maskDataUrl || imageDataUrl, // If no mask, use auto-detection
          prompt: "clean background, no watermark, no text, seamless texture",
          negative_prompt: "watermark, text, logo, signature, stamp",
          num_inference_steps: 25,
          guidance_scale: 7.5,
        },
      }
    )

    // Handle output - could be string or array
    let resultUrl: string
    if (Array.isArray(output)) {
      resultUrl = output[0] as string
    } else {
      resultUrl = output as unknown as string
    }

    if (!resultUrl) {
      throw new Error('No result from watermark removal')
    }

    // Download result and convert to base64
    const resultResponse = await fetch(resultUrl)
    const resultBuffer = Buffer.from(await resultResponse.arrayBuffer())
    const resultBase64 = resultBuffer.toString('base64')
    const processedDataUrl = `data:image/png;base64,${resultBase64}`

    // 8. SAVE TO DATABASE FOR SHARE LINK
    const imageRecord = await ProcessedImagesDB.create({
      userId: user.email,
      originalPath: imageDataUrl,
      processedPath: processedDataUrl,
      originalFilename: file.name,
      fileSize: file.size,
      width: 0,
      height: 0,
      isProcessed: true,
    })

    // 9. DEDUCT CREDITS & LOG USAGE
    await createUsage({
      userId: user.id,
      type: 'watermark_remover',
      creditsUsed: creditsNeeded,
      imageSize: `${file.size} bytes`,
      model: 'stable-diffusion-inpainting',
    })

    const newCredits = user.credits - creditsNeeded

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
      image: {
        id: imageRecord.id,
        originalUrl: imageDataUrl,
        processedUrl: processedDataUrl,
        filename: file.name,
        creditsRemaining: newCredits,
      },
    })
  } catch (error: unknown) {
    console.error('[Watermark Remover] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to remove watermark'
    return NextResponse.json(
      { error: 'Failed to remove watermark', details: errorMessage },
      { status: 500 }
    )
  }
}
