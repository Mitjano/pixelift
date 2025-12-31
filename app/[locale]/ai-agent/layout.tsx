import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { type Locale } from '@/i18n/config';

// Locale to OpenGraph locale mapping
const ogLocaleMap: Record<Locale, string> = {
  en: 'en_US',
  pl: 'pl_PL',
  es: 'es_ES',
  fr: 'fr_FR',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'aiAgentMeta' });

  const title = t('title');
  const description = t('description');

  return {
    title,
    description,
    keywords: [
      'AI Agent',
      'AI Assistant',
      'image editing AI',
      'creative AI',
      'background remover',
      'image upscaler',
      'AI image generation',
      'chat with AI',
      'automated image processing',
      'AI workflow automation',
      'creative assistant',
      'natural language image editing',
    ],
    openGraph: {
      title,
      description,
      type: 'website',
      locale: ogLocaleMap[locale as Locale] || 'en_US',
      url: `https://pixelift.pl/${locale}/ai-agent`,
      siteName: 'Pixelift',
      images: [
        {
          url: '/og-ai-agent.png',
          width: 1200,
          height: 630,
          alt: 'Pixelift AI Agent - Your Intelligent Creative Assistant',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-ai-agent.png'],
    },
    alternates: {
      canonical: `https://pixelift.pl/${locale}/ai-agent`,
      languages: {
        en: 'https://pixelift.pl/en/ai-agent',
        pl: 'https://pixelift.pl/pl/ai-agent',
        es: 'https://pixelift.pl/es/ai-agent',
        fr: 'https://pixelift.pl/fr/ai-agent',
        'x-default': 'https://pixelift.pl/en/ai-agent',
      },
    },
  };
}

export default function AIAgentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
