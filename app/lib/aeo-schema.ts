import type { YoastSeo } from "@/app/lib/home-seo-api";
import {
  getFrontendSiteUrl,
  getWordPressSiteUrl,
  replaceWordPressSiteUrl,
} from "@/app/lib/seo-url";
import {
  getYoastJsonLdData,
  serializeJsonLd,
} from "@/app/lib/yoast-metadata";
import { SEO_ORGANIZATION } from "@/app/lib/seo-organization";

export type AeoFaqItem = {
  title?: string | null;
  content?: string | null;
};

export type AeoBreadcrumbItem = {
  name: string;
  path: string;
};

export type AeoArticle = {
  headline: string;
  description?: string | null;
  image?: string | null;
  authorName?: string | null;
  authorUrl?: string | null;
  datePublished?: string | null;
  dateModified?: string | null;
  tags?: string[] | null;
  sections?: string[] | null;
};

type JsonObject = Record<string, unknown>;

const HTML_ENTITIES: Record<string, string> = {
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function isObject(value: unknown): value is JsonObject {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function decodeHtmlEntities(value: string): string {
  return value.replace(
    /&(?:#(\d+)|#x([\da-f]+)|([a-z]+));/gi,
    (entity, decimal: string, hex: string, named: string) => {
      if (decimal) {
        const codePoint = Number.parseInt(decimal, 10);
        return codePoint >= 0 && codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : entity;
      }
      if (hex) {
        const codePoint = Number.parseInt(hex, 16);
        return codePoint >= 0 && codePoint <= 0x10ffff
          ? String.fromCodePoint(codePoint)
          : entity;
      }
      return HTML_ENTITIES[named.toLowerCase()] ?? entity;
    }
  );
}

function toPlainText(value: string | null | undefined): string {
  if (!value?.trim()) return "";

  return decodeHtmlEntities(
    value
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
  )
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeFaqs(items: AeoFaqItem[] | null | undefined): JsonObject[] {
  if (!Array.isArray(items)) return [];

  const seen = new Set<string>();
  const questions: JsonObject[] = [];

  for (const item of items) {
    const name = toPlainText(item?.title);
    const text = toPlainText(item?.content);
    if (!name || !text) continue;

    const key = name.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    questions.push({
      "@type": "Question",
      name,
      acceptedAnswer: {
        "@type": "Answer",
        text,
      },
    });
  }

  return questions;
}

function schemaTypes(value: JsonObject): string[] {
  const type = value["@type"];
  if (typeof type === "string") return [type];
  return Array.isArray(type)
    ? type.filter((item): item is string => typeof item === "string")
    : [];
}

function pageUrl(path: string): string {
  const base = `${getFrontendSiteUrl().replace(/\/+$/, "")}/`;
  return new URL(path.replace(/^\/+/, ""), base).toString();
}

function normalizeGraph(base: unknown): JsonObject {
  if (isObject(base) && Array.isArray(base["@graph"])) {
    return {
      ...base,
      "@context": base["@context"] || "https://schema.org",
      "@graph": [...base["@graph"]],
    };
  }

  const baseNodes = Array.isArray(base) ? base : base == null ? [] : [base];
  const nodes = baseNodes.map((item) => {
    if (!isObject(item) || !("@context" in item)) return item;
    const graphItem = { ...item };
    delete graphItem["@context"];
    return graphItem;
  });

  return {
    "@context":
      (isObject(base) && base["@context"]) || "https://schema.org",
    "@graph": nodes,
  };
}

function isMissing(value: unknown): boolean {
  return (
    value == null ||
    (typeof value === "string" && !value.trim()) ||
    (Array.isArray(value) && value.length === 0)
  );
}

function upsertNode(
  graph: JsonObject,
  fallback: JsonObject,
  dedupeTypes: string[],
  authoritativeKeys: string[] = []
): void {
  const nodes = graph["@graph"];
  if (!Array.isArray(nodes)) return;

  const fallbackId =
    typeof fallback["@id"] === "string" ? fallback["@id"] : undefined;
  const index = nodes.findIndex((candidate) => {
    if (!isObject(candidate)) return false;
    if (fallbackId && candidate["@id"] === fallbackId) return true;
    return schemaTypes(candidate).some((type) => dedupeTypes.includes(type));
  });

  if (index === -1) {
    nodes.push(fallback);
    return;
  }

  const existing = nodes[index];
  if (!isObject(existing)) return;
  const enriched = { ...fallback, ...existing };
  for (const [key, value] of Object.entries(fallback)) {
    if (isMissing(enriched[key])) enriched[key] = value;
  }
  for (const key of authoritativeKeys) {
    if (key in fallback) enriched[key] = fallback[key];
  }
  nodes[index] = enriched;
}

function findNode(graph: JsonObject, schemaType: string): JsonObject | undefined {
  const nodes = graph["@graph"];
  if (!Array.isArray(nodes)) return undefined;
  return nodes.find(
    (node): node is JsonObject =>
      isObject(node) && schemaTypes(node).includes(schemaType)
  );
}

function buildBreadcrumbNode(
  items: AeoBreadcrumbItem[],
  url: string
): JsonObject | null {
  const itemListElement = items
    .map((item, index) => {
      const name = toPlainText(item.name);
      if (!name) return null;
      return {
        "@type": "ListItem",
        position: index + 1,
        name,
        item: pageUrl(item.path),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item != null);

  if (itemListElement.length === 0) return null;
  return {
    "@type": "BreadcrumbList",
    "@id": `${url.replace(/#.*$/, "")}#breadcrumb`,
    itemListElement,
  };
}

/**
 * Enriches Yoast's graph with guaranteed site entities and validated CMS data.
 * Existing nodes win; missing required properties are filled without duplicates.
 */
export function buildDynamicAeoJsonLd({
  seo,
  path,
  faqs,
  breadcrumbs,
  article,
  pageTitle,
}: {
  seo: YoastSeo | null;
  path: string;
  faqs?: AeoFaqItem[] | null;
  breadcrumbs?: AeoBreadcrumbItem[] | null;
  article?: AeoArticle | null;
  pageTitle?: string | null;
}): string {
  const graph = normalizeGraph(getYoastJsonLdData(seo));
  const siteUrl = pageUrl("/");
  const url = pageUrl(path);
  const normalizedPageTitle = toPlainText(pageTitle);

  // Default Home → page trail when callers omit breadcrumbs (landings already pass their own).
  const resolvedBreadcrumbs: AeoBreadcrumbItem[] =
    breadcrumbs && breadcrumbs.length > 0
      ? breadcrumbs
      : path === "/" || path === ""
        ? [{ name: normalizedPageTitle || SEO_ORGANIZATION.name, path: "/" }]
        : [
            { name: "Home", path: "/" },
            {
              name: normalizedPageTitle || path.replace(/^\/|\/$/g, "") || "Page",
              path,
            },
          ];

  const defaultOrganizationId = `${siteUrl}#organization`;
  upsertNode(
    graph,
    {
      "@type": "Organization",
      "@id": defaultOrganizationId,
      name: SEO_ORGANIZATION.name,
      url: siteUrl,
      logo: {
        "@type": "ImageObject",
        "@id": `${siteUrl}#logo`,
        url: pageUrl(SEO_ORGANIZATION.logoPath),
        contentUrl: pageUrl(SEO_ORGANIZATION.logoPath),
        caption: SEO_ORGANIZATION.name,
      },
      sameAs: [...SEO_ORGANIZATION.sameAs],
    },
    ["Organization"]
  );
  const organizationNode = findNode(graph, "Organization");
  if (organizationNode) {
    const existingSameAs = Array.isArray(organizationNode.sameAs)
      ? organizationNode.sameAs.filter(
          (item): item is string => typeof item === "string" && Boolean(item.trim())
        )
      : [];
    organizationNode.sameAs = [
      ...new Set([...existingSameAs, ...SEO_ORGANIZATION.sameAs]),
    ];
  }
  const organizationId =
    (organizationNode?.["@id"] as string | undefined) || defaultOrganizationId;

  const defaultWebsiteId = `${siteUrl}#website`;
  upsertNode(
    graph,
    {
      "@type": "WebSite",
      "@id": defaultWebsiteId,
      url: siteUrl,
      name: SEO_ORGANIZATION.name,
      publisher: { "@id": organizationId },
    },
    ["WebSite"]
  );
  const websiteId =
    (findNode(graph, "WebSite")?.["@id"] as string | undefined) ||
    defaultWebsiteId;

  const webPageId = `${url.replace(/#.*$/, "")}#webpage`;
  const webPage: JsonObject = {
    "@type": "WebPage",
    "@id": webPageId,
    url,
    isPartOf: { "@id": websiteId },
  };
  if (resolvedBreadcrumbs.length) {
    webPage.breadcrumb = {
      "@id": `${url.replace(/#.*$/, "")}#breadcrumb`,
    };
  }
  if (normalizedPageTitle) webPage.name = normalizedPageTitle;
  upsertNode(
    graph,
    webPage,
    ["WebPage"],
    ["@id", "url", "isPartOf", "breadcrumb"]
  );

  const mainEntity = normalizeFaqs(faqs);
  if (mainEntity.length > 0) {
    upsertNode(
      graph,
      {
        "@type": "FAQPage",
        "@id": `${url.replace(/#.*$/, "")}#faq`,
        url,
        mainEntity,
      },
      ["FAQPage"],
      ["@id", "url", "mainEntity"]
    );
  }

  const breadcrumbNode = buildBreadcrumbNode(resolvedBreadcrumbs, url);
  if (breadcrumbNode) {
    upsertNode(
      graph,
      breadcrumbNode,
      ["BreadcrumbList"],
      ["@id", "itemListElement"]
    );
  }

  if (article) {
    const headline = toPlainText(article.headline);
    const authorName = toPlainText(article.authorName);
    const description = toPlainText(article.description);
    const tags = (article.tags ?? []).map(toPlainText).filter(Boolean);
    const sections = (article.sections ?? []).map(toPlainText).filter(Boolean);
    const articleNode: JsonObject = {
      "@type": "BlogPosting",
      "@id": `${url.replace(/#.*$/, "")}#article`,
      url,
      mainEntityOfPage: { "@id": webPageId },
      publisher: { "@id": organizationId },
    };

    if (headline) articleNode.headline = headline;
    if (description) articleNode.description = description;
    if (article.image?.trim()) {
      articleNode.image = replaceWordPressSiteUrl(
        article.image.trim(),
        getWordPressSiteUrl(),
        getFrontendSiteUrl()
      );
    }
    if (article.datePublished?.trim()) {
      articleNode.datePublished = article.datePublished.trim();
    }
    if (article.dateModified?.trim() || article.datePublished?.trim()) {
      articleNode.dateModified =
        article.dateModified?.trim() || article.datePublished?.trim();
    }
    if (authorName) {
      articleNode.author = {
        "@type": "Person",
        name: authorName,
        ...(article.authorUrl?.trim() ? { url: article.authorUrl.trim() } : {}),
      };
    }
    if (tags.length > 0) articleNode.keywords = tags;
    if (sections.length > 0) articleNode.articleSection = sections;

    upsertNode(
      graph,
      articleNode,
      ["Article", "BlogPosting", "NewsArticle"],
      ["@id", "url", "mainEntityOfPage"]
    );
  }

  return serializeJsonLd(graph);
}
