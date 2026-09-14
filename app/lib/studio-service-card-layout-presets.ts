import type { StudioServiceCard } from "@/app/components/sections/StudioServiceCards";

export type StudioServiceCardPresetKey =
  | "digital"
  | "application"
  | "growth"
  | "ai";

export const STUDIO_SERVICE_CARD_LAYOUT_PRESETS: Record<
  StudioServiceCardPresetKey,
  Partial<StudioServiceCard>[]
> = {
  digital: [
    {
      imageWidth: 820.45,
      imageHeight: 549.69,
      contentMaxWidth: 665,
      imagePosition: "right",
    },
    {
      imageWidth: 987,
      imageHeight: 782,
      contentMaxWidth: 665,
      gradient: "linear-gradient(135deg, #4F46E5 0%, #2E2A8F 100%)",
      imagePosition: "left",
    },
    {
      imageWidth: 1290,
      imageHeight: 1090,
      contentMaxWidth: 665,
      imageVAlign: "center",
      imagePosition: "left",
    },
    {
      imageWidth: 1239,
      contentMaxWidth: 665,
      overlayImageWidth: 1114.54,
      overlayImageHeight: 927.1,
      contentVAlign: "center",
      imagePosition: "right",
    },
  ],
  application: [
    {
      contentMaxWidth: 665,
      imagePosition: "right",
    },
    {
      imageHeight: 727,
      contentMaxWidth: 665,
      imagePosition: "right",
    },
    {
      imageHeight: 750,
      imageFit: "cover",
      contentMaxWidth: 665,
      gradient: "#000000",
      imagePosition: "left",
    },
    {
      imageHeight: 750,
      imageFit: "cover",
      contentMaxWidth: 665,
      gradient: "#000000",
      imagePosition: "left",
    },
  ],
  growth: [
    {
      imageHeight: 716,
      contentMaxWidth: 665,
      imagePosition: "left",
    },
    {
      imageHeight: 750,
      imageVAlign: "center",
      contentMaxWidth: 665,
      imagePosition: "left",
    },
    {
      imageHeight: 843,
      contentMaxWidth: 665,
      gradient: "#97106594",
      imagePosition: "right",
    },
    {
      contentMaxWidth: 665,
      borderColor: "#868686",
      imagePosition: "right",
    },
  ],
  ai: [
    {
      contentMaxWidth: 665,
      imagePosition: "right",
    },
    {
      imageHeight: 680,
      imageClassName: "lg:pl-[88.63px]",
      contentMaxWidth: 665,
      imagePosition: "left",
    },
    {
      imageWidth: 1290,
      imageHeight: 1090,
      imageVAlign: "center",
      contentMaxWidth: 665,
      gradient: "linear-gradient(135deg, #2FB8A8 0%, #1C6E66 100%)",
      imagePosition: "left",
    },
    {
      imageWidth: 843,
      imageHeight: 843,
      contentMaxWidth: 665,
      borderColor: "#868686",
      gradient: "#000000",
      imagePosition: "right",
    },
  ],
};
