"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import styles from "./AiFigmaPage.module.css";

export type AiFaq = { question: string; answer: string };

/* Mirrors the page reveal's reasoning: the closed panels have to be sized
   before the browser paints, or every answer shows at full height first. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * The FAQ list, one answer open at a time.
 *
 * The panels are animated on `height` with GSAP's `auto` rather than switched
 * with `hidden`, so an answer opens to whatever height its copy needs and the
 * ones below it move down with it instead of jumping.
 */
export default function AiFaqList({ items }: { items: AiFaq[] }) {
  const uid = useId().replace(/:/g, "");
  const [open, setOpen] = useState<string | null>(items[0]?.question ?? null);
  const panels = useRef<Record<string, HTMLDivElement | null>>({});
  /* The first pass places the panels; it must not animate them there. */
  const placed = useRef(false);

  useIsomorphicLayoutEffect(() => {
    const animate =
      placed.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    items.forEach(({ question }) => {
      const panel = panels.current[question];
      if (!panel) return;
      const shows = question === open;

      gsap.killTweensOf(panel);
      const to = { height: shows ? "auto" : 0, opacity: shows ? 1 : 0 };
      if (animate) {
        gsap.to(panel, { ...to, duration: 0.45, ease: "power2.inOut" });
      } else {
        gsap.set(panel, to);
      }
    });

    placed.current = true;
  }, [open, items]);

  return (
    <div className={styles.faqList} data-reveal-stagger>
      {items.map(({ question, answer }) => {
        const shows = question === open;
        const panelId = `${uid}-panel-${items.findIndex((i) => i.question === question)}`;
        const buttonId = `${panelId}-label`;

        return (
          <div className={styles.faqItem} key={question} data-open={shows}>
            <button
              type="button"
              className={styles.faqQuestion}
              id={buttonId}
              aria-expanded={shows}
              aria-controls={panelId}
              /* Clicking the open question closes it, so the list can be put
                 back to all-closed rather than always holding one open. */
              onClick={() => setOpen(shows ? null : question)}
            >
              <span className={styles.faqQuestionText}>{question}</span>
              <svg className={styles.faqChevron} viewBox="0 0 16 9" aria-hidden="true">
                <path
                  d="M1 1l7 7 7-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div
              className={styles.faqAnswer}
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!shows}
              ref={(el) => {
                panels.current[question] = el;
              }}
            >
              <p>{answer}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
