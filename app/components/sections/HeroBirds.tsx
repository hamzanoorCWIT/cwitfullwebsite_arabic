"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import "./HeroBirds.css";

type BirdSpec = {
  x: number;
  y: number;
  size: number;
  flap: number;
};

type FlockSpec = {
  id: string;
  top: string;
  duration: number;
  delay: number;
  birds: BirdSpec[];
};

const FLOCKS: FlockSpec[] = [
  {
    id: "a",
    top: "18%",
    duration: 26,
    delay: 3,
    birds: [
      { x: 0, y: 8, size: 22, flap: 0 },
      { x: 26, y: -6, size: 18, flap: 0.12 },
      { x: 48, y: 14, size: 16, flap: 0.28 },
      { x: 70, y: -2, size: 20, flap: 0.08 },
      { x: 92, y: 18, size: 15, flap: 0.34 },
      { x: 112, y: 4, size: 17, flap: 0.18 },
      { x: 136, y: -10, size: 19, flap: 0.22 },
      { x: 158, y: 12, size: 14, flap: 0.4 },
      { x: 178, y: 0, size: 16, flap: 0.06 },
    ],
  },
  {
    id: "b",
    top: "26%",
    duration: 34,
    delay: 14,
    birds: [
      { x: 10, y: 0, size: 15, flap: 0.2 },
      { x: 32, y: 10, size: 13, flap: 0.05 },
      { x: 54, y: -8, size: 17, flap: 0.3 },
      { x: 78, y: 6, size: 14, flap: 0.16 },
      { x: 100, y: -4, size: 12, flap: 0.42 },
      { x: 122, y: 14, size: 16, flap: 0.1 },
      { x: 148, y: 2, size: 13, flap: 0.26 },
    ],
  },
  {
    id: "c",
    top: "14%",
    duration: 40,
    delay: 22,
    birds: [
      { x: 0, y: 4, size: 12, flap: 0.18 },
      { x: 22, y: -6, size: 11, flap: 0.32 },
      { x: 44, y: 8, size: 13, flap: 0.04 },
      { x: 68, y: 0, size: 10, flap: 0.24 },
      { x: 90, y: -8, size: 12, flap: 0.14 },
    ],
  },
];

function BirdMark({ size, flap }: { size: number; flap: number }) {
  return (
    <svg
      className="hero-bird-mark"
      viewBox="0 0 24 10"
      width={size}
      height={size * (10 / 24)}
      fill="none"
      aria-hidden="true"
      style={{ animationDelay: `${flap}s` }}
    >
      <path
        d="M1.2 7.6C5.2 2.4 8.4.8 12 5.2C15.6.8 18.8 2.4 22.8 7.6"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HeroBirds() {
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
      if (tweens.length && Math.abs(viewport - lastWidth) < 1) return;
      lastWidth = viewport;

      tweens.forEach((tween) => tween.kill());
      tweens.length = 0;

      root.querySelectorAll<HTMLElement>("[data-bird-flock]").forEach((el) => {
        const width = el.getBoundingClientRect().width;
        const duration = Number(el.dataset.duration);
        const delay = Number(el.dataset.delay);
        const fromX = viewport + 40;
        const toX = -width - 40;

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
    };

    sync();
    const observer = new ResizeObserver(sync);
    observer.observe(root);

    return () => {
      tweens.forEach((tween) => tween.kill());
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={rootRef} className="hero-birds" aria-hidden="true">
      {FLOCKS.map((flock) => {
        const flockWidth = Math.max(...flock.birds.map((bird) => bird.x)) + 32;
        return (
          <div
            key={flock.id}
            className="hero-bird-flock"
            data-bird-flock
            data-duration={flock.duration}
            data-delay={flock.delay}
            style={{ top: flock.top, width: flockWidth }}
          >
            {flock.birds.map((bird, index) => (
              <span
                key={`${flock.id}-${index}`}
                className="hero-bird"
                style={{
                  left: bird.x,
                  top: bird.y,
                  animationDelay: `${bird.flap}s`,
                }}
              >
                <BirdMark size={bird.size} flap={bird.flap} />
              </span>
            ))}
          </div>
        );
      })}
    </div>
  );
}
