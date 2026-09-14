"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import FadeUpReveal from "@/app/components/ui/FadeUpReveal";
import "./EducationBannerHeadline.css";

const FRAME_W = 1920;
const FRAME_H = 1080;
const TITLE_SIZE_PX = 200;
const TITLE_LINE_PX = 214;
const TITLE_TOP_PX = 176;
const TITLE_GAP_PX = 140;
const MARQUEE_SPEED_PX_PER_SEC = 72;
const TAG_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

function frameSize(px: number): string {
  const byWidth = ((px / FRAME_W) * 100).toFixed(4);
  const byHeight = ((px / FRAME_H) * 100).toFixed(4);
  return `min(${byWidth}vw, ${byHeight}vh)`;
}

function resolveCopy(lines: string[]) {
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);

  if (cleaned.length >= 2) {
    return {
      watermark: cleaned[0],
      headline: cleaned.slice(1).join(" "),
    };
  }

  return {
    watermark: "",
    headline: cleaned[0] || "",
  };
}

function MarqueeItem({ text }: { text: string }) {
  return (
    <span
      className="education-hero-watermark flex-none whitespace-nowrap uppercase"
      style={{
        paddingRight: `var(--education-watermark-gap, ${frameSize(TITLE_GAP_PX)})`,
        fontSize: `var(--education-watermark-size, ${frameSize(TITLE_SIZE_PX)})`,
        lineHeight: `var(--education-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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
      className="education-hero-marquee pointer-events-none absolute inset-x-0 overflow-hidden"
      aria-hidden="true"
      style={{
        top: shown
          ? `var(--education-watermark-top, ${frameSize(TITLE_TOP_PX)})`
          : `calc(var(--education-watermark-top, ${frameSize(TITLE_TOP_PX)}) - 100vh)`,
        height: `var(--education-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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

function VideoScribble() {
  return (
    <svg
      className="education-hero-scribble education-hero-scribble-video"
      viewBox="0 0 420 180"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M52 96C28 62 48 28 96 22c70-8 168 6 228 38 42 22 52 58 18 78-40 24-138 18-210-4-48-14-86-40-78-72 10-42 118-52 198-22 54 20 92 56 70 84"
        stroke="#FFC425"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function LearnScribble() {
  return (
    <svg
      className="education-hero-scribble education-hero-scribble-learn"
      viewBox="0 0 300 200"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M268 78C248 28 168 8 96 18 36 26 8 62 22 102c16 46 92 62 168 42 52-14 82-48 70-82C244 28 156 14 86 36"
        stroke="#FFC425"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GalleryMark() {
  return (
    <svg
      className="education-hero-gallery"
      viewBox="0 0 56 56"
      aria-hidden="true"
    >
      <circle cx="28" cy="28" r="28" fill="#1B2A4A" />
      <rect
        x="16"
        y="18"
        width="24"
        height="20"
        rx="3"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
      />
      <circle cx="22.5" cy="24.5" r="2.2" fill="#fff" />
      <path
        d="M16.8 34.2l7.4-7.2 5.2 5 3.6-3.4 6.2 5.6"
        fill="none"
        stroke="#fff"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoVector() {
  return (
    <div className="education-hero-video" aria-hidden="true">
      <VideoScribble />
      <div className="education-hero-video-row">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/figma-assets/play-video.png"
          alt=""
          className="education-hero-play-seal"
        />
        <p className="education-hero-vector-copy">
          Discover Life
          <br />
          at CW
        </p>
      </div>
    </div>
  );
}

function LearnVector() {
  return (
    <div className="education-hero-learn" aria-hidden="true">
      <LearnScribble />
      <p className="education-hero-vector-copy education-hero-learn-copy">
        Learning Beyond
        <br />
        the Classroom
      </p>
      <GalleryMark />
    </div>
  );
}

function Headline({ text }: { text: string }) {
  return (
    <p className="education-hero-headline" aria-hidden="true">
      {text}
    </p>
  );
}

function BottomCloud() {
  return (
    <div className="education-hero-cloud" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/figma-assets/cloud%204.png" alt="" />
    </div>
  );
}

export default function EducationBannerHeadline({
  lines,
  showClouds = false,
  showVectors = false,
  layer = "all",
}: {
  lines: string[];
  showClouds?: boolean;
  showVectors?: boolean;
  layer?: "back" | "front" | "all";
}) {
  const copy = resolveCopy(lines);
  const accessibleTitle = [copy.headline, copy.watermark]
    .filter(Boolean)
    .join(" ");

  if (layer === "back") {
    if (!copy.watermark) return null;
    return (
      <div className="education-hero-copy pointer-events-none absolute inset-0">
        {!copy.headline && copy.watermark ? (
          <h1 className="sr-only">{copy.watermark}</h1>
        ) : null}
        {copy.watermark ? <WatermarkMarquee text={copy.watermark} /> : null}
      </div>
    );
  }

  if (layer === "front") {
    if (!copy.headline && !showClouds && !showVectors) return null;
    return (
      <div className="education-hero-copy education-hero-copy-front pointer-events-none absolute inset-0">
        {showClouds ? <BottomCloud /> : null}
        {showVectors ? (
          <FadeUpReveal className="pointer-events-none absolute inset-0">
            <VideoVector />
            <LearnVector />
          </FadeUpReveal>
        ) : null}
        {copy.headline ? <h1 className="sr-only">{copy.headline}</h1> : null}
        {copy.headline ? <Headline text={copy.headline} /> : null}
      </div>
    );
  }

  if (!copy.watermark && !copy.headline && !showClouds && !showVectors) {
    return null;
  }

  return (
    <div className="education-hero-copy pointer-events-none absolute inset-0">
      {showClouds ? <BottomCloud /> : null}
      {accessibleTitle ? <h1 className="sr-only">{accessibleTitle}</h1> : null}
      {copy.watermark ? <WatermarkMarquee text={copy.watermark} /> : null}
      {showVectors ? (
        <>
          <VideoVector />
          <LearnVector />
        </>
      ) : null}
      {copy.headline ? <Headline text={copy.headline} /> : null}
    </div>
  );
}
