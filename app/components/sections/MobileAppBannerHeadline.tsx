"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import gsap from "gsap";
import { isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import "./MobileAppBannerHeadline.css";

/** Figma sizes against the 1920 × 945 composition frame. */
const FRAME_W = 1920;
const FRAME_H = 945;
const CHIP_PAD_Y_PX = 18;
const CHIP_PAD_X_PX = 16;
const CHIP_GAP_PX = 12;
const CHIP_RADIUS_PX = 14;
const CHIP_WIDTH_PX = 266;
const CHIP_HEIGHT_PX = 89;
const ICON_PX = 52;
const ICON_MARK_PX = 24;
const ICON_RADIUS_PX = 10;
const ICON_BG = "#A8D85B";
const CALLOUT_FONT_PX = 18;

function frameSize(px: number): string {
  const byWidth = ((px / FRAME_W) * 100).toFixed(4);
  const byHeight = ((px / FRAME_H) * 100).toFixed(4);
  return `min(${byWidth}vw, ${byHeight}vh)`;
}

const TITLE_SIZE_PX = 221;
const TITLE_LINE_PX = 231;
const TITLE_TOP_PX = 164;
const TITLE_GAP_PX = 160;
const MARQUEE_SPEED_PX_PER_SEC = 72;
/** Matches GSAP power3.out — same ease as the phone slide-up. */
const TAG_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";
const LEFT_TAG_TOP_PX = 722;
const LEFT_TAG_LEFT_PX = 440;
const RIGHT_TAG_TOP_PX = 534;
const RIGHT_TAG_RIGHT_PX = 415;

export type BannerMarqueeFill = {
  backgroundSrc?: string;
  backgroundCss?: string;
};

function marqueeFillStyle(fill?: BannerMarqueeFill): CSSProperties {
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
  fill?: BannerMarqueeFill;
}) {
  return (
    <span
      className="flex-none whitespace-nowrap font-graphik font-[700] uppercase leading-none tracking-[-0.02em]"
      style={{
        fontFamily: "var(--font-graphik)",
        fontSize: `var(--mobile-app-marquee-size, ${frameSize(TITLE_SIZE_PX)})`,
        lineHeight: `var(--mobile-app-marquee-line, ${frameSize(TITLE_LINE_PX)})`,
        paddingRight: `var(--mobile-app-marquee-gap, ${frameSize(TITLE_GAP_PX)})`,
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
  fill?: BannerMarqueeFill;
}) {
  return (
    <div className="flex flex-none items-center">
      {Array.from({ length: count }, (_, index) => (
        <MarqueeItem key={index} text={text} fill={fill} />
      ))}
    </div>
  );
}

function SparkleIcon() {
  return (
    <span
      className="relative flex flex-none items-center justify-center"
      style={{
        width: `var(--mobile-app-tag-icon, ${frameSize(ICON_PX)})`,
        height: `var(--mobile-app-tag-icon, ${frameSize(ICON_PX)})`,
        borderRadius: `var(--mobile-app-tag-icon-radius, ${frameSize(ICON_RADIUS_PX)})`,
        background: ICON_BG,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{
          width: `var(--mobile-app-tag-icon-mark, ${frameSize(ICON_MARK_PX)})`,
          height: `var(--mobile-app-tag-icon-mark, ${frameSize(ICON_MARK_PX)})`,
        }}
      >
        <path
          fill="#ffffff"
          d="M12 1.2c.28 4.15 2.05 7.05 6.8 8.8-4.75 1.75-6.52 4.65-6.8 8.8-.28-4.15-2.05-7.05-6.8-8.8 4.75-1.75 6.52-4.65 6.8-8.8Z"
        />
      </svg>
    </span>
  );
}

function CalloutChip({
  text,
  side,
  duration = 1.2,
}: {
  text: string;
  side: "left" | "right";
  duration?: number;
}) {
  const isLeft = side === "left";
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={`absolute ${isLeft ? "mobile-app-hero-tag-left" : "mobile-app-hero-tag-right"}`}
      style={{
        top: isLeft
          ? `var(--mobile-app-tag-left-top, ${frameSize(LEFT_TAG_TOP_PX)})`
          : `var(--mobile-app-tag-right-top, ${frameSize(RIGHT_TAG_TOP_PX)})`,
        bottom: isLeft
          ? "var(--mobile-app-tag-left-bottom, auto)"
          : "var(--mobile-app-tag-right-bottom, auto)",
        left: isLeft
          ? `var(--mobile-app-tag-left-x, ${frameSize(LEFT_TAG_LEFT_PX)})`
          : "var(--mobile-app-tag-right-left, auto)",
        right: isLeft
          ? undefined
          : `var(--mobile-app-tag-right-x, ${frameSize(RIGHT_TAG_RIGHT_PX)})`,
        zIndex: 3,
        opacity: shown ? 1 : 0,
        transform: shown
          ? "translateX(var(--mobile-app-tag-x, 0px)) translateY(var(--mobile-app-tag-y, 0px))"
          : isLeft
            ? "translateX(calc(var(--mobile-app-tag-x, 0px) - 100vw)) translateY(var(--mobile-app-tag-y, 0px))"
            : "translateX(calc(var(--mobile-app-tag-x, 0px) + 100vw)) translateY(var(--mobile-app-tag-y, 0px))",
        transition: `transform ${duration}s ${TAG_EASE} 0s, opacity ${duration}s ${TAG_EASE} 0s`,
        willChange: "transform, opacity",
      }}
    >
      <div
        className="mobile-app-hero-tag-chip flex items-center"
        style={{
          width: `var(--mobile-app-tag-w, ${frameSize(CHIP_WIDTH_PX)})`,
          height: `var(--mobile-app-tag-h, ${frameSize(CHIP_HEIGHT_PX)})`,
          boxSizing: "border-box",
          gap: `var(--mobile-app-tag-gap, ${frameSize(CHIP_GAP_PX)})`,
          padding: `var(--mobile-app-tag-pad-y, ${frameSize(CHIP_PAD_Y_PX)}) var(--mobile-app-tag-pad-x, ${frameSize(CHIP_PAD_X_PX)})`,
          borderRadius: `var(--mobile-app-tag-radius, ${frameSize(CHIP_RADIUS_PX)})`,
          background: "rgba(129, 112, 112, 0.4)",
          border: "1px solid rgba(255, 255, 255, 0.14)",
          borderTopColor: "rgba(255, 255, 255, 0.22)",
          borderLeftColor: "rgba(255, 255, 255, 0.18)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          boxShadow: "0 10px 28px rgba(0, 0, 0, 0.35)",
        }}
      >
        <SparkleIcon />
        <span
          className="mobile-app-hero-tag-text min-w-0 flex-1 font-graphik font-[400] tracking-[-0.01em] text-white"
          style={{
            fontFamily: "var(--font-graphik)",
            lineHeight: 1.3,
          }}
        >
          {text}
        </span>
      </div>
    </div>
  );
}

function resolveParts(
  lines: string[],
  tags?: { left?: string; right?: string },
) {
  const cleaned = lines.map((line) => line.trim()).filter(Boolean);
  const tagLeft = tags?.left?.trim() || "";
  const tagRight = tags?.right?.trim() || "";

  let watermark = "";
  let lineLeft = "";
  let lineRight = "";

  if (cleaned.length >= 3) {
    lineLeft = cleaned[0];
    watermark = cleaned[1];
    lineRight = cleaned[2];
  } else if (cleaned.length === 2) {
    watermark = cleaned[0];
    lineLeft = cleaned[1];
  } else if (cleaned.length === 1) {
    watermark = cleaned[0];
  }

  return {
    watermark,
    left: tagLeft || lineLeft,
    right: tagRight || lineRight,
  };
}

/**
 * /mobile-app headline — marquee behind the phone, callout chips over it.
 * Chip copy comes from CMS; chip chrome (icon, glass, leader line) is coded.
 */
export default function MobileAppBannerHeadline({
  lines,
  duration = 1.2,
  layer = "flank",
  fill,
  tags,
}: {
  lines: string[];
  duration?: number;
  layer?: "watermark" | "flank";
  fill?: BannerMarqueeFill;
  tags?: { left?: string; right?: string };
}) {
  const { left, right, watermark } = resolveParts(lines, tags);

  if (layer === "watermark") {
    return (
      <MobileAppBannerWatermark
        watermark={watermark}
        fill={fill}
        duration={duration}
      />
    );
  }

  return (
    <MobileAppBannerFlank
      left={left}
      right={right}
      watermark={watermark}
      duration={duration}
    />
  );
}

function MobileAppBannerWatermark({
  watermark,
  fill,
  duration = 1.2,
}: {
  watermark: string;
  fill?: BannerMarqueeFill;
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
  }, [watermark, repeatCount]);

  if (!watermark) return null;

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-x-0 overflow-hidden"
      aria-hidden="true"
      style={{
        top: shown
          ? `var(--mobile-app-marquee-top, ${frameSize(TITLE_TOP_PX)})`
          : `calc(var(--mobile-app-marquee-top, ${frameSize(TITLE_TOP_PX)}) - 100vh)`,
        height: `var(--mobile-app-marquee-height, ${frameSize(TITLE_LINE_PX)})`,
        transition: `top ${duration}s ${TAG_EASE}`,
      }}
    >
      <div
        ref={trackRef}
        className="relative flex h-full w-max items-center"
        style={{ left: 0 }}
      >
        <MarqueeGroup text={watermark} count={repeatCount} fill={fill} />
        <MarqueeGroup text={watermark} count={repeatCount} fill={fill} />
      </div>
    </div>
  );
}

function MobileAppBannerFlank({
  left,
  right,
  watermark,
  duration,
}: {
  left: string;
  right: string;
  watermark: string;
  duration: number;
}) {
  return (
    <h1 className="absolute inset-0">
      <span className="sr-only">
        {[left, watermark, right].filter(Boolean).join(" ")}
      </span>
      {left ? <CalloutChip text={left} side="left" duration={duration} /> : null}
      {right ? (
        <CalloutChip text={right} side="right" duration={duration} />
      ) : null}
    </h1>
  );
}
