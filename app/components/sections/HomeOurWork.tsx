"use client";

import { useMemo } from "react";
import OurWork, { WorkItem } from "@/app/components/sections/OurWork";
import type { HomeOurWorkItem } from "@/app/lib/home-normalize";
import { resolveImageUrl } from "@/app/lib/our-work-api";

interface HomeOurWorkProps {
  titleOverride?: string;
  sectionSubtitle?: string;
  sectionDescription?: string;
  items?: HomeOurWorkItem[];
}

export default function HomeOurWork({ titleOverride, items: cmsItems }: HomeOurWorkProps = {}) {
  const workItems: WorkItem[] = useMemo(() => {
    return (cmsItems ?? [])
      .map((item) => {
        const resolved = resolveImageUrl(item.image) || item.image;
        if (!resolved) return null;
        return {
          title: item.title,
          description: item.description ?? "",
          image: resolved,
          popupImage: resolved,
          category: item.subtitle?.trim() || undefined,
          link: item.link?.trim() || undefined,
        } satisfies WorkItem;
      })
      .filter(Boolean) as WorkItem[];
  }, [cmsItems]);

  if (!workItems.length) return null;

  return (
    <OurWork
      title={titleOverride?.trim() || ""}
      workItems={workItems}
      ctaVariant="outline"
      className="bg-black"
      showCTA={false}
      cardClickAction="modal"
    />
  );
}
