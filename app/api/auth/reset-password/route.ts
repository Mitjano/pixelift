/**
 * Reset Password API
 * POST /api/auth/reset-password
 * Resets password using token
 */

import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordWithToken } from '@/lib/auth-credentials';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token) {
      return NextResponse.json(
        { error: 'Reset token is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'New password is required' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check for common weak passwords
    const weakPasswords = ['password', '12345678', 'qwerty123', 'password123'];
    if (weakPasswords.includes(password.toLowerCase())) {
      return NextResponse.json(
        { error: 'Please choose a stronger password' },
        { status: 400 }
      );
    }

    // Reset the password
    const result = await resetPasswordWithToken(token, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to reset password' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully. You can now sign in with your new password.',
    });

  } catch (error) {
    console.error('[reset-password] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
