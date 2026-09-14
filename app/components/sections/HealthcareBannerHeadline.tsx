"use client";

import { useEffect, useState } from "react";
import FadeUpReveal from "@/app/components/ui/FadeUpReveal";
import "./HealthcareBannerHeadline.css";

const FRAME_W = 1920;
const FRAME_H = 1080;
const TAG_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

function frameSize(px: number): string {
  const byWidth = ((px / FRAME_W) * 100).toFixed(4);
  const byHeight = ((px / FRAME_H) * 100).toFixed(4);
  return `min(${byWidth}vw, ${byHeight}vh)`;
}

function resolveCopy(lines: string[], intro?: string, description?: string) {
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);
  return {
    headlineLines: cleaned,
    headline: cleaned.join(" "),
    card: (intro || description || "").trim(),
  };
}

function CardMark() {
  return (
    <svg
      className="healthcare-hero-card-mark"
      viewBox="0 0 14.0834 14.0834"
      fill="none"
      aria-hidden="true"
      style={{
        width: `var(--healthcare-card-icon, ${frameSize(14.083)})`,
        height: `var(--healthcare-card-icon, ${frameSize(14.083)})`,
      }}
    >
      <path
        d="M5.90724 0.772048C6.31323 -0.257357 7.7701 -0.257346 8.17609 0.772059L9.43421 3.9621C9.55814 4.27638 9.80698 4.52516 10.1213 4.6491L13.3112 5.90724C14.3407 6.31323 14.3407 7.7701 13.3112 8.17609L10.1213 9.43421C9.80698 9.55814 9.55814 9.80698 9.43421 10.1213L8.17609 13.3112C7.7701 14.3407 6.31323 14.3407 5.90724 13.3112L4.6491 10.1213C4.52516 9.80698 4.27638 9.55814 3.9621 9.43421L0.772048 8.17609C-0.257357 7.7701 -0.257346 6.31323 0.772059 5.90724L3.9621 4.6491C4.27638 4.52516 4.52516 4.27638 4.6491 3.9621L5.90724 0.772048Z"
        fill="#ffffff"
      />
    </svg>
  );
}

function IntroCard({ text, duration = 1.2 }: { text: string; duration?: number }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="healthcare-hero-card absolute"
      style={{
        top: "auto",
        right: `var(--healthcare-card-right, ${frameSize(72)})`,
        bottom: `var(--healthcare-card-bottom, ${frameSize(88)})`,
        left: "auto",
        opacity: shown ? 1 : 0,
        transform:
          "translateX(var(--healthcare-card-x, 0px)) translateY(var(--healthcare-card-y, 0px))",
        transition: `opacity ${duration}s ${TAG_EASE}`,
      }}
    >
      <FadeUpReveal>
        <div
          className="healthcare-hero-card-inner"
          style={{
            width: `var(--healthcare-card-w, ${frameSize(487)})`,
            paddingTop: `var(--healthcare-card-pad-top, ${frameSize(28)})`,
            paddingRight: `var(--healthcare-card-pad-x, ${frameSize(32)})`,
            paddingBottom: `var(--healthcare-card-pad-bottom, ${frameSize(36)})`,
            paddingLeft: `var(--healthcare-card-pad-x, ${frameSize(32)})`,
            borderRadius: `var(--healthcare-card-radius, ${frameSize(18)})`,
          }}
        >
          <CardMark />
          <p
            className="healthcare-hero-card-text m-0 font-inter font-[500] text-white"
            style={{
              marginTop: `var(--healthcare-card-copy-top, ${frameSize(22)})`,
              fontSize: `var(--healthcare-card-font, ${frameSize(18)})`,
              lineHeight: `var(--healthcare-card-line, ${frameSize(28)})`,
            }}
          >
            {text}
          </p>
        </div>
      </FadeUpReveal>
    </div>
  );
}

function Headline({ lines }: { lines: string[] }) {
  return (
    <p className="healthcare-hero-headline" aria-hidden="true">
      {lines.map((line, index) => (
        <span key={`${index}-${line}`} className="healthcare-hero-headline-line">
          {line}
        </span>
      ))}
    </p>
  );
}

export default function HealthcareBannerHeadline({
  lines,
  intro,
  description,
}: {
  lines: string[];
  intro?: string;
  description?: string;
}) {
  const copy = resolveCopy(lines, intro, description);
  if (!copy.headline && !copy.card) return null;

  return (
    <div className="healthcare-hero-copy pointer-events-none absolute inset-0">
      {copy.headline ? (
        <h1 className="sr-only">{copy.headline}</h1>
      ) : null}
      {copy.headlineLines.length ? (
        <Headline lines={copy.headlineLines} />
      ) : null}
      {copy.card ? <IntroCard text={copy.card} /> : null}
    </div>
  );
}
