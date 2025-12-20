import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Portrait Relighting - Change Photo Lighting | Pixelift',
  description: 'Relight portraits and photos with AI. Change lighting direction, add studio lighting effects, and enhance portrait photography with professional lighting adjustments.',
  keywords: [
    'portrait relighting',
    'AI lighting',
    'change photo lighting',
    'studio lighting effect',
    'portrait lighting',
    'lighting adjustment',
    'photo lighting fix',
    'relight face',
    'AI portrait editing',
    'lighting direction',
    'professional lighting',
    'portrait enhancement',
    'lighting correction',
    'dramatic lighting',
    'soft lighting',
    'studio portrait effect',
    'lighting simulation',
    'portrait glow',
    'face lighting',
    'ambient lighting',
  ],
  openGraph: {
    title: 'AI Portrait Relighting - Professional Lighting | Pixelift',
    description: 'Change and enhance photo lighting with AI. Studio-quality portrait lighting.',
    url: 'https://pixelift.pl/tools/portrait-relight',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/og-portrait-relight.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Portrait Relighting',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Portrait Relighting | Pixelift',
    description: 'Transform portrait lighting with AI for professional results.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/portrait-relight',
  },
};

export default function PortraitRelightLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
