import type { Metadata } from "next";
import { getTranslations } from 'next-intl/server';
import { locales, type Locale } from '@/i18n/config';

// Locale to OpenGraph locale mapping
const ogLocaleMap: Record<Locale, string> = {
  en: 'en_US',
  pl: 'pl_PL',
  es: 'es_ES',
  fr: 'fr_FR',
};

// Dynamic metadata for AI Chat page
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'chat' });

  const title = t('seo.title');
  const description = t('seo.description');
  const keywords = t('seo.keywords');

  return {
    title,
    description,
    keywords: keywords.split(', '),
    openGraph: {
      title,
      description,
      type: "website",
      locale: ogLocaleMap[locale as Locale] || 'en_US',
      url: `https://pixelift.pl/${locale}/ai-chat`,
      siteName: "Pixelift",
      images: [
        {
          url: '/og-ai-chat.png',
          width: 1200,
          height: 630,
          alt: 'AI Chat - Darmowy chatbot AI',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/og-ai-chat.png'],
    },
    alternates: {
      canonical: `https://pixelift.pl/${locale}/ai-chat`,
      languages: {
        'pl': 'https://pixelift.pl/pl/ai-chat',
        'en': 'https://pixelift.pl/en/ai-chat',
        'es': 'https://pixelift.pl/es/ai-chat',
        'fr': 'https://pixelift.pl/fr/ai-chat',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function AIChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Structured data for AI Chat */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "Pixelift AI Chat",
            "applicationCategory": "UtilitiesApplication",
            "description": "Darmowy chatbot AI z dostępem do ponad 20 modeli językowych: GPT-5.2, Claude Opus 4.5, Gemini 2.5, DeepSeek R1 i więcej. Bez abonamentu, płać za użycie.",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "PLN",
              "description": "Darmowe modele AI dostępne bez opłat"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1250"
            },
            "featureList": [
              "20+ modeli AI do wyboru",
              "Darmowe modele bez limitu",
              "Obsługa obrazów i plików",
              "Historia rozmów",
              "Eksport konwersacji",
              "Model pay-per-use"
            ],
            "url": "https://pixelift.pl/ai-chat",
            "provider": {
              "@type": "Organization",
              "name": "Pixelift",
              "url": "https://pixelift.pl"
            }
          }),
        }}
      />
      {/* FAQ Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              {
                "@type": "Question",
                "name": "Czy AI Chat jest naprawdę darmowy?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Tak! Mamy 4 darmowe modele AI: Gemini Flash-Lite, Llama 3.3 8B, Qwen 2.5 72B i DeepSeek V3. Możesz z nich korzystać bez żadnych opłat i limitów."
                }
              },
              {
                "@type": "Question",
                "name": "Jakie modele AI są dostępne?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Oferujemy ponad 20 modeli AI: GPT-5.2, GPT-4o, Claude Opus 4.5, Claude Sonnet 4, Gemini 2.5 Pro, DeepSeek R1, Grok 4, Mistral Large i wiele innych."
                }
              },
              {
                "@type": "Question",
                "name": "Jak działa płatność za tokeny?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Kupujesz kredyty i płacisz tylko za tokeny, które zużyjesz. Darmowe modele nie pobierają kredytów. Płatne modele mają różne stawki - od 0.05 kredyta za 1000 tokenów."
                }
              },
              {
                "@type": "Question",
                "name": "Czy mogę wysyłać obrazy do AI?",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "Tak! Większość modeli obsługuje obrazy. Możesz wkleić zrzut ekranu, przesłać zdjęcie lub dokument, a AI je przeanalizuje."
                }
              }
            ]
          }),
        }}
      />
      {children}
    </>
  );
}
