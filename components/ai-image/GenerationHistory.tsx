'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface HistoryImage {
  id: string;
  thumbnailUrl: string;
  outputUrl: string;
  prompt: string;
  model: string;
  createdAt: string;
}

interface GenerationHistoryProps {
  onSelectImage: (image: HistoryImage) => void;
  currentImageId?: string;
}

export default function GenerationHistory({ onSelectImage, currentImageId }: GenerationHistoryProps) {
  const t = useTranslations('aiImage');
  const { data: session } = useSession();
  const [history, setHistory] = useState<HistoryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [session]);

  const fetchHistory = async () => {
    try {
      const response = await fetch('/api/ai-image/my-creations?page=1&limit=10');
      const data = await response.json();
      if (response.ok && data.images) {
        setHistory(data.images);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add new image to history
  const addToHistory = (image: HistoryImage) => {
    setHistory(prev => [image, ...prev.slice(0, 9)]);
  };

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="border-t border-gray-800 pt-4 mt-4">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-16 h-16 rounded-lg bg-gray-800/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="border-t border-gray-800 pt-4 mt-4">
        <p className="text-sm text-gray-500 text-center py-4">
          {t('history.empty') || 'Your recent generations will appear here'}
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-gray-800 pt-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-400">
          {t('history.title') || 'Recent Generations'}
        </h3>
        <a
          href="/ai-image#gallery"
          className="text-xs text-purple-400 hover:text-purple-300 transition"
        >
          {t('history.viewAll') || 'View All'} →
        </a>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
        {history.map((image) => (
          <button
            key={image.id}
            onClick={() => onSelectImage(image)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition hover:scale-105 ${
              currentImageId === image.id
                ? 'border-purple-500 ring-2 ring-purple-500/30'
                : 'border-gray-700 hover:border-gray-600'
            }`}
            title={image.prompt.substring(0, 50)}
          >
            <img
              src={image.thumbnailUrl || image.outputUrl}
              alt={image.prompt.substring(0, 20)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

// Export addToHistory function for parent component
export type { HistoryImage };
