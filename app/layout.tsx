import type { Metadata } from "next";
import "./globals.css";
import "./home-rtl.css";
import GoogleAnalytics from "@/app/components/analytics/GoogleAnalytics";
import MicrosoftClarity from "@/app/components/analytics/MicrosoftClarity";
import AppShell from "./components/providers/AppShell";
import { fetchSiteSettings } from "@/app/lib/site-settings-api";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";
import { localeToHtmlLang } from "@/app/lib/locale";
import { resolveRequestLocale } from "@/app/lib/locale-server";

export const metadata: Metadata = {
  metadataBase: new URL(getFrontendSiteUrl()),
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await resolveRequestLocale();
  const siteSettings = await fetchSiteSettings();
  return (
    <html lang={localeToHtmlLang(locale)} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body
        className="antialiased bg-black text-white font-graphik"
        suppressHydrationWarning
      >
        <GoogleAnalytics />
        <MicrosoftClarity />
        <AppShell initialLocale={locale} siteSettings={siteSettings}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
