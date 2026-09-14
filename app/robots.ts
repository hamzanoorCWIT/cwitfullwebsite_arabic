import type { MetadataRoute } from "next";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";
import { LEGACY_STUDIO_ROUTES } from "@/app/lib/studio-routes";
import { STAGING_ROUTE_PREFIXES } from "@/app/lib/staging-routes";

/** Legacy paths that only redirect — no value in crawling. */
const LEGACY_REDIRECT_PREFIXES = [
  "/portfolio",
  "/work",
  "/work-details",
  LEGACY_STUDIO_ROUTES.digitalExperience,
  LEGACY_STUDIO_ROUTES.applicationDevelopment,
  LEGACY_STUDIO_ROUTES.growthBranding,
  LEGACY_STUDIO_ROUTES.aiAndThings,
] as const;

function isIndexableSite(siteUrl: string): boolean {
  try {
    const { hostname } = new URL(siteUrl);
    if (hostname === "localhost" || hostname === "127.0.0.1") return false;
    if (hostname.endsWith(".local")) return false;
  } catch {
    return false;
  }

  // Preview / staging deploys should not be indexed.
  if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production") {
    return false;
  }

  return process.env.NODE_ENV === "production";
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getFrontendSiteUrl().replace(/\/+$/, "");
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  if (!isIndexableSite(siteUrl)) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      sitemap: sitemapUrl,
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        ...STAGING_ROUTE_PREFIXES,
        ...LEGACY_REDIRECT_PREFIXES,
        "/api/",
      ],
    },
    host: siteUrl,
    sitemap: sitemapUrl,
  };
}
