"use client";

import { useRef, ReactNode } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SECTION_HEADING_CLASS } from "./section-heading";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
  numberClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
  className?: string;
}

interface ProcessSectionProps {
  title: string | ReactNode;
  steps: ProcessStep[];
  className?: string;
  titleClassName?: string;
  containerClassName?: string;
  showGradient?: boolean;
  gradientClassName?: string;
}

export default function ProcessSection({
  title,
  steps,
  className = "",
  titleClassName = "",
  containerClassName = "",
  showGradient = true,
  gradientClassName = "",
}: ProcessSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

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

      // Animate steps
      if (stepsRef.current) {
        const stepElements = stepsRef.current.children;
        gsap.set(stepElements, {
          y: 30,
          opacity: 0,
        });
        tl.to(
          stepElements,
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            stagger: 0.15,
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
      <div className={`container mx-auto px-4 sm:px-6 lg:px-8 ${containerClassName}`}>
        {/* Heading */}
        <h2
          ref={headingRef}
          className={`${SECTION_HEADING_CLASS} text-white mb-12 md:mb-16 ${titleClassName}`}
        >
          {title}
        </h2>

        {/* Steps Grid */}
        {steps && steps.length > 0 && (
          <div
            ref={stepsRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16"
          >
            {steps.map((step, index) => {
              const stepNumberClassName = step.numberClassName || "text-white text-[16px] md:text-[36px] font-[400] mb-2 md:mb-6";
              const stepTitleClassName = step.titleClassName || "text-white text-[16px] md:text-[26px] lg:text-[30px] font-[700] mb-2 md:mb-2";
              const stepDescriptionClassName = step.descriptionClassName || "text-white text-[14px] md:text-[16px] lg:text-[22.52px] font-[400] leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55]";
              const stepContainerClassName = step.className || "";

              return (
                <div key={index} className={`flex flex-col ${stepContainerClassName}`}>
                  {/* Number */}
                  <div className={stepNumberClassName}>
                    {step.number}
                  </div>
                  
                  {/* Title */}
                  <h3 className={stepTitleClassName}>
                    {step.title}
                  </h3>
                  
                  {/* Description */}
                  <p className={stepDescriptionClassName}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

