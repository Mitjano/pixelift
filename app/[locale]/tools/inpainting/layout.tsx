import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Inpainting - Edit & Replace Parts of Images | Pixelift',
  description: 'Use AI inpainting to edit, replace, or fill specific areas of your images. Seamlessly modify photos by painting over areas you want to change with AI generation.',
  keywords: [
    'AI inpainting',
    'image inpainting',
    'photo editing AI',
    'fill image area',
    'replace image part',
    'AI image editing',
    'seamless editing',
    'photo manipulation',
    'image repair',
    'content aware fill',
    'AI photo editor',
    'image modification',
    'selective editing',
    'paint to replace',
    'AI image repair',
    'photo restoration',
    'damaged photo fix',
    'image completion',
    'smart fill',
    'AI retouching',
  ],
  openGraph: {
    title: 'AI Inpainting - Edit Image Parts | Pixelift',
    description: 'Edit and replace parts of images with AI inpainting. Seamless photo modification.',
    url: 'https://pixelift.pl/tools/inpainting',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=inpainting',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Inpainting',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Inpainting | Pixelift',
    description: 'Edit and replace parts of images seamlessly with AI.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/inpainting',
  },
};

export default function InpaintingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
