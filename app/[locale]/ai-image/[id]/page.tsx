'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { AI_MODELS, ASPECT_RATIOS } from '@/lib/ai-image/models';
import { IMAGE_STYLES } from '@/lib/ai-image/styles';
import ShareModal from '@/components/ai-image/ShareModal';

interface ImageDetails {
  id: string;
  outputUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  model: string;
  mode: string;
  style?: string;
  aspectRatio: string;
  width: number;
  height: number;
  seed?: number;
  likes: number;
  views: number;
  isPublic: boolean;
  hasLiked: boolean;
  isOwner: boolean;
  user: {
    name: string;
    image?: string;
  };
  createdAt: string;
}

export default function AIImageDetailPage() {
  const t = useTranslations('aiImage');
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [image, setImage] = useState<ImageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const imageId = params.id as string;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/ai-image/${imageId}`
    : `/ai-image/${imageId}`;

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/ai-image/${imageId}`);
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || t('detail.notFound'));
          router.push('/ai-image');
          return;
        }

        setImage(data);
      } catch (error) {
        console.error('Error fetching image:', error);
        toast.error('Failed to load image');
        router.push('/ai-image');
      } finally {
        setLoading(false);
      }
    };

    if (imageId) {
      fetchImage();
    }
  }, [imageId, router, t]);

  const handleLike = async () => {
    if (!session) {
      toast.error(t('detail.signInToLike'));
      return;
    }

    setLiking(true);
    try {
      const response = await fetch(`/api/ai-image/${imageId}/like`, {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok && image) {
        setImage({
          ...image,
          likes: data.likes,
          hasLiked: data.liked,
        });
        toast.success(data.liked ? t('detail.liked') : t('detail.unliked'));
      } else {
        toast.error(data.error || 'Failed to like');
      }
    } catch (error) {
      toast.error('Failed to like');
    } finally {
      setLiking(false);
    }
  };

  const handleDownload = async () => {
    if (!image) return;

    try {
      const response = await fetch(image.outputUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pixelift-${image.id}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(t('detail.downloaded'));
    } catch (error) {
      toast.error(t('detail.downloadFailed'));
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setLinkCopied(true);
      toast.success(t('detail.linkCopied'));
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const handleCopySeed = () => {
    if (image?.seed) {
      navigator.clipboard.writeText(String(image.seed));
      toast.success(t('detail.seedCopied'));
    }
  };

  const handleRemix = () => {
    if (!image) return;

    const remixData = {
      prompt: image.prompt,
      model: image.model,
      style: image.style,
      aspectRatio: image.aspectRatio,
      seed: image.seed,
    };
    sessionStorage.setItem('aiImageRemix', JSON.stringify(remixData));

    toast.success(t('actions.remixApplied'));
    router.push('/ai-image');
  };

  const handlePublish = async () => {
    if (!image) return;

    setPublishing(true);
    try {
      const response = await fetch(`/api/ai-image/${imageId}/publish`, {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setImage({ ...image, isPublic: data.isPublic });
        toast.success(data.message);
      } else {
        toast.error(data.error || 'Failed to update');
      }
    } catch (error) {
      toast.error('Failed to update');
    } finally {
      setPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(t('detail.deleteConfirm'))) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/ai-image/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success(t('detail.deleted'));
        router.push('/ai-image');
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to delete');
      }
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyPrompt = () => {
    if (image) {
      navigator.clipboard.writeText(image.prompt);
      toast.success(t('detail.promptCopied'));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!image) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{t('detail.notFound')}</h1>
          <Link href="/ai-image" className="text-purple-400 hover:text-purple-300">
            {t('detail.backToAiImage')}
          </Link>
        </div>
      </div>
    );
  }

  const modelInfo = AI_MODELS.find(m => m.id === image.model);
  const aspectInfo = ASPECT_RATIOS.find(ar => ar.id === image.aspectRatio);
  const styleInfo = IMAGE_STYLES.find(s => s.id === image.style);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/ai-image"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <span>←</span> {t('detail.backToAiImage')}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-4">
              <img
                src={image.outputUrl}
                alt={image.prompt.substring(0, 50)}
                className="w-full rounded-lg"
              />
            </div>
          </div>

          {/* Details */}
          <div className="space-y-6">
            {/* User */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                {image.user.image ? (
                  <img
                    src={image.user.image}
                    alt={image.user.name}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-xl">
                    {image.user.name[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold">{image.user.name}</p>
                  <p className="text-sm text-gray-400">
                    {new Date(image.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <span>❤️ {image.likes} {t('detail.likes')}</span>
                <span>👁️ {image.views} {t('detail.views')}</span>
              </div>
            </div>

            {/* Prompt */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{t('detail.prompt')}</h3>
                <button
                  onClick={handleCopyPrompt}
                  className="text-purple-400 hover:text-purple-300 text-sm flex items-center gap-1"
                >
                  📋 {t('detail.copy')}
                </button>
              </div>
              <p className="text-gray-300">{image.prompt}</p>
            </div>

            {/* Settings */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">{t('detail.settings')}</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('detail.model')}</span>
                  <span>{modelInfo?.name || image.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('detail.mode')}</span>
                  <span className="capitalize">{image.mode.replace('-', ' ')}</span>
                </div>
                {styleInfo && styleInfo.id !== 'none' && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">{t('detail.style')}</span>
                    <span>{styleInfo.icon} {styleInfo.name}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('detail.aspectRatio')}</span>
                  <span>{aspectInfo?.name || image.aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('detail.resolution')}</span>
                  <span>{image.width} × {image.height}</span>
                </div>
                {image.seed && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">{t('detail.seed')}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{image.seed}</span>
                      <button
                        onClick={handleCopySeed}
                        className="text-purple-400 hover:text-purple-300 text-xs"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">{t('detail.visibility')}</span>
                  <span className={image.isPublic ? 'text-green-400' : 'text-gray-400'}>
                    {image.isPublic ? '🌐 Public' : '🔒 Private'}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {/* Primary Actions Row */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleDownload}
                  className="py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  💾 {t('detail.download')}
                </button>
                <button
                  onClick={handleCopyLink}
                  className={`py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    linkCopied
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {linkCopied ? '✓' : '🔗'} {linkCopied ? t('detail.copied') : t('detail.copyLink')}
                </button>
              </div>

              {/* Share & Remix Row */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowShareModal(true)}
                  className="py-3 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  📤 {t('detail.share')}
                </button>
                <button
                  onClick={handleRemix}
                  className="py-3 bg-gray-700 text-gray-300 hover:bg-gray-600 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  🔄 {t('detail.remix')}
                </button>
              </div>

              {/* Like Button (for public images) */}
              {image.isPublic && (
                <button
                  onClick={handleLike}
                  disabled={liking}
                  className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                    image.hasLiked
                      ? 'bg-pink-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {liking ? '...' : image.hasLiked ? '❤️' : '🤍'} {image.hasLiked ? t('detail.liked') : t('detail.like')}
                </button>
              )}

              {/* Owner Actions */}
              {image.isOwner && (
                <>
                  <button
                    onClick={handlePublish}
                    disabled={publishing}
                    className={`w-full py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                      image.isPublic
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {publishing ? '...' : image.isPublic
                      ? `🔒 ${t('detail.makePrivate')}`
                      : `🌐 ${t('detail.publishToGallery')}`}
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="w-full py-3 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg font-medium transition"
                  >
                    {deleting ? t('detail.deleting') : `🗑️ ${t('detail.delete')}`}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal
          imageId={image.id}
          imageUrl={image.outputUrl}
          prompt={image.prompt}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
