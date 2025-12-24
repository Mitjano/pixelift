"use client";

import Link from "next/link";
import { useTranslations } from 'next-intl';

const aiProducts = [
  {
    id: 'ai-chat',
    href: '/ai-chat',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    color: 'from-green-500 to-emerald-600',
    bgGradient: 'from-green-500/10 to-emerald-600/10 dark:from-green-500/20 dark:to-emerald-600/20',
    borderColor: 'border-green-200 dark:border-green-500/30 hover:border-green-400 dark:hover:border-green-400',
    iconColor: 'text-green-500 dark:text-green-400',
    features: ['gpt52', 'claudeOpus', 'gemini', 'deepseek'],
    badge: 'NEW',
  },
  {
    id: 'ai-image',
    href: '/ai-image',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-purple-500 to-pink-600',
    bgGradient: 'from-purple-500/10 to-pink-600/10 dark:from-purple-500/20 dark:to-pink-600/20',
    borderColor: 'border-purple-200 dark:border-purple-500/30 hover:border-purple-400 dark:hover:border-purple-400',
    iconColor: 'text-purple-500 dark:text-purple-400',
    features: ['flux', 'sd35', 'dalle', 'ideogram'],
    badge: null,
  },
  {
    id: 'ai-video',
    href: '/ai-video',
    icon: (
      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    color: 'from-cyan-500 to-blue-600',
    bgGradient: 'from-cyan-500/10 to-blue-600/10 dark:from-cyan-500/20 dark:to-blue-600/20',
    borderColor: 'border-cyan-200 dark:border-cyan-500/30 hover:border-cyan-400 dark:hover:border-cyan-400',
    iconColor: 'text-cyan-500 dark:text-cyan-400',
    features: ['kling', 'runway', 'luma', 'minimax'],
    badge: null,
  },
];

export default function AIProductsShowcase() {
  const t = useTranslations('aiProducts');

  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <div className="inline-block mb-4 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-500/20 dark:to-pink-500/20 border border-purple-300 dark:border-purple-500/30 rounded-full">
          <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            {t('badge')}
          </span>
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">
          {t('title')} <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">{t('titleHighlight')}</span>
        </h2>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-3xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {aiProducts.map((product) => (
          <Link
            key={product.id}
            href={product.href}
            className={`group relative bg-gradient-to-br ${product.bgGradient} backdrop-blur-sm rounded-2xl border ${product.borderColor} p-8 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-xl overflow-hidden`}
          >
            {/* Badge */}
            {product.badge && (
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white shadow-lg shadow-green-500/30 animate-pulse">
                  {product.badge}
                </span>
              </div>
            )}

            {/* Icon */}
            <div className={`w-16 h-16 rounded-2xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-6 ${product.iconColor} group-hover:scale-110 transition-transform duration-300`}>
              {product.icon}
            </div>

            {/* Title */}
            <h3 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">
              {t(`products.${product.id}.name`)}
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
              {t(`products.${product.id}.description`)}
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-2 mb-6">
              {product.features.map((feature) => (
                <span
                  key={feature}
                  className="px-2.5 py-1 text-xs font-medium bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 rounded-full text-gray-600 dark:text-gray-300"
                >
                  {t(`products.${product.id}.features.${feature}`)}
                </span>
              ))}
            </div>

            {/* CTA */}
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
              <span>{t(`products.${product.id}.cta`)}</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        ))}
      </div>

      {/* Bottom Stats */}
      <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16">
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">20+</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('stats.models')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">10+</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('stats.imageModels')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">5+</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('stats.videoModels')}</div>
        </div>
        <div className="text-center">
          <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">0.001$</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{t('stats.perToken')}</div>
        </div>
      </div>
    </section>
  );
}
