import type { StudioServiceCard } from "@/app/components/sections/StudioServiceCards";

export type OfferModalContent = {
  bannerTitle: string;
  bannerSubtitle?: string;
  bannerDescription: string;
  backgroundImage?: string;
  videoSrc?: string;
  detailCards: StudioServiceCard[];
};

export type HomeOfferCard = {
  kind: string;
  title: string;
  description: string;
  art?: string;
  background?: string;
  mini?: boolean;
  modalContent?: OfferModalContent;
};

export type HomeOffersData = {
  heading: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  columns: HomeOfferCard[][];
};
