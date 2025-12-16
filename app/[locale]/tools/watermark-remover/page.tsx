'use client';

import dynamic from 'next/dynamic';
import ToolsLayout from '@/components/ToolsLayout';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const WatermarkRemover = dynamic(
  () => import('@/components/WatermarkRemover').then(mod => ({ default: mod.WatermarkRemover })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function WatermarkRemoverPage() {
  const t = useTranslations('watermarkRemoverPage');

  return (
    <ToolsLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-8 pb-12">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-100/50 dark:from-orange-900/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-red-600/10 rounded-full blur-3xl" />

          <div className="relative text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-100 dark:bg-orange-600/20 border border-orange-300 dark:border-orange-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
              </span>
              <span className="text-orange-600 dark:text-orange-300">{t('badge')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-orange-400 via-red-400 to-orange-500 bg-clip-text text-transparent">
                {t('title')}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto mb-8">
              {t('subtitle')}
            </p>

            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{t('stats.aiPowered')}</div>
                <div className="text-sm text-gray-500">{t('stats.aiPoweredLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">{t('stats.modes')}</div>
                <div className="text-sm text-gray-500">{t('stats.modesLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{t('stats.creditCost')}</div>
                <div className="text-sm text-gray-500">{t('stats.creditCostLabel')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Section */}
        <section className="px-6 mb-12">
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <WatermarkRemover userRole='user' />
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
              <div className="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">{t('howItWorks.step1.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('howItWorks.step1.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-red-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">{t('howItWorks.step2.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('howItWorks.step2.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">{t('howItWorks.step3.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('howItWorks.step3.description')}</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="px-6 mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-orange-100 dark:from-orange-900/20 to-red-100 dark:to-red-900/20 rounded-xl border border-gray-200 dark:border-orange-700/30 p-6">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">🎯</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.autoDetect.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.autoDetect.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-red-100 dark:from-red-900/20 to-orange-100 dark:to-orange-900/20 rounded-xl border border-gray-200 dark:border-red-700/30 p-6">
              <div className="w-12 h-12 bg-red-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">✏️</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.manualMask.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.manualMask.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-amber-100 dark:from-amber-900/20 to-orange-100 dark:to-orange-900/20 rounded-xl border border-gray-200 dark:border-amber-700/30 p-6">
              <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">⚡</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.seamless.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.seamless.description')}</p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-6 mb-16">
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-8 text-center">{t('useCases.title')}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-orange-600 dark:text-orange-400">{t('useCases.stockPhotos.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('useCases.stockPhotos.description')}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-red-600 dark:text-red-400">{t('useCases.screenshots.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('useCases.screenshots.description')}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-amber-600 dark:text-amber-400">{t('useCases.oldPhotos.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('useCases.oldPhotos.description')}</p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-yellow-600 dark:text-yellow-400">{t('useCases.documents.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400">{t('useCases.documents.description')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Related Tools */}
        <section className="px-6 mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('relatedTools.title')}</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/tools/object-removal" className="block bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-orange-500 transition">
              <h3 className="font-semibold mb-2">{t('relatedTools.objectRemoval.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('relatedTools.objectRemoval.description')}</p>
            </Link>
            <Link href="/tools/inpainting" className="block bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-orange-500 transition">
              <h3 className="font-semibold mb-2">{t('relatedTools.inpainting.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('relatedTools.inpainting.description')}</p>
            </Link>
            <Link href="/tools/remove-background" className="block bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-orange-500 transition">
              <h3 className="font-semibold mb-2">{t('relatedTools.removeBackground.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('relatedTools.removeBackground.description')}</p>
            </Link>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 pb-12">
          <div className="bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-2xl border border-orange-300 dark:border-orange-700/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">{t('cta.subtitle')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/tools" className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold transition">{t('cta.exploreTools')}</Link>
              <Link href="/pricing" className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition">{t('cta.viewPricing')}</Link>
            </div>
          </div>
        </section>
      </div>
    </ToolsLayout>
  );
}
