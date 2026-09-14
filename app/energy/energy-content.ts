import beforeGlow from "@/app/assets/imgs/__before.png";
import cwLogo from "@/app/assets/imgs/cwit_logo_2.png";
import type { AppFigmaSectionsContent } from "@/app/components/sections/AppFigmaSections";

export const energyFigmaContent = {
  beforeImage: beforeGlow,
  logoImage: cwLogo,
  intro: {
    title: "Energy Digital Solutions Company in Saudi Arabia",
    description:
      "We help energy and utility organizations modernize with end-to-end digital solutions—strategy, design, engineering, and growth. From customer portals and field apps through monitoring dashboards, integrations, and analytics, CWIT builds digital systems that improve operations, safety, and measurable business outcomes.",
    ctaLabel: "Contact us",
  },
  stats: [
    { number: "100+", label: "Digital Solutions Delivered", width: "w-[245px]" },
    { number: "12", label: "Years of Market Experience", width: "w-[248px]" },
    { number: "30+", label: "In-house Team Members", width: "w-[227px]" },
    { number: "99+", label: "Projects Finished", width: "w-[153px]" },
  ],
  industries: {
    title: "Energy Segments We Cater To",
    cards: [
      {
        title: "Oil & Gas",
        text: "Building digital platforms that support complex operations, assets, and field teams across sites.",
        variant: "on-demand",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/5652554e-1fad-491e-9c86-4117a73aae42.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(48,86,202,0.2)]",
      },
      {
        title: "Renewables",
        text: "Launching monitoring and customer experiences that make clean energy easy to track and manage.",
        variant: "ecommerce",
        size: "h-[139px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.479vw,566px)]",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
      {
        title: "Utilities",
        text: "Delivering clear, accessible customer portals and self-service tools that reduce support load.",
        variant: "restaurant",
        size: "h-[142px] w-[300px] md:h-[clamp(171px,13.88vw,266.5px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cc168c4e-15d0-4261-b0ff-b0fdebb843a5.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(47,77,184,0.2)]",
      },
      {
        title: "Power & Grid",
        text: "Creating dashboards and control experiences that connect generation, distribution, and demand.",
        variant: "event",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cb30c4f4-9a46-4e61-b48f-4b6b54fe6c02.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "Cleantech",
        text: "Engineering product platforms and data tools built for sustainability and efficiency at scale.",
        variant: "game",
        size: "h-[141px] w-[300px] md:h-[clamp(170px,13.802vw,265px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/ed9724e5-a12e-4782-b260-39084886ca38.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "Field Services",
        text: "Digitizing inspections, work orders, and service experiences for energy field operations.",
        variant: "travel",
        size: "h-[140px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/987108b2-508d-42d1-9aba-bdbc369063db.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
    ],
  },
  whyCards: {
    title: "Energy Digital Solutions Saudi Arabia - Why Opt for CWIT?",
    description:
      "We combine strategy, design, and engineering so energy modernization becomes practical and measurable. From discovery and UX through development, integrations, and analytics, CWIT builds digital solutions that improve operations, safety, and how customers and teams work.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    cards: [
      {
        title: "Digital Strategy",
        text: "We align business goals, operations, and customers before building so every solution has a clear purpose.",
        variant: "product",
        bg: "/figma-assets/27607d02-3420-42f0-888d-66a7f3a0a350.png",
        art: "/figma-assets/dc4bb700-df8a-4cf2-b884-d1cfe4af6644.png",
      },
      {
        title: "Platform Engineering",
        text: "We design and build portals, apps, and dashboards that are secure, fast, and ready to scale.",
        variant: "native",
        bg: "/figma-assets/2cd9d504-ec67-441d-bdfe-630965914040.png",
        art: "/figma-assets/c6de75af-8cf8-46aa-8d29-a6c9fe545cb7.png",
      },
      {
        title: "Systems Integration",
        text: "We connect SCADA, ERP, CRM, and IoT data so your operations stack works as one system.",
        variant: "qa",
        bg: "/figma-assets/9942377e-1306-4e2c-8779-b9e13574b659.png",
        art: "/figma-assets/53bd7706-08b8-496c-a388-59185bf5c295.png",
      },
      {
        title: "Growth & Optimization",
        text: "We refine performance, reliability, and customer experience after launch so value keeps compounding.",
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
    title: "Energy Digital Solutions in Saudi Arabia",
    description:
      "We help energy organizations go digital with platforms that improve operations, engagement, and service delivery.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    image:
      "/figma-assets/67064913-d634-4196-81be-b0b3765990e3.png",
  },
  augmentedSection: {
    title:
      "Energy in Practice: Digital Solutions That Connect Operations, Data, and Customers",
    description:
      "Energy and utility organizations are moving beyond isolated systems toward connected digital platforms that improve operations, safety, and customer experience.",
    ctaLabel: "Read Post",
    image:
      "/figma-assets/energy.png",
    imageCrop: "top-offset-gradient",
    posts: [
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Why Digital Strategy Should Come Before Systems and Dashboards",
        description:
          "Aligning goals, operations, and customers first helps teams invest in solutions that create lasting operational value.",
        ctaLabel: "Read Post",
      },
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Integrations That Make Energy Operations Work as One System",
        description:
          "Connecting SCADA, ERP, and IoT data turns fragmented systems into a coherent platform for reliability and growth.",
        ctaLabel: "Read Post",
      },
    ],
  },
  process: {
    title: "Our Process",
    cards: [
      {
        title: "Discover",
        text: "We map operational and customer priorities into a practical digital roadmap.",
      },
      {
        title: "Build",
        text: "We design and develop platforms, portals, and integrations matched to energy workflows.",
      },
      {
        title: "Launch",
        text: "We launch, monitor adoption, and refine systems for reliability and growth.",
      },
    ],
  },
  technologies: {
    title: "Advanced Technologies We Work With",
    cards: [
      {
        title: "Cloud Platforms",
        text: "Scalable cloud architectures that keep energy systems reliable under load and peak demand.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[16px] top-[26px] md:left-[6.63%] md:top-[9.06%]",
        textClassName:
          "left-[16px] top-[200px] w-[204px] md:left-[6.63%] md:top-[70.17%] md:h-[23.68%] md:w-[82.95%]",
      },
      {
        title: "AI & Automation",
        text: "Intelligent workflows and forecasting that reduce manual work and optimize energy operations.",
        variant: "ai",
        bg: "bg-[#7222dd]",
        image: "/figma-assets/b476ac20-6350-4abb-a8d9-284d91f612a6.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[56px] w-[192px] md:left-[9.17%] md:top-[18.54%] md:w-[85.6%]",
      },
      {
        title: "Web & Mobile Apps",
        text: "Customer portals and field applications engineered for speed, usability, and reliability.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
      {
        title: "AR/VR Experiences",
        text: "Immersive experiences for training, inspections, and demonstrating complex energy assets.",
        variant: "ar",
        bg: "bg-[#b351db]",
        image: "/figma-assets/96420064-b6f8-447a-8120-3d5df850ddf3.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.2%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[56px] w-[192px] md:left-[9.2%] md:top-[18.54%] md:w-[81.6%]",
      },
      {
        title: "Data Platforms",
        text: "Connected data layers that turn operations and sensor activity into actionable insight.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[18px] top-[200px] w-[192px] md:left-[7.64%] md:top-[70.17%] md:h-[23.68%] md:w-[81.6%]",
      },
      {
        title: "IoT & Sensors",
        text: "Connected device experiences that extend monitoring and control into real-world operations.",
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
        text: "Measurement systems that reveal performance, efficiency, and opportunities for continuous improvement.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
    ],
  },
} satisfies AppFigmaSectionsContent;
