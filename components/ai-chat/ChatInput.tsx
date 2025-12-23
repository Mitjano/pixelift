"use client";

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { FaPaperPlane, FaImage, FaStop, FaTimes } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi2";

interface ChatInputProps {
  onSend: (message: string, images?: { base64: string; mimeType: string }[]) => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  supportsImages?: boolean;
  placeholder?: string;
}

interface ImageAttachment {
  id: string;
  base64: string;
  mimeType: string;
  preview: string;
  name: string;
}

export default function ChatInput({
  onSend,
  onStop,
  isLoading = false,
  disabled = false,
  supportsImages = true,
  placeholder,
}: ChatInputProps) {
  const t = useTranslations("chat");
  const [message, setMessage] = useState("");
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSubmit = () => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage && images.length === 0) return;
    if (isLoading || disabled) return;

    onSend(
      trimmedMessage,
      images.length > 0
        ? images.map((img) => ({ base64: img.base64, mimeType: img.mimeType }))
        : undefined
    );

    setMessage("");
    setImages([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) {
        alert(t("errors.fileTooLarge"));
        continue;
      }

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];

        setImages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            base64,
            mimeType: file.type,
            preview: result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }

    // Reset input
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    if (!supportsImages) return;

    const files = e.dataTransfer.files;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > 10 * 1024 * 1024) continue;

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];

        setImages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random()}`,
            base64,
            mimeType: file.type,
            preview: result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const canSend = (message.trim().length > 0 || images.length > 0) && !isLoading && !disabled;

  return (
    <div
      className={`
        relative border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900
        ${isDragOver ? "ring-2 ring-purple-500 ring-inset" : ""}
      `}
      onDragOver={(e) => {
        e.preventDefault();
        if (supportsImages) setIsDragOver(true);
      }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex gap-2 p-3 pb-0 overflow-x-auto">
          {images.map((img) => (
            <div key={img.id} className="relative flex-shrink-0 group">
              <img
                src={img.preview}
                alt={img.name}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
              />
              <button
                onClick={() => removeImage(img.id)}
                className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FaTimes className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2 p-3">
        {/* Image upload button */}
        {supportsImages && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={disabled || isLoading}
              className={`
                flex-shrink-0 p-2.5 rounded-lg transition-colors
                ${disabled || isLoading
                  ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }
              `}
              title={t("attachImage")}
            >
              <FaImage className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t("placeholder")}
            disabled={disabled || isLoading}
            rows={1}
            className={`
              w-full px-4 py-2.5 rounded-xl resize-none
              border border-gray-200 dark:border-gray-700
              bg-gray-50 dark:bg-gray-800
              text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            `}
            style={{ minHeight: "44px", maxHeight: "200px" }}
          />
        </div>

        {/* Send/Stop button */}
        {isLoading ? (
          <button
            onClick={onStop}
            className="flex-shrink-0 p-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white transition-colors"
            title={t("stop")}
          >
            <FaStop className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!canSend}
            className={`
              flex-shrink-0 p-2.5 rounded-xl transition-colors
              ${canSend
                ? "bg-purple-600 hover:bg-purple-700 text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              }
            `}
            title={t("send")}
          >
            <FaPaperPlane className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Hints */}
      <div className="px-3 pb-2 text-xs text-gray-400 dark:text-gray-500">
        <span>Enter - wyślij</span>
        <span className="mx-2">•</span>
        <span>Shift+Enter - nowa linia</span>
        {supportsImages && (
          <>
            <span className="mx-2">•</span>
            <span>Przeciągnij obrazy</span>
          </>
        )}
      </div>

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-purple-500/10 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-medium">
            <HiSparkles className="w-5 h-5" />
            <span>Upuść obrazy tutaj</span>
          </div>
        </div>
      )}
    </div>
  );
}
