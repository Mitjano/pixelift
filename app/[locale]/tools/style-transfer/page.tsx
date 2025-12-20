'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import ToolsLayout from '@/components/ToolsLayout';
import { RelatedTools } from '@/components/RelatedTools';
import { BreadcrumbSchema, getToolBreadcrumbs } from '@/components/BreadcrumbSchema';

const StyleTransfer = dynamic(
  () => import('@/components/StyleTransfer'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function StyleTransferPage() {
  const { data: session } = useSession();
  const t = useTranslations('styleTransferPage');
  const tTools = useTranslations('tools.styleTransfer');
  const locale = useLocale();

  return (
    <ToolsLayout>
      <BreadcrumbSchema items={getToolBreadcrumbs(tTools('name'), 'style-transfer', locale)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-100/50 dark:from-pink-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-300/30 dark:bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-300/20 dark:bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-600/20 border border-pink-300 dark:border-pink-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-pink-600 dark:text-pink-300">{t('badge')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-gray-900 dark:text-white">{t('title')} </span>
              <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-violet-500 dark:from-pink-400 dark:via-purple-400 dark:to-violet-400 bg-clip-text text-transparent">
                {t('titleHighlight')}
              </span>
            </h1>

            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-3xl mx-auto">
              {t('subtitle')}
            </p>

            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t('stats.credits')}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('stats.creditsLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t('stats.references')}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('stats.referencesLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">{t('stats.speed')}</div>
                <div className="text-gray-500 dark:text-gray-400 text-sm mt-1">{t('stats.speedLabel')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <StyleTransfer />
          <p className="text-sm text-gray-500 mt-4 text-center">
            {t('termsNotice')}
          </p>
        </div>
      </section>

      {/* Options Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          {t('options.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { key: 'artistic', gradient: 'from-pink-100 dark:from-pink-500/20 to-rose-100 dark:to-rose-500/20' },
            { key: 'texture', gradient: 'from-purple-100 dark:from-purple-500/20 to-violet-100 dark:to-violet-500/20' },
            { key: 'color', gradient: 'from-violet-100 dark:from-violet-500/20 to-pink-100 dark:to-pink-500/20' },
          ].map((option) => (
            <div
              key={option.key}
              className={`bg-gradient-to-br ${option.gradient} backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 text-center`}
            >
              <div className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                {t(`options.${option.key}.name`)}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(`options.${option.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          {t('features.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: '🎭', key: 'anyReference', gradient: 'from-pink-100 dark:from-pink-500/20 to-purple-100 dark:to-purple-500/20' },
            { icon: '🌍', key: 'contentPreserving', gradient: 'from-purple-100 dark:from-purple-500/20 to-violet-100 dark:to-violet-500/20' },
            { icon: '✨', key: 'adjustableStrength', gradient: 'from-violet-100 dark:from-violet-500/20 to-pink-100 dark:to-pink-500/20' },
          ].map((feature) => (
            <div
              key={feature.key}
              className={`bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-gray-200 dark:border-gray-700 rounded-2xl p-6 hover:border-gray-300 dark:hover:border-gray-600 transition`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t(`features.${feature.key}.title`)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t(`features.${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-100/50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gray-900 dark:text-white">{t('howItWorks.title')} </span>
              <span className="bg-gradient-to-r from-pink-500 to-purple-500 dark:from-pink-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t('howItWorks.titleHighlight')}
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {['step1', 'step2', 'step3', 'step4'].map((step, idx) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {idx + 1}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {t(`howItWorks.${step}.title`)}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t(`howItWorks.${step}.description`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {t('useCases.title')}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {['artists', 'photography', 'marketing', 'education'].map((useCase) => (
            <div
              key={useCase}
              className="bg-gray-50 dark:bg-gray-800/30 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-pink-500/50 transition"
            >
              <div className="text-3xl mb-3">{t(`useCases.${useCase}.icon`)}</div>
              <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                {t(`useCases.${useCase}.title`)}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t(`useCases.${useCase}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 rounded-2xl border border-pink-300 dark:border-pink-700/50 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('technology.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            {t('technology.description')}
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {['feature1', 'feature2', 'feature3', 'feature4'].map((feature) => (
              <div key={feature} className="flex items-start gap-3">
                <span className="text-green-500 dark:text-green-400 mt-1">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{t(`technology.${feature}`)}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Limitations Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('limitations.title')}
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-600 dark:text-green-400">
                {t('limitations.worksWell.title')}
              </h3>
              <ul className="space-y-2">
                {['item1', 'item2', 'item3'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <span className="text-green-500 mt-0.5">•</span>
                    {t(`limitations.worksWell.${item}`)}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-orange-600 dark:text-orange-400">
                {t('limitations.limitations.title')}
              </h3>
              <ul className="space-y-2">
                {['item1', 'item2', 'item3'].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-gray-600 dark:text-gray-400">
                    <span className="text-orange-500 mt-0.5">•</span>
                    {t(`limitations.limitations.${item}`)}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gray-100 dark:bg-gray-800/20 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">{t('tips.title')}</h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-600 dark:text-gray-400">
            <div>
              <ul className="space-y-2 text-sm">
                <li>• {t('tips.tip1')}</li>
                <li>• {t('tips.tip2')}</li>
                <li>• {t('tips.tip3')}</li>
              </ul>
            </div>
            <div>
              <ul className="space-y-2 text-sm">
                <li>• {t('tips.tip4')}</li>
                <li>• {t('tips.tip5')}</li>
                <li>• {t('tips.tip6')}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900 dark:text-white">
          {t('faq.title')}
        </h2>
        <div className="max-w-3xl mx-auto space-y-6">
          {['q1', 'q2', 'q3', 'q4', 'q5'].map((q) => (
            <div key={q} className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t(`faq.${q}.question`)}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t(`faq.${q}.answer`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Related Tools */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <RelatedTools currentSlug="style-transfer" />
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/50 dark:to-purple-900/50 border border-pink-300 dark:border-pink-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
            {t('cta.title')}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            {t('cta.subtitle')}
          </p>
          {!session ? (
            <Link
              href="/auth/signin"
              className="inline-block px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition shadow-lg shadow-pink-500/25"
            >
              {t('cta.getStarted')}
            </Link>
          ) : (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-4 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl font-semibold text-lg transition shadow-lg shadow-pink-500/25"
            >
              {t('cta.startAction')}
            </button>
          )}
        </div>
      </section>
    </ToolsLayout>
  );
}
