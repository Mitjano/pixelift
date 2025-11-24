import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { ProcessedImagesDB } from '@/lib/processed-images-db'
import { readFile } from 'fs/promises'
import path from 'path'

/**
 * GET /api/processed-images/[id]/download
 * Download the processed image (with background removed)
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Await params as required in Next.js 15
    const { id } = await params

    const image = await ProcessedImagesDB.getById(id)

    if (!image || image.userId !== session.user.email) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      )
    }

    if (!image.isProcessed || !image.processedPath) {
      return NextResponse.json(
        { error: 'Image not processed yet' },
        { status: 400 }
      )
    }

    // Read file from public directory
    const filePath = path.join(process.cwd(), 'public', image.processedPath)

    try {
      const fileBuffer = await readFile(filePath)

      // Return file with proper headers
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': 'image/png',
          'Content-Disposition': `attachment; filename="${path.basename(image.processedPath)}"`,
          'Cache-Control': 'public, max-age=31536000, immutable'
        }
      })
    } catch (fileError) {
      console.error('File not found:', filePath, fileError)
      return NextResponse.json(
        { error: 'Processed file not found on server' },
        { status: 404 }
      )
    }

  } catch (error) {
    console.error('Error downloading image:', error)
    return NextResponse.json(
      { error: 'Failed to download image' },
      { status: 500 }
    )
  }
}
