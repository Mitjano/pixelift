import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Photo Restoration - Restore Old & Damaged Photos | Pixelift',
  description: 'Restore old, damaged, and faded photos with AI. Fix scratches, tears, and imperfections. Enhance face details and bring vintage family photos back to life.',
  keywords: [
    'photo restoration',
    'restore old photos',
    'AI photo repair',
    'fix damaged photos',
    'old photo restoration',
    'vintage photo repair',
    'scratch removal',
    'photo recovery',
    'face restoration',
    'AI photo enhancement',
    'damaged photo fix',
    'family photo restore',
    'historical photo repair',
    'photo scratch repair',
    'tear repair photo',
    'faded photo fix',
    'antique photo restoration',
    'photo quality repair',
    'GFPGAN',
    'CodeFormer restoration',
  ],
  openGraph: {
    title: 'AI Photo Restoration - Fix Old Photos | Pixelift',
    description: 'Restore old and damaged photos with AI. Fix scratches, enhance faces, and revive memories.',
    url: 'https://pixelift.pl/tools/restore',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=restore',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Photo Restoration',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Photo Restoration | Pixelift',
    description: 'Restore old and damaged photos with advanced AI technology.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/restore',
  },
};

export default function RestoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
