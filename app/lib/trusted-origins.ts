/**
 * Trusted CMS / frontend origins for CSP and media URL resolution.
 * Kept separate from DOMPurify so Edge middleware can import it safely.
 */
export function collectTrustedOrigins(): string[] {
  const values = [
    process.env.WORDPRESS_SITE_URL,
    process.env.WORDPRESS_GRAPHQL_URL,
    process.env.NEXT_PUBLIC_WP_GRAPHQL_URL,
    process.env.NEXT_PUBLIC_WP_ORIGIN,
    process.env.NEXT_PUBLIC_SITE_URL,
  ];

  const origins = new Set<string>();
  for (const value of values) {
    if (!value?.trim()) continue;
    try {
      origins.add(new URL(value.trim()).origin);
    } catch {
      // ignore invalid URLs
    }
  }

  return [...origins];
}
