import beforeGlow from "@/app/assets/imgs/__before.png";
import cwLogo from "@/app/assets/imgs/cwit_logo_2.png";
import nextjsIcon from "@/app/assets/imgs/nextjs.png";
import nodejsIcon from "@/app/assets/imgs/nodejs.png";
import umbracoIcon from "@/app/assets/imgs/umbraco.png";
import wagtailIcon from "@/app/assets/imgs/wagtail.png";
import wordpressVipIcon from "@/app/assets/imgs/wordpress.png";
import type { AppFigmaSectionsContent } from "@/app/components/sections/AppFigmaSections";

const industryCopy = {
  onDemand:
    "Building responsive platforms that connect customers with services through fast, intuitive digital experiences.",
  ecommerce:
    "Creating scalable online stores with smooth product discovery, secure checkout, and conversion-focused journeys.",
  restaurant:
    "Delivering ordering, reservation, and loyalty experiences that help hospitality brands serve customers online.",
  event:
    "Developing event platforms for discovery, registration, ticketing, communication, and live audience engagement.",
  game:
    "Engineering interactive browser experiences with reliable performance across modern devices and screen sizes.",
  travel:
    "Designing booking and destination platforms that make researching, planning, and purchasing travel effortless.",
};

export const webAppFigmaContent = {
  beforeImage: beforeGlow,
  logoImage: cwLogo,
  intro: {
    title: "Start-to-end Web Design and Development Company Saudi Arabia",
    description:
      "We design and build high-performance websites that turn complex business requirements into clear, engaging digital experiences. From strategy and UX through development, integrations, launch, and ongoing optimization, our team delivers a complete web solution tailored to your goals.",
    ctaLabel: "Contact us",
  },
  stats: [
    { number: "100+", label: "Web Experiences Delivered", width: "w-[245px]" },
    { number: "12", label: "Years of Market Experience", width: "w-[248px]" },
    { number: "30+", label: "In-house Team Members", width: "w-[227px]" },
    { number: "99+", label: "Projects Finished", width: "w-[153px]" },
  ],
  industries: {
    title: "Web App Development Industries We Cater To",
    cards: [
      {
        title: "On-Demand",
        text: industryCopy.onDemand,
        layout: "tall",
        variant: "on-demand",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/5652554e-1fad-491e-9c86-4117a73aae42.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(48,86,202,0.2)]",
      },
      {
        title: "Ecommerce",
        text: industryCopy.ecommerce,
        variant: "ecommerce",
        size: "h-[139px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.479vw,566px)]",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
      {
        title: "Restaurant",
        text: industryCopy.restaurant,
        variant: "restaurant",
        size: "h-[142px] w-[300px] md:h-[clamp(171px,13.88vw,266.5px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cc168c4e-15d0-4261-b0ff-b0fdebb843a5.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(47,77,184,0.2)]",
      },
      {
        title: "Event",
        text: industryCopy.event,
        layout: "tall",
        variant: "event",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cb30c4f4-9a46-4e61-b48f-4b6b54fe6c02.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "Game & Interactive",
        text: industryCopy.game,
        variant: "game",
        size: "h-[141px] w-[300px] md:h-[clamp(170px,13.802vw,265px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/ed9724e5-a12e-4782-b260-39084886ca38.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "Travel",
        text: industryCopy.travel,
        variant: "travel",
        size: "h-[140px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/987108b2-508d-42d1-9aba-bdbc369063db.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
    ],
  },
  whyCards: {
    title: "Website Design Company in Saudi Arabia - Why Opt for CWIT?",
    description:
      "Our multidisciplinary team combines strategy, design, engineering, and growth expertise to create websites that are distinctive, maintainable, and ready to scale. We work with modern frameworks and enterprise content platforms while keeping usability, performance, accessibility, and measurable business outcomes at the center.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    cards: [
      {
        title: "Creative Strategy",
        text: "We align audience needs, brand positioning, content, and conversion goals before design begins.",
        variant: "product",
        bg: "/figma-assets/27607d02-3420-42f0-888d-66a7f3a0a350.png",
        art: "/figma-assets/dc4bb700-df8a-4cf2-b884-d1cfe4af6644.png",
      },
      {
        title: "Web Development",
        text: "We build responsive, accessible, and maintainable websites using technologies selected for your requirements.",
        variant: "native",
        bg: "/figma-assets/2cd9d504-ec67-441d-bdfe-630965914040.png",
        art: "/figma-assets/c6de75af-8cf8-46aa-8d29-a6c9fe545cb7.png",
      },
      {
        title: "Quality and Performance",
        text: "Testing, accessibility checks, security reviews, and performance optimization are built into delivery.",
        variant: "qa",
        bg: "/figma-assets/9942377e-1306-4e2c-8779-b9e13574b659.png",
        art: "/figma-assets/53bd7706-08b8-496c-a388-59185bf5c295.png",
      },
      {
        // Rendered from the same flattened Figma export as the mobile-app card
        // (title + description are baked into the image).
        title: "Ui/Ux Design",
        text: "Creating visually appealing and functional websites through the process of designing and coding web content.",
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
    title: "Web Design and Development in Saudi Arabia",
    description:
      "We create high-performance websites and web applications that turn complex requirements into clear, conversion-focused digital experiences.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    image:
      "/figma-assets/67064913-d634-4196-81be-b0b3765990e3.png",
  },
  augmentedSection: {
    title:
      "Web Design and Development: Creating High-Performance Experiences That Convert",
    description:
      "Modern websites need more than visual polish—they need clear journeys, strong performance, and maintainable architecture that supports growth.",
    ctaLabel: "Read Post",
    image:
      "/figma-assets/01b5ae10-2420-489b-86f9-50653bf2054d.png",
    posts: [
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Creative Strategy Before Design: Why the Best Websites Start With Clarity",
        description:
          "Aligning audience needs, brand positioning, and conversion goals early keeps design and engineering focused on outcomes.",
        ctaLabel: "Read Post",
      },
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Performance, Accessibility, and SEO as Core Web Delivery Standards",
        description:
          "Fast, inclusive, and discoverable websites are no longer extras—they are baseline requirements for modern digital brands.",
        ctaLabel: "Read Post",
      },
    ],
  },
  process: {
    title: "Our Process",
    cards: [
      {
        title: "Discover",
        text: "We align audience needs, content, and conversion goals before design and engineering begin.",
      },
      {
        title: "Build",
        text: "We design and develop responsive, accessible websites with the stack that fits your requirements.",
      },
      {
        title: "Launch",
        text: "We launch, optimize performance, and support ongoing improvements as your business grows.",
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
