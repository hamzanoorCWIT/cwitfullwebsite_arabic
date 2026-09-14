import { redirect } from "next/navigation";

/** Legacy URL: /portfolio/[slug] → /our-work/[slug] */
export default async function LegacyPortfolioDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const slugNorm = slug?.replace(/^\/+|\/+$/g, "").trim();
  if (!slugNorm) {
    redirect("/our-work");
  }
  redirect(`/our-work/${slugNorm}`);
}
