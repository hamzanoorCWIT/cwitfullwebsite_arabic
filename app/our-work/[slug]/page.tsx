import type { Metadata } from "next";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import { renderPortfolioDetailPage } from "@/app/portfolio/renderPortfolioDetailPage";
import { fetchPortfolioBySlug } from "@/app/lib/our-work-api";
import { fetchSeoByPortfolioSlug, type YoastSeo } from "@/app/lib/home-seo-api";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";
import { portfolioDetailPath } from "@/app/lib/portfolio-url";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{ slug: string }>;
};

function normalizeSlug(slug: string | undefined): string {
  return slug?.replace(/^\/+|\/+$/g, "").trim() ?? "";
}

function applyPortfolioSeoFallbacks(
  seo: YoastSeo | null,
  slug: string
): YoastSeo | null {
  if (!seo) return null;

  const path = portfolioDetailPath(slug) ?? `/our-work/${slug}`;
  const fallbackUrl = `${getFrontendSiteUrl().replace(/\/+$/, "")}${path}`;

  return {
    ...seo,
    canonical: seo.canonical?.trim() || fallbackUrl,
    opengraphUrl: seo.opengraphUrl?.trim() || fallbackUrl,
  };
}

async function fetchPortfolioDetailSeo(slug: string): Promise<YoastSeo | null> {
  try {
    const seo = await fetchSeoByPortfolioSlug(slug);
    return applyPortfolioSeoFallbacks(seo, slug);
  } catch (error) {
    console.error(`[our-work/${slug}] Failed to fetch Yoast SEO:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slugNorm = normalizeSlug((await params).slug);
  if (!slugNorm) return {};

  try {
    const seo = await fetchPortfolioDetailSeo(slugNorm);
    if (seo) return yoastSeoToMetadata(seo);
  } catch {
    // fall through to portfolio title
  }

  try {
    const res = await fetchPortfolioBySlug(slugNorm);
    const title = res.data?.portfolio?.title?.trim();
    return title ? { title } : {};
  } catch {
    return {};
  }
}

export default async function OurWorkDetailPage({ params }: PageProps) {
  const slugNorm = normalizeSlug((await params).slug);

  let seo: YoastSeo | null = null;
  let portfolioTitle = slugNorm;
  if (slugNorm) {
    const [seoResult, portfolioResult] = await Promise.allSettled([
      fetchPortfolioDetailSeo(slugNorm),
      fetchPortfolioBySlug(slugNorm),
    ]);
    if (seoResult.status === "fulfilled") {
      seo = seoResult.value;
    } else {
      console.error(
        `[our-work/${slugNorm}] Failed to build Yoast SEO graph:`,
        seoResult.reason
      );
    }
    if (portfolioResult.status === "fulfilled") {
      portfolioTitle =
        portfolioResult.value.data?.portfolio?.title?.trim() || slugNorm;
    } else {
      console.error(
        `[our-work/${slugNorm}] Failed to fetch portfolio breadcrumb title:`,
        portfolioResult.reason
      );
    }
  }
  const path = `/our-work/${slugNorm}/`;
  const jsonLd = buildDynamicAeoJsonLd({
    seo,
    path,
    pageTitle: portfolioTitle,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Our Work", path: "/our-work/" },
      { name: portfolioTitle, path },
    ],
  });

  return (
    <>
      {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
      {await renderPortfolioDetailPage(slugNorm)}
    </>
  );
}
