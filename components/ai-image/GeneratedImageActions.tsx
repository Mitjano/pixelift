'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import ShareModal from './ShareModal';

interface GeneratedImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  seed?: number;
}

interface GenerationSettings {
  prompt: string;
  model: string;
  modelName: string;
  style: string;
  styleName: string;
  aspectRatio: string;
  width: number;
  height: number;
  seed?: number;
}

interface GeneratedImageActionsProps {
  image: GeneratedImage;
  settings: GenerationSettings;
  onRemix?: (settings: GenerationSettings) => void;
  showUpscale?: boolean;
}

export default function GeneratedImageActions({
  image,
  settings,
  onRemix,
  showUpscale = true
}: GeneratedImageActionsProps) {
  const t = useTranslations('aiImage');
  const [showShareModal, setShowShareModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixelift-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(t('actions.downloaded') || 'Image downloaded!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error(t('actions.downloadError') || 'Failed to download');
    } finally {
      setDownloading(false);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}/ai-image/${image.id}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t('actions.linkCopied') || 'Link copied!');
    } catch (error) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopySeed = async () => {
    if (image.seed || settings.seed) {
      const seedValue = String(image.seed || settings.seed);
      await navigator.clipboard.writeText(seedValue);
      toast.success(t('actions.seedCopied') || 'Seed copied!');
    }
  };

  const handleRemix = () => {
    if (onRemix) {
      onRemix(settings);
      toast.success(t('actions.remixApplied') || 'Settings applied for remix!');
    }
  };

  return (
    <>
      <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="px-4 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-xl font-medium transition flex items-center justify-center gap-2 text-white"
          >
            {downloading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="hidden sm:inline">{t('actions.downloading') || '...'}</span>
              </>
            ) : (
              <>
                <span>⬇️</span>
                <span className="hidden sm:inline">{t('actions.download') || 'Download'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleCopyLink}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition flex items-center justify-center gap-2 text-white"
          >
            <span>🔗</span>
            <span className="hidden sm:inline">{t('actions.copyLink') || 'Copy Link'}</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition flex items-center justify-center gap-2 text-white"
          >
            <span>📤</span>
            <span className="hidden sm:inline">{t('actions.share') || 'Share'}</span>
          </button>

          <button
            onClick={handleRemix}
            className="px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl font-medium transition flex items-center justify-center gap-2 text-white"
          >
            <span>🔄</span>
            <span className="hidden sm:inline">{t('actions.remix') || 'Remix'}</span>
          </button>
        </div>

        {/* Secondary Actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-700">
          {showUpscale && (
            <Link
              href={`/tools/upscaler?image=${encodeURIComponent(image.url)}`}
              className="flex-1 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-2 text-gray-400 hover:text-white"
            >
              <span>⬆️</span>
              <span className="hidden sm:inline">{t('actions.upscale') || 'Upscale 4x'}</span>
            </Link>
          )}

          <Link
            href={`/ai-image/${image.id}`}
            className="flex-1 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center justify-center gap-2 text-gray-400 hover:text-white"
          >
            <span>👁️</span>
            <span className="hidden sm:inline">{t('actions.viewDetails') || 'View'}</span>
          </Link>

          <button
            onClick={handleCopySeed}
            disabled={!image.seed && !settings.seed}
            className="flex-1 px-3 py-2 text-sm bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition flex items-center justify-center gap-2 text-gray-400 hover:text-white"
          >
            <span>🎲</span>
            <span className="hidden sm:inline">{t('actions.copySeed') || 'Copy Seed'}</span>
          </button>
        </div>
      </div>

      {/* Image Info */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-800 mt-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block text-xs">{t('info.model') || 'Model'}</span>
            <span className="text-white">{settings.modelName}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">{t('info.style') || 'Style'}</span>
            <span className="text-white">{settings.styleName || 'None'}</span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">{t('info.seed') || 'Seed'}</span>
            <span className="text-white font-mono text-xs">
              {image.seed || settings.seed || 'Random'}
            </span>
          </div>
          <div>
            <span className="text-gray-500 block text-xs">{t('info.size') || 'Size'}</span>
            <span className="text-white">{settings.width} × {settings.height}</span>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          imageId={image.id}
          imageUrl={image.url}
          prompt={settings.prompt}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </>
  );
}
