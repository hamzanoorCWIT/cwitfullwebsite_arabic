import type { Metadata } from "next";
import Blogs from "@/app/components/sections/blogs";
import Accordion from "@/app/components/sections/Accordion";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import {
  fetchBlogPageBySlug,
  fetchBlogPosts,
  resolveBlogPageListing,
  type BlogPostNode,
} from "@/app/lib/blog-api";
import {
  BLOGS_POSTS_PAGE_DATABASE_ID,
  fetchSeoByPageId,
  type YoastSeo,
} from "@/app/lib/home-seo-api";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";

const BLOGS_FRONTEND_PATH = "/blogs/";

export const revalidate = 3600;

function applyBlogsSeoFallbacks(seo: YoastSeo | null): YoastSeo | null {
  if (!seo) return null;

  const fallbackUrl = `${getFrontendSiteUrl().replace(/\/+$/, "")}${BLOGS_FRONTEND_PATH}`;

  return {
    ...seo,
    canonical: seo.canonical?.trim() || fallbackUrl,
    opengraphUrl: seo.opengraphUrl?.trim() || fallbackUrl,
  };
}

async function fetchBlogsPageSeo(): Promise<YoastSeo | null> {
  try {
    const seo = await fetchSeoByPageId(BLOGS_POSTS_PAGE_DATABASE_ID);
    return applyBlogsSeoFallbacks(seo);
  } catch (error) {
    console.error("[blogs] Failed to fetch Yoast SEO:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchBlogsPageSeo();
    return yoastSeoToMetadata(seo);
  } catch {
    return {};
  }
}

export default async function BlogPage() {
  const seo = await fetchBlogsPageSeo();
  const jsonLd = buildDynamicAeoJsonLd({
    seo,
    path: BLOGS_FRONTEND_PATH,
    pageTitle: "Blogs",
  });

  let blogPageData = null;
  let allPosts: Array<BlogPostNode | null> = [];

  try {
    const [pageRes, postsRes] = await Promise.all([
      fetchBlogPageBySlug(),
      fetchBlogPosts(),
    ]);
    blogPageData = pageRes.data?.page?.blogPage ?? null;
    allPosts = postsRes.data?.posts?.nodes ?? [];
  } catch (error) {
    console.error("[blogs] Failed to fetch listing content:", error);
    blogPageData = null;
    allPosts = [];
  }

  const listing = resolveBlogPageListing(blogPageData, allPosts);
  return (
    <main className="min-h-screen pt-24 sm:pt-28 md:pt-32 lg:pt-36">
      {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
      {/* <DigitalExperienceBanner
        title={<>{listing.heroTitle}</>}
        description={listing.heroDescription || undefined}
      /> */}
      <Blogs
        sectionSubtitle={listing.sectionSubtitle}
        sectionTitle={listing.sectionTitle}
        sectionDescription={listing.sectionDescription}
        items={listing.items}
      />
      <Accordion />
    </main>
  );
}
