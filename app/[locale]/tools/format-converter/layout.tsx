import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Format Converter - Convert PNG, JPG, WebP, AVIF | Pixelift',
  description: 'Convert images between formats: PNG, JPG, WebP, AVIF, and more. Optimize image size and quality. Fast, free online image format converter.',
  keywords: [
    'image format converter',
    'convert PNG to JPG',
    'JPG to PNG',
    'WebP converter',
    'AVIF converter',
    'image converter online',
    'format converter',
    'photo format change',
    'convert image format',
    'PNG converter',
    'JPG converter',
    'image optimization',
    'file format converter',
    'picture converter',
    'batch image converter',
    'convert to WebP',
    'HEIC to JPG',
    'image type converter',
    'free image converter',
    'online format converter',
  ],
  openGraph: {
    title: 'Image Format Converter - PNG, JPG, WebP | Pixelift',
    description: 'Convert images between formats: PNG, JPG, WebP, AVIF. Free online converter.',
    url: 'https://pixelift.pl/tools/format-converter',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=format-converter',
        width: 1200,
        height: 630,
        alt: 'Pixelift Image Format Converter',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Format Converter | Pixelift',
    description: 'Convert images between PNG, JPG, WebP, and more formats.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/format-converter',
  },
};

export default function FormatConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
