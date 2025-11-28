/**
 * Single API Key Management
 * DELETE /api/v1/keys/[id] - Delete/revoke an API key
 * PATCH /api/v1/keys/[id] - Update API key (deactivate/reactivate)
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getUserByEmail,
  getApiKeysByUserId,
  deleteApiKey,
  revokeApiKey,
  updateApiKey,
} from '@/lib/database';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * DELETE /api/v1/keys/[id]
 * Permanently delete an API key
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Get user from database
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Verify ownership
    const userKeys = await getApiKeysByUserId(user.id);
    const keyExists = userKeys.some((k) => k.id === id);

    if (!keyExists) {
      return NextResponse.json(
        { success: false, error: { message: 'API key not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    const deleted = await deleteApiKey(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: { message: 'Failed to delete API key', code: 'DELETE_FAILED' } },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'API key deleted successfully',
    });
  } catch (error) {
    console.error('API Key DELETE error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to delete API key', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/v1/keys/[id]
 * Update API key status (activate/deactivate)
 */
export async function PATCH(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized', code: 'UNAUTHORIZED' } },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { action } = body;

    // Get user from database
    const user = await getUserByEmail(session.user.email);

    if (!user) {
      return NextResponse.json(
        { success: false, error: { message: 'User not found', code: 'USER_NOT_FOUND' } },
        { status: 404 }
      );
    }

    // Verify ownership
    const userKeys = await getApiKeysByUserId(user.id);
    const keyExists = userKeys.some((k) => k.id === id);

    if (!keyExists) {
      return NextResponse.json(
        { success: false, error: { message: 'API key not found', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    if (action === 'deactivate') {
      const success = await revokeApiKey(id);

      if (!success) {
        return NextResponse.json(
          { success: false, error: { message: 'Failed to deactivate API key', code: 'UPDATE_FAILED' } },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'API key deactivated successfully',
      });
    } else if (action === 'activate') {
      // Reactivate key
      const result = await updateApiKey(id, { status: 'active' });

      if (!result) {
        return NextResponse.json(
          { success: false, error: { message: 'Failed to activate API key', code: 'UPDATE_FAILED' } },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'API key activated successfully',
      });
    } else {
      return NextResponse.json(
        { success: false, error: { message: 'Invalid action. Use "activate" or "deactivate"', code: 'INVALID_INPUT' } },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('API Key PATCH error:', error);
    return NextResponse.json(
      { success: false, error: { message: 'Failed to update API key', code: 'INTERNAL_ERROR' } },
      { status: 500 }
    );
  }
}
