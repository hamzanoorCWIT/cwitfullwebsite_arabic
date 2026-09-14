/**
 * Legacy portfolio / work-details layout (pre work-details-2).
 * Preserved for potential re-use — not rendered by default.
 */
import { coalesceProjectInfoRows, resolveImageUrl } from "@/app/lib/our-work-api";
import type { PortfolioBySlug } from "@/app/lib/our-work-api";
import HeroBanner from "@/app/components/ui/HeroBanner";
import Education from "@/app/components/sections/Education";
import Stay from "@/app/components/sections/Stay";
import WhatWeDelivered from "@/app/components/sections/WhatWeDelivered";
import PerformanceMetrics from "@/app/components/sections/PerformanceMetrics";
import ClientTestimonials from "@/app/components/sections/ClientTestimonials";

type PortfolioDetailLegacyProps = {
  portfolio: NonNullable<PortfolioBySlug["portfolio"]>;
};

export default function PortfolioDetailLegacy({ portfolio }: PortfolioDetailLegacyProps) {
  const pd = portfolio.portfolioDetails ?? null;
  const hasProjectInfoRepeater = coalesceProjectInfoRows(pd?.projectInfoRows).length > 0;
  const fullWidthCmsSrc = resolveImageUrl(pd?.fullWidthBackgroundImage?.node?.sourceUrl);
  const heroBg = resolveImageUrl(pd?.backgroundImage?.node?.sourceUrl);
  const heroAlt = pd?.backgroundImage?.node?.altText?.trim() || "";

  return (
    <main className="min-h-screen relative bg-black">
      <HeroBanner
        title={portfolio.title ?? undefined}
        description={pd?.description ?? undefined}
        backgroundImage={heroBg}
        backgroundImageAlt={heroAlt}
        minHeight="100vh"
      />

      <Education
        backgroundImageSrc={resolveImageUrl(
          pd?.educationBackgroundImage?.node?.sourceUrl ??
            pd?.educationBackgroundImage?.node?.mediaItemUrl
        )}
        industryTitle={pd?.industryTitle ?? undefined}
        industryDescription={pd?.industryDescription ?? undefined}
        projectTypeTitle={hasProjectInfoRepeater ? undefined : (pd?.projectTypeTitle ?? undefined)}
        projectYear={hasProjectInfoRepeater ? undefined : (pd?.projectYear ?? undefined)}
        projectInfoRows={pd?.projectInfoRows}
        servicesTitle={pd?.servicesTitle ?? undefined}
        services={pd?.servicesList?.map((s) => s?.serviceName).filter(Boolean) as string[] | undefined}
      />

      <Stay
        imageSrc={resolveImageUrl(
          pd?.stayImage?.node?.sourceUrl ?? pd?.stayImage?.node?.mediaItemUrl
        )}
        imageAlt={pd?.stayImage?.node?.altText?.trim() || undefined}
        paragraphs={
          pd?.stayParagraphs?.map((p) => p?.paragraphText).filter(Boolean) as string[] | undefined
        }
      />

      <WhatWeDelivered
        title={pd?.deliveredTitle ?? undefined}
        description={pd?.deliveredDescription ?? undefined}
        deliverables={
          pd?.deliverables?.map((d) => d?.deliverableName).filter(Boolean) as string[] | undefined
        }
      />

      <PerformanceMetrics
        metrics={
          pd?.performanceMetrics
            ?.map((m) => ({
              title: m?.metricTitle ?? "",
              value: m?.metricValue ?? "",
            }))
            .filter((m) => m.title || m.value) as { title: string; value: string }[] | undefined
        }
      />

      {fullWidthCmsSrc ? (
        <section className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="relative w-full max-w-[1494px] mx-auto aspect-[16/10] max-h-[720px] overflow-hidden bg-black/20">
            <img
              src={fullWidthCmsSrc}
              alt={pd?.fullWidthBackgroundImageAlt?.trim() || ""}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>
        </section>
      ) : null}

      <ClientTestimonials
        title={pd?.testimonialsTitle ?? undefined}
        testimonials={
          pd?.testimonials
            ?.map((t) => ({
              text: t?.testimonialText ?? "",
              rating: t?.testimonialRating ?? 0,
            }))
            .filter((t) => t.text) as { text: string; rating: number }[] | undefined
        }
      />
    </main>
  );
}
