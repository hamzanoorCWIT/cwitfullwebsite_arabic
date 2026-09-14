let readLenisScroll: (() => number) | null = null;
const scrollListeners = new Set<() => void>();

export function registerLenisScrollReader(reader: () => number): void {
  readLenisScroll = reader;
}

export function unregisterLenisScrollReader(): void {
  readLenisScroll = null;
}

export function subscribeToScrollUpdates(listener: () => void): () => void {
  scrollListeners.add(listener);
  return () => scrollListeners.delete(listener);
}

export function notifyScrollUpdate(): void {
  scrollListeners.forEach((listener) => listener());
}

/** Prefer Lenis virtual scroll; fall back to native scroll position. */
export function getCurrentScrollY(): number {
  if (typeof window === "undefined") return 0;

  const lenisY = readLenisScroll?.();
  if (typeof lenisY === "number" && lenisY >= 0) {
    return lenisY;
  }

  return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
}
