"use client";

import { useState, useRef, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { FaArrowUp, FaImage, FaStop, FaTimes } from "react-icons/fa";

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
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${Math.max(52, newHeight)}px`;
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
    if (textareaRef.current) {
      textareaRef.current.style.height = "52px";
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
    <div className="p-4">
      <div
        className={`
          relative rounded-2xl border-2 transition-all duration-200
          bg-gray-50 dark:bg-gray-800/50
          ${isDragOver
            ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
            : "border-gray-200 dark:border-gray-700 focus-within:border-gray-300 dark:focus-within:border-gray-600"}
        `}
        onDragOver={(e) => {
          e.preventDefault();
          if (supportsImages) setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        {/* Image previews - inside the box */}
        {images.length > 0 && (
          <div className="flex gap-2 p-3 pb-0 overflow-x-auto">
            {images.map((img) => (
              <div key={img.id} className="relative flex-shrink-0 group">
                <img
                  src={img.preview}
                  alt={img.name}
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(img.id)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gray-800 dark:bg-gray-600 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FaTimes className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main input area */}
        <div className="flex items-end gap-2 p-2">
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
                  flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-colors
                  ${disabled || isLoading
                    ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50"
                  }
                `}
                title={t("attachImage")}
              >
                <FaImage className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || t("placeholder")}
            disabled={disabled || isLoading}
            rows={1}
            className={`
              flex-1 px-3 py-3 resize-none bg-transparent
              text-gray-900 dark:text-white text-[15px]
              placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
            style={{ minHeight: "52px", maxHeight: "200px" }}
          />

          {/* Send/Stop button */}
          {isLoading ? (
            <button
              onClick={onStop}
              className="flex-shrink-0 w-10 h-10 rounded-xl bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 flex items-center justify-center transition-all hover:scale-105"
              title={t("stop")}
            >
              <FaStop className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canSend}
              className={`
                flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all
                ${canSend
                  ? "bg-gray-800 dark:bg-white text-white dark:text-gray-800 hover:scale-105 shadow-lg"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }
              `}
              title={t("send")}
            >
              <FaArrowUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Subtle hint below */}
      <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-medium">Enter</kbd>
        <span className="mx-1">wyślij</span>
        <span className="mx-2 text-gray-300 dark:text-gray-600">•</span>
        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[10px] font-medium">Shift + Enter</kbd>
        <span className="mx-1">nowa linia</span>
      </p>

      {/* Drag overlay */}
      {isDragOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-purple-600 dark:text-purple-400 font-medium text-sm">
            Upuść obrazy tutaj
          </div>
        </div>
      )}
    </div>
  );
}
