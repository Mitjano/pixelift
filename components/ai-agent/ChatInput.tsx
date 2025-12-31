'use client';

import { useRef, useEffect, KeyboardEvent, ChangeEvent, useState } from 'react';
import Image from 'next/image';

export interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  uploading: boolean;
  url?: string;
  error?: string;
}

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (images?: UploadedImage[]) => void;
  onStop: () => void;
  isLoading: boolean;
  isStreaming: boolean;
  placeholder?: string;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isLoading,
  isStreaming,
  placeholder = 'Type a message...',
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      images.forEach(img => URL.revokeObjectURL(img.preview));
    };
  }, [images]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && (value.trim() || images.length > 0)) {
        handleSend();
      }
    }
  };

  const handleSend = () => {
    // Only send if there's text or successfully uploaded images
    const uploadedImages = images.filter(img => img.url && !img.error);
    if (!value.trim() && uploadedImages.length === 0) return;

    onSend(uploadedImages.length > 0 ? images : undefined);
    // Clear images after sending
    images.forEach(img => URL.revokeObjectURL(img.preview));
    setImages([]);
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newImages: UploadedImage[] = [];

    for (const file of Array.from(files)) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        continue;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        continue;
      }

      const preview = URL.createObjectURL(file);
      const img: UploadedImage = {
        id: `img-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        file,
        preview,
        uploading: true,
      };
      newImages.push(img);
    }

    if (newImages.length > 0) {
      setImages(prev => [...prev, ...newImages]);

      // Upload images
      for (const img of newImages) {
        try {
          const formData = new FormData();
          formData.append('file', img.file);

          const response = await fetch('/api/ai-agent/upload', {
            method: 'POST',
            body: formData,
          });

          if (response.ok) {
            const data = await response.json();
            setImages(prev =>
              prev.map(i =>
                i.id === img.id
                  ? { ...i, uploading: false, url: data.url }
                  : i
              )
            );
          } else {
            throw new Error('Upload failed');
          }
        } catch {
          setImages(prev =>
            prev.map(i =>
              i.id === img.id
                ? { ...i, uploading: false, error: 'Upload failed' }
                : i
            )
          );
        }
      }
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img) {
        URL.revokeObjectURL(img.preview);
      }
      return prev.filter(i => i.id !== id);
    });
  };

  const canSend = !isLoading && (value.trim() || images.some(img => img.url));

  return (
    <div className="space-y-3">
      {/* Image previews */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group"
            >
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-600 bg-gray-700">
                <Image
                  src={img.preview}
                  alt="Upload preview"
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
                {img.uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {img.error && (
                  <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center">
                    <span className="text-white text-xs">Error</span>
                  </div>
                )}
                {img.url && (
                  <div className="absolute bottom-1 right-1">
                    <span className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                  </div>
                )}
              </div>
              <button
                onClick={() => removeImage(img.id)}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              >
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div className="relative flex items-end gap-3">
        {/* Attachment button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="flex-shrink-0 p-3 rounded-xl bg-gray-700/50 hover:bg-gray-700 text-gray-400 hover:text-white transition disabled:opacity-50"
          title="Attach image"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>

        {/* Text input */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isLoading}
            rows={1}
            className="w-full resize-none bg-gray-700/50 border border-gray-600 focus:border-cyan-500 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition disabled:opacity-50"
            style={{ maxHeight: '200px' }}
          />

          {/* Character count */}
          {value.length > 0 && (
            <div className="absolute bottom-3 right-3 text-xs text-gray-500">
              {value.length}
            </div>
          )}
        </div>

        {/* Send/Stop button */}
        {isStreaming ? (
          <button
            onClick={onStop}
            className="flex-shrink-0 p-3 rounded-xl bg-red-600 hover:bg-red-700 text-white transition"
            title="Stop generation"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!canSend}
            className="flex-shrink-0 p-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
            title="Send message"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
