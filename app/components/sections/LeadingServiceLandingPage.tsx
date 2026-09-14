/**
 * Shared CMS-driven Leading Services landing page (same ACF group as mobile-app).
 * CMS-only — no static / home proof content fallbacks.
 */

import type { CSSProperties, ReactNode } from "react";
import type { Metadata } from "next";
import type { AccordionItem } from "@/app/components/sections/Accordion";
import Accordion from "@/app/components/sections/Accordion";
import AppFigmaSections, {
  type AppFigmaSectionsContent,
} from "@/app/components/sections/AppFigmaSections";
import FigmaHomeOurWork from "@/app/components/sections/FigmaHomeOurWork";
import ProjectContactForm from "@/app/components/sections/ProjectContactForm";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import PageBanner from "@/app/components/ui/PageBanner";
import FadeUpReveal from "@/app/components/ui/FadeUpReveal";
import SlideUpReveal from "@/app/components/ui/SlideUpReveal";
import MobileAppBannerHeadline from "@/app/components/sections/MobileAppBannerHeadline";
import WebAppBannerHeadline from "@/app/components/sections/WebAppBannerHeadline";
import LogoAppBannerHeadline from "@/app/components/sections/LogoAppBannerHeadline";
import SeoAppBannerHeadline from "@/app/components/sections/SeoAppBannerHeadline";
import MarketingAppBannerHeadline from "@/app/components/sections/MarketingAppBannerHeadline";
import SalesforceBannerHeadline from "@/app/components/sections/SalesforceBannerHeadline";
import RealEstateBannerHeadline from "@/app/components/sections/RealEstateBannerHeadline";
import EducationBannerHeadline from "@/app/components/sections/EducationBannerHeadline";
import HealthcareBannerHeadline from "@/app/components/sections/HealthcareBannerHeadline";
import EcommerceAppBannerHeadline from "@/app/components/sections/EcommerceAppBannerHeadline";
import RetailEcommerceBannerHeadline from "@/app/components/sections/RetailEcommerceBannerHeadline";
import WordpressBannerHeadline from "@/app/components/sections/WordpressBannerHeadline";
import ReactBannerHeadline from "@/app/components/sections/ReactBannerHeadline";
import FlutterAppBannerHeadline from "@/app/components/sections/FlutterAppBannerHeadline";
import BankingBannerHeadline from "@/app/components/sections/BankingBannerHeadline";
import DigitalSolutionsBannerHeadline from "@/app/components/sections/DigitalSolutionsBannerHeadline";
import FmcgBannerHeadline from "@/app/components/sections/FmcgBannerHeadline";
import EnergyBannerHeadline from "@/app/components/sections/EnergyBannerHeadline";
import TechnologyBannerHeadline from "@/app/components/sections/TechnologyBannerHeadline";
import UiUxBannerHeadline from "@/app/components/sections/UiUxBannerHeadline";
import "./SecurityAppBannerHeadline.css";
import { SECTION_HEADING_SIZE_CLASS } from "@/app/components/sections/section-heading";
import { fetchDefaultContactFormProps } from "@/app/lib/contact-api";
import { buildLandingPageJsonLd } from "@/app/lib/landing-aeo";
import {
  fetchLandingYoastSeo,
  generateLandingMetadata,
} from "@/app/lib/landing-seo";
import {
  fetchLeadingServiceForRoute,
  getLeadingServicesTemplate,
} from "@/app/lib/leading-services-api";
import type {
  LeadingServiceBanner,
  LeadingServiceBannerLayer,
} from "@/app/lib/leading-services-normalize";
import { normalizeLeadingServiceTemplate } from "@/app/lib/leading-services-normalize";

export type LeadingServiceLandingConfig = {
  /** Next.js route slug, e.g. "web-app". */
  routeSlug: string;
  /** Canonical path with trailing slash, e.g. "/web-app/". */
  path: string;
  /** Optional WP leading_service database ID (or env LEADING_SERVICE_*_ID). */
  databaseId?: string | null;
  /** Title match hints when resolving the CPT by list. */
  titleHints?: string[];
  /** Optional JSON-LD label; only used if CMS banner title is empty. Prefer CMS. */
  jsonLdPageTitle?: string;
};

const emptyContent: AppFigmaSectionsContent = {
  beforeImage: "",
  logoImage: "",
  intro: { title: "", description: "", ctaLabel: "" },
  stats: [],
};

function resolveDatabaseId(config: LeadingServiceLandingConfig): string | undefined {
  const envKey = `LEADING_SERVICE_${config.routeSlug
    .toUpperCase()
    .replace(/-/g, "_")}_ID`;
  const fromEnv = process.env[envKey]?.trim();
  if (fromEnv) return fromEnv;

  const fromConfig = config.databaseId?.trim();
  if (fromConfig) return fromConfig;

  return process.env.LEADING_SERVICE_PAGE_ID?.trim() || undefined;
}

export async function generateLeadingServiceLandingMetadata(
  config: LeadingServiceLandingConfig
): Promise<Metadata> {
  return generateLandingMetadata({
    routeSlug: config.routeSlug,
    path: config.path,
    databaseId: resolveDatabaseId(config),
    // Static SEO fallback — disabled; Yoast only.
  });
}

export default async function LeadingServiceLandingPage({
  config,
}: {
  config: LeadingServiceLandingConfig;
}) {
  const databaseId = resolveDatabaseId(config);

  const cmsNode = await fetchLeadingServiceForRoute({
    routeSlug: config.routeSlug,
    databaseId,
    titleHints: config.titleHints ?? [config.routeSlug.replace(/-/g, " ")],
  });
  const cms = normalizeLeadingServiceTemplate(
    getLeadingServicesTemplate(cmsNode)
  );

  const contactForm = await fetchDefaultContactFormProps();

  // CMS only — no static / proof fallbacks.
  const content = cms?.content ?? emptyContent;
  const bannerTitle = cms?.bannerTitle || "";
  const faqItems: AccordionItem[] = cms?.faqs ?? [];
  const testimonials = cms?.testimonials ?? [];
  const clientLogos = cms?.clientLogos ?? [];

  const showIndustries = cms?.toggles.showIndustries ?? false;
  const showWhyCards = cms?.toggles.showWhyCards ?? false;
  const showWhyFullImage = cms?.toggles.showWhyFullImage ?? false;
  const showProcess = cms?.toggles.showProcess ?? false;
  const showAugmentedSection = cms?.toggles.showAugmentedSection ?? false;
  const showTechnologies = cms?.toggles.showTechnologies ?? false;
  const showOurWork = cms?.toggles.showOurWork ?? false;
  const showTestimonials = cms?.toggles.showTestimonials ?? false;
  const showClientLogos = cms?.toggles.showClientLogos ?? false;
  const realEstateSpacing = cms?.toggles.realEstateSpacing ?? false;

  const contactLine1 = cms?.contactHeadingLine1 || "";
  const contactLine2 = cms?.contactHeadingLine2 || "";
  const contactTitle =
    contactLine1 || contactLine2
      ? [contactLine1, contactLine2].filter(Boolean).join(" ")
      : (cms?.contactFormTitle || "").trim();

  const seo = await fetchLandingYoastSeo({
    routeSlug: config.routeSlug,
    path: config.path,
    databaseId,
  });
  const jsonLd = buildLandingPageJsonLd({
    path: config.path,
    pageTitle: bannerTitle || config.jsonLdPageTitle || "",
    faqs: faqItems,
    seo,
  });
  // Every word in this banner comes from WordPress; with nothing entered the
  // artwork stands on its own.
  const routeBanner = cms?.banner ?? null;
  const figmaBanner = routeBanner ? (
      <CmsFigmaBanner
        banner={routeBanner}
        preset={BANNER_PRESETS[config.routeSlug] ?? DEFAULT_BANNER_PRESET}
      />
    ) : null;

  return (
    <main className="relative min-h-screen bg-black">
      {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
      {figmaBanner}
      {!figmaBanner && bannerTitle ? (
        <PageBanner
          title={bannerTitle}
          minHeight="100vh"
          titleClassName="font-graphik text-[22px] font-[300] leading-[1.3] text-white sm:text-[32px] sm:leading-[1.35] md:text-[50px] md:leading-[1.4] lg:text-[65px] lg:leading-[1.35] xl:text-[80px] xl:leading-[1.3] 2xl:leading-[1.25]"
        />
      ) : null}
      <AppFigmaSections
        content={content}
        testimonials={showTestimonials ? testimonials : []}
        clientLogos={showClientLogos ? clientLogos : []}
        showIndustries={showIndustries}
        showWhyCards={showWhyCards}
        showWhyFullImage={showWhyFullImage}
        showProcess={showProcess}
        showAugmentedSection={showAugmentedSection}
        showTechnologies={showTechnologies}
        realEstateSpacing={realEstateSpacing}
      />

      {showOurWork && cms?.ourWork.items.length ? (
        <FigmaHomeOurWork
          items={cms.ourWork.items}
          titleOverride={cms.ourWork.title}
          sectionSubtitle={cms.ourWork.subtitle}
          ctaLabel={cms.ourWork.ctaLabel}
          ctaHref={cms.ourWork.ctaHref}
        />
      ) : null}

      {contactTitle ? (
        <ProjectContactForm
          title={contactTitle}
          titleLine1={contactLine1}
          titleLine2={contactLine2}
          figmaLayout
          contactForm={contactForm}
        />
      ) : null}
      {faqItems.length > 0 ? (
        <Accordion
          title="FAQs"
          items={faqItems}
          className="!min-h-0 !py-[122px]"
          titleClassName={`mx-auto mb-12 max-w-[1518px] px-5 text-left font-graphik ${SECTION_HEADING_SIZE_CLASS} leading-[42px] text-white md:leading-[1.28]`}
        />
      ) : null}
    </main>
  );
}

/**
 * Figma sizes are authored against a 1920px-wide frame. `figmaSize` caps a
 * dimension at its exact Figma pixel value and scales it down proportionally
 * below 1920px, so every layer of a banner shrinks in step with the screen.
 */
function figmaSize(px: number): string {
  return `min(${px}px, ${((px / 1920) * 100).toFixed(4)}vw)`;
}

/** Reference viewport these Figma heroes are composed against. */
const FRAME_W = 1920;
const FRAME_H = 945;

/**
 * A design dimension under contain-scaling: the viewport drives the scale by
 * width until it gets too short, then by height. Applying the same two-term
 * `min()` to the frame and to everything inside it keeps the whole composition
 * locked together — identical layout at every screen size, only the scale moves.
 */
function frameSize(px: number, frameW = FRAME_W, frameH = FRAME_H): string {
  const byWidth = ((px / frameW) * 100).toFixed(4);
  const byHeight = ((px / frameH) * 100).toFixed(4);
  return `min(${byWidth}vw, ${byHeight}vh)`;
}

/**
 * A Figma layer. `width`/`height` are its size *in the design*, against a
 * 1920px-wide frame — not the exported file's intrinsic pixels, which are often
 * 2×. Passing intrinsic pixels renders the layer at double scale.
 */
type FigmaLayer = { src: string; width: number; height: number };

type FigmaHeroBannerProps = {
  /** Colour behind every layer — what shows wherever artwork does not reach. */
  sectionBg?: string;
  background?: FigmaLayer;
  /** Autoplaying, looping background video; takes the place of `background`. */
  backgroundVideo?: FigmaLayer;
  /** CSS `background` shorthand, for artwork with no exported asset. */
  backgroundCss?: string;
  /** Scrim class over the background; pass `null` for artwork that needs none. */
  scrimClass?: string | null;
  /** Scrim as inline style, for opacities that come from the CMS at runtime. */
  scrimStyle?: CSSProperties;
  /** The `<h1>`, sized in `em` off the frame-scaled title size. */
  title?: ReactNode;
  /** Figma size of the title text. */
  titleSize?: number;
  /** Title's vertical centre, as a share of the frame. */
  titleTop?: string;
  /** "center", or a length pinning the title's left edge inside the frame. */
  titleLeft?: string;
  /**
   * Fills the frame, for compositions the single `title` block can't express —
   * e.g. words placed independently. Sits behind the foreground.
   */
  overlay?: ReactNode;
  /**
   * Paint `overlay` on the section (above the background, below the frame)
   * instead of inside the transformed composition frame. Needed for mix-blend
   * / background-clip treatments that must sample the banner artwork.
   */
  overlayInSection?: boolean;
  /**
   * Same as `overlay`, but painted after the foreground — for words that must
   * sit over the mark (e.g. /mobile-app callout chips).
   */
  overlayFront?: ReactNode;
  foreground?: FigmaLayer;
  /** Foreground's bottom edge, as a share of the frame. */
  foregroundBottom?: string;
  /** Foreground's top edge, as a share of the frame. Overrides bottom. */
  foregroundTop?: string;
  /** Foreground's horizontal centre, as a share of the frame. */
  foregroundLeft?: string;
  /** Foreground rotation in degrees. */
  foregroundRotate?: number;
  /** Extra Y translation for rotated foregrounds that are centre-anchored. */
  foregroundTranslateY?: string;
  /** Optional Figma parent wrapper used before rotating the foreground image. */
  foregroundWrapper?: {
    width: number;
    height: number;
    top: string;
    left: string;
  };
  frameWidth?: number;
  frameHeight?: number;
  /** Paint the foreground behind the title rather than over it. */
  foregroundBehindTitle?: boolean;
  /** How the foreground enters: a fade in place, or a rise from below. */
  foregroundReveal?: "fade" | "slide-up";
  /** `object-fit` for the foreground mark. Defaults to fill the slot. */
  foregroundObjectFit?: "contain" | "cover" | "fill";
  /** Where a contained mark sits in its slot. Defaults to bottom. */
  foregroundObjectPosition?: "bottom" | "center";
  /**
   * Size the mark against the viewport (vw/vh) instead of the 1920×945 frame,
   * so it grows and shrinks with the screen.
   */
  foregroundScreenFit?: boolean;
  /**
   * Position the mark against the same object-cover rectangle as the background.
   */
  foregroundBackgroundFit?: boolean;
  /**
   * Size the background to the banner (full screen) instead of the 1920×1080
   * Figma slot, so a CMS image/video covers the viewport like the mark does.
   */
  backgroundScreenFit?: boolean;
  /**
   * Section class for screen-fit heroes (e.g. `mobile-app-hero`, `web-app-hero`)
   * so each route can own its overlay CSS without sharing the other page's vars.
   */
  heroClassName?: string;
  /**
   * Replace the default `min-h-screen` on screen-fit heroes. SEO and security
   * banners are the 1920 × 1068 Figma frame, not full viewport height.
   */
  heroHeightClass?: string;
  /**
   * Header logo/menu swap: `light` uses the black logo over this banner
   * (`data-section-theme="light"`). Needed when the CMS photo is light but the
   * section's CSS background is still black.
   */
  sectionTheme?: "light" | "dark";
};

/**
 * Shared Figma hero: a background image cropped by the section, an optional
 * scrim, then a contain-scaled 1920 × 945 frame holding the title and any
 * foreground mark. Everything inside the frame scales as one composition.
 */
function FigmaHeroBanner({
  sectionBg = "#000000",
  background,
  backgroundVideo,
  backgroundCss,
  scrimClass = "bg-black/65",
  scrimStyle,
  title,
  titleSize = 306.0326,
  titleTop = "40%",
  titleLeft = "center",
  overlay,
  overlayFront,
  overlayInSection = false,
  foreground,
  foregroundBottom = "5%",
  foregroundTop,
  foregroundLeft = "50%",
  foregroundRotate = 0,
  foregroundTranslateY = "0",
  foregroundWrapper,
  frameWidth = FRAME_W,
  frameHeight = FRAME_H,
  foregroundBehindTitle = false,
  foregroundReveal = "fade",
  foregroundObjectFit = "fill",
  foregroundObjectPosition = "bottom",
  foregroundScreenFit = false,
  foregroundBackgroundFit = false,
  backgroundScreenFit = false,
  heroClassName,
  heroHeightClass,
  sectionTheme,
}: FigmaHeroBannerProps) {
  const titleCentred = titleLeft === "center";
  const scaledFrameSize = (px: number) => frameSize(px, frameWidth, frameHeight);

  const containPos =
    foregroundObjectPosition === "center" ? "object-center" : "object-bottom";
  const foregroundImgClass =
    foregroundObjectFit === "contain"
      ? `h-full w-full max-w-none object-contain ${containPos}`
      : foregroundObjectFit === "cover"
        ? `h-full w-full max-w-none object-cover ${containPos}`
        : "h-full w-full max-w-none";

  // The placement lives on the wrapper so the reveal can transform the image
  // itself without knocking it off centre.
  const foregroundLayer =
    foreground && !foregroundScreenFit && !foregroundBackgroundFit ? (
    foregroundWrapper ? (
      <div
        className="pointer-events-none absolute flex items-center justify-center"
        style={{
          left: foregroundWrapper.left,
          top: foregroundWrapper.top,
          width: scaledFrameSize(foregroundWrapper.width),
          height: scaledFrameSize(foregroundWrapper.height),
          transform: "translateX(-50%)",
          zIndex: 1,
        }}
      >
        <FadeUpReveal className="flex h-full w-full items-center justify-center">
          <div
            className="flex-none"
            style={{
              width: scaledFrameSize(foreground.width),
              height: scaledFrameSize(foreground.height),
              transform: `rotate(${foregroundRotate}deg)`,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foreground.src}
              alt=""
              aria-hidden="true"
              className={foregroundImgClass}
            />
          </div>
        </FadeUpReveal>
      </div>
    ) : (
      <div
        className="pointer-events-none absolute"
        style={{
          left: foregroundLeft,
          top: foregroundTop,
          bottom: foregroundTop ? undefined : foregroundBottom,
          width: scaledFrameSize(foreground.width),
          height: scaledFrameSize(foreground.height),
          transform: `translate(-50%, ${foregroundTranslateY}) rotate(${foregroundRotate}deg)`,
          // Sit above `overlay` (watermark) and below `overlayFront` (flanking words).
          zIndex: 1,
        }}
      >
        {foregroundReveal === "slide-up" ? (
          <SlideUpReveal className="h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foreground.src}
              alt=""
              aria-hidden="true"
              className={foregroundImgClass}
            />
          </SlideUpReveal>
        ) : (
          <FadeUpReveal className="h-full w-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foreground.src}
              alt=""
              aria-hidden="true"
              className={foregroundImgClass}
            />
          </FadeUpReveal>
        )}
      </div>
    )
  ) : null;

  const backgroundCoverClass =
    "pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover object-center";
  const backgroundFigmaClass =
    "pointer-events-none absolute left-1/2 top-1/2 -z-10 min-h-full min-w-full max-w-none -translate-x-1/2 -translate-y-1/2 object-cover";
  const screenFitHeroClass = heroClassName || "mobile-app-hero";
  const screenFitHeightClass = heroHeightClass ?? "min-h-screen";
  const coverWidth = `max(100vw, calc(100vh * ${frameWidth} / ${frameHeight}))`;
  const coverHeight = `max(100vh, calc(100vw * ${frameHeight} / ${frameWidth}))`;
  const foregroundLeftRatio =
    typeof foregroundLeft === "string" && foregroundLeft.endsWith("%")
      ? Number.parseFloat(foregroundLeft) / 100
      : 0.5;
  const foregroundTopRatio =
    typeof foregroundTop === "string" && foregroundTop.endsWith("%")
      ? Number.parseFloat(foregroundTop) / 100
      : undefined;
  const foregroundBottomRatio =
    typeof foregroundBottom === "string" && foregroundBottom.endsWith("%")
      ? Number.parseFloat(foregroundBottom) / 100
      : undefined;
  // A bottom-anchored slot is the same placement read from the other edge: the
  // layer's own height decides where its top lands inside the cover box. A slot
  // with neither edge sits on the floor, which is where these designs put it.
  const foregroundCoverTop = !foreground
    ? undefined
    : (foregroundTopRatio ??
      1 - (foregroundBottomRatio ?? 0) - foreground.height / frameHeight);

  return (
    <section
      className={
        backgroundScreenFit
          ? `${screenFitHeroClass} relative isolate w-full overflow-hidden ${screenFitHeightClass}`
          : "relative isolate min-h-[420px] w-full overflow-hidden sm:min-h-[560px] lg:min-h-screen"
      }
      style={{ backgroundColor: sectionBg }}
      {...(sectionTheme ? { "data-section-theme": sectionTheme } : {})}
    >
      {background ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={background.src}
          alt=""
          aria-hidden="true"
          className={
            backgroundScreenFit ? backgroundCoverClass : backgroundFigmaClass
          }
          style={
            backgroundScreenFit
              ? undefined
              : {
                  width: figmaSize(background.width),
                  height: figmaSize(background.height),
                }
          }
        />
      ) : null}

      {backgroundVideo ? (
        <video
          aria-hidden="true"
          className={
            backgroundScreenFit ? backgroundCoverClass : backgroundFigmaClass
          }
          style={
            backgroundScreenFit
              ? undefined
              : {
                  width: figmaSize(backgroundVideo.width),
                  height: figmaSize(backgroundVideo.height),
                }
          }
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        >
          <source src={backgroundVideo.src} type="video/mp4" />
        </video>
      ) : null}

      {/* Coded glow is the fallback; a CMS image or video replaces it. */}
      {backgroundCss && !background && !backgroundVideo ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full"
          style={{ background: backgroundCss }}
        />
      ) : null}

      {scrimClass || scrimStyle ? (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 ${scrimClass ?? ""}`}
          style={scrimStyle}
        />
      ) : null}

      {overlay && overlayInSection ? (
        <div className="pointer-events-none absolute inset-0 z-[1]">
          {overlay}
        </div>
      ) : null}

      {foreground && foregroundBackgroundFit && foregroundCoverTop != null ? (
        <div
          className={`${screenFitHeroClass}-fg pointer-events-none absolute z-[2]`}
          style={{
            left: `calc(50% - (${coverWidth} / 2) + (${coverWidth} * ${foregroundLeftRatio}))`,
            top: `calc(50% - (${coverHeight} / 2) + (${coverHeight} * ${foregroundCoverTop}))`,
            width: `calc(${coverWidth} * ${foreground.width / frameWidth})`,
            height: `calc(${coverHeight} * ${foreground.height / frameHeight})`,
            transform: `translate(-50%, ${foregroundTranslateY}) rotate(${foregroundRotate}deg)`,
          }}
        >
          {foregroundReveal === "slide-up" ? (
            <SlideUpReveal className="h-full w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foreground.src}
                alt=""
                aria-hidden="true"
                className={foregroundImgClass}
              />
            </SlideUpReveal>
          ) : (
            <FadeUpReveal className="h-full w-full overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foreground.src}
                alt=""
                aria-hidden="true"
                className={foregroundImgClass}
              />
            </FadeUpReveal>
          )}
        </div>
      ) : null}

      {foreground && foregroundScreenFit && !foregroundBackgroundFit ? (
        <div
          className={`${screenFitHeroClass}-fg pointer-events-none absolute inset-0 z-[2]`}
        >
          {foregroundReveal === "slide-up" ? (
            <SlideUpReveal className="h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foreground.src}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-contain object-center"
              />
            </SlideUpReveal>
          ) : (
            <FadeUpReveal className="h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foreground.src}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-contain object-center"
              />
            </FadeUpReveal>
          )}
        </div>
      ) : null}

      {overlayFront && overlayInSection ? (
        <div
          className="pointer-events-none absolute inset-0 z-[3]"
          style={{ fontSize: frameSize(titleSize) }}
        >
          {overlayFront}
        </div>
      ) : null}

      {/*
        The 1920 × 945 composition frame, contain-scaled and centred. Children are
        sized with the same scale and positioned in `%` of the frame, so the
        layout reads identically on every screen.
      */}
      <div
        className="absolute left-1/2 top-1/2 z-[2] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: scaledFrameSize(frameWidth),
          height: scaledFrameSize(frameHeight),
        }}
      >
        {foregroundBehindTitle ? foregroundLayer : null}

        {/* Wrapper is only as tall as the title, so `top` places the title itself. */}
        {title ? (
          <div
            className={`absolute -translate-y-1/2 ${titleCentred ? "left-1/2 -translate-x-1/2" : ""}`}
            style={{
              top: titleTop,
              left: titleCentred ? undefined : titleLeft,
              fontSize: frameSize(titleSize),
            }}
          >
            {/*
              The reveal sits inside the positioned wrapper: GSAP writes its own
              `transform`, which would otherwise wipe out the centring translate.
            */}
            <FadeUpReveal>{title}</FadeUpReveal>
          </div>
        ) : null}

        {/*
          The overlay places itself across the frame and owns its own entrance,
          so it is not wrapped in a reveal — but it still needs the frame-scaled
          title size to size its text from.
        */}
        {overlay && !overlayInSection ? (
          <div style={{ fontSize: frameSize(titleSize) }}>{overlay}</div>
        ) : null}

        {foregroundBehindTitle ? null : foregroundLayer}

        {overlayFront && !overlayInSection ? (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ fontSize: frameSize(titleSize), zIndex: 2 }}
          >
            {overlayFront}
          </div>
        ) : null}
      </div>
    </section>
  );
}

type OverlayMedia = {
  backgroundSrc?: string;
  backgroundCss?: string;
  /** Left callout chip on /mobile-app. */
  intro?: string;
  /** Right callout chip on /mobile-app. */
  description?: string;
  /** CMS foreground mark; /logo-app places this as the pencil. */
  foregroundSrc?: string;
};

/** The slot a layer occupies in the design — its size, never its source. */
type LayerSlot = { width: number; height: number; fallbackSrc?: string };

/**
 * The coded design for a route: how the banner looks, never what it says. Sizes,
 * placement, gradients, scrims and type treatment live here; every source and
 * every word comes from the CMS. A route with no content in WordPress renders
 * no Figma banner at all.
 */
type BannerPreset = {
  /** Slot for a CMS background image. */
  background?: LayerSlot;
  /** Slot for a CMS background video. */
  backgroundVideo?: LayerSlot;
  /** Coded artwork with no asset — e.g. the /mobile-app glow. Styling, so it stays. */
  backgroundCss?: string;
  /** Colour behind every layer. Defaults to black. */
  sectionBg?: string;
  /** Scrim over the background; `null` for artwork that needs none. */
  scrimClass?: string | null;
  /** Scrim as a CSS `background` value, for gradients a class cannot express. */
  scrimCss?: string;
  /** Slot and placement for a CMS foreground mark. */
  foreground?: LayerSlot & {
    bottom?: string;
    top?: string;
    left?: string;
    rotate?: number;
    translateY?: string;
  };
  /** Optional Figma parent wrapper used before rotating the foreground image. */
  foregroundWrapper?: {
    width: number;
    height: number;
    top: string;
    left: string;
  };
  /**
   * Paint the mark behind the title instead of over it — for designs whose
   * "foreground" artwork is a full, opaque frame the headline sits on top of.
   */
  foregroundBehindTitle?: boolean;
  /** "slide-up" rises the mark into place from below the banner on entry. */
  foregroundReveal?: "fade" | "slide-up";
  /** How the mark fills its slot; mobile-app uses contain to keep the crop. */
  foregroundObjectFit?: "contain" | "cover" | "fill";
  foregroundObjectPosition?: "bottom" | "center";
  /** Size the mark in vw/vh so it follows the screen, not the Figma frame. */
  foregroundScreenFit?: boolean;
  /** Position the mark against the same object-cover rectangle as the background. */
  foregroundBackgroundFit?: boolean;
  /** Size the CMS background to the banner/viewport instead of the Figma slot. */
  backgroundScreenFit?: boolean;
  /** Section class for screen-fit heroes — keeps overlay CSS scoped per route. */
  heroClassName?: string;
  /**
   * Height of the screen-fit section. Omit for `min-h-screen`; SEO/security use
   * the 1920 × 1068 Figma clamp instead.
   */
  heroHeightClass?: string;
  /** `light` tells the header to use the black logo over this banner. */
  sectionTheme?: "light" | "dark";
  titleSize?: number;
  titleTop?: string;
  titleLeft?: string;
  /** Type treatment applied to the CMS title. */
  type?: {
    weight?: number;
    leading?: number;
    uppercase?: boolean;
    align?: "center" | "left";
  };
  /**
   * Designs whose headline is more than stacked lines build it here, so CMS
   * words land in the coded composition instead of a generic stack. `title` is
   * placed by the frame; `overlay` positions itself across the whole frame.
   */
  renderTitle?: (lines: string[]) => ReactNode;
  renderOverlay?: (lines: string[], media?: OverlayMedia) => ReactNode;
  /** Render decorative overlay even before CMS title rows are populated. */
  alwaysRenderOverlay?: boolean;
  /** Words painted over the foreground mark; see `overlayFront` on the frame. */
  renderOverlayFront?: (lines: string[], media?: OverlayMedia) => ReactNode;
  /** Render front text/card overlay even before CMS title rows are populated. */
  alwaysRenderOverlayFront?: boolean;
  /** Override the composition frame when a Figma node was authored taller than 945. */
  frameWidth?: number;
  frameHeight?: number;
  /**
   * The title is cut out of a white scrim over the video rather than drawn on
   * top of it. Part of the coded design, so the CMS cannot switch it off.
   */
  knockout?: boolean;
  /** Paint overlay on the section so it can sample the banner background. */
  overlayInSection?: boolean;
  /** CMS foreground is placed by the overlay (e.g. /logo-app pencil), not the generic mark. */
  foregroundInOverlay?: boolean;
};

/**
 * Design for landing pages with no bespoke one: full-bleed artwork behind a
 * centred headline, with a scrim so the type stays legible over whatever is
 * uploaded. Covers the industry pages and any route added later, so a banner
 * appears as soon as content is entered in WordPress.
 */
const DEFAULT_BANNER_PRESET: BannerPreset = {
  background: { width: 1920, height: 1080 },
  backgroundVideo: { width: 1920, height: 1080 },
  scrimClass: "bg-black/55",
  titleSize: 110,
  titleTop: "50%",
  foreground: { width: 797.205, height: 493.522, bottom: "5%", left: "50%" },
  type: { weight: 600, leading: 1.08 },
};

const BANNER_PRESETS: Record<string, BannerPreset> = {
  "web-app": {
    // Chrome is coded; every visible layer is CMS-only (no frontend art fallback).
    scrimClass: null,
    background: { width: 1920, height: 1068 },
    foreground: {
      width: 673,
      height: 416,
      top: "59.3633%",
      left: "50.8594%",
      translateY: "-50%",
    },
    titleSize: 250,
    titleTop: "185px",
    type: { weight: 800, leading: 1.061, uppercase: true, align: "left" },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <WebAppBannerHeadline lines={lines} layer="title" />
    ),
    renderOverlayFront: (lines, media) => (
      <WebAppBannerHeadline
        lines={lines}
        layer="card"
        intro={media?.intro || media?.description}
      />
    ),
    foregroundReveal: "slide-up",
    foregroundObjectFit: "cover",
    foregroundObjectPosition: "center",
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "web-app-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1068,
  },
  salesforce: {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    scrimCss:
      "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 27.9%)",
    sectionBg: "#050003",
    background: { width: 1920, height: 1100 },
    backgroundVideo: { width: 1920, height: 1100 },
    foreground: {
      width: 795,
      height: 530,
      top: "55%",
      left: "50%",
      translateY: "-50%",
    },
    titleSize: 250,
    titleTop: "32.87%",
    titleLeft: "-4.43%",
    type: { weight: 800, leading: 1.061, uppercase: true, align: "left" },
    overlayInSection: true,
    renderOverlay: (lines, media) => (
      <SalesforceBannerHeadline
        lines={lines}
        showClouds={Boolean(media?.backgroundSrc)}
      />
    ),
    alwaysRenderOverlay: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "center",
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "salesforce-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1100,
  },
  "real-estate": {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    scrimCss: "linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0) 28%)",
    sectionBg: "#12080c",
    background: { width: 1920, height: 1080 },
    backgroundVideo: { width: 1920, height: 1080 },
    foreground: {
      width: 1280,
      height: 860,
      bottom: "0%",
      left: "50%",
      translateY: "0%",
    },
    titleSize: 220,
    type: { weight: 800, leading: 1.06, uppercase: true, align: "left" },
    overlayInSection: true,
    renderOverlay: (lines, media) => (
      <RealEstateBannerHeadline
        lines={lines}
        layer="back"
        showClouds={Boolean(media?.backgroundSrc)}
      />
    ),
    renderOverlayFront: (lines, media) => (
      <RealEstateBannerHeadline
        lines={lines}
        layer="front"
        intro={media?.intro}
        description={media?.description}
        showClouds={Boolean(media?.backgroundSrc)}
      />
    ),
    alwaysRenderOverlay: true,
    alwaysRenderOverlayFront: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "bottom",
    foregroundScreenFit: true,
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "real-estate-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1080,
    sectionTheme: "dark",
  },
  "ecommerce-app": {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    background: { width: 1920, height: 1068 },
    backgroundVideo: { width: 1920, height: 1068 },
    scrimClass: null,
    frameHeight: 1068,
    type: { weight: 800, leading: 1, uppercase: true },
    overlayInSection: true,
    renderOverlay: (lines) => <EcommerceAppBannerHeadline lines={lines} />,
    alwaysRenderOverlay: true,
    backgroundScreenFit: true,
    heroClassName: "ecommerce-app-hero",
    heroHeightClass: "min-h-screen",
    sectionTheme: "light",
  },
  "retail-ecommerce": {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    sectionBg: "#05261e",
    backgroundCss:
      "radial-gradient(ellipse 72% 58% at 48% 42%, #1a6b52 0%, #06382c 48%, #031a14 100%)",
    background: { width: 1920, height: 1068 },
    backgroundVideo: { width: 1920, height: 1068 },
    foreground: {
      width: 1109,
      height: 1013,
      // Keep the foreground flush with the banner's bottom-left corner.
      bottom: "0%",
      left: "28.8802083333%",
      translateY: "0%",
    },
    titleSize: 220,
    type: { weight: 800, leading: 1.06, uppercase: true },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <RetailEcommerceBannerHeadline lines={lines} layer="watermark" />
    ),
    renderOverlayFront: (lines, media) => (
      <RetailEcommerceBannerHeadline
        lines={lines}
        layer="card"
        intro={media?.intro}
        description={media?.description}
      />
    ),
    alwaysRenderOverlay: true,
    alwaysRenderOverlayFront: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "cover",
    foregroundObjectPosition: "center",
    foregroundScreenFit: true,
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "retail-ecommerce-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1068,
    sectionTheme: "dark",
  },
  wordpress: {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    sectionBg: "#050003",
    background: { width: 1920, height: 1080 },
    backgroundVideo: { width: 1920, height: 1080 },
    foreground: {
      width: 1133,
      height: 583,
      top: "28.426%",
      left: "50%",
      translateY: "0%",
    },
    titleSize: 250,
    type: { weight: 800, leading: 1.06, uppercase: true },
    overlayInSection: true,
    renderOverlay: (lines) => <WordpressBannerHeadline lines={lines} />,
    alwaysRenderOverlay: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "center",
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "wordpress-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1080,
    sectionTheme: "dark",
  },
  react: {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    sectionBg: "#050003",
    background: { width: 1920, height: 1080 },
    backgroundVideo: { width: 1920, height: 1080 },
    foreground: {
      width: 1632,
      height: 857,
      top: "51.71%",
      left: "50%",
      translateY: "-50%",
    },
    scrimClass: null,
    titleSize: 250,
    type: { weight: 800, leading: 1.061, uppercase: true },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <ReactBannerHeadline lines={lines} layer="watermark" />
    ),
    renderOverlayFront: (lines, media) => (
      <ReactBannerHeadline
        lines={lines}
        layer="card"
        intro={media?.intro}
        description={media?.description}
        backgroundSrc={media?.backgroundSrc}
        foregroundSrc={media?.foregroundSrc}
      />
    ),
    alwaysRenderOverlay: true,
    alwaysRenderOverlayFront: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "center",
    backgroundScreenFit: true,
    heroClassName: "react-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1080,
    sectionTheme: "dark",
  },
  "flutter-app": {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    sectionBg: "#050003",
    background: { width: 1921, height: 1075 },
    backgroundVideo: { width: 1921, height: 1075 },
    foreground: {
      width: 1401,
      height: 934,
      bottom: "0%",
      // Centre ratio for a layer flush with the frame's right edge.
      left: "63.5156%",
      translateY: "0%",
    },
    frameWidth: 1920,
    frameHeight: 1075,
    titleSize: 250,
    type: { weight: 800, leading: 1.061, uppercase: true },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <FlutterAppBannerHeadline lines={lines} layer="watermark" />
    ),
    renderOverlayFront: (lines, media) => (
      <FlutterAppBannerHeadline
        lines={lines}
        layer="card"
        intro={media?.intro}
        description={media?.description}
      />
    ),
    alwaysRenderOverlay: true,
    alwaysRenderOverlayFront: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "bottom",
    foregroundScreenFit: true,
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "flutter-app-hero",
    heroHeightClass: "min-h-screen",
    sectionTheme: "dark",
  },
  "mobile-app": {
    // Chrome is coded; every visible layer is CMS-only (no frontend glow fallback).
    scrimClass: null,
    background: { width: 1920, height: 1080 },
    // Two-phone mockup, centred in the frame like the screenshot.
    foreground: {
      width: 520,
      height: 780,
      top: "54%",
      left: "50%",
      translateY: "-50%",
    },
    // Marquee title is 221px, pinned 159px from the top of the frame.
    titleSize: 221,
    titleTop: "40%",
    type: { weight: 300, leading: 1 },
    overlayInSection: true,
    // Title marquee behind the phone; callout chips over it.
    renderOverlay: (lines, media) => (
      <MobileAppBannerHeadline
        lines={lines}
        layer="watermark"
        fill={media}
      />
    ),
    renderOverlayFront: (lines, media) => (
      <MobileAppBannerHeadline
        lines={lines}
        layer="flank"
        tags={{ left: media?.intro, right: media?.description }}
      />
    ),
    foregroundReveal: "slide-up",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "center",
    foregroundScreenFit: true,
    backgroundScreenFit: true,
    heroClassName: "mobile-app-hero",
  },
  "ui-ux-app": {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    sectionBg: "#050003",
    background: { width: 1920, height: 1068 },
    backgroundVideo: { width: 1920, height: 1068 },
    titleSize: 250,
    type: { weight: 800, leading: 1.061, uppercase: true },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <UiUxBannerHeadline lines={lines} layer="watermark" />
    ),
    renderOverlayFront: (lines, media) => (
      <UiUxBannerHeadline
        lines={lines}
        layer="card"
        intro={media?.intro}
        description={media?.description}
      />
    ),
    alwaysRenderOverlay: true,
    alwaysRenderOverlayFront: true,
    backgroundScreenFit: true,
    heroClassName: "ui-ux-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1068,
    sectionTheme: "dark",
  },
  "marketing-app": {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    background: { width: 1920, height: 1080 },
    backgroundVideo: { width: 1920, height: 1080 },
    titleSize: 43,
    frameHeight: 1068,
    type: { weight: 700, leading: 0.814, uppercase: true },
    overlayInSection: true,
    renderOverlay: (lines, media) => (
      <MarketingAppBannerHeadline lines={lines} intro={media?.intro} />
    ),
    alwaysRenderOverlay: true,
    backgroundScreenFit: true,
    heroClassName: "marketing-app-hero",
    heroHeightClass: "min-h-screen",
    sectionTheme: "light",
  },
  banking: {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    sectionBg: "#050003",
    background: { width: 1920, height: 1068 },
    backgroundVideo: { width: 1920, height: 1068 },
    foreground: {
      width: 1368,
      height: 912,
      bottom: "0%",
      left: "50%",
      translateY: "0%",
    },
    titleSize: 250,
    type: { weight: 800, leading: 1.061, uppercase: true, align: "left" },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <BankingBannerHeadline lines={lines} layer="watermark" />
    ),
    renderOverlayFront: (lines, media) => (
      <BankingBannerHeadline
        lines={lines}
        layer="card"
        intro={media?.intro}
        description={media?.description}
      />
    ),
    alwaysRenderOverlay: true,
    alwaysRenderOverlayFront: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "bottom",
    foregroundScreenFit: true,
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "banking-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1068,
    sectionTheme: "dark",
  },
  "digital-solutions": {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    sectionBg: "#050003",
    background: { width: 1920, height: 1068 },
    backgroundVideo: { width: 1920, height: 1068 },
    foreground: {
      width: 811,
      height: 841,
      bottom: "0%",
      left: "48.724%",
      translateY: "0%",
    },
    titleSize: 250,
    type: { weight: 800, leading: 1.061, uppercase: true, align: "left" },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <DigitalSolutionsBannerHeadline lines={lines} layer="watermark" />
    ),
    renderOverlayFront: (lines, media) => (
      <DigitalSolutionsBannerHeadline
        lines={lines}
        layer="card"
        intro={media?.intro}
        description={media?.description}
      />
    ),
    alwaysRenderOverlay: true,
    alwaysRenderOverlayFront: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "bottom",
    foregroundScreenFit: true,
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "digital-solutions-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1068,
    sectionTheme: "dark",
  },
  fmcg: {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    sectionBg: "#050003",
    background: { width: 1920, height: 1068 },
    backgroundVideo: { width: 1920, height: 1068 },
    foreground: {
      width: 1264,
      height: 1068,
      bottom: "0%",
      left: "32.9167%",
      translateY: "0%",
    },
    titleSize: 250,
    type: { weight: 800, leading: 1.061, uppercase: true, align: "left" },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <FmcgBannerHeadline lines={lines} layer="watermark" />
    ),
    renderOverlayFront: (lines, media) => (
      <FmcgBannerHeadline
        lines={lines}
        layer="card"
        intro={media?.intro}
        description={media?.description}
      />
    ),
    alwaysRenderOverlay: true,
    alwaysRenderOverlayFront: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "center",
    foregroundScreenFit: true,
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "fmcg-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1068,
    sectionTheme: "dark",
  },
  energy: {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    sectionBg: "#050003",
    background: { width: 1920, height: 1068 },
    backgroundVideo: { width: 1920, height: 1068 },
    foreground: {
      width: 1425,
      height: 908,
      top: "14.9813%",
      left: "62.8906%",
      translateY: "0%",
    },
    titleSize: 250,
    type: { weight: 800, leading: 1.061, uppercase: true, align: "left" },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <EnergyBannerHeadline lines={lines} layer="watermark" />
    ),
    renderOverlayFront: (lines, media) => (
      <EnergyBannerHeadline
        lines={lines}
        layer="card"
        intro={media?.intro}
        description={media?.description}
      />
    ),
    alwaysRenderOverlay: true,
    alwaysRenderOverlayFront: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "center",
    foregroundScreenFit: true,
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "energy-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1068,
    sectionTheme: "dark",
  },
  technology: {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    sectionBg: "#050003",
    background: { width: 1920, height: 1068 },
    backgroundVideo: { width: 1920, height: 1068 },
    titleSize: 250,
    type: { weight: 800, leading: 1.061, uppercase: true, align: "left" },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <TechnologyBannerHeadline lines={lines} layer="watermark" />
    ),
    renderOverlayFront: (lines, media) => (
      <TechnologyBannerHeadline
        lines={lines}
        layer="card"
        intro={media?.intro}
        description={media?.description}
      />
    ),
    alwaysRenderOverlay: true,
    alwaysRenderOverlayFront: true,
    backgroundScreenFit: true,
    heroClassName: "technology-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1068,
    sectionTheme: "dark",
  },
  healthcare: {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    sectionBg: "#e8eef2",
    background: { width: 1920, height: 1080 },
    backgroundVideo: { width: 1920, height: 1080 },
    foreground: {
      width: 1600,
      height: 1080,
      bottom: "0%",
      left: "50%",
      translateY: "0%",
    },
    titleSize: 48,
    type: { weight: 800, leading: 1.2, uppercase: true, align: "left" },
    overlayInSection: true,
    renderOverlayFront: (lines, media) => (
      <HealthcareBannerHeadline
        lines={lines}
        intro={media?.intro}
        description={media?.description}
      />
    ),
    alwaysRenderOverlayFront: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "center",
    foregroundScreenFit: true,
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "healthcare-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1080,
    sectionTheme: "light",
  },
  education: {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    sectionBg: "#d7eef8",
    background: { width: 1920, height: 1080 },
    backgroundVideo: { width: 1920, height: 1080 },
    foreground: {
      width: 1280,
      height: 900,
      bottom: "0%",
      left: "50%",
      translateY: "0%",
    },
    titleSize: 200,
    type: { weight: 800, leading: 1.06, uppercase: true, align: "left" },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <EducationBannerHeadline
        lines={lines}
        layer="back"
      />
    ),
    renderOverlayFront: (lines, media) => (
      <EducationBannerHeadline
        lines={lines}
        layer="front"
        showClouds={Boolean(media?.foregroundSrc)}
        showVectors={Boolean(media?.foregroundSrc)}
      />
    ),
    alwaysRenderOverlay: true,
    alwaysRenderOverlayFront: true,
    foregroundReveal: "fade",
    foregroundObjectFit: "contain",
    foregroundObjectPosition: "bottom",
    foregroundScreenFit: true,
    foregroundBackgroundFit: true,
    backgroundScreenFit: true,
    heroClassName: "education-hero",
    heroHeightClass: "min-h-screen",
    frameWidth: 1920,
    frameHeight: 1080,
    sectionTheme: "light",
  },
  "seo-app": {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    background: { width: 1920, height: 1080 },
    titleSize: 221,
    frameHeight: 1068,
    type: { weight: 700, leading: 1 },
    overlayInSection: true,
    renderOverlay: (lines, media) => (
      <SeoAppBannerOverlay
        lines={lines}
        intro={media?.intro}
        description={media?.description}
        backgroundSrc={media?.backgroundSrc}
      />
    ),
    alwaysRenderOverlay: true,
    backgroundScreenFit: true,
    heroClassName: "seo-app-hero",
    heroHeightClass: "min-h-screen",
  },
  "security-app": {
    // Chrome is coded; every visible layer is CMS-only (no static banner PNG).
    scrimClass: null,
    background: { width: 1920, height: 1080 },
    // The map artwork is light where the headline sits, so the scrim weights the
    // bottom-left rather than flattening the whole frame.
    scrimCss:
      "linear-gradient(to top, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.28) 34%, rgba(0,0,0,0) 66%)",
    titleSize: 80,
    frameHeight: 1068,
    type: { weight: 700, leading: 0.875, uppercase: true, align: "left" },
    overlayInSection: true,
    renderOverlay: (lines, media) => (
      <SecurityAppBannerOverlay
        lines={lines}
        intro={media?.intro}
        description={media?.description}
      />
    ),
    alwaysRenderOverlay: true,
    backgroundScreenFit: true,
    heroClassName: "security-app-hero",
    heroHeightClass: "min-h-screen",
  },
  "logo-app": {
    sectionBg: "#c52122",
    background: { width: 1920, height: 1080 },
    backgroundCss: "#c52122",
    scrimClass: null,
    titleSize: 250,
    type: { weight: 800, leading: 1.061, uppercase: true },
    overlayInSection: true,
    renderOverlay: (lines) => (
      <LogoAppBannerHeadline lines={lines} layer="art" />
    ),
    alwaysRenderOverlay: true,
    renderOverlayFront: (lines, media) => (
      <LogoAppBannerHeadline
        lines={lines}
        layer="content"
        intro={media?.intro}
        description={media?.description}
        foregroundSrc={media?.foregroundSrc}
      />
    ),
    backgroundScreenFit: true,
    heroClassName: "logo-app-hero",
    foregroundInOverlay: true,
  },
};

function SeoAppBannerOverlay({
  lines,
  intro,
  description,
  backgroundSrc,
}: {
  lines: string[];
  intro?: string;
  description?: string;
  backgroundSrc?: string;
}) {
  const headline = lines.filter(Boolean).join(" ").trim();
  const frame = (px: number) =>
    `min(${px}px, ${((px / 1920) * 100).toFixed(4)}vw)`;
  const calloutClass =
    "absolute overflow-hidden border border-white/15 bg-[rgba(129,112,112,0.07)] text-white backdrop-blur-[7.5px]";
  const textClass =
    "relative col-start-1 row-start-1 ml-0 font-inter font-[500] tracking-[0] text-white";
  const marker = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/figma-assets/seo-banner-marker.svg"
      alt=""
      aria-hidden="true"
      className="relative col-start-1 row-start-1 ml-0 mt-0 max-w-none"
      style={{ width: frame(14.083), height: frame(14.083) }}
    />
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      {headline ? (
        <>
          <h1 className="sr-only">{headline}</h1>
          <SeoAppBannerHeadline
            text={headline}
            fill={{ backgroundSrc }}
          />
        </>
      ) : null}

      {intro ? (
        <div
          className={`${calloutClass} seo-app-card-left`}
          style={{
            left: `var(--seo-app-card-left-x, ${frame(70)})`,
            top: "var(--seo-app-card-left-top, auto)",
            bottom: `var(--seo-app-card-left-bottom, ${frame(109)})`,
            width: `var(--seo-app-card-left-w, ${frame(432)})`,
            borderRadius: frame(20),
            paddingBottom: frame(48),
            paddingLeft: frame(29),
            paddingRight: frame(36),
            paddingTop: frame(27),
          }}
        >
          <FadeUpReveal>
            <div className="inline-grid grid-cols-[max-content] grid-rows-[max-content] place-items-start leading-[0]">
              <p
                className={textClass}
                style={{
                  marginTop: frame(28),
                  width: frame(367),
                  fontSize: frame(20),
                  lineHeight: frame(30),
                }}
              >
                {intro}
              </p>
              {marker}
            </div>
          </FadeUpReveal>
        </div>
      ) : null}

      {description ? (
        <div
          className={`${calloutClass} seo-app-card-right`}
          style={{
            left: `var(--seo-app-card-right-x, ${frame(1413)})`,
            right: "var(--seo-app-card-right-right, auto)",
            top: `var(--seo-app-card-right-top, ${frame(354)})`,
            width: `var(--seo-app-card-right-w, ${frame(437)})`,
            borderRadius: frame(20),
            paddingBottom: frame(48),
            paddingLeft: frame(29),
            paddingRight: frame(36),
            paddingTop: frame(27),
          }}
        >
          <FadeUpReveal>
            <div className="inline-grid grid-cols-[max-content] grid-rows-[max-content] place-items-start leading-[0]">
              <p
                className={textClass}
                style={{
                  marginTop: frame(28),
                  width: frame(367),
                  fontSize: frame(20),
                  lineHeight: frame(30),
                }}
              >
                {description}
              </p>
              {marker}
            </div>
          </FadeUpReveal>
        </div>
      ) : null}
    </div>
  );
}

function SecurityAppBannerOverlay({
  lines,
  intro,
  description,
}: {
  lines: string[];
  intro?: string;
  description?: string;
}) {
  const rawLines = lines.map((line) => line.trim()).filter(Boolean);
  const watermark = rawLines.length > 1 ? rawLines[0] : undefined;
  const kicker = intro?.trim() || undefined;
  const headline = (rawLines.length > 1 ? rawLines.slice(1) : rawLines)
    .join(" ")
    .trim();
  const frame = (px: number) =>
    `min(${px}px, ${((px / 1920) * 100).toFixed(4)}vw)`;
  const marker = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/figma-assets/seo-banner-marker.svg"
      alt=""
      aria-hidden="true"
      className="block max-w-none"
      style={{ width: frame(14.083), height: frame(14.083) }}
    />
  );

  return (
    <div className="security-app-hero-overlay pointer-events-none absolute inset-0">
      {watermark ? (
        <p
          aria-hidden="true"
          className="security-app-hero-watermark absolute block whitespace-nowrap uppercase"
          style={{
            left: frame(105),
            bottom: `calc(-1 * ${frame(21)})`,
            fontSize: frame(250),
            lineHeight: frame(265.286),
            letterSpacing: frame(-10),
          }}
        >
          {watermark}
        </p>
      ) : null}

      {kicker ? (
        <div
          className="security-app-hero-kicker absolute z-[1] flex items-center gap-[11px]"
          style={{
            left: `clamp(24px, ${frame(106)}, 106px)`,
            top: `clamp(178px, ${frame(574)}, 520px)`,
          }}
        >
          {marker}
          <p
            className="security-app-hero-kicker-text m-0 font-inter font-[600] leading-none text-white"
            style={{
              fontSize: `clamp(18px, ${frame(34)}, 34px)`,
              letterSpacing: 0,
            }}
          >
            {kicker}
          </p>
        </div>
      ) : null}

      {headline ? (
        <div
          className="security-app-hero-headline absolute z-[1]"
          style={{
            left: `clamp(24px, ${frame(105)}, 105px)`,
            top: `clamp(220px, ${frame(625)}, 580px)`,
          }}
        >
          <FadeUpReveal>
            <h1
              className="security-app-hero-headline-text m-0 font-inter font-[700] uppercase text-[#0dfcc1]"
              style={{
                maxWidth: `min(${frame(818)}, calc(100vw - 48px))`,
                fontSize: `clamp(42px, ${frame(80)}, 80px)`,
                lineHeight: 0.875,
                letterSpacing: 0,
              }}
            >
              {headline}
            </h1>
          </FadeUpReveal>
        </div>
      ) : null}

      {description ? (
        <div
          className="security-app-hero-card absolute z-[1] overflow-hidden border border-white/15 bg-[rgba(129,112,112,0.07)] text-white backdrop-blur-[7.5px]"
          style={{
            left: `min(${frame(1327)}, calc(100% - ${frame(593)}))`,
            bottom: frame(236),
            width: `min(${frame(485)}, calc(100vw - 48px))`,
            height: frame(180),
            borderRadius: frame(20),
            paddingBottom: frame(79),
            paddingLeft: frame(29),
            paddingRight: frame(36),
            paddingTop: frame(27),
          }}
        >
          <FadeUpReveal>
            <div className="inline-grid grid-cols-[max-content] grid-rows-[max-content] place-items-start leading-[0]">
              <p
                className="relative col-start-1 row-start-1 m-0 ml-0 font-inter font-[500] tracking-[0] text-white"
                style={{
                  marginTop: frame(28),
                  width: `min(${frame(420)}, calc(100vw - 120px))`,
                  fontSize: frame(20),
                  lineHeight: frame(30),
                }}
              >
                {description}
              </p>
              <div className="relative col-start-1 row-start-1 ml-0 mt-0">
                {marker}
              </div>
            </div>
          </FadeUpReveal>
        </div>
      ) : null}
    </div>
  );
}

/**
 * A knockout title over a background video: the scrim screens over the footage
 * so the letters punch through to it. Same layer stack as the other heroes —
 * background, title, then an optional mark in front — but the title is cut out
 * of the scrim rather than drawn on top of it. The /logo-app treatment.
 */
function VideoKnockoutBanner({
  video,
  lines,
  titleSize,
  titleWeight,
  titleLeading,
  titleUppercase,
  foreground,
  foregroundBottom = "5%",
  foregroundLeft = "50%",
}: {
  video: FigmaLayer;
  lines: string[];
  titleSize: number;
  titleWeight: number;
  titleLeading: number;
  titleUppercase: boolean;
  foreground?: FigmaLayer;
  foregroundBottom?: string;
  foregroundLeft?: string;
}) {
  return (
    <section className="relative isolate flex min-h-[420px] w-full items-center justify-center overflow-hidden bg-white sm:min-h-[560px] lg:min-h-screen">
      <video
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 min-h-full min-w-full max-w-none -translate-x-1/2 -translate-y-1/2 object-cover"
        style={{ width: figmaSize(video.width), height: figmaSize(video.height) }}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
      >
        <source src={video.src} type="video/mp4" />
      </video>

      {/* The wash stays even with no headline — it is part of the treatment. */}
      <div className="absolute inset-0 flex items-center justify-center bg-white/80 mix-blend-screen">
        {lines.length > 0 ? (
          <FadeUpReveal>
            <h1
              className="whitespace-nowrap px-5 text-center font-graphik tracking-[-0.02em] text-black"
              style={{
                fontSize: frameSize(titleSize),
                fontWeight: titleWeight,
                lineHeight: titleLeading,
                textTransform: titleUppercase ? "uppercase" : undefined,
              }}
            >
              {lines.map((line, index) => (
                <span key={`${index}-${line}`} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </FadeUpReveal>
        ) : null}
      </div>

      {foreground ? (
        // Outside the blended scrim, so the mark paints normally over the knockout.
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: frameSize(FRAME_W), height: frameSize(FRAME_H) }}
        >
          <div
            className="absolute -translate-x-1/2"
            style={{
              left: foregroundLeft,
              bottom: foregroundBottom,
              width: frameSize(foreground.width),
              height: frameSize(foreground.height),
            }}
          >
            <FadeUpReveal className="h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={foreground.src}
                alt=""
                aria-hidden="true"
                className="h-full w-full max-w-none"
              />
            </FadeUpReveal>
          </div>
        </div>
      ) : null}
    </section>
  );
}

/**
 * Puts an uploaded layer into the slot the coded design defines for it, so the
 * artwork lands at exactly the size and position the design expects. Intrinsic
 * pixels only fill in for routes with no coded slot.
 */
function resolveLayer(
  uploaded: LeadingServiceBannerLayer | undefined,
  slot: LayerSlot | undefined,
  fallback: LayerSlot,
): FigmaLayer | undefined {
  const src = uploaded?.src ?? slot?.fallbackSrc;
  if (!src) return undefined;
  return {
    src,
    width: slot?.width ?? uploaded?.intrinsicWidth ?? fallback.width,
    height: slot?.height ?? uploaded?.intrinsicHeight ?? fallback.height,
  };
}

/**
 * Renders a banner whose *content* comes from WordPress. Everything about how it
 * looks — background placement, type size and weight, scrim, where the mark sits
 * — comes from the route's coded design, so the CMS cannot break the layout.
 */
function CmsFigmaBanner({
  banner,
  preset,
}: {
  banner: LeadingServiceBanner;
  preset?: BannerPreset;
}) {
  const type = preset?.type ?? {};

  const titleWeight = type.weight ?? 700;
  const titleLeading = type.leading ?? 1;
  const uppercase = type.uppercase ?? false;
  const align = type.align ?? "center";

  const foreground = resolveLayer(banner.foreground, preset?.foreground, {
    width: 797.205,
    height: 493.522,
  });

  // The coded design decides the treatment — the CMS choice only applies to
  // routes with no coded design of their own.
  if (preset?.knockout ?? banner.layout === "video_knockout") {
    const slot = preset?.backgroundVideo;
    if (banner.videoSrc) {
      return (
        <VideoKnockoutBanner
          video={{
            src: banner.videoSrc,
            width: slot?.width ?? 1920,
            height: slot?.height ?? 1080,
          }}
          lines={banner.lines}
          titleSize={preset?.titleSize ?? 200}
          titleWeight={titleWeight}
          titleLeading={titleLeading}
          titleUppercase={uppercase}
          foreground={foreground}
          foregroundBottom={preset?.foreground?.bottom}
          foregroundLeft={preset?.foreground?.left}
        />
      );
    }
  }

  // A design with its own headline composition places the CMS words itself;
  // everything else stacks them. No words means no headline — the artwork
  // stands on its own.
  const hasLines = banner.lines.length > 0;
  const overlayMedia: OverlayMedia = {
    backgroundSrc: banner.background?.src,
    backgroundCss:
      banner.background || banner.videoSrc
        ? undefined
        : preset?.backgroundCss,
    intro: banner.intro,
    description: banner.description,
    foregroundSrc: banner.foreground?.src,
  };
  const overlay = hasLines || preset?.alwaysRenderOverlay
    ? preset?.renderOverlay?.(banner.lines, overlayMedia)
    : undefined;
  const overlayFront =
    hasLines ||
    banner.intro ||
    banner.description ||
    banner.foreground ||
    preset?.alwaysRenderOverlayFront
      ? preset?.renderOverlayFront?.(banner.lines, overlayMedia)
      : undefined;
  const title =
    !hasLines || overlay || overlayFront ? undefined : preset?.renderTitle ? (
      preset.renderTitle(banner.lines)
    ) : (
      <h1
        className="whitespace-nowrap font-graphik tracking-[-0.02em] text-white"
        style={{
          fontSize: "1em",
          fontWeight: titleWeight,
          lineHeight: titleLeading,
          textAlign: align === "left" ? "left" : "center",
          textTransform: uppercase ? "uppercase" : undefined,
        }}
      >
        {banner.lines.map((line, index) => (
          <span key={`${index}-${line}`} className="block">
            {line}
          </span>
        ))}
      </h1>
    );

  return (
    <FigmaHeroBanner
      background={resolveLayer(banner.background, preset?.background, {
        width: 1920,
        height: 1080,
      })}
      backgroundVideo={
        // Like an uploaded image, an uploaded video takes the coded slot's size.
        banner.videoSrc
          ? {
              src: banner.videoSrc,
              width: preset?.backgroundVideo?.width ?? 1920,
              height: preset?.backgroundVideo?.height ?? 1080,
            }
          : undefined
      }
      backgroundCss={
        banner.background || banner.videoSrc ? undefined : preset?.backgroundCss
      }
      sectionBg={preset?.sectionBg}
      scrimClass={preset?.scrimCss ? null : preset?.scrimClass}
      scrimStyle={
        preset?.scrimCss ? { background: preset.scrimCss } : undefined
      }
      title={title}
      titleSize={preset?.titleSize}
      titleTop={preset?.titleTop}
      titleLeft={align === "left" ? preset?.titleLeft : "center"}
      overlay={overlay}
      overlayFront={overlayFront}
      overlayInSection={preset?.overlayInSection}
      frameWidth={preset?.frameWidth}
      frameHeight={preset?.frameHeight}
      foreground={preset?.foregroundInOverlay ? undefined : foreground}
      foregroundBottom={preset?.foreground?.bottom}
      foregroundTop={preset?.foreground?.top}
      foregroundLeft={preset?.foreground?.left}
      foregroundRotate={preset?.foreground?.rotate}
      foregroundTranslateY={preset?.foreground?.translateY}
      foregroundWrapper={preset?.foregroundWrapper}
      foregroundBehindTitle={preset?.foregroundBehindTitle}
      foregroundReveal={preset?.foregroundReveal}
      foregroundObjectFit={preset?.foregroundObjectFit}
      foregroundObjectPosition={preset?.foregroundObjectPosition}
      foregroundScreenFit={preset?.foregroundScreenFit}
      foregroundBackgroundFit={preset?.foregroundBackgroundFit}
      backgroundScreenFit={preset?.backgroundScreenFit}
      heroClassName={preset?.heroClassName}
      heroHeightClass={preset?.heroHeightClass}
      sectionTheme={preset?.sectionTheme}
    />
  );
}
