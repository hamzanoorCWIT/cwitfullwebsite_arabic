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

const PAGE_ID = 734;

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

// const DEFAULT_BANNER_SUBTITLE = "Digital Experiences That Inspire and Perform";
// const DEFAULT_BANNER_DESCRIPTION =
//   "We design websites, interfaces, and digital journeys that feel clear, intuitive, and built around real user behaviour. From first impression to final interaction, every detail is shaped to support trust, usability, and long-term performance.";

export default async function DigitalExperienceStudioPages() {
  let seo: YoastSeo | null = null;
  try {
    seo = await fetchSeoByPageId(PAGE_ID);
  } catch (error) {
    console.error(
      "[services/digital-experience-studio] Failed to fetch Yoast SEO:",
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
  //   fields?.studioBanner?.bannerSubtitle?.trim() || DEFAULT_BANNER_SUBTITLE;
  // const bannerDescription =
  //   fields?.studioBanner?.bannerDescription?.trim() || DEFAULT_BANNER_DESCRIPTION;
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
    path: "/services/digital-experience-studio/",
    pageTitle: bannerTitle || "Digital Experience Studio",
    faqs: accordionItems,
  });

  const ourWorkTitle = getStudioOurWorkTitle(fields) || "";
  const ourWorkItems = mapWorkItemsToHomeOurWork(buildStudioOurWorkItems(fields));

  const cmsServiceCards = buildStudioServiceCards(fields);
  // Design layout presets (image size/position) — CMS content/media still wins.
  // Used when WP Service Cards leave Image Width/Height/Position empty.
  const digitalCardLayoutPresets: Partial<StudioServiceCard>[] = [
    {
      imageWidth: 820.45,
      imageHeight: 549.69,
      contentMaxWidth: 665,
      imagePosition: "right",
    },
    {
      imageWidth: 987,
      imageHeight: 782,
      contentMaxWidth: 665,
      gradient: "linear-gradient(135deg, #4F46E5 0%, #2E2A8F 100%)",
      imagePosition: "left",
    },
    {
      imageWidth: 1290,
      imageHeight: 1090,
      contentMaxWidth: 665,
      imageVAlign: "center",
      imagePosition: "left",
    },
    {
      imageWidth: 1239,
      contentMaxWidth: 665,
      overlayImageWidth: 1114.54,
      overlayImageHeight: 927.1,
      contentVAlign: "center",
      imagePosition: "right",
    },
  ];
  // Design defaults when CMS Service Cards are empty.
  // const defaultStudioDetailCards: StudioServiceCard[] = [
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "Website Design & Development",
  //     description:
  //       "We design and develop custom websites that balance beautiful design with performance, usability, and scalability. Every website is built around your business objectives, helping visitors become customers while creating a strong foundation for future growth.",
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/digital-card-1-new.png",
  //     imageWidth: 820.45,
  //     imageHeight: 549.69,
  //     contentMaxWidth: 665,
  //     backgroundImage: "/imgs/digital-card-bg.png",
  //     imagePosition: "right",
  //   },
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "Ecommerce Solutions",
  //     description:
  //       "From boutique online stores to enterprise ecommerce platforms, we build secure, scalable shopping experiences that increase conversions while making day-to-day management simple for your team.",
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/digital-card-2-new.png",
  //     imageWidth: 987,
  //     imageHeight: 782,
  //     contentMaxWidth: 665,
  //     backgroundImage: "/imgs/digital-card-2-bg.png",
  //     gradient: "linear-gradient(135deg, #4F46E5 0%, #2E2A8F 100%)",
  //     imagePosition: "left",
  //   },
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "CMS & Integrations",
  //     description:
  //       "Whether it's WordPress, a headless CMS, or a custom content platform, we build flexible systems and integrate the tools your business relies on to keep everything connected.",
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/digital-card-3-new.png",
  //     imageWidth: 1290,
  //     imageHeight: 1090,
  //     contentMaxWidth: 665,
  //     imageVAlign: "center",
  //     backgroundImage: "/imgs/digital-card-3-bg.png",
  //     imagePosition: "left",
  //   },
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "UI/UX, Design System",
  //     description:
  //       "Thoughtful user experience and interface design transform complex interactions into intuitive journeys. We create interfaces that are accessible, engaging, and designed around the way people naturally browse, interact, and make decisions.",
  //     contentMaxWidth: 665,
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/digital-card-4-new.png",
  //     imageWidth: 1239,
  //     overlayImage: "/imgs/digtial-card-4-overlay.png",
  //     overlayImageWidth: 1114.54,
  //     overlayImageHeight: 927.1,
  //     contentVAlign: "center",
  //     backgroundImage: "/imgs/digital-card-4-bg.jpg",
  //     // gradient: "linear-gradient(135deg, #2A2D3A 0%, #15171F 100%)",
  //     imagePosition: "right",
  //   },
  // ];
  // const studioDetailCards =
  //   cmsServiceCards.length > 0 ? cmsServiceCards : defaultStudioDetailCards;
  const studioDetailCards = applyStudioServiceCardLayoutPresets(
    cmsServiceCards,
    digitalCardLayoutPresets
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
      <StudioServiceCards
        cards={studioDetailCards}
        contentOverlapMaxWidth={1620}
        overlapBanner={hasBanner}
      />
      {ourWorkItems.length > 0 && (
        <FigmaHomeOurWork titleOverride={ourWorkTitle} items={ourWorkItems} />
      )}
      {accordionItems && accordionItems.length > 0 && (
        <Accordion title={accordionTitle} items={accordionItems} />
      )}
    </main>
  );
}
