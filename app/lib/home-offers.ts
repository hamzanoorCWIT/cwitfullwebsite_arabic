import {
  fetchHomePage,
  getHomePageFields,
  type HomeOfferCardConfig,
  type HomePageFields,
  type HomeServiceOfferCardConfig,
} from "@/app/lib/home-api";
import type {
  HomeOfferCard,
  HomeOffersData,
  OfferModalContent,
} from "@/app/lib/home-offers-types";
import {
  applyStudioServiceCardLayoutPresets,
  buildStudioServiceCards,
  fetchStudioPage,
  getStudioPageFields,
  type StudioPageFields,
} from "@/app/lib/studio-api";
import { STUDIO_SERVICE_CARD_LAYOUT_PRESETS } from "@/app/lib/studio-service-card-layout-presets";
import {
  fetchServicesPage,
  getServicesPageFields,
} from "@/app/lib/services-api";
import { normalizeServicesPage } from "@/app/lib/services-normalize";
import type { ServicesStudioSection } from "@/app/lib/services-defaults";
import { resolveImageUrl } from "@/app/lib/our-work-api";
import type { StudioServiceCard } from "@/app/components/sections/StudioServiceCards";
import type { ShowcaseCard } from "@/app/components/sections/ServicesShowcase";
import { DEFAULT_LOCALE, type AppLocale } from "@/app/lib/locale";
import { resolvePageIdForLocale } from "@/app/lib/wpml-page";
import {
  localizeHomeOfferCard,
  localizeOfferCta,
} from "@/app/lib/home-offers-copy";

type StudioKey = "digital" | "application" | "growth" | "ai";

const STUDIO_PAGE_IDS: Record<StudioKey, number> = {
  digital: 734,
  application: 736,
  growth: 738,
  ai: 4627,
};

function pickValue(value: string | string[] | null | undefined): string {
  if (Array.isArray(value)) {
    return value.find((item) => item?.trim())?.trim() || "";
  }
  return value?.trim() || "";
}

function parseServiceSelection(
  value: string | string[] | null | undefined
): { studio: StudioKey; index: number } | null {
  const [studio, rawIndex] = pickValue(value).split(":");
  const index = Number(rawIndex);
  if (!(studio in STUDIO_PAGE_IDS) || !Number.isInteger(index) || index < 0) {
    return null;
  }
  return { studio: studio as StudioKey, index };
}

function mediaUrl(
  media:
    | {
        node?: {
          sourceUrl?: string | null;
          mediaItemUrl?: string | null;
        } | null;
      }
    | null
    | undefined
): string | undefined {
  return (
    resolveImageUrl(
      media?.node?.sourceUrl ?? media?.node?.mediaItemUrl ?? undefined
    ) ?? undefined
  );
}

function stringMedia(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function modalCard(card: StudioServiceCard): StudioServiceCard {
  const content = { ...card };
  delete content.yearLabel;
  delete content.industryLabel;
  return content;
}

function serviceModalContent(card: StudioServiceCard): OfferModalContent {
  const detailCard = modalCard(card);
  return {
    bannerTitle: detailCard.title,
    bannerDescription: detailCard.description || "",
    backgroundImage:
      typeof detailCard.backgroundImage === "string"
        ? detailCard.backgroundImage
        : undefined,
    detailCards: [detailCard],
  };
}

function resolveServiceCard(
  studioKey: StudioKey,
  servicesCard: ShowcaseCard,
  servicesCardIndex: number,
  kind: string,
  mini: boolean,
  studios: Partial<Record<StudioKey, StudioPageFields | null>>,
): HomeOfferCard | null {
  const title = servicesCard.title?.trim() || "";
  if (!title) return null;

  const fields = studios[studioKey];
  const cards = applyStudioServiceCardLayoutPresets(
    buildStudioServiceCards(fields ?? null),
    STUDIO_SERVICE_CARD_LAYOUT_PRESETS[studioKey]
  );
  const normalizedTitle = title.toLowerCase();
  const detailCard =
    cards.find((card) => card.title.trim().toLowerCase() === normalizedTitle) ??
    cards[servicesCardIndex];

  return {
    kind,
    title,
    description: servicesCard.description?.trim() || detailCard?.description || "",
    art: stringMedia(servicesCard.image) || stringMedia(detailCard?.image),
    background:
      stringMedia(servicesCard.backgroundImage) ||
      stringMedia(detailCard?.backgroundImage),
    mini,
    ...(detailCard ? { modalContent: serviceModalContent(detailCard) } : {}),
  };
}

function buildSelectedServiceColumns(
  columns: NonNullable<HomePageFields["homeServiceOfferColumns"]>,
  studios: Partial<Record<StudioKey, StudioPageFields | null>>,
  servicesStudios: ServicesStudioSection[]
): HomeOfferCard[][] {
  return columns
    .filter(Boolean)
    .map((column) =>
      (column?.offerCards ?? [])
        .filter(
          (config): config is HomeServiceOfferCardConfig => config != null
        )
        .map((config) => {
          const selection = parseServiceSelection(config.serviceCard);
          if (!selection) return null;
          const servicesStudio = servicesStudios.find(
            (studio) => studio.studioKey === selection.studio
          );
          const servicesCard = servicesStudio?.cards[selection.index];
          if (!servicesCard) return null;
          return resolveServiceCard(
            selection.studio,
            servicesCard,
            selection.index,
            pickValue(config.cardKind) || "web",
            Boolean(config.isMini),
            studios
          );
        })
        .filter((card): card is HomeOfferCard => card != null)
    )
    .filter((column) => column.length > 0);
}

function resolveCustomCard(config: HomeOfferCardConfig): HomeOfferCard | null {
  const title = config.customTitle?.trim() || "";
  if (!title) return null;

  const description = config.customDescription?.trim() || "";
  const art = mediaUrl(config.customArt);
  const background = mediaUrl(config.customBackground);
  const popupEnabled = Boolean(config.customPopupEnabled);

  let modalContent: OfferModalContent | undefined;
  if (popupEnabled) {
    const popupTitle = config.popupTitle?.trim() || title;
    const popupDescription = config.popupDescription?.trim() || description;
    const popupImage = mediaUrl(config.popupImage);
    const popupBackground = mediaUrl(config.popupBackground);
    const imagePosition = pickValue(config.popupImagePosition);
    const detailCard: StudioServiceCard = {
      title: popupTitle,
      description: popupDescription,
      ...(config.popupCtaText?.trim()
        ? { ctaText: config.popupCtaText.trim() }
        : {}),
      ...(config.popupCtaLink?.trim()
        ? { ctaLink: config.popupCtaLink.trim() }
        : {}),
      ...(popupImage ? { image: popupImage } : {}),
      ...(popupBackground ? { backgroundImage: popupBackground } : {}),
      ...(imagePosition === "left" || imagePosition === "right"
        ? { imagePosition }
        : {}),
    };
    modalContent = {
      bannerTitle: popupTitle,
      bannerDescription: popupDescription,
      backgroundImage: popupBackground,
      detailCards: [detailCard],
    };
  }

  return {
    kind: pickValue(config.cardKind) || "web",
    title,
    description,
    art,
    background,
    mini: Boolean(config.isMini),
    modalContent,
  };
}

export async function resolveHomeOffers(
  fields: HomePageFields | null,
  locale: AppLocale = DEFAULT_LOCALE
): Promise<HomeOffersData> {
  const source = pickValue(fields?.homeOffersSource) || "service";
  let rawColumns = fields?.homeOfferColumns?.filter(Boolean) ?? [];
  let serviceColumns =
    fields?.homeServiceOfferColumns?.filter(Boolean) ?? [];

  if (
    locale !== "en" &&
    ((source === "service" && serviceColumns.length === 0) ||
      (source === "custom" && rawColumns.length === 0))
  ) {
    try {
      const enHome = await fetchHomePage("en");
      const enFields = enHome.data ? getHomePageFields(enHome.data) : null;
      if (source === "custom" && rawColumns.length === 0) {
        rawColumns = enFields?.homeOfferColumns?.filter(Boolean) ?? [];
      }
      if (source === "service" && serviceColumns.length === 0) {
        serviceColumns =
          enFields?.homeServiceOfferColumns?.filter(Boolean) ?? [];
      }
    } catch (error) {
      console.error("[home-offers] Failed to inherit EN offer selections:", error);
    }
  }
  const studios: Partial<Record<StudioKey, StudioPageFields | null>> = {};
  let servicesStudios: ServicesStudioSection[] = [];

  if (source === "service") {
    const requestedStudios = new Set<StudioKey>();
    for (const column of serviceColumns) {
      for (const config of column?.offerCards ?? []) {
        const selection = parseServiceSelection(config?.serviceCard);
        if (selection) requestedStudios.add(selection.studio);
      }
    }

    const requests: Promise<void>[] = [...requestedStudios].map(async (studioKey) => {
      try {
        const pageId = await resolvePageIdForLocale(
          String(STUDIO_PAGE_IDS[studioKey]),
          locale
        );
        const response = await fetchStudioPage(pageId, locale);
        studios[studioKey] = getStudioPageFields(response.data);
      } catch (error) {
        console.error(
          `[home-offers] Failed to fetch ${studioKey} service cards:`,
          error
        );
        studios[studioKey] = null;
      }
    });
    requests.push(
      (async () => {
        try {
          const response = await fetchServicesPage(locale);
          const fields = getServicesPageFields(response);
          servicesStudios = normalizeServicesPage(fields).studios;
        } catch (error) {
          console.error(
            "[home-offers] Failed to fetch Services card summaries:",
            error
          );
          servicesStudios = [];
        }
      })()
    );
    await Promise.all(requests);

    if (servicesStudios.length === 0 && locale !== "en") {
      try {
        const response = await fetchServicesPage("en");
        servicesStudios = normalizeServicesPage(
          getServicesPageFields(response)
        ).studios;
      } catch (error) {
        console.error(
          "[home-offers] Failed to fetch EN Services card summaries:",
          error
        );
      }
    }
  }

  const columns =
    source === "custom"
      ? rawColumns
          .map((column) =>
            (column?.offerCards ?? [])
              .filter(Boolean)
              .map((config) => resolveCustomCard(config!))
              .filter((card): card is HomeOfferCard => card != null)
          )
          .filter((column) => column.length > 0)
      : buildSelectedServiceColumns(
          serviceColumns,
          studios,
          servicesStudios
        );

  return {
    heading: fields?.homeOffersHeading?.trim() || "",
    description: fields?.homeOffersDescription?.trim() || "",
    ctaText: localizeOfferCta(locale, fields?.homeOffersCtaText?.trim() || "") || "",
    ctaLink: fields?.homeOffersCtaLink?.trim() || "",
    columns: columns.map((column) =>
      column.map((card) => localizeHomeOfferCard(locale, card))
    ),
  };
}
