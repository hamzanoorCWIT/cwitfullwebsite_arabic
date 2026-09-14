/**
 * Services page shared types + studio route map.
 * Hardcoded fallback copy lives in `services-defaults.legacy.ts` (commented / unused).
 * Page content comes from WordPress ACF only.
 */

import type { ShowcaseCard } from "@/app/components/sections/ServicesShowcase";
import { STUDIO_ROUTES } from "@/app/lib/studio-routes";

export type ServicesStudioKey = "digital" | "application" | "growth" | "ai";

export type ServicesTitleLayout =
  | "highlight_block"
  | "highlight_amp_block"
  | "highlight_inline";

export type ServicesStudioSection = {
  studioKey: ServicesStudioKey;
  titleLayout: ServicesTitleLayout;
  titleHighlight: string;
  titleRemainder: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  cards: ShowcaseCard[];
};

/** @deprecated Use ServicesStudioSection — kept for existing imports. */
export type ServicesStudioDefault = ServicesStudioSection;

export const STUDIO_KEY_ROUTES: Record<ServicesStudioKey, string> = {
  digital: STUDIO_ROUTES.digitalExperience,
  application: STUDIO_ROUTES.applicationDevelopment,
  growth: STUDIO_ROUTES.growthBranding,
  ai: STUDIO_ROUTES.aiAndThings,
};
