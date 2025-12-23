"use client";

import { useState, memo } from "react";
import { useTranslations } from "next-intl";
import { FaUser, FaRobot, FaCopy, FaCheck, FaRedo, FaThumbsUp, FaThumbsDown } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  creditsUsed?: number;
  isError?: boolean;
  errorMessage?: string;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onRate?: (rating: number) => void;
}

const ChatMessage = memo(function ChatMessage({
  id,
  role,
  content,
  model,
  inputTokens,
  outputTokens,
  creditsUsed,
  isError,
  errorMessage,
  isStreaming,
  onRegenerate,
  onRate,
}: ChatMessageProps) {
  const t = useTranslations("chat");
  const [copied, setCopied] = useState(false);
  const [rating, setRating] = useState<number | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleRate = (value: number) => {
    setRating(value);
    onRate?.(value);
  };

  const isUser = role === "user";
  const isSystem = role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center py-2">
        <div className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400 italic">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex gap-4 py-4 px-4 ${isUser ? "bg-transparent" : "bg-gray-50 dark:bg-gray-800/50"}`}
    >
      {/* Avatar */}
      <div
        className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
          ${isUser ? "bg-purple-600" : "bg-gray-700 dark:bg-gray-600"}
        `}
      >
        {isUser ? (
          <FaUser className="w-4 h-4 text-white" />
        ) : (
          <FaRobot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-2">
        {/* Role label */}
        <div className="flex items-center gap-2 text-sm font-medium">
          <span className={isUser ? "text-purple-600 dark:text-purple-400" : "text-gray-700 dark:text-gray-300"}>
            {isUser ? "Ty" : "AI"}
          </span>
          {model && !isUser && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({model.split("/").pop()})
            </span>
          )}
        </div>

        {/* Message content */}
        {isError ? (
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-red-600 dark:text-red-400">
              {errorMessage || t("errors.sendFailed")}
            </p>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {isUser ? (
              <p className="whitespace-pre-wrap">{content}</p>
            ) : (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const inline = !match;

                    if (inline) {
                      return (
                        <code
                          className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-sm font-mono"
                          {...props}
                        >
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="relative group">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(String(children).replace(/\n$/, ""));
                          }}
                          className="absolute right-2 top-2 p-2 rounded bg-gray-700 hover:bg-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Kopiuj kod"
                        >
                          <FaCopy className="w-3 h-3 text-gray-300" />
                        </button>
                        <SyntaxHighlighter
                          style={oneDark}
                          language={match?.[1] || "text"}
                          PreTag="div"
                          className="rounded-lg !mt-0"
                        >
                          {String(children).replace(/\n$/, "")}
                        </SyntaxHighlighter>
                      </div>
                    );
                  },
                  a({ href, children }) {
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {children}
                      </a>
                    );
                  },
                  table({ children }) {
                    return (
                      <div className="overflow-x-auto">
                        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                          {children}
                        </table>
                      </div>
                    );
                  },
                  th({ children }) {
                    return (
                      <th className="border border-gray-300 dark:border-gray-600 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-left">
                        {children}
                      </th>
                    );
                  },
                  td({ children }) {
                    return (
                      <td className="border border-gray-300 dark:border-gray-600 px-3 py-2">
                        {children}
                      </td>
                    );
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            )}

            {/* Streaming indicator */}
            {isStreaming && (
              <span className="inline-block w-2 h-5 ml-1 bg-purple-500 animate-pulse rounded-sm" />
            )}
          </div>
        )}

        {/* Actions & metadata (only for assistant messages) */}
        {!isUser && !isStreaming && (
          <div className="flex items-center justify-between pt-2">
            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                title={t("copy")}
              >
                {copied ? (
                  <FaCheck className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <FaCopy className="w-3.5 h-3.5" />
                )}
              </button>

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                  title={t("regenerate")}
                >
                  <FaRedo className="w-3.5 h-3.5" />
                </button>
              )}

              {onRate && (
                <>
                  <button
                    onClick={() => handleRate(1)}
                    className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                      rating === 1 ? "text-green-500" : "text-gray-500"
                    }`}
                    title="Dobra odpowiedź"
                  >
                    <FaThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleRate(-1)}
                    className={`p-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                      rating === -1 ? "text-red-500" : "text-gray-500"
                    }`}
                    title="Zła odpowiedź"
                  >
                    <FaThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>

            {/* Token info */}
            {(inputTokens || outputTokens) && (
              <div className="flex items-center gap-3 text-xs">
                <span className="text-gray-400 dark:text-gray-500">
                  {inputTokens && outputTokens
                    ? `${inputTokens.toLocaleString()} → ${outputTokens.toLocaleString()} tokenów`
                    : `${(inputTokens || 0) + (outputTokens || 0)} tokenów`}
                </span>
                {creditsUsed !== undefined && creditsUsed > 0 ? (
                  <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    -{creditsUsed.toFixed(3)} kr
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Darmowe
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default ChatMessage;
