'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface VideoType {
  id: string;
  name: string;
  duration: string;
  style: string;
  structure: string;
}

interface ScriptConfig {
  videoTypes: VideoType[];
  tones: string[];
  audiences: string[];
}

interface GeneratedScript {
  script: string;
  metadata: {
    topic: string;
    videoType: string;
    videoTypeName: string;
    duration: string;
    tone: string;
    targetAudience: string;
    language: string;
    creditsUsed: number;
    remainingCredits: number;
  };
}

export default function ScriptGenerator() {
  const t = useTranslations('aiVideo.script');
  const { data: session } = useSession();

  const [config, setConfig] = useState<ScriptConfig | null>(null);
  const [topic, setTopic] = useState('');
  const [videoType, setVideoType] = useState('tiktok');
  const [tone, setTone] = useState('engaging');
  const [targetAudience, setTargetAudience] = useState('general');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [language, setLanguage] = useState('en');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedScript, setGeneratedScript] = useState<GeneratedScript | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch available options
  useEffect(() => {
    fetch('/api/ai-video/script')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(err => console.error('Failed to load config:', err));
  }, []);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError(t('errors.topicRequired'));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedScript(null);

    try {
      const response = await fetch('/api/ai-video/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          videoType,
          tone,
          targetAudience,
          additionalNotes: additionalNotes.trim(),
          language,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate script');
      }

      setGeneratedScript(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (generatedScript?.script) {
      await navigator.clipboard.writeText(generatedScript.script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (generatedScript?.script) {
      const blob = new Blob([generatedScript.script], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `script-${generatedScript.metadata.videoType}-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const selectedType = config?.videoTypes.find(v => v.id === videoType);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Generator Form */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span>📝</span>
          {t('title')}
        </h2>

        {/* Topic Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('topicLabel')} *
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t('topicPlaceholder')}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-gray-500 mt-1 text-right">
            {topic.length}/500
          </div>
        </div>

        {/* Video Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('videoTypeLabel')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {config?.videoTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setVideoType(type.id)}
                className={`px-4 py-3 rounded-xl text-sm font-medium transition ${
                  videoType === type.id
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>
          {selectedType && (
            <div className="mt-2 text-xs text-gray-500">
              {t('duration')}: {selectedType.duration}
            </div>
          )}
        </div>

        {/* Tone & Audience Row */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Tone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('toneLabel')}
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            >
              {config?.tones.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Target Audience */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {t('audienceLabel')}
            </label>
            <select
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            >
              {config?.audiences.map((a) => (
                <option key={a} value={a}>
                  {a.charAt(0).toUpperCase() + a.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Language */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('languageLabel')}
          </label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
          >
            <option value="en">English</option>
            <option value="pl">Polski</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
          </select>
        </div>

        {/* Additional Notes */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            {t('notesLabel')}
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            placeholder={t('notesPlaceholder')}
            className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-xl text-white placeholder-gray-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
            rows={2}
          />
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
            disabled={isGenerating || !topic.trim()}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold text-white transition flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t('generating')}
              </>
            ) : (
              <>
                <span>✨</span>
                {t('generateButton')} (1 {t('credit')})
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
      </div>

      {/* Generated Script Result */}
      {generatedScript && (
        <div className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>📄</span>
              {t('resultTitle')}
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium text-white transition flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <span>✓</span>
                    {t('copied')}
                  </>
                ) : (
                  <>
                    <span>📋</span>
                    {t('copy')}
                  </>
                )}
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-medium text-white transition flex items-center gap-2"
              >
                <span>⬇️</span>
                {t('download')}
              </button>
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-cyan-600/20 text-cyan-400 rounded-full text-xs">
              {generatedScript.metadata.videoTypeName}
            </span>
            <span className="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full text-xs">
              {generatedScript.metadata.tone}
            </span>
            <span className="px-3 py-1 bg-green-600/20 text-green-400 rounded-full text-xs">
              {generatedScript.metadata.duration}
            </span>
          </div>

          {/* Script Content */}
          <div className="bg-gray-900 rounded-xl p-4 max-h-[500px] overflow-y-auto">
            <pre className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
              {generatedScript.script}
            </pre>
          </div>

          {/* Credits Info */}
          <div className="mt-4 text-sm text-gray-500 text-right">
            {t('creditsUsed')}: {generatedScript.metadata.creditsUsed} | {t('remaining')}: {generatedScript.metadata.remainingCredits}
          </div>
        </div>
      )}
    </div>
  );
}
