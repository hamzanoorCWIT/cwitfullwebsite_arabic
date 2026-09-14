"use client";

import { useRef, ReactNode, useEffect } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image, { StaticImageData } from "next/image";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { SECTION_HEADING_CLASS } from "./section-heading";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface TechnologyCard {
  icon?: ReactNode | string | StaticImageData;
  title: string;
  description: string;
  width?: string;
  height?: string;
  offset?: string;
}

interface TechnologiesSectionProps {
  title: string | ReactNode;
  technologies: TechnologyCard[];
  className?: string;
}

export default function TechnologiesSection({
  title,
  technologies,
  className = "",
}: TechnologiesSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);

  // Horizontal scroll animation on page scroll - only for cards
  useEffect(() => {
    if (!sectionRef.current || !cardsContainerRef.current) return;

    const section = sectionRef.current;
    const cardsContainer = cardsContainerRef.current;

    // Set initial position
    gsap.set(cardsContainer, { x: 0 });

    // Calculate the total scroll distance
    const getScrollAmount = () => {
      const cardsWidth = cardsContainer.scrollWidth;
      const viewportWidth = window.innerWidth;
      // Return negative value to move everything left when scrolling down
      return -(cardsWidth - viewportWidth);
    };

    // Create the horizontal scroll animation - only for cards container
    const scrollTween = gsap.to(cardsContainer, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${Math.abs(getScrollAmount())}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      scrollTween.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, [technologies]);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });

      // Animate heading
      if (headingRef.current) {
        gsap.set(headingRef.current, {
          y: 50,
          opacity: 0,
        });
        tl.to(headingRef.current, {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
        });
      }

      // Animate cards
      if (cardsRef.current) {
        const cards = cardsRef.current.children;
        gsap.set(cards, {
          y: 30,
          opacity: 0,
        });
        tl.to(
          cards,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.1,
          },
          "-=0.5"
        );
      }
    },
    sectionRef,
    []
  );

  return (
    <section
      ref={sectionRef}
      className={`relative min-h-screen bg-black pt-20 md:pt-32 overflow-hidden ${className}`}
    >
      {/* Mobile Layout - Vertical Stack */}
      <div className="flex flex-col md:hidden py-12 px-4">
        {/* Heading */}
        <div className="technologies-heading-container">
          <h2
            ref={headingRef}
            className={`${SECTION_HEADING_CLASS} text-white mb-8`}
          >
            {title}
          </h2>
        </div>

        {/* Cards - Vertical scroll on mobile */}
        {technologies && technologies.length > 0 && (
          <div className="flex flex-col gap-6">
            {technologies.map((tech, index) => {
            const width = tech.width || "w-full";
            const height = tech.height || "h-auto";
            
            return (
              <div
                key={index}
                className={`bg-[#1a1a1a] border border-[#BFBFBF] rounded-lg p-6 flex flex-col w-full ${height}`}
              >
                {tech.icon && (
                  <div className="mb-4 text-white">
                    {typeof tech.icon === 'object' && tech.icon !== null && 'src' in tech.icon ? (
                      <Image
                        src={tech.icon as StaticImageData}
                        alt={tech.title}
                        width={40}
                        height={40}
                        className="w-auto h-auto"
                        unoptimized
                      />
                    ) : typeof tech.icon === 'string' ? (
                      <Image
                        src={tech.icon}
                        alt={tech.title}
                        width={40}
                        height={40}
                        className="w-auto h-auto"
                        unoptimized
                      />
                    ) : (
                      tech.icon
                    )}
                  </div>
                )}
                <h3 className="text-white text-[18px] font-bold mb-3">
                  {tech.title}
                </h3>
                <p
                  className="text-white/70 text-[14px] leading-[1.5] sm:leading-[1.6] md:leading-[1.7]"
                  dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(tech.description) }}
                />
              </div>
            );
          })}
          </div>
        )}
      </div>

      {/* Desktop/Tablet Layout - Horizontal Scroll */}
      {technologies && technologies.length > 0 && (
        <div className="hidden md:flex flex-col h-screen overflow-hidden">
          {/* Heading - Separate row, fixed position */}
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 technologies-heading-container">
            <h2
              ref={headingRef}
              className={`${SECTION_HEADING_CLASS} text-white max-w-[700px]`}
            >
              {title}
            </h2>
          </div>

          {/* Cards Container - Horizontal scroll row */}
          <div className="flex-1 flex items-center overflow-hidden">
            <div
              ref={cardsContainerRef}
              className="flex items-start will-change-transform"
            >
              {/* Cards - Horizontal row */}
              <div
                ref={cardsRef}
                className="flex items-start gap-6 md:gap-8 px-8 lg:px-16"
              >
                {technologies.map((tech, index) => {
                const width = tech.width || "w-[439px]";
                const height = tech.height || "h-[280px]";
                const offset = tech.offset || "";
                
                return (
                  <div
                    key={index}
                    className={`bg-[#1a1a1a] border border-[#BFBFBF] rounded-lg p-6 md:p-8 hover:border-[#555555] transition-all duration-300 flex flex-col flex-shrink-0 ${width} ${height} ${offset}`}
                  >
                    {/* Icon */}
                    {tech.icon && (
                      <div className="mb-4 md:mb-6 text-white">
                        {typeof tech.icon === 'object' && tech.icon !== null && 'src' in tech.icon ? (
                          <Image
                            src={tech.icon as StaticImageData}
                            alt={tech.title}
                            width={40}
                            height={40}
                            className="w-auto h-auto"
                            unoptimized
                          />
                        ) : typeof tech.icon === 'string' ? (
                          <Image
                            src={tech.icon}
                            alt={tech.title}
                            width={40}
                            height={40}
                            className="w-auto h-auto"
                            unoptimized
                          />
                        ) : (
                          tech.icon
                        )}
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-white text-[18px] md:text-[22px] font-bold mb-3 md:mb-4">
                      {tech.title}
                    </h3>

                    {/* Description */}
                    <p
                      className="text-white/70 text-[14px] md:text-[16px] leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] flex-grow overflow-hidden"
                      dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(tech.description) }}
                    />
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

