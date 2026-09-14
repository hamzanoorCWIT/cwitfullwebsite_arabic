"use client";

import { useEffect, useRef, ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { resetPageScrollOnNavigation } from "@/app/lib/scroll-lock";
import { registerLenisScrollReader, unregisterLenisScrollReader, notifyScrollUpdate } from "@/app/lib/lenis-scroll";
import { refreshScrollTriggersAfterNavigation } from "@/app/lib/scroll-navigation";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProviderProps {
  children: ReactNode;
}

export default function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  const lenisRef = useRef<Lenis | null>(null);
  const lenisRafRef = useRef<((time: number) => void) | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      touchMultiplier: 2,
    });

    lenisRef.current = lenis;
    registerLenisScrollReader(() => lenis.scroll);

    const handleScrollLock = (event: Event) => {
      const detail = (event as CustomEvent<{ locked: boolean; scrollY?: number }>).detail;
      if (!detail) return;

      if (detail.locked) {
        lenis.stop();
        return;
      }

      lenis.start();
      if (typeof detail.scrollY === "number") {
        lenis.scrollTo(detail.scrollY, { immediate: true });
      }
    };

    window.addEventListener("page-scroll-lock", handleScrollLock as EventListener);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value?: number) {
        if (arguments.length > 0 && value != null) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
      pinType: document.documentElement.style.transform ? "transform" : "fixed",
    });

    lenis.on("scroll", ScrollTrigger.update);
    lenis.on("scroll", notifyScrollUpdate);

    const lenisRaf = (time: number) => {
      lenis.raf(time * 1000);
    };
    lenisRafRef.current = lenisRaf;
    gsap.ticker.add(lenisRaf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      unregisterLenisScrollReader();
      window.removeEventListener("page-scroll-lock", handleScrollLock as EventListener);
      ScrollTrigger.scrollerProxy(document.documentElement, {});
      lenis.destroy();
      lenisRef.current = null;
      if (lenisRafRef.current) {
        gsap.ticker.remove(lenisRafRef.current);
        lenisRafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    resetPageScrollOnNavigation();

    const lenis = lenisRef.current;
    if (lenis) {
      lenis.start();
      lenis.scrollTo(0, { immediate: true });
    }

    const refresh = () => refreshScrollTriggersAfterNavigation();

    requestAnimationFrame(refresh);
    const shortDelay = window.setTimeout(refresh, 120);
    const longDelay = window.setTimeout(refresh, 400);
    const notifyDelays = [0, 80, 200, 500].map((ms) => window.setTimeout(notifyScrollUpdate, ms));

    return () => {
      window.clearTimeout(shortDelay);
      window.clearTimeout(longDelay);
      notifyDelays.forEach((id) => window.clearTimeout(id));
    };
  }, [pathname]);

  return <>{children}</>;
}
