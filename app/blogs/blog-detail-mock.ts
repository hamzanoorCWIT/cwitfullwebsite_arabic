/**
 * Temporary mock data for blog detail page. Replace with headless/API later.
 */

export type BlogDetailMock = {
  title: string;
  slug: string;
  badge?: string; // e.g. date or category
  heroImage?: string; // optional; leave empty for fallback bg
  excerpt?: string;
  content?: string;
  // Sections (work-details style – optional placeholders)
  industryTitle?: string;
  industryDescription?: string;
  projectTypeTitle?: string;
  projectYear?: string;
  servicesTitle?: string;
  services?: string[];
  stayImage?: string;
  stayImageAlt?: string;
  stayParagraphs?: string[];
  deliveredTitle?: string;
  deliveredDescription?: string;
  deliverables?: string[];
  performanceMetrics?: { title: string; value: string }[];
  fullWidthImage?: string;
  fullWidthImageAlt?: string;
  testimonialsTitle?: string;
  testimonials?: { text: string; rating: number }[];
};

const MOCK_BLOG_DETAILS: Record<string, BlogDetailMock> = {};

function slugFromTitle(s: string): string {
  return s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Get blog detail by slug. Returns null if not found.
 */
export function getBlogDetailBySlug(slug: string): BlogDetailMock | null {
  const slugNorm = slug?.replace(/^\/+|\/+$/g, "").trim();
  if (!slugNorm) return null;

  return MOCK_BLOG_DETAILS[slugNorm] ?? null;
}

export { MOCK_BLOG_DETAILS };
