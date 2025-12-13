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
    prompt: 'Transform this into a professional commercial product photography shot. Place the product on a pure white seamless background with two-softbox studio lighting setup. Add dramatic specular highlights and reflections on metallic/glossy surfaces. Create soft diffused shadows underneath. Use 85mm lens perspective, f/8 aperture look. High dynamic range, studio-quality lighting with rim light accent. The product must remain exactly identical - only enhance the lighting, add professional reflections, and change background to pure white studio sweep. Commercial packshot quality, dust-free, sharp focus.',
    credits: PACKSHOT_CREDITS,
  },
  gray: {
    name: 'Light Gray',
    prompt: 'Transform this into a professional commercial product photography shot. Place the product on a light gray gradient seamless backdrop with professional three-point lighting setup. Add specular highlights on reflective surfaces and soft shadow underneath. Use dramatic side lighting to emphasize product contours and textures. 85mm lens perspective with shallow depth of field feel. The product must remain exactly identical - only enhance with professional studio lighting, reflections on shiny parts, and gray gradient background. Commercial packshot quality, high-end advertising look.',
    credits: PACKSHOT_CREDITS,
  },
  studio: {
    name: 'Studio Setup',
    prompt: 'Transform this into a premium commercial product photography shot worthy of high-end advertising. Place on white acrylic reflective surface with professional multi-light studio setup. Add dramatic specular highlights, light flares on metallic parts, and mirror-like reflection below the product. Use rim lighting to separate product from background. Professional packshot with 85mm f/8 lens look. The product must remain exactly identical - only add professional studio lighting effects, reflections, and highlights. Magazine advertisement quality, ultra sharp, high dynamic range.',
    credits: PACKSHOT_CREDITS,
  },
  lifestyle: {
    name: 'Lifestyle',
    prompt: 'Transform this into a premium lifestyle product photography shot. Place product in an elegant, minimal modern setting with soft natural window lighting and gentle shadows. Add subtle reflections and professional lighting accents. Clean, sophisticated background that complements the product. The product must remain exactly identical - only enhance lighting and place in lifestyle context. High-end brand photography style, editorial quality.',
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
        prompt_upsampling: true, // Enhance prompt for better results
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
