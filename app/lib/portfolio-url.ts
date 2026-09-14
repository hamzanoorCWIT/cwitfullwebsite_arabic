import { isSiteRootPath } from "@/app/lib/site-routes";

export const PORTFOLIO_DETAIL_BASE = "/our-work";

export function portfolioDetailPath(slug: string | null | undefined): string | undefined {
  const normalized = slug?.replace(/^\/+|\/+$/g, "").trim();
  if (!normalized) return undefined;
  return `${PORTFOLIO_DETAIL_BASE}/${normalized}`;
}

/** Normalize CMS / legacy portfolio links to /our-work/[slug]. */
export function normalizePortfolioDetailHref(link: string | undefined | null): string {
  const raw = link?.trim();
  if (!raw) return PORTFOLIO_DETAIL_BASE;

  if (raw.startsWith("/our-work/")) {
    return raw.endsWith("/") && raw.length > 1 ? raw.slice(0, -1) : raw;
  }

  if (raw.startsWith("/portfolio/")) {
    const slug = raw.slice("/portfolio/".length).replace(/^\/+|\/+$/g, "");
    return slug ? `${PORTFOLIO_DETAIL_BASE}/${slug}` : PORTFOLIO_DETAIL_BASE;
  }

  if (raw.startsWith("/work-details/")) {
    const slug = raw.slice("/work-details/".length).replace(/^\/+|\/+$/g, "");
    return slug ? `${PORTFOLIO_DETAIL_BASE}/${slug}` : PORTFOLIO_DETAIL_BASE;
  }

  if (raw.startsWith("/work/")) {
    const slug = raw.slice("/work/".length).replace(/^\/+|\/+$/g, "");
    return slug ? `${PORTFOLIO_DETAIL_BASE}/${slug}` : PORTFOLIO_DETAIL_BASE;
  }

  if (/^https?:\/\//i.test(raw)) {
    const fromOurWork = raw.match(/\/our-work\/([^/?#]+)/)?.[1];
    if (fromOurWork) return `${PORTFOLIO_DETAIL_BASE}/${fromOurWork}`;
    const fromPortfolio = raw.match(/\/portfolio\/([^/?#]+)/)?.[1];
    if (fromPortfolio) return `${PORTFOLIO_DETAIL_BASE}/${fromPortfolio}`;
    return PORTFOLIO_DETAIL_BASE;
  }

  const slugOnly = raw.replace(/^\/+|\/+$/g, "").replace(/^work\//, "");
  if (slugOnly && !slugOnly.includes("/") && !isSiteRootPath(slugOnly)) {
    return `${PORTFOLIO_DETAIL_BASE}/${slugOnly}`;
  }

  if (raw.startsWith("/")) {
    return raw.endsWith("/") && raw.length > 1 ? raw.slice(0, -1) : raw;
  }

  return `${PORTFOLIO_DETAIL_BASE}/${slugOnly}`;
}
