/**
 * Reset Password API Endpoint
 * POST /api/auth/reset-password
 *
 * Resets the user's password using the token sent via email.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

// Password validation requirements
const PASSWORD_MIN_LENGTH = 8;

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_MIN_LENGTH) {
    errors.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters`);
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return { valid: errors.length === 0, errors };
}

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

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0], errors: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Find the reset token
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token has expired
    if (new Date() > tokenRecord.expiresAt) {
      // Delete expired token
      await prisma.passwordResetToken.delete({ where: { token } });
      return NextResponse.json(
        { error: 'Reset token has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Check if token was already used
    if (tokenRecord.usedAt) {
      return NextResponse.json(
        { error: 'This reset link has already been used.' },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Update user's password and mark email as verified
    await prisma.user.update({
      where: { id: tokenRecord.userId },
      data: {
        password: hashedPassword,
        emailVerified: true, // If they can reset password, email is verified
        emailVerifiedAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password. Please try again.' },
      { status: 500 }
    );
  }
}

// Validate token without resetting (for frontend to check)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.json(
      { valid: false, error: 'Token is required' },
      { status: 400 }
    );
  }

  try {
    const tokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!tokenRecord) {
      return NextResponse.json({ valid: false, error: 'Invalid token' });
    }

    if (new Date() > tokenRecord.expiresAt) {
      return NextResponse.json({ valid: false, error: 'Token has expired' });
    }

    if (tokenRecord.usedAt) {
      return NextResponse.json({ valid: false, error: 'Token already used' });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to validate token' },
      { status: 500 }
    );
  }
}
