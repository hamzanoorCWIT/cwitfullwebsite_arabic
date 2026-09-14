import type { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import HeroBanner from "@/app/components/ui/HeroBanner";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import { fetchPortfolioBySlug } from "@/app/lib/our-work-api";
import { fetchWpPageBySlug } from "@/app/lib/wp-page-api";
import { fetchSeoByUri, type YoastSeo } from "@/app/lib/home-seo-api";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";
import { sanitizeCmsHtml } from "@/app/lib/sanitize-cms-html";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function normalizeSlug(slug: string | undefined): string {
  return slug?.replace(/^\/+|\/+$/g, "").trim() ?? "";
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slugNorm = normalizeSlug((await params).slug);
  if (!slugNorm) return {};

  const page = await fetchWpPageBySlug(slugNorm);
  if (!page) return {};

  try {
    const seo = await fetchSeoByUri(slugNorm);
    return yoastSeoToMetadata(seo);
  } catch (error) {
    console.error(`[${slugNorm}] Failed to generate Yoast metadata:`, error);
    return { title: page.title?.trim() || undefined };
  }
}

/** Root /[slug]: WordPress pages first; legacy portfolio URLs redirect to /our-work/[slug]. */
export default async function RootSlugPage({ params }: PageProps) {
  const slugNorm = normalizeSlug((await params).slug);
  if (!slugNorm) {
    redirect("/our-work");
  }

  const wpPage = await fetchWpPageBySlug(slugNorm);
  if (wpPage) {
    let seo: YoastSeo | null = null;
    try {
      seo = await fetchSeoByUri(slugNorm);
    } catch (error) {
      console.error(`[${slugNorm}] Failed to fetch Yoast SEO graph:`, error);
      seo = null;
    }

    const title = wpPage.title?.trim() || slugNorm;
    const contentHtml = wpPage.content?.trim();
    const jsonLd = buildDynamicAeoJsonLd({
      seo,
      path: `/${slugNorm}/`,
      pageTitle: title,
      breadcrumbs: [
        { name: "Home", path: "/" },
        { name: title, path: `/${slugNorm}/` },
      ],
    });

    return (
      <main className="min-h-screen relative bg-black">
        {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
        <HeroBanner title={title} minHeight="60vh" />
        {contentHtml ? (
          <section className="relative z-10 mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 max-w-[900px]">
            <div
              className="prose prose-invert prose-lg max-w-none text-white/90 [&_a]:text-[#0DFCC1] [&_a]:underline [&_img]:rounded-lg"
              dangerouslySetInnerHTML={{ __html: sanitizeCmsHtml(contentHtml, { rich: true }) }}
            />
          </section>
        ) : null}
      </main>
    );
  }

  const portfolioRes = await fetchPortfolioBySlug(slugNorm);
  if (portfolioRes.data?.portfolio) {
    redirect(`/our-work/${slugNorm}`);
  }

  notFound();
}
