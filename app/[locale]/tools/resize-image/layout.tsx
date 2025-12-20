import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Resizer - Resize Photos Online Free | Pixelift',
  description: 'Resize images to any dimension online. Scale photos up or down, maintain aspect ratio, and optimize for web. Fast, free image resizing tool.',
  keywords: [
    'resize image',
    'image resizer',
    'resize photo online',
    'scale image',
    'photo resizer',
    'resize picture',
    'online image resize',
    'change image size',
    'reduce image size',
    'enlarge photo',
    'free image resizer',
    'resize for web',
    'resize for social media',
    'dimension changer',
    'photo scale',
    'bulk resize',
    'image dimensions',
    'resize without losing quality',
    'aspect ratio resize',
    'photo size changer',
  ],
  openGraph: {
    title: 'Image Resizer - Resize Photos Online | Pixelift',
    description: 'Resize images to any dimension. Scale up or down while maintaining quality.',
    url: 'https://pixelift.pl/tools/resize-image',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=resize-image',
        width: 1200,
        height: 630,
        alt: 'Pixelift Image Resizer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Resizer | Pixelift',
    description: 'Resize photos to any dimension online. Free image resizing.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/resize-image',
  },
};

export default function ResizeImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
