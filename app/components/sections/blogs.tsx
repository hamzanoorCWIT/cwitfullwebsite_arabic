// "use client";

// import Image from "next/image";
// import Link from "next/link";
// import { useRef, useEffect } from "react";
// import gsap from "gsap";
// import { ScrollTrigger } from "gsap/ScrollTrigger";

// if (typeof window !== "undefined") {
//   gsap.registerPlugin(ScrollTrigger);
// }

// interface BlogItem {
//   category: string;
//   title: string;
//   description: string;
//   image?: string;
//   link?: string;
//   buttonText?: string;
//   buttonLink?: string;
// }

// interface BlogsProps {
//   sectionSubtitle?: string;
//   sectionTitle?: string;
//   sectionDescription?: string;
//   items?: BlogItem[];
// }

// export default function Blogs({ sectionTitle, items }: BlogsProps = {}) {
//   const blogs = items ?? [];
//   const title = sectionTitle?.trim() ?? "";
//   const sectionRef = useRef<HTMLElement>(null);
//   const titleRef = useRef<HTMLHeadingElement>(null);
//   const cardsRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     if (!sectionRef.current || !cardsRef.current) return;

//     const titleEl = titleRef.current;
//     const cards = cardsRef.current.querySelectorAll('.blogs-card');

//     if (titleEl) gsap.set(titleEl, { opacity: 0, y: 50 });
//     gsap.set(cards, { opacity: 0, y: 80, scale: 0.9 });

//     const tl = gsap.timeline({
//       scrollTrigger: {
//         trigger: sectionRef.current,
//         start: "top 80%",
//         end: "bottom 20%",
//         toggleActions: "play none none reverse",
//       },
//     });

//     if (titleEl) {
//       tl.to(titleEl, {
//         opacity: 1,
//         y: 0,
//         duration: 0.8,
//         ease: "power3.out",
//       });
//     }

//     tl.to(cards, {
//       opacity: 1,
//       y: 0,
//       scale: 1,
//       duration: 0.8,
//       ease: "power3.out",
//       stagger: 0.2,
//     }, titleEl ? "-=0.4" : 0);

//     // Hover animations for cards
//     cards.forEach((card) => {
//       const cardElement = card as HTMLElement;

//       cardElement.addEventListener('mouseenter', () => {
//         gsap.to(cardElement, {
//           scale: 1.05,
//           y: -10,
//           duration: 0.3,
//           ease: "power2.out",
//         });
//       });

//       cardElement.addEventListener('mouseleave', () => {
//         gsap.to(cardElement, {
//           scale: 1,
//           y: 0,
//           duration: 0.3,
//           ease: "power2.out",
//         });
//       });
//     });

//     return () => {
//       tl.kill();
//       const triggers = ScrollTrigger.getAll();
//       triggers.forEach((trigger) => {
//         if (trigger.trigger === sectionRef.current) {
//           trigger.kill();
//         }
//       });
//     };
//   }, [blogs.length, title]);

//   if (!blogs.length) return null;

//   return (
//     <section ref={sectionRef} className="relative min-h-screen bg-black py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-28 overflow-hidden">
//       <div className="relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 global-section-padding blogs-section-content-container">
//         {title ? (
//           <h2 ref={titleRef} className="text-[22px] sm:text-[32px] md:text-[50px] lg:text-[65px] xl:text-[80px] font-[400] text-center text-white leading-[1.3] sm:leading-[1.33] md:leading-[1.25] lg:leading-[1.2] xl:leading-[1.27] 2xl:leading-[1.33] mb-6 sm:mb-8 md:mb-10 lg:mb-12">
//             {title}
//           </h2>
//         ) : null}

//         <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 2xl:gap-10 blogs-cards-grid">
//           {blogs.map((blog, index) => {
//             const item = blog as BlogItem;
//             const card = (
//             <div className="relative flex flex-col w-full sm:w-auto md:w-full lg:w-auto xl:w-full 2xl:w-auto h-auto blogs-section blogs-card cursor-pointer border border-white">
//               <div className="relative w-full h-full min-h-[320px] flex items-center justify-center mb-0 overflow-hidden bg-[#1a1a1a]">
//                 {item.image ? (
//                   <Image
//                     src={item.image}
//                     alt={blog.title}
//                     fill
//                     className="object-cover"
//                     unoptimized={typeof item.image === "string"}
//                   />
//                 ) : null}
//               </div>
//               <div className="w-full h-auto  flex flex-col justify-center blogs-section-image blogs-card-content">
//                 <div className="flex flex-col justify-center items-start gap-2 sm:gap-3 md:gap-4 p-4 sm:p-6 md:p-8 lg:p-9 xl:p-10">
//                   <h3 className="text-white text-[14px] sm:text-[16px] md:text-[18px] lg:text-[20px] xl:text-[22px] 2xl:text-[24px] font-bold text-black leading-[1.3] sm:leading-[1.35] md:leading-[1.4] lg:leading-[1.35] xl:leading-[1.3] 2xl:leading-[1.25]">
//                     {blog.title}
//                   </h3>
//                   {blog.category?.trim() ? (
//                     <span className="text-white text-[12px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px] font-medium block">
//                       {blog.category}
//                     </span>
//                   ) : null}
//                   <p className="text-white text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] xl:text-[15px] 2xl:text-[16px] text-gray-700 leading-[1.5] sm:leading-[1.55] md:leading-[1.6] lg:leading-[1.65] xl:leading-[1.6] 2xl:leading-[1.55]">
//                     {blog.description}
//                   </p>
//                   {item.buttonText?.trim() &&
//                     (item.buttonLink?.trim() || item.link?.trim()) && (
//                       <Link
//                         href={(item.buttonLink?.trim() || item.link?.trim())!}
//                         className="inline-block mt-3 px-5 py-2 border border-white rounded-full text-white text-[11px] sm:text-[12px] md:text-[13px] lg:text-[14px] uppercase tracking-wider hover:bg-white hover:text-black transition-colors duration-300"
//                       >
//                         {item.buttonText.trim()}
//                       </Link>
//                     )}
//                 </div>
//               </div>
//             </div>
//             );
//             if (item.link) {
//               return (
//                 <Link key={index} href={item.link} className="contents">
//                   {card}
//                 </Link>
//               );
//             }
//             return <div key={index} className="contents">{card}</div>;
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { normalizeDescriptionHtml } from "@/app/lib/cms-description-html";
import { tooltipFromHtml } from "@/app/lib/tooltip-from-html";
import blogStyles from "./Blogs.module.css";
import headingStyles from "./FigmaHomeSectionTitle.module.css";
import { SECTION_HEADING_CENTER_CLASS, SECTION_HEADING_CLASS } from "./section-heading";
import CallToActionButton from "@/app/components/ui/CallToActionButton";
import { useLocalePreference } from "@/app/components/providers/DirectionPreference";
import { isRtlDirection } from "@/app/lib/rtl-layout";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface BlogItem {
  category: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  buttonText?: string;
  buttonLink?: string;
}

interface BlogsProps {
  sectionSubtitle?: string;
  sectionTitle?: string;
  sectionDescription?: string;
  items?: BlogItem[];
  isCarousel?: boolean;
  figmaLayout?: boolean;
  className?: string;
}

export default function Blogs({
  sectionSubtitle,
  sectionTitle,
  sectionDescription,
  items,
  isCarousel,
  figmaLayout = false,
  className = "",
}: BlogsProps = {}) {
  const { locale } = useLocalePreference();
  const contentDir = locale === "ar" ? "rtl" : "ltr";
  const blogs = items ?? [];
  const title = sectionTitle?.trim() ?? "";
  const subtitle = sectionSubtitle?.trim() ?? "";
  const descriptionHtml = normalizeDescriptionHtml(sectionDescription ?? "");
  const hasDescription =
    descriptionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().length > 0;
  const sectionRef = useRef<HTMLElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const carouselTweenRef = useRef<gsap.core.Tween | null>(null);

  const carouselActive = Boolean(isCarousel && blogs.length > 0);
  const shouldDuplicateCarousel = carouselActive && blogs.length > 2;
  const carouselBlogs = shouldDuplicateCarousel ? [...blogs, ...blogs] : blogs;

  const figmaTrackClass = `${blogStyles.figmaTrack}${carouselActive ? ` will-change-transform select-none touch-pan-y ${blogStyles.figmaTrackInteractive}` : ""}`;
  const defaultTrackClass = carouselActive
    ? "flex gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 2xl:gap-10 will-change-transform select-none touch-pan-y cursor-grab"
    : "flex gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 2xl:gap-10";
  const trackClassName = figmaLayout ? `flex ${figmaTrackClass}` : defaultTrackClass;

  useEffect(() => {
    if (!sectionRef.current || !cardsRef.current) return;
    if (carouselActive && !trackRef.current) return;

    const titleEl = titleRef.current;
    const cards = cardsRef.current.querySelectorAll(".blogs-card");

    if (titleEl) gsap.set(titleEl, { opacity: 0, y: 50 });
    gsap.set(cards, { opacity: 0, y: 80, scale: 0.9 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
    });

    if (titleEl) {
      tl.to(titleEl, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
      });
    }

    tl.to(
      cards,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.2,
      },
      titleEl ? "-=0.4" : 0
    );

    let removeCarouselHoverListeners: (() => void) | undefined;

    if (carouselActive) {
      const track = trackRef.current;
      if (track) {
        const originalItems = track.querySelectorAll(
          '[data-carousel-original="true"]'
        ) as NodeListOf<HTMLElement>;

        const firstItem = originalItems[0];
        if (firstItem) {
          const getStep = () => {
            const trackStyles = window.getComputedStyle(track);
            const gap =
              parseFloat(trackStyles.gap || "0") ||
              parseFloat(trackStyles.columnGap || "0") ||
              0;
            return firstItem.offsetWidth + gap;
          };
          const slideX = (index: number, step = getStep()) =>
            (isRtlDirection(track) ? 1 : -1) * index * step;

          const SLIDE_INTERVAL = 3500;
          const SLIDE_DURATION = 0.8;
          let currentIndex = 0;
          let intervalId: ReturnType<typeof setInterval> | undefined;
          const maxSnapIndex = shouldDuplicateCarousel
            ? blogs.length
            : Math.max(0, blogs.length - 1);

          const wrapToStart = () => {
            currentIndex = 0;
            gsap.set(track, { x: 0 });
          };

          const goToNext = () => {
            if (blogs.length <= 1) return;

            currentIndex += 1;
            carouselTweenRef.current?.kill();
            carouselTweenRef.current = gsap.to(track, {
              x: slideX(currentIndex),
              duration: SLIDE_DURATION,
              ease: "power2.inOut",
              onComplete: () => {
                if (currentIndex >= blogs.length) {
                  wrapToStart();
                }
              },
            });
          };

          const stopAutoplay = () => {
            if (intervalId !== undefined) {
              clearInterval(intervalId);
              intervalId = undefined;
            }
          };
          const startAutoplay = () => {
            stopAutoplay();
            if (blogs.length <= 1) return;
            intervalId = setInterval(goToNext, SLIDE_INTERVAL);
          };

          startAutoplay();

          // --- Manual drag-to-slide (mouse + touch via Pointer Events) ---
          // Only capture / drag after a real move so card <Link> clicks still navigate.
          const DRAG_THRESHOLD_PX = 8;
          let pointerActive = false;
          let hasDragged = false;
          let dragStartX = 0;
          let trackStartX = 0;
          let activePointerId: number | null = null;

          const snapToNearest = () => {
            const step = getStep();
            const x = (gsap.getProperty(track, "x") as number) || 0;
            const isRtl = isRtlDirection(track);
            let target = Math.round((isRtl ? x : -x) / step);
            target = Math.max(0, Math.min(maxSnapIndex, target));
            currentIndex = target;
            carouselTweenRef.current?.kill();
            carouselTweenRef.current = gsap.to(track, {
              x: slideX(currentIndex, step),
              duration: 0.5,
              ease: "power2.out",
              onComplete: () => {
                if (currentIndex >= blogs.length) {
                  wrapToStart();
                }
              },
            });
          };

          const onPointerDown = (e: PointerEvent) => {
            if (e.pointerType === "mouse" && e.button !== 0) return;
            pointerActive = true;
            hasDragged = false;
            activePointerId = e.pointerId;
            dragStartX = e.clientX;
            stopAutoplay();
            carouselTweenRef.current?.kill();
            trackStartX = (gsap.getProperty(track, "x") as number) || 0;
          };
          const onPointerMove = (e: PointerEvent) => {
            if (!pointerActive || e.pointerId !== activePointerId) return;
            const delta = e.clientX - dragStartX;
            if (!hasDragged) {
              if (Math.abs(delta) < DRAG_THRESHOLD_PX) return;
              hasDragged = true;
              track.style.cursor = "grabbing";
              track.setPointerCapture?.(e.pointerId);
            }
            gsap.set(track, { x: trackStartX + delta });
          };
          const onPointerUp = (e: PointerEvent) => {
            if (!pointerActive || e.pointerId !== activePointerId) return;
            const didDrag = hasDragged;
            pointerActive = false;
            activePointerId = null;
            if (didDrag) {
              track.releasePointerCapture?.(e.pointerId);
              snapToNearest();
            }
            track.style.cursor = "grab";
            startAutoplay();
          };
          // Swallow the click that follows a real drag so cards don't navigate.
          const onClickCapture = (e: MouseEvent) => {
            if (hasDragged) {
              e.preventDefault();
              e.stopPropagation();
              hasDragged = false;
            }
          };
          const onDragStart = (e: Event) => e.preventDefault();

          track.style.cursor = "grab";
          track.addEventListener("pointerdown", onPointerDown);
          window.addEventListener("pointermove", onPointerMove);
          window.addEventListener("pointerup", onPointerUp);
          window.addEventListener("pointercancel", onPointerUp);
          track.addEventListener("click", onClickCapture, true);
          track.addEventListener("dragstart", onDragStart);

          // --- Pause on hover ---
          const hoverRoot = cardsRef.current;
          const pauseCarousel = () => stopAutoplay();
          const resumeCarousel = () => {
            if (!pointerActive) startAutoplay();
          };
          hoverRoot?.addEventListener("mouseenter", pauseCarousel);
          hoverRoot?.addEventListener("mouseleave", resumeCarousel);

          removeCarouselHoverListeners = () => {
            stopAutoplay();
            hoverRoot?.removeEventListener("mouseenter", pauseCarousel);
            hoverRoot?.removeEventListener("mouseleave", resumeCarousel);
            track.removeEventListener("pointerdown", onPointerDown);
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointercancel", onPointerUp);
            track.removeEventListener("click", onClickCapture, true);
            track.removeEventListener("dragstart", onDragStart);
          };
        }
      }
    }

    return () => {
      removeCarouselHoverListeners?.();
      tl.kill();
      carouselTweenRef.current?.kill();

      const triggers = ScrollTrigger.getAll();
      triggers.forEach((trigger) => {
        if (trigger.trigger === sectionRef.current) {
          trigger.kill();
        }
      });
    };
  }, [blogs.length, title, subtitle, hasDescription, isCarousel, figmaLayout, carouselActive, shouldDuplicateCarousel]);

  const renderBlogCard = (blog: BlogItem, options?: { cardIsLinked?: boolean }) => {
    const item = blog as BlogItem;
    const cardIsLinked = options?.cardIsLinked ?? false;
    const readMoreHref = item.buttonLink?.trim() || item.link?.trim();
    const readMoreLabel = item.buttonText?.trim() || "";
    const descriptionHtml = normalizeDescriptionHtml(blog.description ?? "");
    const hasDescription = descriptionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim().length > 0;

    const readMoreControl =
      readMoreHref &&
      readMoreLabel &&
      (figmaLayout ? (
        cardIsLinked ? (
          <span className={blogStyles.figmaCardReadMore}>{readMoreLabel}</span>
        ) : (
          <Link href={readMoreHref} className={blogStyles.figmaCardReadMore}>
            {readMoreLabel}
          </Link>
        )
      ) : (
        <CallToActionButton
          variant="outline"
          href={readMoreHref}
          className="mt-3 uppercase tracking-wider"
        >
          {readMoreLabel}
        </CallToActionButton>
      ));

    return (
      <div
        dir={contentDir}
        className={
          figmaLayout
            ? `${blogStyles.figmaCard} blogs-card cursor-pointer`
            : "relative flex flex-col w-full sm:w-auto md:w-full lg:w-auto xl:w-full 2xl:w-auto h-auto blogs-section blogs-card cursor-pointer border border-white"
        }
      >
        <div
          className={
            figmaLayout
              ? blogStyles.figmaCardImage
              : "relative w-full h-full min-h-[320px] flex items-center justify-center mb-0 overflow-hidden bg-[#1a1a1a]"
          }
        >
          {item.image ? (
            <Image
              src={item.image}
              alt={blog.title}
              fill
              className="object-cover"
              unoptimized={typeof item.image === "string"}
            />
          ) : null}
        </div>
        <div
          className={
            figmaLayout
              ? blogStyles.figmaCardContent
              : "w-full h-auto flex flex-col justify-center blogs-section-image blogs-card-content"
          }
        >
          <div
            className={
              figmaLayout
                ? "flex flex-col items-start"
                : "flex flex-col justify-center items-start gap-2 sm:gap-3 md:gap-4 p-4 sm:p-6 md:p-8 lg:p-9 xl:p-10"
            }
          >
            {blog.category?.trim() ? (
              <span
                className={
                  figmaLayout
                    ? blogStyles.figmaCardCategory
                    : "text-white text-[12px] sm:text-[14px] md:text-[15px] lg:text-[16px] xl:text-[17px] 2xl:text-[18px] font-medium block"
                }
              >
                {blog.category}
              </span>
            ) : null}

            <h3
              className={
                figmaLayout
                  ? blogStyles.figmaCardTitle
                  : "line-clamp-1 w-full min-w-0 max-w-full overflow-hidden break-words text-[14px] font-bold leading-[1.3] text-white sm:text-[16px] sm:leading-[1.35] md:text-[18px] md:leading-[1.4] lg:text-[20px] lg:leading-[1.35] xl:text-[22px] xl:leading-[1.3] 2xl:text-[24px] 2xl:leading-[1.25]"
              }
              title={tooltipFromHtml(blog.title)}
            >
              {blog.title}
            </h3>

            {hasDescription ? (
              <p
                className={
                  figmaLayout
                    ? blogStyles.figmaCardDescription
                    : "line-clamp-3 overflow-hidden break-words text-[11px] font-normal leading-[1.5] text-white/90 sm:text-[12px] sm:leading-[1.55] md:text-[13px] md:leading-[1.6] lg:text-[14px] lg:leading-[1.65] xl:text-[15px] xl:leading-[1.6] 2xl:text-[16px] 2xl:leading-[1.55]"
                }
                title={tooltipFromHtml(descriptionHtml)}
                dangerouslySetInnerHTML={{ __html: descriptionHtml }}
              />
            ) : null}

            {readMoreControl}
          </div>
        </div>
      </div>
    );
  };

  const renderSectionHeader = (titleClassName: string, centered = false) => {
    if (!subtitle && !title && !hasDescription) return null;

    return (
      <div
        dir={contentDir}
        className={
          centered
            ? "mb-6 sm:mb-8 md:mb-10 lg:mb-12 text-center"
            : "mb-6 sm:mb-8 md:mb-10 lg:mb-12"
        }
      >
        {subtitle ? (
          <p className="mb-3 text-[12px] font-medium uppercase tracking-[0.2em] text-white/70 sm:text-[13px] md:text-[14px]">
            {subtitle}
          </p>
        ) : null}
        {title ? (
          <h2 ref={titleRef} className={titleClassName}>
            {title}
          </h2>
        ) : null}
        {hasDescription ? (
          <p
            className={
              centered
                ? "mx-auto mt-4 max-w-3xl text-[13px] font-normal leading-[1.6] text-white/80 sm:text-[14px] md:text-[15px] lg:text-[16px]"
                : "mt-4 max-w-3xl text-[13px] font-normal leading-[1.6] text-white/80 sm:text-[14px] md:text-[15px] lg:text-[16px]"
            }
            dangerouslySetInnerHTML={{ __html: descriptionHtml }}
          />
        ) : null}
      </div>
    );
  };

  if (!blogs.length) return null;

  const slideClassName = figmaLayout
    ? blogStyles.figmaSlide
    : "shrink-0 w-full sm:w-[calc((100%-1.25rem)/2)] md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-3.5rem)/3)] xl:w-[calc((100%-4rem)/3)] 2xl:w-[calc((100%-5rem)/3)]";

  const renderBlogSlides = (items: BlogItem[], options?: { carousel?: boolean }) => {
    const inCarousel = options?.carousel ?? false;

    return items.map((blog, index) => {
      const item = blog as BlogItem;
      const originalIndex = inCarousel ? index % blogs.length : index;
      const isOriginal = !inCarousel || index < blogs.length;

      const slide = (
        <div
          key={inCarousel ? `${isOriginal ? "original" : "duplicate"}-${originalIndex}-${index}` : `blog-${index}`}
          data-carousel-original={inCarousel ? (isOriginal ? "true" : "false") : undefined}
          className={slideClassName}
        >
          {item.link ? (
            <Link href={item.link} className={figmaLayout ? "block" : "block h-full"}>
              {renderBlogCard(blog, { cardIsLinked: figmaLayout })}
            </Link>
          ) : (
            renderBlogCard(blog)
          )}
        </div>
      );

      return slide;
    });
  };

  return (
    <section
      ref={sectionRef}
      dir={contentDir}
      className={
        figmaLayout
          ? `${blogStyles.figmaSection} ${className}`
          : `relative min-h-screen bg-black py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 2xl:py-28 overflow-hidden ${className}`
      }
    >
      {figmaLayout ? (
        <div className="relative z-10 mx-auto w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 global-section-padding accordion-content-container">
          {renderSectionHeader(`${blogStyles.figmaTitle} ${headingStyles.heading}`, false)}
          <div ref={cardsRef} className={blogStyles.figmaCardsWrap}>
            {isCarousel ? (
              <div ref={trackRef} className={trackClassName}>
                {renderBlogSlides(carouselBlogs, { carousel: true })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 2xl:gap-10">
                {blogs.map((blog, index) => {
                  const item = blog as BlogItem;
                  return item.link ? (
                    <Link key={index} href={item.link} className="block">
                      {renderBlogCard(blog, { cardIsLinked: true })}
                    </Link>
                  ) : (
                    <div key={index}>{renderBlogCard(blog)}</div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative z-10 mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20 global-section-padding blogs-section-content-container">
          {renderSectionHeader(
            `${SECTION_HEADING_CLASS} ${isCarousel ? "text-start" : SECTION_HEADING_CENTER_CLASS} text-white`,
            !isCarousel
          )}

          <div ref={cardsRef} className="overflow-hidden blogs-cards-grid">
            {isCarousel ? (
              <div ref={trackRef} className={trackClassName}>
                {renderBlogSlides(carouselBlogs, { carousel: true })}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8 2xl:gap-10">
                {blogs.map((blog, index) => {
                  const item = blog as BlogItem;
                  return item.link ? (
                    <Link key={index} href={item.link} className="block h-full">
                      {renderBlogCard(blog)}
                    </Link>
                  ) : (
                    <div key={index}>{renderBlogCard(blog)}</div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
