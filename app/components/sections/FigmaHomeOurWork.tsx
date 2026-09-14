"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import type { HomeOurWorkItem, HomeOurWorkProps } from "@/app/lib/home-normalize";
import { resolveImageUrl } from "@/app/lib/our-work-api";
import CallToActionButton from "@/app/components/ui/CallToActionButton";
import styles from "./FigmaHomeOurWork.module.css";
import headingStyles from "./FigmaHomeSectionTitle.module.css";
import { isRtlDirection } from "@/app/lib/rtl-layout";
import { useLocalePreference } from "@/app/components/providers/DirectionPreference";
import { getHomeUiCopy, resolveHomeUiText } from "@/app/lib/home-ui-copy";

function plainText(value: string | undefined): string {
  return (value || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function toTitleCase(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function getCarouselPositionBySlideIndex(entryIndex: number, slideIndex: number): -1 | 0 | 1 | 2 {
  const diff = entryIndex - slideIndex;
  if (diff === 0) return 0;
  if (diff === -1) return -1;
  if (diff === 1) return 1;
  return 2;
}

type WorkCarouselItem = {
  item: HomeOurWorkItem;
  logicalIndex: number;
  variant: "default" | "lead-clone" | "trail-clone";
};

function buildCarouselItems(workItems: HomeOurWorkItem[]): WorkCarouselItem[] {
  if (workItems.length <= 1) {
    return workItems.map((item, index) => ({
      item,
      logicalIndex: index,
      variant: "default" as const,
    }));
  }

  const lastIndex = workItems.length - 1;

  return [
    {
      item: workItems[lastIndex],
      logicalIndex: lastIndex,
      variant: "lead-clone" as const,
    },
    ...workItems.map((item, index) => ({
      item,
      logicalIndex: index,
      variant: "default" as const,
    })),
    {
      item: workItems[0],
      logicalIndex: 0,
      variant: "trail-clone" as const,
    },
  ];
}

export default function FigmaHomeOurWork({
  titleOverride,
  sectionSubtitle,
  ctaLabel,
  ctaHref = "/our-work",
  items = [],
}: HomeOurWorkProps) {
  const { locale } = useLocalePreference();
  const copy = getHomeUiCopy(locale);
  const contentDir = locale === "ar" ? "rtl" : "ltr";
  const [activeIndex, setActiveIndex] = useState(0);
  const [slideIndex, setSlideIndex] = useState(0);
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [trackOffset, setTrackOffset] = useState(0);
  const carouselRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const pendingLoopRef = useRef<"next" | "prev" | null>(null);

  const workItems = useMemo(
    () =>
      items
        .filter((item) => Boolean(item.title?.trim()))
        .map((item) => ({
          ...item,
          image: resolveImageUrl(item.image) || item.image || "",
        })),
    [items]
  );

  const carouselItems = useMemo(() => buildCarouselItems(workItems), [workItems]);
  const leadCloneCount = workItems.length > 1 ? 1 : 0;
  const lastIndex = Math.max(workItems.length - 1, 0);
  const trailCloneIndex = workItems.length + leadCloneCount;

  useEffect(() => {
    setActiveIndex(0);
    setSlideIndex(leadCloneCount);
    pendingLoopRef.current = null;
    setTransitionEnabled(true);
  }, [leadCloneCount, workItems]);

  const completeLoopReset = useCallback(
    (index: number) => {
      setTransitionEnabled(false);
      requestAnimationFrame(() => {
        setSlideIndex(index + leadCloneCount);
        setActiveIndex(index);
        requestAnimationFrame(() => {
          setTransitionEnabled(true);
          pendingLoopRef.current = null;
        });
      });
    },
    [leadCloneCount]
  );

  const updateTrackOffset = useCallback(() => {
    const carousel = carouselRef.current;
    const track = trackRef.current;
    if (!carousel || !track || !workItems.length) return;

    const firstCard = track.children[leadCloneCount] as HTMLElement | undefined;
    const cardWidth = firstCard?.offsetWidth ?? 0;
    if (!cardWidth) return;

    const styles = getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
    const carouselWidth = carousel.offsetWidth;

    const ltrOffset = carouselWidth / 2 - cardWidth / 2 - slideIndex * (cardWidth + gap);
    setTrackOffset(isRtlDirection(carousel) ? -ltrOffset : ltrOffset);
  }, [leadCloneCount, slideIndex, workItems.length]);

  useLayoutEffect(() => {
    updateTrackOffset();
  }, [updateTrackOffset]);

  useEffect(() => {
    const carousel = carouselRef.current;
    const track = trackRef.current;
    if (!carousel || !track) return;

    const resizeObserver = new ResizeObserver(() => updateTrackOffset());
    resizeObserver.observe(carousel);
    resizeObserver.observe(track);

    window.addEventListener("resize", updateTrackOffset);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateTrackOffset);
    };
  }, [updateTrackOffset]);

  const goToSlide = (index: number) => {
    if (pendingLoopRef.current) return;
    setActiveIndex(index);
    setSlideIndex(index + leadCloneCount);
  };

  const handleTrackTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget || event.propertyName !== "transform") return;

    const pending = pendingLoopRef.current;
    if (!pending) return;

    if (pending === "next") {
      completeLoopReset(0);
      return;
    }

    completeLoopReset(lastIndex);
  };

  const showPrevious = () => {
    if (workItems.length <= 1 || pendingLoopRef.current) return;

    if (activeIndex === 0) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        goToSlide(lastIndex);
        return;
      }

      pendingLoopRef.current = "prev";
      setSlideIndex(0);
      return;
    }

    goToSlide(activeIndex - 1);
  };

  const showNext = () => {
    if (workItems.length <= 1 || pendingLoopRef.current) return;

    if (activeIndex === lastIndex) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        goToSlide(0);
        return;
      }

      pendingLoopRef.current = "next";
      setSlideIndex(trailCloneIndex);
      return;
    }

    goToSlide(activeIndex + 1);
  };

  if (!workItems.length) return null;

  const currentItem = workItems[activeIndex];
  const cmsTitle = titleOverride?.trim() || "";
  const resolvedTitle = resolveHomeUiText(locale, cmsTitle, "featuredWork");
  const sectionTitle =
    cmsTitle && locale !== "ar" && resolvedTitle === cmsTitle
      ? toTitleCase(cmsTitle)
      : resolvedTitle;
  const sectionSubtitleText =
    sectionSubtitle === undefined
      ? copy.ideasBroughtToLife
      : resolveHomeUiText(locale, sectionSubtitle, "ideasBroughtToLife");
  const resolvedCtaLabel = resolveHomeUiText(locale, ctaLabel, "viewAllProjects");

  return (
    <section
      className={styles.section}
      aria-labelledby="figma-home-our-work-title"
      data-section-theme="light"
      dir={contentDir}
    >
      <div className={styles.header}>
        <h2 id="figma-home-our-work-title" className={`${styles.title} ${headingStyles.heading} ${headingStyles.headingCenter}`}>
          {sectionTitle}
        </h2>
        {sectionSubtitleText ? <p className={styles.subtitle}>{sectionSubtitleText}</p> : null}
      </div>

      <div ref={carouselRef} className={styles.carousel} aria-label={copy.featuredProjects} aria-live="polite">
        <div
          ref={trackRef}
          className={`${styles.carouselTrack} ${transitionEnabled ? "" : styles.carouselTrackNoTransition}`}
          style={{ transform: `translateX(${trackOffset}px)` }}
          onTransitionEnd={handleTrackTransitionEnd}
        >
          {carouselItems.map((entry, entryIndex) => {
            const { item, logicalIndex, variant } = entry;
            const position = getCarouselPositionBySlideIndex(entryIndex, slideIndex);
            const isActive = position === 0;
            const isClone = variant !== "default";

            return (
              <article
                key={`${item.link || item.title}-${variant}-${logicalIndex}`}
                className={styles.card}
                data-active={isActive ? "true" : "false"}
                data-position={position}
                data-clone={isClone ? "true" : undefined}
                aria-hidden={isClone ? true : undefined}
              >
                <Link
                  href={item.link?.trim() || "/our-work"}
                  className={styles.cardLink}
                  aria-label={isActive ? copy.viewProject(item.title) : copy.showProject(item.title)}
                  aria-current={isActive ? "true" : undefined}
                  tabIndex={isClone ? -1 : undefined}
                  onClick={(event) => {
                    if (isActive || pendingLoopRef.current) return;
                    event.preventDefault();
                    goToSlide(logicalIndex);
                  }}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt=""
                      fill
                      className={styles.image}
                      sizes="(max-width: 767px) 88vw, (max-width: 1279px) 72vw, 58vw"
                      unoptimized
                      onLoad={updateTrackOffset}
                    />
                  ) : (
                    <span className={styles.imageFallback} aria-hidden />
                  )}
                  <span className={styles.imageShade} aria-hidden />
                  <span className={styles.cardContent} dir={contentDir}>
                    {item.subtitle?.trim() ? (
                      <span className={styles.category}>{plainText(item.subtitle)}</span>
                    ) : null}
                    <span className={styles.cardTitle}>{plainText(item.title)}</span>
                    {plainText(item.description) ? (
                      <span className={styles.description}>
                        {plainText(item.description)}
                      </span>
                    ) : null}
                  </span>
                </Link>

                {isActive && workItems.length > 1 ? (
                  <div className={styles.controls} aria-label={copy.portfolioNavigation}>
                    <button
                      type="button"
                      className={styles.arrow}
                      onClick={showNext}
                      aria-label={copy.nextProject(plainText(workItems[(activeIndex + 1) % workItems.length].title))}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden>
                        <path d="m9 5 7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className={styles.arrow}
                      onClick={showPrevious}
                      aria-label={copy.previousProject(plainText(workItems[(activeIndex - 1 + workItems.length) % workItems.length].title))}
                    >
                      <svg viewBox="0 0 24 24" aria-hidden>
                        <path d="m15 5-7 7 7 7" />
                      </svg>
                    </button>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>

        {workItems.length > 1 ? (
          <>
            <div className={styles.indicators} role="tablist" aria-label={copy.portfolioSlides}>
              {workItems.map((project, index) => {
                const isIndicatorActive = index === activeIndex;

                return (
                <button
                  key={`${project.link || project.title}-indicator-${index}`}
                  type="button"
                  role="tab"
                  className={styles.indicator}
                  aria-label={copy.showProject(project.title)}
                  aria-selected={isIndicatorActive}
                  aria-current={isIndicatorActive ? "true" : undefined}
                  data-active={isIndicatorActive ? "true" : "false"}
                  onClick={() => goToSlide(index)}
                />
              );
              })}
            </div>

            <span className={styles.srOnly}>
              {copy.showingProject(plainText(currentItem.title))}
            </span>
          </>
        ) : null}
      </div>

      {resolvedCtaLabel ? (
      <div className={styles.ctaWrap}>
        {/* Same pattern as header: small on mobile, default from md up */}
        <CallToActionButton
          variant="shiny"
          size="small"
          href={ctaHref}
          className="inline-flex !z-20 md:hidden"
        >
          {resolvedCtaLabel}
        </CallToActionButton>
        <CallToActionButton
          variant="shiny"
          href={ctaHref}
          className="hidden !z-20 md:inline-flex"
        >
          {resolvedCtaLabel}
        </CallToActionButton>
      </div>
      ) : null}
    </section>
  );
}
