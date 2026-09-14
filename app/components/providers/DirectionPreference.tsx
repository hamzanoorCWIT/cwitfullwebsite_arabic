"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from "react";
import {
  DEFAULT_TEXT_DIRECTION,
  writeStoredDirection,
  type TextDirection,
} from "@/app/lib/direction-preference";
import {
  DEFAULT_LOCALE,
  LOCALE_DIRECTION,
  readStoredLocale,
  writeLocaleCookie,
  writeStoredLocale,
  type AppLocale,
} from "@/app/lib/locale";

type DirectionPreferenceContextValue = {
  locale: AppLocale;
  direction: TextDirection;
  setLocale: (locale: AppLocale) => void;
  setDirection: (direction: TextDirection) => void;
};

const DirectionPreferenceContext = createContext<DirectionPreferenceContextValue>({
  locale: DEFAULT_LOCALE,
  direction: DEFAULT_TEXT_DIRECTION,
  setLocale: () => {},
  setDirection: () => {},
});

export function DirectionPreferenceProvider({
  children,
  initialLocale = DEFAULT_LOCALE,
}: {
  children: React.ReactNode;
  initialLocale?: AppLocale;
}) {
  const [locale, setLocaleState] = useState<AppLocale>(initialLocale);
  const direction = LOCALE_DIRECTION[locale];

  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    const next = fromUrl === "en" || fromUrl === "ar" ? fromUrl : readStoredLocale();
    setLocaleState(next);
    writeStoredLocale(next);
    writeLocaleCookie(next);
    writeStoredDirection(LOCALE_DIRECTION[next]);
  }, []);

  const setLocale = useCallback((next: AppLocale) => {
    setLocaleState(next);
    writeStoredLocale(next);
    writeLocaleCookie(next);
    writeStoredDirection(LOCALE_DIRECTION[next]);
  }, []);

  const setDirection = useCallback((next: TextDirection) => {
    setLocale(next === "rtl" ? "ar" : "en");
  }, [setLocale]);

  const value = useMemo(
    () => ({ locale, direction, setLocale, setDirection }),
    [locale, direction, setLocale, setDirection]
  );

  return (
    <DirectionPreferenceContext.Provider value={value}>
      {children}
    </DirectionPreferenceContext.Provider>
  );
}

export function useDirectionPreference() {
  return useContext(DirectionPreferenceContext);
}

export function useLocalePreference() {
  return useContext(DirectionPreferenceContext);
}
