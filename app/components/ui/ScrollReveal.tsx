"use client";

import { useRef, ReactNode, ElementType } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@/app/hooks/useGSAP";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface ScrollRevealProps {
  children: ReactNode;
  /** Wrapper element/tag. Defaults to a div. */
  as?: ElementType;
  className?: string;
  /** Seconds between each child's entrance. */
  stagger?: number;
  /** Vertical travel distance (px) for each child. */
  y?: number;
  /** Scroll position that triggers the reveal. */
  start?: string;
}

/**
 * Reveals direct children one-by-one (fade + slide up) as the block scrolls
 * into view — mirrors the first banner's step-by-step entrance.
 */
export default function ScrollReveal({
  children,
  as: Tag = "div",
  className = "",
  stagger = 0.15,
  y = 40,
  start = "top 80%",
}: ScrollRevealProps) {
  const scopeRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = scopeRef.current;
      if (!el) return;

      const targets = Array.from(el.children) as HTMLElement[];
      if (!targets.length) return;

      gsap.set(targets, { opacity: 0, y });

      gsap.to(targets, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger,
        scrollTrigger: {
          trigger: el,
          start,
          toggleActions: "play none none reverse",
        },
      });
    },
    scopeRef,
    []
  );

  return (
    <Tag ref={scopeRef} className={className}>
      {children}
    </Tag>
  );
}
