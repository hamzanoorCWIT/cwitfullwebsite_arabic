"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import "./MarketingAppBannerHeadline.css";

const FRAME_W = 1920;
const FRAME_H = 1068;
const TITLE_SIZE_PX = 250;
const TITLE_LINE_PX = 265.286;
const TITLE_TOP_PX = 142;
const TITLE_GAP_PX = 160;
const MARQUEE_SPEED_PX_PER_SEC = 72;
const TAG_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

function frameSize(px: number): string {
  const byWidth = ((px / FRAME_W) * 100).toFixed(4);
  const byHeight = ((px / FRAME_H) * 100).toFixed(4);
  return `min(${byWidth}vw, ${byHeight}vh)`;
}

function splitIntro(intro?: string) {
  const text = intro?.trim() || "";
  const match = text.match(/^(.*?\b)(future)(\b.*)$/i);

  if (!match) {
    return { before: text, accent: "", after: "" };
  }

  return {
    before: match[1],
    accent: match[2],
    after: match[3],
  };
}

function resolveCopy(lines: string[], intro?: string) {
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);
  const cmsIntro = intro?.trim() || "";

  if (cleaned.length >= 2) {
    return {
      watermark: cleaned[0],
      headline: cleaned.slice(1).join(" "),
      intro: cmsIntro,
    };
  }

  return {
    watermark: cleaned[0] || "",
    headline: "",
    intro: cmsIntro,
  };
}

function MarqueeItem({ text }: { text: string }) {
  return (
    <span
      className="marketing-app-hero-watermark flex-none whitespace-nowrap uppercase"
      style={{
        paddingRight: `var(--marketing-watermark-gap, ${frameSize(TITLE_GAP_PX)})`,
        fontSize: `var(--marketing-watermark-size, ${frameSize(TITLE_SIZE_PX)})`,
        lineHeight: `var(--marketing-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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
      className="marketing-app-hero-marquee pointer-events-none absolute inset-x-0 overflow-hidden"
      aria-hidden="true"
      style={{
        top: shown
          ? `var(--marketing-watermark-top, ${frameSize(TITLE_TOP_PX)})`
          : `calc(var(--marketing-watermark-top, ${frameSize(TITLE_TOP_PX)}) - 100vh)`,
        height: `var(--marketing-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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

export default function MarketingAppBannerHeadline({
  lines,
  intro,
}: {
  lines: string[];
  intro?: string;
}) {
  const copy = resolveCopy(lines, intro);
  const introParts = splitIntro(copy.intro);
  const accessibleTitle = [copy.intro, copy.headline, copy.watermark]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="marketing-app-hero-copy pointer-events-none absolute inset-0">
      {accessibleTitle ? <h1 className="sr-only">{accessibleTitle}</h1> : null}

      {copy.watermark ? <WatermarkMarquee text={copy.watermark} /> : null}

      <div className="marketing-app-hero-lockup">
        <span className="marketing-app-hero-vector" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/figma-assets/marketing-banner-vector.svg" alt="" />
        </span>

        {copy.intro ? (
          <p className="marketing-app-hero-kicker" aria-hidden="true">
            <span className="marketing-app-hero-kicker-dot" />
            {introParts.before ? (
              <span className="marketing-app-hero-kicker-before">
                {introParts.before}
              </span>
            ) : null}
            {introParts.accent ? (
              <span className="marketing-app-hero-kicker-accent-wrap">
                <span className="marketing-app-hero-kicker-accent">
                  {introParts.accent}
                </span>
              </span>
            ) : null}
            {introParts.after ? (
              <span className="marketing-app-hero-kicker-after">
                {introParts.after}
              </span>
            ) : null}
          </p>
        ) : null}

        {copy.headline ? (
          <p
            className="marketing-app-hero-headline marketing-app-hero-headline-in-lockup"
            aria-hidden="true"
          >
            {copy.headline}
          </p>
        ) : null}
      </div>

      {copy.headline ? (
        <p
          className="marketing-app-hero-headline marketing-app-hero-headline-banner"
          aria-hidden="true"
        >
          {copy.headline}
        </p>
      ) : null}
    </div>
  );
}
