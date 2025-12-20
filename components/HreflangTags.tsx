'use client';

import { usePathname } from 'next/navigation';
import { locales, defaultLocale } from '@/i18n/config';

const baseUrl = 'https://pixelift.pl';

export default function HreflangTags() {
  const pathname = usePathname();

  // Extract the path without the locale prefix
  const pathWithoutLocale = pathname.replace(/^\/(en|pl|es|fr)/, '') || '';

  // Generate URL for a given locale
  // All locales have prefix since we use localePrefix: 'always'
  const getUrlForLocale = (locale: string) => {
    return `${baseUrl}/${locale}${pathWithoutLocale}`;
  };

  return (
    <>
      {locales.map((locale) => (
        <link
          key={locale}
          rel="alternate"
          hrefLang={locale}
          href={getUrlForLocale(locale)}
        />
      ))}
      {/* x-default points to English as the international default */}
      <link
        rel="alternate"
        hrefLang="x-default"
        href={`${baseUrl}/en${pathWithoutLocale}`}
      />
    </>
  );
}
