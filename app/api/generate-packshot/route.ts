import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import { getUserByEmail, createUsage } from '@/lib/db'
import { sendCreditsLowEmail, sendCreditsDepletedEmail } from '@/lib/email'
import { imageProcessingLimiter, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'
import { authenticateRequest } from '@/lib/api-auth'
import { CREDIT_COSTS } from '@/lib/credits-config'
import { ImageProcessor } from '@/lib/image-processor'

interface PackshotPreset {
  name: string
  background: { r: number; g: number; b: number }
  credits: number
}

const PACKSHOT_CREDITS = CREDIT_COSTS.packshot.cost

// Professional packshot presets - BiRefNet background removal + shadow
const PRESETS: Record<string, PackshotPreset> = {
  white: {
    name: 'White Background',
    background: { r: 255, g: 255, b: 255 },
    credits: PACKSHOT_CREDITS,
  },
  gray: {
    name: 'Light Gray',
    background: { r: 240, g: 240, b: 240 },
    credits: PACKSHOT_CREDITS,
  },
  studio: {
    name: 'Studio Setup',
    background: { r: 250, g: 250, b: 250 },
    credits: PACKSHOT_CREDITS,
  },
  lifestyle: {
    name: 'Lifestyle',
    background: { r: 245, g: 243, b: 240 },
    credits: PACKSHOT_CREDITS,
  },
}

async function generatePackshot(imageBuffer: Buffer, preset: PackshotPreset): Promise<Buffer> {
  // Convert image to base64 data URL
  const base64Image = imageBuffer.toString('base64')
  const dataUrl = `data:image/png;base64,${base64Image}`

  // Step 1: Remove background using BiRefNet
  console.log('Removing background with BiRefNet...')
  const transparentUrl = await ImageProcessor.removeBackground(dataUrl)

  // Download transparent image
  const transparentResponse = await fetch(transparentUrl)
  if (!transparentResponse.ok) {
    throw new Error('Failed to download transparent image')
  }
  const transparentBuffer = Buffer.from(await transparentResponse.arrayBuffer())

  // Step 2: Get product dimensions and calculate layout
  const productMeta = await sharp(transparentBuffer).metadata()
  const productWidth = productMeta.width || 1000
  const productHeight = productMeta.height || 1000

  const canvasSize = 2000
  const maxProductHeight = canvasSize * 0.75 // Product takes max 75% of canvas height
  const scale = Math.min(
    (canvasSize * 0.85) / productWidth,  // 85% width
    maxProductHeight / productHeight
  )

  const scaledWidth = Math.round(productWidth * scale)
  const scaledHeight = Math.round(productHeight * scale)
  const productX = Math.round((canvasSize - scaledWidth) / 2)
  const productY = Math.round((canvasSize - scaledHeight) / 2) - 50 // Slightly above center

  // Step 3: Resize product
  const resizedProduct = await sharp(transparentBuffer)
    .resize(scaledWidth, scaledHeight, { fit: 'contain' })
    .png()
    .toBuffer()

  // Step 4: Create shadow (soft ellipse below product)
  const shadowWidth = Math.round(scaledWidth * 0.7)
  const shadowHeight = Math.round(scaledHeight * 0.08)
  const shadowX = productX + Math.round((scaledWidth - shadowWidth) / 2)
  const shadowY = productY + scaledHeight - Math.round(shadowHeight * 0.3)

  const shadowSvg = Buffer.from(
    `<svg width="${shadowWidth}" height="${shadowHeight}">
      <defs>
        <radialGradient id="shadow" cx="50%" cy="50%" rx="50%" ry="50%">
          <stop offset="0%" style="stop-color:rgb(0,0,0);stop-opacity:0.15"/>
          <stop offset="60%" style="stop-color:rgb(0,0,0);stop-opacity:0.05"/>
          <stop offset="100%" style="stop-color:rgb(0,0,0);stop-opacity:0"/>
        </radialGradient>
      </defs>
      <ellipse cx="${shadowWidth/2}" cy="${shadowHeight/2}" rx="${shadowWidth/2}" ry="${shadowHeight/2}" fill="url(#shadow)"/>
    </svg>`
  )

  // Step 5: Compose final image
  console.log('Compositing final packshot...')
  const finalImage = await sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 3,
      background: preset.background,
    }
  })
    .composite([
      { input: shadowSvg, left: shadowX, top: shadowY },
      { input: resizedProduct, left: productX, top: productY },
    ])
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

    const finalImage = await generatePackshot(buffer, preset)

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
      model: 'birefnet-packshot',
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
