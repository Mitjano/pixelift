/**
 * API Route: AI Chat Models
 *
 * GET /api/ai-chat/models - Lista dostępnych modeli AI
 */

import { NextResponse } from 'next/server';
import {
  getAvailableModels,
  getModelsGroupedByTier,
  TIER_ORDER,
  TIER_NAMES,
  TIER_COLORS,
} from '@/lib/ai-chat';

export async function GET() {
  try {
    const models = getAvailableModels();
    const groupedModels = getModelsGroupedByTier();

    return NextResponse.json({
      models,
      groupedModels,
      tiers: TIER_ORDER.map((tier) => ({
        id: tier,
        name: TIER_NAMES[tier],
        color: TIER_COLORS[tier],
        models: groupedModels[tier],
      })),
    });
  } catch (error) {
    console.error('Get models error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
