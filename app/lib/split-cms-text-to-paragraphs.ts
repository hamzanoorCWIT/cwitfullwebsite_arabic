/**
 * Splits CMS intro / textarea / WYSIWYG HTML into block strings for multi-block rendering.
 * Preserves rich HTML: inline tags (<strong>, <em>, <a>, <span>, <br>) inside <p>,
 * and block-level elements (<ul>, <ol>, <blockquote>) as complete HTML strings.
 * Matches the rules previously used in `normalizeIntro` (home-normalize).
 */
export function splitCmsTextToParagraphs(raw: string | null | undefined): string[] {
  const html = raw?.trim();
  if (!html) return [];

  // ── Rich HTML path: detect <p> or block-level tags ──
  const hasBlockTags = /<(p|ul|ol|blockquote|h[1-6])\b/i.test(html);

  if (hasBlockTags) {
    const result: string[] = [];

    // Match top-level block elements in order of appearance.
    // <p>:          extract inner HTML (preserving inline tags like <strong>, <em>, <a>)
    // <ul>/<ol>:    preserve the entire element (list markup)
    // <blockquote>: preserve the entire element
    const blockRegex =
      /<p\b[^>]*>([\s\S]*?)<\/p>|(<ul\b[^>]*>[\s\S]*?<\/ul>)|(<ol\b[^>]*>[\s\S]*?<\/ol>)|(<blockquote\b[^>]*>[\s\S]*?<\/blockquote>)/gi;

    let match;
    while ((match = blockRegex.exec(html)) !== null) {
      if (match[1] !== undefined) {
        // <p> block – return inner HTML (inline tags preserved)
        const inner = match[1].trim();
        if (inner) result.push(inner);
      } else {
        // Block-level element (<ul>, <ol>, <blockquote>) – preserve full HTML
        const block = (match[2] || match[3] || match[4] || "").trim();
        if (block) result.push(block);
      }
    }

    if (result.length > 0) return result;
  }

  // ── Fallback: light markup without standard block tags ──
  const looksLikeMarkup = /<\/?[a-z][\s\S]*?>/i.test(html);

  if (looksLikeMarkup) {
    return html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|section|article|h[1-6])>/gi, "\n\n")
      .replace(/<[^>]+>/g, " ")
      .split(/\n\s*\n/)
      .map((value) => value.replace(/[ \t]+/g, " ").replace(/\s*\n\s*/g, " ").trim())
      .filter(Boolean);
  }

  // Plain textarea: each Enter = new block (same visual as separate lines in CMS)
  return html
    .split(/\r?\n/)
    .map((line) => line.replace(/[ \t]+/g, " ").trim())
    .filter(Boolean);
}
