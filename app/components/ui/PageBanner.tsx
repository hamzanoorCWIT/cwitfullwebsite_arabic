"use client";

import { ReactNode, useRef } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface PageBannerProps {
  title: string | ReactNode;
  className?: string;
  minHeight?: string;
  maxWidth?: string;
  /** Fully replaces the default title classes (incl. the global page-banner-title sizing). */
  titleClassName?: string;
}

export default function PageBanner({
  title,
  className = "",
  minHeight = "300px",
  maxWidth,
  titleClassName,
}: PageBannerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      if (!headingRef.current || !sectionRef.current) return;

      // Set initial state
      gsap.set(headingRef.current, {
        y: 50,
        opacity: 0,
      });

      // Animate heading on scroll into view
      gsap.to(headingRef.current, {
        y: 0,
        opacity: 1,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none reverse",
        },
      });
    },
    sectionRef,
    []
  );

  // Convert minHeight prop to responsive classes if it's "100vh"
  const getHeightClasses = () => {
    if (minHeight === "100vh") {
      return "min-h-[300px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-screen";
    }
    return "";
  };

  return (
    <section
      ref={sectionRef}
      className={`relative bg-[#3A3A3A] flex items-center justify-start w-full ${getHeightClasses()} ${className}`}
      style={{
        minHeight: minHeight !== "100vh" ? minHeight : undefined,
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 industries-section-content-container">
        <div className={`${maxWidth} mx-auto page-banner-content-container`}>
          <h1
            ref={headingRef}
            className={
              titleClassName ??
              "text-[36px] md:text-[60px] lg:text-[72px] xl:text-[84px] 2xl:text-[96px] min-[1440px]:text-[93px] min-[1920px]:text-[96px] font-[700] text-white leading-[1.3] sm:leading-[1.35] md:leading-[1.4] lg:leading-[1.35] xl:leading-[1.3] 2xl:leading-[1.25] page-banner-title"
            }
          >
            {title}
          </h1>
        </div>
      </div>
    </section>
  );
}

