import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Object Remover - Remove Unwanted Objects from Photos | Pixelift',
  description: 'Remove unwanted objects, people, and distractions from photos with AI. Magic eraser tool that fills in backgrounds seamlessly. Perfect for photo retouching and cleanup.',
  keywords: [
    'remove object from photo',
    'AI eraser',
    'photo retouching',
    'unwanted object removal',
    'magic eraser online',
    'remove people from photo',
    'object eraser',
    'photo cleanup',
    'remove background objects',
    'AI photo eraser',
    'image object removal',
    'erase object from picture',
    'photo editing remove',
    'smart eraser tool',
    'content aware fill',
    'remove distractions',
    'photo touch up',
    'AI inpainting',
    'seamless object removal',
    'photo object delete',
  ],
  openGraph: {
    title: 'AI Object Remover - Clean Up Photos | Pixelift',
    description: 'Remove unwanted objects from photos with AI. Seamless, automatic background fill.',
    url: 'https://pixelift.pl/tools/object-removal',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/og-object-removal.jpg',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Object Remover',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Object Remover | Pixelift',
    description: 'Magic eraser for photos. Remove unwanted objects seamlessly.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/object-removal',
  },
};

export default function ObjectRemovalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
