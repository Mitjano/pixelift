import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb, adminStorage } from '@/lib/firebase-admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const imageId = params.id;
    const userEmail = session.user.email;

    // Fetch image metadata from Firestore
    const imageDoc = await adminDb.collection('processedImages').doc(imageId).get();

    if (!imageDoc.exists) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 });
    }

    const imageData = imageDoc.data();

    // Verify user owns this image
    if (imageData?.userId !== userEmail) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete files from Firebase Storage
    const originalPath = imageData.originalPath;
    const processedPath = imageData.processedPath;

    try {
      await adminStorage.bucket().file(originalPath).delete();
    } catch (error) {
      console.error('Error deleting original file:', error);
    }

    try {
      await adminStorage.bucket().file(processedPath).delete();
    } catch (error) {
      console.error('Error deleting processed file:', error);
    }

    // Delete metadata from Firestore
    await adminDb.collection('processedImages').doc(imageId).delete();

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}
