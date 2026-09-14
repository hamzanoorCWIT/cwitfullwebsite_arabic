import { cache } from "react";
import { fetchWordPressGraphQL } from "@/app/lib/wordpress-graphql";
import { getHomePageIdForLocale, type AppLocale } from "@/app/lib/locale";

type ContentTranslationNode = {
  databaseId?: number | string | null;
  language?: { code?: string | null } | null;
};

type PageTranslationsQueryData = {
  page?: {
    databaseId?: number | string | null;
    language?: { code?: string | null } | null;
    translations?: Array<ContentTranslationNode | null> | null;
  } | null;
};

type PostTranslationsQueryData = {
  post?: {
    databaseId?: number | string | null;
    language?: { code?: string | null } | null;
    translations?: Array<ContentTranslationNode | null> | null;
  } | null;
};

const GET_PAGE_TRANSLATIONS = `
  query GetPageTranslations($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      databaseId
      language {
        code
      }
      translations {
        databaseId
        language {
          code
        }
      }
    }
  }
`;

const GET_POST_TRANSLATIONS = `
  query GetPostTranslations($id: ID!) {
    post(id: $id, idType: DATABASE_ID) {
      databaseId
      language {
        code
      }
      translations {
        databaseId
        language {
          code
        }
      }
    }
  }
`;

function toId(value: number | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  const id = String(value).trim();
  return id || undefined;
}

function matchesLocale(code: string | null | undefined, locale: AppLocale): boolean {
  return String(code ?? "").toLowerCase() === locale;
}

/**
 * Resolves a WordPress page database ID for a locale from WPML translations.
 */
export const resolvePageIdForLocale = cache(async (
  sourceId: string,
  locale: AppLocale
): Promise<string> => {
  try {
    const response = await fetchWordPressGraphQL<PageTranslationsQueryData>(
      GET_PAGE_TRANSLATIONS,
      { id: sourceId },
      "en"
    );
    const page = response.data?.page;
    if (!page) return sourceId;

    if (matchesLocale(page.language?.code, locale)) {
      return toId(page.databaseId) ?? sourceId;
    }

    const translated = (page.translations ?? []).find((node) =>
      matchesLocale(node?.language?.code, locale)
    );
    return toId(translated?.databaseId) ?? sourceId;
  } catch (error) {
    console.error("[wpml] Failed to resolve page translation ID:", error);
    return sourceId;
  }
});

/**
 * Resolves a WordPress post database ID for a locale from WPML translations.
 */
export const resolvePostIdForLocale = cache(async (
  sourceId: string,
  locale: AppLocale
): Promise<string> => {
  try {
    const response = await fetchWordPressGraphQL<PostTranslationsQueryData>(
      GET_POST_TRANSLATIONS,
      { id: sourceId },
      "en"
    );
    const post = response.data?.post;
    if (!post) return sourceId;

    if (matchesLocale(post.language?.code, locale)) {
      return toId(post.databaseId) ?? sourceId;
    }

    const translated = (post.translations ?? []).find((node) =>
      matchesLocale(node?.language?.code, locale)
    );
    return toId(translated?.databaseId) ?? sourceId;
  } catch (error) {
    console.error("[wpml] Failed to resolve post translation ID:", error);
    return sourceId;
  }
});

type PortfolioTranslationsQueryData = {
  portfolio?: {
    databaseId?: number | string | null;
    language?: { code?: string | null } | null;
    translations?: Array<ContentTranslationNode | null> | null;
  } | null;
};

const GET_PORTFOLIO_TRANSLATIONS = `
  query GetPortfolioTranslations($id: ID!) {
    portfolio(id: $id, idType: DATABASE_ID) {
      databaseId
      language {
        code
      }
      translations {
        databaseId
        language {
          code
        }
      }
    }
  }
`;

/**
 * Resolves a Portfolio CPT database ID for a locale from WPML translations.
 */
export const resolvePortfolioIdForLocale = cache(async (
  sourceId: string,
  locale: AppLocale
): Promise<string> => {
  try {
    const response = await fetchWordPressGraphQL<PortfolioTranslationsQueryData>(
      GET_PORTFOLIO_TRANSLATIONS,
      { id: sourceId },
      "en"
    );
    const portfolio = response.data?.portfolio;
    if (!portfolio) return sourceId;

    if (matchesLocale(portfolio.language?.code, locale)) {
      return toId(portfolio.databaseId) ?? sourceId;
    }

    const translated = (portfolio.translations ?? []).find((node) =>
      matchesLocale(node?.language?.code, locale)
    );
    return toId(translated?.databaseId) ?? sourceId;
  } catch (error) {
    console.error("[wpml] Failed to resolve portfolio translation ID:", error);
    return sourceId;
  }
});

/**
 * Resolves the Home page database ID for a locale from WPML translations.
 * Falls back to NEXT_PUBLIC_HOME_PAGE_ID / NEXT_PUBLIC_HOME_PAGE_ID_AR.
 */
export const resolveHomePageId = cache(async (locale: AppLocale): Promise<string | undefined> => {
  const envId = getHomePageIdForLocale(locale);
  const sourceId = process.env.NEXT_PUBLIC_HOME_PAGE_ID?.trim();
  if (!sourceId) return envId;
  const resolved = await resolvePageIdForLocale(sourceId, locale);
  return resolved || envId;
});
