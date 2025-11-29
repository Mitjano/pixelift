'use client'

import dynamic from 'next/dynamic'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import ToolsLayout from '@/components/ToolsLayout'
import Link from 'next/link'

// Lazy load heavy component
const PackshotGenerator = dynamic(
  () => import('@/components/PackshotGenerator').then((mod) => ({ default: mod.PackshotGenerator })),
  {
    loading: () => (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    ),
    ssr: false,
  }
)

export default function PackshotGeneratorPage() {
  const { data: session } = useSession()
  const [userRole, setUserRole] = useState<'user' | 'premium' | 'admin'>('user')
  const [credits, setCredits] = useState(0)

  useEffect(() => {
    if (session?.user?.email) {
      fetch('/api/user')
        .then((res) => res.json())
        .then((data) => {
          if (data.role) setUserRole(data.role)
          if (data.credits !== undefined) setCredits(data.credits)
        })
        .catch((err) => console.error('Error fetching user data:', err))
    }
  }, [session])

  return (
    <ToolsLayout>
      <div className="max-w-6xl mx-auto">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-8 pb-12">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 via-transparent to-transparent" />
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-green-600/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl" />

          <div className="relative text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-full text-sm mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-green-300">Powered by OpenAI DALL-E 2</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-green-500 bg-clip-text text-transparent">
                AI Product Packshot Generator
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-3xl mx-auto mb-8">
              Transform any product photo into a studio-quality professional packshot with AI.
              Perfect for Amazon, e-commerce, and marketplace listings.
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">2000×2000</div>
                <div className="text-sm text-gray-500">Output Size</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">~15s</div>
                <div className="text-sm text-gray-500">Processing</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">2 Credits</div>
                <div className="text-sm text-gray-500">Per Packshot</div>
              </div>
            </div>

            {credits !== undefined && session && (
              <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-800 rounded-full px-4 py-2">
                <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-sm font-medium text-green-200">{credits} credits remaining</span>
              </div>
            )}
          </div>
        </section>

        {/* Tool Section */}
        <section className="px-6 mb-12">
          <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-6">
            <PackshotGenerator userRole={userRole} />
            <p className="text-sm text-gray-500 mt-4 text-center">
              By uploading a file you agree to our Terms of Use and Privacy Policy.
            </p>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 mb-16">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-700/30 p-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Marketplace Ready</h3>
              <p className="text-sm text-gray-400">
                Generate packshots optimized for Amazon (2000x2000), Allegro (1600x1200), and Instagram (1080x1080).
              </p>
            </div>
            <div className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-xl border border-emerald-700/30 p-6">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Editing</h3>
              <p className="text-sm text-gray-400">
                Intelligent image editing that transforms backgrounds while preserving your product's appearance.
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-700/30 p-6">
              <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💎</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Professional Quality</h3>
              <p className="text-sm text-gray-400">
                Studio-quality results without expensive equipment or photographers. Ready in seconds.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="px-6 mb-16">
          <div className="bg-gray-800/30 rounded-2xl border border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-8 text-center">How AI Packshot Generation Works</h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  <span className="text-2xl">📤</span>
                </div>
                <h4 className="font-semibold mb-2">1. Upload</h4>
                <p className="text-sm text-gray-400">Upload your product photo (even from a phone)</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <span className="text-2xl">✂️</span>
                </div>
                <h4 className="font-semibold mb-2">2. Remove BG</h4>
                <p className="text-sm text-gray-400">AI removes background with precision</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                  <span className="text-2xl">🎨</span>
                </div>
                <h4 className="font-semibold mb-2">3. Add Polish</h4>
                <p className="text-sm text-gray-400">Add background, shadow, crop & resize</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-green-500/20 flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                  <span className="text-2xl">💾</span>
                </div>
                <h4 className="font-semibold mb-2">4. Download</h4>
                <p className="text-sm text-gray-400">Get marketplace-ready packshot</p>
              </div>
            </div>
          </div>
        </section>

        {/* Background Options */}
        <section className="px-6 mb-16">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-700/50 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🎯</span> Background Options
              </h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <div>
                  <strong className="text-white">White Background:</strong> Classic white 2000x2000px, perfect for
                  Amazon listings and product catalogs
                </div>
                <div>
                  <strong className="text-white">Light Gray:</strong> Professional gray background, elegant and clean
                </div>
                <div>
                  <strong className="text-white">Beige:</strong> Warm, natural beige tone for organic products
                </div>
                <div>
                  <strong className="text-white">Light Blue:</strong> Fresh, modern blue background for tech products
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-900/20 to-green-900/20 rounded-xl border border-emerald-700/50 p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>✨</span> Features Included
              </h3>
              <div className="space-y-3 text-gray-300 text-sm">
                <div>
                  <strong className="text-white">AI Technology:</strong> Advanced image editing that understands context and preserves product integrity
                </div>
                <div>
                  <strong className="text-white">Professional Results:</strong> Studio-quality lighting, clean backgrounds, and natural shadows
                </div>
                <div>
                  <strong className="text-white">High-Quality Output:</strong> 2000x2000px resolution, marketplace-ready packshots
                </div>
                <div>
                  <strong className="text-white">Fast & Affordable:</strong> Professional-grade results in 10-20 seconds
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="px-6 mb-16">
          <h2 className="text-2xl font-bold mb-8 text-center">Perfect For</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6 hover:border-green-500/50 transition">
              <div className="text-3xl mb-3">🛍️</div>
              <h3 className="text-lg font-semibold mb-2">E-commerce Sellers</h3>
              <p className="text-sm text-gray-400 mb-3">
                Create consistent product photos for your online store. Amazon, eBay, Shopify - all covered.
              </p>
              <div className="text-xs text-green-400">Save time and money on product photography</div>
            </div>
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6 hover:border-green-500/50 transition">
              <div className="text-3xl mb-3">📦</div>
              <h3 className="text-lg font-semibold mb-2">Dropshippers</h3>
              <p className="text-sm text-gray-400 mb-3">
                Transform supplier photos into professional listings. Stand out from competition.
              </p>
              <div className="text-xs text-green-400">Professional look without photo studio</div>
            </div>
            <div className="bg-gray-800/30 rounded-xl border border-gray-700 p-6 hover:border-green-500/50 transition">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-semibold mb-2">Social Media Marketers</h3>
              <p className="text-sm text-gray-400 mb-3">
                Create eye-catching product posts for Instagram, Facebook. Consistent branding everywhere.
              </p>
              <div className="text-xs text-green-400">Perfect square format for social media</div>
            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="px-6 mb-16">
          <div className="bg-gray-800/30 rounded-2xl border border-gray-700 p-8">
            <h2 className="text-2xl font-bold mb-6">Tips for Best Results</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-green-400 mb-3">Best Practices</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    Use well-lit photos with clear product definition
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    Ensure product is in focus and centered
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    Avoid shadows that blend into the product
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-0.5">✓</span>
                    Higher resolution input = better output quality
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-emerald-400 mb-3">Pro Tips</h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">★</span>
                    White background for Amazon marketplace compliance
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">★</span>
                    Gray background for elegant, professional look
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">★</span>
                    Beige for warm, natural product presentation
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400 mt-0.5">★</span>
                    Works best with single products (not groups)
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 pb-12">
          <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-2xl border border-green-700/30 p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Create Professional Packshots?</h2>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              Transform your product photos into marketplace-ready packshots in seconds. No studio required.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/pricing"
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 rounded-lg font-semibold transition"
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
  )
}
