'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import {
  FaCamera, FaShoppingCart, FaPrint, FaGamepad,
  FaImage, FaBuilding, FaHeart, FaFilm
} from 'react-icons/fa';

const useCaseIcons: Record<string, React.ReactNode> = {
  photography: <FaCamera className="w-8 h-8" />,
  ecommerce: <FaShoppingCart className="w-8 h-8" />,
  printing: <FaPrint className="w-8 h-8" />,
  gaming: <FaGamepad className="w-8 h-8" />,
  socialMedia: <FaImage className="w-8 h-8" />,
  realEstate: <FaBuilding className="w-8 h-8" />,
  restoration: <FaHeart className="w-8 h-8" />,
  video: <FaFilm className="w-8 h-8" />,
};

const useCaseColors: Record<string, string> = {
  photography: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
  ecommerce: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
  printing: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
  gaming: 'from-red-500/20 to-orange-500/20 border-red-500/30',
  socialMedia: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
  realEstate: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30',
  restoration: 'from-teal-500/20 to-cyan-500/20 border-teal-500/30',
  video: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30',
};

export default function UseCasesPage() {
  const t = useTranslations('useCasesPage');

  const useCases = [
    'photography',
    'ecommerce',
    'printing',
    'gaming',
    'socialMedia',
    'realEstate',
    'restoration',
    'video',
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-16 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {t('title')}
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>
      </section>

      {/* Use Cases Grid */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-2 gap-6">
          {useCases.map((useCase) => (
            <div
              key={useCase}
              className={`bg-gradient-to-br ${useCaseColors[useCase]} border rounded-2xl p-8 hover:scale-[1.02] transition-transform`}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-800/50 rounded-xl text-white">
                  {useCaseIcons[useCase]}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{t(`cases.${useCase}.title`)}</h3>
                  <p className="text-gray-400 mb-4">{t(`cases.${useCase}.description`)}</p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500 font-medium">{t('commonUses')}:</p>
                    <ul className="text-sm text-gray-400 space-y-1">
                      <li>• {t(`cases.${useCase}.use1`)}</li>
                      <li>• {t(`cases.${useCase}.use2`)}</li>
                      <li>• {t(`cases.${useCase}.use3`)}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tools Section */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-gray-800/30 border border-gray-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">{t('toolsSection.title')}</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <Link
              href="/tools/upscaler"
              className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-center transition"
            >
              <div className="text-2xl mb-2">🔍</div>
              <div className="font-medium">{t('toolsSection.upscaler')}</div>
            </Link>
            <Link
              href="/tools/remove-background"
              className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-center transition"
            >
              <div className="text-2xl mb-2">✂️</div>
              <div className="font-medium">{t('toolsSection.backgroundRemover')}</div>
            </Link>
            <Link
              href="/tools/colorize"
              className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-center transition"
            >
              <div className="text-2xl mb-2">🎨</div>
              <div className="font-medium">{t('toolsSection.colorize')}</div>
            </Link>
            <Link
              href="/tools/image-expand"
              className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl text-center transition"
            >
              <div className="text-2xl mb-2">↔️</div>
              <div className="font-medium">{t('toolsSection.expand')}</div>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-700/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">{t('cta.title')}</h2>
          <p className="text-gray-400 mb-6">{t('cta.subtitle')}</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/tools"
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg font-semibold transition"
            >
              {t('cta.tryTools')}
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
            >
              {t('cta.viewPricing')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
