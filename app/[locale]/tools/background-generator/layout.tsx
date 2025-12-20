import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Background Generator - Create Custom Backgrounds | Pixelift',
  description: 'Generate custom backgrounds for your photos with AI. Create professional product backgrounds, social media backdrops, and creative image backgrounds.',
  keywords: [
    'AI background generator',
    'background creator',
    'custom background',
    'product background',
    'photo background',
    'generate background',
    'backdrop generator',
    'background maker',
    'AI backdrop',
    'creative background',
    'social media background',
    'ecommerce background',
    'professional backdrop',
    'background design',
    'image background',
    'scene generation',
    'background replace',
    'virtual background',
    'studio background',
    'custom backdrop',
  ],
  openGraph: {
    title: 'AI Background Generator - Custom Backdrops | Pixelift',
    description: 'Generate custom backgrounds for photos with AI. Professional product backdrops.',
    url: 'https://pixelift.pl/tools/background-generator',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/og-background-generator.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Background Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Background Generator | Pixelift',
    description: 'Create custom photo backgrounds with AI.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/background-generator',
  },
};

export default function BackgroundGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
