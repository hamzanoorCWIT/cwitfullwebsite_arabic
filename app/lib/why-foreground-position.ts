/** Shared (server + client) why-card foreground position helpers. */

export type AppWhyForegroundPosition =
  | "full"
  | "top-left"
  | "top-center"
  | "top-right"
  | "center-left"
  | "center"
  | "center-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export const WHY_FOREGROUND_POSITIONS = new Set<AppWhyForegroundPosition>([
  "full",
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
]);

/** Frontend-owned placement classes for why-card foreground. */
export const WHY_FOREGROUND_POSITION_CLASS: Record<
  AppWhyForegroundPosition,
  string
> = {
  full: "absolute inset-0 h-full w-full object-cover",
  "top-left":
    "absolute inset-0 h-full w-full object-contain object-left-top",
  "top-center":
    "absolute inset-0 h-full w-full object-contain object-top",
  "top-right":
    "absolute inset-0 h-full w-full object-contain object-right-top",
  "center-left":
    "absolute inset-0 h-full w-full object-contain object-left",
  center: "absolute inset-0 h-full w-full object-contain object-center",
  "center-right":
    "absolute inset-0 h-full w-full object-contain object-right",
  "bottom-left":
    "absolute inset-0 h-full w-full object-contain object-left-bottom",
  "bottom-center":
    "absolute inset-0 h-full w-full object-contain object-bottom",
  "bottom-right":
    "absolute inset-0 h-full w-full object-contain object-right-bottom",
};

export function resolveWhyForegroundPosition(
  value?: string | null,
): AppWhyForegroundPosition {
  return WHY_FOREGROUND_POSITIONS.has(value as AppWhyForegroundPosition)
    ? (value as AppWhyForegroundPosition)
    : "bottom-center";
}
