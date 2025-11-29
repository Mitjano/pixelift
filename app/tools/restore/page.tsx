'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ToolsLayout from '@/components/ToolsLayout';

// Lazy load heavy component
const ImageDenoiser = dynamic(
  () => import('@/components/ImageDenoiser'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function RestorePage() {
  const { data: session } = useSession();
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          if (data.credits !== undefined) setCredits(data.credits);
        })
        .catch(err => console.error('Error fetching user data:', err));
    }
  }, [session]);

  return (
    <ToolsLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600/20 border border-cyan-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-cyan-300">Powered by SwinIR AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">AI </span>
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Image Restoration
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Remove noise, grain, and compression artifacts with SwinIR AI technology.
              Restore old photos and improve image quality instantly.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">3</div>
                <div className="text-gray-400 text-sm mt-1">Restore Modes</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">10s</div>
                <div className="text-gray-400 text-sm mt-1">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">1</div>
                <div className="text-gray-400 text-sm mt-1">Credit/Image</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <ImageDenoiser />
          <p className="text-sm text-gray-500 mt-4 text-center">
            By uploading a file you agree to our Terms of Use and Privacy Policy.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔇',
              title: 'Noise Removal',
              description: 'Remove grain and noise from high ISO photos while preserving detail.',
              gradient: 'from-cyan-500/20 to-blue-500/20',
            },
            {
              icon: '📦',
              title: 'JPEG Artifact Removal',
              description: 'Clean up compression artifacts and restore smooth gradients.',
              gradient: 'from-blue-500/20 to-indigo-500/20',
            },
            {
              icon: '✨',
              title: 'Super Resolution',
              description: 'Enhance and upscale images with intelligent detail reconstruction.',
              gradient: 'from-indigo-500/20 to-purple-500/20',
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

      {/* How It Works */}
      <section className="bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">How AI </span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Restoration Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-cyan-400">SwinIR Technology</h3>
              <p className="text-gray-400 mb-4">
                SwinIR uses advanced transformer architecture to understand image structure and
                intelligently restore quality. Unlike simple filters, it understands context and
                preserves important details while removing unwanted artifacts.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Preserves fine details and textures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Removes noise without over-smoothing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>State-of-the-art image restoration results</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Restoration Modes</h3>
              <div className="space-y-3 text-gray-400">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <strong className="text-white">Super Resolution:</strong> General image enhancement
                  that improves overall quality and clarity
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <strong className="text-white">Denoise:</strong> Remove noise and grain from photos
                  taken in low light or high ISO
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <strong className="text-white">JPEG Artifact Removal:</strong> Clean up blocky
                  artifacts from JPEG compression
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Use Cases
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '📷',
              title: 'Low Light Photos',
              description: 'Fix grainy photos taken in dark conditions or with high ISO settings.',
              detail: 'Use: Denoise mode',
            },
            {
              icon: '🌐',
              title: 'Web Images',
              description: 'Restore quality to heavily compressed images downloaded from the web.',
              detail: 'Use: JPEG Artifact Removal mode',
            },
            {
              icon: '📸',
              title: 'Old Digital Photos',
              description: 'Enhance photos from older cameras and early smartphone photos.',
              detail: 'Use: Super Resolution mode',
            },
          ].map((useCase, idx) => (
            <div key={idx} className="bg-gray-800/30 rounded-xl border border-gray-700 p-6 hover:border-cyan-500/50 transition">
              <div className="text-3xl mb-3">{useCase.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">{useCase.title}</h3>
              <p className="text-sm text-gray-400 mb-3">{useCase.description}</p>
              <div className="text-xs text-gray-500">{useCase.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Tips Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gray-800/20 rounded-xl border border-gray-700 p-8">
          <h2 className="text-2xl font-bold mb-6">💡 Tips for Best Results</h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-400">
            <div>
              <h4 className="font-semibold text-white mb-2">✓ Choosing the Right Mode:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Grainy/noisy photos - use Denoise</li>
                <li>• Blocky JPEG artifacts - use JPEG Artifact Removal</li>
                <li>• General quality improvement - use Super Resolution</li>
                <li>• Try multiple modes for severely degraded images</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">⚡ Pro Tips:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Start with Super Resolution for general improvements</li>
                <li>• Combine restoration with upscaling for old photos</li>
                <li>• Process before colorization for vintage photos</li>
                <li>• Original file formats preserve more detail than screenshots</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-cyan-900/50 to-blue-900/50 border border-cyan-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Restore Your Images?
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8">
            Start with 3 free credits. No credit card required.
          </p>
          {!session ? (
            <Link
              href="/auth/signin"
              className="inline-block px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold text-lg transition"
            >
              Get Started Free
            </Link>
          ) : (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-8 py-4 bg-white text-gray-900 hover:bg-gray-100 rounded-xl font-semibold text-lg transition"
            >
              Start Restoring
            </button>
          )}
        </div>
      </section>
    </ToolsLayout>
  );
}
