/**
 * Design layout presets for Services page showcase cards.
 * CMS supplies content/images; these fill placement when ACF has no layout fields.
 * Order per studioKey must match the Service Cards repeater order in WP.
 */

import type { ShowcaseCard } from "@/app/components/sections/ServicesShowcase";
import type { ServicesStudioKey } from "@/app/lib/services-defaults";

export type ServicesCardLayoutPreset = Partial<
  Pick<
    ShowcaseCard,
    | "descriptionMaxWidth"
    | "imageHeight"
    | "imageWidth"
    | "imageFit"
    | "imagePosition"
    | "imageClassName"
    | "imageOverflow"
    | "contentPosition"
    | "contentClassName"
    | "gradient"
    | "borderColor"
    | "boxShadow"
    | "tall"
  >
>;

export const SERVICES_CARD_LAYOUT_PRESETS: Record<
  ServicesStudioKey,
  ServicesCardLayoutPreset[]
> = {
  digital: [
    {
      imageFit: "contain",
      imagePosition: "bottom-right",
      imageClassName:
        "max-lg:!h-[50%] max-lg:!w-full " +
        "lg:max-[1200px]:!h-[68%] lg:max-[1200px]:!w-[75%] " +
        "min-[1201px]:max-[1480px]:!h-[72%] min-[1201px]:max-[1480px]:!w-[78%] " +
        "min-[1481px]:!h-[74%] min-[1481px]:!w-[82%]",
      tall: true,
    },
    {
      imageFit: "contain",
      imagePosition: "left",
      imageClassName:
        "max-lg:!h-[50%] max-lg:!w-full " +
        "lg:max-[1200px]:!h-[52%] lg:max-[1200px]:!w-[70%] " +
        "min-[1201px]:max-[1480px]:!h-[60%] min-[1201px]:max-[1480px]:!w-[74%] " +
        "min-[1481px]:!h-[290px] min-[1481px]:!w-[68%]",
      contentPosition: "center-right",
      contentClassName:
        "lg:max-[1200px]:!w-[54%] lg:max-[1200px]:!items-start lg:max-[1200px]:!text-left lg:max-[1200px]:!z-20 " +
        "min-[1201px]:max-[1480px]:!w-[52%] min-[1201px]:max-[1480px]:!items-start min-[1201px]:max-[1480px]:!text-left min-[1201px]:max-[1480px]:!z-20",
    },
    {
      imageHeight: 259.83,
      imageFit: "contain",
      imagePosition: "top-left",
      contentPosition: "center-right",
      contentClassName: "lg:w-[60%] lg:translate-x-4",
      gradient: "linear-gradient(270deg, #BF2378 0%, #D4579B 100%)",
    },
    {
      imageFit: "contain",
      imagePosition: "center",
      imageClassName:
        "max-lg:!w-full max-lg:!bottom-0 max-lg:!top-auto max-lg:!translate-x-0 max-lg:!translate-y-0 [&_img]:max-lg:object-contain " +
        "max-md:!h-[52%] md:max-lg:!h-[58%] " +
        "lg:max-[1200px]:!h-[58%] lg:max-[1200px]:!w-[88%] " +
        "min-[1201px]:max-[1480px]:!h-[62%] min-[1201px]:max-[1480px]:!w-[92%] " +
        "min-[1481px]:!h-[62%] min-[1481px]:!w-[95%]",
      tall: true,
    },
  ],
  application: [
    {
      imageFit: "contain",
      imagePosition: "top",
      imageClassName:
        "max-lg:!h-[50%] max-lg:!w-full " +
        "lg:max-[1200px]:!h-[40%] lg:max-[1200px]:!w-[90%] " +
        "min-[1201px]:max-[1480px]:!h-[46%] min-[1201px]:max-[1480px]:!w-[86%] " +
        "min-[1481px]:!h-[58%] min-[1481px]:!w-[84%] min-[1481px]:!max-w-[84%]",
      contentPosition: "bottom-left",
      tall: true,
    },
    {
      imageFit: "contain",
      imagePosition: "bottom",
      tall: true,
    },
    {
      imageFit: "contain",
      imagePosition: "top-left",
      imageClassName:
        "max-lg:!top-0 max-lg:!bottom-auto max-lg:!left-0 max-lg:!right-auto max-lg:!translate-x-0 max-lg:!translate-y-0 [&_img]:max-lg:object-left-top " +
        "max-md:!h-[50%] max-md:!w-[55%] " +
        "md:max-lg:!h-[55%] md:max-lg:!w-[50%] " +
        "lg:!top-0 lg:!bottom-auto lg:!left-0 lg:!right-auto lg:!translate-x-0 lg:!translate-y-0 [&_img]:lg:object-left-top " +
        "lg:max-[1200px]:!h-[52%] lg:max-[1200px]:!w-[70%] " +
        "min-[1201px]:max-[1480px]:!h-[60%] min-[1201px]:max-[1480px]:!w-[74%] " +
        "min-[1481px]:!h-[256px] min-[1481px]:!w-[68%] min-[1481px]:!max-w-[308px]",
      contentPosition: "center-right",
      contentClassName:
        "max-md:!absolute max-md:!left-6 max-md:!right-6 max-md:!bottom-6 max-md:!top-auto max-md:!flex max-md:!w-full max-md:!max-w-full max-md:!flex-col max-md:!items-start max-md:!justify-end max-md:!text-left max-md:!inset-auto max-md:!translate-x-0 max-md:!z-20 " +
        "md:max-lg:!absolute md:max-lg:!left-1/2 md:max-lg:!right-6 md:max-lg:!inset-y-0 md:max-lg:!flex md:max-lg:!w-auto md:max-lg:!max-w-[calc(50%-1.5rem)] md:max-lg:!flex-col md:max-lg:!items-start md:max-lg:!justify-center md:max-lg:!text-left md:max-lg:!translate-x-0 md:max-lg:!translate-y-0 md:max-lg:!inset-auto md:max-lg:!z-20 " +
        "lg:max-[1200px]:!w-[54%] lg:max-[1200px]:!items-start lg:max-[1200px]:!text-left lg:max-[1200px]:!z-20 " +
        "min-[1201px]:max-[1480px]:!w-[52%] min-[1201px]:max-[1480px]:!items-start min-[1201px]:max-[1480px]:!text-left min-[1201px]:max-[1480px]:!z-20",
      gradient: "#000000",
      borderColor: "#585858",
    },
    {
      imageFit: "contain",
      imagePosition: "top-left",
      imageClassName:
        "max-lg:!top-0 max-lg:!bottom-auto max-lg:!left-0 max-lg:!right-auto max-lg:!translate-x-0 max-lg:!translate-y-0 [&_img]:max-lg:object-left-top " +
        "max-md:!h-[50%] max-md:!w-[55%] " +
        "md:max-lg:!h-[55%] md:max-lg:!w-[50%] " +
        "lg:!top-0 lg:!bottom-auto lg:!left-0 lg:!right-auto lg:!translate-x-0 lg:!translate-y-0 [&_img]:lg:object-left-top " +
        "lg:max-[1200px]:!h-[52%] lg:max-[1200px]:!w-[70%] " +
        "min-[1201px]:max-[1480px]:!h-[60%] min-[1201px]:max-[1480px]:!w-[74%] " +
        "min-[1481px]:!h-[85%] min-[1481px]:!w-[68%]",
      contentPosition: "center-right",
      contentClassName:
        "max-md:!absolute max-md:!left-6 max-md:!right-6 max-md:!bottom-6 max-md:!top-auto max-md:!flex max-md:!w-full max-md:!max-w-full max-md:!flex-col max-md:!items-start max-md:!justify-end max-md:!text-left max-md:!inset-auto max-md:!translate-x-0 max-md:!z-20 " +
        "md:max-lg:!absolute md:max-lg:!left-1/2 md:max-lg:!right-6 md:max-lg:!inset-y-0 md:max-lg:!flex md:max-lg:!w-auto md:max-lg:!max-w-[calc(50%-1.5rem)] md:max-lg:!flex-col md:max-lg:!items-start md:max-lg:!justify-center md:max-lg:!text-left md:max-lg:!translate-x-0 md:max-lg:!translate-y-0 md:max-lg:!inset-auto md:max-lg:!z-20 " +
        "lg:max-[1200px]:!w-[54%] lg:max-[1200px]:!items-start lg:max-[1200px]:!text-left lg:max-[1200px]:!z-20 " +
        "min-[1201px]:max-[1480px]:!w-[52%] min-[1201px]:max-[1480px]:!items-start min-[1201px]:max-[1480px]:!text-left min-[1201px]:max-[1480px]:!z-20",
      gradient: "#000000",
      boxShadow: "8px 8px 24px rgba(52, 41, 100, 0.28)",
    },
  ],
  growth: [
    {
      imageFit: "contain",
      imagePosition: "left",
      imageClassName:
        "max-lg:!h-[50%] max-lg:!w-full " +
        "lg:max-[1200px]:!h-[52%] lg:max-[1200px]:!w-[70%] " +
        "min-[1201px]:max-[1480px]:!h-[60%] min-[1201px]:max-[1480px]:!w-[74%] " +
        "min-[1481px]:!h-[85%] min-[1481px]:!w-[68%]",
      contentPosition: "center-right",
      contentClassName:
        "lg:max-[1200px]:!w-[54%] lg:max-[1200px]:!items-start lg:max-[1200px]:!text-left lg:max-[1200px]:!z-20 " +
        "min-[1201px]:max-[1480px]:!w-[52%] min-[1201px]:max-[1480px]:!items-start min-[1201px]:max-[1480px]:!text-left min-[1201px]:max-[1480px]:!z-20",
    },
    {
      imageFit: "contain",
      imagePosition: "left",
      contentPosition: "center-right",
    },
    {
      imageFit: "contain",
      imagePosition: "bottom-right",
      imageClassName:
        "max-lg:!h-[50%] max-lg:!w-full " +
        "lg:max-[1200px]:!h-[64%] lg:max-[1200px]:!w-[78%] " +
        "min-[1201px]:max-[1480px]:!h-[68%] min-[1201px]:max-[1480px]:!w-[82%] " +
        "min-[1481px]:!h-[68%] min-[1481px]:!w-[82%]",
      tall: true,
    },
    {
      imageFit: "contain",
      imagePosition: "bottom",
      imageClassName:
        "max-lg:!w-full max-lg:!bottom-0 max-lg:!top-auto max-lg:!translate-x-0 max-lg:!translate-y-0 [&_img]:max-lg:object-contain " +
        "max-md:!h-[52%] md:max-lg:!h-[58%] " +
        "lg:max-[1200px]:!h-[78%] lg:max-[1200px]:!w-[92%] " +
        "min-[1201px]:max-[1480px]:!h-[82%] min-[1201px]:max-[1480px]:!w-[95%] " +
        "min-[1481px]:!h-[82%] min-[1481px]:!w-[95%]",
      gradient: "#000000",
      contentPosition: "top-left",
      tall: true,
    },
  ],
  ai: [
    {
      descriptionMaxWidth: 192,
      imageFit: "contain",
      imagePosition: "bottom-right",
      imageClassName:
        "max-md:!h-[50%] max-md:!w-full max-md:!left-0 max-md:!right-auto max-md:!bottom-0 max-md:!top-auto max-md:!translate-x-0 max-md:!translate-y-0 " +
        "md:max-lg:!left-1/2 md:max-lg:!right-auto md:max-lg:!bottom-0 md:max-lg:!top-auto md:max-lg:!-translate-x-1/2 md:max-lg:!translate-y-0 md:max-lg:!h-[55%] md:max-lg:!w-[72%] [&_img]:md:max-lg:object-bottom " +
        "lg:max-[1200px]:!h-[58%] lg:max-[1200px]:!w-[48%] lg:max-[1200px]:!right-4 lg:max-[1200px]:!left-auto lg:max-[1200px]:!translate-x-0 " +
        "min-[1201px]:max-[1480px]:!h-[65%] min-[1201px]:max-[1480px]:!w-[50%] min-[1201px]:max-[1480px]:!right-6 min-[1201px]:max-[1480px]:!left-auto " +
        "min-[1481px]:!h-[78%] min-[1481px]:!w-[46%] min-[1481px]:!max-w-[46%] min-[1481px]:!right-10 min-[1481px]:!left-auto",
      contentClassName:
        "md:max-lg:!absolute md:max-lg:!left-6 md:max-lg:!right-auto md:max-lg:!inset-y-0 md:max-lg:!flex md:max-lg:!w-full md:max-lg:!max-w-[420px] md:max-lg:!flex-col md:max-lg:!items-start md:max-lg:!justify-center md:max-lg:!text-left md:max-lg:!inset-x-auto md:max-lg:!translate-x-0 md:max-lg:!translate-y-0 md:max-lg:!mt-0 md:max-lg:!z-20 " +
        "lg:max-[1200px]:!mt-[48px] lg:max-[1200px]:!max-w-[58%] lg:max-[1200px]:!z-20 " +
        "min-[1201px]:max-[1480px]:!mt-[64px] min-[1201px]:max-[1480px]:!max-w-[52%] min-[1201px]:max-[1480px]:!z-20 " +
        "min-[1481px]:!mt-[91px]",
      tall: true,
    },
    {
      descriptionMaxWidth: 255,
      imageFit: "contain",
      imagePosition: "bottom-left",
      imageOverflow: true,
      imageClassName:
        "max-md:!h-[50%] max-md:!w-full max-md:!left-0 max-md:!right-auto max-md:!bottom-0 max-md:!top-auto max-md:!translate-x-0 max-md:!translate-y-0 " +
        "md:max-lg:!left-1/2 md:max-lg:!right-auto md:max-lg:!bottom-0 md:max-lg:!top-auto md:max-lg:!-translate-x-1/2 md:max-lg:!translate-y-0 md:max-lg:!h-[55%] md:max-lg:!w-[72%] [&_img]:md:max-lg:object-bottom " +
        "lg:max-[1200px]:!h-[58%] lg:max-[1200px]:!w-[68%] lg:max-[1200px]:!left-4 lg:max-[1200px]:!translate-x-0 " +
        "min-[1201px]:max-[1480px]:!h-[65%] min-[1201px]:max-[1480px]:!w-[72%] min-[1201px]:max-[1480px]:!left-6 " +
        "min-[1481px]:!h-[306px] min-[1481px]:!w-[214px] min-[1481px]:!max-w-[45%] min-[1481px]:!left-8",
      contentPosition: "center-right",
      contentClassName:
        "md:max-lg:!absolute md:max-lg:!left-6 md:max-lg:!right-auto md:max-lg:!inset-y-0 md:max-lg:!flex md:max-lg:!w-full md:max-lg:!max-w-[420px] md:max-lg:!flex-col md:max-lg:!items-start md:max-lg:!justify-center md:max-lg:!text-left md:max-lg:!inset-x-auto md:max-lg:!translate-x-0 md:max-lg:!translate-y-0 md:max-lg:!z-20 " +
        "lg:max-[1200px]:!w-[54%] lg:max-[1200px]:!items-start lg:max-[1200px]:!text-left lg:max-[1200px]:!z-20 " +
        "min-[1201px]:max-[1680px]:!w-[52%] min-[1201px]:max-[1680px]:!items-start min-[1201px]:max-[1680px]:!text-left min-[1201px]:max-[1680px]:!z-20 " +
        "min-[1681px]:!pl-8",
    },
    {
      descriptionMaxWidth: 285.23,
      imageFit: "contain",
      imagePosition: "left",
      contentPosition: "center-right",
      contentClassName: "lg:-translate-x-8",
      gradient: "linear-gradient(270deg, #23A8BF 0%, #57D4C7 100%)",
    },
    {
      descriptionMaxWidth: 273.37,
      imageFit: "cover",
      imagePosition: "center",
      imageClassName:
        "!overflow-hidden max-lg:!w-full max-lg:!bottom-0 max-lg:!top-auto max-lg:!translate-x-0 max-lg:!translate-y-0 " +
        "max-md:!h-[52%] md:max-lg:!h-[58%] [&_img]:max-lg:object-cover [&_img]:max-lg:object-center " +
        "lg:!inset-0 lg:!top-0 lg:!right-0 lg:!bottom-0 lg:!left-0 lg:!h-full lg:!w-full lg:!max-h-full lg:!max-w-full lg:!overflow-hidden lg:!translate-x-0 lg:!translate-y-0 [&_img]:lg:!h-full [&_img]:lg:!w-full [&_img]:lg:object-cover [&_img]:lg:object-center",
      gradient: "#000000",
      tall: true,
    },
  ],
};

/** Merge CMS card content with design layout presets (CMS wins when set). */
export function applyServicesShowcaseCardLayoutPresets(
  studioKey: ServicesStudioKey,
  cards: ShowcaseCard[]
): ShowcaseCard[] {
  const presets = SERVICES_CARD_LAYOUT_PRESETS[studioKey] ?? [];
  if (!cards.length || !presets.length) return cards;

  return cards.map((card, index) => {
    const preset = presets[index];
    if (!preset) return card;

    return {
      ...card,
      descriptionMaxWidth: card.descriptionMaxWidth ?? preset.descriptionMaxWidth,
      imageHeight: card.imageHeight ?? preset.imageHeight,
      imageWidth: card.imageWidth ?? preset.imageWidth,
      imageFit: card.imageFit ?? preset.imageFit,
      imagePosition: card.imagePosition ?? preset.imagePosition,
      imageClassName: card.imageClassName ?? preset.imageClassName,
      imageOverflow: card.imageOverflow ?? preset.imageOverflow,
      contentPosition: card.contentPosition ?? preset.contentPosition,
      contentClassName: card.contentClassName ?? preset.contentClassName,
      gradient: card.gradient ?? preset.gradient,
      borderColor: card.borderColor ?? preset.borderColor,
      boxShadow: card.boxShadow ?? preset.boxShadow,
      tall: card.tall ?? preset.tall,
    };
  });
}
