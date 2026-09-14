/**
 * WordPress WPGraphQL API for Studio pages.
 * Fetches ACF data for Digital Experience, Growth & Branding, and Application Development studio pages.
 *
 * Optional ACF **URL** field on `studioBanner` (direct video file URLs — CDN or Cloudflare Stream):
 * - `bannerVideoUrl` — preferred over Media `bannerVideo` when set
 */

import {
  extractPortfolioListingCard,
  getListingCardImageUrl,
  resolveImageUrl,
  resolveMediaVideoUrl,
} from "@/app/lib/our-work-api";
import { portfolioDetailPath } from "@/app/lib/portfolio-url";
import {
  getWordPressGraphqlEndpoint,
  getWordpressGraphqlHeaders,
  WORDPRESS_REVALIDATE_SECONDS,
} from "@/app/lib/wordpress-graphql";
import type { StudioServiceCard } from "@/app/components/sections/StudioServiceCards";
import { DEFAULT_LOCALE, type AppLocale } from "@/app/lib/locale";

// -----------------------------------------------------------------------------
// GraphQL Query
// -----------------------------------------------------------------------------

const STUDIO_FEATURED_PORTFOLIO_FIELDS = `
  ... on Portfolio {
    databaseId
    title
    slug
    portfolioDetails {
      listingCard {
        portfolioSubtitle
        portfolioTitle
        portfolioDescription
        portfolioImage {
          node {
            sourceUrl
            mediaItemUrl
            altText
          }
        }
      }
    }
  }
`;

const STUDIO_PAGE_FIELDS_FRAGMENT = `
  studioBanner {
    bannerTitle
    bannerSubtitle
    bannerDescription
    bannerVideo {
      node {
        ... on MediaItem {
          mediaItemUrl
          sourceUrl
          link
        }
      }
    }
    bannerVideoUrl
    bannerBackgroundImage {
      node {
        sourceUrl
        altText
      }
    }
  }
  studioServiceCards {
    serviceKey
    yearLabel
    title
    description
    industryLabel
    industryValue
    ctaText
    ctaLink
    image {
      node {
        sourceUrl
        mediaItemUrl
        altText
      }
    }
    backgroundImage {
      node {
        sourceUrl
        mediaItemUrl
        altText
      }
    }
    overlayImage {
      node {
        sourceUrl
        mediaItemUrl
        altText
      }
    }
    imageWidth
    imageHeight
    contentMaxWidth
    imagePosition
    imageVAlign
    contentVAlign
    imageFit
    gradient
    borderColor
    overlayImageWidth
    overlayImageHeight
    imageClassName
  }
  studioOurWorkTitle
  studioFeaturedPortfolios(first: 100) {
    nodes {
      ${STUDIO_FEATURED_PORTFOLIO_FIELDS}
    }
  }
  studioAccordionTitle
  studioAccordionItems {
    faqTitle
    faqContent
  }
`;

const STUDIO_PAGE_FIELDS_FRAGMENT_WITHOUT_SERVICE_KEY =
  STUDIO_PAGE_FIELDS_FRAGMENT.replace("\n    serviceKey", "");

/** Legacy fields if CMS not yet re-imported with studioServiceCards / listingCard. */
const STUDIO_PAGE_FIELDS_FRAGMENT_LEGACY = `
  studioBanner {
    bannerTitle
    bannerDescription
    bannerVideo {
      node {
        ... on MediaItem {
          mediaItemUrl
          sourceUrl
          link
        }
      }
    }
    bannerVideoUrl
    bannerBackgroundImage {
      node {
        sourceUrl
        altText
      }
    }
  }
  studioServiceDetails {
    title
    description
    bulletPoints {
      text
    }
    image {
      node {
        sourceUrl
        altText
      }
    }
    video {
      node {
        mediaItemUrl
        sourceUrl
      }
    }
    buttonText
    buttonLink
  }
  studioOurWorkTitle
  studioFeaturedPortfolios(first: 100) {
    nodes {
      ... on Portfolio {
        databaseId
        title
        slug
        featuredImage {
          node {
            sourceUrl
          }
        }
        portfolioDetails {
          listingCard {
            portfolioSubtitle
            portfolioTitle
            portfolioDescription
            portfolioImage {
              node {
                sourceUrl
                mediaItemUrl
                altText
              }
            }
          }
          portfolioDetails {
            backgroundImage {
              node {
                sourceUrl
              }
            }
          }
        }
      }
    }
  }
  studioAccordionTitle
  studioAccordionItems {
    faqTitle
    faqContent
  }
`;

export const GET_STUDIO_PAGE = `
  query GetStudioPage($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      title
      slug
      studioPage {
        ${STUDIO_PAGE_FIELDS_FRAGMENT}
      }
    }
  }
`;

const GET_STUDIO_PAGE_WITHOUT_SERVICE_KEY = `
  query GetStudioPageWithoutServiceKey($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      title
      slug
      studioPage {
        ${STUDIO_PAGE_FIELDS_FRAGMENT_WITHOUT_SERVICE_KEY}
      }
    }
  }
`;

export const GET_STUDIO_PAGE_LEGACY = `
  query GetStudioPageLegacy($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      title
      slug
      studioPage {
        ${STUDIO_PAGE_FIELDS_FRAGMENT_LEGACY}
      }
    }
  }
`;

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export type StudioBanner = {
  bannerTitle?: string | null;
  bannerSubtitle?: string | null;
  bannerDescription?: string | null;
  /** Media library upload (MediaItem) or plain URL string when ACF return format is URL. */
  bannerVideo?:
    | string
    | { node?: { mediaItemUrl?: string; sourceUrl?: string; link?: string } }
    | null;
  /** Direct MP4/WebM URL (CDN / Cloudflare Stream). Preferred over `bannerVideo` when set. */
  bannerVideoUrl?: string | null;
  bannerBackgroundImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
};

/** Resolve studio banner video — URL field takes priority over media library upload. */
export function resolveStudioBannerVideoUrl(
  banner: StudioBanner | null | undefined
): string | undefined {
  return (
    resolveMediaVideoUrl(banner?.bannerVideoUrl) ?? resolveMediaVideoUrl(banner?.bannerVideo)
  );
}

export type StudioServiceCardNode = {
  serviceKey?: string | null;
  yearLabel?: string | null;
  title?: string | null;
  description?: string | null;
  industryLabel?: string | null;
  industryValue?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  image?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
  backgroundImage?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
  overlayImage?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
  imageWidth?: string | null;
  imageHeight?: string | null;
  contentMaxWidth?: string | null;
  imagePosition?: string | string[] | null;
  imageVAlign?: string | string[] | null;
  contentVAlign?: string | string[] | null;
  imageFit?: string | string[] | null;
  gradient?: string | null;
  borderColor?: string | null;
  overlayImageWidth?: string | null;
  overlayImageHeight?: string | null;
  imageClassName?: string | null;
};

export type StudioFeaturedPortfolio = {
  databaseId?: number | null;
  title?: string | null;
  slug?: string | null;
  featuredImage?: { node?: { sourceUrl?: string } } | null;
  portfolioDetails?: unknown;
};

export type StudioAccordionItem = {
  faqTitle?: string | null;
  faqContent?: string | null;
};

export type StudioPageFields = {
  studioBanner?: StudioBanner | null;
  studioServiceCards?: StudioServiceCardNode[] | null;
  /** Legacy repeater (pre Service Cards redesign). */
  studioServiceDetails?: Array<{
    title?: string | null;
    description?: string | null;
    bulletPoints?: Array<{ text?: string | null } | null> | null;
    image?: { node?: { sourceUrl?: string; mediaItemUrl?: string; altText?: string | null } } | null;
    video?: { node?: { mediaItemUrl?: string; sourceUrl?: string } } | null;
    buttonText?: string | null;
    buttonLink?: string | null;
  } | null> | null;
  studioOurWorkTitle?: string | null;
  studioFeaturedPortfolios?: { nodes?: (StudioFeaturedPortfolio | null)[] } | null;
  studioAccordionTitle?: string | null;
  studioAccordionItems?: StudioAccordionItem[] | null;
};

export type GraphQLStudioResponse = {
  data?: {
    page?: {
      title?: string | null;
      slug?: string | null;
      studioPage?: StudioPageFields | null;
    } | null;
  } | null;
  errors?: Array<{ message: string }> | null;
};

// -----------------------------------------------------------------------------
// Fetch
// -----------------------------------------------------------------------------

export async function fetchStudioPage(
  id: number | string,
  locale: AppLocale = DEFAULT_LOCALE
): Promise<GraphQLStudioResponse> {
  const run = async (query: string): Promise<GraphQLStudioResponse> => {
    const res = await fetch(getWordPressGraphqlEndpoint(locale), {
      method: "POST",
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: getWordpressGraphqlHeaders(locale),
      body: JSON.stringify({
        query,
        variables: { id: String(id) },
      }),
    });
    return (await res.json()) as GraphQLStudioResponse;
  };

  let json = await run(GET_STUDIO_PAGE);
  if (json.errors?.some((error) => /serviceKey/i.test(error.message))) {
    json = await run(GET_STUDIO_PAGE_WITHOUT_SERVICE_KEY);
  }
  const needsLegacy = json.errors?.some((e) =>
    /studioServiceCards|bannerSubtitle|listingCard|studioPortfolioPerPortfolioItems/i.test(
      String(e?.message || "")
    )
  );
  if (!needsLegacy) {
    return json;
  }

  return run(GET_STUDIO_PAGE_LEGACY);
}

/** Extract studioPage fields from response */
export function getStudioPageFields(data: GraphQLStudioResponse["data"]): StudioPageFields | null {
  return data?.page?.studioPage ?? null;
}

type StudioWorkItem = {
  title: string;
  description: string;
  image: string;
  category?: string;
  link?: string;
};

function getMediaUrl(
  media:
    | { node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; altText?: string | null } | null }
    | null
    | undefined
): string | undefined {
  return resolveImageUrl(media?.node?.sourceUrl ?? media?.node?.mediaItemUrl ?? undefined) ?? undefined;
}

function pickSelectValue(value: string | string[] | null | undefined): string | undefined {
  if (Array.isArray(value)) {
    const first = value.find((v) => typeof v === "string" && v.trim());
    return first?.trim() || undefined;
  }
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function parseCssLength(value: string | null | undefined): number | string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (/^\d+(\.\d+)?$/.test(trimmed)) return Number(trimmed);
  return trimmed;
}

export function getStudioOurWorkTitle(fields: StudioPageFields | null): string | undefined {
  return fields?.studioOurWorkTitle?.trim() || undefined;
}

/**
 * Selected portfolios only → Portfolio Listing Card content.
 * Empty selection → [] (Our Work section hidden).
 */
export function buildStudioOurWorkItems(fields: StudioPageFields | null): StudioWorkItem[] {
  const selected = (fields?.studioFeaturedPortfolios?.nodes ?? []).filter(
    Boolean
  ) as StudioFeaturedPortfolio[];
  if (!selected.length) return [];

  return selected
    .map((portfolio) => {
      const listingCard = extractPortfolioListingCard(portfolio);
      const title =
        listingCard?.portfolioTitle?.trim() || portfolio.title?.trim() || "";
      if (!title) return null;

      const image = getListingCardImageUrl(listingCard) || "";
      const category = listingCard?.portfolioSubtitle?.trim() || undefined;
      const description = listingCard?.portfolioDescription?.trim() || "";
      const link = portfolioDetailPath(portfolio.slug);

      return {
        title,
        description,
        image,
        ...(category ? { category } : {}),
        ...(link ? { link } : {}),
      };
    })
    .filter((item): item is StudioWorkItem => item != null);
}

/**
 * Map CMS Service Cards to StudioServiceCards UI.
 * Empty CMS → returns [] (section hidden).
 */
export function buildStudioServiceCards(
  fields: StudioPageFields | null
): StudioServiceCard[] {
  const rows = (fields?.studioServiceCards ?? []).filter(Boolean) as StudioServiceCardNode[];
  if (!rows.length) return [];

  return rows
    .map((row) => {
      const title = row.title?.trim() || "";
      if (!title) return null;

      const image = getMediaUrl(row.image);
      const backgroundImage = getMediaUrl(row.backgroundImage);
      const overlayImage = getMediaUrl(row.overlayImage);
      const imagePosition = pickSelectValue(row.imagePosition);
      const imageVAlign = pickSelectValue(row.imageVAlign);
      const contentVAlign = pickSelectValue(row.contentVAlign);
      const imageFit = pickSelectValue(row.imageFit);

      const card: StudioServiceCard = {
        title,
        ...(row.yearLabel?.trim() ? { yearLabel: row.yearLabel.trim() } : {}),
        ...(row.description?.trim() ? { description: row.description.trim() } : {}),
        ...(row.industryLabel?.trim() ? { industryLabel: row.industryLabel.trim() } : {}),
        ...(row.industryValue?.trim() ? { industryValue: row.industryValue.trim() } : {}),
        ...(row.ctaText?.trim() ? { ctaText: row.ctaText.trim() } : {}),
        ...(row.ctaLink?.trim() ? { ctaLink: row.ctaLink.trim() } : {}),
        ...(image ? { image, imageAlt: row.image?.node?.altText?.trim() || title } : {}),
        ...(backgroundImage ? { backgroundImage } : {}),
        ...(overlayImage ? { overlayImage } : {}),
        ...(parseCssLength(row.imageWidth) != null
          ? { imageWidth: parseCssLength(row.imageWidth) }
          : {}),
        ...(parseCssLength(row.imageHeight) != null
          ? { imageHeight: parseCssLength(row.imageHeight) }
          : {}),
        ...(parseCssLength(row.contentMaxWidth) != null
          ? { contentMaxWidth: parseCssLength(row.contentMaxWidth) }
          : {}),
        ...(parseCssLength(row.overlayImageWidth) != null
          ? { overlayImageWidth: parseCssLength(row.overlayImageWidth) }
          : {}),
        ...(parseCssLength(row.overlayImageHeight) != null
          ? { overlayImageHeight: parseCssLength(row.overlayImageHeight) }
          : {}),
        ...(imagePosition === "left" || imagePosition === "right"
          ? { imagePosition }
          : {}),
        ...(imageVAlign === "bottom" || imageVAlign === "center"
          ? { imageVAlign }
          : {}),
        ...(contentVAlign === "center" || contentVAlign === "top"
          ? { contentVAlign }
          : {}),
        ...(imageFit === "cover" || imageFit === "contain" ? { imageFit } : {}),
        ...(row.gradient?.trim() ? { gradient: row.gradient.trim() } : {}),
        ...(row.borderColor?.trim() ? { borderColor: row.borderColor.trim() } : {}),
        ...(row.imageClassName?.trim()
          ? { imageClassName: row.imageClassName.trim() }
          : {}),
      };

      return card;
    })
    .filter((card): card is StudioServiceCard => card != null);
}

/**
 * Fill missing layout props from design presets (by card index).
 * CMS content/media wins; presets only supply placement when CMS left layout empty.
 */
export function applyStudioServiceCardLayoutPresets(
  cards: StudioServiceCard[],
  presets: Partial<StudioServiceCard>[]
): StudioServiceCard[] {
  if (!cards.length || !presets.length) return cards;

  return cards.map((card, index) => {
    const preset = presets[index];
    if (!preset) return card;

    return {
      ...card,
      imageWidth: card.imageWidth ?? preset.imageWidth,
      imageHeight: card.imageHeight ?? preset.imageHeight,
      contentMaxWidth: card.contentMaxWidth ?? preset.contentMaxWidth,
      imagePosition: card.imagePosition ?? preset.imagePosition,
      imageVAlign: card.imageVAlign ?? preset.imageVAlign,
      contentVAlign: card.contentVAlign ?? preset.contentVAlign,
      imageFit: card.imageFit ?? preset.imageFit,
      overlayImageWidth: card.overlayImageWidth ?? preset.overlayImageWidth,
      overlayImageHeight: card.overlayImageHeight ?? preset.overlayImageHeight,
      gradient: card.gradient ?? preset.gradient,
      borderColor: card.borderColor ?? preset.borderColor,
      imageClassName: card.imageClassName ?? preset.imageClassName,
    };
  });
}
