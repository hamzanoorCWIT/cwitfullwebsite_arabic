"use client";

import { ReactNode, useEffect, useState } from "react";

interface SlideUpRevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds before the slide starts. */
  delay?: number;
  duration?: number;
}

/** Matches GSAP's power3.out, so this stays in step with the other reveals. */
const EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

/**
 * Slides its content up into place from below, starting fully out of frame.
 * Meant for a layer inside an `overflow-hidden` section, which crops the start
 * of the travel so the element appears to rise out of the bottom edge.
 *
 * Driven by a CSS transition rather than GSAP: the start state is inline, so the
 * very first paint is already off-screen and the resting position is never
 * flashed. A percentage transform also survives here — GSAP reads transforms
 * back off the computed matrix in pixels, which loses the percentage.
 */
export default function SlideUpReveal({
  children,
  className = "",
  delay = 0,
  duration = 1.2,
}: SlideUpRevealProps) {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    // Next frame, so the browser paints the start state before transitioning.
    const frame = requestAnimationFrame(() => setShown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "translateY(0)" : "translateY(115%)",
        transition: `transform ${duration}s ${EASE} ${delay}s, opacity ${duration}s ${EASE} ${delay}s`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
