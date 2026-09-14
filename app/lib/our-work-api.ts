/**
 * WordPress WPGraphQL API for Our Work page and Portfolio (work details).
 * GraphQL fetches use server-only WORDPRESS_GRAPHQL_URL when set.
 *
 * Optional ACF **URL** field on `ourWorkBannerSection`:
 * - `bannerVideoUrl` — preferred over Media `bannerVideo` when set (CDN / Cloudflare Stream MP4)
 */

import { cache } from "react";
import {
  getWordPressGraphqlEndpoint,
  WORDPRESS_REVALIDATE_SECONDS,
} from "@/app/lib/wordpress-graphql";
import { resolveImageUrl, toProxiedWordPressUploadUrl, pickDirectVideoFileUrl } from "@/app/lib/wp-media-url";

export { getWpOrigin, resolveImageUrl, toProxiedWordPressUploadUrl, pickDirectVideoFileUrl } from "@/app/lib/wp-media-url";

/**
 * Multiple project type / year rows from the same ACF text fields: use one line per row in
 * WordPress (newline-separated). Lines are paired by index; single-line values behave as before.
 */
export function parsePortfolioTypeYearPairs(
  projectTypeTitle?: string | null,
  projectYear?: string | null
): { title: string; year: string }[] {
  const splitLines = (v: string | null | undefined) =>
    v
      ?.split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean) ?? [];
  const tLines = splitLines(projectTypeTitle);
  const yLines = splitLines(projectYear);
  if (tLines.length === 0 && yLines.length === 0) return [];
  if (tLines.length <= 1 && yLines.length <= 1) {
    const t = projectTypeTitle?.trim() ?? "";
    const y = projectYear?.trim() ?? "";
    if (!t && !y) return [];
    return [{ title: t, year: y }];
  }
  const n = Math.max(tLines.length, yLines.length);
  const out: { title: string; year: string }[] = [];
  for (let i = 0; i < n; i++) {
    const title = tLines[i] ?? "";
    const year = yLines[i] ?? "";
    if (title || year) out.push({ title, year });
  }
  return out;
}

/**
 * Flatten ACF repeater payloads from WPGraphQL (array, Connection `nodes`, or snake_case keys).
 */
export function coalesceProjectInfoRows(raw: unknown): { rowTitle: string; rowDetail: string }[] {
  const asList = (v: unknown): unknown[] => {
    if (v == null) return [];
    if (Array.isArray(v)) return v.filter(Boolean);
    if (typeof v === "object") {
      const o = v as Record<string, unknown>;
      if (Array.isArray(o.nodes)) return o.nodes.filter(Boolean);
      if (Array.isArray(o.edges)) {
        return o.edges
          .map((e) => (e as { node?: unknown } | null | undefined)?.node)
          .filter(Boolean);
      }
    }
    return [];
  };

  return asList(raw)
    .map((item) => {
      if (item == null || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const title = String(
        o.rowTitle ??
          o.row_title ??
          o.projectType ??
          o.project_type ??
          o.title ??
          ""
      ).trim();
      const detail = String(
        o.rowDetail ??
          o.row_detail ??
          o.projectYearDetail ??
          o.project_year_detail ??
          o.projectYear ??
          o.project_year ??
          o.detail ??
          ""
      ).trim();
      if (!title && !detail) return null;
      return { rowTitle: title, rowDetail: detail };
    })
    .filter(Boolean) as { rowTitle: string; rowDetail: string }[];
}

/**
 * Project info rows from the portfolio repeater (`projectInfoRows`), or legacy newline
 * `projectTypeTitle` / `projectYear` pairs only when the repeater has no usable rows.
 */
export function getProjectInfoRowsForEducation(
  projectInfoRows?: unknown,
  projectTypeTitle?: string | null,
  projectYear?: string | null
): { title: string; detail: string }[] {
  const fromRepeater = coalesceProjectInfoRows(projectInfoRows).map((r) => ({
    title: r.rowTitle,
    detail: r.rowDetail,
  }));
  if (fromRepeater.length > 0) return fromRepeater;
  return parsePortfolioTypeYearPairs(projectTypeTitle, projectYear).map(({ title, year }) => ({
    title,
    detail: year,
  }));
}

/**
 * Same resolution rules as {@link resolveImageUrl}, for `<video src>`.
 * Use for direct file URLs (MP4/WebM), including third-party CDNs such as
 * Cloudflare Stream download links, e.g.
 * `https://customer-….cloudflarestream.com/{uid}/downloads/default.mp4`.
 * YouTube/Vimeo page URLs are not supported here — those need an iframe embed.
 */
export function resolveVideoUrl(url: string | undefined | null): string | undefined {
  const resolved = resolveImageUrl(url);
  if (!resolved) return undefined;
  return toProxiedWordPressUploadUrl(resolved) ?? resolved;
}

/** Resolve video URL from ACF MediaItem, plain URL string, or `{ node: { sourceUrl } }`. */
export function resolveMediaVideoUrl(raw: unknown): string | undefined {
  if (raw == null) return undefined;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed ? resolveVideoUrl(trimmed) : undefined;
  }
  if (typeof raw !== "object") return undefined;

  const value = raw as Record<string, unknown>;
  const node = value.node as Record<string, unknown> | undefined;
  const picked = pickDirectVideoFileUrl(
    node?.mediaItemUrl as string | undefined,
    node?.sourceUrl as string | undefined,
    value.mediaItemUrl as string | undefined,
    value.sourceUrl as string | undefined,
    value.url as string | undefined,
    node?.guid as string | undefined,
    value.guid as string | undefined,
    node?.link as string | undefined,
    value.link as string | undefined
  );

  if (picked) return resolveVideoUrl(picked);

  const file = value.file as Record<string, unknown> | undefined;
  if (file) {
    const fileUrl =
      (file.mediaItemUrl as string | undefined)?.trim() ||
      (file.sourceUrl as string | undefined)?.trim() ||
      (file.url as string | undefined)?.trim() ||
      (file.link as string | undefined)?.trim();
    if (fileUrl) return resolveVideoUrl(fileUrl);
  }

  return undefined;
}

// -----------------------------------------------------------------------------
// Our Work Listing Page (page by URI)
// -----------------------------------------------------------------------------

/** WPGraphQL fields on PortfolioDetailsPortfolioDetails (nested: portfolioDetails.portfolioDetails). */
const PORTFOLIO_DETAILS_INNER_FIELDS_BASE = `
  description
  overviewHeadline
  overviewHighlight
  brandLogo {
    node {
      sourceUrl
      altText
    }
  }
  platforms
  backgroundImage {
    node {
      sourceUrl
      altText
      mediaItemUrl
    }
  }
  heroVideo {
    node {
      sourceUrl
      mediaItemUrl
    }
  }
  heroVideoUrl
  heroImageMobile {
    node {
      sourceUrl
      altText
      mediaItemUrl
    }
  }
  heroVideoMobile {
    node {
      sourceUrl
      mediaItemUrl
    }
  }
  heroVideoMobileUrl
  industryTitle
  industryDescription
  servicesList {
    serviceName
  }
  stayImage {
    node {
      sourceUrl
      mediaItemUrl
      altText
    }
  }
  deliveredTitle
  deliverables {
    deliverableName
  }
  performanceMetrics {
    metricTitle
    metricValue
  }
  fullWidthBackgroundImage {
    node {
      sourceUrl
      altText
      mediaItemUrl
    }
  }
  fullWidthBackgroundImageAlt
  featureVideo {
    node {
      sourceUrl
      mediaItemUrl
    }
  }
  featureVideoUrl
  featureImageMobile {
    node {
      sourceUrl
      altText
      mediaItemUrl
    }
  }
  featureVideoMobile {
    node {
      sourceUrl
      mediaItemUrl
    }
  }
  featureVideoMobileUrl
  showcaseCards {
    cardType
    title
    subtitle
    description
    image {
      node {
        sourceUrl
        altText
        mediaItemUrl
      }
    }
    backgroundClass
    textColorClass
  }
  capabilityCards {
    cardHeading
    cardSubtext
  }
  testimonials {
    testimonialText
    testimonialRating
    testimonialAuthor
    testimonialRole
  }
  contactHeadingSub
  contactHeadingMain
`;

const RELATED_WORK_ITEMS_CONNECTION = `
  relatedWorkItems(first: 20) {
    nodes {
      ... on Portfolio {
        databaseId
        slug
        title
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
    }
  }
`;

/** More Work Items Section inside Work Details group (Work Details v2 tab). */
const MORE_WORK_ITEMS_SECTION = `
  moreWorkItemsSection {
    ${RELATED_WORK_ITEMS_CONNECTION}
  }
`;

export const PORTFOLIO_DETAILS_INNER_FIELDS = `
${PORTFOLIO_DETAILS_INNER_FIELDS_BASE.trimEnd()}
${MORE_WORK_ITEMS_SECTION}
`;

export const PORTFOLIO_DETAILS_NESTED = `
  portfolioDetails {
    portfolioDetails {
      ${PORTFOLIO_DETAILS_INNER_FIELDS}
    }
  }
`;

/** Portfolio detail query without More Work selection (used if CMS still has legacy field). */
export const PORTFOLIO_DETAILS_NESTED_NO_RELATED = `
  portfolioDetails {
    portfolioDetails {
      ${PORTFOLIO_DETAILS_INNER_FIELDS_BASE}
    }
  }
`;

export const PORTFOLIO_DETAILS_NESTED_MINIMAL = `
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
          altText
          mediaItemUrl
        }
      }
      industryTitle
    }
  }
`;

/** Fallback when CMS has listing fields flat on nested portfolioDetails (no listingCard group). */
export const PORTFOLIO_DETAILS_NESTED_MINIMAL_FLAT_LISTING = `
  portfolioDetails {
    portfolioDetails {
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
      backgroundImage {
        node {
          sourceUrl
          altText
          mediaItemUrl
        }
      }
      industryTitle
    }
  }
`;

const RELATED_WORK_ITEMS_CONNECTION_FLAT_LISTING = `
  relatedWorkItems(first: 20) {
    nodes {
      ... on Portfolio {
        databaseId
        slug
        title
        portfolioDetails {
          portfolioDetails {
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
    }
  }
`;

const MORE_WORK_ITEMS_SECTION_FLAT = `
  moreWorkItemsSection {
    ${RELATED_WORK_ITEMS_CONNECTION_FLAT_LISTING}
  }
`;

const PORTFOLIO_DETAILS_NESTED_FLAT_RELATED = `
  portfolioDetails {
    portfolioDetails {
      ${PORTFOLIO_DETAILS_INNER_FIELDS_BASE.trimEnd()}
      ${MORE_WORK_ITEMS_SECTION_FLAT}
    }
  }
`;

export type PortfolioListingCardFields = {
  portfolioSubtitle?: string | null;
  portfolioTitle?: string | null;
  portfolioDescription?: string | null;
  portfolioImage?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
};

/** Portfolio Details → Listing Card tab (GraphQL: portfolioDetails.listingCard). */
export function extractPortfolioListingCard(
  source: { portfolioDetails?: unknown } | null | undefined
): PortfolioListingCardFields | null {
  const raw = source?.portfolioDetails;
  if (!raw || typeof raw !== "object") return null;
  const pd = raw as Record<string, unknown>;
  const listingCard = pd.listingCard;
  if (listingCard && typeof listingCard === "object") {
    return listingCard as PortfolioListingCardFields;
  }
  // Fallback if Listing Card fields were synced flat onto the nested group
  const nested = pd.portfolioDetails;
  if (nested && typeof nested === "object") {
    const n = nested as Record<string, unknown>;
    if (
      "portfolioSubtitle" in n ||
      "portfolioTitle" in n ||
      "portfolioDescription" in n ||
      "portfolioImage" in n
    ) {
      return nested as PortfolioListingCardFields;
    }
  }
  if (
    "portfolioSubtitle" in pd ||
    "portfolioTitle" in pd ||
    "portfolioDescription" in pd ||
    "portfolioImage" in pd
  ) {
    return pd as PortfolioListingCardFields;
  }
  return null;
}

export function getListingCardImageUrl(
  listingCard: PortfolioListingCardFields | null | undefined
): string | undefined {
  const node = listingCard?.portfolioImage?.node;
  const url = node?.sourceUrl?.trim() || node?.mediaItemUrl?.trim();
  return url ? resolveImageUrl(url) ?? url : undefined;
}

/** Require Portfolio → Listing Card image; do not fall back to hero/background defaults. */
export function hasFilledPortfolioListingCard(
  listingCard: PortfolioListingCardFields | null | undefined
): boolean {
  return Boolean(getListingCardImageUrl(listingCard));
}

export type PortfolioDetailsFields = {
  title?: string | null;
  description?: string | null;
  overviewHeadline?: string | null;
  overviewHighlight?: string | null;
  brandLogo?: { node?: { sourceUrl?: string | null; altText?: string | null } | null } | null;
  platforms?: string | null;
  backgroundImage?: {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; altText?: string | null } | null;
  } | null;
  heroVideo?: {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null } | null;
  } | null;
  heroVideoUrl?: string | null;
  heroImageMobile?: {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; altText?: string | null } | null;
  } | null;
  heroVideoMobile?: {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null } | null;
  } | null;
  heroVideoMobileUrl?: string | null;
  heroBackgroundImage?: {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; altText?: string | null } | null;
  } | null;
  educationBackgroundImage?: {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; altText?: string | null } | null;
  } | null;
  industryTitle?: string | null;
  industryDescription?: string | null;
  projectTypeTitle?: string | null;
  projectYear?: string | null;
  projectInfoRows?: unknown;
  servicesTitle?: string | null;
  servicesList?: Array<{ serviceName?: string | null } | null> | null;
  stayImage?: {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; altText?: string | null } | null;
  } | null;
  stayParagraphs?: Array<{ paragraphText?: string | null } | null> | null;
  deliveredTitle?: string | null;
  deliveredDescription?: string | null;
  deliverables?: Array<{ deliverableName?: string | null } | null> | null;
  performanceMetrics?: Array<{ metricTitle?: string | null; metricValue?: string | null } | null> | null;
  fullWidthBackgroundImage?: { node?: { sourceUrl?: string | null; altText?: string | null; mediaItemUrl?: string | null } | null } | null;
  fullWidthBackgroundImageAlt?: string | null;
  featureVideo?: {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null } | null;
  } | null;
  featureVideoUrl?: string | null;
  featureImageMobile?: {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; altText?: string | null } | null;
  } | null;
  featureVideoMobile?: {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null } | null;
  } | null;
  featureVideoMobileUrl?: string | null;
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
  capabilityCards?: Array<{ cardHeading?: string | null; cardSubtext?: string | null } | null> | null;
  testimonialsTitle?: string | null;
  testimonials?: Array<{
    testimonialText?: string | null;
    testimonialRating?: number | null;
    testimonialAuthor?: string | null;
    testimonialRole?: string | null;
  } | null> | null;
  contactHeadingSub?: string | null;
  contactHeadingMain?: string | null;
  relatedWorkItems?:
    | Array<{
        databaseId?: number | null;
        slug?: string | null;
        title?: string | null;
        portfolioDetails?: {
          listingCard?: PortfolioListingCardFields | null;
        } | null;
        /** Legacy repeater shape (pre relationship field). */
        relatedWorkTitle?: string | null;
        relatedWorkDescription?: string | null;
        relatedWorkLink?: string | null;
        relatedWorkImage?: {
          node?: {
            sourceUrl?: string | null;
            mediaItemUrl?: string | null;
            altText?: string | null;
          } | null;
        } | null;
      } | null>
    | {
        nodes?: Array<{
          databaseId?: number | null;
          slug?: string | null;
          title?: string | null;
          portfolioDetails?: {
            listingCard?: PortfolioListingCardFields | null;
          } | null;
        } | null> | null;
      }
    | null;
  relatedWorkCtaVariant?: string | string[] | null;
  relatedWorkShowCta?: boolean | null;
  relatedWorkUseNewDesign?: boolean | null;
};

/** Unwrap portfolioDetails.portfolioDetails (ACF group) or flat portfolioDetails. */
export function extractPortfolioDetails(
  source: { portfolioDetails?: unknown } | null | undefined
): PortfolioDetailsFields | null {
  const raw = source?.portfolioDetails;
  if (!raw || typeof raw !== "object") return null;

  const pd = raw as Record<string, unknown>;
  if (pd.portfolioDetails && typeof pd.portfolioDetails === "object") {
    return pd.portfolioDetails as PortfolioDetailsFields;
  }

  if (
    "backgroundImage" in pd ||
    "description" in pd ||
    "industryTitle" in pd ||
    "overviewHeadline" in pd
  ) {
    return pd as PortfolioDetailsFields;
  }

  return null;
}

export function withFlattenedPortfolioDetails<T extends { portfolioDetails?: unknown }>(
  item: T
): T & {
  portfolioDetails: (PortfolioDetailsFields & {
    listingCard?: PortfolioListingCardFields | null;
    relatedWorkItems?: PortfolioDetailsFields["relatedWorkItems"];
    moreWorkItemsSection?: {
      relatedWorkItems?: PortfolioDetailsFields["relatedWorkItems"];
    } | null;
  }) | null;
} {
  const flattened = extractPortfolioDetails(item);
  // Must keep Listing Card: flatten only unwraps nested work-details fields.
  const listingCard = extractPortfolioListingCard(item);

  const rawRoot = item?.portfolioDetails;
  const root =
    rawRoot && typeof rawRoot === "object"
      ? (rawRoot as Record<string, unknown>)
      : null;

  // moreWorkItemsSection may live on nested Work Details group or (legacy) root.
  const nested =
    root?.portfolioDetails && typeof root.portfolioDetails === "object"
      ? (root.portfolioDetails as Record<string, unknown>)
      : null;
  const moreFromNested =
    nested?.moreWorkItemsSection && typeof nested.moreWorkItemsSection === "object"
      ? (nested.moreWorkItemsSection as {
          relatedWorkItems?: PortfolioDetailsFields["relatedWorkItems"];
        })
      : null;
  const moreFromRoot =
    root?.moreWorkItemsSection && typeof root.moreWorkItemsSection === "object"
      ? (root.moreWorkItemsSection as {
          relatedWorkItems?: PortfolioDetailsFields["relatedWorkItems"];
        })
      : null;
  const moreSection = moreFromNested ?? moreFromRoot;

  const relatedWorkItems =
    moreSection?.relatedWorkItems ??
    (flattened as PortfolioDetailsFields | null)?.relatedWorkItems ??
    null;

  if (!flattened && !listingCard && !relatedWorkItems && !moreSection) {
    return {
      ...item,
      portfolioDetails: null,
    };
  }

  return {
    ...item,
    portfolioDetails: {
      ...(flattened ?? {}),
      ...(listingCard ? { listingCard } : {}),
      ...(relatedWorkItems ? { relatedWorkItems } : {}),
      ...(moreSection ? { moreWorkItemsSection: moreSection } : {}),
    },
  };
}

export const GET_OUR_WORK_LISTING_PAGE = `
  query GetOurWorkListingPage($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      slug
      uri
      ourWorkPerPortfolioOverrides {
        ourWorkPerPortfolioItems {
          portfolioPost {
            nodes {
              ... on Portfolio {
                databaseId
                slug
                title
              }
            }
          }
          sectionSubtitle
          sectionTitle
          sectionDescription
          portfolioSubtitle
          portfolioTitle
          portfolioDescription
          portfolioImage {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
              }
            }
          }
          portfolioCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
      }
      ourWorkPageFields {
        ourWorkBannerSection {
          bannerTitle
          bannerDescription
          bannerBackgroundImage {
            node {
              sourceUrl
              mediaItemUrl
              altText
            }
          }
          bannerVideo {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
                link
              }
            }
          }
          bannerVideoUrl
        }
        workItemsSection {
          workItems(first: 100) {
            nodes {
              ... on Portfolio {
                id
                databaseId
                title
                slug
                uri
                excerpt
                homePortfolioListing {
                  portfolioListingSubtitle
                  portfolioListingTitle
                  portfolioListingDescription
                  portfolioListingCards {
                    cardSubtitle
                    cardTitle
                    cardDescription
                    cardImage {
                      node {
                        ... on MediaItem {
                          databaseId
                          sourceUrl
                          mediaItemUrl
                        }
                      }
                    }
                  }
                }
                ${PORTFOLIO_DETAILS_NESTED_MINIMAL}
              }
            }
          }
        }
        accordionSection {
          accordionTitle
          accordionItems {
            faqTitle
            faqContent
          }
        }
      }
    }
  }
`;

/** Legacy query without new overrides field (for older schema compatibility). */
export const GET_OUR_WORK_LISTING_PAGE_LEGACY = `
  query GetOurWorkListingPageLegacy($uri: ID!) {
    page(id: $uri, idType: URI) {
      title
      slug
      uri
      ourWorkPageFields {
        ourWorkBannerSection {
          bannerTitle
          bannerDescription
          bannerBackgroundImage {
            node {
              sourceUrl
              mediaItemUrl
              altText
            }
          }
          bannerVideo {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
                link
              }
            }
          }
          bannerVideoUrl
        }
        workItemsSection {
          workItems(first: 100) {
            nodes {
              ... on Portfolio {
                id
                databaseId
                title
                slug
                uri
                excerpt
                homePortfolioListing {
                  portfolioListingSubtitle
                  portfolioListingTitle
                  portfolioListingDescription
                  portfolioListingCards {
                    cardSubtitle
                    cardTitle
                    cardDescription
                    cardImage {
                      node {
                        ... on MediaItem {
                          databaseId
                          sourceUrl
                          mediaItemUrl
                        }
                      }
                    }
                  }
                }
                ${PORTFOLIO_DETAILS_NESTED_MINIMAL}
              }
            }
          }
        }
        accordionSection {
          accordionTitle
          accordionItems {
            faqTitle
            faqContent
          }
        }
      }
    }
  }
`;

export const OUR_WORK_LISTING_VARIABLES = { uri: "/our-work/" };

// -----------------------------------------------------------------------------
// Portfolios list (for Our Work grid when page has no work items)
// -----------------------------------------------------------------------------

export const GET_PORTFOLIOS_LIST = `
  query GetPortfoliosList {
    portfolios(first: 100) {
      nodes {
        databaseId
        slug
        title
        uri
        excerpt
        homePortfolioListing {
          portfolioListingSubtitle
          portfolioListingTitle
          portfolioListingDescription
          portfolioListingCards {
            cardSubtitle
            cardTitle
            cardDescription
            cardImage {
              node {
                ... on MediaItem {
                  databaseId
                  sourceUrl
                  mediaItemUrl
                }
              }
            }
          }
        }
        ${PORTFOLIO_DETAILS_NESTED_MINIMAL}
      }
    }
  }
`;

/**
 * Featured portfolios: either by taxonomy (portfolio_tag term "featured") or all with tags for client-side filter.
 * WordPress: use either "Portfolio Tag" (portfolioTags) or "Portfolio Categories" (portfolioCategories).
 * Add term "Featured" (slug: featured) and assign to portfolios. We check both taxonomies.
 */
export const GET_PORTFOLIOS_WITH_TAGS = `
  query GetPortfoliosWithTags {
    portfolios(first: 100) {
      nodes {
        slug
        title
        uri
        excerpt
        portfolioTags {
          nodes {
            slug
          }
        }
        portfolioCategories {
          nodes {
            slug
          }
        }
        ${PORTFOLIO_DETAILS_NESTED_MINIMAL}
      }
    }
  }
`;

/** Term slug used to mark portfolios as featured on home */
export const FEATURED_TERM_SLUG = "featured";

export type PortfoliosList = {
  portfolios?: {
    nodes?: Array<{
      databaseId?: number | null;
      slug?: string | null;
      title?: string | null;
      description?: string | null;
      excerpt?: string | null;
      uri?: string | null;
      homePortfolioListing?: {
        portfolioListingSubtitle?: string | null;
        portfolioListingTitle?: string | null;
        portfolioListingDescription?: string | null;
        portfolioListingCards?: Array<{
          cardSubtitle?: string | null;
          cardTitle?: string | null;
          cardDescription?: string | null;
          cardImage?: {
            node?: {
              databaseId?: number | null;
              sourceUrl?: string | null;
              mediaItemUrl?: string | null;
            } | null;
          } | null;
        } | null> | null;
      } | null;
      portfolioDetails?: {
        listingCard?: PortfolioListingCardFields | null;
        backgroundImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
        heroBackgroundImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
      } | null;
    } | null>;
  } | null;
};

export type PortfoliosWithTagsList = {
  portfolios?: {
    nodes?: Array<{
      slug?: string | null;
      title?: string | null;
      uri?: string | null;
      excerpt?: string | null;
      portfolioTags?: { nodes?: Array<{ slug?: string | null } | null> } | null;
      portfolioCategories?: { nodes?: Array<{ slug?: string | null } | null> } | null;
      portfolioDetails?: {
        listingCard?: PortfolioListingCardFields | null;
        backgroundImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
        heroBackgroundImage?: { node?: { sourceUrl?: string; altText?: string | null } } | null;
      } | null;
    } | null>;
  } | null;
};

// -----------------------------------------------------------------------------
// Portfolio by slug (work details)
// -----------------------------------------------------------------------------

export const GET_PORTFOLIO_BY_SLUG = `
  query GetPortfolioBySlug($slug: ID!) {
    portfolio(id: $slug, idType: SLUG) {
      title
      slug
      uri
      ${PORTFOLIO_DETAILS_NESTED}
    }
  }
`;

const GET_PORTFOLIO_BY_SLUG_FLAT_RELATED = `
  query GetPortfolioBySlugFlatRelated($slug: ID!) {
    portfolio(id: $slug, idType: SLUG) {
      title
      slug
      uri
      ${PORTFOLIO_DETAILS_NESTED_FLAT_RELATED}
    }
  }
`;

const GET_PORTFOLIO_BY_SLUG_NO_RELATED = `
  query GetPortfolioBySlugNoRelated($slug: ID!) {
    portfolio(id: $slug, idType: SLUG) {
      title
      slug
      uri
      ${PORTFOLIO_DETAILS_NESTED_NO_RELATED}
    }
  }
`;

function graphqlErrorsMention(errors: Array<{ message: string }> | undefined, pattern: RegExp): boolean {
  return (errors ?? []).some((error) => pattern.test(String(error?.message || "")));
}
// -----------------------------------------------------------------------------
// Types (Our Work listing)
// -----------------------------------------------------------------------------

export type OurWorkListingPage = {
  page: {
    title?: string | null;
    slug?: string | null;
    uri?: string | null;
    ourWorkPerPortfolioOverrides?: {
      ourWorkPerPortfolioItems?: Array<{
        portfolioPost?: {
          nodes?: Array<{
            databaseId?: number | null;
            slug?: string | null;
            title?: string | null;
          } | null> | null;
        } | null;
        sectionSubtitle?: string | null;
        sectionTitle?: string | null;
        sectionDescription?: string | null;
        portfolioSubtitle?: string | null;
        portfolioTitle?: string | null;
        portfolioDescription?: string | null;
        portfolioImage?: {
          node?: {
            sourceUrl?: string | null;
            mediaItemUrl?: string | null;
          } | null;
        } | null;
        portfolioCards?: Array<{
          cardSubtitle?: string | null;
          cardTitle?: string | null;
          cardDescription?: string | null;
          cardImage?: {
            node?: {
              sourceUrl?: string | null;
              mediaItemUrl?: string | null;
            } | null;
          } | null;
        } | null> | null;
      } | null> | null;
    } | null;
    ourWorkPageFields?: {
      ourWorkBannerSection?: {
        bannerTitle?: string | null;
        bannerDescription?: string | null;
        bannerBackgroundImage?: {
          node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; altText?: string | null };
        } | null;
        bannerVideo?:
          | string
          | { node?: { sourceUrl?: string | null; mediaItemUrl?: string | null; link?: string | null } }
          | null;
        /** Direct MP4/WebM URL (CDN / Cloudflare Stream). Preferred over `bannerVideo` when set. */
        bannerVideoUrl?: string | null;
      } | null;
      workItemsSection?: {
        workItems?:
        | Array<{
          __typename?: string;
          id?: string | null;
          databaseId?: number | null;
          title?: string | null;
          slug?: string | null;
          uri?: string | null;
          excerpt?: string | null;
          portfolioDetails?: {
            backgroundImage?:
            | { node?: { sourceUrl?: string; altText?: string | null }; sourceUrl?: string; altText?: string | null }
            | null;
            heroBackgroundImage?:
            | { node?: { sourceUrl?: string; altText?: string | null }; sourceUrl?: string; altText?: string | null }
            | null;
            industryTitle?: string | null;
          } | null;
        } | null>
        | { nodes?: Array<{ __typename?: string; id?: string | null; databaseId?: number | null; title?: string | null; slug?: string | null; uri?: string | null; excerpt?: string | null; portfolioDetails?: { backgroundImage?: { node?: { sourceUrl?: string; altText?: string | null }; sourceUrl?: string; altText?: string | null } | null; heroBackgroundImage?: { node?: { sourceUrl?: string; altText?: string | null }; sourceUrl?: string; altText?: string | null } | null; industryTitle?: string | null } | null } | null> }
        | { edges?: Array<{ node?: { __typename?: string; id?: string | null; databaseId?: number | null; title?: string | null; slug?: string | null; uri?: string | null; excerpt?: string | null; portfolioDetails?: { backgroundImage?: { node?: { sourceUrl?: string; altText?: string | null }; sourceUrl?: string; altText?: string | null } | null; heroBackgroundImage?: { node?: { sourceUrl?: string; altText?: string | null }; sourceUrl?: string; altText?: string | null } | null; industryTitle?: string | null } | null } | null } | null> }
        | null;
      } | null;
      accordionSection?: {
        accordionTitle?: string | null;
        accordionItems?: Array<{ faqTitle?: string | null; faqContent?: string | null } | null> | null;
      } | null;
    } | null;
  } | null;
};

// -----------------------------------------------------------------------------
// Types (Portfolio)
// -----------------------------------------------------------------------------

export type PortfolioBySlug = {
  portfolio: {
    title?: string | null;
    slug?: string | null;
    uri?: string | null;
    description?: string | null;
    portfolioDetails?: PortfolioDetailsFields | null;
  } | null;
};

export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

// -----------------------------------------------------------------------------
// Fetch helpers
// -----------------------------------------------------------------------------

export async function fetchOurWorkListingPage(): Promise<
  GraphQLResponse<OurWorkListingPage>
> {
  const urisToTry = ["/our-work/", "our-work", "/our-work"];
  let lastRes: GraphQLResponse<OurWorkListingPage> = { data: undefined, errors: undefined };
  for (const uri of urisToTry) {
    const run = async (query: string) => {
      const res = await fetch(getWordPressGraphqlEndpoint(), {
        method: "POST",
        next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          variables: { uri },
        }),
      });
      return (await res.json()) as GraphQLResponse<OurWorkListingPage>;
    };

    let query = GET_OUR_WORK_LISTING_PAGE;
    let json = await run(query);
    lastRes = json;

    if (graphqlErrorsMention(json.errors, /ourWorkPerPortfolioOverrides/i)) {
      query = GET_OUR_WORK_LISTING_PAGE_LEGACY;
      json = await run(query);
      lastRes = json;
    }

    if (graphqlErrorsMention(json.errors, /listingCard/i)) {
      json = await run(
        query.replace(
          PORTFOLIO_DETAILS_NESTED_MINIMAL,
          PORTFOLIO_DETAILS_NESTED_MINIMAL_FLAT_LISTING
        )
      );
      lastRes = json;
    }

    if (json.errors?.length && !json.data?.page) {
      continue;
    }
    if (json.data?.page) return json;
  }
  return lastRes;
}

export async function fetchPortfoliosList(): Promise<
  GraphQLResponse<PortfoliosList>
> {
  const run = async (query: string) => {
    const res = await fetch(getWordPressGraphqlEndpoint(), {
      method: "POST",
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });
    return (await res.json()) as GraphQLResponse<PortfoliosList>;
  };

  let json = await run(GET_PORTFOLIOS_LIST);
  if (graphqlErrorsMention(json.errors, /listingCard/i)) {
    const flatQuery = GET_PORTFOLIOS_LIST.replace(
      PORTFOLIO_DETAILS_NESTED_MINIMAL,
      PORTFOLIO_DETAILS_NESTED_MINIMAL_FLAT_LISTING
    );
    json = await run(flatQuery);
  }

  if (json.data?.portfolios?.nodes?.length) {
    json.data.portfolios.nodes = json.data.portfolios.nodes.map((node) =>
      node ? withFlattenedPortfolioDetails(node) : node
    );
  }

  return json;
}

/**
 * Fetches portfolios that have the "featured" tag (taxonomy term slug: featured).
 * Requires Portfolio CPT to have a taxonomy with term "Featured" (slug: featured), e.g. "Portfolio Tag" or "Portfolio Categories".
 * Returns same shape as PortfoliosList for easy use in Home Our Work section.
 */
export async function fetchFeaturedPortfoliosList(): Promise<
  GraphQLResponse<PortfoliosList>
> {
  try {
    const res = await fetch(getWordPressGraphqlEndpoint(), {
      method: "POST",
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: GET_PORTFOLIOS_WITH_TAGS }),
    });
    const json = (await res.json()) as GraphQLResponse<PortfoliosWithTagsList>;
    if (json.errors?.length || !json.data?.portfolios?.nodes) {
      return { data: { portfolios: { nodes: [] } }, errors: json.errors };
    }
    const featured = json.data.portfolios.nodes.filter((node) => {
      const tagSlugs = node?.portfolioTags?.nodes?.map((t) => t?.slug?.trim()).filter(Boolean) ?? [];
      const categorySlugs = node?.portfolioCategories?.nodes?.map((t) => t?.slug?.trim()).filter(Boolean) ?? [];
      return tagSlugs.includes(FEATURED_TERM_SLUG) || categorySlugs.includes(FEATURED_TERM_SLUG);
    });
    return {
      data: {
        portfolios: {
          nodes: featured.map((node) => (node ? withFlattenedPortfolioDetails(node) : node)),
        },
      },
      errors: undefined,
    };
  } catch {
    return { data: { portfolios: { nodes: [] } }, errors: undefined };
  }
}

export const fetchPortfolioBySlug = cache(
  async (slug: string): Promise<GraphQLResponse<PortfolioBySlug>> => {
  const normalizedSlug = slug.replace(/^\/+|\/+$/g, "") || slug;

  const runQuery = async (query: string) => {
    const res = await fetch(getWordPressGraphqlEndpoint(), {
      method: "POST",
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query,
        variables: { slug: normalizedSlug },
      }),
    });
    return (await res.json()) as GraphQLResponse<PortfolioBySlug>;
  };

  let json = await runQuery(GET_PORTFOLIO_BY_SLUG);

  // listingCard / moreWorkItemsSection / relatedWorkItems shape mismatch after ACF import.
  if (
    !json.data?.portfolio ||
    graphqlErrorsMention(json.errors, /listingCard|relatedWorkItems|moreWorkItemsSection/i)
  ) {
    json = await runQuery(GET_PORTFOLIO_BY_SLUG_FLAT_RELATED);
  }
  if (
    !json.data?.portfolio ||
    graphqlErrorsMention(json.errors, /listingCard|relatedWorkItems|moreWorkItemsSection/i)
  ) {
    json = await runQuery(GET_PORTFOLIO_BY_SLUG_NO_RELATED);
  }

  if (json.errors?.length && !json.data?.portfolio) {
    console.error(
      "[fetchPortfolioBySlug] GraphQL errors:",
      json.errors.map((error) => error.message).join("; ")
    );
  }

  if (json.data?.portfolio) {
    json.data.portfolio = withFlattenedPortfolioDetails(json.data.portfolio);
  }

    return json;
  }
);
