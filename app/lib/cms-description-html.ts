import { sanitizeCmsHtml } from "@/app/lib/sanitize-cms-html";

/**
 * Normalizes CMS/WP HTML for short description fields so line breaks match admin input:
 * paragraph boundaries and `<br>` become single `<br />`, duplicate breaks collapse, entities decoded.
 * Output is sanitized before rendering with dangerouslySetInnerHTML.
 */
export function normalizeDescriptionHtml(description: string | undefined): string {
  if (!description?.trim()) return "";

  const text = description
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<p[^>]*>/gi, "")
    .replace(/<\/p>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\n{2,}/g, "\n")
    .trim();

  return sanitizeCmsHtml(text.replace(/\n/g, "<br />"));
}
