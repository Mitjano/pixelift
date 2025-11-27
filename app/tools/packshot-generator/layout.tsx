import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Packshot Generator - Professional Product Photos',
  description: 'Generate professional product packshots with AI. Remove backgrounds, add shadows, create studio-quality e-commerce photos for Amazon, Allegro, Instagram.',
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
    'studio quality photos'
  ],
  openGraph: {
    title: 'AI Packshot Generator - Professional E-commerce Photos | Pixelift',
    description: 'Transform product photos into professional packshots with AI. Perfect for Amazon, Allegro, and Instagram.',
    url: 'https://pixelift.pl/tools/packshot-generator',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/og-packshot.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Packshot Generator'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Packshot Generator | Pixelift',
    description: 'Professional product photos with AI. Studio-quality results.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/packshot-generator'
  }
};

export default function PackshotGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
