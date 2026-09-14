import type { Metadata } from "next";
import AiFigmaPage from "./AiFigmaPage";
/*
import DigitalExperienceBanner from "@/app/components/sections/DigitalExperienceBanner";
import bannerStyles from "@/app/components/sections/digital-experience-banner-dx.module.css";
import StudioServiceCards, {
  type StudioServiceCard,
} from "@/app/components/sections/StudioServiceCards";
import FigmaHomeOurWork from "@/app/components/sections/FigmaHomeOurWork";
import Accordion from "@/app/components/sections/Accordion";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import {
  applyStudioServiceCardLayoutPresets,
  buildStudioOurWorkItems,
  buildStudioServiceCards,
  fetchStudioPage,
  getStudioOurWorkTitle,
  getStudioPageFields,
  resolveStudioBannerVideoUrl,
} from "@/app/lib/studio-api";
import { mapWorkItemsToHomeOurWork } from "@/app/lib/our-work-map";
import { resolveImageUrl } from "@/app/lib/our-work-api";
import { fetchSeoByPageId, type YoastSeo } from "@/app/lib/home-seo-api";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";
*/
import { fetchSeoByPageId } from "@/app/lib/home-seo-api";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";

export const revalidate = 3600;

/** WP Studio Page (Ai And Things) — same ACF group as other studios. */
const PAGE_ID = 4627;

// const DEFAULT_BANNER_TITLE = "AI & Things";
// const DEFAULT_BANNER_SUBTITLE = "Practical AI for Everyday Business";
// const DEFAULT_BANNER_DESCRIPTION =
//   "We help businesses use AI in ways that are useful, measurable, and connected to real workflows. From AI integrations and assistants to custom tools and automation, our work focuses on reducing manual effort and improving how teams and customers interact with digital systems.";

/* Existing CMS-driven design commented out while the Figma page is active.
function renderBannerTitle(title: string) {
  const explicitParts = title
    .split(/\r?\n|<br\s*\/?>/i)
    .map((part) => part.trim())
    .filter(Boolean);

  const parts =
    explicitParts.length > 1
      ? explicitParts
      : (() => {
          const words = title.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
          if (words.length < 3) return explicitParts;
          const splitIndex = words[1]?.toLowerCase() === "and" || words[1] === "&" ? 2 : 1;
          return [words.slice(0, splitIndex).join(" "), words.slice(splitIndex).join(" ")];
        })();

  if (parts.length <= 1) return <>{title}</>;

  return (
    <>
      {parts.map((part, i) => (
        <span key={`${part}-${i}`}>
          {part}
          {i < parts.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}
*/

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchSeoByPageId(PAGE_ID);
    return yoastSeoToMetadata(seo);
  } catch {
    return {};
  }
}

export default async function AiAndThingsPage() {
  return <AiFigmaPage />;

  /*
  let seo: YoastSeo | null = null;
  try {
    seo = await fetchSeoByPageId(PAGE_ID);
  } catch (error) {
    console.error("[services/ai-and-things] Failed to fetch Yoast SEO:", error);
    seo = null;
  }

  let fields = null;
  try {
    const res = await fetchStudioPage(PAGE_ID);
    fields = getStudioPageFields(res.data);
  } catch {
    fields = null;
  }

  // const bannerTitle = fields?.studioBanner?.bannerTitle?.trim() || DEFAULT_BANNER_TITLE;
  // const bannerSubtitle =
  //   fields?.studioBanner?.bannerSubtitle?.trim() || DEFAULT_BANNER_SUBTITLE;
  // const bannerDescription =
  //   fields?.studioBanner?.bannerDescription?.trim() || DEFAULT_BANNER_DESCRIPTION;
  const bannerTitle = fields?.studioBanner?.bannerTitle?.trim() || "";
  const bannerSubtitle = fields?.studioBanner?.bannerSubtitle?.trim() || "";
  const bannerDescription = fields?.studioBanner?.bannerDescription?.trim() || "";
  const bannerVideoSrc = resolveStudioBannerVideoUrl(fields?.studioBanner);
  const bannerBgUrl = fields?.studioBanner?.bannerBackgroundImage?.node?.sourceUrl;
  const resolvedBannerBg = bannerBgUrl ? resolveImageUrl(bannerBgUrl) : undefined;
  const hasBanner =
    Boolean(bannerTitle) ||
    Boolean(bannerSubtitle) ||
    Boolean(bannerDescription) ||
    Boolean(bannerVideoSrc) ||
    Boolean(resolvedBannerBg);

  const accordionTitle = fields?.studioAccordionTitle || "";
  const accordionItems = fields?.studioAccordionItems?.length
    ? fields.studioAccordionItems.map((item, i) => ({
        id: i + 1,
        title: item.faqTitle || "",
        content: item.faqContent || "",
      }))
    : undefined;
  const jsonLd = buildDynamicAeoJsonLd({
    seo,
    path: "/services/ai-and-things/",
    pageTitle: bannerTitle || "AI & Things",
    faqs: accordionItems,
  });

  const ourWorkTitle = getStudioOurWorkTitle(fields) || "";
  const ourWorkItems = mapWorkItemsToHomeOurWork(buildStudioOurWorkItems(fields));

  const cmsServiceCards = buildStudioServiceCards(fields);
  // Design layout presets — CMS content/media wins; fills empty layout fields.
  const aiCardLayoutPresets: Partial<StudioServiceCard>[] = [
    {
      contentMaxWidth: 665,
      imagePosition: "right",
    },
    {
      imageHeight: 680,
      imageClassName: "lg:pl-[88.63px]",
      contentMaxWidth: 665,
      imagePosition: "left",
    },
    {
      imageWidth: 1290,
      imageHeight: 1090,
      imageVAlign: "center",
      contentMaxWidth: 665,
      gradient: "linear-gradient(135deg, #2FB8A8 0%, #1C6E66 100%)",
      imagePosition: "left",
    },
    {
      imageWidth: 843,
      imageHeight: 843,
      contentMaxWidth: 665,
      borderColor: "#868686",
      gradient: "#000000",
      imagePosition: "right",
    },
  ];
  // const defaultStudioDetailCards: StudioServiceCard[] = [
  //   {
  //     title: "AI Agents",
  //     description:
  //       "We develop custom AI agents that support customers, automate tasks, access business knowledge, and improve day-to-day operations.",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/ai-card-1-new.png",
  //     contentMaxWidth: 665,
  //     backgroundImage: "/imgs/ai-card-bg.png",
  //     imagePosition: "right",
  //   },
  //   {
  //     title: "Conversational AI",
  //     description:
  //       "We build AI assistants that communicate naturally across websites, messaging platforms, and internal systems while delivering consistent customer experiences.",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/ai-card-2.png",
  //     imageHeight: 680,
  //     imageClassName: "lg:pl-[88.63px]",
  //     contentMaxWidth: 665,
  //     backgroundImage: "/imgs/ai-card-bg-2.png",
  //     imagePosition: "left",
  //   },
  //   {
  //     title: "AI Strategy & Consulting",
  //     description:
  //       "We help businesses identify AI opportunities, define practical implementation strategies, and introduce intelligent systems that deliver measurable outcomes.",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/digital-card-3-new.png",
  //     imageWidth: 1290,
  //     imageHeight: 1090,
  //     imageVAlign: "center",
  //     contentMaxWidth: 665,
  //     gradient: "linear-gradient(135deg, #2FB8A8 0%, #1C6E66 100%)",
  //     imagePosition: "left",
  //   },
  //   {
  //     title: "AI Workflow Automation",
  //     description:
  //       "We automate manual processes, approvals, reporting, and operational workflows using intelligent automation tailored to your business.",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/ai-card-3.png",
  //     imageWidth: 843,
  //     imageHeight: 843,
  //     contentMaxWidth: 665,
  //     borderColor: "#868686",
  //     gradient: "#000000",
  //     imagePosition: "right",
  //   },
  // ];
  // const studioDetailCards =
  //   cmsServiceCards.length > 0 ? cmsServiceCards : defaultStudioDetailCards;
  const studioDetailCards = applyStudioServiceCardLayoutPresets(
    cmsServiceCards,
    aiCardLayoutPresets
  );

  return (
    <main className="min-h-screen">
      {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
      {hasBanner && (
        <DigitalExperienceBanner
          className={`${bannerStyles.dxBanner} relative z-[1]`}
          title={renderBannerTitle(bannerTitle)}
          subtitle={bannerSubtitle}
          description={bannerDescription}
          descriptionClassName="max-w-[1264px]"
          videoSrc={bannerVideoSrc}
          videoPosition="top-right"
          backgroundImage={
            resolvedBannerBg ? { src: resolvedBannerBg, alt: "Background" } : undefined
          }
        />
      )}
      <StudioServiceCards cards={studioDetailCards} overlapBanner={hasBanner} />
      {ourWorkItems.length > 0 && (
        <FigmaHomeOurWork titleOverride={ourWorkTitle} items={ourWorkItems} />
      )}
      {accordionItems && accordionItems.length > 0 && (
        <Accordion title={accordionTitle} items={accordionItems} />
      )}
    </main>
  );
  */
}
