"use client";

/* eslint-disable @next/next/no-img-element */

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@/app/hooks/useGSAP";
import styles from "./AiFigmaPage.module.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export type LabSlide = {
  /** The index shown opposite the heading, e.g. "01". */
  index: string;
  images: string[];
};

/** Scroll distance, as a share of the viewport, spent on each transition. */
const STEP_VH = 1.7;
/** How far the black panel pulls in on each side before it dives. */
const INSET_PX = 20;
/** Odd slides (01, 03) tip left; even slides (02, 04) tip right. */
const ROTATE_DEG = 12;

function slideRotate(index: number) {
  return (index + 1) % 2 === 0 ? ROTATE_DEG : -ROTATE_DEG;
}

export default function AiLabShowcase({ slides }: { slides: LabSlide[] }) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const cards = cardsRef.current.filter(Boolean);
      if (!section || cards.length < 2) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      cards.forEach((card, i) => {
        gsap.set(card, {
          zIndex: i + 1,
          yPercent: i === 0 ? 0 : 110,
          rotate: i === 0 ? 0 : slideRotate(i),
          z: 0,
          scale: i === 0 ? 1 : 0.94,
          opacity: i === 0 ? 1 : 0,
          transformOrigin: "50% 50%",
          transformPerspective: 1400,
        });
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "center center",
          end: () => `+=${(cards.length - 1) * window.innerHeight * STEP_VH}`,
          pin: true,
          /* Seconds spent catching up to the scroll. Lenis eases the scroll
             position itself, so this is the second stage of smoothing and a
             long value here only adds drift. */
          scrub: 1,
          /* Second of the page's two pinned sections — see the note on the
             stone reveal's trigger. */
          refreshPriority: 1,
          invalidateOnRefresh: true,
        },
      });

      /*
       * One step per transition, each a unit of timeline long.
       *
       * The outgoing card's two moves stay strictly end to end — they both
       * write `scaleX`/`scaleY`, and overlapping them would leave two tweens
       * fighting over the same properties every tick, which is a stutter rather
       * than a blend. The incoming card is a different target, so it starts
       * while the outgoing one is still pulling in: that overlap is what
       * removes the beat in the middle of the step where nothing was moving.
       */
      for (let i = 1; i < cards.length; i += 1) {
        const at = i - 1;
        const width = cards[at].offsetWidth || 1;
        const height = cards[at].offsetHeight || 1;
        const insetX = (width - INSET_PX * 2) / width;
        const insetY = (height - INSET_PX * 2) / height;

        timeline
          .to(
            cards[at],
            { scaleX: insetX, scaleY: insetY, duration: 0.26, ease: "sine.out" },
            at
          )
          .to(
            cards[at],
            {
              rotate: slideRotate(at),
              z: -520,
              scaleX: 0.7,
              scaleY: 0.7,
              opacity: 0,
              duration: 0.74,
              /* The gentlest in-out there is. `power2` pulls away and pulls up
                 hard enough over a step this long to read as a lurch. */
              ease: "sine.inOut",
            },
            at + 0.26
          )
          .to(
            cards[i],
            {
              yPercent: 0,
              rotate: 0,
              scale: 1,
              opacity: 1,
              duration: 0.82,
              ease: "power2.out",
            },
            at + 0.18
          );
      }
    },
    sectionRef,
    [slides.length]
  );

  return (
    <div className={styles.labDark} data-section-theme="dark" ref={sectionRef}>
      <div className={styles.labSlides}>
        {slides.map((slide, i) => (
          <div
            className={styles.labSlide}
            key={slide.index}
            ref={(el) => {
              if (el) cardsRef.current[i] = el;
            }}
          >
            <div className={styles.labInner}>
              <div className={styles.labTop}>
                <p className={styles.labHeading}>
                  Future Digital
                  <br />
                  Experiences
                </p>
                <span className={styles.labIndex}>{slide.index}</span>
              </div>
              <div className={styles.labStage}>
                <div className={styles.labPanel} aria-hidden="true">
                  {slide.images.map((src) => (
                    <img src={src} alt="" key={src} decoding="async" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
