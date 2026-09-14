import "server-only";
import { fetchOurWorkListingPage } from "@/app/lib/our-work-api";
import { normalizeOurWorkPageData } from "@/app/our-work/our-work-normalize";
import type { HomeOurWorkItem } from "@/app/lib/home-normalize";

const MAX_ITEMS = 12;

/**
 * "Our Work" carousel items for the service/industry landing pages, sourced
 * from the same curated selection the /our-work listing page renders
 * (Our Work page → Work Items). Kept in sync so the landing carousel always
 * reflects whatever is published on the Our Work page.
 */
export async function fetchLandingOurWorkItems(): Promise<HomeOurWorkItem[]> {
  try {
    const res = await fetchOurWorkListingPage();
    const { workItems } = normalizeOurWorkPageData(res.data ?? null);

    return workItems.slice(0, MAX_ITEMS).map((item) => ({
      title: item.title,
      image: typeof item.image === "string" ? item.image : "",
      description: item.description?.trim() || undefined,
      subtitle: item.category?.trim() || undefined,
      link: item.link,
    }));
  } catch (error) {
    console.error("[landing-our-work] Failed to fetch Our Work listing:", error);
    return [];
  }
}
