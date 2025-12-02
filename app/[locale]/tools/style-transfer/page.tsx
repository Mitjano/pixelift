'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import ToolsLayout from '@/components/ToolsLayout';

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

  return (
    <ToolsLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-pink-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-pink-500/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-pink-600/20 border border-pink-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
              </span>
              <span className="text-pink-300">Powered by FLUX Redux AI</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">AI </span>
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-violet-400 bg-clip-text text-transparent">
                Style Transfer
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Transform your photos into stunning artworks with 10+ artistic styles.
              Anime, Oil Painting, Watercolor, and more - powered by state-of-the-art FLUX AI.
            </p>

            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">10+</div>
                <div className="text-gray-400 text-sm mt-1">Art Styles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">~30s</div>
                <div className="text-gray-400 text-sm mt-1">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">4</div>
                <div className="text-gray-400 text-sm mt-1">Credits/Image</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <StyleTransfer />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-xl font-semibold text-white mb-2">10+ Art Styles</h3>
            <p className="text-gray-400">Anime, Oil Painting, Watercolor, Pencil Sketch, Pop Art, Cyberpunk, Fantasy, Vintage, and more.</p>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/20 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            <div className="text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold text-white mb-2">Custom Prompts</h3>
            <p className="text-gray-400">Add your own style descriptions to create unique artistic interpretations of your photos.</p>
          </div>
          <div className="bg-gradient-to-br from-violet-500/20 to-pink-500/20 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold text-white mb-2">FLUX AI Technology</h3>
            <p className="text-gray-400">Powered by Black Forest Labs FLUX Redux - the most advanced style transfer model available.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-pink-900/50 to-purple-900/50 border border-pink-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Transform Your Photos into Art
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Join thousands of creators using AI to transform their photos into stunning artworks.
          </p>
          {!session ? (
            <Link href="/auth/signin" className="inline-block px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold text-lg transition">
              Get Started Free
            </Link>
          ) : (
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold text-lg transition">
              Start Creating
            </button>
          )}
        </div>
      </section>
    </ToolsLayout>
  );
}
