import { redirect } from "next/navigation";

/** Redirect old /work/[slug] URLs to canonical /our-work/[slug]. */
export default async function WorkSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (slug?.trim()) redirect(`/our-work/${slug.trim()}`);
  redirect("/our-work");
}
