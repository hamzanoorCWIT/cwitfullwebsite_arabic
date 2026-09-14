import type { Metadata } from "next";
import Hero from "@/app/components/sections/Hero";
import Showcase from "@/app/components/sections/Showcase";
import Studios from "@/app/components/sections/Studios";
import GenAI from "@/app/components/sections/GenAI";
import HomeOurWork from "@/app/components/sections/HomeOurWork";
import OurClients from "@/app/components/sections/OurClients";
import Blogs from "@/app/components/sections/blogs";
import Accordion from "@/app/components/sections/Accordion";
import TextSection from "@/app/components/ui/TextSection";
import Image from "next/image";
import { fetchHomePage, getHomePageFields } from "@/app/lib/home-api";
import { fetchBlogPosts, type BlogPostNode } from "@/app/lib/blog-api";
import {
  normalizeHero,
  normalizeShowcase,
  normalizeIntro,
  normalizeStudios,
  normalizeGenai,
  normalizeOurWork,
  normalizeOurClients,
  normalizeBlogs,
  normalizeAccordion,
} from "@/app/lib/home-normalize";
import FullScaleSolutions, { type SolutionItem } from "@/app/components/sections/FullScaleSolutions";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "ClearWave — Previous Home",
  description: "Previous ClearWave home page layout kept for reference and rollback.",
  robots: {
    index: false,
    follow: false,
  },
};

const solutionItems: SolutionItem[] = [
  { type: "label", text: "Web Services" },
  { type: "pill", text: "Corporate Websites" },
  { type: "pill", text: "E-Commerce" },
  { type: "pill", text: "Marketplace" },
  { type: "pill", text: "CRM, CMS" },
  { type: "pill", text: "Product Design" },
  { type: "pill", text: "Wireframes" },
  { type: "pill", text: "User Experience" },
  { type: "pill", text: "Wireframes & User testing" },
  { type: "pill", text: "Landing Page" },
  { type: "label", text: "Development Services" },
  { type: "pill", text: "Mobile App" },
  { type: "pill", text: "Web App" },
  { type: "pill", text: "Custom App" },
  { type: "pill", text: "Android" },
  { type: "pill", text: "Prototyping" },
  { type: "pill", text: "SaaS" },
  { type: "pill", text: "Dashboard" },
  { type: "pill", text: "User flows and journey" },
  { type: "pill", text: "iOS" },
  { type: "pill", text: "Mac OS" },
  { type: "pill", text: "Gamification & Retention" },
  { type: "pill", text: "Back-end Development" },
  { type: "pill", text: "Front-end Development" },
  { type: "pill", text: "IPO Consultancy (digital)" },
  { type: "pill", text: "Shopify Development" },
  { type: "pill", text: "Wordpress Development" },
  { type: "pill", text: "Custom Web Development" },
  { type: "pill", text: "Flutter Development" },
  { type: "pill", text: "Webflow Development" },
  { type: "pill", text: "WooCommerce Development" },
  { type: "pill", text: "React Development" },
  { type: "label", text: "Branding & Identity" },
  { type: "pill", text: "Brand identity" },
  { type: "pill", text: "Voice and tone" },
  { type: "pill", text: "Brand strategy" },
  { type: "pill", text: "Brandbook" },
  { type: "pill", text: "Pitch Deck" },
  { type: "pill", text: "Brand style guides" },
  { type: "pill", text: "Market research & positioning" },
  { type: "pill", text: "Investor Deck" },
  { type: "pill", text: "Product Demo Videos" },
  { type: "label", text: "Growth & Marketing" },
  { type: "pill", text: "AIO" },
  { type: "pill", text: "SEO & SEM" },
  { type: "pill", text: "Logo Design" },
  { type: "pill", text: "Visual identity" },
  { type: "pill", text: "Social Media Assets" },
  { type: "pill", text: "Video Production" },
  { type: "pill", text: "Investor Deck" },
  { type: "pill", text: "Email Marketing" },
  { type: "label", text: "AI and things" },
  { type: "pill", text: "AI Agents" },
  { type: "pill", text: "AI Chat Bots" },
  { type: "pill", text: "AI Chat Assistants" },
  { type: "pill", text: "AI Workflow Enhancemnt" },
  { type: "pill", text: "LLM Development" },
  { type: "pill", text: "AI Dashboards" },
  { type: "pill", text: "AI Integrations" },
  { type: "pill", text: "AI Data processing and reporting" },
];

export default async function LegacyHomePage() {
  let fields: ReturnType<typeof getHomePageFields> = null;
  let allBlogPosts: Array<BlogPostNode | null> = [];
  try {
    const [res, postsRes] = await Promise.all([fetchHomePage(), fetchBlogPosts()]);
    fields = res.data ? getHomePageFields(res.data) : null;
    allBlogPosts = postsRes.data?.posts?.nodes ?? [];
  } catch {
    fields = null;
    allBlogPosts = [];
  }

  let heroProps: ReturnType<typeof normalizeHero>;
  let showcaseProps: ReturnType<typeof normalizeShowcase>;
  let introProps: ReturnType<typeof normalizeIntro>;
  let studiosProps: ReturnType<typeof normalizeStudios>;
  let genaiProps: ReturnType<typeof normalizeGenai>;
  let ourWorkProps: ReturnType<typeof normalizeOurWork>;
  let ourClientsProps: ReturnType<typeof normalizeOurClients>;
  let blogsProps: ReturnType<typeof normalizeBlogs>;
  let accordionProps: ReturnType<typeof normalizeAccordion>;

  try {
    const f = fields ?? null;
    heroProps = normalizeHero(f);
    showcaseProps = normalizeShowcase(f);
    introProps = normalizeIntro(f);
    studiosProps = normalizeStudios(f);
    genaiProps = normalizeGenai(f);
    ourWorkProps = normalizeOurWork(f);
    ourClientsProps = normalizeOurClients(f);
    blogsProps = normalizeBlogs(f, allBlogPosts);
    accordionProps = normalizeAccordion(f);
  } catch {
    const f = null;
    heroProps = normalizeHero(f);
    showcaseProps = normalizeShowcase(f);
    introProps = normalizeIntro(f);
    studiosProps = normalizeStudios(f);
    genaiProps = normalizeGenai(f);
    ourWorkProps = normalizeOurWork(f);
    ourClientsProps = normalizeOurClients(f);
    blogsProps = normalizeBlogs(f, allBlogPosts);
    accordionProps = normalizeAccordion(f);
  }

  const introBgSrc = introProps.backgroundImageSrc;

  return (
    <main className="min-h-screen">
      <Hero {...heroProps} />
      {(showcaseProps.headline?.trim() ||
        showcaseProps.cards?.length ||
        showcaseProps.beforeImageSrc?.trim() ||
        showcaseProps.logoImageSrc?.trim()) && <Showcase {...showcaseProps} />}
      {introProps.paragraphs.length > 0 && (
        <div className="relative">
          {introBgSrc ? (
            <div
              className="absolute right-0 z-50 pointer-events-none"
              style={{ top: "-200px" }}
            >
              <Image
                src={introBgSrc}
                alt=""
                className="w-auto h-auto"
                unoptimized
                width={800}
                height={600}
              />
            </div>
          ) : null}
          <TextSection
            paragraphs={introProps.paragraphs}
            className="relative z-10 container mx-auto md:my-30 my-20 md:px-0 px-4 global-section-padding"
          />
        </div>
      )}
      {studiosProps.studios.length > 0 && <Studios {...studiosProps} />}
      {(genaiProps.heading || genaiProps.paragraph || genaiProps.videoSrc) && <GenAI {...genaiProps} />}
      {ourWorkProps.items?.length ? <HomeOurWork {...ourWorkProps} /> : null}
      {ourClientsProps.logoSrc?.trim() ? <OurClients {...ourClientsProps} /> : null}
      {blogsProps.items.length > 0 && <Blogs {...blogsProps} isCarousel={true} />}
      <FullScaleSolutions
        title={
          <>
            Full Scale of{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{
                backgroundImage: "url('/imgs/digital-word-bg.png')",
                backgroundSize: "cover",
                backgroundPosition: "center-left",
                backgroundRepeat: "no-repeat",
              }}
            >
              solutions
            </span>
          </>
        }
        items={solutionItems}
      />
      {accordionProps.items?.length ? <Accordion {...accordionProps} /> : null}
    </main>
  );
}
