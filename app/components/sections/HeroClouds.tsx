"use client";

import { useLayoutEffect, useRef, type CSSProperties } from "react";
import gsap from "gsap";
import "./HeroClouds.css";

const FRAME_W = 1920;
const FRAME_H = 1100;

function frameSize(px: number): string {
  const byWidth = ((px / FRAME_W) * 100).toFixed(4);
  const byHeight = ((px / FRAME_H) * 100).toFixed(4);
  return `min(${byWidth}vw, ${byHeight}vh)`;
}

type HeroCloud = {
  src: string;
  widthPx: number;
  heightPx: number;
  top?: string;
  bottom?: string;
  overflowBottomPx?: number;
  overlapPx?: number;
  centerY?: boolean;
  durationSec: number;
  opacity: number;
  objectPosition: string;
  objectFit?: "contain" | "cover" | "fill";
  mask: string;
  delaysSec: [number, number];
  band?: boolean;
};

const CLOUD_ASSETS: HeroCloud[] = [
  {
    src: "/figma-assets/Cloud%201.png",
    widthPx: 760,
    heightPx: 450,
    top: "2%",
    durationSec: 56,
    delaysSec: [10, 38],
    opacity: 0.9,
    objectPosition: "left center",
    mask: "linear-gradient(to right, #000 0%, #000 82%, transparent 100%)",
  },
  {
    src: "/figma-assets/Cloud%202.png",
    widthPx: 940,
    heightPx: 340,
    top: "50%",
    centerY: true,
    durationSec: 72,
    delaysSec: [18, 54],
    opacity: 0.8,
    objectPosition: "left center",
    mask: "linear-gradient(to right, transparent 0%, #000 16%, #000 100%)",
  },
  {
    src: "/figma-assets/Cloud%203.png",
    widthPx: 2280,
    heightPx: 520,
    overflowBottomPx: 64,
    overlapPx: 920,
    durationSec: 80,
    delaysSec: [0, 0],
    opacity: 0.92,
    objectPosition: "left bottom",
    objectFit: "fill",
    mask: "linear-gradient(to right, transparent 0%, #000 14%, #000 58%, transparent 100%)",
    band: true,
  },
];

function cloudLayerStyle(cloud: HeroCloud): CSSProperties {
  return {
    top: cloud.top,
    transform: cloud.centerY ? "translateY(-50%)" : undefined,
    bottom: cloud.overflowBottomPx
      ? `calc(-1 * ${frameSize(cloud.overflowBottomPx)})`
      : cloud.bottom,
    height: frameSize(cloud.heightPx),
    opacity: cloud.opacity,
    ...(cloud.mask !== "none" ? { "--cloud-mask": cloud.mask } : {}),
    "--cloud-object-position": cloud.objectPosition,
    "--cloud-object-fit": cloud.objectFit ?? "contain",
  } as CSSProperties;
}

export default function HeroClouds({
  layers = "all",
}: {
  layers?: "all" | "sky" | "ground";
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const tweens: gsap.core.Tween[] = [];
    let lastWidth = 0;

    const sync = () => {
      const viewport = root.getBoundingClientRect().width;
      if (viewport < 1) return;

      const drifting = Array.from(
        root.querySelectorAll<HTMLElement>("[data-cloud-drift]")
      );
      const tracks = Array.from(
        root.querySelectorAll<HTMLElement>("[data-cloud-track]")
      );
      const sized = drifting.every((el) => el.getBoundingClientRect().width > 1);
      if (!sized) {
        requestAnimationFrame(sync);
        return;
      }

      if (tweens.length && Math.abs(viewport - lastWidth) < 1) return;
      lastWidth = viewport;

      tweens.forEach((tween) => tween.kill());
      tweens.length = 0;

      drifting.forEach((el) => {
        const width = el.getBoundingClientRect().width;
        const duration = Number(el.dataset.duration);
        const delay = Number(el.dataset.delay);
        const fromX = viewport + 48;
        const toX = -width - 48;

        const tween = gsap.fromTo(
          el,
          { x: fromX },
          {
            x: toX,
            duration,
            ease: "none",
            repeat: -1,
            immediateRender: true,
          }
        );
        tween.progress((((delay % duration) + duration) % duration) / duration);
        tweens.push(tween);
      });

      tracks.forEach((track) => {
        const first = track.children[0] as HTMLElement | undefined;
        const second = track.children[1] as HTMLElement | undefined;
        if (!first || !second) return;

        const setWidth =
          second.getBoundingClientRect().left - first.getBoundingClientRect().left;
        if (setWidth < 1) return;

        const duration = Number(track.dataset.duration);
        tweens.push(
          gsap.fromTo(
            track,
            { x: 0 },
            {
              x: -setWidth,
              duration,
              ease: "none",
              repeat: -1,
              immediateRender: true,
            }
          )
        );
      });
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(root);

    return () => {
      tweens.forEach((tween) => tween.kill());
      observer.disconnect();
    };
  }, [layers]);

  return (
    <div ref={rootRef} className="hero-clouds" aria-hidden="true">
      {CLOUD_ASSETS.filter((cloud) => {
        if (layers === "sky") return !cloud.band;
        if (layers === "ground") return Boolean(cloud.band);
        return true;
      }).map((cloud) =>
        cloud.band ? (
          <div
            key={cloud.src}
            className="hero-cloud-layer hero-cloud-layer-band"
            style={cloudLayerStyle(cloud)}
          >
            <div
              className="hero-cloud-track"
              data-cloud-track
              data-duration={cloud.durationSec}
            >
              {[0, 1, 2].map((copy) => (
                <span
                  key={copy}
                  className="hero-cloud-item hero-cloud-band"
                  style={{
                    width: frameSize(cloud.widthPx),
                    marginLeft:
                      copy === 0
                        ? undefined
                        : `calc(-1 * ${frameSize(cloud.overlapPx ?? 140)})`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cloud.src} alt="" />
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div
            key={cloud.src}
            className="hero-cloud-layer"
            style={cloudLayerStyle(cloud)}
          >
            {cloud.delaysSec.map((delaySec, index) => (
              <div
                key={`${cloud.src}-${index}`}
                className="hero-cloud-drift"
                data-cloud-drift
                data-duration={cloud.durationSec}
                data-delay={delaySec}
                style={{ width: frameSize(cloud.widthPx) }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cloud.src} alt="" />
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
