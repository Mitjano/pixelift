import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photo Filters - Apply Image Effects Online | Pixelift',
  description: 'Apply beautiful filters and effects to your photos online. Vintage, black & white, sepia, and creative filters. Enhance your images with professional effects.',
  keywords: [
    'photo filters',
    'image filters',
    'photo effects',
    'filter online',
    'vintage filter',
    'black and white filter',
    'sepia effect',
    'Instagram filters',
    'photo editing',
    'image effects',
    'creative filters',
    'color filter',
    'photo enhancement',
    'filter effects',
    'retro filter',
    'warm filter',
    'cool filter',
    'dramatic effect',
    'free photo filters',
    'apply filter online',
  ],
  openGraph: {
    title: 'Photo Filters - Image Effects | Pixelift',
    description: 'Apply beautiful filters and effects to photos. Vintage, B&W, and creative filters.',
    url: 'https://pixelift.pl/tools/image-filters',
    type: 'website',
    images: [
      {
        url: 'https://pixelift.pl/api/og?tool=image-filters',
        width: 1200,
        height: 630,
        alt: 'Pixelift Photo Filters',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Photo Filters | Pixelift',
    description: 'Apply beautiful filters and effects to your photos.',
  },
  alternates: {
    canonical: 'https://pixelift.pl/tools/image-filters',
  },
};

export default function ImageFiltersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
