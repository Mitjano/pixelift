'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import ToolsLayout from '@/components/ToolsLayout';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// Lazy load heavy component
const PortraitRelight = dynamic(
  () => import('@/components/PortraitRelight').then(mod => ({ default: mod.PortraitRelight })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function PortraitRelightPage() {
  const { data: session } = useSession();
  const t = useTranslations('portraitRelightPage');

  return (
    <ToolsLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-8 pb-12">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-amber-100/50 dark:from-amber-900/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl" />

          <div className="relative text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-600/20 border border-amber-300 dark:border-amber-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="text-amber-600 dark:text-amber-300">{t('badge')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
                {t('title')}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto mb-8">
              {t('subtitle')}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{t('stats.presets')}</div>
                <div className="text-sm text-gray-500">{t('stats.presetsLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{t('stats.aiPowered')}</div>
                <div className="text-sm text-gray-500">{t('stats.aiPoweredLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{t('stats.creditCost')}</div>
                <div className="text-sm text-gray-500">{t('stats.creditCostLabel')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Section */}
        <section className="px-6 mb-12">
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <PortraitRelight userRole='user' />
            <p className="text-sm text-gray-500 mt-4 text-center">
              {t('termsNotice')}
            </p>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t('howItWorks.title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">{t('howItWorks.step1.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('howItWorks.step1.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">{t('howItWorks.step2.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('howItWorks.step2.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-yellow-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">{t('howItWorks.step3.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('howItWorks.step3.description')}</p>
            </div>
          </div>
        </section>

        {/* Lighting Presets */}
        <section className="px-6 mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t('lightingPresets.title')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-amber-100 dark:from-amber-900/20 to-yellow-100 dark:to-yellow-900/20 rounded-xl border border-gray-200 dark:border-amber-700/30 p-6">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="text-lg font-semibold mb-2">{t('lightingPresets.studio.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('lightingPresets.studio.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-100 dark:from-orange-900/20 to-amber-100 dark:to-amber-900/20 rounded-xl border border-gray-200 dark:border-orange-700/30 p-6">
              <div className="text-3xl mb-3">🌅</div>
              <h3 className="text-lg font-semibold mb-2">{t('lightingPresets.golden.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('lightingPresets.golden.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-gray-100 dark:from-gray-800/50 to-slate-100 dark:to-slate-900/20 rounded-xl border border-gray-200 dark:border-gray-700/30 p-6">
              <div className="text-3xl mb-3">🎭</div>
              <h3 className="text-lg font-semibold mb-2">{t('lightingPresets.dramatic.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('lightingPresets.dramatic.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-pink-100 dark:from-pink-900/20 to-purple-100 dark:to-purple-900/20 rounded-xl border border-gray-200 dark:border-pink-700/30 p-6">
              <div className="text-3xl mb-3">🌈</div>
              <h3 className="text-lg font-semibold mb-2">{t('lightingPresets.neon.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('lightingPresets.neon.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 dark:from-blue-900/20 to-cyan-100 dark:to-cyan-900/20 rounded-xl border border-gray-200 dark:border-blue-700/30 p-6">
              <div className="text-3xl mb-3">🪟</div>
              <h3 className="text-lg font-semibold mb-2">{t('lightingPresets.natural.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('lightingPresets.natural.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 dark:from-yellow-900/20 to-orange-100 dark:to-orange-900/20 rounded-xl border border-gray-200 dark:border-yellow-700/30 p-6">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-lg font-semibold mb-2">{t('lightingPresets.rembrandt.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('lightingPresets.rembrandt.description')}</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-amber-100 dark:from-amber-900/20 to-orange-100 dark:to-orange-900/20 rounded-xl border border-gray-200 dark:border-amber-700/30 p-6">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">🎯</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.aiPowered.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.aiPowered.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-100 dark:from-orange-900/20 to-amber-100 dark:to-amber-900/20 rounded-xl border border-gray-200 dark:border-orange-700/30 p-6">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">✨</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.customPrompts.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.customPrompts.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-100 dark:from-yellow-900/20 to-amber-100 dark:to-amber-900/20 rounded-xl border border-gray-200 dark:border-yellow-700/30 p-6">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">⚡</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.fastProcessing.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.fastProcessing.description')}</p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-6 mb-16">
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-8 text-center">{t('useCases.title')}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-amber-600 dark:text-amber-400">{t('useCases.photographers.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('useCases.photographers.description')}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-orange-600 dark:text-orange-400">{t('useCases.contentCreators.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('useCases.contentCreators.description')}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-yellow-600 dark:text-yellow-400">{t('useCases.ecommerce.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('useCases.ecommerce.description')}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-red-600 dark:text-red-400">{t('useCases.socialMedia.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('useCases.socialMedia.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Tools */}
        <section className="px-6 mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('relatedTools.title')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/tools/packshot-generator" className="block bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-amber-500 transition">
              <h3 className="font-semibold mb-2">{t('relatedTools.packshot.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('relatedTools.packshot.description')}</p>
            </Link>
            <Link href="/tools/remove-background" className="block bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-amber-500 transition">
              <h3 className="font-semibold mb-2">{t('relatedTools.removeBackground.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('relatedTools.removeBackground.description')}</p>
            </Link>
            <Link href="/tools/restore" className="block bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-amber-500 transition">
              <h3 className="font-semibold mb-2">{t('relatedTools.restore.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('relatedTools.restore.description')}</p>
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 pb-12">
          <div className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 rounded-2xl border border-amber-300 dark:border-amber-700/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">{t('cta.subtitle')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/tools" className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-lg font-semibold transition">{t('cta.exploreTools')}</Link>
              <Link href="/pricing" className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition">{t('cta.viewPricing')}</Link>
            </div>
          </div>
        </section>
      </div>
    </ToolsLayout>
  );
}
