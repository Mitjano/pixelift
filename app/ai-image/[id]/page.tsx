'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { AI_MODELS, ASPECT_RATIOS } from '@/lib/ai-image/models';

interface ImageDetails {
  id: string;
  outputUrl: string;
  thumbnailUrl?: string;
  prompt: string;
  model: string;
  mode: string;
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
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [image, setImage] = useState<ImageDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const imageId = params.id as string;

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(`/api/ai-image/${imageId}`);
        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || 'Image not found');
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
  }, [imageId, router]);

  const handleLike = async () => {
    if (!session) {
      toast.error('Sign in to like images');
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
        toast.success(data.liked ? 'Liked!' : 'Unliked');
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
      toast.success('Image downloaded!');
    } catch (error) {
      toast.error('Failed to download');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/ai-image/${imageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Image deleted');
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
      toast.success('Prompt copied to clipboard!');
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
          <h1 className="text-2xl font-bold mb-4">Image not found</h1>
          <Link href="/ai-image" className="text-purple-400 hover:text-purple-300">
            Back to AI Image
          </Link>
        </div>
      </div>
    );
  }

  const modelInfo = AI_MODELS.find(m => m.id === image.model);
  const aspectInfo = ASPECT_RATIOS.find(ar => ar.id === image.aspectRatio);

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Link */}
        <Link
          href="/ai-image"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <span>←</span> Back to AI Image
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
                <span>❤️ {image.likes} likes</span>
                <span>👁️ {image.views} views</span>
              </div>
            </div>

            {/* Prompt */}
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">Prompt</h3>
                <button
                  onClick={handleCopyPrompt}
                  className="text-purple-400 hover:text-purple-300 text-sm"
                >
                  📋 Copy
                </button>
              </div>
              <p className="text-gray-300">{image.prompt}</p>
            </div>

            {/* Settings */}
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">Settings</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Model</span>
                  <span>{modelInfo?.name || image.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Mode</span>
                  <span className="capitalize">{image.mode.replace('-', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Aspect Ratio</span>
                  <span>{aspectInfo?.name || image.aspectRatio}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Resolution</span>
                  <span>{image.width} × {image.height}</span>
                </div>
                {image.seed && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Seed</span>
                    <span>{image.seed}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <div className="flex gap-3">
                {image.isPublic && (
                  <button
                    onClick={handleLike}
                    disabled={liking}
                    className={`flex-1 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                      image.hasLiked
                        ? 'bg-pink-600 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {liking ? '...' : image.hasLiked ? '❤️ Liked' : '🤍 Like'}
                  </button>
                )}
                <button
                  onClick={handleDownload}
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  💾 Download
                </button>
              </div>

              {image.isOwner && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="w-full py-3 bg-red-600/20 text-red-400 hover:bg-red-600/30 rounded-lg font-medium transition"
                >
                  {deleting ? 'Deleting...' : '🗑️ Delete'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
