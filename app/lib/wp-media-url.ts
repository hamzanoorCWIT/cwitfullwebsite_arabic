/**
 * WordPress media URL helpers safe for client and server components.
 * Does not expose GraphQL fetch logic to the browser bundle.
 */

const LOCAL_PUBLIC_PATH_PREFIXES = ["/imgs/", "/figma-home/", "/our-work-new/", "/images/"] as const;
const WP_UPLOADS_PATH = "/wp-content/uploads/";

function isLocalPublicAssetPath(path: string): boolean {
  return LOCAL_PUBLIC_PATH_PREFIXES.some((prefix) => path.startsWith(prefix));
}

/** WordPress origin for resolving relative upload paths. */
export function getWpOrigin(): string {
  const explicitOrigin = process.env.NEXT_PUBLIC_WP_ORIGIN?.trim();
  if (explicitOrigin) {
    return explicitOrigin.replace(/\/+$/, "");
  }

  const graphqlUrl = process.env.NEXT_PUBLIC_WP_GRAPHQL_URL?.trim();
  if (graphqlUrl) {
    try {
      return new URL(graphqlUrl).origin;
    } catch {
      // fall through
    }
  }

  const wpSiteUrl = process.env.WORDPRESS_SITE_URL?.trim();
  if (wpSiteUrl) {
    try {
      return new URL(wpSiteUrl).origin;
    } catch {
      // fall through
    }
  }

  return "";
}

function isDirectVideoFileUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(url);
}

/**
 * WordPress upload URLs (media library) are rewritten to a same-origin path so
 * `<video src>` loads via Next.js rewrites instead of a CMS host the browser may not reach.
 * External CDN URLs (e.g. Cloudflare Stream) are left unchanged.
 */
export function toProxiedWordPressUploadUrl(url: string | undefined | null): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (!trimmed || !trimmed.includes(WP_UPLOADS_PATH)) return undefined;

  try {
    const origin = getWpOrigin();
    const parsed = /^https?:\/\//i.test(trimmed)
      ? new URL(trimmed)
      : origin
        ? new URL(trimmed, origin)
        : null;
    if (!parsed) {
      const idx = trimmed.indexOf(WP_UPLOADS_PATH);
      if (idx === -1) return undefined;
      return trimmed.slice(idx);
    }
    const idx = parsed.pathname.indexOf(WP_UPLOADS_PATH);
    if (idx === -1) return undefined;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    const idx = trimmed.indexOf(WP_UPLOADS_PATH);
    if (idx === -1) return undefined;
    return trimmed.slice(idx);
  }
}

/** Pick the first URL that looks like a direct video file (skip WP attachment pages). */
export function pickDirectVideoFileUrl(...candidates: Array<string | undefined | null>): string | undefined {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (!trimmed) continue;
    if (isDirectVideoFileUrl(trimmed) || trimmed.includes(WP_UPLOADS_PATH)) {
      return trimmed;
    }
  }
  return undefined;
}

/** Make image URL absolute; if it already has a protocol, return as-is. */
export function resolveImageUrl(url: string | undefined | null): string | undefined {
  if (!url || typeof url !== "string") return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (isLocalPublicAssetPath(trimmed)) return trimmed;
  const origin = getWpOrigin();
  if (!origin) {
    return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  }
  return trimmed.startsWith("/") ? `${origin}${trimmed}` : `${origin}/${trimmed}`;
}
