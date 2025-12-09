'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import ToolsLayout from '@/components/ToolsLayout';
import Link from 'next/link';

// Lazy load heavy components
const AIVideoGenerator = dynamic(
  () => import('@/components/AIVideoGenerator'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    ),
    ssr: false,
  }
);

const ExploreGallery = dynamic(
  () => import('@/components/ai-image/ExploreGallery'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500"></div>
      </div>
    ),
    ssr: false,
  }
);

// AI Video Tools data
const VIDEO_TOOLS = [
  {
    id: 'script',
    href: '/ai-video/script',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    gradient: 'from-violet-500 to-purple-600',
    bgGlow: 'bg-violet-500/20',
    credits: '1',
    isNew: true,
    estimatedTime: '~10s',
  },
  {
    id: 'voiceover',
    href: '/ai-video/voiceover',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    gradient: 'from-emerald-500 to-teal-600',
    bgGlow: 'bg-emerald-500/20',
    credits: '2+',
    isNew: true,
    estimatedTime: '~30s',
  },
  {
    id: 'captions',
    href: '/ai-video/captions',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
      </svg>
    ),
    gradient: 'from-blue-500 to-cyan-600',
    bgGlow: 'bg-blue-500/20',
    credits: '3',
    isNew: true,
    estimatedTime: '~1min',
  },
  {
    id: 'lipsync',
    href: '/ai-video/lipsync',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    gradient: 'from-orange-500 to-red-600',
    bgGlow: 'bg-orange-500/20',
    credits: '10',
    isNew: true,
    estimatedTime: '~2min',
  },
  {
    id: 'avatar',
    href: '/ai-video/talking-avatar',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    gradient: 'from-indigo-500 to-purple-600',
    bgGlow: 'bg-indigo-500/20',
    credits: '15',
    isNew: true,
    estimatedTime: '~3min',
  },
  {
    id: 'urlToVideo',
    href: '/ai-video/url-to-video',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
      </svg>
    ),
    gradient: 'from-amber-500 to-orange-600',
    bgGlow: 'bg-amber-500/20',
    credits: '20+',
    isNew: true,
    estimatedTime: '~5min',
  },
];

type MainTab = 'generate' | 'tools' | 'gallery';

export default function AIVideoPage() {
  const t = useTranslations('aiVideo');
  const tPage = useTranslations('aiVideoPage');
  const { data: session } = useSession();
  const [mainTab, setMainTab] = useState<MainTab>('generate');
  const [galleryTab, setGalleryTab] = useState<'explore' | 'my-creations'>('explore');

  // Check URL hash for tab
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'tools') setMainTab('tools');
    else if (hash === 'gallery') setMainTab('gallery');
  }, []);

  return (
    <ToolsLayout>
      {/* Compact Hero */}
      <section className="relative overflow-hidden border-b border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-600/20 border border-cyan-500/30 rounded-full text-xs mb-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-cyan-300">{tPage('badge')}</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="text-white">AI Video </span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Studio</span>
              </h1>
              <p className="text-gray-400 max-w-xl">
                {tPage('hero.subtitle')}
              </p>
            </div>

            {/* Quick Stats */}
            <div className="flex gap-6 md:gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">6</div>
                <div className="text-xs text-gray-500">AI Tools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">4</div>
                <div className="text-xs text-gray-500">Video Models</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">1</div>
                <div className="text-xs text-gray-500">Credit min</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tabs */}
      <section className="sticky top-[73px] z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1">
            <button
              onClick={() => setMainTab('generate')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition border-b-2 ${
                mainTab === 'generate'
                  ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Text to Video
            </button>
            <button
              onClick={() => setMainTab('tools')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition border-b-2 ${
                mainTab === 'tools'
                  ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              AI Tools
              <span className="px-1.5 py-0.5 text-[10px] bg-cyan-500 text-white rounded-full font-bold">6</span>
            </button>
            <button
              onClick={() => setMainTab('gallery')}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition border-b-2 ${
                mainTab === 'gallery'
                  ? 'text-cyan-400 border-cyan-400 bg-cyan-500/5'
                  : 'text-gray-400 border-transparent hover:text-white hover:bg-gray-800/50'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Gallery
            </button>
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Text to Video Tab */}
        {mainTab === 'generate' && (
          <div className="animate-in fade-in duration-300">
            <AIVideoGenerator />
          </div>
        )}

        {/* AI Tools Tab */}
        {mainTab === 'tools' && (
          <div className="animate-in fade-in duration-300">
            {/* Tools Header */}
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-white">Complete Video </span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Creation Suite</span>
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Professional AI tools to script, voice, caption, and enhance your videos
              </p>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {VIDEO_TOOLS.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="group relative bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 hover:border-gray-600 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1"
                >
                  {/* Glow effect */}
                  <div className={`absolute inset-0 ${tool.bgGlow} rounded-2xl blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-300`} />

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-white shadow-lg`}>
                        {tool.icon}
                      </div>
                      {tool.isNew && (
                        <span className="px-2 py-1 text-[10px] font-bold bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-full">
                          NEW
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <h3 className="font-semibold text-white text-lg mb-2 group-hover:text-cyan-400 transition-colors">
                      {t(`${tool.id}.title`)}
                    </h3>
                    <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                      {t(`${tool.id}.description`)}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 text-cyan-400 text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {tool.credits}
                        </span>
                        <span className="text-gray-500 text-xs">
                          {tool.estimatedTime}
                        </span>
                      </div>
                      <svg className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Start Section */}
            <div className="mt-12 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 border border-cyan-500/20 rounded-2xl p-8">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    New to AI Video Creation?
                  </h3>
                  <p className="text-gray-400">
                    Start with AI Script Generator to create your video concept, then use AI Voiceover to bring it to life.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href="/ai-video/script"
                    className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition flex items-center gap-2"
                  >
                    Start with Script
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {mainTab === 'gallery' && (
          <div className="animate-in fade-in duration-300">
            {/* Gallery Sub-tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setGalleryTab('explore')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  galleryTab === 'explore'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                Explore
              </button>
              <button
                onClick={() => setGalleryTab('my-creations')}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                  galleryTab === 'my-creations'
                    ? 'bg-cyan-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                My Creations
              </button>
            </div>

            {/* Gallery Content */}
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6">
              {galleryTab === 'explore' && <ExploreGallery />}
              {galleryTab === 'my-creations' && (
                session ? (
                  <ExploreGallery showMyCreations />
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700 flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">{tPage('gallery.signInRequired')}</h3>
                    <p className="text-gray-400 mb-6">{tPage('gallery.signInDescription')}</p>
                    <Link
                      href="/auth/signin"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg font-medium transition"
                    >
                      {tPage('gallery.signInButton')}
                    </Link>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom CTA - Only show on Tools tab */}
      {mainTab === 'tools' && (
        <section className="max-w-7xl mx-auto px-6 pb-16">
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              All tools work together seamlessly. Create a script, generate voiceover, add captions - all in one workflow.
            </p>
          </div>
        </section>
      )}
    </ToolsLayout>
  );
}
