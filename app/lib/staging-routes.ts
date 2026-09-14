/**
 * Internal/demo routes that must not be reachable in production.
 */
export const STAGING_ROUTE_PREFIXES = [
  "/new-home",
] as const;

export function isStagingRoute(pathname: string): boolean {
  return STAGING_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}
