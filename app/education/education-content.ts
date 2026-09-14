import beforeGlow from "@/app/assets/imgs/__before.png";
import cwLogo from "@/app/assets/imgs/cwit_logo_2.png";
import type { AppFigmaSectionsContent } from "@/app/components/sections/AppFigmaSections";

export const educationFigmaContent = {
  beforeImage: beforeGlow,
  logoImage: cwLogo,
  intro: {
    title: "Education Digital Solutions Company in Saudi Arabia",
    description:
      "We help schools, universities, and learning brands go digital with platforms that engage students, support educators, and streamline admissions. From learning websites and portals through enrollment journeys and student experiences, CWIT builds education technology that makes learning clearer, more accessible, and easier to grow.",
    ctaLabel: "Contact us",
  },
  stats: [
    { number: "100+", label: "Education Experiences Delivered", width: "w-[245px]" },
    { number: "12", label: "Years of Market Experience", width: "w-[248px]" },
    { number: "30+", label: "In-house Team Members", width: "w-[227px]" },
    { number: "99+", label: "Projects Finished", width: "w-[153px]" },
  ],
  industries: {
    title: "Education Industries We Cater To",
    cards: [
      {
        title: "Universities",
        text: "Building institutional websites and portals that support admissions, academics, and student services.",
        variant: "on-demand",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/5652554e-1fad-491e-9c86-4117a73aae42.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(48,86,202,0.2)]",
      },
      {
        title: "K-12 Schools",
        text: "Creating parent-friendly digital experiences for programs, enrollment, and school communications.",
        variant: "ecommerce",
        size: "h-[139px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.479vw,566px)]",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
      {
        title: "EdTech",
        text: "Designing product platforms for learning apps, content delivery, and student engagement at scale.",
        variant: "restaurant",
        size: "h-[142px] w-[300px] md:h-[clamp(171px,13.88vw,266.5px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cc168c4e-15d0-4261-b0ff-b0fdebb843a5.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(47,77,184,0.2)]",
      },
      {
        title: "Training Institutes",
        text: "Delivering course discovery, registration, and learning journeys for professional and vocational programs.",
        variant: "event",
        size: "h-[299px] w-[300px] md:h-[clamp(362px,29.375vw,564px)] md:w-[clamp(364px,29.479vw,566px)]",
        image: "/figma-assets/cb30c4f4-9a46-4e61-b48f-4b6b54fe6c02.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "Online Learning",
        text: "Building e-learning experiences with clear content structure, progress tracking, and conversion-ready UX.",
        variant: "game",
        size: "h-[141px] w-[300px] md:h-[clamp(170px,13.802vw,265px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/ed9724e5-a12e-4782-b260-39084886ca38.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(103,103,111,0.2)]",
      },
      {
        title: "Research Centers",
        text: "Creating digital platforms that publish research, events, and collaboration opportunities clearly.",
        variant: "travel",
        size: "h-[140px] w-[300px] md:h-[clamp(169px,13.698vw,263px)] md:w-[clamp(364px,29.488vw,566.166px)]",
        image: "/figma-assets/987108b2-508d-42d1-9aba-bdbc369063db.png",
        shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
      },
    ],
  },
  whyCards: {
    title: "Education Digital Solutions Saudi Arabia - Why Opt for CWIT?",
    description:
      "We combine learning experience design, product engineering, and growth strategy so education brands attract students and support them better online. From websites and portals through enrollment and engagement journeys, CWIT builds digital systems that make education clearer, more accessible, and easier to scale.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    cards: [
      {
        title: "Learning Platforms",
        text: "We design and develop portals and course experiences that help students discover, learn, and stay engaged.",
        variant: "product",
        bg: "/figma-assets/27607d02-3420-42f0-888d-66a7f3a0a350.png",
        art: "/figma-assets/dc4bb700-df8a-4cf2-b884-d1cfe4af6644.png",
      },
      {
        title: "Admissions Journeys",
        text: "We build enrollment flows that guide applicants from interest to application with less friction.",
        variant: "native",
        bg: "/figma-assets/2cd9d504-ec67-441d-bdfe-630965914040.png",
        art: "/figma-assets/c6de75af-8cf8-46aa-8d29-a6c9fe545cb7.png",
      },
      {
        title: "Student Portals",
        text: "We create secure portals for schedules, resources, communication, and campus services in one place.",
        variant: "qa",
        bg: "/figma-assets/9942377e-1306-4e2c-8779-b9e13574b659.png",
        art: "/figma-assets/53bd7706-08b8-496c-a388-59185bf5c295.png",
      },
      {
        title: "Institutional Websites",
        text: "We craft education websites that communicate programs clearly and convert visitors into inquiries.",
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
    title: "Education Digital Solutions in Saudi Arabia",
    description:
      "We help schools and learning brands go digital with platforms that engage students and streamline admissions.",
    ctaLabel: "Contact us",
    maskImage: "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg",
    image:
      "/figma-assets/67064913-d634-4196-81be-b0b3765990e3.png",
  },
  augmentedSection: {
    title:
      "Digital Learning Experiences: How Education Brands Attract and Engage Students Online",
    description:
      "From admissions journeys to learning platforms, education brands are using digital experiences to guide students, support educators, and grow enrollment with clearer, more accessible journeys.",
    ctaLabel: "Read Post",
    image:
      "/figma-assets/e5ecb837-3159-4087-9293-500af6bdbfe9.png",
    posts: [
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Building Student Portals That Reduce Friction Across Enrollment and Campus Services",
        description:
          "A well-designed student portal brings schedules, resources, and communication together so applicants and students can move forward with confidence.",
        ctaLabel: "Read Post",
      },
      {
        date: "FEBRUARY 8, 2024",
        title:
          "Why Institutional Websites Still Matter in the Age of EdTech Platforms",
        description:
          "Program pages, admissions paths, and trust signals remain essential for converting interest into inquiries across schools and universities.",
        ctaLabel: "Read Post",
      },
    ],
  },
  process: {
    title: "Our Process",
    cards: [
      {
        title: "Discover",
        text: "We map learner and institutional goals into a clear digital experience roadmap.",
      },
      {
        title: "Build",
        text: "We design and develop portals, websites, and enrollment journeys with accessibility in mind.",
      },
      {
        title: "Launch",
        text: "We launch, train teams, and refine engagement based on real usage and outcomes.",
      },
    ],
  },
  technologies: {
    title: "Advanced Technologies We Work With",
    cards: [
      {
        title: "LMS Platforms",
        text: "Learning management systems that organize courses, progress, and student engagement in one place.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[16px] top-[26px] md:left-[6.63%] md:top-[9.06%]",
        textClassName:
          "left-[16px] top-[200px] w-[204px] md:left-[6.63%] md:top-[70.17%] md:h-[23.68%] md:w-[82.95%]",
      },
      {
        title: "AI Tutoring",
        text: "Personalized learning support and recommendations that help students progress with clearer guidance.",
        variant: "ai",
        bg: "bg-[#7222dd]",
        image: "/figma-assets/b476ac20-6350-4abb-a8d9-284d91f612a6.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[56px] w-[192px] md:left-[9.17%] md:top-[18.54%] md:w-[85.6%]",
      },
      {
        title: "Student CRM",
        text: "Admissions and inquiry pipelines that help institutions nurture applicants through enrollment.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
      {
        title: "AR/VR Learning",
        text: "Immersive learning experiences that bring labs, campuses, and complex concepts to life.",
        variant: "ar",
        bg: "bg-[#b351db]",
        image: "/figma-assets/96420064-b6f8-447a-8120-3d5df850ddf3.png",
        titleClassName: "left-[22px] top-[26px] md:left-[9.2%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[56px] w-[192px] md:left-[9.2%] md:top-[18.54%] md:w-[81.6%]",
      },
      {
        title: "Mobile Learning",
        text: "Student and parent apps for schedules, resources, alerts, and learning on the go.",
        variant: "dark",
        dark: true,
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[18px] top-[200px] w-[192px] md:left-[7.64%] md:top-[70.17%] md:h-[23.68%] md:w-[81.6%]",
      },
      {
        title: "Virtual Classrooms",
        text: "Live and recorded classroom experiences that keep remote and hybrid learning connected.",
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
        title: "Learning Analytics",
        text: "Dashboards that reveal engagement, completion, and enrollment performance for better decisions.",
        variant: "light",
        titleClassName: "left-[22px] top-[26px] md:left-[9.17%] md:top-[9.06%]",
        textClassName:
          "left-[22px] top-[200px] w-[192px] md:left-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
      },
    ],
  },
} satisfies AppFigmaSectionsContent;
