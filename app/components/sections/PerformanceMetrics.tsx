"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

interface PerformanceMetricsProps {
  metrics?: { title: string; value: string }[];
}

export default function PerformanceMetrics({
  metrics,
}: PerformanceMetricsProps) {
  if (!metrics || metrics.length === 0) return null;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const metricElements = sectionRef.current?.querySelectorAll(
        "[data-metric-value]"
      );

      metricElements?.forEach((element) => {
        const targetValue = element.getAttribute("data-metric-value");
        if (!targetValue) return;

        // Extract numeric value from percentage string
        const numericValue = parseFloat(targetValue.replace("%", ""));

        // Create an object to animate
        const counter = { value: 0 };

        // Create a counter animation
        gsap.to(counter, {
          value: numericValue,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          onUpdate: function () {
            const currentValue = Math.round(counter.value);
            if (element instanceof HTMLElement) {
              element.textContent = `${currentValue}%`;
            }
          },
        });
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [metrics]);

  return (
    <section
      ref={sectionRef}
      className="w-full mx-auto relative py-20 px-4 md:px-0"
    >
      <div className="max-w-[1494px] mx-auto global-section-padding">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center"
            >
              <p className="text-[#b0b0b0] text-[14px] md:text-[22px] font-light mb-2 md:mb-4">
                {metric.title}
              </p>
              <p
                data-metric-value={metric.value}
                className="text-white text-[40px] md:text-[60px] lg:text-[80px] font-bold leading-none"
              >
                0%
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

