import { CONTACT_FORM_FIELD_LIMITS } from "@/app/lib/contact-form-config";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTROL_CHARS_RE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

export const CONTACT_FIELD_LIMITS = CONTACT_FORM_FIELD_LIMITS;

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_RATE_LIMIT_MAX = 3;
const EMAIL_RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000;
const MAX_BODY_BYTES = 32_768;
const MAX_RATE_LIMIT_ENTRIES = 10_000;

type RateBucket = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateBucket>();
const emailRateLimitStore = new Map<string, RateBucket>();

export class ContactRequestError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ContactRequestError";
    this.status = status;
  }
}

export function getClientIp(request: Request): string {
  const trustProxy = process.env.TRUST_PROXY === "true";

  if (trustProxy) {
    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) {
      return forwarded.split(",")[0]?.trim() || "unknown";
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp?.trim()) {
      return realIp.trim();
    }
  }

  return "unknown";
}

function pruneRateLimitStore(store: Map<string, RateBucket>, now: number): void {
  if (store.size < MAX_RATE_LIMIT_ENTRIES) return;

  for (const [key, bucket] of store) {
    if (now >= bucket.resetAt) {
      store.delete(key);
    }
  }
}

function checkRateLimit(
  store: Map<string, RateBucket>,
  key: string,
  max: number,
  windowMs: number
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  pruneRateLimitStore(store, now);

  const bucket = store.get(key);

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true };
  }

  if (bucket.count >= max) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true };
}

export function checkContactRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  return checkRateLimit(rateLimitStore, ip, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS);
}

export function checkContactEmailRateLimit(email: string): {
  allowed: boolean;
  retryAfterSeconds?: number;
} {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return { allowed: true };
  return checkRateLimit(
    emailRateLimitStore,
    normalized,
    EMAIL_RATE_LIMIT_MAX,
    EMAIL_RATE_LIMIT_WINDOW_MS
  );
}

export function isRequestBodyTooLarge(request: Request): boolean {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) return false;

  const size = Number.parseInt(contentLength, 10);
  return Number.isFinite(size) && size > MAX_BODY_BYTES;
}

export async function readBoundedJsonBody(request: Request): Promise<unknown> {
  const rawBody = await request.text();
  if (rawBody.length > MAX_BODY_BYTES) {
    throw new ContactRequestError("Request body is too large", 413);
  }

  if (!rawBody.trim()) {
    throw new ContactRequestError("Invalid or missing fields", 400);
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new ContactRequestError("Invalid request body", 400);
  }
}

export function isAllowedContactRequest(request: Request): boolean {
  if (process.env.NODE_ENV !== "production") {
    return true;
  }

  const allowedOrigins = new Set<string>();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (siteUrl) {
    try {
      allowedOrigins.add(new URL(siteUrl).origin);
    } catch {
      // ignore invalid site URL
    }
  }

  if (allowedOrigins.size === 0) {
    return false;
  }

  const origin = request.headers.get("origin");
  if (origin) {
    return allowedOrigins.has(origin);
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      return allowedOrigins.has(new URL(referer).origin);
    } catch {
      return false;
    }
  }

  return false;
}

export function isHoneypotTriggered(value: unknown): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function sanitizePlainTextField(value: string): string {
  return value.replace(CONTROL_CHARS_RE, "").replace(/\0/g, "");
}

export function sanitizeEmailDisplayName(name: string): string {
  return sanitizePlainTextField(name).replace(/[\r\n]/g, " ").trim().slice(0, 120);
}

export function isValidEmail(email: string): boolean {
  const trimmed = sanitizePlainTextField(email).trim();
  if (!trimmed || trimmed.length > CONTACT_FIELD_LIMITS.email) return false;
  if (/[\r\n]/.test(trimmed)) return false;
  if (trimmed.includes("..")) return false;
  return EMAIL_RE.test(trimmed);
}

export function normalizeRecipientEmail(email: string): string | undefined {
  const cleaned = sanitizePlainTextField(email).replace(/[\r\n]/g, "").trim().toLowerCase();
  return isValidEmail(cleaned) ? cleaned : undefined;
}

export function sanitizeReplyToEmail(email: string): string | undefined {
  return normalizeRecipientEmail(email);
}

export function trimToMaxLength(value: string, max: number): string {
  return sanitizePlainTextField(value).trim().slice(0, max);
}

export function validateContactFieldLengths(fields: {
  fullName: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}): string | null {
  if (fields.fullName.length > CONTACT_FIELD_LIMITS.fullName) {
    return "Name is too long";
  }
  if (fields.email.length > CONTACT_FIELD_LIMITS.email) {
    return "Email is too long";
  }
  if (fields.phone.length > CONTACT_FIELD_LIMITS.phone) {
    return "Phone is too long";
  }
  if (fields.company.length > CONTACT_FIELD_LIMITS.company) {
    return "Company is too long";
  }
  if (fields.message.length > CONTACT_FIELD_LIMITS.message) {
    return "Message is too long";
  }
  return null;
}

export function resolveSafeRecipientEmail(
  cmsRecipientEmail: string | undefined,
  fallbackEmail: string | undefined
): string | undefined {
  const cms = cmsRecipientEmail ? normalizeRecipientEmail(cmsRecipientEmail) : undefined;
  if (cms) return cms;

  const fallback = fallbackEmail ? normalizeRecipientEmail(fallbackEmail) : undefined;
  if (fallback) return fallback;

  return undefined;
}

export function logContactApiError(error: unknown): void {
  if (error instanceof ContactRequestError) {
    console.error(`Contact API error (${error.status}): ${error.message}`);
    return;
  }

  if (error instanceof Error) {
    console.error("Contact API error:", error.message);
    return;
  }

  console.error("Contact API error");
}
