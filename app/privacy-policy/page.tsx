import type { Metadata } from "next";

import BeforeImage from "@/app/components/ui/BeforeImage";
import PageBanner from "@/app/components/ui/PageBanner";
import JsonLdScript from "@/app/components/seo/JsonLdScript";
import { buildDynamicAeoJsonLd } from "@/app/lib/aeo-schema";
import { fetchSeoByUri, type YoastSeo } from "@/app/lib/home-seo-api";
import {
  getPrivacyPolicyContent,
  PRIVACY_POLICY_PAGE_URI,
} from "@/app/lib/privacy-policy-api";
import { getFrontendSiteUrl } from "@/app/lib/seo-url";
import { yoastSeoToMetadata } from "@/app/lib/yoast-metadata";
import type { PolicySection } from "@/app/privacy-policy/privacy-policy-content";
import styles from "./privacy-policy.module.css";

/**
 * Same decorative mask as landing Why sections.
 * Frontend-owned — WP media SVG uploads break the baked-in transform.
 */
const WHY_MASK_IMAGE = "/figma-assets/eaa7e689-0574-42c0-94ca-5b11db35a17a.svg";

export const revalidate = 3600;

// Static SEO fallback — disabled; Yoast only.
// const PRIVACY_METADATA_FALLBACK: Metadata = {
//   title: "Privacy Policy | CWIT",
//   description:
//     "Read the CWIT privacy policy and how we protect your personal information.",
// };

function applyPrivacySeoFallbacks(seo: YoastSeo | null): YoastSeo | null {
  if (!seo) return null;
  const fallbackUrl = `${getFrontendSiteUrl().replace(/\/+$/, "")}/privacy-policy/`;
  return {
    ...seo,
    canonical: seo.canonical?.trim() || fallbackUrl,
    opengraphUrl: seo.opengraphUrl?.trim() || fallbackUrl,
  };
}

async function fetchPrivacySeo(): Promise<YoastSeo | null> {
  try {
    return applyPrivacySeoFallbacks(await fetchSeoByUri(PRIVACY_POLICY_PAGE_URI));
  } catch (error) {
    console.error("[privacy-policy] Failed to fetch Yoast SEO:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchPrivacySeo();
    return yoastSeoToMetadata(seo);
  } catch (error) {
    console.error("[privacy-policy] generateMetadata failed:", error);
  }
  // return PRIVACY_METADATA_FALLBACK;
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

export default async function PrivacyPolicyPage() {
  const [content, seo] = await Promise.all([
    getPrivacyPolicyContent(),
    fetchPrivacySeo(),
  ]);
  const hasIntro = Boolean(content.lastUpdated || content.introText);
  const jsonLd = buildDynamicAeoJsonLd({
    seo,
    path: "/privacy-policy/",
    pageTitle: content.bannerTitle || "Privacy Policy",
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

      <section className={styles.contentWrap} aria-label="Privacy policy content">
        {content.glowImage ? (
          <div className="pointer-events-none absolute left-0 top-0 z-0 h-[clamp(900px,93.75vw,1800px)] w-full overflow-hidden">
            <BeforeImage image={content.glowImage} alt={content.glowImageAlt} />
          </div>
        ) : null}

        {/* Frontend-owned mask — same asset + rotation as accurate static / landing Why. */}
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
