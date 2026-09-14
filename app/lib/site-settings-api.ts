import { cache } from "react";
import { resolveImageUrl, toProxiedWordPressUploadUrl } from "@/app/lib/our-work-api";
import {
  getWordPressGraphqlEndpoint,
  WORDPRESS_REVALIDATE_SECONDS,
} from "@/app/lib/wordpress-graphql";

const SITE_SETTINGS_FIELDS_FRAGMENT = `
  headerLogo {
    node {
      sourceUrl
      mediaItemUrl
      altText
    }
  }
  headerLogoUrl
  headerCtaText
  headerCtaLink
  headerMenuItems {
    label
    link
    submenuItems {
      label
      link
    }
  }
  headerOfficeLocations {
    city
    addressLines {
      text
    }
    email
    phone
  }
  footerCtaHeading
  footerCtaParagraph
  footerCtaButtonText
  footerCtaButtonLink
  footerCtaBackgroundImage {
    node {
      sourceUrl
      mediaItemUrl
      altText
    }
  }
  footerCtaBackgroundOverlayColor
  footerCtaBackgroundOverlayOpacity
  footerNavigationLinks {
    label
    link
  }
  footerServiceLinks {
    label
    link
  }
  footerAddressLines {
    text
  }
  footerPhone
  footerCopyrightLineOne
  footerCopyrightLineTwo
  footerPrivacyLabel
  footerPrivacyLink
  footerTermsLabel
  footerTermsLink
`;

const GET_FOOTER_SOCIAL_LINKS_NESTED = `
  query GetFooterSocialLinks {
    headerFooterSettings {
      headerFooterFields {
        footerSocialLinks {
          label
          link
          icon {
            node {
              ... on MediaItem {
                sourceUrl
                mediaItemUrl
                altText
              }
            }
          }
          iconUrl
        }
      }
    }
  }
`;

const GET_FOOTER_SOCIAL_LINKS_FLAT = `
  query GetFooterSocialLinksFlat {
    headerFooterSettings {
      footerSocialLinks {
        label
        link
        icon {
          node {
            ... on MediaItem {
              sourceUrl
              mediaItemUrl
              altText
            }
          }
        }
        iconUrl
      }
    }
  }
`;

const GET_SITE_SETTINGS_NESTED = `
  query GetSiteSettings {
    headerFooterSettings {
      headerFooterFields {
        ${SITE_SETTINGS_FIELDS_FRAGMENT}
      }
    }
  }
`;

const GET_SITE_SETTINGS_FLAT = `
  query GetSiteSettingsFlat {
    headerFooterSettings {
      ${SITE_SETTINGS_FIELDS_FRAGMENT}
    }
  }
`;

type SiteSettingsResponse = {
  data?: {
    headerFooterSettings?:
      | SiteSettingsFields
      | {
          headerFooterFields?: SiteSettingsFields | null;
        }
      | null;
  } | null;
  errors?: Array<{ message?: string }> | null;
};

type SiteSettingsFields = {
  headerLogo?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
  /** Full URL (or site-relative path) to logo; takes precedence over uploaded headerLogo. */
  headerLogoUrl?: string | null;
  headerCtaText?: string | null;
  headerCtaLink?: string | null;
  headerMenuItems?: Array<{
    label?: string | null;
    link?: string | null;
    submenuItems?: Array<{
      label?: string | null;
      link?: string | null;
    } | null> | null;
  } | null> | null;
  headerOfficeLocations?: Array<{
    city?: string | null;
    addressLines?: Array<{
      text?: string | null;
    } | null> | null;
    email?: string | null;
    phone?: string | null;
  } | null> | null;
  footerCtaHeading?: string | null;
  footerCtaParagraph?: string | null;
  footerCtaButtonText?: string | null;
  footerCtaButtonLink?: string | null;
  footerCtaBackgroundImage?: {
    node?: {
      sourceUrl?: string | null;
      mediaItemUrl?: string | null;
      altText?: string | null;
    } | null;
  } | null;
  footerCtaBackgroundOverlayColor?: string | null;
  footerCtaBackgroundOverlayOpacity?: number | string | null;
  footerNavigationLinks?: Array<{
    label?: string | null;
    link?: string | null;
  } | null> | null;
  footerServiceLinks?: Array<{
    label?: string | null;
    link?: string | null;
  } | null> | null;
  footerAddressLines?: Array<{
    text?: string | null;
  } | null> | null;
  footerPhone?: string | null;
  footerSocialLinks?: Array<{
    label?: string | null;
    link?: string | null;
    icon?: {
      node?: {
        sourceUrl?: string | null;
        mediaItemUrl?: string | null;
        altText?: string | null;
      } | null;
    } | null;
    iconUrl?: string | null;
  } | null> | null;
  footerCopyrightLineOne?: string | null;
  footerCopyrightLineTwo?: string | null;
  footerPrivacyLabel?: string | null;
  footerPrivacyLink?: string | null;
  footerTermsLabel?: string | null;
  footerTermsLink?: string | null;
};

export type MenuLinkItem = {
  label: string;
  href: string;
};

export type HeaderMenuItem = MenuLinkItem & {
  submenu?: MenuLinkItem[];
};

export type OfficeLocationItem = {
  city: string;
  address: string[];
  email: string;
  phone: string;
};

export type HeaderSettings = {
  logoSrc?: string;
  logoAlt?: string;
  ctaText?: string;
  ctaLink?: string;
  menuItems?: HeaderMenuItem[];
  officeLocations?: OfficeLocationItem[];
};

export type FooterSocialLink = {
  label: string;
  href: string;
  iconSrc: string;
  iconAlt: string;
};

export type FooterSettings = {
  ctaHeading?: string;
  ctaParagraph?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
  /** Footer CTA section background from CMS only; empty = none. */
  ctaBackgroundImageSrc?: string;
  ctaBackgroundImageAlt?: string;
  /** Computed rgba() for tint over footer CTA background; empty = none. */
  ctaBackgroundOverlayRgba?: string;
  navigationLinks?: MenuLinkItem[];
  serviceLinks?: MenuLinkItem[];
  addressLines?: string[];
  phone?: string;
  socialLinks?: FooterSocialLink[];
  copyrightLineOne?: string;
  copyrightLineTwo?: string;
  privacyLabel?: string;
  privacyLink?: string;
  termsLabel?: string;
  termsLink?: string;
};

export type SiteSettings = {
  header: HeaderSettings;
  footer: FooterSettings;
};

/** Empty shell when GraphQL fails or fields are missing — no hardcoded nav or copy. */
export function createEmptySiteSettings(): SiteSettings {
  return {
    header: {
      logoSrc: "",
      logoAlt: "",
      ctaText: "",
      ctaLink: "",
      menuItems: [],
      officeLocations: [],
    },
    footer: {
      ctaHeading: "",
      ctaParagraph: "",
      ctaButtonText: "",
      ctaButtonLink: "",
      ctaBackgroundImageSrc: "",
      ctaBackgroundImageAlt: "",
      ctaBackgroundOverlayRgba: "",
      navigationLinks: [],
      serviceLinks: [],
      addressLines: [],
      phone: "",
      socialLinks: [],
      copyrightLineOne: "",
      copyrightLineTwo: "",
      privacyLabel: "",
      privacyLink: "",
      termsLabel: "",
      termsLink: "",
    },
  };
}

function trimOrUndefined(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

/** Parse #RGB or #RRGGBB from ACF color picker. */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const h = hex.replace(/^#/, "").trim();
  if (h.length === 3 && /^[\da-fA-F]{3}$/.test(h)) {
    return {
      r: parseInt(h[0] + h[0], 16),
      g: parseInt(h[1] + h[1], 16),
      b: parseInt(h[2] + h[2], 16),
    };
  }
  if (h.length === 6 && /^[\da-fA-F]{6}$/.test(h)) {
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }
  return null;
}

/** Overlay only when CMS provides a valid hex color and numeric opacity 0–100. */
function buildCmsOverlayRgba(
  color: string | null | undefined,
  opacityRaw: number | string | null | undefined
): string | undefined {
  const trimmed = color?.trim();
  if (!trimmed) return undefined;
  const opacityNum = opacityRaw == null || opacityRaw === "" ? NaN : Number(opacityRaw);
  if (!Number.isFinite(opacityNum)) return undefined;
  const rgb = hexToRgb(trimmed);
  if (!rgb) return undefined;
  const pct = Math.min(100, Math.max(0, opacityNum));
  if (pct <= 0) return undefined;
  const a = pct / 100;
  return `rgba(${rgb.r},${rgb.g},${rgb.b},${a})`;
}

function toLinkItems(
  list: Array<{ label?: string | null; link?: string | null } | null> | null | undefined
): MenuLinkItem[] {
  return (list ?? [])
    .filter(Boolean)
    .map((item) => ({
      label: item?.label?.trim() || "",
      href: item?.link?.trim() || "",
    }))
    .filter((item) => item.label);
}

function resolveFooterSocialIcon(
  image:
    | {
        node?: {
          sourceUrl?: string | null;
          mediaItemUrl?: string | null;
          altText?: string | null;
        } | null;
      }
    | null
    | undefined,
  iconUrl: string | null | undefined,
  fallbackAlt: string
): { src: string; alt: string } {
  const fromUrl = iconUrl?.trim()
    ? toProxiedWordPressUploadUrl(resolveImageUrl(iconUrl) ?? iconUrl.trim()) ??
      resolveImageUrl(iconUrl) ??
      iconUrl.trim()
    : "";
  const fromUpload =
    toProxiedWordPressUploadUrl(
      resolveImageUrl(image?.node?.mediaItemUrl ?? image?.node?.sourceUrl ?? undefined)
    ) ??
    resolveImageUrl(image?.node?.mediaItemUrl ?? image?.node?.sourceUrl ?? undefined) ??
    "";
  const src = fromUrl || fromUpload;
  const alt = trimOrUndefined(image?.node?.altText) ?? (src ? fallbackAlt : "");
  return { src, alt };
}

function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}

function normalizeFooterSocialLinks(
  list: SiteSettingsFields["footerSocialLinks"]
): FooterSocialLink[] {
  return (list ?? [])
    .filter(Boolean)
    .map((item) => {
      const label = item?.label?.trim() || "Social link";
      const href = item?.link?.trim() || "";
      const icon = resolveFooterSocialIcon(item?.icon, item?.iconUrl, label);
      return {
        label,
        href,
        iconSrc: icon.src,
        iconAlt: icon.alt || label,
      };
    })
    .filter((item) => isHttpUrl(item.href) && item.iconSrc);
}

function extractHeaderFooterFields(
  raw: SiteSettingsResponse["data"]
): SiteSettingsFields | null {
  const settings = raw?.headerFooterSettings;
  if (!settings) return null;
  if ("headerFooterFields" in settings) {
    return settings.headerFooterFields ?? null;
  }
  return settings as SiteSettingsFields;
}

async function fetchFooterSocialLinks(): Promise<FooterSocialLink[]> {
  for (const query of [GET_FOOTER_SOCIAL_LINKS_NESTED, GET_FOOTER_SOCIAL_LINKS_FLAT]) {
    try {
      const res = await fetch(getWordPressGraphqlEndpoint(), {
        method: "POST",
        next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const json = (await res.json()) as SiteSettingsResponse;
      if (json.errors?.length) continue;
      const fields = extractHeaderFooterFields(json.data);
      if (fields) return normalizeFooterSocialLinks(fields.footerSocialLinks);
    } catch {
      // optional CMS repeater — footer shows no social icons until imported
    }
  }

  return [];
}

function normalizeSettings(fields: SiteSettingsFields | null | undefined): SiteSettings {
  const headerMenuItems: HeaderMenuItem[] = (fields?.headerMenuItems ?? [])
    .filter(Boolean)
    .map((item) => {
      const submenu = toLinkItems(item?.submenuItems);
      return {
        label: item?.label?.trim() || "",
        href: item?.link?.trim() || "",
        submenu: submenu.length > 0 ? submenu : undefined,
      };
    })
    .filter((item) => item.label);

  const headerOfficeLocations: OfficeLocationItem[] = (fields?.headerOfficeLocations ?? [])
    .filter(Boolean)
    .map((item) => ({
      city: item?.city?.trim() || "",
      address: (item?.addressLines ?? [])
        .filter(Boolean)
        .map((line) => line?.text?.trim() || "")
        .filter(Boolean),
      email: item?.email?.trim() || "",
      phone: item?.phone?.trim() || "",
    }))
    .filter((item) => item.city || item.address.length > 0 || item.email || item.phone);

  const addressLines = (fields?.footerAddressLines ?? [])
    .filter(Boolean)
    .map((item) => item?.text?.trim() || "")
    .filter(Boolean);

  const logoUrlField = fields?.headerLogoUrl?.trim() ?? "";
  const logoFromUrl = logoUrlField
    ? resolveImageUrl(logoUrlField) ?? logoUrlField
    : "";
  const logoFromUpload =
    resolveImageUrl(
      fields?.headerLogo?.node?.sourceUrl ?? fields?.headerLogo?.node?.mediaItemUrl ?? undefined
    ) ?? "";
  const logoSrc = logoFromUrl || logoFromUpload;
  const imageAlt = trimOrUndefined(fields?.headerLogo?.node?.altText);
  const logoAlt = imageAlt ?? (logoSrc ? "Logo" : "");

  const footerBgResolved =
    resolveImageUrl(
      fields?.footerCtaBackgroundImage?.node?.sourceUrl ??
        fields?.footerCtaBackgroundImage?.node?.mediaItemUrl ??
        undefined
    ) ?? "";
  const footerBgAlt =
    trimOrUndefined(fields?.footerCtaBackgroundImage?.node?.altText) ??
    (footerBgResolved ? "Footer background" : "");
  const footerCtaOverlayRgba = buildCmsOverlayRgba(
    fields?.footerCtaBackgroundOverlayColor,
    fields?.footerCtaBackgroundOverlayOpacity
  );

  return {
    header: {
      logoSrc,
      logoAlt,
      ctaText: trimOrUndefined(fields?.headerCtaText) ?? "",
      ctaLink: trimOrUndefined(fields?.headerCtaLink) ?? "",
      menuItems: headerMenuItems,
      officeLocations: headerOfficeLocations,
    },
    footer: {
      ctaHeading: trimOrUndefined(fields?.footerCtaHeading) ?? "",
      ctaParagraph: trimOrUndefined(fields?.footerCtaParagraph) ?? "",
      ctaButtonText: trimOrUndefined(fields?.footerCtaButtonText) ?? "",
      ctaButtonLink: trimOrUndefined(fields?.footerCtaButtonLink) ?? "",
      ctaBackgroundImageSrc: footerBgResolved,
      ctaBackgroundImageAlt: footerBgAlt,
      ctaBackgroundOverlayRgba: footerCtaOverlayRgba ?? "",
      navigationLinks: toLinkItems(fields?.footerNavigationLinks),
      serviceLinks: toLinkItems(fields?.footerServiceLinks),
      addressLines,
      phone: trimOrUndefined(fields?.footerPhone) ?? "",
      socialLinks: [],
      copyrightLineOne: trimOrUndefined(fields?.footerCopyrightLineOne) ?? "",
      copyrightLineTwo: trimOrUndefined(fields?.footerCopyrightLineTwo) ?? "",
      privacyLabel: trimOrUndefined(fields?.footerPrivacyLabel) ?? "",
      privacyLink: trimOrUndefined(fields?.footerPrivacyLink) ?? "",
      termsLabel: trimOrUndefined(fields?.footerTermsLabel) ?? "",
      termsLink: trimOrUndefined(fields?.footerTermsLink) ?? "",
    },
  };
}

export const fetchSiteSettings = cache(async (): Promise<SiteSettings> => {
  const empty = createEmptySiteSettings();
  const socialLinks = await fetchFooterSocialLinks();

  const withSocialLinks = (settings: SiteSettings): SiteSettings => ({
    ...settings,
    footer: {
      ...settings.footer,
      socialLinks,
    },
  });

  try {
    const nestedRes = await fetch(getWordPressGraphqlEndpoint(), {
      method: "POST",
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: GET_SITE_SETTINGS_NESTED }),
    });
    const nestedJson = (await nestedRes.json()) as SiteSettingsResponse;
    const nestedFields =
      nestedJson.data?.headerFooterSettings &&
      "headerFooterFields" in nestedJson.data.headerFooterSettings
        ? nestedJson.data.headerFooterSettings.headerFooterFields
        : null;

    if (!nestedJson.errors?.length && nestedFields) {
      return withSocialLinks(normalizeSettings(nestedFields));
    }

    const flatRes = await fetch(getWordPressGraphqlEndpoint(), {
      method: "POST",
      next: { revalidate: WORDPRESS_REVALIDATE_SECONDS },
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: GET_SITE_SETTINGS_FLAT }),
    });
    const flatJson = (await flatRes.json()) as SiteSettingsResponse;
    const flatRaw = flatJson.data?.headerFooterSettings;
    const flatFields =
      flatRaw && !("headerFooterFields" in flatRaw)
        ? (flatRaw as SiteSettingsFields)
        : null;

    if (!flatJson.errors?.length && flatFields) {
      return withSocialLinks(normalizeSettings(flatFields));
    }

    return withSocialLinks(empty);
  } catch {
    return withSocialLinks(empty);
  }
});
