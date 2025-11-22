import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { adminDb } from '@/lib/firebase-admin';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: imageId } = await params;
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

    // bgremover.pl approach: We store Replicate URLs, not Firebase Storage paths
    // Replicate URLs expire automatically, so no need to delete them
    // Just delete metadata from Firestore

    await adminDb.collection('processedImages').doc(imageId).delete();

    console.log(`Deleted image metadata for ${imageId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete image' },
      { status: 500 }
    );
  }
}
