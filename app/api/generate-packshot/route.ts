import { NextRequest, NextResponse } from 'next/server'
import Replicate from 'replicate'
import OpenAI from 'openai'
import sharp from 'sharp'
import { auth } from '@/lib/auth'
import { getUserByEmail, createUsage } from '@/lib/db'
import { sendCreditsLowEmail, sendCreditsDepletedEmail } from '@/lib/email'

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

interface PackshotPreset {
  name: string
  backgroundColor: string
  credits: number
}

const PRESETS: Record<string, PackshotPreset> = {
  white: {
    name: 'White Background',
    backgroundColor: '#FFFFFF',
    credits: 2,
  },
  gray: {
    name: 'Light Gray',
    backgroundColor: '#F5F5F5',
    credits: 2,
  },
  beige: {
    name: 'Beige',
    backgroundColor: '#F5E6D3',
    credits: 2,
  },
  blue: {
    name: 'Light Blue',
    backgroundColor: '#E3F2FD',
    credits: 2,
  },
}

async function generatePackshot(imageBuffer: Buffer, backgroundColor: string): Promise<Buffer> {
  console.log('[Packshot] HYBRID MODE: AI background + original product overlay')
  console.log('[Packshot] Background color:', backgroundColor)

  const PROCESS_SIZE = 1024 // Size for API calls
  const TARGET_SIZE = 2000  // Final output size

  // Step 1: Resize original image to 1024x1024 for processing
  console.log('[Packshot] Step 1: Preparing image for processing...')

  const resizedOriginal = await sharp(imageBuffer)
    .resize(PROCESS_SIZE, PROCESS_SIZE, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png()
    .toBuffer()

  const base64Image = resizedOriginal.toString('base64')
  const dataUrl = `data:image/png;base64,${base64Image}`

  // Step 2: Remove background - this gives us the ORIGINAL product with transparency
  console.log('[Packshot] Step 2: Removing background (product will be preserved 1:1)...')

  const rmbgOutput = (await replicate.run('lucataco/remove-bg:95fcc2a26d3899cd6c2691c900465aaeff466285a65c14638cc5f36f34befaf1', {
    input: {
      image: dataUrl,
    },
  })) as unknown as string

  console.log('[Packshot] Step 3: Downloading product with transparent background...')

  const nobgResponse = await fetch(rmbgOutput)
  const productPngBuffer = Buffer.from(await nobgResponse.arrayBuffer())

  // Resize product to exact size and ensure alpha
  const productResized = await sharp(productPngBuffer)
    .resize(PROCESS_SIZE, PROCESS_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .png()
    .toBuffer()

  // Step 4: Build mask from product alpha channel
  console.log('[Packshot] Step 4: Building mask from alpha channel...')

  const alphaChannel = await sharp(productResized)
    .extractChannel(3)
    .threshold(1)
    .toBuffer()

  // Mask: product = opaque (KEEP), background = transparent (EDIT)
  const maskPng = await sharp({
    create: {
      width: PROCESS_SIZE,
      height: PROCESS_SIZE,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([
      {
        input: await sharp({
          create: {
            width: PROCESS_SIZE,
            height: PROCESS_SIZE,
            channels: 3,
            background: { r: 255, g: 255, b: 255 },
          },
        })
          .joinChannel(alphaChannel)
          .png()
          .toBuffer(),
        blend: 'over',
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer()

  // Step 5: Prepare image for OpenAI (original with white background)
  console.log('[Packshot] Step 5: Preparing image for AI background generation...')

  const imagePng = await sharp(imageBuffer)
    .resize(PROCESS_SIZE, PROCESS_SIZE, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .ensureAlpha()
    .toColorspace('srgb')
    .png({ compressionLevel: 9, force: true })
    .toBuffer()

  const backgroundDescriptions: Record<string, string> = {
    '#FFFFFF': 'pure white',
    '#F5F5F5': 'light gray',
    '#F5E6D3': 'warm beige',
    '#E3F2FD': 'light blue',
  }

  const bgDescription = backgroundDescriptions[backgroundColor] || 'white'

  // Step 6: Call OpenAI to generate professional background + shadow
  console.log('[Packshot] Step 6: Calling OpenAI gpt-image-1 for background + shadow...')

  const formData = new FormData()
  formData.append('model', 'gpt-image-1')
  formData.append('size', '1024x1024')
  formData.append('n', '1')
  formData.append('prompt', `
Professional ecommerce packshot studio background.
Create a perfectly flat ${bgDescription} (${backgroundColor}) studio backdrop.
Add a soft, realistic, neutral gray shadow under the product shape.
The shadow should look natural like studio photography lighting.
Keep the product area exactly as it is - only edit the background.
No additional objects, no stands, no props, no decorations.
`.trim())

  formData.append('image', new Blob([new Uint8Array(imagePng)], { type: 'image/png' }), 'image.png')
  formData.append('mask', new Blob([new Uint8Array(maskPng)], { type: 'image/png' }), 'mask.png')

  const openaiResponse = await fetch('https://api.openai.com/v1/images/edits', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: formData,
  })

  if (!openaiResponse.ok) {
    const errorText = await openaiResponse.text()
    console.error('[Packshot] OpenAI API error:', errorText)
    throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`)
  }

  const result = await openaiResponse.json() as { data: Array<{ b64_json?: string; url?: string }> }

  let aiBackgroundBuffer: Buffer
  if (result.data?.[0]?.b64_json) {
    aiBackgroundBuffer = Buffer.from(result.data[0].b64_json, 'base64')
  } else if (result.data?.[0]?.url) {
    const imgResponse = await fetch(result.data[0].url)
    aiBackgroundBuffer = Buffer.from(await imgResponse.arrayBuffer())
  } else {
    throw new Error('Failed to get image from OpenAI response')
  }

  console.log('[Packshot] Step 7: AI background generated (product from AI will be discarded)')

  // Step 8: HYBRID COMPOSITE - AI background + original product on top
  console.log('[Packshot] Step 8: Compositing AI background + ORIGINAL product...')

  // Scale both to target size
  const backgroundScaled = await sharp(aiBackgroundBuffer)
    .resize(TARGET_SIZE, TARGET_SIZE, {
      fit: 'contain',
      background: backgroundColor,
    })
    .png()
    .toBuffer()

  const productScaled = await sharp(productResized)
    .resize(TARGET_SIZE, TARGET_SIZE, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer()

  // Final composite: AI background + original product overlay
  const finalImage = await sharp(backgroundScaled)
    .composite([
      {
        input: productScaled,
        blend: 'over',
        gravity: 'center',
      },
    ])
    .png({ quality: 100 })
    .toBuffer()

  console.log('[Packshot] HYBRID packshot created successfully!')
  console.log('[Packshot] - Background + shadow: from gpt-image-1')
  console.log('[Packshot] - Product (100% original): from remove-bg')
  console.log(`[Packshot] Final dimensions: ${TARGET_SIZE}x${TARGET_SIZE}px`)

  return finalImage
}

export async function POST(request: NextRequest) {
  try {
    // 1. AUTHENTICATION
    const session = await auth()
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. GET USER
    const user = getUserByEmail(session.user.email)
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

    console.log('[Packshot] Credits needed:', creditsNeeded)

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

    // 6. PROCESS IMAGE WITH BRIA AI
    console.log('[Packshot] Starting processing...')
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
    createUsage({
      userId: user.id,
      type: 'packshot_generation',
      creditsUsed: creditsNeeded,
      imageSize: `${file.size} bytes`,
      model: 'hybrid-gpt-image-1-rmbg',
    })

    const newCredits = user.credits - creditsNeeded

    // 9. SEND LOW CREDITS WARNING
    if (newCredits > 0 && newCredits <= 10) {
      sendCreditsLowEmail({
        userEmail: user.email,
        userName: user.name || 'User',
        creditsRemaining: newCredits,
        totalUsed: user.totalUsage || 0,
      }).catch(err => console.error('Failed to send low credits email:', err))
    }

    // 10. RETURN SUCCESS
    console.log('[Packshot] Processing complete!')
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
