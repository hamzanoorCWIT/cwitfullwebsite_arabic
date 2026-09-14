import { cache } from "react";
import { fetchWordPressGraphQL } from "@/app/lib/wordpress-graphql";

const GET_PAGE_BY_SLUG = `
  query GetPageBySlug($slug: ID!) {
    page(id: $slug, idType: SLUG) {
      databaseId
      title
      slug
      content
    }
  }
`;

export type WpPage = {
  databaseId?: number | null;
  title?: string | null;
  slug?: string | null;
  content?: string | null;
};

export const fetchWpPageBySlug = cache(async (slug: string): Promise<WpPage | null> => {
  const normalized = slug.replace(/^\/+|\/+$/g, "").trim();
  if (!normalized) return null;

  try {
    const res = await fetchWordPressGraphQL<{ page?: WpPage | null }>(GET_PAGE_BY_SLUG, {
      slug: normalized,
    });
    const page = res.data?.page;
    if (!page?.slug?.trim()) return null;
    return page;
  } catch (error) {
    console.error(`[wp-page:${normalized}] Failed to fetch published page:`, error);
    return null;
  }
});
