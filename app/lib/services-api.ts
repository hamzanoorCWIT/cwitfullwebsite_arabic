/**
 * WordPress WPGraphQL API for Services page.
 * ACF group GraphQL name: servicesPage
 * (see wordpress/acf-json/acf-export-2026-07-16-services.json)
 */

import {
  getWordPressGraphqlEndpoint,
  getWordpressGraphqlHeaders,
  WORDPRESS_REVALIDATE_SECONDS,
} from "@/app/lib/wordpress-graphql";
import { DEFAULT_LOCALE, type AppLocale } from "@/app/lib/locale";
import { resolvePageIdForLocale } from "@/app/lib/wpml-page";

export const SERVICES_PAGE_URI =
  process.env.NEXT_PUBLIC_SERVICES_PAGE_URI?.trim() || "/services/";

export const SERVICES_PAGE_DATABASE_ID =
  process.env.NEXT_PUBLIC_SERVICES_PAGE_ID?.trim() || "";

export type AcfImageNode = {
  node?: {
    sourceUrl?: string | null;
    mediaItemUrl?: string | null;
    altText?: string | null;
  } | null;
} | null;

export type ServicesStudioCardNode = {
  title?: string | null;
  isTall?: boolean | null;
  href?: string | null;
  description?: string | null;
  image?: AcfImageNode;
  /** ACF file field for SVG overlays (preferred over `image` when set). */
  imageSvg?: AcfImageNode;
  backgroundImage?: AcfImageNode;
  gradient?: string | null;
  borderColor?: string | null;
  boxShadow?: string | null;
} | null;

export type ServicesStudioNode = {
  adminLabel?: string | string[] | null;
  studioKey?: string | string[] | null;
  titleLayout?: string | string[] | null;
  titleHighlight?: string | null;
  titleRemainder?: string | null;
  description?: string | null;
  ctaText?: string | null;
  ctaLink?: string | null;
  cards?: ServicesStudioCardNode[] | null;
} | null;

export type ServicesSolutionItemNode = {
  itemType?: string | string[] | null;
  text?: string | null;
} | null;

export type ServicesFaqItemNode = {
  faqTitle?: string | null;
  faqContent?: string | null;
} | null;

export type ServicesPortfolioNode = {
  databaseId?: number | null;
  slug?: string | null;
  title?: string | null;
  excerpt?: string | null;
  featuredImage?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
  portfolioDetails?: unknown;
} | null;

export type ServicesPageFields = {
  servicesBanner?: {
    bannerTitle?: string | null;
    bannerSubtitle?: string | null;
    bannerDescription?: string | null;
    bannerBackgroundImage?: AcfImageNode;
  } | null;
  servicesStudios?: ServicesStudioNode[] | null;
  servicesOurWorkUseHome?: boolean | null;
  servicesOurWorkTitle?: string | null;
  servicesFeaturedPortfolios?: {
    nodes?: ServicesPortfolioNode[] | null;
  } | null;
  servicesSolutionsTitle?: string | null;
  servicesSolutionsHighlight?: string | null;
  servicesSolutionsItems?: ServicesSolutionItemNode[] | null;
  servicesFaqTitle?: string | null;
  servicesFaqItems?: ServicesFaqItemNode[] | null;
};

export type GraphQLServicesResponse = {
  data?: {
    page?: {
      databaseId?: number | null;
      title?: string | null;
      slug?: string | null;
      servicesPage?: ServicesPageFields | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const SERVICES_PAGE_FIELDS = `
  servicesBanner {
    bannerTitle
    bannerSubtitle
    bannerDescription
    bannerBackgroundImage {
      node {
        sourceUrl
        mediaItemUrl
        altText
      }
    }
  }
  servicesStudios {
    adminLabel
    studioKey
    titleLayout
    titleHighlight
    titleRemainder
    description
    ctaText
    ctaLink
    cards {
      title
      isTall
      href
      description
      image {
        node {
          sourceUrl
          mediaItemUrl
          altText
        }
      }
      imageSvg {
        node {
          ... on MediaItem {
            mediaItemUrl
            sourceUrl
            altText
            mimeType
          }
        }
      }
      backgroundImage {
        node {
          sourceUrl
          mediaItemUrl
          altText
        }
      }
      gradient
      borderColor
      boxShadow
    }
  }
  servicesOurWorkUseHome
  servicesOurWorkTitle
  servicesFeaturedPortfolios(first: 100) {
    nodes {
      ... on Portfolio {
        databaseId
        slug
        title
        excerpt
        featuredImage {
          node {
            sourceUrl
            mediaItemUrl
            altText
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
                mediaItemUrl
                altText
              }
            }
            industryTitle
          }
        }
        featuredImage {
          node {
            sourceUrl
            mediaItemUrl
            altText
          }
        }
      }
    }
  }
  servicesSolutionsTitle
  servicesSolutionsHighlight
  servicesSolutionsItems {
    itemType
    text
  }
  servicesFaqTitle
  servicesFaqItems {
    faqTitle
    faqContent
  }
`;

const GET_SERVICES_PAGE = `
  query GetServicesPage($id: ID!, $idType: PageIdType!) {
    page(id: $id, idType: $idType) {
      databaseId
      title
      slug
      servicesPage {
        ${SERVICES_PAGE_FIELDS}
      }
    }
  }
`;

async function fetchServicesPageById(
  id: string,
  idType: "URI" | "DATABASE_ID",
  locale: AppLocale = DEFAULT_LOCALE
): Promise<GraphQLServicesResponse> {
  const endpoint = getWordPressGraphqlEndpoint(locale);
  if (!endpoint) {
    return {
      data: { page: null },
      errors: [{ message: "WordPress GraphQL endpoint is not configured" }],
    };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers: getWordpressGraphqlHeaders(locale),
    body: JSON.stringify({
      query: GET_SERVICES_PAGE,
      variables: { id, idType },
    }),
  });

  if (!res.ok) {
    throw new Error(`Services GraphQL request failed with status ${res.status}`);
  }

  return (await res.json()) as GraphQLServicesResponse;
}

/** Try database ID (env or known Services page 4867), then URI. */
export async function fetchServicesPage(
  locale: AppLocale = DEFAULT_LOCALE
): Promise<GraphQLServicesResponse> {
  const sourceId = SERVICES_PAGE_DATABASE_ID || "4867";
  const pageId = await resolvePageIdForLocale(sourceId, locale);

  const byId = await fetchServicesPageById(pageId, "DATABASE_ID", locale);
  if (byId.data?.page?.servicesPage) return byId;

  const uri = SERVICES_PAGE_URI.startsWith("/")
    ? SERVICES_PAGE_URI
    : `/${SERVICES_PAGE_URI}`;

  const byUri = await fetchServicesPageById(uri, "URI", locale);
  if (byUri.data?.page?.servicesPage) return byUri;

  if (byId.data?.page) return byId;
  return byUri;
}

export function getServicesPageFields(
  response: GraphQLServicesResponse
): ServicesPageFields | null {
  return response.data?.page?.servicesPage ?? null;
}
