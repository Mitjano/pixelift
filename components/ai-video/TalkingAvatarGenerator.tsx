'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface Voice {
  id: string;
  name: string;
  language: string;
}

interface AspectRatio {
  id: string;
  name: string;
}

export default function TalkingAvatarGenerator() {
  const { data: session, status } = useSession();
  const t = useTranslations('aiVideo.avatar');

  // Form state
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');
  const [text, setText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [voiceId, setVoiceId] = useState('en-female-1');
  const [aspectRatio, setAspectRatio] = useState('16:9');

  // Options
  const [voices, setVoices] = useState<Voice[]>([]);
  const [aspectRatios, setAspectRatios] = useState<AspectRatio[]>([]);

  // Processing state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState<string>('');

  // Result
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Fetch options on mount
  useEffect(() => {
    fetch('/api/ai-video/talking-avatar')
      .then((res) => res.json())
      .then((data) => {
        setVoices(data.voices || []);
        setAspectRatios(data.aspectRatios || []);
      })
      .catch(console.error);
  }, []);

  // Poll for job status
  useEffect(() => {
    if (!jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ai-video/talking-avatar?jobId=${jobId}`);
        const data = await res.json();

        if (data.status === 'completed' && data.videoUrl) {
          setVideoUrl(data.videoUrl);
          setIsGenerating(false);
          setJobId(null);
          setProgress('');
        } else if (data.status === 'failed') {
          setError(t('errors.processingFailed'));
          setIsGenerating(false);
          setJobId(null);
          setProgress('');
        } else {
          setProgress(data.progress || t('processing'));
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [jobId, t]);

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError(t('errors.audioTooLarge'));
        return;
      }
      setAudioFile(file);
      setAudioUrl('');
      setError(null);
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError(t('errors.imageTooLarge'));
        return;
      }
      setImageFile(file);
      setImageUrl('');
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setVideoUrl(null);

    // Validation
    if (inputMode === 'text' && (!text || text.trim().length < 10)) {
      setError(t('errors.textRequired'));
      return;
    }

    if (inputMode === 'audio' && !audioFile && !audioUrl) {
      setError(t('errors.audioRequired'));
      return;
    }

    setIsGenerating(true);
    setProgress(t('processing'));

    try {
      const formData = new FormData();

      if (inputMode === 'text') {
        formData.append('text', text);
        formData.append('voiceId', voiceId);
      } else {
        if (audioFile) {
          formData.append('audioFile', audioFile);
        } else if (audioUrl) {
          formData.append('audioUrl', audioUrl);
        }
      }

      if (imageFile) {
        formData.append('imageFile', imageFile);
      } else if (imageUrl) {
        formData.append('imageUrl', imageUrl);
      }

      formData.append('aspectRatio', aspectRatio);

      const res = await fetch('/api/ai-video/talking-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('errors.processingFailed'));
      }

      if (data.status === 'processing' && data.jobId) {
        setJobId(data.jobId);
        setProgress(t('processingMessage'));
      } else if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setIsGenerating(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.processingFailed'));
      setIsGenerating(false);
    }
  };

  const clearImagePreview = () => {
    setImageFile(null);
    setImageUrl('');
    setImagePreview(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const isLoggedIn = status === 'authenticated';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 md:p-8">
        {/* Input Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setInputMode('text')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition ${
              inputMode === 'text'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t('inputText')}
          </button>
          <button
            onClick={() => setInputMode('audio')}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition ${
              inputMode === 'audio'
                ? 'bg-cyan-500 text-white'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {t('inputAudio')}
          </button>
        </div>

        {/* Text Input Mode */}
        {inputMode === 'text' && (
          <div className="space-y-4 mb-6">
            {/* Text Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('textLabel')}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('textPlaceholder')}
                rows={4}
                maxLength={3000}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{t('minChars')}: 10</span>
                <span>{text.length}/3000</span>
              </div>
            </div>

            {/* Voice Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('voiceLabel')}
              </label>
              <select
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              >
                {voices.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Audio Input Mode */}
        {inputMode === 'audio' && (
          <div className="space-y-4 mb-6">
            {/* Audio File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('audioLabel')}
              </label>
              <div
                onClick={() => audioInputRef.current?.click()}
                className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-500/50 transition"
              >
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioFileChange}
                  className="hidden"
                />
                {audioFile ? (
                  <div className="text-cyan-400">
                    <p className="font-medium">{audioFile.name}</p>
                    <p className="text-sm text-gray-500">{(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <p>{t('dropAudio')}</p>
                    <p className="text-sm text-gray-500 mt-1">MP3, WAV, M4A (max 20MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* Or Audio URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {t('orAudioUrl')}
              </label>
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => {
                  setAudioUrl(e.target.value);
                  setAudioFile(null);
                }}
                placeholder={t('audioUrlPlaceholder')}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}

        {/* Avatar Image (Optional) */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('imageLabel')} <span className="text-gray-500">({t('optional')})</span>
          </label>
          <div className="flex gap-4">
            <div
              onClick={() => imageInputRef.current?.click()}
              className="flex-1 border-2 border-dashed border-gray-600 rounded-xl p-4 text-center cursor-pointer hover:border-cyan-500/50 transition"
            >
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Avatar preview"
                    className="w-24 h-24 object-cover rounded-lg mx-auto"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImagePreview();
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white text-sm"
                  >
                    x
                  </button>
                </div>
              ) : (
                <div className="text-gray-400">
                  <p>{t('dropImage')}</p>
                  <p className="text-sm text-gray-500 mt-1">{t('imageHint')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Aspect Ratio */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('aspectRatioLabel')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {aspectRatios.map((ar) => (
              <button
                key={ar.id}
                onClick={() => setAspectRatio(ar.id)}
                className={`py-2 px-3 rounded-lg font-medium transition ${
                  aspectRatio === ar.id
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {ar.name}
              </button>
            ))}
          </div>
        </div>

        {/* Cost Info */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-900/50 rounded-xl">
          <div className="text-gray-400">
            <span>{t('cost')}: </span>
            <span className="text-cyan-400 font-semibold">15 {t('credits')}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Progress */}
        {isGenerating && progress && (
          <div className="mb-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
              <span>{progress}</span>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!isLoggedIn || isGenerating}
          className="w-full py-4 px-6 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl hover:from-cyan-600 hover:to-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {!isLoggedIn
            ? t('signInToGenerate')
            : isGenerating
            ? t('generating')
            : t('generateButton')}
        </button>
      </div>

      {/* Result */}
      {videoUrl && (
        <div className="mt-8 bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('resultTitle')}</h3>
          <video
            src={videoUrl}
            controls
            className="w-full rounded-xl mb-4"
          />
          <a
            href={videoUrl}
            download="talking-avatar.mp4"
            className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
          >
            {t('download')}
          </a>
        </div>
      )}
    </div>
  );
}
