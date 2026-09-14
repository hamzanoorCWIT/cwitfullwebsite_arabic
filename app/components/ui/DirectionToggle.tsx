"use client";

import { usePathname } from "next/navigation";
import { useLocalePreference } from "@/app/components/providers/DirectionPreference";
import { killAllScrollTriggers } from "@/app/lib/scroll-navigation";
import type { AppLocale } from "@/app/lib/locale";

const OPTIONS: Array<{ value: AppLocale; label: string }> = [
  { value: "en", label: "EN" },
  { value: "ar", label: "AR" },
];

export default function DirectionToggle() {
  const { locale, setLocale } = useLocalePreference();
  const pathname = usePathname();

  const choose = (next: AppLocale) => {
    if (next === locale) return;
    // Soft refresh leaves GSAP/client sections half-mounted (hidden until hard reload).
    killAllScrollTriggers();
    setLocale(next);
    const params = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : ""
    );
    params.set("lang", next);
    const href = `${pathname}?${params.toString()}`;
    window.location.assign(href);
  };

  return (
    <div
      role="group"
      dir="ltr"
      aria-label="Language"
      className="flex overflow-hidden rounded-full border border-black/10 bg-white text-[10px] font-medium sm:text-[11px] md:text-xs"
    >
      {OPTIONS.map((option) => {
        const isActive = locale === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => choose(option.value)}
            className={`px-2.5 py-1.5 transition-colors duration-200 sm:px-3 ${
              isActive
                ? "bg-black text-white"
                : "text-[#2C2C2C] hover:bg-black/5"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
