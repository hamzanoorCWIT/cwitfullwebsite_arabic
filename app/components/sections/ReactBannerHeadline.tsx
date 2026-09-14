"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import "./ReactBannerHeadline.css";

const FRAME_W = 1920;
const FRAME_H = 1080;
const TITLE_SIZE_PX = 250;
const TITLE_LINE_PX = 265.286;
const TITLE_TOP_PX = 242;
const TITLE_GAP_PX = 160;
const CARD_LEFT_PX = 1217;
const CARD_TOP_PX = 777;
const CARD_WIDTH_PX = 432;
const CARD_PAD_LEFT_PX = 29;
const CARD_PAD_RIGHT_PX = 36;
const CARD_PAD_TOP_PX = 27;
const CARD_PAD_BOTTOM_PX = 48;
const CARD_RADIUS_PX = 20;
const CARD_FONT_PX = 20;
const BLUR_LEFT_OFFSET_PX = 10;
const BLUR_WIDTH_PX = 1076;
const BLUR_HEIGHT_PX = 247;
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
      className="react-hero-watermark flex-none whitespace-nowrap uppercase"
      style={{
        paddingRight: `var(--react-watermark-gap, ${frameSize(TITLE_GAP_PX)})`,
        fontSize: `var(--react-watermark-size, ${frameSize(TITLE_SIZE_PX)})`,
        lineHeight: `var(--react-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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
      className="react-hero-marquee pointer-events-none absolute inset-x-0 overflow-hidden"
      aria-hidden="true"
      style={{
        top: shown
          ? `var(--react-watermark-top, ${frameSize(TITLE_TOP_PX)})`
          : `calc(var(--react-watermark-top, ${frameSize(TITLE_TOP_PX)}) - 100vh)`,
        height: `var(--react-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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

function IntroCard({ text, duration = 1.2 }: { text: string; duration?: number }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="react-hero-card absolute"
      style={{
        left: `var(--react-card-left, ${frameSize(CARD_LEFT_PX)})`,
        right: "var(--react-card-right, auto)",
        top: `var(--react-card-top, ${frameSize(CARD_TOP_PX)})`,
        opacity: shown ? 1 : 0,
        transform:
          "translateX(var(--react-card-x, 0px)) translateY(var(--react-card-y, 0px))",
        transition: `opacity ${duration}s ${TAG_EASE}`,
      }}
    >
      <div
        className="react-hero-card-inner"
        style={{
          width: `var(--react-card-w, ${frameSize(CARD_WIDTH_PX)})`,
          paddingTop: `var(--react-card-pad-top, ${frameSize(CARD_PAD_TOP_PX)})`,
          paddingRight: `var(--react-card-pad-right, ${frameSize(CARD_PAD_RIGHT_PX)})`,
          paddingBottom: `var(--react-card-pad-bottom, ${frameSize(CARD_PAD_BOTTOM_PX)})`,
          paddingLeft: `var(--react-card-pad-left, ${frameSize(CARD_PAD_LEFT_PX)})`,
          borderRadius: `var(--react-card-radius, ${frameSize(CARD_RADIUS_PX)})`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/figma-assets/web-banner-card-icon.svg"
          alt=""
          aria-hidden="true"
          className="react-hero-card-mark"
        />
        <p
          className="react-hero-card-text m-0 font-inter font-[500] text-white"
          style={{
            marginTop: `var(--react-card-copy-top, ${frameSize(28)})`,
            fontSize: `var(--react-card-font, ${frameSize(CARD_FONT_PX)})`,
            lineHeight: `var(--react-card-line, ${frameSize(30)})`,
          }}
        >
          {text}
        </p>
      </div>
    </div>
  );
}

function BottomBlur({ src }: { src: string }) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="react-hero-bottom-blur"
      aria-hidden="true"
      style={{
        left: `var(--react-blur-left, calc(50% + ${frameSize(BLUR_LEFT_OFFSET_PX)}))`,
        bottom: "var(--react-blur-bottom, 0px)",
        width: `var(--react-blur-w, ${frameSize(BLUR_WIDTH_PX)})`,
        height: `var(--react-blur-h, ${frameSize(BLUR_HEIGHT_PX)})`,
        opacity: shown ? 1 : 0,
        transform: shown
          ? "translateX(-50%) translateY(0)"
          : "translateX(-50%) translateY(24px)",
        transition: `opacity 1.2s ${TAG_EASE}, transform 1.2s ${TAG_EASE}`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="react-hero-bottom-blur-img" />
    </div>
  );
}

/**
 * /react banner overlay. Words, background, and foreground come from WordPress.
 * The bottom blur is a cropped, blurred slice of the CMS background and only
 * appears when a CMS foreground is uploaded, so it arrives with that mark.
 */
export default function ReactBannerHeadline({
  lines,
  intro,
  description,
  backgroundSrc,
  foregroundSrc,
  layer = "watermark",
}: {
  lines: string[];
  intro?: string;
  description?: string;
  backgroundSrc?: string;
  foregroundSrc?: string;
  layer?: "watermark" | "card";
}) {
  const watermark = lines.map((line) => line.trim()).filter(Boolean).join(" ");
  const cardText = (intro || description || "").trim();

  if (layer === "watermark") {
    if (!watermark) return null;
    return (
      <div className="react-hero-copy pointer-events-none absolute inset-0">
        <h1 className="sr-only">{watermark}</h1>
        <WatermarkMarquee text={watermark} />
      </div>
    );
  }

  const blurSrc = backgroundSrc || (foregroundSrc ? foregroundSrc : undefined);
  if (!cardText && !blurSrc && !watermark) return null;

  return (
    <div className="react-hero-copy pointer-events-none absolute inset-0">
      {blurSrc ? <BottomBlur src={blurSrc} /> : null}
      {cardText ? <IntroCard text={cardText} /> : null}
    </div>
  );
}
