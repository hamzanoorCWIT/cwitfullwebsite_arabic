/**
 * Normalizes Home page ACF/GraphQL data for section components.
 * Resolves image/media URLs and maps to component prop shapes.
 */

import { fetchBlogPostById, mapPostToBlogCard, type BlogPostNode } from "@/app/lib/blog-api";
import {
  fetchHomeFeaturedBlogSelection,
  fetchHomePage,
  fetchPortfolioListingById,
  getHomePageFields,
  type HomePageFields,
} from "@/app/lib/home-api";
import { resolvePortfolioIdForLocale, resolvePostIdForLocale } from "@/app/lib/wpml-page";
import { DEFAULT_LOCALE, type AppLocale } from "@/app/lib/locale";
import {
  extractPortfolioListingCard,
  getListingCardImageUrl,
  resolveImageUrl,
  resolveVideoUrl,
} from "@/app/lib/our-work-api";
import { portfolioDetailPath } from "@/app/lib/portfolio-url";
import { splitCmsTextToParagraphs } from "@/app/lib/split-cms-text-to-paragraphs";
import type { SliderCard } from "@/app/components/ui/HorizontalScrollSlider";
import type { AccordionItem } from "@/app/components/sections/Accordion";

function resolve(url: string | undefined | null): string | undefined {
  return resolveImageUrl(url ?? undefined) ?? undefined;
}

function resolveVideo(url: string | undefined | null): string | undefined {
  return resolveVideoUrl(url ?? undefined) ?? undefined;
}

/** Resolve studio video URL from ACF/GraphQL – supports node.sourceUrl, mediaItemUrl, link, url, or plain string (incl. Cloudflare Stream MP4 links). */
function getStudioVideoUrl(raw: unknown): string | undefined {
  if (raw == null) return undefined;
  if (typeof raw === "string") {
    const u = raw.trim();
    return u ? (resolveVideo(u) ?? u) : undefined;
  }
  if (typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const node = o.node as Record<string, unknown> | undefined;
  const url =
    (node?.sourceUrl as string)?.trim() ||
    (node?.mediaItemUrl as string)?.trim() ||
    (node?.link as string)?.trim() ||
    (o.sourceUrl as string)?.trim() ||
    (o.mediaItemUrl as string)?.trim() ||
    (o.url as string)?.trim() ||
    (o.link as string)?.trim();
  if (!url) return undefined;
  return resolveVideo(url) ?? url;
}

function getImageUrl(node: { node?: { sourceUrl?: string; altText?: string | null } } | null | undefined): string | undefined {
  return resolve(node?.node?.sourceUrl);
}

// -----------------------------------------------------------------------------
// Normalized section props (for passing to components)
// -----------------------------------------------------------------------------

export type HomeHeroProps = {
  videoSrc?: string;
  imageSrc?: string;
  /** CMS mobile hero video; when set, preferred on small screens */
  videoSrcMobile?: string;
  /** CMS mobile hero image (poster or full-bleed when no mobile/desktop video) */
  imageSrcMobile?: string;
  title?: string;
  subtitle?: string;
};

export type HomeShowcaseProps = {
  headline?: string;
  description?: string;
  cards?: SliderCard[];
  beforeImageSrc?: string;
  logoImageSrc?: string;
};

export type HomeIntroProps = {
  paragraphs: string[];
  backgroundImageSrc?: string;
};

export type HomeStudioItem = {
  title: string;
  description: string;
  video: string;
  href: string;
  /** CTA label from CMS */
  buttonText?: string;
};

export type HomeStudiosProps = {
  studios: HomeStudioItem[];
};

export type HomeGenaiProps = {
  heading?: string;
  paragraph?: string;
  videoSrc?: string;
  ctaText?: string;
  ctaLink?: string;
};

export type HomeOurWorkItem = {
  subtitle?: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
};

export type HomeOurWorkProps = {
  titleOverride?: string;
  sectionSubtitle?: string;
  sectionDescription?: string;
  ctaLabel?: string;
  ctaHref?: string;
  /** Home Our Work items selected from Home page relationship field (featurePortfolioHome). */
  items?: HomeOurWorkItem[];
};

export type HomeClientLogo = {
  src: string;
  alt: string;
};

export type HomeOurClientsProps = {
  logos: HomeClientLogo[];
  /** Legacy single composite image (old home layout). */
  logoSrc?: string;
};

export type HomeTestimonialItem = {
  image: string;
  imageAlt: string;
  quote: string;
  author: string;
  role: string;
  company?: string;
  companyEm?: boolean;
};

export type HomeTestimonialsProps = {
  testimonials: HomeTestimonialItem[];
};

export type HomeBlogItem = {
  category: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  buttonText?: string;
  buttonLink?: string;
};

export type HomeBlogsProps = {
  sectionSubtitle?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  items: HomeBlogItem[];
};

export type HomeAccordionProps = {
  title?: string;
  items?: AccordionItem[];
};

// -----------------------------------------------------------------------------
// Defaults (used when CMS has no data)
// -----------------------------------------------------------------------------

// No default intro paragraphs – CMS-only content

// -----------------------------------------------------------------------------
// Normalizers
// -----------------------------------------------------------------------------

export function normalizeHero(fields: HomePageFields | null): HomeHeroProps {
  if (!fields?.homeHeroSection) return {};
  const s = fields.homeHeroSection;
  /* getStudioVideoUrl supports MediaItem { node } and plain URL strings (ACF “Return: File URL”) */
  const videoUrl =
    getStudioVideoUrl(s.heroVideoUrl) ?? getStudioVideoUrl(s.heroVideo);
  const mobileVideoUrl =
    getStudioVideoUrl(s.heroVideoMobileUrl) ?? getStudioVideoUrl(s.heroVideoMobile);
  const imageUrl = getStudioVideoUrl(s.heroImage ?? s.heroimage);
  const mobileImageUrl = getStudioVideoUrl(s.heroImageMobile);
  return {
    videoSrc: videoUrl ?? undefined,
    /* Keep image when video exists too — Hero uses it as video poster and fallback */
    imageSrc: imageUrl ?? undefined,
    videoSrcMobile: mobileVideoUrl ?? undefined,
    imageSrcMobile: mobileImageUrl ?? undefined,
    title: s.heroTitle?.trim() || undefined,
    subtitle: s.heroSubtitle?.trim() || undefined,
  };
}

export function normalizeShowcase(fields: HomePageFields | null): HomeShowcaseProps {
  if (!fields) return {};
  const headline = fields.showcaseHeadline?.trim();
  const description = fields.showcaseDescription?.trim();
  const beforeImageSrc = getImageUrl(fields.showcaseBeforeImage as { node?: { sourceUrl?: string; altText?: string | null } });
  const logoImageSrc = getImageUrl(fields.showcaseLogoImage as { node?: { sourceUrl?: string; altText?: string | null } });
  const base = {
    headline: headline || undefined,
    description: description || undefined,
    beforeImageSrc,
    logoImageSrc,
  };
  try {
    const rawCards = fields.showcaseCards;
    const list = Array.isArray(rawCards) ? rawCards : [];
    if (!list.length) return base;

    const cards: SliderCard[] = list.map((c) => {
      const item = c as {
        cardType?: string | string[] | null;
        title?: string;
        subtitle?: string;
        description?: string;
        image?: unknown;
        backgroundClass?: string;
        textColorClass?: string;
      };
      const rawImage = item.image as {
        node?: { sourceUrl?: string; mediaItemUrl?: string; altText?: string | null };
        sourceUrl?: string;
        mediaItemUrl?: string;
      } | null | undefined;
      const imgUrl =
        resolve(
          rawImage?.node?.sourceUrl ??
          rawImage?.node?.mediaItemUrl ??
          rawImage?.sourceUrl ??
          rawImage?.mediaItemUrl ??
          undefined
        ) ?? undefined;
      const normalizedType = (() => {
        const cardTypeValue = Array.isArray(item.cardType)
          ? item.cardType.find((value) => typeof value === "string" && value.trim())
          : item.cardType;
        const rawType = cardTypeValue?.trim().toLowerCase().replace(/[\s-]+/g, "_");
        if (rawType?.includes("image")) return "image" as const;
        if (rawType?.includes("text")) return "text" as const;
        return imgUrl ? ("image" as const) : ("text" as const);
      })();
      return {
        type: normalizedType,
        title: item.title?.trim() ?? "",
        subtitle: item.subtitle?.trim(),
        description: item.description?.trim()?.replace(/\n/g, "\n"),
        image: imgUrl,
        backgroundColor: item.backgroundClass?.trim(),
        textColor: item.textColorClass?.trim(),
      };
    });
    return { ...base, cards };
  } catch {
    return base;
  }
}

export function normalizeIntro(fields: HomePageFields | null): HomeIntroProps {
  if (!fields?.homeIntroSection) {
    return { paragraphs: [] };
  }
  const s = (Array.isArray(fields.homeIntroSection)
    ? fields.homeIntroSection.find(Boolean)
    : fields.homeIntroSection) as {
      introParagraph?: string | null;
      introBackgroundImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
    } | null | undefined;
  if (!s) {
    return { paragraphs: [] };
  }
  const html = s.introParagraph?.trim();
  const paragraphs = html ? splitCmsTextToParagraphs(html) : [];
  const backgroundImageSrc = getImageUrl(s.introBackgroundImage as { node?: { sourceUrl?: string; altText?: string | null } });
  return { paragraphs, backgroundImageSrc };
}

// No default studios or videos – CMS-only content

function toStudioList(raw: unknown): HomeStudioItem[] {
  const list = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as { nodes?: unknown[] }).nodes)
      ? (raw as { nodes: unknown[] }).nodes
      : [];
  return list.slice(0, 3).map((s) => {
    const item = s as Record<string, unknown> | null | undefined;
    const link = (item?.link as string)?.trim();
    const hrefFromCms =
      link && (link.startsWith("http") || link.startsWith("/"))
        ? link
        : link
          ? `/${link.replace(/^\/+/, "")}`
          : "";
    const href = hrefFromCms;
    const videoUrl =
      getStudioVideoUrl(item?.videoUrl) ?? getStudioVideoUrl(item?.video) ?? "";
    const buttonText = (item?.buttonText as string)?.trim() || undefined;
    return {
      title: (item?.title as string)?.trim() ?? "",
      description: (item?.description as string)?.trim() ?? "",
      video: videoUrl || "",
      href,
      buttonText,
    };
  });
}

export function normalizeStudios(fields: HomePageFields | null): HomeStudiosProps {
  try {
    const raw = fields?.homeStudios;
    const studios = toStudioList(raw);
    if (!studios.length) return { studios: [] };
    return { studios };
  } catch {
    return { studios: [] };
  }
}

export function normalizeGenai(fields: HomePageFields | null): HomeGenaiProps {
  if (!fields?.homeGenaiSection) return {};
  const s = fields.homeGenaiSection;
  const videoSrc =
    getStudioVideoUrl(s.genaiVideoUrl) ?? getStudioVideoUrl(s.video);
  return {
    heading: s.heading?.trim() || undefined,
    paragraph: s.paragraph?.trim() || undefined,
    videoSrc,
    ctaText: s.ctaText?.trim(),
    ctaLink: s.ctaLink?.trim(),
  };
}

export function toHomeOurWorkItems(raw: unknown): HomeOurWorkItem[] {
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.nodes)) list = o.nodes;
    else if (Array.isArray(o.edges)) list = o.edges.map((e: { node?: unknown }) => e?.node).filter(Boolean);
  }
  return list.slice(0, 12).map((p) => {
    const node = p as Record<string, unknown> | null | undefined;
    const title = (node?.title as string)?.trim() ?? "";
    const slug = (node?.slug as string)?.trim();
    const listingCard = extractPortfolioListingCard(node);
    const homeListing = node?.homePortfolioListing as
      | { portfolioListingTitle?: string | null; portfolioListingDescription?: string | null; portfolioListingSubtitle?: string | null }
      | null
      | undefined;
    const link = portfolioDetailPath(slug);
    return {
      title:
        listingCard?.portfolioTitle?.trim() ||
        homeListing?.portfolioListingTitle?.trim() ||
        title,
      description:
        listingCard?.portfolioDescription?.trim() ||
        homeListing?.portfolioListingDescription?.trim() ||
        undefined,
      subtitle:
        listingCard?.portfolioSubtitle?.trim() ||
        homeListing?.portfolioListingSubtitle?.trim() ||
        undefined,
      image: getListingCardImageUrl(listingCard) || "",
      link,
    };
  }).filter((item) => Boolean(item.title));
}

type NormalizedMediaNode = { node?: { sourceUrl?: string | null; mediaItemUrl?: string | null } | null } | null | undefined;

type FeaturedPortfolioNode = {
  databaseId?: number | null;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  homePortfolioListing?: {
    portfolioListingSubtitle?: string | null;
    portfolioListingTitle?: string | null;
    portfolioListingDescription?: string | null;
    portfolioListingCards?: Array<{
      cardSubtitle?: string | null;
      cardTitle?: string | null;
      cardDescription?: string | null;
      cardImage?: NormalizedMediaNode;
    } | null> | null;
  } | null;
  portfolioDetails?: {
    backgroundImage?: { node?: { sourceUrl?: string; mediaItemUrl?: string | null } } | null;
    heroBackgroundImage?: { node?: { sourceUrl?: string; mediaItemUrl?: string | null } } | null;
  } | null;
};

type PerPortfolioOverride = {
  portfolioPost?:
    | number
    | string
    | {
        databaseId?: number | string | null;
        node?: unknown;
        nodes?: unknown[];
        edges?: Array<{ node?: unknown } | null> | null;
      }
    | null;
  sectionSubtitle?: string | null;
  sectionTitle?: string | null;
  sectionDescription?: string | null;
  portfolioSubtitle?: string | null;
  portfolioTitle?: string | null;
  portfolioDescription?: string | null;
  portfolioImage?: NormalizedMediaNode;
  portfolioCards?: Array<{
    cardSubtitle?: string | null;
    cardTitle?: string | null;
    cardDescription?: string | null;
    cardImage?: NormalizedMediaNode;
  } | null> | null;
} | null;

function perPortfolioOverrideHasRowContent(ov: PerPortfolioOverride | null | undefined): boolean {
  if (!ov) return false;
  if (ov.sectionSubtitle?.trim() || ov.sectionTitle?.trim() || ov.sectionDescription?.trim()) return true;
  if (ov.portfolioSubtitle?.trim() || ov.portfolioTitle?.trim() || ov.portfolioDescription?.trim()) return true;
  if (getImageFromNode(ov.portfolioImage)) return true;
  const cards = (ov.portfolioCards ?? []).filter(Boolean);
  return cards.length > 0;
}

function getImageFromNode(image: NormalizedMediaNode): string | undefined {
  return resolve(image?.node?.sourceUrl ?? image?.node?.mediaItemUrl ?? undefined);
}

function toStringSafe(value: unknown): string | undefined {
  if (value == null) return undefined;
  const s = String(value).trim();
  return s || undefined;
}

function extractDigits(value: string): string | undefined {
  const m = value.match(/(\d+)/g);
  if (!m?.length) return undefined;
  return m[m.length - 1];
}

function tryDecodeRelayId(value: string): string | undefined {
  try {
    if (!/^[A-Za-z0-9+/=]+$/.test(value) || value.length < 8) return undefined;
    const decoded =
      typeof Buffer !== "undefined"
        ? Buffer.from(value, "base64").toString("utf8")
        : undefined;
    if (!decoded) return undefined;
    const fromDecodedDigits = extractDigits(decoded);
    if (fromDecodedDigits) return fromDecodedDigits;
    return decoded.trim() || undefined;
  } catch {
    return undefined;
  }
}

function normalizeId(value: unknown): string | undefined {
  if (value == null) return undefined;

  if (typeof value === "number") return String(value);
  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return undefined;
    if (/^\d+$/.test(raw)) return raw;

    const relayDecoded = tryDecodeRelayId(raw);
    const relayDigits = relayDecoded ? extractDigits(relayDecoded) : undefined;
    if (relayDigits) return relayDigits;

    const rawDigits = extractDigits(raw);
    if (rawDigits) return rawDigits;
    return raw;
  }

  if (typeof value === "object") {
    const o = value as Record<string, unknown>;
    return (
      normalizeId(o.databaseId) ||
      normalizeId(o.postId) ||
      normalizeId(o.id) ||
      normalizeId(o.value) ||
      normalizeId(o.node) ||
      (Array.isArray(o.nodes) ? normalizeId(o.nodes[0]) : undefined) ||
      (Array.isArray(o.edges) ? normalizeId((o.edges[0] as { node?: unknown } | undefined)?.node) : undefined)
    );
  }

  return undefined;
}

function getOverridePortfolioId(override: PerPortfolioOverride): string | undefined {
  if (!override) return undefined;
  return normalizeId(override.portfolioPost);
}

function getSelectedPortfolios(fields: HomePageFields | null): FeaturedPortfolioNode[] {
  const pickList = (raw: unknown): unknown[] => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw.filter(Boolean);
    if (typeof raw !== "object") return [];
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.nodes)) return o.nodes.filter(Boolean);
    if (Array.isArray(o.edges)) {
      return o.edges
        .map((e) => (e as { node?: unknown } | null | undefined)?.node)
        .filter(Boolean);
    }
    if (o.node) return [o.node];
    return [];
  };

  const fromFeature = pickList((fields as Record<string, unknown> | null | undefined)?.featurePortfolioHome);
  const fromLegacy = pickList((fields as Record<string, unknown> | null | undefined)?.homeFeaturedPortfolios);
  const combined = [...fromFeature, ...fromLegacy];
  return (combined as FeaturedPortfolioNode[]).filter(Boolean);
}

export function normalizeOurWork(fields: HomePageFields | null): HomeOurWorkProps {
  const out: HomeOurWorkProps = {};
  const listing = fields?.homePagePortfolioListing;
  const selected = getSelectedPortfolios(fields);
  const globalSubtitle = listing?.homePortfolioListingSubtitle?.trim();
  const globalTitle = listing?.homePortfolioListingTitle?.trim();
  const globalDescription = listing?.homePortfolioListingDescription?.trim();
  const perPortfolioOverrides = ((listing?.homePortfolioPerPortfolioItems ?? []).filter(Boolean) as PerPortfolioOverride[]);

  const unlinkedOverridesQueue = perPortfolioOverrides.filter(
    (ov) => !getOverridePortfolioId(ov) && perPortfolioOverrideHasRowContent(ov)
  );
  let unlinkedOverrideIndex = 0;

  const firstMatchedOverrideWithSection =
    selected
      .map((p) => {
        const selectedId = normalizeId(p.databaseId);
        if (!selectedId) return null;
        return perPortfolioOverrides.find((ov) => getOverridePortfolioId(ov) === selectedId) ?? null;
      })
      .find((ov) => !!(ov?.sectionTitle?.trim() || ov?.sectionSubtitle?.trim() || ov?.sectionDescription?.trim())) ??
    perPortfolioOverrides.find(
      (ov) =>
        !getOverridePortfolioId(ov) &&
        !!(ov?.sectionTitle?.trim() || ov?.sectionSubtitle?.trim() || ov?.sectionDescription?.trim())
    ) ??
    null;

  out.titleOverride =
    firstMatchedOverrideWithSection?.sectionTitle?.trim() ||
    globalTitle ||
    fields?.ourWorkTitle?.trim() ||
    undefined;
  out.sectionSubtitle =
    firstMatchedOverrideWithSection?.sectionSubtitle?.trim() ||
    globalSubtitle ||
    undefined;
  out.sectionDescription =
    firstMatchedOverrideWithSection?.sectionDescription?.trim() ||
    globalDescription ||
    undefined;

  const builtItems: HomeOurWorkItem[] = [];

  selected.forEach((portfolio) => {
    const selectedId = normalizeId(portfolio.databaseId);
    let matchedOverride =
      (selectedId
        ? perPortfolioOverrides.find((ov) => getOverridePortfolioId(ov) === selectedId)
        : null) ?? null;
    if (!matchedOverride && unlinkedOverrideIndex < unlinkedOverridesQueue.length) {
      matchedOverride = unlinkedOverridesQueue[unlinkedOverrideIndex];
      unlinkedOverrideIndex += 1;
    }

    const portfolioSlug = portfolio.slug?.trim();
    const link = portfolioDetailPath(portfolioSlug);

    const listingCard = extractPortfolioListingCard(portfolio);
    const homeListing = portfolio.homePortfolioListing;
    const mainSubtitle =
      listingCard?.portfolioSubtitle?.trim() ||
      homeListing?.portfolioListingSubtitle?.trim() ||
      "";
    const mainTitle =
      listingCard?.portfolioTitle?.trim() ||
      homeListing?.portfolioListingTitle?.trim() ||
      portfolio.title?.trim() ||
      "";
    const mainDescription =
      listingCard?.portfolioDescription?.trim() ||
      homeListing?.portfolioListingDescription?.trim() ||
      "";
    const mainImage = getListingCardImageUrl(listingCard) || "";

    if (!mainTitle) return;

    // Keep section title/subtitle overrides from Home when present (selection only).
    if (matchedOverride?.sectionTitle?.trim() && !out.titleOverride) {
      out.titleOverride = matchedOverride.sectionTitle.trim();
    }
    if (matchedOverride?.sectionSubtitle?.trim() && !out.sectionSubtitle) {
      out.sectionSubtitle = matchedOverride.sectionSubtitle.trim();
    }

    builtItems.push({
      subtitle: mainSubtitle,
      title: mainTitle,
      description: mainDescription,
      image: mainImage,
      link,
    });
  });

  if (builtItems.length > 0) {
    out.items = builtItems;
    return out;
  }

  const raw = fields as Record<string, unknown> | null | undefined;
  const featuredItems = toHomeOurWorkItems(raw?.featurePortfolioHome ?? raw?.homeFeaturedPortfolios);
  if (featuredItems.length) out.items = featuredItems;
  return out;
}

function portfolioToOurWorkItem(portfolio: FeaturedPortfolioNode): HomeOurWorkItem | null {
  const portfolioSlug = portfolio.slug?.trim();
  const link = portfolioDetailPath(portfolioSlug);
  const listingCard = extractPortfolioListingCard(portfolio);
  const homeListing = portfolio.homePortfolioListing;
  const mainSubtitle =
    listingCard?.portfolioSubtitle?.trim() ||
    homeListing?.portfolioListingSubtitle?.trim() ||
    "";
  const mainTitle =
    listingCard?.portfolioTitle?.trim() ||
    homeListing?.portfolioListingTitle?.trim() ||
    portfolio.title?.trim() ||
    "";
  const mainDescription =
    listingCard?.portfolioDescription?.trim() ||
    homeListing?.portfolioListingDescription?.trim() ||
    "";
  const mainImage = getListingCardImageUrl(listingCard) || "";
  if (!mainTitle) return null;
  return {
    subtitle: mainSubtitle,
    title: mainTitle,
    description: mainDescription,
    image: mainImage,
    link,
  };
}

/**
 * Our Work cards: English Home Selected Portfolios are the source of truth
 * for both EN and AR. Arabic UI loads each item's Arabic listing-card fields.
 */
export async function resolveHomeOurWork(
  fields: HomePageFields | null,
  locale: AppLocale = DEFAULT_LOCALE
): Promise<HomeOurWorkProps> {
  const current = normalizeOurWork(fields);

  // Always use English Home selection for which portfolios appear.
  let selected = locale === "en" ? getSelectedPortfolios(fields) : [];
  try {
    const enHome = await fetchHomePage("en");
    const enFields = enHome.data ? getHomePageFields(enHome.data) : null;
    const enSelected = getSelectedPortfolios(enFields);
    if (enSelected.length) selected = enSelected;
    if (
      locale !== "en" &&
      !current.titleOverride &&
      !current.sectionSubtitle &&
      !current.sectionDescription
    ) {
      const inheritedMeta = normalizeOurWork(enFields);
      current.titleOverride = inheritedMeta.titleOverride;
      current.sectionSubtitle = inheritedMeta.sectionSubtitle;
      current.sectionDescription = inheritedMeta.sectionDescription;
    }
  } catch {
    if (!selected.length) selected = getSelectedPortfolios(fields);
  }

  if (!selected.length) return { ...current, items: [] };

  const items: HomeOurWorkItem[] = [];
  for (const portfolio of selected) {
    const sourceId = normalizeId(portfolio.databaseId);
    let node: FeaturedPortfolioNode = portfolio;

    if (sourceId) {
      const localeId =
        locale === "en"
          ? sourceId
          : await resolvePortfolioIdForLocale(sourceId, locale);
      if (localeId !== sourceId || locale !== "en") {
        const fetched = await fetchPortfolioListingById(localeId, locale);
        if (fetched) node = fetched as FeaturedPortfolioNode;
      }
    }

    const item = portfolioToOurWorkItem(node);
    if (item) items.push(item);
  }

  return {
    ...current,
    items,
  };
}

export function normalizeOurClients(fields: HomePageFields | null): HomeOurClientsProps {
  const logos: HomeClientLogo[] = (fields?.clientLogos ?? [])
    .filter(Boolean)
    .map((item) => {
      const src = getImageUrl(item?.logoImage as { node?: { sourceUrl?: string; altText?: string | null } });
      if (!src?.trim()) return null;
      const alt =
        item?.logoName?.trim() ||
        (item?.logoImage as { node?: { altText?: string | null } } | undefined)?.node?.altText?.trim() ||
        "Client logo";
      return { src, alt };
    })
    .filter((item): item is HomeClientLogo => Boolean(item));

  return { logos };
}

export function normalizeHomeTestimonials(fields: HomePageFields | null): HomeTestimonialsProps {
  const testimonials = (fields?.homeTestimonials ?? [])
    .filter(Boolean)
    .map((item): HomeTestimonialItem | null => {
      const quote = item?.testimonialQuote?.trim();
      const author = item?.testimonialAuthor?.trim();
      const image = getImageUrl(
        item?.testimonialImage as { node?: { sourceUrl?: string; altText?: string | null } }
      );
      if (!quote || !author || !image?.trim()) return null;

      const imageAlt =
        (item?.testimonialImage as { node?: { altText?: string | null } } | undefined)?.node?.altText?.trim() ||
        `${author} testimonial photo`;

      const entry: HomeTestimonialItem = {
        image,
        imageAlt,
        quote,
        author,
        role: item?.testimonialRole?.trim() || "",
        companyEm: Boolean(item?.highlightCompany),
      };
      const company = item?.testimonialCompany?.trim();
      if (company) entry.company = company;
      return entry;
    })
    .filter((item): item is HomeTestimonialItem => item != null);

  return { testimonials };
}

// No default blogs – CMS-only content

function stripHtmlToText(value: string | undefined | null): string {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getSelectedPosts(raw: unknown): Array<Record<string, unknown>> {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.filter(Boolean) as Array<Record<string, unknown>>;
  if (typeof raw !== "object") return [];
  const o = raw as Record<string, unknown>;
  if (Array.isArray(o.nodes)) return o.nodes.filter(Boolean) as Array<Record<string, unknown>>;
  if (Array.isArray(o.edges)) {
    return o.edges
      .map((e) => (e as { node?: Record<string, unknown> } | null | undefined)?.node)
      .filter(Boolean) as Array<Record<string, unknown>>;
  }
  if (o.node && typeof o.node === "object") return [o.node as Record<string, unknown>];
  return [];
}

function normalizePostIdForOverride(raw: unknown): string | undefined {
  if (raw == null) return undefined;
  if (typeof raw === "number") return String(raw);
  if (typeof raw === "string") {
    const v = raw.trim();
    if (!v) return undefined;
    return /^\d+$/.test(v) ? v : undefined;
  }
  if (typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  return (
    normalizePostIdForOverride(o.databaseId) ||
    normalizePostIdForOverride(o.postId) ||
    normalizePostIdForOverride(o.id) ||
    (Array.isArray(o.nodes)
      ? normalizePostIdForOverride((o.nodes[0] as Record<string, unknown> | undefined)?.databaseId ?? o.nodes[0])
      : undefined) ||
    (Array.isArray(o.edges)
      ? normalizePostIdForOverride(((o.edges[0] as { node?: unknown } | undefined)?.node as Record<string, unknown> | undefined)?.databaseId)
      : undefined) ||
    normalizePostIdForOverride(o.node)
  );
}

function buildPerBlogCardOverridesMap(
  raw: unknown
): Map<string, { category?: string; title?: string; description?: string; image?: string; buttonText?: string; buttonLink?: string }> {
  const map = new Map<string, { category?: string; title?: string; description?: string; image?: string; buttonText?: string; buttonLink?: string }>();
  const rows = Array.isArray(raw) ? raw.filter(Boolean) : [];
  for (const row of rows) {
    const r = row as Record<string, unknown>;
    const postId = normalizePostIdForOverride(r.blogPost);
    if (!postId) continue;
    const category = trimOrUndefined(r.cardSubtitle as string | null | undefined);
    const title = trimOrUndefined(r.cardTitle as string | null | undefined);
    const description = trimOrUndefined(r.cardDescription as string | null | undefined);
    // cardImage can be flat { sourceUrl } or nested { node: { sourceUrl } }
    const cardImg = r.cardImage as Record<string, unknown> | null | undefined;
    const imgUrl = (cardImg?.sourceUrl as string) ?? (cardImg?.node as Record<string, unknown> | undefined)?.sourceUrl as string | undefined;
    const image = resolve(imgUrl ?? undefined) ?? undefined;
    const buttonText = trimOrUndefined(r.cardButtonText as string | null | undefined);
    const buttonLink = trimOrUndefined(r.cardButtonLink as string | null | undefined);
    if (category || title || description || image || buttonText) {
      map.set(postId, { category, title, description, image, buttonText, buttonLink });
    }
  }
  return map;
}

function buildPerBlogCardsFromOverrides(raw: unknown): HomeBlogItem[] {
  const rows = Array.isArray(raw) ? raw.filter(Boolean) : [];
  const items: HomeBlogItem[] = [];
  for (const row of rows) {
    const r = row as Record<string, unknown>;
    // blogPost can be flat { databaseId, title, slug } or nested { node: { ... } }
    const blogPostRaw = r.blogPost as Record<string, unknown> | null | undefined;
    const post = blogPostRaw?.node ? (blogPostRaw.node as Record<string, unknown>) : blogPostRaw;
    const fallbackTitle = trimOrUndefined(post?.title as string | null | undefined);
    const slug = trimOrUndefined(post?.slug as string | null | undefined);

    const category = trimOrUndefined(r.cardSubtitle as string | null | undefined) || "";
    const title = trimOrUndefined(r.cardTitle as string | null | undefined) || fallbackTitle || "";
    const description = trimOrUndefined(r.cardDescription as string | null | undefined) || "";
    // cardImage can be flat { sourceUrl } or nested { node: { sourceUrl } }
    const cardImg = r.cardImage as Record<string, unknown> | null | undefined;
    const imgUrl = (cardImg?.sourceUrl as string) ?? (cardImg?.node as Record<string, unknown> | undefined)?.sourceUrl as string | undefined;
    const image = resolve(imgUrl ?? undefined) ?? undefined;
    const link = slug ? `/blogs/${slug}` : undefined;

    const buttonText = trimOrUndefined(r.cardButtonText as string | null | undefined);
    const buttonLink = trimOrUndefined(r.cardButtonLink as string | null | undefined);

    if (!title) continue;
    items.push({
      category,
      title,
      description,
      image,
      link,
      buttonText,
      buttonLink,
    });
  }
  return items;
}

function trimOrUndefined(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

/**
 * Home page Blogs section: selected posts from Home Page ACF, resolved against
 * live WordPress posts from the backend (same as /blogs listing).
 */
export function normalizeBlogs(
  fields: HomePageFields | null,
  allPosts: Array<BlogPostNode | null | undefined> = []
): HomeBlogsProps {
  const sectionTitle = fields?.blogsSectionTitle?.trim() || "";

  try {
    const selectedPosts = getSelectedPosts(
      fields?.homeFeaturedBlogPosts ?? fields?.homeBlogsSelectedPosts
    );

    if (selectedPosts.length === 0) {
      return { sectionTitle, items: [] };
    }

    const postsToRender = selectedPosts
      .map((raw) => raw as BlogPostNode)
      .filter((post): post is BlogPostNode => Boolean(post?.title?.trim()));

    const items: HomeBlogItem[] = postsToRender
      .map((post) => {
        const live =
          post.databaseId != null
            ? allPosts.find((item) => item?.databaseId === post.databaseId)
            : undefined;
        return mapPostToBlogCard(live ?? post);
      })
      .filter((item): item is HomeBlogItem => Boolean(item?.title));

    return {
      sectionTitle,
      items,
    };
  } catch {
    return { sectionTitle, items: [] };
  }
}

function postId(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && /^\d+$/.test(value.trim())) return Number(value.trim());
  return undefined;
}

function localeSelectedPostId(selected: BlogPostNode, locale: AppLocale): string | undefined {
  const code = selected.language?.code?.toLowerCase();
  if (code === locale && selected.databaseId != null) {
    return String(selected.databaseId);
  }
  const translated = (selected.translations ?? []).find(
    (node) => node?.language?.code?.toLowerCase() === locale && node.databaseId != null
  );
  if (translated?.databaseId != null) return String(translated.databaseId);
  if (selected.databaseId != null) return String(selected.databaseId);
  return undefined;
}

async function resolveSelectedHomeBlogPosts(
  selectedPosts: Array<Record<string, unknown>>,
  allPosts: Array<BlogPostNode | null | undefined>,
  locale: AppLocale
): Promise<BlogPostNode[]> {
  const liveById = new Map<string, BlogPostNode>();
  for (const post of allPosts) {
    if (post?.databaseId == null) continue;
    liveById.set(String(post.databaseId), post);
  }

  const resolved: BlogPostNode[] = [];
  const seenIds = new Set<string>();

  for (const raw of selectedPosts) {
    const selected = raw as BlogPostNode;
    let targetId = localeSelectedPostId(selected, locale);
    if (!targetId) {
      const sourceId = postId(selected.databaseId);
      if (sourceId == null) {
        if (selected.title?.trim()) resolved.push(selected);
        continue;
      }
      targetId = await resolvePostIdForLocale(String(sourceId), locale);
    }
    if (seenIds.has(targetId)) continue;
    seenIds.add(targetId);

    const live = liveById.get(targetId);
    if (live) {
      resolved.push(live);
      continue;
    }

    const fetched = await fetchBlogPostById(targetId, locale);
    if (fetched) {
      resolved.push(fetched);
      continue;
    }

    if (selected.title?.trim()) resolved.push(selected);
  }

  return resolved.filter((post) => Boolean(post?.title?.trim()));
}

/**
 * Home blogs: English Home Selected Blogs are the source of truth for both
 * EN and AR. Arabic UI loads each post's Arabic listing-card fields via WPML.
 * Never pads with all published posts.
 */
export async function resolveHomeBlogs(
  fields: HomePageFields | null,
  allPosts: Array<BlogPostNode | null | undefined> = [],
  locale: AppLocale = DEFAULT_LOCALE
): Promise<HomeBlogsProps> {
  const sectionTitle = fields?.blogsSectionTitle?.trim() || "";

  try {
    // Always use English Home selection (live, no-store).
    const selectedPosts = await fetchHomeFeaturedBlogSelection("en");

    if (selectedPosts.length === 0) {
      return { sectionTitle, items: [] };
    }

    const postsToRender = await resolveSelectedHomeBlogPosts(
      selectedPosts,
      allPosts,
      locale
    );

    // One card per selected post, same order — no extras.
    const items: HomeBlogItem[] = [];
    for (const post of postsToRender) {
      const card = mapPostToBlogCard(post);
      if (card?.title) items.push(card);
    }

    return {
      sectionTitle,
      items,
    };
  } catch {
    return { sectionTitle, items: [] };
  }
}

export function normalizeAccordion(fields: HomePageFields | null): HomeAccordionProps {
  const title = fields?.accordionTitle?.trim();
  try {
    const raw = fields?.accordionItems;
    const list = Array.isArray(raw) ? raw : [];
    if (!list.length) return { title: title || undefined, items: undefined };
    const items: AccordionItem[] = list
      .map((a) => {
        const item = a as { faqTitle?: string; faqContent?: string } | null | undefined;
        const t = item?.faqTitle?.trim() ?? "";
        const c = item?.faqContent?.trim() ?? "";
        if (!t && !c) return null;
        return { title: t, content: c };
      })
      .filter((x): x is { title: string; content: string } => x != null)
      .map((x, i) => ({ id: i + 1, ...x }));
    return { title: title || undefined, items: items.length ? items : undefined };
  } catch {
    return { title: title || undefined, items: undefined };
  }
}
