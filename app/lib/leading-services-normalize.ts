/**
 * Normalize Leading Services Template ACF → AppFigmaSections + page shell props.
 * Why cards: 1+ items (no fixed 4). Layout unchanged.
 */

import type {
  AppFigmaIndustryCard,
  AppFigmaSectionsContent,
  AppFigmaTechnologyCard,
  AppFigmaWhyCard,
  AppIndustryVariant,
  AppTechnologyVariant,
  AppWhyVariant,
} from "@/app/components/sections/AppFigmaSections";
import { resolveWhyForegroundPosition } from "@/app/lib/why-foreground-position";
import type { AccordionItem } from "@/app/components/sections/Accordion";
import type {
  AcfBannerImageNode,
  AcfImageNode,
  LeadingServicesTemplateFields,
} from "@/app/lib/leading-services-api";
import type {
  HomeClientLogo,
  HomeTestimonialItem,
} from "@/app/lib/home-normalize";
import { resolveImageUrl } from "@/app/lib/wp-media-url";
import { resolveMediaVideoUrl } from "@/app/lib/our-work-api";
import { portfolioDetailPath } from "@/app/lib/portfolio-url";
import type { HomeOurWorkItem } from "@/app/lib/home-normalize";

function mediaUrl(raw: AcfImageNode | unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null };
    sourceUrl?: string | null;
    mediaItemUrl?: string | null;
  };
  return (
    resolveImageUrl(
      o.node?.sourceUrl ??
        o.node?.mediaItemUrl ??
        o.sourceUrl ??
        o.mediaItemUrl ??
        undefined,
    ) ?? undefined
  );
}

function pickSelect(value: string | string[] | null | undefined): string {
  if (Array.isArray(value)) {
    return value.find((v) => typeof v === "string" && v.trim())?.trim() || "";
  }
  return typeof value === "string" ? value.trim() : "";
}

function asBool(value: boolean | null | undefined, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function mediaSize(raw: AcfBannerImageNode | undefined): {
  width?: number;
  height?: number;
} {
  const details = raw?.node?.mediaDetails;
  return {
    width: details?.width ?? undefined,
    height: details?.height ?? undefined,
  };
}

const INDUSTRY_VARIANTS = new Set<AppIndustryVariant>([
  "on-demand",
  "ecommerce",
  "restaurant",
  "event",
  "game",
  "travel",
]);

const WHY_VARIANTS = new Set<AppWhyVariant>(["product", "native", "qa", "ui"]);

const TECH_VARIANTS = new Set<AppTechnologyVariant>([
  "dark",
  "light",
  "icon",
  "ai",
  "ar",
  "metaverse",
]);

function industryVariant(raw: string | string[] | null | undefined): AppIndustryVariant {
  const v = pickSelect(raw) as AppIndustryVariant;
  return INDUSTRY_VARIANTS.has(v) ? v : "on-demand";
}

function whyVariant(raw: string | string[] | null | undefined): AppWhyVariant {
  const v = pickSelect(raw).toLowerCase();
  if (v === "ui/ux" || v === "ux") return "ui";
  return WHY_VARIANTS.has(v as AppWhyVariant) ? (v as AppWhyVariant) : "product";
}

function techVariant(raw: string | string[] | null | undefined): AppTechnologyVariant {
  const v = pickSelect(raw).toLowerCase();
  return TECH_VARIANTS.has(v as AppTechnologyVariant)
    ? (v as AppTechnologyVariant)
    : "dark";
}

export type LeadingServiceSectionToggles = {
  showIndustries: boolean;
  showWhyCards: boolean;
  showWhyFullImage: boolean;
  showProcess: boolean;
  showAugmentedSection: boolean;
  showTechnologies: boolean;
  showTestimonials: boolean;
  showClientLogos: boolean;
  showOurWork: boolean;
  realEstateSpacing: boolean;
};

/**
 * An uploaded banner layer. It drops into the slot the coded design defines, so
 * only the source is CMS-controlled; intrinsic pixels are a last-resort size for
 * routes that have no coded design to inherit from.
 */
export type LeadingServiceBannerLayer = {
  src: string;
  intrinsicWidth?: number;
  intrinsicHeight?: number;
};

/**
 * Banner *content* from the CMS. Styling — placement, type sizes, scrim — is
 * fixed in the coded design for the route and is not editable here.
 */
export type LeadingServiceBanner = {
  /** "hero" = background + positioned title; "video_knockout" = /logo-app style. */
  layout: "hero" | "video_knockout";
  /** One entry per visual line — banners never wrap. */
  lines: string[];
  /** Short lead-in line, for designs that show one inside the banner. */
  intro?: string;
  /** Supporting paragraph, for designs that show one inside the banner. */
  description?: string;
  background?: LeadingServiceBannerLayer;
  videoSrc?: string;
  foreground?: LeadingServiceBannerLayer;
};

export type LeadingServiceNormalized = {
  bannerTitle: string;
  /** Figma banner config; null when the page uses the default CMS banner. */
  banner: LeadingServiceBanner | null;
  contactFormTitle: string;
  /** CMS Contact Heading (Line 1). */
  contactHeadingLine1: string;
  /** CMS Contact Heading (Line 2). */
  contactHeadingLine2: string;
  toggles: LeadingServiceSectionToggles;
  content: AppFigmaSectionsContent | null;
  testimonials: HomeTestimonialItem[];
  clientLogos: HomeClientLogo[];
  ourWork: {
    title: string;
    subtitle?: string;
    ctaLabel?: string;
    ctaHref?: string;
    items: HomeOurWorkItem[];
  };
  faqs: AccordionItem[];
};

function bannerLayer(
  raw: AcfBannerImageNode | undefined,
): LeadingServiceBannerLayer | undefined {
  const src = mediaUrl(raw);
  if (!src) return undefined;
  const { width, height } = mediaSize(raw);
  return { src, intrinsicWidth: width, intrinsicHeight: height };
}

/**
 * Banner content from the CMS. Each piece stands on its own: artwork with no
 * headline renders as artwork, a headline with no artwork renders over the
 * coded background. Only a layout choice with nothing at all behind it is
 * treated as "not configured".
 */
function normalizeBanner(
  fields: LeadingServicesTemplateFields,
): LeadingServiceBanner | null {
  const layout = pickSelect(fields.bannerLayout);

  const rows = (fields.bannerTitleLines ?? [])
    .map((row) => row?.line?.trim() || "")
    .filter(Boolean);
  const fallbackLine = fields.bannerTitle?.trim() || "";
  const lines = rows.length ? rows : fallbackLine ? [fallbackLine] : [];

  const background = bannerLayer(fields.bannerBgImage);
  // An upload wins over the URL field, which is there for externally hosted
  // video. Both are routed through the same-origin proxy path when they are
  // WordPress uploads, so the browser never has to reach the CMS host.
  const videoSrc =
    resolveMediaVideoUrl(fields.bannerBgVideo) ??
    resolveMediaVideoUrl(fields.bannerBgVideoUrl);
  const foreground = bannerLayer(fields.bannerFgImage);

  const intro = fields.bannerIntro?.trim() || undefined;
  const description = fields.bannerDescription?.trim() || undefined;

  if (
    !lines.length &&
    !intro &&
    !description &&
    !background &&
    !videoSrc &&
    !foreground
  ) {
    return null;
  }

  return {
    layout: layout === "video_knockout" ? "video_knockout" : "hero",
    lines,
    intro,
    description,
    background,
    videoSrc,
    foreground,
  };
}

function normalizeWhyCards(
  fields: LeadingServicesTemplateFields,
): AppFigmaSectionsContent["whyCards"] | undefined {
  const group = fields.whyCards;
  if (!group) return undefined;

  const cards: AppFigmaWhyCard[] = [];
  for (const card of group.cards ?? []) {
    if (!card) continue;
    const bg = mediaUrl(card.bg) || "";
    const exact = mediaUrl(card.exact);
    const art = mediaUrl(card.art);
    const foreground = mediaUrl(card.foreground);
    // Keep card if it has media and/or title (CMS may upload images before copy).
    if (!card.title?.trim() && !bg && !exact && !art && !foreground) continue;
    const hasLayers = Boolean(art || foreground || bg);
    cards.push({
      title: card.title?.trim() || "",
      text: card.text?.trim() || "",
      variant: whyVariant(card.variant),
      bg: bg || (!hasLayers && exact ? exact : "") || "",
      ...(art ? { art } : {}),
      ...(foreground
        ? {
            foreground,
            foregroundPosition: resolveWhyForegroundPosition(
              pickSelect(card.foregroundPosition),
            ),
          }
        : {}),
      // Exact is only for flattened single-image cards (no separate layers).
      ...(!art && !foreground && exact ? { exact } : {}),
    });
  }

  if (!cards.length) return undefined;

  return {
    title: group.title?.trim() || "",
    description: group.description?.trim() || "",
    ctaLabel: group.ctaLabel?.trim() || "Contact us",
    // Decorative mask is frontend-owned (APP_FIGMA_WHY_MASK_IMAGE).
    cards,
  };
}

function normalizeIndustries(
  fields: LeadingServicesTemplateFields,
): AppFigmaSectionsContent["industries"] | undefined {
  const group = fields.industries;
  if (!group) return undefined;

  const cards: AppFigmaIndustryCard[] = [];
  for (const card of group.cards ?? []) {
    if (!card?.title?.trim()) continue;
    cards.push({
      title: card.title.trim(),
      text: card.text?.trim() || "",
      layout: pickSelect(card.layout) === "tall" ? "tall" : "compact",
      ...(card.variant ? { variant: industryVariant(card.variant) } : {}),
      image: mediaUrl(card.image),
      bg: mediaUrl(card.bg),
      art: mediaUrl(card.art),
      foreground: mediaUrl(card.foreground),
    });
  }

  if (!cards.length) return undefined;

  return {
    title: group.title?.trim() || "",
    cards,
  };
}

function normalizeTechnologies(
  fields: LeadingServicesTemplateFields,
): AppFigmaSectionsContent["technologies"] | undefined {
  const group = fields.technologies;
  if (!group) return undefined;

  const cards: AppFigmaTechnologyCard[] = [];
  for (const card of group.cards ?? []) {
    if (!card?.title?.trim()) continue;
    cards.push({
      title: card.title.trim(),
      text: card.text?.trim() || "",
      variant: techVariant(card.variant),
      // Design (bg, classNames, dark) is frontend-owned via TECH_VARIANT_PRESETS.
      baseImage: mediaUrl(card.baseImage),
      image: mediaUrl(card.image),
      icon: mediaUrl(card.icon),
    });
  }

  if (!cards.length) return undefined;

  return {
    title: group.title?.trim() || "",
    cards,
  };
}

function normalizeCustomTestimonials(
  fields: LeadingServicesTemplateFields,
): HomeTestimonialItem[] {
  return (fields.testimonials ?? [])
    .filter(Boolean)
    .map((item): HomeTestimonialItem | null => {
      const quote = item?.testimonialQuote?.trim();
      const author = item?.testimonialAuthor?.trim();
      if (!quote || !author) return null;
      const image = mediaUrl(item?.testimonialImage) || "";
      return {
        quote,
        author,
        role: item?.testimonialRole?.trim() || "",
        company: item?.testimonialCompany?.trim() || undefined,
        companyEm: Boolean(item?.highlightCompany),
        image,
        imageAlt: author,
      };
    })
    .filter((item): item is HomeTestimonialItem => item != null);
}

function normalizeCustomLogos(
  fields: LeadingServicesTemplateFields,
): HomeClientLogo[] {
  return (fields.clientLogos ?? [])
    .filter(Boolean)
    .map((item): HomeClientLogo | null => {
      const src = mediaUrl(item?.logoImage);
      if (!src) return null;
      return {
        alt: item?.logoName?.trim() || "Client",
        src,
      };
    })
    .filter((item): item is HomeClientLogo => item != null);
}

function normalizeOurWorkItems(
  fields: LeadingServicesTemplateFields,
): HomeOurWorkItem[] {
  const nodes = fields.ourWork?.featuredPortfolios?.nodes ?? [];
  return nodes
    .filter(Boolean)
    .map((node): HomeOurWorkItem | null => {
      const listing = node?.portfolioDetails?.listingCard;
      const title =
        listing?.portfolioTitle?.trim() || node?.title?.trim() || "";
      if (!title) return null;
      const image = mediaUrl(listing?.portfolioImage) || "";
      return {
        title,
        image,
        description: listing?.portfolioDescription?.trim() || undefined,
        subtitle: listing?.portfolioSubtitle?.trim() || undefined,
        link: node?.slug ? portfolioDetailPath(node.slug) : undefined,
      };
    })
    .filter((item): item is HomeOurWorkItem => item != null);
}

/**
 * Build page props from CMS only (static `*-content.ts` fallback disabled).
 */
export function normalizeLeadingServiceTemplate(
  fields: LeadingServicesTemplateFields | null | undefined,
  // fallbackContent?: AppFigmaSectionsContent, // static fallback disabled
): LeadingServiceNormalized | null {
  if (!fields) return null;

  const introTitle = fields.intro?.title?.trim();
  const beforeImage = mediaUrl(fields.beforeImage);
  const logoImage = mediaUrl(fields.logoImage);

  // if (!introTitle && !fields.bannerTitle?.trim() && !fallbackContent) {
  //   return null;
  // }
  const banner = normalizeBanner(fields);

  if (!introTitle && !fields.bannerTitle?.trim() && !banner) {
    return null;
  }

  const whyCards = normalizeWhyCards(fields);
  // ?? fallbackContent?.whyCards;
  const industries = normalizeIndustries(fields);
  // ?? fallbackContent?.industries;
  const technologies = normalizeTechnologies(fields);
  // ?? fallbackContent?.technologies;

  const whyFullTitle =
    fields.whyFullTitle?.trim() || fields.whyFullImage?.title?.trim() || "";
  const whyFullImageUrl =
    mediaUrl(fields.whyFullPhoto) || mediaUrl(fields.whyFullImage?.image);
  const whyFullImage =
    whyFullTitle && whyFullImageUrl
      ? {
          title: whyFullTitle,
          description:
            fields.whyFullDescription?.trim() ||
            fields.whyFullImage?.description?.trim() ||
            "",
          ctaLabel:
            fields.whyFullCtaLabel?.trim() ||
            fields.whyFullImage?.ctaLabel?.trim() ||
            "",
          image: whyFullImageUrl,
        }
      : undefined;
  // : fallbackContent?.whyFullImage;

  const processCards = (fields.process?.cards ?? [])
    .filter(Boolean)
    .map((card) => ({
      title: card?.title?.trim() || "",
      text: card?.text?.trim() || "",
    }))
    .filter((card) => card.title);

  const process =
    processCards.length > 0
      ? {
          title: fields.process?.title?.trim() || "",
          cards: processCards,
        }
      : undefined;
  // : fallbackContent?.process;

  const augmentedPosts = (fields.augmentedSection?.posts ?? [])
    .filter(Boolean)
    .map((post) => ({
      date: post?.date?.trim() || "",
      title: post?.title?.trim() || "",
      description: post?.description?.trim() || "",
      ctaLabel: post?.ctaLabel?.trim() || "",
    }))
    .filter((post) => post.title);

  const augmentedSection =
    fields.augmentedSection?.title?.trim() &&
    mediaUrl(fields.augmentedSection.image) &&
    augmentedPosts.length > 0
      ? {
          title: fields.augmentedSection.title.trim(),
          description: fields.augmentedSection.description?.trim() || "",
          ctaLabel: fields.augmentedSection.ctaLabel?.trim() || "",
          image: mediaUrl(fields.augmentedSection.image) || "",
          imageCrop: pickSelect(fields.augmentedSection.imageCrop) as
            | "top-offset"
            | "top-offset-gradient"
            | "bottom-pinned"
            | "bottom-offset"
            | undefined,
          posts: augmentedPosts.slice(0, 2) as [
            (typeof augmentedPosts)[0],
            (typeof augmentedPosts)[0],
          ],
        }
      : undefined;
  // : fallbackContent?.augmentedSection;

  const stats = (fields.stats ?? [])
    .filter(Boolean)
    .map((stat) => ({
      number: stat?.number?.trim() || "",
      label: stat?.label?.trim() || "",
      width: stat?.width?.trim() || undefined,
    }))
    .filter((stat) => stat.number || stat.label);

  const content: AppFigmaSectionsContent = {
    beforeImage: beforeImage || "",
    // || fallbackContent?.beforeImage || "",
    logoImage: logoImage || "",
    // || fallbackContent?.logoImage || "",
    intro: {
      title: introTitle || "",
      // || fallbackContent?.intro.title || "",
      description: fields.intro?.description?.trim() || "",
      // || fallbackContent?.intro.description || "",
      ctaLabel: fields.intro?.ctaLabel?.trim() || "",
      // || fallbackContent?.intro.ctaLabel || "Contact us",
    },
    stats,
    // stats.length ? stats : fallbackContent?.stats || [],
    industries,
    whyCards,
    whyFullImage,
    process,
    augmentedSection,
    technologies,
  };

  const testimonialsSource = pickSelect(fields.testimonialsSource);
  const logosSource = pickSelect(fields.clientLogosSource);

  const faqs: AccordionItem[] = (fields.faqs ?? [])
    .filter(Boolean)
    .map((faq, index) => ({
      id: index + 1,
      title: faq?.title?.trim() || "",
      content: faq?.content?.trim() || "",
    }))
    .filter((faq) => faq.title);

  return {
    bannerTitle: fields.bannerTitle?.trim() || "",
    banner,
    contactHeadingLine1: fields.contactHeadingSub?.trim() || "",
    contactHeadingLine2: fields.contactHeadingMain?.trim() || "",
    contactFormTitle: (() => {
      const line1 = fields.contactHeadingSub?.trim() || "";
      const line2 = fields.contactHeadingMain?.trim() || "";
      if (line1 || line2) {
        return [line1, line2].filter(Boolean).join(" ");
      }
      return fields.contactFormTitle?.trim().replace(/\s+/g, " ") || "";
    })(),
    toggles: {
      showIndustries: asBool(fields.showIndustries),
      showWhyCards: asBool(fields.showWhyCards),
      showWhyFullImage: asBool(fields.showWhyFullImage),
      showProcess: asBool(fields.showProcess),
      showAugmentedSection: asBool(fields.showAugmentedSection),
      showTechnologies: asBool(fields.showTechnologies),
      showTestimonials: asBool(fields.showTestimonials),
      showClientLogos: asBool(fields.showClientLogos),
      showOurWork: asBool(fields.showOurWork),
      realEstateSpacing: asBool(fields.realEstateSpacing),
    },
    content,
    testimonials:
      testimonialsSource === "custom"
        ? normalizeCustomTestimonials(fields)
        : [],
    clientLogos:
      logosSource === "custom" ? normalizeCustomLogos(fields) : [],
    ourWork: {
      title: fields.ourWork?.title?.trim() || "",
      subtitle: fields.ourWork?.subtitle?.trim() || undefined,
      ctaLabel: fields.ourWork?.ctaLabel?.trim() || undefined,
      ctaHref: fields.ourWork?.ctaHref?.trim() || undefined,
      items: normalizeOurWorkItems(fields),
    },
    faqs,
  };
}
