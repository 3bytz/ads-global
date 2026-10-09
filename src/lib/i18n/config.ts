/**
 * Locale routing.
 *
 * Every public page lives under `src/app/[locale]/…`. Today only English is
 * enabled and it is served WITHOUT a URL prefix (`/about`, not `/en/about`):
 * the proxy rewrites unprefixed paths to `/en/…` internally.
 *
 * To add French or Chinese later: add the code to `locales`, add a dictionary
 * in `src/lib/i18n/dictionaries`, translate DB content (translation columns
 * are planned in the content tables) and the proxy will start serving `/fr/…`.
 * No page needs to move.
 */
export const locales = ["en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

/** Planned, not enabled (ask before enabling — see brief §4 "Optional"). */
export const plannedLocales = ["fr", "zh"] as const;

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Build a public href for a locale. Default locale has no prefix. */
export function localizedHref(path: string, locale: Locale = defaultLocale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === defaultLocale) return clean;
  return clean === "/" ? `/${locale}` : `/${locale}${clean}`;
}

export const htmlLang: Record<Locale, string> = { en: "en" };
