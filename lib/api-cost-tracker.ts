/**
 * API Cost Tracker
 * Automatically tracks API usage costs and updates platform balances
 */

import { prisma } from '@/lib/prisma';

// =====================
// API Provider Cost Mapping
// =====================

export interface ApiCost {
  provider: 'replicate' | 'fal' | 'piapi' | 'openai' | 'anthropic' | 'runway' | 'minimax' | 'google';
  costUSD: number;
  operation: string;
  model?: string;
  metadata?: Record<string, unknown>;
}

// Provider mapping for tools/models
export const PROVIDER_MAPPING: Record<string, ApiCost['provider']> = {
  // Image Tools - Replicate
  'upscale': 'replicate',
  'upscale_premium': 'replicate',
  'remove_background': 'replicate',
  'colorize': 'replicate',
  'denoise': 'replicate',
  'expand': 'replicate',
  'object_removal': 'replicate',
  'packshot': 'replicate',
  'reimagine': 'replicate',
  'background_generate': 'replicate',
  'style_transfer': 'replicate',
  'structure_control': 'replicate',
  'inpainting': 'replicate',
  'portrait_relight': 'replicate',
  'watermark_remover': 'replicate',
  'face_restore': 'replicate',
  'vectorize': 'replicate',

  // AI Image Models - Replicate
  'flux-1.1-pro': 'replicate',
  'flux-schnell': 'replicate',
  'flux-1.1-pro-ultra': 'replicate',
  'flux-2.0-pro': 'replicate',
  'flux-kontext-pro': 'replicate',
  'recraft-v3': 'replicate',
  'recraft-v3-svg': 'replicate',
  'ideogram-v3-turbo': 'replicate',
  'ideogram-v3-quality': 'replicate',
  'sd-3.5-large': 'replicate',
  'sd-3.5-turbo': 'replicate',
  'hidream-l1-fast': 'replicate',
  'seedream-4': 'replicate',
  'nano-banana-pro': 'google', // Google Gemini via Replicate

  // Logo Maker - Ideogram
  'logo_maker': 'replicate',
  'text_effects': 'replicate',

  // Video Tools - Various
  'video_pixverse_5s': 'piapi',
  'video_pixverse_8s': 'piapi',
  'video_kling_5s': 'fal',
  'video_kling_10s': 'fal',
  'video_kling26_5s': 'fal',
  'video_kling26_10s': 'fal',
  'video_veo_4s': 'google',
  'video_veo_6s': 'google',
  'video_veo_8s': 'google',
  'video_hailuo_6s': 'fal',
  'video_hailuo_pro_6s': 'fal',
  'video_luma_ray2_5s': 'fal',

  // AI Video Tools
  'voiceover': 'fal',
  'captions': 'replicate',
  'lipsync': 'replicate',
  'talking_avatar': 'replicate',
  'url_to_video': 'replicate',

  // AI Music
  'music': 'fal',
};

// Estimated costs per operation (in USD)
// These are estimates based on API pricing
export const OPERATION_COSTS: Record<string, number> = {
  // Upscaling (Replicate) - varies by model
  'upscale_product': 0.01,  // Recraft Crisp
  'upscale_portrait': 0.03, // CodeFormer + Clarity
  'upscale_general': 0.02,  // Clarity Upscaler
  'upscale_faithful': 0,    // Local processing - free

  // Image Processing (Replicate)
  'remove_background': 0.01,
  'colorize': 0.02,
  'denoise': 0.01,
  'expand': 0.04,
  'object_removal': 0.03,
  'packshot': 0.04,
  'reimagine': 0.03,
  'background_generate': 0.04,
  'style_transfer': 0.04,
  'structure_control': 0.04,
  'inpainting': 0.04,
  'portrait_relight': 0.03,
  'watermark_remover': 0.02,
  'face_restore': 0.02,
  'vectorize': 0.03,
  'logo_maker': 0.08,
  'text_effects': 0.08,

  // Video Generation (per video)
  'video_pixverse_5s': 0.20,
  'video_pixverse_8s': 0.35,
  'video_kling_5s': 0.15,
  'video_kling_10s': 0.30,
  'video_kling26_5s': 0.18,
  'video_kling26_10s': 0.35,
  'video_veo_4s': 0.80,
  'video_veo_6s': 1.20,
  'video_veo_8s': 1.50,
  'video_hailuo_6s': 0.08,
  'video_hailuo_pro_6s': 0.15,
  'video_luma_ray2_5s': 0.06,

  // AI Video Tools
  'voiceover': 0.02, // Base cost, scales with length
  'captions': 0.03,
  'lipsync': 0.15,
  'talking_avatar': 0.25,
  'url_to_video': 0.30,

  // AI Music
  'music_60s': 0.05,
  'music_180s': 0.10,
  'music_300s': 0.15,
};

/**
 * Track API cost and update platform balance
 * Call this after every successful API operation
 */
export async function trackApiCost(params: {
  operation: string;
  model?: string;
  costUSD?: number;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const { operation, model, costUSD, metadata } = params;

  // Determine provider from operation or model
  const lookupKey = model || operation;
  const provider = PROVIDER_MAPPING[lookupKey];

  if (!provider) {
    console.warn(`[api-cost-tracker] Unknown provider for: ${lookupKey}`);
    return;
  }

  // Determine cost
  const cost = costUSD ?? OPERATION_COSTS[operation] ?? 0;

  if (cost === 0) {
    return; // No cost to track
  }

  try {
    // Get platform balance
    const platform = await prisma.apiPlatformBalance.findUnique({
      where: { platform: provider },
    });

    if (!platform) {
      console.warn(`[api-cost-tracker] Platform not found: ${provider}`);
      return;
    }

    // Update balance
    const newBalance = Math.max(0, platform.currentBalance - cost);

    // Calculate days until depleted based on current usage
    const now = new Date();
    const hoursSinceLastCheck = platform.lastChecked
      ? (now.getTime() - platform.lastChecked.getTime()) / (1000 * 60 * 60)
      : 24;

    // Update estimated costs
    const dailyCost = hoursSinceLastCheck > 0
      ? (platform.estimatedDailyCost * (24 - Math.min(hoursSinceLastCheck, 24)) + cost * (24 / Math.max(hoursSinceLastCheck, 1))) / 24
      : platform.estimatedDailyCost + cost;

    const daysUntilDepleted = dailyCost > 0
      ? Math.floor(newBalance / dailyCost)
      : null;

    // Update platform balance
    await prisma.apiPlatformBalance.update({
      where: { platform: provider },
      data: {
        currentBalance: newBalance,
        estimatedDailyCost: dailyCost,
        estimatedMonthlyCost: dailyCost * 30,
        daysUntilDepleted,
        lastChecked: now,
      },
    });

    // Record history
    await prisma.apiPlatformBalanceHistory.create({
      data: {
        platformId: platform.id,
        balance: newBalance,
        change: -cost,
        changeType: 'usage',
        description: `${operation}${model ? ` (${model})` : ''}: -$${cost.toFixed(4)}`,
        recordedBy: 'system',
      },
    });

    // Check if we need to send alerts
    if (newBalance < platform.criticalThreshold) {
      console.warn(`[api-cost-tracker] CRITICAL: ${provider} balance critically low: $${newBalance.toFixed(2)}`);
      // TODO: Send critical alert email
    } else if (newBalance < platform.alertThreshold) {
      console.warn(`[api-cost-tracker] WARNING: ${provider} balance low: $${newBalance.toFixed(2)}`);
      // TODO: Send warning alert email
    }

  } catch (error) {
    console.error(`[api-cost-tracker] Error tracking cost:`, error);
    // Don't throw - we don't want to fail the main operation
  }
}

/**
 * Track batch API costs (for operations that process multiple items)
 */
export async function trackBatchApiCost(params: {
  operation: string;
  count: number;
  costPerItem?: number;
  model?: string;
}): Promise<void> {
  const { operation, count, costPerItem, model } = params;
  const perItemCost = costPerItem ?? OPERATION_COSTS[operation] ?? 0;
  const totalCost = perItemCost * count;

  if (totalCost > 0) {
    await trackApiCost({
      operation,
      model,
      costUSD: totalCost,
      metadata: { count, costPerItem: perItemCost },
    });
  }
}

/**
 * Get current balance for a provider
 */
export async function getProviderBalance(provider: ApiCost['provider']): Promise<number | null> {
  try {
    const platform = await prisma.apiPlatformBalance.findUnique({
      where: { platform: provider },
      select: { currentBalance: true },
    });
    return platform?.currentBalance ?? null;
  } catch {
    return null;
  }
}

/**
 * Check if provider has sufficient balance for an operation
 */
export async function hasProviderBalance(
  provider: ApiCost['provider'],
  requiredAmount: number = 0.10
): Promise<boolean> {
  const balance = await getProviderBalance(provider);
  return balance !== null && balance >= requiredAmount;
}

/**
 * Get provider for a given operation/model
 */
export function getProvider(operationOrModel: string): ApiCost['provider'] | null {
  return PROVIDER_MAPPING[operationOrModel] ?? null;
}

/**
 * Get estimated cost for an operation
 */
export function getOperationCost(operation: string): number {
  return OPERATION_COSTS[operation] ?? 0;
}

/**
 * Record a top-up to a platform
 */
export async function recordTopUp(params: {
  platform: string;
  amount: number;
  recordedBy?: string;
}): Promise<void> {
  const { platform, amount, recordedBy = 'admin' } = params;

  const platformRecord = await prisma.apiPlatformBalance.findUnique({
    where: { platform },
  });

  if (!platformRecord) {
    throw new Error(`Platform not found: ${platform}`);
  }

  const newBalance = platformRecord.currentBalance + amount;

  await prisma.apiPlatformBalance.update({
    where: { platform },
    data: {
      currentBalance: newBalance,
      lastTopUp: amount,
      lastTopUpAt: new Date(),
      lastUpdatedBy: recordedBy,
    },
  });

  await prisma.apiPlatformBalanceHistory.create({
    data: {
      platformId: platformRecord.id,
      balance: newBalance,
      change: amount,
      changeType: 'topup',
      description: `Top-up: +$${amount.toFixed(2)}`,
      recordedBy,
    },
  });
}
