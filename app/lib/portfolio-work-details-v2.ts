import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { sanitizeCmsHtml } from "@/app/lib/sanitize-cms-html";
import { portfolioDetailPath, normalizePortfolioDetailHref } from "@/app/lib/portfolio-url";
import type { SliderCard } from "@/app/components/ui/HorizontalScrollSlider";
import type { PortfolioBySlug, PortfolioDetailsFields } from "@/app/lib/our-work-api";
import { resolveImageUrl, resolveMediaVideoUrl } from "@/app/lib/our-work-api";
import { mapPortfolioToOurWorkListingItem } from "@/app/lib/portfolio-listing-card-map";

export type WorkDetailsV2Metric = { title: string; value: string };

export type WorkDetailsV2Testimonial = {
  quoteHtml: string;
  author: string;
  role: string;
};

export type WorkDetailsV2RelatedItem = {
  title: string;
  description: string;
  image?: string;
  href?: string;
};

export type WorkDetailsV2ViewModel = {
  overviewHtml: string;
  brandLogoUrl?: string;
  brandLogoAlt?: string;
  deliverablesLabel: string;
  deliverablesText: string;
  platformsText: string;
  heroImage?: string;
  heroVideoSrc?: string;
  heroImageMobile?: string;
  heroVideoSrcMobile?: string;
  heroAlt: string;
  storyTitle: string;
  storyHtml: string;
  chips: string[];
  metrics: WorkDetailsV2Metric[];
  featureImage?: string;
  featureVideoSrc?: string;
  featureImageMobile?: string;
  featureVideoSrcMobile?: string;
  featureAlt: string;
  showcaseCards: SliderCard[];
  testimonials: WorkDetailsV2Testimonial[];
  contactHeadingSub: string;
  contactHeadingMain: string;
  relatedWork: WorkDetailsV2RelatedItem[];
  relatedWorkCtaLabel: string;
};

type ExtendedPortfolioDetails = PortfolioDetailsFields & {
  overviewHeadline?: string | null;
  overviewHighlight?: string | null;
  brandLogo?: { node?: { sourceUrl?: string | null; altText?: string | null } | null } | null;
  platforms?: string | null;
  showcaseCards?: Array<{
    cardType?: string | string[] | null;
    title?: string | null;
    subtitle?: string | null;
    description?: string | null;
    image?: {
      node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; altText?: string | null } | null;
    } | null;
    backgroundClass?: string | null;
    textColorClass?: string | null;
  } | null> | null;
  capabilityCards?: Array<{
    cardHeading?: string | null;
    cardSubtext?: string | null;
  } | null> | null;
  contactHeadingSub?: string | null;
  contactHeadingMain?: string | null;
};

type ExtendedTestimonial = {
  testimonialText?: string | null;
  testimonialRating?: number | null;
  testimonialAuthor?: string | null;
  testimonialRole?: string | null;
};

function stripHtml(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function sanitizeStoryHtml(html: string): string {
  return sanitizeCmsHtml(html, { rich: true })
    .replace(/\sclass="[^"]*"/gi, "")
    .replace(/\sclass='[^']*'/gi, "")
    .trim();
}

function asStoryHtml(value: string | null | undefined): string {
  if (!value?.trim()) return "";
  const html = /<[a-z][\s\S]*>/i.test(value) ? value.trim() : normalizeDescriptionHtml(value);
  return sanitizeStoryHtml(html);
}

function asHtml(value: string | null | undefined, preserveRichText = false): string {
  if (!value?.trim()) return "";
  if (preserveRichText || /<[a-z][\s\S]*>/i.test(value)) {
    return sanitizeCmsHtml(value.trim(), { rich: true });
  }
  return normalizeDescriptionHtml(value);
}

function appendOverviewHighlight(headlineHtml: string, highlight: string): string {
  if (!highlight.trim()) return headlineHtml;

  const trimmedHeadline = headlineHtml.trim();
  if (trimmedHeadline.includes(highlight)) {
    if (/<strong[^>]*>[\s\S]*?<\/strong>/i.test(trimmedHeadline)) {
      return trimmedHeadline;
    }
    return trimmedHeadline.replace(highlight, `<strong>${highlight}</strong>`);
  }

  const strong = `<strong>${highlight}</strong>`;
  if (/<\/p>\s*$/i.test(trimmedHeadline)) {
    return trimmedHeadline.replace(/<\/p>\s*$/i, ` ${strong}</p>`);
  }

  return `${trimmedHeadline} ${strong}`;
}

function buildOverviewHtml(
  pd: ExtendedPortfolioDetails | null | undefined,
  portfolioTitle: string
): string {
  const headline = pd?.overviewHeadline?.trim();
  const highlight = pd?.overviewHighlight?.trim();

  if (headline) {
    const headlineHtml = asHtml(headline, true);
    return highlight ? appendOverviewHighlight(headlineHtml, highlight) : headlineHtml;
  }

  const description = pd?.description?.trim() || "";

  if (description && highlight) {
    const plain = stripHtml(description);
    if (plain.includes(highlight)) {
      return description.replace(
        highlight,
        `<strong>${highlight}</strong>`
      );
    }
    return `${asHtml(description)} <strong>${highlight}</strong>`;
  }

  if (description) return asHtml(description);
  return "";
}

function joinNames(
  items: Array<{ [key: string]: string | null | undefined } | null> | null | undefined,
  key: string
): string {
  return (items ?? [])
    .filter(Boolean)
    .map((item) => item?.[key]?.trim())
    .filter(Boolean)
    .join(", ");
}

function mapShowcaseCards(pd: ExtendedPortfolioDetails | null | undefined): SliderCard[] {
  const fromCms = (pd?.showcaseCards ?? [])
    .filter(Boolean)
    .map((item) => {
      const imgUrl =
        resolveImageUrl(item?.image?.node?.sourceUrl) ??
        resolveImageUrl(item?.image?.node?.mediaItemUrl);
      const cardTypeValue = Array.isArray(item?.cardType)
        ? item.cardType.find((value) => typeof value === "string" && value.trim())
        : item?.cardType;
      const rawType = cardTypeValue?.trim().toLowerCase().replace(/[\s-]+/g, "_");
      const type =
        rawType?.includes("image") ? ("image" as const)
        : rawType?.includes("text") ? ("text" as const)
        : imgUrl ? ("image" as const)
        : ("text" as const);

      return {
        type,
        title: item?.title?.trim() || "",
        subtitle: item?.subtitle?.trim() || undefined,
        description: item?.description?.trim()?.replace(/\n/g, "\n") || undefined,
        image: imgUrl,
        backgroundColor: item?.backgroundClass?.trim() || undefined,
        textColor: item?.textColorClass?.trim() || undefined,
      };
    })
    .filter((card) => card.title || card.description || card.image);

  return fromCms;
}

function normalizeRelatedHref(link: string | null | undefined): string | undefined {
  const trimmed = link?.trim();
  if (!trimmed) return undefined;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const url = new URL(trimmed);
      if (url.pathname && url.pathname !== "/") {
        return url.pathname.endsWith("/") ? url.pathname.slice(0, -1) : url.pathname;
      }
    } catch {
      return trimmed;
    }
    return trimmed;
  }

  if (trimmed.startsWith("/portfolio/")) {
    return normalizePortfolioDetailHref(trimmed);
  }

  if (trimmed.startsWith("/")) {
    return trimmed.endsWith("/") && trimmed.length > 1 ? trimmed.slice(0, -1) : trimmed;
  }

  return portfolioDetailPath(trimmed);
}

function getRawRelatedWorkNodes(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw.filter(Boolean);
  if (raw && typeof raw === "object") {
    if ("nodes" in raw && Array.isArray((raw as { nodes: unknown[] }).nodes)) {
      return (raw as { nodes: unknown[] }).nodes.filter(Boolean);
    }
    if ("edges" in raw && Array.isArray((raw as { edges: { node: unknown }[] }).edges)) {
      return (raw as { edges: { node: unknown }[] }).edges.map((e) => e?.node).filter(Boolean);
    }
  }
  return [];
}

function mapRelatedWorkItems(
  pd: ExtendedPortfolioDetails | null | undefined
): WorkDetailsV2RelatedItem[] {
  const fromSection = (
    pd as {
      moreWorkItemsSection?: { relatedWorkItems?: unknown } | null;
    } | null
  )?.moreWorkItemsSection?.relatedWorkItems;
  const nodes = getRawRelatedWorkNodes(fromSection ?? pd?.relatedWorkItems);

  return nodes
    .map((raw) => {
      const item = raw as {
        slug?: string | null;
        title?: string | null;
        portfolioDetails?: unknown;
        relatedWorkTitle?: string | null;
        relatedWorkDescription?: string | null;
        relatedWorkLink?: string | null;
        relatedWorkImage?: {
          node?: { sourceUrl?: string | null; mediaItemUrl?: string | null } | null;
        } | null;
      };

      // Preferred: selected Portfolio → Listing Card
      if (item.slug || item.portfolioDetails) {
        const mapped = mapPortfolioToOurWorkListingItem(item);
        if (!mapped) return null;
        const image =
          typeof mapped.image === "string"
            ? mapped.image.trim() || undefined
            : mapped.image?.src?.trim() || undefined;
        return {
          title: mapped.title,
          description: mapped.description || "",
          image,
          href: mapped.link,
        };
      }

      // Legacy repeater rows (manual title/image/link)
      const image =
        resolveImageUrl(item.relatedWorkImage?.node?.sourceUrl) ??
        resolveImageUrl(item.relatedWorkImage?.node?.mediaItemUrl);
      const title = item.relatedWorkTitle?.trim() || "";
      const description = item.relatedWorkDescription?.trim() || "";
      const href = normalizeRelatedHref(item.relatedWorkLink);
      if (!title && !description && !image) return null;
      return { title, description, image, href };
    })
    .filter(Boolean) as WorkDetailsV2RelatedItem[];
}

export function normalizeWorkDetailsV2(
  portfolio: PortfolioBySlug["portfolio"]
): WorkDetailsV2ViewModel | null {
  if (!portfolio) return null;

  const pd = (portfolio.portfolioDetails ?? null) as ExtendedPortfolioDetails | null;
  const portfolioTitle = portfolio.title?.trim() || "";

  const heroImage =
    resolveImageUrl(pd?.backgroundImage?.node?.sourceUrl) ??
    resolveImageUrl(pd?.backgroundImage?.node?.mediaItemUrl) ??
    resolveImageUrl(pd?.heroBackgroundImage?.node?.sourceUrl) ??
    resolveImageUrl(pd?.heroBackgroundImage?.node?.mediaItemUrl);

  const heroVideoSrc =
    resolveMediaVideoUrl(pd?.heroVideoUrl) ?? resolveMediaVideoUrl(pd?.heroVideo);

  const heroImageMobile =
    resolveImageUrl(pd?.heroImageMobile?.node?.sourceUrl) ??
    resolveImageUrl(pd?.heroImageMobile?.node?.mediaItemUrl);

  const heroVideoSrcMobile =
    resolveMediaVideoUrl(pd?.heroVideoMobileUrl) ??
    resolveMediaVideoUrl(pd?.heroVideoMobile);

  const featureImage =
    resolveImageUrl(pd?.fullWidthBackgroundImage?.node?.sourceUrl) ??
    resolveImageUrl(pd?.fullWidthBackgroundImage?.node?.mediaItemUrl) ??
    resolveImageUrl(pd?.stayImage?.node?.sourceUrl ?? pd?.stayImage?.node?.mediaItemUrl);

  const featureVideoSrc =
    resolveMediaVideoUrl(pd?.featureVideoUrl) ?? resolveMediaVideoUrl(pd?.featureVideo);

  const featureImageMobile =
    resolveImageUrl(pd?.featureImageMobile?.node?.sourceUrl) ??
    resolveImageUrl(pd?.featureImageMobile?.node?.mediaItemUrl);

  const featureVideoSrcMobile =
    resolveMediaVideoUrl(pd?.featureVideoMobileUrl) ??
    resolveMediaVideoUrl(pd?.featureVideoMobile);

  const metrics = (pd?.performanceMetrics ?? [])
    .filter(Boolean)
    .map((metric) => ({
      title: metric?.metricTitle?.trim() || "",
      value: metric?.metricValue?.trim() || "",
    }))
    .filter((metric) => metric.title || metric.value);

  const chips = (pd?.servicesList ?? [])
    .map((service) => service?.serviceName?.trim())
    .filter(Boolean) as string[];

  const testimonials = (pd?.testimonials ?? []) as ExtendedTestimonial[];
  const mappedTestimonials: WorkDetailsV2Testimonial[] = testimonials
    .filter((item) => item?.testimonialText?.trim())
    .map((item) => ({
      quoteHtml: asHtml(item.testimonialText!),
      author: item.testimonialAuthor?.trim() || "",
      role: item.testimonialRole?.trim() || "",
    }));

  const relatedFromCms = mapRelatedWorkItems(pd);

  const storyHtml = asStoryHtml(pd?.industryDescription);

  return {
    overviewHtml: buildOverviewHtml(pd, portfolioTitle),
    brandLogoUrl: resolveImageUrl(pd?.brandLogo?.node?.sourceUrl),
    brandLogoAlt: pd?.brandLogo?.node?.altText?.trim() || undefined,
    deliverablesLabel: pd?.deliveredTitle?.trim() || "",
    deliverablesText: joinNames(pd?.deliverables, "deliverableName"),
    platformsText: pd?.platforms?.trim() || "",
    heroImage,
    heroVideoSrc,
    heroImageMobile,
    heroVideoSrcMobile,
    heroAlt:
      pd?.backgroundImage?.node?.altText?.trim() ||
      pd?.heroBackgroundImage?.node?.altText?.trim() ||
      pd?.heroImageMobile?.node?.altText?.trim() ||
      "",
    storyTitle: pd?.industryTitle?.trim() || "",
    storyHtml,
    chips,
    metrics,
    featureImage,
    featureVideoSrc,
    featureImageMobile,
    featureVideoSrcMobile,
    featureAlt:
      pd?.fullWidthBackgroundImageAlt?.trim() ||
      pd?.fullWidthBackgroundImage?.node?.altText?.trim() ||
      pd?.featureImageMobile?.node?.altText?.trim() ||
      pd?.stayImage?.node?.altText?.trim() ||
      "",
    showcaseCards: mapShowcaseCards(pd),
    testimonials: mappedTestimonials,
    contactHeadingSub: pd?.contactHeadingSub?.trim() || "",
    contactHeadingMain: pd?.contactHeadingMain?.trim() || "",
    relatedWork: relatedFromCms,
    relatedWorkCtaLabel: "Complete portfolio",
  };
}
