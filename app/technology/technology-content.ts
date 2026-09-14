import beforeGlow from "@/app/assets/imgs/__before.png";
import cwLogo from "@/app/assets/imgs/cwit_logo_2.png";
import type { AppFigmaSectionsContent } from "@/app/components/sections/AppFigmaSections";

export const technologyFigmaContent = {
  beforeImage: beforeGlow,
  logoImage: cwLogo,
  intro: {
    title: "Technology Solutions Company in Saudi Arabia",
    description:
      "We help technology companies build and scale with end-to-end engineering—strategy, design, product, and growth. From SaaS platforms and APIs through cloud architecture, integrations, and analytics, CWIT builds digital systems that ship faster, scale reliably, and create measurable business outcomes.",
    ctaLabel: "Contact us",
  },
  stats: [
    { number: "100+", label: "Digital Solutions Delivered", width: "w-[245px]" },
    { number: "12", label: "Years of Market Experience", width: "w-[248px]" },
    { number: "30+", label: "In-house Team Members", width: "w-[227px]" },
    { number: "99+", label: "Projects Finished", width: "w-[153px]" },
  ],
  industries: {
    title: "Technology Segments We Cater To",
    cards: [
      {
        title: "SaaS & Platforms",
        text: "Building scalable product platforms and interfaces that support fast-growing teams and customers.",
        variant: "on-demand",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/5652554e-1fad-491e-9c86-4117a73aae42.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(48,86,202,0.2)]",
      },
      {
        title: "Startups",
        text: "Launching product-ready MVPs that move quickly from idea to market traction and funding.",
        variant: "ecommerce",
        size: "h-[139px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.479vw,566px)]",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
      {
        title: "Fintech",
        text: "Delivering secure, compliant digital products that build trust for payments and financial services.",
        variant: "restaurant",
        size: "h-[142px] w-[300px] md:h-[clamp(171px,13.88vw,266.5px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cc168c4e-15d0-4261-b0ff-b0fdebb843a5.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(47,77,184,0.2)]",
      },
      {
        title: "Enterprise SaaS",
        text: "Creating platforms and integrations that connect complex enterprise operations across teams.",
        variant: "event",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cb30c4f4-9a46-4e61-b48f-4b6b54fe6c02.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "AI & Data",
        text: "Engineering data platforms and AI-powered features that turn information into product value.",
        variant: "game",
        size: "h-[141px] w-[300px] md:h-[clamp(170px,13.802vw,265px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/ed9724e5-a12e-4782-b260-39084886ca38.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "IT Services",
        text: "Digitizing operations, portals, and service experiences for IT and technology providers.",
        variant: "travel",
        size: "h-[140px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/987108b2-508d-42d1-9aba-bdbc369063db.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
    ],
  },
  whyCards: {
    title: "Technology Solutions Saudi Arabia - Why Opt for CWIT?",
    description:
      "We combine strategy, design, and engineering so product delivery becomes practical and measurable. From discovery and UX through development, cloud, integrations, and growth, CWIT builds technology solutions that ship reliably and scale with your business.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    cards: [
      {
        title: "Product Strategy",
        text: "We align business goals, users, and roadmap before building so every release has a clear purpose.",
        variant: "product",
        bg: "/figma-assets/27607d02-3420-42f0-888d-66a7f3a0a350.png",
        art: "/figma-assets/dc4bb700-df8a-4cf2-b884-d1cfe4af6644.png",
      },
      {
        title: "Platform Engineering",
        text: "We design and build SaaS platforms, APIs, and apps that are maintainable, fast, and ready to scale.",
        variant: "native",
        bg: "/figma-assets/2cd9d504-ec67-441d-bdfe-630965914040.png",
        art: "/figma-assets/c6de75af-8cf8-46aa-8d29-a6c9fe545cb7.png",
      },
      {
        title: "Cloud & Integration",
        text: "We architect cloud infrastructure and connect services so your product stack works as one system.",
        variant: "qa",
        bg: "/figma-assets/9942377e-1306-4e2c-8779-b9e13574b659.png",
        art: "/figma-assets/53bd7706-08b8-496c-a388-59185bf5c295.png",
      },
      {
        title: "Growth & Optimization",
        text: "We refine performance, activation, and retention after launch so your product keeps compounding.",
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
    title: "Technology Digital Solutions in Saudi Arabia",
    description:
      "We help technology brands build product platforms and digital experiences ready for scale.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    image:
      "/figma-assets/67064913-d634-4196-81be-b0b3765990e3.png",
  },
  augmentedSection: {
    title:
      "Technology in Practice: Solutions That Connect Product, Cloud, and Growth",
    description:
      "Technology teams are moving beyond isolated features toward connected platforms that improve developer velocity, reliability, and measurable product outcomes.",
    ctaLabel: "Read Post",
    image:
      "/figma-assets/technology.png",
    imageCrop: "top-offset-gradient",
    posts: [
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Why Product Strategy Should Come Before Features and Scale",
        description:
          "Aligning goals, users, and roadmap first helps teams invest in releases that create lasting product and business value.",
        ctaLabel: "Read Post",
      },
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Cloud Architectures That Make Platforms Scale Reliably",
        description:
          "Designing for scale early turns fragile services into resilient systems that grow with demand and traffic.",
        ctaLabel: "Read Post",
      },
    ],
  },
  process: {
    title: "Our Process",
    cards: [
      {
        title: "Discover",
        text: "We clarify product vision, users, and technical constraints before delivery begins.",
      },
      {
        title: "Build",
        text: "We design and engineer platforms with modern architecture and quality practices.",
      },
      {
        title: "Launch",
        text: "We launch, measure product performance, and iterate with ongoing delivery support.",
      },
    ],
  },
  technologies: {
    title: "Advanced Technologies We Work With",
    cards: [
      {
        title: "Cloud Platforms",
        text: "Scalable cloud architectures that keep products reliable under growth and peak demand.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[16px] top-[26px] md:left-[6.63%] md:top-[9.06%]",
        textClassName:
          "left-[16px] top-[200px] w-[204px] md:left-[6.63%] md:top-[70.17%] md:h-[23.68%] md:w-[82.95%]",
      },
      {
        title: "AI & Automation",
        text: "Intelligent workflows and features that reduce manual work and personalize user experiences.",
        variant: "ai",
        bg: "bg-[#7222dd]",
        image: "/figma-assets/b476ac20-6350-4abb-a8d9-284d91f612a6.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[56px] w-[192px] md:left-[9.17%] md:top-[18.54%] md:w-[85.6%]",
      },
      {
        title: "Web & Mobile Apps",
        text: "Product and internal applications engineered for speed, usability, and long-term maintainability.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
      {
        title: "AR/VR Experiences",
        text: "Immersive experiences that help teams demonstrate products, data, and complex ideas.",
        variant: "ar",
        bg: "bg-[#b351db]",
        image: "/figma-assets/96420064-b6f8-447a-8120-3d5df850ddf3.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.2%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[56px] w-[192px] md:left-[9.2%] md:top-[18.54%] md:w-[81.6%]",
      },
      {
        title: "Data Platforms",
        text: "Connected data layers that turn product and user activity into actionable insight.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[18px] top-[200px] w-[192px] md:left-[7.64%] md:top-[70.17%] md:h-[23.68%] md:w-[81.6%]",
      },
      {
        title: "IoT Solutions",
        text: "Connected device experiences that extend digital products into real-world operations.",
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
        title: "Analytics & Insights",
        text: "Measurement systems that reveal performance, activation, and opportunities for continuous improvement.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
    ],
  },
} satisfies AppFigmaSectionsContent;
