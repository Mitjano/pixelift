/**
 * Klient OpenRouter API dla AI Chat
 *
 * Obsługuje:
 * - Streaming odpowiedzi (SSE)
 * - Obsługę obrazów (base64)
 * - Zliczanie tokenów
 * - Rate limiting
 */

import { getModelById, type AIModel } from './models';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * Typy wiadomości
 */
export type MessageRole = 'user' | 'assistant' | 'system';

export interface MessageContent {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string; // base64 lub URL
  };
}

export interface ChatMessage {
  role: MessageRole;
  content: string | MessageContent[];
}

export interface ChatCompletionOptions {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  choices: {
    message: {
      role: 'assistant';
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  id: string;
  model: string;
  choices: {
    delta: {
      content?: string;
      role?: string;
    };
    finish_reason: string | null;
  }[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Błąd OpenRouter
 */
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'OpenRouterError';
  }
}

/**
 * Przygotuj wiadomości do wysłania
 */
function prepareMessages(
  messages: ChatMessage[],
  systemPrompt?: string
): ChatMessage[] {
  const preparedMessages: ChatMessage[] = [];

  // Dodaj system prompt jeśli istnieje
  if (systemPrompt) {
    preparedMessages.push({
      role: 'system',
      content: systemPrompt,
    });
  }

  // Dodaj resztę wiadomości
  preparedMessages.push(...messages);

  return preparedMessages;
}

/**
 * Wykonaj request do OpenRouter (bez streamingu)
 */
export async function chatCompletion(
  options: ChatCompletionOptions
): Promise<ChatCompletionResponse> {
  if (!OPENROUTER_API_KEY) {
    throw new OpenRouterError('OPENROUTER_API_KEY is not configured', 500, 'CONFIG_ERROR');
  }

  const model = getModelById(options.model);
  if (!model) {
    throw new OpenRouterError(`Model ${options.model} not found`, 400, 'MODEL_NOT_FOUND');
  }

  const messages = prepareMessages(options.messages, options.systemPrompt);

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://pixelift.pl',
      'X-Title': 'PixeLift AI Chat',
    },
    body: JSON.stringify({
      model: options.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      stream: false,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new OpenRouterError(
      error.error?.message || `OpenRouter API error: ${response.status}`,
      response.status,
      error.error?.code
    );
  }

  return response.json();
}

/**
 * Wykonaj request do OpenRouter ze streamingiem
 * Zwraca ReadableStream dla SSE
 */
export async function chatCompletionStream(
  options: ChatCompletionOptions
): Promise<{
  stream: ReadableStream<Uint8Array>;
  model: AIModel;
}> {
  if (!OPENROUTER_API_KEY) {
    throw new OpenRouterError('OPENROUTER_API_KEY is not configured', 500, 'CONFIG_ERROR');
  }

  const model = getModelById(options.model);
  if (!model) {
    throw new OpenRouterError(`Model ${options.model} not found`, 400, 'MODEL_NOT_FOUND');
  }

  if (!model.supportsStreaming) {
    throw new OpenRouterError(`Model ${options.model} does not support streaming`, 400, 'STREAMING_NOT_SUPPORTED');
  }

  const messages = prepareMessages(options.messages, options.systemPrompt);

  const response = await fetch(OPENROUTER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://pixelift.pl',
      'X-Title': 'PixeLift AI Chat',
    },
    body: JSON.stringify({
      model: options.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 2048,
      stream: true,
      stream_options: {
        include_usage: true,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new OpenRouterError(
      error.error?.message || `OpenRouter API error: ${response.status}`,
      response.status,
      error.error?.code
    );
  }

  if (!response.body) {
    throw new OpenRouterError('No response body', 500, 'NO_BODY');
  }

  return {
    stream: response.body,
    model,
  };
}

/**
 * Parsuj chunk SSE
 */
export function parseSSEChunk(chunk: string): StreamChunk | null {
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6).trim();

      if (data === '[DONE]') {
        return null;
      }

      try {
        return JSON.parse(data);
      } catch {
        // Ignoruj nieprawidłowe JSON
        return null;
      }
    }
  }

  return null;
}

/**
 * Transformuj stream OpenRouter do formatu SSE dla klienta
 */
export function createSSETransformer() {
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();
  let buffer = '';
  let totalContent = '';
  let usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | null = null;

  return new TransformStream<Uint8Array, Uint8Array>({
    transform(chunk, controller) {
      buffer += decoder.decode(chunk, { stream: true });

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();

          if (data === '[DONE]') {
            // Wyślij finalne dane z usage
            const finalData = JSON.stringify({
              type: 'done',
              content: totalContent,
              usage,
            });
            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
            return;
          }

          try {
            const parsed: StreamChunk = JSON.parse(data);

            // Zapisz usage jeśli dostępne
            if (parsed.usage) {
              usage = parsed.usage;
            }

            // Pobierz treść
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              totalContent += content;

              // Wyślij chunk do klienta
              const clientData = JSON.stringify({
                type: 'chunk',
                content,
              });
              controller.enqueue(encoder.encode(`data: ${clientData}\n\n`));
            }

            // Sprawdź finish_reason
            const finishReason = parsed.choices?.[0]?.finish_reason;
            if (finishReason) {
              const finalData = JSON.stringify({
                type: 'done',
                content: totalContent,
                usage,
                finishReason,
              });
              controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
            }
          } catch {
            // Ignoruj błędy parsowania
          }
        }
      }
    },
    flush(controller) {
      // Przetwórz pozostały bufor
      if (buffer.startsWith('data: ')) {
        const data = buffer.slice(6).trim();
        if (data && data !== '[DONE]') {
          try {
            const parsed: StreamChunk = JSON.parse(data);
            if (parsed.usage) {
              usage = parsed.usage;
            }
          } catch {
            // Ignoruj
          }
        }
      }

      // Wyślij finalne dane jeśli jeszcze nie wysłane
      if (totalContent && !usage) {
        const finalData = JSON.stringify({
          type: 'done',
          content: totalContent,
        });
        controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
      }
    },
  });
}

/**
 * Konwertuj obraz do base64 dla OpenRouter
 */
export function imageToBase64Content(
  base64Data: string,
  mimeType: string = 'image/jpeg'
): MessageContent {
  return {
    type: 'image_url',
    image_url: {
      url: `data:${mimeType};base64,${base64Data}`,
    },
  };
}

/**
 * Utwórz wiadomość użytkownika z tekstem i opcjonalnymi obrazami
 */
export function createUserMessage(
  text: string,
  images?: { base64: string; mimeType: string }[]
): ChatMessage {
  if (!images || images.length === 0) {
    return {
      role: 'user',
      content: text,
    };
  }

  const content: MessageContent[] = [
    { type: 'text', text },
    ...images.map((img) => imageToBase64Content(img.base64, img.mimeType)),
  ];

  return {
    role: 'user',
    content,
  };
}

/**
 * Sprawdź status API OpenRouter
 */
export async function checkAPIStatus(): Promise<boolean> {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}
