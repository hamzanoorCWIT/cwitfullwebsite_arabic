import type { Metadata } from "next";
import DigitalExperienceBanner from "@/app/components/sections/DigitalExperienceBanner";
import bannerStyles from "@/app/components/sections/digital-experience-banner-dx.module.css";
// import DigitalExperienceServices from "@/app/components/sections/DigitalExperienceServices";
// import BackgroundImageSection from "../components/ui/BackgroundImageSection";
// import ServiceDetailSection from "../components/sections/ServiceDetailSection";
import StudioServiceCards, {
  type StudioServiceCard,
} from "@/app/components/sections/StudioServiceCards";
import FigmaHomeOurWork from "@/app/components/sections/FigmaHomeOurWork";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import Accordion from "@/app/components/sections/Accordion";
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

const PAGE_ID = 738;

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchSeoByPageId(PAGE_ID);
    return yoastSeoToMetadata(seo);
  } catch {
    return {};
  }
}

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

export default async function GrowthBrandingStudioPage() {
  let seo: YoastSeo | null = null;
  try {
    seo = await fetchSeoByPageId(PAGE_ID);
  } catch (error) {
    console.error(
      "[services/growth-branding-studio] Failed to fetch Yoast SEO:",
      error
    );
    seo = null;
  }

  let fields = null;
  try {
    const res = await fetchStudioPage(PAGE_ID);
    fields = getStudioPageFields(res.data);
  } catch {
    fields = null;
  }

  const bannerTitle = fields?.studioBanner?.bannerTitle?.trim() || "";
  // const bannerSubtitle =
  //   fields?.studioBanner?.bannerSubtitle?.trim() ||
  //   "Building Brands That Grow Digitally";
  // const bannerDescription =
  //   fields?.studioBanner?.bannerDescription?.trim() ||
  //   "We help businesses build stronger brands, improve visibility, and turn digital activity into measurable growth. From SEO and campaigns to identity, analytics, and reporting, our work connects brand clarity with performance.";
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
    path: "/services/growth-branding-studio/",
    pageTitle: bannerTitle || "Growth & Branding Studio",
    faqs: accordionItems,
  });

  const ourWorkTitle = getStudioOurWorkTitle(fields) || "";
  const ourWorkItems = mapWorkItemsToHomeOurWork(buildStudioOurWorkItems(fields));

  const cmsServiceCards = buildStudioServiceCards(fields);
  // Design layout presets — CMS content/media wins; fills empty layout fields.
  const growthCardLayoutPresets: Partial<StudioServiceCard>[] = [
    {
      imageHeight: 716,
      contentMaxWidth: 665,
      imagePosition: "left",
    },
    {
      imageHeight: 750,
      imageVAlign: "center",
      contentMaxWidth: 665,
      imagePosition: "left",
    },
    {
      imageHeight: 843,
      contentMaxWidth: 665,
      gradient: "#97106594",
      imagePosition: "right",
    },
    {
      contentMaxWidth: 665,
      borderColor: "#868686",
      imagePosition: "right",
    },
  ];
  // const defaultStudioDetailCards: StudioServiceCard[] = [
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "Search Engine Optimisation",
  //     description:
  //       "Our SEO strategies improve visibility through technical optimisation, quality content, and sustainable organic growth, helping your business get found when it matters most.",
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/growth-card-1-new.png",
  //     imageHeight: 716,
  //     contentMaxWidth: 665,
  //     backgroundImage: "/imgs/growth-card-bg.png",
  //     imagePosition: "left",
  //   },
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "Content Strategy",
  //     description:
  //       "We create strategic content that supports SEO, strengthens your brand, and communicates naturally with both people and AI-powered search.",
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/digital-card-3.png",
  //     imageHeight: 750,
  //     imageVAlign: "center",
  //     contentMaxWidth: 665,
  //     backgroundImage: "/imgs/growth-card-bg-2-new.png",
  //     imagePosition: "left",
  //   },
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "Branding, Identity & Strategy",
  //     description:
  //       "We create brand identities and strategies that communicate clearly, build trust, and leave lasting impressions across every customer touchpoint.",
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/growth-card-2-new.png",
  //     imageHeight: 843,
  //     contentMaxWidth: 665,
  //     // backgroundImage: "/imgs/growth-card-bg-3.png",
  //     gradient: "#97106594",
  //     imagePosition: "right",
  //   },
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "Digital Marketing",
  //     description:
  //       "We combine creativity, analytics, and continuous optimisation to attract qualified audiences and improve marketing performance.",
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     // image: "/imgs/growth-card-3.png",
  //     contentMaxWidth: 665,
  //     backgroundImage: "/imgs/growth-card-3-bg.png",
  //     borderColor: "#868686",
  //     // gradient: "#000000",
  //     imagePosition: "right",
  //   },
  // ];
  // const studioDetailCards =
  //   cmsServiceCards.length > 0 ? cmsServiceCards : defaultStudioDetailCards;
  const studioDetailCards = applyStudioServiceCardLayoutPresets(
    cmsServiceCards,
    growthCardLayoutPresets
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
          videoSrc={bannerVideoSrc}
          videoPosition="top-right"
          backgroundImage={
            resolvedBannerBg
              ? { src: resolvedBannerBg, alt: "Background" }
              : undefined
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
}
