"use client";

import { useEffect, useState } from "react";
import type { WorkDetailsV2Testimonial } from "@/app/lib/portfolio-work-details-v2";
import styles from "./work-details-2.module.css";

type WorkDetails2TestimonialsProps = {
  testimonials: WorkDetailsV2Testimonial[];
};

function TestimonialSlide({ item }: { item: WorkDetailsV2Testimonial }) {
  return (
    <>
      <blockquote className={styles.quote}>
        <span dangerouslySetInnerHTML={{ __html: item.quoteHtml }} />
      </blockquote>
      <div className={styles.quoteFooter}>
        <strong>{item.author}</strong>
        {item.role ? <span>{item.role}</span> : null}
      </div>
    </>
  );
}

export default function WorkDetails2Testimonials({
  testimonials,
}: WorkDetails2TestimonialsProps) {
  if (!testimonials.length) return null;

  const [activeIndex, setActiveIndex] = useState(0);
  const hasMultiple = testimonials.length > 1;
  const lastIndex = testimonials.length - 1;

  useEffect(() => {
    if (!hasMultiple) return;

    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => window.clearInterval(interval);
  }, [hasMultiple, testimonials.length]);

  const goTo = (index: number) => {
    setActiveIndex(index);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? lastIndex : prev - 1));
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev === lastIndex ? 0 : prev + 1));
  };

  if (!hasMultiple) {
    return (
      <section className={styles.testimonial}>
        <TestimonialSlide item={testimonials[0]} />
      </section>
    );
  }

  return (
    <section className={styles.testimonial}>
      <div className={styles.testimonialControls} aria-label="Testimonial navigation">
        <button
          type="button"
          className={styles.testimonialNavButton}
          onClick={goPrev}
          aria-label="Previous testimonial"
        >
          ‹
        </button>

        <div className={styles.testimonialDots} role="tablist" aria-label="Testimonial slides">
          {testimonials.map((_, index) => (
            <button
              key={index}
              type="button"
              role="tab"
              className={`${styles.testimonialDot} ${
                index === activeIndex ? styles.testimonialDotActive : ""
              }`}
              onClick={() => goTo(index)}
              aria-label={`Go to testimonial ${index + 1} of ${testimonials.length}`}
              aria-selected={index === activeIndex}
            />
          ))}
        </div>

        <button
          type="button"
          className={styles.testimonialNavButton}
          onClick={goNext}
          aria-label="Next testimonial"
        >
          ›
        </button>
      </div>

      <div className={styles.testimonialSlider}>
        <div
          className={styles.testimonialTrack}
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {testimonials.map((item, index) => (
            <div
              className={styles.testimonialSlide}
              key={`${item.author}-${index}`}
              aria-hidden={index !== activeIndex}
            >
              <TestimonialSlide item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
