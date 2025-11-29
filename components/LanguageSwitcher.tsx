'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { locales, localeNames, localeFlags, type Locale } from '@/i18n/config';
import { useTransition } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const switchLocale = (newLocale: Locale) => {
    // Save preference to cookie
    document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`;

    startTransition(() => {
      router.replace(pathname, { locale: newLocale });
    });
  };

  return (
    <div className="relative group">
      <button
        className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition ${
          isPending ? 'opacity-50' : ''
        }`}
        disabled={isPending}
      >
        <span className="text-lg">{localeFlags[locale]}</span>
        <span className="hidden lg:inline text-sm text-white">{localeNames[locale]}</span>
        <svg
          className="w-3 h-3 text-gray-400 transition-transform duration-200 group-hover:rotate-180"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      <div className="absolute right-0 mt-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 min-w-[140px]">
        {locales.map((loc) => (
          <button
            key={loc}
            onClick={() => switchLocale(loc)}
            disabled={isPending}
            className={`flex items-center gap-3 w-full px-4 py-2.5 hover:bg-gray-700 transition first:rounded-t-lg last:rounded-b-lg ${
              loc === locale
                ? 'text-green-400 bg-gray-700/50'
                : 'text-white'
            }`}
          >
            <span className="text-lg">{localeFlags[loc]}</span>
            <span className="text-sm">{localeNames[loc]}</span>
            {loc === locale && (
              <svg className="w-4 h-4 ml-auto text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
