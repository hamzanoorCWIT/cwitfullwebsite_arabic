"use client";

import { useEffect, useState } from "react";
import type { HomeTestimonialItem } from "@/app/lib/home-normalize";
import styles from "./FigmaHomeOffers.module.css";
import { useLocalePreference } from "@/app/components/providers/DirectionPreference";
import { getHomeUiCopy } from "@/app/lib/home-ui-copy";

const AUTO_PLAY_MS = 5000;

const WRAP_QUOTE = /^[\s"'“”„«»‹›‚‘’]+|[\s"'“”„«»‹›‚‘’]+$/g;

/** CMS quotes often already include « » or “ ”. Strip those so we wrap once. */
function unwrapQuote(value: string): string {
  let text = value
    .replace(/&quot;|&#34;/gi, '"')
    .replace(/&#8220;|&#8221;|&ldquo;|&rdquo;/gi, '"')
    .replace(/&#171;|&#187;|&laquo;|&raquo;/gi, "")
    .trim();

  for (let i = 0; i < 3; i += 1) {
    const next = text.replace(WRAP_QUOTE, "").trim();
    if (next === text) break;
    text = next;
  }

  return text;
}

function formatTestimonialQuote(quote: string): string {
  return unwrapQuote(quote);
}

type FigmaHomeTestimonialsProps = {
  testimonials?: HomeTestimonialItem[];
};

export default function FigmaHomeTestimonials({ testimonials = [] }: FigmaHomeTestimonialsProps) {
  const { locale } = useLocalePreference();
  const copy = getHomeUiCopy(locale);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const count = testimonials.length;
  const lastIndex = Math.max(0, count - 1);
  const hasMultiple = count > 1;
  const slide = testimonials[Math.min(activeIndex, lastIndex)];

  const goTo = (index: number) => {
    setActiveIndex(index);
  };

  const goPrev = () => {
    setActiveIndex((current) => (current === 0 ? lastIndex : current - 1));
  };

  const goNext = () => {
    setActiveIndex((current) => (current === lastIndex ? 0 : current + 1));
  };

  useEffect(() => {
    if (!hasMultiple) return;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion || isHovered) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current === lastIndex ? 0 : current + 1));
    }, AUTO_PLAY_MS);

    return () => window.clearInterval(interval);
  }, [hasMultiple, isHovered, lastIndex]);

  if (!count || !slide) return null;

  return (
    <div
      className="relative z-10 mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 global-section-padding accordion-content-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.testimonial}>
        <div className={styles.testimonialPhoto}>
          {testimonials.map((item, index) => (
            <img
              key={`${item.author}-${index}`}
              src={item.image}
              alt={item.imageAlt}
              className={`${styles.testimonialImage} ${
                index === activeIndex ? styles.testimonialImageActive : ""
              }`}
              aria-hidden={index !== activeIndex}
            />
          ))}
          {hasMultiple ? (
            <div className={styles.dots} role="tablist" aria-label={copy.testimonialSlides}>
              {testimonials.map((item, index) => (
                <button
                  key={`${item.author}-dot-${index}`}
                  type="button"
                  role="tab"
                  aria-label={`Show testimonial ${index + 1} of ${testimonials.length}`}
                  aria-selected={index === activeIndex}
                  className={index === activeIndex ? styles.activeDot : undefined}
                  onClick={() => goTo(index)}
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className={styles.testimonialContent}>
          <blockquote
            className={styles.quote}
            key={`quote-${activeIndex}`}
            dir={locale === "ar" ? "rtl" : "ltr"}
          >
            {formatTestimonialQuote(slide.quote)}
          </blockquote>
          <div className={styles.author} key={`author-${activeIndex}`}>
            <strong>{slide.author}</strong>
            <span>
              {slide.role}{" "}
              {slide.companyEm ? <em>{slide.company}</em> : slide.company}
            </span>
          </div>
          {hasMultiple ? (
            <div className={styles.testimonialNav} aria-label={copy.testimonialSlides}>
              <button type="button" aria-label={copy.previousTestimonial} onClick={goPrev}>
                ‹
              </button>
              <button type="button" aria-label={copy.nextTestimonial} onClick={goNext}>
                ›
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
