export function isRtlDirection(el: Element | null | undefined): boolean {
  if (!el || typeof window === "undefined") return false;
  return getComputedStyle(el).direction === "rtl";
}

export function horizontalOverflow(track: HTMLElement, container: HTMLElement): number {
  return Math.max(0, track.scrollWidth - container.clientWidth);
}

/** LTR slides toward negative x; RTL slides toward positive x. */
export function rtlAwareTranslateX(overflow: number, isRtl: boolean): number {
  return isRtl ? overflow : -overflow;
}
