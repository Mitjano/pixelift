import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Compressor - Reduce File Size Without Quality Loss',
  description: 'Compress images and reduce file size while maintaining quality. Smart compression for JPG, PNG, WebP. Free online tool for web optimization.',
  keywords: [
    'image compressor',
    'compress images',
    'reduce file size',
    'image optimization',
    'web optimization',
    'compress JPG',
    'compress PNG',
    'compress WebP',
    'free image compressor',
    'online image compressor',
    'lossless compression',
    'optimize images for web'
  ],
  openGraph: {
    title: 'Image Compressor - Smart Compression | Pixelift',
    description: 'Compress images and reduce file size without losing quality. Free online tool.',
    url: 'https://pixelift.pl/tools/image-compressor',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/og-compressor.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixelift Image Compressor'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Compressor | Pixelift',
    description: 'Compress images without quality loss. Free and fast.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/image-compressor'
  }
};

export default function ImageCompressorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children;
}
