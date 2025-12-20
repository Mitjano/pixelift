import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Photo Editing Tools - Free Online Image Editor | Pixelift',
  description: 'Professional AI-powered photo editing tools. Upscale images, remove backgrounds, colorize photos, create logos, and more. Free online image editing suite.',
  keywords: [
    'AI photo editing',
    'online image editor',
    'free photo tools',
    'image editing online',
    'AI image tools',
    'photo enhancement',
    'background remover',
    'image upscaler',
    'photo colorizer',
    'logo maker',
    'text effects',
    'image vectorizer',
    'photo restoration',
    'object removal',
    'style transfer',
    'photo filters',
    'image converter',
    'photo collage',
    'QR generator',
    'AI photo editor',
    'free image editing',
    'online photo tools',
    'image processing',
    'photo manipulation',
    'creative tools',
  ],
  openGraph: {
    title: 'AI Photo Editing Tools | Pixelift',
    description: 'Professional AI photo editing tools. Upscale, remove backgrounds, colorize, and more.',
    url: 'https://pixelift.pl/tools',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=tools',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Photo Editing Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Photo Editing Tools | Pixelift',
    description: 'Professional AI photo tools. Free online image editor.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools',
  },
};

export default function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
