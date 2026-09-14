import DOMPurify from "isomorphic-dompurify";
import { escapeHtml } from "@/app/lib/escape-html";

export { escapeHtml };

const BASE_ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "em",
  "b",
  "i",
  "u",
  "a",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
  "span",
  "div",
] as const;

const BASE_ALLOWED_ATTR = ["href", "target", "rel", "class"] as const;

const RICH_ALLOWED_TAGS = [
  ...BASE_ALLOWED_TAGS,
  "img",
  "figure",
  "figcaption",
] as const;

const RICH_ALLOWED_ATTR = [
  ...BASE_ALLOWED_ATTR,
  "src",
  "alt",
  "width",
  "height",
  "loading",
] as const;

type SanitizeOptions = {
  /** Allow images and richer blog/portfolio markup from WordPress. */
  rich?: boolean;
};

/**
 * Sanitize CMS HTML before rendering with dangerouslySetInnerHTML.
 * Strips scripts, event handlers, and other unsafe markup.
 */
export function sanitizeCmsHtml(
  html: string | undefined | null,
  options: SanitizeOptions = {}
): string {
  if (!html?.trim()) return "";

  const config = options.rich
    ? {
        ALLOWED_TAGS: [...RICH_ALLOWED_TAGS],
        ALLOWED_ATTR: [...RICH_ALLOWED_ATTR],
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
      }
    : {
        ALLOWED_TAGS: [...BASE_ALLOWED_TAGS],
        ALLOWED_ATTR: [...BASE_ALLOWED_ATTR],
        ALLOW_DATA_ATTR: false,
        FORBID_TAGS: ["script", "style", "iframe", "object", "embed"],
      };

  try {
    return DOMPurify.sanitize(html, config).trim();
  } catch {
    return escapeHtml(html);
  }
}
