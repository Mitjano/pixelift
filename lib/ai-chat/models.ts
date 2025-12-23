/**
 * Konfiguracja modeli AI Chat dla OpenRouter
 *
 * Każdy model ma:
 * - id: identyfikator OpenRouter
 * - name: wyświetlana nazwa
 * - tier: kategoria cenowa (free, budget, pro, premium, reasoning)
 * - contextLength: maksymalna długość kontekstu
 * - supportsImages: czy obsługuje obrazy
 * - supportsStreaming: czy obsługuje streaming
 */

import type { AIChatTier } from '@/lib/credits-config';

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  tier: AIChatTier;
  contextLength: number;
  supportsImages: boolean;
  supportsStreaming: boolean;
  description: string;
  /** Koszt per 1M tokenów wejściowych (USD) */
  inputCostPer1M: number;
  /** Koszt per 1M tokenów wyjściowych (USD) */
  outputCostPer1M: number;
  /** Czy model jest dostępny */
  isAvailable: boolean;
  /** Ikona/logo providera */
  icon?: string;
}

/**
 * Wszystkie dostępne modele AI Chat
 * Posortowane według tier: free -> budget -> pro -> premium -> reasoning
 */
export const AI_MODELS: AIModel[] = [
  // ============= FREE TIER =============
  {
    id: 'google/gemini-2.0-flash-lite-001',
    name: 'Gemini Flash-Lite',
    provider: 'Google',
    tier: 'free',
    contextLength: 1000000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Szybki i darmowy model Google z 1M kontekstem',
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    isAvailable: true,
    icon: 'gemini',
  },
  {
    id: 'meta-llama/llama-3.3-8b-instruct:free',
    name: 'Llama 3.3 8B',
    provider: 'Meta',
    tier: 'free',
    contextLength: 131072,
    supportsImages: false,
    supportsStreaming: true,
    description: 'Kompaktowy i szybki model Meta',
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    isAvailable: true,
    icon: 'meta',
  },
  {
    id: 'qwen/qwen-2.5-72b-instruct:free',
    name: 'Qwen 2.5 72B',
    provider: 'Alibaba',
    tier: 'free',
    contextLength: 131072,
    supportsImages: false,
    supportsStreaming: true,
    description: 'Potężny chiński model open-source',
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    isAvailable: true,
    icon: 'qwen',
  },
  {
    id: 'deepseek/deepseek-chat:free',
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    tier: 'free',
    contextLength: 65536,
    supportsImages: false,
    supportsStreaming: true,
    description: 'Wydajny model open-source od DeepSeek',
    inputCostPer1M: 0,
    outputCostPer1M: 0,
    isAvailable: true,
    icon: 'deepseek',
  },

  // ============= BUDGET TIER =============
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    tier: 'budget',
    contextLength: 128000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Ekonomiczny model OpenAI z obsługą obrazów',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    isAvailable: true,
    icon: 'openai',
  },
  {
    id: 'google/gemini-2.0-flash-001',
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    tier: 'budget',
    contextLength: 1000000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Szybki model Google z 1M kontekstem',
    inputCostPer1M: 0.1,
    outputCostPer1M: 0.4,
    isAvailable: true,
    icon: 'gemini',
  },
  {
    id: 'google/gemini-2.5-flash-preview',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    tier: 'budget',
    contextLength: 1000000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Najnowszy Flash od Google',
    inputCostPer1M: 0.15,
    outputCostPer1M: 0.6,
    isAvailable: true,
    icon: 'gemini',
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    tier: 'budget',
    contextLength: 200000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Szybki i tani model Anthropic',
    inputCostPer1M: 0.8,
    outputCostPer1M: 4,
    isAvailable: true,
    icon: 'anthropic',
  },

  // ============= PRO TIER =============
  {
    id: 'openai/gpt-4.1',
    name: 'GPT-4.1',
    provider: 'OpenAI',
    tier: 'pro',
    contextLength: 1000000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Najnowsza wersja GPT-4 z 1M kontekstem',
    inputCostPer1M: 2,
    outputCostPer1M: 8,
    isAvailable: true,
    icon: 'openai',
  },
  {
    id: 'openai/gpt-5.2',
    name: 'GPT-5.2',
    provider: 'OpenAI',
    tier: 'pro',
    contextLength: 128000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Najnowszy flagowy model OpenAI',
    inputCostPer1M: 2.5,
    outputCostPer1M: 10,
    isAvailable: true,
    icon: 'openai',
  },
  {
    id: 'anthropic/claude-sonnet-4',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    tier: 'pro',
    contextLength: 200000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Zbalansowany model Anthropic',
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    isAvailable: true,
    icon: 'anthropic',
  },
  {
    id: 'anthropic/claude-4.5-sonnet',
    name: 'Claude Sonnet 4.5',
    provider: 'Anthropic',
    tier: 'pro',
    contextLength: 200000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Ulepszony Sonnet z lepszym kodem',
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    isAvailable: true,
    icon: 'anthropic',
  },
  {
    id: 'mistralai/mistral-large-2411',
    name: 'Mistral Large',
    provider: 'Mistral',
    tier: 'pro',
    contextLength: 128000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Flagowy model Mistral AI',
    inputCostPer1M: 2,
    outputCostPer1M: 6,
    isAvailable: true,
    icon: 'mistral',
  },
  {
    id: 'google/gemini-2.5-pro-preview',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    tier: 'pro',
    contextLength: 1000000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Profesjonalny model Google z 1M kontekstem',
    inputCostPer1M: 1.25,
    outputCostPer1M: 10,
    isAvailable: true,
    icon: 'gemini',
  },
  {
    id: 'x-ai/grok-3',
    name: 'Grok 3',
    provider: 'xAI',
    tier: 'pro',
    contextLength: 131072,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Model xAI z dostępem do wiedzy z X',
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    isAvailable: true,
    icon: 'xai',
  },

  // ============= REASONING TIER =============
  {
    id: 'deepseek/deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    tier: 'reasoning',
    contextLength: 65536,
    supportsImages: false,
    supportsStreaming: true,
    description: 'Model rozumowania z chain-of-thought',
    inputCostPer1M: 0.55,
    outputCostPer1M: 2.19,
    isAvailable: true,
    icon: 'deepseek',
  },

  // ============= PREMIUM TIER =============
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'OpenAI',
    tier: 'premium',
    contextLength: 128000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Multimodalny flagowiec OpenAI',
    inputCostPer1M: 2.5,
    outputCostPer1M: 10,
    isAvailable: true,
    icon: 'openai',
  },
  {
    id: 'x-ai/grok-4',
    name: 'Grok 4',
    provider: 'xAI',
    tier: 'premium',
    contextLength: 131072,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Najnowszy i najpotężniejszy model xAI',
    inputCostPer1M: 3,
    outputCostPer1M: 15,
    isAvailable: true,
    icon: 'xai',
  },
  {
    id: 'anthropic/claude-opus-4',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    tier: 'premium',
    contextLength: 200000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Najpotężniejszy Claude dla złożonych zadań',
    inputCostPer1M: 15,
    outputCostPer1M: 75,
    isAvailable: true,
    icon: 'anthropic',
  },
  {
    id: 'anthropic/claude-4.5-opus',
    name: 'Claude Opus 4.5',
    provider: 'Anthropic',
    tier: 'premium',
    contextLength: 200000,
    supportsImages: true,
    supportsStreaming: true,
    description: 'Najnowszy flagowy model Anthropic',
    inputCostPer1M: 15,
    outputCostPer1M: 75,
    isAvailable: true,
    icon: 'anthropic',
  },
];

/**
 * Domyślny model (darmowy)
 */
export const DEFAULT_MODEL_ID = 'google/gemini-2.0-flash-lite-001';

/**
 * Pobierz model po ID
 */
export function getModelById(id: string): AIModel | undefined {
  return AI_MODELS.find((m) => m.id === id);
}

/**
 * Pobierz modele według tier
 */
export function getModelsByTier(tier: AIChatTier): AIModel[] {
  return AI_MODELS.filter((m) => m.tier === tier && m.isAvailable);
}

/**
 * Pobierz wszystkie dostępne modele
 */
export function getAvailableModels(): AIModel[] {
  return AI_MODELS.filter((m) => m.isAvailable);
}

/**
 * Pobierz modele obsługujące obrazy
 */
export function getImageSupportedModels(): AIModel[] {
  return AI_MODELS.filter((m) => m.supportsImages && m.isAvailable);
}

/**
 * Pobierz darmowe modele
 */
export function getFreeModels(): AIModel[] {
  return getModelsByTier('free');
}

/**
 * Sprawdź czy model jest darmowy
 */
export function isModelFree(modelId: string): boolean {
  const model = getModelById(modelId);
  return model?.tier === 'free';
}

/**
 * Pogrupowane modele według tier
 */
export function getModelsGroupedByTier(): Record<AIChatTier, AIModel[]> {
  return {
    free: getModelsByTier('free'),
    budget: getModelsByTier('budget'),
    pro: getModelsByTier('pro'),
    premium: getModelsByTier('premium'),
    reasoning: getModelsByTier('reasoning'),
  };
}

/**
 * Kolejność wyświetlania tierów
 */
export const TIER_ORDER: AIChatTier[] = ['free', 'budget', 'pro', 'reasoning', 'premium'];

/**
 * Nazwy tierów
 */
export const TIER_NAMES: Record<AIChatTier, { pl: string; en: string }> = {
  free: { pl: 'Darmowe', en: 'Free' },
  budget: { pl: 'Ekonomiczne', en: 'Budget' },
  pro: { pl: 'Profesjonalne', en: 'Pro' },
  premium: { pl: 'Premium', en: 'Premium' },
  reasoning: { pl: 'Rozumowanie', en: 'Reasoning' },
};

/**
 * Kolory tierów (Tailwind classes)
 */
export const TIER_COLORS: Record<AIChatTier, string> = {
  free: 'bg-green-500/10 text-green-500 border-green-500/20',
  budget: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  pro: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  premium: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  reasoning: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/20',
};
