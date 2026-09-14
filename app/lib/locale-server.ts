import { cookies, headers } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  isAppLocale,
  resolveLocale,
  type AppLocale,
} from "@/app/lib/locale";

export const LOCALE_REQUEST_HEADER = "x-cwit-lang";

export async function resolveRequestLocale(
  explicit?: string | null
): Promise<AppLocale> {
  if (isAppLocale(explicit)) return explicit;
  try {
    const headerStore = await headers();
    const fromHeader = headerStore.get(LOCALE_REQUEST_HEADER);
    if (isAppLocale(fromHeader)) return fromHeader;
  } catch {
    // headers() is unavailable in some non-request contexts
  }
  try {
    const store = await cookies();
    return resolveLocale(store.get(LOCALE_COOKIE_NAME)?.value);
  } catch {
    return DEFAULT_LOCALE;
  }
}
