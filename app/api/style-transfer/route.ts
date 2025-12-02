import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import { getUserByEmail, createUsage } from '@/lib/db'
import { sendCreditsLowEmail, sendCreditsDepletedEmail } from '@/lib/email'
import { imageProcessingLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'
import { authenticateRequest } from '@/lib/api-auth'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

const CREDITS_PER_TRANSFER = 4 // Style transfer is compute-intensive

// Valid styles for face-to-many model
const VALID_STYLES = ['3D', 'Emoji', 'Video game', 'Pixels', 'Clay', 'Toy'] as const
type ValidStyle = typeof VALID_STYLES[number]

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

    // 3. GET FILES FROM FORMDATA
    const formData = await request.formData()
    const file = formData.get('file') as File
    const prompt = formData.get('prompt') as string || 'a person'
    const stylePreset = formData.get('style_preset') as string || '3D'
    const strength = parseFloat(formData.get('strength') as string || '0.65')

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
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
    if (user.credits < CREDITS_PER_TRANSFER) {
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
          required: CREDITS_PER_TRANSFER,
          available: user.credits,
        },
        { status: 402 }
      )
    }

    // 6. CONVERT IMAGE TO BASE64
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64 = buffer.toString('base64')
    const mimeType = file.type
    const dataUrl = `data:${mimeType};base64,${base64}`

    // 7. MAP STYLE PRESET TO VALID STYLE
    // face-to-many supports: 3D, Emoji, Video game, Pixels, Clay, Toy
    const styleMapping: Record<string, ValidStyle> = {
      '3d': '3D',
      '3D': '3D',
      'emoji': 'Emoji',
      'video_game': 'Video game',
      'videogame': 'Video game',
      'pixels': 'Pixels',
      'pixel': 'Pixels',
      'clay': 'Clay',
      'toy': 'Toy',
    }

    const mappedStyle: ValidStyle = styleMapping[stylePreset] || '3D'

    // 8. CALL REPLICATE - fofr/face-to-many for identity-preserving style transfer
    // This model uses InstantID to preserve facial identity while applying artistic styles
    const output = await replicate.run(
      "fofr/face-to-many",
      {
        input: {
          image: dataUrl,
          style: mappedStyle,
          prompt: prompt,
          denoising_strength: strength, // How much to change (0.65 default preserves more)
          instant_id_strength: 1, // Maximum identity preservation
          control_depth_strength: 0.8, // Preserve depth/structure
          prompt_strength: 4.5, // CFG scale
        }
      }
    ) as unknown as string[]

    // 9. GET RESULT
    const outputArray = Array.isArray(output) ? output : [output]
    if (outputArray.length === 0) {
      throw new Error('No output generated')
    }
    const resultUrl = outputArray[0]

    // 10. DOWNLOAD RESULT AND CONVERT TO BASE64
    const resultResponse = await fetch(resultUrl as string)
    if (!resultResponse.ok) {
      throw new Error('Failed to download styled image')
    }
    const resultBuffer = Buffer.from(await resultResponse.arrayBuffer())
    const resultBase64 = resultBuffer.toString('base64')
    const resultDataUrl = `data:image/png;base64,${resultBase64}`

    // 11. DEDUCT CREDITS & LOG USAGE
    await createUsage({
      userId: user.id,
      type: 'style_transfer',
      creditsUsed: CREDITS_PER_TRANSFER,
      imageSize: `${file.size} bytes`,
      model: 'face-to-many',
    })

    const newCredits = user.credits - CREDITS_PER_TRANSFER

    // 12. SEND LOW CREDITS WARNING
    if (newCredits > 0 && newCredits <= 10) {
      sendCreditsLowEmail({
        userEmail: user.email,
        userName: user.name || 'User',
        creditsRemaining: newCredits,
        totalUsed: user.totalUsage || 0,
      }).catch(err => console.error('Failed to send low credits email:', err))
    }

    // 13. RETURN SUCCESS
    return NextResponse.json({
      success: true,
      styledImage: resultDataUrl,
      style: mappedStyle,
      prompt: prompt,
      creditsUsed: CREDITS_PER_TRANSFER,
      creditsRemaining: newCredits,
    })

  } catch (error: unknown) {
    console.error('[Style Transfer] Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Failed to apply style transfer',
        details: errorMessage,
      },
      { status: 500 }
    )
  }
}
