import { isStagingRoute } from "@/app/lib/staging-routes";
import { getWordPressGraphqlEndpoint } from "@/app/lib/wordpress-graphql";

/** WP page slugs that already have a dedicated Next route (or redirect). */
const EXCLUDED_WP_PAGE_SLUGS = new Set([
  "home",
  "homepage",
  "front-page",
  "about-us",
  "blogs",
  "blog",
  "our-work",
  "portfolio",
  "react",
  "real-estate",
  "retail-ecommerce",
  "work",
  "work-details",
  "services",
  "contact-us",
  "digital-experience-studio",
  "digital-solutions",
  "application-development-studio",
  "growth-branding-studio",
  "ai-and-things",
  "banking",
  "ecommerce-app",
  "education",
  "flutter-app",
  "healthcare",
  "logo-app",
  "marketing-app",
  "mobile-app",
  "salesforce",
  "security-app",
  "seo-app",
  "ui-ux-app",
  "web-app",
  "wordpress",
  "new-home",
]);

export type SitemapPathEntry = {
  path: string;
  lastModified?: Date;
};

const PAGE_SIZE = 100;
const MAX_PAGES = 20;
const SITEMAP_REVALIDATE_SECONDS = 3600;

type ConnectionNode = {
  slug?: string | null;
  date?: string | null;
  modified?: string | null;
};

type Connection = {
  nodes?: Array<ConnectionNode | null> | null;
  pageInfo?: {
    hasNextPage?: boolean | null;
    endCursor?: string | null;
  } | null;
};

type GraphQLConnectionResponse<K extends string> = {
  data?: Record<K, Connection | null | undefined>;
  errors?: Array<{ message: string }>;
};

function parseDate(value?: string | null): Date | undefined {
  if (!value?.trim()) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed;
}

function toEntry(path: string, node: ConnectionNode): SitemapPathEntry {
  return {
    path,
    lastModified: parseDate(node.modified) ?? parseDate(node.date),
  };
}

async function fetchConnectionPage<K extends string>(
  query: string,
  key: K,
  after: string | null
): Promise<Connection> {
  const endpoint = getWordPressGraphqlEndpoint();
  if (!endpoint) return { nodes: [], pageInfo: { hasNextPage: false } };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    next: { revalidate: SITEMAP_REVALIDATE_SECONDS },
    body: JSON.stringify({
      query,
      variables: { first: PAGE_SIZE, after },
    }),
  });

  if (!res.ok) {
    return { nodes: [], pageInfo: { hasNextPage: false } };
  }

  const json = (await res.json()) as GraphQLConnectionResponse<K>;
  if (json.errors?.length) {
    console.error(
      `[sitemap] GraphQL errors for ${key}:`,
      json.errors.map((error) => error.message).join("; ")
    );
  }

  return json.data?.[key] ?? { nodes: [], pageInfo: { hasNextPage: false } };
}

async function collectPaginatedPaths<K extends string>(
  query: string,
  key: K,
  toPath: (slug: string) => string | null
): Promise<SitemapPathEntry[]> {
  const entries: SitemapPathEntry[] = [];
  let after: string | null = null;

  for (let page = 0; page < MAX_PAGES; page += 1) {
    const connection: Connection = await fetchConnectionPage(query, key, after);
    for (const node of connection.nodes ?? []) {
      const slug = node?.slug?.replace(/^\/+|\/+$/g, "").trim();
      if (!slug || !node) continue;
      const path = toPath(slug);
      if (!path || isStagingRoute(path)) continue;
      entries.push(toEntry(path, node));
    }

    const endCursor = connection.pageInfo?.endCursor ?? null;
    if (!connection.pageInfo?.hasNextPage || !endCursor) {
      break;
    }
    after = endCursor;
  }

  return entries;
}

const GET_BLOG_SITEMAP_POSTS = `
  query GetBlogSitemapPosts($first: Int!, $after: String) {
    posts(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        slug
        date
        modified
      }
    }
  }
`;

const GET_PORTFOLIO_SITEMAP = `
  query GetPortfolioSitemap($first: Int!, $after: String) {
    portfolios(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        slug
        date
        modified
      }
    }
  }
`;

const GET_PAGE_SITEMAP = `
  query GetPageSitemap($first: Int!, $after: String) {
    pages(first: $first, after: $after, where: { status: PUBLISH }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        slug
        date
        modified
      }
    }
  }
`;

/** Published blog posts → `/blogs/[slug]`. */
export async function fetchBlogSitemapEntries(): Promise<SitemapPathEntry[]> {
  return collectPaginatedPaths(GET_BLOG_SITEMAP_POSTS, "posts", (slug) => `/blogs/${slug}`);
}

/** Published portfolios → `/our-work/[slug]`. */
export async function fetchPortfolioSitemapEntries(): Promise<SitemapPathEntry[]> {
  return collectPaginatedPaths(GET_PORTFOLIO_SITEMAP, "portfolios", (slug) => `/our-work/${slug}`);
}

/**
 * Top-level WP pages served by `app/[slug]`.
 * Skips reserved Next routes (blogs, services, etc.) and staging paths.
 */
export async function fetchWpPageSitemapEntries(): Promise<SitemapPathEntry[]> {
  return collectPaginatedPaths(GET_PAGE_SITEMAP, "pages", (slug) => {
    if (slug.includes("/")) return null;
    if (EXCLUDED_WP_PAGE_SLUGS.has(slug.toLowerCase())) return null;
    return `/${slug}`;
  });
}
