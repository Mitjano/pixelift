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
    const styleImage = formData.get('style_image') as File | null
    const prompt = formData.get('prompt') as string || ''
    const stylePreset = formData.get('style_preset') as string || 'artistic'
    const strength = parseFloat(formData.get('strength') as string || '0.8')

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

    // 7. CONVERT STYLE IMAGE IF PROVIDED
    let styleDataUrl: string | undefined
    if (styleImage && styleImage.size > 0) {
      const styleArrayBuffer = await styleImage.arrayBuffer()
      const styleBuffer = Buffer.from(styleArrayBuffer)
      const styleBase64 = styleBuffer.toString('base64')
      styleDataUrl = `data:${styleImage.type};base64,${styleBase64}`
    }

    // 8. BUILD PROMPT BASED ON STYLE PRESET
    const stylePrompts: Record<string, string> = {
      'anime': 'anime style, japanese animation, vibrant colors, clean lines',
      'oil_painting': 'oil painting style, textured brushstrokes, classical art, rich colors',
      'watercolor': 'watercolor painting, soft colors, fluid brushwork, artistic',
      'pencil_sketch': 'pencil sketch, hand drawn, detailed line art, graphite',
      'pop_art': 'pop art style, bold colors, comic book aesthetic, Andy Warhol inspired',
      'cyberpunk': 'cyberpunk style, neon colors, futuristic, high tech low life',
      'fantasy': 'fantasy art style, magical, ethereal, dreamlike quality',
      'vintage': 'vintage photograph, retro aesthetic, aged, nostalgic',
      'minimalist': 'minimalist style, clean, simple, modern design',
      'artistic': 'artistic interpretation, creative, expressive, unique style',
    }

    const finalPrompt = prompt || stylePrompts[stylePreset] || stylePrompts['artistic']

    // 9. CALL REPLICATE - FLUX Redux for style transfer
    const input: Record<string, unknown> = {
      prompt: finalPrompt,
      image: dataUrl,
      num_outputs: 1,
      guidance: 3.5,
      megapixels: "1",
      num_inference_steps: 28,
      output_format: "png",
      output_quality: 100,
    }

    // If style image provided, use it for redux style reference
    if (styleDataUrl) {
      input.redux_image = styleDataUrl
    }

    const output = await replicate.run(
      "black-forest-labs/flux-redux-schnell",
      { input }
    ) as unknown as string[]

    // 10. GET RESULT
    const resultUrl = Array.isArray(output) ? output[0] : output

    // 11. DOWNLOAD RESULT AND CONVERT TO BASE64
    const resultResponse = await fetch(resultUrl as string)
    if (!resultResponse.ok) {
      throw new Error('Failed to download styled image')
    }
    const resultBuffer = Buffer.from(await resultResponse.arrayBuffer())
    const resultBase64 = resultBuffer.toString('base64')
    const resultDataUrl = `data:image/png;base64,${resultBase64}`

    // 12. DEDUCT CREDITS & LOG USAGE
    await createUsage({
      userId: user.id,
      type: 'style_transfer',
      creditsUsed: CREDITS_PER_TRANSFER,
      imageSize: `${file.size} bytes`,
      model: 'flux-redux-schnell',
    })

    const newCredits = user.credits - CREDITS_PER_TRANSFER

    // 13. SEND LOW CREDITS WARNING
    if (newCredits > 0 && newCredits <= 10) {
      sendCreditsLowEmail({
        userEmail: user.email,
        userName: user.name || 'User',
        creditsRemaining: newCredits,
        totalUsed: user.totalUsage || 0,
      }).catch(err => console.error('Failed to send low credits email:', err))
    }

    // 14. RETURN SUCCESS
    return NextResponse.json({
      success: true,
      styledImage: resultDataUrl,
      style: stylePreset,
      prompt: finalPrompt,
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
