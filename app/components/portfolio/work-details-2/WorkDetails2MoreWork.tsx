"use client";

import FigmaHomeOurWork from "@/app/components/sections/FigmaHomeOurWork";
import type { HomeOurWorkItem } from "@/app/lib/home-normalize";
import type { WorkDetailsV2RelatedItem } from "@/app/lib/portfolio-work-details-v2";

type WorkDetails2MoreWorkProps = {
  items: WorkDetailsV2RelatedItem[];
  title?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

function mapToCarouselItems(items: WorkDetailsV2RelatedItem[]): HomeOurWorkItem[] {
  return items
    .filter((item) => Boolean(item.title?.trim()))
    .map((item) => ({
      title: item.title,
      description: item.description || undefined,
      image: item.image || "",
      link: item.href,
    }));
}

export default function WorkDetails2MoreWork({
  items,
  title = "More Work",
  ctaLabel = "Complete portfolio",
  ctaHref = "/our-work",
}: WorkDetails2MoreWorkProps) {
  const carouselItems = mapToCarouselItems(items);
  if (!carouselItems.length) return null;

  return (
    <FigmaHomeOurWork
      titleOverride={title}
      sectionSubtitle=""
      items={carouselItems}
      ctaLabel={ctaLabel}
      ctaHref={ctaHref}
    />
  );
}
