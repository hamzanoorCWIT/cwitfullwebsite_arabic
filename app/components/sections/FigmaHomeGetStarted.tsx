"use client";

import CallToActionButton from "@/app/components/ui/CallToActionButton";
import Image from "next/image";
import headingStyles from "./FigmaHomeSectionTitle.module.css";
import styles from "./FigmaHomeGetStarted.module.css";
import { useLocalePreference } from "@/app/components/providers/DirectionPreference";
import { getHomeUiCopy } from "@/app/lib/home-ui-copy";

export default function FigmaHomeGetStarted() {
  const { locale } = useLocalePreference();
  const copy = getHomeUiCopy(locale);

  return (
    <section className={styles.section} aria-labelledby="get-started-title">
      <div className="relative z-10 mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 global-section-padding accordion-content-container">
        <div className={styles.inner}>
          <div className={styles.content}>
            <h2 id="get-started-title" className={`${headingStyles.headingSize} font-[family-name:var(--font-inter)]`}>
              {copy.getStartedTitle}
            </h2>
            <p>{copy.getStartedBody}</p>
            <CallToActionButton
              variant="shiny"
              href="/contact-us"
              className={`${styles.cta} !w-auto !min-w-[200px] sm:!min-w-[221px] whitespace-nowrap`}
            >
              {copy.startYourProject}
            </CallToActionButton>
          </div>

          <div className={styles.imageFrame}>
            <Image
              src="/figma-home/get-started.png"
              alt={copy.getStartedImageAlt}
              fill
              className={styles.image}
              sizes="(max-width: 1024px) 100vw, (max-width: 1440px) 42vw, 697px"
              unoptimized
            />
          </div>
        </div>
      </div>
    </section>
  );
}
