import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Logo Maker - Create Professional Logos in Seconds | Pixelift',
  description: 'Generate unique, professional logos with AI. Choose from 6 styles: minimalist, vintage, modern, playful, professional, tech. Powered by Ideogram V2. Free trial available.',
  keywords: [
    'AI logo maker',
    'logo generator',
    'create logo online',
    'free logo maker',
    'logo design AI',
    'business logo',
    'brand logo creator',
    'logo builder',
    'company logo',
    'startup logo',
    'logo design free',
    'professional logo maker',
    'AI logo generator',
    'custom logo design',
    'brand identity',
    'logo creator online',
    'minimalist logo',
    'modern logo design',
    'vintage logo maker',
    'text logo generator',
  ],
  openGraph: {
    title: 'AI Logo Maker - Professional Logos in Seconds | Pixelift',
    description: 'Generate unique logos with AI. 6 styles, custom colors. Powered by Ideogram V2. Try free!',
    url: 'https://pixelift.pl/tools/logo-maker',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=logo-maker',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Logo Maker',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Logo Maker - Create Logos in Seconds | Pixelift',
    description: 'Generate unique, professional logos with AI. 6 styles to choose from.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/logo-maker',
  },
};

export default function LogoMakerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
