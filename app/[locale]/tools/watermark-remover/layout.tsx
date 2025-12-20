import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Watermark Remover - Remove Watermarks from Photos | Pixelift',
  description: 'Remove watermarks, logos, and text overlays from images with AI. Clean up photos by erasing unwanted marks while preserving image quality.',
  keywords: [
    'watermark remover',
    'remove watermark',
    'watermark removal AI',
    'delete watermark',
    'remove logo from photo',
    'erase watermark',
    'photo watermark remove',
    'AI watermark eraser',
    'text removal from image',
    'logo remover',
    'watermark cleaner',
    'remove text overlay',
    'image cleanup',
    'watermark delete',
    'photo stamp remover',
    'unwatermark',
    'watermark free',
    'remove branding',
    'AI logo eraser',
    'clean watermark',
  ],
  openGraph: {
    title: 'AI Watermark Remover - Clean Photos | Pixelift',
    description: 'Remove watermarks and logos from photos with AI. Preserve image quality.',
    url: 'https://pixelift.pl/tools/watermark-remover',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=watermark-remover',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Watermark Remover',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Watermark Remover | Pixelift',
    description: 'Remove watermarks and logos from photos with AI.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/watermark-remover',
  },
};

export default function WatermarkRemoverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
