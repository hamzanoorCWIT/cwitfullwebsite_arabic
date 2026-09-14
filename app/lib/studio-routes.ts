/** Public Next.js routes for studio detail pages (under /services). */
export const STUDIO_ROUTES = {
  digitalExperience: "/services/digital-experience-studio",
  applicationDevelopment: "/services/application-development-studio",
  growthBranding: "/services/growth-branding-studio",
  aiAndThings: "/services/ai-and-things",
} as const;

/** Legacy top-level paths — kept for redirects from old URLs. */
export const LEGACY_STUDIO_ROUTES = {
  digitalExperience: "/digital-experience-studio",
  applicationDevelopment: "/application-development-studio",
  growthBranding: "/growth-branding-studio",
  aiAndThings: "/ai-and-things",
} as const;
