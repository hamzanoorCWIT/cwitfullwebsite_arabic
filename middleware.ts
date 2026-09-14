import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { collectTrustedOrigins } from "@/app/lib/trusted-origins";
import { isStagingRoute } from "@/app/lib/staging-routes";
import { isAppLocale, LOCALE_COOKIE_NAME } from "@/app/lib/locale";

function buildContentSecurityPolicy(isDev: boolean): string {
  const trustedOrigins = collectTrustedOrigins();
  const trustedList = trustedOrigins.length ? ` ${trustedOrigins.join(" ")}` : "";
  const onlyHttpsOrigins =
    trustedOrigins.length > 0 && trustedOrigins.every((origin) => origin.startsWith("https:"));

  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    "https://maps.googleapis.com",
    "https://www.clarity.ms",
  ].join(" ");

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    `img-src 'self' data: blob: https: http:${trustedList}`,
    "media-src 'self' https: blob: data:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://*.clarity.ms https://maps.googleapis.com https://*.googleapis.com https://*.cloudflarestream.com${trustedList}`,
    "frame-src 'self' https://www.google.com https://maps.google.com https://www.youtube.com https://player.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ];

  // Only force HTTPS upgrades when every trusted origin is already HTTPS (production).
  if (!isDev && onlyHttpsOrigins) {
    directives.push("upgrade-insecure-requests");
  }

  return directives.join("; ");
}

function applySecurityHeaders(response: NextResponse, isDev: boolean): void {
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("X-DNS-Prefetch-Control", "off");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );
  response.headers.set("Content-Security-Policy", buildContentSecurityPolicy(isDev));

  if (!isDev) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload"
    );
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isDev = process.env.NODE_ENV !== "production";

  if (!isDev && isStagingRoute(pathname)) {
    return new NextResponse(null, { status: 404 });
  }

  const langParam = request.nextUrl.searchParams.get("lang");
  const cookieLang = request.cookies.get(LOCALE_COOKIE_NAME)?.value;
  const locale = isAppLocale(langParam)
    ? langParam
    : isAppLocale(cookieLang)
      ? cookieLang
      : undefined;

  const requestHeaders = new Headers(request.headers);
  if (locale) {
    requestHeaders.set("x-cwit-lang", locale);
  }

  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });
  if (isAppLocale(langParam)) {
    response.cookies.set(LOCALE_COOKIE_NAME, langParam, {
      path: "/",
      maxAge: 31536000,
      sameSite: "lax",
    });
  }
  applySecurityHeaders(response, isDev);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
