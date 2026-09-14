/**
 * WordPress WPGraphQL API for About Us page.
 * ACF group GraphQL name: aboutUsPage
 * (see wordpress/acf-json/acf-export-2026-07-17-about-us.json)
 */

import {
  getWordPressGraphqlEndpoint,
  getWordpressGraphqlHeaders,
  WORDPRESS_REVALIDATE_SECONDS,
} from "@/app/lib/wordpress-graphql";
import { DEFAULT_LOCALE, type AppLocale } from "@/app/lib/locale";

export const ABOUT_US_PAGE_URI =
  process.env.NEXT_PUBLIC_ABOUT_US_PAGE_URI?.trim() || "/about-us/";

export type AcfImageNode = {
  node?: {
    sourceUrl?: string | null;
    mediaItemUrl?: string | null;
    altText?: string | null;
  } | null;
} | null;

export type AboutShowcaseCardNode = {
  cardType?: string | string[] | null;
  title?: string | null;
  subtitle?: string | null;
  description?: string | null;
  image?: AcfImageNode;
  backgroundClass?: string | null;
  textColorClass?: string | null;
} | null;

export type AboutPrincipleNode = {
  principleTitle?: string | null;
  principleDescription?: string | null;
} | null;

export type AboutTestimonialNode = {
  testimonialImage?: AcfImageNode;
  testimonialQuote?: string | null;
  testimonialAuthor?: string | null;
  testimonialRole?: string | null;
  testimonialCompany?: string | null;
  highlightCompany?: boolean | null;
} | null;

export type AboutClientLogoNode = {
  logoImage?: AcfImageNode;
  logoName?: string | null;
} | null;

export type AboutContentSource = "from_home" | "custom";

export type AboutUsPageFields = {
  aboutHeroTitle?: string | null;
  aboutHeroSubtitle?: string | null;
  aboutHeroBackgroundImage?: AcfImageNode;
  aboutStoryTitle?: string | null;
  aboutStoryLead?: string | null;
  aboutStoryBody?: string | null;
  aboutVisionTitle?: string | null;
  aboutVisionText?: string | null;
  aboutMissionTitle?: string | null;
  aboutMissionText?: string | null;
  aboutShowcaseLogoImage?: AcfImageNode;
  aboutShowcaseCards?: AboutShowcaseCardNode[] | null;
  aboutPrinciplesTitle?: string | null;
  aboutPrinciples?: AboutPrincipleNode[] | null;
  aboutTestimonialsSource?: AboutContentSource | string | null;
  aboutTestimonials?: AboutTestimonialNode[] | null;
  aboutClientLogosSource?: AboutContentSource | string | null;
  aboutClientLogos?: AboutClientLogoNode[] | null;
};

export type GraphQLAboutUsResponse = {
  data?: {
    page?: {
      title?: string | null;
      slug?: string | null;
      aboutUsPage?: AboutUsPageFields | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const ABOUT_US_PAGE_FIELDS = `
  aboutHeroTitle
  aboutHeroSubtitle
  aboutHeroBackgroundImage {
    node {
      sourceUrl
      mediaItemUrl
      altText
    }
  }
  aboutStoryTitle
  aboutStoryLead
  aboutStoryBody
  aboutVisionTitle
  aboutVisionText
  aboutMissionTitle
  aboutMissionText
  aboutShowcaseLogoImage {
    node {
      sourceUrl
      mediaItemUrl
      altText
    }
  }
  aboutShowcaseCards {
    cardType
    title
    subtitle
    description
    image {
      node {
        sourceUrl
        mediaItemUrl
        altText
      }
    }
    backgroundClass
    textColorClass
  }
  aboutPrinciplesTitle
  aboutPrinciples {
    principleTitle
    principleDescription
  }
  aboutTestimonialsSource
  aboutTestimonials {
    testimonialImage {
      node {
        sourceUrl
        mediaItemUrl
        altText
      }
    }
    testimonialQuote
    testimonialAuthor
    testimonialRole
    testimonialCompany
    highlightCompany
  }
  aboutClientLogosSource
  aboutClientLogos {
    logoImage {
      node {
        sourceUrl
        mediaItemUrl
        altText
      }
    }
    logoName
  }
`;

const ABOUT_US_PAGE_FIELDS_LEGACY = ABOUT_US_PAGE_FIELDS.replace(
  /^\s*aboutTestimonialsSource\n/m,
  ""
).replace(/^\s*aboutClientLogosSource\n/m, "");

const GET_ABOUT_US_PAGE = `
  query GetAboutUsPage($id: ID!, $idType: PageIdType!) {
    page(id: $id, idType: $idType) {
      title
      slug
      aboutUsPage {
        ${ABOUT_US_PAGE_FIELDS}
      }
    }
  }
`;

const GET_ABOUT_US_PAGE_LEGACY = `
  query GetAboutUsPageLegacy($id: ID!, $idType: PageIdType!) {
    page(id: $id, idType: $idType) {
      title
      slug
      aboutUsPage {
        ${ABOUT_US_PAGE_FIELDS_LEGACY}
      }
    }
  }
`;

function isMissingSourceFieldError(errors?: Array<{ message: string }>): boolean {
  return (errors ?? []).some((e) =>
    /aboutTestimonialsSource|aboutClientLogosSource/i.test(String(e?.message || ""))
  );
}

async function fetchAboutUsPageById(
  id: string,
  idType: "URI" | "SLUG" | "DATABASE_ID",
  locale: AppLocale = DEFAULT_LOCALE
): Promise<GraphQLAboutUsResponse> {
  const endpoint = getWordPressGraphqlEndpoint(locale);
  if (!endpoint) {
    return { data: { page: null }, errors: [{ message: "WordPress GraphQL endpoint is not configured" }] };
  }

  const headers = getWordpressGraphqlHeaders(locale);

  const res = await fetch(endpoint, {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers,
    body: JSON.stringify({
      query: GET_ABOUT_US_PAGE,
      variables: { id, idType },
    }),
  });

  if (!res.ok) {
    throw new Error(`About Us GraphQL request failed with status ${res.status}`);
  }

  const json = (await res.json()) as GraphQLAboutUsResponse;
  if (json.data?.page?.aboutUsPage && !isMissingSourceFieldError(json.errors)) {
    return json;
  }

  if (!isMissingSourceFieldError(json.errors)) {
    return json;
  }

  const legacyRes = await fetch(endpoint, {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers,
    body: JSON.stringify({
      query: GET_ABOUT_US_PAGE_LEGACY,
      variables: { id, idType },
    }),
  });

  if (!legacyRes.ok) {
    return json;
  }

  return (await legacyRes.json()) as GraphQLAboutUsResponse;
}

/** Try URI, then slug `about-us`. */
export async function fetchAboutUsPage(
  locale: AppLocale = DEFAULT_LOCALE
): Promise<GraphQLAboutUsResponse> {
  const uri = ABOUT_US_PAGE_URI.startsWith("/")
    ? ABOUT_US_PAGE_URI
    : `/${ABOUT_US_PAGE_URI}`;

  const byUri = await fetchAboutUsPageById(uri, "URI", locale);
  if (byUri.data?.page?.aboutUsPage) return byUri;

  const bySlug = await fetchAboutUsPageById("about-us", "SLUG", locale);
  if (bySlug.data?.page?.aboutUsPage) return bySlug;

  return byUri.errors?.length ? byUri : bySlug;
}

export function getAboutUsPageFields(
  response: GraphQLAboutUsResponse
): AboutUsPageFields | null {
  return response.data?.page?.aboutUsPage ?? null;
}
