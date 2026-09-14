import type { HomeOurWorkItem } from "@/app/lib/home-normalize";

export type MappableWorkItem = {
  title: string;
  description?: string;
  image: string;
  category?: string;
  link?: string;
};

export function mapWorkItemsToHomeOurWork(items: MappableWorkItem[]): HomeOurWorkItem[] {
  return items
    .filter((item) => Boolean(item.title?.trim() || item.image?.trim()))
    .map((item) => ({
      title: item.title,
      description: item.description,
      image: item.image,
      subtitle: item.category,
      link: item.link,
    }));
}
