/**
 * Moduł do liczenia tokenów dla AI Chat
 *
 * Używa prostego przybliżenia (4 znaki = 1 token dla języków łacińskich)
 * Jest to wystarczające do estymacji kosztów przed wysłaniem.
 * Rzeczywiste zużycie tokenów pochodzi z odpowiedzi API.
 */

import { getModelById } from './models';
import { calculateAIChatCost, type AIChatTier } from '@/lib/credits-config';

/**
 * Przybliżone liczenie tokenów
 * Używa heurystyki: ~4 znaki = 1 token dla angielskiego
 * Dla innych języków może być mniej dokładne
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;

  // Heurystyka: średnio 4 znaki na token dla angielskiego
  // Dla polskiego/innych języków może być 3-3.5
  const avgCharsPerToken = 3.5;

  return Math.ceil(text.length / avgCharsPerToken);
}

/**
 * Estymuj tokeny dla obrazu
 * OpenRouter/GPT-4 Vision: obrazy kosztują ~85-170 tokenów w zależności od rozmiaru
 */
export function estimateImageTokens(
  width?: number,
  height?: number,
  detail: 'low' | 'high' | 'auto' = 'auto'
): number {
  // Low detail: stały koszt ~85 tokenów
  if (detail === 'low') {
    return 85;
  }

  // High detail: zależy od rozmiaru
  // Brak wymiarów - zakładamy średni rozmiar
  if (!width || !height) {
    return 255; // Średnia wartość
  }

  // Oblicz liczbę 512x512 tiles
  const tiles = Math.ceil(width / 512) * Math.ceil(height / 512);
  // Każdy tile = 170 tokenów + 85 bazowych
  return 85 + tiles * 170;
}

/**
 * Estymuj tokeny dla całej wiadomości (tekst + obrazy)
 */
export function estimateMessageTokens(
  text: string,
  imageCount: number = 0
): number {
  const textTokens = estimateTokens(text);
  const imageTokens = imageCount * 255; // Średni koszt obrazu

  return textTokens + imageTokens;
}

/**
 * Estymuj tokeny dla całej konwersacji
 */
export function estimateConversationTokens(
  messages: { role: string; content: string; imageCount?: number }[]
): number {
  let total = 0;

  for (const msg of messages) {
    total += estimateMessageTokens(msg.content, msg.imageCount || 0);
    // Dodaj overhead dla metadanych wiadomości (~4 tokeny per wiadomość)
    total += 4;
  }

  return total;
}

/**
 * Oblicz estymowany koszt przed wysłaniem
 */
export function estimateCost(
  modelId: string,
  inputTokens: number,
  estimatedOutputTokens: number = 500 // Zakładamy średnią odpowiedź
): { credits: number; tier: AIChatTier } {
  const model = getModelById(modelId);

  if (!model) {
    return { credits: 0, tier: 'free' };
  }

  const tier = model.tier;
  const credits = calculateAIChatCost(tier, inputTokens, estimatedOutputTokens);

  return { credits, tier };
}

/**
 * Oblicz rzeczywisty koszt po otrzymaniu odpowiedzi
 */
export function calculateActualCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): { credits: number; tier: AIChatTier } {
  const model = getModelById(modelId);

  if (!model) {
    return { credits: 0, tier: 'free' };
  }

  const tier = model.tier;
  const credits = calculateAIChatCost(tier, inputTokens, outputTokens);

  return { credits, tier };
}

/**
 * Formatuj liczbę tokenów do wyświetlenia
 */
export function formatTokenCount(tokens: number): string {
  if (tokens < 1000) {
    return tokens.toString();
  }

  if (tokens < 1000000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }

  return `${(tokens / 1000000).toFixed(2)}M`;
}

/**
 * Sprawdź czy wiadomość mieści się w limicie kontekstu modelu
 */
export function isWithinContextLimit(
  modelId: string,
  totalTokens: number,
  reserveForOutput: number = 4096
): boolean {
  const model = getModelById(modelId);

  if (!model) {
    return false;
  }

  return totalTokens + reserveForOutput <= model.contextLength;
}

/**
 * Oblicz ile tokenów pozostało do limitu
 */
export function getRemainingContextTokens(
  modelId: string,
  usedTokens: number,
  reserveForOutput: number = 4096
): number {
  const model = getModelById(modelId);

  if (!model) {
    return 0;
  }

  return Math.max(0, model.contextLength - usedTokens - reserveForOutput);
}

/**
 * Skróć konwersację jeśli przekracza limit kontekstu
 * Zachowuje system prompt i najnowsze wiadomości
 */
export function truncateConversation(
  messages: { role: string; content: string; imageCount?: number }[],
  maxTokens: number,
  reserveForOutput: number = 4096
): { role: string; content: string; imageCount?: number }[] {
  const targetTokens = maxTokens - reserveForOutput;

  // Oblicz tokeny od końca
  let totalTokens = 0;
  const result: { role: string; content: string; imageCount?: number }[] = [];

  // Zachowaj system prompt (jeśli jest)
  const systemMessage = messages.find((m) => m.role === 'system');
  if (systemMessage) {
    totalTokens += estimateMessageTokens(systemMessage.content, 0);
  }

  // Dodawaj wiadomości od końca
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];

    if (msg.role === 'system') continue;

    const msgTokens = estimateMessageTokens(msg.content, msg.imageCount || 0) + 4;

    if (totalTokens + msgTokens > targetTokens) {
      break;
    }

    totalTokens += msgTokens;
    result.unshift(msg);
  }

  // Dodaj system prompt na początek
  if (systemMessage) {
    result.unshift(systemMessage);
  }

  return result;
}

/**
 * Eksportuj stałe
 */
export const TOKEN_CONSTANTS = {
  AVERAGE_CHARS_PER_TOKEN: 3.5,
  LOW_DETAIL_IMAGE_TOKENS: 85,
  HIGH_DETAIL_TILE_TOKENS: 170,
  MESSAGE_OVERHEAD_TOKENS: 4,
  DEFAULT_OUTPUT_RESERVE: 4096,
  DEFAULT_ESTIMATED_OUTPUT: 500,
};
