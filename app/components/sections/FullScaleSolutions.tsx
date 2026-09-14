"use client";

import Image, { StaticImageData } from "next/image";
import { useRef, ReactNode } from "react";
import { useGSAP } from "@/app/hooks/useGSAP";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SECTION_HEADING_CLASS } from "./section-heading";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface SolutionItem {
  /** "label" renders a bold inline section heading; "pill" renders a bordered chip. */
  type: "label" | "pill";
  text: string;
  /** Optional leading icon for pills. */
  icon?: string | StaticImageData;
}

interface FullScaleSolutionsProps {
  title?: ReactNode;
  items: SolutionItem[];
  className?: string;
  titleClassName?: string;
}

export default function FullScaleSolutions({
  title,
  items,
  className = "",
  titleClassName = "",
}: FullScaleSolutionsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!sectionRef.current) return;

      const heading = sectionRef.current.querySelector(".fss-heading");
      if (heading) {
        gsap.fromTo(
          heading,
          { opacity: 0, y: 40 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      const chips = sectionRef.current.querySelectorAll(".fss-item");
      if (chips.length) {
        gsap.fromTo(
          chips,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.5,
            ease: "power2.out",
            stagger: 0.02,
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    },
    sectionRef,
    [items]
  );

  if (!items?.length) return null;

  return (
    <section
      ref={sectionRef}
      className={`bg-[#EAF6F1] py-16 md:py-24 lg:py-28 ${className}`}
    >
      <div className="mx-auto w-full max-w-[1761px] px-6 sm:px-8 md:px-10 lg:px-12">
        {title ? (
          <h2
            className={
              titleClassName ||
              `fss-heading ${SECTION_HEADING_CLASS} mb-10 md:mb-14 text-[#0B0B0B]`
            }
          >
            {title}
          </h2>
        ) : null}

        <div className="flex flex-wrap items-center gap-x-2 gap-y-3 md:gap-x-2 md:gap-y-5">
          {items.map((item, i) =>
            item.type === "label" ? (
              <span
                key={i}
                className="fss-item mx-2 md:mx-4 text-[20px] sm:text-[24px] md:text-[26px] lg:text-[30px] font-[600] text-[#0B0B0B]"
              >
                {item.text}
              </span>
            ) : (
              <span
                key={i}
                className="fss-item inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-[#342964] bg-white/40 px-3 py-1.5 text-[13px] font-[400] text-[#000000] sm:gap-2 sm:px-4 sm:py-2 sm:text-[14px] md:px-[32.5px] md:py-2.5 md:text-[16px] lg:text-[17px]"
              >
                {item.icon ? (
                  <Image
                    src={item.icon}
                    alt=""
                    width={18}
                    height={18}
                    className="h-[18px] w-[18px] object-contain"
                    unoptimized={typeof item.icon === "string"}
                  />
                ) : null}
                {item.text}
              </span>
            )
          )}
        </div>
      </div>
    </section>
  );
}
