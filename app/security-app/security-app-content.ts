import beforeGlow from "@/app/assets/imgs/__before.png";
import cwLogo from "@/app/assets/imgs/cwit_logo_2.png";
import type { AppFigmaSectionsContent } from "@/app/components/sections/AppFigmaSections";

export const securityAppFigmaContent = {
  beforeImage: beforeGlow,
  logoImage: cwLogo,
  intro: {
    title: "Cyber Security Consulting Company in Saudi Arabia",
    description:
      "We’ll keep your data safe and help you feel at ease with our extensive cyber defense services. In addition, we’ll assess your vulnerabilities and craft appropriate security measures to protect your IT infrastructure. We provide expert solutions to safeguard your digital assets with CWIT, one of the leading cyber security companies in Saudi Arabia. Protect your business with us today.",
    ctaLabel: "Contact us",
  },
  stats: [
    { number: "100+", label: "Security Assessments Delivered", width: "w-[245px]" },
    { number: "12", label: "Years of Market Experience", width: "w-[248px]" },
    { number: "30+", label: "In-house Team Members", width: "w-[227px]" },
    { number: "99+", label: "Projects Finished", width: "w-[153px]" },
  ],
  industries: {
    title: "Security Industries We Cater To",
    cards: [
      {
        title: "Travel & Leisure",
        text: "Protecting guest data, booking platforms, and payment systems for travel and hospitality brands.",
        variant: "on-demand",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/5652554e-1fad-491e-9c86-4117a73aae42.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(48,86,202,0.2)]",
      },
      {
        title: "Finance",
        text: "Hardening banking, fintech, and payments environments against fraud, intrusion, and data exposure.",
        variant: "ecommerce",
        size: "h-[139px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.479vw,566px)]",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
      {
        title: "Education",
        text: "Securing student records, learning platforms, and campus networks for schools and institutes.",
        variant: "restaurant",
        size: "h-[142px] w-[300px] md:h-[clamp(171px,13.88vw,266.5px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cc168c4e-15d0-4261-b0ff-b0fdebb843a5.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(47,77,184,0.2)]",
      },
      {
        title: "Healthcare",
        text: "Safeguarding patient data and clinical systems with compliant, resilient security controls.",
        variant: "event",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cb30c4f4-9a46-4e61-b48f-4b6b54fe6c02.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "Tech",
        text: "Protecting SaaS platforms, APIs, and cloud workloads from modern cyber threats.",
        variant: "game",
        size: "h-[141px] w-[300px] md:h-[clamp(170px,13.802vw,265px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/ed9724e5-a12e-4782-b260-39084886ca38.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "Industrial",
        text: "Defending OT and enterprise networks for manufacturing and industrial operations.",
        variant: "travel",
        size: "h-[140px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/987108b2-508d-42d1-9aba-bdbc369063db.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
    ],
  },
  whyCards: {
    title: "Cyber Security Services in Saudi Arabia - Why Opt for CWIT?",
    description:
      "We assess your vulnerabilities and craft security measures that protect your IT infrastructure end to end. From discovery and hardening through monitoring and response, CWIT helps you stay ahead of threats with practical, business-focused cyber defense.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    cards: [
      {
        title: "Threat Assessment",
        text: "We identify risks across people, process, and technology so you know where attackers are most likely to succeed.",
        variant: "product",
        bg: "/figma-assets/27607d02-3420-42f0-888d-66a7f3a0a350.png",
        art: "/figma-assets/dc4bb700-df8a-4cf2-b884-d1cfe4af6644.png",
      },
      {
        title: "Vulnerability Management",
        text: "We find, prioritize, and remediate weaknesses before they become incidents that disrupt your business.",
        variant: "native",
        bg: "/figma-assets/2cd9d504-ec67-441d-bdfe-630965914040.png",
        art: "/figma-assets/c6de75af-8cf8-46aa-8d29-a6c9fe545cb7.png",
      },
      {
        title: "Network Security",
        text: "We harden networks, cloud environments, and access controls to reduce exposure and contain threats.",
        variant: "qa",
        bg: "/figma-assets/9942377e-1306-4e2c-8779-b9e13574b659.png",
        art: "/figma-assets/53bd7706-08b8-496c-a388-59185bf5c295.png",
      },
      {
        title: "Incident Response",
        text: "We prepare playbooks and response capabilities so your team can detect, contain, and recover quickly.",
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
    title: "Cyber Security Services in Saudi Arabia",
    description:
      "We assess vulnerabilities and craft practical cyber defense measures that protect your infrastructure end to end.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    image:
      "/figma-assets/67064913-d634-4196-81be-b0b3765990e3.png",
  },
  augmentedSection: {
    title:
      "Cyber Security for Growing Businesses: Practical Defense in a Changing Threat Landscape",
    description:
      "From assessment to response planning, modern security programs help organizations reduce exposure while keeping teams productive.",
    ctaLabel: "Read Post",
    image:
      "/figma-assets/01b5ae10-2420-489b-86f9-50653bf2054d.png",
    posts: [
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Why Threat Assessment Should Come Before Tooling Decisions",
        description:
          "Understanding where attackers are most likely to succeed helps teams prioritize remediation with business impact in mind.",
        ctaLabel: "Read Post",
      },
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Building Incident Response Capabilities Before You Need Them",
        description:
          "Playbooks and readiness planning help teams detect, contain, and recover faster when security events occur.",
        ctaLabel: "Read Post",
      },
    ],
  },
  process: {
    title: "Our Process",
    cards: [
      {
        title: "Discover",
        text: "We discover risks across people, process, and technology to prioritize what matters most.",
      },
      {
        title: "Build",
        text: "We harden systems, remediate vulnerabilities, and implement controls matched to your environment.",
      },
      {
        title: "Launch",
        text: "We prepare response readiness and ongoing reviews so protection improves over time.",
      },
    ],
  },
  technologies: {
    title: "Advanced Technologies We Work With",
    cards: [
      {
        title: "Cloud Computing",
        text: "Scalable cloud infrastructure that keeps digital products reliable under growth and peak demand.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[16px] top-[26px] md:left-[6.63%] md:top-[9.06%]",
        textClassName:
          "left-[16px] top-[200px] w-[204px] md:left-[6.63%] md:top-[70.17%] md:h-[23.68%] md:w-[82.95%]",
      },
      {
        title: "AI/ML",
        text: "Intelligent automation and insights that personalize experiences and reduce manual work.",
        variant: "ai",
        bg: "bg-[#7222dd]",
        image: "/figma-assets/b476ac20-6350-4abb-a8d9-284d91f612a6.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[56px] w-[192px] md:left-[9.17%] md:top-[18.54%] md:w-[85.6%]",
      },
      {
        title: "Blockchain",
        text: "Secure, transparent systems for identity, transactions, and trusted digital records.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
      {
        title: "AR/VR/MR",
        text: "Immersive experiences that help brands demonstrate products, places, and complex ideas.",
        variant: "ar",
        bg: "bg-[#b351db]",
        image: "/figma-assets/96420064-b6f8-447a-8120-3d5df850ddf3.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.2%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[56px] w-[192px] md:left-[9.2%] md:top-[18.54%] md:w-[81.6%]",
      },
      {
        title: "IoT",
        text: "Connected device experiences that extend digital products into real-world operations.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[18px] top-[200px] w-[192px] md:left-[7.64%] md:top-[70.17%] md:h-[23.68%] md:w-[81.6%]",
      },
      {
        title: "Metaverse",
        text: "Spatial and immersive platforms for brand presence, training, and next-generation engagement.",
        variant: "metaverse",
        bg: "bg-[#01062c]",
        baseImage: "/figma-assets/1096bc0a-302e-4e97-b867-87cc1ddcaf69.png",
        image: "/figma-assets/915c23e7-6ff4-4cf4-b8e5-69867ee64547.png",
        titleClassName: "left-[19px] top-[26px] md:left-[8.04%] md:top-[9.06%]",
        textClassName:
          "left-[19px] top-[56px] w-[196px] md:left-[8.04%] md:top-[18.54%] md:w-[81.6%]",
      },
      {
        title: "Data Science and Analytics",
        text: "Measurement systems that reveal performance, conversion, and opportunities for continuous improvement.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
    ],
  }
} satisfies AppFigmaSectionsContent;
