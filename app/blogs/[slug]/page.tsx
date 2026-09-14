import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import DigitalExperienceBanner from "@/app/components/sections/DigitalExperienceBanner";
import Accordion from "@/app/components/sections/Accordion";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import {
  fetchBlogDetailBySlug,
  fetchBlogPosts,
  mapPostToBlogCard,
  type BlogCardItem,
} from "@/app/lib/blog-api";
import { fetchSeoByPostSlug, type YoastSeo } from "@/app/lib/home-seo-api";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";
import { sanitizeCmsHtml } from "@/app/lib/sanitize-cms-html";
import bannerStyles from "@/app/components/sections/digital-experience-banner-tuned.module.css";
import styles from "./BlogDetail.module.css";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function normalizeSlug(slug: string | undefined): string {
  return slug?.replace(/^\/+|\/+$/g, "").trim() ?? "";
}

function applyBlogDetailSeoFallbacks(
  seo: YoastSeo | null,
  slug: string
): YoastSeo | null {
  if (!seo) return null;

  const fallbackUrl = `${getFrontendSiteUrl().replace(/\/+$/, "")}/blogs/${slug}`;

  return {
    ...seo,
    canonical: seo.canonical?.trim() || fallbackUrl,
    opengraphUrl: seo.opengraphUrl?.trim() || fallbackUrl,
  };
}

async function fetchBlogDetailSeo(slug: string): Promise<YoastSeo | null> {
  try {
    const seo = await fetchSeoByPostSlug(slug);
    return applyBlogDetailSeoFallbacks(seo, slug);
  } catch (error) {
    console.error(`[blogs/${slug}] Failed to fetch Yoast SEO:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slugNorm = normalizeSlug((await params).slug);
  if (!slugNorm) return {};

  const [seo, post] = await Promise.all([
    fetchBlogDetailSeo(slugNorm),
    fetchBlogDetailBySlug(slugNorm),
  ]);
  const metadata = yoastSeoToMetadata(seo);
  if (!metadata.title && post?.title?.trim()) metadata.title = post.title.trim();
  if (!metadata.description && post?.excerpt?.trim()) {
    metadata.description = post.excerpt.trim();
  }

  const fallbackUrl = `${getFrontendSiteUrl().replace(/\/+$/, "")}/blogs/${slugNorm}/`;
  metadata.alternates = {
    ...metadata.alternates,
    canonical: metadata.alternates?.canonical || fallbackUrl,
  };

  const existingOpenGraph =
    metadata.openGraph && typeof metadata.openGraph === "object"
      ? metadata.openGraph
      : {};
  const fallbackImage =
    post?.featuredImage || post?.heroImage || post?.bannerBackgroundImage;
  metadata.openGraph = {
    ...existingOpenGraph,
    type: "article",
    url: existingOpenGraph.url || fallbackUrl,
    ...(post?.title && !existingOpenGraph.title ? { title: post.title } : {}),
    ...(post?.excerpt && !existingOpenGraph.description
      ? { description: post.excerpt }
      : {}),
    ...(!existingOpenGraph.images && fallbackImage
      ? { images: [{ url: fallbackImage }] }
      : {}),
    ...(post?.date ? { publishedTime: post.date } : {}),
    ...(post?.modified ? { modifiedTime: post.modified } : {}),
    ...(post?.authorName ? { authors: [post.authorName] } : {}),
    ...(post?.tags?.length ? { tags: post.tags } : {}),
  };

  return metadata;
}

async function getRelatedBlogs(currentSlug: string): Promise<BlogCardItem[]> {
  try {
    const response = await fetchBlogPosts(4);
    return (response.data?.posts?.nodes ?? [])
      .filter((node) => node?.slug !== currentSlug)
      .map((node) => mapPostToBlogCard(node))
      .filter((item): item is BlogCardItem => Boolean(item))
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function BlogDetailPage({ params }: PageProps) {
  const slugNorm = normalizeSlug((await params).slug);
  if (!slugNorm) notFound();

  const post = await fetchBlogDetailBySlug(slugNorm);
  if (!post) notFound();

  let seo: YoastSeo | null = null;
  try {
    seo = await fetchBlogDetailSeo(post.slug);
  } catch (error) {
    console.error(`[blogs/${post.slug}] Failed to build Yoast SEO graph:`, error);
    seo = null;
  }

  const articleSections = post.articleSections ?? [];
  const relatedBlogs = await getRelatedBlogs(post.slug);
  const faqItems = post.faqs?.map((faq, index) => ({
    id: index + 1,
    title: faq.title,
    content: faq.content,
  }));
  const jsonLd = buildDynamicAeoJsonLd({
    seo,
    path: `/blogs/${post.slug}/`,
    faqs: faqItems,
    pageTitle: post.title,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Blogs", path: "/blogs/" },
      { name: post.title, path: `/blogs/${post.slug}/` },
    ],
    article: {
      headline: post.title,
      description: post.excerpt,
      image:
        seo?.opengraphImage?.sourceUrl ||
        post.featuredImage ||
        post.heroImage ||
        post.bannerBackgroundImage,
      authorName: post.authorName,
      datePublished: post.date,
      dateModified: post.modified,
      tags: post.tags,
      sections: post.categories,
    },
  });
  const hasBannerBg = Boolean(post.bannerBackgroundImage?.trim());
  const hasContent = articleSections.length > 0 || relatedBlogs.length > 0;

  return (
    <main className={styles.page}>
      {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
      <DigitalExperienceBanner
        title={post.bannerHeading || post.title}
        subtitle={post.badge}
        description={post.excerpt}
        descriptionClassName={styles.bannerDescription}
        titleClassName={styles.bannerTitle}
        className={bannerStyles.tunedBanner}
        backgroundImage={
          hasBannerBg
            ? {
                src: post.bannerBackgroundImage!,
                alt: post.bannerBackgroundImageAlt || "",
              }
            : undefined
        }
      />

      {post.heroImage ? (
        <section className={styles.heroMediaSection} aria-label="Blog feature image">
          <div className={styles.heroMedia}>
            <Image
              src={post.heroImage}
              alt={post.heroImageAlt || post.title}
              className={styles.heroImage}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 95vw"
              unoptimized
            />
          </div>
        </section>
      ) : null}

      {hasContent ? (
        <section className={styles.contentSection}>
          <div className={styles.contentGrid}>
            {articleSections.length > 0 ? (
              <article className={styles.article}>
                {articleSections.map((section, index) => (
                  <div key={`${section.title || "section"}-${index}`} className={styles.articleBlock}>
                    {section.eyebrow ? <p className={styles.eyebrow}>{section.eyebrow}</p> : null}
                    {section.title ? <h2>{section.title}</h2> : null}
                    {section.content ? (
                      <div
                        className={styles.richText}
                        dangerouslySetInnerHTML={{
                          __html: sanitizeCmsHtml(section.content, { rich: true }),
                        }}
                      />
                    ) : null}
                    {section.blocks?.map((block, blockIndex) => (
                      <div
                        key={`${block.title || "block"}-${blockIndex}`}
                        className={styles.articleSubBlock}
                      >
                        {block.title ? <h2>{block.title}</h2> : null}
                        {block.description ? (
                          <div
                            className={styles.richText}
                            dangerouslySetInnerHTML={{
                              __html: sanitizeCmsHtml(block.description, { rich: true }),
                            }}
                          />
                        ) : null}
                      </div>
                    ))}
                    {section.image ? (
                      <figure className={styles.inlineFigure}>
                        <Image
                          src={section.image}
                          alt={section.imageAlt || section.title || post.title}
                          className={styles.inlineImage}
                          fill
                          sizes="(max-width: 1180px) 100vw, 1150px"
                          unoptimized
                        />
                      </figure>
                    ) : null}
                  </div>
                ))}
              </article>
            ) : (
              <div />
            )}
          </div>

          {relatedBlogs.length > 0 ? (
            <section className={styles.relatedSection} aria-label="Related blogs">
              <div className={styles.relatedGrid}>
                {relatedBlogs.map((blog) => (
                  <Link
                    key={blog.link || blog.title}
                    href={blog.link || "/blogs"}
                    className={styles.relatedCard}
                  >
                    <div className={styles.relatedImageWrap}>
                      {blog.image ? (
                        <Image
                          src={blog.image}
                          alt={blog.title}
                          className={styles.relatedImage}
                          fill
                          sizes="(max-width: 820px) 100vw, (max-width: 1180px) 33vw, 452px"
                          unoptimized
                        />
                      ) : null}
                    </div>
                    <div className={styles.relatedBody}>
                      {blog.category ? <p className={styles.relatedCategory}>{blog.category}</p> : null}
                      <h3>{blog.title}</h3>
                      {blog.description ? <p>{blog.description}</p> : null}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}
        </section>
      ) : null}

      {faqItems?.length ? (
        <Accordion
          title={post.faqTitle}
          items={faqItems}
          className={styles.faqSection}
          titleClassName={styles.faqTitle}
        />
      ) : null}
    </main>
  );
}
