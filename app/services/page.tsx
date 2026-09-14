import type { Metadata } from "next";
import type { ReactNode } from "react";
import DigitalExperienceBanner from "@/app/components/sections/DigitalExperienceBanner";
import ServicesShowcase from "@/app/components/sections/ServicesShowcase";
import FigmaHomeOurWork from "@/app/components/sections/FigmaHomeOurWork";
import Accordion from "@/app/components/sections/Accordion";
import FullScaleSolutions from "@/app/components/sections/FullScaleSolutions";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import {
  fetchHomePage,
  getHomePageFields,
} from "@/app/lib/home-api";
import { normalizeOurWork } from "@/app/lib/home-normalize";
import { mapWorkItemsToHomeOurWork } from "@/app/lib/our-work-map";
import {
  fetchServicesPage,
  getServicesPageFields,
  SERVICES_PAGE_URI,
} from "@/app/lib/services-api";
import { normalizeServicesPage } from "@/app/lib/services-normalize";
import type {
  ServicesStudioSection,
  ServicesTitleLayout,
} from "@/app/lib/services-defaults";
import { fetchSeoByUri, type YoastSeo } from "@/app/lib/home-seo-api";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";

export const revalidate = 3600;

const HIGHLIGHT_STYLE = {
  backgroundImage: "url('/imgs/digital-word-bg.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
} as const;

function applyServicesSeoFallbacks(seo: YoastSeo | null): YoastSeo | null {
  if (!seo) return null;

  const fallbackUrl = `${getFrontendSiteUrl().replace(/\/+$/, "")}/services/`;

  return {
    ...seo,
    canonical: seo.canonical?.trim() || fallbackUrl,
    opengraphUrl: seo.opengraphUrl?.trim() || fallbackUrl,
  };
}

async function fetchServicesSeo(): Promise<YoastSeo | null> {
  try {
    const seo = await fetchSeoByUri(SERVICES_PAGE_URI);
    return applyServicesSeoFallbacks(seo);
  } catch (error) {
    console.error("[services] Failed to fetch Yoast SEO:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchServicesSeo();
    return yoastSeoToMetadata(seo);
  } catch {
    return {};
  }
}

function HighlightWord({ children }: { children: ReactNode }) {
  return (
    <span className="bg-clip-text text-transparent" style={HIGHLIGHT_STYLE}>
      {children}
    </span>
  );
}

function renderStudioTitle(studio: ServicesStudioSection): ReactNode {
  const highlight = studio.titleHighlight;
  const remainderLines = studio.titleRemainder
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const layout: ServicesTitleLayout = studio.titleLayout;

  if (!highlight && remainderLines.length === 0) return null;

  if (layout === "highlight_inline") {
    return (
      <>
        {highlight ? <HighlightWord>{highlight}</HighlightWord> : null}
        {highlight ? " " : null}
        {remainderLines.join(" ") || studio.titleRemainder}
      </>
    );
  }

  if (layout === "highlight_amp_block") {
    return (
      <>
        <span className="block">
          {highlight ? <HighlightWord>{highlight}</HighlightWord> : null}
          {highlight ? " &" : "&"}
        </span>
        {remainderLines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </>
    );
  }

  return (
    <>
      {highlight ? (
        <span
          className="block w-fit bg-clip-text text-transparent leading-[1.2] pb-[0.12em]"
          style={HIGHLIGHT_STYLE}
        >
          {highlight}
        </span>
      ) : null}
      {remainderLines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </>
  );
}

function renderSolutionsTitle(title: string, highlight: string): ReactNode {
  if (!title.trim()) return null;
  const trimmedHighlight = highlight.trim();
  if (!trimmedHighlight) return title;

  const index = title.toLowerCase().indexOf(trimmedHighlight.toLowerCase());
  if (index === -1) return title;

  const before = title.slice(0, index);
  const match = title.slice(index, index + trimmedHighlight.length);
  const after = title.slice(index + trimmedHighlight.length);

  return (
    <>
      {before}
      <span
        className="bg-clip-text text-transparent"
        style={{ ...HIGHLIGHT_STYLE, backgroundPosition: "center-left" }}
      >
        {match}
      </span>
      {after}
    </>
  );
}

export default async function ServicesPage() {
  let seo: YoastSeo | null = null;
  try {
    seo = await fetchServicesSeo();
  } catch (error) {
    console.error("[services] Failed to build Yoast SEO graph:", error);
    seo = null;
  }

  let fields = null;
  try {
    const response = await fetchServicesPage();
    fields = getServicesPageFields(response);
    if (response.errors?.length) {
      console.error(
        "[services] GraphQL errors:",
        response.errors.map((error) => error.message).join("; ")
      );
    }
  } catch (error) {
    console.error("[services] Failed to fetch Services page:", error);
    fields = null;
  }

  const data = normalizeServicesPage(fields);
  const jsonLd = buildDynamicAeoJsonLd({
    seo,
    path: "/services/",
    pageTitle: data.banner.title || "Services",
    faqs: fields?.servicesFaqItems?.map((item) => ({
      title: item?.faqTitle,
      content: item?.faqContent,
    })),
  });

  let ourWorkItems: ReturnType<typeof mapWorkItemsToHomeOurWork> = [];
  let ourWorkTitleOverride: string | undefined = data.ourWorkTitleOverride;
  let ourWorkSectionSubtitle: string | undefined;

  if (data.ourWorkUseHome) {
    try {
      const homeRes = await fetchHomePage();
      const ourWorkProps = normalizeOurWork(
        homeRes.data ? getHomePageFields(homeRes.data) : null
      );
      ourWorkItems = ourWorkProps.items ?? [];
      ourWorkTitleOverride = ourWorkProps.titleOverride || data.ourWorkTitleOverride;
      ourWorkSectionSubtitle = ourWorkProps.sectionSubtitle;
    } catch {
      ourWorkItems = [];
    }
  } else {
    // Custom selection: card copy/image from Portfolio → Listing Card tab
    ourWorkItems = mapWorkItemsToHomeOurWork(data.ourWorkCustomItems);
  }

  const solutionsTitle = renderSolutionsTitle(
    data.solutions.title,
    data.solutions.highlight
  );
  const hasBanner = Boolean(
    data.banner.title ||
      data.banner.subtitle ||
      data.banner.description ||
      data.banner.backgroundImage
  );

  return (
    <main className="min-h-screen">
      {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
      {hasBanner ? (
        <DigitalExperienceBanner
          title={data.banner.title}
          subtitle={data.banner.subtitle}
          description={data.banner.description}
          titleClassName="max-md:mt-8"
          className="relative z-[1]"
          backgroundImage={data.banner.backgroundImage}
        />
      ) : null}
      {data.studios.map((studio, index) => (
        <ServicesShowcase
          key={`${studio.studioKey}-${studio.titleHighlight}-${studio.titleRemainder}`}
          title={renderStudioTitle(studio)}
          description={studio.description || undefined}
          ctaText={studio.ctaText}
          ctaLink={studio.ctaLink}
          cards={studio.cards}
          overlapBanner={index === 0 && hasBanner}
          fontClassName="font-inter"
          ctaFontClassName="font-gilroy"
        />
      ))}
      {ourWorkItems.length > 0 ? (
        <FigmaHomeOurWork
          titleOverride={ourWorkTitleOverride}
          sectionSubtitle={ourWorkSectionSubtitle}
          items={ourWorkItems}
        />
      ) : null}
      {data.solutions.items.length > 0 ? (
        <FullScaleSolutions title={solutionsTitle} items={data.solutions.items} />
      ) : null}
      {data.faq.items.length > 0 ? (
        <Accordion title={data.faq.title || undefined} items={data.faq.items} />
      ) : null}
    </main>
  );
}
