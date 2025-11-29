'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import ToolsLayout from '@/components/ToolsLayout';
import Link from 'next/link';
import { AI_MODELS, MODEL_CATEGORIES, type ModelCategory } from '@/lib/ai-image/models';
import { IMAGE_STYLES } from '@/lib/ai-image/styles';

// Lazy load heavy components
const AIImageGenerator = dynamic(
  () => import('@/components/ai-image/AIImageGenerator'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    ),
    ssr: false,
  }
);

// Stats component
function AnimatedStat({ value, label, suffix = '' }: { value: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold text-white">
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  );
}

export default function AIImagePage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'explore' | 'my-creations'>('explore');
  const [selectedCategory, setSelectedCategory] = useState<ModelCategory>('featured');
  const generatorRef = useRef<HTMLDivElement>(null);

  const featuredStyles = IMAGE_STYLES.filter(s => s.id !== 'none').slice(0, 8);

  // Get models for selected category
  const modelsForCategory = AI_MODELS.filter(m => m.category === selectedCategory);

  // Function to scroll to generator
  const scrollToGenerator = useCallback(() => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        scrollToGenerator();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scrollToGenerator]);

  return (
    <ToolsLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-purple-300">Powered by 14+ Premium AI Models</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-white">Create </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                Stunning Images
              </span>
              <br />
              <span className="text-white">with AI</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Transform your imagination into reality. Professional-grade AI image generation
              with the world&apos;s most advanced models.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={scrollToGenerator}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-lg transition shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2"
              >
                <span>Start Creating</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
              <a
                href="#gallery"
                className="w-full sm:w-auto px-8 py-4 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl font-semibold text-lg transition flex items-center justify-center gap-2"
              >
                <span>Explore Gallery</span>
                <span>→</span>
              </a>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <AnimatedStat value={14} label="AI Models" suffix="+" />
              <AnimatedStat value={20} label="Art Styles" suffix="+" />
              <AnimatedStat value={5000} label="Images Created" suffix="+" />
            </div>
          </div>
        </div>
      </section>

      {/* Generator Section */}
      <section ref={generatorRef} className="max-w-7xl mx-auto px-6 py-12">
        <AIImageGenerator />
      </section>

      {/* Gallery Section - Moved above Models */}
      <section id="gallery" className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Community </span>
            <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Gallery</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Discover amazing creations from our community. Get inspired and create your own masterpieces.
          </p>
        </div>

        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex-1 py-4 px-6 text-center font-medium transition flex items-center justify-center gap-2 ${
                activeTab === 'explore'
                  ? 'bg-gray-700/50 text-white border-b-2 border-cyan-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <span>🌍</span>
              Explore
            </button>
            <button
              onClick={() => setActiveTab('my-creations')}
              className={`flex-1 py-4 px-6 text-center font-medium transition flex items-center justify-center gap-2 ${
                activeTab === 'my-creations'
                  ? 'bg-gray-700/50 text-white border-b-2 border-cyan-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
              }`}
            >
              <span>🎨</span>
              My Creations
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'explore' && <ExploreGallery />}
            {activeTab === 'my-creations' && (
              session ? (
                <ExploreGallery showMyCreations />
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <span className="text-4xl">🔒</span>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Sign in to see your creations</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Create an account to save, manage, and share your AI-generated masterpieces
                  </p>
                  <Link
                    href="/auth/signin"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg font-medium transition"
                  >
                    Sign In to Continue
                  </Link>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Models Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Premium </span>
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">AI Models</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Access the world&apos;s most advanced image generation models. From ultra-fast to ultra-quality.
          </p>
        </div>

        {/* Model Categories - Interactive */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {MODEL_CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full flex items-center gap-2 text-sm transition ${
                selectedCategory === cat.id
                  ? 'bg-purple-600 text-white border border-purple-500'
                  : 'bg-gray-800/50 border border-gray-700 text-gray-300 hover:border-purple-500/50 hover:text-white'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
              <span className={`px-1.5 py-0.5 rounded text-xs ${
                selectedCategory === cat.id ? 'bg-purple-500/50' : 'bg-gray-700'
              }`}>
                {AI_MODELS.filter(m => m.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>

        {/* Models Grid for selected category */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modelsForCategory.map(model => (
            <div
              key={model.id}
              onClick={scrollToGenerator}
              className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 hover:border-purple-500/50 transition cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white group-hover:text-purple-400 transition">{model.name}</h3>
                    {model.isNew && (
                      <span className="px-1.5 py-0.5 bg-green-600/30 text-green-400 text-[10px] font-semibold rounded">NEW</span>
                    )}
                    {model.isPopular && (
                      <span className="px-1.5 py-0.5 bg-amber-600/30 text-amber-400 text-[10px] font-semibold rounded">HOT</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-purple-400 font-semibold">{model.credits}</div>
                  <div className="text-xs text-gray-500">credits</div>
                </div>
              </div>
              <p className="text-sm text-gray-400 mb-3 line-clamp-2">{model.description}</p>
              <div className="flex flex-wrap gap-1.5">
                {model.features.slice(0, 3).map((feature, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-purple-600/20 text-purple-400 text-xs rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            onClick={scrollToGenerator}
            className="px-6 py-3 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 rounded-lg text-purple-400 hover:text-purple-300 font-medium transition flex items-center gap-2 mx-auto"
          >
            Try all {AI_MODELS.length} models
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Styles Showcase */}
      <section className="bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">20+ </span>
              <span className="bg-gradient-to-r from-orange-400 to-pink-400 bg-clip-text text-transparent">Art Styles</span>
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From photorealistic to anime, cinematic to pixel art. One click to transform your vision.
            </p>
          </div>

          {/* Styles Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {featuredStyles.map(style => (
              <div
                key={style.id}
                onClick={scrollToGenerator}
                className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center hover:border-orange-500/50 hover:bg-gray-800 transition cursor-pointer group"
              >
                <div className="text-3xl mb-2 group-hover:scale-110 transition">{style.icon}</div>
                <div className="text-sm font-medium text-white">{style.name}</div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={scrollToGenerator}
              className="px-6 py-3 bg-orange-600/20 hover:bg-orange-600/30 border border-orange-500/50 rounded-lg text-orange-400 hover:text-orange-300 font-medium transition flex items-center gap-2 mx-auto"
            >
              Explore all {IMAGE_STYLES.length - 1} styles
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Why Choose Pixelift AI?
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Professional tools, creative freedom, stunning results.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: '⚡',
              title: 'Ultra-Fast Generation',
              description: 'Get your images in seconds with our optimized infrastructure and fast models.',
              gradient: 'from-yellow-500/20 to-orange-500/20',
            },
            {
              icon: '🎨',
              title: 'Multiple AI Models',
              description: 'Choose from 14+ premium models including FLUX, Ideogram, Recraft, and more.',
              gradient: 'from-purple-500/20 to-pink-500/20',
            },
            {
              icon: '✨',
              title: 'Smart Prompt Enhancement',
              description: 'AI-powered prompt optimization to get the best results from any description.',
              gradient: 'from-blue-500/20 to-cyan-500/20',
            },
            {
              icon: '🖼️',
              title: 'Image-to-Image',
              description: 'Transform existing images with AI. Edit, stylize, and reimagine any photo.',
              gradient: 'from-green-500/20 to-emerald-500/20',
            },
            {
              icon: '📐',
              title: 'Flexible Aspect Ratios',
              description: 'Generate images in any format: square, portrait, landscape, and more.',
              gradient: 'from-indigo-500/20 to-purple-500/20',
            },
            {
              icon: '🌐',
              title: 'Community Gallery',
              description: 'Share your creations and get inspired by the Pixelift community.',
              gradient: 'from-pink-500/20 to-rose-500/20',
            },
          ].map((feature, idx) => (
            <div
              key={idx}
              className={`bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border border-gray-700 rounded-2xl p-6 hover:border-gray-600 transition`}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Teaser */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Start Creating Today
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Get 3 free credits when you sign up. No credit card required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            {session ? (
              <button
                onClick={scrollToGenerator}
                className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold text-lg transition"
              >
                Start Generating
              </button>
            ) : (
              <>
                <Link
                  href="/auth/signin"
                  className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold text-lg transition"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/pricing"
                  className="px-8 py-4 bg-transparent border border-white/30 hover:bg-white/10 rounded-xl font-semibold text-lg transition"
                >
                  View Pricing
                </Link>
              </>
            )}
          </div>

          {/* Credit Packages Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {[
              { credits: 50, price: '$4.99' },
              { credits: 150, price: '$9.99', popular: true },
              { credits: 500, price: '$24.99' },
              { credits: 1500, price: '$49.99' },
            ].map((pkg, idx) => (
              <Link
                key={idx}
                href="/pricing"
                className={`rounded-xl p-4 transition hover:scale-105 ${
                  pkg.popular
                    ? 'bg-white/20 border-2 border-white/40'
                    : 'bg-white/10 border border-white/20 hover:border-white/40'
                }`}
              >
                {pkg.popular && (
                  <div className="text-xs text-white font-semibold mb-1">POPULAR</div>
                )}
                <div className="text-2xl font-bold text-white">{pkg.credits}</div>
                <div className="text-sm text-gray-300">credits</div>
                <div className="text-lg font-semibold text-white mt-1">{pkg.price}</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'What AI models are available?',
              a: 'We offer 14+ premium models including FLUX Pro, Recraft V3, Ideogram V3, Stable Diffusion 3.5, HiDream, Seedream, and more. Each model has unique strengths for different use cases.',
            },
            {
              q: 'How do credits work?',
              a: 'Credits are used to generate images. Different models cost different amounts (1-4 credits per image). New users get 3 free credits to start. You can purchase more credits anytime.',
            },
            {
              q: 'Can I use the images commercially?',
              a: 'Yes! Images you generate are yours to use. Check specific model terms for any restrictions. Most models allow full commercial use.',
            },
            {
              q: 'What is Image-to-Image mode?',
              a: 'Upload an existing image and describe how you want to transform it. Great for style transfer, editing, and variations.',
            },
            {
              q: 'How do styles work?',
              a: 'Styles are pre-configured settings that modify your prompt to achieve specific looks (e.g., Anime, Photorealistic, Cinematic). Select a style before generating.',
            },
          ].map((faq, idx) => (
            <details
              key={idx}
              className="bg-gray-800/50 border border-gray-700 rounded-xl group"
            >
              <summary className="flex items-center justify-between p-5 cursor-pointer text-white font-medium hover:text-purple-400 transition">
                {faq.q}
                <svg
                  className="w-5 h-5 text-gray-400 group-open:rotate-180 transition"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="px-5 pb-5 text-gray-400">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Create?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of creators using Pixelift AI
          </p>
          <button
            onClick={scrollToGenerator}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-lg transition shadow-lg shadow-purple-500/25"
          >
            Start Creating Now
          </button>
        </div>
      </section>
    </ToolsLayout>
  );
}
