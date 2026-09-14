import type { MetadataRoute } from "next";
import { STUDIO_ROUTES } from "@/app/lib/studio-routes";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";
import {
  fetchBlogSitemapEntries,
  fetchPortfolioSitemapEntries,
  fetchWpPageSitemapEntries,
  type SitemapPathEntry,
} from "@/app/lib/sitemap-data";

export const revalidate = 3600;

/** Public Next.js routes that should always appear in the sitemap. */
const STATIC_PATHS: Array<{ path: string; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"]; priority: number }> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about-us", changeFrequency: "monthly", priority: 0.8 },
  { path: "/services", changeFrequency: "weekly", priority: 0.9 },
  { path: STUDIO_ROUTES.digitalExperience, changeFrequency: "monthly", priority: 0.8 },
  { path: STUDIO_ROUTES.applicationDevelopment, changeFrequency: "monthly", priority: 0.8 },
  { path: STUDIO_ROUTES.growthBranding, changeFrequency: "monthly", priority: 0.8 },
  { path: STUDIO_ROUTES.aiAndThings, changeFrequency: "monthly", priority: 0.8 },
  { path: "/our-work", changeFrequency: "weekly", priority: 0.9 },
  { path: "/blogs", changeFrequency: "daily", priority: 0.8 },
  { path: "/contact-us", changeFrequency: "monthly", priority: 0.7 },
  // Service & industry landing pages (hardcoded routes with static SEO metadata).
  { path: "/mobile-app", changeFrequency: "monthly", priority: 0.7 },
  { path: "/web-app", changeFrequency: "monthly", priority: 0.7 },
  { path: "/logo-app", changeFrequency: "monthly", priority: 0.7 },
  { path: "/seo-app", changeFrequency: "monthly", priority: 0.7 },
  { path: "/security-app", changeFrequency: "monthly", priority: 0.7 },
  { path: "/marketing-app", changeFrequency: "monthly", priority: 0.7 },
  { path: "/salesforce", changeFrequency: "monthly", priority: 0.7 },
  { path: "/ecommerce-app", changeFrequency: "monthly", priority: 0.7 },
  { path: "/wordpress", changeFrequency: "monthly", priority: 0.7 },
  { path: "/react", changeFrequency: "monthly", priority: 0.7 },
  { path: "/flutter-app", changeFrequency: "monthly", priority: 0.7 },
  { path: "/real-estate", changeFrequency: "monthly", priority: 0.7 },
  { path: "/education", changeFrequency: "monthly", priority: 0.7 },
  { path: "/healthcare", changeFrequency: "monthly", priority: 0.7 },
  { path: "/retail-ecommerce", changeFrequency: "monthly", priority: 0.7 },
  { path: "/banking", changeFrequency: "monthly", priority: 0.7 },
  { path: "/digital-solutions", changeFrequency: "monthly", priority: 0.7 },
  { path: "/fmcg", changeFrequency: "monthly", priority: 0.7 },
  { path: "/technology", changeFrequency: "monthly", priority: 0.7 },
  { path: "/energy", changeFrequency: "monthly", priority: 0.7 },
  { path: "/ui-ux-app", changeFrequency: "monthly", priority: 0.7 },
];

function absoluteUrl(base: string, path: string): string {
  const origin = base.replace(/\/+$/, "");
  if (path === "/") return `${origin}/`;
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

function toSitemapItem(
  base: string,
  entry: SitemapPathEntry,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"],
  priority: number
): MetadataRoute.Sitemap[number] {
  return {
    url: absoluteUrl(base, entry.path),
    lastModified: entry.lastModified ?? new Date(),
    changeFrequency,
    priority,
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getFrontendSiteUrl();

  const staticEntries = STATIC_PATHS.map((item) =>
    toSitemapItem(base, { path: item.path }, item.changeFrequency, item.priority)
  );

  const [blogs, portfolios, wpPages] = await Promise.all([
    fetchBlogSitemapEntries(),
    fetchPortfolioSitemapEntries(),
    fetchWpPageSitemapEntries(),
  ]);

  const seen = new Set(staticEntries.map((item) => item.url));
  const dynamicEntries: MetadataRoute.Sitemap = [];

  for (const entry of blogs) {
    const item = toSitemapItem(base, entry, "weekly", 0.7);
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    dynamicEntries.push(item);
  }

  for (const entry of portfolios) {
    const item = toSitemapItem(base, entry, "monthly", 0.7);
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    dynamicEntries.push(item);
  }

  for (const entry of wpPages) {
    const item = toSitemapItem(base, entry, "monthly", 0.5);
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    dynamicEntries.push(item);
  }

  return [...staticEntries, ...dynamicEntries];
}
