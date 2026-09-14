"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef } from "react";
import { useLocalePreference } from "@/app/components/providers/DirectionPreference";
import styles from "./AiFigmaPage.module.css";

const SPEED_PX_PER_SEC = 45;

/**
 * True cylinder. `progress` is the card's horizontal offset normalised so ±1 is
 * the clip edge; it maps to an angle on the cylinder, and every other value is
 * derived from that single angle so the arc stays geometrically consistent.
 *
 *   angle      = progress * ARC_RANGE
 *   translateZ = radius * (cos(angle) - 1)      // recedes
 *   translateY = -radius * (1 - cos(angle)) * ARC_Y_RATIO   // rises
 *   rotateY    = angle in degrees               // outer edge turns away
 */
/** Cylinder radius as a fraction of the clip width — 900px at the 1330px desktop clip. */
const RADIUS_RATIO = 0.677;
/** Radians of arc swept at progress = ±1. */
const ARC_RANGE = 0.75;
/** How much of the cylinder's depth is expressed as vertical bowl lift. */
const ARC_Y_RATIO = 0.25;
/** Ceiling so a card can never reach edge-on and flip past 90°. */
const ROTATE_MAX = 85;
/** Mild extra scale falloff on top of the perspective foreshortening. */
const SCALE_FALLOFF = 0.03;
/** Cards keep rendering out to this multiple of the half-width before being dropped. */
const CULL_RATIO = 2.3;
/** Fraction of the cull distance at which the fade-out begins. */
const FADE_START_RATIO = 0.7;

export default function AiCurvedGallery({ images }: { images: string[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocalePreference();
  const isRtl = locale === "ar";

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track || images.length === 0) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-curve-card]")
    );
    if (cards.length === 0) return;

    // Layout is read here only — never inside the frame loop — so the rAF pass
    // is write-only and cannot thrash layout.
    const metrics = {
      width: 0,
      half: 1,
      radius: 1,
      cull: 1,
      fadeStart: 1,
      pitch: 1,
      groupWidth: 1,
      cardWidth: 0,
    };

    const measure = () => {
      const group = track.firstElementChild as HTMLElement | null;
      const slot = group?.firstElementChild as HTMLElement | null;

      metrics.width = viewport.clientWidth;
      metrics.half = Math.max(metrics.width / 2, 1);
      metrics.radius = Math.max(metrics.width * RADIUS_RATIO, 1);
      metrics.cull = metrics.half * CULL_RATIO;
      metrics.fadeStart = metrics.cull * FADE_START_RATIO;
      metrics.groupWidth = group?.offsetWidth ?? 0;
      metrics.cardWidth = slot?.offsetWidth ?? 0;
      // Each group is `images.length` slots wide, including its trailing gap,
      // so the pitch divides out exactly and the loop seam is invisible.
      metrics.pitch = metrics.groupWidth / images.length || 1;
    };

    let offset = 0;
    let last = performance.now();
    let raf = 0;
    let visible = true;
    // Arabic: same cylinder motion, opposite horizontal run.
    const scrollDir = isRtl ? -1 : 1;

    // Last value written per card, so the loop only touches the DOM when a
    // value actually changed. Style writes are the expensive part, not the math.
    const lastTransform = new Array<string>(cards.length).fill("");
    const lastOpacity = new Array<number>(cards.length).fill(-1);
    const lastDepth = new Array<number>(cards.length).fill(-1);

    const render = () => {
      const { width, half, radius, cull, fadeStart, pitch, cardWidth } = metrics;
      const originX = offset + width / 2 - cardWidth / 2;

      for (let i = 0; i < cards.length; i += 1) {
        const card = cards[i];
        // Flat (untransformed) distance from the viewport centre, derived from
        // the index instead of getBoundingClientRect.
        const dx = i * pitch - originX;
        const distance = Math.abs(dx);

        if (distance > cull) {
          if (lastOpacity[i] !== 0) {
            card.style.opacity = "0";
            lastOpacity[i] = 0;
          }
          continue;
        }

        // Normalised position: 0 at centre, ±1 at the clip edge.
        const progress = dx / half;
        // Single angle on the cylinder drives depth, lift and rotation together.
        const angle = progress * ARC_RANGE;
        const drop = 1 - Math.cos(angle);

        // Cards swing back along the cylinder wall...
        const translateZ = -radius * drop;
        // ...and ride up the bowl, centre lowest, both sides mirrored.
        const translateY = -radius * drop * ARC_Y_RATIO;
        // Positive on the right, negative on the left — outer edges rotate away
        // from the viewer, so the ribbon wraps convex around the cylinder.
        const rotateY = Math.max(
          -ROTATE_MAX,
          Math.min(ROTATE_MAX, (angle * 180) / Math.PI)
        );
        const scale = Math.max(0.6, 1 - Math.abs(progress) * SCALE_FALLOFF);
        const fade =
          distance <= fadeStart
            ? 1
            : Math.max(0, 1 - (distance - fadeStart) / (cull - fadeStart));

        const transform = `translate3d(0, ${translateY.toFixed(
          2
        )}px, ${translateZ.toFixed(2)}px) rotateY(${rotateY.toFixed(
          2
        )}deg) scale(${scale.toFixed(4)})`;

        if (lastTransform[i] !== transform) {
          card.style.transform = transform;
          lastTransform[i] = transform;
        }

        const opacity = Math.round(fade * 100) / 100;
        if (lastOpacity[i] !== opacity) {
          card.style.opacity = String(opacity);
          lastOpacity[i] = opacity;
        }

        // z-index is NOT compositor-only — writing it re-sorts the stacking
        // context on the main thread. Quantise it so it changes a handful of
        // times per card per loop instead of every frame.
        const depth = Math.round(Math.max(0, 1 - distance / half) * 20);
        if (lastDepth[i] !== depth) {
          card.style.zIndex = String(depth);
          lastDepth[i] = depth;
        }
      }
    };

    const tick = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      if (!visible) {
        raf = requestAnimationFrame(tick);
        return;
      }

      if (!reduced.matches && metrics.groupWidth > 0) {
        offset += SPEED_PX_PER_SEC * dt * scrollDir;
        if (offset >= metrics.groupWidth) offset -= metrics.groupWidth;
        if (offset < 0) offset += metrics.groupWidth;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }

      render();
      raf = requestAnimationFrame(tick);
    };

    measure();
    render();
    raf = requestAnimationFrame(tick);

    const onResize = () => {
      measure();
      render();
    };

    const observer = new ResizeObserver(onResize);
    observer.observe(viewport);
    const firstGroup = track.firstElementChild;
    if (firstGroup instanceof Element) observer.observe(firstGroup);

    // Idle while scrolled away, so the gallery never competes for frames with
    // the rest of the page. `last` is reset on re-entry to avoid a time jump.
    const inView = new IntersectionObserver(
      (entries) => {
        const next = entries[0]?.isIntersecting ?? true;
        if (next && !visible) last = performance.now();
        visible = next;
      },
      { rootMargin: "200px 0px" }
    );
    inView.observe(viewport);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      inView.disconnect();
    };
  }, [images, isRtl]);

  const groups = [images, images, images];

  return (
    <div
      className={styles.curveClip}
      ref={viewportRef}
      aria-hidden="true"
      dir="ltr"
    >
      <div className={styles.curveGallery}>
        <div className={styles.curveTrack} ref={trackRef}>
          {groups.map((group, groupIndex) => (
            <div className={styles.curveGroup} key={groupIndex}>
              {group.map((src, index) => (
                <div
                  className={styles.curveSlot}
                  data-curve-slot
                  key={`${src}-${groupIndex}-${index}`}
                >
                  <div className={styles.curveCard} data-curve-card>
                    <img src={src} alt="" decoding="async" />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
