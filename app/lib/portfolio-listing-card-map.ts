/**
 * Maps a Portfolio node to an Our Work listing card.
 * Selection (selected vs all) is handled by the caller.
 *
 * Content rules:
 * - title: Listing Card title, else post title
 * - image: Listing Card image, else empty (UI shows placeholder)
 * - subtitle / description: only if set on Listing Card
 */

import {
  extractPortfolioListingCard,
  getListingCardImageUrl,
} from "@/app/lib/our-work-api";
import { portfolioDetailPath } from "@/app/lib/portfolio-url";
import type { OurWorkPageItem } from "@/app/our-work/our-work-types";

export type PortfolioListingSource = {
  slug?: string | null;
  title?: string | null;
  portfolioDetails?: unknown;
} | null | undefined;

export function mapPortfolioToOurWorkListingItem(
  node: PortfolioListingSource
): OurWorkPageItem | null {
  if (!node) return null;

  const postTitle = typeof node.title === "string" ? node.title.trim() : "";
  const listingCard = extractPortfolioListingCard(node);
  const title = listingCard?.portfolioTitle?.trim() || postTitle;
  if (!title) return null;

  const image = getListingCardImageUrl(listingCard) || "";
  const category = listingCard?.portfolioSubtitle?.trim() || undefined;
  const description = listingCard?.portfolioDescription?.trim() || undefined;
  const link = portfolioDetailPath(node.slug);

  return {
    title,
    image: image as OurWorkPageItem["image"],
    description: description || "",
    ...(category ? { category } : {}),
    ...(link ? { link } : {}),
  };
}

export function mapPortfoliosToOurWorkListingItems(
  nodes: Array<PortfolioListingSource> | null | undefined
): OurWorkPageItem[] {
  const list = Array.isArray(nodes) ? nodes : [];
  return list
    .map((node) => mapPortfolioToOurWorkListingItem(node))
    .filter((item): item is OurWorkPageItem => item != null);
}
