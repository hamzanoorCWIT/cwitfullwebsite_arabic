"use client";

import { ReactNode, useEffect, useState } from "react";

interface FadeUpRevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds before the entrance starts. */
  delay?: number;
  duration?: number;
  /** Distance travelled, in px. */
  y?: number;
}

/** Matches GSAP's power3.out, so this stays in step with the other reveals. */
const EASE = "cubic-bezier(0.215, 0.61, 0.355, 1)";

/**
 * Fades content up into place on entry.
 *
 * Unlike the scroll-driven reveals, the start state is inline, so the very first
 * paint is already faded out — server markup never shows the resting position
 * and then jumps to the start once JavaScript catches up.
 */
export default function FadeUpReveal({
  children,
  className = "",
  delay = 0,
  duration = 1,
  y = 40,
}: FadeUpRevealProps) {
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
        transform: shown ? "translateY(0)" : `translateY(${y}px)`,
        transition: `transform ${duration}s ${EASE} ${delay}s, opacity ${duration}s ${EASE} ${delay}s`,
        willChange: "transform, opacity",
      }}
    >
      {children}
    </div>
  );
}
