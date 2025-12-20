import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Image Reimagine - Transform & Recreate Photos | Pixelift',
  description: 'Reimagine and transform your photos with AI. Create variations, change styles, and generate new versions of your images while preserving the core elements.',
  keywords: [
    'reimagine photo',
    'AI image variation',
    'transform image AI',
    'photo transformation',
    'image recreation',
    'AI image generator',
    'photo variation maker',
    'creative image AI',
    'image style transfer',
    'photo reimagination',
    'AI art generator',
    'image remix',
    'photo style change',
    'creative photo editing',
    'AI image transformation',
    'picture variation',
    'image reinterpretation',
    'photo to art',
    'AI visual effects',
    'creative image maker',
  ],
  openGraph: {
    title: 'AI Image Reimagine - Transform Photos | Pixelift',
    description: 'Create stunning variations of your photos with AI. Transform and reimagine images.',
    url: 'https://pixelift.pl/tools/reimagine',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=reimagine',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Reimagine',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Image Reimagine | Pixelift',
    description: 'Transform and recreate your photos with AI-powered reimagination.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/reimagine',
  },
};

export default function ReimagineLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
