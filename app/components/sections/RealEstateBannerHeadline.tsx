"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import FadeUpReveal from "@/app/components/ui/FadeUpReveal";
import HeroClouds from "@/app/components/sections/HeroClouds";
import HeroBirds from "@/app/components/sections/HeroBirds";
import "./RealEstateBannerHeadline.css";

const FRAME_W = 1920;
const FRAME_H = 1080;
const TITLE_SIZE_PX = 220;
const TITLE_LINE_PX = 234;
const TITLE_TOP_PX = 168;
const TITLE_GAP_PX = 140;
const MARQUEE_SPEED_PX_PER_SEC = 72;
const TAG_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

function frameSize(px: number): string {
  const byWidth = ((px / FRAME_W) * 100).toFixed(4);
  const byHeight = ((px / FRAME_H) * 100).toFixed(4);
  return `min(${byWidth}vw, ${byHeight}vh)`;
}

function resolveCopy(lines: string[], intro?: string, description?: string) {
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);
  const card = (intro || description || "").trim();

  if (cleaned.length >= 2) {
    return {
      watermark: cleaned[0],
      headline: cleaned.slice(1).join(" "),
      card,
    };
  }

  return {
    watermark: "",
    headline: cleaned[0] || "",
    card,
  };
}

function MarqueeItem({ text }: { text: string }) {
  return (
    <span
      className="real-estate-hero-watermark flex-none whitespace-nowrap uppercase"
      style={{
        paddingRight: `var(--real-estate-watermark-gap, ${frameSize(TITLE_GAP_PX)})`,
        fontSize: `var(--real-estate-watermark-size, ${frameSize(TITLE_SIZE_PX)})`,
        lineHeight: `var(--real-estate-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
      }}
    >
      {text.toUpperCase()}
    </span>
  );
}

function MarqueeGroup({ text, count }: { text: string; count: number }) {
  return (
    <div className="flex flex-none items-center">
      {Array.from({ length: count }, (_, index) => (
        <MarqueeItem key={index} text={text} />
      ))}
    </div>
  );
}

function WatermarkMarquee({
  text,
  duration = 1.2,
}: {
  text: string;
  duration?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [repeatCount, setRepeatCount] = useState(2);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    let tween: gsap.core.Tween | null = null;

    const sync = () => {
      const firstSet = track.children[0] as HTMLElement | undefined;
      if (!firstSet) return;

      const setWidth = firstSet.getBoundingClientRect().width;
      const viewportWidth = root.getBoundingClientRect().width;
      if (setWidth < 1) return;

      if (setWidth < viewportWidth + 80 && repeatCount < 10) {
        setRepeatCount((count) => count + 1);
        return;
      }

      tween?.kill();
      gsap.set(track, { left: 0 });
      tween = gsap.to(track, {
        // Arabic (RTL) runs the marquee left-to-right.
        left: rtlAwareTranslateX(setWidth, isRtlDirection(root)),
        duration: setWidth / MARQUEE_SPEED_PX_PER_SEC,
        ease: "none",
        repeat: -1,
      });
    };

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(root);
    observer.observe(track);
    void document.fonts.ready.then(sync);

    return () => {
      tween?.kill();
      observer.disconnect();
    };
  }, [text, repeatCount]);

  return (
    <div
      ref={rootRef}
      className="real-estate-hero-marquee pointer-events-none absolute inset-x-0 overflow-hidden"
      aria-hidden="true"
      style={{
        top: shown
          ? `var(--real-estate-watermark-top, ${frameSize(TITLE_TOP_PX)})`
          : `calc(var(--real-estate-watermark-top, ${frameSize(TITLE_TOP_PX)}) - 100vh)`,
        height: `var(--real-estate-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
        transition: `top ${duration}s ${TAG_EASE}`,
      }}
    >
      <div
        ref={trackRef}
        className="relative flex h-full w-max items-center"
        style={{ left: 0 }}
      >
        <MarqueeGroup text={text} count={repeatCount} />
        <MarqueeGroup text={text} count={repeatCount} />
      </div>
    </div>
  );
}

function CardMark() {
  return (
    <svg
      className="real-estate-hero-card-mark"
      viewBox="0 0 14.0834 14.0834"
      fill="none"
      aria-hidden="true"
      style={{
        width: `var(--real-estate-card-icon, ${frameSize(14.083)})`,
        height: `var(--real-estate-card-icon, ${frameSize(14.083)})`,
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
      className="real-estate-hero-card absolute"
      style={{
        top: "auto",
        bottom: `var(--real-estate-card-bottom, ${frameSize(293)})`,
        left: `var(--real-estate-card-left, ${frameSize(72)})`,
        opacity: shown ? 1 : 0,
        transform:
          "translateX(var(--real-estate-card-x, 0px)) translateY(var(--real-estate-card-y, 0px))",
        transition: `opacity ${duration}s ${TAG_EASE}`,
      }}
    >
      <FadeUpReveal>
        <div
          className="real-estate-hero-card-inner"
          style={{
            width: `var(--real-estate-card-w, ${frameSize(487)})`,
            height: `var(--real-estate-card-h, ${frameSize(180)})`,
            paddingTop: `var(--real-estate-card-pad-top, ${frameSize(28)})`,
            paddingRight: `var(--real-estate-card-pad-x, ${frameSize(32)})`,
            paddingBottom: `var(--real-estate-card-pad-bottom, ${frameSize(36)})`,
            paddingLeft: `var(--real-estate-card-pad-x, ${frameSize(32)})`,
            borderRadius: `var(--real-estate-card-radius, ${frameSize(18)})`,
          }}
        >
          <CardMark />
          <p
            className="real-estate-hero-card-text m-0 font-inter font-[500] text-white"
            style={{
              marginTop: `var(--real-estate-card-copy-top, ${frameSize(22)})`,
              fontSize: `var(--real-estate-card-font, ${frameSize(18)})`,
              lineHeight: `var(--real-estate-card-line, ${frameSize(28)})`,
            }}
          >
            {text}
          </p>
        </div>
      </FadeUpReveal>
    </div>
  );
}

function Headline({ text }: { text: string }) {
  return (
    <p className="real-estate-hero-headline" aria-hidden="true">
      {text}
    </p>
  );
}

export default function RealEstateBannerHeadline({
  lines,
  intro,
  description,
  showClouds = false,
  layer = "all",
}: {
  lines: string[];
  intro?: string;
  description?: string;
  showClouds?: boolean;
  layer?: "back" | "front" | "all";
}) {
  const copy = resolveCopy(lines, intro, description);
  const accessibleTitle = [copy.card, copy.headline, copy.watermark].filter(
    Boolean
  );

  if (layer === "back") {
    if (!copy.watermark && !showClouds) return null;
    return (
      <div className="real-estate-hero-copy pointer-events-none absolute inset-0">
        {showClouds ? <HeroClouds layers="sky" /> : null}
        {showClouds ? <HeroBirds /> : null}
        {!copy.headline && copy.watermark ? (
          <h1 className="sr-only">{copy.watermark}</h1>
        ) : null}
        {copy.watermark ? <WatermarkMarquee text={copy.watermark} /> : null}
      </div>
    );
  }

  if (layer === "front") {
    if (!copy.headline && !copy.card && !showClouds) return null;
    return (
      <div className="real-estate-hero-copy real-estate-hero-copy-front pointer-events-none absolute inset-0">
        {showClouds ? <HeroClouds layers="ground" /> : null}
        {copy.headline ? <h1 className="sr-only">{copy.headline}</h1> : null}
        {copy.card ? <IntroCard text={copy.card} /> : null}
        {copy.headline ? <Headline text={copy.headline} /> : null}
      </div>
    );
  }

  if (!copy.watermark && !copy.headline && !copy.card && !showClouds) {
    return null;
  }

  return (
    <div className="real-estate-hero-copy pointer-events-none absolute inset-0">
      {showClouds ? <HeroClouds /> : null}
      {showClouds ? <HeroBirds /> : null}
      {accessibleTitle.length ? (
        <h1 className="sr-only">{accessibleTitle.join(" ")}</h1>
      ) : null}
      {copy.watermark ? <WatermarkMarquee text={copy.watermark} /> : null}
      {copy.card ? <IntroCard text={copy.card} /> : null}
      {copy.headline ? <Headline text={copy.headline} /> : null}
    </div>
  );
}
