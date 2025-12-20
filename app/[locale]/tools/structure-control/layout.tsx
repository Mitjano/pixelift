import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Structure Control - Control Image Generation | Pixelift',
  description: 'Control AI image generation with structure guides. Use edge detection, depth maps, and pose estimation to guide your AI-generated images with precision.',
  keywords: [
    'controlnet',
    'structure control',
    'AI image control',
    'guided image generation',
    'edge detection AI',
    'depth map generation',
    'pose estimation',
    'canny edge',
    'image structure',
    'AI art control',
    'controlled generation',
    'structure to image',
    'guided AI art',
    'image conditioning',
    'depth control',
    'pose control',
    'AI image guidance',
    'structure preservation',
    'controlled AI art',
    'precise image generation',
  ],
  openGraph: {
    title: 'AI Structure Control - Guided Image Generation | Pixelift',
    description: 'Control AI image generation with structure guides. Precise, guided creative AI.',
    url: 'https://pixelift.pl/tools/structure-control',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=structure-control',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Structure Control',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Structure Control | Pixelift',
    description: 'Guide AI image generation with structure control and precision.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/structure-control',
  },
};

export default function StructureControlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
