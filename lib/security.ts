/**
 * Security utilities for API protection
 * Includes CSRF protection and request validation
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from './auth';

// Maximum request body sizes
export const MAX_JSON_SIZE = 1 * 1024 * 1024; // 1MB for JSON
export const MAX_FORM_SIZE = 10 * 1024 * 1024; // 10MB for file uploads
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB for images

/**
 * Validate request body size
 */
export function validateRequestSize(request: NextRequest, maxSize: number = MAX_JSON_SIZE): boolean {
  const contentLength = parseInt(request.headers.get('content-length') || '0');
  return contentLength <= maxSize;
}

/**
 * Parse JSON body with size validation
 */
export async function parseJSONBody<T>(
  request: NextRequest,
  maxSize: number = MAX_JSON_SIZE
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  // Check content length header
  const contentLength = parseInt(request.headers.get('content-length') || '0');
  if (contentLength > maxSize) {
    return {
      success: false,
      error: `Request body too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB`,
    };
  }

  try {
    const data = await request.json();
    return { success: true, data };
  } catch {
    return { success: false, error: 'Invalid JSON body' };
  }
}

/**
 * CSRF Protection - validate origin header
 * Checks that the request comes from an allowed origin
 */
export function validateOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');

  // Allow requests without origin (same-origin requests from non-browser clients)
  if (!origin && !referer) {
    return true;
  }

  const allowedOrigins = [
    'https://pixelift.pl',
    'https://www.pixelift.pl',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  // Check origin header
  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    return true;
  }

  // Check referer header as fallback
  if (referer && allowedOrigins.some(allowed => referer.startsWith(allowed))) {
    return true;
  }

  return false;
}

/**
 * CSRF response for blocked requests
 */
export function csrfBlockedResponse(): NextResponse {
  return NextResponse.json(
    { error: 'CSRF validation failed. Request origin not allowed.' },
    { status: 403 }
  );
}

/**
 * Request size exceeded response
 */
export function requestTooLargeResponse(maxSize: number): NextResponse {
  return NextResponse.json(
    { error: `Request body too large. Maximum size is ${Math.round(maxSize / 1024 / 1024)}MB` },
    { status: 413 }
  );
}

// Session type from next-auth
type AuthSession = {
  user?: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
    isAdmin?: boolean;
  };
} | null;

/**
 * Validate API request with all security checks
 * Combined validation for CSRF, size, and authentication
 */
export async function validateAPIRequest(
  request: NextRequest,
  options: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    maxBodySize?: number;
    validateCSRF?: boolean;
  } = {}
): Promise<
  | { valid: true; session: AuthSession }
  | { valid: false; response: NextResponse }
> {
  const {
    requireAuth = false,
    requireAdmin = false,
    maxBodySize = MAX_JSON_SIZE,
    validateCSRF = true,
  } = options;

  // CSRF validation for mutating requests
  if (validateCSRF && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    if (!validateOrigin(request)) {
      return { valid: false, response: csrfBlockedResponse() };
    }
  }

  // Request size validation
  if (!validateRequestSize(request, maxBodySize)) {
    return { valid: false, response: requestTooLargeResponse(maxBodySize) };
  }

  // Authentication check
  const session = await auth() as AuthSession;

  if (requireAuth && !session?.user?.email) {
    return {
      valid: false,
      response: NextResponse.json({ error: 'Authentication required' }, { status: 401 }),
    };
  }

  if (requireAdmin && !session?.user?.isAdmin) {
    return {
      valid: false,
      response: NextResponse.json({ error: 'Admin access required' }, { status: 403 }),
    };
  }

  return { valid: true, session };
}

/**
 * Sanitize user input to prevent XSS
 * Basic sanitization - use DOMPurify for HTML content
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Generate secure random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += chars[randomValues[i] % chars.length];
  }
  return result;
}

/**
 * Hash sensitive data (e.g., for logging without exposing)
 */
export function hashForLogging(data: string): string {
  if (!data) return '';
  if (data.length <= 8) return '****';
  return data.substring(0, 4) + '****' + data.substring(data.length - 4);
}
