/**
 * Admin Configuration
 *
 * Admin emails should be configured via ADMIN_EMAILS environment variable
 * Format: comma-separated list of emails
 * Example: ADMIN_EMAILS=admin@pixelift.pl,john@example.com
 */

// Get admin emails from environment variable
function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS || '';

  if (!adminEmailsEnv) {
    // Log warning in development only
    if (process.env.NODE_ENV === 'development') {
      console.warn('[admin-config] ADMIN_EMAILS environment variable is not set. No admins configured.');
    }
    return [];
  }

  return adminEmailsEnv
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0 && email.includes('@'));
}

// Cache admin emails to avoid parsing on every call
let cachedAdminEmails: string[] | null = null;

export function isAdminEmail(email: string): boolean {
  if (!email) return false;

  if (cachedAdminEmails === null) {
    cachedAdminEmails = getAdminEmails();
  }

  return cachedAdminEmails.includes(email.toLowerCase());
}

// Refresh cache (useful for hot reloading in dev)
export function refreshAdminCache(): void {
  cachedAdminEmails = null;
}

// Get all admin emails (for debugging/admin panel)
export function getAllAdminEmails(): string[] {
  if (cachedAdminEmails === null) {
    cachedAdminEmails = getAdminEmails();
  }
  return [...cachedAdminEmails];
}
