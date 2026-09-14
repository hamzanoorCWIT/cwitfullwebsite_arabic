"use client";

import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { HomeClientLogo } from "@/app/lib/home-normalize";
import styles from "./FigmaHomeOffers.module.css";

type Logo = HomeClientLogo;

function splitLogoRows(logos: Logo[]) {
  const rowSplitIndex = Math.ceil(logos.length / 2);
  return {
    topRowLogos: logos.slice(0, rowSplitIndex),
    bottomRowLogos: logos.slice(rowSplitIndex),
  };
}

const MARQUEE_SPEED_PX_PER_SEC = 90;

function repeatLogos(logos: readonly Logo[], times: number) {
  return Array.from({ length: times }, () => logos).flat();
}

function ClientLogoSet({
  logos,
  suffix,
  hidden = false,
}: {
  logos: Logo[];
  suffix: string;
  hidden?: boolean;
}) {
  return (
    <div className={styles.clientLogosSet} aria-hidden={hidden || undefined}>
      {logos.map((logo, index) => (
        <div key={`${logo.alt}-${suffix}-${index}`} className={styles.clientLogoItem}>
          <img
            className={styles.clientLogoImage}
            src={logo.src}
            alt={hidden ? "" : logo.alt}
            draggable={false}
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
        </div>
      ))}
    </div>
  );
}

function ClientLogoRow({ logos }: { logos: readonly Logo[] }) {
  const marqueeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [repeatCount, setRepeatCount] = useState(3);
  const [shiftPx, setShiftPx] = useState(0);

  const expandedLogos = useMemo(() => repeatLogos(logos, repeatCount), [logos, repeatCount]);

  useLayoutEffect(() => {
    const marquee = marqueeRef.current;
    const track = trackRef.current;
    if (!marquee || !track) return;

    const sync = () => {
      const firstSet = track.children[0] as HTMLElement | undefined;
      if (!firstSet) return;

      const viewportWidth = marquee.getBoundingClientRect().width;
      const setWidth = firstSet.getBoundingClientRect().width;

      if (setWidth < viewportWidth + 120 && repeatCount < 12) {
        setRepeatCount((count) => count + 1);
        return;
      }

      setShiftPx(Math.round(setWidth));
    };

    sync();

    const observer = new ResizeObserver(sync);
    observer.observe(marquee);
    observer.observe(track);

    return () => observer.disconnect();
  }, [expandedLogos, repeatCount, logos]);

  if (!logos.length) return null;

  return (
    <div ref={marqueeRef} className={styles.clientLogosMarquee}>
      <div
        ref={trackRef}
        className={`${styles.clientLogosTrack}${shiftPx > 0 ? ` ${styles.clientLogosTrackReady}` : ""}`}
        style={
          {
            "--marquee-shift": `${shiftPx}px`,
            "--marquee-duration": `${shiftPx / MARQUEE_SPEED_PX_PER_SEC}s`,
          } as CSSProperties
        }
      >
        <ClientLogoSet logos={expandedLogos} suffix="a" />
        <ClientLogoSet logos={expandedLogos} suffix="b" hidden />
      </div>
    </div>
  );
}

type FigmaHomeClientLogosProps = {
  logos?: HomeClientLogo[];
};

export default function FigmaHomeClientLogos({ logos = [] }: FigmaHomeClientLogosProps) {
  if (!logos.length) return null;

  const { topRowLogos, bottomRowLogos } = splitLogoRows(logos);

  return (
    <div className={styles.clientLogos} aria-label="Client logos">
      <div className={styles.clientLogosRows}>
        <ClientLogoRow logos={topRowLogos} />
        <ClientLogoRow logos={bottomRowLogos} />
      </div>
    </div>
  );
}
