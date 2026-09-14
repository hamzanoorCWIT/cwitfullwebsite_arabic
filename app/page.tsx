import type { Metadata } from "next";
import Hero from "@/app/components/sections/Hero";
import Showcase from "@/app/components/sections/Showcase";
import FigmaHomeOffers from "@/app/components/sections/FigmaHomeOffers";
import Studios from "@/app/components/sections/Studios";
import FigmaHomeOurWork from "@/app/components/sections/FigmaHomeOurWork";
import GenAI from "@/app/components/sections/GenAI";
import Blogs from "@/app/components/sections/blogs";
import Accordion from "@/app/components/sections/Accordion";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import { fetchHomePage, getHomePageFields } from "@/app/lib/home-api";
import { fetchBlogPosts, type BlogPostNode } from "@/app/lib/blog-api";
import { fetchHomeSeo } from "@/app/lib/home-seo-api";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";
import { resolveHomeOffers } from "@/app/lib/home-offers";
import type { HomeOffersData } from "@/app/lib/home-offers-types";
import {
  normalizeHero,
  normalizeShowcase,
  normalizeStudios,
  normalizeGenai,
  normalizeAccordion,
  resolveHomeBlogs,
  resolveHomeOurWork,
  normalizeOurClients,
  normalizeHomeTestimonials,
} from "@/app/lib/home-normalize";
import styles from "./home-page.module.css";
import { SECTION_HEADING_CLASS } from "@/app/components/sections/section-heading";
import { resolveRequestLocale } from "@/app/lib/locale-server";
const figmaSectionHeading = SECTION_HEADING_CLASS;
export const dynamic = "force-dynamic";
export const revalidate = 0;

type HomePageProps = {
  searchParams?: Promise<{ lang?: string }>;
};

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  try {
    const params = searchParams ? await searchParams : {};
    const locale = await resolveRequestLocale(params.lang);
    const seo = await fetchHomeSeo(locale);
    return yoastSeoToMetadata(seo);
  } catch (error) {
    console.error("[home] Failed to generate Yoast metadata:", error);
    return {};
  }
}

export default async function Home({ searchParams }: HomePageProps = {}) {
  const params = searchParams ? await searchParams : {};
  const locale = await resolveRequestLocale(params.lang);

  let seo: Awaited<ReturnType<typeof fetchHomeSeo>> = null;
  try {
    seo = await fetchHomeSeo(locale);
  } catch (error) {
    console.error("[home] Failed to fetch Yoast SEO graph:", error);
    seo = null;
  }

  let fields: ReturnType<typeof getHomePageFields> = null;

  let allBlogPosts: Array<BlogPostNode | null> = [];

  try {

    const [response, postsRes] = await Promise.all([
      fetchHomePage(locale),
      fetchBlogPosts(100, locale),
    ]);
    fields = response.data ? getHomePageFields(response.data) : null;
    allBlogPosts = postsRes.data?.posts?.nodes ?? [];
  } catch {
    fields = null;
    allBlogPosts = [];
  }

  let heroProps: ReturnType<typeof normalizeHero>;
  let showcaseProps: ReturnType<typeof normalizeShowcase>;
  let studiosProps: ReturnType<typeof normalizeStudios>;
  let genaiProps: ReturnType<typeof normalizeGenai>;
  let ourWorkProps: Awaited<ReturnType<typeof resolveHomeOurWork>>;
  let blogsProps: Awaited<ReturnType<typeof resolveHomeBlogs>>;
  let accordionProps: ReturnType<typeof normalizeAccordion>;
  let ourClientsProps: ReturnType<typeof normalizeOurClients>;
  let homeTestimonialsProps: ReturnType<typeof normalizeHomeTestimonials>;

  try {
    const f = fields ?? null;
    heroProps = normalizeHero(f);
    showcaseProps = normalizeShowcase(f);
    studiosProps = normalizeStudios(f);
    genaiProps = normalizeGenai(f);
    ourWorkProps = await resolveHomeOurWork(f, locale);
    blogsProps = await resolveHomeBlogs(f, allBlogPosts, locale);
    accordionProps = normalizeAccordion(f);
    ourClientsProps = normalizeOurClients(f);
    homeTestimonialsProps = normalizeHomeTestimonials(f);
  } catch {
    const f = null;
    heroProps = normalizeHero(f);
    showcaseProps = normalizeShowcase(f);
    studiosProps = normalizeStudios(f);
    genaiProps = normalizeGenai(f);
    ourWorkProps = await resolveHomeOurWork(f, locale);
    blogsProps = await resolveHomeBlogs(f, allBlogPosts, locale);
    accordionProps = normalizeAccordion(f);
    ourClientsProps = normalizeOurClients(f);
    homeTestimonialsProps = normalizeHomeTestimonials(f);
  }

  const jsonLd = buildDynamicAeoJsonLd({
    seo,
    path: "/",
    pageTitle: "CWIT",
    faqs: accordionProps.items,
  });
  let offers: HomeOffersData = {
    heading: "",
    description: "",
    ctaText: "",
    ctaLink: "",
    columns: [],
  };
  try {
    offers = await resolveHomeOffers(fields, locale);
  } catch (error) {
    console.error("[home] Failed to resolve Selected Expertise cards:", error);
  }

  return (
    <main className="min-h-screen">
      {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
      <Hero {...heroProps} />
      {(showcaseProps.headline?.trim() ||
        showcaseProps.description?.trim() ||
        showcaseProps.cards?.length ||
        showcaseProps.beforeImageSrc?.trim() ||
        showcaseProps.logoImageSrc?.trim()) && (
          <Showcase {...showcaseProps} figmaLayout />
        )}
      {studiosProps.studios.length > 0 && <Studios {...studiosProps} />}
      <FigmaHomeOffers
        offers={offers}
        clientLogos={ourClientsProps.logos}
        testimonials={homeTestimonialsProps.testimonials}
      />
      {ourWorkProps.items?.length ? <FigmaHomeOurWork {...ourWorkProps} /> : null}
      {(genaiProps.heading || genaiProps.paragraph || genaiProps.videoSrc) && (
        <GenAI {...genaiProps} />
      )}
      {blogsProps.items.length > 0 ? (
        <Blogs {...blogsProps} isCarousel figmaLayout className={styles.blogs} />
      ) : null}
      {accordionProps.items?.length ? (
        <Accordion
          {...accordionProps}
          className={styles.faq}
          titleClassName={`${figmaSectionHeading} mb-8 sm:mb-10 md:mb-12 lg:mb-14 text-white`}
        />
      ) : null}
    </main>
  );
}
