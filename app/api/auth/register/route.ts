/**
 * Email/Password Registration API Endpoint
 * POST /api/auth/register
 *
 * Creates a new user account with email and password authentication.
 * Sends verification email after successful registration.
 */

import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserByEmail } from '@/lib/db';
import { prisma } from '@/lib/prisma';
import { createVerificationToken, sendVerificationEmail } from '@/lib/email-verification';
import { createRateLimiter } from '@/lib/rate-limit';

// Rate limiter: 3 registrations per hour per IP
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 3,
});

// Password validation requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REQUIREMENTS = {
  minLength: PASSWORD_MIN_LENGTH,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
};

function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`);
  }

  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  if (PASSWORD_REQUIREMENTS.requireNumber && !/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  return { valid: errors.length === 0, errors };
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    // Check rate limit
    const rateLimitResult = registerLimiter.check(ip);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many registration attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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

    // Check if user already exists
    const existingUser = await getUserByEmail(email.toLowerCase().trim());
    if (existingUser) {
      // Don't reveal if user exists - generic message
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        name: name?.trim() || null,
        password: hashedPassword,
        role: 'user',
        status: 'active',
        credits: 3, // Free credits for new users
        totalUsage: 0,
        emailVerified: false,
        authProvider: 'credentials',
      },
    });

    // Create verification token
    const verificationToken = await createVerificationToken(newUser.id, newUser.email);

    // Send verification email
    const emailSent = await sendVerificationEmail(
      newUser.email,
      newUser.name || 'User',
      verificationToken
    );

    if (!emailSent) {
      console.warn(`Failed to send verification email to ${newUser.email}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      userId: newUser.id,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
