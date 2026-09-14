import { cache } from "react";
import { fetchWordPressGraphQL } from "@/app/lib/wordpress-graphql";
import { DEFAULT_LOCALE, type AppLocale } from "@/app/lib/locale";
import { resolveHomePageId } from "@/app/lib/wpml-page";

export type YoastSeoImage = {
  sourceUrl?: string | null;
  altText?: string | null;
};

export type YoastSeo = {
  title?: string | null;
  metaDesc?: string | null;
  canonical?: string | null;
  metaRobotsNoindex?: boolean | string | null;
  metaRobotsNofollow?: boolean | string | null;
  opengraphTitle?: string | null;
  opengraphDescription?: string | null;
  opengraphUrl?: string | null;
  opengraphSiteName?: string | null;
  opengraphImage?: YoastSeoImage | null;
  twitterTitle?: string | null;
  twitterDescription?: string | null;
  twitterImage?: YoastSeoImage | null;
  schema?: { raw?: string | null } | null;
};

type SeoByUriQueryData = {
  nodeByUri?: {
    seo?: YoastSeo | null;
  } | null;
};

type SeoByPageIdQueryData = {
  page?: {
    seo?: YoastSeo | null;
  } | null;
};

type SeoByPostSlugQueryData = {
  post?: {
    seo?: YoastSeo | null;
  } | null;
};

type SeoByPortfolioSlugQueryData = {
  portfolio?: {
    seo?: YoastSeo | null;
  } | null;
};

type SeoByLeadingServiceQueryData = {
  leadingService?: {
    seo?: YoastSeo | null;
  } | null;
};

export const BLOGS_POSTS_PAGE_DATABASE_ID = "395";

const SEO_FIELDS = `
  title
  metaDesc
  canonical
  metaRobotsNoindex
  metaRobotsNofollow
  opengraphTitle
  opengraphDescription
  opengraphUrl
  opengraphSiteName
  opengraphImage {
    sourceUrl
    altText
  }
  twitterTitle
  twitterDescription
  twitterImage {
    sourceUrl
    altText
  }
  schema {
    raw
  }
`;

const GET_SEO_BY_URI = `
  query GetSeoByUri($uri: String!) {
    nodeByUri(uri: $uri) {
      ... on Page {
        seo {
          ${SEO_FIELDS}
        }
      }
    }
  }
`;

const GET_SEO_BY_PAGE_ID = `
  query GetPageSeoByDatabaseId($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      databaseId
      title
      slug
      seo {
        ${SEO_FIELDS}
      }
    }
  }
`;

const GET_SEO_BY_POST_SLUG = `
  query GetPostSeoBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      seo {
        ${SEO_FIELDS}
      }
    }
  }
`;

const GET_SEO_BY_PORTFOLIO_SLUG = `
  query GetPortfolioSeoBySlug($slug: ID!) {
    portfolio(id: $slug, idType: SLUG) {
      seo {
        ${SEO_FIELDS}
      }
    }
  }
`;

const GET_SEO_BY_LEADING_SERVICE_ID = `
  query GetLeadingServiceSeoById($id: ID!) {
    leadingService(id: $id, idType: DATABASE_ID) {
      seo {
        ${SEO_FIELDS}
      }
    }
  }
`;

const GET_SEO_BY_LEADING_SERVICE_SLUG = `
  query GetLeadingServiceSeoBySlug($id: ID!) {
    leadingService(id: $id, idType: SLUG) {
      seo {
        ${SEO_FIELDS}
      }
    }
  }
`;

function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+|\/+$/g, "").trim();
}

function logSeoErrors(context: string, errors: Array<{ message: string }>): void {
  console.error(
    `[yoast:${context}] WPGraphQL errors:`,
    errors.map((error) => error.message).join("; ")
  );
}

export const fetchSeoByUri = cache(async (uri: string): Promise<YoastSeo | null> => {
  try {
    const response = await fetchWordPressGraphQL<SeoByUriQueryData>(GET_SEO_BY_URI, {
      uri,
    });

    if (response.errors?.length) {
      logSeoErrors(`uri:${uri}`, response.errors);
      return null;
    }

    return response.data?.nodeByUri?.seo ?? null;
  } catch (error) {
    console.error(`[yoast:uri:${uri}] Failed to fetch SEO:`, error);
    return null;
  }
});

export const fetchSeoByPageId = cache(
  async (id: string | number, locale: AppLocale = DEFAULT_LOCALE): Promise<YoastSeo | null> => {
    try {
      const response = await fetchWordPressGraphQL<SeoByPageIdQueryData>(
        GET_SEO_BY_PAGE_ID,
        { id: String(id) },
        locale
      );

      if (response.errors?.length) {
        logSeoErrors(`page:${id}`, response.errors);
        return null;
      }

      return response.data?.page?.seo ?? null;
    } catch (error) {
      console.error(`[yoast:page:${id}] Failed to fetch SEO:`, error);
      return null;
    }
  }
);

export const fetchSeoByPostSlug = cache(
  async (slug: string): Promise<YoastSeo | null> => {
    const slugNorm = normalizeSlug(slug);
    if (!slugNorm) return null;

    try {
      const response = await fetchWordPressGraphQL<SeoByPostSlugQueryData>(
        GET_SEO_BY_POST_SLUG,
        { slug: slugNorm }
      );

      if (response.errors?.length) {
        logSeoErrors(`post:${slugNorm}`, response.errors);
        return null;
      }

      return response.data?.post?.seo ?? null;
    } catch (error) {
      console.error(`[yoast:post:${slugNorm}] Failed to fetch SEO:`, error);
      return null;
    }
  }
);

export const fetchSeoByPortfolioSlug = cache(
  async (slug: string): Promise<YoastSeo | null> => {
    const slugNorm = normalizeSlug(slug);
    if (!slugNorm) return null;

    try {
      const response = await fetchWordPressGraphQL<SeoByPortfolioSlugQueryData>(
        GET_SEO_BY_PORTFOLIO_SLUG,
        { slug: slugNorm }
      );

      if (response.errors?.length) {
        logSeoErrors(`portfolio:${slugNorm}`, response.errors);
        return null;
      }

      return response.data?.portfolio?.seo ?? null;
    } catch (error) {
      console.error(`[yoast:portfolio:${slugNorm}] Failed to fetch SEO:`, error);
      return null;
    }
  }
);

export const fetchSeoByLeadingServiceId = cache(
  async (id: string | number): Promise<YoastSeo | null> => {
    const idNorm = String(id || "").trim();
    if (!idNorm) return null;

    try {
      const response = await fetchWordPressGraphQL<SeoByLeadingServiceQueryData>(
        GET_SEO_BY_LEADING_SERVICE_ID,
        { id: idNorm }
      );

      if (response.errors?.length) {
        logSeoErrors(`leadingService:id:${idNorm}`, response.errors);
        return null;
      }

      return response.data?.leadingService?.seo ?? null;
    } catch (error) {
      console.error(`[yoast:leadingService:id:${idNorm}] Failed to fetch SEO:`, error);
      return null;
    }
  }
);

export const fetchSeoByLeadingServiceSlug = cache(
  async (slug: string): Promise<YoastSeo | null> => {
    const slugNorm = normalizeSlug(slug);
    if (!slugNorm) return null;

    try {
      const response = await fetchWordPressGraphQL<SeoByLeadingServiceQueryData>(
        GET_SEO_BY_LEADING_SERVICE_SLUG,
        { id: slugNorm }
      );

      if (response.errors?.length) {
        logSeoErrors(`leadingService:slug:${slugNorm}`, response.errors);
        return null;
      }

      return response.data?.leadingService?.seo ?? null;
    } catch (error) {
      console.error(
        `[yoast:leadingService:slug:${slugNorm}] Failed to fetch SEO:`,
        error
      );
      return null;
    }
  }
);

export async function fetchHomeSeo(locale: AppLocale = DEFAULT_LOCALE): Promise<YoastSeo | null> {
  const id = await resolveHomePageId(locale);
  if (id) return fetchSeoByPageId(id, locale);
  return fetchSeoByUri("/");
}
