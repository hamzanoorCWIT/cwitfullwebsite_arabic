import type { TextDirection } from "@/app/lib/direction-preference";

export type AppLocale = "en" | "ar";

export const DEFAULT_LOCALE: AppLocale = "ar";
export const LOCALE_COOKIE_NAME = "cwit-lang";
export const LOCALE_STORAGE_KEY = "cwit-lang";

export const LOCALE_DIRECTION: Record<AppLocale, TextDirection> = {
  en: "ltr",
  ar: "rtl",
};

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === "en" || value === "ar";
}

export function resolveLocale(value: string | null | undefined): AppLocale {
  return isAppLocale(value) ? value : DEFAULT_LOCALE;
}

export function localeToHtmlLang(locale: AppLocale): string {
  return locale === "ar" ? "ar" : "en";
}

export function getHomePageIdForLocale(locale: AppLocale): string | undefined {
  const arabicId = process.env.NEXT_PUBLIC_HOME_PAGE_ID_AR?.trim();
  const defaultId = process.env.NEXT_PUBLIC_HOME_PAGE_ID?.trim();
  if (locale === "ar") return arabicId || defaultId;
  return defaultId || arabicId;
}

export function getWordPressGraphqlEndpointForLocale(locale: AppLocale): string {
  const arabicEndpoint =
    process.env.WORDPRESS_GRAPHQL_URL_AR?.trim() ||
    process.env.NEXT_PUBLIC_WP_GRAPHQL_URL_AR?.trim();
  const defaultEndpoint =
    process.env.WORDPRESS_GRAPHQL_URL?.trim() ||
    process.env.NEXT_PUBLIC_WP_GRAPHQL_URL?.trim() ||
    "";
  if (locale === "ar") return arabicEndpoint || defaultEndpoint;
  return defaultEndpoint || arabicEndpoint || "";
}

export function getWordpressLanguageHeaders(locale: AppLocale): Record<string, string> {
  return {
    "X-WPML-Language": locale,
    "Accept-Language": locale === "ar" ? "ar" : "en",
  };
}

export function readStoredLocale(): AppLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const saved = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return resolveLocale(saved);
  } catch {
    return DEFAULT_LOCALE;
  }
}

export function writeStoredLocale(locale: AppLocale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // ignore quota / private-mode failures
  }
}

export function writeLocaleCookie(locale: AppLocale) {
  if (typeof document === "undefined") return;
  document.cookie = `${LOCALE_COOKIE_NAME}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}
