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
  backgroundColor: string
  credits: number
}

const PACKSHOT_CREDITS = CREDIT_COSTS.packshot.cost

const PRESETS: Record<string, PackshotPreset> = {
  white: {
    name: 'White Background',
    backgroundColor: '#FFFFFF',
    credits: PACKSHOT_CREDITS,
  },
  gray: {
    name: 'Light Gray',
    backgroundColor: '#F5F5F5',
    credits: PACKSHOT_CREDITS,
  },
  beige: {
    name: 'Beige',
    backgroundColor: '#F5E6D3',
    credits: PACKSHOT_CREDITS,
  },
  blue: {
    name: 'Light Blue',
    backgroundColor: '#E3F2FD',
    credits: PACKSHOT_CREDITS,
  },
}

// Parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    return { r: 255, g: 255, b: 255 } // Default to white
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

/**
 * Create a gradient mask for reflection effect (fades from top to bottom)
 */
async function createReflectionGradient(width: number, height: number): Promise<Buffer> {
  // Create SVG gradient mask
  const svg = `
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:white;stop-opacity:0.25" />
          <stop offset="100%" style="stop-color:white;stop-opacity:0" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#grad)" />
    </svg>
  `
  return Buffer.from(svg)
}

async function generatePackshot(imageBuffer: Buffer, backgroundColor: string): Promise<Buffer> {
  const TARGET_SIZE = 2000
  const PRODUCT_SCALE = 0.65 // Product takes 65% of canvas (leave room for shadow + reflection)
  const MAX_PRODUCT_SIZE = Math.round(TARGET_SIZE * PRODUCT_SCALE)
  const REFLECTION_HEIGHT_RATIO = 0.3 // Reflection is 30% of product height
  const SHADOW_BLUR = 25
  const SHADOW_OFFSET_Y = 15

  // Step 1: Remove background using BiRefNet (better quality)
  const base64Image = imageBuffer.toString('base64')
  const mimeType = 'image/png'
  const dataUrl = `data:${mimeType};base64,${base64Image}`

  const rmbgUrl = await ImageProcessor.removeBackground(dataUrl)
  const nobgResponse = await fetch(rmbgUrl)
  const nobgBuffer = Buffer.from(await nobgResponse.arrayBuffer())

  // Step 2: Get metadata of the transparent image
  const metadata = await sharp(nobgBuffer).metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error('Invalid image metadata')
  }

  // Step 3: Calculate scaling to fit product in canvas
  const scale = Math.min(
    MAX_PRODUCT_SIZE / metadata.width,
    MAX_PRODUCT_SIZE / metadata.height
  )

  const scaledWidth = Math.round(metadata.width * scale)
  const scaledHeight = Math.round(metadata.height * scale)
  const reflectionHeight = Math.round(scaledHeight * REFLECTION_HEIGHT_RATIO)

  // Position product higher to leave room for reflection
  const productLeft = Math.round((TARGET_SIZE - scaledWidth) / 2)
  const productTop = Math.round((TARGET_SIZE - scaledHeight - reflectionHeight) / 2)

  // Step 4: Resize product image
  const resizedProduct = await sharp(nobgBuffer)
    .resize(scaledWidth, scaledHeight, {
      fit: 'inside',
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .toBuffer()

  // Step 5: Create shadow (black silhouette, blurred, offset)
  // Extract alpha channel, make it black, blur it
  const shadowBuffer = await sharp(resizedProduct)
    .ensureAlpha()
    // Tint to black while preserving alpha
    .modulate({ brightness: 0 })
    .blur(SHADOW_BLUR)
    .toBuffer()

  // Step 6: Create reflection (flip vertically + fade gradient)
  const flippedProduct = await sharp(resizedProduct)
    .flip() // Flip vertically
    .toBuffer()

  // Create gradient mask for reflection
  const gradientMask = await createReflectionGradient(scaledWidth, reflectionHeight)

  // Crop to reflection height and apply gradient
  const reflectionBuffer = await sharp(flippedProduct)
    .extract({ left: 0, top: 0, width: scaledWidth, height: reflectionHeight })
    .composite([
      {
        input: gradientMask,
        blend: 'dest-in', // Use gradient as alpha mask
      }
    ])
    .toBuffer()

  // Step 7: Compose everything on background
  const bgColor = hexToRgb(backgroundColor)

  const finalImage = await sharp({
    create: {
      width: TARGET_SIZE,
      height: TARGET_SIZE,
      channels: 4,
      background: { r: bgColor.r, g: bgColor.g, b: bgColor.b, alpha: 1 },
    },
  })
    .composite([
      // Shadow (below product, offset down)
      {
        input: shadowBuffer,
        left: productLeft,
        top: productTop + SHADOW_OFFSET_Y,
        blend: 'multiply',
      },
      // Reflection (below product)
      {
        input: reflectionBuffer,
        left: productLeft,
        top: productTop + scaledHeight + 5, // Small gap between product and reflection
      },
      // Product (on top)
      {
        input: resizedProduct,
        left: productLeft,
        top: productTop,
      },
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
    const presetName = (formData.get('preset') as string) || 'amazon'

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

    // 6. PROCESS IMAGE - Background removal + composition
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const finalImage = await generatePackshot(buffer, preset.backgroundColor)

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
