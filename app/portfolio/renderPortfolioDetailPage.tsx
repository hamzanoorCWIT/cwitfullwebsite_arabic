import { notFound } from "next/navigation";
import WorkDetails2View from "@/app/components/portfolio/WorkDetails2View";
// Legacy layout preserved in PortfolioDetailLegacy.tsx — re-enable if needed.
import { fetchPortfolioBySlug } from "@/app/lib/our-work-api";
import { normalizeWorkDetailsV2 } from "@/app/lib/portfolio-work-details-v2";
import { fetchDefaultContactPage, getContactPageFields } from "@/app/lib/contact-api";
import { resolveContactFormProps } from "@/app/lib/contact-form-config";

export async function renderPortfolioDetailPage(slug: string) {
  const slugNorm = slug?.replace(/^\/+|\/+$/g, "").trim();
  if (!slugNorm) {
    notFound();
  }

  const res = await fetchPortfolioBySlug(slugNorm);
  if (!res.data?.portfolio) {
    notFound();
  }

  const portfolio = res.data.portfolio;

  const viewModel = normalizeWorkDetailsV2(portfolio);
  if (!viewModel) {
    notFound();
  }

  let contactForm = resolveContactFormProps(undefined, { useDefaultFields: true });
  try {
    const contactRes = await fetchDefaultContactPage();
    const contactFields = getContactPageFields(contactRes.data);
    contactForm = resolveContactFormProps(
      (contactFields?.contactFormSettings ?? undefined) as Record<string, unknown> | undefined,
      { useDefaultFields: true }
    );
  } catch {
    contactForm = resolveContactFormProps(undefined, { useDefaultFields: true });
  }

  return <WorkDetails2View data={viewModel} contactForm={contactForm} />;
}
