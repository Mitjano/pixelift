/**
 * Database Abstraction Layer
 *
 * Provides a unified interface for database operations.
 * Supports both JSON file storage (legacy) and PostgreSQL via Prisma.
 *
 * Set USE_POSTGRES=true to use PostgreSQL, otherwise JSON files are used.
 */

import { prisma } from './prisma';
import * as jsonDb from './db';

// Check if PostgreSQL should be used
const USE_POSTGRES = process.env.USE_POSTGRES === 'true';

// Type exports from Prisma for consistency
export type {
  User,
  Transaction,
  Usage,
  Campaign,
  Notification,
  ApiKey,
  FeatureFlag,
  Backup,
  EmailTemplate,
  Report,
  Webhook,
  WebhookLog,
  ABTest,
  ABTestVariant,
  ModerationRule,
  ModerationQueue,
  Ticket,
  TicketMessage,
  Referral,
} from './generated/prisma';

// Re-export enums
export {
  UserRole,
  UserStatus,
  TransactionType,
  TransactionStatus,
  CampaignType,
  CampaignStatus,
  NotificationType,
  NotificationCategory,
  BackupType,
  EmailTemplateCategory,
  EmailTemplateStatus,
  ReportType,
  ReportFormat,
  WebhookLogStatus,
  ABTestType,
  ABTestStatus,
  ModerationRuleType,
  ModerationTarget,
  ModerationSeverity,
  ModerationAction,
  ModerationQueueStatus,
  ModerationContentType,
  TicketStatus,
  TicketPriority,
  TicketCategory,
  ReferralStatus,
} from './generated/prisma';

// ============================================
// USER OPERATIONS
// ============================================

export async function getAllUsers() {
  if (USE_POSTGRES) {
    return prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
  return jsonDb.getAllUsers();
}

export async function getUserByEmail(email: string) {
  if (USE_POSTGRES) {
    return prisma.user.findUnique({
      where: { email },
    });
  }
  return jsonDb.getUserByEmail(email);
}

export async function getUserById(id: string) {
  if (USE_POSTGRES) {
    return prisma.user.findUnique({
      where: { id },
    });
  }
  return jsonDb.getUserById(id);
}

export async function createUser(userData: {
  email: string;
  name?: string;
  image?: string;
  role?: 'user' | 'premium' | 'admin';
  status?: 'active' | 'banned' | 'suspended';
  credits?: number;
  totalUsage?: number;
}) {
  if (USE_POSTGRES) {
    return prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name,
        image: userData.image,
        role: userData.role || 'user',
        status: userData.status || 'active',
        credits: userData.credits || 0,
        totalUsage: userData.totalUsage || 0,
      },
    });
  }
  return jsonDb.createUser({
    email: userData.email,
    name: userData.name,
    image: userData.image,
    role: userData.role || 'user',
    status: userData.status || 'active',
    credits: userData.credits || 0,
    totalUsage: userData.totalUsage || 0,
  });
}

export async function updateUser(id: string, updates: Partial<{
  email: string;
  name: string;
  image: string;
  role: 'user' | 'premium' | 'admin';
  status: 'active' | 'banned' | 'suspended';
  credits: number;
  totalUsage: number;
  lastLoginAt: Date | string;
  firstUploadAt: Date | string;
}>) {
  if (USE_POSTGRES) {
    return prisma.user.update({
      where: { id },
      data: updates as any,
    });
  }
  return jsonDb.updateUser(id, updates as any);
}

export async function updateUserLogin(email: string) {
  if (USE_POSTGRES) {
    await prisma.user.update({
      where: { email },
      data: { lastLoginAt: new Date() },
    });
    return;
  }
  return jsonDb.updateUserLogin(email);
}

// ============================================
// TRANSACTION OPERATIONS
// ============================================

export async function getAllTransactions() {
  if (USE_POSTGRES) {
    return prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
  return jsonDb.getAllTransactions();
}

export async function getTransactionsByUserId(userId: string) {
  if (USE_POSTGRES) {
    return prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  return jsonDb.getTransactionsByUserId(userId);
}

export async function createTransaction(data: {
  userId: string;
  type: 'purchase' | 'refund' | 'subscription';
  plan?: string;
  amount: number;
  currency?: string;
  status?: 'pending' | 'completed' | 'failed' | 'refunded';
  stripeId?: string;
  metadata?: string;
}) {
  if (USE_POSTGRES) {
    return prisma.transaction.create({
      data: {
        userId: data.userId,
        type: data.type,
        plan: data.plan,
        amount: data.amount,
        currency: data.currency || 'PLN',
        status: data.status || 'pending',
        stripeId: data.stripeId,
        metadata: data.metadata,
      },
    });
  }
  return jsonDb.createTransaction({
    userId: data.userId,
    type: data.type,
    plan: data.plan,
    amount: data.amount,
    currency: data.currency || 'PLN',
    status: data.status || 'pending',
    stripeId: data.stripeId,
    metadata: data.metadata,
  });
}

export async function updateTransaction(id: string, updates: Partial<{
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  completedAt: Date | string;
}>) {
  if (USE_POSTGRES) {
    return prisma.transaction.update({
      where: { id },
      data: updates as any,
    });
  }
  return jsonDb.updateTransaction(id, updates as any);
}

// ============================================
// USAGE OPERATIONS
// ============================================

export async function getAllUsage() {
  if (USE_POSTGRES) {
    return prisma.usage.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
  return jsonDb.getAllUsage();
}

export async function getUsageByUserId(userId: string) {
  if (USE_POSTGRES) {
    return prisma.usage.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  return jsonDb.getUsageByUserId(userId);
}

export async function createUsage(data: {
  userId: string;
  type: string;
  creditsUsed: number;
  imageSize?: string;
  model?: string;
}) {
  if (USE_POSTGRES) {
    // Create usage record
    const usage = await prisma.usage.create({
      data: {
        userId: data.userId,
        type: data.type,
        creditsUsed: data.creditsUsed,
        imageSize: data.imageSize,
        model: data.model,
      },
    });

    // Update user's credits and totalUsage
    await prisma.user.update({
      where: { id: data.userId },
      data: {
        credits: { decrement: data.creditsUsed },
        totalUsage: { increment: 1 },
      },
    });

    return usage;
  }
  return jsonDb.createUsage(data);
}

// ============================================
// CAMPAIGN OPERATIONS
// ============================================

export async function getAllCampaigns() {
  if (USE_POSTGRES) {
    return prisma.campaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
  return jsonDb.getAllCampaigns();
}

export async function getCampaignById(id: string) {
  if (USE_POSTGRES) {
    return prisma.campaign.findUnique({
      where: { id },
    });
  }
  return jsonDb.getCampaignById(id);
}

export async function createCampaign(data: {
  name: string;
  type: 'google_ads' | 'facebook_ads' | 'email';
  status?: 'active' | 'paused' | 'completed';
  budget: number;
  spent?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  startDate: Date | string;
  endDate?: Date | string;
}) {
  if (USE_POSTGRES) {
    return prisma.campaign.create({
      data: {
        name: data.name,
        type: data.type,
        status: data.status || 'active',
        budget: data.budget,
        spent: data.spent || 0,
        impressions: data.impressions || 0,
        clicks: data.clicks || 0,
        conversions: data.conversions || 0,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });
  }
  return jsonDb.createCampaign({
    name: data.name,
    type: data.type,
    status: data.status || 'active',
    budget: data.budget,
    spent: data.spent || 0,
    impressions: data.impressions || 0,
    clicks: data.clicks || 0,
    conversions: data.conversions || 0,
    startDate: typeof data.startDate === 'string' ? data.startDate : data.startDate.toISOString(),
    endDate: data.endDate ? (typeof data.endDate === 'string' ? data.endDate : data.endDate.toISOString()) : undefined,
  });
}

export async function updateCampaign(id: string, updates: Partial<{
  name: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
}>) {
  if (USE_POSTGRES) {
    return prisma.campaign.update({
      where: { id },
      data: updates as any,
    });
  }
  return jsonDb.updateCampaign(id, updates as any);
}

export async function deleteCampaign(id: string) {
  if (USE_POSTGRES) {
    await prisma.campaign.delete({ where: { id } });
    return true;
  }
  return jsonDb.deleteCampaign(id);
}

// ============================================
// NOTIFICATION OPERATIONS
// ============================================

export async function getAllNotifications() {
  if (USE_POSTGRES) {
    return prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
  return jsonDb.getAllNotifications();
}

export async function getUnreadNotifications() {
  if (USE_POSTGRES) {
    return prisma.notification.findMany({
      where: { read: false },
      orderBy: { createdAt: 'desc' },
    });
  }
  return jsonDb.getUnreadNotifications();
}

export async function createNotification(data: {
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'user' | 'system' | 'api' | 'marketing' | 'finance';
  title: string;
  message: string;
  metadata?: any;
}) {
  if (USE_POSTGRES) {
    return prisma.notification.create({
      data: {
        type: data.type,
        category: data.category,
        title: data.title,
        message: data.message,
        metadata: data.metadata,
        read: false,
      },
    });
  }
  return jsonDb.createNotification(data);
}

export async function markNotificationAsRead(id: string) {
  if (USE_POSTGRES) {
    return prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }
  return jsonDb.markNotificationAsRead(id);
}

export async function markAllNotificationsAsRead() {
  if (USE_POSTGRES) {
    await prisma.notification.updateMany({
      data: { read: true },
    });
    return;
  }
  return jsonDb.markAllNotificationsAsRead();
}

export async function deleteNotification(id: string) {
  if (USE_POSTGRES) {
    await prisma.notification.delete({ where: { id } });
    return true;
  }
  return jsonDb.deleteNotification(id);
}

// ============================================
// API KEY OPERATIONS
// ============================================

export async function getAllApiKeys() {
  if (USE_POSTGRES) {
    return prisma.apiKey.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
  return jsonDb.getAllApiKeys();
}

export async function getApiKeysByUserId(userId: string) {
  if (USE_POSTGRES) {
    return prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
  return jsonDb.getApiKeysByUserId(userId);
}

export async function getApiKeyByKey(key: string) {
  if (USE_POSTGRES) {
    // Hash the key to find it in database
    const crypto = await import('crypto');
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    return prisma.apiKey.findUnique({
      where: { keyHash },
    });
  }
  return jsonDb.getApiKeyByKey(key);
}

export async function createApiKey(data: {
  userId: string;
  name: string;
  environment?: 'live' | 'test';
  rateLimit?: number;
  expiresAt?: Date | string;
}) {
  const crypto = await import('crypto');
  const { nanoid } = await import('nanoid');

  // Generate key with prefix based on environment
  const prefix = data.environment === 'test' ? 'pk_test_' : 'pk_live_';
  const randomPart = crypto.randomBytes(24).toString('base64url');
  const key = `${prefix}${randomPart}`;
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  const keyPrefix = `${key.substring(0, 12)}...${key.substring(key.length - 4)}`;

  if (USE_POSTGRES) {
    const created = await prisma.apiKey.create({
      data: {
        userId: data.userId,
        name: data.name,
        keyHash,
        keyPrefix,
        environment: data.environment || 'live',
        isActive: true,
        rateLimit: data.rateLimit || 100,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      },
    });
    // Return with the full key (only shown once!)
    return { ...created, key };
  }
  return jsonDb.createApiKey({
    userId: data.userId,
    name: data.name,
    status: 'active',
    rateLimit: data.rateLimit || 100,
    expiresAt: data.expiresAt ? (typeof data.expiresAt === 'string' ? data.expiresAt : data.expiresAt.toISOString()) : undefined,
  });
}

export async function updateApiKey(id: string, updates: Partial<{
  name: string;
  status: 'active' | 'revoked';
  rateLimit: number;
}>) {
  if (USE_POSTGRES) {
    return prisma.apiKey.update({
      where: { id },
      data: updates as any,
    });
  }
  return jsonDb.updateApiKey(id, updates as any);
}

export async function revokeApiKey(id: string) {
  if (USE_POSTGRES) {
    await prisma.apiKey.update({
      where: { id },
      data: { isActive: false },
    });
    return true;
  }
  return jsonDb.revokeApiKey(id);
}

export async function deleteApiKey(id: string) {
  if (USE_POSTGRES) {
    await prisma.apiKey.delete({ where: { id } });
    return true;
  }
  return jsonDb.deleteApiKey(id);
}

export async function incrementApiKeyUsage(key: string) {
  if (USE_POSTGRES) {
    // Hash the key to find it
    const crypto = await import('crypto');
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    await prisma.apiKey.update({
      where: { keyHash },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    });
    return;
  }
  return jsonDb.incrementApiKeyUsage(key);
}

// ============================================
// FEATURE FLAG OPERATIONS
// ============================================

export async function getAllFeatureFlags() {
  if (USE_POSTGRES) {
    return prisma.featureFlag.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }
  return jsonDb.getAllFeatureFlags();
}

export async function getFeatureFlagByKey(key: string) {
  if (USE_POSTGRES) {
    return prisma.featureFlag.findUnique({
      where: { key },
    });
  }
  return jsonDb.getFeatureFlagByKey(key);
}

export async function isFeatureEnabled(key: string, userId?: string) {
  if (USE_POSTGRES) {
    const flag = await prisma.featureFlag.findUnique({
      where: { key },
    });

    if (!flag) return false;
    if (!flag.enabled) return false;

    // Check if user is specifically targeted
    if (userId && flag.targetUsers && flag.targetUsers.includes(userId)) {
      return true;
    }

    // Check rollout percentage
    if (flag.rolloutPercentage === 100) return true;
    if (flag.rolloutPercentage === 0) return false;

    // Simple hash-based rollout
    if (userId) {
      const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return (hash % 100) < flag.rolloutPercentage;
    }

    return false;
  }
  return jsonDb.isFeatureEnabled(key, userId);
}

export async function createFeatureFlag(data: {
  name: string;
  key: string;
  description: string;
  enabled?: boolean;
  rolloutPercentage?: number;
  targetUsers?: string[];
}) {
  if (USE_POSTGRES) {
    return prisma.featureFlag.create({
      data: {
        name: data.name,
        key: data.key,
        description: data.description,
        enabled: data.enabled || false,
        rolloutPercentage: data.rolloutPercentage || 0,
        targetUsers: data.targetUsers || [],
      },
    });
  }
  return jsonDb.createFeatureFlag({
    name: data.name,
    key: data.key,
    description: data.description,
    enabled: data.enabled || false,
    rolloutPercentage: data.rolloutPercentage || 0,
    targetUsers: data.targetUsers,
  });
}

export async function updateFeatureFlag(id: string, updates: Partial<{
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  targetUsers: string[];
}>) {
  if (USE_POSTGRES) {
    return prisma.featureFlag.update({
      where: { id },
      data: updates as any,
    });
  }
  return jsonDb.updateFeatureFlag(id, updates as any);
}

export async function deleteFeatureFlag(id: string) {
  if (USE_POSTGRES) {
    await prisma.featureFlag.delete({ where: { id } });
    return true;
  }
  return jsonDb.deleteFeatureFlag(id);
}

// ============================================
// STATS HELPERS
// ============================================

export async function getUserStats() {
  if (USE_POSTGRES) {
    const now = new Date();
    const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());

    const [total, active, premium, newThisMonth, admins] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'active' } }),
      prisma.user.count({ where: { role: { in: ['premium', 'admin'] } } }),
      prisma.user.count({ where: { createdAt: { gte: monthAgo } } }),
      prisma.user.count({ where: { role: 'admin' } }),
    ]);

    return { total, active, premium, newThisMonth, admins };
  }
  return jsonDb.getUserStats();
}

export async function getFinanceStats(days: number = 30) {
  if (USE_POSTGRES) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const recentTransactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'completed',
      },
    });

    const totalRevenue = recentTransactions.reduce((sum, t) => sum + t.amount, 0);
    const totalCount = recentTransactions.length;

    return {
      totalRevenue,
      totalCount,
      averageValue: totalCount > 0 ? totalRevenue / totalCount : 0,
      transactions: recentTransactions,
    };
  }
  return jsonDb.getFinanceStats(days);
}

// ============================================
// DATABASE CONNECTION HELPERS
// ============================================

export async function connectDatabase() {
  if (USE_POSTGRES) {
    await prisma.$connect();
    console.log('Connected to PostgreSQL via Prisma');
  } else {
    console.log('Using JSON file storage');
  }
}

export async function disconnectDatabase() {
  if (USE_POSTGRES) {
    await prisma.$disconnect();
  }
}

export function isDatabasePostgres() {
  return USE_POSTGRES;
}
