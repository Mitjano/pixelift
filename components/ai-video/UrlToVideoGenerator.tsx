'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';

interface VideoStyle {
  id: string;
  name: string;
  description: string;
}

interface Voice {
  id: string;
  name: string;
  language: string;
}

interface Duration {
  id: string;
  name: string;
  minutes: number;
}

export default function UrlToVideoGenerator() {
  const { data: session, status } = useSession();
  const t = useTranslations('aiVideo.urlToVideo');

  // Form state
  const [url, setUrl] = useState('');
  const [style, setStyle] = useState('professional');
  const [voiceId, setVoiceId] = useState('en-female-1');
  const [duration, setDuration] = useState('medium');
  const [includeCaptions, setIncludeCaptions] = useState(true);
  const [includeBackgroundMusic, setIncludeBackgroundMusic] = useState(true);

  // Options
  const [styles, setStyles] = useState<VideoStyle[]>([]);
  const [voices, setVoices] = useState<Voice[]>([]);
  const [durations, setDurations] = useState<Duration[]>([]);

  // Processing state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');

  // Result
  const [result, setResult] = useState<{
    videoUrl?: string;
    audioUrl?: string;
    scriptUrl?: string;
  } | null>(null);

  // Fetch options on mount
  useEffect(() => {
    fetch('/api/ai-video/url-to-video')
      .then((res) => res.json())
      .then((data) => {
        setStyles(data.styles || []);
        setVoices(data.voices || []);
        setDurations(data.durations || []);
      })
      .catch(console.error);
  }, []);

  // Poll for job status
  useEffect(() => {
    if (!jobId) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`/api/ai-video/url-to-video?jobId=${jobId}`);
        const data = await res.json();

        setProgress(data.progress || 0);

        const statusMessages: Record<string, string> = {
          extracting: t('processing') + ' - Extracting content...',
          scripting: t('processing') + ' - Generating script...',
          voiceover: t('processing') + ' - Creating voiceover...',
          rendering: t('processing') + ' - Rendering video...',
          completed: 'Completed!',
          failed: 'Failed',
        };
        setStatusText(statusMessages[data.status] || t('processing'));

        if (data.status === 'completed' && data.result) {
          setResult(data.result);
          setIsGenerating(false);
          setJobId(null);
        } else if (data.status === 'failed') {
          setError(data.error || t('errors.processingFailed'));
          setIsGenerating(false);
          setJobId(null);
        }
      } catch (err) {
        console.error('Poll error:', err);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [jobId, t]);

  // Calculate cost based on duration
  const calculateCost = () => {
    const durationConfig = durations.find(d => d.id === duration);
    if (!durationConfig) return 20;
    const multiplier = Math.ceil(durationConfig.minutes / 2);
    return 20 + (multiplier - 1) * 10;
  };

  const handleGenerate = async () => {
    setError(null);
    setResult(null);

    // Validation
    if (!url || url.trim().length === 0) {
      setError(t('errors.urlRequired'));
      return;
    }

    try {
      new URL(url);
    } catch {
      setError(t('errors.invalidUrl'));
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setStatusText(t('processing'));

    try {
      const res = await fetch('/api/ai-video/url-to-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          style,
          voiceId,
          duration,
          includeCaptions,
          includeBackgroundMusic,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || t('errors.processingFailed'));
      }

      if (data.jobId) {
        setJobId(data.jobId);
        setStatusText(t('processingMessage'));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.processingFailed'));
      setIsGenerating(false);
    }
  };

  const isLoggedIn = status === 'authenticated';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6 md:p-8">
        {/* URL Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('urlLabel')}
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t('urlPlaceholder')}
            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Style Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('styleLabel')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {styles.map((s) => (
              <button
                key={s.id}
                onClick={() => setStyle(s.id)}
                className={`py-3 px-4 rounded-xl font-medium transition ${
                  style === s.id
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {t(`styles.${s.id}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="mb-6">
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

        {/* Duration Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('durationLabel')}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {durations.map((d) => (
              <button
                key={d.id}
                onClick={() => setDuration(d.id)}
                className={`py-3 px-4 rounded-xl font-medium transition ${
                  duration === d.id
                    ? 'bg-cyan-500 text-white'
                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {t(`durations.${d.id}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Options */}
        <div className="mb-6 space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeCaptions}
              onChange={(e) => setIncludeCaptions(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-gray-300">{t('includeCaptions')}</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={includeBackgroundMusic}
              onChange={(e) => setIncludeBackgroundMusic(e.target.checked)}
              className="w-5 h-5 rounded border-gray-600 bg-gray-900/50 text-cyan-500 focus:ring-cyan-500"
            />
            <span className="text-gray-300">{t('includeBackgroundMusic')}</span>
          </label>
        </div>

        {/* Cost Info */}
        <div className="flex items-center justify-between mb-6 p-4 bg-gray-900/50 rounded-xl">
          <div className="text-gray-400">
            <span>{t('cost')}: </span>
            <span className="text-cyan-400 font-semibold">{calculateCost()} {t('credits')}</span>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
            {error}
          </div>
        )}

        {/* Progress */}
        {isGenerating && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
              <span>{statusText}</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
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
      {result && (
        <div className="mt-8 bg-gray-800/50 border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">{t('resultTitle')}</h3>

          {result.videoUrl && (
            <div className="mb-4">
              <video
                src={result.videoUrl}
                controls
                className="w-full rounded-xl"
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {result.videoUrl && (
              <a
                href={result.videoUrl}
                download="video.mp4"
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
              >
                {t('download')} Video
              </a>
            )}

            {result.audioUrl && (
              <a
                href={result.audioUrl}
                download="voiceover.mp3"
                className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
              >
                {t('download')} Audio
              </a>
            )}

            {result.scriptUrl && (
              <a
                href={result.scriptUrl}
                download="script.txt"
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                {t('download')} Script
              </a>
            )}
          </div>

          {!result.videoUrl && result.audioUrl && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-yellow-400 text-sm">
              Video rendering is a premium feature. Currently available: voiceover audio and script.
              You can use these with your preferred video editor to create the final video.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
