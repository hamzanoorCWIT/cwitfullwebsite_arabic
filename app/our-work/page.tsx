import JsonLdScript from "@/app/components/seo/JsonLdScript";
import { fetchSeoByUri, type YoastSeo } from "@/app/lib/home-seo-api";
import {
  fetchOurWorkListingPage,
  OUR_WORK_LISTING_VARIABLES,
  type OurWorkListingPage,
} from "@/app/lib/our-work-api";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";
import { normalizeOurWorkPageData } from "@/app/our-work/our-work-normalize";
import OurWorkListingClient from "./OurWorkListingClient";

export const revalidate = 3600;

export default async function OurWorkPage() {
  let seo: YoastSeo | null = null;
  let initialData: OurWorkListingPage | null = null;

  const [seoResult, listingResult] = await Promise.allSettled([
    fetchSeoByUri(OUR_WORK_LISTING_VARIABLES.uri),
    fetchOurWorkListingPage(),
  ]);
  if (seoResult.status === "fulfilled") seo = seoResult.value;
  else console.error("[our-work] Failed to fetch Yoast SEO:", seoResult.reason);
  if (listingResult.status === "fulfilled") {
    initialData = listingResult.value.data ?? null;
  } else console.error("[our-work] Failed to fetch listing content:", listingResult.reason);

  const normalized = normalizeOurWorkPageData(initialData);
  const jsonLd = buildDynamicAeoJsonLd({
    seo,
    path: "/our-work/",
    pageTitle: normalized.banner.title || "Our Work",
    faqs: normalized.accordion.items,
  });

  return (
    <>
      {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
      <OurWorkListingClient initialData={initialData} />
    </>
  );
}
