/**
 * Forgot Password API Endpoint
 * POST /api/auth/forgot-password
 *
 * Sends a password reset email to the user.
 */

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserByEmail } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { createRateLimiter } from '@/lib/rate-limit';
import { Resend } from 'resend';

// Rate limiter: 3 password reset requests per hour per IP
const forgotPasswordLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
});

// Token expiration time (1 hour)
const TOKEN_EXPIRATION_HOURS = 1;

// Get Resend instance
let resendInstance: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY);
  }
  return resendInstance;
}

async function sendPasswordResetEmail(
  email: string,
  userName: string,
  token: string
): Promise<boolean> {
  const resend = getResend();
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - skipping password reset email');
    return false;
  }

  const resetUrl = `${process.env.NEXTAUTH_URL || 'https://pixelift.pl'}/auth/reset-password?token=${token}`;

  try {
    await resend.emails.send({
      from: 'Pixelift <noreply@pixelift.pl>',
      to: [email],
      subject: 'Reset your password - Pixelift',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(to right, #10b981, #3b82f6); padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Pixelift</h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">
            <h2 style="color: #1f2937; margin-top: 0;">Reset your password</h2>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              Hi ${userName},
            </p>

            <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">
              We received a request to reset your password. Click the button below to create a new password:
            </p>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${resetUrl}"
                 style="display: inline-block; background: linear-gradient(to right, #10b981, #3b82f6);
                        color: white; padding: 16px 32px; text-decoration: none;
                        border-radius: 8px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              This link will expire in ${TOKEN_EXPIRATION_HOURS} hour.
            </p>

            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request a password reset, you can safely ignore this email.
              Your password will remain unchanged.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;" />

            <p style="color: #9ca3af; font-size: 12px;">
              If the button doesn't work, copy and paste this URL into your browser:
              <br />
              <a href="${resetUrl}" style="color: #10b981; word-break: break-all;">
                ${resetUrl}
              </a>
            </p>
          </div>

          <!-- Footer -->
          <div style="background: #f3f4f6; padding: 30px; text-align: center; color: #6b7280; font-size: 14px;">
            <p style="margin: 0 0 10px 0;">Pixelift - AI Image Processing</p>
            <p style="margin: 0;">
              <a href="https://pixelift.pl" style="color: #10b981; text-decoration: none;">pixelift.pl</a>
            </p>
          </div>
        </div>
      `,
    });

    console.log(`Password reset email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    // Check rate limit
    const rateLimitResult = forgotPasswordLimiter.check(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many password reset attempts. Please try again later.' },
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

    // Always return success to prevent email enumeration
    // Even if user doesn't exist, we don't reveal that
    const successResponse = {
      success: true,
      message: 'If an account with that email exists, we sent a password reset link.',
    };

    // Check if user exists
    const user = await getUserByEmail(email.toLowerCase().trim());
    if (!user) {
      // Return success anyway to prevent email enumeration
      return NextResponse.json(successResponse);
    }

    // Check if user registered with OAuth (no password)
    if (!user.password) {
      // User registered with OAuth - don't send reset email
      // But still return success to prevent enumeration
      return NextResponse.json(successResponse);
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRATION_HOURS);

    // Delete any existing reset tokens for this user
    await prisma.passwordResetToken.deleteMany({
      where: { userId: user.id },
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        email: user.email,
        expiresAt,
      },
    });

    // Send reset email
    await sendPasswordResetEmail(user.email, user.name || 'User', token);

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Failed to process request. Please try again.' },
      { status: 500 }
    );
  }
}
