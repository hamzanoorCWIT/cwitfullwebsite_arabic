import type { Metadata } from "next";
import type { YoastSeo, YoastSeoImage } from "@/app/lib/home-seo-api";
import {
  getFrontendSiteUrl,
  getWordPressSiteUrl,
  replaceWordPressSiteUrl,
  rewriteSchemaUrls,
} from "@/app/lib/seo-url";

function pickImage(image?: YoastSeoImage | null) {
  if (!image?.sourceUrl?.trim()) return undefined;

  return {
    url: image.sourceUrl,
    alt: image.altText || undefined,
  };
}

function parseRobotsIndex(
  value: boolean | string | null | undefined
): boolean | undefined {
  if (value == null) return undefined;
  if (typeof value === "boolean") return !value;
  const normalized = value.toLowerCase().trim();
  if (normalized === "noindex") return false;
  if (normalized === "index") return true;
  return undefined;
}

function parseRobotsFollow(
  value: boolean | string | null | undefined
): boolean | undefined {
  if (value == null) return undefined;
  if (typeof value === "boolean") return !value;
  const normalized = value.toLowerCase().trim();
  if (normalized === "nofollow") return false;
  if (normalized === "follow") return true;
  return undefined;
}

function buildRobots(seo: YoastSeo): Metadata["robots"] | undefined {
  const index = parseRobotsIndex(seo.metaRobotsNoindex);
  const follow = parseRobotsFollow(seo.metaRobotsNofollow);

  if (index == null && follow == null) {
    return undefined;
  }

  return { index, follow };
}

export function yoastSeoToMetadata(seo: YoastSeo | null): Metadata {
  if (!seo) return {};

  const wpSiteUrl = getWordPressSiteUrl();
  const frontendSiteUrl = getFrontendSiteUrl();

  const title = seo.title?.trim() || undefined;
  const description = seo.metaDesc?.trim() || undefined;

  const openGraphTitle = seo.opengraphTitle?.trim() || title;
  const openGraphDescription = seo.opengraphDescription?.trim() || description;
  const openGraphImage = pickImage(seo.opengraphImage);

  const twitterTitle =
    seo.twitterTitle?.trim() || seo.opengraphTitle?.trim() || title;
  const twitterDescription =
    seo.twitterDescription?.trim() ||
    seo.opengraphDescription?.trim() ||
    description;
  const twitterImage =
    pickImage(seo.twitterImage) || openGraphImage;

  const canonical = replaceWordPressSiteUrl(seo.canonical, wpSiteUrl, frontendSiteUrl);
  const openGraphUrl = replaceWordPressSiteUrl(
    seo.opengraphUrl,
    wpSiteUrl,
    frontendSiteUrl
  );

  const metadata: Metadata = {};

  if (title) metadata.title = title;
  if (description) metadata.description = description;
  if (canonical) metadata.alternates = { canonical };

  const robots = buildRobots(seo);
  if (robots) metadata.robots = robots;

  const openGraph: NonNullable<Metadata["openGraph"]> = {};
  if (openGraphTitle) openGraph.title = openGraphTitle;
  if (openGraphDescription) openGraph.description = openGraphDescription;
  if (openGraphUrl) openGraph.url = openGraphUrl;
  if (seo.opengraphSiteName?.trim()) {
    openGraph.siteName = seo.opengraphSiteName.trim();
  }
  if (openGraphImage) openGraph.images = [openGraphImage];
  if (Object.keys(openGraph).length > 0) metadata.openGraph = openGraph;

  const twitter: NonNullable<Metadata["twitter"]> = {
    card: twitterImage ? "summary_large_image" : "summary",
  };
  if (twitterTitle) twitter.title = twitterTitle;
  if (twitterDescription) twitter.description = twitterDescription;
  if (twitterImage?.url) twitter.images = [twitterImage.url];
  metadata.twitter = twitter;

  return metadata;
}

function parseJsonLd(raw: string): unknown | null {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function getYoastJsonLdData(seo: YoastSeo | null): unknown | null {
  const raw = seo?.schema?.raw?.trim();
  if (!raw) return null;

  const parsed = parseJsonLd(raw);
  if (parsed == null) return null;

  return rewriteSchemaUrls(
    parsed,
    getWordPressSiteUrl(),
    getFrontendSiteUrl()
  );
}

export function getJsonLdScriptContent(seo: YoastSeo | null): string | null {
  const data = getYoastJsonLdData(seo);
  return data == null ? null : serializeJsonLd(data);
}
