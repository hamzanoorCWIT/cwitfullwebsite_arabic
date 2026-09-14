/**
 * WordPress WPGraphQL API for Leading Services Template (landing pages).
 * ACF group GraphQL name: leadingServicesTemplate
 * CPT: leading_service → leadingService / leadingServices
 */

import {
  getWordPressGraphqlEndpoint,
  WORDPRESS_REVALIDATE_SECONDS,
} from "@/app/lib/wordpress-graphql";

export type AcfImageNode = {
  node?: {
    sourceUrl?: string | null;
    mediaItemUrl?: string | null;
    altText?: string | null;
  } | null;
} | null;

/** Image node carrying intrinsic pixels, used to size banner layers. */
export type AcfBannerImageNode = {
  node?: {
    sourceUrl?: string | null;
    mediaItemUrl?: string | null;
    altText?: string | null;
    mediaDetails?: {
      width?: number | null;
      height?: number | null;
    } | null;
  } | null;
} | null;

const IMAGE_FIELDS = `
  node {
    sourceUrl
    mediaItemUrl
    altText
  }
`;

/** Banner layers also need intrinsic pixels, as a fallback for unset design sizes. */
const BANNER_IMAGE_FIELDS = `
  node {
    sourceUrl
    mediaItemUrl
    altText
    mediaDetails {
      width
      height
    }
  }
`;

/**
 * Figma banner content fields, each selectable on its own. Styling is not
 * queried: it lives in the coded design per route.
 *
 * A WordPress running an older import will not know the newest of these. Keeping
 * them separable lets the retry drop just the field WP does not recognise
 * instead of the whole banner, so adding a field here never blanks the banner
 * content that already works.
 */
const BANNER_FIELD_SELECTIONS: ReadonlyArray<readonly [string, string]> = [
  ["bannerIntro", "bannerIntro"],
  ["bannerDescription", "bannerDescription"],
  ["bannerLayout", "bannerLayout"],
  ["bannerTitleLines", "bannerTitleLines {\n    line\n  }"],
  ["bannerBgImage", `bannerBgImage { ${BANNER_IMAGE_FIELDS} }`],
  [
    "bannerBgVideo",
    "bannerBgVideo {\n    node {\n      sourceUrl\n      mediaItemUrl\n    }\n  }",
  ],
  ["bannerBgVideoUrl", "bannerBgVideoUrl"],
  ["bannerFgImage", `bannerFgImage { ${BANNER_IMAGE_FIELDS} }`],
];

function buildBannerFields(skip: ReadonlySet<string>): string {
  return BANNER_FIELD_SELECTIONS.filter(([name]) => !skip.has(name))
    .map(([, selection]) => selection)
    .join("\n  ");
}

/** Flat ACF fields (group nesting was not persisting on save in WP admin). */
const WHY_FULL_IMAGE_FIELDS = `
  whyFullTitle
  whyFullDescription
  whyFullCtaLabel
  whyFullPhoto { ${IMAGE_FIELDS} }
`;

function buildLeadingServicesTemplateFields(options?: {
  includeWhyFullImage?: boolean;
  includeForegroundPosition?: boolean;
  includeBanner?: boolean;
  /** Banner fields this WordPress does not expose. */
  skipBannerFields?: ReadonlySet<string>;
}): string {
  const includeWhyFullImage = options?.includeWhyFullImage !== false;
  const includeForegroundPosition = options?.includeForegroundPosition !== false;
  const includeBanner = options?.includeBanner !== false;
  const skipBannerFields = options?.skipBannerFields ?? new Set<string>();

  return `
  showIndustries
  showWhyCards
  showWhyFullImage
  showProcess
  showAugmentedSection
  showTechnologies
  realEstateSpacing
  showTestimonials
  showClientLogos
  showOurWork
  bannerTitle
  ${includeBanner ? buildBannerFields(skipBannerFields) : ""}
  contactFormTitle
  contactHeadingSub
  contactHeadingMain
  beforeImage { ${IMAGE_FIELDS} }
  logoImage { ${IMAGE_FIELDS} }
  intro {
    title
    description
    ctaLabel
  }
  stats {
    number
    label
    width
  }
  industries {
    title
    cards {
      title
      text
      layout
      variant
      image { ${IMAGE_FIELDS} }
      bg { ${IMAGE_FIELDS} }
      art { ${IMAGE_FIELDS} }
      foreground { ${IMAGE_FIELDS} }
    }
  }
  whyCards {
    title
    description
    ctaLabel
    cards {
      title
      text
      variant
      bg { ${IMAGE_FIELDS} }
      art { ${IMAGE_FIELDS} }
      foreground { ${IMAGE_FIELDS} }
      ${includeForegroundPosition ? "foregroundPosition" : ""}
      exact { ${IMAGE_FIELDS} }
    }
  }
  ${includeWhyFullImage ? WHY_FULL_IMAGE_FIELDS : ""}
  process {
    title
    cards {
      title
      text
    }
  }
  augmentedSection {
    title
    description
    ctaLabel
    image { ${IMAGE_FIELDS} }
    imageCrop
    posts {
      date
      title
      description
      ctaLabel
    }
  }
  technologies {
    title
    cards {
      title
      text
      variant
      baseImage { ${IMAGE_FIELDS} }
      image { ${IMAGE_FIELDS} }
      icon { ${IMAGE_FIELDS} }
    }
  }
  testimonialsSource
  testimonials {
    testimonialImage { ${IMAGE_FIELDS} }
    testimonialQuote
    testimonialAuthor
    testimonialRole
    testimonialCompany
    highlightCompany
  }
  clientLogosSource
  clientLogos {
    logoImage { ${IMAGE_FIELDS} }
    logoName
  }
  ourWork {
    title
    subtitle
    ctaLabel
    ctaHref
    featuredPortfolios {
      nodes {
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
      }
    }
  }
  faqs {
    title
    content
  }
`;
}

function buildLeadingServiceQuery(
  operationName: string,
  idType: "DATABASE_ID" | "SLUG" | "URI",
  fieldOptions?: Parameters<typeof buildLeadingServicesTemplateFields>[0],
): string {
  return `
  query ${operationName}($id: ID!) {
    leadingService(id: $id, idType: ${idType}) {
      databaseId
      title
      slug
      uri
      leadingServicesTemplate {
        ${buildLeadingServicesTemplateFields(fieldOptions)}
      }
    }
  }
`;
}

function graphqlErrorsMention(
  errors: Array<{ message: string }> | null | undefined,
  field: string,
): boolean {
  if (!errors?.length) return false;
  const re = new RegExp(`Cannot query field ["']${field}["']|\\b${field}\\b`, "i");
  return errors.some((e) => re.test(e.message));
}

export type LeadingServicesTemplateFields = {
  showIndustries?: boolean | null;
  showWhyCards?: boolean | null;
  showWhyFullImage?: boolean | null;
  showProcess?: boolean | null;
  showAugmentedSection?: boolean | null;
  showTechnologies?: boolean | null;
  realEstateSpacing?: boolean | null;
  showTestimonials?: boolean | null;
  showClientLogos?: boolean | null;
  showOurWork?: boolean | null;
  bannerTitle?: string | null;
  bannerIntro?: string | null;
  bannerDescription?: string | null;
  bannerLayout?: string | string[] | null;
  bannerTitleLines?: Array<{ line?: string | null } | null> | null;
  bannerBgImage?: AcfBannerImageNode;
  bannerBgVideo?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
    } | null;
  } | null;
  bannerBgVideoUrl?: string | null;
  bannerFgImage?: AcfBannerImageNode;
  contactFormTitle?: string | null;
  contactHeadingSub?: string | null;
  contactHeadingMain?: string | null;
  beforeImage?: AcfImageNode;
  logoImage?: AcfImageNode;
  intro?: {
    title?: string | null;
    description?: string | null;
    ctaLabel?: string | null;
  } | null;
  stats?: Array<{
    number?: string | null;
    label?: string | null;
    width?: string | null;
  } | null> | null;
  industries?: {
    title?: string | null;
    cards?: Array<{
      title?: string | null;
      text?: string | null;
      layout?: string | string[] | null;
      variant?: string | string[] | null;
      image?: AcfImageNode;
      bg?: AcfImageNode;
      art?: AcfImageNode;
      foreground?: AcfImageNode;
      size?: string | null;
      shadow?: string | null;
    } | null> | null;
  } | null;
  whyCards?: {
    title?: string | null;
    description?: string | null;
    ctaLabel?: string | null;
    cards?: Array<{
      title?: string | null;
      text?: string | null;
      variant?: string | string[] | null;
      bg?: AcfImageNode;
      art?: AcfImageNode;
      foreground?: AcfImageNode;
      foregroundPosition?: string | string[] | null;
      exact?: AcfImageNode;
    } | null> | null;
  } | null;
  /** Flat Why Full Image fields (preferred — persists in WP admin). */
  whyFullTitle?: string | null;
  whyFullDescription?: string | null;
  whyFullCtaLabel?: string | null;
  whyFullPhoto?: AcfImageNode;
  /** @deprecated Old nested group shape — kept for transitional reads. */
  whyFullImage?: {
    title?: string | null;
    description?: string | null;
    ctaLabel?: string | null;
    image?: AcfImageNode;
  } | null;
  process?: {
    title?: string | null;
    cards?: Array<{
      title?: string | null;
      text?: string | null;
    } | null> | null;
  } | null;
  augmentedSection?: {
    title?: string | null;
    description?: string | null;
    ctaLabel?: string | null;
    image?: AcfImageNode;
    imageCrop?: string | string[] | null;
    posts?: Array<{
      date?: string | null;
      title?: string | null;
      description?: string | null;
      ctaLabel?: string | null;
    } | null> | null;
  } | null;
  technologies?: {
    title?: string | null;
    cards?: Array<{
      title?: string | null;
      text?: string | null;
      variant?: string | string[] | null;
      baseImage?: AcfImageNode;
      image?: AcfImageNode;
      icon?: AcfImageNode;
    } | null> | null;
  } | null;
  testimonialsSource?: string | null;
  testimonials?: Array<{
    testimonialImage?: AcfImageNode;
    testimonialQuote?: string | null;
    testimonialAuthor?: string | null;
    testimonialRole?: string | null;
    testimonialCompany?: string | null;
    highlightCompany?: boolean | null;
  } | null> | null;
  clientLogosSource?: string | null;
  clientLogos?: Array<{
    logoImage?: AcfImageNode;
    logoName?: string | null;
  } | null> | null;
  ourWork?: {
    title?: string | null;
    subtitle?: string | null;
    ctaLabel?: string | null;
    ctaHref?: string | null;
    featuredPortfolios?: {
      nodes?: Array<{
        databaseId?: number | null;
        title?: string | null;
        slug?: string | null;
        portfolioDetails?: {
          listingCard?: {
            portfolioSubtitle?: string | null;
            portfolioTitle?: string | null;
            portfolioDescription?: string | null;
            portfolioImage?: AcfImageNode;
          } | null;
        } | null;
      } | null> | null;
    } | null;
  } | null;
  faqs?: Array<{
    title?: string | null;
    content?: string | null;
  } | null> | null;
};

export type LeadingServiceNode = {
  databaseId?: number | null;
  title?: string | null;
  slug?: string | null;
  uri?: string | null;
  leadingServicesTemplate?: LeadingServicesTemplateFields | null;
};

export type GraphQLLeadingServiceResponse = {
  data?: {
    leadingService?: LeadingServiceNode | null;
    leadingServices?: { nodes?: LeadingServiceNode[] } | null;
  } | null;
  errors?: Array<{ message: string }> | null;
};

const LIST_LEADING_SERVICES = `
  query ListLeadingServices($first: Int = 50) {
    leadingServices(first: $first) {
      nodes {
        databaseId
        title
        slug
        uri
      }
    }
  }
`;

async function runQuery(
  query: string,
  variables?: Record<string, unknown>,
): Promise<GraphQLLeadingServiceResponse> {
  const endpoint = getWordPressGraphqlEndpoint();
  if (!endpoint) {
    return {
      data: null,
      errors: [{ message: "WordPress GraphQL endpoint is not configured" }],
    };
  }

  const res = await fetch(endpoint, {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`Leading Service GraphQL failed with status ${res.status}`);
  }

  const json = (await res.json()) as GraphQLLeadingServiceResponse;
  if (json.errors?.length) {
    console.error(
      "[leading-service] GraphQL errors:",
      json.errors.map((e) => e.message).join("; "),
    );
  }
  return json;
}

/**
 * Any unknown `banner*` field means this WP has an older version of the ACF
 * group. Matched by shape rather than a fixed list, so adding a banner field
 * here can never take the whole query — and with it the page's CMS content —
 * down while WordPress is still catching up.
 */
const UNKNOWN_BANNER_FIELD = /Cannot query field ["'](banner[A-Za-z]*)["']/i;

function errorsMentionBanner(
  errors: GraphQLLeadingServiceResponse["errors"],
): boolean {
  return (errors ?? []).some((e) => UNKNOWN_BANNER_FIELD.test(e.message));
}

/** The exact banner fields this WordPress rejected, so only those are dropped. */
function unknownBannerFields(
  errors: GraphQLLeadingServiceResponse["errors"],
): string[] {
  const names = new Set<string>();
  for (const error of errors ?? []) {
    const match = error.message.match(UNKNOWN_BANNER_FIELD);
    const name = match?.[1];
    if (name && BANNER_FIELD_SELECTIONS.some(([field]) => field === name)) {
      names.add(name);
    }
  }
  return [...names];
}

/**
 * Fetch a leading service, retrying without schema fields WP may not expose yet
 * (whyFullImage / foregroundPosition / the Figma banner group) so the rest of
 * the page still loads.
 */
async function runLeadingServiceQuery(
  operationName: string,
  idType: "DATABASE_ID" | "SLUG" | "URI",
  variables: Record<string, unknown>,
): Promise<GraphQLLeadingServiceResponse> {
  let includeWhyFullImage = true;
  let includeForegroundPosition = true;
  let includeBanner = true;
  const skipBannerFields = new Set<string>();

  for (let attempt = 0; attempt < 5; attempt++) {
    const query = buildLeadingServiceQuery(operationName, idType, {
      includeWhyFullImage,
      includeForegroundPosition,
      includeBanner,
      skipBannerFields,
    });
    const json = await runQuery(query, variables);
    const hasNode = Boolean(json.data?.leadingService?.leadingServicesTemplate);
    if (hasNode && !json.errors?.length) return json;
    if (
      hasNode &&
      !graphqlErrorsMention(json.errors, "whyFullTitle") &&
      !graphqlErrorsMention(json.errors, "whyFullPhoto") &&
      !graphqlErrorsMention(json.errors, "foregroundPosition") &&
      !errorsMentionBanner(json.errors)
    ) {
      return json;
    }

    let retried = false;
    if (includeBanner && errorsMentionBanner(json.errors)) {
      // Drop only the fields WP named, so an older import keeps the banner
      // content it does know about. Falling back to no banner at all is the
      // last resort, once naming the fields stops making progress.
      const unknown = unknownBannerFields(json.errors).filter(
        (name) => !skipBannerFields.has(name),
      );
      if (unknown.length) {
        console.warn(
          `[leading-service] WPGraphQL schema missing banner field(s) ${unknown.join(", ")} — retrying without them. Import wordpress/acf-json and refresh the WPGraphQL schema.`,
        );
        unknown.forEach((name) => skipBannerFields.add(name));
      } else {
        console.warn(
          "[leading-service] WPGraphQL schema missing the Figma banner fields — retrying without them. Import wordpress/acf-json and refresh the WPGraphQL schema.",
        );
        includeBanner = false;
      }
      retried = true;
    }
    if (
      includeWhyFullImage &&
      (graphqlErrorsMention(json.errors, "whyFullTitle") ||
        graphqlErrorsMention(json.errors, "whyFullPhoto") ||
        graphqlErrorsMention(json.errors, "whyFullImage"))
    ) {
      console.warn(
        "[leading-service] WPGraphQL schema missing Why Full Image fields — retrying without them. Sync ACF + refresh WPGraphQL schema.",
      );
      includeWhyFullImage = false;
      retried = true;
    }
    if (
      includeForegroundPosition &&
      graphqlErrorsMention(json.errors, "foregroundPosition")
    ) {
      console.warn(
        "[leading-service] WPGraphQL schema missing foregroundPosition — retrying without it.",
      );
      includeForegroundPosition = false;
      retried = true;
    }

    // Unknown schema error with no data — drop whyFullImage as safest fallback.
    if (!retried && !hasNode && json.errors?.length && includeWhyFullImage) {
      console.warn(
        "[leading-service] GraphQL returned no data — retrying without whyFullImage.",
      );
      includeWhyFullImage = false;
      retried = true;
    }

    if (!retried) return json;
  }

  return runQuery(
    buildLeadingServiceQuery(operationName, idType, {
      includeWhyFullImage: false,
      includeForegroundPosition: false,
      includeBanner: false,
    }),
    variables,
  );
}

export async function fetchLeadingServiceByDatabaseId(
  id: number | string,
): Promise<GraphQLLeadingServiceResponse> {
  return runLeadingServiceQuery("GetLeadingServiceById", "DATABASE_ID", {
    id: String(id),
  });
}

export async function fetchLeadingServiceBySlug(
  slug: string,
): Promise<GraphQLLeadingServiceResponse> {
  const normalized = slug.replace(/^\/+|\/+$/g, "").trim();
  return runLeadingServiceQuery("GetLeadingServiceBySlug", "SLUG", {
    id: normalized,
  });
}

export async function fetchLeadingServiceByUri(
  uri: string,
): Promise<GraphQLLeadingServiceResponse> {
  const normalized = uri.startsWith("/") ? uri : `/${uri}`;
  return runLeadingServiceQuery("GetLeadingServiceByUri", "URI", {
    id: normalized.endsWith("/") ? normalized : `${normalized}/`,
  });
}

/**
 * Resolve a leading service for a Next.js landing route.
 * Order: env database id → slug → /leading-services/{slug}/ → title match.
 */
export async function fetchLeadingServiceForRoute(options: {
  routeSlug: string;
  databaseId?: number | string | null;
  titleHints?: string[];
}): Promise<LeadingServiceNode | null> {
  const { routeSlug, databaseId, titleHints = [] } = options;

  const envId =
    databaseId ||
    process.env.LEADING_SERVICE_PAGE_ID?.trim() ||
    process.env[`LEADING_SERVICE_${routeSlug.toUpperCase().replace(/-/g, "_")}_ID`]?.trim();

  if (envId) {
    try {
      const byId = await fetchLeadingServiceByDatabaseId(envId);
      if (byId.data?.leadingService?.leadingServicesTemplate) {
        return byId.data.leadingService;
      }
    } catch (error) {
      console.error(`[leading-service:${routeSlug}] fetch by id failed:`, error);
    }
  }

  try {
    const bySlug = await fetchLeadingServiceBySlug(routeSlug);
    if (bySlug.data?.leadingService?.leadingServicesTemplate) {
      return bySlug.data.leadingService;
    }
  } catch (error) {
    console.error(`[leading-service:${routeSlug}] fetch by slug failed:`, error);
  }

  try {
    const byUri = await fetchLeadingServiceByUri(`/leading-services/${routeSlug}/`);
    if (byUri.data?.leadingService?.leadingServicesTemplate) {
      return byUri.data.leadingService;
    }
  } catch (error) {
    console.error(`[leading-service:${routeSlug}] fetch by uri failed:`, error);
  }

  try {
    const list = await runQuery(LIST_LEADING_SERVICES, { first: 50 });
    const nodes = list.data?.leadingServices?.nodes ?? [];
    const hints = [routeSlug, ...titleHints]
      .map((h) => h.toLowerCase().replace(/[-_]+/g, " ").trim())
      .filter(Boolean);

    const match = nodes.find((node) => {
      const title = (node.title || "").toLowerCase();
      const slug = (node.slug || "").toLowerCase();
      return hints.some(
        (hint) => title.includes(hint) || slug.includes(hint.replace(/\s+/g, "-")),
      );
    });

    if (match?.databaseId) {
      const full = await fetchLeadingServiceByDatabaseId(match.databaseId);
      if (full.data?.leadingService?.leadingServicesTemplate) {
        return full.data.leadingService;
      }
    }
  } catch (error) {
    console.error(`[leading-service:${routeSlug}] list/match failed:`, error);
  }

  return null;
}

export function getLeadingServicesTemplate(
  node: LeadingServiceNode | null | undefined,
): LeadingServicesTemplateFields | null {
  return node?.leadingServicesTemplate ?? null;
}
