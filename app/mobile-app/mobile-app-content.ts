import beforeGlow from "@/app/assets/imgs/__before.png";
import cwLogo from "@/app/assets/imgs/cwit_logo_2.png";
import type { AppFigmaSectionsContent } from "@/app/components/sections/AppFigmaSections";

const copy =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere velit aliquet suscipit volutpat. Curabitur iaculis ornare est. Vivamus eget nisi in turpis convallis tempor. Morbi bibendum velit vel justo tristique dapibus et nec eros. Etiam lacinia, risus et elementum vehicula, justo justo pulvinar nunc, eu auctor massa turpis vel ex.";

export const mobileAppFigmaContent = {
  beforeImage: beforeGlow,
  logoImage: cwLogo,
  intro: {
    title: "Start-to-end Mobile App Development Company Saudi Arabia",
    description: copy,
    ctaLabel: "Contact us",
  },
  stats: [
    { number: "100+", label: "Mobile / Web Applications", width: "w-[245px]" },
    { number: "12", label: "Years of Market Experience", width: "w-[248px]" },
    { number: "30+", label: "In-house Team Members", width: "w-[227px]" },
    { number: "99+", label: "Projects Finished", width: "w-[153px]" },
  ],
  industries: {
    title: "Industries We Cater To",
    cards: [
      {
        title: "On-Demand",
        text: "Enhancing digital interactions by focusing on intuitive interfaces and user-centric design principles.",
        layout: "tall",
        variant: "on-demand",
        image: "/figma-assets/5652554e-1fad-491e-9c86-4117a73aae42.png",
      },
      {
        title: "Ecommerce",
        text: "Creating visually appealing and functional websites through the process of designing and coding web content.",
        layout: "compact",
        variant: "ecommerce",
      },
      {
        title: "Restaurant",
        text: "Building dynamic and interactive online platforms that enable users to perform specific tasks or access various services.",
        layout: "compact",
        variant: "restaurant",
        image: "/figma-assets/cc168c4e-15d0-4261-b0ff-b0fdebb843a5.png",
      },
      {
        title: "Event",
        text: "Developing online marketplaces where businesses can showcase and sell their products or services to a global audience.",
        layout: "tall",
        variant: "event",
        image: "/figma-assets/cb30c4f4-9a46-4e61-b48f-4b6b54fe6c02.png",
      },
      {
        title: "Game App",
        text: "Implementing measures to protect digital systems, networks, and data from unauthorised access, attacks, and breaches.",
        layout: "compact",
        variant: "game",
        image: "/figma-assets/ed9724e5-a12e-4782-b260-39084886ca38.png",
      },
      {
        title: "Travel",
        text: "Implementing measures to protect digital systems, networks, and data from unauthorised access, attacks, and breaches.",
        layout: "compact",
        variant: "travel",
        image: "/figma-assets/987108b2-508d-42d1-9aba-bdbc369063db.png",
      },
    ],
  },
  whyCards: {
    title: "App Development Saudi Arabia - Why Opt for CWIT?",
    description: `${copy} risus et elementum vehicula, justo`,
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    cards: [
      {
        title: "Product and Market Strategy",
        text: "Enhancing digital interactions by focusing on intuitive interfaces and user-centric design principles.",
        variant: "product",
        bg: "/figma-assets/27607d02-3420-42f0-888d-66a7f3a0a350.png",
        art: "/figma-assets/dc4bb700-df8a-4cf2-b884-d1cfe4af6644.png",
        exact: "/figma-assets/14cca7b0-c64a-416c-a53c-9fb04603696f.png",
      },
      {
        title: "Native App Development",
        text: "Enhancing digital interactions by focusing on intuitive interfaces and user-centric design principles.",
        variant: "native",
        bg: "/figma-assets/2cd9d504-ec67-441d-bdfe-630965914040.png",
        art: "/figma-assets/c6de75af-8cf8-46aa-8d29-a6c9fe545cb7.png",
      },
      {
        title: "QA and Testing",
        text: "Developing online marketplaces where businesses can showcase and sell their products or services to a global audience.",
        variant: "qa",
        bg: "/figma-assets/9942377e-1306-4e2c-8779-b9e13574b659.png",
        art: "/figma-assets/53bd7706-08b8-496c-a388-59185bf5c295.png",
      },
      {
        title: "Ui/Ux Design",
        text: "Creating visually appealing and functional websites through the process of designing and coding web content.",
        variant: "ui",
        bg: "/figma-assets/27607d02-3420-42f0-888d-66a7f3a0a350.png",
        art: "/figma-assets/276dbfe3-ebd5-434c-ad1f-0b44abda8fda.png",
        foreground: "/figma-assets/36ac6298-db2f-41fb-b58b-65265e3abdaf.png",
        exact: "/figma-assets/1a4fda07-8f89-45cb-a12c-4077cdc66a64.png",
      },
    ],
  },
  whyFullImage: {
    title: "Mobile App Development in Saudi Arabia",
    description:
      "We design and build mobile experiences that feel native, ship faster, and stay maintainable as your product grows across iOS and Android.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    image:
      "/figma-assets/67064913-d634-4196-81be-b0b3765990e3.png",
  },
  augmentedSection: {
    title:
      "Mobile App Trends: Building Cross-Platform Experiences Users Keep Coming Back To",
    description:
      "From product strategy to native delivery, mobile teams are focusing on speed, usability, and retention so apps feel polished across devices and markets.",
    ctaLabel: "Read Post",
    image:
      "/figma-assets/01b5ae10-2420-489b-86f9-50653bf2054d.png",
    posts: [
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Why Native Quality Still Matters in Modern Mobile App Development",
        description:
          "Performance, gesture design, and platform conventions remain essential for apps that feel fast and trustworthy day to day.",
        ctaLabel: "Read Post",
      },
      {
        date: "FEBRUARY 8, 2024",
        title:
          "How Product and Market Strategy Shape Successful Mobile Launches",
        description:
          "Clear audience insight and roadmap priorities help teams ship features that drive adoption instead of unused complexity.",
        ctaLabel: "Read Post",
      },
    ],
  },
  process: {
    title: "Our Process",
    cards: [
      {
        title: "Discover",
        text: "We clarify product goals, users, and platform needs so the roadmap is grounded in real outcomes.",
      },
      {
        title: "Build",
        text: "We design and develop the app with reusable components, integrations, and quality checks built in.",
      },
      {
        title: "Launch",
        text: "We release to the stores, monitor performance, and iterate with ongoing support and feature delivery.",
      },
    ],
  },
  technologies: {
    title: "Advanced Technologies We Work With",
    cards: [
      {
        title: "Cloud Computing",
        text: "Lorem ipsum dolor amet, consectetur adipiscing elit. Sed posuere velit aliquet suscipirg.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[16px] top-[26px] md:left-[6.63%] md:top-[9.06%]",
        textClassName: "left-[16px] top-[200px] w-[204px] md:left-[6.63%] md:top-[70.17%] md:h-[23.68%] md:w-[82.95%]",
      },
      {
        title: "AI/ML",
        text: "Lorem ipsum dolor amet, consectetur adipiscing elit. Sed posuere velit aliquet suscipirg.",
        variant: "ai",
        bg: "bg-[#7222dd]",
        image: "/figma-assets/b476ac20-6350-4abb-a8d9-284d91f612a6.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName: "left-[22px] top-[56px] w-[192px] md:left-[9.17%] md:top-[18.54%] md:w-[85.6%]",
      },
      {
        title: "Blockchain",
        text: "Lorem ipsum dolor amet, consectetur adipiscing elit. Sed posuere velit aliquet suscipirg.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName: "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
      {
        title: "AR/VR/MR",
        text: "Lorem ipsum dolor amet, consectetur adipiscing elit. Sed posuere velit aliquet suscipirg.",
        variant: "ar",
        bg: "bg-[#b351db]",
        image: "/figma-assets/96420064-b6f8-447a-8120-3d5df850ddf3.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.2%] md:top-[9.06%]",
        textClassName: "left-[22px] top-[56px] w-[192px] md:left-[9.2%] md:top-[18.54%] md:w-[81.6%]",
      },
      {
        title: "IoT",
        text: "Lorem ipsum dolor amet, consectetur adipiscing elit. Sed posuere velit aliquet suscipirg.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName: "left-[18px] top-[200px] w-[192px] md:left-[7.64%] md:top-[70.17%] md:h-[23.68%] md:w-[81.6%]",
      },
      {
        title: "Metaverse",
        text: "Lorem ipsum dolor amet, consectetur adipiscing elit. Sed posuere velit aliquet suscipirg.",
        variant: "metaverse",
        bg: "bg-[#01062c]",
        baseImage: "/figma-assets/1096bc0a-302e-4e97-b867-87cc1ddcaf69.png",
        image: "/figma-assets/915c23e7-6ff4-4cf4-b8e5-69867ee64547.png",
        titleClassName: "left-[19px] top-[26px] md:left-[8.04%] md:top-[9.06%]",
        textClassName: "left-[19px] top-[56px] w-[196px] md:left-[8.04%] md:top-[18.54%] md:w-[81.6%]",
      },
      {
        title: "Data Science & Analytics",
        text: "Lorem ipsum dolor amet, consectetur adipiscing elit. Sed posuere velit aliquet suscipirg.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName: "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
    ],
  },
} satisfies AppFigmaSectionsContent;
