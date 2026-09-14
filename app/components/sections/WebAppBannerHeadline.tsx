"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import "./WebAppBannerHeadline.css";

/** Figma sizes against the 1920 × 1068 banner frame. */
const FRAME_W = 1920;
const FRAME_H = 1068;
const TITLE_SIZE_PX = 250;
const TITLE_LINE_PX = 265.286;
const TITLE_TOP_PX = 164;
const TITLE_GAP_PX = 160;
const MARQUEE_SPEED_PX_PER_SEC = 72;
const CARD_LEFT_PX = 65;
const CARD_TOP_PX = 427;
const CARD_WIDTH_PX = 432;
const CARD_PAD_X_PX = 29;
const CARD_PAD_TOP_PX = 27;
const CARD_PAD_BOTTOM_PX = 48;
const CARD_RADIUS_PX = 20;
const CARD_FONT_PX = 20;
const TAG_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

function frameSize(px: number): string {
  const byWidth = ((px / FRAME_W) * 100).toFixed(4);
  const byHeight = ((px / FRAME_H) * 100).toFixed(4);
  return `min(${byWidth}vw, ${byHeight}vh)`;
}

function IntroCard({ text, duration = 1.2 }: { text: string; duration?: number }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="web-app-hero-card absolute"
      style={{
        top: `var(--web-app-card-top, ${frameSize(CARD_TOP_PX)})`,
        left: `var(--web-app-card-left, ${frameSize(CARD_LEFT_PX)})`,
        zIndex: 3,
        opacity: shown ? 1 : 0,
        transform:
          "translateX(var(--web-app-card-x, 0px)) translateY(var(--web-app-card-y, 0px))",
        transition: `opacity ${duration}s ${TAG_EASE} 0s`,
      }}
    >
      <div
        className="web-app-hero-card-inner flex flex-col"
        style={{
          width: `var(--web-app-card-w, ${frameSize(CARD_WIDTH_PX)})`,
          boxSizing: "border-box",
          paddingTop: `var(--web-app-card-pad-top, ${frameSize(CARD_PAD_TOP_PX)})`,
          paddingRight: `var(--web-app-card-pad-x, ${frameSize(36)})`,
          paddingBottom: `var(--web-app-card-pad-bottom, ${frameSize(CARD_PAD_BOTTOM_PX)})`,
          paddingLeft: `var(--web-app-card-pad-x, ${frameSize(CARD_PAD_X_PX)})`,
          borderRadius: `var(--web-app-card-radius, ${frameSize(CARD_RADIUS_PX)})`,
          background: "rgba(129, 112, 112, 0.07)",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(7.5px)",
          WebkitBackdropFilter: "blur(7.5px)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/figma-assets/web-banner-card-icon.svg"
          alt=""
          aria-hidden="true"
          className="web-app-hero-card-mark"
        />
        <p
          className="web-app-hero-card-text m-0 font-inter font-[500] tracking-[0] text-white"
          style={{
            fontSize: `var(--web-app-card-font, ${frameSize(CARD_FONT_PX)})`,
            lineHeight: `var(--web-app-card-line-height, ${frameSize(30)})`,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function MarqueeItem({ text }: { text: string }) {
  return (
    <span
      className="web-app-hero-title flex-none whitespace-nowrap uppercase"
      style={{
        paddingRight: `var(--web-app-title-gap, ${frameSize(TITLE_GAP_PX)})`,
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

function OutlinedTitle({
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
      className="pointer-events-none absolute inset-x-0 overflow-hidden"
      aria-hidden="true"
      style={{
        top: shown
          ? `var(--web-app-title-top, ${frameSize(TITLE_TOP_PX)})`
          : `calc(var(--web-app-title-top, ${frameSize(TITLE_TOP_PX)}) - 100vh)`,
        height: `var(--web-app-title-line-height, ${frameSize(TITLE_LINE_PX)})`,
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

/**
 * /web-app headline — large watermark title and glass copy card.
 * Copy comes from CMS; the exact placement and treatment are frontend-owned.
 */
export default function WebAppBannerHeadline({
  lines,
  duration = 1.2,
  layer = "title",
  intro,
}: {
  lines: string[];
  duration?: number;
  layer?: "title" | "card";
  intro?: string;
}) {
  const title = lines.map((line) => line.trim()).filter(Boolean).join(" ");
  const cardText = intro?.trim() || "";

  if (layer === "title") {
    if (!title) return null;
    return <OutlinedTitle text={title} duration={duration} />;
  }

  return (
    <h1 className="absolute inset-0">
      <span className="sr-only">{[title, cardText].filter(Boolean).join(" ")}</span>
      {cardText ? <IntroCard text={cardText} duration={duration} /> : null}
    </h1>
  );
}
