import Image from "next/image";
import WorkDetails2HeroMedia from "./work-details-2/WorkDetails2HeroMedia";
import WorkDetails2MediaSection from "./work-details-2/WorkDetails2MediaSection";
import WorkDetails2ContactForm from "./work-details-2/WorkDetails2ContactForm";
import WorkDetails2Metrics from "./work-details-2/WorkDetails2Metrics";
import WorkDetails2Showcase from "./work-details-2/WorkDetails2Showcase";
import WorkDetails2MoreWork from "./work-details-2/WorkDetails2MoreWork";
import WorkDetails2Testimonials from "./work-details-2/WorkDetails2Testimonials";
import type { WorkDetailsV2ViewModel } from "@/app/lib/portfolio-work-details-v2";
import type { ResolvedContactFormProps } from "@/app/lib/contact-form-config";
import styles from "./work-details-2/work-details-2.module.css";

type WorkDetails2ViewProps = {
  data: WorkDetailsV2ViewModel;
  contactForm: ResolvedContactFormProps;
};

export default function WorkDetails2View({ data, contactForm }: WorkDetails2ViewProps) {
  const {
    overviewHtml,
    brandLogoUrl,
    brandLogoAlt,
    deliverablesLabel,
    deliverablesText,
    platformsText,
    heroImage,
    heroVideoSrc,
    heroImageMobile,
    heroVideoSrcMobile,
    heroAlt,
    storyTitle,
    storyHtml,
    chips,
    metrics,
    featureImage,
    featureVideoSrc,
    featureImageMobile,
    featureVideoSrcMobile,
    featureAlt,
    showcaseCards,
    testimonials,
    contactHeadingSub,
    contactHeadingMain,
    relatedWork,
    relatedWorkCtaLabel,
  } = data;

  return (
    <main className={styles.page}>
      <section className={styles.overview} data-section-theme="light">
        <div className={styles.overviewCard}>
          {overviewHtml ? (
            <h1
              className={styles.overviewTitle}
              dangerouslySetInnerHTML={{ __html: overviewHtml }}
            />
          ) : null}
          {brandLogoUrl || deliverablesText || platformsText ? (
            <div className={styles.metaRow}>
              {brandLogoUrl ? (
                <div className={styles.brand}>
                  <Image
                    src={brandLogoUrl}
                    alt={brandLogoAlt || ""}
                    width={400}
                    height={80}
                    className={styles.brandLogo}
                    unoptimized
                  />
                </div>
              ) : null}
              {deliverablesText ? (
                <>
                  {brandLogoUrl ? <span className={styles.metaDivider} aria-hidden="true" /> : null}
                  <div className={styles.metaBlock}>
                    {deliverablesLabel ? <span>{deliverablesLabel}:</span> : null}
                    <strong>{deliverablesText}</strong>
                  </div>
                </>
              ) : null}
              {platformsText ? (
                <>
                  {brandLogoUrl || deliverablesText ? (
                    <span className={styles.metaDivider} aria-hidden="true" />
                  ) : null}
                  <div className={styles.metaBlock}>
                    <span>Platforms:</span>
                    <strong>{platformsText}</strong>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <WorkDetails2HeroMedia
        videoSrc={heroVideoSrc}
        imageSrc={heroImage}
        videoSrcMobile={heroVideoSrcMobile}
        imageSrcMobile={heroImageMobile}
        alt={heroAlt}
      />

      {(storyTitle || storyHtml || chips.length > 0) && (
        <section className={styles.story}>
          <span className={styles.storyDot} aria-hidden="true" />
          {storyTitle ? <h2>{storyTitle}</h2> : null}
          {storyHtml ? (
            <div
              className={styles.storyText}
              dangerouslySetInnerHTML={{ __html: storyHtml }}
            />
          ) : null}
          {chips.length > 0 ? (
            <div className={styles.chips}>
              {chips.map((chip) => (
                <span className={styles.chip} key={chip}>
                  {chip}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      )}

      <WorkDetails2Metrics metrics={metrics} />

      <WorkDetails2MediaSection
        videoSrc={featureVideoSrc}
        imageSrc={featureImage}
        videoSrcMobile={featureVideoSrcMobile}
        imageSrcMobile={featureImageMobile}
        alt={featureAlt}
        sectionClassName={styles.featureImage}
        videoClassName={styles.featureVideo}
        ariaLabel="Project feature media"
      />

      <WorkDetails2Showcase cards={showcaseCards} />

      <WorkDetails2Testimonials testimonials={testimonials} />

      <WorkDetails2ContactForm
        headingSub={contactHeadingSub}
        headingMain={contactHeadingMain}
        contactForm={contactForm}
      />

      <WorkDetails2MoreWork items={relatedWork} ctaLabel={relatedWorkCtaLabel} />
    </main>
  );
}
