import { cache } from "react";
import { resolveImageUrl } from "@/app/lib/our-work-api";
import {
  getWordPressGraphqlEndpoint,
  getWordpressGraphqlHeaders,
  WORDPRESS_REVALIDATE_SECONDS,
} from "@/app/lib/wordpress-graphql";
import { DEFAULT_LOCALE, type AppLocale } from "@/app/lib/locale";

const BLOG_LISTING_POSTS_LIMIT = 100;

export const BLOG_POST_LISTING_CARD_GQL = `
  blogDetails {
    blogDetails {
      listingCardSubtitle
      listingCardTitle
      listingCardDescription
      listingCardImage {
        node {
          sourceUrl
          mediaItemUrl
          altText
        }
      }
    }
  }
`;

export const GET_BLOG_POSTS = `
  query GetBlogPosts($first: Int!, $language: String) {
    posts(first: $first, where: { status: PUBLISH, language: $language, orderby: { field: DATE, order: DESC } }) {
      nodes {
        databaseId
        title
        slug
        uri
        excerpt
        date
        language {
          code
        }
        translations {
          databaseId
          language {
            code
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
        featuredImage {
          node {
            sourceUrl
            mediaItemUrl
            altText
          }
        }
        ${BLOG_POST_LISTING_CARD_GQL.trim()}
      }
    }
  }
`;

const GET_BLOG_POSTS_WITHOUT_LANGUAGE = `
  query GetBlogPosts($first: Int!) {
    posts(first: $first, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
      nodes {
        databaseId
        title
        slug
        uri
        excerpt
        date
        categories {
          nodes {
            name
            slug
          }
        }
        featuredImage {
          node {
            sourceUrl
            mediaItemUrl
            altText
          }
        }
        ${BLOG_POST_LISTING_CARD_GQL.trim()}
      }
    }
  }
`;

const GET_BLOG_POST_BY_ID = `
  query GetBlogPostById($id: ID!) {
    post(id: $id, idType: DATABASE_ID) {
      databaseId
      title
      slug
      uri
      excerpt
      date
      language {
        code
      }
      categories {
        nodes {
          name
          slug
        }
      }
      featuredImage {
        node {
          sourceUrl
          mediaItemUrl
          altText
        }
      }
      ${BLOG_POST_LISTING_CARD_GQL.trim()}
    }
  }
`;

export type BlogListingCardData = {
  listingCardSubtitle?: string | null;
  listingCardTitle?: string | null;
  listingCardDescription?: string | null;
  listingCardImage?: {
    sourceUrl?: string | null;
    mediaItemUrl?: string | null;
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
};

export type BlogPostNode = {
  databaseId?: number | null;
  title?: string | null;
  slug?: string | null;
  uri?: string | null;
  excerpt?: string | null;
  date?: string | null;
  language?: { code?: string | null } | null;
  translations?: Array<{
    databaseId?: number | null;
    language?: { code?: string | null } | null;
  } | null> | null;
  categories?: { nodes?: Array<{ name?: string | null; slug?: string | null } | null> | null } | null;
  featuredImage?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
  blogDetails?: {
    blogDetails?: BlogListingCardData | null;
  } | null;
};

export type BlogPostsResponse = {
  posts?: { nodes?: Array<BlogPostNode | null> | null } | null;
};

export type GraphQLBlogResponse = {
  data?: BlogPostsResponse;
  errors?: Array<{ message: string }>;
};

function stripHtmlToText(value: string | undefined | null): string {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

const GET_BLOG_POSTS_LEGACY = `
  query GetBlogPostsLegacy($first: Int!) {
    posts(first: $first, where: { status: PUBLISH, orderby: { field: DATE, order: DESC } }) {
      nodes {
        databaseId
        title
        slug
        uri
        excerpt
        date
        categories {
          nodes {
            name
            slug
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
`;

function hasBlogListingCardSchemaError(errors: Array<{ message: string }> | undefined): boolean {
  return (
    errors?.some((error) => {
      const message = error.message.toLowerCase();
      return (
        message.includes("listingcard") ||
        message.includes("listing_card") ||
        message.includes("blogdetails")
      );
    }) ?? false
  );
}

async function requestBlogPosts(
  query: string,
  variables: Record<string, unknown>,
  locale: AppLocale
): Promise<GraphQLBlogResponse> {
  const res = await fetch(getWordPressGraphqlEndpoint(locale), {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers: getWordpressGraphqlHeaders(locale),
    body: JSON.stringify({ query, variables }),
  });
  return (await res.json()) as GraphQLBlogResponse;
}

function hasLanguageFilterError(errors: Array<{ message: string }> | undefined): boolean {
  return (
    errors?.some((error) => {
      const message = error.message.toLowerCase();
      return message.includes("language") || message.includes("internal server error");
    }) ?? false
  );
}

export async function fetchBlogPosts(
  limit: number = BLOG_LISTING_POSTS_LIMIT,
  locale: AppLocale = DEFAULT_LOCALE
): Promise<GraphQLBlogResponse> {
  const first = Math.min(Math.max(1, limit), BLOG_LISTING_POSTS_LIMIT);
  let json = await requestBlogPosts(
    GET_BLOG_POSTS,
    { first, language: locale },
    locale
  );
  if (hasLanguageFilterError(json.errors) && !json.data?.posts?.nodes?.length) {
    json = await requestBlogPosts(GET_BLOG_POSTS_WITHOUT_LANGUAGE, { first }, locale);
  }
  if (!hasBlogListingCardSchemaError(json.errors)) {
    return json;
  }

  return requestBlogPosts(GET_BLOG_POSTS_LEGACY, { first }, locale);
}

export async function fetchBlogPostById(
  id: string,
  locale: AppLocale = DEFAULT_LOCALE
): Promise<BlogPostNode | null> {
  const json = await requestBlogPosts(GET_BLOG_POST_BY_ID, { id }, locale);
  const post = (json.data as { post?: BlogPostNode | null } | undefined)?.post;
  return post?.databaseId != null || post?.title?.trim() ? post ?? null : null;
}

/** Fetch latest N posts (e.g. for other pages — not used as a home page blogs fallback). */
const GET_LATEST_BLOG_POSTS = `
  query GetLatestBlogPosts($first: Int!) {
    posts(first: $first, where: { status: PUBLISH }) {
      nodes {
        databaseId
        title
        slug
        uri
        excerpt
        date
        categories {
          nodes {
            name
            slug
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
`;

export async function fetchLatestBlogPosts(limit: number = 6): Promise<GraphQLBlogResponse> {
  const res = await fetch(getWordPressGraphqlEndpoint(), {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: GET_LATEST_BLOG_POSTS,
      variables: { first: Math.min(Math.max(1, limit), 24) },
    }),
  });
  return res.json();
}

export type BlogCardItem = {
  category: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  buttonText?: string;
  buttonLink?: string;
};

export type BlogDetailItem = {
  title: string;
  slug: string;
  date?: string;
  modified?: string;
  authorName?: string;
  tags?: string[];
  categories?: string[];
  featuredImage?: string;
  featuredImageAlt?: string;
  /** Optional CMS override for the banner H1. Falls back to post title when empty. */
  bannerHeading?: string;
  badge?: string;
  bannerBackgroundImage?: string;
  bannerBackgroundImageAlt?: string;
  heroImage?: string;
  heroImageAlt?: string;
  excerpt?: string;
  articleSections?: Array<{
    eyebrow?: string;
    title?: string;
    content?: string;
    /** Extra title + description pairs inside the same article section. */
    blocks?: Array<{
      title?: string;
      description?: string;
    }>;
    image?: string;
    imageAlt?: string;
  }>;
  faqTitle?: string;
  faqs?: Array<{ title: string; content: string }>;
};

type BlogDetailAcfFields = {
  bannerHeading?: string | null;
  badge?: string | null;
  bannerBackgroundImage?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
  heroImage?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
  excerpt?: string | null;
  articleSections?: Array<{
    eyebrow?: string | null;
    title?: string | null;
    content?: string | null;
    contentBlocks?: Array<{
      title?: string | null;
      description?: string | null;
    } | null> | null;
    image?: {
      node?: {
        sourceUrl?: string | null;
        mediaItemUrl?: string | null;
        altText?: string | null;
      } | null;
    } | null;
    imageAlt?: string | null;
  } | null> | null;
  faqTitle?: string | null;
  faqs?: Array<{ faqTitle?: string | null; faqContent?: string | null } | null> | null;
};

type GraphQLBlogDetailResponse = {
  data?: {
    post?: {
      title?: string | null;
      slug?: string | null;
      date?: string | null;
      modified?: string | null;
      excerpt?: string | null;
      author?: {
        node?: {
          name?: string | null;
        } | null;
      } | null;
      tags?: {
        nodes?: Array<{ name?: string | null } | null> | null;
      } | null;
      categories?: {
        nodes?: Array<{ name?: string | null } | null> | null;
      } | null;
      featuredImage?: {
        node?: {
          sourceUrl?: string | null;
          mediaItemUrl?: string | null;
          altText?: string | null;
        } | null;
      } | null;
      blogDetails?: {
        blogDetails?: BlogDetailAcfFields | null;
      } | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
};

const BLOG_DETAIL_ACF_FIELDS = `
          bannerHeading
          badge
          bannerBackgroundImage {
            node {
              sourceUrl
              mediaItemUrl
              altText
            }
          }
          heroImage {
            node {
              sourceUrl
              mediaItemUrl
              altText
            }
          }
          excerpt
          articleSections {
            eyebrow
            title
            content
            contentBlocks {
              title
              description
            }
            image {
              node {
                sourceUrl
                mediaItemUrl
                altText
              }
            }
            imageAlt
          }
          faqTitle
          faqs {
            faqTitle
            faqContent
          }
`;

const GET_BLOG_DETAIL_BY_SLUG = `
  query GetBlogDetailBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      title
      slug
      date
      modified
      excerpt
      author {
        node {
          name
        }
      }
      tags {
        nodes {
          name
        }
      }
      categories {
        nodes {
          name
        }
      }
      featuredImage {
        node {
          sourceUrl
          mediaItemUrl
          altText
        }
      }
      blogDetails {
        blogDetails {
          ${BLOG_DETAIL_ACF_FIELDS.trim()}
        }
      }
    }
  }
`;

/** Fallback when articleSections / banner / FAQ fields are not in schema yet. */
const GET_BLOG_DETAIL_BY_SLUG_LEGACY = `
  query GetBlogDetailBySlugLegacy($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      title
      slug
      date
      modified
      excerpt
      author {
        node {
          name
        }
      }
      tags {
        nodes {
          name
        }
      }
      categories {
        nodes {
          name
        }
      }
      featuredImage {
        node {
          sourceUrl
          mediaItemUrl
          altText
        }
      }
      blogDetails {
        blogDetails {
          badge
          heroImage {
            node {
              sourceUrl
              mediaItemUrl
              altText
            }
          }
          excerpt
        }
      }
    }
  }
`;

function trimOrUndefined(value: string | null | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

function normalizeDate(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  const timestamp = Date.parse(trimmed);
  return Number.isNaN(timestamp) ? undefined : new Date(timestamp).toISOString();
}

function hasBlogDetailSchemaError(errors: Array<{ message: string }> | undefined): boolean {
  return (
    errors?.some((error) => {
      const message = error.message.toLowerCase();
      return (
        message.includes("cannot query field") ||
        message.includes("bannerheading") ||
        message.includes("bannerbackgroundimage") ||
        message.includes("articlesections") ||
        message.includes("contentblocks") ||
        message.includes("faqtitle") ||
        message.includes("faqs")
      );
    }) ?? false
  );
}

async function fetchBlogDetailQuery(slug: string, query: string): Promise<GraphQLBlogDetailResponse> {
  const res = await fetch(getWordPressGraphqlEndpoint(), {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { slug },
    }),
  });
  return res.json();
}

export const fetchBlogDetailBySlug = cache(
  async (slug: string): Promise<BlogDetailItem | null> => {
  const slugNorm = slug?.replace(/^\/+|\/+$/g, "").trim();
  if (!slugNorm) return null;

  const primary = await fetchBlogDetailQuery(slugNorm, GET_BLOG_DETAIL_BY_SLUG);
  const json =
    primary.data?.post || !hasBlogDetailSchemaError(primary.errors)
      ? primary
      : await fetchBlogDetailQuery(slugNorm, GET_BLOG_DETAIL_BY_SLUG_LEGACY);
  const post = json.data?.post;
  if (!post?.slug) return null;
  const details = post.blogDetails?.blogDetails;

  const heroImage = resolveImageUrl(
    details?.heroImage?.node?.sourceUrl ?? details?.heroImage?.node?.mediaItemUrl ?? undefined
  );

  const bannerBackgroundImage = resolveImageUrl(
    details?.bannerBackgroundImage?.node?.sourceUrl ??
      details?.bannerBackgroundImage?.node?.mediaItemUrl ??
      undefined
  );
  const featuredImage = resolveImageUrl(
    post.featuredImage?.node?.sourceUrl ??
      post.featuredImage?.node?.mediaItemUrl ??
      undefined
  );

  const articleSections = (details?.articleSections ?? [])
    .filter(Boolean)
    .map((section) => {
      const image = resolveImageUrl(
        section?.image?.node?.sourceUrl ?? section?.image?.node?.mediaItemUrl ?? undefined
      );
      const blocks = (section?.contentBlocks ?? [])
        .filter(Boolean)
        .map((block) => ({
          title: trimOrUndefined(block?.title),
          description: trimOrUndefined(block?.description),
        }))
        .filter((block) => block.title || block.description);

      return {
        eyebrow: trimOrUndefined(section?.eyebrow),
        title: trimOrUndefined(section?.title),
        content: trimOrUndefined(section?.content),
        blocks: blocks.length > 0 ? blocks : undefined,
        image: image ?? undefined,
        imageAlt:
          trimOrUndefined(section?.imageAlt) ??
          trimOrUndefined(section?.image?.node?.altText),
      };
    })
    .filter(
      (section) =>
        section.eyebrow ||
        section.title ||
        section.content ||
        (section.blocks && section.blocks.length > 0) ||
        section.image
    );

  const faqs = (details?.faqs ?? [])
    .filter(Boolean)
    .map((faq) => ({
      title: trimOrUndefined(faq?.faqTitle) ?? "",
      content: trimOrUndefined(faq?.faqContent) ?? "",
    }))
    .filter((faq) => faq.title && faq.content);

    return {
    title: trimOrUndefined(post.title) ?? "",
    slug: post.slug,
    date: normalizeDate(post.date),
    modified: normalizeDate(post.modified),
    authorName: trimOrUndefined(post.author?.node?.name),
    tags: (post.tags?.nodes ?? [])
      .map((tag) => trimOrUndefined(tag?.name))
      .filter((tag): tag is string => Boolean(tag)),
    categories: (post.categories?.nodes ?? [])
      .map((category) => trimOrUndefined(category?.name))
      .filter((category): category is string => Boolean(category)),
    featuredImage: featuredImage ?? undefined,
    featuredImageAlt: trimOrUndefined(post.featuredImage?.node?.altText),
    bannerHeading: trimOrUndefined(details?.bannerHeading),
    badge: trimOrUndefined(details?.badge),
    bannerBackgroundImage: bannerBackgroundImage ?? undefined,
    bannerBackgroundImageAlt: trimOrUndefined(details?.bannerBackgroundImage?.node?.altText),
    heroImage: heroImage ?? undefined,
    heroImageAlt: trimOrUndefined(details?.heroImage?.node?.altText),
    excerpt:
      trimOrUndefined(details?.excerpt) ||
      trimOrUndefined(stripHtmlToText(post.excerpt)),
    articleSections: articleSections.length > 0 ? articleSections : undefined,
    faqTitle: trimOrUndefined(details?.faqTitle),
    faqs: faqs.length > 0 ? faqs : undefined,
    };
  }
);

// -----------------------------------------------------------------------------
// Blog Page — hero, listing headings, optional selected blogs
// -----------------------------------------------------------------------------
const BLOG_PAGE_SELECTED_POSTS_FIELDS = `
      blogSelectedPosts(first: 100) {
        nodes {
          ... on Post {
            databaseId
            title
            slug
            uri
            excerpt
            date
            categories {
              nodes {
                name
                slug
              }
            }
            featuredImage {
              node {
                sourceUrl
                mediaItemUrl
                altText
              }
            }
            ${BLOG_POST_LISTING_CARD_GQL.trim()}
          }
        }
      }
`;

const BLOG_PAGE_FIELDS_FRAGMENT = `
  fragment BlogPageFields on Page {
    blogPage {
      heroTitle
      heroDescription
      blogSectionSubtitle
      blogSectionTitle
      blogSectionDescription
      ${BLOG_PAGE_SELECTED_POSTS_FIELDS.trim()}
    }
  }
`;

const BLOG_PAGE_FIELDS_FRAGMENT_LEGACY = `
  fragment BlogPageFieldsLegacy on Page {
    blogPage {
      heroTitle
      heroDescription
      blogSectionSubtitle
      blogSectionTitle
      blogSectionDescription
    }
  }
`;

const GET_BLOG_PAGE = `
  query GetBlogPage($uri: ID!, $slug: String) {
    pageByUri: page(id: $uri, idType: URI) {
      databaseId
      ...BlogPageFields
    }
    pageBySlug: page(id: $slug, idType: SLUG) {
      databaseId
      ...BlogPageFields
    }
  }
  ${BLOG_PAGE_FIELDS_FRAGMENT}
`;

const GET_BLOG_PAGE_BY_ID = `
  query GetBlogPageById($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      databaseId
      ...BlogPageFields
    }
  }
  ${BLOG_PAGE_FIELDS_FRAGMENT}
`;

const GET_BLOG_PAGE_LEGACY = `
  query GetBlogPageLegacy($uri: ID!, $slug: String) {
    pageByUri: page(id: $uri, idType: URI) {
      databaseId
      ...BlogPageFieldsLegacy
    }
    pageBySlug: page(id: $slug, idType: SLUG) {
      databaseId
      ...BlogPageFieldsLegacy
    }
  }
  ${BLOG_PAGE_FIELDS_FRAGMENT_LEGACY}
`;

const GET_BLOG_PAGE_BY_ID_LEGACY = `
  query GetBlogPageByIdLegacy($id: ID!) {
    page(id: $id, idType: DATABASE_ID) {
      databaseId
      ...BlogPageFieldsLegacy
    }
  }
  ${BLOG_PAGE_FIELDS_FRAGMENT_LEGACY}
`;

function hasBlogPageSelectedPostsSchemaError(errors: Array<{ message: string }> | undefined): boolean {
  return (
    errors?.some((error) => {
      const message = error.message.toLowerCase();
      return message.includes("blogselectedposts") || message.includes("blog_selected_posts");
    }) ?? false
  );
}

async function fetchBlogPageQuery(
  query: string,
  variables: Record<string, unknown>
): Promise<{
  page: BlogPageResponse["data"] extends { page?: infer P } ? P : null;
  errors?: Array<{ message: string }>;
}> {
  const res = await fetch(getWordPressGraphqlEndpoint(), {
    method: "POST",
    next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as {
    data?: {
      pageByUri?: BlogPageResponse["data"] extends { page?: infer P } ? P : null;
      pageBySlug?: BlogPageResponse["data"] extends { page?: infer P } ? P : null;
      page?: BlogPageResponse["data"] extends { page?: infer P } ? P : null;
    } | null;
    errors?: Array<{ message: string }>;
  };

  const page = json.data?.pageByUri ?? json.data?.pageBySlug ?? json.data?.page ?? null;
  return { page, errors: json.errors };
}

export type BlogPageData = {
  heroTitle?: string | null;
  heroDescription?: string | null;
  blogSectionSubtitle?: string | null;
  blogSectionTitle?: string | null;
  blogSectionDescription?: string | null;
  blogSelectedPosts?: {
    nodes?: Array<BlogPostNode | null> | null;
  } | null;
};

export type BlogPageResponse = {
  data?: {
    page?: {
      blogPage?: BlogPageData | null;
    } | null;
  };
  errors?: Array<{ message: string }>;
};

/** Fetch Blog page: try by URI then by SLUG (Posts page often resolves only by SLUG in WPGraphQL). */
export async function fetchBlogPage(uri: string): Promise<BlogPageResponse> {
  const normalized = uri.replace(/^\/+|\/+$/g, "") || "blogs";

  const primary = await fetchBlogPageQuery(GET_BLOG_PAGE, {
    uri: normalized,
    slug: normalized,
  });
  if (primary.page) {
    return { data: { page: primary.page }, errors: primary.errors };
  }
  if (!hasBlogPageSelectedPostsSchemaError(primary.errors)) {
    return { data: undefined, errors: primary.errors };
  }

  const legacy = await fetchBlogPageQuery(GET_BLOG_PAGE_LEGACY, {
    uri: normalized,
    slug: normalized,
  });
  return { data: legacy.page ? { page: legacy.page } : undefined, errors: legacy.errors };
}

/** Fetch Blog page by database ID (fallback for Posts pages that WPGraphQL can't resolve by slug/uri). */
export async function fetchBlogPageById(id: number): Promise<BlogPageResponse> {
  const primary = await fetchBlogPageQuery(GET_BLOG_PAGE_BY_ID, { id: String(id) });
  if (primary.page) {
    return { data: { page: primary.page }, errors: primary.errors };
  }
  if (!hasBlogPageSelectedPostsSchemaError(primary.errors)) {
    return { data: undefined, errors: primary.errors };
  }

  const legacy = await fetchBlogPageQuery(GET_BLOG_PAGE_BY_ID_LEGACY, { id: String(id) });
  return { data: legacy.page ? { page: legacy.page } : undefined, errors: legacy.errors };
}

/** Try "blogs" by slug/uri first, then "blog", then fallback to database ID 395 (Posts page). */
export async function fetchBlogPageBySlug(): Promise<BlogPageResponse> {
  const res = await fetchBlogPage("blogs");
  if (res.data?.page) return res;
  const res2 = await fetchBlogPage("blog");
  if (res2.data?.page) return res2;
  return fetchBlogPageById(395);
}

function getBlogListingCard(post: BlogPostNode | null | undefined): BlogListingCardData | null {
  const details = post?.blogDetails as
    | (NonNullable<BlogPostNode["blogDetails"]> & BlogListingCardData)
    | null
    | undefined;
  if (!details) return null;
  const nested = details.blogDetails;
  if (
    nested &&
    (nested.listingCardTitle ||
      nested.listingCardSubtitle ||
      nested.listingCardDescription ||
      nested.listingCardImage)
  ) {
    return nested;
  }
  if (
    details.listingCardTitle ||
    details.listingCardSubtitle ||
    details.listingCardDescription ||
    details.listingCardImage
  ) {
    return details;
  }
  return nested ?? null;
}

/** Map a post to a listing card using Blog Details > Listing Card fields, then post fields. */
export function mapPostToBlogCard(post: BlogPostNode | null | undefined): BlogCardItem | null {
  if (!post?.title?.trim() && !getBlogListingCard(post)?.listingCardTitle?.trim()) {
    return null;
  }

  const listingCard = getBlogListingCard(post);
  const category =
    listingCard?.listingCardSubtitle?.trim() ||
    post?.categories?.nodes?.find((c) => c?.name?.trim())?.name?.trim() ||
    "";
  const title = listingCard?.listingCardTitle?.trim() || post?.title?.trim() || "";
  const description =
    listingCard?.listingCardDescription?.trim() || stripHtmlToText(post?.excerpt) || "";
  const image = resolveImageUrl(
    listingCard?.listingCardImage?.node?.sourceUrl ??
      listingCard?.listingCardImage?.node?.mediaItemUrl ??
      listingCard?.listingCardImage?.sourceUrl ??
      listingCard?.listingCardImage?.mediaItemUrl ??
      post?.featuredImage?.node?.sourceUrl ??
      post?.featuredImage?.node?.mediaItemUrl ??
      undefined
  );
  const link = post?.slug?.trim()
    ? `/blogs/${post.slug.trim()}`
    : post?.uri?.trim() || undefined;

  if (!title) return null;
  return { category, title, description, image, link };
}

/**
 * Blog listing page: selected blogs when chosen, otherwise all published posts.
 */
export function resolveBlogPageListing(
  blogPage: BlogPageData | null | undefined,
  allPosts: Array<BlogPostNode | null | undefined> = []
): {
  items: BlogCardItem[];
  sectionTitle: string;
  sectionSubtitle?: string;
  sectionDescription?: string;
  heroTitle: string;
  heroDescription: string;
} {
  const sectionTitle = blogPage?.blogSectionTitle?.trim() || "";
  const sectionSubtitle = blogPage?.blogSectionSubtitle?.trim() || undefined;
  const sectionDescription = blogPage?.blogSectionDescription?.trim() || undefined;
  const heroTitle = blogPage?.heroTitle?.trim() || "";
  const heroDescription = blogPage?.heroDescription?.trim() || "";

  const selectedPosts = blogPage?.blogSelectedPosts?.nodes?.filter(Boolean) ?? [];
  const items =
    selectedPosts.length > 0 ? mapPostsToBlogCards(selectedPosts) : mapPostsToBlogCards(allPosts);

  return {
    items,
    sectionTitle,
    sectionSubtitle,
    sectionDescription,
    heroTitle,
    heroDescription,
  };
}

export function mapPostsToBlogCards(
  nodes: Array<BlogPostNode | null | undefined>
): BlogCardItem[] {
  return nodes
    .map((post) => mapPostToBlogCard(post))
    .filter((item): item is BlogCardItem => Boolean(item?.title));
}
