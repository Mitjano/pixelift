'use client';

import dynamic from 'next/dynamic';
import { useTranslations } from 'next-intl';
import ToolsLayout from '@/components/ToolsLayout';
import Link from 'next/link';

const ScriptGenerator = dynamic(
  () => import('@/components/ai-video/ScriptGenerator'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function AIVideoScriptPage() {
  const t = useTranslations('aiVideo.script');

  return (
    <ToolsLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/ai-video" className="hover:text-cyan-400 transition">
              AI Video
            </Link>
            <span>/</span>
            <span className="text-cyan-400">{t('breadcrumb')}</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 rounded-full text-sm mb-6">
              <span>📝</span>
              <span className="text-cyan-300">{t('badge')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="text-white">{t('heroTitle1')} </span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {t('heroTitleHighlight')}
              </span>
            </h1>

            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">
              {t('heroSubtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <ScriptGenerator />
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">
          {t('featuresTitle')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="text-3xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('feature1Title')}</h3>
            <p className="text-gray-400 text-sm">{t('feature1Desc')}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('feature2Title')}</h3>
            <p className="text-gray-400 text-sm">{t('feature2Desc')}</p>
          </div>
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="text-3xl mb-4">🌍</div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('feature3Title')}</h3>
            <p className="text-gray-400 text-sm">{t('feature3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Back to AI Video */}
      <section className="max-w-7xl mx-auto px-6 py-8 text-center">
        <Link
          href="/ai-video"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-cyan-400 transition"
        >
          <span>←</span>
          {t('backToAIVideo')}
        </Link>
      </section>
    </ToolsLayout>
  );
}
