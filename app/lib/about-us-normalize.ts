/**
 * Normalizes About Us page ACF/GraphQL data for section components.
 * CMS-only — no static fallback content.
 * Testimonials / Client Logos can Use from Home or Custom (About Us toggle).
 */

import type { SliderCard } from "@/app/components/ui/HorizontalScrollSlider";
import type {
  AboutClientLogoNode,
  AboutContentSource,
  AboutPrincipleNode,
  AboutShowcaseCardNode,
  AboutTestimonialNode,
  AboutUsPageFields,
  AcfImageNode,
} from "@/app/lib/about-us-api";
import type { HomePageFields } from "@/app/lib/home-api";
import {
  normalizeHomeTestimonials,
  normalizeOurClients,
  type HomeClientLogo,
  type HomeTestimonialItem,
} from "@/app/lib/home-normalize";
import { resolveImageUrl } from "@/app/lib/wp-media-url";

function resolveMediaUrl(raw: AcfImageNode | unknown): string | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as {
    node?: { sourceUrl?: string | null; mediaItemUrl?: string | null };
    sourceUrl?: string | null;
    mediaItemUrl?: string | null;
  };
  return (
    resolveImageUrl(
      o.node?.sourceUrl ?? o.node?.mediaItemUrl ?? o.sourceUrl ?? o.mediaItemUrl ?? undefined
    ) ?? undefined
  );
}

function imageAlt(raw: AcfImageNode | unknown, fallback: string): string {
  if (!raw || typeof raw !== "object") return fallback;
  const alt = (raw as { node?: { altText?: string | null } }).node?.altText?.trim();
  return alt || fallback;
}

/** Default = from_home so Home content mirrors on About when unset. */
export function resolveAboutContentSource(
  value: AboutContentSource | string | null | undefined
): AboutContentSource {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
  return normalized === "custom" ? "custom" : "from_home";
}

export type AboutPrincipleItem = {
  title: string;
  description: string;
};

export type AboutUsNormalized = {
  hero: {
    title?: string;
    subtitle?: string;
    backgroundImage?: { src: string; alt: string };
  };
  story: {
    title?: string;
    lead?: string;
    body?: string;
  };
  vision: { title?: string; text?: string };
  mission: { title?: string; text?: string };
  showcase: {
    logoImageSrc?: string;
    cards: SliderCard[];
  };
  principles: {
    title?: string;
    items: AboutPrincipleItem[];
  };
  testimonials: HomeTestimonialItem[];
  clientLogos: HomeClientLogo[];
};

function mapShowcaseCards(raw: AboutShowcaseCardNode[] | null | undefined): SliderCard[] {
  const list = Array.isArray(raw) ? raw.filter(Boolean) : [];

  return list.map((c) => {
    const item = c as NonNullable<AboutShowcaseCardNode>;
    const imgUrl = resolveMediaUrl(item.image);
    const cardTypeValue = Array.isArray(item.cardType)
      ? item.cardType.find((value) => typeof value === "string" && value.trim())
      : item.cardType;
    const rawType = cardTypeValue?.trim().toLowerCase().replace(/[\s-]+/g, "_");
    const type: SliderCard["type"] =
      rawType?.includes("image") ? "image" : rawType?.includes("text") ? "text" : imgUrl ? "image" : "text";

    return {
      type,
      title: item.title?.trim() ?? "",
      subtitle: item.subtitle?.trim() || undefined,
      description: item.description?.trim() || undefined,
      image: imgUrl,
      backgroundColor: item.backgroundClass?.trim() || undefined,
      textColor: item.textColorClass?.trim() || undefined,
    };
  });
}

function mapPrinciples(raw: AboutPrincipleNode[] | null | undefined): AboutPrincipleItem[] {
  const list = Array.isArray(raw) ? raw.filter(Boolean) : [];
  return list
    .map((p) => {
      const title = p?.principleTitle?.trim() ?? "";
      const description = p?.principleDescription?.trim() ?? "";
      if (!title && !description) return null;
      return { title, description };
    })
    .filter((item): item is AboutPrincipleItem => item != null);
}

function mapTestimonials(
  raw: AboutTestimonialNode[] | null | undefined
): HomeTestimonialItem[] {
  const list = Array.isArray(raw) ? raw.filter(Boolean) : [];
  return list
    .map((item): HomeTestimonialItem | null => {
      const quote = item?.testimonialQuote?.trim();
      const author = item?.testimonialAuthor?.trim();
      const image = resolveMediaUrl(item?.testimonialImage);
      if (!quote || !author || !image?.trim()) return null;

      const entry: HomeTestimonialItem = {
        image,
        imageAlt: imageAlt(item?.testimonialImage, `${author} testimonial photo`),
        quote,
        author,
        role: item?.testimonialRole?.trim() || "",
        companyEm: Boolean(item?.highlightCompany),
      };
      const company = item?.testimonialCompany?.trim();
      if (company) entry.company = company;
      return entry;
    })
    .filter((item): item is HomeTestimonialItem => item != null);
}

function mapClientLogos(raw: AboutClientLogoNode[] | null | undefined): HomeClientLogo[] {
  const list = Array.isArray(raw) ? raw.filter(Boolean) : [];
  return list
    .map((item): HomeClientLogo | null => {
      const src = resolveMediaUrl(item?.logoImage);
      if (!src?.trim()) return null;
      return {
        src,
        alt: item?.logoName?.trim() || imageAlt(item?.logoImage, "Client logo"),
      };
    })
    .filter((item): item is HomeClientLogo => item != null);
}

export function normalizeAboutUsPage(
  fields: AboutUsPageFields | null,
  homeFields: HomePageFields | null = null
): AboutUsNormalized {
  const heroBgSrc = resolveMediaUrl(fields?.aboutHeroBackgroundImage)?.trim();
  const logoSrc = resolveMediaUrl(fields?.aboutShowcaseLogoImage)?.trim();

  const testimonialsSource = resolveAboutContentSource(fields?.aboutTestimonialsSource);
  const clientLogosSource = resolveAboutContentSource(fields?.aboutClientLogosSource);

  const testimonials =
    testimonialsSource === "from_home"
      ? normalizeHomeTestimonials(homeFields).testimonials
      : mapTestimonials(fields?.aboutTestimonials);

  const clientLogos =
    clientLogosSource === "from_home"
      ? normalizeOurClients(homeFields).logos
      : mapClientLogos(fields?.aboutClientLogos);

  return {
    hero: {
      title: fields?.aboutHeroTitle?.trim() || undefined,
      subtitle: fields?.aboutHeroSubtitle?.trim() || undefined,
      backgroundImage: heroBgSrc
        ? {
            src: heroBgSrc,
            alt: imageAlt(fields?.aboutHeroBackgroundImage, "About Us"),
          }
        : undefined,
    },
    story: {
      title: fields?.aboutStoryTitle?.trim() || undefined,
      lead: fields?.aboutStoryLead?.trim() || undefined,
      body: fields?.aboutStoryBody?.trim() || undefined,
    },
    vision: {
      title: fields?.aboutVisionTitle?.trim() || undefined,
      text: fields?.aboutVisionText?.trim() || undefined,
    },
    mission: {
      title: fields?.aboutMissionTitle?.trim() || undefined,
      text: fields?.aboutMissionText?.trim() || undefined,
    },
    showcase: {
      logoImageSrc: logoSrc || undefined,
      cards: mapShowcaseCards(fields?.aboutShowcaseCards),
    },
    principles: {
      title: fields?.aboutPrinciplesTitle?.trim() || undefined,
      items: mapPrinciples(fields?.aboutPrinciples),
    },
    testimonials,
    clientLogos,
  };
}
