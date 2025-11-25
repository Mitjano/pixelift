import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Product Packshot Generator - Professional E-commerce Photos | Pixelift',
  description:
    'Generate professional product packshots with AI. Remove backgrounds, add shadows, and resize for Amazon, Allegro, Instagram. Studio-quality results in seconds.',
  keywords: [
    'product packshot',
    'ai packshot generator',
    'product photography',
    'amazon product photos',
    'allegro product images',
    'ecommerce photography',
    'remove background',
    'product images',
    'online store photos',
    'marketplace photos',
    'instagram product photos',
    'professional product photos',
    'ai photo editing',
  ],
  openGraph: {
    title: 'AI Product Packshot Generator - Professional E-commerce Photos',
    description:
      'Transform product photos into professional packshots with AI. Perfect for Amazon, Allegro, and Instagram.',
    type: 'website',
  },
}

export default function PackshotGeneratorLayout({ children }: { children: React.ReactNode }) {
  return children
}
