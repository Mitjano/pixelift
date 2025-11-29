# Plan Implementacji Wielojęzyczności (i18n) dla Pixelift

## Podsumowanie

**Języki:** EN (domyślny, bez prefiksu), PL, ES, FR
**Struktura URL:** Subpath (`/pl/`, `/es/`, `/fr/`)
**Wykrywanie:** Automatyczne na podstawie przeglądarki + przełącznik + cookie
**Zakres:** Pełne tłumaczenie (UI, strony, blog, knowledge base)

---

## Faza 1: Infrastruktura i18n

### 1.1 Instalacja next-intl
```bash
npm install next-intl
```

Wybór `next-intl` zamiast `next-i18next`:
- Lepsze wsparcie dla App Router (Next.js 15)
- Natywne wsparcie dla Server Components
- Prostsze API
- Aktywnie rozwijane

### 1.2 Struktura folderów

```
/Users/mch/Documents/pixelift/
├── i18n/
│   ├── config.ts                 # Konfiguracja języków
│   ├── request.ts                # Server-side i18n
│   └── navigation.ts             # Lokalizowane linki
├── messages/
│   ├── en/
│   │   ├── common.json           # Wspólne (menu, footer, przyciski)
│   │   ├── home.json             # Strona główna
│   │   ├── tools.json            # Narzędzia (upscaler, remove-bg, etc.)
│   │   ├── pricing.json          # Cennik
│   │   ├── auth.json             # Logowanie/rejestracja
│   │   ├── dashboard.json        # Panel użytkownika
│   │   └── legal.json            # Terms, Privacy, GDPR
│   ├── pl/
│   │   └── ... (te same pliki)
│   ├── es/
│   │   └── ...
│   └── fr/
│       └── ...
├── app/
│   └── [locale]/                 # Nowy folder z dynamicznym locale
│       ├── layout.tsx
│       ├── page.tsx
│       ├── pricing/
│       ├── tools/
│       ├── blog/
│       ├── knowledge/
│       └── ... (wszystkie strony)
└── middleware.ts                 # Rozszerzony o wykrywanie języka
```

### 1.3 Konfiguracja (i18n/config.ts)

```typescript
export const locales = ['en', 'pl', 'es', 'fr'] as const;
export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  pl: 'Polski',
  es: 'Español',
  fr: 'Français'
};

export const localeFlags: Record<Locale, string> = {
  en: '🇬🇧',
  pl: '🇵🇱',
  es: '🇪🇸',
  fr: '🇫🇷'
};
```

### 1.4 Middleware (rozszerzenie istniejącego)

```typescript
import createMiddleware from 'next-intl/middleware';
import { locales, defaultLocale } from '@/i18n/config';

// Middleware wykrywający język z:
// 1. URL path (/pl/, /es/, /fr/)
// 2. Cookie (NEXT_LOCALE)
// 3. Accept-Language header
// 4. Domyślnie: en

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed' // EN bez prefiksu, reszta z prefiksem
});

// Połączenie z istniejącym middleware (auth, CSRF, HTTPS)
```

---

## Faza 2: Migracja struktury App

### 2.1 Reorganizacja folderów

**PRZED:**
```
app/
├── page.tsx
├── pricing/page.tsx
├── tools/upscaler/page.tsx
└── ...
```

**PO:**
```
app/
├── [locale]/
│   ├── layout.tsx           # Layout z locale provider
│   ├── page.tsx             # Strona główna
│   ├── pricing/page.tsx
│   ├── tools/upscaler/page.tsx
│   └── ...
└── api/                     # API pozostaje bez locale!
    └── ...
```

### 2.2 Layout z Locale Provider

```typescript
// app/[locale]/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

---

## Faza 3: Tłumaczenie UI

### 3.1 Komponenty do modyfikacji

| Komponent | Plik | Ilość tekstów |
|-----------|------|---------------|
| Header | components/Header.tsx | ~30 |
| Footer | components/Footer.tsx | ~20 |
| ToolsLayout | components/ToolsLayout.tsx | ~10 |
| FAQ | components/FAQ.tsx | ~30 |
| Testimonials | components/Testimonials.tsx | ~15 |
| UseCases | components/UseCases.tsx | ~20 |
| CookieConsent | components/CookieConsent.tsx | ~5 |

### 3.2 Przykład użycia w komponencie

**PRZED:**
```tsx
<h1>AI Image Upscaler</h1>
<p>Enhance and enlarge your images up to 8x</p>
```

**PO:**
```tsx
import { useTranslations } from 'next-intl';

export default function UpscalerPage() {
  const t = useTranslations('tools.upscaler');

  return (
    <>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </>
  );
}
```

### 3.3 Plik tłumaczeń (messages/en/tools.json)

```json
{
  "upscaler": {
    "title": "AI Image Upscaler",
    "description": "Enhance and enlarge your images up to 8x using Real-ESRGAN AI technology.",
    "badge": "Powered by Real-ESRGAN AI",
    "stats": {
      "maxScale": "Max Scale",
      "processing": "Processing",
      "creditPerImage": "Credit/Image"
    },
    "features": {
      "fast": {
        "title": "Lightning Fast",
        "description": "Process images in 10-20 seconds with our optimized AI pipeline."
      }
    }
  },
  "removeBackground": {
    "title": "Background Remover",
    "description": "Remove backgrounds from any image with AI precision."
  }
}
```

---

## Faza 4: Przełącznik Języka

### 4.1 Komponent LanguageSwitcher

```typescript
// components/LanguageSwitcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { locales, localeNames, localeFlags } from '@/i18n/config';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    // Zamień locale w URL
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    // Zapisz w cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;
  };

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800">
        <span>{localeFlags[locale]}</span>
        <span className="hidden md:inline">{localeNames[locale]}</span>
      </button>
      <div className="absolute right-0 mt-2 bg-gray-800 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            className={`flex items-center gap-2 px-4 py-2 hover:bg-gray-700 w-full ${
              loc === locale ? 'text-green-400' : 'text-white'
            }`}
          >
            <span>{localeFlags[loc]}</span>
            <span>{localeNames[loc]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 4.2 Integracja z Header

Dodanie `<LanguageSwitcher />` obok przycisków auth w Header.tsx

---

## Faza 5: Blog i Knowledge Base

### 5.1 Struktura danych z tłumaczeniami

**PRZED (data/knowledge/flux-1-1-pro.json):**
```json
{
  "id": "flux-1-1-pro",
  "title": "Flux 1.1 Pro: Professional AI Image Generation",
  "content": "..."
}
```

**PO (data/knowledge/flux-1-1-pro.json):**
```json
{
  "id": "flux-1-1-pro",
  "translations": {
    "en": {
      "title": "Flux 1.1 Pro: Professional AI Image Generation",
      "excerpt": "...",
      "content": "..."
    },
    "pl": {
      "title": "Flux 1.1 Pro: Profesjonalna Generacja Obrazów AI",
      "excerpt": "...",
      "content": "..."
    },
    "es": {
      "title": "Flux 1.1 Pro: Generación Profesional de Imágenes con IA",
      "excerpt": "...",
      "content": "..."
    },
    "fr": {
      "title": "Flux 1.1 Pro: Génération d'Images IA Professionnelle",
      "excerpt": "...",
      "content": "..."
    }
  },
  "category": "models",
  "tags": ["flux", "ai-generation"],
  "status": "published"
}
```

### 5.2 Funkcja pobierania artykułów

```typescript
// lib/knowledge.ts
export async function getPublishedArticles(locale: Locale) {
  const articles = await readAllArticles();

  return articles
    .filter(a => a.status === 'published')
    .map(article => ({
      ...article,
      // Pobierz tłumaczenie dla danego locale, fallback na EN
      title: article.translations[locale]?.title || article.translations.en.title,
      excerpt: article.translations[locale]?.excerpt || article.translations.en.excerpt,
      content: article.translations[locale]?.content || article.translations.en.content,
    }));
}
```

---

## Faza 6: SEO i Metadata

### 6.1 Hreflang tags

```typescript
// app/[locale]/layout.tsx
export async function generateMetadata({ params }: Props) {
  const { locale } = params;

  return {
    alternates: {
      canonical: `https://pixelift.pl/${locale === 'en' ? '' : locale}`,
      languages: {
        'en': 'https://pixelift.pl',
        'pl': 'https://pixelift.pl/pl',
        'es': 'https://pixelift.pl/es',
        'fr': 'https://pixelift.pl/fr',
        'x-default': 'https://pixelift.pl'
      }
    }
  };
}
```

### 6.2 Tłumaczone meta tags

```typescript
// app/[locale]/tools/upscaler/page.tsx
export async function generateMetadata({ params }: Props) {
  const t = await getTranslations('tools.upscaler');

  return {
    title: t('meta.title'),
    description: t('meta.description'),
    openGraph: {
      title: t('meta.ogTitle'),
      description: t('meta.ogDescription')
    }
  };
}
```

---

## Faza 7: Automatyczne tłumaczenie treści

### 7.1 Skrypt do tłumaczenia artykułów

Wykorzystanie API Claude/GPT do automatycznego tłumaczenia 58 artykułów knowledge base i ~15 postów blog.

```typescript
// scripts/translate-content.ts
import Anthropic from '@anthropic-ai/sdk';

async function translateArticle(article: Article, targetLocale: string) {
  const client = new Anthropic();

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    messages: [{
      role: 'user',
      content: `Translate this article to ${targetLocale}.
               Keep the HTML structure intact.
               Maintain technical terms.

               Title: ${article.title}
               Content: ${article.content}`
    }]
  });

  return response;
}
```

---

## Kolejność implementacji

### Sprint 1: Infrastruktura (1-2 dni)
1. ✅ Instalacja next-intl
2. ✅ Konfiguracja i18n
3. ✅ Rozszerzenie middleware
4. ✅ Utworzenie struktury messages/

### Sprint 2: Migracja struktury (2-3 dni)
1. ✅ Przeniesienie stron do app/[locale]/
2. ✅ Aktualizacja wszystkich importów
3. ✅ Dodanie locale provider

### Sprint 3: Tłumaczenie UI - EN (2-3 dni)
1. ✅ Ekstrakcja wszystkich tekstów do JSON
2. ✅ Modyfikacja komponentów (useTranslations)
3. ✅ Przełącznik języka w Header

### Sprint 4: Tłumaczenia PL, ES, FR (3-4 dni)
1. ✅ Tłumaczenie plików common.json
2. ✅ Tłumaczenie plików tools.json
3. ✅ Tłumaczenie pozostałych plików

### Sprint 5: Blog i Knowledge Base (2-3 dni)
1. ✅ Migracja struktury danych
2. ✅ Automatyczne tłumaczenie artykułów
3. ✅ Aktualizacja komponentów

### Sprint 6: SEO i testy (1-2 dni)
1. ✅ Hreflang tags
2. ✅ Tłumaczone meta tags
3. ✅ Testy wszystkich ścieżek

---

## Szacowany nakład pracy

| Element | Pliki | Szacowany czas |
|---------|-------|----------------|
| Infrastruktura | 5 | 4h |
| Migracja struktury | ~60 | 8h |
| Ekstrakcja tekstów EN | ~40 | 6h |
| Modyfikacja komponentów | ~30 | 8h |
| Tłumaczenia UI (PL, ES, FR) | 3×8 | 6h |
| Blog/Knowledge migration | ~75 | 4h |
| Automatyczne tłumaczenia | ~75 | 2h (API) |
| SEO/metadata | ~30 | 4h |
| Testy | - | 4h |
| **RAZEM** | - | **~46h** |

---

## Potencjalne ryzyki

1. **Duża ilość plików do modyfikacji** - ~60 stron, ~30 komponentów
2. **Koszt tłumaczeń API** - ~75 artykułów × 4 języki = 300 wywołań API
3. **SEO spadek podczas migracji** - tymczasowe 301 redirecty
4. **Regresje funkcjonalne** - wymaga dokładnych testów

---

## Czy zatwierdzasz ten plan?

Po zatwierdzeniu rozpocznę od Fazy 1 (infrastruktura i18n).
