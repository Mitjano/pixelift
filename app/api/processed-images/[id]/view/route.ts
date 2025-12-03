import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { ProcessedImagesDB } from '@/lib/processed-images-db'
import { validateSafePath } from '@/lib/security'

/**
 * View image (original or processed)
 * Serves the image file from filesystem
 * Query param: ?type=original or ?type=processed (default)
 *
 * Note: No authentication required - images are accessed by unique UUID
 * which is practically impossible to guess. This allows img tags to load
 * images without session/cookie issues.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(req.url)
    const imageType = searchParams.get('type') || 'processed'

    // Validate ID format to prevent abuse
    // Accepts both UUID format and img_timestamp_random format
    const validIdRegex = /^(img_\d+_[a-z0-9]+|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i
    if (!validIdRegex.test(id)) {
      return NextResponse.json(
        { error: 'Invalid image ID' },
        { status: 400 }
      )
    }

    // Get image record
    const image = await ProcessedImagesDB.getById(id)

    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    // Determine which path to use
    let imagePath: string
    if (imageType === 'original') {
      imagePath = image.originalPath
    } else {
      // Check if processed
      if (!image.isProcessed || !image.processedPath) {
        return NextResponse.json(
          { error: 'Image not yet processed' },
          { status: 404 }
        )
      }
      imagePath = image.processedPath
    }

    // Validate path to prevent path traversal attacks
    // Remove leading slash if present (paths stored as /uploads/...)
    const relativePath = imagePath.startsWith('/') ? imagePath.slice(1) : imagePath
    const pathValidation = validateSafePath(relativePath)
    if (!pathValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid file path' },
        { status: 400 }
      )
    }

    // Read file from filesystem
    const fileBuffer = await readFile(pathValidation.safePath)

    // Determine content type from extension
    const ext = path.extname(imagePath).toLowerCase()
    const contentType = ext === '.png' ? 'image/png' :
                        ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg' :
                        ext === '.webp' ? 'image/webp' : 'image/png'

    // Return image
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving image:', error)
    return NextResponse.json(
      { error: 'Failed to load image' },
      { status: 500 }
    )
  }
}
