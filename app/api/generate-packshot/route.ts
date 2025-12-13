import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import sharp from 'sharp'
import { getUserByEmail, createUsage } from '@/lib/db'
import { sendCreditsLowEmail, sendCreditsDepletedEmail } from '@/lib/email'
import { imageProcessingLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'
import { authenticateRequest } from '@/lib/api-auth'
import { CREDIT_COSTS } from '@/lib/credits-config'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

interface PackshotPreset {
  name: string
  prompt: string
  credits: number
}

const PACKSHOT_CREDITS = CREDIT_COSTS.packshot.cost

const PRESETS: Record<string, PackshotPreset> = {
  white: {
    name: 'White Background',
    prompt: 'Place this product on a pure white background in a professional product photography studio setting. Add soft studio lighting with gentle shadows. Keep the product exactly as it is, only change the background to clean white with professional lighting.',
    credits: PACKSHOT_CREDITS,
  },
  gray: {
    name: 'Light Gray',
    prompt: 'Place this product on a clean light gray gradient background in a professional product photography studio. Add soft diffused lighting with subtle shadows. Keep the product exactly as it is, only change the background.',
    credits: PACKSHOT_CREDITS,
  },
  studio: {
    name: 'Studio Setup',
    prompt: 'Transform this into a professional product photography shot. Place the product on a clean surface with professional studio lighting, soft shadows, and a neutral gradient background. Keep the product exactly as it is.',
    credits: PACKSHOT_CREDITS,
  },
  lifestyle: {
    name: 'Lifestyle',
    prompt: 'Place this product in a modern, clean lifestyle setting with soft natural lighting. Add a subtle, elegant background that complements the product. Keep the product exactly as it is.',
    credits: PACKSHOT_CREDITS,
  },
}

async function generatePackshot(imageBuffer: Buffer, prompt: string): Promise<Buffer> {
  // Convert image to base64 data URL
  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64Image}`

  // Use FLUX Kontext Pro to generate professional packshot
  const output = await replicate.run(
    "black-forest-labs/flux-kontext-pro",
    {
      input: {
        prompt: prompt,
        input_image: dataUrl,
        aspect_ratio: "1:1",
        output_format: "png",
        safety_tolerance: 2,
      }
    }
  ) as unknown as string

  // Download result
  const response = await fetch(output)
  if (!response.ok) {
    throw new Error('Failed to download generated packshot')
  }

  const resultBuffer = Buffer.from(await response.arrayBuffer())

  // Resize to target size (2000x2000)
  const finalImage = await sharp(resultBuffer)
    .resize(2000, 2000, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    })
    .png({ quality: 100 })
    .toBuffer()

  return finalImage
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const { allowed, resetAt } = imageProcessingLimiter.check(identifier)
    if (!allowed) {
      return rateLimitResponse(resetAt)
    }

    // 1. AUTHENTICATION - via session or API key
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

    // 3. EXTRACT FORMDATA
    const formData = await request.formData()
    const file = formData.get('file') as File
    const presetName = (formData.get('preset') as string) || 'white'

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

    const MAX_SIZE = 30 * 1024 * 1024 // 30MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size: 30MB' },
        { status: 400 }
      )
    }

    // Get preset
    const preset = PRESETS[presetName]
    if (!preset) {
      return NextResponse.json(
        { error: 'Invalid preset' },
        { status: 400 }
      )
    }

    // 5. CHECK CREDITS
    const creditsNeeded = preset.credits


    // Check if user has enough credits
    if (user.credits < creditsNeeded) {
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
          required: creditsNeeded,
          available: user.credits,
        },
        { status: 402 }
      )
    }

    // 6. PROCESS IMAGE - Generate professional packshot with AI
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const finalImage = await generatePackshot(buffer, preset.prompt)

    // Convert to data URL
    const base64 = finalImage.toString('base64')
    const dataUrl = `data:image/png;base64,${base64}`

    // 7. GET IMAGE DIMENSIONS
    const metadata = await sharp(finalImage).metadata()
    const width = metadata.width || 2000
    const height = metadata.height || 2000

    // 8. DEDUCT CREDITS & LOG USAGE
    await createUsage({
      userId: user.id,
      type: 'packshot_generation',
      creditsUsed: creditsNeeded,
      imageSize: `${file.size} bytes`,
      model: 'flux-kontext-pro',
    })

    const newCredits = user.credits - creditsNeeded

    // 9. SEND LOW CREDITS WARNING
    if (newCredits > 0 && newCredits <= 10) {
      sendCreditsLowEmail({
        userEmail: user.email,
        userName: user.name || 'User',
        creditsRemaining: newCredits,
      }).catch(err => console.error('Failed to send low credits email:', err))
    }

    // 10. RETURN SUCCESS
    return NextResponse.json({
      success: true,
      packshot: dataUrl,
      preset: preset.name,
      dimensions: {
        width,
        height,
      },
      creditsRemaining: newCredits,
    })
  } catch (error: any) {
    console.error('[Packshot] Error:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate packshot',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
