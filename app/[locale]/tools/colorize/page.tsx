'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ToolsLayout from '@/components/ToolsLayout';

// Lazy load heavy component
const ImageColorizer = dynamic(
  () => import('@/components/ImageColorizer'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function ColorizePage() {
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
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-pink-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-purple-300">Powered by DDColor AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">AI </span>
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                Photo Colorization
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Bring old black &amp; white photos to life with advanced DDColor AI technology.
              Transform vintage memories into vibrant, colorful images.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">AI</div>
                <div className="text-gray-400 text-sm mt-1">Natural Colors</div>
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
          <ImageColorizer />
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
              icon: '🎨',
              title: 'Natural Colors',
              description: 'DDColor AI produces realistic, natural-looking colors that bring photos to life.',
              gradient: 'from-purple-500/20 to-pink-500/20',
            },
            {
              icon: '📸',
              title: 'Historical Photos',
              description: 'Perfect for restoring old family photos, vintage portraits, and historical images.',
              gradient: 'from-blue-500/20 to-cyan-500/20',
            },
            {
              icon: '⚡',
              title: 'Fast Processing',
              description: 'Get colorized results in seconds with our optimized AI pipeline.',
              gradient: 'from-yellow-500/20 to-orange-500/20',
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
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Colorization Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-purple-400">DDColor Technology</h3>
              <p className="text-gray-400 mb-4">
                Our colorization uses DDColor, a state-of-the-art deep learning model that understands
                the semantic content of images to apply appropriate colors. It recognizes objects, skin
                tones, sky, vegetation, and more to create natural-looking results.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Understands scene context for accurate colorization</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Preserves fine details and textures</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Works with portraits, landscapes, and historical photos</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-pink-400">Perfect For</h3>
              <div className="space-y-3 text-gray-400">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <strong className="text-white">📷 Family Archives:</strong> Colorize old family photos
                  and bring memories to life
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <strong className="text-white">🏛️ Historical Images:</strong> Add color to historical
                  photographs and documents
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <strong className="text-white">🎬 Film Restoration:</strong> Colorize frames from
                  classic black &amp; white films
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <strong className="text-white">🎨 Creative Projects:</strong> Use colorization for
                  artistic and design work
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gray-800/20 rounded-xl border border-gray-700 p-8">
          <h2 className="text-2xl font-bold mb-6">💡 Tips for Best Results</h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-400">
            <div>
              <h4 className="font-semibold text-white mb-2">✓ Best Practices:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Use high-resolution scans of original photos</li>
                <li>• Ensure the image is in focus and well-exposed</li>
                <li>• Clean up scratches and damage before colorizing</li>
                <li>• Works best with clear subject definition</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">⚡ Pro Tips:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Portraits typically colorize better than complex scenes</li>
                <li>• Outdoor photos with sky and vegetation work great</li>
                <li>• Multiple processing can sometimes improve results</li>
                <li>• Combine with upscaling for best quality restoration</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 border border-purple-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Colorize Your Photos?
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
              Start Colorizing
            </button>
          )}
        </div>
      </section>
    </ToolsLayout>
  );
}
