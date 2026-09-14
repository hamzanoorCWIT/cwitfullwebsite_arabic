"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/app/components/ui/Header";
import Footer from "@/app/components/sections/Footer";
import FigmaHomeGetStarted from "@/app/components/sections/FigmaHomeGetStarted";
import { USE_COMPACT_FOOTER } from "@/app/components/sections/footer-config";
import WhatsAppChat from "@/app/components/ui/WhatsAppChat";
import WhatsAppButton from "@/app/components/ui/WhatsAppButton";
import SmoothScrollProvider from "./SmoothScrollProvider";
import {
  DirectionPreferenceProvider,
  useDirectionPreference,
} from "./DirectionPreference";
import type { SiteSettings } from "@/app/lib/site-settings-api";
import type { AppLocale } from "@/app/lib/locale";

interface AppShellProps {
  children: React.ReactNode;
  siteSettings: SiteSettings;
  initialLocale?: AppLocale;
}

function isWorkDetailsPage(pathname: string) {
  return (
    /^\/portfolio\/[^/]+/.test(pathname) ||
    /^\/work-details\/[^/]+/.test(pathname)
  );
}

function usesPageSpecificFooter(pathname: string) {
  return pathname.startsWith("/services/ai-and-things");
}

function AppShellInner({ children, siteSettings }: AppShellProps) {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const pathname = usePathname();
  const { locale, direction } = useDirectionPreference();
  // Arabic RTL for the whole site shell (home, services, and other pages).
  const applyRtl = direction === "rtl";
  const pageSpecificFooter = usesPageSpecificFooter(pathname ?? "");
  const showGetStarted =
    USE_COMPACT_FOOTER &&
    !pageSpecificFooter &&
    !isWorkDetailsPage(pathname ?? "") &&
    ![
      "/mobile-app",
      "/web-app",
      "/logo-app",
      "/seo-app",
      "/security-app",
      "/marketing-app",
      "/salesforce",
      "/ecommerce-app",
      "/wordpress",
      "/react",
      "/flutter-app",
      "/real-estate",
      "/education",
      "/healthcare",
      "/retail-ecommerce",
      "/banking",
      "/digital-solutions",
      "/privacy-policy",
      "/terms-and-conditions",
    ].some((route) => (pathname ?? "").startsWith(route));

  useEffect(() => {
    if (!applyRtl) return;
    const timeoutId = window.setTimeout(() => {
      void import("@/app/lib/scroll-navigation").then(({ refreshScrollTriggersAfterNavigation }) => {
        refreshScrollTriggersAfterNavigation();
      });
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [applyRtl, pathname, locale]);

  return (
    <SmoothScrollProvider>
      <div
        dir={applyRtl ? "rtl" : "ltr"}
        className={applyRtl ? "home-page-rtl" : undefined}
        suppressHydrationWarning
      >
        <Header settings={siteSettings.header} />
        <div dir="ltr">
          <WhatsAppButton onClick={() => setIsChatOpen(!isChatOpen)} />
          <WhatsAppChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
        <div key={`${pathname ?? ""}-${locale}`}>
          {children}
          {showGetStarted ? <FigmaHomeGetStarted /> : null}
          {pageSpecificFooter ? null : <Footer settings={siteSettings.footer} />}
        </div>
      </div>
    </SmoothScrollProvider>
  );
}

export default function AppShell({
  children,
  siteSettings,
  initialLocale,
}: AppShellProps) {
  return (
    <DirectionPreferenceProvider initialLocale={initialLocale}>
      <AppShellInner siteSettings={siteSettings}>{children}</AppShellInner>
    </DirectionPreferenceProvider>
  );
}
