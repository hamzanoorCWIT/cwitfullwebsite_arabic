"use client";

import { useGSAP } from "@/app/hooks/useGSAP";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";
import HorizontalScrollSlider, { SliderCard } from "@/app/components/ui/HorizontalScrollSlider";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

import BeforeImage from "@/app/components/ui/BeforeImage";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import styles from "./Showcase.module.css";

interface ShowcaseProps {
  headline?: string;
  description?: string;
  cards?: SliderCard[];
  beforeImageSrc?: string;
  logoImageSrc?: string;
  figmaLayout?: boolean;
}

export default function Showcase({
  headline,
  description,
  cards,
  beforeImageSrc,
  logoImageSrc,
  figmaLayout = false,
}: ShowcaseProps = {}) {
  const displayHeadline = headline?.trim() || "";
  const displayDescription = description?.trim() || "";
  const displayCards = cards?.length ? cards : [];
  const displayBeforeImage = beforeImageSrc?.trim() || "";
  const displayLogoImage = logoImageSrc?.trim() || "";
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const gradientTextRef = useRef<HTMLSpanElement>(null);

  // Animate text reveal on scroll
  useGSAP(
    () => {
      if (!headlineRef.current) return;

      const text = headlineRef.current.querySelector("h2");
      if (!text) return;

      // Split text into words/chars if needed, or just animate opacity of the whole block
      // For the effect "text start appearing full opacity once you start scrolling":
      
      // Reset initial state
      gsap.set(text, { opacity: 0.3 }); // Start semi-transparent

      gsap.to(text, {
        opacity: 1,
        duration: 1,
        ease: "none",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 60%", // Start fading in when section hits 60% of viewport
          end: "top 30%",   // Full opacity when section hits 30% of viewport
          scrub: true,      // Tie animation to scroll position
        }
      });
    },
    sectionRef,
    []
  );

  // Animate gradient colors based on scroll
  useGSAP(
    () => {
      if (!gradientTextRef.current || !sectionRef.current) return;

      const gradientColors = [
        { from: "#4ade80", to: "#14b8a6" }, // green-400 to teal-500
        { from: "#60a5fa", to: "#a855f7" }, // blue-400 to purple-500
        { from: "#f472b6", to: "#ef4444" }, // pink-400 to red-500
        { from: "#facc15", to: "#f97316" }, // yellow-400 to orange-500
        { from: "#22d3ee", to: "#3b82f6" }, // cyan-400 to blue-500
        { from: "#4ade80", to: "#14b8a6" }, // green-400 to teal-500
      ];

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom center",
        onUpdate: (self) => {
          const progress = self.progress;
          const colorIndex = Math.floor(progress * (gradientColors.length - 1));
          const colors = gradientColors[colorIndex];

          if (gradientTextRef.current) {
            gradientTextRef.current.style.backgroundImage = `linear-gradient(to right, ${colors.from}, ${colors.to})`;
          }
        },
      });
    },
    sectionRef,
    []
  );


  return (
    <section
      ref={sectionRef}
      className={
        figmaLayout
          ? styles.figmaSection
          : "relative min-h-screen bg-black py-24 overflow-hidden"
      }
    >
      {displayBeforeImage ? (
        <BeforeImage
          image={displayBeforeImage}
          alt=""
          className={figmaLayout ? styles.beforeGlow : undefined}
        />
      ) : null}

      {displayLogoImage && !figmaLayout ? (
        <div className="absolute left-1/2 top-[calc(74vh+8rem-9rem)] -translate-x-1/2 md:max-w-[600px] max-w-[350px] w-full h-100 z-10">
          <Image
            src={displayLogoImage}
            alt=""
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      ) : null}

      {figmaLayout ? (
        <div ref={headlineRef} className={styles.figmaIntro}>
          {displayHeadline ? (
            <h2
              className={styles.figmaHeadline}
              dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(displayHeadline) }}
            />
          ) : null}
          {displayDescription ? (
            <p
              className={styles.figmaDescription}
              dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(displayDescription) }}
            />
          ) : null}
        </div>
      ) : (
        <div className="relative z-20 container mx-auto px-4">
          {/* Text Section - Centered vertically */}
          <div className="flex items-center justify-center h-[20vh] md:min-h-[70vh]">
            <div ref={headlineRef} className="text-start space-y-6 lg:max-w-[70%]">
              {displayHeadline && (
                <h2
                  className="text-[#ffffff] text-[16px] sm:text-[26px] md:text-[34px] lg:text-[38px] leading-[30px] md:leading-[58px] lg:leading-[52px] font-[400] tracking-normal showcase-heading"
                  dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(displayHeadline) }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Horizontal Scroll Slider Section - Full width */}
      {displayCards.length > 0 && (
        <div
          className={
            figmaLayout ? styles.figmaSlider : "relative z-20 w-full pt-32 pb-12"
          }
        >
          {figmaLayout && displayLogoImage ? (
            <div className={styles.figmaCardsLogo} aria-hidden>
              <Image
                src={displayLogoImage}
                alt=""
                fill
                className={styles.figmaCardsLogoImage}
                unoptimized
              />
            </div>
          ) : null}
          <div className={figmaLayout ? styles.figmaSliderCards : undefined}>
            <HorizontalScrollSlider
              cards={displayCards}
              cardClassName={figmaLayout ? styles.figmaCard : undefined}
              trackClassName={figmaLayout ? styles.figmaTrack : undefined}
              imageOverlay
            />
          </div>
        </div>
      )}
    </section>
  );
}

