"use client";

import { useEffect, RefObject } from "react";
import gsap from "gsap";

/**
 * Custom hook for GSAP animations
 * @param animation - Animation function that receives GSAP context
 * @param scope - Ref object or element to scope the animations to
 * @param dependencies - Dependencies array for useEffect
 */
export function useGSAP(
  animation: (ctx: gsap.Context) => void,
  scope?: RefObject<HTMLElement | null> | HTMLElement | null,
  dependencies: React.DependencyList = []
) {
  useEffect(() => {
    const element = scope && "current" in scope ? scope.current : scope;
    if (!element) return;

    const ctx = gsap.context((ctx) => {
      animation(ctx);
    }, element);

    return () => {
      ctx.revert();
    };
  }, dependencies);
}

