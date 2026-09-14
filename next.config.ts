import type { NextConfig } from "next";
import type { RemotePattern } from "next/dist/shared/lib/image-config";

function pushPattern(
  patterns: RemotePattern[],
  seen: Set<string>,
  rawUrl: string | undefined
): void {
  if (!rawUrl?.trim()) return;

  try {
    const parsed = new URL(rawUrl.trim());
    const protocol = parsed.protocol.replace(":", "") as "http" | "https";
    const key = `${protocol}://${parsed.hostname}`;
    if (seen.has(key)) return;
    seen.add(key);
    patterns.push({
      protocol,
      hostname: parsed.hostname,
      pathname: "/**",
    });
  } catch {
    // ignore invalid URLs
  }
}

function getImageRemotePatterns(): RemotePattern[] {
  const patterns: RemotePattern[] = [];
  const seen = new Set<string>();

  pushPattern(patterns, seen, process.env.WORDPRESS_SITE_URL);
  pushPattern(patterns, seen, process.env.NEXT_PUBLIC_SITE_URL);
  pushPattern(patterns, seen, process.env.NEXT_PUBLIC_WP_GRAPHQL_URL);
  pushPattern(patterns, seen, process.env.NEXT_PUBLIC_WP_ORIGIN);

  return patterns;
}

import { LEGACY_STUDIO_ROUTES, STUDIO_ROUTES } from "@/app/lib/studio-routes";

const STUDIO_PAGE_REDIRECTS = [
  {
    source: LEGACY_STUDIO_ROUTES.digitalExperience,
    destination: STUDIO_ROUTES.digitalExperience,
  },
  {
    source: `${LEGACY_STUDIO_ROUTES.digitalExperience}/`,
    destination: STUDIO_ROUTES.digitalExperience,
  },
  {
    source: LEGACY_STUDIO_ROUTES.applicationDevelopment,
    destination: STUDIO_ROUTES.applicationDevelopment,
  },
  {
    source: `${LEGACY_STUDIO_ROUTES.applicationDevelopment}/`,
    destination: STUDIO_ROUTES.applicationDevelopment,
  },
  {
    source: LEGACY_STUDIO_ROUTES.growthBranding,
    destination: STUDIO_ROUTES.growthBranding,
  },
  {
    source: `${LEGACY_STUDIO_ROUTES.growthBranding}/`,
    destination: STUDIO_ROUTES.growthBranding,
  },
  {
    source: LEGACY_STUDIO_ROUTES.aiAndThings,
    destination: STUDIO_ROUTES.aiAndThings,
  },
  {
    source: `${LEGACY_STUDIO_ROUTES.aiAndThings}/`,
    destination: STUDIO_ROUTES.aiAndThings,
  },
] as const;

const nextConfig: NextConfig = {
  serverExternalPackages: ["isomorphic-dompurify", "jsdom"],
  images: {
    remotePatterns: getImageRemotePatterns(),
  },
  async redirects() {
    return [
      // Yoast/WP habit URL → Next.js App Router sitemap
      {
        source: "/sitemap_index.xml",
        destination: "/sitemap.xml",
        permanent: true,
      },
      ...STUDIO_PAGE_REDIRECTS.map((redirect) => ({
        ...redirect,
        permanent: true,
      })),
    ];
  },
  async rewrites() {
    const wpSiteUrl =
      process.env.WORDPRESS_SITE_URL?.trim() ||
      process.env.NEXT_PUBLIC_WP_GRAPHQL_URL?.trim()?.replace(/\/graphql\/?$/i, "");

    if (!wpSiteUrl) return [];

    try {
      const wpOrigin = new URL(wpSiteUrl).origin;
      return [
        {
          source: "/wp-content/uploads/:path*",
          destination: `${wpOrigin}/wp-content/uploads/:path*`,
        },
      ];
    } catch {
      return [];
    }
  },
};

export default nextConfig;
