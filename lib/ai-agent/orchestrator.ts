/**
 * AI Agent Orchestrator
 *
 * Główny moduł zarządzający przepływem agenta:
 * - Wysyła zapytania do modelu AI z dostępnymi narzędziami
 * - Obsługuje tool calls z odpowiedzi
 * - Wykonuje narzędzia i zwraca wyniki do modelu
 * - Obsługuje streaming odpowiedzi
 * - Zarządza wielokrotnymi turami (multi-turn conversation)
 */

import {
  chatCompletion,
  chatCompletionStream,
  type ChatMessage,
  type ChatCompletionOptions,
  type ToolCall,
  type ExtendedChatMessage,
  type ToolResultMessage,
  type AssistantToolCallMessage,
  parseToolCalls,
  createToolResultMessage,
  createSSETransformerWithTools,
} from '@/lib/ai-chat/openrouter';

import {
  getToolDefinitions,
  getToolDefinitionsFor,
  executeTool,
  type ToolExecutionResult,
  type ToolExecutionContext,
} from './tools';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Status sesji agenta
 */
export type AgentSessionStatus =
  | 'idle'
  | 'thinking'
  | 'executing_tools'
  | 'streaming'
  | 'completed'
  | 'error'
  | 'cancelled';

/**
 * Pojedyncze wykonanie narzędzia
 */
export interface ToolExecution {
  toolCallId: string;
  toolName: string;
  arguments: Record<string, unknown>;
  result: ToolExecutionResult;
  startedAt: Date;
  completedAt: Date;
}

/**
 * Pojedynczy krok agenta (tura)
 */
export interface AgentStep {
  stepNumber: number;
  userMessage?: string;
  assistantMessage?: string;
  toolCalls?: ToolCall[];
  toolExecutions?: ToolExecution[];
  startedAt: Date;
  completedAt?: Date;
  tokensUsed?: {
    prompt: number;
    completion: number;
  };
}

/**
 * Zdarzenie agenta do streamowania
 */
export type AgentEvent =
  | { type: 'thinking' }
  | { type: 'content_chunk'; content: string }
  | { type: 'tool_call_start'; toolCallId: string; toolName: string; arguments: Record<string, unknown> }
  | { type: 'tool_call_complete'; toolCallId: string; result: ToolExecutionResult }
  | { type: 'step_complete'; step: AgentStep }
  | { type: 'done'; finalMessage: string; totalSteps: number; totalTokens: number; creditsUsed: number }
  | { type: 'error'; error: string };

/**
 * Konfiguracja orchestratora
 */
export interface OrchestratorConfig {
  model: string;
  systemPrompt?: string;
  availableTools?: string[]; // Nazwy narzędzi do udostępnienia (wszystkie jeśli puste)
  maxSteps?: number; // Maksymalna liczba tur tool-calling (default: 10)
  temperature?: number;
  maxTokens?: number;
}

/**
 * Kontekst sesji agenta
 */
export interface AgentSession {
  sessionId: string;
  userId: string;
  status: AgentSessionStatus;
  config: OrchestratorConfig;
  messages: ExtendedChatMessage[];
  steps: AgentStep[];
  totalCreditsUsed: number;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// ORCHESTRATOR CLASS
// ============================================================================

export class Orchestrator {
  private session: AgentSession;
  private executionContext: ToolExecutionContext;
  private abortController: AbortController | null = null;

  constructor(
    sessionId: string,
    userId: string,
    config: OrchestratorConfig,
    availableCredits: number
  ) {
    this.session = {
      sessionId,
      userId,
      status: 'idle',
      config: {
        maxSteps: 10,
        temperature: 0.7,
        maxTokens: 4096,
        ...config,
      },
      messages: [],
      steps: [],
      totalCreditsUsed: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.executionContext = {
      userId,
      sessionId,
      availableCredits,
      previousResults: new Map(),
    };
  }

  /**
   * Pobierz aktualny stan sesji
   */
  getSession(): AgentSession {
    return { ...this.session };
  }

  /**
   * Anuluj bieżące wykonanie
   */
  cancel(): void {
    if (this.abortController) {
      this.abortController.abort();
      this.session.status = 'cancelled';
    }
  }

  /**
   * Wykonaj zapytanie agenta (bez streamingu)
   */
  async run(userMessage: string): Promise<{
    finalMessage: string;
    steps: AgentStep[];
    creditsUsed: number;
  }> {
    this.abortController = new AbortController();
    this.executionContext.abortSignal = this.abortController.signal;

    // Dodaj wiadomość użytkownika
    this.session.messages.push({
      role: 'user',
      content: userMessage,
    });

    let stepNumber = 0;
    let finalMessage = '';

    try {
      this.session.status = 'thinking';

      while (stepNumber < (this.session.config.maxSteps ?? 10)) {
        stepNumber++;
        const step = await this.executeStep(stepNumber);
        this.session.steps.push(step);

        // Jeśli nie ma tool calls, to koniec
        if (!step.toolCalls || step.toolCalls.length === 0) {
          finalMessage = step.assistantMessage || '';
          break;
        }
      }

      this.session.status = 'completed';
    } catch (error) {
      this.session.status = 'error';
      throw error;
    }

    return {
      finalMessage,
      steps: this.session.steps,
      creditsUsed: this.session.totalCreditsUsed,
    };
  }

  /**
   * Wykonaj zapytanie agenta ze streamingiem zdarzeń
   */
  async *runStream(userMessage: string): AsyncGenerator<AgentEvent> {
    this.abortController = new AbortController();
    this.executionContext.abortSignal = this.abortController.signal;

    // Dodaj wiadomość użytkownika
    this.session.messages.push({
      role: 'user',
      content: userMessage,
    });

    let stepNumber = 0;
    let finalMessage = '';
    let totalTokens = 0;

    try {
      while (stepNumber < (this.session.config.maxSteps ?? 10)) {
        stepNumber++;
        this.session.status = 'thinking';
        yield { type: 'thinking' };

        // Wykonaj krok ze streamingiem
        const stepGenerator = this.executeStepStream(stepNumber);
        let step: AgentStep | null = null;

        for await (const event of stepGenerator) {
          if (event.type === 'step_complete') {
            step = event.step;
          }
          yield event;
        }

        if (!step) {
          throw new Error('Step execution failed');
        }

        this.session.steps.push(step);
        totalTokens += (step.tokensUsed?.prompt ?? 0) + (step.tokensUsed?.completion ?? 0);

        // Jeśli nie ma tool calls, to koniec
        if (!step.toolCalls || step.toolCalls.length === 0) {
          finalMessage = step.assistantMessage || '';
          break;
        }
      }

      this.session.status = 'completed';
      yield {
        type: 'done',
        finalMessage,
        totalSteps: stepNumber,
        totalTokens,
        creditsUsed: this.session.totalCreditsUsed,
      };
    } catch (error) {
      this.session.status = 'error';
      yield {
        type: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Wykonaj pojedynczy krok (turę) agenta
   */
  private async executeStep(stepNumber: number): Promise<AgentStep> {
    const startedAt = new Date();

    // Przygotuj opcje
    const options = this.buildCompletionOptions();

    // Wywołaj model
    const response = await chatCompletion(options);

    const step: AgentStep = {
      stepNumber,
      startedAt,
      assistantMessage: response.choices[0]?.message?.content || undefined,
      toolCalls: response.choices[0]?.message?.tool_calls,
      tokensUsed: {
        prompt: response.usage?.prompt_tokens ?? 0,
        completion: response.usage?.completion_tokens ?? 0,
      },
    };

    // Dodaj wiadomość asystenta do historii
    if (step.toolCalls && step.toolCalls.length > 0) {
      const assistantMsg: AssistantToolCallMessage = {
        role: 'assistant',
        content: step.assistantMessage || null,
        tool_calls: step.toolCalls,
      };
      this.session.messages.push(assistantMsg);

      // Wykonaj narzędzia
      this.session.status = 'executing_tools';
      step.toolExecutions = await this.executeToolCalls(step.toolCalls);

      // Dodaj wyniki narzędzi do historii
      for (const execution of step.toolExecutions) {
        const toolResult: ToolResultMessage = createToolResultMessage(
          execution.toolCallId,
          execution.result
        );
        this.session.messages.push(toolResult);
      }
    } else if (step.assistantMessage) {
      this.session.messages.push({
        role: 'assistant',
        content: step.assistantMessage,
      });
    }

    step.completedAt = new Date();
    return step;
  }

  /**
   * Wykonaj pojedynczy krok ze streamingiem
   */
  private async *executeStepStream(stepNumber: number): AsyncGenerator<AgentEvent> {
    const startedAt = new Date();

    // Przygotuj opcje
    const options = this.buildCompletionOptions();

    // Wywołaj model ze streamingiem
    const { stream } = await chatCompletionStream(options);

    // Transformuj stream
    const transformer = createSSETransformerWithTools();
    const transformedStream = stream.pipeThrough(transformer);
    const reader = transformedStream.getReader();
    const decoder = new TextDecoder();

    let assistantMessage = '';
    let toolCalls: ToolCall[] = [];
    let promptTokens = 0;
    let completionTokens = 0;

    this.session.status = 'streaming';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr) continue;

            try {
              const data = JSON.parse(jsonStr);

              if (data.type === 'chunk' && data.content) {
                assistantMessage += data.content;
                yield { type: 'content_chunk', content: data.content };
              } else if (data.type === 'tool_call_start') {
                // Początek tool call
              } else if (data.type === 'done') {
                if (data.tool_calls) {
                  toolCalls = data.tool_calls;
                }
                if (data.usage) {
                  promptTokens = data.usage.prompt_tokens ?? 0;
                  completionTokens = data.usage.completion_tokens ?? 0;
                }
              }
            } catch {
              // Ignoruj błędy parsowania
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }

    const step: AgentStep = {
      stepNumber,
      startedAt,
      assistantMessage: assistantMessage || undefined,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      tokensUsed: {
        prompt: promptTokens,
        completion: completionTokens,
      },
    };

    // Dodaj wiadomość asystenta do historii
    if (step.toolCalls && step.toolCalls.length > 0) {
      const assistantMsg: AssistantToolCallMessage = {
        role: 'assistant',
        content: step.assistantMessage || null,
        tool_calls: step.toolCalls,
      };
      this.session.messages.push(assistantMsg);

      // Wykonaj narzędzia
      this.session.status = 'executing_tools';
      step.toolExecutions = [];

      for (const toolCall of step.toolCalls) {
        const parsed = parseToolCalls([toolCall])[0];
        yield {
          type: 'tool_call_start',
          toolCallId: parsed.id,
          toolName: parsed.name,
          arguments: parsed.arguments,
        };

        const execution = await this.executeSingleTool(toolCall);
        step.toolExecutions.push(execution);

        yield {
          type: 'tool_call_complete',
          toolCallId: execution.toolCallId,
          result: execution.result,
        };

        // Dodaj wynik do historii
        const toolResult: ToolResultMessage = createToolResultMessage(
          execution.toolCallId,
          execution.result
        );
        this.session.messages.push(toolResult);
      }
    } else if (step.assistantMessage) {
      this.session.messages.push({
        role: 'assistant',
        content: step.assistantMessage,
      });
    }

    step.completedAt = new Date();
    yield { type: 'step_complete', step };
  }

  /**
   * Wykonaj wszystkie tool calls z jednej odpowiedzi
   */
  private async executeToolCalls(toolCalls: ToolCall[]): Promise<ToolExecution[]> {
    const executions: ToolExecution[] = [];

    for (const toolCall of toolCalls) {
      const execution = await this.executeSingleTool(toolCall);
      executions.push(execution);
    }

    return executions;
  }

  /**
   * Wykonaj pojedynczy tool call
   */
  private async executeSingleTool(toolCall: ToolCall): Promise<ToolExecution> {
    const startedAt = new Date();
    const parsed = parseToolCalls([toolCall])[0];

    const result = await executeTool(
      parsed.name,
      parsed.arguments,
      this.executionContext
    );

    // Zaktualizuj kredyty
    if (result.creditsUsed > 0) {
      this.session.totalCreditsUsed += result.creditsUsed;
      this.executionContext.availableCredits -= result.creditsUsed;
    }

    // Zapisz wynik do poprzednich rezultatów
    this.executionContext.previousResults.set(toolCall.id, result);

    return {
      toolCallId: toolCall.id,
      toolName: parsed.name,
      arguments: parsed.arguments,
      result,
      startedAt,
      completedAt: new Date(),
    };
  }

  /**
   * Zbuduj opcje dla chatCompletion
   */
  private buildCompletionOptions(): ChatCompletionOptions {
    // Pobierz definicje narzędzi
    const tools = this.session.config.availableTools
      ? getToolDefinitionsFor(this.session.config.availableTools)
      : getToolDefinitions();

    // Konwertuj wiadomości do formatu ChatMessage
    const messages: ChatMessage[] = this.session.messages.map((msg) => {
      if (msg.role === 'tool') {
        // Tool result messages - konwertuj na user message z kontekstem
        return {
          role: 'user' as const,
          content: `[Tool Result for ${(msg as ToolResultMessage).tool_call_id}]: ${msg.content}`,
        };
      }
      return msg as ChatMessage;
    });

    return {
      model: this.session.config.model,
      messages,
      systemPrompt: this.session.config.systemPrompt,
      temperature: this.session.config.temperature,
      maxTokens: this.session.config.maxTokens,
      tools: tools.length > 0 ? tools : undefined,
      tool_choice: tools.length > 0 ? 'auto' : undefined,
    };
  }
}

// ============================================================================
// FACTORY FUNCTION
// ============================================================================

/**
 * Utwórz nowego orchestratora dla sesji agenta
 */
export function createOrchestrator(
  sessionId: string,
  userId: string,
  config: OrchestratorConfig,
  availableCredits: number
): Orchestrator {
  return new Orchestrator(sessionId, userId, config, availableCredits);
}
