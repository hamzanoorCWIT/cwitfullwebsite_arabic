export type TextDirection = "ltr" | "rtl";

export const DIRECTION_STORAGE_KEY = "cwit-text-direction";
export const DEFAULT_TEXT_DIRECTION: TextDirection = "rtl";

export function isTextDirection(value: string | null | undefined): value is TextDirection {
  return value === "ltr" || value === "rtl";
}

export function readStoredDirection(): TextDirection {
  if (typeof window === "undefined") return DEFAULT_TEXT_DIRECTION;
  try {
    const saved = window.localStorage.getItem(DIRECTION_STORAGE_KEY);
    return isTextDirection(saved) ? saved : DEFAULT_TEXT_DIRECTION;
  } catch {
    return DEFAULT_TEXT_DIRECTION;
  }
}

export function writeStoredDirection(direction: TextDirection) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(DIRECTION_STORAGE_KEY, direction);
  } catch {
    // ignore quota / private-mode failures
  }
}
