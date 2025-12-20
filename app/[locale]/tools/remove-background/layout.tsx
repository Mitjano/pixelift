import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Background Remover - Remove Image Backgrounds Instantly',
  description: 'Remove backgrounds from images instantly using BRIA RMBG 2.0 AI. Perfect for product photos, portraits, e-commerce listings. Free trial available.',
  keywords: [
    'background remover',
    'remove background',
    'AI background removal',
    'transparent background',
    'product photos',
    'e-commerce images',
    'profile pictures',
    'BRIA RMBG',
    'cut out background',
    'free background remover',
    'erase background online',
    'transparent PNG'
  ],
  openGraph: {
    title: 'AI Background Remover - Instant & Accurate | Pixelift',
    description: 'Remove backgrounds from images instantly with AI. Professional results in seconds. Try free!',
    url: 'https://pixelift.pl/tools/remove-background',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=background-remover',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Background Remover'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Background Remover | Pixelift',
    description: 'Remove backgrounds from images instantly with AI. Free and accurate.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/remove-background'
  }
};

export default function RemoveBackgroundLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
