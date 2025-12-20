'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import ToolsLayout from '@/components/ToolsLayout';
import { RelatedTools } from '@/components/RelatedTools';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

// Lazy load heavy component
const FormatConverter = dynamic(
  () => import('@/components/FormatConverter'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function FormatConverterPage() {
  const { data: session } = useSession();
  const t = useTranslations('formatConverterPage');

  return (
    <ToolsLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-8 pb-12">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/50 dark:from-emerald-900/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-teal-600/10 rounded-full blur-3xl" />

          <div className="relative text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-600/20 border border-emerald-300 dark:border-emerald-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-300">{t('badge')}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 bg-clip-text text-transparent">
                {t('title')}
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg max-w-3xl mx-auto mb-8">
              {t('subtitle')}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{t('stats.formats')}</div>
                <div className="text-sm text-gray-500">{t('stats.formatsLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-teal-600 dark:text-teal-400">{t('stats.processing')}</div>
                <div className="text-sm text-gray-500">{t('stats.processingLabel')}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{t('stats.creditCost')}</div>
                <div className="text-sm text-gray-500">{t('stats.creditCostLabel')}</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Section */}
        <section className="px-6 mb-12">
          <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <FormatConverter />
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
              <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-lg font-semibold mb-2">{t('howItWorks.step1.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('howItWorks.step1.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-lg font-semibold mb-2">{t('howItWorks.step2.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('howItWorks.step2.description')}</p>
            </div>
            <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
              <div className="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-lg font-semibold mb-2">{t('howItWorks.step3.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('howItWorks.step3.description')}</p>
            </div>
          </div>
        </section>

        {/* Supported Formats Grid */}
        <section className="px-6 mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t('supportedFormats.title')}</h2>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="bg-gradient-to-br from-amber-100 dark:from-amber-900/20 to-orange-100 dark:to-orange-900/20 rounded-xl border border-gray-200 dark:border-amber-700/30 p-6 text-center">
              <div className="text-3xl font-bold text-amber-600 dark:text-amber-400 mb-2">JPG</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('supportedFormats.jpg')}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 dark:from-blue-900/20 to-indigo-100 dark:to-indigo-900/20 rounded-xl border border-gray-200 dark:border-blue-700/30 p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">PNG</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('supportedFormats.png')}</p>
            </div>
            <div className="bg-gradient-to-br from-emerald-100 dark:from-emerald-900/20 to-green-100 dark:to-green-900/20 rounded-xl border border-gray-200 dark:border-emerald-700/30 p-6 text-center">
              <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">WebP</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('supportedFormats.webp')}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 dark:from-purple-900/20 to-violet-100 dark:to-violet-900/20 rounded-xl border border-gray-200 dark:border-purple-700/30 p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">AVIF</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('supportedFormats.avif')}</p>
            </div>
            <div className="bg-gradient-to-br from-pink-100 dark:from-pink-900/20 to-rose-100 dark:to-rose-900/20 rounded-xl border border-gray-200 dark:border-pink-700/30 p-6 text-center">
              <div className="text-3xl font-bold text-pink-600 dark:text-pink-400 mb-2">GIF</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{t('supportedFormats.gif')}</p>
            </div>
          </div>
        </section>

        {/* Features Grid - Extended */}
        <section className="px-6 mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-100 dark:from-emerald-900/20 to-teal-100 dark:to-teal-900/20 rounded-xl border border-gray-200 dark:border-emerald-700/30 p-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">⚡</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.instantConversion.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.instantConversion.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-teal-100 dark:from-teal-900/20 to-emerald-100 dark:to-emerald-900/20 rounded-xl border border-gray-200 dark:border-teal-700/30 p-6">
              <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">🎚️</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.qualityControl.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.qualityControl.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-green-100 dark:from-green-900/20 to-emerald-100 dark:to-emerald-900/20 rounded-xl border border-gray-200 dark:border-green-700/30 p-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">🆓</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.completelyFree.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.completelyFree.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 dark:from-blue-900/20 to-cyan-100 dark:to-cyan-900/20 rounded-xl border border-gray-200 dark:border-blue-700/30 p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">🔒</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.privacyFirst.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.privacyFirst.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-100 dark:from-purple-900/20 to-pink-100 dark:to-pink-900/20 rounded-xl border border-gray-200 dark:border-purple-700/30 p-6">
              <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">🌐</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.noInstallation.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.noInstallation.description')}</p>
            </div>
            <div className="bg-gradient-to-br from-orange-100 dark:from-orange-900/20 to-amber-100 dark:to-amber-900/20 rounded-xl border border-gray-200 dark:border-orange-700/30 p-6">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4"><span className="text-2xl">📦</span></div>
              <h3 className="text-lg font-semibold mb-2">{t('features.largeFiles.title')}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('features.largeFiles.description')}</p>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-6 mb-16">
          <div className="bg-gray-50 dark:bg-gray-800/30 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-8 text-center">{t('useCases.title')}</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-emerald-600 dark:text-emerald-400">{t('useCases.webOptimization.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('useCases.webOptimization.description')}</p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>{t('useCases.webOptimization.feature1')}</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>{t('useCases.webOptimization.feature2')}</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>{t('useCases.webOptimization.feature3')}</span></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-teal-600 dark:text-teal-400">{t('useCases.compatibility.title')}</h3>
                <div className="space-y-3">
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3"><strong>📱 {t('useCases.compatibility.socialMedia')}</strong> {t('useCases.compatibility.socialMediaDesc')}</div>
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3"><strong>💻 {t('useCases.compatibility.apps')}</strong> {t('useCases.compatibility.appsDesc')}</div>
                  <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3"><strong>🖨️ {t('useCases.compatibility.print')}</strong> {t('useCases.compatibility.printDesc')}</div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">{t('useCases.ecommerce.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('useCases.ecommerce.description')}</p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>{t('useCases.ecommerce.feature1')}</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>{t('useCases.ecommerce.feature2')}</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>{t('useCases.ecommerce.feature3')}</span></li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-purple-600 dark:text-purple-400">{t('useCases.photographers.title')}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t('useCases.photographers.description')}</p>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>{t('useCases.photographers.feature1')}</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>{t('useCases.photographers.feature2')}</span></li>
                  <li className="flex items-start gap-2"><span className="text-green-500">✓</span><span>{t('useCases.photographers.feature3')}</span></li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Format Comparison */}
        <section className="px-6 mb-16">
          <div className="bg-gradient-to-br from-emerald-100 dark:from-emerald-900/20 to-teal-100 dark:to-teal-900/20 rounded-xl border border-gray-200 dark:border-emerald-700/50 p-6">
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2"><span>📊</span> {t('formatComparison.title')}</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{t('formatComparison.description')}</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-300 dark:border-gray-600">
                    <th className="text-left py-3 px-2 font-semibold">{t('formatComparison.format')}</th>
                    <th className="text-center py-3 px-2 font-semibold">{t('formatComparison.size')}</th>
                    <th className="text-center py-3 px-2 font-semibold">{t('formatComparison.quality')}</th>
                    <th className="text-center py-3 px-2 font-semibold">{t('formatComparison.transparency')}</th>
                    <th className="text-left py-3 px-2 font-semibold">{t('formatComparison.bestFor')}</th>
                  </tr>
                </thead>
                <tbody className="text-gray-600 dark:text-gray-300">
                  <tr className="border-b border-gray-200 dark:border-gray-700"><td className="py-3 px-2 font-medium">JPG</td><td className="text-center">🟢 {t('formatComparison.small')}</td><td className="text-center">🟡 {t('formatComparison.good')}</td><td className="text-center">❌</td><td>{t('formatComparison.jpgBest')}</td></tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700"><td className="py-3 px-2 font-medium">PNG</td><td className="text-center">🔴 {t('formatComparison.large')}</td><td className="text-center">🟢 {t('formatComparison.excellent')}</td><td className="text-center">✅</td><td>{t('formatComparison.pngBest')}</td></tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700"><td className="py-3 px-2 font-medium">WebP</td><td className="text-center">🟢 {t('formatComparison.small')}</td><td className="text-center">🟢 {t('formatComparison.excellent')}</td><td className="text-center">✅</td><td>{t('formatComparison.webpBest')}</td></tr>
                  <tr className="border-b border-gray-200 dark:border-gray-700"><td className="py-3 px-2 font-medium">AVIF</td><td className="text-center">🟢 {t('formatComparison.smallest')}</td><td className="text-center">🟢 {t('formatComparison.excellent')}</td><td className="text-center">✅</td><td>{t('formatComparison.avifBest')}</td></tr>
                  <tr><td className="py-3 px-2 font-medium">GIF</td><td className="text-center">🟡 {t('formatComparison.medium')}</td><td className="text-center">🔴 {t('formatComparison.limited')}</td><td className="text-center">✅</td><td>{t('formatComparison.gifBest')}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Format Details */}
        <section className="px-6 mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t('formatDetails.title')}</h2>
          <div className="space-y-6">
            {(['jpg', 'png', 'webp', 'avif', 'gif'] as const).map((format) => (
              <div key={format} className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold mb-3">{t(`formatDetails.${format}.title`)}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{t(`formatDetails.${format}.description`)}</p>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3"><span className="font-medium text-green-700 dark:text-green-400">✓ Pros: </span>{t(`formatDetails.${format}.pros`)}</div>
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3"><span className="font-medium text-red-700 dark:text-red-400">✗ Cons: </span>{t(`formatDetails.${format}.cons`)}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conversion Guide */}
        <section className="px-6 mb-16">
          <h2 className="text-2xl font-bold mb-4 text-center">{t('conversionGuide.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-8">{t('conversionGuide.description')}</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(['pngToJpg', 'jpgToPng', 'pngToWebp', 'jpgToWebp', 'webpToJpg', 'webpToPng', 'anyToAvif'] as const).map((c) => (
              <div key={c} className="bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-emerald-600 dark:text-emerald-400 mb-2">{t(`conversionGuide.${c}.title`)}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t(`conversionGuide.${c}.description`)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="px-6 mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">{t('faq.title')}</h2>
          <div className="space-y-4 max-w-4xl mx-auto">
            {([1,2,3,4,5,6,7,8]).map((num) => (
              <details key={num} className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 group">
                <summary className="p-4 cursor-pointer font-medium flex items-center justify-between">{t(`faq.q${num}.question`)}<span className="text-emerald-500 group-open:rotate-180 transition-transform">▼</span></summary>
                <div className="px-4 pb-4 text-gray-600 dark:text-gray-400">{t(`faq.q${num}.answer`)}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Technical Specs */}
        <section className="px-6 mb-16">
          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-bold mb-4">{t('technicalSpecs.title')}</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">{t('technicalSpecs.inputFormats')}</span><span className="font-medium">{t('technicalSpecs.inputFormatsValue')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">{t('technicalSpecs.outputFormats')}</span><span className="font-medium">{t('technicalSpecs.outputFormatsValue')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">{t('technicalSpecs.maxFileSize')}</span><span className="font-medium">{t('technicalSpecs.maxFileSizeValue')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">{t('technicalSpecs.qualityRange')}</span><span className="font-medium">{t('technicalSpecs.qualityRangeValue')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">{t('technicalSpecs.processing')}</span><span className="font-medium">{t('technicalSpecs.processingValue')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">{t('technicalSpecs.colorSpace')}</span><span className="font-medium">{t('technicalSpecs.colorSpaceValue')}</span></div>
            </div>
          </div>
        </section>

        {/* Related Tools */}
        <section className="px-6 mb-16">
          <RelatedTools currentSlug="format-converter" />
        </section>

        {/* CTA Section */}
        <section className="px-6 pb-12">
          <div className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-2xl border border-emerald-300 dark:border-emerald-700/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">{t('cta.subtitle')}</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/tools" className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-lg font-semibold transition">{t('cta.exploreTools')}</Link>
              <Link href="/pricing" className="px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-semibold transition">{t('cta.viewPricing')}</Link>
            </div>
          </div>
        </section>
      </div>
    </ToolsLayout>
  );
}
