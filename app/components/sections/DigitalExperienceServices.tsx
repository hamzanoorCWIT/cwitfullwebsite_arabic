"use client";

import { useRef } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Carousel, { CarouselCard } from "@/app/components/ui/Carousel";
import TextSection from "../ui/TextSection";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface DigitalExperienceServicesProps {
  cards?: CarouselCard[];
  paragraphs?: string[];
}

export default function DigitalExperienceServices({
  cards,
  paragraphs,
}: DigitalExperienceServicesProps) {
  const displayCards = cards ?? [];
  const displayParagraphs = paragraphs ?? [];
  if (!displayCards.length && !displayParagraphs.length) {
    return null;
  }

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!headingRef.current) return;

      gsap.fromTo(
        headingRef.current,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    sectionRef,
    []
  );

  useGSAP(
    () => {
      if (!carouselRef.current) return;

      gsap.fromTo(
        carouselRef.current,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power2.out",
          delay: 0.3,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            toggleActions: "play none none reverse",
          },
        }
      );
    },
    sectionRef,
    []
  );

  return (
    <section
      ref={sectionRef}
      className="relative bg-black overflow-hidden isolate"
    >
      <div className="relative z-20 mx-auto">
        {displayCards.length > 0 ? (
          <div ref={carouselRef} className="relative z-20 w-full overflow-hidden py-8">
            <Carousel cards={displayCards} speed={60} pauseOnHover={true} />
          </div>
        ) : null}
        {displayParagraphs.length > 0 ? (
          <TextSection
            paragraphs={displayParagraphs}
            className="py-12 md:py-40 text-section-padding w-full max-w-[1330px]"
          />
        ) : null}
      </div>
    </section>
  );
}
