/**
 * API Keys Management
 * Handles creation, validation, and management of API keys
 */

import { nanoid } from 'nanoid';
import crypto from 'crypto';
import { prisma } from './prisma';

// ==========================================
// Types
// ==========================================

export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  keyPrefix: string; // First 8 chars for display (pk_live_xxxx...)
  environment: 'live' | 'test';
  isActive: boolean;
  lastUsedAt: Date | null;
  createdAt: Date;
  expiresAt: Date | null;
  rateLimit: number; // requests per minute
  usageCount: number;
}

export interface CreateApiKeyInput {
  userId: string;
  name: string;
  environment?: 'live' | 'test';
  expiresInDays?: number;
}

export interface ApiKeyWithSecret extends Omit<ApiKey, 'keyHash'> {
  key: string; // Full key - only returned once at creation
}

// ==========================================
// Rate Limits based on user's credits
// ==========================================

export function getRateLimitForUser(credits: number): number {
  // Rate limit based on monthly credits
  if (credits >= 30000) return 1000; // Enterprise
  if (credits >= 2000) return 500;   // Business
  if (credits >= 500) return 300;    // Pro
  if (credits >= 100) return 60;     // Starter
  return 10; // Free
}

export function getPlanNameForCredits(credits: number): string {
  if (credits >= 30000) return 'Enterprise';
  if (credits >= 2000) return 'Business';
  if (credits >= 500) return 'Pro';
  if (credits >= 100) return 'Starter';
  return 'Free';
}

// ==========================================
// Key Generation
// ==========================================

/**
 * Generate a secure API key
 * Format: pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxx (32 chars after prefix)
 */
export function generateApiKey(environment: 'live' | 'test' = 'live'): string {
  const prefix = environment === 'live' ? 'pk_live_' : 'pk_test_';
  const randomPart = crypto.randomBytes(24).toString('base64url'); // 32 chars
  return `${prefix}${randomPart}`;
}

/**
 * Hash API key for secure storage
 */
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

/**
 * Get display prefix from full key
 */
export function getKeyPrefix(key: string): string {
  // Return first 12 chars + "..." + last 4 chars
  return `${key.substring(0, 12)}...${key.substring(key.length - 4)}`;
}

// ==========================================
// Database Operations
// ==========================================

/**
 * Create a new API key
 * Returns the full key only once - it's hashed for storage
 */
export async function createApiKey(input: CreateApiKeyInput): Promise<ApiKeyWithSecret> {
  const { userId, name, environment = 'live', expiresInDays } = input;

  // Get user to determine rate limit
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error('User not found');
  }

  const rateLimit = getRateLimitForUser(user.credits || 0);
  const key = generateApiKey(environment);
  const keyHash = hashApiKey(key);
  const keyPrefix = getKeyPrefix(key);

  const expiresAt = expiresInDays
    ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  const apiKey = await prisma.apiKey.create({
    data: {
      id: nanoid(),
      userId,
      name,
      keyHash,
      keyPrefix,
      environment,
      isActive: true,
      rateLimit,
      expiresAt,
    },
  });

  return {
    id: apiKey.id,
    userId: apiKey.userId,
    name: apiKey.name,
    keyPrefix: apiKey.keyPrefix,
    environment: apiKey.environment as 'live' | 'test',
    isActive: apiKey.isActive,
    lastUsedAt: apiKey.lastUsedAt,
    createdAt: apiKey.createdAt,
    expiresAt: apiKey.expiresAt,
    rateLimit: apiKey.rateLimit,
    usageCount: apiKey.usageCount,
    key, // Full key - only returned here!
  };
}

/**
 * Validate an API key and return associated user
 */
export async function validateApiKey(key: string): Promise<{
  valid: boolean;
  userId?: string;
  apiKeyId?: string;
  rateLimit?: number;
  error?: string;
}> {
  const keyHash = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    include: { user: true },
  });

  if (!apiKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  if (!apiKey.isActive) {
    return { valid: false, error: 'API key is deactivated' };
  }

  if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
    return { valid: false, error: 'API key has expired' };
  }

  // Update last used
  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: {
      lastUsedAt: new Date(),
      usageCount: { increment: 1 },
    },
  });

  return {
    valid: true,
    userId: apiKey.userId,
    apiKeyId: apiKey.id,
    rateLimit: apiKey.rateLimit,
  };
}

/**
 * Get all API keys for a user
 */
export async function getUserApiKeys(userId: string): Promise<Omit<ApiKey, 'keyHash'>[]> {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return keys.map((k) => ({
    id: k.id,
    userId: k.userId,
    name: k.name,
    keyPrefix: k.keyPrefix,
    environment: k.environment as 'live' | 'test',
    isActive: k.isActive,
    lastUsedAt: k.lastUsedAt,
    createdAt: k.createdAt,
    expiresAt: k.expiresAt,
    rateLimit: k.rateLimit,
    usageCount: k.usageCount,
  }));
}

/**
 * Deactivate an API key
 */
export async function deactivateApiKey(keyId: string, userId: string): Promise<boolean> {
  const result = await prisma.apiKey.updateMany({
    where: { id: keyId, userId },
    data: { isActive: false },
  });

  return result.count > 0;
}

/**
 * Delete an API key
 */
export async function deleteApiKey(keyId: string, userId: string): Promise<boolean> {
  const result = await prisma.apiKey.deleteMany({
    where: { id: keyId, userId },
  });

  return result.count > 0;
}

/**
 * Update rate limits for all user's keys when their plan changes
 */
export async function updateUserKeyRateLimits(userId: string, credits: number): Promise<void> {
  const rateLimit = getRateLimitForUser(credits);

  await prisma.apiKey.updateMany({
    where: { userId },
    data: { rateLimit },
  });
}

/**
 * Get API key statistics for a user
 */
export async function getApiKeyStats(userId: string): Promise<{
  totalKeys: number;
  activeKeys: number;
  totalRequests: number;
  lastUsed: Date | null;
}> {
  const keys = await prisma.apiKey.findMany({
    where: { userId },
  });

  const activeKeys = keys.filter((k) => k.isActive).length;
  const totalRequests = keys.reduce((sum, k) => sum + k.usageCount, 0);
  const lastUsed = keys
    .filter((k) => k.lastUsedAt)
    .sort((a, b) => (b.lastUsedAt?.getTime() || 0) - (a.lastUsedAt?.getTime() || 0))[0]?.lastUsedAt || null;

  return {
    totalKeys: keys.length,
    activeKeys,
    totalRequests,
    lastUsed,
  };
}
