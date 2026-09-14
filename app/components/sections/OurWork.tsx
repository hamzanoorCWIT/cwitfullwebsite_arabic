"use client";

import Image from "next/image";
import CallToActionButton from "@/app/components/ui/CallToActionButton";
import { StaticImageData } from "next/image";
import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { tooltipFromHtml } from "@/app/lib/tooltip-from-html";
import { normalizePortfolioDetailHref } from "@/app/lib/portfolio-url";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SECTION_HEADING_CENTER_CLASS, SECTION_HEADING_CLASS } from "./section-heading";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function OurWorkStackedTitle({
  title,
  className,
}: {
  title: string;
  className: string;
}) {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return null;

  return (
    <h2 className={className}>
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="block">
          {word}
        </span>
      ))}
    </h2>
  );
}

export interface WorkItem {
  title: string;
  description: string;
  image: string | StaticImageData;
  popupImage?: string | StaticImageData;
  category?: string;
  websiteUrl?: string;
  /** Portfolio URL (e.g. /slug). When set, card click navigates here instead of opening modal. */
  link?: string;
}

interface OurWorkProps {
  title?: string;
  workItems: WorkItem[];
  ctaVariant?: "outline" | "filled" | "shiny";
  className?: string;
  showCTA?: boolean;
  /** When set with showCTA, button label comes from props (no implicit default copy). */
  ctaLabel?: string;
  useNewDesign?: boolean; // Toggle between old and new design
  cardClickAction?: "navigate" | "modal";
}

function getPortfolioHref(link: string | undefined): string {
  return normalizePortfolioDetailHref(link);
}

function getWorkItemNavigation(item: WorkItem): { type: "internal" | "external"; href: string } | null {
  if (item.link?.trim()) {
    return { type: "internal", href: getPortfolioHref(item.link) };
  }

  if (item.websiteUrl?.trim()) {
    return { type: "external", href: item.websiteUrl.trim() };
  }

  return null;
}

function getCategoryLines(category: string | undefined): string[] {
  if (!category?.trim()) return [];

  const normalized = category
    .replace(/&lt;br\s*\/?&gt;/gi, "\n")
    .replace(/\\n/g, "\n")
    .replace(/&#10;|&#x0*a;/gi, "\n")
    .replace(/&nbsp;/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p>/gi, "\n")
    .replace(/<\/?(p|div|span)\b[^>]*>/gi, "");

  const lines = normalized
    .split(/\r?\n/)
    .map((line) => line.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean);

  if (lines.length > 1) return lines;

  const words = (lines[0] ?? "").split(/\s+/).filter(Boolean);
  if (words.length > 1 && words.length <= 3) {
    return [words[0], words.slice(1).join(" ")].filter(Boolean);
  }

  return lines;
}

function getHorizontalScrollAmount(container: HTMLDivElement): number {
  const viewportWidth = window.innerWidth;
  const overflowShift = Math.min(0, viewportWidth - container.scrollWidth);
  const cardsWrapper = container.querySelector<HTMLElement>(".our-work-cards-container");
  const firstCard = cardsWrapper?.querySelector<HTMLElement>("[data-work-card]");

  if (!cardsWrapper || !firstCard) {
    return overflowShift;
  }

  const containerRect = container.getBoundingClientRect();
  const cardsWrapperRect = cardsWrapper.getBoundingClientRect();
  const firstCardStart = cardsWrapperRect.left - containerRect.left + firstCard.offsetLeft;
  const alignFirstCardShift = Math.min(0, -firstCardStart);

  return Math.min(overflowShift, alignFirstCardShift);
}

export default function OurWork({
  title,
  workItems,
  ctaVariant = "shiny",
  className = "",
  showCTA = true,
  ctaLabel,
  useNewDesign = true,
  cardClickAction = "navigate",
}: OurWorkProps) {
  const router = useRouter();
  const sectionRef = useRef<HTMLElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const [selectedItem, setSelectedItem] = useState<WorkItem | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const clickedCardIndexRef = useRef<number | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const previousSelectedItemRef = useRef<WorkItem | null>(null);

  const navigateToItem = (item: WorkItem) => {
    const target = getWorkItemNavigation(item);
    if (!target) return;

    if (target.type === "external") {
      if (cardClickAction !== "navigate") return;
      window.open(target.href, "_blank", "noopener,noreferrer");
      return;
    }

    router.push(target.href);
  };

  const openModalItem = (item: WorkItem) => {
    setIsImageLoading(true);
    setSelectedItem(item);
  };

  const isItemClickable = (item: WorkItem) => {
    if (item.link?.trim()) return true;
    if (cardClickAction === "modal") return true;
    return !!item.websiteUrl?.trim();
  };

  useEffect(() => {
    if (!selectedItem) return;
    const currentIndex = workItems.findIndex((item) => item === selectedItem);
    if (currentIndex === -1 || typeof window === "undefined") return;

    const preload = (item: WorkItem | undefined) => {
      if (!item) return;
      const img = new window.Image();
      const src =
        typeof item.popupImage === "string"
          ? item.popupImage
          : typeof item.image === "string"
            ? item.image
            : "";
      if (src) img.src = src;
    };

    preload(workItems[(currentIndex + 1) % workItems.length]);
    preload(workItems[(currentIndex - 1 + workItems.length) % workItems.length]);
  }, [selectedItem, workItems]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedItem) {
        setSelectedItem(null);
      } else if (e.key === "ArrowLeft" && selectedItem) {
        const currentIndex = workItems.findIndex((item) => item === selectedItem);
        const prevIndex = (currentIndex - 1 + workItems.length) % workItems.length;
        openModalItem(workItems[prevIndex]);
      } else if (e.key === "ArrowRight" && selectedItem) {
        const currentIndex = workItems.findIndex((item) => item === selectedItem);
        const nextIndex = (currentIndex + 1) % workItems.length;
        openModalItem(workItems[nextIndex]);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedItem, workItems]);

  useEffect(() => {
    const previousItem = previousSelectedItemRef.current;
    const shouldAnimateOpen =
      !!selectedItem &&
      !previousItem &&
      !!modalRef.current &&
      !!modalContentRef.current;

    if (shouldAnimateOpen && modalRef.current && modalContentRef.current) {
      gsap.fromTo(modalRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      gsap.fromTo(
        modalContentRef.current,
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
      );
    }

    previousSelectedItemRef.current = selectedItem;
  }, [selectedItem]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem) return;
    const currentIndex = workItems.findIndex((item) => item === selectedItem);
    const prevIndex = (currentIndex - 1 + workItems.length) % workItems.length;
    openModalItem(workItems[prevIndex]);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem) return;
    const currentIndex = workItems.findIndex((item) => item === selectedItem);
    const nextIndex = (currentIndex + 1) % workItems.length;
    openModalItem(workItems[nextIndex]);
  };

  const handleModalAction = () => {
    if (!selectedItem) return;
    if (selectedItem.websiteUrl) {
      window.open(selectedItem.websiteUrl, "_blank", "noopener,noreferrer");
      return;
    }
    if (selectedItem.link) {
      router.push(getPortfolioHref(selectedItem.link));
    }
  };

  // Horizontal scroll animation on page scroll - only for new design
  useEffect(() => {
    if (!useNewDesign || !sectionRef.current || !cardsContainerRef.current) return;

    const section = sectionRef.current;
    const cardsContainer = cardsContainerRef.current;

    // Set initial position
    gsap.set(cardsContainer, { x: 0 });

    // Calculate the total scroll distance
    const getScrollAmount = () => getHorizontalScrollAmount(cardsContainer);

    const initialScrollAmount = getScrollAmount();
    if (initialScrollAmount === 0) {
      return;
    }

    // Create the horizontal scroll animation
    const scrollTween = gsap.to(cardsContainer, {
      x: getScrollAmount,
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => `+=${Math.abs(getScrollAmount())}`,
        pin: true,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      scrollTween.kill();
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars.trigger === section) {
          trigger.kill();
        }
      });
    };
  }, [workItems, useNewDesign]);

  // Drag functionality
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!cardsContainerRef.current) return;
    const card = (e.target as HTMLElement).closest("[data-work-card]");
    const idx = card?.getAttribute("data-index");
    clickedCardIndexRef.current = idx != null ? parseInt(idx, 10) : null;
    setIsDragging(true);
    setStartX(e.pageX);

    const currentX = gsap.getProperty(cardsContainerRef.current, "x") as number;
    setScrollLeft(currentX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !cardsContainerRef.current) return;
    e.preventDefault();

    const x = e.pageX;
    const walk = (x - startX) * 2;
    const newX = scrollLeft + walk;

    const maxScroll = getHorizontalScrollAmount(cardsContainerRef.current);

    const clampedX = Math.max(maxScroll, Math.min(0, newX));

    gsap.to(cardsContainerRef.current, {
      x: clampedX,
      duration: 0,
    });
  };

  const handleMouseUp = () => {
    if (cardsContainerRef.current) {
      const currentX = gsap.getProperty(cardsContainerRef.current, "x") as number;
      const moved = Math.abs(currentX - scrollLeft) > 3;
      if (!moved) {
        if (clickedCardIndexRef.current != null && workItems[clickedCardIndexRef.current]) {
          handleCardSelect(workItems[clickedCardIndexRef.current]);
        }
      }
    }
    clickedCardIndexRef.current = null;
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    clickedCardIndexRef.current = null;
    setIsDragging(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!cardsContainerRef.current) return;
    const card = (e.target as HTMLElement).closest("[data-work-card]");
    const idx = card?.getAttribute("data-index");
    clickedCardIndexRef.current = idx != null ? parseInt(idx, 10) : null;
    setIsDragging(true);
    setStartX(e.touches[0].pageX);

    const currentX = gsap.getProperty(cardsContainerRef.current, "x") as number;
    setScrollLeft(currentX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !cardsContainerRef.current) return;

    const x = e.touches[0].pageX;
    const walk = (x - startX) * 2;
    const newX = scrollLeft + walk;

    const maxScroll = getHorizontalScrollAmount(cardsContainerRef.current);

    const clampedX = Math.max(maxScroll, Math.min(0, newX));

    gsap.to(cardsContainerRef.current, {
      x: clampedX,
      duration: 0,
    });
  };

  const handleTouchEnd = () => {
    if (cardsContainerRef.current) {
      const currentX = gsap.getProperty(cardsContainerRef.current, "x") as number;
      const moved = Math.abs(currentX - scrollLeft) > 3;
      if (!moved) {
        if (clickedCardIndexRef.current != null && workItems[clickedCardIndexRef.current]) {
          handleCardSelect(workItems[clickedCardIndexRef.current]);
        }
      }
    }
    clickedCardIndexRef.current = null;
    setIsDragging(false);
  };

  const handleCardSelect = (item: WorkItem) => {
    if (item.link?.trim()) {
      navigateToItem(item);
      return;
    }

    if (cardClickAction === "modal") {
      openModalItem(item);
      return;
    }

    navigateToItem(item);
  };

  // NEW DESIGN - Horizontal Scrolling
  if (useNewDesign) {
    return (
      <section
        ref={sectionRef}
        className={`relative min-h-screen bg-black overflow-hidden ${className}`}
      >
        {/* Mobile Layout - Vertical Stack */}
        <div className="flex flex-col md:hidden py-12 md:py-20">
          {title?.trim() ? (
            <div className="mb-8 flex justify-center">
              <OurWorkStackedTitle
                title={title.trim()}
                className={`${SECTION_HEADING_CENTER_CLASS} text-white px-4`}
              />
            </div>
          ) : null}

          {/* Cards — same chrome as Our Work page (`app/our-work/page.tsx`) */}
          <div className="mx-auto flex w-full max-w-[1920px] flex-col gap-6 md:gap-8 lg:gap-10 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
            {workItems.map((item, index) => (
              <div
                key={index}
                onClick={() => handleCardSelect(item)}
                className={`work-card flex h-full min-h-0 min-w-0 w-full flex-col overflow-hidden border border-[#C1C1C1] bg-black ${
                  isItemClickable(item) ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                  {item.category && (
                    <div className="flex shrink-0 flex-col px-5 pt-4 pb-40 lg:px-8 lg:pt-10">
                      {getCategoryLines(item.category).map((cat, idx) => (
                        <span
                          key={idx}
                          className="text-[14px] font-[400] uppercase tracking-[0.1em] text-white lg:text-[20px] xl:text-[20px]"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="w-full min-w-0 shrink-0 px-5 pb-2 lg:px-8 lg:pb-3">
                    <h3
                      className="our-work-item-title line-clamp-1 w-full min-w-0 max-w-full overflow-hidden break-words text-[28px] font-[400] leading-[1.3] text-white sm:leading-[1.35] md:leading-[1.4] lg:text-[34px] lg:leading-[1.35] xl:text-[41px] xl:leading-[1.3]"
                      title={tooltipFromHtml(item.title)}
                    >
                      {item.title}
                    </h3>
                  </div>

                  <div className="max-w-[460px] shrink-0 overflow-hidden px-5 pb-4 lg:px-8 lg:pb-20">
                    <div
                      className="our-work-description our-work-item-description line-clamp-3 overflow-hidden break-words text-[15px] font-[300] leading-[18px] text-white sm:leading-[22px] md:leading-[29px] lg:text-[18px] xl:text-[22px]"
                      title={tooltipFromHtml(normalizeDescriptionHtml(item.description ?? ""))}
                      dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(item.description) }}
                    />
                  </div>
                  <div className="min-h-0 min-w-0 shrink-0 basis-0 flex-1" aria-hidden />
                </div>

                <div className="relative h-[220px] w-full shrink-0 overflow-hidden lg:h-[280px] xl:h-[370px] 2xl:h-[340px] min-[1440px]:h-[350px] min-[1920px]:h-[400px]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="100vw"
                    unoptimized={typeof item.image === "string"}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          {showCTA && ctaLabel?.trim() ? (
            <div className="mt-8 flex justify-center">
              <CallToActionButton variant={ctaVariant}>{ctaLabel.trim()}</CallToActionButton>
            </div>
          ) : null}
        </div>

        {/* Desktop/Tablet Layout - Horizontal Scroll */}
        <div className="hidden md:flex h-screen items-center overflow-hidden">
          {/* Single container for both title and cards that moves together */}
          <div
            ref={cardsContainerRef}
            className={`our-work-container our-work-responsive-container flex h-[830px] min-h-0 items-stretch will-change-transform ${
              isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Left Side - Title and CTA */}
            <div className="our-work-title-container flex h-full min-h-0 w-auto flex-shrink-0 flex-col items-start justify-center self-stretch py-12 pl-8 pr-4 lg:pl-16 lg:pr-6 xl:pl-20 xl:pr-8">
              {title?.trim() ? (
                <OurWorkStackedTitle
                  title={title.trim()}
                  className={`${SECTION_HEADING_CLASS} text-white mb-12 lg:mb-16 xl:mb-20 our-work-title our-work-desktop-heading`}
                />
              ) : null}
              {showCTA && ctaLabel?.trim() ? (
                <CallToActionButton variant="shiny">{ctaLabel.trim()}</CallToActionButton>
              ) : null}
            </div>

            {/* Cards: equal strip height; fixed image band; flex spacer under text like Our Work page grid */}
            <div className="our-work-cards-container flex h-full min-h-0 min-w-0 flex-1 items-stretch gap-4 lg:gap-2 pr-8 lg:pr-16 xl:pr-20">
              {workItems.map((item, index) => (
                <div
                  key={index}
                  data-work-card
                  data-index={index}
                  className={`work-card our-work-card our-work-responsive-card flex !h-full min-h-0 min-w-0 w-[380px] max-h-full flex-shrink-0 flex-col overflow-hidden border border-[#C1C1C1] bg-black lg:w-[480px] xl:w-[604px] ${
                    isItemClickable(item) ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                    {item.category && (
                      <div className="flex shrink-0 flex-col px-5 pt-4 pb-40 lg:px-8 lg:pt-10">
                        {getCategoryLines(item.category).map((cat, idx) => (
                          <span
                            key={idx}
                            className="text-[14px] font-[400] uppercase tracking-[0.1em] text-white lg:text-[20px] xl:text-[20px]"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="w-full min-w-0 shrink-0 px-5 pb-2 lg:px-8 lg:pb-3">
                      <h3
                        className="our-work-item-title line-clamp-1 w-full min-w-0 max-w-full overflow-hidden break-words text-[28px] font-[400] leading-[1.3] text-white sm:leading-[1.35] md:leading-[1.4] lg:text-[34px] lg:leading-[1.35] xl:text-[41px] xl:leading-[1.3]"
                        title={tooltipFromHtml(item.title)}
                      >
                        {item.title}
                      </h3>
                    </div>

                    <div className="max-w-[460px] shrink-0 overflow-hidden px-5 pb-4 lg:px-8 lg:pb-16">
                      <div
                        className="our-work-description our-work-item-description line-clamp-3 overflow-hidden break-words text-[15px] font-[300] leading-[18px] text-white sm:leading-[22px] md:leading-[29px] lg:text-[18px] xl:text-[22px]"
                        title={tooltipFromHtml(normalizeDescriptionHtml(item.description ?? ""))}
                        dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(item.description) }}
                      />
                    </div>
                    <div className="min-h-0 min-w-0 shrink-0 basis-0 flex-1" aria-hidden />
                  </div>

                  <div className="relative h-[220px] w-full shrink-0 overflow-hidden lg:h-[300px] xl:h-[370px] 2xl:h-[370px] min-[1440px]:h-[335px] min-[1920px]:h-[400px]">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 480px, 604px"
                      unoptimized={typeof item.image === "string"}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {selectedItem && (
          <div
            ref={modalRef}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
            onClick={() => setSelectedItem(null)}
          >
            <div
              ref={modalContentRef}
              className="relative w-full h-full flex flex-col items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-[110] bg-white/10 hover:bg-white/20 w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10"
              >
                <span className="text-3xl font-light leading-none pb-1">×</span>
              </button>

              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[110] bg-white/10 hover:bg-white/20 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center backdrop-blur-sm group border border-white/10"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:-translate-x-0.5 transition-transform"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors z-[110] bg-white/10 hover:bg-white/20 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center backdrop-blur-sm group border border-white/10"
              >
                <svg
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="group-hover:translate-x-0.5 transition-transform"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>

              <div className="relative w-full h-full max-w-[90vw] max-h-[85vh] flex items-center justify-center">
                {isImageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
                  </div>
                )}
                <Image
                  src={selectedItem.popupImage || selectedItem.image}
                  alt={selectedItem.title}
                  fill
                  className={`object-contain drop-shadow-2xl transition-opacity duration-300 ${
                    isImageLoading ? "opacity-0" : "opacity-100"
                  }`}
                  unoptimized={typeof (selectedItem.popupImage || selectedItem.image) === "string"}
                  onLoad={() => setIsImageLoading(false)}
                />
              </div>

              <div className="absolute bottom-8 left-0 right-0 flex justify-center px-4">
                <div className="bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-8 py-4 flex flex-col md:flex-row items-center gap-4 md:gap-8 max-w-3xl">
                  <div className="flex min-w-0 max-w-full flex-col items-center text-center md:items-start md:text-left">
                    <h3
                      className="line-clamp-1 w-full min-w-0 max-w-full overflow-hidden break-words text-xl font-bold text-white md:text-2xl"
                      title={tooltipFromHtml(selectedItem.title)}
                    >
                      {selectedItem.title}
                    </h3>
                  </div>

                  <div className="flex-shrink-0">
                    {(selectedItem.websiteUrl || selectedItem.link) && (
                      <CallToActionButton variant="shiny" onClick={handleModalAction}>
                        {selectedItem.websiteUrl ? "Visit Website" : "View Project"}
                      </CallToActionButton>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }

  // OLD DESIGN - Grid Layout (Hidden by default)
  return (
    <section className={`relative min-h-screen py-24 bg-black overflow-hidden ${className}`}>
      <div className="relative z-10">
        {/* Title Section */}
        <div className="flex justify-center mb-6 md:mb-10">
          <OurWorkStackedTitle
            title={title?.trim() || ""}
            className={`${SECTION_HEADING_CENTER_CLASS} text-white`}
          />
        </div>

        {/* Content Grid - 2x2 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-2 mb-10 mx-auto px-4 sm:px-5 md:px-0">
          {workItems.map((item, index) => (
            <div key={index} className="flex flex-col">
              {/* Image */}
              <div className="relative w-full h-[300px] md:h-[400px] lg:h-[450px] xl:h-[500px] 2xl:h-[520px] min-[1440px]:h-[535px] min-[1920px]:h-[542px] overflow-hidden mb-6 md:mb-10">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={957}
                  height={542}
                  className="object-cover w-full h-full"
                  unoptimized
                />
              </div>

              {/* Text Content */}
              <div className="text-white ps-6 md:pb-10 pb-6 md:pb-20 px-4 md:pe-0">
                <h3
                  className="mb-3 line-clamp-1 w-full min-w-0 max-w-full overflow-hidden break-words text-[26px] font-light leading-[1.3] text-white sm:leading-[1.35] md:text-[32px] md:leading-[1.4] lg:text-[34px] lg:leading-[1.35] xl:text-[36px] xl:leading-[1.3] 2xl:text-[38px] 2xl:leading-[1.25] min-[1440px]:text-[39px] min-[1920px]:text-[40px]"
                  title={tooltipFromHtml(item.title)}
                >
                  {item.title}
                </h3>
                <div
                  className="line-clamp-3 overflow-hidden break-words text-[16px] opacity-90 md:text-[18px] lg:text-[19px] xl:text-[20px] 2xl:text-[21px] min-[1440px]:text-[21.5px] min-[1920px]:text-[22px] leading-[1.5] sm:leading-[1.6] md:leading-[1.7] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55]"
                  title={tooltipFromHtml(normalizeDescriptionHtml(item.description ?? ""))}
                  dangerouslySetInnerHTML={{ __html: normalizeDescriptionHtml(item.description) }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Button */}
        {showCTA && ctaLabel?.trim() ? (
          <div className="flex justify-center">
            <CallToActionButton variant="shiny">{ctaLabel.trim()}</CallToActionButton>
          </div>
        ) : null}
      </div>
    </section>
  );
}

