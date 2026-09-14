"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from "react";
import gsap from "gsap";
import { isRtlDirection, rtlAwareTranslateX } from "@/app/lib/rtl-layout";
import "./LogoAppBannerHeadline.css";

const FRAME_W = 1920;
const TAG_EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";
const MARQUEE_SPEED_PX_PER_SEC = 72;
const TITLE_SIZE_PX = 250;
const TITLE_LINE_PX = 265.286;
const TITLE_TOP_PX = 140;
const TITLE_GAP_PX = 160;
const IDEA_SIZE_PX = 316;
const IDEA_TOP_PX = 542;
const DESC_TOP_PX = 830;
const IDEA_EDGE_GAP_PX = 60;
const IDEA_MIN_FIT = 0.4;

function widthSize(px: number): string {
  return `calc(${((px / FRAME_W) * 100).toFixed(4)}vw * var(--logo-app-banner-scale, 1))`;
}

function cleanLines(lines: string[]): string[] {
  return lines.map((line) => line.trim()).filter(Boolean);
}

/**
 * Banner copy is CMS-owned and positional, like the sibling banner headlines:
 * line one rides the marquee, line two is the small lead word, and the rest is
 * the oversized word. Two lines split the second into the same two roles.
 */
function resolveLogoCopy(lines: string[]) {
  const cleaned = cleanLines(lines);

  const splitWords = (line: string) => {
    const words = line.split(/\s+/).filter(Boolean);
    return words.length > 1
      ? { leadWord: words[0], ideaWord: words.slice(1).join(" ") }
      : { leadWord: "", ideaWord: line };
  };

  if (cleaned.length >= 3) {
    return {
      watermark: cleaned[0],
      leadWord: cleaned[1],
      ideaWord: cleaned.slice(2).join(" "),
    };
  }

  if (cleaned.length === 2) {
    return { watermark: cleaned[0], ...splitWords(cleaned[1]) };
  }

  return {
    watermark: cleaned[0] || "",
    leadWord: "",
    ideaWord: "",
  };
}

function useShown() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return shown;
}

function MarqueeItem({ text }: { text: string }) {
  return (
    <span
      className="logo-app-hero-title flex-none whitespace-nowrap uppercase"
      style={{
        paddingRight: `var(--logo-app-title-gap, ${widthSize(TITLE_GAP_PX)})`,
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

  if (!text) return null;

  return (
    <div
      ref={rootRef}
      className="logo-app-banner-watermark pointer-events-none absolute inset-x-0 overflow-hidden"
      aria-hidden="true"
      style={{
        top: shown
          ? `var(--logo-app-title-top, ${widthSize(TITLE_TOP_PX)})`
          : `calc(var(--logo-app-title-top, ${widthSize(TITLE_TOP_PX)}) - 12vh)`,
        height: `var(--logo-app-title-line-height, ${widthSize(TITLE_LINE_PX)})`,
        zIndex: 1,
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

function PencilStrip({
  src,
  zIndex,
  ideaRef,
}: {
  src: string;
  zIndex?: number;
  ideaRef: RefObject<HTMLElement | null>;
}) {
  const slotRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const slot = slotRef.current;
    const idea = ideaRef.current;
    if (!slot || !src) return;

    const clearInline = () => {
      slot.style.left = "";
      slot.style.top = "";
      slot.style.width = "";
      slot.style.height = "";
    };

    const place = () => {
      const ideaEl = ideaRef.current;
      if (!ideaEl || !window.matchMedia("(max-width: 767px)").matches) {
        clearInline();
        return;
      }

      const fontSize = parseFloat(getComputedStyle(ideaEl).fontSize);
      if (!fontSize) return;

      const width = fontSize * (126 / 316);
      const height = fontSize * (930 / 316);
      const top = ideaEl.offsetTop - fontSize * (704 / 316);

      let prefix = fontSize * 0.56;
      const word = ideaEl.textContent || "";
      const canvas = document.createElement("canvas").getContext("2d");
      if (canvas && word.length >= 2) {
        const cs = getComputedStyle(ideaEl);
        canvas.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        prefix = canvas.measureText(word.slice(0, 1)).width;
      }

      const left = ideaEl.offsetLeft + prefix - width * (59 / 126);

      slot.style.left = `${left}px`;
      slot.style.top = `${top}px`;
      slot.style.width = `${width}px`;
      slot.style.height = `${height}px`;
    };

    place();
    void document.fonts.ready.then(place);

    const observer = new ResizeObserver(place);
    observer.observe(slot);
    if (idea) observer.observe(idea);
    window.addEventListener("resize", place);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      clearInline();
    };
  }, [src, ideaRef]);

  if (!src) return null;

  return (
    <div ref={slotRef} className="logo-app-pencil" style={{ zIndex }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" />
    </div>
  );
}

/**
 * The oversized word is CMS copy dropped into a fixed design size, so a word
 * longer than the design's would run past the frame. Shrink it just enough.
 */
function useWordFit(ref: RefObject<HTMLElement | null>, word: string): number {
  const [fit, setFit] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || !word) return;

    const measure = () => {
      const frame = el.offsetParent as HTMLElement | null;
      if (!frame) return;

      // Measure unscaled, then scale to what is left between the word's design
      // left edge and the frame's right edge.
      el.style.setProperty("--logo-app-idea-fit", "1");
      const natural = el.offsetWidth;
      const available =
        frame.offsetWidth -
        el.offsetLeft -
        (frame.offsetWidth * IDEA_EDGE_GAP_PX) / FRAME_W;
      if (natural < 1 || available < 1) return;

      setFit(Math.min(1, Math.max(IDEA_MIN_FIT, available / natural)));
    };

    measure();
    void document.fonts.ready.then(measure);

    const frame = el.offsetParent as HTMLElement | null;
    const observer = new ResizeObserver(measure);
    if (frame) observer.observe(frame);

    return () => observer.disconnect();
  }, [ref, word]);

  return fit;
}

function IdeaWord({
  word,
  wordRef,
}: {
  word: string;
  wordRef: RefObject<HTMLSpanElement | null>;
}) {
  const fit = useWordFit(wordRef, word.trim());

  if (!word.trim()) return null;

  return (
    <span
      ref={wordRef}
      aria-hidden="true"
      className="logo-app-idea absolute whitespace-nowrap font-inter font-[500] text-white"
      style={
        {
          left: "calc(50% - calc(26.3021vw * var(--logo-app-banner-scale, 1)))",
          top: `var(--logo-app-idea-top, ${widthSize(IDEA_TOP_PX)})`,
          fontSize: `calc(var(--logo-app-idea-size, ${widthSize(IDEA_SIZE_PX)}) * var(--logo-app-idea-fit, 1))`,
          lineHeight: `calc(var(--logo-app-idea-size, ${widthSize(IDEA_SIZE_PX)}) * var(--logo-app-idea-fit, 1))`,
          "--logo-app-idea-fit": fit,
          zIndex: 2,
        } as CSSProperties
      }
    >
      {word}
    </span>
  );
}

/**
 * /logo-app headline — marquee, lead word, oversized word, description, and
 * glass card.
 * Copy comes from CMS; placement and chrome are frontend-owned.
 */
export default function LogoAppBannerHeadline({
  lines,
  intro,
  description,
  foregroundSrc,
  layer = "art",
}: {
  lines: string[];
  intro?: string;
  description?: string;
  foregroundSrc?: string;
  layer?: "art" | "content";
}) {
  const { watermark, leadWord, ideaWord } = resolveLogoCopy(lines);
  const cardText = intro?.trim() || "";
  const italicText = description?.trim() || "";
  const pencilSrc = foregroundSrc?.trim() || "";
  const shown = useShown();
  const ideaRef = useRef<HTMLSpanElement>(null);

  if (layer === "art") {
    return (
      <div className="logo-app-banner-art absolute inset-0" aria-hidden="true">
        {[
          ["logo-banner-ring-1.svg", 681, 325, 623],
          ["logo-banner-ring-2.svg", 541, 185, 903],
          ["logo-banner-ring-3.svg", 414, 58, 1157],
          ["logo-banner-ring-4.svg", 299, -57, 1387],
        ].map(([src, left, top, size]) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={String(src)}
            src={`/figma-assets/${src}`}
            alt=""
            className="absolute block max-w-none"
            style={{
              left: widthSize(Number(left)),
              top: widthSize(Number(top)),
              width: widthSize(Number(size)),
              height: widthSize(Number(size)),
            }}
          />
        ))}
      </div>
    );
  }

  if (
    !watermark &&
    !leadWord &&
    !ideaWord &&
    !cardText &&
    !italicText &&
    !pencilSrc
  ) {
    return null;
  }

  return (
    <h1 className="absolute inset-0">
      <span className="sr-only">
        {[watermark, leadWord, ideaWord, cardText, italicText]
          .filter(Boolean)
          .join(" ")}
      </span>

      {watermark ? <WatermarkMarquee text={watermark} /> : null}

      <div
        className={`logo-app-banner-foreground${shown ? " is-shown" : ""}`}
      >
      <div className="logo-app-banner-copy">
      {leadWord ? (
        <span
          aria-hidden="true"
          className="logo-app-banner-lead absolute whitespace-nowrap font-inter font-[500] text-white"
          style={{
            left: "calc(50% - calc(25.2604vw * var(--logo-app-banner-scale, 1)))",
            top: `var(--logo-app-big-top, ${widthSize(474)})`,
            fontSize: widthSize(66),
            lineHeight: widthSize(96),
            zIndex: 2,
          }}
        >
          {leadWord}
        </span>
      ) : null}

      {ideaWord ? <IdeaWord word={ideaWord} wordRef={ideaRef} /> : null}

      {italicText || cardText ? (
      <div className="logo-app-banner-stack absolute inset-0 z-[4]">
        {italicText ? (
        <span
          aria-hidden="true"
          className="logo-app-banner-desc absolute block font-inter font-[500] italic text-white"
          style={{
            left: `var(--logo-app-desc-left, ${widthSize(475)})`,
            top: `var(--logo-app-desc-top, ${widthSize(DESC_TOP_PX)})`,
            bottom: "var(--logo-app-desc-bottom, auto)",
            width: `var(--logo-app-desc-w, ${widthSize(546)})`,
            fontSize: `var(--logo-app-desc-font, ${widthSize(24)})`,
            lineHeight: `var(--logo-app-desc-line, ${widthSize(30)})`,
            transform: "translateX(var(--logo-app-desc-x, 0px))",
            zIndex: 2,
          }}
        >
          {italicText}
        </span>
        ) : null}

        {cardText ? (
        <span
          aria-hidden="true"
          className="logo-app-banner-card absolute block overflow-hidden"
          style={{
            left: `var(--logo-app-card-left, ${widthSize(1414)})`,
            top: `var(--logo-app-card-top, ${widthSize(408)})`,
            bottom: "var(--logo-app-card-bottom, auto)",
            width: `var(--logo-app-card-w, ${widthSize(432)})`,
            paddingTop: `var(--logo-app-card-pad-top, ${widthSize(27)})`,
            paddingRight: `var(--logo-app-card-pad-x, ${widthSize(36)})`,
            paddingBottom: `var(--logo-app-card-pad-bottom, ${widthSize(48)})`,
            paddingLeft: `var(--logo-app-card-pad-x, ${widthSize(29)})`,
            borderRadius: `var(--logo-app-card-radius, ${widthSize(20)})`,
            transform: "translateX(var(--logo-app-card-x, 0px))",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/figma-assets/logo-banner-card-icon.svg"
            alt=""
            className="logo-app-banner-card-mark block max-w-none"
            style={{
              width: `var(--logo-app-card-icon, ${widthSize(14.083)})`,
              height: `var(--logo-app-card-icon, ${widthSize(14.083)})`,
            }}
          />
          <span
            className="logo-app-banner-card-text mt-[var(--logo-app-card-gap)] block font-inter font-[500] text-white"
            style={{
              width: `var(--logo-app-card-text-w, ${widthSize(367)})`,
              fontSize: `var(--logo-app-card-font, ${widthSize(20)})`,
              lineHeight: `var(--logo-app-card-line, ${widthSize(30)})`,
            }}
          >
            {cardText}
          </span>
        </span>
        ) : null}
      </div>
      ) : null}
      </div>
      {pencilSrc ? (
        <PencilStrip src={pencilSrc} zIndex={3} ideaRef={ideaRef} />
      ) : null}
      </div>
    </h1>
  );
}
