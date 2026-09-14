/**
 * WordPress WPGraphQL API for Terms & Conditions page.
 * ACF group GraphQL name: termsAndConditions
 * (wordpress/acf-json/group_terms_and_conditions.json)
 * CMS-only — no static fallback content.
 */

import {
  getWordPressGraphqlEndpoint,
  WORDPRESS_REVALIDATE_SECONDS,
} from "@/app/lib/wordpress-graphql";
import type {
  TermsAndConditionsContent,
  PolicySection,
  PolicySubsection,
} from "@/app/terms-and-conditions/terms-and-conditions-content";

export const TERMS_AND_CONDITIONS_PAGE_URI =
  process.env.NEXT_PUBLIC_TERMS_AND_CONDITIONS_PAGE_URI?.trim() ||
  "/terms-and-conditions/";

type AcfImageNode = {
  node?: {
    sourceUrl?: string | null;
    mediaItemUrl?: string | null;
    altText?: string | null;
  } | null;
} | null;

type TextRow = { text?: string | null } | null;

type SubsectionNode = {
  title?: string | null;
  intro?: string | null;
  bullets?: TextRow[] | null;
} | null;

type SectionNode = {
  title?: string | null;
  body?: string | null;
  intro?: string | null;
  paragraphs?: TextRow[] | null;
  bullets?: TextRow[] | null;
  outro?: string | null;
  subsections?: SubsectionNode[] | null;
} | null;

export type TermsAndConditionsFields = {
  bannerTitle?: string | null;
  glowImage?: AcfImageNode;
  lastUpdated?: string | null;
  introText?: string | null;
  sections?: SectionNode[] | null;
};

type GraphQLTermsResponse = {
  data?: {
    page?: {
      title?: string | null;
      slug?: string | null;
      termsAndConditions?: TermsAndConditionsFields | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const IMAGE_FIELDS = `
  node {
    sourceUrl
    mediaItemUrl
    altText
  }
`;

const TERMS_FIELDS = `
  bannerTitle
  glowImage { ${IMAGE_FIELDS} }
  lastUpdated
  introText
  sections {
    title
    body
    intro
    paragraphs {
      text
    }
    bullets {
      text
    }
    outro
    subsections {
      title
      intro
      bullets {
        text
      }
    }
  }
`;

const GET_TERMS_PAGE = `
  query GetTermsAndConditionsPage($id: ID!, $idType: PageIdType!) {
    page(id: $id, idType: $idType) {
      title
      slug
      termsAndConditions {
        ${TERMS_FIELDS}
      }
    }
  }
`;

function trimText(value?: string | null): string {
  return typeof value === "string" ? value.trim() : "";
}

function mediaUrl(image?: AcfImageNode): string {
  return trimText(image?.node?.sourceUrl) || trimText(image?.node?.mediaItemUrl);
}

function mediaAlt(image?: AcfImageNode): string {
  return trimText(image?.node?.altText);
}

function mapBulletRows(rows?: TextRow[] | null): string[] {
  if (!Array.isArray(rows)) return [];
  return rows.map((row) => trimText(row?.text)).filter(Boolean);
}

function mapSubsection(node: SubsectionNode): PolicySubsection | null {
  const title = trimText(node?.title);
  if (!title) return null;
  const intro = trimText(node?.intro);
  const bullets = mapBulletRows(node?.bullets);
  return {
    title,
    ...(intro ? { intro } : {}),
    ...(bullets.length ? { bullets } : {}),
  };
}

function mapSection(node: SectionNode): PolicySection | null {
  const title = trimText(node?.title);
  if (!title) return null;

  const body = trimText(node?.body);
  const intro = trimText(node?.intro);
  const outro = trimText(node?.outro);
  const paragraphs = mapBulletRows(node?.paragraphs);
  const bullets = mapBulletRows(node?.bullets);
  const children = (node?.subsections ?? [])
    .map(mapSubsection)
    .filter((item): item is PolicySubsection => !!item);

  return {
    title,
    ...(body ? { body } : {}),
    ...(intro ? { intro } : {}),
    ...(paragraphs.length ? { paragraphs } : {}),
    ...(bullets.length ? { bullets } : {}),
    ...(outro ? { outro } : {}),
    ...(children.length ? { children } : {}),
  };
}

export function normalizeTermsAndConditionsFields(
  fields?: TermsAndConditionsFields | null
): TermsAndConditionsContent {
  return {
    bannerTitle: trimText(fields?.bannerTitle),
    glowImage: mediaUrl(fields?.glowImage),
    glowImageAlt: mediaAlt(fields?.glowImage),
    lastUpdated: trimText(fields?.lastUpdated),
    introText: trimText(fields?.introText),
    sections: (fields?.sections ?? [])
      .map(mapSection)
      .filter((item): item is PolicySection => !!item),
  };
}

async function fetchTermsPageById(
  id: string,
  idType: "URI" | "SLUG" | "DATABASE_ID"
): Promise<GraphQLTermsResponse> {
  const endpoint = getWordPressGraphqlEndpoint();
  if (!endpoint) {
    return {
      data: { page: null },
      errors: [{ message: "WordPress GraphQL endpoint is not configured" }],
    };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: GET_TERMS_PAGE,
      variables: { id, idType },
    }),
  });

  if (!res.ok) {
    return {
      data: { page: null },
      errors: [{ message: `GraphQL request failed with status ${res.status}` }],
    };
  }

  return (await res.json()) as GraphQLTermsResponse;
}

const EMPTY_CONTENT: TermsAndConditionsContent = {
  bannerTitle: "",
  glowImage: "",
  glowImageAlt: "",
  lastUpdated: "",
  introText: "",
  sections: [],
};

/** Fetch Terms & Conditions ACF content only (no static fallback). */
export async function getTermsAndConditionsContent(): Promise<TermsAndConditionsContent> {
  try {
    const uri = TERMS_AND_CONDITIONS_PAGE_URI.startsWith("/")
      ? TERMS_AND_CONDITIONS_PAGE_URI
      : `/${TERMS_AND_CONDITIONS_PAGE_URI}`;

    let response = await fetchTermsPageById(uri, "URI");
    let page = response.data?.page ?? null;

    if (!page) {
      const slug = uri.replace(/^\/+|\/+$/g, "") || "terms-and-conditions";
      response = await fetchTermsPageById(slug, "SLUG");
      page = response.data?.page ?? null;
    }

    if (response.errors?.length) {
      console.warn(
        "[terms-and-conditions] GraphQL errors:",
        response.errors.map((e) => e.message).join("; ")
      );
    }

    if (!page?.termsAndConditions) return EMPTY_CONTENT;
    return normalizeTermsAndConditionsFields(page.termsAndConditions);
  } catch (error) {
    console.warn("[terms-and-conditions] Failed to fetch CMS content:", error);
    return EMPTY_CONTENT;
  }
}
