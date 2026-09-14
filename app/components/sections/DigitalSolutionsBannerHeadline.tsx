"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import FadeUpReveal from "@/app/components/ui/FadeUpReveal";
import "./DigitalSolutionsBannerHeadline.css";

const FRAME_W = 1920;
const FRAME_H = 1068;
const TITLE_SIZE_PX = 250;
const TITLE_LINE_PX = 265.286;
const TITLE_TOP_PX = 184;
const TITLE_GAP_PX = 160;
const MARQUEE_SPEED_PX_PER_SEC = 72;
const TAG_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

function frameSize(px: number): string {
  const byWidth = ((px / FRAME_W) * 100).toFixed(4);
  const byHeight = ((px / FRAME_H) * 100).toFixed(4);
  return `min(${byWidth}vw, ${byHeight}vh)`;
}

function Marker() {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/figma-assets/seo-banner-marker.svg"
      alt=""
      aria-hidden="true"
      className="digital-solutions-hero-card-mark"
    />
  );
}

function MarqueeItem({ text }: { text: string }) {
  return (
    <span
      className="digital-solutions-hero-watermark flex-none whitespace-nowrap uppercase"
      style={{
        paddingRight: `var(--digital-solutions-watermark-gap, ${frameSize(TITLE_GAP_PX)})`,
        fontSize: `var(--digital-solutions-watermark-size, ${frameSize(TITLE_SIZE_PX)})`,
        lineHeight: `var(--digital-solutions-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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
      className="digital-solutions-hero-marquee pointer-events-none absolute inset-x-0 overflow-hidden"
      aria-hidden="true"
      style={{
        top: shown
          ? `var(--digital-solutions-watermark-top, ${frameSize(TITLE_TOP_PX)})`
          : `calc(var(--digital-solutions-watermark-top, ${frameSize(TITLE_TOP_PX)}) - 100vh)`,
        height: `var(--digital-solutions-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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

function DescriptionCard({
  text,
  duration = 1.2,
}: {
  text: string;
  duration?: number;
}) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!text) return null;

  return (
    <div
      className="digital-solutions-hero-card absolute"
      style={{
        left: `var(--digital-solutions-card-left, ${frameSize(79)})`,
        top: `var(--digital-solutions-card-top, ${frameSize(587)})`,
        opacity: shown ? 1 : 0,
        transform:
          "translateX(var(--digital-solutions-card-x, 0px)) translateY(var(--digital-solutions-card-y, 0px))",
        transition: `opacity ${duration}s ${TAG_EASE}`,
      }}
    >
      <FadeUpReveal>
        <div
          className="digital-solutions-hero-card-inner"
          style={{
            width: `var(--digital-solutions-card-w, ${frameSize(486)})`,
            paddingTop: `var(--digital-solutions-card-pad-top, ${frameSize(27)})`,
            paddingRight: `var(--digital-solutions-card-pad-right, ${frameSize(36)})`,
            paddingBottom: `var(--digital-solutions-card-pad-bottom, ${frameSize(48)})`,
            paddingLeft: `var(--digital-solutions-card-pad-left, ${frameSize(29)})`,
            borderRadius: `var(--digital-solutions-card-radius, ${frameSize(20)})`,
          }}
        >
          <Marker />
          <p
            className="digital-solutions-hero-card-text m-0 font-inter font-[500] text-white"
            style={{
              marginTop: `var(--digital-solutions-card-copy-top, ${frameSize(28)})`,
              fontSize: `var(--digital-solutions-card-font, ${frameSize(20)})`,
              lineHeight: `var(--digital-solutions-card-line, ${frameSize(30)})`,
            }}
          >
            {text}
          </p>
        </div>
      </FadeUpReveal>
    </div>
  );
}

export default function DigitalSolutionsBannerHeadline({
  lines,
  intro,
  description,
  layer = "all",
}: {
  lines: string[];
  intro?: string;
  description?: string;
  layer?: "watermark" | "card" | "all";
}) {
  const headline = lines.map((line) => line.trim()).filter(Boolean).join(" ");
  const cardText = (description || intro || "").trim();

  if (layer === "watermark") {
    if (!headline) return null;
    return (
      <div className="digital-solutions-hero-copy pointer-events-none absolute inset-0">
        <h1 className="sr-only">{headline}</h1>
        <WatermarkMarquee text={headline} />
      </div>
    );
  }

  if (layer === "card") {
    if (!cardText) return null;
    return (
      <div className="digital-solutions-hero-copy pointer-events-none absolute inset-0">
        <DescriptionCard text={cardText} />
      </div>
    );
  }

  if (!headline && !cardText) return null;

  return (
    <div className="digital-solutions-hero-copy pointer-events-none absolute inset-0">
      {headline ? <h1 className="sr-only">{headline}</h1> : null}
      <WatermarkMarquee text={headline} />
      <DescriptionCard text={cardText} />
    </div>
  );
}
