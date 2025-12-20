import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Image Cropper - Crop Photos Online Free | Pixelift',
  description: 'Crop images online with precision. Cut and trim photos to any size or aspect ratio. Perfect for social media posts, profile pictures, and custom dimensions.',
  keywords: [
    'crop image',
    'image cropper',
    'crop photo online',
    'cut image',
    'trim photo',
    'photo cropper',
    'crop picture',
    'online image crop',
    'aspect ratio crop',
    'square crop',
    'custom crop',
    'free image cropper',
    'crop for Instagram',
    'profile picture crop',
    'social media crop',
    'photo trim',
    'crop dimensions',
    'image cutter',
    'circle crop',
    'resize crop',
  ],
  openGraph: {
    title: 'Image Cropper - Crop Photos Online | Pixelift',
    description: 'Crop and trim photos online. Custom sizes and aspect ratios. Free image cropper.',
    url: 'https://pixelift.pl/tools/crop-image',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=crop-image',
        width: 1200,
        height: 630,
        alt: 'Pixelift Image Cropper',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Image Cropper | Pixelift',
    description: 'Crop photos online with precision. Free image cropping tool.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/crop-image',
  },
};

export default function CropImageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
