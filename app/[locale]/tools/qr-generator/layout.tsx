import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'QR Code Generator - Create Custom QR Codes | Pixelift',
  description: 'Generate custom QR codes for URLs, text, and more. Create branded QR codes with colors and logos. Free online QR code generator with download options.',
  keywords: [
    'QR code generator',
    'create QR code',
    'QR maker',
    'custom QR code',
    'QR code online',
    'free QR generator',
    'URL to QR',
    'branded QR code',
    'QR code with logo',
    'color QR code',
    'QR code creator',
    'generate QR code',
    'business QR code',
    'QR code free',
    'QR code design',
    'scannable code',
    'dynamic QR code',
    'QR code download',
    'marketing QR code',
    'QR code maker online',
  ],
  openGraph: {
    title: 'QR Code Generator - Create QR Codes | Pixelift',
    description: 'Generate custom QR codes with colors and logos. Free QR code generator.',
    url: 'https://pixelift.pl/tools/qr-generator',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/og-qr-generator.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixelift QR Code Generator',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'QR Code Generator | Pixelift',
    description: 'Create custom QR codes with colors and logos. Free online generator.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/qr-generator',
  },
};

export default function QRGeneratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
