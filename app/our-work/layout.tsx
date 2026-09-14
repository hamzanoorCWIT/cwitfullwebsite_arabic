import type { Metadata } from "next";
import { fetchSeoByUri } from "@/app/lib/home-seo-api";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import { OUR_WORK_LISTING_VARIABLES } from "@/app/lib/our-work-api";

const OUR_WORK_URI = OUR_WORK_LISTING_VARIABLES.uri;

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchSeoByUri(OUR_WORK_URI);
    return yoastSeoToMetadata(seo);
  } catch (error) {
    console.error("[our-work] Failed to generate Yoast metadata:", error);
    return {};
  }
}

export default function OurWorkLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
