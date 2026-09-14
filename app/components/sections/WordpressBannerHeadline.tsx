"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import "./WordpressBannerHeadline.css";

/** Figma sizes against the 1920 × 1080 banner frame. */
const FRAME_W = 1920;
const FRAME_H = 1080;
const TITLE_SIZE_PX = 250;
const TITLE_LINE_PX = 265;
const TITLE_TOP_PX = 242;
const TITLE_GAP_PX = 160;
const MARQUEE_SPEED_PX_PER_SEC = 72;
const TAG_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

function frameSize(px: number): string {
  const byWidth = ((px / FRAME_W) * 100).toFixed(4);
  const byHeight = ((px / FRAME_H) * 100).toFixed(4);
  return `min(${byWidth}vw, ${byHeight}vh)`;
}

function MarqueeItem({ text }: { text: string }) {
  return (
    <span
      className="wordpress-hero-watermark flex-none whitespace-nowrap uppercase"
      style={{
        paddingRight: `var(--wordpress-watermark-gap, ${frameSize(TITLE_GAP_PX)})`,
        fontSize: `var(--wordpress-watermark-size, ${frameSize(TITLE_SIZE_PX)})`,
        lineHeight: `var(--wordpress-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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
      className="wordpress-hero-marquee pointer-events-none absolute inset-x-0 overflow-hidden"
      aria-hidden="true"
      style={{
        top: shown
          ? `var(--wordpress-watermark-top, ${frameSize(TITLE_TOP_PX)})`
          : `calc(var(--wordpress-watermark-top, ${frameSize(TITLE_TOP_PX)}) - 100vh)`,
        height: `var(--wordpress-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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

export default function WordpressBannerHeadline({
  lines,
}: {
  lines: string[];
}) {
  const watermark = lines.map((line) => line.trim()).filter(Boolean).join(" ");
  if (!watermark) return null;

  return (
    <div className="wordpress-hero-copy pointer-events-none absolute inset-0">
      <h1 className="sr-only">{watermark}</h1>
      <WatermarkMarquee text={watermark} />
    </div>
  );
}
