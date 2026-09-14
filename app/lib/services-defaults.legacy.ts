/**
 * ARCHIVED hardcoded Services fallbacks — NOT imported by the app for content.
 * Layout placement for CMS cards lives in `services-card-layout-presets.ts`.
 * Kept for reference if we ever need the old static copy.
 */


import type { ShowcaseCard } from "@/app/components/sections/ServicesShowcase";
import type { SolutionItem } from "@/app/components/sections/FullScaleSolutions";
import { STUDIO_ROUTES } from "@/app/lib/studio-routes";
import type { MappableWorkItem } from "@/app/lib/our-work-map";

export type ServicesStudioKey = "digital" | "application" | "growth" | "ai";

export type ServicesTitleLayout =
  | "highlight_block"
  | "highlight_amp_block"
  | "highlight_inline";

export type ServicesStudioDefault = {
  studioKey: ServicesStudioKey;
  titleLayout: ServicesTitleLayout;
  titleHighlight: string;
  titleRemainder: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  cards: ShowcaseCard[];
};

export const SERVICES_BANNER_DEFAULT = {
  title: "Our Services",
  subtitle: "Digital Experiences That Inspire and Perform",
  description:
    "ClearWave brings together strategy, design, development, AI, and growth to create digital experiences that perform across web, mobile, and emerging platforms. From website design and web development in Dubai to mobile apps, e-commerce platforms, branding, SEO, and automation, our services are built around what modern businesses need to launch, scale, and stay relevant.",
};

export const SERVICES_STUDIO_DEFAULTS: ServicesStudioDefault[] = [
  {
    studioKey: "digital",
    titleLayout: "highlight_block",
    titleHighlight: "Digital",
    titleRemainder: "Experience Studio",
    description:
      "Every memorable digital journey begins with understanding people. We combine strategy, design, and technology to create websites and digital experiences that build trust, strengthen brands, and support lasting business growth.",
    ctaText: "View More",
    ctaLink: STUDIO_ROUTES.digitalExperience,
    cards: [
      {
        title: "Website Design & Development",
        description: "Every great business deserves a website that people remember.",
        image: "/imgs/digital-card-1.svg",
        imageFit: "contain",
        imagePosition: "bottom-right",
        imageClassName:
          "max-lg:!h-[50%] max-lg:!w-full " +
          "lg:max-[1200px]:!h-[68%] lg:max-[1200px]:!w-[75%] " +
          "min-[1201px]:max-[1480px]:!h-[72%] min-[1201px]:max-[1480px]:!w-[78%] " +
          "min-[1481px]:!h-[74%] min-[1481px]:!w-[82%]",
        backgroundImage: "/imgs/digital-card-bg.png",
        tall: true,
      },
      {
        title: "Ecommerce Solutions",
        description: "Shopping online should feel effortless from the first product to the final payment.",
        image: "/imgs/digital-card-2.png",
        imageFit: "contain",
        imagePosition: "left",
        imageClassName:
          "max-lg:!h-[50%] max-lg:!w-full " +
          "lg:max-[1200px]:!h-[52%] lg:max-[1200px]:!w-[70%] " +
          "min-[1201px]:max-[1480px]:!h-[60%] min-[1201px]:max-[1480px]:!w-[74%] " +
          "min-[1481px]:!h-[290px] min-[1481px]:!w-[68%]",
        contentPosition: "center-right",
        contentClassName:
          "lg:max-[1200px]:!w-[54%] lg:max-[1200px]:!items-start lg:max-[1200px]:!text-left lg:max-[1200px]:!z-20 " +
          "min-[1201px]:max-[1480px]:!w-[52%] min-[1201px]:max-[1480px]:!items-start min-[1201px]:max-[1480px]:!text-left min-[1201px]:max-[1480px]:!z-20",
        backgroundImage: "/imgs/digital-card-2-bg.png",
      },
      {
        title: "CMS & Integrations",
        description: "Content should be simple to manage, powerful enough to grow.",
        image: "/imgs/digital-card-3-new.png",
        imageHeight: 259.83,
        imageFit: "contain",
        imagePosition: "top-left",
        contentPosition: "center-right",
        contentClassName: "lg:w-[60%] lg:translate-x-4",
        gradient: "linear-gradient(270deg, #BF2378 0%, #D4579B 100%)",
      },
      {
        title: "UI/UX, Design System",
        description: "Great digital experiences begin long before someone clicks a button.",
        image: "/imgs/digital-card-4.svg",
        imageFit: "contain",
        imagePosition: "center",
        imageClassName:
          "max-lg:!w-full max-lg:!bottom-0 max-lg:!top-auto max-lg:!translate-x-0 max-lg:!translate-y-0 [&_img]:max-lg:object-contain " +
          "max-md:!h-[52%] md:max-lg:!h-[58%] " +
          "lg:max-[1200px]:!h-[58%] lg:max-[1200px]:!w-[88%] " +
          "min-[1201px]:max-[1480px]:!h-[62%] min-[1201px]:max-[1480px]:!w-[92%] " +
          "min-[1481px]:!h-[62%] min-[1481px]:!w-[95%]",
        backgroundImage: "/imgs/digital-card-4-bg.jpg",
        tall: true,
      },
    ],
  },
  {
    studioKey: "application",
    titleLayout: "highlight_block",
    titleHighlight: "Digital",
    titleRemainder: "Products Studio",
    description:
      "Digital products should simplify complexity, connect people, and support the way businesses operate. We design and develop scalable platforms that grow with your organisation and adapt as your needs evolve.",
    ctaText: "View More",
    ctaLink: STUDIO_ROUTES.applicationDevelopment,
    cards: [
      {
        title: "Web Application Development",
        description: "The best software doesn't just solve problems. It makes work feel simpler.",
        backgroundImage: "/imgs/application-card-bg.jpg",
        image: "/imgs/application-card-1.png",
        imageFit: "contain",
        imagePosition: "top",
        imageClassName:
          "max-lg:!h-[50%] max-lg:!w-full " +
          "lg:max-[1200px]:!h-[40%] lg:max-[1200px]:!w-[90%] " +
          "min-[1201px]:max-[1480px]:!h-[46%] min-[1201px]:max-[1480px]:!w-[86%] " +
          "min-[1481px]:!h-[58%] min-[1481px]:!w-[84%] min-[1481px]:!max-w-[84%]",
        contentPosition: "bottom-left",
        tall: true,
      },
      {
        title: "Mobile Application Development",
        description: "The most valuable digital experiences are the ones your customers carry every day.",
        image: "/imgs/application-card-2.png",
        imageFit: "contain",
        imagePosition: "bottom",
        backgroundImage: "/imgs/application-card-bg-2.jpg",
        tall: true,
      },
      {
        title: "Enterprise Platforms",
        description: "Business systems should adapt to your organisation, not the other way around.",
        image: "/imgs/application-card-3.png",
        imageFit: "contain",
        imagePosition: "top-left",
        imageClassName:
          "max-lg:!top-0 max-lg:!bottom-auto max-lg:!left-0 max-lg:!right-auto max-lg:!translate-x-0 max-lg:!translate-y-0 [&_img]:max-lg:object-left-top " +
          "max-md:!h-[50%] max-md:!w-[55%] " +
          "md:max-lg:!h-[55%] md:max-lg:!w-[50%] " +
          "lg:!top-0 lg:!bottom-auto lg:!left-0 lg:!right-auto lg:!translate-x-0 lg:!translate-y-0 [&_img]:lg:object-left-top " +
          "lg:max-[1200px]:!h-[52%] lg:max-[1200px]:!w-[70%] " +
          "min-[1201px]:max-[1480px]:!h-[60%] min-[1201px]:max-[1480px]:!w-[74%] " +
          "min-[1481px]:!h-[256px] min-[1481px]:!w-[68%] min-[1481px]:!max-w-[308px]",
        contentPosition: "center-right",
        contentClassName:
          "max-md:!absolute max-md:!left-6 max-md:!right-6 max-md:!bottom-6 max-md:!top-auto max-md:!flex max-md:!w-full max-md:!max-w-full max-md:!flex-col max-md:!items-start max-md:!justify-end max-md:!text-left max-md:!inset-auto max-md:!translate-x-0 max-md:!z-20 " +
          "md:max-lg:!absolute md:max-lg:!left-1/2 md:max-lg:!right-6 md:max-lg:!inset-y-0 md:max-lg:!flex md:max-lg:!w-auto md:max-lg:!max-w-[calc(50%-1.5rem)] md:max-lg:!flex-col md:max-lg:!items-start md:max-lg:!justify-center md:max-lg:!text-left md:max-lg:!translate-x-0 md:max-lg:!translate-y-0 md:max-lg:!inset-auto md:max-lg:!z-20 " +
          "lg:max-[1200px]:!w-[54%] lg:max-[1200px]:!items-start lg:max-[1200px]:!text-left lg:max-[1200px]:!z-20 " +
          "min-[1201px]:max-[1480px]:!w-[52%] min-[1201px]:max-[1480px]:!items-start min-[1201px]:max-[1480px]:!text-left min-[1201px]:max-[1480px]:!z-20",
        gradient: "#000000",
        borderColor: "#585858",
      },
      {
        title: "API & System Integrations",
        description: "The strongest digital ecosystems are the ones that work together.",
        image: "/imgs/application-card-4.png",
        imageFit: "contain",
        imagePosition: "top-left",
        imageClassName:
          "max-lg:!top-0 max-lg:!bottom-auto max-lg:!left-0 max-lg:!right-auto max-lg:!translate-x-0 max-lg:!translate-y-0 [&_img]:max-lg:object-left-top " +
          "max-md:!h-[50%] max-md:!w-[55%] " +
          "md:max-lg:!h-[55%] md:max-lg:!w-[50%] " +
          "lg:!top-0 lg:!bottom-auto lg:!left-0 lg:!right-auto lg:!translate-x-0 lg:!translate-y-0 [&_img]:lg:object-left-top " +
          "lg:max-[1200px]:!h-[52%] lg:max-[1200px]:!w-[70%] " +
          "min-[1201px]:max-[1480px]:!h-[60%] min-[1201px]:max-[1480px]:!w-[74%] " +
          "min-[1481px]:!h-[85%] min-[1481px]:!w-[68%]",
        contentPosition: "center-right",
        contentClassName:
          "max-md:!absolute max-md:!left-6 max-md:!right-6 max-md:!bottom-6 max-md:!top-auto max-md:!flex max-md:!w-full max-md:!max-w-full max-md:!flex-col max-md:!items-start max-md:!justify-end max-md:!text-left max-md:!inset-auto max-md:!translate-x-0 max-md:!z-20 " +
          "md:max-lg:!absolute md:max-lg:!left-1/2 md:max-lg:!right-6 md:max-lg:!inset-y-0 md:max-lg:!flex md:max-lg:!w-auto md:max-lg:!max-w-[calc(50%-1.5rem)] md:max-lg:!flex-col md:max-lg:!items-start md:max-lg:!justify-center md:max-lg:!text-left md:max-lg:!translate-x-0 md:max-lg:!translate-y-0 md:max-lg:!inset-auto md:max-lg:!z-20 " +
          "lg:max-[1200px]:!w-[54%] lg:max-[1200px]:!items-start lg:max-[1200px]:!text-left lg:max-[1200px]:!z-20 " +
          "min-[1201px]:max-[1480px]:!w-[52%] min-[1201px]:max-[1480px]:!items-start min-[1201px]:max-[1480px]:!text-left min-[1201px]:max-[1480px]:!z-20",
        gradient: "#000000",
        boxShadow: "8px 8px 24px rgba(52, 41, 100, 0.28)",
      },
    ],
  },
  {
    studioKey: "growth",
    titleLayout: "highlight_amp_block",
    titleHighlight: "Growth",
    titleRemainder: "Branding Studio",
    description:
      "Growth doesn't happen by chance. It comes from building a memorable brand, increasing visibility, and creating meaningful connections that turn attention into long-term business value.",
    ctaText: "View More",
    ctaLink: STUDIO_ROUTES.growthBranding,
    cards: [
      {
        title: "Search Engine Optimisation",
        description: "The best website in the world means very little if the right people never discover it.",
        image: "/imgs/growth-card-1.png",
        imageFit: "contain",
        imagePosition: "left",
        imageClassName:
          "max-lg:!h-[50%] max-lg:!w-full " +
          "lg:max-[1200px]:!h-[52%] lg:max-[1200px]:!w-[70%] " +
          "min-[1201px]:max-[1480px]:!h-[60%] min-[1201px]:max-[1480px]:!w-[74%] " +
          "min-[1481px]:!h-[85%] min-[1481px]:!w-[68%]",
        contentPosition: "center-right",
        contentClassName:
          "lg:max-[1200px]:!w-[54%] lg:max-[1200px]:!items-start lg:max-[1200px]:!text-left lg:max-[1200px]:!z-20 " +
          "min-[1201px]:max-[1480px]:!w-[52%] min-[1201px]:max-[1480px]:!items-start min-[1201px]:max-[1480px]:!text-left min-[1201px]:max-[1480px]:!z-20",
        backgroundImage: "/imgs/growth-card-bg.png",
      },
      {
        title: "Content Strategy",
        description: "Every successful brand has a story worth sharing.",
        image: "/imgs/digital-card-3-new.png",
        imageFit: "contain",
        imagePosition: "left",
        contentPosition: "center-right",
        backgroundImage: "/imgs/growth-card-bg-2.png",
      },
      {
        title: "Branding, Identity & Strategy",
        description: "A memorable brand is built long before a logo is recognised.",
        image: "/imgs/growth-card-2.png",
        imageFit: "contain",
        imagePosition: "bottom-right",
        imageClassName:
          "max-lg:!h-[50%] max-lg:!w-full " +
          "lg:max-[1200px]:!h-[64%] lg:max-[1200px]:!w-[78%] " +
          "min-[1201px]:max-[1480px]:!h-[68%] min-[1201px]:max-[1480px]:!w-[82%] " +
          "min-[1481px]:!h-[68%] min-[1481px]:!w-[82%]",
        backgroundImage: "/imgs/growth-card-bg-3.png",
        tall: true,
      },
      {
        title: "Digital Marketing",
        description: "Growth is meaningful only when it can be measured.",
        image: "/imgs/growth-card-3.png",
        imageFit: "contain",
        imagePosition: "bottom",
        imageClassName:
          "max-lg:!w-full max-lg:!bottom-0 max-lg:!top-auto max-lg:!translate-x-0 max-lg:!translate-y-0 [&_img]:max-lg:object-contain " +
          "max-md:!h-[52%] md:max-lg:!h-[58%] " +
          "lg:max-[1200px]:!h-[78%] lg:max-[1200px]:!w-[92%] " +
          "min-[1201px]:max-[1480px]:!h-[82%] min-[1201px]:max-[1480px]:!w-[95%] " +
          "min-[1481px]:!h-[82%] min-[1481px]:!w-[95%]",
        gradient: "#000000",
        contentPosition: "top-left",
        tall: true,
      },
    ],
  },
  {
    studioKey: "ai",
    titleLayout: "highlight_inline",
    titleHighlight: "AI",
    titleRemainder: "& Intelligent Systems",
    description:
      "Artificial intelligence is changing how businesses work. We help organisations adopt it with purpose, creating intelligent systems that improve efficiency, enhance experiences, and support better decision-making.",
    ctaText: "View More",
    ctaLink: STUDIO_ROUTES.aiAndThings,
    cards: [
      {
        title: "AI Agents",
        description: "Tomorrow's businesses won't work harder. They'll work smarter with intelligent systems.",
        descriptionMaxWidth: 192,
        image: "/imgs/ai-card-1.png",
        imageFit: "contain",
        imagePosition: "bottom-right",
        imageClassName:
          "max-md:!h-[50%] max-md:!w-full max-md:!left-0 max-md:!right-auto max-md:!bottom-0 max-md:!top-auto max-md:!translate-x-0 max-md:!translate-y-0 " +
          "md:max-lg:!left-1/2 md:max-lg:!right-auto md:max-lg:!bottom-0 md:max-lg:!top-auto md:max-lg:!-translate-x-1/2 md:max-lg:!translate-y-0 md:max-lg:!h-[55%] md:max-lg:!w-[72%] [&_img]:md:max-lg:object-bottom " +
          "lg:max-[1200px]:!h-[58%] lg:max-[1200px]:!w-[48%] lg:max-[1200px]:!right-4 lg:max-[1200px]:!left-auto lg:max-[1200px]:!translate-x-0 " +
          "min-[1201px]:max-[1480px]:!h-[65%] min-[1201px]:max-[1480px]:!w-[50%] min-[1201px]:max-[1480px]:!right-6 min-[1201px]:max-[1480px]:!left-auto " +
          "min-[1481px]:!h-[78%] min-[1481px]:!w-[46%] min-[1481px]:!max-w-[46%] min-[1481px]:!right-10 min-[1481px]:!left-auto",
        contentClassName:
          "md:max-lg:!absolute md:max-lg:!left-6 md:max-lg:!right-auto md:max-lg:!inset-y-0 md:max-lg:!flex md:max-lg:!w-full md:max-lg:!max-w-[420px] md:max-lg:!flex-col md:max-lg:!items-start md:max-lg:!justify-center md:max-lg:!text-left md:max-lg:!inset-x-auto md:max-lg:!translate-x-0 md:max-lg:!translate-y-0 md:max-lg:!mt-0 md:max-lg:!z-20 " +
          "lg:max-[1200px]:!mt-[48px] lg:max-[1200px]:!max-w-[58%] lg:max-[1200px]:!z-20 " +
          "min-[1201px]:max-[1480px]:!mt-[64px] min-[1201px]:max-[1480px]:!max-w-[52%] min-[1201px]:max-[1480px]:!z-20 " +
          "min-[1481px]:!mt-[91px]",
        backgroundImage: "/imgs/ai-card-bg.png",
        tall: true,
      },
      {
        title: "Conversational AI",
        description: "Natural conversations create stronger customer relationships.",
        descriptionMaxWidth: 255,
        image: "/imgs/ai-card-2.png",
        imageFit: "contain",
        imagePosition: "bottom-left",
        imageOverflow: true,
        imageClassName:
          "max-md:!h-[50%] max-md:!w-full max-md:!left-0 max-md:!right-auto max-md:!bottom-0 max-md:!top-auto max-md:!translate-x-0 max-md:!translate-y-0 " +
          "md:max-lg:!left-1/2 md:max-lg:!right-auto md:max-lg:!bottom-0 md:max-lg:!top-auto md:max-lg:!-translate-x-1/2 md:max-lg:!translate-y-0 md:max-lg:!h-[55%] md:max-lg:!w-[72%] [&_img]:md:max-lg:object-bottom " +
          "lg:max-[1200px]:!h-[58%] lg:max-[1200px]:!w-[68%] lg:max-[1200px]:!left-4 lg:max-[1200px]:!translate-x-0 " +
          "min-[1201px]:max-[1480px]:!h-[65%] min-[1201px]:max-[1480px]:!w-[72%] min-[1201px]:max-[1480px]:!left-6 " +
          "min-[1481px]:!h-[306px] min-[1481px]:!w-[214px] min-[1481px]:!max-w-[45%] min-[1481px]:!left-8",
        contentPosition: "center-right",
        contentClassName:
          "md:max-lg:!absolute md:max-lg:!left-6 md:max-lg:!right-auto md:max-lg:!inset-y-0 md:max-lg:!flex md:max-lg:!w-full md:max-lg:!max-w-[420px] md:max-lg:!flex-col md:max-lg:!items-start md:max-lg:!justify-center md:max-lg:!text-left md:max-lg:!inset-x-auto md:max-lg:!translate-x-0 md:max-lg:!translate-y-0 md:max-lg:!z-20 " +
          "lg:max-[1200px]:!w-[54%] lg:max-[1200px]:!items-start lg:max-[1200px]:!text-left lg:max-[1200px]:!z-20 " +
          "min-[1201px]:max-[1680px]:!w-[52%] min-[1201px]:max-[1680px]:!items-start min-[1201px]:max-[1680px]:!text-left min-[1201px]:max-[1680px]:!z-20 " +
          "min-[1681px]:!pl-8",
        backgroundImage: "/imgs/ai-card-bg-2.png",
      },
      {
        title: "AI Workflow Automation",
        description: "Reduce repetitive work and give your team more time to create value.",
        descriptionMaxWidth: 285.23,
        image: "/imgs/digital-card-3-new.png",
        imageFit: "contain",
        imagePosition: "left",
        contentPosition: "center-right",
        contentClassName: "lg:-translate-x-8",
        gradient: "linear-gradient(270deg, #23A8BF 0%, #57D4C7 100%)",
      },
      {
        title: "AI Strategy & Consulting",
        description: "Technology creates value only when applied with purpose.",
        descriptionMaxWidth: 273.37,
        image: "/imgs/ai-card-3.png",
        imageFit: "cover",
        imagePosition: "center",
        imageClassName:
          "!overflow-hidden max-lg:!w-full max-lg:!bottom-0 max-lg:!top-auto max-lg:!translate-x-0 max-lg:!translate-y-0 " +
          "max-md:!h-[52%] md:max-lg:!h-[58%] [&_img]:max-lg:object-cover [&_img]:max-lg:object-center " +
          "lg:!inset-0 lg:!top-0 lg:!right-0 lg:!bottom-0 lg:!left-0 lg:!h-full lg:!w-full lg:!max-h-full lg:!max-w-full lg:!overflow-hidden lg:!translate-x-0 lg:!translate-y-0 [&_img]:lg:!h-full [&_img]:lg:!w-full [&_img]:lg:object-cover [&_img]:lg:object-center",
        gradient: "#000000",
        tall: true,
      },
    ],
  },
];

export const SERVICES_SOLUTIONS_DEFAULT = {
  title: "Full Scale of solutions",
  highlight: "solutions",
  items: [
    { type: "label" as const, text: "Web Services" },
    { type: "pill" as const, text: "Corporate Websites" },
    { type: "pill" as const, text: "E-Commerce" },
    { type: "pill" as const, text: "Marketplace" },
    { type: "pill" as const, text: "CRM, CMS" },
    { type: "pill" as const, text: "Product Design" },
    { type: "pill" as const, text: "Wireframes" },
    { type: "pill" as const, text: "User Experience" },
    { type: "pill" as const, text: "Wireframes & User testing" },
    { type: "pill" as const, text: "Landing Page" },
    { type: "label" as const, text: "Development Services" },
    { type: "pill" as const, text: "Mobile App" },
    { type: "pill" as const, text: "Web App" },
    { type: "pill" as const, text: "Custom App" },
    { type: "pill" as const, text: "Android" },
    { type: "pill" as const, text: "Prototyping" },
    { type: "pill" as const, text: "SaaS" },
    { type: "pill" as const, text: "Dashboard" },
    { type: "pill" as const, text: "User flows and journey" },
    { type: "pill" as const, text: "iOS" },
    { type: "pill" as const, text: "Mac OS" },
    { type: "pill" as const, text: "Gamification & Retention" },
    { type: "pill" as const, text: "Back-end Development" },
    { type: "pill" as const, text: "Front-end Development" },
    { type: "pill" as const, text: "IPO Consultancy (digital)" },
    { type: "pill" as const, text: "Shopify Development" },
    { type: "pill" as const, text: "Wordpress Development" },
    { type: "pill" as const, text: "Custom Web Development" },
    { type: "pill" as const, text: "Flutter Development" },
    { type: "pill" as const, text: "Webflow Development" },
    { type: "pill" as const, text: "WooCommerce Development" },
    { type: "pill" as const, text: "React Development" },
    { type: "label" as const, text: "Branding & Identity" },
    { type: "pill" as const, text: "Brand identity" },
    { type: "pill" as const, text: "Voice and tone" },
    { type: "pill" as const, text: "Brand strategy" },
    { type: "pill" as const, text: "Brandbook" },
    { type: "pill" as const, text: "Pitch Deck" },
    { type: "pill" as const, text: "Brand style guides" },
    { type: "pill" as const, text: "Market research & positioning" },
    { type: "pill" as const, text: "Investor Deck" },
    { type: "pill" as const, text: "Product Demo Videos" },
    { type: "label" as const, text: "Growth & Marketing" },
    { type: "pill" as const, text: "AIO" },
    { type: "pill" as const, text: "SEO & SEM" },
    { type: "pill" as const, text: "Logo Design" },
    { type: "pill" as const, text: "Visual identity" },
    { type: "pill" as const, text: "Social Media Assets" },
    { type: "pill" as const, text: "Video Production" },
    { type: "pill" as const, text: "Investor Deck" },
    { type: "pill" as const, text: "Email Marketing" },
    { type: "label" as const, text: "AI and things" },
    { type: "pill" as const, text: "AI Agents" },
    { type: "pill" as const, text: "AI Chat Bots" },
    { type: "pill" as const, text: "AI Chat Assistants" },
    { type: "pill" as const, text: "AI Workflow Enhancemnt" },
    { type: "pill" as const, text: "LLM Development" },
    { type: "pill" as const, text: "AI Dashboards" },
    { type: "pill" as const, text: "AI Integrations" },
    { type: "pill" as const, text: "AI Data processing and reporting" },
  ] satisfies SolutionItem[],
};

export const SERVICES_FAQ_DEFAULT = {
  title: "FAQs",
  items: [
    {
      id: 1,
      title: "What services does ClearWave offer?",
      content:
        "ClearWave offers website design, web development, mobile app development, web application development, e-commerce solutions, UI/UX design, branding, SEO, SEM, AIO, AI automation, system integrations, cloud infrastructure, analytics, and performance marketing services.",
    },
    {
      id: 2,
      title: "Is ClearWave a website design company in Dubai?",
      content:
        "Yes. ClearWave provides website design and web development services in Dubai, while also supporting businesses with mobile applications, web applications, e-commerce platforms, branding, SEO, AI automation, and digital growth services.",
    },
    {
      id: 3,
      title: "Do you build web applications and mobile applications?",
      content:
        "Yes. We design and develop web applications, mobile apps, CRM platforms, CMS solutions, dashboards, and integrated systems tailored to business workflows and customer experiences.",
    },
    {
      id: 4,
      title: "Do you offer AI automation services?",
      content:
        "Yes. We help businesses apply AI through chatbots, AI voice assistants, workflow automation, AI integrations, reporting dashboards, and custom AI solutions designed around practical business needs.",
    },
    {
      id: 5,
      title: "Do you provide SEO, SEM, and AIO services?",
      content:
        "Yes. We provide SEO, SEM, and AIO services focused on search visibility, paid performance, and AI-powered discovery. Our approach combines technical optimisation, content structure, analytics, and campaign performance.",
    },
    {
      id: 6,
      title: "Can you support hosting, cloud infrastructure, and post-launch maintenance?",
      content:
        "Yes. We support hosting, cloud infrastructure, performance monitoring, maintenance, updates, optimisation, and ongoing improvements after launch.",
    },
    {
      id: 7,
      title: "Can you create multilingual websites for Arabic and English audiences?",
      content:
        "Yes. We design and develop multilingual websites with proper structure, right-to-left layout support, and SEO considerations for Arabic and English content.",
    },
    {
      id: 8,
      title: "Do you work with startups as well as established businesses?",
      content:
        "Yes. Our work supports early-stage startups, growing companies, and enterprise-level businesses through flexible engagement models and scalable digital solutions.",
    },
  ],
};

export const SERVICES_FALLBACK_OUR_WORK: MappableWorkItem[] = [
  {
    title: "Whiskas",
    description: "Interactive Cat Game.",
    image: "/imgs/whiskas%20thumb.jpg",
    category: "INTERACTIVE\nGAME",
  },
  {
    title: "M&M's",
    description: "Interactive Brand Experience",
    image: "/imgs/mnms%20thumb.jpg",
    category: "INTERACTIVE\nCAMPAIGN",
  },
  {
    title: "Recycle For Future",
    description: "Sustainable Future Initiative",
    image: "/imgs/Recycle%20for%20future%20thumb.jpg",
    category: "Web Design\nDevelopment",
  },
  {
    title: "Diglossia",
    description: "Brand identity and web experience for a modern language platform.",
    image: "/imgs/Diglossia%20thumn.jpg",
    category: "Web Design\nDevelopment",
  },
  {
    title: "Fashion Forever",
    description: "An e-commerce storefront built to convert and scale.",
    image: "/imgs/Fashion%20forever%20thumnb.jpg",
    category: "E-Commerce",
  },
  {
    title: "Felis Kitchen",
    description: "Playful brand and ordering experience for a pet food startup.",
    image: "/imgs/Felis%20THumb.jpg",
    category: "Branding",
  },
  {
    title: "Luxe Port",
    description: "A premium portfolio site with refined motion and layout.",
    image: "/imgs/Luxe%20port%20thumb.jpg",
    category: "Web Design",
  },
  {
    title: "Media World",
    description: "A content-rich platform with a scalable design system.",
    image: "/imgs/Media%20world%20thumb.jpg",
    category: "Platform",
  },
  {
    title: "Meta Studio",
    description: "An immersive studio site showcasing 3D and interaction.",
    image: "/imgs/Meta%20thumb.jpg",
    category: "Creative",
  },
];

export const STUDIO_KEY_ROUTES: Record<ServicesStudioKey, string> = {
  digital: STUDIO_ROUTES.digitalExperience,
  application: STUDIO_ROUTES.applicationDevelopment,
  growth: STUDIO_ROUTES.growthBranding,
  ai: STUDIO_ROUTES.aiAndThings,
};
