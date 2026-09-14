import { buildDynamicAeoJsonLd, type AeoFaqItem } from "@/app/lib/aeo-schema";
import type { YoastSeo } from "@/app/lib/home-seo-api";

type LandingPageJsonLdInput = {
  /** Route path with leading and trailing slash, e.g. "/fmcg/". */
  path: string;
  /** Human-readable page name used for the WebPage and breadcrumb, e.g. "FMCG". */
  pageTitle: string;
  /** Page FAQ items (AccordionItem[] is structurally compatible). */
  faqs?: AeoFaqItem[] | null;
  /** Yoast SEO payload when available — prefers Yoast schema, fills gaps with AEO. */
  seo?: YoastSeo | null;
};

/**
 * AEO/JSON-LD graph for landing pages.
 * When Yoast SEO is present, merges Yoast schema with Organization / FAQ enrichments.
 */
export function buildLandingPageJsonLd({
  path,
  pageTitle,
  faqs,
  seo = null,
}: LandingPageJsonLdInput): string {
  const title = pageTitle.trim();

  return buildDynamicAeoJsonLd({
    seo,
    path,
    pageTitle: title,
    faqs,
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: title, path },
    ],
  });
}
