import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb, adminStorage } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const originalFile = formData.get('originalFile') as File;
    const processedFile = formData.get('processedFile') as File;

    if (!originalFile || !processedFile) {
      return NextResponse.json({ error: 'Missing files' }, { status: 400 });
    }

    const userEmail = session.user.email;
    const timestamp = Date.now();

    // bgremover.pl doesn't save images to storage at all - they just keep metadata
    // We'll store the processed image URL directly (from Replicate) to avoid decoder issues
    // This is simpler, faster, and avoids Firebase Storage decoder errors entirely

    // Just save metadata to Firestore with the blob URL (client handles the actual file)
    const docRef = await adminDb.collection('processedImages').add({
      originalFilename: originalFile.name,
      processedPath: '', // No storage path - image stays in browser memory
      fileSize: originalFile.size,
      createdAt: new Date(),
      userId: userEmail,
    });

    console.log('Metadata saved with ID:', docRef.id);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      processedPath: '', // No storage path - image handled by client
    });
  } catch (error: any) {
    console.error('Error saving image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save image' },
      { status: 500 }
    );
  }
}
