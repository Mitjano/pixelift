/**
 * Forgot Password API
 * POST /api/auth/forgot-password
 * Sends password reset email
 */

import { NextRequest, NextResponse } from 'next/server';
import { createPasswordResetToken, getUserByEmailForAuth } from '@/lib/auth-credentials';
import { sendPasswordResetEmail } from '@/lib/email';

// Rate limiting
const resetAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 3;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = resetAttempts.get(ip);

  if (!record || now > record.resetAt) {
    resetAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }

  if (record.count >= MAX_ATTEMPTS) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many reset attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Get user to get their name (for personalized email)
    const user = await getUserByEmailForAuth(email);

    // Create reset token
    const result = await createPasswordResetToken(email);

    // Always return success to prevent email enumeration
    // If user exists and token was created, send email
    if (result.token) {
      try {
        await sendPasswordResetEmail(email, result.token, user?.name);
      } catch (emailError) {
        console.error('[forgot-password] Failed to send email:', emailError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset link.',
    });

  } catch (error) {
    console.error('[forgot-password] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
