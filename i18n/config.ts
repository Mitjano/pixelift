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

// Language names in their own language (for switcher)
export const localeNativeNames: Record<Locale, string> = {
  en: 'English',
  pl: 'Polski',
  es: 'Español',
  fr: 'Français'
};
