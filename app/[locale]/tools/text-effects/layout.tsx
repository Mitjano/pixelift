import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Text Effects - Create Stunning Typography | Pixelift',
  description: 'Transform text into stunning visual effects with AI. Create 3D text, neon effects, metallic finishes, and creative typography. Perfect for social media, marketing, and design projects.',
  keywords: [
    'text effects',
    'text effects online',
    'typography generator',
    'text to image AI',
    'creative text design',
    'font effects',
    '3D text generator',
    'neon text effect',
    'metallic text',
    'text art generator',
    'AI typography',
    'text design online',
    'fancy text generator',
    'text logo maker',
    'stylized text',
    'text graphics',
    'word art creator',
    'text styling tool',
    'gradient text',
    'chrome text effect',
  ],
  openGraph: {
    title: 'AI Text Effects - Stunning Typography | Pixelift',
    description: 'Create amazing text effects with AI. 3D, neon, metallic, and more. Try free!',
    url: 'https://pixelift.pl/tools/text-effects',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=text-effects',
        width: 1200,
        height: 630,
        alt: 'Pixelift AI Text Effects',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Text Effects - Creative Typography | Pixelift',
    description: 'Transform text into stunning visual effects. 3D, neon, metallic styles.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/text-effects',
  },
};

export default function TextEffectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
