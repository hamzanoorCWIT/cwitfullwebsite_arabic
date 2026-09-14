/**
 * WordPress WPGraphQL API for Privacy Policy page.
 * ACF group GraphQL name: privacyPolicy
 * (wordpress/acf-json/group_privacy_policy.json)
 * CMS-only — no static fallback content.
 */

import {
  getWordPressGraphqlEndpoint,
  WORDPRESS_REVALIDATE_SECONDS,
} from "@/app/lib/wordpress-graphql";
import type {
  PrivacyPolicyContent,
  PolicySection,
  PolicySubsection,
} from "@/app/privacy-policy/privacy-policy-content";

export const PRIVACY_POLICY_PAGE_URI =
  process.env.NEXT_PUBLIC_PRIVACY_POLICY_PAGE_URI?.trim() || "/privacy-policy/";

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

export type PrivacyPolicyFields = {
  bannerTitle?: string | null;
  glowImage?: AcfImageNode;
  maskImage?: AcfImageNode;
  lastUpdated?: string | null;
  introText?: string | null;
  sections?: SectionNode[] | null;
};

type GraphQLPrivacyResponse = {
  data?: {
    page?: {
      title?: string | null;
      slug?: string | null;
      privacyPolicy?: PrivacyPolicyFields | null;
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

const PRIVACY_POLICY_FIELDS = `
  bannerTitle
  glowImage { ${IMAGE_FIELDS} }
  maskImage { ${IMAGE_FIELDS} }
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

const GET_PRIVACY_POLICY_PAGE = `
  query GetPrivacyPolicyPage($id: ID!, $idType: PageIdType!) {
    page(id: $id, idType: $idType) {
      title
      slug
      privacyPolicy {
        ${PRIVACY_POLICY_FIELDS}
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

export function normalizePrivacyPolicyFields(
  fields?: PrivacyPolicyFields | null
): PrivacyPolicyContent {
  return {
    bannerTitle: trimText(fields?.bannerTitle),
    glowImage: mediaUrl(fields?.glowImage),
    glowImageAlt: mediaAlt(fields?.glowImage),
    maskImage: mediaUrl(fields?.maskImage),
    maskImageAlt: mediaAlt(fields?.maskImage),
    lastUpdated: trimText(fields?.lastUpdated),
    introText: trimText(fields?.introText),
    sections: (fields?.sections ?? [])
      .map(mapSection)
      .filter((item): item is PolicySection => !!item),
  };
}

async function fetchPrivacyPolicyPageById(
  id: string,
  idType: "URI" | "SLUG" | "DATABASE_ID"
): Promise<GraphQLPrivacyResponse> {
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
      query: GET_PRIVACY_POLICY_PAGE,
      variables: { id, idType },
    }),
  });

  if (!res.ok) {
    return {
      data: { page: null },
      errors: [{ message: `GraphQL request failed with status ${res.status}` }],
    };
  }

  return (await res.json()) as GraphQLPrivacyResponse;
}

const EMPTY_CONTENT: PrivacyPolicyContent = {
  bannerTitle: "",
  glowImage: "",
  glowImageAlt: "",
  maskImage: "",
  maskImageAlt: "",
  lastUpdated: "",
  introText: "",
  sections: [],
};

/** Fetch Privacy Policy ACF content only (no static fallback). */
export async function getPrivacyPolicyContent(): Promise<PrivacyPolicyContent> {
  try {
    const uri = PRIVACY_POLICY_PAGE_URI.startsWith("/")
      ? PRIVACY_POLICY_PAGE_URI
      : `/${PRIVACY_POLICY_PAGE_URI}`;

    let response = await fetchPrivacyPolicyPageById(uri, "URI");
    let page = response.data?.page ?? null;

    if (!page) {
      const slug = uri.replace(/^\/+|\/+$/g, "") || "privacy-policy";
      response = await fetchPrivacyPolicyPageById(slug, "SLUG");
      page = response.data?.page ?? null;
    }

    if (response.errors?.length) {
      console.warn(
        "[privacy-policy] GraphQL errors:",
        response.errors.map((e) => e.message).join("; ")
      );
    }

    if (!page?.privacyPolicy) return EMPTY_CONTENT;
    return normalizePrivacyPolicyFields(page.privacyPolicy);
  } catch (error) {
    console.warn("[privacy-policy] Failed to fetch CMS content:", error);
    return EMPTY_CONTENT;
  }
}
