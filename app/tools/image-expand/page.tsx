'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ToolsLayout from '@/components/ToolsLayout';

// Lazy load heavy component
const ImageExpander = dynamic(
  () => import('@/components/ImageExpander').then((mod) => ({ default: mod.ImageExpander })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function ImageExpandPage() {
  const { data: session } = useSession();
  const [userRole, setUserRole] = useState<'user' | 'premium' | 'admin'>('user');
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user')
        .then((res) => res.json())
        .then((data) => {
          if (data.role) setUserRole(data.role);
          if (data.credits !== undefined) setCredits(data.credits);
        })
        .catch((err) => console.error('Error fetching user data:', err));
    }
  }, [session]);

  return (
    <ToolsLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-purple-300">Powered by FLUX.1 Fill [pro] AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">AI </span>
              <span className="bg-gradient-to-r from-purple-400 via-indigo-400 to-violet-400 bg-clip-text text-transparent">
                Image Expand (Uncrop)
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Extend your images beyond their original borders with AI.
              Perfect for changing aspect ratios and creating panoramic views.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">2x</div>
                <div className="text-gray-400 text-sm mt-1">Max Zoom Out</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">15s</div>
                <div className="text-gray-400 text-sm mt-1">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">2</div>
                <div className="text-gray-400 text-sm mt-1">Credits/Image</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tool Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
          <ImageExpander userRole={userRole} />
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
              icon: '🔍',
              title: 'Zoom Out',
              description: 'Expand your canvas by 1.5x or 2x. AI generates natural continuation of your image.',
              gradient: 'from-purple-500/20 to-indigo-500/20',
            },
            {
              icon: '⬜',
              title: 'Make Square',
              description: 'Convert any aspect ratio to perfect square. Ideal for Instagram posts.',
              gradient: 'from-blue-500/20 to-cyan-500/20',
            },
            {
              icon: '↔️',
              title: 'Directional Expand',
              description: 'Extend your image in any direction - left, right, up, or down.',
              gradient: 'from-green-500/20 to-emerald-500/20',
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
              <span className="text-white">How Image </span>
              <span className="bg-gradient-to-r from-purple-400 to-indigo-400 bg-clip-text text-transparent">Expansion Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div className="bg-gray-800/30 rounded-xl p-6">
              <div className="text-4xl mb-3">📤</div>
              <h4 className="font-semibold mb-2 text-white">1. Upload</h4>
              <p className="text-sm text-gray-400">Upload your image (JPG, PNG, WEBP)</p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6">
              <div className="text-4xl mb-3">🎯</div>
              <h4 className="font-semibold mb-2 text-white">2. Choose Mode</h4>
              <p className="text-sm text-gray-400">Select zoom out, square, or directional expand</p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6">
              <div className="text-4xl mb-3">🤖</div>
              <h4 className="font-semibold mb-2 text-white">3. AI Generates</h4>
              <p className="text-sm text-gray-400">FLUX.1 Fill [pro] creates natural continuation</p>
            </div>
            <div className="bg-gray-800/30 rounded-xl p-6">
              <div className="text-4xl mb-3">💾</div>
              <h4 className="font-semibold mb-2 text-white">4. Download</h4>
              <p className="text-sm text-gray-400">Get your expanded image in high quality</p>
            </div>
          </div>
        </div>
      </section>

      {/* Expand Options */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-purple-900/20 to-indigo-900/20 rounded-xl border border-purple-700/50 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🎨</span> Expand Modes
            </h3>
            <div className="space-y-3 text-gray-300">
              <div>
                <strong className="text-white">Zoom Out 1.5x:</strong> Expand canvas by 50%, revealing more of the scene
              </div>
              <div>
                <strong className="text-white">Zoom Out 2x:</strong> Double the canvas size for dramatic reveals
              </div>
              <div>
                <strong className="text-white">Make Square:</strong> Convert 16:9, 4:3, or any ratio to 1:1
              </div>
              <div>
                <strong className="text-white">Directional:</strong> Extend specifically left, right, up, or down
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 rounded-xl border border-indigo-700/50 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>✨</span> Features
            </h3>
            <div className="space-y-3 text-gray-300">
              <div>
                <strong className="text-white">FLUX.1 Fill [pro]:</strong> State-of-the-art AI model from Black Forest Labs
              </div>
              <div>
                <strong className="text-white">Custom Prompts:</strong> Guide AI on what to generate in expanded areas
              </div>
              <div>
                <strong className="text-white">High Quality:</strong> Maintains original image quality and style
              </div>
              <div>
                <strong className="text-white">Fast Processing:</strong> Results in 10-20 seconds, only 2 credits
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Perfect For
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '📱',
              title: 'Social Media',
              description: 'Convert landscape photos to square for Instagram, or expand vertical videos for YouTube.',
              detail: 'Change aspect ratios without cropping',
            },
            {
              icon: '🛍️',
              title: 'E-commerce',
              description: 'Add space around products for better composition. Create room for text overlays.',
              detail: 'Professional product presentations',
            },
            {
              icon: '🎬',
              title: 'Content Creators',
              description: 'Extend backgrounds for video thumbnails, expand cropped photos, create panoramic effects.',
              detail: 'More creative possibilities',
            },
          ].map((useCase, idx) => (
            <div key={idx} className="bg-gray-800/30 rounded-xl border border-gray-700 p-6 hover:border-purple-500/50 transition">
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
              <h4 className="font-semibold text-white mb-2">✓ Best Practices:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Use high-quality source images for better expansion</li>
                <li>• Simple backgrounds (sky, grass, walls) expand best</li>
                <li>• Add custom prompts for specific content in expanded areas</li>
                <li>• Zoom Out 1.5x is safest for most images</li>
                <li>• Make Square works great for portrait/landscape conversion</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">⚡ Pro Tips:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Use directional expand to reposition subjects</li>
                <li>• Describe the scene in your prompt for better results</li>
                <li>• Works best with photos, landscapes, and products</li>
                <li>• Complex patterns may require multiple attempts</li>
                <li>• 2 credits per expansion, results in 10-20 seconds</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 border border-purple-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Expand Your Images?
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
              Start Expanding
            </button>
          )}
        </div>
      </section>
    </ToolsLayout>
  );
}
