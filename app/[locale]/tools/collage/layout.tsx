import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Collage Maker - Create Beautiful Collages | Pixelift',
  description: 'Create stunning photo collages with multiple layouts. Combine multiple images into one beautiful collage. Perfect for social media, memories, and creative projects.',
  keywords: [
    'photo collage maker',
    'collage creator',
    'image collage',
    'collage online',
    'photo grid',
    'picture collage',
    'collage generator',
    'multiple photos',
    'photo montage',
    'collage layout',
    'free collage maker',
    'Instagram collage',
    'social media collage',
    'photo combine',
    'collage template',
    'photo layout',
    'memory collage',
    'photo album',
    'multi photo',
    'collage design',
  ],
  openGraph: {
    title: 'Photo Collage Maker - Create Collages | Pixelift',
    description: 'Create beautiful photo collages with multiple layouts. Free online collage maker.',
    url: 'https://pixelift.pl/tools/collage',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/og-collage.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixelift Photo Collage Maker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photo Collage Maker | Pixelift',
    description: 'Create stunning photo collages with multiple layouts.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/collage',
  },
};

export default function CollageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
