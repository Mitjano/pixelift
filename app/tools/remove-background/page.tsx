'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ToolsLayout from '@/components/ToolsLayout';

// Lazy load heavy components
const BackgroundRemover = dynamic(
  () => import('@/components/BackgroundRemover').then((mod) => ({ default: mod.BackgroundRemover })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    ),
    ssr: false,
  }
);

const ProcessedImagesGallery = dynamic(
  () => import('@/components/ProcessedImagesGallery').then((mod) => ({ default: mod.ProcessedImagesGallery })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="animate-pulse text-gray-400">Loading gallery...</div>
      </div>
    ),
    ssr: false,
  }
);

export default function RemoveBackgroundPage() {
  const { data: session, status } = useSession();
  const [userRole, setUserRole] = useState<'user' | 'premium' | 'admin'>('user');
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user')
        .then(res => res.json())
        .then(data => {
          if (data.role) setUserRole(data.role);
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
        <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
        <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-20">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-blue-300">Powered by BRIA RMBG 2.0 AI</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="text-white">AI </span>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
                Background Remover
              </span>
            </h1>

            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
              Remove backgrounds from images instantly with advanced AI technology.
              Perfect for product photos, portraits, and e-commerce.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-lg mx-auto">
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">5s</div>
                <div className="text-gray-400 text-sm mt-1">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white">256</div>
                <div className="text-gray-400 text-sm mt-1">Alpha Levels</div>
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
          <BackgroundRemover userRole={userRole} />
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
              icon: '⚡',
              title: 'Lightning Fast',
              description: 'Remove backgrounds in 5-10 seconds with our optimized BRIA RMBG 2.0 AI model.',
              gradient: 'from-yellow-500/20 to-orange-500/20',
            },
            {
              icon: '🎯',
              title: 'Precise Edge Detection',
              description: 'Advanced AI with 256 levels of transparency for perfect cutouts and natural edges.',
              gradient: 'from-blue-500/20 to-cyan-500/20',
            },
            {
              icon: '🔒',
              title: 'Secure & Private',
              description: 'Your images are processed securely and automatically deleted after 24 hours.',
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

      {/* Gallery Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="text-white">Your </span>
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Processed Images</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Recent images with removed backgrounds. Available for 24 hours.
          </p>
        </div>

        <div className="bg-gray-800/30 rounded-xl border border-gray-700 overflow-hidden p-6">
          <ProcessedImagesGallery userRole={userRole} />
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-white">How It </span>
              <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Works</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-blue-400">BRIA RMBG 2.0 Technology</h3>
              <p className="text-gray-400 mb-4">
                Our background remover uses BRIA RMBG 2.0, an advanced AI model specifically trained for
                background removal. It analyzes each pixel to determine which parts belong to the foreground
                subject and which are background, creating perfect cutouts with natural edges.
              </p>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>256 levels of alpha transparency for smooth, natural edges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Handles complex subjects like hair, fur, and fine details</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">✓</span>
                  <span>Works with any type of background - solid, gradient, or complex</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-3 text-cyan-400">Perfect For</h3>
              <div className="space-y-3 text-gray-400">
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <strong className="text-white">🛍️ E-commerce:</strong> Create professional product photos
                  with white or transparent backgrounds
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <strong className="text-white">📱 Social Media:</strong> Stand out with clean profile
                  pictures and engaging posts
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <strong className="text-white">🎨 Graphic Design:</strong> Isolate subjects for
                  compositions, presentations, and marketing materials
                </div>
                <div className="bg-gray-800/50 rounded-lg p-3">
                  <strong className="text-white">💼 Professional:</strong> Create polished headshots
                  and portfolio images
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
            Popular Use Cases
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: '🛒',
              title: 'E-commerce Products',
              description: 'Create consistent, professional product images for your online store.',
              detail: 'Perfect for: Shopify, Amazon, eBay, Etsy',
            },
            {
              icon: '📸',
              title: 'Profile Pictures',
              description: 'Create professional headshots for LinkedIn, resumes, and business cards.',
              detail: 'Perfect for: LinkedIn, CV, business profiles',
            },
            {
              icon: '🎨',
              title: 'Design Projects',
              description: 'Isolate subjects for graphic design, create collages, or combine elements.',
              detail: 'Perfect for: Photoshop, Canva, presentations',
            },
            {
              icon: '📱',
              title: 'Social Media Content',
              description: 'Create eye-catching posts, stories, and ads that stand out.',
              detail: 'Perfect for: Instagram, Facebook, TikTok',
            },
            {
              icon: '🏠',
              title: 'Real Estate',
              description: 'Enhance property photos and create clean marketing materials.',
              detail: 'Perfect for: Listings, brochures, staging',
            },
            {
              icon: '💍',
              title: 'Wedding & Events',
              description: 'Isolate subjects from event photos for invitations and prints.',
              detail: 'Perfect for: Invitations, albums, prints',
            },
          ].map((useCase, idx) => (
            <div key={idx} className="bg-gray-800/30 rounded-xl border border-gray-700 p-6 hover:border-blue-500/50 transition">
              <div className="text-3xl mb-3">{useCase.icon}</div>
              <h3 className="text-lg font-semibold mb-2 text-white">{useCase.title}</h3>
              <p className="text-sm text-gray-400 mb-3">{useCase.description}</p>
              <div className="text-xs text-gray-500">{useCase.detail}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Download Options & Formats */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-700/50 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>🎯</span> Download Options
            </h3>
            <div className="space-y-3 text-gray-300">
              <div>
                <strong className="text-white">Low Resolution (512px):</strong> Perfect for web use,
                social media, and quick previews - available for free users
              </div>
              <div>
                <strong className="text-white">Medium Resolution (1024px):</strong> Great balance for
                most professional uses - Premium only
              </div>
              <div>
                <strong className="text-white">High Resolution (2048px):</strong> Excellent for printing
                and large displays - Premium only
              </div>
              <div>
                <strong className="text-white">Original Resolution:</strong> Keep the exact dimensions
                of your input image - Premium only
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-700/50 p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span>📋</span> Format & Quality
            </h3>
            <div className="space-y-3 text-gray-300">
              <div>
                <strong className="text-white">PNG Format:</strong> Transparent background, perfect for
                overlays and web graphics - available for all users
              </div>
              <div>
                <strong className="text-white">JPG Format:</strong> White background, smaller file size,
                great for e-commerce - Premium only
              </div>
              <div>
                <strong className="text-white">Processing Time:</strong> Most images processed in 5-10
                seconds with enterprise-grade servers
              </div>
              <div>
                <strong className="text-white">Credit Cost:</strong> 1 credit per image removal, includes
                unlimited downloads in 24 hours
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gray-800/20 rounded-xl border border-gray-700 p-8">
          <h2 className="text-2xl font-bold mb-6">💡 Tips for Perfect Background Removal</h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-400">
            <div>
              <h4 className="font-semibold text-white mb-2">✓ Best Practices:</h4>
              <ul className="space-y-2 text-sm">
                <li>• Use well-lit photos with clear subject definition</li>
                <li>• Ensure good contrast between subject and background</li>
                <li>• Take photos with the subject in focus</li>
                <li>• Avoid shadows that blend into the subject</li>
                <li>• Use the highest resolution available for better results</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">⚡ Pro Tips:</h4>
              <ul className="space-y-2 text-sm">
                <li>• For hair and fur, use original resolution (Premium)</li>
                <li>• PNG format preserves transparency for overlays</li>
                <li>• JPG format with white background is great for print</li>
                <li>• Download multiple resolutions for different uses</li>
                <li>• Images remain available for 24 hours after processing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 border border-blue-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
            Ready to Remove Backgrounds?
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
              Start Removing Backgrounds
            </button>
          )}
        </div>
      </section>
    </ToolsLayout>
  );
}
