import type { Metadata } from "next";
import Image from "next/image";

import DigitalExperienceBanner from "@/app/components/sections/DigitalExperienceBanner";
import bannerStyles from "@/app/components/sections/digital-experience-banner-tuned.module.css";
import Showcase from "@/app/components/sections/Showcase";
import FigmaHomeTestimonials from "@/app/components/sections/FigmaHomeTestimonials";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import ScrollReveal from "@/app/components/ui/ScrollReveal";
import {
  ABOUT_US_PAGE_URI,
  fetchAboutUsPage,
  getAboutUsPageFields,
} from "@/app/lib/about-us-api";
import {
  normalizeAboutUsPage,
  resolveAboutContentSource,
} from "@/app/lib/about-us-normalize";
import { fetchHomePage, getHomePageFields } from "@/app/lib/home-api";
import { fetchSeoByUri, type YoastSeo } from "@/app/lib/home-seo-api";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";
import { resolveRequestLocale } from "@/app/lib/locale-server";

import styles from "./about-us.module.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ABOUT_US_METADATA_FALLBACK: Metadata = {
  title: "About Us | CWIT",
  description:
    "CWIT creates digital experiences, products, and systems that move businesses forward.",
};

function applyAboutUsSeoFallbacks(seo: YoastSeo | null): YoastSeo | null {
  if (!seo) return null;

  const fallbackUrl = `${getFrontendSiteUrl().replace(/\/+$/, "")}/about-us/`;

  return {
    ...seo,
    canonical: seo.canonical?.trim() || fallbackUrl,
    opengraphUrl: seo.opengraphUrl?.trim() || fallbackUrl,
  };
}

async function fetchAboutUsSeo(): Promise<YoastSeo | null> {
  try {
    const seo = await fetchSeoByUri(ABOUT_US_PAGE_URI);
    return applyAboutUsSeoFallbacks(seo);
  } catch (error) {
    console.error("[about-us] Failed to fetch Yoast SEO:", error);
    return null;
  }
}

type AboutUsPageProps = {
  searchParams?: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  searchParams,
}: AboutUsPageProps): Promise<Metadata> {
  try {
    const params = searchParams ? await searchParams : {};
    await resolveRequestLocale(params.lang);
    const seo = await fetchAboutUsSeo();
    const metadata = yoastSeoToMetadata(seo);
    if (metadata.title || metadata.description) return metadata;
  } catch {
    // fall through
  }
  return ABOUT_US_METADATA_FALLBACK;
}

export default async function AboutUsPage({ searchParams }: AboutUsPageProps = {}) {
  const params = searchParams ? await searchParams : {};
  const locale = await resolveRequestLocale(params.lang);

  const seo = await fetchAboutUsSeo();
  const jsonLd = buildDynamicAeoJsonLd({
    seo,
    path: "/about-us/",
    pageTitle: "About Us",
  });

  let fields = null;
  try {
    const response = await fetchAboutUsPage(locale);
    fields = getAboutUsPageFields(response);
  } catch {
    fields = null;
  }

  const needsHomeContent =
    resolveAboutContentSource(fields?.aboutTestimonialsSource) === "from_home" ||
    resolveAboutContentSource(fields?.aboutClientLogosSource) === "from_home";

  let homeFields = null;
  if (needsHomeContent) {
    try {
      const homeResponse = await fetchHomePage(locale);
      homeFields = homeResponse.data ? getHomePageFields(homeResponse.data) : null;
    } catch {
      homeFields = null;
    }
  }

  const data = normalizeAboutUsPage(fields, homeFields);

  const hasStory = Boolean(data.story.title || data.story.lead || data.story.body);
  const hasVision = Boolean(data.vision.title || data.vision.text);
  const hasMission = Boolean(data.mission.title || data.mission.text);
  const hasStorySection = hasStory || hasVision || hasMission;
  const hasShowcase = Boolean(data.showcase.cards.length || data.showcase.logoImageSrc);
  const hasPrinciples = Boolean(data.principles.title || data.principles.items.length);
  const hasProof = data.testimonials.length > 0 || data.clientLogos.length > 0;

  return (
    <main className={styles.page}>
      {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
      {(data.hero.title || data.hero.subtitle || data.hero.backgroundImage) && (
        <DigitalExperienceBanner
          title={data.hero.title}
          subtitle={data.hero.subtitle}
          className={`${bannerStyles.tunedBanner} ${styles.banner}`}
          backgroundImage={data.hero.backgroundImage}
        />
      )}

      {hasStorySection ? (
        <section className={styles.storySection} aria-labelledby="about-story-title">
          {hasStory ? (
            <ScrollReveal className={styles.storyInner}>
              {data.story.title ? (
                <h2 id="about-story-title" className={styles.storyTitle}>
                  {data.story.title}
                </h2>
              ) : null}
              {data.story.lead ? <p className={styles.storyLead}>{data.story.lead}</p> : null}
              {data.story.body ? <p className={styles.storyBody}>{data.story.body}</p> : null}
            </ScrollReveal>
          ) : null}

          {hasVision || hasMission ? (
            <ScrollReveal className={styles.visionMission}>
              {hasVision ? (
                <div className={styles.vision}>
                  {data.vision.title ? (
                    <h3 className={styles.splitTitle}>{data.vision.title}</h3>
                  ) : null}
                  {data.vision.text ? (
                    <p className={styles.splitText}>{data.vision.text}</p>
                  ) : null}
                </div>
              ) : null}
              {hasMission ? (
                <div className={styles.mission}>
                  {data.mission.title ? (
                    <h3 className={styles.splitTitle}>{data.mission.title}</h3>
                  ) : null}
                  {data.mission.text ? (
                    <p className={styles.splitText}>{data.mission.text}</p>
                  ) : null}
                </div>
              ) : null}
            </ScrollReveal>
          ) : null}
        </section>
      ) : null}

      {hasShowcase ? (
        <div className={styles.showcaseWrap}>
          <Showcase
            figmaLayout
            cards={data.showcase.cards}
            logoImageSrc={data.showcase.logoImageSrc}
          />
        </div>
      ) : null}

      {hasPrinciples ? (
        <section className={styles.principles} aria-labelledby="about-principles-title">
          <div className={styles.principlesInner}>
            {data.principles.title ? (
              <div className={styles.principlesSticky}>
                <h2 id="about-principles-title" className={styles.principlesTitle}>
                  {data.principles.title}
                </h2>
              </div>
            ) : null}
            {data.principles.items.length > 0 ? (
              <ScrollReveal className={styles.principlesList}>
                {data.principles.items.map((principle, index) => (
                  <article
                    key={`${principle.title}-${index}`}
                    className={styles.principleCard}
                  >
                    {principle.title ? <h3>{principle.title}</h3> : null}
                    {principle.description ? <p>{principle.description}</p> : null}
                  </article>
                ))}
              </ScrollReveal>
            ) : null}
          </div>
        </section>
      ) : null}

      {hasProof ? (
        <section className={styles.proofSection} aria-label="Testimonials and client logos">
          {data.testimonials.length > 0 ? (
            <div className={styles.testimonialBand}>
              <FigmaHomeTestimonials testimonials={data.testimonials} />
            </div>
          ) : null}

          {data.clientLogos.length > 0 ? (
            <div className={styles.logoGridSection} aria-label="Client logos">
              <div className={styles.logoGrid}>
                {data.clientLogos.map((logo, index) => (
                  <div key={`${logo.alt}-${index}`} className={styles.logoItem}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={280}
                      height={140}
                      loading="eager"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}
    </main>
  );
}
