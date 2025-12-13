import Replicate from 'replicate'
import sharp from 'sharp'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export class ImageProcessor {
  private static replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN!,
  })

  /**
   * Remove background from image using Fal.ai BiRefNet
   * FREE - $0 per compute second!
   * Falls back to Replicate BRIA if Fal.ai fails
   */
  static async removeBackground(dataUrl: string): Promise<string> {
    const falApiKey = process.env.FAL_API_KEY

    // Try Fal.ai BiRefNet first (FREE!)
    if (falApiKey) {
      try {
        const result = await this.removeBackgroundViaFal(dataUrl, falApiKey)
        if (result) return result
      } catch (error) {
        console.error('Fal.ai BiRefNet failed, falling back to Replicate:', error)
      }
    }

    // Fallback to Replicate BRIA
    return this.removeBackgroundViaReplicate(dataUrl)
  }

  /**
   * Remove background using Fal.ai BiRefNet (FREE!)
   */
  private static async removeBackgroundViaFal(dataUrl: string, apiKey: string): Promise<string> {
    try {
      // Submit request to Fal.ai
      const submitResponse = await fetch('https://queue.fal.run/fal-ai/birefnet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Key ${apiKey}`,
        },
        body: JSON.stringify({
          image_url: dataUrl,
          model: 'General Use (Light)',
          operating_resolution: '1024x1024',
          output_format: 'png',
          refine_foreground: true,
        }),
      })

      if (!submitResponse.ok) {
        const error = await submitResponse.text()
        throw new Error(`Fal.ai submit failed: ${error}`)
      }

      const submitData = await submitResponse.json()
      const requestId = submitData.request_id

      if (!requestId) {
        throw new Error('No request_id returned from Fal.ai')
      }

      // Poll for result (BiRefNet is usually fast)
      let attempts = 0
      const maxAttempts = 60 // 60 seconds max

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000))

        const statusResponse = await fetch(
          `https://queue.fal.run/fal-ai/birefnet/requests/${requestId}/status`,
          {
            headers: {
              'Authorization': `Key ${apiKey}`,
            },
          }
        )

        if (!statusResponse.ok) {
          attempts++
          continue
        }

        const statusData = await statusResponse.json()

        if (statusData.status === 'COMPLETED') {
          // Get result
          const resultResponse = await fetch(
            `https://queue.fal.run/fal-ai/birefnet/requests/${requestId}`,
            {
              headers: {
                'Authorization': `Key ${apiKey}`,
              },
            }
          )

          if (!resultResponse.ok) {
            throw new Error('Failed to get result from Fal.ai')
          }

          const resultData = await resultResponse.json()

          // BiRefNet returns { image: { url: "..." } }
          if (resultData.image?.url) {
            console.log('Background removed via Fal.ai BiRefNet (FREE)')
            return resultData.image.url
          }

          throw new Error('No image URL in Fal.ai response')
        }

        if (statusData.status === 'FAILED') {
          throw new Error(`Fal.ai processing failed: ${statusData.error || 'Unknown error'}`)
        }

        attempts++
      }

      throw new Error('Fal.ai processing timeout')
    } catch (error) {
      console.error('Fal.ai BiRefNet error:', error)
      throw error
    }
  }

  /**
   * Remove background using Replicate BRIA (fallback)
   */
  private static async removeBackgroundViaReplicate(dataUrl: string): Promise<string> {
    try {
      const output = await this.replicate.run(
        "bria/remove-background",
        {
          input: {
            image: dataUrl
          }
        }
      )

      const resultUrl = typeof output === 'string' ? output : String(output)
      console.log('Background removed via Replicate BRIA')
      return resultUrl
    } catch (error) {
      console.error('Replicate background removal failed:', error)
      throw new Error(`Background removal failed: ${error}`)
    }
  }

  /**
   * Validate uploaded image
   */
  static async validateImage(file: File): Promise<{ valid: boolean; error?: string }> {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg']

    // Check size
    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Maximum size is 10MB' }
    }

    // Check type
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Use JPG, PNG, or WEBP' }
    }

    return { valid: true }
  }

  /**
   * Get image dimensions using sharp
   */
  static async getImageDimensions(buffer: Buffer): Promise<{ width: number; height: number }> {
    try {
      const metadata = await sharp(buffer).metadata()
      return {
        width: metadata.width || 0,
        height: metadata.height || 0
      }
    } catch (error) {
      console.error('Error getting image dimensions:', error)
      return { width: 0, height: 0 }
    }
  }

  /**
   * Save file to local storage (public/uploads)
   */
  static async saveFile(
    buffer: Buffer,
    filename: string,
    subfolder: 'original' | 'processed'
  ): Promise<string> {
    try {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', subfolder)

      // Create directory if not exists
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const ext = path.extname(filename)
      const name = path.basename(filename, ext)
      const uniqueFilename = `${name}_${timestamp}${ext}`
      const filePath = path.join(uploadDir, uniqueFilename)

      // Save file
      await writeFile(filePath, buffer)

      // Return relative path (for use with /uploads/)
      const relativePath = `/uploads/${subfolder}/${uniqueFilename}`
      return relativePath
    } catch (error) {
      console.error('Error saving file:', error)
      throw new Error(`Failed to save file: ${error}`)
    }
  }

  /**
   * Download image from URL and return as buffer
   */
  static async downloadImage(url: string): Promise<Buffer> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.statusText}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    } catch (error) {
      console.error('Error downloading image:', error)
      throw new Error(`Failed to download image: ${error}`)
    }
  }

  /**
   * Upscale image using Fal.ai models
   * @param dataUrl - Base64 data URL of the image
   * @param scale - Upscale factor (2 or 4)
   * @param model - Model to use: 'esrgan' (fast) or 'aura-sr' (best quality)
   * @returns URL of the upscaled image
   */
  static async upscaleImage(
    dataUrl: string,
    scale: 2 | 4,
    model: 'esrgan' | 'aura-sr' = 'esrgan'
  ): Promise<string> {
    const falApiKey = process.env.FAL_API_KEY

    if (!falApiKey) {
      throw new Error('FAL_API_KEY environment variable is required for upscaling')
    }

    try {
      if (model === 'aura-sr') {
        return await this.upscaleViaAuraSR(dataUrl, falApiKey)
      } else {
        return await this.upscaleViaESRGAN(dataUrl, scale, falApiKey)
      }
    } catch (error) {
      console.error(`Fal.ai ${model} upscaling failed:`, error)
      throw error
    }
  }

  /**
   * Upscale using Fal.ai ESRGAN (fast, supports 2x and 4x)
   * Uses synchronous fal.run endpoint for faster response
   */
  private static async upscaleViaESRGAN(
    dataUrl: string,
    scale: 2 | 4,
    apiKey: string
  ): Promise<string> {
    console.log(`Starting ESRGAN ${scale}x upscale...`)

    // Use synchronous endpoint for faster response
    const response = await fetch('https://fal.run/fal-ai/esrgan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
      },
      body: JSON.stringify({
        image_url: dataUrl,
        scale: scale,
        model: 'RealESRGAN_x4plus',
        output_format: 'png',
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Fal.ai ESRGAN failed: ${error}`)
    }

    const result = await response.json()

    if (result.image?.url) {
      console.log('Image upscaled via Fal.ai ESRGAN')
      return result.image.url
    }

    throw new Error('No image URL in Fal.ai ESRGAN response')
  }

  /**
   * Upscale using Fal.ai AuraSR v2 (best quality, 4x only)
   * Uses synchronous fal.run endpoint
   */
  private static async upscaleViaAuraSR(
    dataUrl: string,
    apiKey: string
  ): Promise<string> {
    console.log('Starting AuraSR v2 4x upscale...')

    // Use synchronous endpoint
    const response = await fetch('https://fal.run/fal-ai/aura-sr', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Key ${apiKey}`,
      },
      body: JSON.stringify({
        image_url: dataUrl,
        upscaling_factor: 4,
        overlapping_tiles: true,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Fal.ai AuraSR failed: ${error}`)
    }

    const result = await response.json()

    if (result.image?.url) {
      console.log('Image upscaled via Fal.ai AuraSR')
      return result.image.url
    }

    throw new Error('No image URL in Fal.ai AuraSR response')
  }

  /**
   * Poll Fal.ai for result (shared by upscaling methods)
   */
  private static async pollFalResult(
    modelPath: string,
    requestId: string,
    apiKey: string,
    modelName: string
  ): Promise<string> {
    let attempts = 0
    const maxAttempts = 120 // 2 minutes max

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000))

      const statusResponse = await fetch(
        `https://queue.fal.run/${modelPath}/requests/${requestId}/status`,
        {
          headers: {
            'Authorization': `Key ${apiKey}`,
          },
        }
      )

      if (!statusResponse.ok) {
        attempts++
        continue
      }

      const statusData = await statusResponse.json()

      if (statusData.status === 'COMPLETED') {
        // Get result
        const resultResponse = await fetch(
          `https://queue.fal.run/${modelPath}/requests/${requestId}`,
          {
            headers: {
              'Authorization': `Key ${apiKey}`,
            },
          }
        )

        if (!resultResponse.ok) {
          throw new Error(`Failed to get result from Fal.ai ${modelName}`)
        }

        const resultData = await resultResponse.json()

        // ESRGAN returns { image: { url: "..." } }
        // AuraSR returns { image: { url: "..." } }
        if (resultData.image?.url) {
          console.log(`Image upscaled via Fal.ai ${modelName}`)
          return resultData.image.url
        }

        throw new Error(`No image URL in Fal.ai ${modelName} response`)
      }

      if (statusData.status === 'FAILED') {
        throw new Error(`Fal.ai ${modelName} processing failed: ${statusData.error || 'Unknown error'}`)
      }

      attempts++
    }

    throw new Error(`Fal.ai ${modelName} processing timeout`)
  }
}
