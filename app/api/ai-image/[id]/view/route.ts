import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getGeneratedImageById } from '@/lib/ai-image/db';
import { getImageFilePath, validateSafePath, imageExists } from '@/lib/ai-image/storage';
import fs from 'fs';
import path from 'path';

// GET - Serve the locally stored image file
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const image = getGeneratedImageById(id);
    if (!image) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Check if image is public or if user is the owner
    const session = await auth();
    const isOwner = session?.user?.email === image.userEmail;

    if (!image.isPublic && !isOwner) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // Check if local path exists
    if (!image.localPath) {
      // Fallback to outputUrl redirect for older images without local storage
      if (image.outputUrl) {
        return NextResponse.redirect(image.outputUrl);
      }
      return NextResponse.json(
        { error: 'Image file not available' },
        { status: 404 }
      );
    }

    // Validate path for security
    if (!validateSafePath(image.localPath)) {
      return NextResponse.json(
        { error: 'Invalid image path' },
        { status: 400 }
      );
    }

    // Get full file path
    const filePath = getImageFilePath(image.localPath);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // Fallback to outputUrl redirect if local file is missing
      if (image.outputUrl) {
        return NextResponse.redirect(image.outputUrl);
      }
      return NextResponse.json(
        { error: 'Image file not found' },
        { status: 404 }
      );
    }

    // Read the file
    const imageBuffer = fs.readFileSync(filePath);

    // Determine content type from file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'image/webp';
    if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.jpg' || ext === '.jpeg') {
      contentType = 'image/jpeg';
    } else if (ext === '.svg') {
      contentType = 'image/svg+xml';
    }

    // Return the image with appropriate headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('View image error:', error);
    return NextResponse.json(
      { error: 'Failed to load image' },
      { status: 500 }
    );
  }
}
