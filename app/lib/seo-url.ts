const WP_UPLOADS_PATH = "/wp-content/uploads/";

function requireEnv(name: string, value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) {
    throw new Error(`${name} environment variable is required`);
  }
  return trimmed;
}

export function getWordPressSiteUrl(): string {
  return requireEnv("WORDPRESS_SITE_URL", process.env.WORDPRESS_SITE_URL);
}

export function getFrontendSiteUrl(): string {
  return requireEnv("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL);
}

function normalizeOrigin(url: string): string {
  return url.replace(/\/+$/, "");
}

function isWordPressMediaUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname.includes(WP_UPLOADS_PATH);
  } catch {
    return url.includes(WP_UPLOADS_PATH);
  }
}

/**
 * Replaces WordPress site URLs with the frontend site URL.
 * Skips WordPress media/upload URLs.
 */
export function replaceWordPressSiteUrl(
  value: string | null | undefined,
  wpSiteUrl: string = getWordPressSiteUrl(),
  frontendSiteUrl: string = getFrontendSiteUrl()
): string | undefined {
  if (!value?.trim()) return undefined;

  if (isWordPressMediaUrl(value)) {
    return value;
  }

  const wpOrigin = normalizeOrigin(wpSiteUrl);
  const frontendOrigin = normalizeOrigin(frontendSiteUrl);

  if (value.startsWith(`${wpOrigin}/`) || value === wpOrigin) {
    return frontendOrigin + value.slice(wpOrigin.length);
  }

  return value;
}

export function rewriteSchemaUrls(
  value: unknown,
  wpSiteUrl: string = getWordPressSiteUrl(),
  frontendSiteUrl: string = getFrontendSiteUrl()
): unknown {
  if (typeof value === "string") {
    return replaceWordPressSiteUrl(value, wpSiteUrl, frontendSiteUrl) ?? value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => rewriteSchemaUrls(item, wpSiteUrl, frontendSiteUrl));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        rewriteSchemaUrls(entry, wpSiteUrl, frontendSiteUrl),
      ])
    );
  }

  return value;
}
