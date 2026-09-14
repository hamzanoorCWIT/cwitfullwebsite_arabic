import type { Metadata } from "next";

import BeforeImage from "@/app/components/ui/BeforeImage";
import PageBanner from "@/app/components/ui/PageBanner";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";
import { fetchSeoByUri, type YoastSeo } from "@/app/lib/home-seo-api";
import {
  getTermsAndConditionsContent,
  TERMS_AND_CONDITIONS_PAGE_URI,
} from "@/app/lib/terms-and-conditions-api";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import type { PolicySection } from "@/app/terms-and-conditions/terms-and-conditions-content";
import styles from "@/app/privacy-policy/privacy-policy.module.css";

/** Same decorative mask as privacy / landing Why — frontend-owned. */
const WHY_MASK_IMAGE = "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg";

export const revalidate = 3600;

// Static SEO fallback — disabled; Yoast only.
// const TERMS_METADATA_FALLBACK: Metadata = {
//   title: "Terms & Conditions | CWIT",
//   description:
//     "Read the CWIT terms and conditions for using our website and services.",
// };

function applyTermsSeoFallbacks(seo: YoastSeo | null): YoastSeo | null {
  if (!seo) return null;
  const fallbackUrl = `${getFrontendSiteUrl().replace(/\/+$/, "")}/terms-and-conditions/`;
  return {
    ...seo,
    canonical: seo.canonical?.trim() || fallbackUrl,
    opengraphUrl: seo.opengraphUrl?.trim() || fallbackUrl,
  };
}

async function fetchTermsSeo(): Promise<YoastSeo | null> {
  try {
    return applyTermsSeoFallbacks(
      await fetchSeoByUri(TERMS_AND_CONDITIONS_PAGE_URI)
    );
  } catch (error) {
    console.error("[terms-and-conditions] Failed to fetch Yoast SEO:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchTermsSeo();
    return yoastSeoToMetadata(seo);
  } catch (error) {
    console.error("[terms-and-conditions] generateMetadata failed:", error);
  }
  // return TERMS_METADATA_FALLBACK;
  return {};
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className={styles.policyList}>
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function PolicyBlock({ section }: { section: PolicySection }) {
  return (
    <section className={styles.policyBlock}>
      <h2>{section.title}</h2>
      {section.body ? <p>{section.body}</p> : null}
      {section.intro ? <p>{section.intro}</p> : null}
      {section.paragraphs?.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.bullets?.length ? <BulletList items={section.bullets} /> : null}
      {section.outro ? <p>{section.outro}</p> : null}
      {section.children?.map((child) => (
        <div className={styles.policySubBlock} key={child.title}>
          <h3>{child.title}</h3>
          {child.intro ? <p>{child.intro}</p> : null}
          {child.bullets?.length ? <BulletList items={child.bullets} /> : null}
        </div>
      ))}
    </section>
  );
}

export default async function TermsAndConditionsPage() {
  const [content, seo] = await Promise.all([
    getTermsAndConditionsContent(),
    fetchTermsSeo(),
  ]);
  const hasIntro = Boolean(content.lastUpdated || content.introText);
  const jsonLd = buildDynamicAeoJsonLd({
    seo,
    path: "/terms-and-conditions/",
    pageTitle: content.bannerTitle || "Terms & Conditions",
  });

  return (
    <main className={styles.page}>
      {jsonLd ? <JsonLdScript content={jsonLd} /> : null}
      {content.bannerTitle ? (
        <PageBanner
          title={content.bannerTitle}
          minHeight="100vh"
          titleClassName="font-graphik text-[22px] font-[300] leading-[1.3] text-white sm:text-[32px] sm:leading-[1.35] md:text-[50px] md:leading-[1.4] lg:text-[65px] lg:leading-[1.35] xl:text-[80px] xl:leading-[1.3] 2xl:leading-[1.25]"
        />
      ) : null}

      <section className={styles.contentWrap} aria-label="Terms and conditions content">
        {content.glowImage ? (
          <div className="pointer-events-none absolute left-0 top-0 z-0 h-[clamp(900px,93.75vw,1800px)] w-full overflow-hidden">
            <BeforeImage image={content.glowImage} alt={content.glowImageAlt} />
          </div>
        ) : null}

        <div className={styles.maskWrap} aria-hidden>
          <div className="flex h-full w-full -scale-y-100 rotate-180 items-center justify-center">
            <img alt="" src={WHY_MASK_IMAGE} className={styles.maskImage} />
          </div>
        </div>

        <div className={styles.policyContent}>
          {hasIntro ? (
            <section className={styles.updatedBlock}>
              {content.lastUpdated ? <h2>{content.lastUpdated}</h2> : null}
              {content.introText ? <p>{content.introText}</p> : null}
            </section>
          ) : null}

          {content.sections.map((section) => (
            <PolicyBlock key={section.title} section={section} />
          ))}
        </div>
      </section>
    </main>
  );
}
