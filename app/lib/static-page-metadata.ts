import type { Metadata } from "next";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";

const SITE_NAME = "CWIT";

type StaticPageMetadataInput = {
  /** Route path with leading and trailing slash, e.g. "/mobile-app/". */
  path: string;
  title: string;
  description: string;
  /** Optional absolute or root-relative Open Graph image URL. */
  ogImage?: string;
};

/**
 * Builds indexable SEO metadata for the hardcoded landing pages that are not
 * backed by WordPress/Yoast. Ensures each page ships a title, description,
 * canonical, Open Graph, Twitter card, and an explicit `index, follow` robots
 * directive instead of rendering with no metadata (which leaves them out of
 * search results).
 */
export function buildStaticPageMetadata({
  path,
  title,
  description,
  ogImage,
}: StaticPageMetadataInput): Metadata {
  const base = getFrontendSiteUrl().replace(/\/+$/, "");
  const url = `${base}${path}`;
  const images = ogImage ? [ogImage] : undefined;

  return {
    title,
    description,
    alternates: { canonical: url },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      title,
      description,
      url,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: images ? "summary_large_image" : "summary",
      title,
      description,
      ...(images ? { images } : {}),
    },
  };
}
