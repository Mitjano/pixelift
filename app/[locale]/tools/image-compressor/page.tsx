'use client';

import dynamic from 'next/dynamic';
import { useSession } from 'next-auth/react';
import ToolsLayout from '@/components/ToolsLayout';
import Link from 'next/link';

// Lazy load heavy component
const ImageCompressor = dynamic(
  () => import('@/components/ImageCompressor'),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    ),
    ssr: false,
  }
);

export default function ImageCompressorPage() {
  const { data: session } = useSession();

  return (
    <ToolsLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-8 pb-12">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />

          <div className="relative text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-blue-300">Powered by Sharp AI</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                AI Image Compressor
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-8">
              Reduce file size while maintaining high quality with smart compression.
              Perfect for web optimization, email attachments, and storage savings.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">Up to 80%</div>
                <div className="text-sm text-gray-500">Size Reduction</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-400">~3s</div>
                <div className="text-sm text-gray-500">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">1 Credit</div>
                <div className="text-sm text-gray-500">Per Compression</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tool Section */}
        <section className="px-6 mb-12">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <ImageCompressor />
            <p className="text-sm text-gray-500 mt-4 text-center">
              By uploading a file you agree to our Terms of Use and Privacy Policy.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-700/30 p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Compression</h3>
              <p className="text-sm text-gray-400">
                AI-powered compression reduces file size by up to 80% while preserving visual quality.
              </p>
            </div>
            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-700/30 p-6">
              <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Lightning Fast</h3>
              <p className="text-sm text-gray-400">
                Process images in seconds with our optimized compression pipeline.
              </p>
            </div>
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-700/30 p-6">
              <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Multiple Formats</h3>
              <p className="text-sm text-gray-400">
                Support for JPG, PNG, and WebP with automatic format selection.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 mb-16">
          <div className="bg-gray-800/30 rounded-2xl border border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-8 text-center">How Smart Compression Works</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3 text-blue-400">Advanced Technology</h3>
                <p className="text-gray-400 mb-4">
                  Our compressor uses Sharp's advanced image processing algorithms combined with
                  format-specific optimizations. Unlike basic compression that just reduces quality,
                  our AI-powered system intelligently removes unnecessary data while preserving
                  visual quality.
                </p>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Removes metadata and unnecessary information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Optimizes color palettes and encoding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>Progressive loading for better web performance</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3 text-cyan-400">Perfect For</h3>
                <div className="space-y-3 text-gray-400">
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <strong className="text-white">🌐 Websites:</strong> Reduce page load times
                    and improve SEO
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <strong className="text-white">📱 Mobile Apps:</strong> Save bandwidth and
                    storage space
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <strong className="text-white">📧 Email:</strong> Attach more images without
                    size limits
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-3">
                    <strong className="text-white">☁️ Cloud Storage:</strong> Store more images
                    in less space
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Details */}
        <section className="px-6 mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-xl border border-blue-700/50 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>⚙️</span> Compression Settings
              </h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <div>
                  <strong className="text-white">Quality Control:</strong> Adjust from 10% to 100%
                  to balance file size vs quality
                </div>
                <div>
                  <strong className="text-white">Auto Format:</strong> Automatically selects the
                  best format for your image
                </div>
                <div>
                  <strong className="text-white">JPG:</strong> Best for photos and complex images
                  with many colors
                </div>
                <div>
                  <strong className="text-white">PNG:</strong> Best for graphics with transparency
                  or sharp edges
                </div>
                <div>
                  <strong className="text-white">WebP:</strong> Modern format with superior
                  compression for web
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-xl border border-cyan-700/50 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>📋</span> Supported Formats
              </h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <div>
                  <strong className="text-white">Input:</strong> JPG, PNG, WebP - up to 20MB per image
                </div>
                <div>
                  <strong className="text-white">Output:</strong> Choose between JPG, PNG, or WebP
                </div>
                <div>
                  <strong className="text-white">Compression:</strong> Reduce file size by 30-80%
                  depending on settings
                </div>
                <div>
                  <strong className="text-white">Processing:</strong> Each compression costs 1 credit,
                  processed in 2-5 seconds
                </div>
                <div>
                  <strong className="text-white">Download:</strong> Get instant download of compressed
                  image
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section className="px-6 mb-16">
          <div className="bg-gray-800/30 rounded-2xl border border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-6">Tips for Best Results</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-blue-400 mb-3">Recommended</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    Start with 80% quality for a good balance
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    Use auto format for best compression ratio
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    JPG works best for photos and complex images
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    PNG is better for graphics with transparency
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    WebP offers best compression for modern browsers
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-cyan-400 mb-3">Keep in Mind</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    Lower quality = smaller file but visible artifacts
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    Already compressed images won't reduce much more
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    Test different quality settings for your use case
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    Keep original files as backup before compressing
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-0.5">⚠</span>
                    Compression is permanent - cannot be reversed
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 pb-12">
          <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-2xl border border-blue-700/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Optimize Your Images?</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Reduce file sizes dramatically while maintaining visual quality. Perfect for web and mobile.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/pricing"
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-semibold transition"
              >
                Get Credits
              </Link>
              <Link
                href="/tools"
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition"
              >
                Explore All Tools
              </Link>
            </div>
          </div>
        </section>
      </div>
    </ToolsLayout>
  );
}
