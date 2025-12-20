import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Photo Colorizer - Add Color to Black & White Photos | Pixelift',
  description: 'Automatically colorize black and white photos with AI. Restore old family photos, historical images, and vintage pictures with realistic, natural colors.',
  keywords: [
    'colorize black and white photo',
    'AI photo colorization',
    'restore old photos color',
    'add color to photo',
    'black white to color',
    'colorize old photos',
    'photo colorizer',
    'AI colorization',
    'vintage photo color',
    'historical photo restoration',
    'family photo colorize',
    'automatic colorization',
    'colorize image online',
    'B&W to color converter',
    'photo color restoration',
    'old picture colorizer',
    'colorize photos free',
    'AI color restoration',
    'monochrome to color',
    'photo recoloring',
  ],
  openGraph: {
    title: 'AI Photo Colorizer - Restore Old Photos | Pixelift',
    description: 'Add realistic colors to black & white photos with AI. Perfect for old family photos.',
    url: 'https://pixelift.pl/tools/colorize',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/og-colorize.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Photo Colorizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Photo Colorizer | Pixelift',
    description: 'Bring old black & white photos to life with AI colorization.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/colorize',
  },
};

export default function ColorizeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
