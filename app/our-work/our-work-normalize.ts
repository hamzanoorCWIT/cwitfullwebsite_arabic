import type { OurWorkListingPage } from "@/app/lib/our-work-api";
import {
  resolveImageUrl,
  resolveMediaVideoUrl,
} from "@/app/lib/our-work-api";
import { mapPortfoliosToOurWorkListingItems } from "@/app/lib/portfolio-listing-card-map";
import type { OurWorkPageItem } from "@/app/our-work/our-work-types";
import type { AccordionItem } from "@/app/components/sections/Accordion";

const EMPTY_BANNER = {
  title: "",
  description: "",
  backgroundImage: { src: "" as string, alt: "" as string },
  videoSrc: undefined as string | undefined,
};

function getRawWorkItems(rawWorkList: unknown): unknown[] {
  if (Array.isArray(rawWorkList)) return rawWorkList.filter(Boolean);
  if (rawWorkList && typeof rawWorkList === "object") {
    if ("nodes" in rawWorkList && Array.isArray((rawWorkList as { nodes: unknown[] }).nodes)) {
      return (rawWorkList as { nodes: unknown[] }).nodes.filter(Boolean);
    }
    if ("edges" in rawWorkList && Array.isArray((rawWorkList as { edges: { node: unknown }[] }).edges)) {
      return (rawWorkList as { edges: { node: unknown }[] }).edges.map((e) => e?.node).filter(Boolean);
    }
  }
  return [];
}

export function normalizeOurWorkPageData(
  data: OurWorkListingPage | null
): {
  banner: typeof EMPTY_BANNER;
  workItems: OurWorkPageItem[];
  accordion: { title: string; items: AccordionItem[] };
} {
  if (!data?.page?.ourWorkPageFields) {
    return {
      banner: EMPTY_BANNER,
      workItems: [],
      accordion: { title: "", items: [] },
    };
  }

  const fields = data.page.ourWorkPageFields;
  const bannerSection = fields.ourWorkBannerSection;
  const workSection = fields.workItemsSection;
  const accordionSection = fields.accordionSection;

  const bannerTitle = bannerSection?.bannerTitle?.trim() || "";
  const bannerDescription = bannerSection?.bannerDescription?.trim() || "";
  const bgNode = bannerSection?.bannerBackgroundImage?.node;
  const rawBannerBg =
    bgNode?.sourceUrl?.trim() || bgNode?.mediaItemUrl?.trim() || "";
  const resolvedBannerBg = rawBannerBg
    ? resolveImageUrl(rawBannerBg) ?? rawBannerBg
    : "";
  const bannerBackgroundImage = resolvedBannerBg
    ? {
        src: resolvedBannerBg,
        alt: bgNode?.altText?.trim() || "Background",
      }
    : { src: "", alt: "" };
  const bannerVideo =
    resolveMediaVideoUrl(bannerSection?.bannerVideoUrl) ??
    resolveMediaVideoUrl(bannerSection?.bannerVideo);

  const rawWorkItems = getRawWorkItems(workSection?.workItems);
  const workItems = mapPortfoliosToOurWorkListingItems(
    rawWorkItems as Array<{
      slug?: string | null;
      title?: string | null;
      portfolioDetails?: unknown;
    }>
  );

  const accordionTitle = accordionSection?.accordionTitle?.trim() || "";
  const rawList = accordionSection?.accordionItems;
  const rawAccordionItems = Array.isArray(rawList)
    ? rawList
    : rawList &&
        typeof rawList === "object" &&
        "nodes" in rawList &&
        Array.isArray((rawList as { nodes: unknown[] }).nodes)
      ? (rawList as { nodes: unknown[] }).nodes
      : [];

  const accordionItems: AccordionItem[] =
    rawAccordionItems.length > 0
      ? rawAccordionItems.map((a, i) => {
          const item = a as Record<string, unknown> | null | undefined;
          const title =
            (typeof item?.faqTitle === "string" ? item.faqTitle : "")?.trim() ?? "";
          const content =
            (typeof item?.faqContent === "string" ? item.faqContent : "")?.trim() ??
            "";
          return {
            id: i + 1,
            title: title || "",
            content: content || "",
          };
        })
      : [];

  return {
    banner: {
      title: bannerTitle,
      description: bannerDescription,
      backgroundImage: bannerBackgroundImage,
      videoSrc: bannerVideo,
    },
    workItems,
    accordion: { title: accordionTitle, items: accordionItems },
  };
}
