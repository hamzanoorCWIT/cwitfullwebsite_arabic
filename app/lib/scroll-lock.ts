import { getCurrentScrollY } from "@/app/lib/lenis-scroll";

let lockCount = 0;
let savedScrollY = 0;
let savedBodyPaddingRight = "";
let activeLockMode: ScrollLockMode | null = null;

export type ScrollLockMode = "menu" | "modal";

function clearScrollLockStyles(): void {
  if (typeof document === "undefined") return;

  document.documentElement.classList.remove("menu-open", "modal-open");
  document.body.classList.remove("menu-open", "modal-open");
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.left = "";
  document.body.style.right = "";
  document.body.style.width = "";
  document.body.style.overflow = "";
  document.body.style.paddingRight = savedBodyPaddingRight;
}

/** Reset scroll lock + scroll position after route changes (footer links, menu nav, CTAs). */
export function resetPageScrollOnNavigation(): void {
  if (typeof document === "undefined") return;

  lockCount = 0;
  savedScrollY = 0;
  savedBodyPaddingRight = "";
  activeLockMode = null;
  clearScrollLockStyles();

  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;

  window.dispatchEvent(
    new CustomEvent("page-scroll-lock", { detail: { locked: false, scrollY: 0 } })
  );
}

export function lockPageScroll(mode: ScrollLockMode = "menu"): void {
  if (typeof document === "undefined") return;

  lockCount += 1;
  if (lockCount > 1) return;

  activeLockMode = mode;
  savedScrollY = getCurrentScrollY();
  savedBodyPaddingRight = document.body.style.paddingRight;

  const openClass = mode === "menu" ? "menu-open" : "modal-open";
  document.documentElement.classList.add(openClass);
  document.body.classList.add(openClass);

  // Menu needs fixed body to fully freeze the page. Modals only stop Lenis + overflow.
  if (mode === "menu") {
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }

  document.body.style.overflow = "hidden";

  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
  if (scrollbarWidth > 0) {
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  }

  window.dispatchEvent(new CustomEvent("page-scroll-lock", { detail: { locked: true } }));
}

export function unlockPageScroll(): void {
  if (typeof document === "undefined") return;

  const mode = activeLockMode;
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount > 0) return;

  clearScrollLockStyles();
  activeLockMode = null;

  if (mode === "menu") {
    window.scrollTo(0, savedScrollY);
  }

  window.dispatchEvent(
    new CustomEvent("page-scroll-lock", { detail: { locked: false, scrollY: savedScrollY } })
  );
}

export function forceUnlockPageScroll(): void {
  if (typeof document === "undefined") return;
  const isLocked =
    document.body.classList.contains("menu-open") ||
    document.body.classList.contains("modal-open") ||
    document.body.style.position === "fixed";
  if (!isLocked) return;
  lockCount = 1;
  unlockPageScroll();
}
