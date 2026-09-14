"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import FadeUpReveal from "@/app/components/ui/FadeUpReveal";
import "./RetailEcommerceBannerHeadline.css";

const FRAME_W = 1920;
const FRAME_H = 1080;
const TITLE_SIZE_PX = 220;
const TITLE_LINE_PX = 234;
const TITLE_TOP_PX = 184;
const TITLE_GAP_PX = 140;
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
      className="retail-ecommerce-hero-watermark flex-none whitespace-nowrap uppercase"
      style={{
        paddingRight: `var(--retail-ecommerce-watermark-gap, ${frameSize(TITLE_GAP_PX)})`,
        fontSize: `var(--retail-ecommerce-watermark-size, ${frameSize(TITLE_SIZE_PX)})`,
        lineHeight: `var(--retail-ecommerce-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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
      className="retail-ecommerce-hero-marquee pointer-events-none absolute inset-x-0 overflow-hidden"
      aria-hidden="true"
      style={{
        top: shown
          ? `var(--retail-ecommerce-watermark-top, ${frameSize(TITLE_TOP_PX)})`
          : `calc(var(--retail-ecommerce-watermark-top, ${frameSize(TITLE_TOP_PX)}) - 100vh)`,
        height: `var(--retail-ecommerce-watermark-line, ${frameSize(TITLE_LINE_PX)})`,
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
      className="retail-ecommerce-hero-card-mark"
      viewBox="0 0 14.0834 14.0834"
      fill="none"
      aria-hidden="true"
      style={{
        width: `var(--retail-ecommerce-card-icon, ${frameSize(14.083)})`,
        height: `var(--retail-ecommerce-card-icon, ${frameSize(14.083)})`,
      }}
    >
      <path
        d="M5.90724 0.772048C6.31323 -0.257357 7.7701 -0.257346 8.17609 0.772059L9.43421 3.9621C9.55814 4.27638 9.80698 4.52516 10.1213 4.6491L13.3112 5.90724C14.3407 6.31323 14.3407 7.7701 13.3112 8.17609L10.1213 9.43421C9.80698 9.55814 9.55814 9.80698 9.43421 10.1213L8.17609 13.3112C7.7701 14.3407 6.31323 14.3407 5.90724 13.3112L4.6491 10.1213C4.52516 9.80698 4.27638 9.55814 3.9621 9.43421L0.772048 8.17609C-0.257357 7.7701 -0.257346 6.31323 0.772059 5.90724L3.9621 4.6491C4.27638 4.52516 4.52516 4.27638 4.6491 3.9621L5.90724 0.772048Z"
        fill="#A8D85B"
      />
    </svg>
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
      className="retail-ecommerce-hero-card absolute"
      style={{
        top: "auto",
        right: `var(--retail-ecommerce-card-right, ${frameSize(72)})`,
        bottom: `var(--retail-ecommerce-card-bottom, ${frameSize(212)})`,
        left: "auto",
        opacity: shown ? 1 : 0,
        transform:
          "translateX(var(--retail-ecommerce-card-x, 0px)) translateY(var(--retail-ecommerce-card-y, 0px))",
        transition: `opacity ${duration}s ${TAG_EASE}`,
      }}
    >
      <FadeUpReveal>
        <div
          className="retail-ecommerce-hero-card-inner"
          style={{
            width: `var(--retail-ecommerce-card-w, ${frameSize(487)})`,
            paddingTop: `var(--retail-ecommerce-card-pad-top, ${frameSize(28)})`,
            paddingRight: `var(--retail-ecommerce-card-pad-x, ${frameSize(32)})`,
            paddingBottom: `var(--retail-ecommerce-card-pad-bottom, ${frameSize(36)})`,
            paddingLeft: `var(--retail-ecommerce-card-pad-x, ${frameSize(32)})`,
            borderRadius: `var(--retail-ecommerce-card-radius, ${frameSize(18)})`,
          }}
        >
          <CardMark />
          <p
            className="retail-ecommerce-hero-card-text m-0 font-inter font-[500] text-white"
            style={{
              marginTop: `var(--retail-ecommerce-card-copy-top, ${frameSize(22)})`,
              fontSize: `var(--retail-ecommerce-card-font, ${frameSize(18)})`,
              lineHeight: `var(--retail-ecommerce-card-line, ${frameSize(28)})`,
            }}
          >
            {text}
          </p>
        </div>
      </FadeUpReveal>
    </div>
  );
}

export default function RetailEcommerceBannerHeadline({
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
  const watermark = lines.map((line) => line.trim()).filter(Boolean).join(" ");
  const cardText = (description || intro || "").trim();

  if (layer === "watermark") {
    if (!watermark) return null;
    return (
      <div className="retail-ecommerce-hero-copy pointer-events-none absolute inset-0">
        <h1 className="sr-only">{watermark}</h1>
        <WatermarkMarquee text={watermark} />
      </div>
    );
  }

  if (layer === "card") {
    if (!cardText) return null;
    return (
      <div className="retail-ecommerce-hero-copy retail-ecommerce-hero-copy-front pointer-events-none absolute inset-0">
        <DescriptionCard text={cardText} />
      </div>
    );
  }

  if (!watermark && !cardText) return null;

  return (
    <div className="retail-ecommerce-hero-copy pointer-events-none absolute inset-0">
      {watermark ? <h1 className="sr-only">{watermark}</h1> : null}
      {watermark ? <WatermarkMarquee text={watermark} /> : null}
      <DescriptionCard text={cardText} />
    </div>
  );
}
