/**
 * Yoast SEO helpers for Leading Services landing routes.
 * CMS/Yoast only — static metadata fallback is disabled.
 */

import type { Metadata } from "next";
import {
  fetchSeoByLeadingServiceId,
  fetchSeoByLeadingServiceSlug,
  fetchSeoByUri,
  type YoastSeo,
} from "@/app/lib/home-seo-api";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";
// import { buildStaticPageMetadata } from "@/app/lib/static-page-metadata";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";

function normalizePath(path: string): string {
  const trimmed = path.trim();
  if (!trimmed) return "/";
  const withLead = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withLead.endsWith("/") ? withLead : `${withLead}/`;
}

function envDatabaseIdForRoute(routeSlug: string): string {
  const key = `LEADING_SERVICE_${routeSlug
    .toUpperCase()
    .replace(/-/g, "_")}_ID`;
  return process.env[key]?.trim() || "";
}

export function applyLandingSeoFallbacks(
  seo: YoastSeo | null,
  path: string
): YoastSeo | null {
  if (!seo) return null;

  const fallbackUrl = `${getFrontendSiteUrl().replace(/\/+$/, "")}${normalizePath(path)}`;

  return {
    ...seo,
    canonical: seo.canonical?.trim() || fallbackUrl,
    opengraphUrl: seo.opengraphUrl?.trim() || fallbackUrl,
  };
}

/**
 * Resolve Yoast SEO for a landing route from the leading_service CPT
 * (and optionally a matching Page URI as a last resort).
 */
export async function fetchLandingYoastSeo(options: {
  routeSlug: string;
  path: string;
  databaseId?: string | number | null;
}): Promise<YoastSeo | null> {
  const routeSlug = options.routeSlug.replace(/^\/+|\/+$/g, "").trim();
  const path = normalizePath(options.path || `/${routeSlug}/`);
  const databaseId =
    String(options.databaseId || "").trim() ||
    envDatabaseIdForRoute(routeSlug) ||
    process.env.LEADING_SERVICE_PAGE_ID?.trim() ||
    "";

  try {
    if (databaseId) {
      const byId = await fetchSeoByLeadingServiceId(databaseId);
      if (byId) return applyLandingSeoFallbacks(byId, path);
    }

    if (routeSlug) {
      const bySlug = await fetchSeoByLeadingServiceSlug(routeSlug);
      if (bySlug) return applyLandingSeoFallbacks(bySlug, path);
    }

    // Fallback: Page at the frontend path, if one exists in WP.
    const byUri = await fetchSeoByUri(path);
    if (byUri) return applyLandingSeoFallbacks(byUri, path);

    // CPT archive-style URI used by some WP setups.
    if (routeSlug) {
      const byCptUri = await fetchSeoByUri(`/leading-services/${routeSlug}/`);
      if (byCptUri) return applyLandingSeoFallbacks(byCptUri, path);
    }
  } catch (error) {
    console.error(`[landing-seo:${routeSlug || path}] Failed to fetch Yoast SEO:`, error);
  }

  return null;
}

export async function generateLandingMetadata(options: {
  routeSlug: string;
  path: string;
  databaseId?: string | number | null;
  /** @deprecated Static fallback disabled — Yoast only. Kept optional for call-site compatibility. */
  fallback?: {
    title: string;
    description: string;
    ogImage?: string;
  };
}): Promise<Metadata> {
  const path = normalizePath(options.path);

  try {
    const seo = await fetchLandingYoastSeo({
      routeSlug: options.routeSlug,
      path,
      databaseId: options.databaseId,
    });
    return yoastSeoToMetadata(seo);
  } catch (error) {
    console.error(`[landing-seo:${options.routeSlug}] generateMetadata failed:`, error);
  }

  // Static metadata fallback — disabled; Yoast/CMS only.
  // if (options.fallback) {
  //   return buildStaticPageMetadata({
  //     path,
  //     title: options.fallback.title,
  //     description: options.fallback.description,
  //     ogImage: options.fallback.ogImage,
  //   });
  // }

  return {};
}
