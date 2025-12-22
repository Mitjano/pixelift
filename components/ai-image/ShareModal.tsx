'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl';

interface ShareModalProps {
  imageId: string;
  imageUrl: string;
  prompt: string;
  onClose: () => void;
}

export default function ShareModal({ imageId, imageUrl, prompt, onClose }: ShareModalProps) {
  const t = useTranslations('aiImage');
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/ai-image/${imageId}`
    : `/ai-image/${imageId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success(t('share.linkCopied') || 'Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleShare = (platform: string) => {
    const text = `Check out this AI-generated image on PixeLift!`;
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(text);

    let shareLink = '';

    switch (platform) {
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'pinterest':
        const encodedImage = encodeURIComponent(imageUrl);
        shareLink = `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodedImage}&description=${encodedText}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'reddit':
        shareLink = `https://reddit.com/submit?url=${encodedUrl}&title=${encodedText}`;
        break;
      case 'email':
        shareLink = `mailto:?subject=${encodedText}&body=${encodeURIComponent(`${text}\n\n${shareUrl}`)}`;
        break;
    }

    if (shareLink) {
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📤</span> {t('share.title') || 'Share Image'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-gray-400 hover:text-white transition"
          >
            ×
          </button>
        </div>

        {/* Image Preview */}
        <div className="mb-6 rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
          <img
            src={imageUrl}
            alt="Share preview"
            className="max-w-full max-h-48 object-contain"
          />
        </div>

        {/* Share Link */}
        <div className="mb-6">
          <label className="text-sm text-gray-400 mb-2 block">
            {t('share.shareLink') || 'Share Link'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm text-white font-mono"
            />
            <button
              onClick={handleCopyLink}
              className={`px-4 py-3 rounded-xl font-medium transition flex items-center gap-2 ${
                copied
                  ? 'bg-green-600 text-white'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {copied ? (
                <>
                  <span>✓</span> {t('share.copied') || 'Copied'}
                </>
              ) : (
                <>
                  <span>📋</span> {t('share.copy') || 'Copy'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social Share */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400 block">
            {t('share.shareOn') || 'Share on Social'}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <button
              onClick={() => handleShare('twitter')}
              className="p-3 bg-gray-700/50 hover:bg-[#1DA1F2]/20 hover:border-[#1DA1F2]/50 border border-gray-700 rounded-xl transition flex flex-col items-center gap-1.5"
              title="Share on X/Twitter"
            >
              <span className="text-xl">𝕏</span>
              <span className="text-[10px] text-gray-500">Twitter</span>
            </button>
            <button
              onClick={() => handleShare('facebook')}
              className="p-3 bg-gray-700/50 hover:bg-[#4267B2]/20 hover:border-[#4267B2]/50 border border-gray-700 rounded-xl transition flex flex-col items-center gap-1.5"
              title="Share on Facebook"
            >
              <span className="text-xl">📘</span>
              <span className="text-[10px] text-gray-500">Facebook</span>
            </button>
            <button
              onClick={() => handleShare('pinterest')}
              className="p-3 bg-gray-700/50 hover:bg-[#E60023]/20 hover:border-[#E60023]/50 border border-gray-700 rounded-xl transition flex flex-col items-center gap-1.5"
              title="Share on Pinterest"
            >
              <span className="text-xl">📌</span>
              <span className="text-[10px] text-gray-500">Pinterest</span>
            </button>
            <button
              onClick={() => handleShare('linkedin')}
              className="p-3 bg-gray-700/50 hover:bg-[#0077B5]/20 hover:border-[#0077B5]/50 border border-gray-700 rounded-xl transition flex flex-col items-center gap-1.5"
              title="Share on LinkedIn"
            >
              <span className="text-xl">💼</span>
              <span className="text-[10px] text-gray-500">LinkedIn</span>
            </button>
            <button
              onClick={() => handleShare('reddit')}
              className="p-3 bg-gray-700/50 hover:bg-[#FF4500]/20 hover:border-[#FF4500]/50 border border-gray-700 rounded-xl transition flex flex-col items-center gap-1.5"
              title="Share on Reddit"
            >
              <span className="text-xl">🔴</span>
              <span className="text-[10px] text-gray-500">Reddit</span>
            </button>
            <button
              onClick={() => handleShare('email')}
              className="p-3 bg-gray-700/50 hover:bg-gray-600 border border-gray-700 rounded-xl transition flex flex-col items-center gap-1.5"
              title="Share via Email"
            >
              <span className="text-xl">📧</span>
              <span className="text-[10px] text-gray-500">Email</span>
            </button>
          </div>
        </div>

        {/* Prompt info */}
        {prompt && (
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-xs text-gray-500 line-clamp-2">
              <span className="text-gray-400">Prompt:</span> {prompt}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
