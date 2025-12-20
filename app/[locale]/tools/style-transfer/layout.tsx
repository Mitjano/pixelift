import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Style Transfer - Apply Artistic Styles to Photos | Pixelift',
  description: 'Transform photos with artistic style transfer. Apply painting styles, art movements, and creative effects to your images using AI. Turn photos into artwork.',
  keywords: [
    'style transfer',
    'AI style transfer',
    'photo to painting',
    'artistic style transfer',
    'neural style transfer',
    'photo art effect',
    'image style change',
    'AI art filter',
    'painting effect',
    'artistic photo filter',
    'turn photo into art',
    'photo to artwork',
    'AI painting generator',
    'artistic transformation',
    'photo style converter',
    'art style filter',
    'creative photo effects',
    'photo to illustration',
    'artistic image converter',
    'style blending',
  ],
  openGraph: {
    title: 'AI Style Transfer - Artistic Photo Effects | Pixelift',
    description: 'Apply artistic styles to photos with AI. Transform images into paintings and artwork.',
    url: 'https://pixelift.pl/tools/style-transfer',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/og-style-transfer.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Style Transfer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Style Transfer | Pixelift',
    description: 'Transform photos into artwork with AI style transfer.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/style-transfer',
  },
};

export default function StyleTransferLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
