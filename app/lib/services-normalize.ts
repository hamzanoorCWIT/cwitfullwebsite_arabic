/**
 * Normalizes Services page ACF/GraphQL data for section components.
 * CMS-only — no static fallback content (see services-defaults.legacy.ts).
 */

import type { ShowcaseCard } from "@/app/components/sections/ServicesShowcase";
import type { SolutionItem } from "@/app/components/sections/FullScaleSolutions";
import type {
  AcfImageNode,
  ServicesPageFields,
  ServicesPortfolioNode,
  ServicesStudioCardNode,
  ServicesStudioNode,
} from "@/app/lib/services-api";
import {
  type ServicesStudioKey,
  type ServicesStudioSection,
  type ServicesTitleLayout,
} from "@/app/lib/services-defaults";
import { applyServicesShowcaseCardLayoutPresets } from "@/app/lib/services-card-layout-presets";
import { portfolioDetailPath } from "@/app/lib/portfolio-url";
import {
  extractPortfolioListingCard,
  getListingCardImageUrl,
} from "@/app/lib/our-work-api";
import { resolveImageUrl } from "@/app/lib/wp-media-url";
import type { MappableWorkItem } from "@/app/lib/our-work-map";

function asString(value: unknown): string | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const nested = asString(entry);
      if (nested) return nested;
    }
    return undefined;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return (
      asString(record.value) ||
      asString(record.label) ||
      asString(record.name) ||
      asString(record.slug)
    );
  }
  return undefined;
}

function trimOrUndefined(value: unknown): string | undefined {
  return asString(value);
}

function resolveMediaUrl(raw: AcfImageNode | unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null };
    sourceUrl?: string | null;
    mediaItemUrl?: string | null;
  };
  return (
    resolveImageUrl(
      o.node?.sourceUrl ?? o.node?.mediaItemUrl ?? o.sourceUrl ?? o.mediaItemUrl ?? undefined
    ) ?? undefined
  );
}

function imageAlt(raw: AcfImageNode | unknown, fallback: string): string {
  if (!raw || typeof raw !== "object") return fallback;
  const alt = asString((raw as { node?: { altText?: string | null } }).node?.altText);
  return alt || fallback;
}

function normalizeStudioKey(value: unknown): ServicesStudioKey | null {
  const key = asString(value)?.toLowerCase().replace(/[\s-]+/g, "_");
  if (!key) return null;

  if (key === "digital" || key === "application" || key === "growth" || key === "ai") {
    return key;
  }

  if (key.includes("digital") && (key.includes("experience") || key.includes("website"))) {
    return "digital";
  }
  if (key.includes("application") || key.includes("product")) {
    return "application";
  }
  if (key.includes("growth") || key.includes("branding")) {
    return "growth";
  }
  if (key === "ai" || key.includes("intelligent") || key.startsWith("ai_")) {
    return "ai";
  }

  return null;
}

function normalizeTitleLayout(value: unknown): ServicesTitleLayout {
  const layout = asString(value)?.toLowerCase();
  if (
    layout === "highlight_block" ||
    layout === "highlight_amp_block" ||
    layout === "highlight_inline"
  ) {
    return layout;
  }
  return "highlight_block";
}

function normalizeHref(value: unknown, fallback?: string): string | undefined {
  const raw = asString(value) || fallback;
  if (!raw) return undefined;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("/") || raw.startsWith("#")) {
    return raw;
  }
  return `/${raw}`;
}

function mapCard(
  cms: ServicesStudioCardNode | null | undefined
): ShowcaseCard | null {
  const title = trimOrUndefined(cms?.title);
  if (!title) return null;

  const svgImage = resolveMediaUrl(cms?.imageSvg);
  const rasterImage = resolveMediaUrl(cms?.image);
  const image = svgImage || rasterImage;
  const imageSourceForAlt = svgImage ? cms?.imageSvg : cms?.image;

  return {
    title,
    description: trimOrUndefined(cms?.description),
    image,
    imageAlt: imageAlt(imageSourceForAlt, title),
    imageFit: svgImage ? "contain" : undefined,
    backgroundImage: resolveMediaUrl(cms?.backgroundImage),
    gradient: trimOrUndefined(cms?.gradient),
    borderColor: trimOrUndefined(cms?.borderColor),
    boxShadow: trimOrUndefined(cms?.boxShadow),
    tall: typeof cms?.isTall === "boolean" ? cms.isTall : undefined,
    href: normalizeHref(cms?.href),
  };
}

function mapStudio(cms: ServicesStudioNode | null | undefined): ServicesStudioSection | null {
  if (!cms) return null;

  const studioKey = normalizeStudioKey(cms.studioKey) ?? "digital";
  const ctaLink = normalizeHref(cms.ctaLink);
  const titleHighlight = trimOrUndefined(cms.titleHighlight);
  const titleRemainder = trimOrUndefined(cms.titleRemainder);

  // Skip empty studio rows with no usable content.
  const cmsCards = Array.isArray(cms.cards) ? cms.cards.filter(Boolean) : [];
  const cards = applyServicesShowcaseCardLayoutPresets(
    studioKey,
    cmsCards
      .map((card) => mapCard(card))
      .filter((card): card is ShowcaseCard => Boolean(card))
  );

  if (!titleHighlight && !titleRemainder && !trimOrUndefined(cms.description) && cards.length === 0) {
    return null;
  }

  return {
    studioKey,
    titleLayout: normalizeTitleLayout(cms.titleLayout),
    titleHighlight: titleHighlight || "",
    titleRemainder: titleRemainder || "",
    description: trimOrUndefined(cms.description) || "",
    ctaText: trimOrUndefined(cms.ctaText) || "",
    ctaLink: ctaLink || "",
    cards,
  };
}

function mapStudios(raw: ServicesStudioNode[] | null | undefined): ServicesStudioSection[] {
  const cmsStudios = Array.isArray(raw) ? raw.filter(Boolean) : [];
  return cmsStudios
    .map((cms) => mapStudio(cms))
    .filter((studio): studio is ServicesStudioSection => Boolean(studio));
}

function mapSolutions(fields: ServicesPageFields | null): {
  title: string;
  highlight: string;
  items: SolutionItem[];
} {
  const cmsItems = Array.isArray(fields?.servicesSolutionsItems)
    ? fields.servicesSolutionsItems.filter(Boolean)
    : [];

  const items = cmsItems
    .map((item) => {
      const text = trimOrUndefined(item?.text);
      if (!text) return null;
      const type = asString(item?.itemType)?.toLowerCase() === "label" ? "label" : "pill";
      return { type, text } satisfies SolutionItem;
    })
    .filter((item): item is SolutionItem => Boolean(item));

  return {
    title: trimOrUndefined(fields?.servicesSolutionsTitle) || "",
    highlight: trimOrUndefined(fields?.servicesSolutionsHighlight) || "",
    items,
  };
}

function mapFaqs(fields: ServicesPageFields | null) {
  const cmsItems = Array.isArray(fields?.servicesFaqItems)
    ? fields.servicesFaqItems.filter(Boolean)
    : [];

  const items = cmsItems
    .map((item, index) => {
      const title = trimOrUndefined(item?.faqTitle);
      const content = asString(item?.faqContent);
      if (!title && !content) return null;
      return {
        id: index + 1,
        title: title || `FAQ ${index + 1}`,
        content: content || "",
      };
    })
    .filter((item): item is { id: number; title: string; content: string } => Boolean(item));

  return {
    title: trimOrUndefined(fields?.servicesFaqTitle) || "",
    items,
  };
}

export function mapServicesPortfoliosToWorkItems(
  nodes: ServicesPortfolioNode[] | null | undefined
): MappableWorkItem[] {
  const list = Array.isArray(nodes) ? nodes.filter(Boolean) : [];
  const items: MappableWorkItem[] = [];

  for (const node of list) {
    const listingCard = extractPortfolioListingCard(node ?? undefined);
    const title =
      trimOrUndefined(listingCard?.portfolioTitle) ||
      trimOrUndefined(node?.title);
    if (!title) continue;

    const image = getListingCardImageUrl(listingCard) || "";
    const description = trimOrUndefined(listingCard?.portfolioDescription);
    const category = trimOrUndefined(listingCard?.portfolioSubtitle);

    items.push({
      title,
      image,
      ...(description ? { description } : {}),
      ...(category ? { category } : {}),
      link: portfolioDetailPath(node?.slug),
    });
  }

  return items;
}

export type ServicesPageNormalized = {
  banner: {
    title?: string;
    subtitle?: string;
    description?: string;
    backgroundImage?: { src: string; alt: string };
  };
  studios: ServicesStudioSection[];
  ourWorkUseHome: boolean;
  ourWorkTitleOverride?: string;
  ourWorkCustomItems: MappableWorkItem[];
  solutions: {
    title: string;
    highlight: string;
    items: SolutionItem[];
  };
  faq: {
    title: string;
    items: Array<{ id: number; title: string; content: string }>;
  };
};

export function normalizeServicesPage(
  fields: ServicesPageFields | null
): ServicesPageNormalized {
  const banner = fields?.servicesBanner;
  const bannerBg = resolveMediaUrl(banner?.bannerBackgroundImage);
  const ourWorkUseHome = fields?.servicesOurWorkUseHome !== false;

  return {
    banner: {
      title: trimOrUndefined(banner?.bannerTitle),
      subtitle: trimOrUndefined(banner?.bannerSubtitle),
      description: trimOrUndefined(banner?.bannerDescription),
      backgroundImage: bannerBg
        ? {
            src: bannerBg,
            alt: imageAlt(banner?.bannerBackgroundImage, "Background"),
          }
        : undefined,
    },
    studios: mapStudios(fields?.servicesStudios),
    ourWorkUseHome,
    ourWorkTitleOverride: trimOrUndefined(fields?.servicesOurWorkTitle),
    ourWorkCustomItems: mapServicesPortfoliosToWorkItems(
      fields?.servicesFeaturedPortfolios?.nodes
    ),
    solutions: mapSolutions(fields),
    faq: mapFaqs(fields),
  };
}
