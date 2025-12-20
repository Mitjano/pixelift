import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Image Vectorizer - Convert Photos to SVG & Vector Art | Pixelift',
  description: 'Convert raster images to scalable vector graphics with AI. Transform photos into illustrations, SVG files, and vector art. Perfect for logos, icons, and print materials.',
  keywords: [
    'image to vector',
    'vectorize photo',
    'AI vectorizer',
    'convert to SVG',
    'raster to vector',
    'photo to illustration',
    'image vectorization',
    'vector converter',
    'SVG converter',
    'picture to vector',
    'trace image',
    'auto trace',
    'vector art generator',
    'photo to vector online',
    'image to SVG converter',
    'vectorize image free',
    'convert image to vector',
    'AI image tracing',
    'scalable graphics',
    'vector illustration maker',
  ],
  openGraph: {
    title: 'AI Image Vectorizer - Photos to Vector Art | Pixelift',
    description: 'Convert images to SVG and vector art with AI. Perfect for logos, icons, and print.',
    url: 'https://pixelift.pl/tools/vectorize',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/og-vectorize.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Image Vectorizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Vectorizer - Convert to SVG | Pixelift',
    description: 'Transform photos into scalable vector graphics with AI.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/vectorize',
  },
};

export default function VectorizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
