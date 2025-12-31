/**
 * AI Agent Tools - Type Definitions
 *
 * Centralne typy dla systemu narzędzi AI Agenta
 */

import type { Tool, ToolFunction } from '@/lib/ai-chat/openrouter';

/**
 * Kategorie narzędzi
 */
export type ToolCategory =
  | 'image_editing'      // Edycja obrazów
  | 'image_generation'   // Generowanie obrazów
  | 'image_analysis'     // Analiza obrazów
  | 'text_processing'    // Przetwarzanie tekstu
  | 'file_management'    // Zarządzanie plikami
  | 'web_research'       // Research webowy
  | 'social_media'       // Social media
  | 'translation'        // Tłumaczenia
  | 'utility';           // Narzędzia pomocnicze

/**
 * Status wykonania narzędzia
 */
export type ToolExecutionStatus = 'pending' | 'running' | 'success' | 'error' | 'cancelled';

/**
 * Wynik wykonania narzędzia
 */
export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTimeMs: number;
  creditsUsed: number;
}

/**
 * Kontekst wykonania narzędzia
 */
export interface ToolExecutionContext {
  userId: string;
  sessionId: string;
  availableCredits: number;
  previousResults: Map<string, ToolExecutionResult>;
  abortSignal?: AbortSignal;
  /** Base64 data URLs of images uploaded in the current message */
  uploadedImages?: string[];
}

/**
 * Handler narzędzia - funkcja wykonująca logikę narzędzia
 */
export type ToolHandler<TArgs = Record<string, unknown>, TResult = unknown> = (
  args: TArgs,
  context: ToolExecutionContext
) => Promise<ToolExecutionResult<TResult>>;

/**
 * Rozszerzony typ narzędzia z metadanymi i handlerem
 */
export interface RegisteredTool<TArgs = Record<string, unknown>, TResult = unknown> {
  // Definicja dla OpenRouter API
  definition: Tool;

  // Metadane
  category: ToolCategory;
  creditsRequired: number;
  estimatedTimeSeconds: number;
  requiresImage: boolean;
  producesImage: boolean;

  // Handler
  handler: ToolHandler<TArgs, TResult>;

  // Walidacja
  validateArgs?: (args: TArgs) => { valid: boolean; error?: string };
}

/**
 * Mapa zarejestrowanych narzędzi
 */
export type ToolsRegistry = Map<string, RegisteredTool>;

/**
 * Konfiguracja narzędzia do rejestracji
 */
export interface ToolConfig<TArgs = Record<string, unknown>, TResult = unknown> {
  name: string;
  description: string;
  category: ToolCategory;
  creditsRequired: number;
  estimatedTimeSeconds: number;
  requiresImage?: boolean;
  producesImage?: boolean;
  parameters: ToolFunction['parameters'];
  handler: ToolHandler<TArgs, TResult>;
  validateArgs?: (args: TArgs) => { valid: boolean; error?: string };
}

/**
 * Helper do tworzenia definicji Tool dla OpenRouter
 */
export function createToolDefinition(config: {
  name: string;
  description: string;
  parameters: ToolFunction['parameters'];
}): Tool {
  return {
    type: 'function',
    function: {
      name: config.name,
      description: config.description,
      parameters: config.parameters,
    },
  };
}

/**
 * Helper do tworzenia RegisteredTool z konfiguracji
 */
export function createRegisteredTool<TArgs = Record<string, unknown>, TResult = unknown>(
  config: ToolConfig<TArgs, TResult>
): RegisteredTool<TArgs, TResult> {
  return {
    definition: createToolDefinition({
      name: config.name,
      description: config.description,
      parameters: config.parameters,
    }),
    category: config.category,
    creditsRequired: config.creditsRequired,
    estimatedTimeSeconds: config.estimatedTimeSeconds,
    requiresImage: config.requiresImage ?? false,
    producesImage: config.producesImage ?? false,
    handler: config.handler,
    validateArgs: config.validateArgs,
  };
}
