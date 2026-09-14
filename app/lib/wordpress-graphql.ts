/**
 * Server-side WordPress WPGraphQL fetcher.
 * Prefers WORDPRESS_GRAPHQL_URL (server-only); falls back to NEXT_PUBLIC_WP_GRAPHQL_URL.
 */

import {
  DEFAULT_LOCALE,
  getWordPressGraphqlEndpointForLocale,
  getWordpressLanguageHeaders,
  type AppLocale,
} from "@/app/lib/locale";

export function getWordPressGraphqlEndpoint(locale: AppLocale = DEFAULT_LOCALE): string {
  return getWordPressGraphqlEndpointForLocale(locale);
}

export function getWordpressGraphqlHeaders(
  locale: AppLocale = DEFAULT_LOCALE
): Record<string, string> {
  return {
    "Content-Type": "application/json",
    ...getWordpressLanguageHeaders(locale),
  };
}

export type GraphQLResponse<T> = {
  data?: T;
  errors?: Array<{ message: string }>;
};

export const WORDPRESS_REVALIDATE_SECONDS = 3600;

export async function fetchWordPressGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
  locale: AppLocale = DEFAULT_LOCALE
): Promise<GraphQLResponse<T>> {
  const endpoint = getWordPressGraphqlEndpoint(locale);

  const res = await fetch(endpoint, {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers: getWordpressGraphqlHeaders(locale),
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`GraphQL request failed with status ${res.status}`);
  }

  return (await res.json()) as GraphQLResponse<T>;
}
