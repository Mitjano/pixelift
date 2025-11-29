import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Image Expand - Extend Images with AI Outpainting',
  description: 'Extend your images with AI-generated content using FLUX outpainting technology. Expand left, right, up, down or zoom out. Perfect for social media and creative projects.',
  keywords: [
    'image expand',
    'AI outpainting',
    'extend image',
    'FLUX outpainting',
    'expand image edges',
    'generative fill',
    'AI image extension',
    'zoom out image',
    'make image wider',
    'uncrop image',
    'AI image generation',
    'expand canvas'
  ],
  openGraph: {
    title: 'AI Image Expand - Extend Images with Outpainting | Pixelift',
    description: 'Extend your images with AI-generated content. Perfect for social media and creative projects.',
    url: 'https://pixelift.pl/tools/image-expand',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/og-image-expand.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Image Expand'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Expand | Pixelift',
    description: 'Extend images with AI outpainting. Expand in any direction.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/image-expand'
  }
};

export default function ImageExpandLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
