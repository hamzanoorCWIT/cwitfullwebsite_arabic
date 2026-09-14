import type { LeadingServiceLandingConfig } from "@/app/components/sections/LeadingServiceLandingPage";

/**
 * Per-route config for CMS Leading Services landings.
 * Same ACF group (`leadingServicesTemplate`) as mobile-app.
 */
export const LEADING_SERVICE_LANDINGS: Record<string, LeadingServiceLandingConfig> = {
  "mobile-app": {
    routeSlug: "mobile-app",
    path: "/mobile-app/",
    // Default pilot WP id; override with LEADING_SERVICE_MOBILE_APP_ID.
    databaseId: "6313",
    titleHints: ["mobile app", "mobile apps"],
    jsonLdPageTitle: "Mobile Apps",
  },
  "web-app": {
    routeSlug: "web-app",
    path: "/web-app/",
    titleHints: ["web app", "web design", "web development"],
    jsonLdPageTitle: "Web Design",
  },
  "logo-app": {
    routeSlug: "logo-app",
    path: "/logo-app/",
    titleHints: ["logo", "brand", "logo design"],
    jsonLdPageTitle: "Logo Design",
  },
  "seo-app": {
    routeSlug: "seo-app",
    path: "/seo-app/",
    titleHints: ["seo"],
    jsonLdPageTitle: "SEO",
  },
  "security-app": {
    routeSlug: "security-app",
    path: "/security-app/",
    titleHints: ["security", "cyber security", "cybersecurity"],
    jsonLdPageTitle: "Security",
  },
  "marketing-app": {
    routeSlug: "marketing-app",
    path: "/marketing-app/",
    titleHints: ["marketing", "digital marketing"],
    jsonLdPageTitle: "Marketing",
  },
  salesforce: {
    routeSlug: "salesforce",
    path: "/salesforce/",
    titleHints: ["salesforce"],
    jsonLdPageTitle: "Salesforce",
  },
  "ecommerce-app": {
    routeSlug: "ecommerce-app",
    path: "/ecommerce-app/",
    titleHints: ["ecommerce", "e-commerce"],
    jsonLdPageTitle: "Ecommerce",
  },
  "flutter-app": {
    routeSlug: "flutter-app",
    path: "/flutter-app/",
    titleHints: ["flutter"],
    jsonLdPageTitle: "Flutter App",
  },
  react: {
    routeSlug: "react",
    path: "/react/",
    titleHints: ["react"],
    jsonLdPageTitle: "React",
  },
  wordpress: {
    routeSlug: "wordpress",
    path: "/wordpress/",
    titleHints: ["wordpress"],
    jsonLdPageTitle: "WordPress",
  },
  "ui-ux-app": {
    routeSlug: "ui-ux-app",
    path: "/ui-ux-app/",
    titleHints: ["ui ux", "ui/ux", "ux"],
    jsonLdPageTitle: "UI/UX",
  },
  "real-estate": {
    routeSlug: "real-estate",
    path: "/real-estate/",
    titleHints: ["real estate"],
    jsonLdPageTitle: "Real Estate",
  },
  education: {
    routeSlug: "education",
    path: "/education/",
    titleHints: ["education"],
    jsonLdPageTitle: "Education",
  },
  healthcare: {
    routeSlug: "healthcare",
    path: "/healthcare/",
    titleHints: ["healthcare", "health care"],
    jsonLdPageTitle: "Healthcare",
  },
  "retail-ecommerce": {
    routeSlug: "retail-ecommerce",
    path: "/retail-ecommerce/",
    titleHints: ["retail", "retail ecommerce"],
    jsonLdPageTitle: "Retail Ecommerce",
  },
  banking: {
    routeSlug: "banking",
    path: "/banking/",
    titleHints: ["banking", "fintech"],
    jsonLdPageTitle: "Banking",
  },
  "digital-solutions": {
    routeSlug: "digital-solutions",
    path: "/digital-solutions/",
    titleHints: ["digital solutions"],
    jsonLdPageTitle: "Digital Solutions",
  },
  fmcg: {
    routeSlug: "fmcg",
    path: "/fmcg/",
    titleHints: ["fmcg"],
    jsonLdPageTitle: "FMCG",
  },
  energy: {
    routeSlug: "energy",
    path: "/energy/",
    titleHints: ["energy"],
    jsonLdPageTitle: "Energy",
  },
  technology: {
    routeSlug: "technology",
    path: "/technology/",
    titleHints: ["technology"],
    jsonLdPageTitle: "Technology",
  },
};
