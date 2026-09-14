"use client";

import { useEffect, useRef } from "react";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { sanitizeCmsHtml } from "@/app/lib/sanitize-cms-html";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Returns true when the string contains block-level HTML elements (lists, etc.) */
function containsBlockHtml(text: string): boolean {
  return /<(ul|ol|li|table|blockquote|div|h[1-6])\b/i.test(text);
}

interface TextSectionProps {
  paragraphs: (string | React.ReactNode)[];
  className?: string;
  firstParagraphClassName?: string;
}

export default function TextSection({
  paragraphs,
  className = "",
  firstParagraphClassName,
}: TextSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const blockRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none reverse",
        },
      });

      // Animate each block with stagger effect
      blockRefs.current.forEach((el, index) => {
        if (el) {
          gsap.set(el, { opacity: 0, y: 50 });
          tl.to(el, {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            force3D: true,
            delay: index === 0 ? 0.15 : 0, // Minor delay for first paragraph
          }, index === 0 ? 0.15 : "<0.2");
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, [paragraphs]);

  return (
    <div ref={sectionRef} className={`flex justify-center w-full ${className}`}>
      <div className="w-full">
        {paragraphs.map((paragraph, index) => {
          const isString = typeof paragraph === "string";
          const hasBlockContent = isString && containsBlockHtml(paragraph);

          // Use <div> for content containing block-level elements (e.g. <ul>),
          // because nesting <ul> inside <p> is invalid HTML.
          const Tag = hasBlockContent ? "div" : "p";

          const baseClassName = `text-white ${index === 0
              ? firstParagraphClassName || "text-[18px] sm:text-[24px] md:text-[30px] lg:text-[34px] xl:text-[38px] font-[500] leading-[1.3] sm:leading-[1.4] md:leading-[1.5] lg:leading-[1.4] xl:leading-[1.35] 2xl:leading-[1.3] paragraph-text"
              : "text-[12px] sm:text-[16px] md:text-[18px] lg:text-[19px] xl:text-[20px] font-light leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55] mt-6 md:mt-8"
            }${hasBlockContent ? " cms-rich-text" : ""}`;

          // For rich HTML blocks (lists, etc.) render raw HTML directly.
          // For plain text paragraphs, use normalizeDescriptionHtml to handle line-breaks.
          const htmlContent = isString
            ? (hasBlockContent
                ? sanitizeCmsHtml(paragraph, { rich: true })
                : normalizeDescriptionHtml(paragraph))
            : undefined;

          return (
            <Tag
              key={index}
              ref={(el: HTMLElement | null) => { blockRefs.current[index] = el; }}
              className={baseClassName}
              {...(isString
                ? { dangerouslySetInnerHTML: { __html: htmlContent! } }
                : { children: paragraph })}
            />
          );
        })}
      </div>
    </div>
  );
}
