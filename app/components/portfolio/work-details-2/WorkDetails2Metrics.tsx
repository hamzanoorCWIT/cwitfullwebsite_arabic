"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import styles from "./work-details-2.module.css";

type Metric = {
  title: string;
  value: string;
};

type ParsedMetric = {
  numeric: number;
  format: (value: number) => string;
  initial: string;
};

function parseMetricValue(value: string): ParsedMetric | null {
  const trimmed = value.trim();
  const match = trimmed.match(/^([^\d]*?)([\d,]+(?:\.\d+)?)([^\d]*)$/);
  if (!match) return null;

  const [, prefix = "", numStr, suffix = ""] = match;
  const numeric = parseFloat(numStr.replace(/,/g, ""));
  if (Number.isNaN(numeric)) return null;

  const decimals = numStr.includes(".") ? (numStr.split(".")[1]?.length ?? 0) : 0;

  const format = (current: number) => {
    const rounded =
      decimals > 0 ? current.toFixed(decimals) : String(Math.round(current));
    return `${prefix}${rounded}${suffix}`;
  };

  return {
    numeric,
    format,
    initial: format(0),
  };
};

type WorkDetails2MetricsProps = {
  metrics: Metric[];
};

export default function WorkDetails2Metrics({ metrics }: WorkDetails2MetricsProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const valueElements = sectionRef.current?.querySelectorAll("[data-metric-value]");

      valueElements?.forEach((element) => {
        const rawValue = element.getAttribute("data-metric-value");
        if (!rawValue || !(element instanceof HTMLElement)) return;

        const parsed = parseMetricValue(rawValue);
        if (!parsed) return;

        element.textContent = parsed.initial;

        const counter = { value: 0 };

        gsap.to(counter, {
          value: parsed.numeric,
          duration: 2,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            element.textContent = parsed.format(counter.value);
          },
        });
      });
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, [metrics]);

  if (!metrics.length) return null;

  return (
    <section
      ref={sectionRef}
      className={styles.metrics}
      aria-label="Project performance"
    >
      {metrics.map((metric) => (
        <div className={styles.metric} key={`${metric.title}-${metric.value}`}>
          <span>{metric.title}</span>
          <strong data-metric-value={metric.value}>
            {parseMetricValue(metric.value)?.initial ?? metric.value}
          </strong>
        </div>
      ))}
    </section>
  );
}
