'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import MessageList from './MessageList';
import ChatInput, { type UploadedImage } from './ChatInput';
import ToolExecutionCard from './ToolExecutionCard';
import type { AgentEvent } from '@/lib/ai-agent/orchestrator';

// Message types for UI
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  toolExecutions?: ToolExecutionUI[];
  images?: string[]; // URLs of attached images
}

export interface ToolExecutionUI {
  id: string;
  toolName: string;
  arguments: Record<string, unknown>;
  status: 'pending' | 'executing' | 'completed' | 'error';
  result?: {
    success: boolean;
    data?: unknown;
    error?: string;
    creditsUsed?: number;
  };
}

export default function AgentChat() {
  const { data: session, status } = useSession();
  const t = useTranslations('aiAgentPage.chat');

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentToolExecutions, setCurrentToolExecutions] = useState<ToolExecutionUI[]>([]);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentToolExecutions]);

  // Create session on mount
  useEffect(() => {
    if (session?.user && !sessionId) {
      createSession();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, sessionId]);

  const createSession = async () => {
    try {
      const response = await fetch('/api/ai-agent/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      setSessionId(data.sessionId);
    } catch (err) {
      console.error('Failed to create session:', err);
      setError(t('errors.sessionFailed'));
    }
  };

  const handleSend = useCallback(async (uploadedImages?: UploadedImage[]) => {
    if ((!input.trim() && !uploadedImages?.length) || isLoading || !sessionId) return;

    // Get image URLs from uploaded images
    const imageUrls = uploadedImages
      ?.filter(img => img.url)
      .map(img => img.url!) || [];

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
      images: imageUrls.length > 0 ? imageUrls : undefined,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);
    setCurrentToolExecutions([]);

    // Create placeholder for assistant message
    const assistantMessageId = `msg-${Date.now() + 1}`;
    const assistantMessage: ChatMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      toolExecutions: [],
    };
    setMessages((prev) => [...prev, assistantMessage]);

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/ai-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          message: userMessage.content,
          images: imageUrls.length > 0 ? imageUrls : undefined,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonStr = line.slice(6).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const event: AgentEvent = JSON.parse(jsonStr);
              handleAgentEvent(event, assistantMessageId);
            } catch {
              // Ignore parse errors
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // User cancelled
      } else {
        console.error('Chat error:', err);
        setError(t('errors.messageFailed'));
      }
    } finally {
      setIsLoading(false);
      setIsStreaming(false);

      // Finalize the assistant message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, isStreaming: false, toolExecutions: [...currentToolExecutions] }
            : msg
        )
      );
      setCurrentToolExecutions([]);
    }
  }, [input, isLoading, sessionId, t, currentToolExecutions]);

  const handleAgentEvent = (event: AgentEvent, messageId: string) => {
    switch (event.type) {
      case 'thinking':
        // Show thinking indicator
        break;

      case 'content_chunk':
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageId
              ? { ...msg, content: msg.content + event.content }
              : msg
          )
        );
        break;

      case 'tool_call_start':
        const newTool: ToolExecutionUI = {
          id: event.toolCallId,
          toolName: event.toolName,
          arguments: event.arguments,
          status: 'executing',
        };
        setCurrentToolExecutions((prev) => [...prev, newTool]);
        break;

      case 'tool_call_complete':
        setCurrentToolExecutions((prev) =>
          prev.map((tool) =>
            tool.id === event.toolCallId
              ? {
                  ...tool,
                  status: event.result.success ? 'completed' : 'error',
                  result: event.result,
                }
              : tool
          )
        );
        break;

      case 'done':
        // Final event
        break;

      case 'error':
        setError(event.error);
        break;
    }
  };

  const handleStop = () => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  };

  const handleNewSession = async () => {
    setMessages([]);
    setSessionId(null);
    setError(null);
    await createSession();
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
  };

  // Suggestion categories
  const suggestionCategories = [
    { key: 'popular', icon: '⭐' },
    { key: 'ecommerce', icon: '🛍️' },
    { key: 'social', icon: '📱' },
    { key: 'creative', icon: '🎨' },
    { key: 'professional', icon: '💼' },
    { key: 'photo', icon: '📷' },
  ];

  const [activeCategory, setActiveCategory] = useState('popular');

  // Get suggestions for active category
  const getCategorySuggestions = (category: string) => {
    try {
      return [0, 1, 2, 3, 4].map((i) =>
        t(`suggestionCategories.${category}.items.${i}`)
      ).filter(s => s && !s.includes('suggestionCategories'));
    } catch {
      return [];
    }
  };

  // Not logged in
  if (status === 'unauthenticated') {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-8 text-center">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
          <span className="text-4xl">🤖</span>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">{t('welcome')}</h3>
        <p className="text-gray-400 mb-6 max-w-md mx-auto">
          {t('welcomeSubtitle')}
        </p>
        <Link
          href="/auth/signin"
          className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-lg font-medium transition"
        >
          Sign In to Start
        </Link>
      </div>
    );
  }

  // Loading session
  if (status === 'loading') {
    return (
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-12 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-2xl overflow-hidden flex flex-col min-h-[600px]" style={{ height: 'min(calc(100vh - 250px), 900px)' }}>
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-gray-700 bg-gray-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
            <span className="text-xl">🤖</span>
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Agent</h3>
            <p className="text-xs text-gray-400">
              {isStreaming ? t('thinking') : 'Ready to help'}
            </p>
          </div>
        </div>
        <button
          onClick={handleNewSession}
          className="px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {t('newSession')}
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
              <span className="text-3xl">💬</span>
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">{t('welcome')}</h4>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {t('welcomeSubtitle')}
            </p>

            {/* Suggestion Categories */}
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-gray-500 mb-4">{t('suggestions.title')}</p>

              {/* Category tabs */}
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {suggestionCategories.map(({ key, icon }) => (
                  <button
                    key={key}
                    onClick={() => setActiveCategory(key)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition flex items-center gap-1.5 ${
                      activeCategory === key
                        ? 'bg-cyan-600 text-white'
                        : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span>{icon}</span>
                    <span className="hidden sm:inline">
                      {t(`suggestionCategories.${key}.title`)}
                    </span>
                  </button>
                ))}
              </div>

              {/* Suggestions for active category */}
              <div className="flex flex-wrap justify-center gap-2">
                {getCategorySuggestions(activeCategory).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="px-3 py-2 bg-gray-700/50 hover:bg-cyan-600/30 border border-gray-600 hover:border-cyan-500/50 rounded-lg text-sm text-gray-300 hover:text-white transition text-left"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            <MessageList messages={messages} />

            {/* Current tool executions */}
            {currentToolExecutions.length > 0 && (
              <div className="space-y-2">
                {currentToolExecutions.map((tool) => (
                  <ToolExecutionCard key={tool.id} execution={tool} />
                ))}
              </div>
            )}
          </>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-gray-700 p-4 bg-gray-800/30">
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onStop={handleStop}
          isLoading={isLoading}
          isStreaming={isStreaming}
          placeholder={t('placeholder')}
        />
      </div>
    </div>
  );
}
