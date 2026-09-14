"use client";

import { useRef, ReactNode } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import middEllipseImg from "@/app/assets/imgs/midd_ellipse_360.png";
import uiUxTilteImg from "@/app/assets/imgs/ui-ux-tilte.png";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface UiUxTiltSectionProps {
  uiItems?: string[];
  uxItems?: string[];
  className?: string;
}

const defaultUIItems = [
  "Ideate & Mood Board",
  "Branding & Graphics",
  "Colors & Accessibility",
  "Icons & Typography",
  "Layouts & Design System",
  "Visual Design",
  "And More",
];

const defaultUXItems = [
  "Information Architecture",
  "Competitive Analysis",
  "Prototyping And Testing",
  "Wireframing",
  "Interaction Design",
  "Research",
  "And More",
];

export default function UiUxTiltSection({
  uiItems = defaultUIItems,
  uxItems = defaultUXItems,
  className = "",
}: UiUxTiltSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const uiListRef = useRef<HTMLDivElement>(null);
  const uxListRef = useRef<HTMLDivElement>(null);

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

      // Animate UI list
      if (uiListRef.current) {
        gsap.set(uiListRef.current, {
          x: -50,
          opacity: 0,
        });
        tl.to(uiListRef.current, {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
        });
      }

      // Animate UX list
      if (uxListRef.current) {
        gsap.set(uxListRef.current, {
          x: 50,
          opacity: 0,
        });
        tl.to(
          uxListRef.current,
          {
            x: 0,
            opacity: 1,
            duration: 1,
            ease: "power3.out",
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
      className={`relative min-h-screen bg-black py-20 md:py-32 overflow-hidden ${className}`}
    >
      {/* Background Image - Middle Ellipse */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full max-w-[700px] max-h-[700px] -ml-16 md:-ml-24 lg:-ml-100 drop-shadow-[0_0_80px_rgba(20,184,166,0.6)]">
          <div className="absolute inset-0 bg-teal-300/10 blur-3xl rounded-full" />
          <Image
            src={middEllipseImg}
            alt="Background"
            fill
            className="object-contain opacity-30 drop-shadow-[0_0_60px_rgba(20,184,166,0.8)]"
            unoptimized
          />
        </div>
      </div>

      {/* Center Image */}
      <div className="absolute inset-0 z-10 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
        <div className="relative w-full max-w-[600px] h-[4500px] md:max-w-[420px] md:h-[400px] lg:max-w-[500px] lg:h-[650px] ui-ux-tilt-image-container">
          <Image
            src={uiUxTilteImg}
            alt="UI/UX"
            fill
            className="object-contain"
            unoptimized
          />
        </div>
      </div>

      <div className="relative z-20 container mx-auto px-4 sm:px-6 lg:px-8 h-full min-h-screen flex items-center ui-ux-tilt-content-container">
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-100 md:gap-16">
          {/* Left Side - UI List */}
          <div className="w-full md:w-1/4 flex flex-col justify-center items-center md:items-start">
            <div ref={uiListRef} className="space-y-6">
              <h2 className="text-[32px] md:text-[44px] lg:text-[60px] font-[700] text-white leading-tight ui-ux-heading">
                UI
              </h2>
              <ul className="flex flex-wrap gap-4 md:flex-col md:space-y-3 md:space-y-4 md:gap-0">
                {uiItems.map((item, index) => (
                  <li
                    key={index}
                    className="text-white text-[12px] md:text-[14px] lg:text-[16px] font-[400] leading-relaxed ui-ux-item"
                  >
                    {item}{index < uiItems.length - 1 ? "," : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Side - UX List */}
          <div className="w-full md:w-1/4 flex flex-col justify-center items-center md:items-end">
            <div ref={uxListRef} className="space-y-6 md:text-right">
              <h2 className="text-[32px] md:text-[44px] lg:text-[60px] font-[700] text-white leading-tight ui-ux-heading">
                UX
              </h2>
              <ul className="flex flex-wrap gap-4 md:flex-col md:space-y-3 md:space-y-4 md:gap-0">
                {uxItems.map((item, index) => (
                  <li
                    key={index}
                    className="text-white text-[12px] md:text-[14px] lg:text-[16px] font-[400] leading-relaxed ui-ux-item"
                  >
                    {item}{index < uxItems.length - 1 ? "," : ""}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

