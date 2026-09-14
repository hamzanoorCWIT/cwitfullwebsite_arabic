import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Kill a tween/timeline and revert its pin-spacer so React can unmount the node. */
export function killTweenAndPin(tween: { scrollTrigger?: ScrollTrigger; kill: () => void } | null | undefined): void {
  if (!tween) return;
  tween.scrollTrigger?.kill(true);
  tween.kill();
}

/** Revert every GSAP pin before React replaces or flips the DOM (locale / RTL). */
export function killAllScrollTriggers(): void {
  if (typeof window === "undefined") return;
  ScrollTrigger.getAll().forEach((trigger) => {
    try {
      trigger.kill(true);
    } catch {
      trigger.kill();
    }
  });
  ScrollTrigger.clearScrollMemory();
}

/** Remove ScrollTriggers whose target nodes were unmounted during client navigation. */
export function killOrphanedScrollTriggers(): void {
  if (typeof document === "undefined") return;

  ScrollTrigger.getAll().forEach((trigger) => {
    const el = trigger.trigger;
    if (el instanceof Element && !document.body.contains(el)) {
      trigger.kill(true);
    }
  });
}

export function refreshScrollTriggersAfterNavigation(): void {
  killOrphanedScrollTriggers();
  ScrollTrigger.clearScrollMemory();
  ScrollTrigger.refresh();
}
