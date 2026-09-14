/**
 * First-segment paths that are real site routes, not legacy portfolio slugs.
 * Used to avoid rewriting CMS menu links or /[slug] legacy redirects.
 */
const STATIC_ROOT_SLUGS = new Set([
  "about-us",
  "ai-and-things",
  "application-development-studio",
  "banking",
  "blogs",
  "blog",
  "contact-us",
  "digital-experience-studio",
  "digital-solutions",
  "ecommerce-app",
  "education",
  "flutter-app",
  "growth-branding-studio",
  "healthcare",
  "logo-app",
  "marketing-app",
  "mobile-app",
  "new-home",
  "our-work",
  "portfolio",
  "react",
  "real-estate",
  "retail-ecommerce",
  "salesforce",
  "security-app",
  "seo-app",
  "services",
  "ui-ux-app",
  "web-app",
  "wordpress",
  "work",
  "work-details",
]);

export function normalizeRootSlug(pathOrSlug: string): string {
  return pathOrSlug.replace(/^\/+|\/+$/g, "").trim().toLowerCase();
}

export function isSiteRootPath(pathOrSlug: string): boolean {
  const normalized = normalizeRootSlug(pathOrSlug);
  if (!normalized) return false;
  const firstSegment = normalized.split("/")[0];
  return STATIC_ROOT_SLUGS.has(firstSegment);
}
