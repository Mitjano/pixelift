'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { FaRobot, FaComments, FaCoins, FaImage, FaHistory, FaShare } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi2';

// Lazy load ChatWindow (heavy component)
const ChatWindow = dynamic(
  () => import('@/components/ai-chat/ChatWindow'),
  {
    loading: () => (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="text-gray-400">Ładowanie AI Chat...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
);

// Feature cards data
const FEATURES = [
  {
    id: 'free',
    icon: <HiSparkles className="w-6 h-6" />,
    gradient: 'from-green-500 to-emerald-600',
  },
  {
    id: 'models',
    icon: <FaRobot className="w-6 h-6" />,
    gradient: 'from-purple-500 to-violet-600',
  },
  {
    id: 'payPerUse',
    icon: <FaCoins className="w-6 h-6" />,
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'multimodal',
    icon: <FaImage className="w-6 h-6" />,
    gradient: 'from-blue-500 to-cyan-600',
  },
  {
    id: 'history',
    icon: <FaHistory className="w-6 h-6" />,
    gradient: 'from-indigo-500 to-purple-600',
  },
  {
    id: 'export',
    icon: <FaShare className="w-6 h-6" />,
    gradient: 'from-pink-500 to-rose-600',
  },
];

export default function AIChatPage() {
  const t = useTranslations('chat');
  const { data: session, status } = useSession();

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  // If not authenticated, show landing page
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />

          <div className="relative max-w-7xl mx-auto px-6 py-20 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-purple-300">Darmowe modele AI dostępne!</span>
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-white">Darmowy </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                AI Chat
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10">
              {t('pageDescription')}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link
                href="/auth/signin"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:-translate-y-0.5"
              >
                Rozpocznij za darmo
              </Link>
              <Link
                href="/pricing"
                className="px-8 py-4 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-xl border border-gray-700 transition"
              >
                Zobacz cennik
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 md:gap-16">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">20+</div>
                <div className="text-sm text-gray-500">Modeli AI</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-green-400">4</div>
                <div className="text-sm text-gray-500">Darmowe modele</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">1M+</div>
                <div className="text-sm text-gray-500">Tokenów kontekstu</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-purple-400">0</div>
                <div className="text-sm text-gray-500">Abonament</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">Wszystko czego potrzebujesz w </span>
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                jednym miejscu
              </span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Profesjonalny chatbot AI z dostępem do najlepszych modeli językowych na świecie
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => (
              <div
                key={feature.id}
                className="group relative bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 hover:border-gray-600 rounded-2xl p-6 transition-all duration-300"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {t(`features.${feature.id}.title`)}
                </h3>
                <p className="text-sm text-gray-400">
                  {t(`features.${feature.id}.description`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Models Section */}
        <section className="bg-gray-800/30 py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                Najlepsze modele AI
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Dostęp do najnowszych modeli od OpenAI, Anthropic, Google, Meta i innych
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {[
                { name: 'GPT-5.2', provider: 'OpenAI', tier: 'pro' },
                { name: 'Claude Opus 4.5', provider: 'Anthropic', tier: 'premium' },
                { name: 'Gemini 2.5 Pro', provider: 'Google', tier: 'pro' },
                { name: 'Gemini Flash-Lite', provider: 'Google', tier: 'free' },
                { name: 'Llama 3.3 8B', provider: 'Meta', tier: 'free' },
                { name: 'DeepSeek V3', provider: 'DeepSeek', tier: 'free' },
                { name: 'DeepSeek R1', provider: 'DeepSeek', tier: 'reasoning' },
                { name: 'Grok 4', provider: 'xAI', tier: 'premium' },
                { name: 'Mistral Large', provider: 'Mistral', tier: 'pro' },
                { name: 'Qwen 2.5 72B', provider: 'Alibaba', tier: 'free' },
              ].map((model, idx) => (
                <div
                  key={idx}
                  className="bg-gray-800/50 border border-gray-700/50 rounded-xl p-4 text-center hover:border-gray-600 transition"
                >
                  <div className="font-medium text-white text-sm mb-1">{model.name}</div>
                  <div className="text-xs text-gray-500 mb-2">{model.provider}</div>
                  <span
                    className={`
                      text-[10px] px-2 py-0.5 rounded-full font-medium
                      ${model.tier === 'free' ? 'bg-green-500/20 text-green-400' : ''}
                      ${model.tier === 'pro' ? 'bg-purple-500/20 text-purple-400' : ''}
                      ${model.tier === 'premium' ? 'bg-amber-500/20 text-amber-400' : ''}
                      ${model.tier === 'reasoning' ? 'bg-cyan-500/20 text-cyan-400' : ''}
                    `}
                  >
                    {model.tier === 'free' ? 'DARMOWY' : model.tier.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <p className="text-gray-500 text-sm">
                ...i wiele więcej! Łącznie ponad 20 modeli AI do wyboru.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-4xl mx-auto px-6 py-20 text-center">
          <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/20 rounded-3xl p-12">
            <FaComments className="w-16 h-16 mx-auto mb-6 text-purple-400" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Gotowy na rozmowę z AI?
            </h2>
            <p className="text-gray-400 mb-8 max-w-lg mx-auto">
              Załóż darmowe konto i zacznij rozmawiać z najlepszymi modelami AI.
              Bez zobowiązań, bez abonamentu - płacisz tylko za to, co wykorzystasz.
            </p>
            <Link
              href="/auth/signin"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-lg transition-all"
            >
              <HiSparkles className="w-5 h-5" />
              Rozpocznij za darmo
            </Link>
          </div>
        </section>
      </div>
    );
  }

  // Authenticated - show chat interface
  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <ChatWindow />
    </div>
  );
}
