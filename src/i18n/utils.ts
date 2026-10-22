import { getRelativeLocaleUrl } from 'astro:i18n';

/** Keep in sync with `i18n.locales` in astro.config.mjs. */
export const locales = ['en', 'es', 'ca'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

/** Native names, used by the language switcher. */
export const localeLabels: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  ca: 'Català',
};

export const isLocale = (value: string | undefined): value is Locale =>
  locales.includes(value as Locale);

export const getLocale = (current: string | undefined): Locale =>
  isLocale(current) ? current : defaultLocale;

/** Locales that carry a URL prefix (everything but the default). */
export const prefixedLocales = locales.filter((l) => l !== defaultLocale);

/** Site `base` without a trailing slash (`''` when served from the root). */
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

/**
 * `/<base>/es/docs/auth/` -> `/docs/auth/`. Removes the site `base` and the locale
 * prefix, so the result can be fed back to `localizedUrl()` (which re-adds both).
 */
export function stripLocale(pathname: string): string {
  const path = base && pathname.startsWith(base) ? pathname.slice(base.length) || '/' : pathname;
  const match = path.match(new RegExp(`^/(${prefixedLocales.join('|')})(?=/|$)`));
  return match ? path.slice(match[0].length) || '/' : path;
}

/** Locale-aware URL for a locale-less path (e.g. `/docs/auth`). */
export const localizedUrl = (locale: Locale, path = '/') => getRelativeLocaleUrl(locale, path);

/** Compare URLs ignoring trailing slashes. */
export const samePath = (a: string, b: string) =>
  a.replace(/\/+$/, '') === b.replace(/\/+$/, '');

/** Translated entries live under `src/content/docs/<locale>/`. */
export const hasLocalePrefix = (id: string) =>
  prefixedLocales.some((l) => id.startsWith(`${l}/`));
