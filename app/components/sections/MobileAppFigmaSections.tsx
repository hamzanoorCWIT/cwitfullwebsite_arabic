"use client";

import { useRef } from "react";
import Image, { type ImageProps, type StaticImageData } from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@/app/hooks/useGSAP";
import CallToActionButton from "@/app/components/ui/CallToActionButton";
import BeforeImage from "@/app/components/ui/BeforeImage";
import FigmaHomeTestimonials from "@/app/components/sections/FigmaHomeTestimonials";
import type { HomeClientLogo, HomeTestimonialItem } from "@/app/lib/home-normalize";
import type { AppWhyForegroundPosition } from "@/app/lib/why-foreground-position";
import {
  resolveWhyForegroundPosition,
  WHY_FOREGROUND_POSITION_CLASS,
} from "@/app/lib/why-foreground-position";
import aboutStyles from "@/app/about-us/about-us.module.css";
import { horizontalOverflow, isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";

export interface AppFigmaStat {
  number: string;
  label: string;
  width?: string;
}

export type AppIndustryVariant =
  | "on-demand"
  | "ecommerce"
  | "restaurant"
  | "event"
  | "game"
  | "travel";

/** CMS choice — which card chrome to use. Frontend owns the actual sizes. */
export type AppIndustryCardLayout = "tall" | "compact";

export interface AppFigmaIndustryCard {
  title: string;
  text: string;
  /** CMS: tall or compact. Defaults to compact when omitted. */
  layout?: AppIndustryCardLayout;
  /**
   * Optional image-crop/style hint. If omitted, frontend picks a default
   * matching tall (on-demand) or compact (ecommerce).
   */
  variant?: AppIndustryVariant;
  /** @deprecated Ignored — size comes from `layout` presets on the frontend. */
  size?: string;
  /**
   * Flattened / exact card export (legacy Figma composite).
   * Prefer `bg` + `art`/`foreground` when separate assets exist.
   * Cards with no images still render (dark fill + title/text).
   */
  image?: string;
  bg?: string;
  art?: string;
  foreground?: string;
  /** @deprecated Ignored — shadow comes from `layout` presets on the frontend. */
  shadow?: string;
}

/** Frontend-only size/shadow for tall vs compact industry cards. */
export const INDUSTRY_LAYOUT_PRESETS: Record<
  AppIndustryCardLayout,
  {
    size: string;
    shadow: string;
    defaultVariant: AppIndustryVariant;
    compact: boolean;
  }
> = {
  tall: {
    size: "h-[299px] w-[300px] md:h-[clamp(320px,min(29.375vw,52.809vh),564px)] md:w-[clamp(322px,min(29.479vw,52.996vh),566px)]",
    shadow: "shadow-[34px_34px_60px_1px_rgba(48,86,202,0.2)]",
    defaultVariant: "on-demand",
    compact: false,
  },
  compact: {
    size: "h-[140px] w-[300px] md:h-[clamp(152px,min(13.698vw,24.625vh),263px)] md:w-[clamp(322px,min(29.479vw,52.996vh),566px)]",
    shadow: "shadow-[34px_34px_60px_1px_rgba(0,0,0,0.2)]",
    defaultVariant: "ecommerce",
    compact: true,
  },
};

export function resolveIndustryCardLayout(
  layout?: AppIndustryCardLayout | string | null,
): AppIndustryCardLayout {
  return layout === "tall" ? "tall" : "compact";
}

/**
 * Group industries for the horizontal track like the static Figma layout:
 * - tall → its own column
 * - two consecutive compact → one stacked column
 * - leftover single compact → its own column
 */
export function groupIndustryCards(
  cards: AppFigmaIndustryCard[],
): AppFigmaIndustryCard[][] {
  const groups: AppFigmaIndustryCard[][] = [];
  let i = 0;
  while (i < cards.length) {
    const card = cards[i];
    const layout = resolveIndustryCardLayout(card.layout);
    if (layout === "compact") {
      const next = cards[i + 1];
      if (next && resolveIndustryCardLayout(next.layout) === "compact") {
        groups.push([card, next]);
        i += 2;
        continue;
      }
    }
    groups.push([card]);
    i += 1;
  }
  return groups;
}

export type AppWhyVariant = "product" | "native" | "qa" | "ui";

export type { AppWhyForegroundPosition } from "@/app/lib/why-foreground-position";
export {
  resolveWhyForegroundPosition,
  WHY_FOREGROUND_POSITION_CLASS,
  WHY_FOREGROUND_POSITIONS,
} from "@/app/lib/why-foreground-position";

export interface AppFigmaWhyCard {
  title: string;
  text: string;
  variant: AppWhyVariant;
  bg: string;
  art?: string;
  foreground?: string;
  /** CMS dropdown — defaults to bottom-center. */
  foregroundPosition?: AppWhyForegroundPosition;
  exact?: string;
}

export type AppTechnologyVariant =
  | "dark"
  | "light"
  | "icon"
  | "ai"
  | "ar"
  | "metaverse";

/**
 * Frontend-owned layout for technology cards by variant (CMS does not send classes).
 * Text uses logical `start-*` / `end-*` so it mirrors to the right edge in Arabic (RTL).
 */
export type AppTechVariantPreset = {
  bg: string;
  titleClassName: string;
  textClassName: string;
  iconClassName?: string;
};

export const TECH_VARIANT_PRESETS: Record<
  AppTechnologyVariant,
  AppTechVariantPreset
> = {
  dark: {
    bg: "bg-[#141414]",
    titleClassName:
      "start-[22px] top-[26px] md:start-[9.17%] md:top-[9.06%]",
    textClassName:
      "start-[18px] top-[200px] w-[192px] md:start-[7.64%] md:top-[70.17%] md:h-[23.68%] md:w-[81.6%]",
  },
  light: {
    bg: "bg-[#e3e3e3]",
    titleClassName:
      "start-[22px] top-[26px] md:start-[9.17%] md:top-[9.06%]",
    textClassName:
      "start-[22px] top-[200px] w-[192px] md:start-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
  },
  icon: {
    bg: "bg-[#e3e3e3]",
    titleClassName:
      "start-[22px] top-[26px] md:start-[9.17%] md:top-[9.06%]",
    textClassName:
      "start-[22px] top-[200px] w-[192px] md:start-[9.17%] md:top-[70.17%] md:h-[23.68%] md:w-[85%]",
    iconClassName: "bottom-[8%] end-[8%] h-[42%] w-[42%]",
  },
  ai: {
    bg: "bg-[#7222dd]",
    titleClassName:
      "start-[22px] top-[26px] md:start-[9.17%] md:top-[9.06%]",
    textClassName:
      "start-[22px] top-[56px] w-[192px] md:start-[9.17%] md:top-[18.54%] md:w-[85.6%]",
  },
  ar: {
    bg: "bg-[#b351db]",
    titleClassName:
      "start-[22px] top-[26px] md:start-[9.2%] md:top-[9.06%]",
    textClassName:
      "start-[22px] top-[56px] w-[192px] md:start-[9.2%] md:top-[18.54%] md:w-[81.6%]",
  },
  metaverse: {
    bg: "bg-[#01062c]",
    titleClassName:
      "start-[19px] top-[26px] md:start-[8.04%] md:top-[9.06%]",
    textClassName:
      "start-[19px] top-[56px] w-[196px] md:start-[8.04%] md:top-[18.54%] md:w-[81.6%]",
  },
};

export function resolveTechVariantPreset(
  variant: AppTechnologyVariant,
): AppTechVariantPreset {
  return TECH_VARIANT_PRESETS[variant] ?? TECH_VARIANT_PRESETS.dark;
}

export interface AppFigmaTechnologyCard {
  title: string;
  text: string;
  variant: AppTechnologyVariant;
  /** @deprecated Ignored — derived from variant preset. */
  dark?: boolean;
  /** @deprecated Ignored — bg comes from variant preset. */
  bg?: string;
  baseImage?: string;
  image?: string;
  /** @deprecated Ignored — image layout is frontend-owned per variant. */
  imageClassName?: string;
  icon?: ImageProps["src"];
  /** @deprecated Ignored — icon layout comes from variant preset. */
  iconClassName?: string;
  /** @deprecated Ignored — title layout comes from variant preset. */
  titleClassName?: string;
  /** @deprecated Ignored — text layout comes from variant preset. */
  textClassName?: string;
}

export interface AppFigmaProcessCard {
  title: string;
  text: string;
}

/**
 * Decorative why-section mask from the Figma design.
 * Always owned by the frontend (not CMS) — rotation/scale are tuned for this SVG.
 */
export const APP_FIGMA_WHY_MASK_IMAGE =
  "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg";

export interface AppFigmaWhyCardsContent {
  title: string;
  description: string;
  ctaLabel: string;
  /** @deprecated Ignored — mask uses `APP_FIGMA_WHY_MASK_IMAGE`. */
  maskImage?: string | StaticImageData;
  /** One or more why cards (was previously fixed at 4). */
  cards: AppFigmaWhyCard[];
}

/** Why section with copy + full-bleed image (no cards). */
export interface AppFigmaWhyFullImageContent {
  title: string;
  description: string;
  ctaLabel: string;
  /** @deprecated Ignored — mask uses `APP_FIGMA_WHY_MASK_IMAGE`. */
  maskImage?: string | StaticImageData;
  image: string | StaticImageData;
}

export interface AppFigmaAugmentedPost {
  date: string;
  title: string;
  description: string;
  ctaLabel: string;
}

export interface AppFigmaAugmentedSectionContent {
  title: string;
  description: string;
  ctaLabel: string;
  image: string | StaticImageData;
  imageCrop?:
    | "top-offset"
    | "top-offset-gradient"
    | "bottom-pinned"
    | "bottom-offset";
  posts: [AppFigmaAugmentedPost, AppFigmaAugmentedPost];
}

export interface AppFigmaSectionsContent {
  beforeImage: string | StaticImageData;
  logoImage: ImageProps["src"];
  intro: {
    title: string;
    description: string;
    ctaLabel: string;
  };
  stats: AppFigmaStat[];
  /** Industries carousel cards. */
  industries?: {
    title: string;
    cards: AppFigmaIndustryCard[];
  };
  /** Why section with service cards. */
  whyCards?: AppFigmaWhyCardsContent;
  /** Why section with a full-bleed image and no cards. */
  whyFullImage?: AppFigmaWhyFullImageContent;
  augmentedSection?: AppFigmaAugmentedSectionContent;
  technologies?: {
    title: string;
    cards: AppFigmaTechnologyCard[];
  };
  process?: {
    title: string;
    cards: AppFigmaProcessCard[];
  };
}

export interface AppFigmaSectionsProps {
  content: AppFigmaSectionsContent;
  testimonials?: HomeTestimonialItem[];
  clientLogos?: HomeClientLogo[];
  /** Show industries carousel when `content.industries` is present. Defaults to false. */
  showIndustries?: boolean;
  /** Use the tighter Real Estate spacing from the Figma frame. Defaults to false. */
  realEstateSpacing?: boolean;
  /** Show why-with-cards when `content.whyCards` is present. Defaults to false. */
  showWhyCards?: boolean;
  /** Show why-with-full-image when `content.whyFullImage` is present. Defaults to false. */
  showWhyFullImage?: boolean;
  /**
   * Show the technologies slider when `content.technologies` is present.
   * Defaults to false. Set true to show when content includes it.
   */
  showTechnologies?: boolean;
  /**
   * Show the process cards when `content.process` is present.
   * Defaults to false. Set true to show when content includes it.
   */
  showProcess?: boolean;
  /**
   * Show the augmented / featured posts section when `content.augmentedSection` is present.
   * Defaults to false. Set true to show when content includes it.
   */
  showAugmentedSection?: boolean;
}

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function Inner({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-[1389px] px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

function FigmaButton({ children }: { children: React.ReactNode }) {
  const label =
    typeof children === "string"
      ? children.trim()
      : typeof children === "number"
        ? String(children)
        : children;
  if (label == null || label === "") return null;

  return (
    <CallToActionButton
      variant="shiny"
      className="rounded-full px-[32px] py-3.5 text-[14px] md:px-[50px] md:py-5 md:text-[15px]"
    >
      {label}
    </CallToActionButton>
  );
}

export default function AppFigmaSections({
  content,
  testimonials,
  clientLogos,
  showIndustries = false,
  realEstateSpacing = false,
  showWhyCards = false,
  showWhyFullImage = false,
  showTechnologies = false,
  showProcess = false,
  showAugmentedSection = false,
}: AppFigmaSectionsProps) {
  const {
    beforeImage,
    logoImage,
    intro,
    stats,
    industries,
    whyCards,
    whyFullImage,
    augmentedSection,
    technologies,
    process,
  } = content;
  const renderIndustries = showIndustries && Boolean(industries?.cards?.length);
  const renderWhyCards = showWhyCards && Boolean(whyCards?.cards?.length);
  const renderWhyFullImage =
    showWhyFullImage && Boolean(whyFullImage?.title && whyFullImage?.image);
  const renderAugmentedSection =
    showAugmentedSection &&
    Boolean(
      augmentedSection?.title &&
        augmentedSection?.image &&
        augmentedSection?.posts?.length
    );
  const renderTechnologies =
    showTechnologies && Boolean(technologies?.cards?.length);
  const renderProcess = showProcess && Boolean(process?.cards?.length);
  const whyCardsSectionClassName = realEstateSpacing
    ? "relative overflow-hidden bg-black pt-[120px] pb-[108px] md:pt-[clamp(150px,14.48vw,278px)] md:pb-[clamp(104px,11.094vw,213px)]"
    : "relative overflow-hidden bg-black pt-[120px] pb-[120px] md:pt-[clamp(150px,14.48vw,278px)] md:pb-[clamp(250px,24.64vw,473px)]";
  const technologiesSectionClassName = realEstateSpacing
    ? "overflow-hidden bg-black pb-[200px] md:pb-[clamp(120px,10.417vw,200px)] md:pt-[clamp(132px,8.333vw,160px)]"
    : "overflow-hidden bg-black pb-[200px] md:pb-[clamp(120px,10.417vw,200px)]";
  const startSectionRef = useRef<HTMLElement>(null);
  const revealRootRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const industriesPinRef = useRef<HTMLDivElement>(null);
  const industriesTrackRef = useRef<HTMLDivElement>(null);
  const technologiesPinRef = useRef<HTMLDivElement>(null);
  const technologiesTrackRef = useRef<HTMLDivElement>(null);

  // Pinned horizontal scroll for the industries/technologies cards, same
  // pattern as the home showcase slider (HorizontalScrollSlider): pin the
  // container and translate the track left, scrubbed to the page scroll.
  useGSAP(
    () => {
      const sliders: [HTMLDivElement | null, HTMLDivElement | null][] = [
        [industriesPinRef.current, industriesTrackRef.current],
        [technologiesPinRef.current, technologiesTrackRef.current],
      ];

      const tweens = sliders.map(([container, track]) => {
        if (!container || !track) return null;

        // Arabic (RTL) slides the track right, so the cards move left-to-right.
        const getScrollAmount = () =>
          rtlAwareTranslateX(horizontalOverflow(track, container), isRtlDirection(container));

        return gsap.to(track, {
          x: getScrollAmount,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "center center",
            end: () => `+=${Math.abs(getScrollAmount())}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        });
      });

      return () => {
        tweens.forEach((tween) => tween?.kill());
      };
    },
    revealRootRef,
    []
  );

  useGSAP(
    () => {
      if (!startSectionRef.current) return;

      // Step-by-step reveal: each element animates when it scrolls into view
      // (elements arriving together are staggered), and hides again when the
      // page is scrolled back above it, so the effect replays in both directions.
      const allRevealItems = gsap.utils.toArray<HTMLElement>(".mobile-app-figma-reveal");
      gsap.set(allRevealItems, { opacity: 0, y: 44 });

      // Cards inside the pinned technologies slider can't use per-element
      // triggers: their reveal must be fully finished before the pin engages,
      // otherwise the vertical motion overlaps the horizontal slide and looks
      // like a glitch. Trigger them early, from the section itself, so the
      // fade-up completes while the heading area is still scrolling by.
      const techTrack = technologiesTrackRef.current;
      const techCards = techTrack
        ? allRevealItems.filter((element) => techTrack.contains(element))
        : [];
      if (techCards.length && technologiesPinRef.current) {
        const techSection = technologiesPinRef.current.closest("section");
        gsap.to(techCards, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: techSection || technologiesPinRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        });
      }

      const revealItems = allRevealItems.filter(
        (element) => !techCards.includes(element)
      );
      ScrollTrigger.batch(revealItems, {
        start: "top 85%",
        onEnter: (batch) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            overwrite: true,
          }),
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            opacity: 0,
            y: 44,
            duration: 0.4,
            ease: "power2.in",
            overwrite: true,
          }),
      });

      const headline = startSectionRef.current.querySelector(".mobile-app-figma-headline");
      if (headline) {
        gsap.set(headline, { opacity: 0.3 });
        gsap.to(headline, {
          opacity: 1,
          ease: "none",
          scrollTrigger: {
            trigger: startSectionRef.current,
            start: "top 60%",
            end: "top 30%",
            scrub: true,
          },
        });
      }

      // Parallax like the home showcase: the logo lags behind the page scroll,
      // so the stats travel over the watermark the way the cards do on home.
      const logoParallax = startSectionRef.current.querySelector(".mobile-app-figma-logo-parallax");
      if (logoParallax) {
        gsap.fromTo(
          logoParallax,
          { y: -140 },
          {
            y: 140,
            ease: "none",
            scrollTrigger: {
              trigger: logoParallax,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          }
        );
      }
    },
    revealRootRef,
    []
  );

  useGSAP(
    () => {
      if (!startSectionRef.current) return;

      const animations = stats.map((stat, index) => {
        const statElement = statRefs.current[index];
        if (!statElement) return null;

        const match = stat.number.match(/^(\d+)(.*)$/);
        const targetValue = match ? Number(match[1]) : 0;
        const suffix = match?.[2] || "";
        const counter = { value: 0 };

        statElement.textContent = `0${suffix}`;

        return gsap.to(counter, {
          value: targetValue,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statElement,
            start: "top 88%",
            // Restart the 0 -> value count every time the stats re-enter the
            // viewport, whether scrolling down into them or back up to them.
            toggleActions: "restart none restart none",
          },
          onUpdate: () => {
            statElement.textContent = `${Math.floor(counter.value)}${suffix}`;
          },
          onComplete: () => {
            statElement.textContent = stat.number;
          },
        });
      });

      return () => {
        animations.forEach((animation) => animation?.kill());
      };
    },
    startSectionRef,
    []
  );

  return (
    <div ref={revealRootRef}>
      {/* Section paddings mirror the home showcase (.figmaSection): 92/110px on mobile, clamp() on md+. */}
      <section ref={startSectionRef} className="relative overflow-hidden bg-black pt-[92px] pb-[110px] md:pt-[clamp(112px,12vw,230px)] md:pb-[clamp(140px,13vw,250px)]">
        {/* Fixed-height wrapper so the glow + gradient render at the same scale as the home showcase section, regardless of this section's height. */}
        <div className="pointer-events-none absolute left-0 top-0 w-full h-[clamp(900px,93.75vw,1800px)]">
          <BeforeImage image={beforeImage} alt="" />
        </div>
        <Inner className="relative">
          {/* Intro sized like home's .figmaIntro but left-aligned within the container. */}
          <div className="relative z-20 mb-[100px] w-full max-w-[938px] md:mb-[clamp(64px,20vw,380px)]">
            {intro.title ? (
              <h2 className="mobile-app-figma-headline [font-family:var(--font-inter)] text-[clamp(24px,6.7vw,34px)] font-normal leading-[1.2] tracking-[-0.025em] text-white md:text-[clamp(38px,2.813vw,54px)] md:leading-[1.15]">
                {intro.title}
              </h2>
            ) : null}
            {intro.description ? (
              <p className="mobile-app-figma-reveal mt-[22px] [font-family:var(--font-inter)] text-[16px] leading-[1.55] text-white/[0.82] md:mt-[30px] md:text-[clamp(18px,1.146vw,22px)] md:leading-[1.48]">
                {intro.description}
              </p>
            ) : null}
            {intro.ctaLabel?.trim() ? (
              <div className="mobile-app-figma-reveal mt-[34px]">
                <FigmaButton>{intro.ctaLabel}</FigmaButton>
              </div>
            ) : null}
          </div>

          <div className="relative">
            {/* Watermark logo like home's .figmaCardsLogo: centered on the top edge of the block, half above it. */}
            <div
              className="pointer-events-none absolute left-1/2 top-0 z-0 h-[clamp(160px,42vw,240px)] w-[min(350px,78vw)] -translate-x-1/2 -translate-y-1/2 md:h-[clamp(220px,28vw,380px)] md:w-[min(600px,72vw)]"
              aria-hidden
            >
              {/* Inner wrapper gets the GSAP parallax so it doesn't clobber the Tailwind centering transform above. */}
              <div className="mobile-app-figma-logo-parallax relative h-full w-full">
                {logoImage ? (
                  <Image src={logoImage} alt="" fill className="object-contain" unoptimized />
                ) : null}
              </div>
            </div>
            <div className="relative z-10 flex flex-col gap-10 text-white sm:grid sm:grid-cols-2 lg:flex lg:h-[112px] lg:flex-row lg:items-start lg:justify-between lg:gap-0">
              {stats.map((stat, index) => (
                <div key={stat.label} className={`${stat.width} max-w-full mobile-app-figma-reveal`}>
                  <p
                    ref={(element) => {
                      statRefs.current[index] = element;
                    }}
                    className="font-gilroy text-[40px] font-medium leading-none md:text-[clamp(48px,4.167vw,80px)]"
                  >
                    {stat.number}
                  </p>
                  <p className="mt-[14px] whitespace-nowrap font-gilroy text-[15px] font-medium leading-[22px] md:mt-[clamp(24px,2.188vw,42px)] md:text-[clamp(16px,1.042vw,20px)] md:leading-[1.5]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Inner>
      </section>

      {renderIndustries && industries ? (
        /* md:pt complements the previous section's clamp() bottom padding so the total gap stays at the original 317px. */
        <section className="overflow-hidden bg-black pt-[120px] pb-[120px] md:pt-[calc(317px_-_clamp(140px,min(13vw,23.408vh),250px))] md:pb-[clamp(150px,min(17.24vw,30.993vh),331px)]">
          <Inner>
            <h2 className="mobile-app-figma-reveal font-graphik text-[36px] font-medium leading-[1.1] text-white md:text-[clamp(32px,min(2.5vw,4.494vh),48px)]">
              {industries.title}
            </h2>
            <div ref={industriesPinRef} className="mt-[81px] md:mt-[clamp(42px,min(4.219vw,7.584vh),81px)]">
              <div ref={industriesTrackRef} className="flex w-max gap-4 will-change-transform md:gap-[clamp(18px,min(1.667vw,2.996vh),32px)]">
                {groupIndustryCards(industries.cards).map((column, columnIndex) =>
                  column.length > 1 ? (
                    <div
                      key={`industry-col-${columnIndex}`}
                      className="flex w-[300px] flex-col gap-[19px] md:w-[clamp(322px,min(29.479vw,52.996vh),566px)] md:gap-[clamp(18px,min(1.771vw,3.184vh),34px)]"
                    >
                      {column.map((card, cardIndex) => (
                        <IndustryCard
                          key={`${card.title}-${columnIndex}-${cardIndex}`}
                          card={card}
                        />
                      ))}
                    </div>
                  ) : (
                    <IndustryCard
                      key={`${column[0].title}-${columnIndex}`}
                      card={column[0]}
                    />
                  ),
                )}
              </div>
            </div>
          </Inner>
        </section>
      ) : null}

      {/* Testimonials + client logos: same layout and styling as the about-us page proof section. */}
      {(testimonials?.length || clientLogos?.length) ? (
        <section className={aboutStyles.proofSection} aria-label="Testimonials and client logos">
          {testimonials?.length ? (
            <div className={`mobile-app-figma-reveal ${aboutStyles.testimonialBand}`}>
              <FigmaHomeTestimonials testimonials={testimonials} />
            </div>
          ) : null}

          {clientLogos?.length ? (
            <div className={`mobile-app-figma-reveal ${aboutStyles.logoGridSection}`} aria-label="Client logos">
              <div className={aboutStyles.logoGrid}>
                {clientLogos.map((logo, index) => (
                  <div key={`${logo.alt}-${index}`} className={aboutStyles.logoItem}>
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={280}
                      height={140}
                      loading="eager"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {renderWhyCards && whyCards ? (
        <section className={whyCardsSectionClassName}>
          <div className="pointer-events-none absolute left-[-465.59px] top-[170px] hidden h-[1799px] w-[1920px] md:block">
            <div className="flex h-full w-full -scale-y-100 rotate-180 items-center justify-center">
              <img
                alt=""
                src={APP_FIGMA_WHY_MASK_IMAGE}
                className="absolute inset-0 block size-full max-w-none"
              />
            </div>
          </div>
          <Inner className="relative !max-w-[1307px]">
            <div className="max-w-[1049px]">
              <h2 className="mobile-app-figma-reveal font-graphik text-[38px] font-medium leading-[1.18] text-white md:text-[clamp(38px,2.813vw,54px)] md:leading-[1.278]">
                {whyCards.title}
              </h2>
              <p className="mobile-app-figma-reveal mt-[53px] max-w-[1036px] text-[18px] leading-[1.55] text-white md:text-[clamp(18px,1.25vw,24px)] md:leading-[1.375]">
                {whyCards.description}
              </p>
              <div className="mobile-app-figma-reveal mt-[53px]">
                <FigmaButton>{whyCards.ctaLabel}</FigmaButton>
              </div>
            </div>

            <div className="mt-[138px] flex flex-col gap-[49px] md:mt-[clamp(80px,7.188vw,138px)] md:flex-row md:items-start md:gap-[clamp(28px,2.552vw,49px)]">
              <div className="flex w-full flex-col gap-[49.026px] md:gap-[clamp(28px,2.554vw,49.026px)]">
                {whyCards.cards
                  .filter((_, index) => index % 2 === 0)
                  .map((card, index) => (
                    <WhyCard key={`why-left-${card.title}-${index}`} {...card} />
                  ))}
              </div>
              {whyCards.cards.some((_, index) => index % 2 === 1) ? (
                <div className="flex w-full flex-col gap-[49.026px] md:mt-[clamp(64px,5.818vw,111.701px)] md:gap-[clamp(28px,2.554vw,49.026px)]">
                  {whyCards.cards
                    .filter((_, index) => index % 2 === 1)
                    .map((card, index) => (
                      <WhyCard
                        key={`why-right-${card.title}-${index}`}
                        {...card}
                      />
                    ))}
                </div>
              ) : null}
            </div>
          </Inner>
        </section>
      ) : null}

      {renderWhyFullImage && whyFullImage ? (
        <WhyFullImageSection whyFullImage={whyFullImage} />
      ) : null}

      {renderProcess && process ? (
        <ProcessCardsSection process={process} />
      ) : null}

      {renderAugmentedSection && augmentedSection ? (
        <AugmentedSection section={augmentedSection} />
      ) : null}

      {renderTechnologies && technologies ? (
        <section className={technologiesSectionClassName}>
          <Inner className="!max-w-[1307px]">
            <h2 className="mobile-app-figma-reveal [text-box-edge:cap_alphabetic] [text-box-trim:trim-both] [word-break:break-word] w-[914px] max-w-full font-graphik text-[32px] font-medium leading-[42px] text-white md:text-[clamp(35px,2.604vw,50px)] md:leading-[1.28] md:whitespace-nowrap">
              {technologies.title}
            </h2>
          </Inner>
          {/* Logical start margin: left gap in EN, right gap in Arabic (RTL) where the track slides left-to-right. */}
          <div className="mt-[117px] md:mt-[clamp(70px,6.094vw,117px)] ms-[max(20px,calc((100vw-1307px)/2))]">
            <div ref={technologiesPinRef}>
              <div ref={technologiesTrackRef} className="flex w-max gap-4 will-change-transform md:gap-[clamp(20px,1.667vw,32px)]">
                {technologies.cards.map((tech, index) => (
                  <TechnologyCard key={`${tech.title}-${index}`} tech={tech} />
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ProcessCardsSection({
  process,
}: {
  process: NonNullable<AppFigmaSectionsContent["process"]>;
}) {
  return (
    <section className="overflow-hidden bg-black pb-[200px] md:pb-[clamp(120px,10.417vw,200px)]">
      <Inner className="!max-w-[1308px]">
        <h2 className="mobile-app-figma-reveal font-graphik text-[32px] font-medium leading-[42px] text-white md:text-[clamp(35px,2.604vw,50px)] md:leading-[1.28]">
          {process.title}
        </h2>
        <div className="mt-[72px] grid gap-5 md:mt-[clamp(72px,4.219vw,81px)] md:grid-cols-3 md:gap-[clamp(20px,2.344vw,45px)]">
          {process.cards.map((card) => (
            <article
              key={card.title}
              className="mobile-app-figma-reveal flex min-h-[260px] flex-col justify-between rounded-[10px] bg-[#141414] px-7 py-8 text-white md:min-h-[314px] md:px-[43px] md:py-[44px]"
            >
              <h3 className="font-gilroy text-[26px] font-bold leading-[34px] capitalize md:text-[clamp(26px,1.563vw,30px)] md:leading-[1.333]">
                {card.title}
              </h3>
              <p className="font-inter text-[16px] leading-[1.55] text-white/80 md:text-[clamp(16px,1.042vw,20px)] md:leading-[1.5]">
                {card.text}
              </p>
            </article>
          ))}
        </div>
      </Inner>
    </section>
  );
}

function WhyFullImageSection({
  whyFullImage,
}: {
  whyFullImage: AppFigmaWhyFullImageContent;
}) {
  const imageSrc =
    typeof whyFullImage.image === "string"
      ? whyFullImage.image
      : whyFullImage.image.src;

  return (
    <section className="relative overflow-hidden bg-black pt-[118px] pb-[86px] md:pt-[clamp(150px,14.48vw,278px)] md:pb-[clamp(112px,11.51vw,221px)]">
      <div className="pointer-events-none absolute left-[-465.59px] top-[170px] hidden h-[1799px] w-[1920px] md:block">
        <div className="flex h-full w-full -scale-y-100 rotate-180 items-center justify-center">
          <img
            alt=""
            src={APP_FIGMA_WHY_MASK_IMAGE}
            className="absolute inset-0 block size-full max-w-none"
          />
        </div>
      </div>

      <Inner className="relative !max-w-[1307px]">
        <div className="mobile-app-figma-reveal max-w-[1049px]">
          <h2 className="font-graphik text-[38px] font-medium leading-[1.18] text-white md:text-[clamp(38px,2.813vw,54px)] md:leading-[1.278]">
            {whyFullImage.title}
          </h2>
          <p className="mt-[32px] max-w-[1036px] font-inter text-[17px] leading-[1.6] text-white md:mt-[53px] md:text-[clamp(18px,1.25vw,24px)] md:leading-[1.375]">
            {whyFullImage.description}
          </p>
          <div className="mt-[34px] md:mt-[53px]">
            <FigmaButton>{whyFullImage.ctaLabel}</FigmaButton>
          </div>
        </div>
      </Inner>

      <div className="mobile-app-figma-reveal relative mt-[76px] h-[clamp(360px,58.288vw,1119px)] w-full overflow-hidden md:mt-[clamp(88px,7.448vw,143px)]">
        <img
          src={imageSrc}
          alt=""
          className="absolute inset-0 h-full w-full max-w-none object-cover object-center"
        />
      </div>
    </section>
  );
}

function AugmentedSection({
  section,
}: {
  section: AppFigmaAugmentedSectionContent;
}) {
  const imageSrc =
    typeof section.image === "string" ? section.image : section.image.src;
  const imageClassName =
    section.imageCrop === "bottom-pinned"
      ? "absolute bottom-0 left-0 h-[125.7%] w-full max-w-none object-cover"
      : section.imageCrop === "bottom-offset"
        ? "absolute bottom-[-17.1%] left-0 h-[125.7%] w-full max-w-none object-cover"
      : section.imageCrop === "top-offset-gradient"
        ? "absolute left-1/2 top-[-5.5%] h-[125.7%] w-full max-w-none -translate-x-1/2 object-cover"
      : "absolute left-0 top-[-20.3%] h-[125.7%] w-full max-w-none object-cover";
  const showImageGradient = section.imageCrop === "top-offset-gradient";

  return (
    <section className="overflow-hidden bg-[#050003] px-5 py-[88px] sm:px-8 md:px-[clamp(64px,8.333vw,160px)] md:py-[clamp(96px,7.292vw,140px)]">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-[56px] md:gap-[80px]">
        <div className="mobile-app-figma-reveal flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="w-full max-w-[739px]">
            <h2 className="font-graphik text-[34px] font-medium leading-[1.18] text-white md:text-[clamp(38px,2.5vw,48px)] md:leading-[1.438]">
              {section.title}
            </h2>
          </div>
          <div className="flex w-full max-w-[706px] flex-col items-start gap-[30px] lg:min-h-[172px] lg:justify-between">
            <p className="font-inter text-[18px] font-normal leading-[1.55] text-white md:text-[clamp(18px,1.25vw,24px)] md:leading-[1.375]">
              {section.description}
            </p>
            <FigmaButton>{section.ctaLabel}</FigmaButton>
          </div>
        </div>

        <div className="mobile-app-figma-reveal relative h-[320px] w-full overflow-hidden rounded-[24px] bg-[#141414] sm:h-[430px] md:h-[clamp(430px,31.25vw,600px)]">
          <img
            src={imageSrc}
            alt=""
            className={imageClassName}
          />
          {showImageGradient ? (
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[rgba(19,19,19,0)] from-[39.45%] to-[rgba(19,19,19,0.7)]" />
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-2 md:gap-[32px]">
          {section.posts.map((post) => (
            <article
              key={post.title}
              className="mobile-app-figma-reveal flex min-h-[360px] flex-col items-start justify-between gap-[27px] rounded-[16px] border border-[#828282] bg-[#141414] p-7 text-white shadow-[0px_4px_10px_rgba(0,0,0,0.05)] md:min-h-[380px] md:p-[40px]"
            >
              <p className="font-inter text-[14px] font-normal leading-[26px] md:text-[16px]">
                {post.date}
              </p>
              <div className="flex w-full flex-col gap-1">
                <h3 className="font-inter text-[21px] font-bold leading-[1.32] md:text-[24px] md:leading-[35px]">
                  {post.title}
                </h3>
                <p className="font-inter text-[15px] font-normal leading-[1.6] md:text-[16px] md:leading-[26px]">
                  {post.description}
                </p>
              </div>
              <FigmaButton>{post.ctaLabel}</FigmaButton>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function IndustryCard({ card }: { card: AppFigmaIndustryCard }) {
  const layoutKey = resolveIndustryCardLayout(card.layout);
  const layout = INDUSTRY_LAYOUT_PRESETS[layoutKey];
  const compact = layout.compact;
  const variant = card.variant || layout.defaultVariant;
  const size = layout.size;
  const shadow = layout.shadow;

  const isEcommerce = variant === "ecommerce";
  const isGame = variant === "game";
  const isTravel = variant === "travel";
  const hasLayeredMedia = Boolean(card.bg || card.art || card.foreground);
  /** Prefer layered bg/art/foreground when provided; else legacy single image. */
  const compositeImage = hasLayeredMedia ? undefined : card.image;
  const bgImage = card.bg || (hasLayeredMedia ? undefined : card.image);
  const hasMedia = Boolean(bgImage || compositeImage || card.art || card.foreground);

  return (
    <article
      className={`${size} ${shadow} mobile-app-figma-reveal relative shrink-0 overflow-hidden rounded-[19px] ${
        compact || isEcommerce || isTravel ? "border border-[#585858]" : ""
      } ${
        isEcommerce || !hasMedia
          ? "bg-black"
          : "bg-[rgba(255,255,255,0)]"
      }`}
    >
      {bgImage || compositeImage ? (
        <div className={`absolute inset-0 overflow-hidden pointer-events-none ${isTravel ? "rounded-[21px]" : "rounded-[19px]"}`}>
          <img
            alt=""
            src={bgImage || compositeImage}
            className={`absolute max-w-none ${
              isGame
                ? "h-[100.02%] left-[-6.77%] top-[-0.01%] w-[113.54%]"
                : isTravel
                  ? "h-[99.98%] left-0 top-[0.01%] w-[111.04%]"
                  : variant === "event"
                    ? "h-[118.89%] left-[-0.01%] top-0 w-[100.02%]"
                    : variant === "on-demand"
                      ? "h-[104.08%] left-0 top-0 w-full"
                      : "inset-0 size-full object-bottom rounded-[20px]"
            }`}
          />
          {isTravel ? <div className="absolute inset-0 rounded-[21px] bg-black" /> : null}
        </div>
      ) : null}
      {card.art ? (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[19px]">
          <img
            alt=""
            src={card.art}
            className="absolute inset-0 size-full max-w-none object-cover"
          />
        </div>
      ) : null}
      {card.foreground ? (
        <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-[19px]">
          <img
            alt=""
            src={card.foreground}
            className="absolute inset-0 size-full max-w-none object-contain object-bottom"
          />
        </div>
      ) : null}
      {/* Logical start/end offsets so card copy mirrors to the right edge in Arabic (RTL). */}
      <div
        className={`absolute z-10 flex h-6 -translate-y-1/2 flex-col justify-center text-white md:h-9 ${
          compact ? "start-[7.25%]" : "start-6 md:start-[8.48%]"
        } ${
          isTravel
            ? "top-[calc(50%-38px)] md:top-[22.24%]"
            : isGame
              ? "top-[calc(50%-35px)] md:top-[24.88%]"
              : compact
                ? "top-[calc(50%-38px)] md:top-[22.24%]"
                : "top-[31px] md:top-[10.28%]"
        }`}
      >
        <p className="max-w-[calc(100%_-_32px)] font-inter text-[18px] font-semibold leading-[22px] tracking-[0] md:text-[clamp(19px,min(1.505vw,2.706vh),28.9px)] md:leading-[1.246]">
          {card.title}
        </p>
      </div>
      <p
        className={`absolute z-10 max-w-[calc(100%_-_48px)] font-inter text-[12px] font-normal leading-4 text-white/80 md:text-[clamp(12px,min(0.833vw,1.498vh),16px)] md:leading-[1.5] ${
          compact ? "start-[7.25%]" : "start-6 md:start-[8.48%]"
        } ${
          isGame
            ? "end-[24px] top-[calc(50%-9px)] h-auto md:end-[21.12%] md:top-[34.69%] md:h-auto"
            : isTravel
              ? "end-[24px] top-[calc(50%-12px)] h-auto md:end-[30.5%] md:top-[32.13%] md:h-auto"
              : compact
                ? "end-[24px] top-[calc(50%-12px)] h-auto md:end-[37.35%] md:top-[32.13%] md:h-auto"
                : variant === "on-demand"
                  ? "end-[70px] top-[57px] h-auto text-white/[0.98] md:end-[35.08%] md:top-[14.89%]"
                  : "end-[70px] top-[57px] h-auto md:end-[24.38%] md:top-[14.89%]"
        }`}
      >
        {card.text}
      </p>
    </article>
  );
}

function TechnologyCard({ tech }: { tech: AppFigmaTechnologyCard }) {
  const preset = resolveTechVariantPreset(tech.variant);
  const isLight = tech.variant === "light" || tech.variant === "icon";
  const textColor = isLight ? "text-black" : "text-white";
  const rectBg = preset.bg;
  const isImageCard = ["ai", "ar", "metaverse"].includes(tech.variant);

  return (
    <article className="mobile-app-figma-reveal relative h-[299px] w-[236px] shrink-0 md:h-[clamp(330px,25.99vw,499px)] md:w-[clamp(280px,22.708vw,436px)]">
      <div
        className={`absolute inset-0 ${rectBg} overflow-hidden rounded-[10px] border border-[#bfbfbf] border-solid`}
      >
        {tech.variant === "ai" && tech.image ? (
          <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[10px]">
            <div className="absolute inset-0 rounded-[10px] bg-[#7222dd]" />
            <div className="absolute inset-0 overflow-hidden rounded-[10px]">
              <img
                alt=""
                src={tech.image}
                className="absolute h-[68.34%] left-[31.94%] max-w-none top-[31.66%] w-[78.22%]"
              />
            </div>
          </div>
        ) : null}
        {tech.variant === "ar" && tech.image ? (
          <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[10px]">
            <div className="absolute inset-0 rounded-[10px] bg-[#b351db]" />
            <div className="absolute inset-0 overflow-hidden rounded-[10px]">
              <img
                alt=""
                src={tech.image}
                className="absolute h-[62.53%] left-0 max-w-none top-[37.47%] w-[63.74%]"
              />
            </div>
          </div>
        ) : null}
        {tech.variant === "metaverse" && tech.image ? (
          <div aria-hidden className="absolute inset-0 pointer-events-none rounded-[10px]">
            {tech.baseImage ? (
              <div className="absolute inset-0 overflow-hidden rounded-[10px]">
                <img
                  alt=""
                  src={tech.baseImage}
                  className="absolute h-[86.97%] left-[0.23%] max-w-none top-[6.91%] w-[99.54%]"
                />
              </div>
            ) : null}
            <div className="absolute inset-0 rounded-[10px] bg-gradient-to-b from-[rgba(255,255,255,0.6)] via-[rgba(255,255,255,0)] via-[45.192%] to-white" />
            <div className="absolute inset-0 rounded-[10px] bg-[#01062c]" />
            <div className="absolute inset-0 overflow-hidden rounded-[10px]">
              <img
                alt=""
                src={tech.image}
                className="absolute h-[87.37%] left-0 max-w-none top-[28.13%] w-full"
              />
            </div>
          </div>
        ) : null}
        {tech.variant === "icon" && tech.icon ? (
          <div
            aria-hidden
            className={`pointer-events-none absolute ${preset.iconClassName}`}
          >
            <Image
              src={tech.icon}
              alt=""
              fill
              className="object-contain"
              unoptimized
            />
          </div>
        ) : null}
      </div>

      <p
        className={`absolute ${preset.titleClassName} ${textColor} [text-box-edge:cap_alphabetic] [text-box-trim:trim-both] font-graphik text-[18px] font-semibold leading-[22px] not-italic whitespace-nowrap [word-break:break-word] md:text-[clamp(21px,1.563vw,30px)] md:leading-[1.17]`}
      >
        {tech.title}
      </p>

      <p
        className={`absolute ${preset.textClassName} ${textColor} [text-box-edge:cap_alphabetic] [text-box-trim:trim-both] font-graphik text-[13px] font-normal leading-[18px] not-italic [word-break:break-word] md:text-[clamp(16px,1.146vw,22px)] md:leading-[1.36] ${isImageCard ? "" : "flex flex-col justify-end"}`}
      >
        {tech.text}
      </p>
    </article>
  );
}

function WhyCard({
  title,
  text,
  bg,
  art,
  foreground,
  foregroundPosition,
  exact,
  variant,
  className = "",
}: AppFigmaWhyCard & {
  className?: string;
}) {
  const isProduct = variant === "product";
  const isNative = variant === "native";
  const isQa = variant === "qa";
  const isUi = variant === "ui";
  // Prefer layered CMS assets (bg/art/foreground) over a flattened exact export.
  const useLayered = Boolean(art || foreground || (bg && !exact));
  const showExact = Boolean(exact) && !useLayered;
  const fgPosition = resolveWhyForegroundPosition(foregroundPosition);
  const fgClassName = WHY_FOREGROUND_POSITION_CLASS[fgPosition];
  // Static QA art uses a fixed Figma crop window. Use it for QA cards and for
  // CMS "bottom-right" foreground (same placement as that static graphic).
  const useQaStaticCrop = isQa || (Boolean(foreground) && fgPosition === "bottom-right");
  const qaCropSrc = foreground || (isQa ? art : undefined);

  return (
    <article
      className={`mobile-app-figma-reveal relative aspect-[629/627] h-auto w-full max-w-full overflow-hidden rounded-[21.115px] border border-[rgba(157,157,157,0.46)] md:w-[clamp(330px,32.76vw,629px)] ${className}`}
    >
      {showExact ? (
        <img
          alt=""
          src={exact}
          className="absolute inset-0 size-full max-w-none object-cover"
        />
      ) : null}
      {showExact ? null : (
      <>
      {bg ? (
        <img
          alt=""
          src={bg}
          className={`absolute max-w-none pointer-events-none ${
            isProduct
              ? "h-[104.08%] left-0 top-0 w-full"
              : isNative || isQa
                ? "inset-0 size-full object-bottom rounded-[21.115px]"
                : "h-[104.08%] left-0 top-0 w-full"
          }`}
        />
      ) : null}
      {isNative ? <div className="absolute inset-0 rounded-[21.115px] bg-white/20" /> : null}
      {isQa ? (
        <div
          className="absolute inset-0 rounded-[21.115px]"
          style={{
            backgroundImage:
              "linear-gradient(128.297deg, rgba(0,0,0,0) 40.149%, rgba(0,0,0,0.4) 92.867%), linear-gradient(90deg, rgba(36,79,255,0.69) 0%, rgba(36,79,255,0.69) 100%)",
          }}
        />
      ) : null}
      {isUi && art ? (
        <div className="absolute inset-0 overflow-hidden rounded-[20px]">
          <img alt="" src={art} className="absolute h-[118.89%] left-[-0.01%] top-0 w-[100.02%] max-w-none" />
          <div className="absolute inset-0 rounded-[20px] bg-[rgba(13,251,193,0.57)]" />
        </div>
      ) : null}
      {foreground && !useQaStaticCrop ? (
        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden rounded-[21.115px]">
          <img
            alt=""
            src={foreground}
            className={`${fgClassName} mix-blend-lighten`}
          />
        </div>
      ) : null}
      {isProduct && art ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-full w-full -scale-y-100">
            <div className="relative h-full w-full">
              <div className="absolute bottom-[-15.15%] left-[-4.29%] right-[-15.1%] top-[-4.31%]">
                <img alt="" src={art} className="block h-full w-full max-w-none" />
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {isNative && art ? (
        <img
          alt=""
          src={art}
          className="absolute bottom-0 left-1/2 h-auto w-[104.75%] max-w-none -translate-x-1/2"
        />
      ) : null}
      {useQaStaticCrop && qaCropSrc ? (
        <div className="absolute left-[38.86%] top-[25.81%] z-[1] h-[75.96%] w-[59.64%] overflow-hidden">
          <img
            alt=""
            src={qaCropSrc}
            className="absolute left-[-90.43%] top-0 h-full w-[190.43%] max-w-none"
          />
        </div>
      ) : null}
      </>
      )}
      {showExact ? null : (
      /* Title + description flow in one anchored block so a longer title can
         never overlap the description: the text always starts below it. */
      <div className={`absolute z-10 ${
        isNative
          ? "left-[7.09%] right-[24px] top-[7.15%] md:right-[34.85%]"
          : isQa
            ? "left-[7.78%] right-[24px] top-[9.63%] md:right-auto md:w-[55.64%]"
            : isUi
              ? "left-[24px] right-[24px] top-[32px] md:left-[6.29%] md:right-[37.81%] md:top-[9.02%]"
              : "left-[24px] right-[24px] top-[34px] md:left-[7.23%] md:right-[34.99%] md:top-[9.77%]"
      }`}>
        <h3 className="font-graphik text-[22px] font-medium leading-[28px] text-white md:text-[clamp(22px,2.188vw,42px)] md:leading-[1.266]">
          {title}
        </h3>
        <p className="mt-2 font-inter text-[14px] leading-[20px] text-white md:mt-[clamp(6px,0.52vw,10px)] md:text-[clamp(13px,0.938vw,18px)] md:leading-[1.444]">
          {text}
        </p>
      </div>
      )}
    </article>
  );
}
