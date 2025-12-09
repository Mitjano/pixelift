'use client';

import { useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface JobStatus {
  status: 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  progress?: number;
}

export default function LipSyncGenerator() {
  const t = useTranslations('aiVideo.lipsync');
  const { data: session } = useSession();

  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [videoInputMode, setVideoInputMode] = useState<'file' | 'url'>('file');
  const [audioInputMode, setAudioInputMode] = useState<'file' | 'url'>('file');

  const [isProcessing, setIsProcessing] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [result, setResult] = useState<{ videoUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        setError(t('errors.videoTooLarge'));
        return;
      }
      setVideoFile(file);
      setError(null);
    }
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 20 * 1024 * 1024) {
        setError(t('errors.audioTooLarge'));
        return;
      }
      setAudioFile(file);
      setError(null);
    }
  };

  const checkJobStatus = async (id: string): Promise<JobStatus> => {
    const response = await fetch(`/api/ai-video/lipsync?jobId=${id}`);
    return response.json();
  };

  const pollForResult = async (id: string) => {
    const maxAttempts = 60; // 5 minutes with 5 second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      const status = await checkJobStatus(id);

      if (status.status === 'completed' && status.videoUrl) {
        setResult({ videoUrl: status.videoUrl });
        setIsProcessing(false);
        return;
      }

      if (status.status === 'failed') {
        setError(status.error || t('errors.processingFailed'));
        setIsProcessing(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    setError(t('errors.timeout'));
    setIsProcessing(false);
  };

  const handleGenerate = async () => {
    // Validate video input
    if (videoInputMode === 'file' && !videoFile) {
      setError(t('errors.videoRequired'));
      return;
    }
    if (videoInputMode === 'url' && !videoUrl.trim()) {
      setError(t('errors.videoRequired'));
      return;
    }

    // Validate audio input
    if (audioInputMode === 'file' && !audioFile) {
      setError(t('errors.audioRequired'));
      return;
    }
    if (audioInputMode === 'url' && !audioUrl.trim()) {
      setError(t('errors.audioRequired'));
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setJobId(null);

    try {
      const formData = new FormData();

      if (videoInputMode === 'file' && videoFile) {
        formData.append('videoFile', videoFile);
      } else {
        formData.append('videoUrl', videoUrl.trim());
      }

      if (audioInputMode === 'file' && audioFile) {
        formData.append('audioFile', audioFile);
      } else {
        formData.append('audioUrl', audioUrl.trim());
      }

      const response = await fetch('/api/ai-video/lipsync', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process lip sync');
      }

      if (data.status === 'processing' && data.jobId) {
        setJobId(data.jobId);
        pollForResult(data.jobId);
      } else if (data.status === 'completed' && data.videoUrl) {
        setResult({ videoUrl: data.videoUrl });
        setIsProcessing(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    if (result?.videoUrl) {
      const response = await fetch(result.videoUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lipsync-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Generator Form */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>👄</span>
          {t('title')}
        </h2>

        {/* Video Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('videoLabel')} *
          </label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setVideoInputMode('file')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                videoInputMode === 'file'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📁 {t('uploadFile')}
            </button>
            <button
              onClick={() => setVideoInputMode('url')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                videoInputMode === 'url'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔗 {t('pasteUrl')}
            </button>
          </div>

          {videoInputMode === 'file' ? (
            <div
              onClick={() => videoInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-500 transition"
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoFileChange}
                className="hidden"
              />
              {videoFile ? (
                <div>
                  <span className="text-3xl mb-2 block">🎬</span>
                  <p className="text-white font-medium">{videoFile.name}</p>
                  <p className="text-gray-500 text-sm">
                    {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-3xl mb-2 block">📤</span>
                  <p className="text-gray-400">{t('dropVideo')}</p>
                  <p className="text-gray-500 text-xs mt-1">MP4, WebM, MOV (max 50MB)</p>
                </div>
              )}
            </div>
          ) : (
            <input
              type="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder={t('videoUrlPlaceholder')}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
          )}
        </div>

        {/* Audio Input Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('audioLabel')} *
          </label>
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setAudioInputMode('file')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                audioInputMode === 'file'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              📁 {t('uploadFile')}
            </button>
            <button
              onClick={() => setAudioInputMode('url')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
                audioInputMode === 'url'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              🔗 {t('pasteUrl')}
            </button>
          </div>

          {audioInputMode === 'file' ? (
            <div
              onClick={() => audioInputRef.current?.click()}
              className="border-2 border-dashed border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-cyan-500 transition"
            >
              <input
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={handleAudioFileChange}
                className="hidden"
              />
              {audioFile ? (
                <div>
                  <span className="text-3xl mb-2 block">🎵</span>
                  <p className="text-white font-medium">{audioFile.name}</p>
                  <p className="text-gray-500 text-sm">
                    {(audioFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              ) : (
                <div>
                  <span className="text-3xl mb-2 block">🎤</span>
                  <p className="text-gray-400">{t('dropAudio')}</p>
                  <p className="text-gray-500 text-xs mt-1">MP3, WAV, M4A (max 20MB)</p>
                </div>
              )}
            </div>
          ) : (
            <input
              type="url"
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder={t('audioUrlPlaceholder')}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            />
          )}
        </div>

        {/* Cost Preview */}
        <div className="mb-6 p-4 bg-gray-900/50 rounded-xl">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">{t('cost')}:</span>
            <span className="text-xl font-bold text-cyan-400">10 {t('credits')}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Generate Button */}
        {session ? (
          <button
            onClick={handleGenerate}
            disabled={isProcessing}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('processing')}
              </>
            ) : (
              <>
                <span>👄</span>
                {t('generateButton')}
              </>
            )}
          </button>
        ) : (
          <Link
            href="/auth/signin"
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl font-semibold text-white transition flex items-center justify-center gap-2"
          >
            {t('signInToGenerate')}
          </Link>
        )}

        {/* Processing indicator */}
        {isProcessing && jobId && (
          <div className="mt-4 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl">
            <p className="text-cyan-400 text-sm text-center">
              {t('processingMessage')}
            </p>
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>✅</span>
              {t('resultTitle')}
            </h3>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium text-white transition flex items-center gap-2"
            >
              <span>⬇️</span>
              {t('download')}
            </button>
          </div>

          <video
            src={result.videoUrl}
            controls
            className="w-full rounded-xl"
          />
        </div>
      )}
    </div>
  );
}
