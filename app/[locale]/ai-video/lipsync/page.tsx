'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

const LipSyncGenerator = dynamic(
  () => import('@/components/ai-video/LipSyncGenerator'),
  {
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    ),
    ssr: false,
  }
);

export default function AIVideoLipSyncPage() {
  const t = useTranslations('aiVideo.lipsync');

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white">
      {/* Hero Section */}
      <section className="relative pt-20 pb-10 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-cyan-500/20 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto text-center">
          {/* Breadcrumb */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/ai-video" className="hover:text-cyan-400 transition">
              AI Video
            </Link>
            <span>/</span>
            <span className="text-cyan-400">{t('breadcrumb')}</span>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
            <span className="text-cyan-400">👄</span>
            <span className="text-sm text-cyan-400">{t('badge')}</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            {t('heroTitle1')}{' '}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {t('heroTitleHighlight')}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
            {t('heroSubtitle')}
          </p>
        </div>
      </section>

      {/* Generator Section */}
      <section className="px-4 pb-12">
        <LipSyncGenerator />
      </section>

      {/* Features Section */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-10">{t('featuresTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
              <div className="w-12 h-12 bg-cyan-500/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('feature1Title')}</h3>
              <p className="text-gray-400 text-sm">{t('feature1Desc')}</p>
            </div>
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
              <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🎬</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('feature2Title')}</h3>
              <p className="text-gray-400 text-sm">{t('feature2Desc')}</p>
            </div>
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-xl p-6">
              <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('feature3Title')}</h3>
              <p className="text-gray-400 text-sm">{t('feature3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Back Link */}
      <section className="px-4 pb-10">
        <div className="max-w-4xl mx-auto text-center">
          <Link
            href="/ai-video"
            className="text-cyan-400 hover:text-cyan-300 transition inline-flex items-center gap-2"
          >
            <span>←</span>
            {t('backToAIVideo')}
          </Link>
        </div>
      </section>
    </div>
  );
}
