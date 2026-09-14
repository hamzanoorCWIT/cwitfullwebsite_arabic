"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import "./SeoAppBannerHeadline.css";

const FRAME_W = 1920;
const FRAME_H = 945;
const TITLE_SIZE_PX = 221;
const TITLE_LINE_PX = 231;
const TITLE_GAP_PX = 160;
const MARQUEE_SPEED_PX_PER_SEC = 72;
const TAG_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

function frameSize(px: number): string {
  const byWidth = ((px / FRAME_W) * 100).toFixed(4);
  const byHeight = ((px / FRAME_H) * 100).toFixed(4);
  return `min(${byWidth}vw, ${byHeight}vh)`;
}

export type SeoAppMarqueeFill = {
  backgroundSrc?: string;
  backgroundCss?: string;
};

/** Same fill as /mobile-app: letters take colour from the banner behind them. */
function marqueeFillStyle(fill?: SeoAppMarqueeFill): CSSProperties {
  const image = fill?.backgroundSrc?.trim();
  const css = fill?.backgroundCss?.trim();

  const clip: CSSProperties = {
    color: "transparent",
    WebkitTextFillColor: "transparent",
    backgroundSize: "100vw 100vh",
    backgroundPosition: "center center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
    WebkitBackgroundClip: "text",
    backgroundClip: "text",
  };

  if (image) {
    return { ...clip, backgroundImage: `url("${image}")` };
  }
  if (css) {
    return {
      ...clip,
      background: css,
      backgroundSize: "100vw 100vh",
      backgroundAttachment: "fixed",
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
    };
  }
  return {
    color: "rgba(255, 255, 255, 0.88)",
    WebkitTextFillColor: "rgba(255, 255, 255, 0.88)",
  };
}

function MarqueeItem({
  text,
  fill,
}: {
  text: string;
  fill?: SeoAppMarqueeFill;
}) {
  return (
    <span
      className="seo-app-hero-title flex-none whitespace-nowrap font-graphik font-[700] uppercase leading-none tracking-[-0.02em]"
      style={{
        fontFamily: "var(--font-graphik)",
        fontSize: `var(--seo-app-marquee-size, ${frameSize(TITLE_SIZE_PX)})`,
        lineHeight: `var(--seo-app-marquee-line, ${frameSize(TITLE_LINE_PX)})`,
        paddingRight: `var(--seo-app-marquee-gap, ${frameSize(TITLE_GAP_PX)})`,
        ...marqueeFillStyle(fill),
      }}
    >
      {text.toUpperCase()}
    </span>
  );
}

function MarqueeGroup({
  text,
  count,
  fill,
}: {
  text: string;
  count: number;
  fill?: SeoAppMarqueeFill;
}) {
  return (
    <div className="flex flex-none items-center">
      {Array.from({ length: count }, (_, index) => (
        <MarqueeItem key={index} text={text} fill={fill} />
      ))}
    </div>
  );
}

/**
 * /seo-app banner title — same looping Graphik marquee and fill as /mobile-app.
 */
export default function SeoAppBannerHeadline({
  text,
  fill,
  duration = 1.2,
}: {
  text: string;
  fill?: SeoAppMarqueeFill;
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
    if (!root || !track || !text) return;

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

  if (!text.trim()) return null;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-x-0 overflow-hidden"
      aria-hidden="true"
      style={{
        top: shown
          ? "var(--seo-app-marquee-top)"
          : "calc(var(--seo-app-marquee-top) - 100vh)",
        height: `var(--seo-app-marquee-height, ${frameSize(TITLE_LINE_PX)})`,
        transition: `top ${duration}s ${TAG_EASE}`,
      }}
    >
      <div
        ref={trackRef}
        className="relative flex h-full w-max items-center"
        style={{ left: 0 }}
      >
        <MarqueeGroup text={text} count={repeatCount} fill={fill} />
        <MarqueeGroup text={text} count={repeatCount} fill={fill} />
      </div>
    </div>
  );
}
