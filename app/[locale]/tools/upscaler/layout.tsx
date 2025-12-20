import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Image Upscaler - Enhance Images up to 8x Resolution',
  description: 'Enhance and enlarge your images up to 8x resolution using Real-ESRGAN AI technology. Professional image upscaling with face enhancement. Free trial available.',
  keywords: [
    'image upscaler',
    'AI upscaling',
    'enhance images',
    'enlarge photos',
    'Real-ESRGAN',
    'image quality',
    'photo enhancement',
    'face restoration',
    'GFPGAN',
    'upscale image online',
    'free image upscaler',
    'increase image resolution',
    '8x upscale',
    'AI photo enhancer'
  ],
  openGraph: {
    title: 'AI Image Upscaler - Enhance Images up to 8x | Pixelift',
    description: 'Enhance and enlarge images up to 8x with Real-ESRGAN AI. Professional results in seconds. Try free!',
    url: 'https://pixelift.pl/tools/upscaler',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=upscaler',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Image Upscaler'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Upscaler - 8x Resolution | Pixelift',
    description: 'Enhance and enlarge images up to 8x with AI. Professional results in seconds.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/upscaler'
  }
};

export default function UpscalerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
