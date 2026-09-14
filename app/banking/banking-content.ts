import beforeGlow from "@/app/assets/imgs/__before.png";
import cwLogo from "@/app/assets/imgs/cwit_logo_2.png";
import type { AppFigmaSectionsContent } from "@/app/components/sections/AppFigmaSections";

export const bankingFigmaContent = {
  beforeImage: beforeGlow,
  logoImage: cwLogo,
  intro: {
    title: "Banking Digital Solutions Company in Saudi Arabia",
    description:
      "We help banks, fintechs, and financial institutions go digital with platforms that build trust, streamline journeys, and support secure growth. From banking websites and customer portals through onboarding, payments, and product experiences, CWIT builds digital solutions designed for clarity, compliance, and conversion.",
    ctaLabel: "Contact us",
  },
  stats: [
    { number: "100+", label: "Banking Experiences Delivered", width: "w-[245px]" },
    { number: "12", label: "Years of Market Experience", width: "w-[248px]" },
    { number: "30+", label: "In-house Team Members", width: "w-[227px]" },
    { number: "99+", label: "Projects Finished", width: "w-[153px]" },
  ],
  industries: {
    title: "Banking Industries We Cater To",
    cards: [
      {
        title: "Retail Banking",
        text: "Building customer journeys for accounts, cards, and everyday banking that feel clear and trustworthy.",
        variant: "on-demand",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/5652554e-1fad-491e-9c86-4117a73aae42.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(48,86,202,0.2)]",
      },
      {
        title: "Digital Banks",
        text: "Creating mobile-first banking experiences with onboarding, product discovery, and self-serve flows.",
        variant: "ecommerce",
        size: "h-[139px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.479vw,566px)]",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
      {
        title: "Wealth Management",
        text: "Delivering advisory and portfolio experiences that communicate value with clarity and confidence.",
        variant: "restaurant",
        size: "h-[142px] w-[300px] md:h-[clamp(171px,13.88vw,266.5px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cc168c4e-15d0-4261-b0ff-b0fdebb843a5.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(47,77,184,0.2)]",
      },
      {
        title: "Corporate Banking",
        text: "Supporting business banking portals and service journeys for corporate clients and treasury teams.",
        variant: "event",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cb30c4f4-9a46-4e61-b48f-4b6b54fe6c02.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "Fintech",
        text: "Building product platforms for payments, lending, and financial services startups ready to scale.",
        variant: "game",
        size: "h-[141px] w-[300px] md:h-[clamp(170px,13.802vw,265px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/ed9724e5-a12e-4782-b260-39084886ca38.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "Insurance",
        text: "Designing policy discovery, quotes, and claims journeys that reduce friction for customers.",
        variant: "travel",
        size: "h-[140px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/987108b2-508d-42d1-9aba-bdbc369063db.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
    ],
  },
  whyCards: {
    title: "Banking Digital Solutions Saudi Arabia - Why Opt for CWIT?",
    description:
      "We combine financial UX, secure engineering, and product strategy so banking brands earn trust and convert with confidence. From websites and portals through onboarding, payments, and customer journeys, CWIT builds digital systems that feel clear, reliable, and ready to scale.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    cards: [
      {
        title: "Customer Journeys",
        text: "We design banking journeys for discovery, onboarding, and self-serve that feel simple and trustworthy.",
        variant: "product",
        bg: "/figma-assets/27607d02-3420-42f0-888d-66a7f3a0a350.png",
        art: "/figma-assets/dc4bb700-df8a-4cf2-b884-d1cfe4af6644.png",
      },
      {
        title: "Secure Portals",
        text: "We build customer and business portals with access control, reliability, and clear service workflows.",
        variant: "native",
        bg: "/figma-assets/2cd9d504-ec67-441d-bdfe-630965914040.png",
        art: "/figma-assets/c6de75af-8cf8-46aa-8d29-a6c9fe545cb7.png",
      },
      {
        title: "Compliance-Ready UX",
        text: "We shape experiences that support disclosure, consent, and operational requirements without adding friction.",
        variant: "qa",
        bg: "/figma-assets/9942377e-1306-4e2c-8779-b9e13574b659.png",
        art: "/figma-assets/53bd7706-08b8-496c-a388-59185bf5c295.png",
      },
      {
        title: "Financial Products",
        text: "We craft product pages and digital funnels that communicate value clearly and drive qualified applications.",
        variant: "ui",
        bg: "/figma-assets/27607d02-3420-42f0-888d-66a7f3a0a350.png",
        art: "/figma-assets/276dbfe3-ebd5-434c-ad1f-0b44abda8fda.png",
        foreground:
          "/figma-assets/36ac6298-db2f-41fb-b58b-65265e3abdaf.png",
        exact: "/figma-assets/1a4fda07-8f89-45cb-a12c-4077cdc66a64.png",
      },
    ],
  },
  whyFullImage: {
    title: "Banking Digital Solutions in Saudi Arabia",
    description:
      "We help banks and fintechs go digital with platforms that build trust, streamline journeys, and support secure growth.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    image:
      "/figma-assets/67064913-d634-4196-81be-b0b3765990e3.png",
  },
  augmentedSection: {
    title:
      "Digital Banking Experiences: Building Trust Across Onboarding and Everyday Journeys",
    description:
      "Banks and fintechs are redesigning product discovery, KYC, and self-serve flows so customers can act with clarity while institutions maintain security and compliance.",
    ctaLabel: "Read Post",
    image:
      "/figma-assets/9ee5f61e-ef78-49ce-acba-0195caa8f9cd.png",
    imageCrop: "bottom-offset",
    posts: [
      {
        date: "FEBRUARY 8, 2024",
        title:
          "How Modern Banking Portals Balance Security With Everyday Usability",
        description:
          "Access control, clear verification, and reliable service workflows help customers manage money without unnecessary friction.",
        ctaLabel: "Read Post",
      },
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Why Product Pages Still Drive Qualified Applications in Financial Services",
        description:
          "Clear value communication and conversion-focused funnels remain essential for cards, accounts, and lending products.",
        ctaLabel: "Read Post",
      },
    ],
  },
  process: {
    title: "Our Process",
    cards: [
      {
        title: "Discover",
        text: "We clarify product, compliance, and customer-journey priorities before build begins.",
      },
      {
        title: "Build",
        text: "We design and develop portals, onboarding, and product experiences with security in mind.",
      },
      {
        title: "Launch",
        text: "We launch, measure funnel performance, and refine journeys for trust and conversion.",
      },
    ],
  },
  technologies: {
    title: "Advanced Technologies We Work With",
    cards: [
      {
        title: "Digital Banking",
        text: "Customer-facing banking platforms for accounts, cards, and self-serve financial services.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[16px] top-[26px] md:left-[6.63%] md:top-[9.06%]",
        textClassName:
          "left-[16px] top-[200px] w-[204px] md:left-[6.63%] md:top-[70.17%] md:h-[23.68%] md:w-[82.95%]",
      },
      {
        title: "AI Fraud Detection",
        text: "Intelligent monitoring support that helps teams spot risk patterns and protect customer accounts.",
        variant: "ai",
        bg: "bg-[#7222dd]",
        image: "/figma-assets/b476ac20-6350-4abb-a8d9-284d91f612a6.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[56px] w-[192px] md:left-[9.17%] md:top-[18.54%] md:w-[85.6%]",
      },
      {
        title: "Payments & Transfers",
        text: "Secure payment and transfer experiences designed for clarity, speed, and customer confidence.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
      {
        title: "Open Banking APIs",
        text: "API-driven integrations that connect banking products with partners and third-party services.",
        variant: "ar",
        bg: "bg-[#b351db]",
        image: "/figma-assets/96420064-b6f8-447a-8120-3d5df850ddf3.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.2%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[56px] w-[192px] md:left-[9.2%] md:top-[18.54%] md:w-[81.6%]",
      },
      {
        title: "Mobile Banking",
        text: "Native-quality mobile banking apps for everyday money management and product engagement.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[18px] top-[200px] w-[192px] md:left-[7.64%] md:top-[70.17%] md:h-[23.68%] md:w-[81.6%]",
      },
      {
        title: "KYC & Onboarding",
        text: "Digital onboarding flows that balance identity checks with a smooth first-time customer experience.",
        variant: "metaverse",
        bg: "bg-[#01062c]",
        baseImage:
          "/figma-assets/1096bc0a-302e-4e97-b867-87cc1ddcaf69.png",
        image:
          "/figma-assets/915c23e7-6ff4-4cf4-b8e5-69867ee64547.png",
        titleClassName: "left-[19px] top-[26px] md:left-[8.04%] md:top-[9.06%]",
        textClassName:
          "left-[19px] top-[56px] w-[196px] md:left-[8.04%] md:top-[18.54%] md:w-[81.6%]",
      },
      {
        title: "Finance Analytics",
        text: "Dashboards that reveal funnel performance, product demand, and digital channel opportunities.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
    ],
  },
} satisfies AppFigmaSectionsContent;
