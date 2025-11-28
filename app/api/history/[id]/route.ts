/**
 * Single Image History Entry API
 * GET /api/history/[id] - Get single entry
 * DELETE /api/history/[id] - Delete single entry
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getImageHistoryById,
  deleteImageHistory,
} from '@/lib/image-history';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/history/[id]
 * Get a single image history entry
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id || session.user.email;

    const entry = getImageHistoryById(id);

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Check ownership
    if (entry.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    return NextResponse.json(entry);
  } catch (error) {
    console.error('History GET [id] error:', error);
    return NextResponse.json(
      { error: 'Failed to get history entry' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/history/[id]
 * Delete a single image history entry
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = session.user.id || session.user.email;

    // Check if entry exists and belongs to user
    const entry = getImageHistoryById(id);

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    if (entry.userId !== userId) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const deleted = deleteImageHistory(id);

    if (!deleted) {
      return NextResponse.json(
        { error: 'Failed to delete entry' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Entry deleted successfully',
    });
  } catch (error) {
    console.error('History DELETE [id] error:', error);
    return NextResponse.json(
      { error: 'Failed to delete history entry' },
      { status: 500 }
    );
  }
}
