import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { isAdmin } from '@/lib/auth';

const ERRORS_DIR = path.join(process.cwd(), 'data', 'errors');
const ERRORS_FILE = path.join(ERRORS_DIR, 'errors.json');

// Rate limiting for POST (prevent spam from frontend error reports)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 errors per minute per IP

function getRateLimitKey(request: NextRequest): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return true;
  }

  entry.count++;
  return false;
}

// Ensure errors directory exists
if (!fs.existsSync(ERRORS_DIR)) {
  fs.mkdirSync(ERRORS_DIR, { recursive: true });
}

// Initialize file if it doesn't exist
if (!fs.existsSync(ERRORS_FILE)) {
  fs.writeFileSync(ERRORS_FILE, JSON.stringify([]));
}

interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  componentStack?: string;
  url: string;
  userAgent: string;
  timestamp: string;
  resolved?: boolean;
  ip?: string;
}

// POST - Accept error reports from frontend (rate limited, sanitized)
export async function POST(request: NextRequest) {
  try {
    const clientIp = getRateLimitKey(request);

    // Rate limiting to prevent spam/DoS
    if (isRateLimited(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Too many error reports. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();

    // Sanitize and limit input sizes to prevent abuse
    const sanitize = (str: string | undefined, maxLen: number): string | undefined => {
      if (!str) return undefined;
      return String(str).slice(0, maxLen);
    };

    const errorReport: ErrorReport = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: sanitize(body.message, 500) || 'Unknown error',
      stack: sanitize(body.stack, 2000),
      componentStack: sanitize(body.componentStack, 2000),
      url: sanitize(body.url, 500) || 'unknown',
      userAgent: sanitize(body.userAgent, 300) || 'unknown',
      timestamp: new Date().toISOString(), // Always use server timestamp
      resolved: false,
      ip: clientIp, // Track IP for abuse detection
    };

    // Read existing errors
    const errors: ErrorReport[] = JSON.parse(fs.readFileSync(ERRORS_FILE, 'utf-8'));

    // Add new error
    errors.push(errorReport);

    // Keep only last 500 errors (reduced from 1000)
    if (errors.length > 500) {
      errors.splice(0, errors.length - 500);
    }

    // Write back
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errors, null, 2));

    // Log to console for monitoring (without sensitive data)
    console.error(`[ERROR REPORT] ${errorReport.id}: ${errorReport.message.slice(0, 100)}`);

    return NextResponse.json({ success: true, errorId: errorReport.id });
  } catch (error) {
    console.error('Failed to save error report:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

// GET - Admin only - view error reports
export async function GET(request: NextRequest) {
  // Require admin authentication
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 200);
    const unresolvedOnly = searchParams.get('unresolved') === 'true';

    const errors: ErrorReport[] = JSON.parse(fs.readFileSync(ERRORS_FILE, 'utf-8'));

    let filteredErrors = errors;
    if (unresolvedOnly) {
      filteredErrors = errors.filter(e => !e.resolved);
    }

    // Return most recent first
    const recentErrors = filteredErrors.slice(-limit).reverse();

    return NextResponse.json({
      errors: recentErrors,
      total: errors.length,
      unresolvedCount: errors.filter(e => !e.resolved).length,
    });
  } catch (error) {
    console.error('Failed to fetch error reports:', error);
    return NextResponse.json({ error: 'Failed to fetch errors' }, { status: 500 });
  }
}
