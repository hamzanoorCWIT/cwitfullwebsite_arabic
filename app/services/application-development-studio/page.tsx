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

const PAGE_ID = 736;

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

export default async function ApplicationDevelopmentStudioPage() {
  let seo: YoastSeo | null = null;
  try {
    seo = await fetchSeoByPageId(PAGE_ID);
  } catch (error) {
    console.error(
      "[services/application-development-studio] Failed to fetch Yoast SEO:",
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
  //   "Building Digital Solutions for Growing Businesses";
  // const bannerDescription =
  //   fields?.studioBanner?.bannerDescription?.trim() ||
  //   "We build scalable applications and systems that support real business operations. From mobile apps and e-commerce platforms to web applications, CRM, CMS, and cloud infrastructure, our work is focused on performance, reliability, and long-term usability.";
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
    path: "/services/application-development-studio/",
    pageTitle: bannerTitle || "Application Development Studio",
    faqs: accordionItems,
  });

  const ourWorkTitle = getStudioOurWorkTitle(fields) || "";
  const ourWorkItems = mapWorkItemsToHomeOurWork(buildStudioOurWorkItems(fields));

  const cmsServiceCards = buildStudioServiceCards(fields);
  // Design layout presets — CMS content/media wins; fills empty layout fields.
  const applicationCardLayoutPresets: Partial<StudioServiceCard>[] = [
    {
      contentMaxWidth: 665,
      imagePosition: "right",
    },
    {
      imageHeight: 727,
      contentMaxWidth: 665,
      imagePosition: "right",
    },
    {
      imageHeight: 750,
      imageFit: "cover",
      contentMaxWidth: 665,
      gradient: "#000000",
      imagePosition: "left",
    },
    {
      imageHeight: 750,
      imageFit: "cover",
      contentMaxWidth: 665,
      gradient: "#000000",
      imagePosition: "left",
    },
  ];
  // const defaultStudioDetailCards: StudioServiceCard[] = [
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "Web Application Development",
  //     description:
  //       "We build custom web applications that automate processes, centralise information, and improve collaboration while remaining secure, scalable, and ready for future growth.",
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/application-card-1.png",
  //     contentMaxWidth: 665,
  //     backgroundImage: "/imgs/application-card-bg.jpg",
  //     // gradient: "linear-gradient(135deg, #1C1C20 0%, #0A0A0C 100%)",
  //     imagePosition: "right",
  //   },
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "Mobile Application Development",
  //     description:
  //       "We create intuitive iOS and Android applications that connect businesses with customers and empower teams through seamless mobile experiences.",
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/application-card-2-new.png",
  //     imageHeight: 727,
  //     contentMaxWidth: 665,
  //     backgroundImage: "/imgs/application-card-bg-2.jpg",
  //     // gradient: "linear-gradient(135deg, #2F6BFF 0%, #1E4FD6 100%)",
  //     imagePosition: "right",
  //   },
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "Enterprise Platforms",
  //     description:
  //       "From internal business systems to customer portals, we develop enterprise platforms that improve productivity and support long-term digital transformation.",
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/application-card-3-new.png",
  //     imageHeight: 750,
  //     imageFit: "cover",
  //     contentMaxWidth: 665,
  //     gradient: "#000000",
  //     imagePosition: "left",
  //   },
  //   {
  //     // yearLabel: "YEAR 2020",
  //     title: "API & System Integrations",
  //     description:
  //       "We connect CRMs, ERPs, payment gateways, cloud services, and third-party platforms to create seamless, intelligent business workflows.",
  //     // industryLabel: "INDUSTRY",
  //     // industryValue: "Education",
  //     ctaText: "Get In Touch",
  //     ctaLink: "/contact-us",
  //     image: "/imgs/application-card-4-new.png",
  //     imageHeight: 750,
  //     imageFit: "cover",
  //     contentMaxWidth: 665,
  //     gradient: "#000000",
  //     imagePosition: "left",
  //   },
  // ];
  // const studioDetailCards =
  //   cmsServiceCards.length > 0 ? cmsServiceCards : defaultStudioDetailCards;
  const studioDetailCards = applyStudioServiceCardLayoutPresets(
    cmsServiceCards,
    applicationCardLayoutPresets
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
